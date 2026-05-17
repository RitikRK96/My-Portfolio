import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await login(email, password);
            navigate('/admin');
        } catch (err) {
            // Toast handled in context
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[75vh] px-4 relative overflow-hidden">
            {/* Background Aesthetic (Decorative Orange Swirl/Chakra Glows) */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div
                className="relative p-8 rounded-3xl w-full max-w-md bg-[#0b0c10]/80 border border-orange-500/20 shadow-[0_0_50px_rgba(249,115,22,0.1)] backdrop-blur-md"
                data-aos="zoom-in"
            >
                {/* Shinobi Headband Style Header Accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-8 bg-zinc-800 border-2 border-zinc-600 rounded-md shadow-lg flex items-center justify-center overflow-hidden">
                    {/* Metal texture screws on side */}
                    <div className="absolute left-2 w-1.5 h-1.5 rounded-full bg-zinc-500 border border-zinc-600" />
                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-zinc-500 border border-zinc-600" />
                    
                    {/* Konoha Symbol (Leaf village swirl) */}
                    <svg className="w-6 h-6 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7,12 C7,9 9,7 12,7 C14.5,7 16,9 15,11.5 C14,14 11.5,13.5 12,12 C12.5,10.5 10.5,10.5 10.5,12 C10.5,13.5 12,15 14,15 M15,11.5 L17.5,11" />
                    </svg>
                </div>

                {/* Animated Logo Container */}
                <div className="flex justify-center mb-6 mt-2">
                    <div className="group relative p-5 rounded-full bg-gradient-to-tr from-orange-500/20 to-red-500/20 border border-orange-500/30 hover:border-orange-500 transition-all duration-500 cursor-pointer">
                        {/* Spinning Shuriken Decoration */}
                        <svg className="w-10 h-10 text-orange-500 animate-[spin_8s_linear_infinite] group-hover:animate-[spin_1.5s_linear_infinite] transition-all" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.5 5.5L20 9l-4.5 4.5L17 20l-5-3.5L7 20l1.5-6.5L4 9l5.5-1.5L12 2z" />
                            {/* Inner hole */}
                            <circle cx="12" cy="12" r="2.5" className="fill-[#0b0c10]" />
                        </svg>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold tracking-wider text-orange-400 font-serif">Gate of the Shinobi</h2>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Admin Access Portal</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Chakra Identity (Email)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500 focus:shadow-[0_0_15px_rgba(249,115,22,0.15)] transition-all"
                            placeholder="shinobi@village.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Secret Seal (Password)</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500 focus:shadow-[0_0_15px_rgba(249,115,22,0.15)] transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="relative w-full overflow-hidden group py-3.5 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {/* Orange Fire Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-500 group-hover:opacity-90" />
                        
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)]" />

                        <span className="relative flex items-center justify-center gap-2 tracking-widest text-sm uppercase">
                            {isSubmitting ? (
                                <>Unlocking Chakra...</>
                            ) : (
                                <>
                                    <Shield size={16} className="text-white/80 group-hover:scale-110 transition-transform" />
                                    Break Secret Seal
                                </>
                            )}
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
