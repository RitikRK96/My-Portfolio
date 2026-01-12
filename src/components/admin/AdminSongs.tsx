import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSongs } from '../../context/SongContext';
import { Trash2, Music, X, Plus } from 'lucide-react';

import ConfirmModal from '../ConfirmModal';

const AdminSongs = () => {
    const { songs, addSong, deleteSong } = useSongs();
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({ title: '', url: '', type: 'song' });

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

            await addSong(formData.title || 'Untitled', embedUrl, formData.type as 'song' | 'playlist');

            setFormData({ title: '', url: '', type: 'song' });
            setIsModalOpen(false);
        } catch (error) {
            // Error handled in context
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteSong(deleteId);
        } catch (error) {
            // Error handled in context
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Manage Songs & Playlists</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={20} /> Add New
                </button>
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

            {/* Full Screen Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="glass-card w-full max-w-lg p-8 rounded-xl relative shadow-2xl border border-white/10">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-2xl font-bold text-white mb-6 text-center">Add New Track</h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Title</label>
                                <input
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                                    placeholder="My Fav Jam"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Link (YouTube/Spotify)</label>
                                <input
                                    required
                                    value={formData.url}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="song" className="bg-gray-900">Song</option>
                                    <option value="playlist" className="bg-gray-900">Playlist</option>
                                </select>
                            </div>

                            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02]">
                                Add to Library
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}

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
