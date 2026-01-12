import { useBlogs } from '../context/BlogContext';
import { ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const Blogs = () => {
    const { blogs, loading } = useBlogs();

    if (loading) return <div className="text-center pt-20 animate-pulse text-blue-300">Loading thoughts...</div>;

    return (
        <div className="pb-20">
            <div className="text-center mb-16" data-aos="fade-down">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 mb-4 inline-block pb-2">
                    Blog & Articles
                </h1>
                <p className="text-gray-400">Thoughts, tutorials, and insights on development.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog, index) => (
                    <Link
                        to={`/blogs/${blog.id}`}
                        key={blog.id}
                        className="block glass-card rounded-xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300"
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                    >
                        <div className="h-48 overflow-hidden bg-gray-800">
                            {blog.coverImage ? (
                                <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">No Cover Image</div>
                            )}
                        </div>
                        <div className="p-6">
                            <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2 block">
                                {blog.createdAt?.toDate ? format(blog.createdAt.toDate(), 'MMM d, yyyy') : 'Recently'}
                            </span>
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors line-clamp-2">
                                {blog.title}
                            </h3>
                            <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                                {blog.content.slice(0, 150)}...
                            </p>
                            <div className="flex items-center text-blue-400 text-sm font-medium gap-1 group-hover:gap-2 transition-all">
                                Read Article <ArrowRight size={16} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            {blogs.length === 0 && <div className="text-center text-gray-500 py-20">No articles published yet.</div>}
        </div>
    );
};

export default Blogs;
