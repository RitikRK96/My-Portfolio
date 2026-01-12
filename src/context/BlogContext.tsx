import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { auth } from '../firebase';
import { useUpload } from './UploadContext';

export interface Blog {
    id: string;
    title: string;
    content: string;
    coverImage: string;
    createdAt?: any;
}

interface BlogContextType {
    blogs: Blog[];
    loading: boolean;
    refreshBlogs: () => Promise<void>;
    addBlog: (data: Omit<Blog, 'id' | 'createdAt'>, imageFile?: File) => Promise<void>;
    updateBlog: (id: string, data: Partial<Blog>, imageFile?: File) => Promise<void>;
    deleteBlog: (id: string) => Promise<void>;
    getBlog: (id: string) => Promise<Blog | undefined>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const { uploadFile } = useUpload();
    // Assuming API is at relative path /blogs if proxied, or fully qualified.
    // For local dev with functions emulator, it might be http://127.0.0.1:5001/.../blogs
    // Ideally we use a config or environment variable. For now, I'll assume a proxy or base URL helper.
    // Since this is a "Portfolio" likely hosted on Firebase Hosting rewrites to functions, '/blogs' might work.
    // If running strictly local, might need full URL.
    // Let's assume '/blogs' works via proxy or define a constant.

    // NOTE: VITE_API_URL should be the base API URL (e.g. .../api)
    // Local: http://127.0.0.1:5001/my-portfolio-f8863/asia-south1/api
    // Prod: https://api-dp2f6yjbbq-el.a.run.app
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_BASE = isLocal
        ? 'http://127.0.0.1:5001/portfolio-ritik-1/asia-south1/api'
        : (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/portfolio-ritik-1/asia-south1/api');
    const API_URL = `${API_BASE}/blogs`;

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch blogs');
            const data = await response.json();
            // Backend returns list
            setBlogs(data);
        } catch (error) {
            console.error('Error fetching blogs', error);
            toast.error('Failed to load blogs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const addBlog = async (data: Omit<Blog, 'id' | 'createdAt'>, imageFile?: File) => {
        try {
            let coverImage = data.coverImage || '';
            if (imageFile) {
                coverImage = await uploadFile(imageFile, 'blogs'); // Use UploadContext
            }

            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...data, coverImage }),
            });

            if (!response.ok) throw new Error('Failed to create blog');

            toast.success('Blog added successfully');
            fetchBlogs();
        } catch (error) {
            console.error('Error adding blog', error);
            toast.error('Failed to add blog');
            throw error;
        }
    };

    const updateBlog = async (id: string, data: Partial<Blog>, imageFile?: File) => {
        try {
            let coverImage = data.coverImage;
            if (imageFile) {
                coverImage = await uploadFile(imageFile, 'blogs');
            }

            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...data, ...(coverImage && { coverImage }) }),
            });

            if (!response.ok) throw new Error('Failed to update blog');

            toast.success('Blog updated successfully');
            fetchBlogs();
        } catch (error) {
            console.error('Error updating blog', error);
            toast.error('Failed to update blog');
            throw error;
        }
    };

    const deleteBlog = async (id: string) => {
        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete blog');

            toast.success('Blog deleted successfully');
            fetchBlogs();
        } catch (error) {
            console.error('Error deleting blog', error);
            toast.error('Failed to delete blog');
            throw error;
        }
    };

    const getBlog = async (id: string) => {
        // First try to find in state
        const found = blogs.find(b => b.id === id);
        if (found) return found;

        // Fallback to fetch (not implemented for simplicity, relying on state)
        // You could add direct doc fetch here if needed
        return undefined;
    };

    return (
        <BlogContext.Provider value={{ blogs, loading, refreshBlogs: fetchBlogs, addBlog, updateBlog, deleteBlog, getBlog }}>
            {children}
        </BlogContext.Provider>
    );
};

export const useBlogs = () => {
    const context = useContext(BlogContext);
    if (!context) {
        throw new Error('useBlogs must be used within a BlogProvider');
    }
    return context;
};
