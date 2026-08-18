import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export interface DailyTask {
    id: string;
    text: string;
    completed: boolean;
}

export interface CustomMetric {
    id: string;
    label: string;
    value: string;
}

export interface CustomHabitItem {
    id: string;
    label: string;
    completed: boolean;
}

export interface DailyLog {
    id: string; // YYYY-MM-DD
    date: string; // YYYY-MM-DD
    userId?: string;
    // Coding & Work
    codingHours: number;
    tasks: DailyTask[];
    learnings: string;
    challenges: string;
    tags: string[];
    // Screen Time (Total & App Breakdown)
    screenTimeHours: number;
    screenTimeMinutes: number;
    screenTimeNote: string;
    screenTimeBreakdown?: {
        instagram?: number; // in minutes
        whatsapp?: number;  // in minutes
        bgmi?: number;      // in minutes
        snapchat?: number;  // in minutes
        [key: string]: number | undefined;
    };
    // Sleep Schedule (Night & Evening Nap)
    sleepBedtime: string; // e.g. "23:30"
    sleepWakeTime: string; // e.g. "07:00"
    nightSleepHours: number;
    hasNap?: boolean;
    napStartTime?: string; // e.g. "17:00"
    napEndTime?: string; // e.g. "18:30"
    napHours?: number;
    sleepHours: number; // Total = Night + Nap
    sleepQuality: 'energized' | 'good' | 'okay' | 'tired' | 'exhausted';
    // Steps & Activity
    stepsCount: number;
    stepsGoal: number;
    // Habits & Health
    habits: {
        dsa?: boolean;
        mern?: boolean;
        genai?: boolean;
        workout?: boolean;
        water?: boolean; // 3L+
        reading?: boolean;
        noJunkFood?: boolean;
        [key: string]: boolean | undefined;
    };
    customHabits: CustomHabitItem[];
    energyRating: number; // 1 to 5
    customMetrics: CustomMetric[];
    notes?: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface TrackerStats {
    currentStreak: number;
    longestStreak: number;
    totalDaysLogged: number;
    totalCodingHours: number;
    avgCodingHoursWeekly: number;
    avgScreenTimeWeekly: number; // in minutes
    avgSleepHoursWeekly: number;
    habitSuccessRate: number; // percentage
}

interface DailyTrackerContextType {
    logs: DailyLog[];
    loading: boolean;
    stats: TrackerStats;
    getLogForDate: (dateStr: string) => DailyLog | undefined;
    saveDailyLog: (dateStr: string, logData: Partial<DailyLog>) => Promise<void>;
    deleteDailyLog: (dateStr: string) => Promise<void>;
}

const DailyTrackerContext = createContext<DailyTrackerContextType | undefined>(undefined);

export const defaultDailyLog = (dateStr: string): DailyLog => ({
    id: dateStr,
    date: dateStr,
    codingHours: 0,
    tasks: [],
    learnings: '',
    challenges: '',
    tags: [],
    screenTimeHours: 0,
    screenTimeMinutes: 0,
    screenTimeNote: '',
    screenTimeBreakdown: {
        instagram: 0,
        whatsapp: 0,
        bgmi: 0,
        snapchat: 0,
    },
    sleepBedtime: '',
    sleepWakeTime: '',
    nightSleepHours: 0,
    hasNap: false,
    napStartTime: '',
    napEndTime: '',
    napHours: 0,
    sleepHours: 0,
    sleepQuality: 'good',
    stepsCount: 0,
    stepsGoal: 10000,
    habits: {
        dsa: false,
        mern: false,
        genai: false,
        workout: false,
        water: false,
        reading: false,
        noJunkFood: false,
    },
    customHabits: [],
    energyRating: 4,
    customMetrics: [],
    notes: '',
});

export const DailyTrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Subscribe to firestore daily logs when user is logged in
    useEffect(() => {
        if (!user) {
            setLogs([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const logsRef = collection(db, 'daily_logs');
        const q = query(logsRef, orderBy('date', 'desc'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const fetchedLogs: DailyLog[] = [];
                snapshot.forEach((docSnap) => {
                    const data = docSnap.data() as DailyLog;
                    fetchedLogs.push({
                        ...defaultDailyLog(docSnap.id),
                        ...data,
                        id: docSnap.id,
                        date: data.date || docSnap.id,
                    });
                });
                setLogs(fetchedLogs);
                setLoading(false);
            },
            (error) => {
                console.error('Failed to subscribe to daily_logs:', error);
                toast.error('Could not load daily logs.');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    // Calculate Streaks and Statistics
    const stats: TrackerStats = useMemo(() => {
        if (!logs.length) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                totalDaysLogged: 0,
                totalCodingHours: 0,
                avgCodingHoursWeekly: 0,
                avgScreenTimeWeekly: 0,
                avgSleepHoursWeekly: 0,
                habitSuccessRate: 0,
            };
        }

        const dateSet = new Set(logs.map((l) => l.date));
        const totalDaysLogged = logs.length;
        const totalCodingHours = logs.reduce((acc, l) => acc + (Number(l.codingHours) || 0), 0);

        // Sort dates chronologically ascending
        const sortedDates = Array.from(dateSet).sort();

        // Calculate Longest Streak
        let longest = 0;
        let currentRun = 0;
        let prevTime: number | null = null;

        for (const dateStr of sortedDates) {
            const currentT = new Date(dateStr).getTime();
            if (prevTime === null) {
                currentRun = 1;
            } else {
                const diffDays = Math.round((currentT - prevTime) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    currentRun++;
                } else if (diffDays > 1) {
                    currentRun = 1;
                }
            }
            prevTime = currentT;
            if (currentRun > longest) longest = currentRun;
        }

        // Calculate Current Streak from today / yesterday
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let streak = 0;
        let checkDate = new Date(today);

        // If today isn't logged yet, check if yesterday was logged to preserve streak
        const todayStr = checkDate.toISOString().split('T')[0];
        if (!dateSet.has(todayStr)) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (dateSet.has(dateStr)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        // Last 7 days averages
        const past7DaysLogs = logs.slice(0, 7);
        const count7 = past7DaysLogs.length || 1;

        const sumCoding7 = past7DaysLogs.reduce((acc, l) => acc + (Number(l.codingHours) || 0), 0);
        const sumScreenMin7 = past7DaysLogs.reduce(
            (acc, l) =>
                acc + (Number(l.screenTimeHours) || 0) * 60 + (Number(l.screenTimeMinutes) || 0),
            0
        );
        const sumSleep7 = past7DaysLogs.reduce((acc, l) => acc + (Number(l.sleepHours) || 0), 0);

        // Habit completion in last 7 days
        let totalHabitsTracked = 0;
        let completedHabits = 0;
        past7DaysLogs.forEach((l) => {
            if (l.habits) {
                Object.values(l.habits).forEach((val) => {
                    if (typeof val === 'boolean') {
                        totalHabitsTracked++;
                        if (val) completedHabits++;
                    }
                });
            }
        });

        const habitSuccessRate =
            totalHabitsTracked > 0 ? Math.round((completedHabits / totalHabitsTracked) * 100) : 0;

        return {
            currentStreak: streak,
            longestStreak: Math.max(longest, streak),
            totalDaysLogged,
            totalCodingHours: Math.round(totalCodingHours * 10) / 10,
            avgCodingHoursWeekly: Math.round((sumCoding7 / count7) * 10) / 10,
            avgScreenTimeWeekly: Math.round(sumScreenMin7 / count7),
            avgSleepHoursWeekly: Math.round((sumSleep7 / count7) * 10) / 10,
            habitSuccessRate,
        };
    }, [logs]);

    const getLogForDate = (dateStr: string) => {
        return logs.find((l) => l.date === dateStr);
    };

    const saveDailyLog = async (dateStr: string, logData: Partial<DailyLog>) => {
        if (!user) {
            toast.error('You must be logged in as admin to save logs.');
            return;
        }

        try {
            const docRef = doc(db, 'daily_logs', dateStr);
            const existing = getLogForDate(dateStr) || defaultDailyLog(dateStr);

            const payload: DailyLog = {
                ...existing,
                ...logData,
                id: dateStr,
                date: dateStr,
                userId: user.uid,
                updatedAt: serverTimestamp(),
                createdAt: existing.createdAt || serverTimestamp(),
            };

            await setDoc(docRef, payload, { merge: true });
            toast.success(`Log for ${dateStr} saved! 🔥`);
        } catch (error) {
            console.error('Error saving daily log:', error);
            toast.error('Failed to save log to database.');
            throw error;
        }
    };

    const deleteDailyLog = async (dateStr: string) => {
        if (!user) return;
        try {
            const docRef = doc(db, 'daily_logs', dateStr);
            await deleteDoc(docRef);
            toast.success(`Log for ${dateStr} deleted`);
        } catch (error) {
            console.error('Error deleting daily log:', error);
            toast.error('Failed to delete log.');
            throw error;
        }
    };

    return (
        <DailyTrackerContext.Provider
            value={{
                logs,
                loading,
                stats,
                getLogForDate,
                saveDailyLog,
                deleteDailyLog,
            }}
        >
            {children}
        </DailyTrackerContext.Provider>
    );
};

export const useDailyTracker = () => {
    const context = useContext(DailyTrackerContext);
    if (!context) {
        throw new Error('useDailyTracker must be used within a DailyTrackerProvider');
    }
    return context;
};
