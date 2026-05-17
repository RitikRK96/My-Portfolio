import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Plus, BookOpen, X, ChevronLeft, Clock, Type,
    Trash2, Loader2, BookMarked, PenLine, FileText,
    TrendingUp, Library
} from 'lucide-react';
import { auth } from '../firebase';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import ConfirmModal from '../components/ConfirmModal';

const getApiBase = () => import.meta.env.VITE_API_URL || 'https://api-dp2f6yjbbq-el.a.run.app';

interface Book {
    id: string;
    title: string;
    genre: string;
    status: string;
    wordCount: number;
    updatedAt: string;
    description?: string;
    isDeleted?: boolean;
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS: Record<string, { label: string; cls: string; dot: string }> = {
    draft:       { label: 'Draft',       cls: 'text-gray-400 bg-white/[0.05] border-white/10',        dot: 'bg-gray-500' },
    in_progress: { label: 'In Progress', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20',   dot: 'bg-amber-400' },
    published:   { label: 'Published',   cls: 'text-green-400 bg-green-500/10 border-green-500/20',   dot: 'bg-green-400' },
    archived:    { label: 'Archived',    cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20',      dot: 'bg-blue-400' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtWords = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

const fmtDate = (iso: string) => {
    if (!iso) return 'Never';
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60)      return 'Just now';
    if (diff < 3600)    return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)   return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800)  return `${Math.floor(diff / 86400)}d ago`;
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6 animate-pulse">
        <div className="flex justify-between mb-4">
            <div className="space-y-2 flex-1 pr-4">
                <div className="h-5 bg-white/10 rounded-lg w-3/4" />
                <div className="h-3 bg-white/[0.06] rounded w-1/3" />
            </div>
            <div className="h-6 w-16 bg-white/[0.06] rounded-full" />
        </div>
        <div className="space-y-1.5 mb-6">
            <div className="h-3 bg-white/[0.04] rounded w-full" />
            <div className="h-3 bg-white/[0.04] rounded w-2/3" />
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-white/[0.04]">
            <div className="h-3 bg-white/[0.04] rounded w-24" />
            <div className="h-9 bg-white/[0.06] rounded-xl w-32" />
        </div>
    </div>
);

const BookCard = ({
    book, onOpen, onDelete, onRestore, onHardDelete, isDeleted
}: {
    book: Book;
    onOpen: (id: string) => void;
    onDelete?: (id: string) => void;
    onRestore?: (id: string) => void;
    onHardDelete?: (id: string) => void;
    isDeleted?: boolean;
}) => {
    const s = STATUS[book.status] ?? STATUS.draft;
    const readTime = Math.max(1, Math.ceil((book.wordCount || 0) / 250));

    return (
        <div 
            onClick={() => onOpen(book.id)}
            className="group relative bg-[#07070e] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-300 flex flex-col hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] cursor-pointer"
        >

            <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-bold text-white group-hover:text-orange-300 transition-colors duration-200 line-clamp-2 leading-snug mb-1">
                        {book.title}
                    </h3>
                    <span className="text-xs text-gray-600">
                        {book.genre || 'No genre'}
                    </span>
                </div>
                <span className={clsx(
                    'flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full border flex-shrink-0',
                    s.cls
                )}>
                    <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', s.dot)} />
                    {s.label}
                </span>
            </div>

            {book.description && (
                <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                    {book.description}
                </p>
            )}

            <div className="flex-1" />

            <div className="flex items-center gap-4 mt-4 mb-5">
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Type size={12} />
                    <span>{fmtWords(book.wordCount || 0)} words</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Clock size={12} />
                    <span>{fmtDate(book.updatedAt)}</span>
                </div>
                {(book.wordCount || 0) > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 ml-auto">
                        <span>~{readTime}m read</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
                {isDeleted ? (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); onHardDelete?.(book.id); }}
                            title="Delete forever"
                            className="p-2 text-gray-800 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                            <Trash2 size={14} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onRestore?.(book.id); }}
                            className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-green-500/15 text-gray-400 hover:text-green-300 border border-white/[0.07] hover:border-green-500/25 rounded-xl text-sm font-medium transition-all duration-200"
                        >
                            <Clock size={13} />
                            Restore
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete?.(book.id); }}
                            title="Move to recycle bin"
                            className="p-2 text-gray-800 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                            <Trash2 size={14} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onOpen(book.id); }}
                            className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-orange-500/15 text-gray-400 hover:text-orange-300 border border-white/[0.07] hover:border-orange-500/25 rounded-xl text-sm font-medium transition-all duration-200"
                        >
                            <PenLine size={13} />
                            Open writer
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// ─── New Book Modal ────────────────────────────────────────────────────────────
const NewBookModal = ({ onClose }: { onClose: () => void }) => {
    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const API_URL = `${getApiBase()}/books`;

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || submitting) return;
        setSubmitting(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ title: title.trim(), genre: genre.trim() }),
            });
            if (!res.ok) throw new Error();
            const book = await res.json();
            toast.success('Book created!');
            onClose();
            navigate(`/admin/book-writer?bookId=${book.id}`);
        } catch {
            toast.error('Failed to create book');
            setSubmitting(false);
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-md bg-[#0a0a12] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden">

                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
                            <BookMarked size={15} className="text-orange-400" />
                        </div>
                        <h3 className="text-base font-bold text-white">New Book</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-600 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={17} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Title <span className="text-red-400 normal-case font-normal">*</span>
                        </label>
                        <input
                            required
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="The name of your book..."
                            className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-3 text-white text-sm focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all placeholder:text-gray-700"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Genre{' '}
                            <span className="text-gray-700 normal-case font-normal">(optional)</span>
                        </label>
                        {/* Predefined genre chips */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {[
                                'Fiction', 'Non-Fiction', 'Fantasy', 'Sci-Fi',
                                'Mystery', 'Thriller', 'Romance', 'Horror',
                                'Biography', 'Self-Help', 'History', 'Poetry',
                            ].map((g) => (
                                <button
                                    key={g}
                                    type="button"
                                    onClick={() => setGenre(genre === g ? '' : g)}
                                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                                        genre === g
                                            ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                                            : 'bg-white/[0.03] border-white/[0.08] text-gray-500 hover:text-gray-300 hover:border-white/20'
                                    }`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                        {/* Custom genre input */}
                        <input
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            placeholder="Or type a custom genre..."
                            className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-3 text-white text-sm focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all placeholder:text-gray-700"
                        />
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !title.trim()}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-400 text-black disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {submitting
                                ? <><Loader2 size={14} className="animate-spin" /> Creating...</>
                                : <><Plus size={14} /> Create Book</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

// ─── BooksLibrary ─────────────────────────────────────────────────────────────
const BooksLibrary = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'library' | 'recycle_bin'>('library');
    const [bookToDelete, setBookToDelete] = useState<string | null>(null);
    const [bookToHardDelete, setBookToHardDelete] = useState<string | null>(null);
    const navigate = useNavigate();
    const API_URL = `${getApiBase()}/books`;

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(API_URL);
                if (!res.ok) throw new Error();
                setBooks(await res.json());
            } catch {
                toast.error('Failed to load books');
            } finally {
                setLoading(false);
            }
        })();
    }, [API_URL]);

    // Delete book
    const handleDelete = (bookId: string) => {
        setBookToDelete(bookId);
    };

    const confirmDelete = async () => {
        const bookId = bookToDelete;
        if (!bookId) return;
        try {
            const token = await auth.currentUser?.getIdToken();
            await fetch(`${API_URL}/${bookId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setBooks(prev => prev.map(b => b.id === bookId ? { ...b, isDeleted: true } : b));
            toast.success('Book moved to recycle bin');
        } catch {
            toast.error('Failed to delete book');
        } finally {
            setBookToDelete(null);
        }
    };

    const confirmHardDelete = async () => {
        const bookId = bookToHardDelete;
        if (!bookId) return;
        try {
            const token = await auth.currentUser?.getIdToken();
            await fetch(`${API_URL}/${bookId}?hard=true`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setBooks(prev => prev.filter(b => b.id !== bookId));
            toast.success('Book permanently deleted');
        } catch {
            toast.error('Failed to delete book');
        } finally {
            setBookToHardDelete(null);
        }
    };

    const handleRestore = async (bookId: string) => {
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch(`${API_URL}/${bookId}/restore`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
            setBooks(prev => prev.map(b => b.id === bookId ? { ...b, isDeleted: false } : b));
            toast.success('Book restored');
        } catch {
            toast.error('Failed to restore book');
        }
    };

    const activeBooks = books.filter(b => !b.isDeleted);
    const deletedBooks = books.filter(b => b.isDeleted);
    const displayedBooks = activeTab === 'library' ? activeBooks : deletedBooks;

    // Aggregate stats
    const totalWords = activeBooks.reduce((s, b) => s + (b.wordCount || 0), 0);
    const published  = activeBooks.filter(b => b.status === 'published').length;
    const inProgress = activeBooks.filter(b => b.status === 'in_progress').length;

    return (
        <div className="flex-1 flex flex-col p-6 sm:p-10 ml-0 sm:ml-[80px]">
            <div className="max-w-[1400px] w-full mx-auto">
                <div className="flex items-start justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/admin"
                            className="p-2 text-gray-600 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
                                <Library className="text-orange-400" size={24} />
                                Books Library
                            </h1>
                            <p className="text-xs text-gray-600 mt-0.5">
                                Manage and write your books
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setActiveTab('library')}
                            className={clsx(
                                "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                                activeTab === 'library'
                                    ? "bg-white/10 text-white"
                                    : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.05]"
                            )}
                        >
                            Library
                        </button>
                        <button
                            onClick={() => setActiveTab('recycle_bin')}
                            className={clsx(
                                "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                                activeTab === 'recycle_bin'
                                    ? "bg-red-500/10 text-red-400"
                                    : "text-gray-500 hover:text-red-400/70 hover:bg-red-500/[0.05]"
                            )}
                        >
                            <Trash2 size={16} />
                            Recycle Bin ({deletedBooks.length})
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-black px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex-shrink-0 ml-2"
                        >
                            <Plus size={17} />
                            New Book
                        </button>
                    </div>
                </div>

                {!loading && activeBooks.length > 0 && activeTab === 'library' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                        {[
                            { icon: BookOpen,    label: 'Total',       value: activeBooks.length,            sub: 'books' },
                            { icon: Type,        label: 'Words',       value: fmtWords(totalWords),    sub: 'written' },
                            { icon: TrendingUp,  label: 'In Progress', value: inProgress,              sub: 'books' },
                            { icon: FileText,    label: 'Published',   value: published,               sub: 'books' },
                        ].map(({ icon: Icon, label, value }) => (
                            <div
                                key={label}
                                className="bg-white/[0.025] border border-white/[0.06] rounded-xl px-4 py-4 flex items-center gap-3"
                            >
                                <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                                    <Icon size={16} className="text-gray-500" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-white leading-tight">{value}</div>
                                    <div className="text-[10px] text-gray-600 uppercase tracking-wide">
                                        {label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : displayedBooks.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-28 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
                            {activeTab === 'recycle_bin' ? <Trash2 size={30} className="text-gray-700" /> : <BookOpen size={30} className="text-gray-700" />}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">
                            {activeTab === 'recycle_bin' ? 'Recycle bin is empty' : 'No books yet'}
                        </h3>
                        <p className="text-sm text-gray-600 max-w-xs mb-7 leading-relaxed">
                            {activeTab === 'recycle_bin'
                                ? 'Deleted books will appear here.'
                                : 'Start your writing journey. Create your first book and begin writing today.'}
                        </p>
                        {activeTab === 'library' && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600/15 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/25 hover:border-cyan-500/35 rounded-xl font-medium text-sm transition-all"
                            >
                                <Plus size={16} />
                                Create your first book
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {displayedBooks.map(book => (
                            <BookCard
                                key={book.id}
                                book={book}
                                onOpen={(id) => navigate(`/admin/book-writer?bookId=${id}`)}
                                onDelete={handleDelete}
                                onRestore={handleRestore}
                                onHardDelete={(id) => setBookToHardDelete(id)}
                                isDeleted={activeTab === 'recycle_bin'}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showModal && <NewBookModal onClose={() => setShowModal(false)} />}

            {/* Confirm: Delete book (Soft) */}
            <ConfirmModal
                isOpen={!!bookToDelete}
                onClose={() => setBookToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Book"
                message={`Are you sure you want to move "${books.find(b => b.id === bookToDelete)?.title ?? 'this book'}" to the recycle bin?`}
                isDestructive
            />
            {/* Confirm: Hard Delete book */}
            <ConfirmModal
                isOpen={!!bookToHardDelete}
                onClose={() => setBookToHardDelete(null)}
                onConfirm={confirmHardDelete}
                title="Permanently Delete Book"
                message={`Are you sure you want to permanently delete "${books.find(b => b.id === bookToHardDelete)?.title ?? 'this book'}"? All chapters and content will be permanently removed. This action cannot be undone.`}
                isDestructive
            />
        </div>
    );
};

export default BooksLibrary;
