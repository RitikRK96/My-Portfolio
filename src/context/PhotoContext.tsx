import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, storage } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';

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

    const fetchPhotos = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'photos'), orderBy('date', 'desc'));
            const querySnapshot = await getDocs(q);
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
            setPhotos(list);
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
            const uniqueName = `photos/${Date.now()}_${imageFile.name}`;
            const storageRef = ref(storage, uniqueName);
            await uploadBytes(storageRef, imageFile);
            const imageUrl = await getDownloadURL(storageRef);

            await addDoc(collection(db, 'photos'), {
                ...data,
                imageUrl,
                createdAt: serverTimestamp(),
            });
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
            await deleteDoc(doc(db, 'photos', id));
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
