import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
    BookOpen, Plus, Loader2, FileText,
    Clock, Type, PenLine, TrendingUp, Library,
    CheckCircle, Circle, RotateCcw, AlertCircle, Hash,
    Calendar, Trash2, GripVertical, Edit3, Save
} from 'lucide-react';
import { auth } from '../firebase';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ConfirmModal from '../components/ConfirmModal';

const getApiBase = () => import.meta.env.VITE_API_URL || 'https://api-dp2f6yjbbq-el.a.run.app';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Chapter {
    id: string;
    title: string;
    content: string;
    order: number;
    isDeleted?: boolean;
    status?: 'draft' | 'in-progress' | 'done' | 'needs-revision';
    synopsis?: string;
    color?: string;
}

interface Book {
    id: string;
    title: string;
    genre: string;
    status: string;
    wordCount: number;
    updatedAt: string;
    createdAt?: string;
    description?: string;
    chapters: Chapter[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const countWords = (html: string) => {
    const t = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return t ? t.split(' ').filter(Boolean).length : 0;
};
const fmtWords = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
const fmtDate = (iso: string) => {
    if (!iso) return 'Never';
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// ── Status configs ────────────────────────────────────────────────────────────
const BOOK_STATUS: Record<string, { label: string; cls: string; dot: string }> = {
    draft:       { label: 'Draft',       cls: 'text-gray-400 bg-white/[0.05] border-white/10',       dot: 'bg-gray-500' },
    in_progress: { label: 'In Progress', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20',  dot: 'bg-amber-400' },
    published:   { label: 'Published',   cls: 'text-green-400 bg-green-500/10 border-green-500/20',  dot: 'bg-green-400' },
    archived:    { label: 'Archived',    cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20',     dot: 'bg-blue-400' },
};

const CH_STATUS: Record<string, { label: string; color: string; Icon: any }> = {
    draft:            { label: 'Draft',          color: 'text-gray-500',  Icon: Circle },
    'in-progress':    { label: 'In Progress',    color: 'text-blue-400',  Icon: RotateCcw },
    done:             { label: 'Done',           color: 'text-green-400', Icon: CheckCircle },
    'needs-revision': { label: 'Needs Revision', color: 'text-amber-400', Icon: AlertCircle },
};

const CHAPTER_COLORS = ['#6B7280','#EF4444','#F97316','#EAB308','#22C55E','#3B82F6','#8B5CF6','#EC4899'];

// ── Sortable Chapter Row ──────────────────────────────────────────────────────
const SortableChapterRow = ({
    ch, i, onClick, onDelete,
}: {
    ch: Chapter; i: number; onClick: () => void; onDelete: (e: React.MouseEvent, id: string) => void;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ch.id });
    const words = countWords(ch.content ?? '');
    const cs    = CH_STATUS[ch.status ?? 'draft'] ?? CH_STATUS['draft'];
    const dot   = ch.color ?? CHAPTER_COLORS[0];

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            onClick={onClick}
            className={clsx(
                "group relative flex items-start gap-4 px-6 py-5 bg-[#07070e] hover:bg-white/[0.03] cursor-pointer transition-all border-b border-white/[0.04] last:border-0",
                isDragging && "opacity-50 scale-[0.98] z-10 shadow-xl"
            )}
        >
            <div
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
                className="mt-2 text-gray-700 hover:text-white cursor-grab active:cursor-grabbing p-1 -ml-2"
            >
                <GripVertical size={16} />
            </div>

            <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/[0.05] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-mono text-gray-600 group-hover:text-orange-400 transition-colors">
                    {String(i + 1).padStart(2, '0')}
                </span>
            </div>

            <div className="mt-2.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors truncate">
                        {ch.title || 'Untitled Chapter'}
                    </h3>
                    <span className={clsx('flex items-center gap-1 text-[10px] font-medium', cs.color)}>
                        <cs.Icon size={10} />
                        {cs.label}
                    </span>
                </div>
                {ch.synopsis ? (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{ch.synopsis}</p>
                ) : (
                    <p className="text-xs text-gray-700 italic">No synopsis</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-700">
                    <span className="flex items-center gap-1"><Type size={10} />{fmtWords(words)} words</span>
                </div>
            </div>

            <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => onDelete(e, ch.id)}
                    title="Move to Recycle Bin"
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                    <Trash2 size={15} />
                </button>
                <div className="p-2 rounded-lg text-gray-500 hover:text-orange-400 hover:bg-orange-500/10 transition-all ml-1">
                    <PenLine size={15} />
                </div>
            </div>
        </div>
    );
};


// ── BookDetail ─────────────────────────────────────────────────────────────────
const BookDetail = () => {
    const { bookId } = useParams<{ bookId: string }>();
    const navigate = useNavigate();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [creatingChapter, setCreatingChapter] = useState(false);
    
    // Tab State
    const [activeTab, setActiveTab] = useState<'chapters' | 'recycle_bin'>('chapters');

    // Modals
    const [chapterToDelete, setChapterToDelete] = useState<string | null>(null);
    const [chapterToHardDelete, setChapterToHardDelete] = useState<string | null>(null);
    
    // Book Editing
    const [isEditingBook, setIsEditingBook] = useState(false);
    const [editBookForm, setEditBookForm] = useState({ title: '', genre: '', description: '', status: '' });
    const [savingBook, setSavingBook] = useState(false);

    const API_URL = `${getApiBase()}/books`;

    useEffect(() => {
        if (!bookId) { navigate('/admin/books'); return; }
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`${API_URL}/${bookId}`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                if (cancelled) return;
                setBook(data);
                setEditBookForm({
                    title: data.title || '',
                    genre: data.genre || '',
                    description: data.description || '',
                    status: data.status || 'draft'
                });
            } catch {
                if (cancelled) return;
                toast.error('Failed to load book');
                navigate('/admin/books');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [bookId]); // eslint-disable-line

    // ── Drag and Drop ─────────────────────────────────────────────────────────
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id || !bookId || !book) return;

        const activeChapters = book.chapters.filter(c => !c.isDeleted).sort((a, b) => a.order - b.order);
        
        const oldIndex = activeChapters.findIndex(c => c.id === active.id);
        const newIndex = activeChapters.findIndex(c => c.id === over.id);

        const reordered = arrayMove(activeChapters, oldIndex, newIndex).map((c, i) => ({ ...c, order: i }));
        
        // Update local state immediately
        setBook(prev => {
            if (!prev) return prev;
            const newChapters = prev.chapters.map(c => {
                if (c.isDeleted) return c;
                const updated = reordered.find(r => r.id === c.id);
                return updated || c;
            });
            return { ...prev, chapters: newChapters };
        });

        // Persist to server
        try {
            const token = await auth.currentUser?.getIdToken();
            await fetch(`${API_URL}/${bookId}/chapters/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ chapters: reordered.map(c => ({ id: c.id, order: c.order })) }),
            });
        } catch {
            toast.error('Failed to save chapter order');
        }
    };

    // ── Chapter Actions ───────────────────────────────────────────────────────
    const handleCreateChapter = async () => {
        if (!bookId || creatingChapter || !book) return;
        setCreatingChapter(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const activeChapters = (book.chapters ?? []).filter(c => !c.isDeleted);
            const res = await fetch(`${API_URL}/${bookId}/chapters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    title: `Chapter ${activeChapters.length + 1}`,
                    content: '',
                    order: activeChapters.length,
                }),
            });
            if (!res.ok) throw new Error();
            const chapter: Chapter = await res.json();
            setBook(prev => prev ? { ...prev, chapters: [...(prev.chapters ?? []), chapter] } : prev);
            toast.success('Chapter created');
            navigate(`/admin/book-writer?bookId=${bookId}&chapterId=${chapter.id}`);
        } catch {
            toast.error('Failed to create chapter');
        } finally {
            setCreatingChapter(false);
        }
    };

    const confirmDeleteChapter = async () => {
        if (!chapterToDelete || !bookId) return;
        try {
            const token = await auth.currentUser?.getIdToken();
            await fetch(`${API_URL}/${bookId}/chapters/${chapterToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setBook(prev => prev ? {
                ...prev,
                chapters: prev.chapters.map(c => c.id === chapterToDelete ? { ...c, isDeleted: true } : c)
            } : prev);
            toast.success('Chapter moved to recycle bin');
        } catch {
            toast.error('Failed to delete chapter');
        } finally {
            setChapterToDelete(null);
        }
    };

    const confirmHardDeleteChapter = async () => {
        if (!chapterToHardDelete || !bookId) return;
        try {
            const token = await auth.currentUser?.getIdToken();
            await fetch(`${API_URL}/${bookId}/chapters/${chapterToHardDelete}?hard=true`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setBook(prev => prev ? {
                ...prev,
                chapters: prev.chapters.filter(c => c.id !== chapterToHardDelete)
            } : prev);
            toast.success('Chapter permanently deleted');
        } catch {
            toast.error('Failed to delete chapter');
        } finally {
            setChapterToHardDelete(null);
        }
    };

    const handleRestoreChapter = async (e: React.MouseEvent, chapterId: string) => {
        e.stopPropagation();
        if (!bookId) return;
        try {
            const token = await auth.currentUser?.getIdToken();
            await fetch(`${API_URL}/${bookId}/chapters/${chapterId}/restore`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setBook(prev => prev ? {
                ...prev,
                chapters: prev.chapters.map(c => c.id === chapterId ? { ...c, isDeleted: false } : c)
            } : prev);
            toast.success('Chapter restored');
        } catch {
            toast.error('Failed to restore chapter');
        }
    };

    // ── Book Actions ──────────────────────────────────────────────────────────
    const handleSaveBookDetails = async () => {
        if (!bookId || !book) return;
        setSavingBook(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch(`${API_URL}/${bookId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(editBookForm),
            });
            if (!res.ok) throw new Error();
            setBook({ ...book, ...editBookForm });
            setIsEditingBook(false);
            toast.success('Book updated successfully');
        } catch {
            toast.error('Failed to update book');
        } finally {
            setSavingBook(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-orange-400" size={28} />
                <p className="text-gray-600 text-sm">Loading book…</p>
            </div>
        </div>
    );

    if (!book) return null;

    const activeChapters = (book.chapters ?? [])
        .filter(c => !c.isDeleted)
        .sort((a, b) => a.order - b.order);

    const deletedChapters = (book.chapters ?? []).filter(c => c.isDeleted);

    const totalWords  = activeChapters.reduce((s, c) => s + countWords(c.content ?? ''), 0);
    const readTime    = Math.max(1, Math.ceil(totalWords / 250));
    const doneCount   = activeChapters.filter(c => c.status === 'done').length;
    const bs          = BOOK_STATUS[book.status] ?? BOOK_STATUS.draft;

    return (
        <div className="flex-1 flex flex-col p-6 sm:p-10 ml-0 sm:ml-[80px]">
            <div className="max-w-[1100px] w-full mx-auto">

                {/* ── Breadcrumb ── */}
                <div className="flex items-center gap-2 mb-8 text-sm text-gray-600">
                    <Link to="/admin/books" className="flex items-center gap-1.5 hover:text-orange-400 transition-colors">
                        <Library size={14} />
                        Books Library
                    </Link>
                    <span>/</span>
                    <span className="text-gray-400 truncate max-w-xs">{book.title}</span>
                </div>

                {/* ── Hero Header ── */}
                <div className="bg-[#07070e] border border-white/[0.07] rounded-2xl p-8 mb-6 relative overflow-hidden group">
                    {/* decorative glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col sm:flex-row sm:items-start gap-6 relative">
                        {/* Book icon */}
                        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                            <BookOpen size={28} className="text-orange-400" />
                        </div>

                        {isEditingBook ? (
                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
                                    <input value={editBookForm.title} onChange={e => setEditBookForm({...editBookForm, title: e.target.value})} className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-orange-500/50" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Genre</label>
                                        <input value={editBookForm.genre} onChange={e => setEditBookForm({...editBookForm, genre: e.target.value})} className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-orange-500/50" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                                        <select value={editBookForm.status} onChange={e => setEditBookForm({...editBookForm, status: e.target.value})} className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-orange-500/50 appearance-none">
                                            <option value="draft" className="bg-[#0a0a12]">Draft</option>
                                            <option value="in_progress" className="bg-[#0a0a12]">In Progress</option>
                                            <option value="published" className="bg-[#0a0a12]">Published</option>
                                            <option value="archived" className="bg-[#0a0a12]">Archived</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                                    <textarea value={editBookForm.description} onChange={e => setEditBookForm({...editBookForm, description: e.target.value})} rows={3} className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-orange-500/50 resize-none" />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button onClick={handleSaveBookDetails} disabled={savingBook} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                                        {savingBook ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Details
                                    </button>
                                    <button onClick={() => setIsEditingBook(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <h1 className="text-2xl font-bold text-white leading-tight">{book.title}</h1>
                                    <span className={clsx('flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full border', bs.cls)}>
                                        <span className={clsx('w-1.5 h-1.5 rounded-full', bs.dot)} />
                                        {bs.label}
                                    </span>
                                </div>
                                {book.genre && <p className="text-sm text-orange-400/70 font-medium mb-3">{book.genre}</p>}
                                {book.description && <p className="text-sm text-gray-500 leading-relaxed max-w-2xl mb-4">{book.description}</p>}
                                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                                    <span className="flex items-center gap-1.5"><Type size={12} />{fmtWords(totalWords)} words</span>
                                    <span className="flex items-center gap-1.5"><Clock size={12} />~{readTime}m read</span>
                                    <span className="flex items-center gap-1.5"><Hash size={12} />{activeChapters.length} chapter{activeChapters.length !== 1 ? 's' : ''}</span>
                                    {book.updatedAt && <span className="flex items-center gap-1.5"><Calendar size={12} />Updated {fmtDate(book.updatedAt)}</span>}
                                </div>
                            </div>
                        )}

                        {!isEditingBook && (
                            <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                <button
                                    onClick={() => navigate(`/admin/book-writer?bookId=${bookId}`)}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black rounded-xl text-sm font-semibold transition-colors w-full justify-center"
                                >
                                    <PenLine size={15} />
                                    Open Writer
                                </button>
                                <button 
                                    onClick={() => setIsEditingBook(true)}
                                    className="opacity-0 group-hover:opacity-100 flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] transition-all w-full justify-center"
                                >
                                    <Edit3 size={15} />
                                    Edit Book Details
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {[
                        { icon: FileText,   label: 'Chapters',    value: activeChapters.length },
                        { icon: Type,       label: 'Total Words', value: fmtWords(totalWords)  },
                        { icon: CheckCircle,label: 'Done',        value: doneCount             },
                        { icon: TrendingUp, label: 'Read Time',   value: `${readTime}m`        },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="bg-white/[0.025] border border-white/[0.06] rounded-xl px-4 py-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                                <Icon size={15} className="text-gray-500" />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-white leading-tight">{value}</div>
                                <div className="text-[10px] text-gray-600 uppercase tracking-wide">{label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Chapters Section ── */}
                <div className="bg-[#07070e] border border-white/[0.07] rounded-2xl overflow-hidden mb-20">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setActiveTab('chapters')}
                                className={clsx("text-sm font-bold flex items-center gap-2 transition-colors", activeTab === 'chapters' ? "text-white" : "text-gray-600 hover:text-gray-300")}
                            >
                                <FileText size={15} className={activeTab === 'chapters' ? "text-orange-400" : ""} />
                                Chapters
                                <span className={clsx("text-xs font-normal ml-1", activeTab === 'chapters' ? "text-gray-400" : "text-gray-600")}>({activeChapters.length})</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('recycle_bin')}
                                className={clsx("text-sm font-bold flex items-center gap-2 transition-colors", activeTab === 'recycle_bin' ? "text-red-400" : "text-gray-600 hover:text-red-400/70")}
                            >
                                <Trash2 size={15} />
                                Recycle Bin
                                <span className={clsx("text-xs font-normal ml-1", activeTab === 'recycle_bin' ? "text-red-400/70" : "text-gray-600")}>({deletedChapters.length})</span>
                            </button>
                        </div>
                        
                        {activeTab === 'chapters' && (
                            <button
                                onClick={handleCreateChapter}
                                disabled={creatingChapter}
                                className="flex items-center gap-2 px-3.5 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 hover:border-orange-500/30 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
                            >
                                {creatingChapter ? <><Loader2 size={13} className="animate-spin" />Creating…</> : <><Plus size={13} />New Chapter</>}
                            </button>
                        )}
                    </div>

                    {activeTab === 'chapters' ? (
                        activeChapters.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                                    <FileText size={24} className="text-gray-700" />
                                </div>
                                <p className="text-gray-400 font-medium mb-1">No chapters yet</p>
                                <p className="text-xs text-gray-600 mb-6">Start writing your story by adding the first chapter.</p>
                                <button
                                    onClick={handleCreateChapter}
                                    disabled={creatingChapter}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-black rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
                                >
                                    {creatingChapter ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                    Add First Chapter
                                </button>
                            </div>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={activeChapters.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                    <div className="flex flex-col">
                                        {activeChapters.map((ch, i) => (
                                            <SortableChapterRow 
                                                key={ch.id} 
                                                ch={ch} 
                                                i={i} 
                                                onClick={() => navigate(`/admin/book-writer?bookId=${bookId}&chapterId=${ch.id}`)}
                                                onDelete={(e, id) => { e.stopPropagation(); setChapterToDelete(id); }}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )
                    ) : (
                        deletedChapters.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                                    <Trash2 size={24} className="text-gray-700" />
                                </div>
                                <p className="text-gray-400 font-medium mb-1">Recycle bin is empty</p>
                                <p className="text-xs text-gray-600">Deleted chapters will appear here.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/[0.04]">
                                {deletedChapters.map((ch) => (
                                    <div key={ch.id} className="flex items-center justify-between px-6 py-4 bg-[#07070e] hover:bg-white/[0.02] transition-colors">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-400 line-through">{ch.title || 'Untitled Chapter'}</h3>
                                            <p className="text-[11px] text-gray-600 mt-0.5">{fmtWords(countWords(ch.content ?? ''))} words</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setChapterToHardDelete(ch.id); }}
                                                className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Delete Forever"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button 
                                                onClick={(e) => handleRestoreChapter(e, ch.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-green-400 hover:bg-green-500/10 border border-transparent hover:border-green-500/20 rounded-lg transition-all"
                                            >
                                                <RotateCcw size={13} /> Restore
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Confirm Modals */}
            <ConfirmModal
                isOpen={!!chapterToDelete}
                onClose={() => setChapterToDelete(null)}
                onConfirm={confirmDeleteChapter}
                title="Delete Chapter"
                message="Are you sure you want to move this chapter to the recycle bin?"
                isDestructive
            />
            <ConfirmModal
                isOpen={!!chapterToHardDelete}
                onClose={() => setChapterToHardDelete(null)}
                onConfirm={confirmHardDeleteChapter}
                title="Permanently Delete Chapter"
                message="Are you sure you want to permanently delete this chapter? This action cannot be undone."
                isDestructive
            />
        </div>
    );
};

export default BookDetail;
