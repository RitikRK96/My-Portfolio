import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();

    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Projects', path: '/projects' },
        { name: 'Blogs', path: '/blogs' },
        { name: 'Photos', path: '/photos' },
        // { name: 'Songs', path: '/songs' }, // Hidden for normal users
        { name: 'Contact', path: '/contact' },
    ];

    const adminLinks = [
        { name: 'Dashboard', path: '/admin' },
    ];

    const links = user ? [...navLinks, ...adminLinks] : navLinks;

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 glass bg-black/20 backdrop-blur-md border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex-shrink-0">
                            <Link to="/" className="text-2xl font-black orbitron tracking-tighter transition-all hover:scale-105 flex items-center gap-2 neon-switch">
                                <Terminal className="w-6 h-6" />
                                Ritik Kumar
                            </Link>
                        </div>

                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {links.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        className={clsx(
                                            'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                                            location.pathname === link.path
                                                ? 'bg-white/20 text-white'
                                                : 'text-gray-300 hover:text-white hover:bg-white/10'
                                        )}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                                {user && (
                                    <button
                                        onClick={logout}
                                        className="px-3 py-2 rounded-md text-sm font-medium text-red-300 hover:text-red-100 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="-mr-2 flex md:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none"
                            >
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile menu full screen */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="fixed inset-0 z-[49] md:hidden bg-[#0a0a0f]/95 backdrop-blur-2xl flex flex-col items-center justify-center pt-16"
                    >
                        <div className="flex flex-col items-center space-y-4 w-full px-8 max-h-[80vh] overflow-y-auto pb-10">
                            {links.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="w-full max-w-sm"
                                >
                                    <Link
                                        to={link.path}
                                        onClick={() => setIsOpen(false)}
                                        className={clsx(
                                            'block text-center text-3xl orbitron font-bold tracking-widest py-5 rounded-2xl transition-all border border-transparent',
                                            location.pathname === link.path
                                                ? 'text-neon-blue bg-neon-blue/10 border-neon-blue/20 shadow-[0_0_15px_rgba(0,255,255,0.15)]'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        )}
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                            {user && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: links.length * 0.1 }}
                                    className="w-full max-w-sm pt-6 mt-2 border-t border-white/10"
                                >
                                    <button
                                        onClick={() => { logout(); setIsOpen(false); }}
                                        className="w-full text-center text-2xl font-bold py-5 rounded-2xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                                    >
                                        Logout
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
