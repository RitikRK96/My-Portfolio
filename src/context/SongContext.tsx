import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';

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

    const fetchSongs = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'songs'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));
            setSongs(list);
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
            await addDoc(collection(db, 'songs'), {
                title,
                url,
                type,
                createdAt: serverTimestamp(),
            });
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
            await deleteDoc(doc(db, 'songs', id));
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
