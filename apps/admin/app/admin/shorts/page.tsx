'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Search, CheckCircle, XCircle, Clock, Edit2, Trash2,
    MoreVertical, Loader2, ExternalLink, ShieldAlert, Eye, Heart,
    Plus, Save, X, Link as LinkIcon, Image
} from 'lucide-react';
import { fetchShorts, updateShortStatus } from '@/lib/admin-service';
import { toast } from 'react-hot-toast';
import { getSupabaseClient } from '@/lib/supabase';

const supabase = getSupabaseClient();

export default function AdminShortsPage() {
    const [shorts, setShorts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedShort, setSelectedShort] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadShorts();
    }, []);

    const loadShorts = async () => {
        setIsLoading(true);
        try {
            const data = await fetchShorts();
            setShorts(data || []);
        } catch (error: any) {
            toast.error('Failed to load shorts: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await updateShortStatus(id, !currentStatus);
            toast.success(`Short ${!currentStatus ? 'approved - Now visible on buyer website' : 'unapproved - Hidden from buyer website'}`);
            loadShorts();
        } catch (error: any) {
            toast.error('Failed to update status: ' + error.message);
        }
    };

    const handleDeleteShort = async (id: string) => {
        if (!confirm('Are you sure you want to delete this short? This cannot be undone.')) return;
        try {
            const { error } = await supabase.from('shorts').delete().eq('id', id);
            if (error) throw error;
            toast.success('Short deleted successfully');
            loadShorts();
        } catch (error: any) {
            toast.error('Failed to delete: ' + error.message);
        }
    };

    const handleUpdateShort = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedShort) return;
        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('shorts')
                .update({
                    title: selectedShort.title,
                    video_url: selectedShort.video_url,
                    thumbnail_url: selectedShort.thumbnail_url,
                    view_count: selectedShort.view_count || 0,
                    likes_count: selectedShort.likes_count || 0,
                    comments_count: selectedShort.comments_count || 0,
                })
                .eq('id', selectedShort.id);

            if (error) throw error;
            toast.success('Short updated successfully');
            setIsEditModalOpen(false);
            setSelectedShort(null);
            loadShorts();
        } catch (error: any) {
            toast.error('Failed to update: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (short: any) => {
        setSelectedShort({ ...short });
        setIsEditModalOpen(true);
    };

    const filteredShorts = shorts.filter(short => {
        const matchesSearch = short.vendor?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            short.title?.toLowerCase().includes(searchQuery.toLowerCase());

        if (filter === 'pending') return matchesSearch && !short.is_approved;
        if (filter === 'approved') return matchesSearch && short.is_approved;
        return matchesSearch;
    });

    const pendingCount = shorts.filter(s => !s.is_approved).length;
    const approvedCount = shorts.filter(s => s.is_approved).length;

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Shorts & Reels Moderation</h1>
                    <p className="text-gray-400">Review, approve, and edit vendor-uploaded short videos</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-primary-500/10 text-primary-400 rounded-lg text-sm font-medium">
                    <ShieldAlert className="w-4 h-4" />
                    Strict Moderation Active
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{shorts.length}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Total Shorts</div>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Pending Review</div>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-400">{approvedCount}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Live on Site</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by vendor or title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-12 w-full"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'pending', 'approved'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${filter === f
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                            {f === 'pending' && pendingCount > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-black text-[10px] rounded-full font-bold">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 text-center">
                        <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Loading reels...</p>
                    </div>
                ) : filteredShorts.map((short) => (
                    <motion.div
                        key={short.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card group overflow-hidden p-0 bg-gray-800/50 border-gray-700/50"
                    >
                        <div className="relative aspect-[9/16] bg-black group-hover:bg-gray-900 transition-colors">
                            {short.thumbnail_url ? (
                                <img
                                    src={short.thumbnail_url}
                                    alt={short.title || 'Reel'}
                                    className="w-full h-full object-cover opacity-80"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Play className="w-12 h-12 text-gray-700" />
                                </div>
                            )}

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                    href={short.video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors shadow-xl"
                                >
                                    <Play className="w-6 h-6 fill-white" />
                                </a>
                            </div>

                            {/* Status Badge */}
                            <div className="absolute top-4 right-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${short.is_approved
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                    }`}>
                                    {short.is_approved ? 'Live' : 'Pending'}
                                </span>
                            </div>

                            {/* Stats Overlay */}
                            <div className="absolute bottom-4 left-4 flex gap-2">
                                <div className="flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] text-white font-bold">
                                    <Eye className="w-3 h-3" />
                                    {short.view_count || 0}
                                </div>
                                <div className="flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] text-white font-bold">
                                    <Heart className="w-3 h-3 text-pink-400" />
                                    {short.likes_count || 0}
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="text-sm font-bold text-white truncate mb-1">
                                {short.title || 'Untitled Reel'}
                            </h3>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-[8px] font-bold text-white">
                                    {short.vendor?.company_name?.charAt(0) || 'V'}
                                </div>
                                <span className="text-xs text-gray-400 truncate">
                                    {short.vendor?.company_name || 'Unknown Vendor'}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-700">
                                <button
                                    onClick={() => handleToggleStatus(short.id, short.is_approved)}
                                    className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-all ${short.is_approved
                                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                        : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                        }`}
                                >
                                    {short.is_approved ? (
                                        <><XCircle className="w-3.5 h-3.5" /> Hide</>
                                    ) : (
                                        <><CheckCircle className="w-3.5 h-3.5" /> Go Live</>
                                    )}
                                </button>
                                <button
                                    onClick={() => openEditModal(short)}
                                    className="flex items-center justify-center gap-1 py-2 bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 rounded-lg text-xs font-bold transition-all"
                                >
                                    <Edit2 className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteShort(short.id)}
                                    className="flex items-center justify-center gap-1 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg text-xs font-bold transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {!isLoading && filteredShorts.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-700 rounded-2xl bg-gray-800/30">
                        <Play className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No reels found</h3>
                        <p className="text-gray-400">
                            {filter === 'pending'
                                ? 'All shorts have been reviewed!'
                                : 'Reels uploaded by vendors will appear here.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && selectedShort && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/70" onClick={() => setIsEditModalOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">Edit Short</h2>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateShort} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Title</label>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        value={selectedShort.title || ''}
                                        onChange={e => setSelectedShort({ ...selectedShort, title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Video URL</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="url"
                                            className="input pl-12 w-full text-xs"
                                            value={selectedShort.video_url || ''}
                                            onChange={e => setSelectedShort({ ...selectedShort, video_url: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Thumbnail URL</label>
                                    <div className="relative">
                                        <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="url"
                                            className="input pl-12 w-full text-xs"
                                            value={selectedShort.thumbnail_url || ''}
                                            onChange={e => setSelectedShort({ ...selectedShort, thumbnail_url: e.target.value })}
                                        />
                                    </div>
                                    {selectedShort.thumbnail_url && (
                                        <div className="mt-2 rounded-xl overflow-hidden h-32 aspect-[9/16] max-w-[100px]">
                                            <img src={selectedShort.thumbnail_url} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Views</label>
                                        <input
                                            type="number"
                                            className="input w-full"
                                            value={selectedShort.view_count || 0}
                                            onChange={e => setSelectedShort({ ...selectedShort, view_count: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Likes</label>
                                        <input
                                            type="number"
                                            className="input w-full"
                                            value={selectedShort.likes_count || 0}
                                            onChange={e => setSelectedShort({ ...selectedShort, likes_count: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Comments</label>
                                        <input
                                            type="number"
                                            className="input w-full"
                                            value={selectedShort.comments_count || 0}
                                            onChange={e => setSelectedShort({ ...selectedShort, comments_count: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        className="btn-secondary flex-1"
                                        onClick={() => setIsEditModalOpen(false)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary flex-1"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (
                                            <><Save className="w-4 h-4" /> Save Changes</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
