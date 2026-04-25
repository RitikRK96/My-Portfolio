import { useEffect, useRef } from 'react';
import { useBlogs } from '../context/BlogContext';
import { ArrowRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const Blogs = () => {
    const { blogs, loading, loadingMore, hasMore, loadMore } = useBlogs();
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Infinite scroll: observe the sentinel element at the bottom
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
                <p className="animate-pulse">Loading thoughts...</p>
            </div>
        );
    }

    return (
        <div className="page-container pb-20">
            <div className="text-center mb-16" data-aos="fade-down">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 mb-4 inline-block pb-2">
                    Blog &amp; Articles
                </h1>
                <p className="text-gray-400">Thoughts, tutorials, and insights on development.</p>
            </div>

            {blogs.length === 0 ? (
                <div className="text-center text-gray-500 py-20">No articles published yet.</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog, index) => (
                            <Link
                                to={`/blogs/${blog.id}`}
                                key={blog.id}
                                className="block glass-card rounded-xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300"
                                data-aos="fade-up"
                                data-aos-delay={Math.min(index * 100, 400)}
                            >
                                <div className="h-48 overflow-hidden bg-gray-800">
                                    {blog.coverImage ? (
                                        <img
                                            src={blog.coverImage}
                                            alt={blog.title}
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">No Cover Image</div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2 block">
                                        {blog.createdAt
                                            ? format(new Date(blog.createdAt), 'MMM d, yyyy')
                                            : 'Recently'}
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

                    {/* Infinite scroll sentinel */}
                    <div ref={sentinelRef} className="h-8 mt-8 flex items-center justify-center">
                        {loadingMore && (
                            <div className="flex items-center gap-2 text-gray-400">
                                <Loader2 className="animate-spin" size={20} />
                                <span className="text-sm">Loading more articles...</span>
                            </div>
                        )}
                        {!hasMore && blogs.length > 0 && (
                            <p className="text-gray-600 text-sm">You've reached the end.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Blogs;
