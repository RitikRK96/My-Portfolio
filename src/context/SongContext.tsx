import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { auth } from '../firebase';

export interface Song {
    id: string;
    title?: string;
    url: string;
    type: 'song' | 'playlist';
    createdAt?: string | null;
}

interface SongContextType {
    // Public paginated
    songs: Song[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    // Admin
    allSongs: Song[];
    allLoading: boolean;
    refreshAll: () => Promise<void>;
    addSong: (title: string, url: string, type: 'song' | 'playlist') => Promise<void>;
    deleteSong: (id: string) => Promise<void>;
}

const SongContext = createContext<SongContextType | undefined>(undefined);

const getApiBase = () => {
    return import.meta.env.VITE_API_URL || 'https://api-dp2f6yjbbq-el.a.run.app';
};

const PAGE_LIMIT = 10;

export const SongProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const nextCursorRef = useRef<string | null>(null);

    const [allSongs, setAllSongs] = useState<Song[]>([]);
    const [allLoading, setAllLoading] = useState(false);

    const API_URL = `${getApiBase()}/songs`;

    const fetchFirstPage = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}?limit=${PAGE_LIMIT}`);
            if (!response.ok) throw new Error('Failed to fetch songs');
            const json = await response.json();
            setSongs(json.data);
            nextCursorRef.current = json.nextCursor;
            setHasMore(json.hasMore);
        } catch (error) {
            console.error('Error fetching songs:', error);
            toast.error('Failed to load songs');
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore || !nextCursorRef.current) return;
        setLoadingMore(true);
        try {
            const url = `${API_URL}?limit=${PAGE_LIMIT}&startAfter=${nextCursorRef.current}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch more songs');
            const json = await response.json();
            setSongs(prev => [...prev, ...json.data]);
            nextCursorRef.current = json.nextCursor;
            setHasMore(json.hasMore);
        } catch (error) {
            console.error('Error loading more songs:', error);
            toast.error('Failed to load more songs');
        } finally {
            setLoadingMore(false);
        }
    }, [API_URL, hasMore, loadingMore]);

    const refreshAll = useCallback(async () => {
        setAllLoading(true);
        try {
            let cursor: string | null = null;
            const collected: Song[] = [];
            do {
                const url = cursor
                    ? `${API_URL}?limit=100&startAfter=${cursor}`
                    : `${API_URL}?limit=100`;
                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch all songs');
                const json = await res.json();
                collected.push(...json.data);
                cursor = json.nextCursor;
            } while (cursor);
            setAllSongs(collected);
        } catch (error) {
            console.error('Error refreshing all songs:', error);
            toast.error('Failed to refresh songs');
        } finally {
            setAllLoading(false);
        }
    }, [API_URL]);

    useEffect(() => { fetchFirstPage(); }, []);

    const addSong = async (title: string, url: string, type: 'song' | 'playlist') => {
        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title, url, type }),
            });
            if (!response.ok) throw new Error('Failed to add song');
            toast.success('Song added successfully');
            await Promise.all([fetchFirstPage(), refreshAll()]);
        } catch (error) {
            console.error('Error adding song:', error);
            toast.error('Failed to add song');
            throw error;
        }
    };

    const deleteSong = async (id: string) => {
        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete song');
            toast.success('Song deleted successfully');
            setSongs(prev => prev.filter(s => s.id !== id));
            setAllSongs(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error deleting song:', error);
            toast.error('Failed to delete song');
            throw error;
        }
    };

    return (
        <SongContext.Provider value={{
            songs, loading, loadingMore, hasMore, loadMore,
            allSongs, allLoading, refreshAll,
            addSong, deleteSong,
        }}>
            {children}
        </SongContext.Provider>
    );
};

export const useSongs = () => {
    const context = useContext(SongContext);
    if (!context) throw new Error('useSongs must be used within a SongProvider');
    return context;
};
