'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Upload, Trash2, Edit, Play, FileText, Link as LinkIcon, GripVertical, Loader2, X, Globe, ImageIcon as LucideImage, Video, CheckCircle2 } from 'lucide-react';
import { getCurrentVendor, fetchVendorPortfolio, addPortfolioItem, deletePortfolioItem, uploadMedia } from '@/lib/vendor-service';
import { toast } from 'react-hot-toast';

const typeIcons: any = {
    IMAGE: LucideImage,
    VIDEO: Play,
    PDF: FileText,
    LINK: LinkIcon,
    TEXT: FileText,
    SHORT: Video
};

export default function VendorPortfolioPage() {
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [vendor, setVendor] = useState<any>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        type: 'IMAGE',
        url: '',
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
                const portfolioData = await fetchVendorPortfolio(vendorData.id);
                setItems(portfolioData || []);
            }
        } catch (error: any) {
            console.error('Error loading portfolio:', error);
            // Only show error if it's not a "no rows" error
            if (!error.message?.includes('no rows')) {
                toast.error('Failed to load portfolio');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (file: File) => {
        if (!vendor) return;
        setIsSaving(true);
        setUploadProgress(10);
        const toastId = toast.loading('Uploading asset...');
        try {
            const bucket = 'portfolio';
            const url = await uploadMedia(bucket, file, vendor.id);
            setNewItem(prev => ({ ...prev, url: url, thumbnail_url: prev.type === 'IMAGE' ? url : '' }));
            toast.success('Asset synchronized', { id: toastId });
        } catch (error: any) {
            toast.error(error.message || 'Upload failed', { id: toastId });
        } finally {
            setIsSaving(false);
            setUploadProgress(0);
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendor || !newItem.title || (!newItem.url && newItem.type !== 'TEXT')) {
            toast.error('Please fill in required fields and upload a file');
            return;
        }

        setIsSaving(true);
        try {
            // Ensure fields match DB @map attributes
            const submitData = {
                title: newItem.title,
                description: newItem.description,
                type: newItem.type as any,
                url: newItem.url || '',
                thumbnail_url: newItem.thumbnail_url || '',
                vendor_id: vendor.id,
                order: items.length
            };

            const item = await addPortfolioItem(submitData);
            setItems([...items, item]);
            setShowAddModal(false);
            setNewItem({ title: '', description: '', type: 'IMAGE', url: '', thumbnail_url: '' });
            toast.success('Project added to portfolio');
        } catch (error: any) {
            toast.error('Failed to add item: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this item?')) return;
        try {
            await deletePortfolioItem(id);
            setItems(items.filter(i => i.id !== id));
            toast.success('Item removed');
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
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Portfolio</h1>
                    <p className="text-gray-500 font-medium italic">Showcase your industry excellence and key achievements</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-600/20 hover:bg-primary-700 transition-all flex items-center gap-2 group"
                >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    New Project
                </button>
            </div>

            {/* Portfolio Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {items.map((item, index) => {
                    const TypeIcon = typeIcons[item.type] || LucideImage;
                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-primary-100 transition-all duration-500"
                        >
                            {/* Media Preview Area */}
                            <div className="relative aspect-video overflow-hidden bg-gray-50 border-b border-gray-50">
                                {item.type === 'IMAGE' && item.url ? (
                                    <img
                                        src={item.url}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : item.type === 'VIDEO' && item.url ? (
                                    <video src={item.url} className="w-full h-full object-cover" muted onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                        <TypeIcon className="w-12 h-12 text-primary-200 mb-2" />
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{item.type}</span>
                                    </div>
                                )}

                                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-gray-100">
                                    <TypeIcon className="w-3 h-3 text-primary-600" />
                                    <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{item.type}</span>
                                </div>

                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-primary-600/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
                                    {item.url && (
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg group/link"
                                        >
                                            <Globe className="w-5 h-5 text-primary-600 group-hover:rotate-12 transition-transform" />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg group/del"
                                    >
                                        <Trash2 className="w-5 h-5 text-red-500 group-hover:shake transition-transform" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-sm font-black text-gray-900 mb-2 line-clamp-1 uppercase tracking-tight group-hover:text-primary-600 transition-colors">{item.title}</h3>
                                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-medium">{item.description}</p>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Add New Card */}
                <button
                    onClick={() => setShowAddModal(true)}
                    className="group bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[2.5rem] hover:border-primary-300 hover:bg-primary-50/30 transition-all flex flex-col items-center justify-center aspect-video"
                >
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 group-hover:bg-primary-600 transition-all">
                        <Plus className="w-6 h-6 text-primary-500 group-hover:text-white" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary-600">Add New Insight</span>
                </button>
            </div>

            {/* Empty State */}
            {items.length === 0 && (
                <div className="bg-white rounded-[3rem] text-center py-20 border border-gray-100 shadow-sm mt-8">
                    <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <LucideImage className="w-10 h-10 text-primary-400" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Empty Portfolio</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">
                        Your professional portfolio is the heartbeat of your profile. Start adding your masterworks to convert visitors!
                    </p>
                    <button onClick={() => setShowAddModal(true)} className="px-10 py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-600/20 hover:scale-105 transition-all">
                        Build your Legacy
                    </button>
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
                            className="absolute inset-0 bg-gray-900/90 backdrop-blur-md"
                            onClick={() => setShowAddModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-[3rem] p-10 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>

                            <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Expand Portfolio</h3>
                            <p className="text-gray-500 font-medium mb-10 text-sm italic">"Your work speaks louder than words"</p>

                            <form onSubmit={handleAddItem} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Project Name*</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Enterprise Fintech Suite"
                                        className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900"
                                        value={newItem.title}
                                        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-3 font-sans">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        {newItem.type === 'TEXT' ? 'Article / Case Study Content*' : 'Context / Impact'}
                                    </label>
                                    <textarea
                                        rows={newItem.type === 'TEXT' ? 8 : 4}
                                        placeholder={newItem.type === 'TEXT' ? "Write your case study or article here..." : "What was the goal and outcome?"}
                                        className="w-full p-6 rounded-3xl bg-gray-50 border-none focus:ring-4 focus:ring-primary-100 outline-none transition-all font-medium text-gray-900 resize-none leading-relaxed"
                                        value={newItem.description}
                                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                        required={newItem.type === 'TEXT'}
                                    />
                                </div>

                                {newItem.type === 'LINK' && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">External Asset URL*</label>
                                        <div className="relative">
                                            <input
                                                type="url"
                                                placeholder="https://your-work.com/project"
                                                className="w-full h-16 pl-14 pr-8 rounded-[2rem] bg-gray-50 border-none focus:ring-4 focus:ring-primary-100 outline-none transition-all font-black text-gray-900"
                                                value={newItem.url}
                                                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                                                required
                                            />
                                            <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Content Class</label>
                                        <select
                                            value={newItem.type}
                                            onChange={(e) => setNewItem({ ...newItem, type: e.target.value, url: '' })}
                                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900 cursor-pointer"
                                        >
                                            <option value="IMAGE">Photography/UI</option>
                                            <option value="VIDEO">Video Promo</option>
                                            <option value="PDF">Whitepaper/Doc</option>
                                            <option value="LINK">Live URL</option>
                                            <option value="TEXT">Article/Text</option>
                                            <option value="SHORT">Short Clip</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Upload File</label>
                                        <div
                                            onClick={() => !['LINK', 'TEXT'].includes(newItem.type) && document.getElementById('portfolio-file')?.click()}
                                            className={`w-full h-14 px-6 rounded-2xl ${['LINK', 'TEXT'].includes(newItem.type) ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'bg-primary-50 cursor-pointer'} flex items-center justify-between group transition-all`}
                                        >
                                            <span className="text-xs font-black uppercase text-primary-600">
                                                {isSaving ? 'Uploading...' : newItem.url ? 'File Ready' : 'Select File'}
                                            </span>
                                            {isSaving ? <Loader2 className="w-4 h-4 text-primary-600 animate-spin" /> : <Upload className={`w-4 h-4 text-primary-600 transition-transform ${newItem.url ? '' : 'group-hover:-translate-y-1'}`} />}
                                            <input
                                                id="portfolio-file"
                                                type="file"
                                                className="hidden"
                                                accept="image/*,video/*,.pdf,.doc,.docx"
                                                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {newItem.type === 'LINK' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Live Asset URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900"
                                            value={newItem.url}
                                            onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                                        />
                                    </div>
                                )}

                                {newItem.url && !['LINK', 'TEXT'].includes(newItem.type) && (
                                    <div className="p-4 rounded-3xl bg-green-50 border border-green-100 flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            <div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Linked Media</span>
                                                <span className="text-xs font-black text-green-700 uppercase">Synchronized: {newItem.type}</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setNewItem({ ...newItem, url: '' })}
                                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-green-100 text-green-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving || (!newItem.url && !['LINK', 'TEXT'].includes(newItem.type))}
                                        className="flex-[2] py-5 bg-primary-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary-600/30 hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        Append Project
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
