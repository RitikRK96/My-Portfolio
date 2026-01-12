import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { auth } from '../firebase';
import { useUpload } from './UploadContext';

export interface Photo {
    id: string;
    imageUrl: string;
    category: string;
    caption: string;
    date: any; // Timestamp
    createdAt?: any;
}

interface PhotoContextType {
    photos: Photo[];
    loading: boolean;
    refreshPhotos: () => Promise<void>;
    addPhoto: (data: Omit<Photo, 'id' | 'createdAt' | 'imageUrl'>, imageFile: File) => Promise<void>;
    deletePhoto: (id: string) => Promise<void>;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export const PhotoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const { uploadFile } = useUpload();

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_BASE = isLocal
        ? 'http://127.0.0.1:5001/portfolio-ritik-1/asia-south1/api'
        : (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/portfolio-ritik-1/asia-south1/api');
    const API_URL = `${API_BASE}/photos`;

    const fetchPhotos = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch photos');
            const data = await response.json();
            setPhotos(data);
        } catch (error) {
            console.error('Error fetching photos', error);
            toast.error('Failed to load photos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, []);

    const addPhoto = async (data: Omit<Photo, 'id' | 'createdAt' | 'imageUrl'>, imageFile: File) => {
        try {
            const imageUrl = await uploadFile(imageFile, 'photos');

            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...data, imageUrl }),
            });

            if (!response.ok) throw new Error('Failed to add photo');

            toast.success('Photo added successfully');
            fetchPhotos();
        } catch (error) {
            console.error('Error adding photo', error);
            toast.error('Failed to add photo');
            throw error;
        }
    };

    const deletePhoto = async (id: string) => {
        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete photo');

            toast.success('Photo deleted successfully');
            fetchPhotos();
        } catch (error) {
            console.error('Error deleting photo', error);
            toast.error('Failed to delete photo');
            throw error;
        }
    };

    return (
        <PhotoContext.Provider value={{ photos, loading, refreshPhotos: fetchPhotos, addPhoto, deletePhoto }}>
            {children}
        </PhotoContext.Provider>
    );
};

export const usePhotos = () => {
    const context = useContext(PhotoContext);
    if (!context) {
        throw new Error('usePhotos must be used within a PhotoProvider');
    }
    return context;
};
