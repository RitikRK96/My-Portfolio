import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { auth } from '../firebase';
import { useUpload } from './UploadContext';

export interface Photo {
    id: string;
    imageUrl: string;
    category: string;
    caption: string;
    date: string | null;
    createdAt?: string | null;
}

interface PhotoContextType {
    // Public paginated
    photos: Photo[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    loadMore: (category?: string) => Promise<void>;
    // For category switching — triggers a fresh fetch
    fetchByCategory: (category: string) => Promise<void>;
    activeCategory: string;
    // Admin
    allPhotos: Photo[];
    allLoading: boolean;
    refreshAll: () => Promise<void>;
    addPhoto: (data: Omit<Photo, 'id' | 'createdAt' | 'imageUrl'>, imageFile: File) => Promise<void>;
    deletePhoto: (id: string) => Promise<void>;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

const getApiBase = () => {
    return import.meta.env.VITE_API_URL || 'https://api-dp2f6yjbbq-el.a.run.app';
};

const PAGE_LIMIT = 10;

export const PhotoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const nextCursorRef = useRef<string | null>(null);

    const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
    const [allLoading, setAllLoading] = useState(false);

    const { uploadFile } = useUpload();
    const API_URL = `${getApiBase()}/photos`;

    const buildUrl = (category: string, limit: number, cursor?: string | null) => {
        let url = `${API_URL}?limit=${limit}`;
        if (category && category !== 'All') url += `&category=${encodeURIComponent(category)}`;
        if (cursor) url += `&startAfter=${cursor}`;
        return url;
    };

    // Fresh fetch for a given category
    const fetchByCategory = useCallback(async (category: string) => {
        setActiveCategory(category);
        setLoading(true);
        nextCursorRef.current = null;
        try {
            const response = await fetch(buildUrl(category, PAGE_LIMIT));
            if (!response.ok) throw new Error('Failed to fetch photos');
            const json = await response.json();
            setPhotos(json.data);
            nextCursorRef.current = json.nextCursor;
            setHasMore(json.hasMore);
        } catch (error) {
            console.error('Error fetching photos:', error);
            toast.error('Failed to load photos');
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    const loadMore = useCallback(async (category?: string) => {
        const cat = category ?? activeCategory;
        if (loadingMore || !hasMore || !nextCursorRef.current) return;
        setLoadingMore(true);
        try {
            const response = await fetch(buildUrl(cat, PAGE_LIMIT, nextCursorRef.current));
            if (!response.ok) throw new Error('Failed to fetch more photos');
            const json = await response.json();
            setPhotos(prev => [...prev, ...json.data]);
            nextCursorRef.current = json.nextCursor;
            setHasMore(json.hasMore);
        } catch (error) {
            console.error('Error loading more photos:', error);
            toast.error('Failed to load more photos');
        } finally {
            setLoadingMore(false);
        }
    }, [activeCategory, hasMore, loadingMore]);

    const refreshAll = useCallback(async () => {
        setAllLoading(true);
        try {
            let cursor: string | null = null;
            const collected: Photo[] = [];
            do {
                const url = cursor
                    ? `${API_URL}?limit=100&startAfter=${cursor}`
                    : `${API_URL}?limit=100`;
                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch all photos');
                const json = await res.json();
                collected.push(...json.data);
                cursor = json.nextCursor;
            } while (cursor);
            setAllPhotos(collected);
        } catch (error) {
            console.error('Error refreshing all photos:', error);
            toast.error('Failed to refresh photos');
        } finally {
            setAllLoading(false);
        }
    }, [API_URL]);

    useEffect(() => { fetchByCategory('All'); }, []);

    const addPhoto = async (data: Omit<Photo, 'id' | 'createdAt' | 'imageUrl'>, imageFile: File) => {
        try {
            const imageUrl = await uploadFile(imageFile, 'photos');
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...data, imageUrl }),
            });
            if (!response.ok) throw new Error('Failed to add photo');
            toast.success('Photo added successfully');
            await Promise.all([fetchByCategory(activeCategory), refreshAll()]);
        } catch (error) {
            console.error('Error adding photo:', error);
            toast.error('Failed to add photo');
            throw error;
        }
    };

    const deletePhoto = async (id: string) => {
        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete photo');
            toast.success('Photo deleted successfully');
            setPhotos(prev => prev.filter(p => p.id !== id));
            setAllPhotos(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting photo:', error);
            toast.error('Failed to delete photo');
            throw error;
        }
    };

    return (
        <PhotoContext.Provider value={{
            photos, loading, loadingMore, hasMore, loadMore, fetchByCategory, activeCategory,
            allPhotos, allLoading, refreshAll,
            addPhoto, deletePhoto,
        }}>
            {children}
        </PhotoContext.Provider>
    );
};

export const usePhotos = () => {
    const context = useContext(PhotoContext);
    if (!context) throw new Error('usePhotos must be used within a PhotoProvider');
    return context;
};
