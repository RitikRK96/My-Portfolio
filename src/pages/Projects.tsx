import { useEffect, useRef } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Github, ExternalLink, Calendar, Code2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useSEO } from '../hooks/useSEO';

const Projects = () => {
    useSEO(
        "Projects & Portfolio | Ritik Kumar",
        "Explore my latest web development and AI projects including Full-Stack applications, dashboards, and SaaS platforms.",
        "Ritik Kumar Projects, React Projects, AI Projects, Full-Stack Portfolio",
        "https://avatars.githubusercontent.com/u/96340458?v=4",
        "https://ritik.world/projects"
    );
    const { projects, loading, loadingMore, hasMore, loadMore } = useProjects();
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    loadMore();
                }
            },
            { rootMargin: '200px' }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loadingMore, loadMore]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center pt-32 gap-4 text-blue-300">
                <Loader2 className="animate-spin" size={36} />
                <p className="animate-pulse">Loading amazing projects...</p>
            </div>
        );
    }

    return (
        <div className="page-container pb-20">
            <div className="text-center mb-16 relative" data-aos="fade-down">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-20 bg-neon-purple/20 blur-[60px] -z-10 rounded-full pointer-events-none" />
                <span className="inline-block text-neon-blue text-xs sm:text-sm orbitron tracking-[0.2em] mb-3 opacity-80 uppercase">
                    &lt; My Work /&gt;
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black orbitron mb-4 leading-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue">
                        Featured Projects
                    </span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto px-4">
                    A showcase of my recent work, side projects, and experiments.
                </p>
            </div>

            {projects.length === 0 ? (
                <div className="text-center text-gray-500 py-20 bg-white/5 rounded-xl border border-white/5 border-dashed">
                    No projects added yet. Check back soon!
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project, index) => (
                            <div
                                key={project.id}
                                className="glass-card rounded-xl overflow-hidden flex flex-col group h-full"
                                data-aos="fade-up"
                                data-aos-delay={Math.min(index * 100, 400)}
                            >
                                <div className="relative h-48 w-full overflow-hidden">
                                    {project.imageUrl ? (
                                        <img
                                            src={project.imageUrl}
                                            alt={project.title}
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                            <Code2 className="text-gray-600 w-12 h-12" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                        {project.githubUrl && (
                                            <a href={project.githubUrl} target="_blank" rel="noreferrer"
                                                className="p-2 bg-white/10 rounded-full hover:bg-blue-600 transition-colors text-white" title="View Code">
                                                <Github size={20} />
                                            </a>
                                        )}
                                        {project.liveUrl && (
                                            <a href={project.liveUrl} target="_blank" rel="noreferrer"
                                                className="p-2 bg-white/10 rounded-full hover:bg-green-600 transition-colors text-white" title="Live Demo">
                                                <ExternalLink size={20} />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                            {project.title}
                                        </h3>
                                        {project.createdAt && (
                                            <span className="text-xs text-gray-500 flex items-center gap-1 shrink-0 ml-2">
                                                <Calendar size={12} />
                                                {format(new Date(project.createdAt), 'MMM yyyy')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-3">
                                        {project.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        {project.techStack.map(stack => (
                                            <span key={stack} className="text-xs px-2 py-1 rounded bg-white/5 border border-white/5 text-gray-300">
                                                {stack}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div ref={sentinelRef} className="h-8 mt-8 flex items-center justify-center">
                        {loadingMore && (
                            <div className="flex items-center gap-2 text-gray-400">
                                <Loader2 className="animate-spin" size={20} />
                                <span className="text-sm">Loading more projects...</span>
                            </div>
                        )}
                        {!hasMore && projects.length > 0 && (
                            <p className="text-gray-600 text-sm">You've reached the end.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Projects;
