'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Upload, Trash2, Play,
    X, Loader2, Video, Eye,
    CheckCircle2, AlertCircle, ShoppingBag
} from 'lucide-react';
import {
    getCurrentVendor,
    fetchVendorShorts,
    addShort,
    deleteShort,
    uploadMedia,
    fetchVendorServices
} from '@/lib/vendor-service';
import { toast } from 'react-hot-toast';

export default function VendorShortsPage() {
    const [shorts, setShorts] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [vendor, setVendor] = useState<any>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const [newShort, setNewShort] = useState({
        title: '',
        video_url: '',
        service_id: '',
        thumbnail_url: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const vendorData = await getCurrentVendor();
            setVendor(vendorData);
            if (vendorData) {
                const [shortsData, servicesData] = await Promise.all([
                    fetchVendorShorts(vendorData.id),
                    fetchVendorServices(vendorData.id)
                ]);
                setShorts(shortsData || []);
                setServices(servicesData || []);
            }
        } catch (error) {
            toast.error('Failed to load shorts');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVideoUpload = async (file: File) => {
        if (!vendor) return;
        try {
            toast.loading('Uploading video...', { id: 'upload' });
            const url = await uploadMedia('shorts', file, vendor.id);
            setNewShort({ ...newShort, video_url: url });
            toast.success('Video uploaded successfully', { id: 'upload' });
        } catch (error: any) {
            toast.error(error.message || 'Upload failed', { id: 'upload' });
        }
    };

    const handleAddShort = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendor || !newShort.video_url) {
            toast.error('Please upload a video');
            return;
        }

        setIsSaving(true);
        try {
            const data = await addShort({
                title: newShort.title,
                video_url: newShort.video_url,
                thumbnail_url: newShort.thumbnail_url || newShort.video_url,
                service_id: newShort.service_id || null,
                vendor_id: vendor.id,
                is_approved: false
            });
            setShorts([data, ...shorts]);
            setShowAddModal(false);
            setNewShort({ title: '', video_url: '', service_id: '', thumbnail_url: '' });
            toast.success('Short submitted for approval!');
        } catch (error) {
            toast.error('Failed to submit short');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently delete this short?')) return;
        try {
            await deleteShort(id);
            setShorts(shorts.filter(s => s.id !== id));
            toast.success('Short deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shorts & Reels</h1>
                    <p className="text-gray-500 font-medium text-sm">Create viral vertical content to boost your service visibility</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-600/10 hover:bg-primary-700 transition-all flex items-center gap-2 group"
                >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    Upload Short
                </button>
            </div>

            {/* Shorts Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {shorts.map((short, index) => (
                    <motion.div
                        key={short.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative aspect-[9/16] bg-gray-900 rounded-[2rem] overflow-hidden group shadow-lg"
                    >
                        {/* Video Preview (Real vertical video mockup) */}
                        <video
                            src={short.video_url}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            muted
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                        />

                        {/* Status Badge */}
                        <div className="absolute top-4 left-4 z-10">
                            {short.is_approved ? (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/80 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase ring-1 ring-white/20">
                                    <CheckCircle2 className="w-3 h-3" /> Approved
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/80 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase ring-1 ring-white/20">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Pending
                                </div>
                            )}
                        </div>

                        {/* Top Right Analytics Overlay */}
                        <div className="absolute top-4 right-4 z-10">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur-md text-white rounded-full text-[10px] font-black">
                                <Eye className="w-3 h-3" /> {short.view_count || 0}
                            </div>
                        </div>

                        {/* Bottom Info Overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12">
                            <h3 className="text-white text-xs font-black mb-1 line-clamp-1 truncate uppercase tracking-tight">{short.title || 'Untitled Short'}</h3>
                            {short.services && (
                                <div className="flex items-center gap-1.5 text-[9px] text-primary-300 font-black uppercase tracking-widest">
                                    <ShoppingBag className="w-2.5 h-2.5" /> {short.services.title}
                                </div>
                            )}
                        </div>

                        {/* Hover Delete Action */}
                        <button
                            onClick={() => handleDelete(short.id)}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-xl"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </motion.div>
                ))}

                {/* Add New Placeholder */}
                <button
                    onClick={() => setShowAddModal(true)}
                    className="group border-2 border-dashed border-gray-200 rounded-[2rem] hover:border-primary-300 hover:bg-primary-50/20 transition-all flex flex-col items-center justify-center aspect-[9/16]"
                >
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary-100 transition-all">
                        <Video className="w-6 h-6 text-gray-400 group-hover:text-primary-600" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary-600">Create Magic</span>
                </button>
            </div>

            {/* Empty State */}
            {shorts.length === 0 && (
                <div className="bg-white rounded-[4rem] text-center py-24 border border-gray-100 shadow-sm mt-12 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -ml-32 -mb-32 opacity-50" />

                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary-500/20">
                            <Video className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Zero Impact yet?</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-10 font-medium leading-relaxed">
                            Vertical videos have 10x higher engagement. Upload your first short now to start trending on WENWEX.
                        </p>
                        <button onClick={() => setShowAddModal(true)} className="px-12 py-6 bg-gray-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-primary-600 transition-all shadow-xl shadow-gray-900/10 active:scale-[0.98]">
                            Submit First Reel
                        </button>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                            onClick={() => setShowAddModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative bg-white rounded-[3rem] p-10 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50"
                        >
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>

                            <h3 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter">Viral Engine</h3>
                            <p className="text-gray-500 font-bold mb-10 text-xs uppercase tracking-[0.2em] text-primary-600">Premium Short Upload</p>

                            <form onSubmit={handleAddShort} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Short Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter a catchy title..."
                                        className="w-full h-16 px-8 rounded-[2rem] bg-gray-50 border-none focus:ring-4 focus:ring-primary-100 outline-none transition-all font-black text-gray-900"
                                        value={newShort.title}
                                        onChange={(e) => setNewShort({ ...newShort, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Link to Service (Optional)</label>
                                    <select
                                        value={newShort.service_id}
                                        onChange={(e) => setNewShort({ ...newShort, service_id: e.target.value })}
                                        className="w-full h-16 px-8 rounded-[2rem] bg-gray-50 border-none focus:ring-4 focus:ring-primary-100 outline-none transition-all font-bold text-gray-900 cursor-pointer"
                                    >
                                        <option value="">No Linked Service</option>
                                        {services.map(s => (
                                            <option key={s.id} value={s.id}>{s.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Main Video Clip</label>
                                    <div
                                        onClick={() => document.getElementById('short-video')?.click()}
                                        className={`relative w-full aspect-[9/10] rounded-[2.5rem] border-4 border-dashed ${newShort.video_url ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50'} hover:border-primary-200 hover:bg-primary-50 transition-all group flex flex-col items-center justify-center cursor-pointer overflow-hidden`}
                                    >
                                        {newShort.video_url ? (
                                            <video src={newShort.video_url} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop />
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                    <Upload className="w-8 h-8 text-primary-600" />
                                                </div>
                                                <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Drop Video (Max 60s)</span>
                                            </>
                                        )}
                                        <input
                                            id="short-video"
                                            type="file"
                                            className="hidden"
                                            accept="video/*"
                                            onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSaving || !newShort.video_url}
                                        className="w-full py-6 bg-primary-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary-500/30 hover:bg-primary-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                                        {isSaving ? 'Launching...' : 'Submit to Moderation'}
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
