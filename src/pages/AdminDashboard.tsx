import React, { useState } from 'react';
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
        <div className="container mx-auto pb-10">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar / Tabs */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="glass-card p-4 rounded-xl sticky top-24">
                        <div className="flex items-center gap-3 mb-6 px-2 text-blue-400">
                            <LayoutDashboard />
                            <span className="font-bold text-lg">Dashboard</span>
                        </div>
                        <nav className="space-y-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={clsx(
                                            'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                                            activeTab === tab.id
                                                ? 'bg-blue-600 shadow-lg shadow-blue-900/50 text-white'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        )}
                                    >
                                        <Icon size={18} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    <div className="glass-card p-6 rounded-xl min-h-[600px]">
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
