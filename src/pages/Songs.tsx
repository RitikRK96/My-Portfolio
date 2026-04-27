import { useEffect, useRef, useState } from 'react';
import { useSongs } from '../context/SongContext';
import { Music, PlayCircle, Loader2 } from 'lucide-react';

const Songs = () => {
    const { songs: allItems, loading, loadingMore, hasMore, loadMore } = useSongs();
    const [songs, setSongs] = useState<typeof allItems>([]);
    const [playlists, setPlaylists] = useState<typeof allItems>([]);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setPlaylists(allItems.filter(item => item.type === 'playlist'));
        setSongs(allItems.filter(item => item.type === 'song'));
    }, [allItems]);

    // Infinite scroll
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
            <div className="flex flex-col items-center justify-center pt-32 gap-4 text-gray-400">
                <Loader2 className="animate-spin" size={36} />
                <p className="animate-pulse">Loading music...</p>
            </div>
        );
    }

    return (
        <div className="page-container pb-20">
            <div className="text-center mb-16 relative" data-aos="fade-down">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-20 bg-teal-500/20 blur-[60px] -z-10 rounded-full pointer-events-none" />
                <span className="inline-block text-green-400 text-xs sm:text-sm orbitron tracking-[0.2em] mb-3 opacity-80 uppercase">
                    &lt; Now Playing /&gt;
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black orbitron mb-4 leading-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400">
                        Music &amp; Vibes
                    </span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto px-4">
                    What I'm listening to right now.
                </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
                {/* Playlists Section */}
                {playlists.length > 0 && (
                    <div data-aos="fade-up">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <PlayCircle className="text-green-400" /> Playlists
                        </h2>
                        <div className="grid gap-6">
                            {playlists.map(playlist => (
                                <div key={playlist.id} className="glass-card p-4 rounded-xl overflow-hidden aspect-video md:aspect-[3/1]">
                                    {playlist.url.trim().toLowerCase().startsWith('<iframe') ? (
                                        <div 
                                            className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:rounded-lg"
                                            dangerouslySetInnerHTML={{ __html: playlist.url }} 
                                        />
                                    ) : (
                                        <iframe
                                            src={playlist.url}
                                            className="w-full h-full rounded-lg"
                                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                            loading="lazy"
                                            title={playlist.title || 'Playlist'}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Songs Section */}
                <div data-aos="fade-up">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Music className="text-blue-400" /> Current Jam
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {songs.map((song) => (
                            <div key={song.id} className="glass-card p-4 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-colors">
                                <div className="p-3 bg-white/5 rounded-full text-blue-400 shrink-0">
                                    <Music size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white truncate">{song.title}</h3>
                                    <div className="mt-2 h-20 bg-black/50 rounded-lg overflow-hidden">
                                        {song.url.trim().toLowerCase().startsWith('<iframe') ? (
                                            <div 
                                                className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
                                                dangerouslySetInnerHTML={{ __html: song.url }} 
                                            />
                                        ) : (
                                            <iframe
                                                src={song.url}
                                                className="w-full h-full"
                                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                loading="lazy"
                                                title={song.title || 'Song'}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {songs.length === 0 && !loading && (
                            <div className="text-gray-500 col-span-2 text-center py-10">No specific tracks right now.</div>
                        )}
                    </div>
                </div>

                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} className="h-8 flex items-center justify-center">
                    {loadingMore && (
                        <div className="flex items-center gap-2 text-gray-400">
                            <Loader2 className="animate-spin" size={20} />
                            <span className="text-sm">Loading more...</span>
                        </div>
                    )}
                    {!hasMore && allItems.length > 0 && (
                        <p className="text-gray-600 text-sm">That's all the music!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Songs;
