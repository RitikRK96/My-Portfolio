import { useEffect, useRef, useState } from 'react';
import { usePhotos } from '../context/PhotoContext';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

const Photos = () => {
    const { photos, loading, loadingMore, hasMore, loadMore, fetchByCategory, activeCategory } = usePhotos();
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Derive categories from all loaded photos (accumulates as we scroll)
    const [categories, setCategories] = useState<string[]>(['All']);

    useEffect(() => {
        if (photos.length > 0) {
            const cats = new Set(['All']);
            photos.forEach(p => cats.add(p.category));
            setCategories(Array.from(cats));
        }
    }, [photos]);

    // Infinite scroll sentinel
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    loadMore(activeCategory);
                }
            },
            { rootMargin: '300px' }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loadingMore, loadMore, activeCategory]);

    return (
        <div className="page-container pb-20">
            <div className="text-center mb-16 relative" data-aos="fade-down">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-20 bg-pink-500/20 blur-[60px] -z-10 rounded-full pointer-events-none" />
                <span className="inline-block text-yellow-400 text-xs sm:text-sm orbitron tracking-[0.2em] mb-3 opacity-80 uppercase">
                    &lt; Through My Lens /&gt;
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black orbitron mb-4 leading-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">
                        Gallery
                    </span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto px-4">
                    Capturing moments under the Moon and Sunsets.
                </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-12" data-aos="fade-up">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => fetchByCategory(cat)}
                        className={clsx(
                            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                            activeCategory === cat
                                ? 'bg-white text-black shadow-lg scale-105'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
                    <Loader2 className="animate-spin" size={36} />
                    <p className="animate-pulse">Loading gallery...</p>
                </div>
            ) : photos.length === 0 ? (
                <div className="text-center text-gray-500 py-20">No photos found in this category.</div>
            ) : (
                <>
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4 px-2 md:px-0">
                        {photos.map((photo) => (
                            <div
                                key={photo.id}
                                className="break-inside-avoid relative group rounded-xl overflow-hidden mb-4"
                                data-aos="zoom-in"
                            >
                                <img
                                    src={photo.imageUrl}
                                    alt={photo.caption}
                                    loading="lazy"
                                    className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                    <p className="text-white font-medium mb-1">{photo.caption}</p>
                                    <div className="flex justify-between items-center text-xs text-gray-300">
                                        <span>
                                            {photo.date ? format(new Date(photo.date), 'MMM d, yyyy') : ''}
                                        </span>
                                        <span className="bg-white/20 px-2 py-1 rounded backdrop-blur-md">{photo.category}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sentinel for infinite scroll */}
                    <div ref={sentinelRef} className="h-8 mt-8 flex items-center justify-center">
                        {loadingMore && (
                            <div className="flex items-center gap-2 text-gray-400">
                                <Loader2 className="animate-spin" size={20} />
                                <span className="text-sm">Loading more photos...</span>
                            </div>
                        )}
                        {!hasMore && photos.length > 0 && (
                            <p className="text-gray-600 text-sm">You've seen all photos.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Photos;
