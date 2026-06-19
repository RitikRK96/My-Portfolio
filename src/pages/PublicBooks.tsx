import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Search,
  Clock,
  Type,
  Loader2,
  Library,
  BookMarked,
} from "lucide-react";
import { useSEO } from "../hooks/useSEO";
import clsx from "clsx";

const getApiBase = () =>
  import.meta.env.VITE_API_URL || "https://api-dp2f6yjbbq-el.a.run.app";

interface Book {
  id: string;
  title: string;
  genre: string;
  status: string;
  wordCount: number;
  updatedAt: string;
  description?: string;
  coverImage?: string;
}

const fmtWords = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

const PublicBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const navigate = useNavigate();
  const API_URL = `${getApiBase()}/books`;

  useSEO(
    "Books Library | Ritik Kumar",
    "Browse and read my published books, stories, and writings online for free.",
    "Books, Writing, Novels, Stories, Ritik Kumar Portfolio, Read Online",
    "https://avatars.githubusercontent.com/u/96340458?v=4",
    window.location.href,
  );

  useEffect(() => {
    (async () => {
      try {
        // Fetch public published books only (unauthenticated call)
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error();
        setBooks(await res.json());
      } catch {
        console.error("Failed to load books");
      } finally {
        setLoading(false);
      }
    })();
  }, [API_URL]);

  // Get unique genres
  const genres = Array.from(new Set(books.map((b) => b.genre).filter(Boolean)));

  // Filter books
  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = !selectedGenre || b.genre === selectedGenre;
    const isPublished = b.status === "published";
    return matchesSearch && matchesGenre && isPublished;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-orange-400">
        <Loader2 className="animate-spin" size={36} />
        <p className="animate-pulse font-mono text-sm">
          Opening the library vaults...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] w-full mx-auto pb-24 px-4 sm:px-6 lg:px-8">
      {/* Header section with glow */}
      <div className="text-center mb-16 relative" data-aos="fade-down">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-24 bg-orange-500/10 blur-[80px] -z-10 rounded-full pointer-events-none" />

        <span className="inline-block text-orange-400 text-xs sm:text-sm orbitron tracking-[0.25em] mb-3 uppercase">
          &lt; Publications /&gt;
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black orbitron mb-4 leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-red-500">
            Published Books &amp; Stories
          </span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
          Dive into my literary worlds. From sci-fi universes to tech journals,
          read my completed novels and stories online.
        </p>
      </div>

      {/* Search and Filters */}
      <div
        className="max-w-4xl mx-auto mb-12 space-y-6"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books by title, genre, keywords..."
            className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-orange-500/40 rounded-2xl pl-12 pr-6 py-4 text-white text-sm outline-none transition-all placeholder:text-gray-600 focus:ring-1 focus:ring-orange-500/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
          />
        </div>

        {genres.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedGenre(null)}
              className={clsx(
                "px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer",
                !selectedGenre
                  ? "bg-orange-500/20 border-orange-500/40 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.15)]"
                  : "bg-white/[0.03] border-white/[0.08] text-gray-400 hover:text-white hover:border-white/20",
              )}
            >
              All Genres
            </button>
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() =>
                  setSelectedGenre(selectedGenre === genre ? null : genre)
                }
                className={clsx(
                  "px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer",
                  selectedGenre === genre
                    ? "bg-orange-500/20 border-orange-500/40 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.15)]"
                    : "bg-white/[0.03] border-white/[0.08] text-gray-400 hover:text-white hover:border-white/20",
                )}
              >
                {genre}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div
          className="text-center py-20 bg-white/[0.01] border border-white/[0.03] rounded-3xl max-w-4xl mx-auto px-6"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <Library className="text-gray-600 animate-pulse" size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-300 mb-1">
            No books found
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            We couldn't find any published books matching your current search
            criteria. Try adjusting your search query or genre filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full mx-auto">
          {filteredBooks.map((book, index) => {
            const readTime = Math.max(
              1,
              Math.ceil((book.wordCount || 0) / 250),
            );
            return (
              <div
                key={book.id}
                onClick={() => navigate(`/books/${book.id}`)}
                className="group bg-[#090912] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-orange-500/30 transition-all duration-300 flex flex-col hover:-translate-y-1.5 cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_36px_rgba(249,115,22,0.08)]"
                data-aos="fade-up"
                data-aos-delay={Math.min(index * 100, 400)}
              >
                {/* Book Cover Image or Placeholder */}
                <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-black to-[#0c0c16] flex items-center justify-center border-b border-white/[0.04]">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    /* Typography Cover Placeholder */
                    <div className="absolute inset-0 p-8 flex flex-col justify-between bg-gradient-to-br from-[#1b150f] via-[#0d090d] to-[#07070f]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.15),transparent_60%)]" />
                      <div className="flex items-center justify-between z-10">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-orange-400/70">
                          {book.genre || "LITERATURE"}
                        </span>
                        <BookOpen size={14} className="text-gray-700" />
                      </div>
                      <div className="my-auto z-10 pr-4">
                        <h2 className="text-xl font-black orbitron text-white leading-snug group-hover:text-orange-300 transition-colors duration-200">
                          {book.title}
                        </h2>
                      </div>
                      <div className="flex justify-between items-end z-10 border-t border-white/5 pt-4">
                        <span className="text-[9px] font-mono tracking-widest text-gray-600">
                          RITIK KUMAR
                        </span>
                        <span className="text-[10px] font-mono text-orange-400/40">
                          VOL. I
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-wider">
                      {book.genre || "Story"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-orange-400 transition-colors leading-snug">
                    {book.title}
                  </h3>
                  {book.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-5">
                      {book.description}
                    </p>
                  )}
                  <div className="mt-auto pt-4 border-t border-white/[0.04] flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Type size={11} />
                        {fmtWords(book.wordCount || 0)} words
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {readTime}m read
                      </span>
                    </div>
                    <button className="flex items-center gap-1 text-[11px] font-bold text-orange-400 group-hover:text-orange-300 transition-colors cursor-pointer">
                      Read Book
                      <BookMarked
                        size={12}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PublicBooks;
