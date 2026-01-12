import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, storage } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';

export interface Project {
    id: string;
    title: string;
    description: string;
    techStack: string[];
    liveUrl: string;
    githubUrl: string;
    imageUrl: string;
    createdAt?: any;
}

interface ProjectContextType {
    projects: Project[];
    loading: boolean;
    refreshProjects: () => Promise<void>;
    addProject: (data: Omit<Project, 'id' | 'createdAt'>, imageFile?: File) => Promise<void>;
    updateProject: (id: string, data: Partial<Project>, imageFile?: File) => Promise<void>;
    deleteProject: (id: string, imageUrl?: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
            setProjects(list);
        } catch (error) {
            console.error('Error fetching projects', error);
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const addProject = async (data: Omit<Project, 'id' | 'createdAt'>, imageFile?: File) => {
        try {
            let imageUrl = data.imageUrl || '';
            if (imageFile) {
                const uniqueName = `projects/${Date.now()}_${imageFile.name}`;
                const storageRef = ref(storage, uniqueName);
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            await addDoc(collection(db, 'projects'), {
                ...data,
                imageUrl,
                createdAt: serverTimestamp(),
            });
            toast.success('Project added successfully');
            fetchProjects();
        } catch (error) {
            console.error('Error adding project', error);
            toast.error('Failed to add project');
            throw error;
        }
    };

    const updateProject = async (id: string, data: Partial<Project>, imageFile?: File) => {
        try {
            let imageUrl = data.imageUrl;
            if (imageFile) {
                const uniqueName = `projects/${Date.now()}_${imageFile.name}`;
                const storageRef = ref(storage, uniqueName);
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            await updateDoc(doc(db, 'projects', id), {
                ...data,
                ...(imageUrl && { imageUrl }),
                updatedAt: serverTimestamp(),
            });
            toast.success('Project updated successfully');
            fetchProjects();
        } catch (error) {
            console.error('Error updating project', error);
            toast.error('Failed to update project');
            throw error;
        }
    };

    const deleteProject = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'projects', id));
            // Optional: delete image from storage
            // if (imageUrl) { ... } 
            toast.success('Project deleted successfully');
            fetchProjects();
        } catch (error) {
            console.error('Error deleting project', error);
            toast.error('Failed to delete project');
            throw error;
        }
    };

    return (
        <ProjectContext.Provider value={{ projects, loading, refreshProjects: fetchProjects, addProject, updateProject, deleteProject }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
};
