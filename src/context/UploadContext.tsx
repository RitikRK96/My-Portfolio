import React, { createContext, useContext, useState } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';

interface UploadContextType {
    uploadFile: (file: File, path?: string) => Promise<string>;
    uploading: boolean;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

// Helper to compress images on the client side using HTML5 canvas
const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<File | Blob> => {
    return new Promise((resolve) => {
        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file);
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const newName = file.name.substring(0, file.name.lastIndexOf('.')) + '.webp';
                            const compressedFile = new File([blob], newName, {
                                type: 'image/webp',
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        } else {
                            resolve(file);
                        }
                    },
                    'image/webp',
                    quality
                );
            };
            img.onerror = () => resolve(file);
        };
        reader.onerror = () => resolve(file);
    });
};

export const UploadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [uploading, setUploading] = useState(false);

    const uploadFile = async (file: File, path: string = 'uploads') => {
        setUploading(true);
        try {
            // Compress the image before uploading
            const processedFile = await compressImage(file);
            
            // Adjust the extension in filename if compressed to webp
            const fileName = processedFile instanceof File ? processedFile.name : `${file.name.substring(0, file.name.lastIndexOf('.'))}.webp`;
            
            const uniqueName = `${path}/${Date.now()}_${fileName}`;
            const storageRef = ref(storage, uniqueName);

            await uploadBytes(storageRef, processedFile);
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
