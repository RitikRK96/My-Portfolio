import { MessageSquare } from 'lucide-react';
import ContactSection from '../components/ContactSection';
import { useSEO } from '../hooks/useSEO';

const Contact = () => {
    useSEO(
        "Contact Ritik Kumar | Hire Full-Stack Developer",
        "Get in touch with Ritik Kumar. Available for freelance projects, full-time opportunities, or just a friendly chat about tech.",
        "Contact Ritik, Hire Developer, Freelance Full-Stack Developer",
        "https://avatars.githubusercontent.com/u/96340458?v=4",
        "https://ritik.world/contact"
    );

    return (
        <div className="page-container py-8 pb-20">
            {/* Header */}
            <div className="text-center mb-16 relative" data-aos="fade-up">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-20 bg-neon-blue/20 blur-[60px] -z-10 rounded-full pointer-events-none" />
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-blue/5 border border-neon-blue/20 text-neon-blue text-xs orbitron tracking-wider mb-5">
                    <MessageSquare size={14} /> Let's Connect
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black orbitron mb-4 leading-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                        Get In Touch
                    </span>
                </h1>
                <p className="text-gray-400 max-w-lg mx-auto text-sm sm:text-base px-4">
                    Have a project in mind or just want to say hi? I'm always open to new ideas and opportunities.
                </p>
            </div>

            <ContactSection />
        </div>
    );
};

export default Contact;
