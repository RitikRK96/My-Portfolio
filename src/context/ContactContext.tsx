import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, deleteDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';
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

    useEffect(() => {
        let unsubscribe = () => { };

        if (user) {
            setLoading(true);
            const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
            unsubscribe = onSnapshot(q, (snapshot) => {
                const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMessage));
                setContacts(list);
                setLoading(false);
            }, (error) => {
                console.error('Error fetching contacts', error);
                setLoading(false);
            });
        } else {
            setContacts([]);
            setLoading(false);
        }

        return () => unsubscribe();
    }, [user]);

    const deleteContact = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'contacts', id));
            toast.success('Message deleted');
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
