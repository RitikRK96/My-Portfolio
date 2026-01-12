import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Music, PlayCircle } from 'lucide-react';

interface Song {
    id: string;
    title: string;
    url: string;
    type: 'song' | 'playlist';
}

const Songs = () => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [playlists, setPlaylists] = useState<Song[]>([]);
    // const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const q = query(collection(db, 'songs'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));

                setPlaylists(list.filter(item => item.type === 'playlist'));
                setSongs(list.filter(item => item.type === 'song'));
            } catch (error) {
                console.error('Error fetching songs');
            } finally {
                // setLoading(false);
            }
        };
        fetchSongs();
    }, []);

    return (
        <div className="pb-20">
            <div className="text-center mb-16" data-aos="fade-down">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400 mb-4 inline-block">
                    Music & Vibes
                </h1>
                <p className="text-gray-400">What I'm listening to right now.</p>
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
                                    <iframe
                                        src={playlist.url}
                                        className="w-full h-full rounded-lg"
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                        loading="lazy"
                                    ></iframe>
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
                                        <iframe
                                            src={song.url}
                                            className="w-full h-full"
                                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                            loading="lazy"
                                        ></iframe>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {songs.length === 0 && <div className="text-gray-500 col-span-2 text-center py-10">No specific tracks right now.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Songs;
