'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, Search, Loader2, UserMinus, MessageSquare,
    TrendingUp, Calendar, MapPin, ExternalLink, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCurrentVendor } from '@/lib/vendor-service';
import { getSupabaseClient } from '@/lib/supabase';

interface Follower {
    id: string;
    user_id: string;
    created_at: string;
    user?: {
        id: string;
        email?: string;
        full_name?: string;
        avatar_url?: string;
        created_at?: string;
    };
}

export default function VendorFollowersPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [followers, setFollowers] = useState<Follower[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [totalFollowers, setTotalFollowers] = useState(0);
    const [vendor, setVendor] = useState<any>(null);
    const supabase = getSupabaseClient();

    useEffect(() => {
        loadFollowers();
    }, []);

    const loadFollowers = async () => {
        try {
            setIsLoading(true);

            // Get current vendor
            const vendorData = await getCurrentVendor();
            if (!vendorData) {
                toast.error('Vendor not found');
                setIsLoading(false);
                return;
            }
            setVendor(vendorData);

            // Fetch followers from database
            const { data, error, count } = await supabase
                .from('vendor_followers')
                .select(`
                    id,
                    user_id,
                    created_at
                `, { count: 'exact' })
                .eq('vendor_id', vendorData.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching followers:', error);
                toast.error('Failed to load followers');
                return;
            }

            // For each follower, fetch user details
            const followersWithUsers = await Promise.all(
                (data || []).map(async (follower) => {
                    const { data: userData } = await supabase
                        .from('users')
                        .select('id, email, full_name, avatar_url, created_at')
                        .eq('id', follower.user_id)
                        .single();

                    return {
                        ...follower,
                        user: userData || { id: follower.user_id }
                    };
                })
            );

            setFollowers(followersWithUsers);
            setTotalFollowers(count || 0);
        } catch (error) {
            console.error('Error loading followers:', error);
            toast.error('Failed to load followers');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredFollowers = followers.filter(f =>
        (f.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Followers</h1>
                        <p className="text-gray-500 font-medium">People who followed your profile</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                            <Users className="w-7 h-7 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-gray-900">{totalFollowers}</p>
                            <p className="text-sm text-gray-500 font-medium">Total Followers</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="w-7 h-7 text-green-600" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-gray-900">
                                {followers.filter(f => {
                                    const followDate = new Date(f.created_at);
                                    const now = new Date();
                                    const diffDays = Math.floor((now.getTime() - followDate.getTime()) / (1000 * 60 * 60 * 24));
                                    return diffDays <= 30;
                                }).length}
                            </p>
                            <p className="text-sm text-gray-500 font-medium">New This Month</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center">
                            <MessageSquare className="w-7 h-7 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-gray-900">
                                {followers.filter(f => {
                                    const followDate = new Date(f.created_at);
                                    const now = new Date();
                                    const diffDays = Math.floor((now.getTime() - followDate.getTime()) / (1000 * 60 * 60 * 24));
                                    return diffDays <= 7;
                                }).length}
                            </p>
                            <p className="text-sm text-gray-500 font-medium">New This Week</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search followers by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium text-gray-900"
                    />
                </div>
            </div>

            {/* Followers List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {filteredFollowers.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No followers yet</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            {searchQuery
                                ? 'No followers match your search criteria.'
                                : 'When people follow your profile, they will appear here.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredFollowers.map((follower, index) => (
                            <motion.div
                                key={follower.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors group"
                            >
                                {/* Avatar */}
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
                                    {follower.user?.avatar_url ? (
                                        <img
                                            src={follower.user.avatar_url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>
                                            {(follower.user?.full_name || follower.user?.email || 'U')[0].toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate">
                                        {follower.user?.full_name || 'WENWEX User'}
                                    </h4>
                                    <p className="text-sm text-gray-500 truncate">
                                        {follower.user?.email || 'No email available'}
                                    </p>
                                </div>

                                {/* Follow Date */}
                                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
                                    <Calendar className="w-4 h-4" />
                                    <span>Followed {formatDate(follower.created_at)}</span>
                                </div>

                                {/* Actions */}
                                <button
                                    className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary-50 hover:text-primary-600"
                                    title="View profile"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
