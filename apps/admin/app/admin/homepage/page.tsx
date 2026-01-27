'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, Edit3, Save, Eye, EyeOff, Layout,
    ArrowUp, ArrowDown, Settings, AlertCircle, Loader2, Check,
    Plus, Trash2, Image as ImageIcon, Palette, Type, List, Grid
} from 'lucide-react';
import {
    fetchHomepageSections, updateHomepageSection, initializeHomepage,
    createHomepageSection, deleteHomepageSection
} from '@/lib/admin-service';
import { toast } from 'react-hot-toast';

export default function AdminHomepagePage() {
    const [sections, setSections] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSection, setSelectedSection] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadSections();
    }, []);

    const loadSections = async () => {
        setIsLoading(true);
        try {
            const data = await fetchHomepageSections();
            setSections(data || []);
        } catch (error: any) {
            toast.error('Failed to load sections: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInitialize = async () => {
        setIsLoading(true);
        try {
            await initializeHomepage();
            toast.success('Homepage layout initialized');
            loadSections();
        } catch (error: any) {
            toast.error('Initialization failed: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateConfig = (key: string, value: any) => {
        setSelectedSection({
            ...selectedSection,
            config: {
                ...selectedSection.config,
                [key]: value
            }
        });
    };

    const handleToggleVisibility = async (section: any) => {
        try {
            await updateHomepageSection(section.id, { is_visible: !section.is_visible });
            toast.success(`Section ${!section.is_visible ? 'visible' : 'hidden'}`);
            loadSections();
        } catch (error: any) {
            toast.error('Update failed: ' + error.message);
        }
    };

    const handleDeleteSection = async (id: string) => {
        if (!confirm('Are you sure you want to delete this section? This cannot be undone.')) return;
        try {
            await deleteHomepageSection(id);
            toast.success('Section deleted');
            if (selectedSection?.id === id) setSelectedSection(null);
            loadSections();
        } catch (error: any) {
            toast.error('Delete failed: ' + error.message);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSection) return;

        setIsUpdating(true);
        try {
            if (selectedSection.isNew) {
                // Create
                const { isNew, ...sectionData } = selectedSection;
                await createHomepageSection({
                    ...sectionData,
                    order: sections.length + 1
                });
                toast.success('Section created successfully');
            } else {
                // Update
                await updateHomepageSection(selectedSection.id, {
                    title: selectedSection.title,
                    subtitle: selectedSection.subtitle,
                    config: selectedSection.config,
                    type: selectedSection.type
                });
                toast.success('Section updated successfully');
            }
            setSelectedSection(null);
            loadSections();
        } catch (error: any) {
            toast.error('Save failed: ' + error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const createNewSection = () => {
        setSelectedSection({
            isNew: true,
            title: 'New Section',
            subtitle: '',
            type: 'FEATURED_SERVICES',
            is_visible: true,
            config: { limit: 4, layout: 'grid' }
        });
    };

    const SECTION_TYPES = [
        { value: 'HERO', label: 'Main Hero Banner' },
        { value: 'CATEGORIES', label: 'Category Browser' },
        { value: 'FEATURED_SERVICES', label: 'Featured Services' },
        { value: 'TOP_AGENCIES', label: 'Top-Rated Agencies' },
        { value: 'TRENDING_SERVICES', label: 'Trending Services' },
        { value: 'ACADEMIC_SPOTLIGHT', label: 'Academic Spotlight' },
        { value: 'MARKETPLACE_SPOTLIGHT', label: 'Marketplace Spotlight' },
        { value: 'CTA', label: 'Call to Action Banner' },
        { value: 'TEAM', label: 'Founders & Team Section' },
        { value: 'TESTIMONIALS', label: 'Customer Testimonials' },
        { value: 'HTML', label: 'Custom HTML/Text' }
    ];

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Homepage Content Manager</h1>
                    <p className="text-gray-400">Edit dynamic sections of the buyer-facing website</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={createNewSection}
                        className="btn-primary gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Section
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary-500/10 text-primary-400 rounded-lg text-sm font-medium border border-primary-500/20">
                        <Globe className="w-4 h-4" />
                        Live System
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sections List */}
                <div className="lg:col-span-2 space-y-4">
                    {isLoading ? (
                        <div className="card py-20 text-center">
                            <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
                            <p className="text-gray-400">Loading layout structure...</p>
                        </div>
                    ) : sections.length > 0 ? (
                        sections.map((section, index) => (
                            <motion.div
                                key={section.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`card group border border-gray-700/50 hover:border-primary-500/50 transition-all ${!section.is_visible ? 'opacity-60 bg-gray-900/50' : 'bg-gray-800/40'}`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-700/50 flex items-center justify-center text-gray-400 font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-white">{section.title}</h3>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter bg-gray-700 text-gray-400 border border-gray-600">
                                                    {section.type}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">{section.subtitle || 'No subtitle provided'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleVisibility(section)}
                                            className={`p-2 rounded-lg transition-colors ${section.is_visible ? 'text-green-400 hover:bg-green-500/10' : 'text-gray-500 hover:bg-gray-700'}`}
                                            title={section.is_visible ? 'Hide Section' : 'Show Section'}
                                        >
                                            {section.is_visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => setSelectedSection({ ...section, config: section.config || {} })}
                                            className="p-2 text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                                            title="Edit Content"
                                        >
                                            <Edit3 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSection(section.id)}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Delete Section"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <div className="h-4 w-[1px] bg-gray-700 mx-1" />
                                        <div className="flex flex-col gap-1">
                                            <button className="p-1 text-gray-500 hover:text-white transition-colors"><ArrowUp className="w-3.5 h-3.5" /></button>
                                            <button className="p-1 text-gray-500 hover:text-white transition-colors"><ArrowDown className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="card py-20 text-center border-dashed border-2">
                            <Layout className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <h3 className="text-white font-bold mb-1">No Dynamic Sections</h3>
                            <p className="text-gray-500 text-sm mb-6">Initialize sections from the database to start editing.</p>
                            <button
                                onClick={handleInitialize}
                                className="btn-primary"
                                disabled={isLoading}
                            >
                                <Layout className="w-4 h-4" />
                                Initialize Homepage Layout
                            </button>
                        </div>
                    )}
                </div>

                {/* Editor Panel */}
                <div className="lg:col-span-1">
                    <AnimatePresence mode="wait">
                        {selectedSection ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="card sticky top-24 border-primary-500/30 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar"
                            >
                                <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#111827] z-10 py-2 border-b border-gray-800">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-primary-500" />
                                        {selectedSection.isNew ? 'New Section' : 'Edit Section'}
                                    </h2>
                                    <button onClick={() => setSelectedSection(null)} className="text-gray-500 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSave} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-500 uppercase">Section Type</label>
                                        <div className="relative">
                                            <select
                                                className="input w-full appearance-none"
                                                value={selectedSection.type}
                                                onChange={(e) => setSelectedSection({ ...selectedSection, type: e.target.value })}
                                                disabled={!selectedSection.isNew} // Lock type after creation usually better
                                            >
                                                {SECTION_TYPES.map(t => (
                                                    <option key={t.value} value={t.value}>{t.label}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ArrowDown className="w-4 h-4 text-gray-500" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-500 uppercase">Section Title</label>
                                        <input
                                            type="text"
                                            className="input w-full"
                                            value={selectedSection.title}
                                            onChange={(e) => setSelectedSection({ ...selectedSection, title: e.target.value })}
                                            placeholder="e.g. Featured Services"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-500 uppercase">Subtitle / Caption</label>
                                        <textarea
                                            className="input w-full h-20 resize-none"
                                            value={selectedSection.subtitle || ''}
                                            onChange={(e) => setSelectedSection({ ...selectedSection, subtitle: e.target.value })}
                                            placeholder="Optional subtitle..."
                                        />
                                    </div>

                                    {/* VISUAL CONFIGURATION EDITORS */}
                                    <div className="space-y-4 pt-4 border-t border-gray-800">
                                        <h3 className="text-xs font-bold text-white flex items-center gap-2">
                                            <Palette className="w-3 h-3 text-primary-400" /> Visual Configuration
                                        </h3>

                                        {/* Common Fields */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-500 uppercase">Max Items to Show</label>
                                            <input
                                                type="number"
                                                className="input w-full"
                                                value={selectedSection.config.limit || ''}
                                                onChange={(e) => handleUpdateConfig('limit', parseInt(e.target.value))}
                                                placeholder="e.g. 4"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-500 uppercase">Bg Color</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        className="h-9 w-9 p-0 border-0 rounded bg-transparent cursor-pointer"
                                                        value={selectedSection.config.background_color || '#000000'}
                                                        onChange={(e) => handleUpdateConfig('background_color', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="input w-full text-xs"
                                                        value={selectedSection.config.background_color || ''}
                                                        onChange={(e) => handleUpdateConfig('background_color', e.target.value)}
                                                        placeholder="#Hex"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-500 uppercase">Text Color</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        className="h-9 w-9 p-0 border-0 rounded bg-transparent cursor-pointer"
                                                        value={selectedSection.config.text_color || '#ffffff'}
                                                        onChange={(e) => handleUpdateConfig('text_color', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="input w-full text-xs"
                                                        value={selectedSection.config.text_color || ''}
                                                        onChange={(e) => handleUpdateConfig('text_color', e.target.value)}
                                                        placeholder="#Hex"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Image URL with Preview */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                                                <ImageIcon className="w-3 h-3" /> Background / Banner Image
                                            </label>
                                            <input
                                                type="text"
                                                className="input w-full text-xs font-mono"
                                                value={selectedSection.config.banner_image || ''}
                                                onChange={(e) => handleUpdateConfig('banner_image', e.target.value)}
                                                placeholder="https://..."
                                            />
                                            {selectedSection.config.banner_image && (
                                                <div className="mt-2 rounded-lg overflow-hidden h-24 border border-gray-700">
                                                    <img src={selectedSection.config.banner_image} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Team Specifics */}
                                        {selectedSection.type === 'TEAM' && (
                                            <div className="space-y-4 pt-2 border-t border-gray-800 border-dashed">
                                                <p className="text-[10px] font-bold text-primary-400 uppercase leading-none">Team Members</p>

                                                <div className="space-y-3">
                                                    {(selectedSection.config.members || []).map((member: any, mIdx: number) => (
                                                        <div key={mIdx} className="bg-gray-900/50 p-3 rounded-xl border border-gray-800 relative group">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newMembers = [...selectedSection.config.members];
                                                                    newMembers.splice(mIdx, 1);
                                                                    handleUpdateConfig('members', newMembers);
                                                                }}
                                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Name"
                                                                    className="input-sm w-full bg-gray-950"
                                                                    value={member.name || ''}
                                                                    onChange={(e) => {
                                                                        const newMembers = [...selectedSection.config.members];
                                                                        newMembers[mIdx] = { ...member, name: e.target.value };
                                                                        handleUpdateConfig('members', newMembers);
                                                                    }}
                                                                />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Role"
                                                                    className="input-sm w-full bg-gray-950"
                                                                    value={member.role || ''}
                                                                    onChange={(e) => {
                                                                        const newMembers = [...selectedSection.config.members];
                                                                        newMembers[mIdx] = { ...member, role: e.target.value };
                                                                        handleUpdateConfig('members', newMembers);
                                                                    }}
                                                                />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Image URL"
                                                                    className="input-sm w-full bg-gray-950 col-span-2"
                                                                    value={member.image || ''}
                                                                    onChange={(e) => {
                                                                        const newMembers = [...selectedSection.config.members];
                                                                        newMembers[mIdx] = { ...member, image: e.target.value };
                                                                        handleUpdateConfig('members', newMembers);
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newMembers = [...(selectedSection.config.members || [])];
                                                            newMembers.push({ name: '', role: '', image: '' });
                                                            handleUpdateConfig('members', newMembers);
                                                        }}
                                                        className="w-full py-2 border border-dashed border-gray-700 rounded-xl text-gray-500 hover:text-primary-400 hover:border-primary-500/50 transition-all text-xs flex items-center justify-center gap-2"
                                                    >
                                                        <Plus className="w-4 h-4" /> Add Member
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Hero Specifics */}
                                        {selectedSection.type === 'HERO' && (
                                            <div className="space-y-3 pt-2 border-t border-gray-800 border-dashed">
                                                <p className="text-[10px] font-bold text-primary-400 uppercase">Hero Configuration</p>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase">Featured Vendor Name</label>
                                                    <input
                                                        type="text"
                                                        className="input w-full"
                                                        value={selectedSection.config.featured_vendor || ''}
                                                        onChange={(e) => handleUpdateConfig('featured_vendor', e.target.value)}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-gray-500 uppercase">CTA Text</label>
                                                        <input
                                                            type="text"
                                                            className="input w-full"
                                                            value={selectedSection.config.primary_cta?.text || ''}
                                                            onChange={(e) => handleUpdateConfig('primary_cta', { ...selectedSection.config.primary_cta, text: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-gray-500 uppercase">CTA Link</label>
                                                        <input
                                                            type="text"
                                                            className="input w-full"
                                                            value={selectedSection.config.primary_cta?.link || ''}
                                                            onChange={(e) => handleUpdateConfig('primary_cta', { ...selectedSection.config.primary_cta, link: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Advanced JSON Editor (Fallback) */}
                                    <div className="space-y-1.5 pt-4 border-t border-gray-800">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black text-gray-500 uppercase">Advanced Configuration (JSON)</label>
                                            <span className="text-[10px] text-gray-600 bg-gray-900 px-1.5 rounded">Developers Only</span>
                                        </div>
                                        <textarea
                                            className="input w-full h-24 font-mono text-[10px] leading-relaxed text-gray-400 bg-gray-950/50"
                                            value={JSON.stringify(selectedSection.config, null, 2)}
                                            onChange={(e) => {
                                                try {
                                                    const parsed = JSON.parse(e.target.value);
                                                    setSelectedSection({ ...selectedSection, config: parsed });
                                                } catch (err) { }
                                            }}
                                        />
                                    </div>

                                    <div className="pt-4 space-y-3 sticky bottom-0 bg-[#111827] pb-2 border-t border-gray-800">
                                        <button
                                            type="submit"
                                            className="btn-primary w-full gap-2 py-3"
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            {selectedSection.isNew ? 'Create Section' : 'Publish Changes'}
                                        </button>
                                        <div className="flex items-center gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                                            <Check className="w-4 h-4 text-blue-500 shrink-0" />
                                            <p className="text-[10px] text-blue-500/80 leading-tight">
                                                Updates propagate to the live website instantly.
                                            </p>
                                        </div>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <div className="card h-[400px] flex flex-col items-center justify-center text-center opacity-50 border-dashed sticky top-24">
                                <Edit3 className="w-12 h-12 text-gray-700 mb-4" />
                                <p className="text-gray-500 max-w-[200px]">Select a section from the list to edit, or click "Add Section" to create new content.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function X({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
}
