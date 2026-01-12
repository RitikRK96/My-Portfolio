import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { auth } from '../firebase';

import { useAuth } from './AuthContext';

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt?: any;
    status?: 'read' | 'unread';
}

interface ContactContextType {
    contacts: ContactMessage[];
    loading: boolean;
    deleteContact: (id: string) => Promise<void>;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [contacts, setContacts] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://127.0.0.1:5001/portfolio-ritik-1/asia-south1/api'
        : (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/portfolio-ritik-1/asia-south1/api');
    const API_URL = `${API_BASE}/contacts`;

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const headers: HeadersInit = token
                ? { 'Authorization': `Bearer ${token}` }
                : {};

            const response = await fetch(API_URL, { headers });

            if (response.status === 403) {
                // Guest/Unauthenticated users might get 403 if they try to view contacts
                console.warn("Not authorized to view contacts");
                setContacts([]);
                return;
            }

            if (!response.ok) throw new Error('Failed to fetch contacts');
            const data = await response.json();
            setContacts(data);
        } catch (error) {
            console.error('Error fetching contacts', error);
            // toast.error('Failed to load contacts'); // Optional: mute error if it happens on load
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchContacts();
        } else {
            setContacts([]);
            setLoading(false);
        }
    }, [user]);

    const deleteContact = async (id: string) => {
        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete contact');

            toast.success('Message deleted');
            fetchContacts(); // Refresh list
        } catch (error) {
            console.error('Error deleting contact', error);
            toast.error('Failed to delete message');
        }
    };

    return (
        <ContactContext.Provider value={{ contacts, loading, deleteContact }}>
            {children}
        </ContactContext.Provider>
    );
};

export const useContacts = () => {
    const context = useContext(ContactContext);
    if (!context) {
        throw new Error('useContacts must be used within a ContactProvider');
    }
    return context;
};
