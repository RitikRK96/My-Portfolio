import React, { createContext, useContext, useState } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';

interface UploadContextType {
    uploadFile: (file: File, path?: string) => Promise<string>;
    uploading: boolean;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const UploadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [uploading, setUploading] = useState(false);

    const uploadFile = async (file: File, path: string = 'uploads') => {
        setUploading(true);
        const uniqueName = `${path}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, uniqueName);

        try {
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload file.");
            throw error;
        } finally {
            setUploading(false);
        }
    };

    return (
        <UploadContext.Provider value={{ uploadFile, uploading }}>
            {children}
        </UploadContext.Provider>
    );
};

export const useUpload = () => {
    const context = useContext(UploadContext);
    if (!context) {
        throw new Error('useUpload must be used within an UploadProvider');
    }
    return context;
};
