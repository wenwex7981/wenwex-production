'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Users, Building2, Package, Play,
    DollarSign, Eye, Star, Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// Mock analytics data
const overviewStats = [
    { label: 'Total Revenue', value: '$124,892', change: '+18.2%', trend: 'up', icon: DollarSign, color: 'text-green-400 bg-green-500/10' },
    { label: 'New Users', value: '2,456', change: '+12.5%', trend: 'up', icon: Users, color: 'text-blue-400 bg-blue-500/10' },
    { label: 'Active Vendors', value: '342', change: '+8.2%', trend: 'up', icon: Building2, color: 'text-purple-400 bg-purple-500/10' },
    { label: 'Total Orders', value: '1,847', change: '-2.4%', trend: 'down', icon: Package, color: 'text-orange-400 bg-orange-500/10' },
];

const topServices = [
    { name: 'Full-Stack E-commerce Platform', vendor: 'TechCraft Studios', orders: 156, revenue: 389844 },
    { name: 'React Native Mobile App', vendor: 'AppForge Inc', orders: 89, revenue: 266311 },
    { name: 'AI Chatbot Development', vendor: 'AI Solutions Lab', orders: 67, revenue: 133933 },
    { name: 'UI/UX Design Package', vendor: 'PixelPerfect Design', orders: 134, revenue: 200866 },
    { name: 'AWS Cloud Setup', vendor: 'CloudNine DevOps', orders: 45, revenue: 98955 },
];

const topVendors = [
    { name: 'TechCraft Studios', orders: 234, revenue: 584766, rating: 4.9 },
    { name: 'PixelPerfect Design', orders: 189, revenue: 282811, rating: 5.0 },
    { name: 'AppForge Inc', orders: 145, revenue: 507355, rating: 4.8 },
    { name: 'AI Solutions Lab', orders: 98, revenue: 195804, rating: 4.7 },
    { name: 'CloudNine DevOps', orders: 67, revenue: 147153, rating: 4.8 },
];

const monthlyData = [
    { month: 'Jan', users: 1200, orders: 340, revenue: 84500 },
    { month: 'Feb', users: 1450, orders: 420, revenue: 105000 },
    { month: 'Mar', users: 1680, orders: 510, revenue: 127500 },
    { month: 'Apr', users: 1890, orders: 580, revenue: 145000 },
    { month: 'May', users: 2100, orders: 650, revenue: 162500 },
    { month: 'Jun', users: 2456, orders: 720, revenue: 180000 },
];

export default function AdminAnalyticsPage() {
    const [timeRange, setTimeRange] = useState('30d');

    const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Analytics</h1>
                    <p className="text-gray-400">Platform performance and insights</p>
                </div>
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="input w-full sm:w-48"
                >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                </select>
            </div>

            {/* Overview Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {overviewStats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="card"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                                {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                {stat.change}
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue Chart */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-white mb-6">Revenue Overview</h2>
                    <div className="flex items-end gap-2 h-48">
                        {monthlyData.map((data, index) => (
                            <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all hover:from-primary-500 hover:to-primary-300"
                                    style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                                />
                                <span className="text-xs text-gray-500">{data.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Users Chart */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-white mb-6">User Growth</h2>
                    <div className="flex items-end gap-2 h-48">
                        {monthlyData.map((data) => (
                            <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all hover:from-green-500 hover:to-green-300"
                                    style={{ height: `${(data.users / 2456) * 100}%` }}
                                />
                                <span className="text-xs text-gray-500">{data.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tables Row */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Top Services */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-white mb-6">Top Services</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left pb-3 text-sm font-medium text-gray-400">Service</th>
                                    <th className="text-right pb-3 text-sm font-medium text-gray-400">Orders</th>
                                    <th className="text-right pb-3 text-sm font-medium text-gray-400">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {topServices.map((service, index) => (
                                    <tr key={index}>
                                        <td className="py-3">
                                            <div className="font-medium text-white text-sm">{service.name}</div>
                                            <div className="text-xs text-gray-500">{service.vendor}</div>
                                        </td>
                                        <td className="py-3 text-right text-gray-300">{service.orders}</td>
                                        <td className="py-3 text-right text-green-400 font-medium">
                                            ${service.revenue.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Vendors */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-white mb-6">Top Vendors</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left pb-3 text-sm font-medium text-gray-400">Vendor</th>
                                    <th className="text-right pb-3 text-sm font-medium text-gray-400">Rating</th>
                                    <th className="text-right pb-3 text-sm font-medium text-gray-400">Orders</th>
                                    <th className="text-right pb-3 text-sm font-medium text-gray-400">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {topVendors.map((vendor, index) => (
                                    <tr key={index}>
                                        <td className="py-3">
                                            <div className="font-medium text-white text-sm">{vendor.name}</div>
                                        </td>
                                        <td className="py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                <span className="text-gray-300">{vendor.rating}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-right text-gray-300">{vendor.orders}</td>
                                        <td className="py-3 text-right text-green-400 font-medium">
                                            ${vendor.revenue.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Additional Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <div className="card text-center">
                    <Eye className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">2.4M</div>
                    <div className="text-sm text-gray-400">Total Page Views</div>
                </div>
                <div className="card text-center">
                    <Play className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">156K</div>
                    <div className="text-sm text-gray-400">Shorts Views</div>
                </div>
                <div className="card text-center">
                    <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">4.8</div>
                    <div className="text-sm text-gray-400">Avg Platform Rating</div>
                </div>
                <div className="card text-center">
                    <Calendar className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">12.5d</div>
                    <div className="text-sm text-gray-400">Avg Delivery Time</div>
                </div>
            </div>
        </div>
    );
}
