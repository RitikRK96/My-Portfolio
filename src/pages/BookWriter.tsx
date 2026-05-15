/**
 * BookWriter.tsx — Enhanced Word-like editor
 * Additional installs needed:
 *   npm install @tiptap/extension-text-align @tiptap/extension-underline
 *   (already in package.json — verify they are)
 *
 * Optional for per-selection font/color:
 *   npm install @tiptap/extension-text-style @tiptap/extension-color
 *   @tiptap/extension-highlight @tiptap/extension-font-family
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import {
    DndContext, closestCenter, KeyboardSensor,
    PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove, SortableContext,
    sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { auth } from '../firebase';
import {
    Loader2, Plus, ChevronLeft, GripVertical, Trash2,
    Bold, Italic, Heading1, Heading2, List, ListOrdered,
    Quote, Undo, Redo, CheckCircle, BookOpen,
    Strikethrough, Code, Minus, PanelLeftClose, PanelLeftOpen,
    FileText, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Underline as UnderlineIcon, Search, Printer, ZoomIn, ZoomOut,
    IndentDecrease as OutdentIcon, IndentIncrease as IndentIcon,
    X, ChevronDown, Replace, ChevronUp, CornerDownLeft,
} from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import ConfirmModal from '../components/ConfirmModal';

const getApiBase = () => import.meta.env.VITE_API_URL || 'https://api-dp2f6yjbbq-el.a.run.app';

// ── Constants ─────────────────────────────────────────────────────────────────
const RULER_SIZE   = 22;   // px — thickness of rulers
const PAGE_GAP     = 32;   // px — gap between pages
const PAGE_PAD_H   = 48;   // px — horizontal padding around page
const PAGE_PAD_V   = 32;   // px — vertical padding top/bottom of scroll area

// A4 at 96dpi — widened for comfortable writing
const A4_W_PX = 960;
const A4_H_PX = 1123;

// Margins (px @ 100%)
const M_TOP    = 80;  // ~0.83 inch
const M_BOTTOM = 80;
const M_LEFT   = 90;  // ~0.94 inch
const M_RIGHT  = 90;

const FONTS = [
    { label: 'Georgia',      value: 'Georgia, serif' },
    { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { label: 'Palatino',     value: '"Palatino Linotype", Palatino, serif' },
    { label: 'Arial',        value: 'Arial, sans-serif' },
    { label: 'Calibri',      value: 'Calibri, sans-serif' },
    { label: 'Helvetica',    value: 'Helvetica, Arial, sans-serif' },
    { label: 'Courier New',  value: '"Courier New", Courier, monospace' },
    { label: 'Consolas',     value: 'Consolas, monospace' },
];
const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72];
const LINE_SPACINGS = [
    { label: 'Single',  value: 1.15 },
    { label: '1.5',     value: 1.5  },
    { label: 'Double',  value: 2.0  },
    { label: '2.5',     value: 2.5  },
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface Chapter { id: string; title: string; content: string; order: number; }
interface Book    { id: string; title: string; chapters: Chapter[]; }

// ── Helpers ───────────────────────────────────────────────────────────────────
const countWords = (html: string) => {
    const t = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return t ? t.split(' ').filter(Boolean).length : 0;
};
const fmtWords = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

// ── Ruler: Horizontal ─────────────────────────────────────────────────────────
const HorizontalRuler = ({
    scrollLeft, zoom, contentWidth,
}: { scrollLeft: number; zoom: number; contentWidth: number }) => {
    const scale = zoom / 100;
    const inchPx = 96 * scale;
    const totalW = contentWidth;
    const pageStartX = PAGE_PAD_H; // where the page starts in the scroll area
    const marginLeftPx  = M_LEFT  * scale;
    const marginRightPx = M_RIGHT * scale;
    const pageWidthPx   = A4_W_PX * scale;

    const ticks: { x: number; type: 'inch' | 'half' | 'quarter' | 'small'; label?: string }[] = [];
    const step = inchPx / 8; // 1/8 inch increments
    for (let i = 0; i * step <= totalW + inchPx; i++) {
        const x = i * step;
        const isInch    = i % 8 === 0;
        const isHalf    = i % 4 === 0 && !isInch;
        const isQuarter = i % 2 === 0 && !isHalf && !isInch;
        ticks.push({
            x,
            type:  isInch ? 'inch' : isHalf ? 'half' : isQuarter ? 'quarter' : 'small',
            label: isInch ? String(i / 8) : undefined,
        });
    }

    return (
        <div
            className="flex-shrink-0 bg-[#12121f] border-b border-white/[0.07] relative overflow-hidden select-none"
            style={{ height: RULER_SIZE, width: '100%' }}
        >
            {/* Margin shading: left */}
            <div
                className="absolute top-0 bottom-0 bg-[#0a0a16]"
                style={{ left: pageStartX - scrollLeft, width: marginLeftPx }}
            />
            {/* Margin shading: right */}
            <div
                className="absolute top-0 bottom-0 bg-[#0a0a16]"
                style={{ left: pageStartX - scrollLeft + pageWidthPx - marginRightPx, width: marginRightPx }}
            />
            {/* Margin boundary lines */}
            <div className="absolute top-0 bottom-0 w-px bg-cyan-500/40"
                style={{ left: pageStartX - scrollLeft + marginLeftPx }} />
            <div className="absolute top-0 bottom-0 w-px bg-cyan-500/40"
                style={{ left: pageStartX - scrollLeft + pageWidthPx - marginRightPx }} />

            {/* Ticks */}
            {ticks.map((t) => (
                <div
                    key={t.x}
                    className="absolute bottom-0"
                    style={{ left: t.x - scrollLeft }}
                >
                    <div
                        className="absolute bottom-0 left-0 w-px"
                        style={{
                            height: t.type === 'inch' ? 13 : t.type === 'half' ? 9 : t.type === 'quarter' ? 6 : 4,
                            background: t.type === 'inch' ? 'rgba(255,255,255,0.45)'
                                       : t.type === 'half' ? 'rgba(255,255,255,0.25)'
                                       : 'rgba(255,255,255,0.12)',
                        }}
                    />
                    {t.label && t.label !== '0' && (
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
    scrollTop, zoom, height,
}: { scrollTop: number; zoom: number; height: number }) => {
    const scale = zoom / 100;
    const inchPx = 96 * scale;
    const step = inchPx / 8;

    const ticks: { y: number; type: 'inch' | 'half' | 'quarter' | 'small'; label?: string }[] = [];
    for (let i = 0; i * step <= height + inchPx; i++) {
        const y = i * step + PAGE_PAD_V;
        const isInch    = i % 8 === 0;
        const isHalf    = i % 4 === 0 && !isInch;
        const isQuarter = i % 2 === 0 && !isHalf && !isInch;
        ticks.push({
            y,
            type:  isInch ? 'inch' : isHalf ? 'half' : isQuarter ? 'quarter' : 'small',
            label: isInch ? String(i / 8) : undefined,
        });
    }

    return (
        <div
            className="flex-shrink-0 bg-[#12121f] border-r border-white/[0.07] relative overflow-hidden select-none"
            style={{ width: RULER_SIZE, minHeight: '100%' }}
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
                            width: t.type === 'inch' ? 13 : t.type === 'half' ? 9 : t.type === 'quarter' ? 6 : 4,
                            background: t.type === 'inch' ? 'rgba(255,255,255,0.45)'
                                       : t.type === 'half' ? 'rgba(255,255,255,0.25)'
                                       : 'rgba(255,255,255,0.12)',
                        }}
                    />
                    {t.label && t.label !== '0' && (
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

// ── Ruler: Right (thin mirror) ────────────────────────────────────────────────
const RightRuler = ({
    scrollTop, zoom, height,
}: { scrollTop: number; zoom: number; height: number }) => {
    const scale = zoom / 100;
    const inchPx = 96 * scale;
    const step = inchPx / 4; // only half-inch ticks on right

    const ticks: { y: number; type: 'inch' | 'half' }[] = [];
    for (let i = 0; i * step <= height + inchPx; i++) {
        const y = i * step + PAGE_PAD_V;
        const isInch = i % 4 === 0;
        ticks.push({ y, type: isInch ? 'inch' : 'half' });
    }

    return (
        <div
            className="flex-shrink-0 bg-[#12121f] border-l border-white/[0.07] relative overflow-hidden select-none"
            style={{ width: RULER_SIZE, minHeight: '100%' }}
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
                            width: t.type === 'inch' ? 10 : 6,
                            background: t.type === 'inch' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

// ── Toolbar Button ────────────────────────────────────────────────────────────
const TBtn = ({
    onClick, active = false, disabled = false, title, children, size = 'md',
}: {
    onClick: () => void; active?: boolean; disabled?: boolean;
    title: string; children: React.ReactNode; size?: 'sm' | 'md';
}) => (
    <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onClick(); }}
        disabled={disabled}
        title={title}
        className={clsx(
            'rounded transition-all duration-100 flex items-center justify-center flex-shrink-0',
            size === 'sm' ? 'p-1' : 'p-1.5',
            active
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-500 hover:text-white hover:bg-white/10 border border-transparent',
            disabled && 'opacity-25 cursor-not-allowed pointer-events-none',
        )}
    >
        {children}
    </button>
);

const TDivider = () => <div className="w-px h-4 bg-white/10 mx-0.5 flex-shrink-0" />;

// ── Dropdown ──────────────────────────────────────────────────────────────────
const TDropdown = ({
    value, options, onChange, width = 90, title,
}: {
    value: string; options: { label: string; value: string | number }[];
    onChange: (v: string) => void; width?: number; title?: string;
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
        <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
    </div>
);

// ── Find & Replace Panel ──────────────────────────────────────────────────────
const FindReplacePanel = ({
    editor, onClose,
}: { editor: ReturnType<typeof useEditor>; onClose: () => void }) => {
    const [find, setFind]       = useState('');
    const [replace, setReplace] = useState('');
    const [showReplace, setShowReplace] = useState(false);
    const [matchCount, setMatchCount]   = useState(0);
    const [matchIdx, setMatchIdx]       = useState(0);
    const findRef = useRef<HTMLInputElement>(null);

    useEffect(() => { findRef.current?.focus(); }, []);

    // Get all text match positions from the editor's DOM
    const findMatches = useCallback((term: string) => {
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
    }, [editor]);

    useEffect(() => {
        const matches = findMatches(find);
        setMatchCount(matches.length);
        setMatchIdx(matches.length > 0 ? 1 : 0);
    }, [find, findMatches]);

    const doFind = (direction: 1 | -1) => {
        if (!editor || !find) return;
        const matches = findMatches(find);
        if (!matches.length) return;
        const newIdx = ((matchIdx - 1 + direction + matches.length) % matches.length);
        setMatchIdx(newIdx + 1);

        // Select in editor
        const pos = matches[newIdx];
        editor.chain().focus().setTextSelection({ from: pos + 1, to: pos + find.length + 1 }).run();
    };

    const doReplace = () => {
        if (!editor || !find) return;
        const { from, to } = editor.state.selection;
        const sel = editor.state.doc.textBetween(from, to);
        if (sel.toLowerCase() === find.toLowerCase()) {
            editor.chain().focus().insertContent(replace).run();
        }
        doFind(1);
    };

    const doReplaceAll = () => {
        if (!editor || !find) return;
        const html = editor.getHTML();
        const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const newHtml = html.replace(regex, replace);
        editor.commands.setContent(newHtml);
        toast.success(`Replaced all occurrences`);
        onClose();
    };

    return (
        <div className="flex flex-col gap-2 px-4 py-2.5 bg-[#0d0d1a] border-b border-white/[0.06] shadow-xl">
            <div className="flex items-center gap-2">
                <button onClick={() => setShowReplace(!showReplace)}
                    className="text-gray-500 hover:text-gray-300 transition-colors">
                    <ChevronDown size={12} className={clsx('transition-transform', showReplace && 'rotate-0', !showReplace && '-rotate-90')} />
                </button>

                {/* Find row */}
                <div className="flex items-center gap-1.5 flex-1">
                    <Search size={12} className="text-gray-600 flex-shrink-0" />
                    <input
                        ref={findRef}
                        value={find}
                        onChange={(e) => setFind(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') doFind(e.shiftKey ? -1 : 1);
                            if (e.key === 'Escape') onClose();
                        }}
                        placeholder="Find…"
                        className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded px-2.5 h-7 text-xs text-white outline-none focus:border-cyan-500/40 placeholder:text-gray-700"
                    />
                    <span className="text-[10px] text-gray-600 tabular-nums w-12 text-center flex-shrink-0">
                        {find ? (matchCount ? `${matchIdx}/${matchCount}` : '0 found') : ''}
                    </span>
                    <TBtn onClick={() => doFind(-1)} title="Previous (Shift+Enter)" size="sm"><ChevronUp size={13} /></TBtn>
                    <TBtn onClick={() => doFind(1)}  title="Next (Enter)"           size="sm"><ChevronDown size={13} /></TBtn>
                </div>
                <button onClick={onClose} className="p-1 text-gray-600 hover:text-gray-300 transition-colors">
                    <X size={13} />
                </button>
            </div>

            {showReplace && (
                <div className="flex items-center gap-1.5 pl-5">
                    <Replace size={12} className="text-gray-600 flex-shrink-0" />
                    <input
                        value={replace}
                        onChange={(e) => setReplace(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') doReplace(); if (e.key === 'Escape') onClose(); }}
                        placeholder="Replace with…"
                        className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded px-2.5 h-7 text-xs text-white outline-none focus:border-cyan-500/40 placeholder:text-gray-700"
                    />
                    <button onClick={doReplace}
                        className="px-2.5 h-7 bg-white/[0.05] hover:bg-white/10 border border-white/[0.08] text-xs text-gray-300 rounded transition-colors whitespace-nowrap">
                        Replace
                    </button>
                    <button onClick={doReplaceAll}
                        className="px-2.5 h-7 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-xs text-cyan-400 rounded transition-colors whitespace-nowrap">
                        Replace All
                    </button>
                </div>
            )}
        </div>
    );
};

// ── Editor Toolbar (2 rows) ───────────────────────────────────────────────────
const EditorToolbar = ({
    editor, zoom, setZoom, fontFamily, setFontFamily,
    fontSize, setFontSize, lineSpacing, setLineSpacing,
    showFind, setShowFind,
}: {
    editor: ReturnType<typeof useEditor>;
    zoom: number; setZoom: (n: number) => void;
    fontFamily: string; setFontFamily: (s: string) => void;
    fontSize: number; setFontSize: (n: number) => void;
    lineSpacing: number; setLineSpacing: (n: number) => void;
    showFind: boolean; setShowFind: (b: boolean) => void;
}) => {
    if (!editor) return null;

    const zoomStep = (dir: 1 | -1) => {
        const steps = [50, 60, 70, 75, 80, 90, 100, 110, 125, 150, 175, 200];
        const idx = steps.findIndex(z => z >= zoom);
        const next = dir === 1
            ? steps[Math.min(idx + 1, steps.length - 1)]
            : steps[Math.max(idx - 2, 0)];
        setZoom(next);
    };

    return (
        <div className="border-b border-white/[0.06] bg-[#09090f] flex-shrink-0">
            {/* Row 1: Clipboard / History / Font / Size */}
            <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-white/[0.04] flex-wrap">
                <TBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)"><Undo size={13} /></TBtn>
                <TBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)"><Redo size={13} /></TBtn>
                <TDivider />

                {/* Font family */}
                <TDropdown
                    value={fontFamily}
                    options={FONTS.map(f => ({ label: f.label, value: f.value }))}
                    onChange={setFontFamily}
                    width={132}
                    title="Font family"
                />
                <div className="w-1" />
                {/* Font size */}
                <TDropdown
                    value={String(fontSize)}
                    options={FONT_SIZES.map(s => ({ label: String(s), value: s }))}
                    onChange={(v) => setFontSize(Number(v))}
                    width={56}
                    title="Font size"
                />
                <TDivider />

                {/* Heading shortcuts */}
                <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1"><Heading1 size={13} /></TBtn>
                <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 size={13} /></TBtn>
                <TDivider />

                {/* Line spacing */}
                <TDropdown
                    value={String(lineSpacing)}
                    options={LINE_SPACINGS.map(l => ({ label: l.label, value: l.value }))}
                    onChange={(v) => setLineSpacing(Number(v))}
                    width={74}
                    title="Line spacing"
                />
                <TDivider />

                {/* Zoom */}
                <TBtn onClick={() => zoomStep(-1)} title="Zoom out"><ZoomOut size={13} /></TBtn>
                <span className="text-[11px] text-gray-500 tabular-nums w-9 text-center">{zoom}%</span>
                <TBtn onClick={() => zoomStep(1)}  title="Zoom in"><ZoomIn size={13} /></TBtn>
                <TDivider />

                {/* Find */}
                <TBtn onClick={() => setShowFind(!showFind)} active={showFind} title="Find & Replace (Ctrl+F)">
                    <Search size={13} />
                </TBtn>
                {/* Print */}
                <TBtn onClick={() => window.print()} title="Print (Ctrl+P)">
                    <Printer size={13} />
                </TBtn>
            </div>

            {/* Row 2: Formatting */}
            <div className="flex items-center gap-0.5 px-3 py-1.5 flex-wrap">
                <TBtn onClick={() => editor.chain().focus().toggleBold().run()}   active={editor.isActive('bold')}      title="Bold (Ctrl+B)"><Bold size={13} /></TBtn>
                <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}    title="Italic (Ctrl+I)"><Italic size={13} /></TBtn>
                <TBtn onClick={() => editor.chain().focus().toggleUnderline?.() ? editor.chain().focus().toggleUnderline().run() : null} active={editor.isActive('underline')} title="Underline (Ctrl+U)"><UnderlineIcon size={13} /></TBtn>
                <TBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}    title="Strikethrough"><Strikethrough size={13} /></TBtn>
                <TBtn onClick={() => editor.chain().focus().toggleCode().run()}   active={editor.isActive('code')}      title="Inline code"><Code size={13} /></TBtn>
                <TDivider />

                {/* Alignment */}
                <TBtn onClick={() => editor.chain().focus().setTextAlign('left').run()}    active={editor.isActive({ textAlign: 'left' })}    title="Align left"><AlignLeft size={13} /></TBtn>
                <TBtn onClick={() => editor.chain().focus().setTextAlign('center').run()}  active={editor.isActive({ textAlign: 'center' })}  title="Align center"><AlignCenter size={13} /></TBtn>
                <TBtn onClick={() => editor.chain().focus().setTextAlign('right').run()}   active={editor.isActive({ textAlign: 'right' })}   title="Align right"><AlignRight size={13} /></TBtn>
                <TBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify"><AlignJustify size={13} /></TBtn>
                <TDivider />

                {/* Lists */}
                <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()}  active={editor.isActive('bulletList')}  title="Bullet list"><List size={13} /></TBtn>
                <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list"><ListOrdered size={13} /></TBtn>
                <TBtn onClick={() => editor.chain().focus().toggleBlockquote().run()}  active={editor.isActive('blockquote')}  title="Blockquote"><Quote size={13} /></TBtn>
                <TBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()}   active={editor.isActive('codeBlock')}   title="Code block">
                    <span className="font-mono text-[10px] leading-none">{'{}'}</span>
                </TBtn>
                <TDivider />

                {/* Indent */}
                <TBtn onClick={() => editor.chain().focus().liftListItem('listItem').run()}
                    disabled={!editor.can().liftListItem('listItem')} title="Decrease indent">
                    <OutdentIcon size={13} />
                </TBtn>
                <TBtn onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
                    disabled={!editor.can().sinkListItem('listItem')} title="Increase indent">
                    <IndentIcon size={13} />
                </TBtn>
                <TDivider />

                {/* Misc */}
                <TBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule"><Minus size={13} /></TBtn>
                <TBtn onClick={() => editor.chain().focus().setHardBreak().run()} title="Page break (visual)">
                    <CornerDownLeft size={13} />
                </TBtn>
            </div>
        </div>
    );
};

// ── Sortable Chapter Item ─────────────────────────────────────────────────────
const SortableChapterItem = ({
    id, chapter, isActive, index, onClick, onDelete,
}: {
    id: string; chapter: Chapter; isActive: boolean; index: number;
    onClick: (c: Chapter) => void; onDelete: (id: string) => void;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            onClick={() => onClick(chapter)}
            className={clsx(
                'group flex items-center gap-1.5 px-2.5 py-2.5 rounded-xl border transition-all duration-150 cursor-pointer',
                isDragging && 'opacity-40 scale-[0.98]',
                isActive
                    ? 'bg-cyan-500/10 border-cyan-500/25 text-white'
                    : 'border-transparent hover:bg-white/[0.04] text-gray-400 hover:text-gray-200 hover:border-white/[0.08]',
            )}
        >
            <button {...attributes} {...listeners} onClick={(e) => e.stopPropagation()}
                className="cursor-grab active:cursor-grabbing p-0.5 opacity-0 group-hover:opacity-30 hover:!opacity-60 transition-opacity flex-shrink-0">
                <GripVertical size={13} />
            </button>
            <span className={clsx('text-[10px] font-mono flex-shrink-0 w-4 text-center',
                isActive ? 'text-cyan-400/50' : 'text-gray-700')}>
                {String(index + 1).padStart(2, '0')}
            </span>
            <span className="flex-1 text-xs font-medium truncate leading-tight">
                {chapter.title || 'Untitled Chapter'}
            </span>
            <button onClick={(e) => { e.stopPropagation(); onDelete(chapter.id); }}
                className="p-0.5 opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-400 transition-all flex-shrink-0">
                <Trash2 size={12} />
            </button>
        </div>
    );
};

// ── Page Break Overlay ────────────────────────────────────────────────────────
const PageBreakOverlay = ({
    editorRef, zoom, pageHeight, chapterTitle, fontFamily,
}: {
    editorRef: React.RefObject<HTMLDivElement | null>;
    zoom: number; pageHeight: number;
    chapterTitle: string; fontFamily: string;
}) => {
    const [breaks, setBreaks] = useState<number[]>([]);
    const scale = zoom / 100;
    const marginBottom = M_BOTTOM * scale;
    const marginLeft   = M_LEFT   * scale;
    const marginRight  = M_RIGHT  * scale;

    useEffect(() => {
        const el = editorRef.current;
        if (!el) return;
        const compute = () => {
            const pageH = pageHeight * scale;
            const lines: number[] = [];
            for (let y = pageH; y < el.scrollHeight; y += pageH) lines.push(y);
            setBreaks(lines);
        };
        compute();
        const ro = new ResizeObserver(compute);
        ro.observe(el);
        return () => ro.disconnect();
    }, [editorRef, zoom, pageHeight]); // eslint-disable-line

    const footerFontSize = Math.max(7, 8 * scale);

    return (
        <>
            {breaks.map((y, i) => (
                <div key={i}>
                    {/* ── In-page footer (bottom margin of ending page) ── */}
                    <div
                        className="absolute left-0 right-0 pointer-events-none flex items-center"
                        style={{
                            top: y - marginBottom,
                            height: marginBottom,
                            paddingLeft:  marginLeft,
                            paddingRight: marginRight,
                            borderTop: '1px solid #e5e7eb',
                        }}
                    >
                        {/* Chapter title – left */}
                        <span style={{
                            fontSize: footerFontSize,
                            color: '#9ca3af',
                            fontFamily,
                            fontStyle: 'italic',
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            paddingRight: 8,
                        }}>
                            {chapterTitle}
                        </span>
                        {/* Page number – right */}
                        <span style={{
                            fontSize: footerFontSize,
                            color: '#9ca3af',
                            fontFamily,
                            flexShrink: 0,
                        }}>
                            {i + 1}
                        </span>
                    </div>

                    {/* ── Gap between pages ── */}
                    <div
                        className="absolute left-0 right-0 pointer-events-none z-10"
                        style={{ top: y }}
                    >
                        <div className="w-full bg-[#1e1e2a]" style={{ height: PAGE_GAP }}>
                            <div className="absolute inset-x-0 top-0 h-px bg-white/[0.06]" />
                            <div className="absolute inset-x-0 bottom-0 h-px bg-white/[0.06]" />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

// ── BookWriter ─────────────────────────────────────────────────────────────────
const BookWriter = () => {
    const [book, setBook]               = useState<Book | null>(null);
    const [chapters, setChapters]       = useState<Chapter[]>([]);
    const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
    const [loading, setLoading]         = useState(true);
    const [saveStatus, setSaveStatus]   = useState<'idle' | 'saving' | 'saved'>('idle');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [creatingChapter, setCreatingChapter] = useState(false);
    const [chapterToDelete, setChapterToDelete] = useState<string | null>(null);

    // Editor config state
    const [zoom, setZoom]               = useState(100);
    const [fontFamily, setFontFamily]   = useState(FONTS[0].value);
    const [fontSize, setFontSize]       = useState(12);
    const [lineSpacing, setLineSpacing] = useState(1.5);
    const [showFind, setShowFind]       = useState(false);

    // Ruler scroll state
    const [scrollLeft, setScrollLeft]   = useState(0);
    const [scrollTop, setScrollTop]     = useState(0);

    // Refs
    const saveTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
    const titleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const activeIdRef   = useRef<string | null>(null);
    const bookIdRef     = useRef<string | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const editorDomRef  = useRef<HTMLDivElement>(null);

    const [searchParams] = useSearchParams();
    const navigate        = useNavigate();
    const bookId          = searchParams.get('bookId');
    const API_URL         = `${getApiBase()}/books`;

    useEffect(() => { activeIdRef.current = activeChapterId; }, [activeChapterId]);
    useEffect(() => { bookIdRef.current = bookId; }, [bookId]);

    const activeChapter = chapters.find(c => c.id === activeChapterId) ?? null;

    // ── Load book ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!bookId) { navigate('/admin/books'); return; }
        (async () => {
            try {
                const res = await fetch(`${API_URL}/${bookId}`);
                if (!res.ok) throw new Error('Not found');
                const data = await res.json();
                setBook(data);
                const sorted = [...(data.chapters ?? [])].sort(
                    (a: Chapter, b: Chapter) => a.order - b.order,
                );
                setChapters(sorted);
                if (sorted.length > 0) setActiveChapterId(sorted[0].id);
            } catch {
                toast.error('Failed to load book');
                navigate('/admin/books');
            } finally {
                setLoading(false);
            }
        })();
    }, [bookId]); // eslint-disable-line

    // ── TipTap Editor ─────────────────────────────────────────────────────────
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline,
        ],
        content: '',
        editorProps: {
            attributes: { class: 'prose-editor focus:outline-none', spellcheck: 'true' },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            const id   = activeIdRef.current;
            const bid  = bookIdRef.current;
            if (!id || !bid) return;
            setChapters(prev => prev.map(c => c.id === id ? { ...c, content: html } : c));
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            setSaveStatus('saving');
            saveTimerRef.current = setTimeout(async () => {
                try {
                    const token = await auth.currentUser?.getIdToken();
                    await fetch(`${API_URL}/${bid}/chapters/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ content: html }),
                    });
                    setSaveStatus('saved');
                } catch {
                    setSaveStatus('idle');
                    toast.error('Auto-save failed', { id: 'save-err' });
                }
            }, 1500);
        },
    });

    // ── Keyboard shortcuts ────────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!editor) return;
            const mod = e.ctrlKey || e.metaKey;
            if (mod && !e.shiftKey && e.key.toLowerCase() === 'z') { e.preventDefault(); editor.chain().focus().undo().run(); }
            if (mod && e.key.toLowerCase() === 'y')                 { e.preventDefault(); editor.chain().focus().redo().run(); }
            if (mod && e.shiftKey && e.key.toLowerCase() === 'z')   { e.preventDefault(); editor.chain().focus().redo().run(); }
            if (mod && e.key.toLowerCase() === 'f')                 { e.preventDefault(); setShowFind(true); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [editor]);

    // Sync editor content on chapter switch
    useEffect(() => {
        if (!editor || !activeChapter) return;
        editor.commands.setContent(activeChapter.content || '', { emitUpdate: false } as any);
    }, [activeChapterId]); // eslint-disable-line

    // ── Scroll sync for rulers ────────────────────────────────────────────────
    useEffect(() => {
        const el = scrollAreaRef.current;
        if (!el) return;
        const onScroll = () => {
            setScrollLeft(el.scrollLeft);
            setScrollTop(el.scrollTop);
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, []);

    // ── Title change ──────────────────────────────────────────────────────────
    const handleTitleChange = (value: string) => {
        const id = activeChapterId; const bid = bookId;
        if (!id || !bid) return;
        setChapters(prev => prev.map(c => c.id === id ? { ...c, title: value } : c));
        if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
        titleTimerRef.current = setTimeout(async () => {
            try {
                const token = await auth.currentUser?.getIdToken();
                await fetch(`${API_URL}/${bid}/chapters/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ title: value }),
                });
            } catch { /* silent */ }
        }, 800);
    };

    // ── Create chapter ────────────────────────────────────────────────────────
    const handleCreateChapter = async () => {
        if (!bookId || creatingChapter) return;
        setCreatingChapter(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch(`${API_URL}/${bookId}/chapters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title: `Chapter ${chapters.length + 1}`, content: '', order: chapters.length }),
            });
            if (!res.ok) throw new Error();
            const c: Chapter = await res.json();
            setChapters(prev => [...prev, c]);
            setActiveChapterId(c.id);
            toast.success('Chapter created');
        } catch {
            toast.error('Failed to create chapter');
        } finally {
            setCreatingChapter(false);
        }
    };

    // ── Delete chapter ────────────────────────────────────────────────────────
    const handleDeleteChapter = (chapterId: string) => {
        setChapterToDelete(chapterId);
    };

    const confirmDeleteChapter = async () => {
        const chapterId = chapterToDelete;
        if (!chapterId) return;
        try {
            const token = await auth.currentUser?.getIdToken();
            await fetch(`${API_URL}/${bookId}/chapters/${chapterId}`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
            });
            setChapters(prev => {
                const rest = prev.filter(c => c.id !== chapterId);
                if (activeChapterId === chapterId) setActiveChapterId(rest[0]?.id ?? null);
                return rest;
            });
            toast.success('Chapter deleted');
        } catch {
            toast.error('Failed to delete chapter');
        }
    };

    // ── Drag and drop ─────────────────────────────────────────────────────────
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id || !bookId) return;
        const oldIdx = chapters.findIndex(c => c.id === active.id);
        const newIdx = chapters.findIndex(c => c.id === over.id);
        const reordered = arrayMove(chapters, oldIdx, newIdx).map((c, i) => ({ ...c, order: i }));
        setChapters(reordered);
        try {
            const token = await auth.currentUser?.getIdToken();
            await fetch(`${API_URL}/${bookId}/chapters/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ chapters: reordered.map(c => ({ id: c.id, order: c.order })) }),
            });
        } catch { toast.error('Failed to save order'); }
    };

    // ── Stats ─────────────────────────────────────────────────────────────────
    const totalWords   = chapters.reduce((s, c) => s + countWords(c.content ?? ''), 0);
    const chapterWords = activeChapter ? countWords(activeChapter.content ?? '') : 0;
    const readTime     = Math.max(1, Math.ceil(totalWords / 250));
    const scale        = zoom / 100;
    const pageWidthPx  = A4_W_PX * scale;
    const pageHeightPx = A4_H_PX * scale;
    const scrollAreaW  = pageWidthPx + PAGE_PAD_H * 2;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-cyan-400" size={28} />
                    <p className="text-gray-600 text-sm">Loading your book…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] w-full bg-[#050505] text-gray-200 overflow-hidden">

            {/* ── Sidebar ───────────────────────────────────────────────────── */}
            <aside className={clsx(
                'flex flex-col border-r border-white/[0.06] bg-[#07070e] transition-all duration-300 flex-shrink-0',
                sidebarOpen ? 'w-[260px]' : 'w-[52px]',
            )}>
                {/* Header */}
                <div className={clsx(
                    'h-[52px] border-b border-white/[0.06] flex items-center',
                    sidebarOpen ? 'px-3 gap-2' : 'flex-col justify-center gap-1 py-1',
                )}>
                    <Link to="/admin/books" title="Back to library"
                        className="p-1 text-gray-600 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
                        <ChevronLeft size={sidebarOpen ? 16 : 14} />
                    </Link>
                    {sidebarOpen ? (
                        <>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white truncate leading-tight">{book?.title}</p>
                                <p className="text-[10px] text-gray-600 mt-0.5">{fmtWords(totalWords)} words · {chapters.length} ch.</p>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} title="Collapse"
                                className="p-1 text-gray-700 hover:text-gray-400 transition-colors flex-shrink-0">
                                <PanelLeftClose size={13} />
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setSidebarOpen(true)} title="Expand"
                            className="p-1 text-gray-700 hover:text-gray-400 transition-colors mx-auto">
                            <PanelLeftOpen size={13} />
                        </button>
                    )}
                </div>

                {sidebarOpen && (
                    <>
                        <div className="flex items-center justify-between px-3 pt-4 pb-2">
                            <span className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.12em]">Chapters</span>
                            <button onClick={handleCreateChapter} disabled={creatingChapter} title="New chapter"
                                className="p-1 text-gray-600 hover:text-cyan-400 transition-colors rounded disabled:opacity-40">
                                {creatingChapter ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={chapters.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-0.5">
                                        {chapters.map((ch, i) => (
                                            <SortableChapterItem
                                                key={ch.id} id={ch.id} chapter={ch} index={i}
                                                isActive={activeChapterId === ch.id}
                                                onClick={(c) => setActiveChapterId(c.id)}
                                                onDelete={handleDeleteChapter}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>

                            {chapters.length === 0 && (
                                <div className="text-center py-10">
                                    <FileText size={22} className="mx-auto text-gray-800 mb-3" />
                                    <p className="text-xs text-gray-700 mb-3">No chapters yet</p>
                                    <button onClick={handleCreateChapter}
                                        className="text-xs text-cyan-600 hover:text-cyan-400 transition-colors">
                                        + Add first chapter
                                    </button>
                                </div>
                            )}
                        </div>

                        {chapters.length > 0 && (
                            <div className="px-3 py-3 border-t border-white/[0.04] space-y-2.5">
                                {/* Editable chapter title */}
                                {activeChapter && (
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-700 uppercase tracking-[0.12em] mb-1">Chapter title</p>
                                        <input
                                            value={activeChapter.title}
                                            onChange={(e) => handleTitleChange(e.target.value)}
                                            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500/40 placeholder:text-gray-700 transition-colors"
                                            placeholder="Chapter title…"
                                        />
                                    </div>
                                )}

                                {/* Stats row */}
                                <div className="grid grid-cols-3 gap-1.5">
                                    {[
                                        { label: 'Ch.', value: chapters.length },
                                        { label: 'Words', value: fmtWords(chapterWords) },
                                        { label: 'Read', value: `${readTime}m` },
                                    ].map(s => (
                                        <div key={s.label} className="text-center py-2 rounded-lg bg-white/[0.025]">
                                            <div className="text-sm font-semibold text-gray-300">{s.value}</div>
                                            <div className="text-[9px] text-gray-700 uppercase tracking-wide mt-0.5">{s.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Save status */}
                                <div className={clsx(
                                    'flex items-center justify-center gap-1.5 text-[10px] font-medium py-1 rounded-lg transition-colors duration-500',
                                    saveStatus === 'saving'
                                        ? 'text-amber-400/80 bg-amber-500/5'
                                        : 'text-green-500/50 bg-green-500/5',
                                )}>
                                    {saveStatus === 'saving'
                                        ? <><Loader2 size={10} className="animate-spin" />Saving…</>
                                        : <><CheckCircle size={10} />All changes saved</>}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </aside>

            {/* ── Main Editor Area ──────────────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {activeChapter ? (
                    <>
                        {/* Toolbar */}
                        <EditorToolbar
                            editor={editor}
                            zoom={zoom} setZoom={setZoom}
                            fontFamily={fontFamily} setFontFamily={setFontFamily}
                            fontSize={fontSize} setFontSize={setFontSize}
                            lineSpacing={lineSpacing} setLineSpacing={setLineSpacing}
                            showFind={showFind} setShowFind={setShowFind}
                        />

                        {/* Find & Replace */}
                        {showFind && editor && (
                            <FindReplacePanel editor={editor} onClose={() => setShowFind(false)} />
                        )}

                        {/* ── Ruler + Editor layout ─────────────────────────── */}
                        <div className="flex flex-1 min-h-0 overflow-hidden">

                            {/* Left ruler + corner */}
                            <div className="flex flex-col flex-shrink-0" style={{ width: RULER_SIZE }}>
                                {/* Corner square */}
                                <div
                                    className="flex-shrink-0 bg-[#12121f] border-r border-b border-white/[0.07]"
                                    style={{ height: RULER_SIZE, width: RULER_SIZE }}
                                />
                                {/* Vertical ruler */}
                                <div className="flex-1 overflow-hidden">
                                    <VerticalRuler scrollTop={scrollTop} zoom={zoom} height={pageHeightPx * 3} />
                                </div>
                            </div>

                            {/* Center: top ruler + scroll area */}
                            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                                {/* Top ruler */}
                                <HorizontalRuler
                                    scrollLeft={scrollLeft}
                                    zoom={zoom}
                                    contentWidth={scrollAreaW}
                                />

                                {/* Scrollable page area */}
                                <div
                                    ref={scrollAreaRef}
                                    className="flex-1 overflow-auto bg-[#1e1e2a]"
                                    style={{ scrollbarGutter: 'stable' }}
                                >
                                    {/* Global editor styles */}
                                    <style>{`
                                        .prose-editor { outline: none !important; caret-color: #111827; }
                                        .prose-editor > * + * { margin-top: 0.85em; }
                                        .prose-editor p          { line-height: ${lineSpacing * 1.4}; color: #374151; font-size: ${fontSize}pt; font-family: ${fontFamily}; }
                                        .prose-editor h1         { font-size: ${Math.round(fontSize * 2)}pt; font-weight: 700; color: #111827; margin-top: 2rem; margin-bottom: 0.5rem; font-family: ${fontFamily}; }
                                        .prose-editor h2         { font-size: ${Math.round(fontSize * 1.5)}pt; font-weight: 600; color: #1f2937; margin-top: 1.6rem; margin-bottom: 0.4rem; font-family: ${fontFamily}; }
                                        .prose-editor h3         { font-size: ${Math.round(fontSize * 1.2)}pt; font-weight: 600; color: #374151; margin-top: 1.3rem; margin-bottom: 0.3rem; font-family: ${fontFamily}; }
                                        .prose-editor blockquote { border-left: 3px solid #d1d5db; padding-left: 1.25rem; color: #6b7280; font-style: italic; margin: 1.5rem 0; }
                                        .prose-editor ul         { list-style: disc; padding-left: 1.75rem; }
                                        .prose-editor ol         { list-style: decimal; padding-left: 1.75rem; }
                                        .prose-editor li         { margin-bottom: 0.3rem; color: #374151; line-height: ${lineSpacing * 1.4}; font-family: ${fontFamily}; font-size: ${fontSize}pt; }
                                        .prose-editor code:not(pre code) { background: #f3f4f6; padding: 0.1em 0.4em; border-radius: 4px; font-size: 0.875em; color: #1f2937; border: 1px solid #e5e7eb; }
                                        .prose-editor pre        { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 1rem 1.25rem; overflow-x: auto; margin: 1.5rem 0; }
                                        .prose-editor pre code   { color: #374151; font-size: 0.875em; background: transparent; padding: 0; border: none; }
                                        .prose-editor hr         { border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
                                        .prose-editor strong     { color: #111827; font-weight: 600; }
                                        .prose-editor em         { color: #374151; }
                                        .prose-editor s          { color: #9ca3af; }
                                        .prose-editor u          { text-decoration: underline; }
                                        /* Selections */
                                        .prose-editor ::selection { background: rgba(59,130,246,0.25); }

                                        @media print {
                                            body > *:not(.print-area) { display: none !important; }
                                            .print-area { display: block !important; }
                                        }
                                    `}</style>

                                    {/* Page container */}
                                    <div
                                        className="relative mx-auto"
                                        style={{
                                            width: scrollAreaW,
                                            paddingTop: PAGE_PAD_V,
                                            paddingBottom: PAGE_PAD_V,
                                        }}
                                    >
                                        {/* Page 1 "sheet" visual */}
                                        <div 
                                            className="bg-white shadow-[0_0_50px_rgba(0,0,0,0.2)] rounded-sm relative overflow-hidden"
                                            style={{ minHeight: pageHeightPx }}
                                        >

                                            {/* Margin guides (very subtle) */}
                                            <div className="absolute inset-0 pointer-events-none" style={{
                                                boxShadow: `inset ${M_LEFT * scale}px 0 0 rgba(241,245,249,0.6),
                                                            inset -${M_RIGHT * scale}px 0 0 rgba(241,245,249,0.6),
                                                            inset 0 ${M_TOP * scale}px 0 rgba(241,245,249,0.6),
                                                            inset 0 -${M_BOTTOM * scale}px 0 rgba(241,245,249,0.6)`,
                                            }} />

                                            {/* Editor content */}
                                            <div
                                                ref={editorDomRef}
                                                className="relative"
                                                style={{
                                                    padding: `${M_TOP * scale}px ${M_RIGHT * scale}px ${M_BOTTOM * scale}px ${M_LEFT * scale}px`,
                                                    minHeight: pageHeightPx,
                                                }}
                                            >
                                                <EditorContent editor={editor} />

                                                {/* Page break overlays */}
                                                <PageBreakOverlay
                                                    editorRef={editorDomRef}
                                                    zoom={zoom}
                                                    pageHeight={pageHeightPx - (M_TOP + M_BOTTOM) * scale}
                                                    chapterTitle={activeChapter?.title || ''}
                                                    fontFamily={fontFamily}
                                                />
                                            </div>

                                            {/* Footer: chapter title + page number */}
                                            <div
                                                className="absolute bottom-0 left-0 right-0 flex items-center pointer-events-none"
                                                style={{
                                                    height: M_BOTTOM * scale,
                                                    paddingLeft:  M_LEFT  * scale,
                                                    paddingRight: M_RIGHT * scale,
                                                    borderTop: '1px solid #e5e7eb',
                                                }}
                                            >
                                                {/* Chapter title – left */}
                                                <span style={{
                                                    fontSize: Math.max(7, 8 * scale),
                                                    color: '#9ca3af',
                                                    fontFamily,
                                                    fontStyle: 'italic',
                                                    flex: 1,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    paddingRight: 8,
                                                }}>
                                                    {activeChapter?.title || ''}
                                                </span>
                                                {/* Page number – right */}
                                                <span style={{
                                                    fontSize: Math.max(7, 8 * scale),
                                                    color: '#9ca3af',
                                                    fontFamily,
                                                    flexShrink: 0,
                                                }}>
                                                    1
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right ruler */}
                            <div className="flex flex-col flex-shrink-0" style={{ width: RULER_SIZE }}>
                                <div
                                    className="flex-shrink-0 bg-[#12121f] border-l border-b border-white/[0.07]"
                                    style={{ height: RULER_SIZE, width: RULER_SIZE }}
                                />
                                <div className="flex-1 overflow-hidden">
                                    <RightRuler scrollTop={scrollTop} zoom={zoom} height={pageHeightPx * 3} />
                                </div>
                            </div>
                        </div>

                        {/* Status bar */}
                        <div className="h-6 border-t border-white/[0.05] bg-[#07070e] flex items-center px-4 gap-4 flex-shrink-0">
                            <span className="text-[10px] text-gray-700 tabular-nums">
                                Words: {chapterWords.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-gray-700">
                                {fontFamily.split(',')[0].replace(/"/g, '')} · {fontSize}pt
                            </span>
                            <span className="text-[10px] text-gray-700">
                                Zoom: {zoom}%
                            </span>
                            <div className="flex-1" />
                            <span className="text-[10px] text-gray-700">A4</span>
                        </div>
                    </>
                ) : (
                    /* Empty state */
                    <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center p-10">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                            <BookOpen size={26} className="text-gray-700" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-300 mb-1.5">
                                {chapters.length === 0 ? 'Start writing' : 'Select a chapter'}
                            </h3>
                            <p className="text-gray-600 text-sm max-w-xs leading-relaxed">
                                {chapters.length === 0
                                    ? 'Create your first chapter from the sidebar to begin.'
                                    : 'Choose a chapter from the sidebar to open it.'}
                            </p>
                        </div>
                        {chapters.length === 0 && (
                            <button
                                onClick={handleCreateChapter} disabled={creatingChapter}
                                className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/30 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                            >
                                {creatingChapter
                                    ? <><Loader2 size={14} className="animate-spin" />Creating…</>
                                    : <><Plus size={14} />Create First Chapter</>}
                            </button>
                        )}
                    </div>
                )}
            </main>

            {/* ── Confirm: Delete chapter ───────────────────────────────── */}
            <ConfirmModal
                isOpen={!!chapterToDelete}
                onClose={() => setChapterToDelete(null)}
                onConfirm={confirmDeleteChapter}
                title="Delete Chapter"
                message={`Are you sure you want to delete "${chapters.find(c => c.id === chapterToDelete)?.title ?? 'this chapter'}"? This action cannot be undone.`}
                isDestructive
            />
        </div>
    );
};

export default BookWriter;