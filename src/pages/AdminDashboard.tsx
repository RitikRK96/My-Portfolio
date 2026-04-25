import { useState } from 'react';
import { LayoutDashboard, FolderKanban, PenTool, Image, Music, Mail } from 'lucide-react';
import clsx from 'clsx';

// We will import these later as we create them
import AdminProjects from '../components/admin/AdminProjects';
import AdminBlogs from '../components/admin/AdminBlogs';
import AdminPhotos from '../components/admin/AdminPhotos';
import AdminSongs from '../components/admin/AdminSongs';
import AdminContacts from '../components/admin/AdminContacts';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('projects');

    const tabs = [
        { id: 'projects', label: 'Projects', icon: FolderKanban },
        { id: 'blogs', label: 'Blogs', icon: PenTool },
        { id: 'photos', label: 'Photos', icon: Image },
        { id: 'songs', label: 'Songs', icon: Music },
        { id: 'contact', label: 'Messages', icon: Mail },
    ];

    return (
        <div className="min-h-screen pt-6 pb-10 flex">
            {/* Sidebar (Hover Expandable) */}
            <div className="fixed left-0 top-0 bottom-0 z-[60] bg-[#0a0a0f] border-r border-white/5 transition-all duration-300 ease-in-out w-[80px] hover:w-64 overflow-hidden group flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
                <div className="p-4 flex flex-col h-full pt-8">
                    <div className="flex items-center gap-4 mb-10 px-2 text-neon-blue w-full overflow-hidden">
                        <LayoutDashboard className="flex-shrink-0" size={28} />
                        <span className="font-bold text-xl orbitron opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                            Admin Panel
                        </span>
                    </div>
                    
                    <nav className="space-y-4 flex-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={clsx(
                                        'w-full flex items-center justify-start gap-4 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden relative',
                                        activeTab === tab.id
                                            ? 'bg-neon-blue/15 text-neon-blue shadow-[0_0_15px_rgba(0,255,255,0.15)] border border-neon-blue/30'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                    )}
                                >
                                    <Icon size={22} className="flex-shrink-0" />
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap tracking-wide">
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 pl-[84px] sm:pl-[100px] md:pl-[120px] lg:pl-[140px] pr-4 sm:pr-8 lg:pr-12 w-full transition-all duration-300">
                <div className="w-full min-h-[85vh]">
                    <div className="w-full">
                        {activeTab === 'projects' && <AdminProjects />}
                        {activeTab === 'blogs' && <AdminBlogs />}
                        {activeTab === 'photos' && <AdminPhotos />}
                        {activeTab === 'songs' && <AdminSongs />}
                        {activeTab === 'contact' && <AdminContacts />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
