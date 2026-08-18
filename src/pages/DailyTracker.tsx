import React from 'react';
import AdminDailyTracker from '../components/admin/AdminDailyTracker';
import { Link } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, BookOpen } from 'lucide-react';

const DailyTracker: React.FC = () => {
    return (
        <div className="min-h-screen pb-16 pt-2 sm:pt-4 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full overflow-x-hidden">
            {/* Top Navigation / Breadcrumb */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 mb-5 pt-1">
                <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-orange-400 transition-colors py-1.5 px-3 rounded-xl bg-white/5 border border-white/5 hover:border-orange-500/30"
                >
                    <ArrowLeft size={15} />
                    <span>Back to Portfolio</span>
                </Link>

                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        to="/admin"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors py-1.5 px-2.5 sm:px-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/15"
                    >
                        <LayoutDashboard size={14} />
                        <span>CMS Panel</span>
                    </Link>
                    <Link
                        to="/admin/books"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors py-1.5 px-2.5 sm:px-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/15"
                    >
                        <BookOpen size={14} />
                        <span>Writer Studio</span>
                    </Link>
                </div>
            </div>

            {/* Standalone Tracker Dashboard */}
            <AdminDailyTracker />
        </div>
    );
};

export default DailyTracker;
