import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Projects', path: '/projects' },
        { name: 'Blogs', path: '/blogs' },
        { name: 'Photos', path: '/photos' },
        { name: 'Songs', path: '/songs' },
        { name: 'Contact', path: '/contact' },
    ];

    const adminLinks = [
        { name: 'Dashboard', path: '/admin' },
    ];

    const links = user ? [...navLinks, ...adminLinks] : navLinks;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass bg-black/20 backdrop-blur-md border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-2xl font-bold tracking-tighter hover:text-blue-400 transition-colors flex items-center gap-2">
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

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden glass border-t border-white/10">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {links.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={clsx(
                                    'block px-3 py-2 rounded-md text-base font-medium',
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
                                onClick={() => { logout(); setIsOpen(false); }}
                                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-300 hover:text-red-100 hover:bg-red-500/20"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
