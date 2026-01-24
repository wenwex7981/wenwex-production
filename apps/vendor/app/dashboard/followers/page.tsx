'use client';

import { useState, useEffect } from 'react';
import { getCurrentVendor, getFollowersList } from '@/lib/vendor-service';
import { Users, Search, Calendar, Mail, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function FollowersPage() {
    const [followers, setFollowers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadFollowers();
    }, []);

    const loadFollowers = async () => {
        try {
            const vendor = await getCurrentVendor();
            if (vendor) {
                const data = await getFollowersList(vendor.id);
                setFollowers(data);
            }
        } catch (error) {
            console.error('Error loading followers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredFollowers = followers.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Followers</h1>
                    <p className="text-gray-500 font-medium">People interested in your agency</p>
                </div>
                <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-primary-600 font-bold">
                    <Users className="w-5 h-5" />
                    <span>{followers.length} Total Followers</span>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search followers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium transition-all"
                />
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="py-20 flex justify-center">
                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                </div>
            ) : filteredFollowers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFollowers.map((follower, index) => (
                        <motion.div
                            key={follower.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white p-6 rounded-3xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden ring-4 ring-white shadow-lg">
                                    <img
                                        src={follower.avatar}
                                        alt={follower.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                    Follower
                                </span>
                            </div>

                            <h3 className="text-lg font-black text-gray-900 mb-1">{follower.name}</h3>

                            <div className="space-y-3 mt-4 pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="truncate">{follower.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>Followed {format(new Date(follower.followedAt), 'MMM d, yyyy')}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 border-dashed">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No followers yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Once users start following your agency, they will appear here.
                        Keep posting great content to attract more followers!
                    </p>
                </div>
            )}
        </div>
    );
}
