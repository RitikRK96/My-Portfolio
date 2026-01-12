import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { auth } from '../firebase';
import { useUpload } from './UploadContext';


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
    const { uploadFile } = useUpload(); // Utilize UploadContext

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_BASE = isLocal
        ? 'http://127.0.0.1:5001/portfolio-ritik-1/asia-south1/api'
        : (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/portfolio-ritik-1/asia-south1/api');
    const API_URL = `${API_BASE}/projects`;

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch projects');
            const data = await response.json();
            setProjects(data);
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
                imageUrl = await uploadFile(imageFile, 'projects');
            }

            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...data, imageUrl }),
            });

            if (!response.ok) throw new Error('Failed to add project');

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
                imageUrl = await uploadFile(imageFile, 'projects');
            }

            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...data, ...(imageUrl && { imageUrl }) }),
            });

            if (!response.ok) throw new Error('Failed to update project');

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
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete project');

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
