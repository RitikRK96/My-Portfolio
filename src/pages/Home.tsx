import { useState, useEffect, useRef } from 'react';
import { Github, Linkedin, Mail, Briefcase, GraduationCap, Award, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContactSection from '../components/ContactSection';
import { useSEO } from '../hooks/useSEO';

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(words: string[], speed = 110, pause = 1800) {
    const [displayed, setDisplayed] = useState('');
    const [wordIdx, setWordIdx] = useState(0);
    const [charIdx, setCharIdx] = useState(0);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const current = words[wordIdx];
        let timeout: ReturnType<typeof setTimeout>;

        if (!deleting && charIdx <= current.length) {
            timeout = setTimeout(() => setCharIdx(c => c + 1), speed);
        } else if (!deleting && charIdx > current.length) {
            timeout = setTimeout(() => setDeleting(true), pause);
        } else if (deleting && charIdx > 0) {
            timeout = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
        } else {
            setDeleting(false);
            setWordIdx(i => (i + 1) % words.length);
        }

        setDisplayed(current.slice(0, charIdx));
        return () => clearTimeout(timeout);
    }, [charIdx, deleting, wordIdx, words, speed, pause]);

    return displayed;
}

// ── Animated counter ─────────────────────────────────────────────────────────
function useCounter(target: number, duration = 1200) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                const start = performance.now();
                const tick = (now: number) => {
                    const progress = Math.min((now - start) / duration, 1);
                    setCount(Math.floor(progress * target));
                    if (progress < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            }
        }, { threshold: 0.5 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [target, duration]);

    return { count, ref };
}

const StatCounter = ({ val, label }: { val: string; label: string }) => {
    const num = parseInt(val);
    const { count, ref } = useCounter(num);
    return (
        <div ref={ref} className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white orbitron">
                {count}<span className="text-orange-400">+</span>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 mt-0.5">{label}</div>
        </div>
    );
};

const WEB_SKILLS = [
    { name: 'React.js', icon: 'https://cdn.simpleicons.org/react' },
    { name: 'Node.js', icon: 'https://cdn.simpleicons.org/nodedotjs' },
    { name: 'TypeScript', icon: 'https://cdn.simpleicons.org/typescript' },
    { name: 'Firebase', icon: 'https://cdn.simpleicons.org/firebase' },
    { name: 'Tailwind CSS', icon: 'https://cdn.simpleicons.org/tailwindcss' },
    { name: 'Git', icon: 'https://cdn.simpleicons.org/git' },
];

import powerbiIcon from '../assets/powerbi.png';
import tableauIcon from '../assets/tableau.png';

const AI_SKILLS = [
    { name: 'Python', icon: 'https://cdn.simpleicons.org/python' },
    { name: 'Databricks', icon: 'https://cdn.simpleicons.org/databricks' },
    { name: 'Apache Spark', icon: 'https://cdn.simpleicons.org/apachespark' },
    { name: 'Power BI', icon: powerbiIcon },
    { name: 'Pandas', icon: 'https://cdn.simpleicons.org/pandas/white' },
    { name: 'Scikit-learn', icon: 'https://cdn.simpleicons.org/scikitlearn' },
    { name: 'LangChain', icon: 'https://cdn.simpleicons.org/langchain/white' },
    { name: 'Azure', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg' },
    { name: 'Tableau', icon: tableauIcon },
    { name: 'SQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg' },
];

const Home = () => {
    const typedRole = useTypewriter([
        'Full-Stack Shinobi',
        'React Developer',
        'AI Engineer',
    ], 90, 2000);

    useSEO(
        "Ritik Kumar | Full-Stack Developer & AI Specialist",
        "Portfolio of Ritik Kumar, a Full-Stack Developer specializing in React.js, Node.js, and Data Analytics & AI.",
        "Ritik Kumar, Full-Stack Developer, React.js, Node.js, AI, Data Analytics",
        "https://avatars.githubusercontent.com/u/96340458?v=4",
        "https://ritik.world/"
    );

    return (
        <div className="space-y-0">
            <div className="naruto-bg" />
            {/* ── Hero ── */}
            <section className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
                {/* Floating ambient orbs */}
                <div className="absolute top-1/4 left-[10%] w-64 h-64 bg-orange-500/5 rounded-full blur-[80px] animate-[pulse_6s_ease-in-out_infinite] pointer-events-none" />
                <div className="absolute bottom-1/4 right-[10%] w-48 h-48 bg-red-500/5 rounded-full blur-[60px] animate-[pulse_8s_ease-in-out_infinite_2s] pointer-events-none" />
                <div className="absolute top-[60%] left-[40%] w-32 h-32 bg-orange-400/3 rounded-full blur-[40px] animate-[pulse_10s_ease-in-out_infinite_4s] pointer-events-none" />
                <div className="w-full max-w-6xl mx-auto z-10">
                    <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-10 lg:gap-16">
                        {/* Text */}
                        <div className="flex-1 text-center lg:text-left" data-aos="fade-up">
                            <div className="flex justify-center lg:justify-start mb-6">
                                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-bold tracking-wide backdrop-blur-sm">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                    </span>
                                    AVAILABLE FOR NINJA MISSIONS
                                </div>
                            </div>

                            <span className="inline-block text-gray-400 text-sm sm:text-base orbitron tracking-[.25em] mb-4 min-h-[1.5em]">
                                {'<'} <span className="text-orange-400">{typedRole}</span>
                                <span className="inline-block w-0.5 h-4 bg-orange-400 ml-0.5 animate-[blink_0.8s_step-end_infinite] align-middle" />
                                {' />'}
                            </span>

                            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black orbitron leading-[1.05] mb-5">
                                <span className="naruto-text block" style={{animationDelay:'0s', animation:'slideInLeft 0.7s ease-out both'}}>RITIK</span>
                                <span className="sharingan-text block" style={{animationDelay:'0.3s', animation:'slideInLeft 0.7s ease-out 0.3s both'}}>Kumar</span>
                            </h1>

                            <p className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8 animate-[fadeIn_1s_ease-out_0.4s_both]">
                                Mastering the art of code and crafting <span className="text-white font-semibold">seamless digital jutsu</span> with
                                React, Node.js &amp; modern web tech. My Ninja Way is building the future, one commit at a time.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-10">
                                <Link to="/projects" className="px-7 py-3.5 rounded-full bg-orange-500 text-black font-bold orbitron text-sm hover:bg-orange-400 hover:scale-105 active:scale-95 transition-all">
                                    View Missions
                                </Link>
                                <Link to="/contact" className="px-7 py-3.5 rounded-full border border-white/20 text-gray-300 font-bold orbitron text-sm hover:bg-white/10 hover:scale-105 active:scale-95 transition-all">
                                    Summon Me
                                </Link>
                            </div>

                            {/* Stats row */}
                            <div className="flex gap-6 sm:gap-10 justify-center lg:justify-start">
                                {[
                                    { val: '37+', label: 'Jutsu Scrolls' },
                                    { val: '10+', label: 'S-Rank Missions' },
                                    { val: '2+', label: 'Years Training' },
                                ].map(s => (
                                    <StatCounter key={s.label} val={s.val} label={s.label} />
                                ))}
                            </div>
                        </div>

                        {/* Avatar */}
                        <div className="flex justify-center relative" data-aos="fade-up" data-aos-delay="150">
                            <div className="relative w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80">
                                {/* Outer rings - Enhanced Sealing Jutsu Style */}
                                <div className="absolute -inset-8 border border-gray-700/30 animate-[spin_25s_linear_infinite] z-0" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
                                
                                <div className="absolute -inset-5 rounded-full border border-white/10 animate-[spin_15s_linear_infinite_reverse] z-0">
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(255,165,0,0.8)]" />
                                    <div className="absolute bottom-[12%] -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
                                    <div className="absolute bottom-[12%] -left-0.5 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
                                </div>

                                <div className="absolute -inset-2 rounded-full border border-dashed border-red-500/40 animate-[spin_8s_linear_infinite] z-0" />
                                <div className="absolute inset-0 rounded-full border border-orange-500/30 shadow-[inset_0_0_20px_rgba(255,165,0,0.15)] pointer-events-none z-20" />
                                
                                <img
                                    src="https://avatars.githubusercontent.com/u/96340458?v=4"
                                    alt="Ritik Kumar"
                                    className="w-full h-full object-cover rounded-full p-2 relative z-10"
                                />
                                <div className="absolute -bottom-3 -right-3 w-16 h-16 sm:w-20 sm:h-20 bg-[#0a0a0f] border border-white/10 rounded-full flex items-center justify-center shadow-2xl animate-bounce z-30">
                                    <span className="text-2xl sm:text-3xl drop-shadow-[0_0_8px_rgba(255,165,0,0.5)]">🦊</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll hint */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-gray-600 hidden sm:block">
                    <ChevronDown size={28} />
                </div>
            </section>

            {/* ── About + Education ── */}
            <section className="py-10 sm:py-16 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
                    <div className="naruto-card p-7 sm:p-9 rounded-2xl" data-aos="fade-up">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400"><Briefcase size={22} /></div>
                            <h3 className="text-xl sm:text-2xl font-bold orbitron text-white">Ninja Registration</h3>
                        </div>
                        <p className="text-gray-300 leading-relaxed mb-5 text-sm sm:text-base">
                            Full-stack developer building responsive, scalable web apps with React.js, Node.js &amp; modern JS frameworks — focused on performance-optimized, user-centric platforms.
                        </p>
                        <p className="text-gray-300 leading-relaxed border-l-4 border-red-500 pl-4 text-sm sm:text-base">
                            Currently a <span className="text-red-500 font-bold">Jonin-level</span> engineer at Wipro in Data Analytics &amp; AI.
                            Previously at <span className="text-orange-400 font-bold">Lancway</span>, delivering full-stack web solutions.
                        </p>

                        {/* Social links */}
                        <div className="flex gap-3 mt-6">
                            {[
                                { icon: <Github size={18} />, href: 'https://github.com/RitikRK96', label: 'GitHub' },
                                { icon: <Linkedin size={18} />, href: 'https://www.linkedin.com/in/ritikkumar08/', label: 'LinkedIn' },
                                { icon: <Mail size={18} />, href: 'mailto:ritikrk008@gmail.com', label: 'Email' },
                            ].map(s => (
                                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.label}
                                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-orange-400 hover:border-orange-500/40 hover:bg-orange-500/5 hover:shadow-[0_0_12px_rgba(255,165,0,0.2)] hover:scale-110 transition-all duration-200">
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="naruto-card p-7 sm:p-9 rounded-2xl" data-aos="fade-up" data-aos-delay="100">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 rounded-lg bg-red-500/10 text-red-500"><GraduationCap size={22} /></div>
                            <h3 className="text-xl sm:text-2xl font-bold orbitron text-white">Academy Training</h3>
                        </div>
                        <div className="space-y-5">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                <div>
                                    <h4 className="font-bold text-white text-base sm:text-lg">B.E. Computer Science</h4>
                                    <p className="text-gray-400 text-sm">Chandigarh University</p>
                                </div>
                                <span className="text-red-500 font-bold orbitron text-sm shrink-0">CGPA: 7.79</span>
                            </div>
                            <div className="h-px bg-white/10" />
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Award size={16} className="text-orange-400" />
                                    <h4 className="font-bold text-white">Scrolls of Mastery</h4>
                                </div>
                                <ul className="space-y-1.5 text-gray-400 text-sm">
                                    <li className="flex items-start gap-2"><span className="text-orange-400 mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />Top 2% NPTEL IoT Certification</li>
                                    <li className="flex items-start gap-2"><span className="text-red-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />SQL Expert (HackerRank)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Tech Stack ── */}
            <section className="py-10 sm:py-14 px-4 sm:px-6 relative">
                {/* Animated section divider */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12" data-aos="fade-up">
                        <h2 className="text-3xl sm:text-4xl font-bold orbitron mb-3"><span className="naruto-text">Tech Jutsu</span></h2>
                        <p className="text-gray-500 text-sm sm:text-base">Ninjutsu I work with every day.</p>
                    </div>

                    {/* Web Dev */}
                    <div className="mb-10" data-aos="fade-up">
                        <div className="flex items-center gap-3 mb-5">
                            <span className="h-px flex-1 bg-gradient-to-r from-orange-400/40 to-transparent" />
                            <span className="text-xs orbitron text-orange-400 tracking-widest">WEB DEVELOPMENT</span>
                            <span className="h-px flex-1 bg-gradient-to-l from-orange-400/40 to-transparent" />
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                            {WEB_SKILLS.map((s, i) => (
                                <div key={s.name}
                                    className="naruto-card rounded-xl p-4 text-center group hover:-translate-y-1 transition-all duration-300"
                                    data-aos="zoom-in" data-aos-delay={i * 60}>
                                    <div className="w-10 h-10 mx-auto mb-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                                        <img src={s.icon} alt={s.name} className="w-5 h-5 object-contain" />
                                    </div>
                                    <span className="text-gray-300 text-xs font-medium leading-tight block">{s.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Data & AI */}
                    <div data-aos="fade-up" data-aos-delay="100">
                        <div className="flex items-center gap-3 mb-5">
                            <span className="h-px flex-1 bg-gradient-to-r from-red-500/40 to-transparent" />
                            <span className="text-xs orbitron text-red-500 tracking-widest">DATA ANALYTICS &amp; AI</span>
                            <span className="h-px flex-1 bg-gradient-to-l from-red-500/40 to-transparent" />
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                            {AI_SKILLS.map((s, i) => (
                                <div key={s.name}
                                    className="naruto-card rounded-xl p-4 text-center group hover:-translate-y-1 transition-all duration-300"
                                    data-aos="zoom-in" data-aos-delay={i * 50}>
                                    <div className="w-10 h-10 mx-auto mb-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                                        <img src={s.icon} alt={s.name} className="w-5 h-5 object-contain" />
                                    </div>
                                    <span className="text-gray-300 text-xs font-medium leading-tight block">{s.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Experience Timeline ── */}
            <section className="py-10 sm:py-16 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8" data-aos="fade-up">
                        <h2 className="text-3xl sm:text-4xl font-bold orbitron mb-3"><span className="sharingan-text">Mission History</span></h2>
                        <p className="text-gray-500 text-sm sm:text-base">My ninja journey so far.</p>
                    </div>

                    <div className="max-w-3xl mx-auto relative">
                        {/* Timeline line */}
                        <div className="absolute left-5 sm:left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-orange-400 via-red-500 to-transparent md:-translate-x-px" />

                        {/* Wipro */}
                        <TimelineCard
                            side="left"
                            dotColor="bg-orange-400 shadow-[0_0_14px_rgba(255,165,0,0.7)]"
                            logo="W" logoGrad="from-orange-500 to-red-600"
                            company="Wipro" period="Mar 2026 — Present"
                            role="Jonin Engineer" roleColor="text-red-500"
                            desc="Data Analytics & AI — Cutting-edge analytics jutsu and AI-driven insights to lead mission decisions."
                            tags={[
                                { label: 'Data Analytics', cls: 'bg-orange-500/10 border-orange-500/20 text-orange-300' },
                                { label: 'AI/ML', cls: 'bg-red-500/10 border-red-500/20 text-red-300' },
                                { label: 'GenAI', cls: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300' },
                            ]}
                            aosDelay={0}
                        />

                        {/* Lancway */}
                        <TimelineCard
                            side="right"
                            dotColor="bg-red-500 shadow-[0_0_14px_rgba(255,0,0,0.7)]"
                            logo="L" logoGrad="from-red-500 to-orange-600"
                            company="Lancway" period="Apr 2025 — Feb 2026"
                            role="Chunin Developer" roleColor="text-orange-400"
                            desc="Delivered end-to-end web apps with React, Node.js & Firebase. Clean code, fast jutsu, scalable architecture."
                            tags={[
                                { label: 'React', cls: 'bg-orange-500/10 border-orange-500/20 text-orange-300' },
                                { label: 'Node.js', cls: 'bg-red-500/10 border-red-500/20 text-red-300' },
                                { label: 'Firebase', cls: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300' },
                            ]}
                            aosDelay={120}
                        />
                    </div>
                </div>
            </section>

            {/* ── Contact CTA ── */}
            <section className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
                {/* Glow blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-orange-500/5 rounded-[100%] blur-[100px] pointer-events-none" />

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-16" data-aos="fade-up">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs orbitron tracking-wider mb-5">
                            Available for Ranked Missions
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-black orbitron mb-4 leading-tight">
                            <span className="naruto-text">Let's Complete A</span>{' '}
                            <span className="sharingan-text">Ranked Mission</span>
                            <br />
                            <span className="text-white">Together</span>
                        </h2>
                        <p className="text-gray-400 max-w-lg mx-auto text-sm sm:text-base">
                            Whether it's a hidden village startup, a rogue project, or just a chat over ramen — I'm always excited to connect.
                        </p>
                    </div>

                    <ContactSection />
                </div>
            </section>

        </div>
    );
};


/* ── Timeline Card (reusable) ── */
interface Tag { label: string; cls: string }
interface TimelineCardProps {
    side: 'left' | 'right';
    dotColor: string;
    logo: string; logoGrad: string;
    company: string; period: string;
    role: string; roleColor: string;
    desc: string; tags: Tag[];
    aosDelay: number;
}

const TimelineCard = ({ side, dotColor, logo, logoGrad, company, period, role, roleColor, desc, tags, aosDelay }: TimelineCardProps) => {
    const card = (
        <div className="naruto-card p-5 sm:p-6 rounded-xl w-full max-w-sm group-hover:border-orange-500/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${logoGrad} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>{logo}</div>
                <div>
                    <h4 className="font-bold text-white text-base sm:text-lg leading-tight">{company}</h4>
                    <span className="text-xs text-orange-400 orbitron">{period}</span>
                </div>
            </div>
            <p className={`${roleColor} font-semibold text-sm mb-2`}>{role}</p>
            <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
                {tags.map(t => <span key={t.label} className={`text-xs px-2 py-1 rounded-full border ${t.cls}`}>{t.label}</span>)}
            </div>
        </div>
    );

    return (
        <div className="relative flex flex-col md:flex-row items-start mb-12 group" data-aos="fade-up" data-aos-delay={aosDelay}>
            {/* Desktop left */}
            {side === 'left' ? (
                <div className="hidden md:flex md:w-1/2 md:justify-end md:pr-12">{card}</div>
            ) : (
                <div className="hidden md:block md:w-1/2" />
            )}

            {/* Dot */}
            <div className={`absolute left-5 sm:left-6 md:left-1/2 w-3 h-3 rounded-full ${dotColor} -translate-x-1/2 mt-6 z-10 ring-4 ring-[#0a0a0f]`} />

            {/* Desktop right */}
            {side === 'right' ? (
                <div className="hidden md:block md:w-1/2 md:pl-12">{card}</div>
            ) : (
                <div className="hidden md:block md:w-1/2" />
            )}

            {/* Mobile card */}
            <div className="md:hidden ml-12 sm:ml-14 w-[calc(100%-3rem)] sm:w-[calc(100%-3.5rem)]">{card}</div>
        </div>
    );
};

export default Home;
