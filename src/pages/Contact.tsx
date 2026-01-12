import React, { useState } from 'react';
import { Mail, Send, MapPin } from 'lucide-react';

import toast from 'react-hot-toast';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/my-portfolio-f8863/asia-south1/api';
        const API_URL = `${API_BASE}/contacts`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to send message');

            toast.success('Message sent successfully!');
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            toast.error('Failed to send message.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col justify-center pb-20">
            <div className="text-center mb-16" data-aos="fade-down">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Get In Touch</h1>
                <p className="text-gray-400 max-w-xl mx-auto">
                    Have a project in mind or just want to say hi? I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto w-full">
                {/* Contact Info */}
                <div className="space-y-8" data-aos="fade-right">
                    <div className="glass-card p-8 rounded-xl flex items-start gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                            <Mail size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Email</h3>
                            <p className="text-gray-400">ritik@example.com</p>
                            <p className="text-gray-400">hello@ritik.com</p>
                        </div>
                    </div>

                    <div className="glass-card p-8 rounded-xl flex items-start gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Location</h3>
                            <p className="text-gray-400">Bangalore, India</p>
                            <p className="text-gray-500 text-sm">Open to remote work</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="glass-card p-8 rounded-xl" data-aos="fade-left">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                                placeholder="Ritik Kumar"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                                placeholder="ritik@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                            <textarea
                                required
                                rows={4}
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                                placeholder="Tell me about your project..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                        >
                            {sending ? 'Sending...' : <><Send size={20} /> Send Message</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
