import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlogs, type Blog } from '../context/BlogContext';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Calendar, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { useSEO } from '../hooks/useSEO';

const BlogPost = () => {
    const { id } = useParams<{ id: string }>();
    const { getBlog } = useBlogs();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);

    useSEO(
        blog ? `${blog.title} | Ritik Kumar` : 'Loading Article...',
        blog ? blog.content.slice(0, 150).replace(/[#*`_\[\]()]/g, '') : 'Read this article to learn more.',
        'Tech Blog, Ritik Kumar, Tutorial',
        blog?.coverImage || 'https://avatars.githubusercontent.com/u/96340458?v=4',
        `https://ritik.world/blogs/${id}`
    );

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 mt-8">
            <Link to="/blogs" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                <ArrowLeft size={20} className="mr-2" /> Back to Blogs
            </Link>

            {blog.coverImage && (
                <div className="glass-card max-w-2xl mx-auto rounded-2xl overflow-hidden mb-8 shadow-2xl">
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

            <div className="prose prose-invert max-w-none 
                prose-img:rounded-2xl prose-img:shadow-xl
                prose-headings:text-white prose-headings:font-orbitron
                prose-h1:text-4xl prose-h1:text-neon-purple
                prose-h2:text-3xl prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-3 prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-neon-purple
                prose-h3:text-xl prose-h3:text-neon-blue prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-neon-blue prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white prose-strong:font-bold
                prose-ul:list-disc prose-ul:ml-4 prose-li:pl-2 prose-li:mb-2
                marker:text-neon-blue">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
                    {blog.content}
                </ReactMarkdown>
            </div>
        </div>
    );
};

export default BlogPost;
