import { useLocation, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingAddButton = () => {
    const { pathname } = useLocation();
    const { user } = useAuth();

    if (!user) return null;

    let tab = '';
    let label = '';

    if (pathname === '/projects') {
        tab = 'projects';
        label = 'Add Project';
    } else if (pathname === '/blogs') {
        tab = 'blogs';
        label = 'Add Blog';
    } else if (pathname === '/photos') {
        tab = 'photos';
        label = 'Add Photo';
    }

    if (!tab) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="fixed top-20 sm:top-24 right-4 sm:right-8 z-[48]"
            >
                <Link
                    to={`/admin?tab=${tab}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full font-bold text-xs sm:text-sm transition-all shadow-[0_4px_15px_rgba(255,100,0,0.35)] hover:shadow-[0_6px_20px_rgba(255,100,0,0.5)] hover:scale-105 border border-white/10 select-none cursor-pointer"
                    title={label}
                >
                    <Plus size={16} />
                    <span>{label}</span>
                </Link>
            </motion.div>
        </AnimatePresence>
    );
};

export default FloatingAddButton;
