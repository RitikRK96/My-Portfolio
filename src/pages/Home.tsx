import { Github, Linkedin, Mail, Briefcase, GraduationCap, Award, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    return (
        <div className="space-y-0">
            {/* ── Hero ── */}
            <section className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 relative">
                <div className="w-full max-w-6xl mx-auto z-10">
                    <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-10 lg:gap-16">
                        {/* Text */}
                        <div className="flex-1 text-center lg:text-left" data-aos="fade-up">
                            <span className="inline-block text-neon-blue text-sm sm:text-base orbitron tracking-[.25em] mb-3 opacity-80">
                                {'<'} Full-Stack Developer {'/>'} 
                            </span>

                            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black orbitron leading-[1.05] mb-5">
                                <span className="neon-text block">RITIK</span>
                                <span className="neon-text-purple block">KUMAR</span>
                            </h1>

                            <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
                                Crafting <span className="text-neon-blue font-semibold">seamless digital experiences</span> with
                                React, Node.js &amp; modern web tech. Building the future, one commit at a time.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-10">
                                <Link to="/projects" className="px-7 py-3.5 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue text-black font-bold orbitron text-sm hover:scale-105 active:scale-95 transition-transform shadow-[0_0_24px_rgba(0,255,255,0.4)]">
                                    View Projects
                                </Link>
                                <Link to="/contact" className="px-7 py-3.5 rounded-full border border-neon-blue/60 text-neon-blue font-bold orbitron text-sm hover:bg-neon-blue/10 hover:scale-105 active:scale-95 transition-all">
                                    Get In Touch
                                </Link>
                            </div>

                            {/* Stats row */}
                            <div className="flex gap-6 sm:gap-10 justify-center lg:justify-start">
                                {[
                                    { val: '37+', label: 'Repositories' },
                                    { val: '10+', label: 'Projects' },
                                    { val: '2+', label: 'Years Exp' },
                                ].map(s => (
                                    <div key={s.label} className="text-center">
                                        <div className="text-2xl sm:text-3xl font-bold text-neon-blue orbitron">{s.val}</div>
                                        <div className="text-xs sm:text-sm text-gray-500 mt-0.5">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Avatar */}
                        <div className="flex justify-center relative" data-aos="fade-up" data-aos-delay="150">
                            <div className="relative w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80">
                                {/* Outer rings */}
                                <div className="absolute -inset-3 rounded-full border border-neon-purple/30 animate-[spin_18s_linear_infinite]" />
                                <div className="absolute -inset-6 rounded-full border border-neon-blue/20 animate-[spin_28s_linear_infinite_reverse]" />
                                <div className="absolute inset-0 rounded-full border-2 border-neon-blue/50 shadow-[0_0_40px_rgba(0,255,255,0.25)]" />
                                <img
                                    src="https://avatars.githubusercontent.com/u/96340458?v=4"
                                    alt="Ritik Kumar"
                                    className="w-full h-full object-cover rounded-full p-1.5"
                                />
                                <div className="absolute -bottom-3 -right-3 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-neon-purple to-neon-blue rounded-full flex items-center justify-center shadow-lg shadow-neon-blue/30 animate-bounce">
                                    <span className="text-2xl sm:text-3xl">🚀</span>
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
                    <div className="glass-card p-7 sm:p-9 rounded-2xl" data-aos="fade-up">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 rounded-lg bg-neon-blue/10 text-neon-blue"><Briefcase size={22} /></div>
                            <h3 className="text-xl sm:text-2xl font-bold orbitron text-white">Professional Summary</h3>
                        </div>
                        <p className="text-gray-300 leading-relaxed mb-5 text-sm sm:text-base">
                            Full-stack developer building responsive, scalable web apps with React.js, Node.js &amp; modern JS frameworks — focused on performance-optimized, user-centric platforms.
                        </p>
                        <p className="text-gray-300 leading-relaxed border-l-4 border-neon-purple pl-4 text-sm sm:text-base">
                            Currently at <span className="text-neon-purple font-bold">Wipro</span> as a Project Engineer in Data Analytics &amp; AI.
                            Previously at <span className="text-neon-blue font-bold">Lancway</span>, delivering full-stack web solutions.
                        </p>

                        {/* Social links */}
                        <div className="flex gap-3 mt-6">
                            {[
                                { icon: <Github size={18} />, href: 'https://github.com/RitikRK96', label: 'GitHub' },
                                { icon: <Linkedin size={18} />, href: 'https://linkedin.com/in/ritik-kumar', label: 'LinkedIn' },
                                { icon: <Mail size={18} />, href: 'mailto:ritikrk008@gmail.com', label: 'Email' },
                            ].map(s => (
                                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.label}
                                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-neon-blue hover:border-neon-blue/40 hover:bg-neon-blue/5 transition-all">
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-7 sm:p-9 rounded-2xl" data-aos="fade-up" data-aos-delay="100">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 rounded-lg bg-neon-purple/10 text-neon-purple"><GraduationCap size={22} /></div>
                            <h3 className="text-xl sm:text-2xl font-bold orbitron text-white">Education</h3>
                        </div>
                        <div className="space-y-5">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                <div>
                                    <h4 className="font-bold text-white text-base sm:text-lg">B.E. Computer Science</h4>
                                    <p className="text-gray-400 text-sm">Chandigarh University</p>
                                </div>
                                <span className="text-neon-purple font-bold orbitron text-sm shrink-0">CGPA: 7.79</span>
                            </div>
                            <div className="h-px bg-white/10" />
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Award size={16} className="text-neon-blue" />
                                    <h4 className="font-bold text-white">Certifications</h4>
                                </div>
                                <ul className="space-y-1.5 text-gray-400 text-sm">
                                    <li className="flex items-start gap-2"><span className="text-neon-blue mt-1.5 w-1.5 h-1.5 rounded-full bg-neon-blue shrink-0" />Top 2% NPTEL IoT Certification</li>
                                    <li className="flex items-start gap-2"><span className="text-neon-purple mt-1.5 w-1.5 h-1.5 rounded-full bg-neon-purple shrink-0" />SQL Expert (HackerRank)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Tech Stack ── */}
            <section className="py-10 sm:py-14 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12" data-aos="fade-up">
                        <h2 className="text-3xl sm:text-4xl font-bold orbitron mb-3"><span className="neon-text">Tech Stack</span></h2>
                        <p className="text-gray-500 text-sm sm:text-base">Technologies I work with every day.</p>
                    </div>

                    {/* Web Dev */}
                    <div className="mb-10" data-aos="fade-up">
                        <div className="flex items-center gap-3 mb-5">
                            <span className="h-px flex-1 bg-gradient-to-r from-neon-blue/40 to-transparent" />
                            <span className="text-xs orbitron text-neon-blue tracking-widest">WEB DEVELOPMENT</span>
                            <span className="h-px flex-1 bg-gradient-to-l from-neon-blue/40 to-transparent" />
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                            {WEB_SKILLS.map((s, i) => (
                                <div key={s.name}
                                    className="glass-card rounded-xl p-4 text-center group hover:-translate-y-1 transition-all duration-300"
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
                            <span className="h-px flex-1 bg-gradient-to-r from-neon-purple/40 to-transparent" />
                            <span className="text-xs orbitron text-neon-purple tracking-widest">DATA ANALYTICS &amp; AI</span>
                            <span className="h-px flex-1 bg-gradient-to-l from-neon-purple/40 to-transparent" />
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                            {AI_SKILLS.map((s, i) => (
                                <div key={s.name}
                                    className="glass-card rounded-xl p-4 text-center group hover:-translate-y-1 transition-all duration-300"
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
                        <h2 className="text-3xl sm:text-4xl font-bold orbitron mb-3"><span className="neon-text-purple">Experience</span></h2>
                        <p className="text-gray-500 text-sm sm:text-base">My professional journey so far.</p>
                    </div>

                    <div className="max-w-3xl mx-auto relative">
                        {/* Timeline line */}
                        <div className="absolute left-5 sm:left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-neon-blue via-neon-purple to-transparent md:-translate-x-px" />

                        {/* Wipro */}
                        <TimelineCard
                            side="left"
                            dotColor="bg-neon-blue shadow-[0_0_14px_rgba(0,255,255,0.7)]"
                            logo="W" logoGrad="from-blue-600 to-purple-600"
                            company="Wipro" period="Mar 2026 — Present"
                            role="Project Engineer" roleColor="text-neon-purple"
                            desc="Data Analytics & AI — Cutting-edge analytics solutions and AI-driven insights to drive business decisions."
                            tags={[
                                { label: 'Data Analytics', cls: 'bg-blue-500/10 border-blue-500/20 text-blue-300' },
                                { label: 'AI/ML', cls: 'bg-purple-500/10 border-purple-500/20 text-purple-300' },
                                { label: 'GenAI', cls: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300' },
                            ]}
                            aosDelay={0}
                        />

                        {/* Lancway */}
                        <TimelineCard
                            side="right"
                            dotColor="bg-neon-purple shadow-[0_0_14px_rgba(120,0,255,0.7)]"
                            logo="L" logoGrad="from-green-500 to-teal-600"
                            company="Lancway" period="Apr 2025 — Feb 2026"
                            role="Full-Stack Developer" roleColor="text-neon-blue"
                            desc="Delivered end-to-end web apps with React, Node.js & Firebase. Clean code, responsive design, scalable architecture."
                            tags={[
                                { label: 'React', cls: 'bg-green-500/10 border-green-500/20 text-green-300' },
                                { label: 'Node.js', cls: 'bg-teal-500/10 border-teal-500/20 text-teal-300' },
                                { label: 'Firebase', cls: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300' },
                            ]}
                            aosDelay={120}
                        />
                    </div>
                </div>
            </section>

            {/* ── Contact CTA ── */}
            <section className="py-16 sm:py-24 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="glass-card rounded-2xl p-10 sm:p-16 text-center relative overflow-hidden" data-aos="fade-up">
                        {/* Glow blobs */}
                        <div className="absolute -top-16 -left-16 w-48 h-48 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-neon-blue/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-xs orbitron tracking-wider mb-5">
                                Available for Opportunities
                            </span>
                            <h2 className="text-3xl sm:text-5xl font-black orbitron mb-4 leading-tight">
                                <span className="neon-text">Let's Build</span>{' '}
                                <span className="neon-text-purple">Something</span>
                                <br />
                                <span className="text-white">Amazing Together</span>
                            </h2>
                            <p className="text-gray-400 max-w-lg mx-auto text-sm sm:text-base mb-8">
                                Whether it's a startup idea, a freelance project, or just a chat about tech — I'm always excited to connect.
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <Link to="/contact"
                                    className="px-8 py-3.5 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue text-black font-bold orbitron text-sm hover:scale-105 active:scale-95 transition-transform shadow-[0_0_24px_rgba(0,255,255,0.35)]">
                                    Send a Message
                                </Link>
                                <a href="mailto:ritikrk008@gmail.com"
                                    className="px-8 py-3.5 rounded-full border border-white/20 text-white font-bold orbitron text-sm hover:bg-white/5 hover:scale-105 active:scale-95 transition-all">
                                    Email Directly
                                </a>
                            </div>
                        </div>
                    </div>
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
        <div className="glass-card p-5 sm:p-6 rounded-xl w-full max-w-sm group-hover:border-neon-blue/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${logoGrad} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>{logo}</div>
                <div>
                    <h4 className="font-bold text-white text-base sm:text-lg leading-tight">{company}</h4>
                    <span className="text-xs text-neon-blue orbitron">{period}</span>
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
