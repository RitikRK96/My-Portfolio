import { useProjects } from '../context/ProjectContext';
import { Github, ExternalLink, Calendar, Code2 } from 'lucide-react';
import { format } from 'date-fns';

const Projects = () => {
    const { projects, loading } = useProjects();


    if (loading) return <div className="text-center pt-40 text-blue-300 animate-pulse">Loading amazing projects...</div>;

    return (
        <div className="pb-20">
            <div className="text-center mb-16" data-aos="fade-down">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4 inline-block pb-2">
                    Featured Projects
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    A showcase of my recent work, side projects, and experiments.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project, index) => (
                    <div
                        key={project.id}
                        className="glass-card rounded-xl overflow-hidden flex flex-col group h-full"
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                    >
                        <div className="relative h-48 overflow-hidden">
                            {project.imageUrl ? (
                                <img
                                    src={project.imageUrl}
                                    alt={project.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                    <Code2 className="text-gray-600 w-12 h-12" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                {project.githubUrl && (
                                    <a href={project.githubUrl} target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-blue-600 transition-colors text-white" title="View Code">
                                        <Github size={20} />
                                    </a>
                                )}
                                {project.liveUrl && (
                                    <a href={project.liveUrl} target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-green-600 transition-colors text-white" title="Live Demo">
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
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar size={12} />
                                        {format(project.createdAt?.toDate ? project.createdAt.toDate() : new Date(), 'MMM yyyy')}
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

            {projects.length === 0 && (
                <div className="text-center text-gray-500 py-20 bg-white/5 rounded-xl border border-white/5 border-dashed">
                    No projects added yet. Check back soon!
                </div>
            )}
        </div>
    );
};

export default Projects;
