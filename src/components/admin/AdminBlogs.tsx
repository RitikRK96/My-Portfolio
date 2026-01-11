import React, { useEffect, useState } from 'react';
import { db, storage } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../ConfirmModal';

interface Blog {
    id: string;
    title: string;
    content: string; // Markdown
    imageUrl: string;
}

const AdminBlogs = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [formData, setFormData] = useState({ title: '', content: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'blogs'));
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog));
            setBlogs(list);
        } catch (error) {
            toast.error('Error fetching blogs');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ title: '', content: '' });
        setImageFile(null);
        setCurrentBlog(null);
        setIsModalOpen(false);
    };

    const handleEdit = (blog: Blog) => {
        setCurrentBlog(blog);
        setFormData({ title: blog.title, content: blog.content });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        try {
            let imageUrl = currentBlog?.imageUrl || '';

            if (imageFile) {
                const uniqueName = `blogs/${Date.now()}_${imageFile.name}`;
                const storageRef = ref(storage, uniqueName);
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            const blogData = {
                title: formData.title,
                content: formData.content,
                imageUrl,
                updatedAt: serverTimestamp(),
            };

            if (currentBlog) {
                await updateDoc(doc(db, 'blogs', currentBlog.id), blogData);
                toast.success('Blog updated');
            } else {
                await addDoc(collection(db, 'blogs'), {
                    ...blogData,
                    createdAt: serverTimestamp(),
                });
                toast.success('Blog created');
            }

            fetchBlogs();
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error('Error saving blog');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteDoc(doc(db, 'blogs', deleteId));
            toast.success('Blog deleted');
            fetchBlogs();
        } catch (error) {
            toast.error('Error deleting blog');
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Manage Blogs</h2>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={20} /> New Blog
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-400">Loading blogs...</div>
            ) : (
                <div className="space-y-4">
                    {blogs.map((blog) => (
                        <div key={blog.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex gap-4 items-center">
                            <div className="w-20 h-20 bg-black/20 rounded flex-shrink-0 overflow-hidden">
                                {blog.imageUrl && <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white">{blog.title}</h3>
                                <p className="text-gray-400 text-sm line-clamp-1">{blog.content}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(blog)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg"><Edit2 size={18} /></button>
                                <button onClick={() => setDeleteId(blog.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                    {blogs.length === 0 && <div className="text-center py-10 text-gray-500">No blogs yet.</div>}
                </div>
            )}

            {/* Edit/Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">{currentBlog ? 'Edit Blog' : 'New Blog'}</h3>
                            <button onClick={resetForm}><X className="text-gray-400 hover:text-white" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Cover Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setImageFile(e.target.files?.[0] || null)}
                                    className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Content (Markdown Supported)</label>
                                <textarea
                                    required
                                    rows={15}
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="# Blog Title&#10;&#10;Write your content here..."
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none font-mono text-sm"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/10">Cancel</button>
                                <button type="submit" disabled={uploading} className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50">
                                    {uploading ? 'Saving...' : 'Save Blog'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Blog"
                message="Are you sure?"
                isDestructive
            />
        </div>
    );
};

export default AdminBlogs;
