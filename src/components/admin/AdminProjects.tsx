import React, { useEffect, useState } from 'react';
import { db, storage } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../ConfirmModal';
import clsx from 'clsx';

interface Project {
    id: string;
    title: string;
    description: string;
    techStack: string[];
    liveUrl: string;
    githubUrl: string;
    imageUrl: string;
}

const AdminProjects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        techStack: '',
        liveUrl: '',
        githubUrl: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'projects'));
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
            setProjects(list);
        } catch (error) {
            toast.error('Error fetching projects');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', techStack: '', liveUrl: '', githubUrl: '' });
        setImageFile(null);
        setCurrentProject(null);
        setIsModalOpen(false);
    };

    const handleEdit = (project: Project) => {
        setCurrentProject(project);
        setFormData({
            title: project.title,
            description: project.description,
            techStack: project.techStack.join(', '),
            liveUrl: project.liveUrl,
            githubUrl: project.githubUrl,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        try {
            let imageUrl = currentProject?.imageUrl || '';

            if (imageFile) {
                const uniqueName = `projects/${Date.now()}_${imageFile.name}`;
                const storageRef = ref(storage, uniqueName);
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            const projectData = {
                title: formData.title,
                description: formData.description,
                techStack: formData.techStack.split(',').map(s => s.trim()).filter(s => s),
                liveUrl: formData.liveUrl,
                githubUrl: formData.githubUrl,
                imageUrl,
                updatedAt: serverTimestamp(),
            };

            if (currentProject) {
                await updateDoc(doc(db, 'projects', currentProject.id), projectData);
                toast.success('Project updated successfully');
            } else {
                await addDoc(collection(db, 'projects'), {
                    ...projectData,
                    createdAt: serverTimestamp(),
                });
                toast.success('Project created successfully');
            }

            fetchProjects();
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error('Error saving project');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteDoc(doc(db, 'projects', deleteId));
            // Optional: Delete image from storage if needed
            toast.success('Project deleted');
            fetchProjects();
        } catch (error) {
            toast.error('Error deleting project');
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Manage Projects</h2>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={20} /> Add Project
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-400">Loading projects...</div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-center sm:items-start group hover:bg-white/10 transition-colors">
                            <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-black/20 rounded-lg overflow-hidden">
                                {project.imageUrl ? (
                                    <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                                )}
                            </div>

                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="text-xl font-bold text-white">{project.title}</h3>
                                <p className="text-gray-400 text-sm line-clamp-2 mt-1">{project.description}</p>
                                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                                    {project.techStack.map(pc => (
                                        <span key={pc} className="text-xs px-2 py-1 bg-white/10 rounded-full text-blue-200">{pc}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(project)}
                                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                >
                                    <Edit2 size={20} />
                                </button>
                                <button
                                    onClick={() => setDeleteId(project.id)}
                                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {projects.length === 0 && <div className="text-center py-10 text-gray-500">No projects found. Add one!</div>}
                </div>
            )}

            {/* Edit/Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">{currentProject ? 'Edit Project' : 'New Project'}</h3>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Live URL</label>
                                    <input
                                        value={formData.liveUrl}
                                        onChange={e => setFormData({ ...formData, liveUrl: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">GitHub URL</label>
                                    <input
                                        value={formData.githubUrl}
                                        onChange={e => setFormData({ ...formData, githubUrl: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Tech Stack (comma separated)</label>
                                <input
                                    value={formData.techStack}
                                    onChange={e => setFormData({ ...formData, techStack: e.target.value })}
                                    placeholder="React, Firebase, Tailwind"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Project Image</label>
                                <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:border-blue-500/50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setImageFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                        <Upload size={32} />
                                        <span className="text-sm">{imageFile ? imageFile.name : 'Click to upload specific image'}</span>
                                    </div>
                                </div>
                                {currentProject?.imageUrl && !imageFile && (
                                    <div className="mt-2 text-xs text-gray-500">Current image: <a href={currentProject.imageUrl} target="_blank" className="underline">View</a></div>
                                )}
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50"
                                >
                                    {uploading ? 'Saving...' : 'Save Project'}
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
                title="Delete Project"
                message="Are you sure you want to delete this project? This action cannot be undone."
                isDestructive
            />
        </div>
    );
};

export default AdminProjects;
