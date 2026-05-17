import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    const [isVisible, setIsVisible] = useState(false);

    // Auto scroll to top on route change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [pathname]);

    // Toggle button visibility based on scroll depth
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="fixed bottom-8 right-8 z-[90] w-14 h-14"
                >
                    {/* Outer rotating dashed ring */}
                    <span className="absolute -inset-2 rounded-full border border-dashed border-orange-500/30 animate-[spin_6s_linear_infinite] pointer-events-none" />
                    {/* Button */}
                    <button
                        onClick={scrollToTop}
                        className="relative w-full h-full liquid-glass-naruto flex items-center justify-center group cursor-pointer"
                        aria-label="Scroll to top"
                    >
                        <ArrowUp size={20} className="group-hover:-translate-y-1 transition-transform duration-300" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ScrollToTop;
