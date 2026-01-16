'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Package, FolderOpen, Play, Users, CreditCard,
    Settings, LogOut, Bell, Menu, X, ChevronDown, BarChart3, Eye, Star, Loader2,
    CheckCircle, AlertCircle, MessageSquare
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCurrentVendor, getVendorStats, fetchVendorServices } from '@/lib/vendor-service';
import { signOut } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function VendorDashboard() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [vendor, setVendor] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [recentServices, setRecentServices] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            const vendorData = await getCurrentVendor();

            // If vendor data is null, redirect to onboarding
            if (!vendorData) {
                router.push('/onboarding');
                return;
            }

            setVendor(vendorData);

            const [statsData, servicesData] = await Promise.all([
                getVendorStats(vendorData.id),
                fetchVendorServices(vendorData.id)
            ]);

            setStats(statsData);
            setRecentServices(servicesData.slice(0, 5));
        } catch (error: any) {
            console.error('Dashboard load error:', error);
            // If not a vendor, they might need onboarding
            if (error.message?.includes('not found') || error.message?.includes('Not authenticated')) {
                router.push('/onboarding');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/auth/login');
    };

    const statsConfig = [
        { label: 'Total Services', value: stats?.services || 0, icon: Package, color: 'text-blue-600 bg-blue-50' },
        { label: 'Active Reels', value: stats?.shorts || 0, icon: Play, color: 'text-green-600 bg-green-50' },
        { label: 'Avg Rating', value: stats?.avgRating?.toFixed(1) || '0.0', icon: Star, color: 'text-yellow-600 bg-yellow-50' },
        { label: 'Followers', value: '0', icon: Users, color: 'text-purple-600 bg-purple-50' },
    ];

    const sidebarLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/services', label: 'My Services', icon: Package },
        { href: '/dashboard/portfolio', label: 'Portfolio', icon: FolderOpen },
        { href: '/dashboard/shorts', label: 'Shorts', icon: Play },
        { href: '/dashboard/followers', label: 'Followers', icon: Users },
        { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/dashboard/subscription', label: 'Subscription', icon: CreditCard },
        { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
        { href: '/dashboard/settings', label: 'Agency Profile', icon: Settings },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gray-50/50">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-xl lg:shadow-none`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-20 px-8 border-b border-gray-50">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <span className="text-white font-black text-xl">W</span>
                            </div>
                            <span className="font-black text-gray-900 text-xl tracking-tight">WENWEX</span>
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-gray-400 hover:bg-gray-50 rounded-xl">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Vendor Info */}
                    <div className="px-6 py-8">
                        <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 relative overflow-hidden group">
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white text-primary-600 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm">
                                    {vendor?.company_name?.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{vendor?.company_name}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className={`w-2 h-2 rounded-full ${vendor?.status === 'APPROVED' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">{vendor?.status}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pb-8">
                        {sidebarLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all duration-200 group ${link.href === '/dashboard' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
                            >
                                <link.icon className={`w-5 h-5 ${link.href === '/dashboard' ? 'text-white' : 'group-hover:text-primary-600'}`} />
                                <span className="text-sm">{link.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Logout */}
                    <div className="p-6 border-t border-gray-50">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-4 w-full px-5 py-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all group"
                        >
                            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-72">
                {/* Top Header */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center justify-between px-8">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-400 hover:bg-gray-50 rounded-xl">
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="hidden lg:block">
                        <h1 className="text-xl font-black text-gray-900">Marketplace Overview</h1>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Welcome back, {vendor?.company_name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2.5 text-gray-400 hover:bg-gray-50 rounded-2xl transition-all">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>
                        <div className="w-10 h-10 bg-gray-100 rounded-2xl overflow-hidden hover:ring-2 ring-primary-500 transition-all cursor-pointer">
                            <img src={vendor?.logo_url || `https://ui-avatars.com/api/?name=${vendor?.company_name}`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statsConfig.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${stat.color}`}>
                                        <stat.icon className="w-7 h-7" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-tighter bg-gray-50 px-2 py-1 rounded-lg text-gray-400">Monthly</span>
                                </div>
                                <p className="text-4xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                                <p className="text-sm text-gray-400 font-bold mt-1 uppercase tracking-wider">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Quick Action Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 space-y-8">
                            {/* Recent Services */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900">Recent Listings</h2>
                                        <p className="text-gray-400 text-sm font-medium">Your most recent marketplace contributions</p>
                                    </div>
                                    <Link href="/dashboard/services" className="px-6 py-2.5 bg-gray-50 text-gray-900 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all">
                                        Manage All
                                    </Link>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50">
                                                <th className="pb-4 sm:px-4">Service</th>
                                                <th className="pb-4 px-4">Status</th>
                                                <th className="pb-4 px-4">Price</th>
                                                <th className="pb-4 px-4">Performance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {recentServices.length > 0 ? recentServices.map((service) => (
                                                <tr key={service.id} className="group transition-colors hover:bg-gray-50/50">
                                                    <td className="py-5 pr-4 sm:px-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-9 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-50">
                                                                <img src={service.main_image_url || 'https://images.unsplash.com/photo-1557821552-17105176677c?w=100'} className="object-cover w-full h-full" />
                                                            </div>
                                                            <span className="font-bold text-gray-900 text-sm group-hover:text-primary-600 transition-colors line-clamp-1">{service.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-4 font-bold">
                                                        <span className={`px-3 py-1 text-[10px] uppercase font-black rounded-full ring-1 ring-inset ${service.status === 'APPROVED' ? 'bg-green-50 text-green-600 ring-green-100' :
                                                            service.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600 ring-yellow-100' :
                                                                'bg-red-50 text-red-600 ring-red-100'
                                                            }`}>
                                                            {service.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-5 px-4 font-black text-gray-900 text-sm">${service.price}</td>
                                                    <td className="py-5 px-4">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                                            <Eye className="w-3 h-3" />
                                                            {service.view_count || 0}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="py-10 text-center text-gray-400 font-medium italic">No services listed yet</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Quick Launch */}
                            <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-black text-white mb-2">Grow Faster</h2>
                                    <p className="text-gray-400 text-sm mb-8 font-medium">Instantly add new content to boost visibility</p>

                                    <div className="grid grid-cols-1 gap-4">
                                        <Link href="/dashboard/services/new" className="flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 rounded-[2rem] border border-white/5 transition-all group/btn">
                                            <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group-hover/btn:scale-110 transition-transform">
                                                <Package className="w-6 h-6" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-white font-black text-sm uppercase tracking-wider">New Service</p>
                                                <p className="text-[10px] text-gray-400 font-medium">List a new product or gig</p>
                                            </div>
                                        </Link>

                                        <Link href="/dashboard/shorts/new" className="flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 rounded-[2rem] border border-white/5 transition-all group/btn">
                                            <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-500/20 group-hover/btn:scale-110 transition-transform">
                                                <Play className="w-6 h-6" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-white font-black text-sm uppercase tracking-wider">Upload Short</p>
                                                <p className="text-[10px] text-gray-400 font-medium">Engage with vertical video</p>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary-600/10 rounded-full blur-3xl" />
                            </div>

                            {/* Plan Card */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative group overflow-hidden">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
                                        <CreditCard className="w-7 h-7" />
                                    </div>
                                    <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full ring-1 ring-green-100">Active</span>
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-1">Professional Plan</h3>
                                <p className="text-sm text-gray-400 font-medium mb-8 italic">Your account is in good standing</p>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-widest border-t border-gray-50 pt-4">
                                        <span>Next Billing</span>
                                        <span className="text-gray-900">Feb 15, 2026</span>
                                    </div>
                                    <Link href="/dashboard/subscription" className="flex items-center justify-center w-full py-4 text-primary-600 font-black text-sm uppercase tracking-widest hover:bg-primary-50 rounded-2xl transition-all">
                                        Manage Billing
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300" onClick={() => setSidebarOpen(false)} />
            )}
        </div>
    );
}
