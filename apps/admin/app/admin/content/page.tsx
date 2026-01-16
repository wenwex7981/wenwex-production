'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Globe, Layout, Settings, Palette, Image, Type, Link2, Mail, Phone,
    MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube,
    Save, Loader2, Check, Eye, Edit3, ChevronRight, Sparkles,
    Star, Shield, Users, Zap, Building2, TrendingUp, ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getSupabaseClient } from '@/lib/supabase';

const supabase = getSupabaseClient();

// Content structure for all editable sections
const contentSections = [
    {
        id: 'brand',
        name: 'Brand & Identity',
        icon: Sparkles,
        description: 'Logo, site name, tagline, and brand colors',
        color: 'from-purple-500 to-pink-500'
    },
    {
        id: 'hero',
        name: 'Hero Section',
        icon: Layout,
        description: 'Main banner, headlines, and call-to-action buttons',
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 'stats',
        name: 'Platform Statistics',
        icon: TrendingUp,
        description: 'Verified agencies count, services, clients, ratings',
        color: 'from-green-500 to-emerald-500'
    },
    {
        id: 'contact',
        name: 'Contact Information',
        icon: Mail,
        description: 'Email, phone, address, and support details',
        color: 'from-orange-500 to-amber-500'
    },
    {
        id: 'social',
        name: 'Social Media Links',
        icon: Globe,
        description: 'Facebook, Twitter, Instagram, LinkedIn, YouTube',
        color: 'from-pink-500 to-rose-500'
    },
    {
        id: 'footer',
        name: 'Footer Content',
        icon: Type,
        description: 'Copyright text, legal links, and footer sections',
        color: 'from-gray-500 to-zinc-500'
    },
];

export default function AdminContentPage() {
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [siteSettings, setSiteSettings] = useState<Record<string, any>>({});

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*');

            if (error) throw error;

            // Convert array to object for easier access
            const settingsObj: Record<string, any> = {};
            data?.forEach(item => {
                settingsObj[item.key] = item.value;
            });
            setSiteSettings(settingsObj);
        } catch (error: any) {
            console.error('Failed to load settings:', error);
            // Initialize with defaults if table doesn't exist
            setSiteSettings(getDefaultSettings());
        } finally {
            setIsLoading(false);
        }
    };

    const getDefaultSettings = () => ({
        // Brand
        site_name: 'WENVEX',
        site_tagline: 'Global Tech Commerce Hub',
        site_description: 'Empowering the world\'s most innovative companies through elite technology partnerships.',
        logo_url: '/logo.svg',
        favicon_url: '/favicon.ico',
        primary_color: '#6366f1',

        // Hero
        hero_title: 'Global Tech Commerce Hub.',
        hero_subtitle: 'Empowering the world\'s most innovative companies through elite technology partnerships, global scalability, and production-grade excellence.',
        hero_cta_primary_text: 'Get Started',
        hero_cta_primary_link: '/services',
        hero_cta_secondary_text: 'View Global Agencies',
        hero_cta_secondary_link: '/vendors',
        hero_banner_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000',

        // Stats
        stat_agencies: '500+',
        stat_agencies_label: 'Verified Agencies',
        stat_services: '10K+',
        stat_services_label: 'Services Listed',
        stat_clients: '50K+',
        stat_clients_label: 'Happy Clients',
        stat_rating: '4.9',
        stat_rating_label: 'Average Rating',

        // Contact
        contact_email: 'support@wenvex.online',
        contact_phone: '+91 9876543210',
        contact_address: 'Hyderabad, Telangana, India',
        support_email: 'help@wenvex.online',

        // Social
        social_facebook: 'https://facebook.com/wenvex',
        social_twitter: 'https://twitter.com/wenvex',
        social_instagram: 'https://instagram.com/wenvex',
        social_linkedin: 'https://linkedin.com/company/wenvex',
        social_youtube: 'https://youtube.com/wenvex',

        // Footer
        footer_copyright: '© 2024 WENVEX. All rights reserved.',
        footer_tagline: 'Connecting global talent with world-class opportunities.',
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Upsert all settings
            const upsertData = Object.entries(siteSettings).map(([key, value]) => ({
                key,
                value: typeof value === 'object' ? JSON.stringify(value) : value,
                updated_at: new Date().toISOString()
            }));

            const { error } = await supabase
                .from('site_settings')
                .upsert(upsertData, { onConflict: 'key' });

            if (error) throw error;
            toast.success('Settings saved successfully!');
        } catch (error: any) {
            toast.error('Failed to save: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const updateSetting = (key: string, value: any) => {
        setSiteSettings(prev => ({ ...prev, [key]: value }));
    };

    const renderEditor = () => {
        switch (activeSection) {
            case 'brand':
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Site Name</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={siteSettings.site_name || ''}
                                onChange={(e) => updateSetting('site_name', e.target.value)}
                                placeholder="WENVEX"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tagline</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={siteSettings.site_tagline || ''}
                                onChange={(e) => updateSetting('site_tagline', e.target.value)}
                                placeholder="Global Tech Commerce Hub"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Site Description (SEO)</label>
                            <textarea
                                className="input w-full h-24 resize-none"
                                value={siteSettings.site_description || ''}
                                onChange={(e) => updateSetting('site_description', e.target.value)}
                                placeholder="Brief description for search engines..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Logo URL</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={siteSettings.logo_url || ''}
                                    onChange={(e) => updateSetting('logo_url', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Primary Color</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        className="w-12 h-12 rounded-xl border border-gray-700 cursor-pointer"
                                        value={siteSettings.primary_color || '#6366f1'}
                                        onChange={(e) => updateSetting('primary_color', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="input flex-1"
                                        value={siteSettings.primary_color || '#6366f1'}
                                        onChange={(e) => updateSetting('primary_color', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'hero':
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hero Title</label>
                            <input
                                type="text"
                                className="input w-full text-lg"
                                value={siteSettings.hero_title || ''}
                                onChange={(e) => updateSetting('hero_title', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hero Subtitle</label>
                            <textarea
                                className="input w-full h-24 resize-none"
                                value={siteSettings.hero_subtitle || ''}
                                onChange={(e) => updateSetting('hero_subtitle', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Banner Image URL</label>
                            <input
                                type="text"
                                className="input w-full text-xs"
                                value={siteSettings.hero_banner_image || ''}
                                onChange={(e) => updateSetting('hero_banner_image', e.target.value)}
                            />
                            {siteSettings.hero_banner_image && (
                                <div className="mt-2 rounded-xl overflow-hidden h-32">
                                    <img src={siteSettings.hero_banner_image} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Primary CTA Text</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={siteSettings.hero_cta_primary_text || ''}
                                    onChange={(e) => updateSetting('hero_cta_primary_text', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Primary CTA Link</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={siteSettings.hero_cta_primary_link || ''}
                                    onChange={(e) => updateSetting('hero_cta_primary_link', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Secondary CTA Text</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={siteSettings.hero_cta_secondary_text || ''}
                                    onChange={(e) => updateSetting('hero_cta_secondary_text', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Secondary CTA Link</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={siteSettings.hero_cta_secondary_link || ''}
                                    onChange={(e) => updateSetting('hero_cta_secondary_link', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'stats':
                return (
                    <div className="space-y-6">
                        <p className="text-sm text-gray-500 mb-4">These statistics are displayed on the homepage to build trust with visitors.</p>
                        {[
                            { key: 'agencies', icon: Building2, label: 'Verified Agencies' },
                            { key: 'services', icon: Zap, label: 'Services Listed' },
                            { key: 'clients', icon: Users, label: 'Happy Clients' },
                            { key: 'rating', icon: Star, label: 'Average Rating' },
                        ].map(stat => (
                            <div key={stat.key} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-2xl border border-gray-700">
                                <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Value</label>
                                        <input
                                            type="text"
                                            className="input w-full h-10 text-lg font-bold"
                                            value={siteSettings[`stat_${stat.key}`] || ''}
                                            onChange={(e) => updateSetting(`stat_${stat.key}`, e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Label</label>
                                        <input
                                            type="text"
                                            className="input w-full h-10"
                                            value={siteSettings[`stat_${stat.key}_label`] || stat.label}
                                            onChange={(e) => updateSetting(`stat_${stat.key}_label`, e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'contact':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Primary Email
                                </label>
                                <input
                                    type="email"
                                    className="input w-full"
                                    value={siteSettings.contact_email || ''}
                                    onChange={(e) => updateSetting('contact_email', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Support Email
                                </label>
                                <input
                                    type="email"
                                    className="input w-full"
                                    value={siteSettings.support_email || ''}
                                    onChange={(e) => updateSetting('support_email', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Phone className="w-4 h-4" /> Phone Number
                            </label>
                            <input
                                type="text"
                                className="input w-full"
                                value={siteSettings.contact_phone || ''}
                                onChange={(e) => updateSetting('contact_phone', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Business Address
                            </label>
                            <textarea
                                className="input w-full h-20 resize-none"
                                value={siteSettings.contact_address || ''}
                                onChange={(e) => updateSetting('contact_address', e.target.value)}
                            />
                        </div>
                    </div>
                );

            case 'social':
                return (
                    <div className="space-y-6">
                        <p className="text-sm text-gray-500 mb-4">Leave any field blank to hide that social link from the website.</p>
                        {[
                            { key: 'facebook', icon: Facebook, placeholder: 'https://facebook.com/yourpage', color: 'text-blue-500' },
                            { key: 'twitter', icon: Twitter, placeholder: 'https://twitter.com/yourhandle', color: 'text-sky-400' },
                            { key: 'instagram', icon: Instagram, placeholder: 'https://instagram.com/yourprofile', color: 'text-pink-500' },
                            { key: 'linkedin', icon: Linkedin, placeholder: 'https://linkedin.com/company/yourcompany', color: 'text-blue-400' },
                            { key: 'youtube', icon: Youtube, placeholder: 'https://youtube.com/yourchannel', color: 'text-red-500' },
                        ].map(social => (
                            <div key={social.key} className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center ${social.color}`}>
                                    <social.icon className="w-6 h-6" />
                                </div>
                                <input
                                    type="url"
                                    className="input flex-1"
                                    placeholder={social.placeholder}
                                    value={siteSettings[`social_${social.key}`] || ''}
                                    onChange={(e) => updateSetting(`social_${social.key}`, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                );

            case 'footer':
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Copyright Text</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={siteSettings.footer_copyright || ''}
                                onChange={(e) => updateSetting('footer_copyright', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Footer Tagline</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={siteSettings.footer_tagline || ''}
                                onChange={(e) => updateSetting('footer_tagline', e.target.value)}
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Content Management</h1>
                    <p className="text-gray-400">Edit all buyer-facing content without touching code</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="http://localhost:3000"
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:border-gray-600 transition-all"
                    >
                        <Eye className="w-4 h-4" />
                        Preview Site
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn-primary gap-2"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isSaving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="card py-20 text-center">
                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading content settings...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Section Cards */}
                    <div className="lg:col-span-1 space-y-4">
                        {contentSections.map((section, index) => (
                            <motion.button
                                key={section.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full text-left card p-5 group transition-all border ${activeSection === section.id
                                    ? 'border-primary-500 bg-primary-500/5'
                                    : 'border-gray-700/50 hover:border-gray-600'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center text-white shadow-lg`}>
                                        <section.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white flex items-center gap-2">
                                            {section.name}
                                            {activeSection === section.id && <Check className="w-4 h-4 text-primary-400" />}
                                        </h3>
                                        <p className="text-xs text-gray-500 truncate">{section.description}</p>
                                    </div>
                                    <ChevronRight className={`w-5 h-5 text-gray-600 transition-transform ${activeSection === section.id ? 'rotate-90 text-primary-400' : ''}`} />
                                </div>
                            </motion.button>
                        ))}

                        {/* Quick Links */}
                        <div className="pt-6 border-t border-gray-800">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">More Content Tools</h4>
                            <div className="space-y-2">
                                <Link href="/admin/categories" className="flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
                                    <Layout className="w-5 h-5" />
                                    <span className="text-sm font-medium">Manage Categories</span>
                                    <ArrowRight className="w-4 h-4 ml-auto" />
                                </Link>
                                <Link href="/admin/homepage" className="flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
                                    <Globe className="w-5 h-5" />
                                    <span className="text-sm font-medium">Homepage Sections</span>
                                    <ArrowRight className="w-4 h-4 ml-auto" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Editor Panel */}
                    <div className="lg:col-span-2">
                        {activeSection ? (
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card p-8"
                            >
                                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-700">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${contentSections.find(s => s.id === activeSection)?.color} flex items-center justify-center text-white`}>
                                        {(() => {
                                            const Icon = contentSections.find(s => s.id === activeSection)?.icon || Settings;
                                            return <Icon className="w-5 h-5" />;
                                        })()}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            {contentSections.find(s => s.id === activeSection)?.name}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            {contentSections.find(s => s.id === activeSection)?.description}
                                        </p>
                                    </div>
                                </div>

                                {renderEditor()}

                                <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="btn-primary gap-2"
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Save Changes
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="card h-[600px] flex flex-col items-center justify-center text-center border-dashed">
                                <Edit3 className="w-16 h-16 text-gray-700 mb-6" />
                                <h3 className="text-xl font-bold text-white mb-2">Select a Section to Edit</h3>
                                <p className="text-gray-500 max-w-sm">
                                    Choose any content section from the left panel to start editing. Changes will be reflected on the live website immediately after saving.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
