'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus, Edit3, Trash2, Save, X, Image, Link2, Eye, EyeOff,
    ArrowUp, ArrowDown, Loader2, Sparkles, Palette
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getSupabaseClient } from '@/lib/supabase';

const supabase = getSupabaseClient();

interface PromoSlide {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    image_url: string;
    gradient_from: string;
    gradient_to: string;
    cta_text: string;
    cta_link: string;
    badge_text: string;
    is_active: boolean;
    display_order: number;
}

interface SponsoredItem {
    id: string;
    title: string;
    sponsor_name: string;
    description: string;
    image_url: string;
    cta_text: string;
    cta_link: string;
    tag: string;
    color_from: string;
    color_to: string;
    is_active: boolean;
    display_order: number;
}

export default function AdminCarouselsPage() {
    const [activeTab, setActiveTab] = useState<'promo' | 'sponsored'>('promo');
    const [promoSlides, setPromoSlides] = useState<PromoSlide[]>([]);
    const [sponsoredItems, setSponsoredItems] = useState<SponsoredItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [promoRes, sponsoredRes] = await Promise.all([
                supabase.from('promo_carousel_slides').select('*').order('display_order'),
                supabase.from('sponsored_carousel_items').select('*').order('display_order')
            ]);

            setPromoSlides(promoRes.data || []);
            setSponsoredItems(sponsoredRes.data || []);
        } catch (error: any) {
            console.error('Failed to load carousel data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSavePromo = async (item: PromoSlide) => {
        setIsSaving(true);
        try {
            if (item.id) {
                const { error } = await supabase
                    .from('promo_carousel_slides')
                    .update({
                        title: item.title,
                        subtitle: item.subtitle,
                        description: item.description,
                        image_url: item.image_url,
                        gradient_from: item.gradient_from,
                        gradient_to: item.gradient_to,
                        cta_text: item.cta_text,
                        cta_link: item.cta_link,
                        badge_text: item.badge_text,
                        is_active: item.is_active,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', item.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('promo_carousel_slides')
                    .insert({
                        ...item,
                        display_order: promoSlides.length + 1
                    });
                if (error) throw error;
            }
            toast.success('Promo slide saved!');
            setEditingItem(null);
            loadData();
        } catch (error: any) {
            toast.error('Save failed: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSponsored = async (item: SponsoredItem) => {
        setIsSaving(true);
        try {
            if (item.id) {
                const { error } = await supabase
                    .from('sponsored_carousel_items')
                    .update({
                        title: item.title,
                        sponsor_name: item.sponsor_name,
                        description: item.description,
                        image_url: item.image_url,
                        cta_text: item.cta_text,
                        cta_link: item.cta_link,
                        tag: item.tag,
                        color_from: item.color_from,
                        color_to: item.color_to,
                        is_active: item.is_active,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', item.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('sponsored_carousel_items')
                    .insert({
                        ...item,
                        display_order: sponsoredItems.length + 1
                    });
                if (error) throw error;
            }
            toast.success('Sponsored item saved!');
            setEditingItem(null);
            loadData();
        } catch (error: any) {
            toast.error('Save failed: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, type: 'promo' | 'sponsored') => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const table = type === 'promo' ? 'promo_carousel_slides' : 'sponsored_carousel_items';
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (error) throw error;
            toast.success('Item deleted');
            loadData();
        } catch (error: any) {
            toast.error('Delete failed: ' + error.message);
        }
    };

    const handleToggleActive = async (id: string, isActive: boolean, type: 'promo' | 'sponsored') => {
        try {
            const table = type === 'promo' ? 'promo_carousel_slides' : 'sponsored_carousel_items';
            const { error } = await supabase.from(table).update({ is_active: !isActive }).eq('id', id);
            if (error) throw error;
            toast.success(isActive ? 'Item hidden' : 'Item visible');
            loadData();
        } catch (error: any) {
            toast.error('Update failed: ' + error.message);
        }
    };

    const newPromoSlide = (): PromoSlide => ({
        id: '',
        title: '',
        subtitle: '',
        description: '',
        image_url: '',
        gradient_from: '#6366f1',
        gradient_to: '#8b5cf6',
        cta_text: 'Learn More',
        cta_link: '/services',
        badge_text: '',
        is_active: true,
        display_order: 0
    });

    const newSponsoredItem = (): SponsoredItem => ({
        id: '',
        title: '',
        sponsor_name: '',
        description: '',
        image_url: '',
        cta_text: 'Learn More',
        cta_link: '#',
        tag: 'Featured',
        color_from: '#6366f1',
        color_to: '#8b5cf6',
        is_active: true,
        display_order: 0
    });

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Carousel Management</h1>
                    <p className="text-gray-400">Edit promo and sponsored carousels on the homepage</p>
                </div>
                <button
                    onClick={() => setEditingItem(activeTab === 'promo' ? { ...newPromoSlide(), type: 'promo' } : { ...newSponsoredItem(), type: 'sponsored' })}
                    className="btn-primary gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add New Slide
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('promo')}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'promo' ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Promo Carousel ({promoSlides.length})
                </button>
                <button
                    onClick={() => setActiveTab('sponsored')}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'sponsored' ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                    <Palette className="w-4 h-4 inline mr-2" />
                    Sponsored Carousel ({sponsoredItems.length})
                </button>
            </div>

            {isLoading ? (
                <div className="card py-20 text-center">
                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading carousel data...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Items List */}
                    <div className="space-y-4">
                        {(activeTab === 'promo' ? promoSlides : sponsoredItems).map((item: any, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`card border ${item.is_active ? 'border-gray-700/50' : 'border-gray-800 opacity-60'}`}
                            >
                                <div className="flex gap-4 p-4">
                                    {/* Thumbnail */}
                                    <div className="w-32 h-20 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Image className="w-8 h-8 text-gray-600" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-white truncate">{item.title || 'Untitled'}</h3>
                                            {activeTab === 'sponsored' && (
                                                <span className="px-2 py-0.5 rounded bg-gray-700 text-gray-300 text-[10px] font-bold uppercase">
                                                    {item.sponsor_name}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{item.subtitle || item.description || 'No description'}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div
                                                className="w-4 h-4 rounded"
                                                style={{ background: `linear-gradient(135deg, ${item.gradient_from || item.color_from}, ${item.gradient_to || item.color_to})` }}
                                            />
                                            <span className="text-[10px] text-gray-500 uppercase font-mono">{item.cta_text}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleToggleActive(item.id, item.is_active, activeTab)}
                                            className={`p-2 rounded-lg transition-colors ${item.is_active ? 'text-green-400 hover:bg-green-500/10' : 'text-gray-500 hover:bg-gray-700'}`}
                                        >
                                            {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => setEditingItem({ ...item, type: activeTab })}
                                            className="p-2 text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id, activeTab)}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {(activeTab === 'promo' ? promoSlides : sponsoredItems).length === 0 && (
                            <div className="card py-16 text-center border-dashed">
                                <Image className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                <h3 className="text-white font-bold mb-1">No Slides Yet</h3>
                                <p className="text-gray-500 text-sm">Click "Add New Slide" to create your first carousel item.</p>
                            </div>
                        )}
                    </div>

                    {/* Editor Panel */}
                    <div className="lg:sticky lg:top-24">
                        {editingItem ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="card border-primary-500/30"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-white">
                                        {editingItem.id ? 'Edit Slide' : 'New Slide'}
                                    </h2>
                                    <button onClick={() => setEditingItem(null)} className="text-gray-500 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Title *</label>
                                        <input
                                            type="text"
                                            className="input w-full"
                                            value={editingItem.title || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                                            placeholder="Enter slide title"
                                        />
                                    </div>

                                    {editingItem.type === 'promo' ? (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Subtitle</label>
                                            <input
                                                type="text"
                                                className="input w-full"
                                                value={editingItem.subtitle || ''}
                                                onChange={(e) => setEditingItem({ ...editingItem, subtitle: e.target.value })}
                                                placeholder="Short subtitle"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Sponsor Name *</label>
                                            <input
                                                type="text"
                                                className="input w-full"
                                                value={editingItem.sponsor_name || ''}
                                                onChange={(e) => setEditingItem({ ...editingItem, sponsor_name: e.target.value })}
                                                placeholder="e.g., AWS, Google, Microsoft"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                        <textarea
                                            className="input w-full h-20 resize-none"
                                            value={editingItem.description || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                            placeholder="Describe this slide"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                            <Image className="w-3 h-3" /> Image URL *
                                        </label>
                                        <input
                                            type="text"
                                            className="input w-full text-xs"
                                            value={editingItem.image_url || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                                            placeholder="https://images.unsplash.com/..."
                                        />
                                        {editingItem.image_url && (
                                            <div className="mt-2 rounded-xl overflow-hidden h-24">
                                                <img src={editingItem.image_url} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase">CTA Button Text</label>
                                            <input
                                                type="text"
                                                className="input w-full"
                                                value={editingItem.cta_text || ''}
                                                onChange={(e) => setEditingItem({ ...editingItem, cta_text: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                                <Link2 className="w-3 h-3" /> CTA Link
                                            </label>
                                            <input
                                                type="text"
                                                className="input w-full"
                                                value={editingItem.cta_link || ''}
                                                onChange={(e) => setEditingItem({ ...editingItem, cta_link: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Gradient From</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    className="w-10 h-10 rounded-lg border border-gray-700 cursor-pointer"
                                                    value={editingItem.gradient_from || editingItem.color_from || '#6366f1'}
                                                    onChange={(e) => setEditingItem({
                                                        ...editingItem,
                                                        gradient_from: e.target.value,
                                                        color_from: e.target.value
                                                    })}
                                                />
                                                <input
                                                    type="text"
                                                    className="input flex-1 text-xs"
                                                    value={editingItem.gradient_from || editingItem.color_from || ''}
                                                    onChange={(e) => setEditingItem({
                                                        ...editingItem,
                                                        gradient_from: e.target.value,
                                                        color_from: e.target.value
                                                    })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Gradient To</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    className="w-10 h-10 rounded-lg border border-gray-700 cursor-pointer"
                                                    value={editingItem.gradient_to || editingItem.color_to || '#8b5cf6'}
                                                    onChange={(e) => setEditingItem({
                                                        ...editingItem,
                                                        gradient_to: e.target.value,
                                                        color_to: e.target.value
                                                    })}
                                                />
                                                <input
                                                    type="text"
                                                    className="input flex-1 text-xs"
                                                    value={editingItem.gradient_to || editingItem.color_to || ''}
                                                    onChange={(e) => setEditingItem({
                                                        ...editingItem,
                                                        gradient_to: e.target.value,
                                                        color_to: e.target.value
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {editingItem.type === 'promo' && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Badge Text</label>
                                            <input
                                                type="text"
                                                className="input w-full"
                                                value={editingItem.badge_text || ''}
                                                onChange={(e) => setEditingItem({ ...editingItem, badge_text: e.target.value })}
                                                placeholder="e.g., Limited Time, New, Hot"
                                            />
                                        </div>
                                    )}

                                    {editingItem.type === 'sponsored' && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Tag</label>
                                            <input
                                                type="text"
                                                className="input w-full"
                                                value={editingItem.tag || ''}
                                                onChange={(e) => setEditingItem({ ...editingItem, tag: e.target.value })}
                                                placeholder="e.g., Featured Event, Product Launch"
                                            />
                                        </div>
                                    )}

                                    <div className="pt-4 flex gap-3">
                                        <button
                                            onClick={() => editingItem.type === 'promo' ? handleSavePromo(editingItem) : handleSaveSponsored(editingItem)}
                                            disabled={isSaving || !editingItem.title || !editingItem.image_url}
                                            className="btn-primary flex-1 gap-2"
                                        >
                                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            {isSaving ? 'Saving...' : 'Save Slide'}
                                        </button>
                                        <button
                                            onClick={() => setEditingItem(null)}
                                            className="px-4 py-2 bg-gray-800 text-gray-400 rounded-xl hover:bg-gray-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="card h-[500px] flex flex-col items-center justify-center text-center border-dashed opacity-50">
                                <Edit3 className="w-12 h-12 text-gray-700 mb-4" />
                                <p className="text-gray-500 max-w-[200px]">
                                    Select a slide to edit or click "Add New Slide" to create one
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
