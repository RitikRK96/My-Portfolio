import React, { useEffect, useState } from 'react';
import { db, storage } from '../../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, Trash2, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../ConfirmModal';
import { format } from 'date-fns';

interface Photo {
    id: string;
    url: string;
    category: string;
    caption: string;
    date: string;
}

const DEFAULT_CATEGORIES = ['Moon', 'Sunsets', 'Random'];

const AdminPhotos = () => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Form
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
    const [newCategory, setNewCategory] = useState('');
    const [caption, setCaption] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchPhotos();
    }, []);

    const fetchPhotos = async () => {
        try {
            const q = query(collection(db, 'photos'), orderBy('date', 'desc'));
            const querySnapshot = await getDocs(q);
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
            setPhotos(list);

            // Extract unique categories from existing photos to add to the dropdown dynamicall
            const usedCategories = new Set(list.map(p => p.category));
            DEFAULT_CATEGORIES.forEach(c => usedCategories.add(c));
            setCategories(Array.from(usedCategories));
        } catch (error) {
            toast.error('Error fetching photos');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = () => {
        if (newCategory && !categories.includes(newCategory)) {
            setCategories([...categories, newCategory]);
            setCategory(newCategory);
            setNewCategory('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile) return toast.error('Please select an image');

        setUploading(true);
        try {
            const uniqueName = `photos/${Date.now()}_${imageFile.name}`;
            const storageRef = ref(storage, uniqueName);
            await uploadBytes(storageRef, imageFile);
            const url = await getDownloadURL(storageRef);

            await addDoc(collection(db, 'photos'), {
                url,
                category,
                caption,
                date,
                createdAt: serverTimestamp(),
            });

            toast.success('Photo added');
            setIsModalOpen(false);
            setImageFile(null);
            setCaption('');
            fetchPhotos();
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteDoc(doc(db, 'photos', deleteId));
            toast.success('Photo deleted');
            fetchPhotos();
        } catch (error) {
            toast.error('Error deleting photo');
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Manage Photos</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={20} /> Add Photo
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((photo) => (
                    <div key={photo.id} className="relative group rounded-lg overflow-hidden aspect-square bg-black/20">
                        <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                            <span className="text-white text-sm font-semibold">{photo.category}</span>
                            <span className="text-gray-300 text-xs truncate">{photo.caption}</span>
                            <button
                                onClick={() => setDeleteId(photo.id)}
                                className="absolute top-2 right-2 p-1 bg-red-500/80 rounded hover:bg-red-600 text-white"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-lg p-6 rounded-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Upload Photo</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-white" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="border-2 border-dashed border-white/10 rounded-lg h-40 flex items-center justify-center relative hover:border-blue-500/50 transition-colors">
                                {imageFile ? (
                                    <div className="text-center">
                                        <p className="text-green-400 font-medium">{imageFile.name}</p>
                                        <p className="text-xs text-gray-500">Click to change</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400">
                                        <Upload size={24} />
                                        <span>Click to upload</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setImageFile(e.target.files?.[0] || null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white outline-none"
                                    >
                                        {categories.map(c => <option key={c} value={c} className="bg-gray-800">{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white outline-none"
                                    />
                                    <div className="text-right mt-1">
                                        <button type="button" onClick={() => setDate(format(new Date(), 'yyyy-MM-dd'))} className="text-xs text-blue-400 hover:underline">Today</button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Add New Category</label>
                                <div className="flex gap-2">
                                    <input
                                        value={newCategory}
                                        onChange={e => setNewCategory(e.target.value)}
                                        className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white outline-none"
                                        placeholder="e.g. Travel"
                                    />
                                    <button type="button" onClick={handleAddCategory} className="px-3 bg-white/10 rounded-lg hover:bg-white/20 text-white">Add</button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Caption</label>
                                <input
                                    value={caption}
                                    onChange={e => setCaption(e.target.value)}
                                    placeholder="Captured this moment..."
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white outline-none"
                                />
                            </div>

                            <button type="submit" disabled={uploading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold disabled:opacity-50">
                                {uploading ? 'Uploading...' : 'Save Photo'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Photo"
                message="Permanently delete this photo?"
                isDestructive
            />
        </div>
    );
};

export default AdminPhotos;
