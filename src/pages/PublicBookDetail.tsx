import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  Menu,
  X,
  BookOpen,
  Clock,
  Type,
  Settings,
  ChevronRight,
  AlertTriangle,
  PenLine,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSEO } from "../hooks/useSEO";
import clsx from "clsx";
import toast from "react-hot-toast";

const getApiBase = () =>
  import.meta.env.VITE_API_URL || "https://api-dp2f6yjbbq-el.a.run.app";

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  isDeleted?: boolean;
  status?: string;
  synopsis?: string;
}

interface Book {
  id: string;
  title: string;
  genre: string;
  status: string;
  wordCount: number;
  updatedAt: string;
  description?: string;
  coverImage?: string;
  chapters: Chapter[];
}

const countWords = (html: string) => {
  const t = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t ? t.split(" ").filter(Boolean).length : 0;
};

const PublicBookDetail = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const API_URL = `${getApiBase()}/books`;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  // Reader configuration
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [readerTheme, setReaderTheme] = useState<"light" | "dark" | "sepia">(
    () => (localStorage.getItem("reader-theme") as "light" | "dark" | "sepia") || "dark"
  );
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">(
    () => (localStorage.getItem("reader-fontsize") as "sm" | "md" | "lg" | "xl") || "md"
  );
  const [fontFamily, setFontFamily] = useState<"serif" | "sans" | "times">(
    () => (localStorage.getItem("reader-fontfamily") as "serif" | "sans" | "times") || "serif"
  );
  const [showSettings, setShowSettings] = useState(false);

  // References
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Auto load book
  useEffect(() => {
    if (!bookId) {
      navigate("/books");
      return;
    }

    (async () => {
      try {
        // Fetch public details
        const res = await fetch(`${API_URL}/${bookId}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Book not found");
          throw new Error();
        }
        const data: Book = await res.json();
        setBook(data);

        // Sort chapters by order
        const sortedChapters = (data.chapters ?? [])
          .filter((ch) => !ch.isDeleted)
          .sort((a, b) => a.order - b.order);

        // Check localStorage for bookmarked chapter
        const lastChapter = localStorage.getItem(`read-book-${bookId}-chapter`);
        const hasLastChapter = sortedChapters.some((c) => c.id === lastChapter);

        if (hasLastChapter && lastChapter) {
          setActiveChapterId(lastChapter);
        } else if (sortedChapters.length > 0) {
          setActiveChapterId(sortedChapters[0].id);
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to load book");
        navigate("/books");
      } finally {
        setLoading(false);
      }
    })();
  }, [bookId, API_URL, navigate]);

  // Handle saving bookmarks when chapter changes
  useEffect(() => {
    if (bookId && activeChapterId) {
      localStorage.setItem(`read-book-${bookId}-chapter`, activeChapterId);
      // Scroll reader content area to top
      if (contentAreaRef.current) {
        contentAreaRef.current.scrollTop = 0;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeChapterId, bookId]);

  // Auto-adjust responsive sidebar default on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize(); // call once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Copy, selection, contextmenu, keyboard shortcut, and printing protection for public users
  useEffect(() => {
    if (user) return; // Allow logged-in admin to do everything normally

    const preventDefault = (e: Event) => e.preventDefault();

    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = ["c", "a", "p", "s", "u"];
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;

      if (isCmdOrCtrl && keys.includes(e.key.toLowerCase())) {
        e.preventDefault();
        toast.error("Copying and printing are disabled for protection.", {
          id: "security-toast",
        });
        return false;
      }

      // Block F12 (Inspect Element)
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
      if (
        isCmdOrCtrl &&
        e.shiftKey &&
        ["i", "j", "c"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        return false;
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error("Copying text is disabled for protection.", {
        id: "security-toast",
      });
    };

    document.addEventListener("contextmenu", preventDefault);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", preventDefault);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [user]);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Save reader configurations to localStorage on change
  useEffect(() => {
    localStorage.setItem("reader-theme", readerTheme);
  }, [readerTheme]);

  useEffect(() => {
    localStorage.setItem("reader-fontsize", fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("reader-fontfamily", fontFamily);
  }, [fontFamily]);

  // Set SEO
  useSEO(
    book ? `${book.title} | Online Book Reader` : "Book Reader",
    book?.description || "Read books online for free.",
    "Online Reader, Book Chapters, Free novels, Ritik Kumar",
    book?.coverImage || "https://avatars.githubusercontent.com/u/96340458?v=4",
    window.location.href,
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-orange-400">
        <Loader2 className="animate-spin" size={32} />
        <p className="animate-pulse font-mono text-xs">
          Assembling chapters...
        </p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertTriangle className="text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-black orbitron mb-2 text-white">
          Book Not Found
        </h2>
        <p className="text-white text-sm max-w-sm mb-6">
          This publication is either not found, set to draft, or has been
          temporarily archived.
        </p>
        <Link
          to="/books"
          className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-semibold rounded-xl text-sm transition-all"
        >
          Return to Library
        </Link>
      </div>
    );
  }

  const sortedChapters = (book.chapters ?? [])
    .filter((ch) => !ch.isDeleted)
    .sort((a, b) => a.order - b.order);

  const activeChapterIndex = sortedChapters.findIndex(
    (c) => c.id === activeChapterId,
  );
  const activeChapter = sortedChapters[activeChapterIndex];

  const prevChapter =
    activeChapterIndex > 0 ? sortedChapters[activeChapterIndex - 1] : null;
  const nextChapter =
    activeChapterIndex < sortedChapters.length - 1
      ? sortedChapters[activeChapterIndex + 1]
      : null;

  const activeWords = activeChapter
    ? countWords(activeChapter.content || "")
    : 0;
  const activeReadTime = Math.max(1, Math.ceil(activeWords / 250));

  // Design tokens for reading canvas
  const themeCls = {
    light: "bg-[#f9f9fb] text-[#1e1e24] border-black/5",
    dark: "bg-[#090910] text-white border-white/[0.04]",
    sepia: "bg-[#f6ebd5] text-[#5c4938] border-[#ebd4b7]",
  }[readerTheme];

  const sidebarCls = {
    light: "bg-[#eeeeef] border-r border-black/[0.06] text-gray-800",
    dark: "bg-[#05050a] border-r border-white/[0.05] text-white",
    sepia: "bg-[#eddcb8] border-r border-[#ebd4b7] text-[#5c4938]",
  }[readerTheme];

  const fontStyle = {
    serif: "font-serif leading-[1.8] antialiased",
    sans: "font-sans leading-[1.7] antialiased",
    times: "leading-[1.8] antialiased",
  }[fontFamily];

  const fontSizes = {
    sm: "text-sm sm:text-base",
    md: "text-base sm:text-lg",
    lg: "text-lg sm:text-xl",
    xl: "text-xl sm:text-2xl",
  }[fontSize];

  return (
    <div
      className={clsx(
        "flex-1 flex min-h-[calc(100vh-4rem)] relative transition-colors duration-300",
        user ? "select-text" : "select-none",
        themeCls,
      )}
    >
      {!user && (
        <style>{`
          @media print {
            body {
              display: none !important;
            }
          }
        `}</style>
      )}
      {/* COLLAPSIBLE SIDEBAR: Table of Contents */}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-72 pt-16 lg:pt-0 flex flex-col transition-all duration-300 lg:top-16 lg:h-[calc(100vh-4rem)]",
          sidebarCls,
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:-translate-x-full lg:w-0",
        )}
      >
        <div className="p-5 flex items-center justify-between border-b border-white/[0.04] mt-1">
          <span className="text-xs font-black uppercase tracking-wider orbitron">
            Table of Contents
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className={clsx(
              "lg:hidden p-1 rounded transition-colors",
              readerTheme === "light"
                ? "hover:bg-black/5 text-gray-500 hover:text-black"
                : readerTheme === "sepia"
                  ? "hover:bg-black/5 text-[#5c4938] hover:text-[#332211]"
                  : "hover:bg-white/5 text-white hover:text-white"
            )}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
          <div className="pb-4 border-b border-white/[0.03] mb-4">
            <h4 className="text-xs font-bold text-orange-400 mb-1 truncate">
              {book.title}
            </h4>
            <span className={clsx(
              "text-[10px] block uppercase tracking-wider font-mono",
              readerTheme === "light"
                ? "text-gray-500"
                : readerTheme === "sepia"
                  ? "text-[#5c4938]/70"
                  : "text-white"
            )}>
              {book.genre || "Novel"} &bull; {sortedChapters.length} Chapters
            </span>
          </div>

          {sortedChapters.length === 0 ? (
            <p className={clsx(
              "text-xs italic p-2",
              readerTheme === "light"
                ? "text-gray-500"
                : readerTheme === "sepia"
                  ? "text-[#5c4938]/70"
                  : "text-white"
            )}>
              No chapters published yet.
            </p>
          ) : (
            sortedChapters.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => {
                  setActiveChapterId(ch.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={clsx(
                  "w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold transition-all flex items-start gap-2.5 cursor-pointer",
                  activeChapterId === ch.id
                    ? readerTheme === "light"
                      ? "bg-black/10 text-black"
                      : readerTheme === "sepia"
                        ? "bg-[#e2cb9a] text-[#332211]"
                        : "bg-white/10 text-orange-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    : "hover:bg-white/[0.03]",
                )}
              >
                <span className={clsx(
                  "font-mono text-[10px] pt-0.5",
                  readerTheme === "light"
                    ? "text-gray-600"
                    : readerTheme === "sepia"
                      ? "text-[#5c4938]/60"
                      : "text-white/40"
                )}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="truncate flex-1">
                  {ch.title || "Untitled Chapter"}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Backdrops for mobile drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden mt-16"
        />
      )}

      {/* MAIN READING AREA */}
      <div
        className={clsx(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          sidebarOpen ? "lg:pl-72" : "lg:pl-0",
        )}
        ref={contentAreaRef}
      >
        {/* TOOLBAR CONTROLS */}
        <div
          className={clsx(
            "sticky top-16 z-20 flex items-center justify-between px-6 py-3 border-b backdrop-blur-md",
            readerTheme === "light"
              ? "bg-[#f9f9fb]/90 border-black/[0.06]"
              : readerTheme === "sepia"
                ? "bg-[#f6ebd5]/90 border-[#ebd4b7]"
                : "bg-[#090910]/95 border-white/[0.05]",
          )}
        >
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Table of Contents"
              className={clsx(
                "p-2 rounded-xl transition-all cursor-pointer",
                readerTheme === "light"
                  ? "hover:bg-black/5 text-gray-700"
                  : readerTheme === "sepia"
                    ? "hover:bg-black/5 text-[#5c4938] hover:text-[#332211]"
                    : "hover:bg-white/5 text-white hover:text-white",
              )}
            >
              <Menu size={18} />
            </button>
            <Link
              to="/books"
              title="Go to Library"
              className={clsx(
                "flex items-center gap-1 text-xs font-semibold tracking-wider transition-colors",
                readerTheme === "light"
                  ? "text-gray-600 hover:text-black"
                  : readerTheme === "sepia"
                    ? "text-[#5c4938] hover:text-[#332211]"
                    : "text-white hover:text-white",
              )}
            >
              <ChevronLeft size={14} />
              Library
            </Link>
          </div>

          <div className="flex items-center gap-3 relative" ref={settingsRef}>
            {/* Admin Link */}
            {user && (
              <Link
                to={`/admin/book-writer?bookId=${book.id}${activeChapterId ? `&chapterId=${activeChapterId}` : ""}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-black rounded-xl text-xs font-bold transition-all"
              >
                <PenLine size={12} />
                Edit in Writer
              </Link>
            )}

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={clsx(
                "p-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer",
                showSettings
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  : readerTheme === "light"
                    ? "hover:bg-black/5 text-gray-600 border border-transparent"
                    : readerTheme === "sepia"
                      ? "hover:bg-black/5 text-[#5c4938] border border-transparent"
                      : "hover:bg-white/5 text-white hover:text-white border border-transparent",
              )}
            >
              <Settings size={17} />
            </button>

            {/* Settings Dropdown Popover */}
            {showSettings && (
              <div
                className={clsx(
                  "absolute right-0 top-full mt-2 z-50 p-5 rounded-2xl shadow-2xl border w-64 space-y-4",
                  readerTheme === "light"
                    ? "bg-[#f4f4f6] border-black/[0.08] text-gray-800"
                    : readerTheme === "sepia"
                      ? "bg-[#f0e2c6] border-[#ebd4b7] text-[#423223]"
                      : "bg-[#0d0d16] border-white/10 text-white",
                )}
              >
                {/* Theme Select */}
                <div>
                  <span className={clsx(
                    "block text-[10px] uppercase font-bold tracking-widest mb-2",
                    readerTheme === "light" ? "text-gray-500" : readerTheme === "sepia" ? "text-[#423223]/70" : "text-white"
                  )}>
                    Background
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      {
                        id: "light",
                        label: "Light",
                        bg: "bg-[#ffffff] text-black border-black/10",
                      },
                      {
                        id: "sepia",
                        label: "Sepia",
                        bg: "bg-[#fdf6e3] text-[#5b4a3a] border-[#e1d0b5]",
                      },
                      {
                        id: "dark",
                        label: "Dark",
                        bg: "bg-[#0c0c16] text-[#c0c0d8] border-white/10",
                      },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setReaderTheme(t.id as any)}
                        className={clsx(
                          "py-2 px-1 text-[11px] font-semibold border rounded-xl flex items-center justify-center transition-all cursor-pointer",
                          t.bg,
                          readerTheme === t.id &&
                            "ring-2 ring-orange-500 border-transparent scale-105",
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Selection */}
                <div>
                  <span className={clsx(
                    "block text-[10px] uppercase font-bold tracking-widest mb-2",
                    readerTheme === "light" ? "text-gray-500" : readerTheme === "sepia" ? "text-[#423223]/70" : "text-white"
                  )}>
                    Font Family
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setFontFamily("serif")}
                      className={clsx(
                        "py-1 rounded-lg border text-[11px] font-serif cursor-pointer",
                        fontFamily === "serif"
                          ? "border-orange-500 bg-orange-500/10 text-orange-400"
                          : "border-transparent hover:bg-white/5",
                      )}
                    >
                      Georgia
                    </button>
                    <button
                      onClick={() => setFontFamily("times")}
                      className={clsx(
                        "py-1 rounded-lg border text-[11px] font-serif cursor-pointer",
                        fontFamily === "times"
                          ? "border-orange-500 bg-orange-500/10 text-orange-400"
                          : "border-transparent hover:bg-white/5",
                      )}
                    >
                      Times
                    </button>
                    <button
                      onClick={() => setFontFamily("sans")}
                      className={clsx(
                        "py-1 rounded-lg border text-[11px] font-sans cursor-pointer",
                        fontFamily === "sans"
                          ? "border-orange-500 bg-orange-500/10 text-orange-400"
                          : "border-transparent hover:bg-white/5",
                      )}
                    >
                      Inter
                    </button>
                  </div>
                </div>

                {/* Font Size Selection */}
                <div>
                  <span className={clsx(
                    "block text-[10px] uppercase font-bold tracking-widest mb-2",
                    readerTheme === "light" ? "text-gray-500" : readerTheme === "sepia" ? "text-[#423223]/70" : "text-white"
                  )}>
                    Font Size
                  </span>
                  <div className="flex items-center justify-between bg-black/10 rounded-xl p-1">
                    {(["sm", "md", "lg", "xl"] as const).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setFontSize(sz)}
                        className={clsx(
                          "flex-1 py-1 rounded-lg text-xs font-black uppercase transition-all cursor-pointer",
                          fontSize === sz
                            ? "bg-orange-500 text-black shadow-md"
                            : readerTheme === "light"
                              ? "text-gray-500 hover:text-black"
                              : readerTheme === "sepia"
                                ? "text-[#423223]/70 hover:text-[#332211]"
                                : "text-white hover:text-white",
                        )}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CHAPTER READING PANEL */}
        <div className="flex-1 overflow-y-auto px-6 py-12 md:py-20 flex justify-center">
          <div className="w-full max-w-5xl flex flex-col min-h-full">
            {activeChapter ? (
              <>
                {/* Chapter metadata details */}
                <div className="mb-10 text-center pb-8 border-b border-current/10">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 orbitron font-bold">
                    {activeChapter.title || "Untitled Chapter"}
                  </h1>
                  <div className="flex items-center justify-center gap-4 text-xs font-mono opacity-60">
                    <span className="flex items-center gap-1">
                      <Type size={12} />
                      {activeWords} words
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {activeReadTime}m read
                    </span>
                  </div>
                </div>

                {/* Main Text Canvas */}
                <div
                  className={clsx(
                    "flex-1 mb-16 prose max-w-none focus:outline-none text-justify",
                    readerTheme === "dark" ? "prose-invert !text-white prose-p:!text-white prose-headings:!text-white prose-strong:!text-white prose-li:!text-white" : "prose-stone",
                    fontStyle,
                    fontSizes,
                  )}
                  style={{
                    fontFamily: fontFamily === "times" ? "'Times New Roman', Times, serif" : undefined
                  }}
                  dangerouslySetInnerHTML={{
                    __html:
                      activeChapter.content ||
                      '<p class="italic opacity-60">No content in this chapter.</p>',
                  }}
                />

                {/* Pagination controls */}
                <div className="flex items-center justify-between pt-8 border-t border-current/10 mt-auto">
                  {prevChapter ? (
                    <button
                      onClick={() => setActiveChapterId(prevChapter.id)}
                      className="group flex flex-col items-start gap-1 cursor-pointer text-left"
                    >
                      <span className="text-[10px] uppercase tracking-wider opacity-50 flex items-center gap-0.5 group-hover:-translate-x-0.5 transition-transform">
                        <ChevronLeft size={10} />
                        Previous Chapter
                      </span>
                      <span className="text-sm font-bold text-orange-400 group-hover:text-orange-300 transition-colors line-clamp-1 max-w-[180px] sm:max-w-xs">
                        {prevChapter.title || "Untitled"}
                      </span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {nextChapter ? (
                    <button
                      onClick={() => setActiveChapterId(nextChapter.id)}
                      className="group flex flex-col items-end gap-1 cursor-pointer text-right"
                    >
                      <span className="text-[10px] uppercase tracking-wider opacity-50 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Next Chapter
                        <ChevronRight size={10} />
                      </span>
                      <span className="text-sm font-bold text-orange-400 group-hover:text-orange-300 transition-colors line-clamp-1 max-w-[180px] sm:max-w-xs">
                        {nextChapter.title || "Untitled"}
                      </span>
                    </button>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] uppercase tracking-wider opacity-40">
                        FINISH
                      </span>
                      <span className="text-xs font-mono opacity-50">
                        You've reached the end
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center my-auto">
                <BookOpen
                  size={48}
                  className={clsx(
                    "mb-4 animate-pulse",
                    readerTheme === "light" ? "text-gray-500" : readerTheme === "sepia" ? "text-[#5c4938]/70" : "text-white"
                  )}
                />
                <h3 className={clsx(
                  "text-lg font-bold mb-1",
                  readerTheme === "light" ? "text-gray-900" : readerTheme === "sepia" ? "text-[#5c4938]" : "text-white"
                )}>
                  No Chapter Selected
                </h3>
                <p className={clsx(
                  "text-sm max-w-xs mb-6",
                  readerTheme === "light" ? "text-gray-500" : readerTheme === "sepia" ? "text-[#5c4938]/80" : "text-white"
                )}>
                  Please select a chapter from the sidebar table of contents to
                  begin reading.
                </p>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-semibold rounded-xl text-sm transition-all"
                >
                  Open Chapter Index
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBookDetail;
