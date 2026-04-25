import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { auth } from '../firebase';
import { useUpload } from './UploadContext';

export interface Blog {
    id: string;
    title: string;
    content: string;
    coverImage: string;
    createdAt?: string | null;
}

interface PaginatedState {
    blogs: Blog[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
}

interface BlogContextType extends PaginatedState {
    // Public infinite-scroll
    loadMore: () => Promise<void>;
    // Admin helpers (always fetches all for management)
    allBlogs: Blog[];
    allLoading: boolean;
    refreshAll: () => Promise<void>;
    addBlog: (data: Omit<Blog, 'id' | 'createdAt'>, imageFile?: File) => Promise<void>;
    updateBlog: (id: string, data: Partial<Blog>, imageFile?: File) => Promise<void>;
    deleteBlog: (id: string) => Promise<void>;
    getBlog: (id: string) => Promise<Blog | undefined>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

const getApiBase = () => {
    return import.meta.env.VITE_API_URL || 'https://api-dp2f6yjbbq-el.a.run.app';
};

const PAGE_LIMIT = 10;

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // ── Public paginated state ──
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const nextCursorRef = useRef<string | null>(null);

    // ── Admin full list ──
    const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
    const [allLoading, setAllLoading] = useState(false);

    const { uploadFile } = useUpload();
    const API_URL = `${getApiBase()}/blogs`;

    // ── Fetch first page (public) ──
    const fetchFirstPage = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}?limit=${PAGE_LIMIT}`);
            if (!response.ok) throw new Error('Failed to fetch blogs');
            const json = await response.json();
            setBlogs(json.data);
            nextCursorRef.current = json.nextCursor;
            setHasMore(json.hasMore);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            toast.error('Failed to load blogs');
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    // ── Load next page (public infinite scroll) ──
    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore || !nextCursorRef.current) return;
        setLoadingMore(true);
        try {
            const url = `${API_URL}?limit=${PAGE_LIMIT}&startAfter=${nextCursorRef.current}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch more blogs');
            const json = await response.json();
            setBlogs(prev => [...prev, ...json.data]);
            nextCursorRef.current = json.nextCursor;
            setHasMore(json.hasMore);
        } catch (error) {
            console.error('Error loading more blogs:', error);
            toast.error('Failed to load more blogs');
        } finally {
            setLoadingMore(false);
        }
    }, [API_URL, hasMore, loadingMore]);

    // ── Admin: fetch ALL blogs (no pagination) ──
    const refreshAll = useCallback(async () => {
        setAllLoading(true);
        try {
            // Fetch all by using a large limit (or loop through pages)
            let cursor: string | null = null;
            const collected: Blog[] = [];
            do {
                const url = cursor
                    ? `${API_URL}?limit=100&startAfter=${cursor}`
                    : `${API_URL}?limit=100`;
                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch all blogs');
                const json = await res.json();
                collected.push(...json.data);
                cursor = json.nextCursor;
            } while (cursor);
            setAllBlogs(collected);
        } catch (error) {
            console.error('Error refreshing all blogs:', error);
            toast.error('Failed to refresh blogs');
        } finally {
            setAllLoading(false);
        }
    }, [API_URL]);

    useEffect(() => { fetchFirstPage(); }, []);

    // ── CRUD ──
    const addBlog = async (data: Omit<Blog, 'id' | 'createdAt'>, imageFile?: File) => {
        try {
            let coverImage = data.coverImage || '';
            if (imageFile) coverImage = await uploadFile(imageFile, 'blogs');
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...data, coverImage }),
            });
            if (!response.ok) throw new Error('Failed to create blog');
            toast.success('Blog added successfully');
            // Refresh both public & admin views
            await Promise.all([fetchFirstPage(), refreshAll()]);
        } catch (error) {
            console.error('Error adding blog:', error);
            toast.error('Failed to add blog');
            throw error;
        }
    };

    const updateBlog = async (id: string, data: Partial<Blog>, imageFile?: File) => {
        try {
            let coverImage = data.coverImage;
            if (imageFile) coverImage = await uploadFile(imageFile, 'blogs');
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...data, ...(coverImage !== undefined && { coverImage }) }),
            });
            if (!response.ok) throw new Error('Failed to update blog');
            toast.success('Blog updated successfully');
            await Promise.all([fetchFirstPage(), refreshAll()]);
        } catch (error) {
            console.error('Error updating blog:', error);
            toast.error('Failed to update blog');
            throw error;
        }
    };

    const deleteBlog = async (id: string) => {
        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete blog');
            toast.success('Blog deleted successfully');
            // Optimistic update for both lists
            setBlogs(prev => prev.filter(b => b.id !== id));
            setAllBlogs(prev => prev.filter(b => b.id !== id));
        } catch (error) {
            console.error('Error deleting blog:', error);
            toast.error('Failed to delete blog');
            throw error;
        }
    };

    const getBlog = async (id: string): Promise<Blog | undefined> => {
        // Check in-memory caches first
        const inPage = blogs.find(b => b.id === id);
        if (inPage) return inPage;
        const inAll = allBlogs.find(b => b.id === id);
        if (inAll) return inAll;
        // Fetch individually from API
        try {
            const res = await fetch(`${API_URL}/${id}`);
            if (!res.ok) return undefined;
            return await res.json() as Blog;
        } catch {
            return undefined;
        }
    };

    return (
        <BlogContext.Provider value={{
            blogs, loading, loadingMore, hasMore, loadMore,
            allBlogs, allLoading, refreshAll,
            addBlog, updateBlog, deleteBlog, getBlog,
        }}>
            {children}
        </BlogContext.Provider>
    );
};

export const useBlogs = () => {
    const context = useContext(BlogContext);
    if (!context) throw new Error('useBlogs must be used within a BlogProvider');
    return context;
};
