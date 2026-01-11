import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Filter } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

interface Photo {
    id: string;
    url: string;
    category: string;
    caption: string;
    date: string;
}

const Photos = () => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [categories, setCategories] = useState<string[]>(['All']);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPhotos();
    }, []);

    useEffect(() => {
        if (activeCategory === 'All') {
            setFilteredPhotos(photos);
        } else {
            setFilteredPhotos(photos.filter(p => p.category === activeCategory));
        }
    }, [activeCategory, photos]);

    const fetchPhotos = async () => {
        try {
            const q = query(collection(db, 'photos'), orderBy('date', 'desc'));
            const querySnapshot = await getDocs(q);
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
            setPhotos(list);

            const cats = new Set(['All']);
            list.forEach(p => cats.add(p.category));
            setCategories(Array.from(cats));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-20">
            <div className="text-center mb-10" data-aos="fade-down">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400 mb-4 inline-block">
                    Gallery
                </h1>
                <p className="text-gray-400">Capturing moments under the Moon and Sunsets.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-12" data-aos="fade-up">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
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
                <div className="text-center py-20 animate-pulse text-gray-500">Loading gallery...</div>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4 px-2 md:px-0">
                    {filteredPhotos.map((photo) => (
                        <div key={photo.id} className="break-inside-avoid relative group rounded-xl overflow-hidden mb-4" data-aos="zoom-in">
                            <img src={photo.url} alt={photo.caption} className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                <p className="text-white font-medium mb-1">{photo.caption}</p>
                                <div className="flex justify-between items-center text-xs text-gray-300">
                                    <span>{photo.date}</span>
                                    <span className="bg-white/20 px-2 py-1 rounded backdrop-blur-md">{photo.category}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredPhotos.length === 0 && (
                <div className="text-center text-gray-500 py-20">No photos found in this category.</div>
            )}
        </div>
    );
};

export default Photos;
