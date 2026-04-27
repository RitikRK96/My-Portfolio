import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { auth } from '../firebase';
import { useAuth } from './AuthContext';

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt?: string | null;
    status?: 'read' | 'unread';
}

interface ContactContextType {
    contacts: ContactMessage[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    deleteContact: (id: string) => Promise<void>;
    submitContact: (name: string, email: string, message: string) => Promise<void>;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

const getApiBase = () => {
    return import.meta.env.VITE_API_URL || 'https://api-dp2f6yjbbq-el.a.run.app';
};

const PAGE_LIMIT = 20;

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [contacts, setContacts] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const nextCursorRef = useRef<string | null>(null);

    const { user } = useAuth();
    const API_URL = `${getApiBase()}/contacts`;

    const fetchFirstPage = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        nextCursorRef.current = null;
        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`${API_URL}?limit=${PAGE_LIMIT}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            if (response.status === 401 || response.status === 403) {
                setContacts([]);
                return;
            }
            if (!response.ok) throw new Error('Failed to fetch contacts');
            const json = await response.json();
            setContacts(json.data);
            nextCursorRef.current = json.nextCursor;
            setHasMore(json.hasMore);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    }, [user, API_URL]);

    const loadMore = useCallback(async () => {
        if (!user || loadingMore || !hasMore || !nextCursorRef.current) return;
        setLoadingMore(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(
                `${API_URL}?limit=${PAGE_LIMIT}&startAfter=${nextCursorRef.current}`,
                { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }
            );
            if (!response.ok) throw new Error('Failed to fetch more contacts');
            const json = await response.json();
            setContacts(prev => [...prev, ...json.data]);
            nextCursorRef.current = json.nextCursor;
            setHasMore(json.hasMore);
        } catch (error) {
            console.error('Error loading more contacts:', error);
        } finally {
            setLoadingMore(false);
        }
    }, [user, API_URL, hasMore, loadingMore]);

    useEffect(() => {
        if (user) {
            fetchFirstPage();
        } else {
            setContacts([]);
            setHasMore(true);
            nextCursorRef.current = null;
        }
    }, [user]);

    const deleteContact = async (id: string) => {
        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete contact');
            toast.success('Message deleted');
            setContacts(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting contact:', error);
            toast.error('Failed to delete message');
        }
    };

    // Public contact submission
    const submitContact = async (name: string, email: string, message: string) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message }),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to send message');
        }

        // Send email notification via FormSubmit
        try {
            await fetch("https://formsubmit.co/ajax/ritikrk008@gmail.com", {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    message: message,
                    _subject: `New Portfolio Message from ${name}`
                })
            });
        } catch (err) {
            console.error('Failed to send email notification via FormSubmit:', err);
            // Do not throw here so the user still gets a success message for the DB save
        }
    };

    return (
        <ContactContext.Provider value={{
            contacts, loading, loadingMore, hasMore, loadMore,
            deleteContact, submitContact,
        }}>
            {children}
        </ContactContext.Provider>
    );
};

export const useContacts = () => {
    const context = useContext(ContactContext);
    if (!context) throw new Error('useContacts must be used within a ContactProvider');
    return context;
};
