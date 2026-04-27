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
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-[90] w-14 h-14 flex items-center justify-center liquid-glass text-neon-blue transition-colors group cursor-pointer"
                    aria-label="Scroll to top"
                >
                    <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform duration-300" />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default ScrollToTop;
