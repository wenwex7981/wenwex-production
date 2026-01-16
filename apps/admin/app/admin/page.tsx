'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Users, Building2, Package, FolderKanban, Play,
    Globe, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Loader2, X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchAdminDashboardStats, fetchPendingApprovals, updateVendorStatus, updateServiceStatus } from '@/lib/admin-service';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardStats, setDashboardStats] = useState<any>(null);
    const [pendingItems, setPendingItems] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            const [statsData, pendingData] = await Promise.all([
                fetchAdminDashboardStats(),
                fetchPendingApprovals()
            ]);

            setDashboardStats(statsData);

            const formattedPending = [
                ...(pendingData.vendors || []).map((v: any) => ({ ...v, type: 'vendor', name: v.company_name, email: v.official_email })),
                ...(pendingData.services || []).map((s: any) => ({ ...s, type: 'service', name: s.title, vendor: s.vendor?.company_name }))
            ];
            setPendingItems(formattedPending);
        } catch (error: any) {
            toast.error('Failed to load dashboard: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (item: any, status: string) => {
        try {
            if (item.type === 'vendor') {
                await updateVendorStatus(item.id, status);
            } else {
                await updateServiceStatus(item.id, status);
            }
            toast.success(`${item.type} ${status === 'APPROVED' ? 'approved' : 'rejected'}`);
            loadDashboardData();
        } catch (error: any) {
            toast.error('Action failed: ' + error.message);
        }
    };

    const stats = [
        { label: 'Total Users', value: dashboardStats?.users || 0, change: '+12.5%', trend: 'up', icon: Users, color: 'text-blue-400 bg-blue-500/10' },
        { label: 'Active Vendors', value: dashboardStats?.vendors || 0, change: '+8.2%', trend: 'up', icon: Building2, color: 'text-green-400 bg-green-500/10' },
        { label: 'Pending Approvals', value: dashboardStats?.pending || 0, change: '-5', trend: 'down', icon: Clock, color: 'text-yellow-400 bg-yellow-500/10' },
        { label: 'Active Services', value: dashboardStats?.services || 0, change: '+156', trend: 'up', icon: Package, color: 'text-purple-400 bg-purple-500/10' },
    ];

    return (
        <div className="p-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="card p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                                {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {stat.change}
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Pending Approvals */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-400" />
                            Pending Approvals
                        </h2>
                        <Link href="/admin/approvals" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                            View All →
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                            </div>
                        ) : pendingItems.length === 0 ? (
                            <p className="text-center text-gray-500 py-10">No pending approvals</p>
                        ) : pendingItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.type === 'vendor' ? 'bg-blue-500/10 text-blue-400' :
                                        item.type === 'service' ? 'bg-green-500/10 text-green-400' :
                                            'bg-purple-500/10 text-purple-400'
                                        }`}>
                                        {item.type === 'vendor' ? <Building2 className="w-5 h-5" /> :
                                            item.type === 'service' ? <Package className="w-5 h-5" /> :
                                                <Play className="w-5 h-5" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-white truncate">{item.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{item.vendor || item.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleAction(item, 'APPROVED')}
                                        className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                                        title="Approve"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleAction(item, 'REJECTED')}
                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Reject"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                        <Link href="/admin/logs" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                            View Logs →
                        </Link>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-gray-700/20 rounded-xl border border-dashed border-gray-700">
                            <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-400 italic">Action logging system is being initialized...</p>
                                <p className="text-xs text-gray-500 mt-1">Real-time log stream will appear here.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Quick Navigation</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Link href="/admin/vendors" className="flex flex-col items-center gap-3 p-4 bg-gray-800/50 rounded-2xl border border-gray-700 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all group">
                        <Building2 className="w-6 h-6 text-primary-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Verify Vendors</span>
                    </Link>
                    <Link href="/admin/services" className="flex flex-col items-center gap-3 p-4 bg-gray-800/50 rounded-2xl border border-gray-700 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all group">
                        <Package className="w-6 h-6 text-primary-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Audit Services</span>
                    </Link>
                    <Link href="/admin/categories" className="flex flex-col items-center gap-3 p-4 bg-gray-800/50 rounded-2xl border border-gray-700 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all group">
                        <FolderKanban className="w-6 h-6 text-primary-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Categories</span>
                    </Link>
                    <Link href="/admin/content" className="flex flex-col items-center gap-3 p-4 bg-gray-800/50 rounded-2xl border border-gray-700 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all group">
                        <Globe className="w-6 h-6 text-primary-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Edit Content</span>
                    </Link>
                    <Link href="/admin/shorts" className="flex flex-col items-center gap-3 p-4 bg-gray-800/50 rounded-2xl border border-gray-700 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all group">
                        <Play className="w-6 h-6 text-primary-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Moderate Reels</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
