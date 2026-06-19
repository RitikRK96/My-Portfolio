import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import TiptapLink from "@tiptap/extension-link";
import { Table as TiptapTable } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { auth } from "../firebase";
import {
  Loader2,
  Plus,
  ChevronLeft,
  GripVertical,
  Trash2,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  CheckCircle,
  BookOpen,
  Strikethrough,
  Code,
  Minus,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Clock,
  Underline as UnderlineIcon,
  Search,
  Printer,
  ZoomIn,
  ZoomOut,
  IndentDecrease as OutdentIcon,
  IndentIncrease as IndentIcon,
  X,
  ChevronDown,
  Replace,
  ChevronUp,
  CornerDownLeft,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Link2,
  Link2Off,
  LayoutGrid,
  Highlighter,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Timer,
  Target,
  Play,
  Pause,
  RotateCcw,
  Download,
  Copy,
  Bookmark,
  BookmarkPlus,
  Hash,
  Sun,
  Moon,
  Filter,
  Type as TypeIcon,
} from "lucide-react";
import {
  Link as RouterLink,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";
import clsx from "clsx";
import ConfirmModal from "../components/ConfirmModal";

const getApiBase = () =>
  import.meta.env.VITE_API_URL || "https://api-dp2f6yjbbq-el.a.run.app";

// ── Constants ─────────────────────────────────────────────────────────────────
const RULER_SIZE = 22;
const PAGE_GAP = 32;

const PAPER_SIZES = {
  A4: { width: 960, height: 1123 },
  Letter: { width: 990, height: 1280 },
  Legal: { width: 990, height: 1634 },
} as const;

const DENSITY_CONFIG = {
  compact: { padH: 24, padV: 16 },
  comfortable: { padH: 48, padV: 32 },
  spacious: { padH: 80, padV: 64 },
} as const;

const CANVAS_COLORS = {
  dark: "#1e1e2a",
  light: "#bbbbc8",
  sepia: "#b0a080",
} as const;

const PAGE_BG_COLORS = {
  white: "#ffffff",
  sepia: "#fdf6e3",
  gray: "#f5f5f5",
} as const;

const M_TOP = 80;
const M_BOTTOM = 80;
const M_LEFT = 90;
const M_RIGHT = 90;

const FONTS = [
  { label: "Times New Roman", value: '"Times New Roman", Times, serif' },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Palatino", value: '"Palatino Linotype", Palatino, serif' },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Calibri", value: "Calibri, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Courier New", value: '"Courier New", Courier, monospace' },
  { label: "Consolas", value: "Consolas, monospace" },
];
const FONT_SIZES = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72,
];
const LINE_SPACINGS = [
  { label: "Single", value: 1.15 },
  { label: "1.5", value: 1.5 },
  { label: "Double", value: 2.0 },
  { label: "2.5", value: 2.5 },
];

const TEXT_COLORS = [
  "#000000",
  "#374151",
  "#6B7280",
  "#9CA3AF",
  "#FFFFFF",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#DC2626",
  "#D97706",
  "#15803D",
  "#1D4ED8",
  "#7C3AED",
  "#BE185D",
  "#FCA5A5",
  "#FDE68A",
  "#A7F3D0",
  "#BFDBFE",
  "#DDD6FE",
  "#FBCFE8",
];
const HIGHLIGHT_COLORS = [
  "transparent",
  "#FEF08A",
  "#BBF7D0",
  "#BFDBFE",
  "#FCA5A5",
  "#DDD6FE",
  "#FDE68A",
  "#CFFAFE",
  "#FCE7F3",
  "#D1FAE5",
];
const CHAPTER_COLORS = [
  "#6B7280",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
];

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    dot: "#6B7280",
    bg: "bg-gray-500/15",
    text: "text-gray-400",
  },
  "in-progress": {
    label: "In Progress",
    dot: "#3B82F6",
    bg: "bg-blue-500/15",
    text: "text-blue-400",
  },
  done: {
    label: "Done",
    dot: "#22C55E",
    bg: "bg-green-500/15",
    text: "text-green-400",
  },
  "needs-revision": {
    label: "Needs Revision",
    dot: "#F59E0B",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
  },
  published: {
    label: "Published",
    dot: "#10B981",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
  },
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────
type PaperSize = "A4" | "Letter" | "Legal";
type Theme = "dark" | "light" | "sepia";
type PageColor = "white" | "sepia" | "gray";
type Density = "compact" | "comfortable" | "spacious";
type ChapterStatus = keyof typeof STATUS_CONFIG;

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  isDeleted?: boolean;
  status?: ChapterStatus;
  synopsis?: string;
  color?: string;
}
interface Book {
  id: string;
  title: string;
  chapters: Chapter[];
}
interface Bookmark {
  id: string;
  label: string;
  chapterId: string;
  scrollPos: number;
}
interface ChapterMeta {
  status: ChapterStatus;
  synopsis: string;
  color: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const countWords = (html: string) => {
  const t = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t ? t.split(" ").filter(Boolean).length : 0;
};
const countChars = (html: string) =>
  html.replace(/<[^>]*>/g, "").replace(/\s/g, "").length;
const countSentences = (html: string) => {
  const t = html.replace(/<[^>]*>/g, " ").trim();
  return (t.match(/[.!?]+/g) || []).length || (t ? 1 : 0);
};
const fmtWords = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

const syllableCount = (word: string): number => {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  let count = 0;
  let prevVowel = false;
  for (const ch of word) {
    const v = "aeiouy".includes(ch);
    if (v && !prevVowel) count++;
    prevVowel = v;
  }
  if (word.endsWith("e")) count--;
  return Math.max(1, count);
};

const getReadingLevel = (html: string): string => {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return "—";
  const sentences = Math.max(1, (text.match(/[.!?]+/g) || []).length);
  const syllables = words.reduce((s, w) => s + syllableCount(w), 0);
  const fre =
    206.835 -
    1.015 * (words.length / sentences) -
    84.6 * (syllables / words.length);
  if (fre >= 90) return "5th Gr.";
  if (fre >= 80) return "6th Gr.";
  if (fre >= 70) return "7th Gr.";
  if (fre >= 60) return "8–9th Gr.";
  if (fre >= 50) return "10–12th Gr.";
  if (fre >= 30) return "College";
  return "Graduate";
};

const htmlToMarkdown = (html: string): string =>
  html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
    .replace(/<u[^>]*>(.*?)<\/u>/gi, "__$1__")
    .replace(/<s[^>]*>(.*?)<\/s>/gi, "~~$1~~")
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, "> $1\n\n")
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
    .replace(/<hr[^>]*>/gi, "---\n\n")
    .replace(/<br[^>]*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const downloadBlob = (content: string, filename: string, mime: string) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Ruler: Horizontal ─────────────────────────────────────────────────────────
const HorizontalRuler = ({
  scrollLeft,
  zoom,
  contentWidth,
  pagePadH,
  paperSize,
}: {
  scrollLeft: number;
  zoom: number;
  contentWidth: number;
  pagePadH: number;
  paperSize: PaperSize;
}) => {
  const scale = zoom / 100;
  const inchPx = 96 * scale;
  const pageW = PAPER_SIZES[paperSize].width * scale;
  const marginL = M_LEFT * scale;
  const marginR = M_RIGHT * scale;

  const ticks: {
    x: number;
    type: "inch" | "half" | "quarter" | "small";
    label?: string;
  }[] = [];
  const step = inchPx / 8;
  for (let i = 0; i * step <= contentWidth + inchPx; i++) {
    const x = i * step;
    const isInch = i % 8 === 0;
    const isHalf = i % 4 === 0 && !isInch;
    const isQ = i % 2 === 0 && !isHalf && !isInch;
    ticks.push({
      x,
      type: isInch ? "inch" : isHalf ? "half" : isQ ? "quarter" : "small",
      label: isInch ? String(i / 8) : undefined,
    });
  }

  return (
    <div
      className="flex-shrink-0 bg-[#12121f] border-b border-white/[0.07] relative overflow-hidden select-none"
      style={{ height: RULER_SIZE }}
    >
      <div
        className="absolute top-0 bottom-0 bg-[#0a0a16]"
        style={{ left: pagePadH - scrollLeft, width: marginL }}
      />
      <div
        className="absolute top-0 bottom-0 bg-[#0a0a16]"
        style={{
          left: pagePadH - scrollLeft + pageW - marginR,
          width: marginR,
        }}
      />
      <div
        className="absolute top-0 bottom-0 w-px bg-cyan-500/40"
        style={{ left: pagePadH - scrollLeft + marginL }}
      />
      <div
        className="absolute top-0 bottom-0 w-px bg-cyan-500/40"
        style={{ left: pagePadH - scrollLeft + pageW - marginR }}
      />
      {ticks.map((t) => (
        <div
          key={t.x}
          className="absolute bottom-0"
          style={{ left: t.x - scrollLeft }}
        >
          <div
            className="absolute bottom-0 left-0 w-px"
            style={{
              height:
                t.type === "inch"
                  ? 13
                  : t.type === "half"
                    ? 9
                    : t.type === "quarter"
                      ? 6
                      : 4,
              background:
                t.type === "inch"
                  ? "rgba(255,255,255,0.45)"
                  : t.type === "half"
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(255,255,255,0.12)",
            }}
          />
          {t.label && t.label !== "0" && (
            <span
              className="absolute text-[8px] text-gray-600 font-mono"
              style={{ bottom: 12, left: 2, lineHeight: 1 }}
            >
              {t.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

// ── Ruler: Vertical ───────────────────────────────────────────────────────────
const VerticalRuler = ({
  scrollTop,
  zoom,
  height,
  pagePadV,
}: {
  scrollTop: number;
  zoom: number;
  height: number;
  pagePadV: number;
}) => {
  const scale = zoom / 100;
  const inchPx = 96 * scale;
  const step = inchPx / 8;
  const ticks: {
    y: number;
    type: "inch" | "half" | "quarter" | "small";
    label?: string;
  }[] = [];
  for (let i = 0; i * step <= height + inchPx; i++) {
    const y = i * step + pagePadV;
    const isInch = i % 8 === 0;
    const isHalf = i % 4 === 0 && !isInch;
    const isQ = i % 2 === 0 && !isHalf && !isInch;
    ticks.push({
      y,
      type: isInch ? "inch" : isHalf ? "half" : isQ ? "quarter" : "small",
      label: isInch ? String(i / 8) : undefined,
    });
  }
  return (
    <div
      className="flex-shrink-0 bg-[#12121f] border-r border-white/[0.07] relative overflow-hidden select-none"
      style={{ width: RULER_SIZE, minHeight: "100%" }}
    >
      {ticks.map((t) => (
        <div
          key={t.y}
          className="absolute right-0"
          style={{ top: t.y - scrollTop }}
        >
          <div
            className="absolute right-0 top-0 h-px"
            style={{
              width:
                t.type === "inch"
                  ? 13
                  : t.type === "half"
                    ? 9
                    : t.type === "quarter"
                      ? 6
                      : 4,
              background:
                t.type === "inch"
                  ? "rgba(255,255,255,0.45)"
                  : t.type === "half"
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(255,255,255,0.12)",
            }}
          />
          {t.label && t.label !== "0" && (
            <span
              className="absolute text-[8px] text-gray-600 font-mono"
              style={{ top: 2, right: 12, lineHeight: 1 }}
            >
              {t.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

// ── Ruler: Right ──────────────────────────────────────────────────────────────
const RightRuler = ({
  scrollTop,
  zoom,
  height,
  pagePadV,
}: {
  scrollTop: number;
  zoom: number;
  height: number;
  pagePadV: number;
}) => {
  const scale = zoom / 100;
  const inchPx = 96 * scale;
  const step = inchPx / 4;
  const ticks: { y: number; type: "inch" | "half" }[] = [];
  for (let i = 0; i * step <= height + inchPx; i++) {
    ticks.push({ y: i * step + pagePadV, type: i % 4 === 0 ? "inch" : "half" });
  }
  return (
    <div
      className="flex-shrink-0 bg-[#12121f] border-l border-white/[0.07] relative overflow-hidden select-none"
      style={{ width: RULER_SIZE, minHeight: "100%" }}
    >
      {ticks.map((t) => (
        <div
          key={t.y}
          className="absolute left-0"
          style={{ top: t.y - scrollTop }}
        >
          <div
            className="absolute left-0 top-0 h-px"
            style={{
              width: t.type === "inch" ? 10 : 6,
              background:
                t.type === "inch"
                  ? "rgba(255,255,255,0.3)"
                  : "rgba(255,255,255,0.1)",
            }}
          />
        </div>
      ))}
    </div>
  );
};

// ── Toolbar Atoms ─────────────────────────────────────────────────────────────
const TBtn = ({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
  size = "md",
  danger = false,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md";
  danger?: boolean;
}) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    disabled={disabled}
    title={title}
    className={clsx(
      "rounded transition-all duration-100 flex items-center justify-center flex-shrink-0",
      size === "sm" ? "p-1" : "p-1.5",
      active
        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
        : danger
          ? "text-red-500/70 hover:text-red-400 hover:bg-red-500/10 border border-transparent"
          : "text-gray-500 hover:text-white hover:bg-white/10 border border-transparent",
      disabled && "opacity-25 cursor-not-allowed pointer-events-none",
    )}
  >
    {children}
  </button>
);
const TDivider = () => (
  <div className="w-px h-4 bg-white/10 mx-0.5 flex-shrink-0" />
);

const TDropdown = ({
  value,
  options,
  onChange,
  width = 90,
  title,
}: {
  value: string;
  options: { label: string; value: string | number }[];
  onChange: (v: string) => void;
  width?: number;
  title?: string;
}) => (
  <div className="relative flex-shrink-0" title={title}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onMouseDown={(e) => e.stopPropagation()}
      className="appearance-none bg-white/[0.05] border border-white/[0.08] text-gray-300 text-xs rounded px-2 pr-5 h-7 cursor-pointer hover:border-white/20 transition-colors focus:outline-none focus:border-cyan-500/40"
      style={{ width }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-[#0d0d1a]">
          {o.label}
        </option>
      ))}
    </select>
    <ChevronDown
      size={10}
      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
    />
  </div>
);

// ── Color Swatch Popover ──────────────────────────────────────────────────────
const ColorSwatch = ({
  colors,
  onSelect,
  onClose,
  title,
  transparent = false,
}: {
  colors: string[];
  onSelect: (c: string | null) => void;
  onClose: () => void;
  title: string;
  transparent?: boolean;
}) => (
  <div
    className="absolute z-50 top-full mt-1 p-2.5 bg-[#0d0d1a] border border-white/10 rounded-xl shadow-2xl"
    style={{ width: 176 }}
    onMouseDown={(e) => e.stopPropagation()}
  >
    <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-2">
      {title}
    </p>
    <div className="grid grid-cols-8 gap-1">
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => {
            onSelect(c === "transparent" ? null : c);
            onClose();
          }}
          className={clsx(
            "w-4 h-4 rounded-sm border border-white/10 hover:scale-125 transition-transform",
            c === "transparent" && "relative overflow-hidden",
          )}
          style={{ backgroundColor: c === "transparent" ? "transparent" : c }}
          title={c}
        >
          {c === "transparent" && (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom right, transparent calc(50% - 0.5px), #ef4444 calc(50% - 0.5px), #ef4444 calc(50% + 0.5px), transparent calc(50% + 0.5px))",
              }}
            />
          )}
        </button>
      ))}
    </div>
    {transparent && (
      <button
        onClick={() => {
          onSelect(null);
          onClose();
        }}
        className="mt-2 w-full text-[10px] text-gray-600 hover:text-gray-300 transition-colors py-0.5 rounded hover:bg-white/5"
      >
        Clear
      </button>
    )}
  </div>
);

// ── Link Dialog ───────────────────────────────────────────────────────────────
const LinkDialog = ({
  editor,
  onClose,
}: {
  editor: ReturnType<typeof useEditor>;
  onClose: () => void;
}) => {
  const existing = editor?.getAttributes("link").href || "";
  const [url, setUrl] = useState(existing || "https://");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSet = () => {
    if (!editor) return;
    if (url && url !== "https://")
      editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
    else editor.chain().focus().unsetLink().run();
    onClose();
  };
  const handleRemove = () => {
    editor?.chain().focus().unsetLink().run();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onMouseDown={onClose}
    >
      <div
        className="bg-[#0d0d1a] border border-white/10 rounded-2xl p-5 w-80 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">
            Insert / Edit Link
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-300"
          >
            <X size={14} />
          </button>
        </div>
        <input
          ref={inputRef}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSet();
            if (e.key === "Escape") onClose();
          }}
          placeholder="https://..."
          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/40 mb-3 placeholder:text-gray-700"
        />
        <div className="flex gap-2">
          {existing && (
            <button
              onClick={handleRemove}
              className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg border border-red-500/20 transition-colors"
            >
              Remove
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-white/[0.05] hover:bg-white/10 text-gray-400 text-xs font-medium rounded-lg border border-white/[0.08] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSet}
            className="flex-1 py-2 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 text-xs font-medium rounded-lg border border-cyan-500/25 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Table Insert Popover ──────────────────────────────────────────────────────
const TableInsertPopover = ({
  editor,
  onClose,
}: {
  editor: ReturnType<typeof useEditor>;
  onClose: () => void;
}) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [hovered, setHovered] = useState<[number, number]>([3, 3]);

  const insert = (r: number, c: number) => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: r, cols: c, withHeaderRow: true })
      .run();
    onClose();
  };

  return (
    <div
      className="absolute z-50 top-full mt-1 p-3 bg-[#0d0d1a] border border-white/10 rounded-xl shadow-2xl"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-2">
        {hovered[0]}×{hovered[1]} Table
      </p>
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: "repeat(8, 1fr)" }}
      >
        {Array.from({ length: 8 * 8 }, (_, i) => {
          const r = Math.floor(i / 8) + 1;
          const c = (i % 8) + 1;
          const active = r <= hovered[0] && c <= hovered[1];
          return (
            <button
              key={i}
              className={clsx(
                "w-4 h-4 border rounded-sm transition-colors",
                active
                  ? "bg-cyan-500/40 border-cyan-500/60"
                  : "bg-white/[0.04] border-white/10 hover:bg-white/10",
              )}
              onMouseEnter={() => setHovered([r, c])}
              onClick={() => insert(r, c)}
            />
          );
        })}
      </div>
      <div className="flex gap-1.5 mt-2">
        <input
          type="number"
          min={1}
          max={20}
          value={rows}
          onChange={(e) => setRows(+e.target.value)}
          className="w-12 bg-white/[0.05] border border-white/[0.08] text-xs text-white rounded px-1.5 py-1 outline-none focus:border-cyan-500/40 text-center"
        />
        <span className="text-gray-600 text-xs self-center">×</span>
        <input
          type="number"
          min={1}
          max={20}
          value={cols}
          onChange={(e) => setCols(+e.target.value)}
          className="w-12 bg-white/[0.05] border border-white/[0.08] text-xs text-white rounded px-1.5 py-1 outline-none focus:border-cyan-500/40 text-center"
        />
        <button
          onClick={() => insert(rows, cols)}
          className="flex-1 px-2 py-1 bg-cyan-500/15 text-cyan-400 text-xs rounded border border-cyan-500/20 hover:bg-cyan-500/25 transition-colors"
        >
          Insert
        </button>
      </div>
    </div>
  );
};

// ── TOC Panel ─────────────────────────────────────────────────────────────────
const TOCPanel = ({
  editor,
  onClose,
  scrollAreaRef,
}: {
  editor: ReturnType<typeof useEditor>;
  onClose: () => void;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const headings = useMemo(() => {
    if (!editor) return [];
    const items: { level: number; text: string; pos: number }[] = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "heading") {
        items.push({ level: node.attrs.level, text: node.textContent, pos });
      }
    });
    return items;
  }, [editor?.state.doc]);

  const jumpTo = (pos: number) => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .setTextSelection(pos + 1)
      .run();
    try {
      const coords = editor.view.coordsAtPos(pos + 1);
      const el = scrollAreaRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const relY = coords.top - rect.top + el.scrollTop;
        el.scrollTo({ top: Math.max(0, relY - 80), behavior: "smooth" });
      }
    } catch {}
    onClose();
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 z-40 w-64 bg-[#09090f] border-l border-white/[0.06] flex flex-col shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <span className="text-xs font-semibold text-white">
          Table of Contents
        </span>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-300">
          <X size={13} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-white/10">
        {headings.length === 0 ? (
          <p className="text-[11px] text-gray-700 text-center py-8">
            No headings found.
            <br />
            Use H1 / H2 to create sections.
          </p>
        ) : (
          headings.map((h, i) => (
            <button
              key={i}
              onClick={() => jumpTo(h.pos)}
              className="w-full text-left py-1.5 px-2 rounded-lg hover:bg-white/[0.05] text-gray-400 hover:text-white transition-colors group flex items-center gap-2"
              style={{ paddingLeft: (h.level - 1) * 12 + 8 }}
            >
              <Hash
                size={9}
                className="text-gray-700 group-hover:text-cyan-500/60 flex-shrink-0"
              />
              <span
                className={clsx(
                  "text-xs leading-tight truncate",
                  h.level === 1
                    ? "font-semibold"
                    : h.level === 2
                      ? "font-medium"
                      : "font-normal",
                )}
              >
                {h.text}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

// ── Find & Replace Panel ──────────────────────────────────────────────────────
const FindReplacePanel = ({
  editor,
  onClose,
}: {
  editor: ReturnType<typeof useEditor>;
  onClose: () => void;
}) => {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [showReplace, setShowReplace] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [matchIdx, setMatchIdx] = useState(0);
  const findRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    findRef.current?.focus();
  }, []);

  const findMatches = useCallback(
    (term: string) => {
      if (!term || !editor) return [];
      const text = editor.getText();
      const positions: number[] = [];
      let idx = 0;
      const lower = text.toLowerCase();
      const tLower = term.toLowerCase();
      while ((idx = lower.indexOf(tLower, idx)) !== -1) {
        positions.push(idx);
        idx += term.length;
      }
      return positions;
    },
    [editor],
  );

  useEffect(() => {
    const m = findMatches(find);
    setMatchCount(m.length);
    setMatchIdx(m.length > 0 ? 1 : 0);
  }, [find, findMatches]);

  const doFind = (direction: 1 | -1) => {
    if (!editor || !find) return;
    const matches = findMatches(find);
    if (!matches.length) return;
    const newIdx = (matchIdx - 1 + direction + matches.length) % matches.length;
    setMatchIdx(newIdx + 1);
    editor
      .chain()
      .focus()
      .setTextSelection({
        from: matches[newIdx] + 1,
        to: matches[newIdx] + find.length + 1,
      })
      .run();
  };

  const doReplace = () => {
    if (!editor || !find) return;
    const { from, to } = editor.state.selection;
    if (
      editor.state.doc.textBetween(from, to).toLowerCase() ===
      find.toLowerCase()
    ) {
      editor.chain().focus().insertContent(replace).run();
    }
    doFind(1);
  };

  const doReplaceAll = () => {
    if (!editor || !find) return;
    const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    editor.commands.setContent(editor.getHTML().replace(regex, replace));
    toast.success("Replaced all occurrences");
    onClose();
  };

  return (
    <div className="flex flex-col gap-2 px-4 py-2.5 bg-[#0d0d1a] border-b border-white/[0.06] shadow-xl">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowReplace(!showReplace)}
          className="text-gray-500 hover:text-gray-300"
        >
          <ChevronDown
            size={12}
            className={clsx(
              "transition-transform",
              !showReplace && "-rotate-90",
            )}
          />
        </button>
        <div className="flex items-center gap-1.5 flex-1">
          <Search size={12} className="text-gray-600 flex-shrink-0" />
          <input
            ref={findRef}
            value={find}
            onChange={(e) => setFind(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") doFind(e.shiftKey ? -1 : 1);
              if (e.key === "Escape") onClose();
            }}
            placeholder="Find…"
            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded px-2.5 h-7 text-xs text-white outline-none focus:border-cyan-500/40 placeholder:text-gray-700"
          />
          <span className="text-[10px] text-gray-600 tabular-nums w-12 text-center flex-shrink-0">
            {find ? (matchCount ? `${matchIdx}/${matchCount}` : "0 found") : ""}
          </span>
          <TBtn onClick={() => doFind(-1)} title="Previous" size="sm">
            <ChevronUp size={13} />
          </TBtn>
          <TBtn onClick={() => doFind(1)} title="Next" size="sm">
            <ChevronDown size={13} />
          </TBtn>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-600 hover:text-gray-300"
        >
          <X size={13} />
        </button>
      </div>
      {showReplace && (
        <div className="flex items-center gap-1.5 pl-5">
          <Replace size={12} className="text-gray-600 flex-shrink-0" />
          <input
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") doReplace();
              if (e.key === "Escape") onClose();
            }}
            placeholder="Replace with…"
            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded px-2.5 h-7 text-xs text-white outline-none focus:border-cyan-500/40 placeholder:text-gray-700"
          />
          <button
            onClick={doReplace}
            className="px-2.5 h-7 bg-white/[0.05] hover:bg-white/10 border border-white/[0.08] text-xs text-gray-300 rounded transition-colors"
          >
            Replace
          </button>
          <button
            onClick={doReplaceAll}
            className="px-2.5 h-7 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-xs text-cyan-400 rounded transition-colors"
          >
            All
          </button>
        </div>
      )}
    </div>
  );
};

// ── Editor Toolbar ─────────────────────────────────────────────────────────────
const EditorToolbar = ({
  editor,
  zoom,
  setZoom,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  lineSpacing,
  setLineSpacing,
  showFind,
  setShowFind,
  theme,
  setTheme,
  density,
  setDensity,
  paperSize,
  setPaperSize,
  pageColor,
  setPageColor,
  zenMode,
  setZenMode,
  focusMode,
  setFocusMode,
  typewriterMode,
  setTypewriterMode,
  firstLineIndent,
  setFirstLineIndent,
  dropCap,
  setDropCap,
  showTOC,
  setShowTOC,
  pomodoroTime,
  pomodoroRunning,
  setPomodoroRunning,
  resetPomodoro,
  pomodoroMinutes,
  setPomodoroMinutes,
  wordGoal,
  setWordGoal,
  chapterWords,
  onExportTxt,
  onExportMd,
  onCopyClipboard,
  onExportChapterPdf,
  onExportBookPdf,
}: {
  editor: ReturnType<typeof useEditor>;
  zoom: number;
  setZoom: (n: number) => void;
  fontFamily: string;
  setFontFamily: (s: string) => void;
  fontSize: number;
  setFontSize: (n: number) => void;
  lineSpacing: number;
  setLineSpacing: (n: number) => void;
  showFind: boolean;
  setShowFind: (b: boolean) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  density: Density;
  setDensity: (d: Density) => void;
  paperSize: PaperSize;
  setPaperSize: (p: PaperSize) => void;
  pageColor: PageColor;
  setPageColor: (c: PageColor) => void;
  zenMode: boolean;
  setZenMode: (b: boolean) => void;
  focusMode: boolean;
  setFocusMode: (b: boolean) => void;
  typewriterMode: boolean;
  setTypewriterMode: (b: boolean) => void;
  firstLineIndent: boolean;
  setFirstLineIndent: (b: boolean) => void;
  dropCap: boolean;
  setDropCap: (b: boolean) => void;
  showTOC: boolean;
  setShowTOC: (b: boolean) => void;
  pomodoroTime: number;
  pomodoroRunning: boolean;
  setPomodoroRunning: (b: boolean) => void;
  resetPomodoro: () => void;
  pomodoroMinutes: number;
  setPomodoroMinutes: (n: number) => void;
  wordGoal: number;
  setWordGoal: (n: number) => void;
  chapterWords: number;
  onExportTxt: () => void;
  onExportMd: () => void;
  onCopyClipboard: () => void;
  onExportChapterPdf: () => void;
  onExportBookPdf: () => void;
}) => {
  const [openPicker, setOpenPicker] = useState<
    "color" | "highlight" | "tableInsert" | "export" | null
  >(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(wordGoal));
  const [editingPomodoro, setEditingPomodoro] = useState(false);
  const [pomodoroInput, setPomodoroInput] = useState(String(pomodoroMinutes));

  if (!editor) return null;

  const zoomStep = (dir: 1 | -1) => {
    const steps = [50, 60, 70, 75, 80, 90, 100, 110, 125, 150, 175, 200];
    const idx = steps.findIndex((z) => z >= zoom);
    setZoom(
      dir === 1
        ? steps[Math.min(idx + 1, steps.length - 1)]
        : steps[Math.max(idx - 2, 0)],
    );
  };

  const pMin = Math.floor(pomodoroTime / 60);
  const pSec = pomodoroTime % 60;
  const goalPct = Math.min(100, Math.round((chapterWords / wordGoal) * 100));

  return (
    <>
      {showLinkDialog && (
        <LinkDialog editor={editor} onClose={() => setShowLinkDialog(false)} />
      )}
      <div
        className="border-b border-white/[0.06] bg-[#09090f] flex-shrink-0"
        onMouseDown={() => setOpenPicker(null)}
      >
        {/* ── Row 1: History · Font · Formatting · Colors · Alignment · Lists · Indents · Elements ── */}
        <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-white/[0.04] flex-wrap">
          <TBtn
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo size={13} />
          </TBtn>
          <TBtn
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo size={13} />
          </TBtn>
          <TDivider />
          <TDropdown
            value={fontFamily}
            options={FONTS.map((f) => ({ label: f.label, value: f.value }))}
            onChange={setFontFamily}
            width={132}
            title="Font family"
          />
          <div className="w-1" />
          <TDropdown
            value={String(fontSize)}
            options={FONT_SIZES.map((s) => ({ label: String(s), value: s }))}
            onChange={(v) => setFontSize(Number(v))}
            width={56}
            title="Font size"
          />
          <TDivider />
          <TBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold"
          >
            <Bold size={13} />
          </TBtn>
          <TBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic"
          >
            <Italic size={13} />
          </TBtn>
          <TBtn
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Underline"
          >
            <UnderlineIcon size={13} />
          </TBtn>
          <TBtn
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough size={13} />
          </TBtn>
          <TBtn
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            title="Inline code"
          >
            <Code size={13} />
          </TBtn>
          <TBtn
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            active={editor.isActive("subscript")}
            title="Subscript"
          >
            <SubscriptIcon size={13} />
          </TBtn>
          <TBtn
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            active={editor.isActive("superscript")}
            title="Superscript"
          >
            <SuperscriptIcon size={13} />
          </TBtn>
          <TDivider />

          {/* Text Color */}
          <div
            className="relative flex-shrink-0"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <TBtn
              onClick={() =>
                setOpenPicker(openPicker === "color" ? null : "color")
              }
              active={openPicker === "color"}
              title="Text color"
            >
              <div className="flex flex-col items-center gap-0.5">
                <TypeIcon size={11} />
                <div
                  className="w-3 h-0.5 rounded-full"
                  style={{
                    backgroundColor:
                      editor.getAttributes("textStyle").color || "#ffffff",
                  }}
                />
              </div>
            </TBtn>
            {openPicker === "color" && (
              <ColorSwatch
                colors={TEXT_COLORS}
                title="Text Color"
                transparent
                onSelect={(c) =>
                  c
                    ? editor.chain().focus().setColor(c).run()
                    : editor.chain().focus().unsetColor().run()
                }
                onClose={() => setOpenPicker(null)}
              />
            )}
          </div>

          {/* Highlight */}
          <div
            className="relative flex-shrink-0"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <TBtn
              onClick={() =>
                setOpenPicker(openPicker === "highlight" ? null : "highlight")
              }
              active={openPicker === "highlight"}
              title="Highlight"
            >
              <Highlighter size={13} />
            </TBtn>
            {openPicker === "highlight" && (
              <ColorSwatch
                colors={HIGHLIGHT_COLORS}
                title="Highlight Color"
                transparent
                onSelect={(c) =>
                  c
                    ? editor.chain().focus().setHighlight({ color: c }).run()
                    : editor.chain().focus().unsetHighlight().run()
                }
                onClose={() => setOpenPicker(null)}
              />
            )}
          </div>

          {/* Link */}
          <TBtn
            onClick={() => setShowLinkDialog(true)}
            active={editor.isActive("link")}
            title="Insert / edit link"
          >
            <Link2 size={13} />
          </TBtn>
          {editor.isActive("link") && (
            <TBtn
              onClick={() => editor.chain().focus().unsetLink().run()}
              title="Remove link"
              danger
            >
              <Link2Off size={13} />
            </TBtn>
          )}
          <TDivider />

          {/* Alignment */}
          <TBtn
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            title="Align left"
          >
            <AlignLeft size={13} />
          </TBtn>
          <TBtn
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            title="Align center"
          >
            <AlignCenter size={13} />
          </TBtn>
          <TBtn
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
            title="Align right"
          >
            <AlignRight size={13} />
          </TBtn>
          <TBtn
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            active={editor.isActive({ textAlign: "justify" })}
            title="Justify"
          >
            <AlignJustify size={13} />
          </TBtn>
          <TDivider />

          {/* Lists */}
          <TBtn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet list"
          >
            <List size={13} />
          </TBtn>
          <TBtn
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Numbered list"
          >
            <ListOrdered size={13} />
          </TBtn>
          <TBtn
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Blockquote"
          >
            <Quote size={13} />
          </TBtn>
          <TBtn
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            title="Code block"
          >
            <span className="font-mono text-[10px]">{"{}"}</span>
          </TBtn>
          <TDivider />

          {/* Indent */}
          <TBtn
            onClick={() =>
              editor.chain().focus().liftListItem("listItem").run()
            }
            disabled={!editor.can().liftListItem("listItem")}
            title="Decrease indent"
          >
            <OutdentIcon size={13} />
          </TBtn>
          <TBtn
            onClick={() =>
              editor.chain().focus().sinkListItem("listItem").run()
            }
            disabled={!editor.can().sinkListItem("listItem")}
            title="Increase indent"
          >
            <IndentIcon size={13} />
          </TBtn>
          <TDivider />

          {/* Misc & Table */}
          <TBtn
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal rule"
          >
            <Minus size={13} />
          </TBtn>
          <TBtn
            onClick={() => editor.chain().focus().setHardBreak().run()}
            title="Hard break"
          >
            <CornerDownLeft size={13} />
          </TBtn>

          <div
            className="relative flex-shrink-0"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <TBtn
              onClick={() =>
                setOpenPicker(
                  openPicker === "tableInsert" ? null : "tableInsert",
                )
              }
              title="Insert table"
            >
              <LayoutGrid size={13} />
            </TBtn>
            {openPicker === "tableInsert" && (
              <TableInsertPopover
                editor={editor}
                onClose={() => setOpenPicker(null)}
              />
            )}
          </div>
        </div>

        {/* ── Row 2: Page Setup · Headings · Line Spacing · Zoom · Search · Views · Productivity · Export ── */}
        <div className="flex items-center gap-0.5 px-3 py-1.5 flex-wrap">
          {/* Paper size */}
          <TDropdown
            value={paperSize}
            options={[
              { label: "A4", value: "A4" },
              { label: "Letter", value: "Letter" },
              { label: "Legal", value: "Legal" },
            ]}
            onChange={(v) => setPaperSize(v as PaperSize)}
            width={68}
            title="Paper size"
          />
          {/* Page color */}
          <TDropdown
            value={pageColor}
            options={[
              { label: "White", value: "white" },
              { label: "Sepia", value: "sepia" },
              { label: "Gray", value: "gray" },
            ]}
            onChange={(v) => setPageColor(v as PageColor)}
            width={68}
            title="Page color"
          />
          {/* Density */}
          <TDropdown
            value={density}
            options={[
              { label: "Compact", value: "compact" },
              { label: "Normal", value: "comfortable" },
              { label: "Spacious", value: "spacious" },
            ]}
            onChange={(v) => setDensity(v as Density)}
            width={84}
            title="Layout density"
          />

          <TBtn
            onClick={() => setFirstLineIndent(!firstLineIndent)}
            active={firstLineIndent}
            title="First-line indent"
          >
            <IndentIcon size={13} />
          </TBtn>
          <TBtn
            onClick={() => setDropCap(!dropCap)}
            active={dropCap}
            title="Drop cap"
          >
            <span className="text-[11px] font-serif font-bold leading-none">
              Dc
            </span>
          </TBtn>
          <TDivider />

          {/* Headings & Line spacing */}
          <TBtn
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            active={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1 size={13} />
          </TBtn>
          <TBtn
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={13} />
          </TBtn>
          <TDropdown
            value={String(lineSpacing)}
            options={LINE_SPACINGS.map((l) => ({
              label: l.label,
              value: l.value,
            }))}
            onChange={(v) => setLineSpacing(Number(v))}
            width={74}
            title="Line spacing"
          />
          <TDivider />

          {/* Zoom */}
          <TBtn onClick={() => zoomStep(-1)} title="Zoom out">
            <ZoomOut size={13} />
          </TBtn>
          <span className="text-[11px] text-gray-500 tabular-nums w-9 text-center">
            {zoom}%
          </span>
          <TBtn onClick={() => zoomStep(1)} title="Zoom in">
            <ZoomIn size={13} />
          </TBtn>
          <TDivider />

          {/* Utilities & View modes */}
          <TBtn
            onClick={() => setShowFind(!showFind)}
            active={showFind}
            title="Find & Replace (Ctrl+F)"
          >
            <Search size={13} />
          </TBtn>
          <TBtn onClick={() => window.print()} title="Print">
            <Printer size={13} />
          </TBtn>
          <TBtn
            onClick={() => setShowTOC(!showTOC)}
            active={showTOC}
            title="Table of Contents"
          >
            <Hash size={13} />
          </TBtn>

          {/* Theme */}
          <TBtn
            onClick={() =>
              setTheme(
                theme === "dark"
                  ? "light"
                  : theme === "light"
                    ? "sepia"
                    : "dark",
              )
            }
            title={`Canvas theme: ${theme}`}
          >
            {theme === "dark" ? (
              <Moon size={13} />
            ) : theme === "light" ? (
              <Sun size={13} />
            ) : (
              <Eye size={13} />
            )}
          </TBtn>
          {/* Focus mode */}
          <TBtn
            onClick={() => setFocusMode(!focusMode)}
            active={focusMode}
            title="Focus mode — dim other paragraphs"
          >
            {focusMode ? <EyeOff size={13} /> : <Eye size={13} />}
          </TBtn>
          {/* Typewriter mode */}
          <TBtn
            onClick={() => setTypewriterMode(!typewriterMode)}
            active={typewriterMode}
            title="Typewriter scroll — keep cursor centered"
          >
            <span className="text-[10px] font-mono leading-none">↕</span>
          </TBtn>
          {/* Zen mode */}
          <TBtn
            onClick={() => setZenMode(!zenMode)}
            active={zenMode}
            title="Zen / distraction-free mode"
          >
            {zenMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </TBtn>
          <TDivider />

          {/* Pomodoro */}
          <Timer
            size={12}
            className={clsx(
              "flex-shrink-0",
              pomodoroRunning ? "text-amber-400" : "text-gray-700",
            )}
          />
          {editingPomodoro ? (
            <input
              autoFocus
              value={pomodoroInput}
              onChange={(e) => setPomodoroInput(e.target.value)}
              onBlur={() => {
                const val = Math.max(
                  1,
                  Math.min(180, parseInt(pomodoroInput) || 25),
                );
                setPomodoroMinutes(val);
                setEditingPomodoro(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = Math.max(
                    1,
                    Math.min(180, parseInt(pomodoroInput) || 25),
                  );
                  setPomodoroMinutes(val);
                  setEditingPomodoro(false);
                }
                if (e.key === "Escape") {
                  setEditingPomodoro(false);
                }
              }}
              className="w-10 bg-white/[0.05] border border-cyan-500/30 rounded px-1 py-0.5 text-[11px] text-white outline-none text-center font-mono"
            />
          ) : (
            <button
              onClick={() => {
                if (!pomodoroRunning) {
                  setPomodoroInput(String(pomodoroMinutes));
                  setEditingPomodoro(true);
                }
              }}
              disabled={pomodoroRunning}
              title={
                pomodoroRunning ? "Pomodoro running" : "Click to edit duration"
              }
              className={clsx(
                "text-[11px] tabular-nums font-mono w-10 text-center rounded transition-colors",
                pomodoroRunning
                  ? "text-amber-400"
                  : "text-gray-600 hover:text-white hover:bg-white/5 cursor-pointer",
              )}
            >
              {String(pMin).padStart(2, "0")}:{String(pSec).padStart(2, "0")}
            </button>
          )}
          <TBtn
            onClick={() => setPomodoroRunning(!pomodoroRunning)}
            title={pomodoroRunning ? "Pause" : "Start"}
            size="sm"
          >
            {pomodoroRunning ? <Pause size={11} /> : <Play size={11} />}
          </TBtn>
          <TBtn onClick={resetPomodoro} title="Reset pomodoro" size="sm">
            <RotateCcw size={11} />
          </TBtn>
          <TDivider />

          {/* Word goal */}
          <Target size={12} className="text-gray-700 flex-shrink-0" />
          {editingGoal ? (
            <input
              autoFocus
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onBlur={() => {
                setWordGoal(Math.max(1, parseInt(goalInput) || 1000));
                setEditingGoal(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setWordGoal(Math.max(1, parseInt(goalInput) || 1000));
                  setEditingGoal(false);
                }
              }}
              className="w-14 bg-white/[0.05] border border-cyan-500/30 rounded px-1.5 py-0.5 text-[11px] text-white outline-none text-center"
            />
          ) : (
            <button
              onClick={() => {
                setGoalInput(String(wordGoal));
                setEditingGoal(true);
              }}
              className="flex items-center gap-1 hover:bg-white/5 rounded px-1 py-0.5 transition-colors group"
            >
              <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    "h-full rounded-full transition-all duration-300",
                    goalPct >= 100 ? "bg-green-400" : "bg-cyan-500/60",
                  )}
                  style={{ width: `${goalPct}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-600 group-hover:text-gray-400">
                {goalPct}%
              </span>
            </button>
          )}
          <TDivider />

          {/* Export */}
          <div
            className="relative flex-shrink-0"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <TBtn
              onClick={() =>
                setOpenPicker(openPicker === "export" ? null : "export")
              }
              title="Export chapter"
            >
              <Download size={13} />
            </TBtn>
            {openPicker === "export" && (
              <div
                className="absolute z-50 top-full mt-1 right-0 py-1 bg-[#0d0d1a] border border-white/10 rounded-xl shadow-2xl min-w-[170px]"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <p className="text-[9px] text-gray-700 uppercase tracking-wider px-3.5 pt-2 pb-1">
                  Text
                </p>
                {[
                  {
                    label: "Copy as plain text",
                    icon: <Copy size={12} />,
                    action: () => {
                      onCopyClipboard();
                      setOpenPicker(null);
                    },
                  },
                  {
                    label: "Export as .txt",
                    icon: <FileText size={12} />,
                    action: () => {
                      onExportTxt();
                      setOpenPicker(null);
                    },
                  },
                  {
                    label: "Export as .md",
                    icon: <FileText size={12} />,
                    action: () => {
                      onExportMd();
                      setOpenPicker(null);
                    },
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
                <div className="h-px bg-white/[0.06] my-1 mx-2" />
                <p className="text-[9px] text-gray-700 uppercase tracking-wider px-3.5 pt-1 pb-1">
                  PDF / Print
                </p>
                {[
                  {
                    label: "Export chapter as PDF",
                    icon: <Printer size={12} />,
                    action: () => {
                      onExportChapterPdf();
                      setOpenPicker(null);
                    },
                  },
                  {
                    label: "Export full book PDF",
                    icon: <BookOpen size={12} />,
                    action: () => {
                      onExportBookPdf();
                      setOpenPicker(null);
                    },
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-cyan-400/80 hover:text-cyan-300 hover:bg-cyan-500/[0.07] transition-colors"
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ── Sortable Chapter Item ─────────────────────────────────────────────────────
const SortableChapterItem = ({
  id,
  chapter,
  isActive,
  index,
  onClick,
  onDelete,
  meta,
}: {
  id: string;
  chapter: Chapter;
  isActive: boolean;
  index: number;
  onClick: (c: Chapter) => void;
  onDelete: (id: string) => void;
  meta: ChapterMeta | undefined;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const status = (meta?.status || chapter.status || "draft") as ChapterStatus;
  // Guard: fall back to 'draft' config if status key is not recognised
  const sc = STATUS_CONFIG[status] ?? STATUS_CONFIG["draft"];
  const dotColor = meta?.color || chapter.color || CHAPTER_COLORS[0];

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={() => onClick(chapter)}
      className={clsx(
        "group flex items-center gap-1.5 px-2.5 py-2.5 rounded-xl border transition-all duration-150 cursor-pointer",
        isDragging && "opacity-40 scale-[0.98]",
        isActive
          ? "bg-cyan-500/10 border-cyan-500/25 text-white"
          : "border-transparent hover:bg-white/[0.04] text-gray-400 hover:text-gray-200 hover:border-white/[0.08]",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="cursor-grab active:cursor-grabbing p-0.5 opacity-0 group-hover:opacity-30 hover:!opacity-60 transition-opacity flex-shrink-0"
      >
        <GripVertical size={13} />
      </button>
      {/* Color dot */}
      <div
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: dotColor }}
      />
      <span
        className={clsx(
          "text-[10px] font-mono flex-shrink-0 w-4 text-center",
          isActive ? "text-cyan-400/50" : "text-gray-700",
        )}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate leading-tight">
          {chapter.title || "Untitled Chapter"}
        </p>
        <span className={clsx("text-[9px] font-medium", sc.text)}>
          {sc.label}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(chapter.id);
        }}
        className="p-0.5 opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-400 transition-all flex-shrink-0"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
};

// ── Page Break Overlay (FIXED) ────────────────────────────────────────────────
const PageBreakOverlay = ({
  pageCount,
  zoom,
  chapterTitle,
  bookTitle,
  fontFamily,
  paperSize,
  pageColor,
  canvasColor,
}: {
  pageCount: number;
  zoom: number;
  chapterTitle: string;
  bookTitle: string;
  fontFamily: string;
  paperSize: PaperSize;
  pageColor: PageColor;
  canvasColor: string;
}) => {
  const scale = zoom / 100;
  const paper = PAPER_SIZES[paperSize];
  const pageH = paper.height * scale;
  const marginTop = M_TOP * scale;
  const marginBottom = M_BOTTOM * scale;
  const marginLeft = M_LEFT * scale;
  const marginRight = M_RIGHT * scale;
  const footerFontSize = Math.max(9, 10 * scale);

  return (
    <>
      {Array.from({ length: pageCount }).map((_, i) => {
        const pageNum = i + 1;
        const headerTop = i * (pageH + PAGE_GAP);
        const footerTop = i * (pageH + PAGE_GAP) + pageH - marginBottom;
        const gapTop = i * (pageH + PAGE_GAP) + pageH;
        const isLast = pageNum === pageCount;

        return (
          <div key={pageNum}>
            {/* ── Page sheet background (Word style) ── */}
            <div
              className="absolute left-0 right-0 z-[-1] shadow-[0_4px_25px_rgba(0,0,0,0.18)] rounded-sm border border-black/5"
              style={{
                top: i * (pageH + PAGE_GAP),
                height: pageH,
                backgroundColor: PAGE_BG_COLORS[pageColor],
                pointerEvents: "none",
              }}
            />

            {/* ── Header line ── */}
            <div
              className="absolute left-0 right-0 z-20 flex items-center select-none"
              style={{
                top: headerTop,
                height: marginTop,
                paddingLeft: marginLeft,
                paddingRight: marginRight,
                backgroundColor: PAGE_BG_COLORS[pageColor],
                borderBottom: "1px solid #d1d5db",
                display: "flex",
                alignItems: "center",
                cursor: "default",
              }}
            >
              {/* Left spacer */}
              <span style={{ flex: 1 }} />
              {/* Book title centered */}
              <span
                style={{
                  fontSize: footerFontSize,
                  color: "#6b7280",
                  fontFamily,
                  fontStyle: "normal",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "60%",
                }}
              >
                {bookTitle || "Untitled Book"}
              </span>
              {/* Right spacer */}
              <span style={{ flex: 1 }} />
            </div>

            {/* ── Footer line ── */}
            {/* ── Footer line ── */}
            <div
              className="absolute left-0 right-0 z-20 flex items-center select-none"
              style={{
                top: footerTop,
                height: marginBottom,
                paddingLeft: marginLeft,
                paddingRight: marginRight,
                backgroundColor: PAGE_BG_COLORS[pageColor],
                borderTop: "1px solid #d1d5db",
                cursor: "default",
              }}
            >
              {/* Left spacer */}
              <span style={{ flex: 1 }} />
              {/* Chapter name centered */}
              <span
                style={{
                  fontSize: footerFontSize,
                  color: "#6b7280",
                  fontFamily,
                  fontStyle: "italic",
                  fontWeight: 500,
                  textAlign: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "50%",
                }}
              >
                {chapterTitle}
              </span>
              {/* Page number right */}
              <span
                style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}
              >
                <span
                  style={{
                    fontSize: footerFontSize,
                    color: "#6b7280",
                    fontFamily,
                    fontWeight: 700,
                  }}
                >
                  {pageNum}
                </span>
              </span>
            </div>

            {/* ── Page gap (not after last page) ── */}
            {!isLast && (
              <div
                className="absolute left-0 right-0 z-10 pointer-events-none"
                style={{ top: gapTop }}
              >
                <div style={{ height: PAGE_GAP, backgroundColor: canvasColor }}>
                  <div className="absolute inset-x-0 top-0 h-px bg-white/[0.08]" />
                  <div className="absolute inset-x-0 bottom-0 h-px bg-white/[0.08]" />
                  <div className="flex items-center justify-center h-full">
                    <div
                      className="h-px flex-1"
                      style={{
                        backgroundColor: `${PAGE_BG_COLORS[pageColor]}30`,
                      }}
                    />
                    <span className="px-2 text-[9px] text-white/20">
                      page {pageNum + 1}
                    </span>
                    <div
                      className="h-px flex-1"
                      style={{
                        backgroundColor: `${PAGE_BG_COLORS[pageColor]}30`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

// ── BookWriter ─────────────────────────────────────────────────────────────────
const BookWriter = () => {
  // ── Core state ───────────────────────────────────────────────────────────
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [creatingChapter, setCreatingChapter] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<string | null>(null);
  const [chapterToHardDelete, setChapterToHardDelete] = useState<string | null>(
    null,
  );
  const [sidebarTab, setSidebarTab] = useState<
    "chapters" | "recycle_bin" | "bookmarks"
  >("chapters");
  const [chapterSearch, setChapterSearch] = useState("");
  const [pageCount, setPageCount] = useState(1);

  // ── Editor config ─────────────────────────────────────────────────────────
  const [zoom, setZoom] = useState(100);
  const [fontFamily, setFontFamily] = useState(FONTS[0].value);
  const [fontSize, setFontSize] = useState(12);
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [showFind, setShowFind] = useState(false);

  // ── Appearance ────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("bw-theme") as Theme) || "dark",
  );
  const [density, setDensity] = useState<Density>(
    () => (localStorage.getItem("bw-density") as Density) || "comfortable",
  );
  const [pageColor, setPageColor] = useState<PageColor>("white");
  const [paperSize, setPaperSize] = useState<PaperSize>("A4");

  // ── View modes ────────────────────────────────────────────────────────────
  const [zenMode, setZenMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [typewriterMode, setTypewriterMode] = useState(false);
  const [firstLineIndent, setFirstLineIndent] = useState(false);
  const [dropCap, setDropCap] = useState(false);
  const [showTOC, setShowTOC] = useState(false);

  // ── Productivity ──────────────────────────────────────────────────────────
  const [wordGoal, setWordGoal] = useState(() =>
    parseInt(localStorage.getItem("bw-wordgoal") || "1000"),
  );
  const [pomodoroMinutes, setPomodoroMinutes] = useState(() =>
    parseInt(localStorage.getItem("bw-pomodoro-min") || "25"),
  );
  const [pomodoroTime, setPomodoroTime] = useState(pomodoroMinutes * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);

  const [settingsExpanded, setSettingsExpanded] = useState(() => {
    return localStorage.getItem("bw-sidebar-expanded") !== "false";
  });

  // ── Navigation ────────────────────────────────────────────────────────────
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("bw-bookmarks") || "[]");
    } catch {
      return [];
    }
  });

  // ── Refs ──────────────────────────────────────────────────────────────────
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const bookIdRef = useRef<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const editorDomRef = useRef<HTMLDivElement>(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookId = searchParams.get("bookId");
  const API_URL = `${getApiBase()}/books`;

  useEffect(() => {
    activeIdRef.current = activeChapterId;
  }, [activeChapterId]);
  useEffect(() => {
    bookIdRef.current = bookId;
  }, [bookId]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem("bw-theme", theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("bw-density", density);
  }, [density]);
  useEffect(() => {
    localStorage.setItem("bw-wordgoal", String(wordGoal));
  }, [wordGoal]);
  useEffect(() => {
    localStorage.setItem("bw-bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);
  useEffect(() => {
    localStorage.setItem("bw-pomodoro-min", String(pomodoroMinutes));
  }, [pomodoroMinutes]);
  useEffect(() => {
    localStorage.setItem("bw-sidebar-expanded", String(settingsExpanded));
  }, [settingsExpanded]);
  useEffect(() => {
    if (!pomodoroRunning) {
      setPomodoroTime(pomodoroMinutes * 60);
    }
  }, [pomodoroMinutes, pomodoroRunning]);

  const activeChapter = chapters.find((c) => c.id === activeChapterId) ?? null;

  // ── Derived layout values ─────────────────────────────────────────────────
  const densityCfg = DENSITY_CONFIG[density];
  const paper = PAPER_SIZES[paperSize];
  const scale = zoom / 100;
  const pageWidthPx = paper.width * scale;
  const pageHeightPx = paper.height * scale;
  const scrollAreaW = pageWidthPx + densityCfg.padH * 2;
  const canvasColor = CANVAS_COLORS[theme];

  // Compute page count dynamically based on inner editor content height
  useEffect(() => {
    const el = editorDomRef.current;
    if (!el) return;
    const compute = () => {
      const editorEl = el.querySelector(".prose-editor") as HTMLElement;
      if (editorEl) {
        const children = Array.from(editorEl.children) as HTMLElement[];

        // 1. Clear previous custom margins to measure natural layout
        children.forEach((child) => {
          if (child.style.marginTop) {
            child.style.marginTop = "";
          }
        });

        // 2. Measure positions relative to the outer padded container (editorDomRef)
        //    so item.top is in the same coordinate space as pageHeightPx.
        //    editorEl (.prose-editor / ProseMirror) starts at M_TOP*scale inside editorDomRef.
        const outerTop = el.getBoundingClientRect().top;
        const items = children.map((child) => {
          const rect = child.getBoundingClientRect();
          return {
            top: rect.top - outerTop, // absolute from top of page (incl. header zone)
            height: rect.height,
          };
        });

        // Content zone per page: from M_TOP to (pageHeightPx - M_BOTTOM)
        const contentStart = M_TOP * scale; // where text begins on each page
        const contentEnd = pageHeightPx - M_BOTTOM * scale; // where footer begins

        // 3. Compute margins
        const margins = new Array(children.length).fill(0);
        let currentPage = 1;
        let totalShift = 0;

        items.forEach((item, idx) => {
          // Position of this item on its current page
          const pageBase = (currentPage - 1) * (pageHeightPx + PAGE_GAP);
          const itemBottom = item.top + item.height + totalShift;

          // If the bottom of this item hits or passes the footer zone, push to next page
          if (idx > 0 && itemBottom > pageBase + contentEnd) {
            currentPage++;
            const nextPageContentTop =
              (currentPage - 1) * (pageHeightPx + PAGE_GAP) + contentStart;
            const marginTop = nextPageContentTop - (item.top + totalShift);
            margins[idx] = Math.max(0, marginTop);
            totalShift += margins[idx];
          } else {
            margins[idx] = 0;
          }
        });

        // 4. Apply custom margins in a single batch (only if they changed)
        children.forEach((child, idx) => {
          const customMargin = margins[idx];
          const expectedValue = customMargin > 0 ? `${customMargin}px` : "";
          if (child.style.marginTop !== expectedValue) {
            child.style.marginTop = expectedValue;
          }
        });

        setPageCount(currentPage);
      } else {
        setPageCount(Math.max(1, Math.ceil(el.scrollHeight / pageHeightPx)));
      }
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    const editorEl = el.querySelector(".prose-editor");
    if (editorEl) ro.observe(editorEl);
    return () => ro.disconnect();
  }, [editorDomRef, activeChapterId, zoom, pageHeightPx, scale]);

  // ── Load book ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!bookId) {
      navigate("/admin/books");
      return;
    }
    let cancelled = false;
    // Meta is now loaded from chapters
    (async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`${API_URL}/${bookId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        if (cancelled) return;
        setBook(data);
        const sorted = [...(data.chapters ?? [])].sort(
          (a: Chapter, b: Chapter) => a.order - b.order,
        );
        setChapters(sorted);
        const queryChapterId = searchParams.get("chapterId");
        const shouldCreateNew = searchParams.get("newChapter") === "true";
        if (shouldCreateNew) {
          // create a new chapter immediately after load (guard against StrictMode double-fire)
          setLoading(false);
          const token = await auth.currentUser?.getIdToken();
          const nonDeleted = sorted.filter((c: Chapter) => !c.isDeleted);
          const res2 = await fetch(`${API_URL}/${bookId}/chapters`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: `Chapter ${nonDeleted.length + 1}`,
              content: "",
              order: nonDeleted.length,
            }),
          });
          if (cancelled) return;
          if (res2.ok) {
            const newChapter: Chapter = await res2.json();
            setChapters((prev) => [...prev, newChapter]);
            setActiveChapterId(newChapter.id);
            toast.success("New chapter created");
          } else {
            if (sorted.length > 0) setActiveChapterId(sorted[0].id);
          }
          return;
        }
        if (
          queryChapterId &&
          sorted.some((c: Chapter) => c.id === queryChapterId)
        ) {
          setActiveChapterId(queryChapterId);
        } else if (sorted.length > 0) {
          setActiveChapterId(sorted[0].id);
        }
      } catch {
        if (cancelled) return;
        toast.error("Failed to load book");
        navigate("/admin/books");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookId]); // eslint-disable-line

  // ── TipTap Editor ─────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      Highlight.configure({ multicolor: true }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      TiptapTable.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Subscript,
      Superscript,
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose-editor focus:outline-none",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const id = activeIdRef.current;
      const bid = bookIdRef.current;
      if (!id || !bid) return;
      setChapters((prev) =>
        prev.map((c) => (c.id === id ? { ...c, content: html } : c)),
      );
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaveStatus("saving");
      saveTimerRef.current = setTimeout(async () => {
        try {
          const token = await auth.currentUser?.getIdToken();
          await fetch(`${API_URL}/${bid}/chapters/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content: html }),
          });
          setSaveStatus("saved");
        } catch {
          setSaveStatus("idle");
          toast.error("Auto-save failed", { id: "save-err" });
        }
      }, 1500);
    },
  });

  // ── Pomodoro ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!pomodoroRunning) return;
    const interval = setInterval(() => {
      setPomodoroTime((t) => {
        if (t <= 1) {
          setPomodoroRunning(false);
          toast.success("🍅 Pomodoro complete! Take a break.", {
            duration: 6000,
          });
          return pomodoroMinutes * 60;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pomodoroRunning, pomodoroMinutes]);

  const resetPomodoro = () => {
    setPomodoroRunning(false);
    setPomodoroTime(pomodoroMinutes * 60);
  };

  // ── Focus mode ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!editor) return;
    const updateFocus = () => {
      if (!editorDomRef.current) return;
      const container = editorDomRef.current;
      const blocks = Array.from(
        container.querySelectorAll("p, h1, h2, h3, h4, li, blockquote, pre"),
      );
      if (!focusMode) {
        blocks.forEach((b) => b.classList.remove("focus-highlighted"));
        return;
      }
      try {
        const { from } = editor.state.selection;
        const domNode = editor.view.domAtPos(from).node;
        let node: Node | null =
          domNode.nodeType === 3 ? domNode.parentElement : (domNode as Element);
        let focused: Element | null = null;
        while (node && node !== container) {
          if (blocks.includes(node as Element)) {
            focused = node as Element;
            break;
          }
          node = (node as Element).parentElement;
        }
        blocks.forEach((b) =>
          b === focused
            ? b.classList.add("focus-highlighted")
            : b.classList.remove("focus-highlighted"),
        );
      } catch {}
    };
    editor.on("selectionUpdate", updateFocus);
    editor.on("update", updateFocus);
    return () => {
      editor.off("selectionUpdate", updateFocus);
      editor.off("update", updateFocus);
    };
  }, [focusMode, editor]);

  // ── Typewriter scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!typewriterMode || !editor) return;
    const scroll = () => {
      try {
        const { from } = editor.state.selection;
        const coords = editor.view.coordsAtPos(from);
        const el = scrollAreaRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const relY = coords.top - rect.top + el.scrollTop;
        el.scrollTo({
          top: Math.max(0, relY - el.clientHeight / 2 + 20),
          behavior: "smooth",
        });
      } catch {}
    };
    editor.on("selectionUpdate", scroll);
    return () => {
      editor.off("selectionUpdate", scroll);
    };
  }, [typewriterMode, editor]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!editor) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        editor.chain().focus().undo().run();
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        editor.chain().focus().redo().run();
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        editor.chain().focus().redo().run();
      }
      if (mod && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setShowFind(true);
      }
      if (e.key === "Escape" && zenMode) {
        setZenMode(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editor, zenMode]);

  // ── Sync editor on chapter switch ─────────────────────────────────────────
  useEffect(() => {
    if (!editor || !activeChapter) return;
    editor.commands.setContent(activeChapter.content || "", {
      emitUpdate: false,
    } as any);
  }, [activeChapterId]); // eslint-disable-line

  // ── Scroll sync ───────────────────────────────────────────────────────────
  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const onScroll = () => {
      setScrollLeft(el.scrollLeft);
      setScrollTop(el.scrollTop);
      const max = el.scrollHeight - el.clientHeight;
      setScrollProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // ── Title change ──────────────────────────────────────────────────────────
  const handleTitleChange = (value: string) => {
    const id = activeChapterId;
    const bid = bookId;
    if (!id || !bid) return;
    setChapters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: value } : c)),
    );
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        await fetch(`${API_URL}/${bid}/chapters/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: value }),
        });
      } catch {}
    }, 800);
  };

  // ── Create chapter ────────────────────────────────────────────────────────
  const handleCreateChapter = async () => {
    if (!bookId || creatingChapter) return;
    setCreatingChapter(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_URL}/${bookId}/chapters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `Chapter ${chapters.length + 1}`,
          content: "",
          order: chapters.length,
        }),
      });
      if (!res.ok) throw new Error();
      const c: Chapter = await res.json();
      setChapters((prev) => [...prev, c]);
      setActiveChapterId(c.id);
      toast.success("Chapter created");
    } catch {
      toast.error("Failed to create chapter");
    } finally {
      setCreatingChapter(false);
    }
  };

  // ── Delete chapter ────────────────────────────────────────────────────────
  const confirmDeleteChapter = async () => {
    const chapterId = chapterToDelete;
    if (!chapterId) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`${API_URL}/${bookId}/chapters/${chapterId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setChapters((prev) => {
        const updated = prev.map((c) =>
          c.id === chapterId ? { ...c, isDeleted: true } : c,
        );
        if (activeChapterId === chapterId) {
          const rest = updated.filter((c) => !c.isDeleted);
          setActiveChapterId(rest[0]?.id ?? null);
        }
        return updated;
      });
      toast.success("Chapter moved to recycle bin");
    } catch {
      toast.error("Failed to move chapter to recycle bin");
    } finally {
      setChapterToDelete(null);
    }
  };

  const confirmHardDeleteChapter = async () => {
    const chapterId = chapterToHardDelete;
    if (!chapterId) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`${API_URL}/${bookId}/chapters/${chapterId}?hard=true`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setChapters((prev) => prev.filter((c) => c.id !== chapterId));
      toast.success("Chapter permanently deleted");
    } catch {
      toast.error("Failed to permanently delete chapter");
    } finally {
      setChapterToHardDelete(null);
    }
  };

  const handleRestoreChapter = async (chapterId: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(
        `${API_URL}/${bookId}/chapters/${chapterId}/restore`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error();
      setChapters((prev) =>
        prev.map((c) => (c.id === chapterId ? { ...c, isDeleted: false } : c)),
      );
      toast.success("Chapter restored");
    } catch {
      toast.error("Failed to restore chapter");
    }
  };

  // ── Drag and drop ─────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !bookId) return;
    const active_chapters = chapters.filter((c) => !c.isDeleted);
    const reordered = arrayMove(
      active_chapters,
      active_chapters.findIndex((c) => c.id === active.id),
      active_chapters.findIndex((c) => c.id === over.id),
    ).map((c, i) => ({ ...c, order: i }));
    const newChapters = chapters.map((c) =>
      c.isDeleted ? c : reordered.find((r) => r.id === c.id) || c,
    );
    setChapters(newChapters);
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`${API_URL}/${bookId}/chapters/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chapters: reordered.map((c) => ({ id: c.id, order: c.order })),
        }),
      });
    } catch {
      toast.error("Failed to save order");
    }
  };

  // ── Bookmarks ─────────────────────────────────────────────────────────────
  const addBookmark = () => {
    if (!activeChapterId || !scrollAreaRef.current) return;
    const label = `${activeChapter?.title || "Chapter"} — p.${Math.ceil(scrollAreaRef.current.scrollTop / pageHeightPx) + 1}`;
    const bm: Bookmark = {
      id: Date.now().toString(),
      label,
      chapterId: activeChapterId,
      scrollPos: scrollAreaRef.current.scrollTop,
    };
    setBookmarks((prev) => [...prev, bm]);
    toast.success("Bookmark added");
  };

  const jumpToBookmark = (bm: Bookmark) => {
    setActiveChapterId(bm.chapterId);
    setTimeout(() => {
      if (scrollAreaRef.current) scrollAreaRef.current.scrollTop = bm.scrollPos;
    }, 200);
  };

  const updateActiveChapterMeta = async (fields: Partial<ChapterMeta>) => {
    if (!activeChapterId || !bookId) return;
    setChapters((prev) =>
      prev.map((c) => (c.id === activeChapterId ? { ...c, ...fields } : c)),
    );
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`${API_URL}/${bookId}/chapters/${activeChapterId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(fields),
      });
    } catch {
      toast.error("Failed to save chapter settings");
    }
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const onExportTxt = () => {
    if (!activeChapter || !editor) return;
    downloadBlob(editor.getText(), `${activeChapter.title}.txt`, "text/plain");
  };
  const onExportMd = () => {
    if (!activeChapter || !editor) return;
    downloadBlob(
      `# ${activeChapter.title}\n\n${htmlToMarkdown(editor.getHTML())}`,
      `${activeChapter.title}.md`,
      "text/markdown",
    );
  };
  const onCopyClipboard = async () => {
    if (!editor) return;
    try {
      await navigator.clipboard.writeText(editor.getText());
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Copy failed");
    }
  };

  /** Open a popup with the backend-rendered chapter HTML, which auto-triggers print → Save as PDF */
  const onExportChapterPdf = async () => {
    if (!activeChapter || !bookId) {
      toast.error("No chapter selected");
      return;
    }
    try {
      const token = await auth.currentUser?.getIdToken();
      const url = `${API_URL}/${bookId}/chapters/${activeChapter.id}/export/html?token=${token}`;
      const w = window.open(
        url,
        "_blank",
        "width=900,height=700,menubar=yes,toolbar=yes",
      );
      if (!w) toast.error("Allow pop-ups to export PDF");
    } catch {
      toast.error("Failed to authenticate for export");
    }
  };

  /** Open a popup with the backend-rendered full book HTML (all chapters), triggers print → Save as PDF */
  const onExportBookPdf = async () => {
    if (!bookId) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const url = `${API_URL}/${bookId}/export/html?token=${token}`;
      const w = window.open(
        url,
        "_blank",
        "width=900,height=700,menubar=yes,toolbar=yes",
      );
      if (!w) toast.error("Allow pop-ups to export PDF");
    } catch {
      toast.error("Failed to authenticate for export");
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const activeChaptersList = chapters.filter((c) => !c.isDeleted);
  const deletedChaptersList = chapters.filter((c) => c.isDeleted);
  const filteredChapters = activeChaptersList.filter(
    (c) =>
      !chapterSearch ||
      c.title.toLowerCase().includes(chapterSearch.toLowerCase()),
  );

  const totalWords = activeChaptersList.reduce(
    (s, c) => s + countWords(c.content ?? ""),
    0,
  );
  const chapterWords =
    activeChapter && !activeChapter.isDeleted
      ? countWords(activeChapter.content ?? "")
      : 0;
  const chapterChars = activeChapter
    ? countChars(activeChapter.content ?? "")
    : 0;
  const chapterSents = activeChapter
    ? countSentences(activeChapter.content ?? "")
    : 0;
  const readLevel = activeChapter
    ? getReadingLevel(activeChapter.content ?? "")
    : "—";
  const readTime = Math.max(1, Math.ceil(totalWords / 250));

  const activeMeta = activeChapterId
    ? {
        status: activeChapter?.status || "draft",
        synopsis: activeChapter?.synopsis || "",
        color: activeChapter?.color || CHAPTER_COLORS[0],
      }
    : null;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-cyan-400" size={28} />
          <p className="text-gray-600 text-sm">Loading your book…</p>
        </div>
      </div>
    );

  // ── Global editor styles string ───────────────────────────────────────────
  const editorStyles = `
        .custom-editor-cursor {
            cursor: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='24'%20viewBox='0%200%2016%2024'%3E%3Cpath%20d='M4%202h8v2H9v16h3v2H4v-2h3V4H4V2z'%20fill='none'%20stroke='white'%20stroke-width='2'/%3E%3Cpath%20d='M4%202h8v2H9v16h3v2H4v-2h3V4H4V2z'%20fill='black'/%3E%3C/svg%3E") 8 12, text !important;
        }
        .prose-editor { outline: none !important; caret-color: #111827; color-scheme: light !important; }
        .prose-editor, .prose-editor * {
            cursor: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='24'%20viewBox='0%200%2016%2024'%3E%3Cpath%20d='M4%202h8v2H9v16h3v2H4v-2h3V4H4V2z'%20fill='none'%20stroke='white'%20stroke-width='2'/%3E%3Cpath%20d='M4%202h8v2H9v16h3v2H4v-2h3V4H4V2z'%20fill='black'/%3E%3C/svg%3E") 8 12, text !important;
        }
        .prose-editor > * + * { margin-top: 0.85em; }
        .prose-editor p {
            line-height: ${lineSpacing * 1.4};
            color: #374151;
            font-size: ${fontSize}pt;
            font-family: ${fontFamily};
            ${firstLineIndent ? "text-indent: 2em;" : ""}
        }
        .prose-editor p:first-child::first-letter {
            ${dropCap ? `font-size: ${fontSize * 3.5}pt; font-weight: 700; float: left; line-height: 0.8; padding-right: 4px; padding-top: 4px; font-family: ${fontFamily}; color: #111827;` : ""}
        }
        .prose-editor h1 { font-size: ${Math.round(fontSize * 2)}pt; font-weight: 700; color: #111827; margin-top: 2rem; margin-bottom: 0.5rem; font-family: ${fontFamily}; }
        .prose-editor h2 { font-size: ${Math.round(fontSize * 1.5)}pt; font-weight: 600; color: #1f2937; margin-top: 1.6rem; margin-bottom: 0.4rem; font-family: ${fontFamily}; }
        .prose-editor h3 { font-size: ${Math.round(fontSize * 1.2)}pt; font-weight: 600; color: #374151; margin-top: 1.3rem; margin-bottom: 0.3rem; font-family: ${fontFamily}; }
        .prose-editor blockquote { border-left: 3px solid #d1d5db; padding-left: 1.25rem; color: #6b7280; font-style: italic; margin: 1.5rem 0; }
        .prose-editor ul  { list-style: disc; padding-left: 1.75rem; }
        .prose-editor ol  { list-style: decimal; padding-left: 1.75rem; }
        .prose-editor li  { margin-bottom: 0.3rem; color: #374151; line-height: ${lineSpacing * 1.4}; font-family: ${fontFamily}; font-size: ${fontSize}pt; }
        .prose-editor code:not(pre code) { background: #f3f4f6; padding: 0.1em 0.4em; border-radius: 4px; font-size: 0.875em; color: #1f2937; border: 1px solid #e5e7eb; }
        .prose-editor pre { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 1rem 1.25rem; overflow-x: auto; margin: 1.5rem 0; }
        .prose-editor pre code { color: #374151; font-size: 0.875em; background: transparent; padding: 0; border: none; }
        .prose-editor hr   { border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
        .prose-editor strong { color: #111827; font-weight: 600; }
        .prose-editor em   { color: #374151; }
        .prose-editor s    { color: #9ca3af; }
        .prose-editor u    { text-decoration: underline; }
        .prose-editor a    { color: #3b82f6; text-decoration: underline; cursor: pointer; }
        .prose-editor a:hover { color: #2563eb; }
        .prose-editor table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
        .prose-editor td, .prose-editor th { border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; min-width: 60px; vertical-align: top; }
        .prose-editor th { background: #f9fafb; font-weight: 600; color: #111827; text-align: left; }
        .prose-editor .selectedCell:after { background: rgba(59,130,246,0.1); content: ''; display: block; left: 0; right: 0; top: 0; bottom: 0; pointer-events: none; position: absolute; z-index: 2; }
        .prose-editor ::selection { background: rgba(59,130,246,0.25); }

        /* Focus mode */
        .focus-mode .prose-editor p,
        .focus-mode .prose-editor h1,
        .focus-mode .prose-editor h2,
        .focus-mode .prose-editor h3,
        .focus-mode .prose-editor li,
        .focus-mode .prose-editor blockquote,
        .focus-mode .prose-editor pre { opacity: 0.2; transition: opacity 0.2s; }
        .focus-mode .prose-editor .focus-highlighted { opacity: 1 !important; }

        @media print {
            body > *:not(.print-area) { display: none !important; }
            .print-area { display: block !important; }
        }
    `;

  return (
    <div
      className={clsx(
        "flex h-[calc(100vh-64px)] w-full text-gray-200 overflow-hidden",
        zenMode && "fixed inset-0 z-50",
      )}
      style={{ backgroundColor: "#050505" }}
    >
      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      {!zenMode && (
        <aside
          className={clsx(
            "flex flex-col border-r border-white/[0.06] bg-[#07070e] transition-all duration-300 flex-shrink-0",
            sidebarOpen ? "w-[268px]" : "w-[52px]",
          )}
        >
          {/* Header */}
          <div
            className={clsx(
              "h-[52px] border-b border-white/[0.06] flex items-center",
              sidebarOpen ? "px-3 gap-2" : "flex-col justify-center gap-1 py-1",
            )}
          >
            <RouterLink
              to={`/admin/books/${bookId}`}
              title="Back to book details"
              className="p-1 text-gray-600 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            >
              <ChevronLeft size={sidebarOpen ? 16 : 14} />
            </RouterLink>
            {sidebarOpen ? (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate leading-tight">
                    {book?.title}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    {fmtWords(totalWords)} words · {activeChaptersList.length}{" "}
                    ch.
                  </p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  title="Collapse"
                  className="p-1 text-gray-700 hover:text-gray-400 transition-colors flex-shrink-0"
                >
                  <PanelLeftClose size={13} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setSidebarOpen(true)}
                title="Expand"
                className="p-1 text-gray-700 hover:text-gray-400 transition-colors mx-auto"
              >
                <PanelLeftOpen size={13} />
              </button>
            )}
          </div>

          {sidebarOpen && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Tab bar */}
              <div className="flex items-center gap-1 px-2 pt-3 pb-2 border-b border-white/[0.04]">
                {(["chapters", "recycle_bin", "bookmarks"] as const).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setSidebarTab(tab)}
                      className={clsx(
                        "flex-1 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded transition-colors",
                        sidebarTab === tab
                          ? tab === "recycle_bin"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-white/10 text-white"
                          : "text-gray-600 hover:text-gray-300",
                      )}
                    >
                      {tab === "chapters"
                        ? "Chapters"
                        : tab === "recycle_bin"
                          ? `Bin (${deletedChaptersList.length})`
                          : "🔖"}
                    </button>
                  ),
                )}
                <button
                  onClick={handleCreateChapter}
                  disabled={creatingChapter}
                  title="New chapter"
                  className="p-1.5 text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-colors rounded disabled:opacity-40 ml-1"
                >
                  {creatingChapter ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                </button>
              </div>

              {/* List area */}
              <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                {sidebarTab === "chapters" && (
                  <>
                    {/* Search */}
                    <div className="relative mb-2">
                      <Filter
                        size={10}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-700"
                      />
                      <input
                        value={chapterSearch}
                        onChange={(e) => setChapterSearch(e.target.value)}
                        placeholder="Filter chapters…"
                        className="w-full pl-7 pr-2 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs text-white outline-none focus:border-cyan-500/30 placeholder:text-gray-700"
                      />
                    </div>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={activeChaptersList.map((c) => c.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-0.5">
                          {filteredChapters.map((ch, i) => (
                            <SortableChapterItem
                              key={ch.id}
                              id={ch.id}
                              chapter={ch}
                              index={i}
                              isActive={activeChapterId === ch.id}
                              onClick={(c) => setActiveChapterId(c.id)}
                              onDelete={(id) => setChapterToDelete(id)}
                              meta={undefined}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                    {activeChaptersList.length === 0 && (
                      <div className="text-center py-10">
                        <FileText
                          size={22}
                          className="mx-auto text-gray-800 mb-3"
                        />
                        <p className="text-xs text-gray-700 mb-3">
                          No chapters yet
                        </p>
                        <button
                          onClick={handleCreateChapter}
                          className="text-xs text-cyan-600 hover:text-cyan-400 transition-colors"
                        >
                          + Add first chapter
                        </button>
                      </div>
                    )}
                  </>
                )}

                {sidebarTab === "recycle_bin" && (
                  <div className="space-y-0.5">
                    {deletedChaptersList.map((ch) => (
                      <div
                        key={ch.id}
                        className="group flex flex-col gap-1.5 px-2.5 py-2.5 rounded-xl border border-white/[0.04] bg-white/[0.02]"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-400 truncate">
                            {ch.title || "Untitled"}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setChapterToHardDelete(ch.id)}
                              title="Delete forever"
                              className="p-1 text-gray-600 hover:text-red-400 hover:bg-white/10 rounded transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                            <button
                              onClick={() => handleRestoreChapter(ch.id)}
                              title="Restore"
                              className="p-1 text-gray-600 hover:text-green-400 hover:bg-white/10 rounded transition-all"
                            >
                              <Clock size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {deletedChaptersList.length === 0 && (
                      <div className="text-center py-10 text-gray-600">
                        <Trash2
                          size={22}
                          className="mx-auto text-gray-800 mb-2"
                        />
                        <p className="text-xs">Recycle bin is empty</p>
                      </div>
                    )}
                  </div>
                )}

                {sidebarTab === "bookmarks" && (
                  <div className="space-y-0.5">
                    <button
                      onClick={addBookmark}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border border-dashed border-white/10 hover:border-cyan-500/30 text-gray-600 hover:text-cyan-400 transition-all text-xs mb-2"
                    >
                      <BookmarkPlus size={12} />
                      Add current position
                    </button>
                    {bookmarks
                      .filter(() => !activeChapterId || true)
                      .map((bm) => (
                        <div
                          key={bm.id}
                          className="group flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/[0.04] cursor-pointer border border-transparent hover:border-white/[0.06]"
                          onClick={() => jumpToBookmark(bm)}
                        >
                          <Bookmark
                            size={11}
                            className="text-amber-400/60 flex-shrink-0"
                          />
                          <span className="flex-1 text-xs text-gray-400 hover:text-white truncate">
                            {bm.label}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setBookmarks((prev) =>
                                prev.filter((b) => b.id !== bm.id),
                              );
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-700 hover:text-red-400 transition-all"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    {bookmarks.length === 0 && (
                      <div className="text-center py-8 text-gray-700">
                        <Bookmark size={20} className="mx-auto mb-2" />
                        <p className="text-xs">No bookmarks yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom panel: Chapter meta + stats */}
              {chapters.length > 0 && (
                <div className="border-t border-white/[0.04] flex-shrink-0 flex flex-col bg-[#07070e]">
                  {/* Collapsible content wrapper */}
                  <div
                    className={clsx(
                      "overflow-hidden transition-all duration-300 px-3",
                      settingsExpanded
                        ? "max-h-[500px] pt-3 pb-1"
                        : "max-h-0 pt-0 pb-0",
                    )}
                  >
                    {activeChapter && activeMeta && (
                      <div className="space-y-3">
                        {/* Chapter title */}
                        <div>
                          <p className="text-[9px] font-bold text-gray-700 uppercase tracking-[0.12em] mb-1">
                            Chapter title
                          </p>
                          <input
                            value={activeChapter.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500/40 placeholder:text-gray-700"
                            placeholder="Chapter title…"
                          />
                        </div>

                        {/* Status */}
                        <div>
                          <p className="text-[9px] font-bold text-gray-700 uppercase tracking-[0.12em] mb-1">
                            Status
                          </p>
                          <select
                            value={activeMeta.status}
                            onChange={(e) =>
                              updateActiveChapterMeta({
                                status: e.target.value as ChapterStatus,
                              })
                            }
                            className="w-full appearance-none bg-white/[0.04] border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500/40 cursor-pointer"
                          >
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                              <option
                                key={k}
                                value={k}
                                className="bg-[#0d0d1a]"
                              >
                                {v.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Color */}
                        <div>
                          <p className="text-[9px] font-bold text-gray-700 uppercase tracking-[0.12em] mb-1">
                            Chapter color
                          </p>
                          <div className="flex gap-1.5 flex-wrap">
                            {CHAPTER_COLORS.map((c) => (
                              <button
                                key={c}
                                onClick={() =>
                                  updateActiveChapterMeta({ color: c })
                                }
                                className={clsx(
                                  "w-4 h-4 rounded-full border-2 transition-all",
                                  activeMeta.color === c
                                    ? "border-white scale-110"
                                    : "border-transparent hover:scale-110",
                                )}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Synopsis */}
                        <div>
                          <p className="text-[9px] font-bold text-gray-700 uppercase tracking-[0.12em] mb-1">
                            Synopsis
                          </p>
                          <textarea
                            value={activeMeta.synopsis || ""}
                            onChange={(e) =>
                              updateActiveChapterMeta({
                                synopsis: e.target.value,
                              })
                            }
                            placeholder="Brief summary of this chapter…"
                            rows={3}
                            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500/40 placeholder:text-gray-700 resize-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-1.5 mt-3 mb-2">
                      {[
                        { label: "Ch.", value: activeChaptersList.length },
                        { label: "Words", value: fmtWords(chapterWords) },
                        { label: "Read", value: `${readTime}m` },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="text-center py-2 rounded-lg bg-white/[0.025]"
                        >
                          <div className="text-sm font-semibold text-gray-300">
                            {s.value}
                          </div>
                          <div className="text-[9px] text-gray-700 uppercase tracking-wide mt-0.5">
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Save status acting as collapse toggle */}
                  <button
                    type="button"
                    onClick={() => setSettingsExpanded(!settingsExpanded)}
                    className={clsx(
                      "w-full flex items-center justify-between px-3 py-2.5 text-[10px] font-medium transition-all duration-300 border-t border-white/[0.04] hover:bg-white/[0.02] cursor-pointer select-none",
                      saveStatus === "saving"
                        ? "text-amber-400/80"
                        : "text-green-500/60",
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {saveStatus === "saving" ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        <CheckCircle size={10} />
                      )}
                      <span>
                        {saveStatus === "saving"
                          ? "Saving changes…"
                          : "All changes saved"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <span className="text-[9px] uppercase tracking-wider">
                        {settingsExpanded ? "Collapse" : "Settings"}
                      </span>
                      <ChevronUp
                        size={10}
                        className={clsx(
                          "transition-transform duration-300",
                          !settingsExpanded && "rotate-180",
                        )}
                      />
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>
      )}

      {/* ── Main Editor Area ──────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeChapter ? (
          <>
            {/* Scroll progress bar */}
            <div className="h-0.5 bg-white/[0.05] flex-shrink-0 relative">
              <div
                className="absolute left-0 top-0 h-full bg-cyan-500/60 transition-all duration-150"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>

            {/* Toolbar */}
            {!zenMode && (
              <EditorToolbar
                editor={editor}
                zoom={zoom}
                setZoom={setZoom}
                fontFamily={fontFamily}
                setFontFamily={setFontFamily}
                fontSize={fontSize}
                setFontSize={setFontSize}
                lineSpacing={lineSpacing}
                setLineSpacing={setLineSpacing}
                showFind={showFind}
                setShowFind={setShowFind}
                theme={theme}
                setTheme={setTheme}
                density={density}
                setDensity={setDensity}
                paperSize={paperSize}
                setPaperSize={setPaperSize}
                pageColor={pageColor}
                setPageColor={setPageColor}
                zenMode={zenMode}
                setZenMode={setZenMode}
                focusMode={focusMode}
                setFocusMode={setFocusMode}
                typewriterMode={typewriterMode}
                setTypewriterMode={setTypewriterMode}
                firstLineIndent={firstLineIndent}
                setFirstLineIndent={setFirstLineIndent}
                dropCap={dropCap}
                setDropCap={setDropCap}
                showTOC={showTOC}
                setShowTOC={setShowTOC}
                pomodoroTime={pomodoroTime}
                pomodoroRunning={pomodoroRunning}
                setPomodoroRunning={setPomodoroRunning}
                resetPomodoro={resetPomodoro}
                pomodoroMinutes={pomodoroMinutes}
                setPomodoroMinutes={setPomodoroMinutes}
                wordGoal={wordGoal}
                setWordGoal={setWordGoal}
                chapterWords={chapterWords}
                onExportTxt={onExportTxt}
                onExportMd={onExportMd}
                onCopyClipboard={onCopyClipboard}
                onExportChapterPdf={onExportChapterPdf}
                onExportBookPdf={onExportBookPdf}
              />
            )}

            {/* Find & Replace */}
            {showFind && editor && (
              <FindReplacePanel
                editor={editor}
                onClose={() => setShowFind(false)}
              />
            )}

            {/* Ruler + Editor + TOC layout */}
            <div className="flex flex-1 min-h-0 overflow-hidden relative">
              {/* TOC panel */}
              {showTOC && editor && (
                <TOCPanel
                  editor={editor}
                  onClose={() => setShowTOC(false)}
                  scrollAreaRef={scrollAreaRef}
                />
              )}

              {/* Left ruler */}
              {!zenMode && (
                <div
                  className="flex flex-col flex-shrink-0"
                  style={{ width: RULER_SIZE }}
                >
                  <div
                    className="flex-shrink-0 bg-[#12121f] border-r border-b border-white/[0.07]"
                    style={{ height: RULER_SIZE, width: RULER_SIZE }}
                  />
                  <div className="flex-1 overflow-hidden">
                    <VerticalRuler
                      scrollTop={scrollTop}
                      zoom={zoom}
                      height={pageHeightPx * 3}
                      pagePadV={densityCfg.padV}
                    />
                  </div>
                </div>
              )}

              {/* Center: top ruler + scroll area */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {!zenMode && (
                  <HorizontalRuler
                    scrollLeft={scrollLeft}
                    zoom={zoom}
                    contentWidth={scrollAreaW}
                    pagePadH={densityCfg.padH}
                    paperSize={paperSize}
                  />
                )}

                {/* Scrollable page area */}
                <div
                  ref={scrollAreaRef}
                  className={clsx(
                    "flex-1 overflow-auto",
                    focusMode && "focus-mode",
                  )}
                  style={{
                    scrollbarGutter: "stable",
                    backgroundColor: canvasColor,
                  }}
                >
                  <style>{editorStyles}</style>

                  <div
                    className="relative mx-auto"
                    style={{
                      width: scrollAreaW,
                      paddingTop: densityCfg.padV,
                      paddingBottom: densityCfg.padV,
                    }}
                  >
                    {/* Page sheet */}
                    <div
                      className="relative mx-auto overflow-visible"
                      style={{
                        width: pageWidthPx,
                        minHeight:
                          pageCount * pageHeightPx + (pageCount - 1) * PAGE_GAP,
                      }}
                    >
                      {/* Margin guides */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          boxShadow: `inset ${M_LEFT * scale}px 0 0 rgba(0,0,0,0.03), inset -${M_RIGHT * scale}px 0 0 rgba(0,0,0,0.03), inset 0 ${M_TOP * scale}px 0 rgba(0,0,0,0.03), inset 0 -${M_BOTTOM * scale}px 0 rgba(0,0,0,0.03)`,
                          height:
                            pageCount * pageHeightPx +
                            (pageCount - 1) * PAGE_GAP,
                        }}
                      />

                      {/* Editor content */}
                      <div
                        ref={editorDomRef}
                        className="relative z-10 custom-editor-cursor"
                        style={{
                          padding: `${M_TOP * scale}px ${M_RIGHT * scale}px ${M_BOTTOM * scale}px ${M_LEFT * scale}px`,
                          minHeight:
                            pageCount * pageHeightPx +
                            (pageCount - 1) * PAGE_GAP,
                          colorScheme: "light",
                        }}
                      >
                        <EditorContent editor={editor} />

                        {/* Page break overlays (FIXED) */}
                        <PageBreakOverlay
                          pageCount={pageCount}
                          zoom={zoom}
                          chapterTitle={activeChapter?.title || ""}
                          bookTitle={book?.title || ""}
                          fontFamily={fontFamily}
                          paperSize={paperSize}
                          pageColor={pageColor}
                          canvasColor={canvasColor}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right ruler */}
              {!zenMode && (
                <div
                  className="flex flex-col flex-shrink-0"
                  style={{ width: RULER_SIZE }}
                >
                  <div
                    className="flex-shrink-0 bg-[#12121f] border-l border-b border-white/[0.07]"
                    style={{ height: RULER_SIZE, width: RULER_SIZE }}
                  />
                  <div className="flex-1 overflow-hidden">
                    <RightRuler
                      scrollTop={scrollTop}
                      zoom={zoom}
                      height={pageHeightPx * 3}
                      pagePadV={densityCfg.padV}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Status bar */}
            {!zenMode && (
              <div className="h-6 border-t border-white/[0.05] bg-[#07070e] flex items-center px-4 gap-4 flex-shrink-0 text-[10px] text-gray-400">
                <span className="tabular-nums">Pages: {pageCount}</span>
                <span className="tabular-nums">
                  Words: {chapterWords.toLocaleString()}
                </span>
                <span className="tabular-nums">
                  Chars: {chapterChars.toLocaleString()}
                </span>
                <span className="tabular-nums">Sentences: {chapterSents}</span>
                <span>Reading level: {readLevel}</span>
                <span>
                  {fontFamily.split(",")[0].replace(/"/g, "")} · {fontSize}pt
                </span>
                <span>Zoom: {zoom}%</span>
                <div className="flex-1" />
                {focusMode && <span className="text-cyan-500/60">Focus</span>}
                {typewriterMode && (
                  <span className="text-cyan-500/60">Typewriter</span>
                )}
                {pomodoroRunning && (
                  <span className="text-amber-400/80">🍅 Running</span>
                )}
                <span>{paperSize}</span>
              </div>
            )}

            {/* Zen mode exit hint */}
            {zenMode && (
              <button
                onClick={() => setZenMode(false)}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3 py-1.5 bg-black/40 hover:bg-black/60 text-white/40 hover:text-white/80 text-xs rounded-full border border-white/10 transition-all"
              >
                <Minimize2 size={11} />
                Press Esc to exit zen mode
              </button>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center p-10">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <BookOpen size={26} className="text-gray-700" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-300 mb-1.5">
                {activeChaptersList.length === 0
                  ? "Start writing"
                  : "Select a chapter"}
              </h3>
              <p className="text-gray-600 text-sm max-w-xs leading-relaxed">
                {activeChaptersList.length === 0
                  ? "Create your first chapter from the sidebar to begin."
                  : "Choose a chapter from the sidebar to open it."}
              </p>
            </div>
            {activeChaptersList.length === 0 && (
              <button
                onClick={handleCreateChapter}
                disabled={creatingChapter}
                className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              >
                {creatingChapter ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    Create First Chapter
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={!!chapterToDelete}
        onClose={() => setChapterToDelete(null)}
        onConfirm={confirmDeleteChapter}
        title="Delete Chapter"
        message={`Move "${chapters.find((c) => c.id === chapterToDelete)?.title ?? "this chapter"}" to recycle bin?`}
        isDestructive
      />
      <ConfirmModal
        isOpen={!!chapterToHardDelete}
        onClose={() => setChapterToHardDelete(null)}
        onConfirm={confirmHardDeleteChapter}
        title="Permanently Delete"
        message={`Permanently delete "${chapters.find((c) => c.id === chapterToHardDelete)?.title ?? "this chapter"}"? This cannot be undone.`}
        isDestructive
      />
    </div>
  );
};

export default BookWriter;
