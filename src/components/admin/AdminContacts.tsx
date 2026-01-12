import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ContactMsg {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: any;
}

const AdminContacts = () => {
    const [messages, setMessages] = useState<ContactMsg[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMsg));
                setMessages(list);
            } catch (error) {
                console.error('Error fetching messages');
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Messages ({messages.length})</h2>

            {loading ? (
                <div className="text-gray-400">Loading messages...</div>
            ) : (
                <div className="grid gap-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">{msg.name}</span>
                                    <span className="text-gray-400 text-sm">&lt;{msg.email}&gt;</span>
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <Calendar size={12} />
                                    {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'PP p') : 'Just now'}
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm whitespace-pre-wrap">{msg.message}</p>
                        </div>
                    ))}
                    {messages.length === 0 && <div className="text-gray-500">No messages yet.</div>}
                </div>
            )}
        </div>
    );
};

export default AdminContacts;
