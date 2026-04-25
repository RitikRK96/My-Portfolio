import { useContacts } from '../../context/ContactContext';
import { Calendar, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminContacts = () => {
    const { contacts, loading, loadMore, hasMore, loadingMore, deleteContact } = useContacts();

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Messages ({contacts.length})</h2>

            {loading ? (
                <div className="flex items-center gap-2 text-gray-400 py-10">
                    <Loader2 className="animate-spin" size={20} /> Loading messages...
                </div>
            ) : (
                <>
                    <div className="grid gap-4">
                        {contacts.map((msg) => (
                            <div key={msg.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-white">{msg.name}</span>
                                        <span className="text-gray-400 text-sm">&lt;{msg.email}&gt;</span>
                                        {msg.status && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${msg.status === 'unread' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-400'}`}>
                                                {msg.status}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Calendar size={12} />
                                            {msg.createdAt ? format(new Date(msg.createdAt), 'PP p') : 'Just now'}
                                        </span>
                                        <button
                                            onClick={() => deleteContact(msg.id)}
                                            className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            title="Delete message"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-300 text-sm whitespace-pre-wrap">{msg.message}</p>
                            </div>
                        ))}
                        {contacts.length === 0 && !loading && (
                            <div className="text-gray-500 text-center py-10">No messages yet.</div>
                        )}
                    </div>

                    {/* Load more button */}
                    {hasMore && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 text-sm transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
                            >
                                {loadingMore ? (
                                    <><Loader2 className="animate-spin" size={16} /> Loading...</>
                                ) : (
                                    'Load more messages'
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminContacts;
