'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/Sidebar';
import { Menu, LogOut, Bell, Search, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('wenwex_admin_auth');
        localStorage.removeItem('wenwex_admin_auth_expiry');
        localStorage.removeItem('wenwex_admin_user');
        toast.success('Logged out successfully');
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-900 flex text-gray-100">
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-gray-800/50 backdrop-blur-xl border-b border-gray-700 sticky top-0 z-40 px-6">
                    <div className="h-full flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 text-gray-400 hover:text-white"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <div className="relative hidden md:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search command (⌘K)..."
                                    className="bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-64 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full border-2 border-gray-800"></span>
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>

                            <div className="h-8 w-[1px] bg-gray-700 mx-2 hidden sm:block" />

                            <div className="flex items-center gap-3 pl-2 sm:pl-0">
                                <div className="text-right hidden sm:block uppercase tracking-tighter">
                                    <p className="text-xs font-bold text-white">Super Admin</p>
                                    <p className="text-[10px] text-primary-400 font-black">Platform Master</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-primary-500/20">
                                    AD
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}

