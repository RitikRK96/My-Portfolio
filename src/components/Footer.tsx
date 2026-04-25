import { Link } from 'react-router-dom';
import { Mail, Phone, Github, Linkedin, Terminal } from 'lucide-react';

const LINKS = [
    { label: 'Home',     to: '/' },
    { label: 'Projects', to: '/projects' },
    { label: 'Blogs',    to: '/blogs' },
    { label: 'Photos',   to: '/photos' },
    { label: 'Songs',    to: '/songs' },
    { label: 'Contact',  to: '/contact' },
];

const Footer = () => (
    <footer className="border-t border-white/5 mt-12 bg-[#0a0a0f]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-8">
                {/* Brand */}
                <div>
                    <Link to="/" className="text-2xl font-black orbitron tracking-tighter transition-all hover:scale-105 flex items-center gap-2 mb-3 w-fit neon-switch">
                        <Terminal className="w-6 h-6" />
                        Ritik Kumar
                    </Link>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Full-Stack Developer &amp; Project Engineer passionate about building impactful digital experiences.
                    </p>
                </div>

                {/* Quick Links — 2 × 3 grid */}
                <div>
                    <h4 className="text-xs orbitron text-gray-500 tracking-widest uppercase mb-4">Quick Links</h4>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                        {LINKS.map(l => (
                            <li key={l.to}>
                                <Link
                                    to={l.to}
                                    className="text-gray-400 hover:text-neon-blue text-sm transition-colors flex items-center gap-1.5 group"
                                >
                                    <span className="w-1 h-1 rounded-full bg-neon-blue/50 group-hover:bg-neon-blue transition-colors shrink-0" />
                                    {l.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-xs orbitron text-gray-500 tracking-widest uppercase mb-4">Contact</h4>
                    <ul className="space-y-3">
                        <li>
                            <a href="mailto:ritikrk008@gmail.com"
                                className="text-gray-400 hover:text-neon-blue text-sm transition-colors flex items-center gap-2 group">
                                <Mail size={14} className="text-neon-blue/60 shrink-0" />
                                ritikrk008@gmail.com
                            </a>
                        </li>
                        <li>
                            <a href="mailto:hello@ritik.world"
                                className="text-gray-400 hover:text-neon-blue text-sm transition-colors flex items-center gap-2">
                                <Mail size={14} className="text-neon-blue/60 shrink-0" />
                                hello@ritik.world
                            </a>
                        </li>
                        <li>
                            <a href="tel:+919693895842"
                                className="text-gray-400 hover:text-green-400 text-sm transition-colors flex items-center gap-2">
                                <Phone size={14} className="text-green-400/60 shrink-0" />
                                +91 96938 95842
                            </a>
                        </li>
                        <li className="flex gap-3 pt-1">
                            <a href="https://github.com/RitikRK96" target="_blank" rel="noreferrer"
                                className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all">
                                <Github size={16} />
                            </a>
                            <a href="https://linkedin.com/in/ritik-kumar" target="_blank" rel="noreferrer"
                                className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-neon-blue hover:border-neon-blue/40 transition-all">
                                <Linkedin size={16} />
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-gray-600 text-xs">
                <span>© {new Date().getFullYear()} Ritik Kumar. All rights reserved.</span>
                <span className="orbitron tracking-widest">BUILT WITH ❤️ &amp; REACT</span>
            </div>
        </div>
    </footer>
);

export default Footer;
