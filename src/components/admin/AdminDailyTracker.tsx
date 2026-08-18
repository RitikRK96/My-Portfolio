import React, { useState, useEffect, useMemo } from 'react';
import {
    Flame,
    Calendar,
    Clock,
    Smartphone,
    Moon,
    CheckCircle2,
    Circle,
    Plus,
    Trash2,
    Save,
    Activity,
    Search,
    Trophy,
    Zap,
    Footprints,
} from 'lucide-react';
import clsx from 'clsx';
import {
    useDailyTracker,
    defaultDailyLog,
    type DailyLog,
    type DailyTask,
    type CustomMetric,
    type CustomHabitItem,
} from '../../context/DailyTrackerContext';
import ConfirmModal from '../ConfirmModal';

const PRESET_TAGS = [
    'mern-stack',
    'genai',
    'dsa',
    'react',
    'nodejs',
    'express',
    'mongodb',
    'typescript',
    'system-design',
    'llms',
    'bugfix',
    'portfolio',
];

const PRESET_HABITS = [
    { key: 'dsa', label: 'DSA / LeetCode', icon: '🧠' },
    { key: 'mern', label: 'MERN Full-Stack', icon: '🚀' },
    { key: 'genai', label: 'GenAI & LLMs', icon: '🤖' },
    { key: 'workout', label: 'Workout / Gym', icon: '🏋️‍♂️' },
    { key: 'water', label: '3L+ Water', icon: '💧' },
    { key: 'reading', label: 'Read (Tech/Books)', icon: '📖' },
    { key: 'noJunkFood', label: 'Clean Diet (No Junk)', icon: '🥗' },
];

const SLEEP_QUALITIES: Array<{
    id: DailyLog['sleepQuality'];
    label: string;
    icon: string;
    color: string;
}> = [
    { id: 'energized', label: 'Energized', icon: '⚡', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
    { id: 'good', label: 'Good Rest', icon: '😊', color: 'text-green-400 border-green-500/40 bg-green-500/10' },
    { id: 'okay', label: 'Moderate', icon: '😐', color: 'text-blue-400 border-blue-500/40 bg-blue-500/10' },
    { id: 'tired', label: 'Tired', icon: '🥱', color: 'text-orange-400 border-orange-500/40 bg-orange-500/10' },
    { id: 'exhausted', label: 'Exhausted', icon: '💀', color: 'text-red-400 border-red-500/40 bg-red-500/10' },
];

const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getYesterdayString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const calculateSleepDuration = (bed: string, wake: string): number => {
    if (!bed || !wake) return 0;
    const [bH, bM] = bed.split(':').map(Number);
    const [wH, wM] = wake.split(':').map(Number);
    if (isNaN(bH) || isNaN(wH)) return 0;

    let bedMin = bH * 60 + (bM || 0);
    let wakeMin = wH * 60 + (wM || 0);

    if (wakeMin <= bedMin) {
        wakeMin += 24 * 60;
    }

    const diffHours = (wakeMin - bedMin) / 60;
    return Math.round(diffHours * 10) / 10;
};

const AdminDailyTracker: React.FC = () => {
    const { logs, loading, stats, getLogForDate, saveDailyLog, deleteDailyLog } = useDailyTracker();

    const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
    const [formData, setFormData] = useState<DailyLog>(defaultDailyLog(getTodayString()));
    const [newTaskText, setNewTaskText] = useState('');
    const [newCustomHabitText, setNewCustomHabitText] = useState('');
    const [customTagInput, setCustomTagInput] = useState('');
    const [customMetricLabel, setCustomMetricLabel] = useState('');
    const [customMetricValue, setCustomMetricValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredDayData, setHoveredDayData] = useState<DailyLog | null>(null);

    // Sync form data when selected date changes or logs update
    useEffect(() => {
        const existing = getLogForDate(selectedDate);
        if (existing) {
            setFormData(JSON.parse(JSON.stringify(existing)));
        } else {
            setFormData(defaultDailyLog(selectedDate));
        }
    }, [selectedDate, logs]);

    // App screen time change
    const handleAppScreenTime = (app: 'instagram' | 'whatsapp' | 'bgmi' | 'snapchat', mins: number) => {
        const updatedBreakdown = {
            ...(formData.screenTimeBreakdown || {}),
            [app]: Math.max(0, mins || 0),
        };
        // Auto-calculate sum in hours & minutes if user updates app breakdown
        const totalMins: number = Object.values(updatedBreakdown).reduce<number>(
            (acc, cur) => acc + (typeof cur === 'number' ? cur : 0),
            0
        );
        const autoH = Math.floor(totalMins / 60);
        const autoM = totalMins % 60;

        setFormData((prev) => ({
            ...prev,
            screenTimeBreakdown: updatedBreakdown,
            screenTimeHours: totalMins > 0 ? autoH : prev.screenTimeHours,
            screenTimeMinutes: totalMins > 0 ? autoM : prev.screenTimeMinutes,
        }));
    };

    // Night Sleep Change
    const handleNightSleepChange = (field: 'sleepBedtime' | 'sleepWakeTime', val: string) => {
        const bed = field === 'sleepBedtime' ? val : formData.sleepBedtime;
        const wake = field === 'sleepWakeTime' ? val : formData.sleepWakeTime;
        const nightH = calculateSleepDuration(bed, wake);
        const napH = formData.hasNap ? (Number(formData.napHours) || 0) : 0;
        const total = Math.round((nightH + napH) * 10) / 10;

        setFormData((prev) => ({
            ...prev,
            [field]: val,
            nightSleepHours: nightH,
            sleepHours: total > 0 ? total : nightH,
        }));
    };

    // Evening Nap Sleep Change
    const handleNapSleepChange = (field: 'napStartTime' | 'napEndTime', val: string) => {
        const start = field === 'napStartTime' ? val : (formData.napStartTime || '');
        const end = field === 'napEndTime' ? val : (formData.napEndTime || '');
        const napH = calculateSleepDuration(start, end);
        const nightH = formData.nightSleepHours || 0;
        const total = Math.round((nightH + napH) * 10) / 10;

        setFormData((prev) => ({
            ...prev,
            [field]: val,
            hasNap: true,
            napHours: napH,
            sleepHours: total > 0 ? total : nightH,
        }));
    };

    const toggleNap = () => {
        const nextHasNap = !formData.hasNap;
        const nightH = formData.nightSleepHours || 0;
        const napH = nextHasNap ? (Number(formData.napHours) || 0) : 0;
        const total = Math.round((nightH + napH) * 10) / 10;

        setFormData((prev) => ({
            ...prev,
            hasNap: nextHasNap,
            sleepHours: total > 0 ? total : nightH,
        }));
    };

    // Task Management
    const addTask = () => {
        if (!newTaskText.trim()) return;
        const task: DailyTask = {
            id: Date.now().toString(),
            text: newTaskText.trim(),
            completed: false,
        };
        setFormData((prev) => ({
            ...prev,
            tasks: [...(prev.tasks || []), task],
        }));
        setNewTaskText('');
    };

    const toggleTask = (id: string) => {
        setFormData((prev) => ({
            ...prev,
            tasks: (prev.tasks || []).map((t) =>
                t.id === id ? { ...t, completed: !t.completed } : t
            ),
        }));
    };

    const deleteTask = (id: string) => {
        setFormData((prev) => ({
            ...prev,
            tasks: (prev.tasks || []).map((t) => t).filter((t) => t.id !== id),
        }));
    };

    // Custom Habits Checklist Management
    const addCustomHabit = () => {
        if (!newCustomHabitText.trim()) return;
        const habitItem: CustomHabitItem = {
            id: Date.now().toString(),
            label: newCustomHabitText.trim(),
            completed: false,
        };
        setFormData((prev) => ({
            ...prev,
            customHabits: [...(prev.customHabits || []), habitItem],
        }));
        setNewCustomHabitText('');
    };

    const toggleCustomHabit = (id: string) => {
        setFormData((prev) => ({
            ...prev,
            customHabits: (prev.customHabits || []).map((h) =>
                h.id === id ? { ...h, completed: !h.completed } : h
            ),
        }));
    };

    const deleteCustomHabit = (id: string) => {
        setFormData((prev) => ({
            ...prev,
            customHabits: (prev.customHabits || []).filter((h) => h.id !== id),
        }));
    };

    // Tag Management
    const toggleTag = (tag: string) => {
        setFormData((prev) => {
            const current = prev.tags || [];
            if (current.includes(tag)) {
                return { ...prev, tags: current.filter((t) => t !== tag) };
            } else {
                return { ...prev, tags: [...current, tag] };
            }
        });
    };

    const addCustomTag = () => {
        if (!customTagInput.trim()) return;
        const clean = customTagInput.trim().toLowerCase().replace(/#/g, '');
        if (!formData.tags?.includes(clean)) {
            setFormData((prev) => ({
                ...prev,
                tags: [...(prev.tags || []), clean],
            }));
        }
        setCustomTagInput('');
    };

    // Habit Toggles
    const toggleHabit = (habitKey: string) => {
        setFormData((prev) => ({
            ...prev,
            habits: {
                ...prev.habits,
                [habitKey]: !prev.habits?.[habitKey],
            },
        }));
    };

    // Custom Metrics
    const addCustomMetric = () => {
        if (!customMetricLabel.trim() || !customMetricValue.trim()) return;
        const metric: CustomMetric = {
            id: Date.now().toString(),
            label: customMetricLabel.trim(),
            value: customMetricValue.trim(),
        };
        setFormData((prev) => ({
            ...prev,
            customMetrics: [...(prev.customMetrics || []), metric],
        }));
        setCustomMetricLabel('');
        setCustomMetricValue('');
    };

    const deleteCustomMetric = (id: string) => {
        setFormData((prev) => ({
            ...prev,
            customMetrics: (prev.customMetrics || []).filter((m) => m.id !== id),
        }));
    };

    // Save
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveDailyLog(selectedDate, formData);
        } finally {
            setIsSaving(false);
        }
    };

    // Delete
    const handleDelete = async () => {
        await deleteDailyLog(selectedDate);
        setDeleteModalOpen(false);
    };

    // 365 Days Grid Generator for Activity Heatmap
    const heatmapDays = useMemo(() => {
        const days = [];
        const today = new Date();
        // Go back 52 weeks * 7 days = 364 days
        for (let i = 364; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            const log = logs.find((l) => l.date === dateStr);
            days.push({
                date: dateStr,
                log,
                hours: log?.codingHours || 0,
                tasksDone: log?.tasks?.filter((t) => t.completed).length || 0,
            });
        }
        return days;
    }, [logs]);

    // Screen Time Health Indicator
    const screenTimeTotalMin = (formData.screenTimeHours || 0) * 60 + (formData.screenTimeMinutes || 0);
    const screenHealth =
        screenTimeTotalMin <= 180
            ? { label: 'Optimal (< 3h)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
            : screenTimeTotalMin <= 300
            ? { label: 'Moderate (3h-5h)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
            : { label: 'High Screen Time (> 5h)', color: 'text-red-400 bg-red-500/10 border-red-500/20' };

    // Filtered logs for history search
    const filteredLogs = useMemo(() => {
        if (!searchQuery.trim()) return logs;
        const q = searchQuery.toLowerCase();
        return logs.filter(
            (l) =>
                l.date.includes(q) ||
                l.learnings?.toLowerCase().includes(q) ||
                l.challenges?.toLowerCase().includes(q) ||
                l.tags?.some((t) => t.toLowerCase().includes(q)) ||
                l.tasks?.some((t) => t.text.toLowerCase().includes(q))
        );
    }, [logs, searchQuery]);

    const isCurrentDateLogged = Boolean(getLogForDate(selectedDate));

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in pb-16 w-full max-w-full">
            {/* Header & Title */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 rounded-xl text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.15)] flex-shrink-0">
                            <Activity size={26} className="animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                                Daily Life & Dev Tracker
                                <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-medium">
                                    Private
                                </span>
                            </h1>
                            <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                                Log your daily dev progress, sleep schedule, screen time & life metrics.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Date Selector & Actions */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full xl:w-auto">
                    <button
                        type="button"
                        onClick={() => setSelectedDate(getTodayString())}
                        className={clsx(
                            'px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex-1 sm:flex-initial text-center',
                            selectedDate === getTodayString()
                                ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                        )}
                    >
                        Today
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedDate(getYesterdayString())}
                        className={clsx(
                            'px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex-1 sm:flex-initial text-center',
                            selectedDate === getYesterdayString()
                                ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                        )}
                    >
                        Yesterday
                    </button>
                    <div className="relative flex-1 sm:flex-initial min-w-[130px]">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-black/60 border border-white/15 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-orange-500 cursor-pointer"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all cursor-pointer disabled:opacity-50 flex-1 sm:flex-initial"
                    >
                        <Save size={15} />
                        <span>{isSaving ? 'Saving...' : 'Save Log'}</span>
                    </button>
                    {isCurrentDateLogged && (
                        <button
                            type="button"
                            onClick={() => setDeleteModalOpen(true)}
                            className="p-1.5 sm:p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all cursor-pointer"
                            title="Delete this entry"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
                {/* Streak Card */}
                <div className="bg-[#0e0e15] border border-orange-500/20 rounded-2xl p-3 sm:p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-all" />
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider">Streak</span>
                        <Flame className="text-orange-500 animate-bounce" size={18} />
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                        <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">{stats.currentStreak}</span>
                        <span className="text-xs text-orange-400 font-semibold">days 🔥</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">Best: {stats.longestStreak}d</p>
                </div>

                {/* Total Days Card */}
                <div className="bg-[#0e0e15] border border-white/5 rounded-2xl p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider">Logged</span>
                        <Trophy className="text-amber-400" size={16} />
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                        <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">{stats.totalDaysLogged}</span>
                        <span className="text-xs text-gray-400">days</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">Consistency</p>
                </div>

                {/* Dev Hours Card */}
                <div className="bg-[#0e0e15] border border-white/5 rounded-2xl p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider">Total Dev</span>
                        <Clock className="text-blue-400" size={16} />
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                        <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">{stats.totalCodingHours}</span>
                        <span className="text-xs text-blue-400 font-semibold">hrs</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">7d: {stats.avgCodingHoursWeekly}h/d</p>
                </div>

                {/* Screen Time Card */}
                <div className="bg-[#0e0e15] border border-white/5 rounded-2xl p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider">Avg Screen</span>
                        <Smartphone className="text-purple-400" size={16} />
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-1">
                        <span className="text-lg sm:text-xl lg:text-2xl font-extrabold text-white">
                            {Math.floor(stats.avgScreenTimeWeekly / 60)}h {stats.avgScreenTimeWeekly % 60}m
                        </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">7d daily avg</p>
                </div>

                {/* Sleep Card */}
                <div className="bg-[#0e0e15] border border-white/5 rounded-2xl p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider">Avg Sleep</span>
                        <Moon className="text-indigo-400" size={16} />
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                        <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">{stats.avgSleepHoursWeekly}</span>
                        <span className="text-xs text-indigo-400 font-semibold">hrs</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">7d average</p>
                </div>

                {/* Habits Card */}
                <div className="bg-[#0e0e15] border border-white/5 rounded-2xl p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider">Habits</span>
                        <Zap className="text-emerald-400" size={16} />
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                        <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-400">
                            {stats.habitSuccessRate}%
                        </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">Completion</p>
                </div>
            </div>

            {/* GitHub-Style 365 Days Activity Heatmap */}
            <div className="bg-[#0c0c13] border border-white/10 rounded-2xl p-3.5 sm:p-5 shadow-lg w-full max-w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-orange-400 flex-shrink-0" />
                        <h2 className="text-xs sm:text-base font-semibold text-white">
                            Activity & Consistency Heatmap (Past 365 Days)
                        </h2>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-gray-400 self-end sm:self-auto">
                        <span>Less</span>
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-xs bg-[#161622]" />
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-xs bg-orange-950/80 border border-orange-900/40" />
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-xs bg-orange-700/80" />
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-xs bg-orange-500" />
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-xs bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                        <span>More</span>
                    </div>
                </div>

                {/* Horizontal Scroll Grid for Heatmap */}
                <div className="overflow-x-auto pb-2 scrollbar-thin w-full max-w-full touch-pan-x">
                    <div className="inline-grid grid-rows-7 grid-flow-col gap-1 sm:gap-1.5 min-w-[700px]">
                        {heatmapDays.map((day) => {
                            const isSelected = day.date === selectedDate;
                            let colorCls = 'bg-[#14141e] border-white/5';
                            if (day.hours > 0 || day.tasksDone > 0) {
                                if (day.hours >= 6 || day.tasksDone >= 5) {
                                    colorCls = 'bg-amber-400 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]';
                                } else if (day.hours >= 3.5 || day.tasksDone >= 3) {
                                    colorCls = 'bg-orange-500 border-orange-400';
                                } else if (day.hours >= 1.5 || day.tasksDone >= 1) {
                                    colorCls = 'bg-orange-700/90 border-orange-600';
                                } else {
                                    colorCls = 'bg-orange-950 border-orange-900/60';
                                }
                            }

                            return (
                                <button
                                    key={day.date}
                                    type="button"
                                    onClick={() => setSelectedDate(day.date)}
                                    onMouseEnter={() => setHoveredDayData(day.log || null)}
                                    onMouseLeave={() => setHoveredDayData(null)}
                                    title={`${day.date}: ${day.hours}h coded, ${day.tasksDone} tasks done`}
                                    className={clsx(
                                        'w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-xs border transition-all cursor-pointer transform hover:scale-135 hover:z-10',
                                        colorCls,
                                        isSelected && 'ring-2 ring-white ring-offset-2 ring-offset-black scale-125'
                                    )}
                                />
                            );
                        })}
                    </div>
                </div>

                {hoveredDayData && (
                    <div className="mt-3 p-2.5 sm:p-3 bg-black/60 border border-white/10 rounded-xl text-[11px] sm:text-xs flex flex-wrap items-center gap-3 sm:gap-4 text-gray-300 animate-fade-in">
                        <span className="text-orange-400 font-semibold">{hoveredDayData.date}</span>
                        <span>💻 {hoveredDayData.codingHours || 0}h coded</span>
                        <span>📱 {hoveredDayData.screenTimeHours || 0}h {hoveredDayData.screenTimeMinutes || 0}m screen</span>
                        <span>🌙 {hoveredDayData.sleepHours || 0}h sleep</span>
                        <span>✅ {hoveredDayData.tasks?.filter((t) => t.completed).length || 0}/{hoveredDayData.tasks?.length || 0} tasks</span>
                    </div>
                )}
            </div>

            {/* Main 4 Logging Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full max-w-full">
                {/* ───────────────────────────────────────────────────────────── */}
                {/* CARD 1: 💻 Coding & Dev Progress */}
                {/* ───────────────────────────────────────────────────────────── */}
                <div className="bg-[#0c0c13] border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 w-full max-w-full overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2.5 text-orange-400 font-bold text-base sm:text-lg">
                            <Clock size={20} className="flex-shrink-0" />
                            <h2>Dev & Coding Progress</h2>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            <label className="text-xs text-gray-400 font-medium whitespace-nowrap">Hours Coded:</label>
                            <input
                                type="number"
                                min="0"
                                max="24"
                                step="0.5"
                                value={formData.codingHours || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, codingHours: parseFloat(e.target.value) || 0 })
                                }
                                className="w-20 bg-black/50 border border-orange-500/40 text-orange-400 font-bold rounded-lg px-2.5 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                        </div>
                    </div>

                    {/* Tasks Checklist */}
                    <div>
                        <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                            Daily Tasks & Accomplishments
                        </label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                                placeholder="Add a task or fix (press Enter)..."
                                className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-orange-500"
                            />
                            <button
                                type="button"
                                onClick={addTask}
                                className="bg-white/10 hover:bg-orange-500 text-white px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        {/* Tasks List */}
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {formData.tasks && formData.tasks.length > 0 ? (
                                formData.tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className={clsx(
                                            'flex items-center justify-between gap-2.5 p-2.5 rounded-xl border transition-all',
                                            task.completed
                                                ? 'bg-emerald-950/10 border-emerald-500/20 text-gray-400'
                                                : 'bg-black/30 border-white/5 text-gray-200 hover:border-white/15'
                                        )}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggleTask(task.id)}
                                            className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                                        >
                                            {task.completed ? (
                                                <CheckCircle2 size={17} className="text-emerald-400 flex-shrink-0" />
                                            ) : (
                                                <Circle size={17} className="text-gray-500 flex-shrink-0" />
                                            )}
                                            <span className={clsx('text-xs sm:text-sm truncate', task.completed && 'line-through text-gray-500')}>
                                                {task.text}
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => deleteTask(task.id)}
                                            className="text-gray-600 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-600 py-3 text-center italic">
                                    No tasks added for this day yet.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                            Tags & Topics
                        </label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {PRESET_TAGS.map((tag) => {
                                const isSelected = formData.tags?.includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleTag(tag)}
                                        className={clsx(
                                            'text-[11px] sm:text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer',
                                            isSelected
                                                ? 'bg-orange-500/20 border-orange-500/50 text-orange-400 font-semibold shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                                        )}
                                    >
                                        #{tag}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={customTagInput}
                                onChange={(e) => setCustomTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
                                placeholder="Add custom tag (e.g. redis, tailwind)..."
                                className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-orange-500"
                            />
                            <button
                                type="button"
                                onClick={addCustomTag}
                                className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer flex-shrink-0"
                            >
                                + Tag
                            </button>
                        </div>
                    </div>

                    {/* Learnings */}
                    <div>
                        <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                            💡 Key Learnings & Concepts
                        </label>
                        <textarea
                            value={formData.learnings || ''}
                            onChange={(e) => setFormData({ ...formData, learnings: e.target.value })}
                            rows={3}
                            placeholder="What new concepts, libraries, or algorithms did you learn today?"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-orange-500"
                        />
                    </div>

                    {/* Roadblocks & Solutions */}
                    <div>
                        <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                            🚧 Roadblocks & Solutions
                        </label>
                        <textarea
                            value={formData.challenges || ''}
                            onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                            rows={2}
                            placeholder="What broke, what caused it, and how did you resolve it?"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-orange-500"
                        />
                    </div>
                </div>

                {/* ───────────────────────────────────────────────────────────── */}
                {/* CARD 2 & 3: 📱 Screen Time & 🌙 Sleep */}
                {/* ───────────────────────────────────────────────────────────── */}
                <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
                    <div className="bg-[#0c0c13] border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 w-full max-w-full">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2.5 text-purple-400 font-bold text-base sm:text-lg">
                                <Smartphone size={20} className="flex-shrink-0" />
                                <h2>Phone Screen Time</h2>
                            </div>
                            <span className={clsx('text-[11px] sm:text-xs px-2.5 py-0.5 sm:py-1 rounded-full border font-semibold', screenHealth.color)}>
                                {screenHealth.label}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Total Hours</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="24"
                                    value={formData.screenTimeHours || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            screenTimeHours: parseInt(e.target.value) || 0,
                                        })
                                    }
                                    placeholder="0"
                                    className="w-full bg-black/40 border border-purple-500/30 text-purple-300 font-bold rounded-xl p-2 sm:p-2.5 text-center text-base sm:text-lg focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Total Minutes</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={formData.screenTimeMinutes || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            screenTimeMinutes: parseInt(e.target.value) || 0,
                                        })
                                    }
                                    placeholder="0"
                                    className="w-full bg-black/40 border border-purple-500/30 text-purple-300 font-bold rounded-xl p-2 sm:p-2.5 text-center text-base sm:text-lg focus:outline-none focus:border-purple-500"
                                />
                            </div>
                        </div>

                        {/* App Specific Breakdown (Instagram, WhatsApp, BGMI, Snapchat) */}
                        <div className="pt-2 border-t border-white/5 space-y-2">
                            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                                App-Specific Breakdown (Minutes)
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {/* Instagram */}
                                <div className="p-2 bg-gradient-to-br from-pink-950/20 to-purple-950/20 border border-pink-500/30 rounded-xl">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[11px] font-semibold text-pink-400">📸 Instagram</span>
                                        <span className="text-[10px] text-gray-400">mins</span>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.screenTimeBreakdown?.instagram || ''}
                                        onChange={(e) =>
                                            handleAppScreenTime('instagram', parseInt(e.target.value) || 0)
                                        }
                                        placeholder="0"
                                        className="w-full bg-black/50 border border-pink-500/30 text-pink-200 font-bold rounded-lg p-1 text-center text-sm focus:outline-none focus:border-pink-500"
                                    />
                                </div>

                                {/* WhatsApp */}
                                <div className="p-2 bg-gradient-to-br from-emerald-950/20 to-green-950/20 border border-emerald-500/30 rounded-xl">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[11px] font-semibold text-emerald-400">💬 WhatsApp</span>
                                        <span className="text-[10px] text-gray-400">mins</span>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.screenTimeBreakdown?.whatsapp || ''}
                                        onChange={(e) =>
                                            handleAppScreenTime('whatsapp', parseInt(e.target.value) || 0)
                                        }
                                        placeholder="0"
                                        className="w-full bg-black/50 border border-emerald-500/30 text-emerald-200 font-bold rounded-lg p-1 text-center text-sm focus:outline-none focus:border-emerald-500"
                                    />
                                </div>

                                {/* BGMI */}
                                <div className="p-2 bg-gradient-to-br from-amber-950/20 to-orange-950/20 border border-amber-500/30 rounded-xl">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[11px] font-semibold text-amber-400">🎮 BGMI</span>
                                        <span className="text-[10px] text-gray-400">mins</span>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.screenTimeBreakdown?.bgmi || ''}
                                        onChange={(e) =>
                                            handleAppScreenTime('bgmi', parseInt(e.target.value) || 0)
                                        }
                                        placeholder="0"
                                        className="w-full bg-black/50 border border-amber-500/30 text-amber-200 font-bold rounded-lg p-1 text-center text-sm focus:outline-none focus:border-amber-500"
                                    />
                                </div>

                                {/* Snapchat */}
                                <div className="p-2 bg-gradient-to-br from-yellow-950/20 to-amber-950/20 border border-yellow-500/30 rounded-xl">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[11px] font-semibold text-yellow-400">👻 Snapchat</span>
                                        <span className="text-[10px] text-gray-400">mins</span>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.screenTimeBreakdown?.snapchat || ''}
                                        onChange={(e) =>
                                            handleAppScreenTime('snapchat', parseInt(e.target.value) || 0)
                                        }
                                        placeholder="0"
                                        className="w-full bg-black/50 border border-yellow-500/30 text-yellow-200 font-bold rounded-lg p-1 text-center text-sm focus:outline-none focus:border-yellow-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                                App / Usage Notes
                            </label>
                            <input
                                type="text"
                                value={formData.screenTimeNote || ''}
                                onChange={(e) => setFormData({ ...formData, screenTimeNote: e.target.value })}
                                placeholder="e.g. YouTube tutorials, Instagram, reading docs..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {/* ───────────────────────────────────────────────────────────── */}
                    {/* CARD 3: 🌙 Sleep Schedule & Rest (Night + Evening Nap) */}
                    {/* ───────────────────────────────────────────────────────────── */}
                    <div className="bg-[#0c0c13] border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 w-full max-w-full">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2.5 text-indigo-400 font-bold text-base sm:text-lg">
                                <Moon size={20} className="flex-shrink-0" />
                                <h2>Sleep & Recovery</h2>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-gray-400">Total: </span>
                                <span className="text-xs sm:text-sm font-bold text-indigo-400">
                                    {formData.sleepHours || 0} hrs
                                </span>
                                {formData.hasNap && (formData.napHours || 0) > 0 && (
                                    <span className="text-[10px] text-gray-500 block">
                                        ({formData.nightSleepHours || 0}h night + {formData.napHours}h nap)
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Night Sleep */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                                🌙 Primary Sleep (Night)
                            </label>
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="text-[11px] text-gray-400 block mb-1">Bedtime</label>
                                    <input
                                        type="time"
                                        value={formData.sleepBedtime || ''}
                                        onChange={(e) => handleNightSleepChange('sleepBedtime', e.target.value)}
                                        className="w-full bg-black/40 border border-indigo-500/30 text-indigo-200 rounded-xl p-2 text-xs sm:text-sm text-center focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] text-gray-400 block mb-1">Wake Up</label>
                                    <input
                                        type="time"
                                        value={formData.sleepWakeTime || ''}
                                        onChange={(e) => handleNightSleepChange('sleepWakeTime', e.target.value)}
                                        className="w-full bg-black/40 border border-indigo-500/30 text-indigo-200 rounded-xl p-2 text-xs sm:text-sm text-center focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Evening Nap / 2nd Sleep Toggle */}
                        <div className="pt-2 border-t border-white/5 space-y-2.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    🌇 Evening / Afternoon Nap (2nd Sleep)
                                </label>
                                <button
                                    type="button"
                                    onClick={toggleNap}
                                    className={clsx(
                                        'text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer',
                                        formData.hasNap
                                            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                    )}
                                >
                                    {formData.hasNap ? '✓ Nap Added' : '+ Add Nap'}
                                </button>
                            </div>

                            {formData.hasNap && (
                                <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 bg-black/40 border border-indigo-500/20 rounded-xl animate-fade-in">
                                    <div>
                                        <label className="text-[11px] text-gray-400 block mb-1">Nap Start</label>
                                        <input
                                            type="time"
                                            value={formData.napStartTime || ''}
                                            onChange={(e) => handleNapSleepChange('napStartTime', e.target.value)}
                                            className="w-full bg-black/60 border border-indigo-500/40 text-indigo-200 rounded-xl p-2 text-xs sm:text-sm text-center focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-gray-400 block mb-1">Nap Wake Up</label>
                                        <input
                                            type="time"
                                            value={formData.napEndTime || ''}
                                            onChange={(e) => handleNapSleepChange('napEndTime', e.target.value)}
                                            className="w-full bg-black/60 border border-indigo-500/40 text-indigo-200 rounded-xl p-2 text-xs sm:text-sm text-center focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sleep Quality */}
                        <div>
                            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                                How rested do you feel?
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                                {SLEEP_QUALITIES.map((q) => {
                                    const isSelected = formData.sleepQuality === q.id;
                                    return (
                                        <button
                                            key={q.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, sleepQuality: q.id })}
                                            className={clsx(
                                                'p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer text-center',
                                                isSelected
                                                    ? q.color
                                                    : 'bg-black/30 border-white/5 text-gray-400 hover:bg-white/5'
                                            )}
                                        >
                                            <span className="text-base">{q.icon}</span>
                                            <span className="text-[11px] font-medium">{q.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* CARD 4: ⚡ Daily Habits & Custom Metrics */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="bg-[#0c0c13] border border-white/10 rounded-2xl p-4 sm:p-6 space-y-5 sm:space-y-6 w-full max-w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-base sm:text-lg">
                        <Zap size={20} className="flex-shrink-0" />
                        <h2>Habits & Custom Metric Tracker</h2>
                    </div>

                    {/* Daily Energy / Mood Stars */}
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 self-start sm:self-auto">
                        <span className="text-xs text-gray-400">Energy Rating:</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, energyRating: star })}
                                    className="text-base hover:scale-125 transition-transform cursor-pointer"
                                >
                                    {star <= (formData.energyRating || 4) ? '🔥' : '⚪'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preset Habits Grid */}
                <div>
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-3">
                        Daily Consistency Checklist
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                        {PRESET_HABITS.map((habit) => {
                            const isChecked = Boolean(formData.habits?.[habit.key]);
                            return (
                                <button
                                    key={habit.key}
                                    type="button"
                                    onClick={() => toggleHabit(habit.key)}
                                    className={clsx(
                                        'p-2.5 sm:p-3 rounded-xl border flex flex-col items-center gap-1.5 sm:gap-2 transition-all cursor-pointer',
                                        isChecked
                                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-[1.02]'
                                            : 'bg-black/30 border-white/5 text-gray-400 hover:bg-white/5'
                                    )}
                                >
                                    <span className="text-xl sm:text-2xl">{habit.icon}</span>
                                    <span className="text-[11px] sm:text-xs text-center line-clamp-1">{habit.label}</span>
                                    <span className="text-[9px] sm:text-[10px] font-bold mt-auto">
                                        {isChecked ? '✓ DONE' : '○ PENDING'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 👟 Step Count & Activity Tracker */}
                <div className="border-t border-white/5 pt-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm sm:text-base">
                            <Footprints size={18} />
                            <h3>Daily Step Count</h3>
                        </div>
                        <span className="text-xs text-gray-400">
                            Goal: <span className="text-cyan-300 font-semibold">{formData.stepsGoal || 10000} steps</span>
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Steps Walked Today</label>
                            <input
                                type="number"
                                min="0"
                                max="100000"
                                value={formData.stepsCount || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, stepsCount: parseInt(e.target.value) || 0 })
                                }
                                placeholder="e.g. 8500"
                                className="w-full bg-black/40 border border-cyan-500/30 text-cyan-300 font-bold rounded-xl p-2.5 text-base sm:text-lg focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Step Goal</label>
                            <input
                                type="number"
                                min="1000"
                                max="100000"
                                step="500"
                                value={formData.stepsGoal || 10000}
                                onChange={(e) =>
                                    setFormData({ ...formData, stepsGoal: parseInt(e.target.value) || 10000 })
                                }
                                className="w-full bg-black/40 border border-white/10 text-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                    </div>

                    {/* Steps Progress Bar */}
                    {Boolean(formData.stepsGoal) && (
                        <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">
                                    {formData.stepsCount >= (formData.stepsGoal || 10000)
                                        ? '🏆 Daily Goal Reached!'
                                        : formData.stepsCount >= (formData.stepsGoal || 10000) * 0.5
                                        ? '👟 Great Pace!'
                                        : '🚶‍♂️ Getting active'}
                                </span>
                                <span className="font-bold text-cyan-400">
                                    {Math.min(100, Math.round(((formData.stepsCount || 0) / (formData.stepsGoal || 10000)) * 100))}%
                                </span>
                            </div>
                            <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 rounded-full"
                                    style={{
                                        width: `${Math.min(100, ((formData.stepsCount || 0) / (formData.stepsGoal || 10000)) * 100)}%`,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* 📝 Interactive Custom Habits Checklist */}
                <div className="border-t border-white/5 pt-4 space-y-3">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                        Custom Daily Habits Checklist
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newCustomHabitText}
                            onChange={(e) => setNewCustomHabitText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addCustomHabit()}
                            placeholder="Add your own custom habit or daily goal (e.g. Cold Shower, Leetcode Contest)..."
                            className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                            type="button"
                            onClick={addCustomHabit}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
                        >
                            <Plus size={16} className="mr-1 hidden sm:inline" />
                            <span>Add Habit</span>
                        </button>
                    </div>

                    {/* Custom Habits List */}
                    {formData.customHabits && formData.customHabits.length > 0 && (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {formData.customHabits.map((habit) => (
                                <div
                                    key={habit.id}
                                    className={clsx(
                                        'flex items-center justify-between gap-2.5 p-2.5 rounded-xl border transition-all',
                                        habit.completed
                                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                            : 'bg-black/30 border-white/5 text-gray-300 hover:border-white/15'
                                    )}
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleCustomHabit(habit.id)}
                                        className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                                    >
                                        {habit.completed ? (
                                            <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                                        ) : (
                                            <Circle size={18} className="text-gray-500 flex-shrink-0" />
                                        )}
                                        <span className={clsx('text-xs sm:text-sm truncate', habit.completed && 'line-through text-gray-400 font-medium')}>
                                            {habit.label}
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => deleteCustomHabit(habit.id)}
                                        className="text-gray-600 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 🏷️ Custom Metric (Key-Value) Trackers */}
                <div className="border-t border-white/5 pt-4">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                        Custom Key-Value Trackers (Weight, Calories, etc.)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                        <input
                            type="text"
                            value={customMetricLabel}
                            onChange={(e) => setCustomMetricLabel(e.target.value)}
                            placeholder="Metric name (e.g. Weight, Calories, Gym PR)"
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500"
                        />
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={customMetricValue}
                                onChange={(e) => setCustomMetricValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addCustomMetric()}
                                placeholder="Value (e.g. 72kg, 2100 kcal)"
                                className="flex-1 sm:w-40 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500"
                            />
                            <button
                                type="button"
                                onClick={addCustomMetric}
                                className="bg-white/10 hover:bg-emerald-600 hover:text-white text-gray-200 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
                            >
                                + Add
                            </button>
                        </div>
                    </div>

                    {/* Custom Metrics List */}
                    {formData.customMetrics && formData.customMetrics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {formData.customMetrics.map((m) => (
                                <div
                                    key={m.id}
                                    className="flex items-center gap-2 bg-emerald-950/20 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs text-emerald-300"
                                >
                                    <span className="font-semibold text-gray-200">{m.label}:</span>
                                    <span>{m.value}</span>
                                    <button
                                        type="button"
                                        onClick={() => deleteCustomMetric(m.id)}
                                        className="text-gray-500 hover:text-red-400 ml-1 transition-colors"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* LOG HISTORY & SEARCH */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="bg-[#0c0c13] border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-gray-200 font-bold text-sm sm:text-base">
                        <Calendar size={18} className="text-orange-400" />
                        <h2>Log History & Search</h2>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search logs, tags, tasks..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-orange-500"
                        />
                    </div>
                </div>

                {filteredLogs.length > 0 ? (
                    <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                        {filteredLogs.map((log) => (
                            <div
                                key={log.id}
                                onClick={() => setSelectedDate(log.date)}
                                className={clsx(
                                    'p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3',
                                    selectedDate === log.date
                                        ? 'bg-orange-500/10 border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                                        : 'bg-black/30 border-white/5 hover:border-white/20'
                                )}
                            >
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                        <span className="font-bold text-xs sm:text-sm text-white">{log.date}</span>
                                        {log.energyRating && (
                                            <span className="text-xs">{'🔥'.repeat(log.energyRating)}</span>
                                        )}
                                        {log.tags && log.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {log.tags.slice(0, 3).map((t) => (
                                                    <span
                                                        key={t}
                                                        className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-orange-400"
                                                    >
                                                        #{t}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {log.learnings && (
                                        <p className="text-xs text-gray-400 line-clamp-1">💡 {log.learnings}</p>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs text-gray-400 font-medium pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                                    <span className="text-orange-400 font-semibold">💻 {log.codingHours || 0}h</span>
                                    <span>📱 {log.screenTimeHours || 0}h {log.screenTimeMinutes || 0}m</span>
                                    <span>🌙 {log.sleepHours || 0}h</span>
                                    {Boolean(log.stepsCount) && (
                                        <span className="text-cyan-400 font-medium">👟 {log.stepsCount} steps</span>
                                    )}
                                    <span className="text-emerald-400 font-semibold">
                                        ✅ {log.tasks?.filter((t) => t.completed).length || 0}/{log.tasks?.length || 0}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-gray-500 py-6 text-center italic">
                        {loading ? 'Loading logs...' : 'No logs match your search criteria.'}
                    </p>
                )}
            </div>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                title="Delete Daily Log"
                message={`Are you sure you want to delete the daily log for ${selectedDate}? This action cannot be undone.`}
                isDestructive={true}
                onConfirm={handleDelete}
                onClose={() => setDeleteModalOpen(false)}
            />
        </div>
    );
};

export default AdminDailyTracker;
