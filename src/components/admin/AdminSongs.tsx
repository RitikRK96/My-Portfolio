import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Trash2, Music } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../ConfirmModal';

interface Song {
    id: string;
    title: string;
    url: string;
    type: 'song' | 'playlist';
}

const AdminSongs = () => {
    const [songs, setSongs] = useState<Song[]>([]);
    // const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [formData, setFormData] = useState({ title: '', url: '', type: 'song' });

    useEffect(() => {
        fetchSongs();
    }, []);

    const fetchSongs = async () => {
        try {
            const q = query(collection(db, 'songs'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));
            setSongs(list);
        } catch (error) {
            toast.error('Error fetching songs');
        } finally {
            // setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.url) return;

        try {
            // Basic embed converter for YouTube/Spotify
            let embedUrl = formData.url;
            if (formData.url.includes('youtube.com/watch?v=')) {
                const videoId = formData.url.split('v=')[1]?.split('&')[0];
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            } else if (formData.url.includes('spotify.com')) {
                // Spotify usually needs 'embed' in path, user might paste normal link
                // Simple heuristic replace
                embedUrl = formData.url.replace('open.spotify.com', 'open.spotify.com/embed');
            }

            await addDoc(collection(db, 'songs'), {
                title: formData.title || 'Untitled',
                url: embedUrl,
                type: formData.type,
                createdAt: serverTimestamp(),
            });

            toast.success('Added successfully');
            setFormData({ title: '', url: '', type: 'song' });
            fetchSongs();
        } catch (error) {
            toast.error('Error adding song');
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteDoc(doc(db, 'songs', deleteId));
            toast.success('Deleted successfully');
            fetchSongs();
        } catch (error) {
            toast.error('Deletion failed');
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Manage Songs & Playlists</h2>

            <div className="bg-white/5 p-6 rounded-xl mb-8 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Add New</h3>
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-gray-400 text-sm mb-1">Title</label>
                        <input
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white outline-none"
                            placeholder="My Fav Jam"
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-gray-400 text-sm mb-1">Link (YouTube/Spotify)</label>
                        <input
                            required
                            value={formData.url}
                            onChange={e => setFormData({ ...formData, url: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white outline-none"
                            placeholder="https://..."
                        />
                    </div>
                    <div className="w-full md:w-32">
                        <label className="block text-gray-400 text-sm mb-1">Type</label>
                        <select
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white outline-none"
                        >
                            <option value="song">Song</option>
                            <option value="playlist">Playlist</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
                        Add
                    </button>
                </form>
            </div>

            <div className="space-y-4">
                {songs.map(song => (
                    <div key={song.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/5 rounded-full text-blue-400">
                                <Music size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{song.title}</h4>
                                <a href={song.url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline line-clamp-1">{song.url}</a>
                                <span className="text-xs text-gray-500 uppercase">{song.type}</span>
                            </div>
                        </div>
                        <button onClick={() => setDeleteId(song.id)} className="p-2 text-red-400 hover:bg-white/5 rounded-lg">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                {songs.length === 0 && <div className="text-gray-500 text-center">No songs yet.</div>}
            </div>

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Item"
                message="Remove this from your playlist?"
                isDestructive
            />
        </div>
    );
};

export default AdminSongs;
