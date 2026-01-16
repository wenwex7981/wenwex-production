'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, Edit3, Save, Eye, EyeOff, Layout,
    ArrowUp, ArrowDown, Settings, AlertCircle, Loader2, Check
} from 'lucide-react';
import { fetchHomepageSections, updateHomepageSection, initializeHomepage } from '@/lib/admin-service';
import { toast } from 'react-hot-toast';

export default function AdminHomepagePage() {
    const [sections, setSections] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSection, setSelectedSection] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);

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

    const handleUpdateContent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSection) return;

        setIsUpdating(true);
        try {
            await updateHomepageSection(selectedSection.id, {
                title: selectedSection.title,
                subtitle: selectedSection.subtitle,
                config: selectedSection.config
            });
            toast.success('Section updated successfully');
            setSelectedSection(null);
            loadSections();
        } catch (error: any) {
            toast.error('Update failed: ' + error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Homepage Content Manager</h1>
                    <p className="text-gray-400">Edit dynamic sections of the buyer-facing website</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-primary-500/10 text-primary-400 rounded-lg text-sm font-medium border border-primary-500/20">
                    <Globe className="w-4 h-4" />
                    Live Content System
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
                                className="card sticky top-24 border-primary-500/30"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-primary-500" />
                                        Section Editor
                                    </h2>
                                    <button onClick={() => setSelectedSection(null)} className="text-gray-500 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleUpdateContent} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Section Title</label>
                                        <input
                                            type="text"
                                            className="input w-full"
                                            value={selectedSection.title}
                                            onChange={(e) => setSelectedSection({ ...selectedSection, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Subtitle / Caption</label>
                                        <textarea
                                            className="input w-full h-20 resize-none"
                                            value={selectedSection.subtitle || ''}
                                            onChange={(e) => setSelectedSection({ ...selectedSection, subtitle: e.target.value })}
                                        />
                                    </div>

                                    {/* Specialized Editors based on Section Type */}
                                    {selectedSection.type === 'HERO' && (
                                        <div className="space-y-4 pt-2 border-t border-gray-700">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Banner Image URL</label>
                                                <input
                                                    type="text"
                                                    className="input w-full text-xs"
                                                    value={selectedSection.config.banner_image || ''}
                                                    onChange={(e) => handleUpdateConfig('banner_image', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Featured Vendor</label>
                                                <input
                                                    type="text"
                                                    className="input w-full"
                                                    value={selectedSection.config.featured_vendor || ''}
                                                    onChange={(e) => handleUpdateConfig('featured_vendor', e.target.value)}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase">Primary CTA Text</label>
                                                    <input
                                                        type="text"
                                                        className="input w-full h-10"
                                                        value={selectedSection.config.primary_cta?.text || ''}
                                                        onChange={(e) => handleUpdateConfig('primary_cta', { ...selectedSection.config.primary_cta, text: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase">Primary CTA Link</label>
                                                    <input
                                                        type="text"
                                                        className="input w-full h-10"
                                                        value={selectedSection.config.primary_cta?.link || ''}
                                                        onChange={(e) => handleUpdateConfig('primary_cta', { ...selectedSection.config.primary_cta, link: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedSection.type === 'ACADEMIC_SPOTLIGHT' && (
                                        <div className="space-y-4 pt-2 border-t border-gray-700">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Spotlight Image URL</label>
                                                <input
                                                    type="text"
                                                    className="input w-full text-xs"
                                                    value={selectedSection.config.banner_image || ''}
                                                    onChange={(e) => handleUpdateConfig('banner_image', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {selectedSection.type === 'CTA' && (
                                        <div className="space-y-4 pt-2 border-t border-gray-700">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Banner Image URL</label>
                                                <input
                                                    type="text"
                                                    className="input w-full text-xs"
                                                    value={selectedSection.config.banner_image || ''}
                                                    onChange={(e) => handleUpdateConfig('banner_image', e.target.value)}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase">Primary Button</label>
                                                    <input
                                                        type="text"
                                                        className="input w-full h-10"
                                                        value={selectedSection.config.primary_cta?.text || ''}
                                                        onChange={(e) => handleUpdateConfig('primary_cta', { ...selectedSection.config.primary_cta, text: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase">Secondary Button</label>
                                                    <input
                                                        type="text"
                                                        className="input w-full h-10"
                                                        value={selectedSection.config.secondary_cta?.text || ''}
                                                        onChange={(e) => handleUpdateConfig('secondary_cta', { ...selectedSection.config.secondary_cta, text: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Config Editor - Simple JSON for fallback */}
                                    <div className="space-y-1.5 pt-2 border-t border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Raw Configuration (JSON)</label>
                                            <span className="text-[10px] text-gray-600 bg-gray-900 px-1.5 rounded">Advanced Editor</span>
                                        </div>
                                        <textarea
                                            className="input w-full h-32 font-mono text-[10px] leading-relaxed"
                                            value={JSON.stringify(selectedSection.config, null, 2)}
                                            onChange={(e) => {
                                                try {
                                                    const parsed = JSON.parse(e.target.value);
                                                    setSelectedSection({ ...selectedSection, config: parsed });
                                                } catch (err) { }
                                            }}
                                        />
                                    </div>

                                    <div className="pt-4 space-y-3">
                                        <button
                                            type="submit"
                                            className="btn-primary w-full gap-2 py-3"
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            Publish Changes
                                        </button>
                                        <div className="flex items-center gap-2 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                                            <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0" />
                                            <p className="text-[10px] text-yellow-500/80 leading-tight">
                                                Changes will be visible to all users immediately after saving.
                                            </p>
                                        </div>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <div className="card h-[400px] flex flex-col items-center justify-center text-center opacity-50 border-dashed">
                                <Edit3 className="w-12 h-12 text-gray-700 mb-4" />
                                <p className="text-gray-500 max-w-[200px]">Select a section from the list to begin editing</p>
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
