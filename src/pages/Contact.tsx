import React, { useState } from 'react';
import { Mail, Send, MapPin, MessageSquare, ArrowUpRight, Loader2, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useContacts } from '../context/ContactContext';

const Contact = () => {
    const { submitContact } = useContacts();
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            await submitContact(formData.name, formData.email, formData.message);
            toast.success('Message sent successfully!');
            setFormData({ name: '', email: '', message: '' });
        } catch (error: any) {
            toast.error(error?.message || 'Failed to send message.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="page-container py-8 pb-20">
            {/* Header */}
            <div className="text-center mb-14" data-aos="fade-up">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-blue/5 border border-neon-blue/20 text-neon-blue text-xs orbitron tracking-wider mb-5">
                    <MessageSquare size={14} /> Let's Connect
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white orbitron mb-4">Get In Touch</h1>
                <p className="text-gray-400 max-w-lg mx-auto text-sm sm:text-base">
                    Have a project in mind or just want to say hi? I'm always open to new ideas and opportunities.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
                {/* Left — Contact Cards */}
                <div className="lg:col-span-2 flex flex-col gap-4 h-full" data-aos="fade-up" data-aos-delay="50">
                    {/* Email Card */}
                    <div className="glass-card p-6 rounded-xl group hover:-translate-y-0.5 transition-all duration-300">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-neon-blue/10 text-neon-blue shrink-0 group-hover:scale-110 transition-transform">
                                <Mail size={22} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-white mb-2">Email</h3>
                                <a href="mailto:ritikrk008@gmail.com"
                                    className="flex items-center gap-1 text-gray-400 hover:text-neon-blue transition-colors text-sm truncate">
                                    ritikrk008@gmail.com <ArrowUpRight size={13} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                                <a href="mailto:hello@ritik.world"
                                    className="flex items-center gap-1 text-gray-400 hover:text-neon-blue transition-colors text-sm truncate mt-0.5">
                                    hello@ritik.world <ArrowUpRight size={13} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Phone Card */}
                    <div className="glass-card p-6 rounded-xl group hover:-translate-y-0.5 transition-all duration-300">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-green-500/10 text-green-400 shrink-0 group-hover:scale-110 transition-transform">
                                <Phone size={22} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-white mb-2">Phone</h3>
                                <a href="tel:+919693895842"
                                    className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors text-sm">
                                    +91 96938 95842 <ArrowUpRight size={13} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </div>
                        </div>
                    </div>


                    <div className="glass-card p-6 rounded-xl group hover:-translate-y-0.5 transition-all duration-300">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-neon-purple/10 text-neon-purple shrink-0 group-hover:scale-110 transition-transform">
                                <MapPin size={22} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">Location</h3>
                                <p className="text-gray-400 text-sm">Bangalore, India</p>
                                <span className="inline-flex items-center gap-1.5 mt-2 text-xs text-green-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    Open to remote work
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Availability Card */}
                    <div className="glass-card p-6 rounded-xl bg-gradient-to-br from-neon-purple/5 to-neon-blue/5 flex-1 flex items-center">
                        <p className="text-gray-300 text-sm leading-relaxed">
                            <span className="text-white font-semibold">Response time:</span> I typically reply within 24 hours. For urgent inquiries, drop me an email directly.
                        </p>
                    </div>
                </div>

                {/* Right — Form */}
                <div className="lg:col-span-3" data-aos="fade-up" data-aos-delay="100">
                    <div className="glass-card p-7 sm:p-9 rounded-2xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Send size={18} className="text-neon-blue" /> Send a Message
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Name</label>
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20 outline-none transition-all"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Email</label>
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20 outline-none transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Message</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20 outline-none transition-all resize-none"
                                    placeholder="Tell me about your project or idea..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full py-3.5 bg-gradient-to-r from-neon-purple to-neon-blue text-black font-bold rounded-xl flex items-center justify-center gap-2 text-sm hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                            >
                                {sending ? (
                                    <><Loader2 size={18} className="animate-spin" /> Sending...</>
                                ) : (
                                    <><Send size={18} /> Send Message</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
