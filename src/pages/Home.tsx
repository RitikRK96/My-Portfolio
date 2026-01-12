
const Home = () => {
    return (
        <div>
            {/* Hero Section */}
            <section className="flex items-center justify-center px-6 relative overflow-hidden">
                <div className="container mx-auto z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="flex-1 text-center md:text-left" data-aos="fade-right">
                            <div className="mb-4">
                                <span className="text-neon-blue text-lg orbitron tracking-widest">// Full-Stack Developer</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black mb-4 orbitron glitch leading-tight">
                                <span className="neon-text block">RITIK</span>
                                <span className="neon-text-purple block">KUMAR</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-300 mb-4 leading-relaxed max-w-2xl">
                                Crafting <span className="text-neon-blue">seamless digital experiences</span> with React.js, Node.js, and modern web technologies. Building the future, one line of code at a time.
                            </p>

                            <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-12">
                                <a href="/projects" className="px-8 py-4 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue text-black font-bold orbitron transform hover:scale-105 transition shadow-[0_0_20px_rgba(0,255,255,0.5)]">
                                    View Projects
                                </a>
                                <a href="/contact" className="px-8 py-4 rounded-full border border-neon-blue text-neon-blue font-bold orbitron hover:bg-neon-blue/10 transform hover:scale-105 transition shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                                    Get In Touch
                                </a>
                            </div>

                            <div className="flex gap-8 justify-center md:justify-start">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-neon-blue orbitron">37+</div>
                                    <div className="text-sm text-gray-400">Repositories</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-neon-purple orbitron">10+</div>
                                    <div className="text-sm text-gray-400">Projects</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-neon-blue orbitron">2024</div>
                                    <div className="text-sm text-gray-400">Since</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex justify-center relative" data-aos="fade-left">
                            <div className="relative w-80 h-80 md:w-96 md:h-96">
                                <div className="absolute inset-0 rounded-full border-2 border-neon-blue shadow-[0_0_40px_rgba(0,255,255,0.4)] animate-pulse"></div>
                                <img
                                    src="https://avatars.githubusercontent.com/u/96340458?v=4"
                                    alt="Ritik Kumar"
                                    className="w-full h-full object-cover rounded-full p-2"
                                />
                                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-neon-purple to-neon-blue rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                                    <span className="text-3xl">🚀</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About / Skills Preview */}
            <section className="py-20 px-6">
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="glass-card p-8 rounded-2xl" data-aos="fade-up">
                            <h3 className="text-2xl font-bold mb-4 text-neon-blue orbitron">Professional Summary</h3>
                            <p className="text-gray-300 leading-relaxed mb-6">
                                Full-stack developer specializing in building responsive and scalable web applications. With expertise in React.js, Node.js, and modern JavaScript frameworks, I create performance-optimized, user-centric platforms.
                            </p>
                            <p className="text-gray-300 leading-relaxed border-l-4 border-neon-purple pl-4">
                                Currently working at <span className="text-neon-purple font-bold">Lancway</span>, delivering top-notch full-stack web solutions. Known for clean code practices, UI/UX sensitivity, and cross-functional collaboration.
                            </p>
                        </div>

                        <div className="glass-card p-8 rounded-2xl" data-aos="fade-up" data-aos-delay="100">
                            <h3 className="text-2xl font-bold mb-4 text-neon-blue orbitron">Education</h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-white text-lg">B.E. Computer Science</h4>
                                        <p className="text-gray-400">Chandigarh University</p>
                                    </div>
                                    <span className="text-neon-purple font-bold orbitron">CGPA: 7.79</span>
                                </div>
                                <div className="h-px bg-white/10"></div>
                                <div>
                                    <h4 className="font-bold text-white">Certifications</h4>
                                    <ul className="list-disc list-inside text-gray-400 mt-2 space-y-1">
                                        <li>Top 2% NPTEL IoT Certification</li>
                                        <li>SQL Expert (HackerRank)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
