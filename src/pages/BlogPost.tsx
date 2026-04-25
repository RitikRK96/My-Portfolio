import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlogs, type Blog } from '../context/BlogContext';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Calendar, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const BlogPost = () => {
    const { id } = useParams<{ id: string }>();
    const { getBlog } = useBlogs();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        getBlog(id).then(found => {
            setBlog(found ?? null);
        }).finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center pt-40 gap-4 text-blue-300">
                <Loader2 className="animate-spin" size={36} />
                <p className="animate-pulse">Loading article...</p>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="text-center pt-40 text-gray-400">
                <p className="text-2xl font-bold mb-2">Article not found.</p>
                <Link to="/blogs" className="text-blue-400 hover:underline text-sm">← Back to Blogs</Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pb-20">
            <Link to="/blogs" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                <ArrowLeft size={20} className="mr-2" /> Back to Blogs
            </Link>

            {blog.coverImage && (
                <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-2xl">
                    <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">{blog.title}</h1>
                <div className="flex items-center gap-6 text-gray-400 text-sm border-b border-white/10 pb-8">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {blog.createdAt
                            ? format(new Date(blog.createdAt), 'MMMM d, yyyy')
                            : 'Unknown Date'}
                    </div>
                    <div className="flex items-center gap-2">
                        <User size={16} />
                        Ritik Kumar
                    </div>
                </div>
            </div>

            <div className="prose prose-invert prose-blue max-w-none prose-img:rounded-xl prose-headings:text-white prose-p:text-gray-300">
                <ReactMarkdown>{blog.content}</ReactMarkdown>
            </div>
        </div>
    );
};

export default BlogPost;
