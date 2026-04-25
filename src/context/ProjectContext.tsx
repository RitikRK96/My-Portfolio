import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
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
    createdAt?: string | null;
}

interface ProjectContextType {
    // Public paginated
    projects: Project[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    // Admin
    allProjects: Project[];
    allLoading: boolean;
    refreshAll: () => Promise<void>;
    addProject: (data: Omit<Project, 'id' | 'createdAt'>, imageFile?: File) => Promise<void>;
    updateProject: (id: string, data: Partial<Project>, imageFile?: File) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const getApiBase = () => {
    return import.meta.env.VITE_API_URL || 'https://api-dp2f6yjbbq-el.a.run.app';
};

const PAGE_LIMIT = 10;

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const nextCursorRef = useRef<string | null>(null);

    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [allLoading, setAllLoading] = useState(false);

    const { uploadFile } = useUpload();
    const API_URL = `${getApiBase()}/projects`;

    const fetchFirstPage = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}?limit=${PAGE_LIMIT}`);
            if (!response.ok) throw new Error('Failed to fetch projects');
            const json = await response.json();
            setProjects(json.data);
            nextCursorRef.current = json.nextCursor;
            setHasMore(json.hasMore);
        } catch (error) {
            console.error('Error fetching projects:', error);
            toast.error('Failed to load projects');
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
            if (!response.ok) throw new Error('Failed to fetch more projects');
            const json = await response.json();
            setProjects(prev => [...prev, ...json.data]);
            nextCursorRef.current = json.nextCursor;
            setHasMore(json.hasMore);
        } catch (error) {
            console.error('Error loading more projects:', error);
            toast.error('Failed to load more projects');
        } finally {
            setLoadingMore(false);
        }
    }, [API_URL, hasMore, loadingMore]);

    const refreshAll = useCallback(async () => {
        setAllLoading(true);
        try {
            let cursor: string | null = null;
            const collected: Project[] = [];
            do {
                const url = cursor
                    ? `${API_URL}?limit=100&startAfter=${cursor}`
                    : `${API_URL}?limit=100`;
                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch all projects');
                const json = await res.json();
                collected.push(...json.data);
                cursor = json.nextCursor;
            } while (cursor);
            setAllProjects(collected);
        } catch (error) {
            console.error('Error refreshing all projects:', error);
            toast.error('Failed to refresh projects');
        } finally {
            setAllLoading(false);
        }
    }, [API_URL]);

    useEffect(() => { fetchFirstPage(); }, []);

    const addProject = async (data: Omit<Project, 'id' | 'createdAt'>, imageFile?: File) => {
        try {
            let imageUrl = data.imageUrl || '';
            if (imageFile) imageUrl = await uploadFile(imageFile, 'projects');
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...data, imageUrl }),
            });
            if (!response.ok) throw new Error('Failed to add project');
            toast.success('Project added successfully');
            await Promise.all([fetchFirstPage(), refreshAll()]);
        } catch (error) {
            console.error('Error adding project:', error);
            toast.error('Failed to add project');
            throw error;
        }
    };

    const updateProject = async (id: string, data: Partial<Project>, imageFile?: File) => {
        try {
            let imageUrl = data.imageUrl;
            if (imageFile) imageUrl = await uploadFile(imageFile, 'projects');
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...data, ...(imageUrl !== undefined && { imageUrl }) }),
            });
            if (!response.ok) throw new Error('Failed to update project');
            toast.success('Project updated successfully');
            await Promise.all([fetchFirstPage(), refreshAll()]);
        } catch (error) {
            console.error('Error updating project:', error);
            toast.error('Failed to update project');
            throw error;
        }
    };

    const deleteProject = async (id: string) => {
        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete project');
            toast.success('Project deleted successfully');
            setProjects(prev => prev.filter(p => p.id !== id));
            setAllProjects(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting project:', error);
            toast.error('Failed to delete project');
            throw error;
        }
    };

    return (
        <ProjectContext.Provider value={{
            projects, loading, loadingMore, hasMore, loadMore,
            allProjects, allLoading, refreshAll,
            addProject, updateProject, deleteProject,
        }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (!context) throw new Error('useProjects must be used within a ProjectProvider');
    return context;
};
