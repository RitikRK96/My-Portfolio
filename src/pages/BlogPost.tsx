import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

const BlogPost = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlog = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, 'blogs', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setBlog({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (error) {
                console.error('Error fetching blog');
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [id]);

    if (loading) return <div className="text-center pt-40">Loading article...</div>;
    if (!blog) return <div className="text-center pt-40">Article not found.</div>;

    return (
        <div className="max-w-3xl mx-auto pb-20">
            <Link to="/blogs" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                <ArrowLeft size={20} className="mr-2" /> Back to Blogs
            </Link>

            {blog.imageUrl && (
                <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-2xl">
                    <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">{blog.title}</h1>
                <div className="flex items-center gap-6 text-gray-400 text-sm border-b border-white/10 pb-8">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {blog.createdAt?.toDate ? format(blog.createdAt.toDate(), 'MMMM d, yyyy') : 'Unknown Date'}
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
