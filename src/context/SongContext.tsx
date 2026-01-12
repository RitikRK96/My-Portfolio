import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { auth } from '../firebase';

export interface Song {
    id: string;
    title?: string;
    url: string;
    type: 'song' | 'playlist';
    createdAt?: any;
}

interface SongContextType {
    songs: Song[];
    loading: boolean;
    refreshSongs: () => Promise<void>;
    addSong: (title: string, url: string, type: 'song' | 'playlist') => Promise<void>;
    deleteSong: (id: string) => Promise<void>;
}

const SongContext = createContext<SongContextType | undefined>(undefined);

export const SongProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_BASE = isLocal
        ? 'http://127.0.0.1:5001/portfolio-ritik-1/asia-south1/api'
        : (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/portfolio-ritik-1/asia-south1/api');
    const API_URL = `${API_BASE}/songs`;

    const fetchSongs = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch songs');
            const data = await response.json();
            setSongs(data);
        } catch (error) {
            console.error('Error fetching songs', error);
            toast.error('Failed to load songs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSongs();
    }, []);

    const addSong = async (title: string, url: string, type: 'song' | 'playlist') => {
        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, url, type }),
            });

            if (!response.ok) throw new Error('Failed to add song');

            toast.success('Song added successfully');
            fetchSongs();
        } catch (error) {
            console.error('Error adding song', error);
            toast.error('Failed to add song');
            throw error;
        }
    };

    const deleteSong = async (id: string) => {
        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete song');

            toast.success('Song deleted successfully');
            fetchSongs();
        } catch (error) {
            console.error('Error deleting song', error);
            toast.error('Failed to delete song');
            throw error;
        }
    };

    return (
        <SongContext.Provider value={{ songs, loading, refreshSongs: fetchSongs, addSong, deleteSong }}>
            {children}
        </SongContext.Provider>
    );
};

export const useSongs = () => {
    const context = useContext(SongContext);
    if (!context) {
        throw new Error('useSongs must be used within a SongProvider');
    }
    return context;
};
