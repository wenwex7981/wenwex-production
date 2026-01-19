'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText, Save, Loader2, Check, Eye, Edit3, ChevronRight,
    Info, Phone, Plus, Trash2, ArrowUp, ArrowDown, Globe2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getSupabaseClient } from '@/lib/supabase';

const supabase = getSupabaseClient();

// Page types with their configurations
const pageTypes = [
    {
        slug: 'about',
        name: 'About Page',
        icon: Info,
        description: 'Company information, mission, values, and team',
        color: 'from-blue-500 to-cyan-500'
    },
    {
        slug: 'contact',
        name: 'Contact Page',
        icon: Phone,
        description: 'Contact form, location, FAQs, and map settings',
        color: 'from-green-500 to-emerald-500'
    },
];

export default function AdminPagesPage() {
    const [activePage, setActivePage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [pageContents, setPageContents] = useState<Record<string, any>>({});

    useEffect(() => {
        loadPageContents();
    }, []);

    const loadPageContents = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('page_contents')
                .select('*');

            if (error) {
                // Table doesn't exist, use defaults
                setPageContents(getDefaultPageContents());
            } else {
                const contents: Record<string, any> = {};
                data?.forEach(page => {
                    contents[page.page_slug] = {
                        ...page,
                        content: typeof page.content === 'string' ? JSON.parse(page.content) : page.content
                    };
                });
                // Merge with defaults for any missing pages
                const defaults: Record<string, any> = getDefaultPageContents();
                Object.keys(defaults).forEach(slug => {
                    if (!contents[slug]) {
                        contents[slug] = defaults[slug];
                    }
                });
                setPageContents(contents);
            }
        } catch (error: any) {
            console.error('Failed to load page contents:', error);
            setPageContents(getDefaultPageContents());
        } finally {
            setIsLoading(false);
        }
    };

    const getDefaultPageContents = () => ({
        about: {
            page_slug: 'about',
            title: 'About WENWEX',
            subtitle: 'Empowering the Future of Global Tech Commerce',
            meta_title: 'About Us | WENWEX - Global Tech Commerce Marketplace',
            meta_desc: 'Learn about WENWEX - the premier global marketplace connecting businesses with verified technology service providers worldwide.',
            is_published: true,
            content: {
                hero: {
                    badge: 'ABOUT WENWEX',
                    title: 'Empowering the Future of',
                    titleHighlight: 'Global Tech Commerce',
                    description: 'WENWEX is the premier global marketplace where verified technology agencies and service providers offer enterprise solutions as structured products.'
                },
                stats: [
                    { value: '10K+', label: 'Active Users', icon: 'Users' },
                    { value: '500+', label: 'Verified Agencies', icon: 'Building2' },
                    { value: '25+', label: 'Countries', icon: 'Globe2' },
                    { value: '98%', label: 'Client Satisfaction', icon: 'Star' }
                ],
                mission: {
                    badge: 'Our Mission',
                    title: 'Democratizing Access to World-Class Technology Solutions',
                    description1: 'We believe every business deserves access to enterprise-grade technology solutions.',
                    description2: 'From Fortune 500 enterprises to ambitious startups, we curate the best technology professionals.',
                    services: ['Enterprise Web Development', 'Mobile App Solutions', 'AI & Machine Learning', 'Cloud Infrastructure', 'Digital Transformation', 'Custom Software']
                },
                quote: {
                    text: '"We don\'t just connect businesses with vendors – we curate global tech excellence."',
                    author: 'WENWEX Leadership',
                    role: 'Pioneering the Future of Tech Commerce'
                },
                values: [
                    { icon: 'Shield', title: 'Trust & Security', description: 'Every vendor undergoes rigorous verification.', gradient: 'from-blue-500 to-cyan-500' },
                    { icon: 'Sparkles', title: 'Excellence First', description: 'Only verified professionals with proven track records.', gradient: 'from-purple-500 to-pink-500' },
                    { icon: 'Zap', title: 'Innovation', description: 'Cutting-edge technology powers our marketplace.', gradient: 'from-amber-500 to-orange-500' },
                    { icon: 'Globe2', title: 'Global Reach', description: 'Connect with providers across 25+ countries.', gradient: 'from-green-500 to-emerald-500' }
                ],
                milestones: [
                    { year: '2025', title: 'Founded', description: 'WENWEX was established with a vision to revolutionize global tech commerce' },
                    { year: '2025', title: 'Platform Launch', description: 'Full marketplace launch connecting businesses with verified tech agencies worldwide' },
                    { year: '2026', title: 'Global Expansion', description: 'Expanding to 25+ countries with enterprise-grade agency network' },
                    { year: 'Future', title: 'Your Success', description: 'Continuously evolving to power your digital transformation' }
                ],
                team: {
                    badge: 'Our Team',
                    title: 'World-Class Professionals Building',
                    titleHighlight: 'Global Solutions',
                    description: 'Behind WENWEX is a diverse team of technology veterans and enterprise architects.',
                    highlights: ['Enterprise Technology Experts', 'Global Support Team 24/7', 'Quality Assurance Specialists', 'Industry Veterans & Advisors'],
                    company: 'Project Genie Tech Solutions',
                    companyRole: 'Enterprise Technology'
                },
                cta: {
                    title: 'Ready to Transform Your Business?',
                    description: 'Join thousands of forward-thinking companies leveraging WENWEX for their technology needs.',
                    primaryBtn: 'Explore Services',
                    primaryLink: '/services',
                    secondaryBtn: 'Contact Us',
                    secondaryLink: '/contact'
                }
            }
        },
        contact: {
            page_slug: 'contact',
            title: 'Contact WENWEX',
            subtitle: 'Let\'s Start a Conversation',
            meta_title: 'Contact Us | WENWEX - Global Tech Commerce Marketplace',
            meta_desc: 'Get in touch with WENWEX. We\'re here to help with your technology needs.',
            is_published: true,
            content: {
                hero: {
                    badge: 'Contact Us',
                    title: 'Let\'s Start a',
                    titleHighlight: 'Conversation',
                    description: 'Have questions, need a custom solution, or want to partner with us?'
                },
                contactMethods: [
                    { icon: 'Mail', title: 'Email Us', description: 'Enterprise response within 24 hours', value: 'wenvex19@gmail.com', href: 'mailto:wenvex19@gmail.com', gradient: 'from-blue-500 to-cyan-500' },
                    { icon: 'Phone', title: 'Call Us', description: 'Mon-Sat from 9am to 6pm IST', value: '+91 7981994870', href: 'tel:+917981994870', gradient: 'from-green-500 to-emerald-500' },
                    { icon: 'MapPin', title: 'Headquarters', description: 'T-Hub, Hyderabad', value: 'Hyderabad, India', href: '#location', gradient: 'from-purple-500 to-pink-500' },
                    { icon: 'Clock', title: 'Business Hours', description: 'Global support available', value: 'Mon - Sat, 9AM - 6PM IST', href: '#', gradient: 'from-amber-500 to-orange-500' }
                ],
                company: {
                    name: 'WENWEX',
                    tagline: 'Global Tech Commerce Platform',
                    parent: 'Project Genie Tech Solutions',
                    website: 'www.wenwex.online',
                    email: 'wenvex19@gmail.com',
                    phone: '+91 7981994870'
                },
                location: {
                    title: 'Our Headquarters',
                    address: 'T-Hub, IIIT Hyderabad Campus, Gachibowli',
                    city: 'Hyderabad',
                    state: 'Telangana',
                    country: 'India',
                    pincode: '500032',
                    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.2960844890015!2d78.35907847516553!3d17.445424583457087!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93dc8c5d69df%3A0x19688beb557fa0ee!2sT-Hub!5e0!3m2!1sen!2sin!4v1705666800000!5m2!1sen!2sin'
                },
                faqs: [
                    { question: 'How do I become a verified vendor?', answer: 'Visit our vendor portal and complete the verification process.' },
                    { question: 'What payment methods do you support?', answer: 'We support credit/debit cards, bank transfers, UPI, and wire transfers.' },
                    { question: 'Do you offer enterprise contracts?', answer: 'Yes, we provide custom enterprise agreements with dedicated account management.' },
                    { question: 'Is my data secure?', answer: 'Absolutely. We implement enterprise-grade security with encryption.' }
                ]
            }
        }
    });

    const handleSave = async (slug: string) => {
        setIsSaving(true);
        try {
            const pageData = pageContents[slug];
            const { error } = await supabase
                .from('page_contents')
                .upsert({
                    page_slug: slug,
                    title: pageData.title,
                    subtitle: pageData.subtitle,
                    content: pageData.content,
                    meta_title: pageData.meta_title,
                    meta_desc: pageData.meta_desc,
                    is_published: pageData.is_published ?? true,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'page_slug' });

            if (error) throw error;
            toast.success(`${slug.charAt(0).toUpperCase() + slug.slice(1)} page saved successfully!`);
        } catch (error: any) {
            toast.error('Failed to save: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const updatePageContent = (slug: string, path: string, value: any) => {
        setPageContents(prev => {
            const newContents = { ...prev };
            const keys = path.split('.');
            let obj = newContents[slug];

            for (let i = 0; i < keys.length - 1; i++) {
                if (!obj[keys[i]]) obj[keys[i]] = {};
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]] = value;

            return newContents;
        });
    };

    const renderAboutEditor = () => {
        const page = pageContents['about'];
        if (!page) return null;

        return (
            <div className="space-y-8">
                {/* Meta & SEO */}
                <section className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Globe2 className="w-5 h-5 text-blue-400" />
                        Page Meta & SEO
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Page Title</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.title || ''}
                                onChange={(e) => updatePageContent('about', 'title', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Meta Title (SEO)</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.meta_title || ''}
                                onChange={(e) => updatePageContent('about', 'meta_title', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Meta Description (SEO)</label>
                        <textarea
                            className="input w-full h-20 resize-none"
                            value={page.meta_desc || ''}
                            onChange={(e) => updatePageContent('about', 'meta_desc', e.target.value)}
                        />
                    </div>
                </section>

                {/* Hero Section */}
                <section className="space-y-4 p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
                    <h3 className="text-lg font-bold text-white">Hero Section</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Badge Text</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.content?.hero?.badge || ''}
                                onChange={(e) => updatePageContent('about', 'content.hero.badge', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Title Highlight</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.content?.hero?.titleHighlight || ''}
                                onChange={(e) => updatePageContent('about', 'content.hero.titleHighlight', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Title</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={page.content?.hero?.title || ''}
                            onChange={(e) => updatePageContent('about', 'content.hero.title', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                        <textarea
                            className="input w-full h-24 resize-none"
                            value={page.content?.hero?.description || ''}
                            onChange={(e) => updatePageContent('about', 'content.hero.description', e.target.value)}
                        />
                    </div>
                </section>

                {/* Stats */}
                <section className="space-y-4 p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
                    <h3 className="text-lg font-bold text-white">Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {page.content?.stats?.map((stat: any, index: number) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl">
                                <div className="flex-1 space-y-1">
                                    <input
                                        type="text"
                                        className="input w-full h-8 text-lg font-bold"
                                        value={stat.value}
                                        onChange={(e) => {
                                            const newStats = [...page.content.stats];
                                            newStats[index].value = e.target.value;
                                            updatePageContent('about', 'content.stats', newStats);
                                        }}
                                        placeholder="Value"
                                    />
                                    <input
                                        type="text"
                                        className="input w-full h-8 text-sm"
                                        value={stat.label}
                                        onChange={(e) => {
                                            const newStats = [...page.content.stats];
                                            newStats[index].label = e.target.value;
                                            updatePageContent('about', 'content.stats', newStats);
                                        }}
                                        placeholder="Label"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Mission */}
                <section className="space-y-4 p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
                    <h3 className="text-lg font-bold text-white">Mission Section</h3>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Title</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={page.content?.mission?.title || ''}
                            onChange={(e) => updatePageContent('about', 'content.mission.title', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Description 1</label>
                            <textarea
                                className="input w-full h-24 resize-none"
                                value={page.content?.mission?.description1 || ''}
                                onChange={(e) => updatePageContent('about', 'content.mission.description1', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Description 2</label>
                            <textarea
                                className="input w-full h-24 resize-none"
                                value={page.content?.mission?.description2 || ''}
                                onChange={(e) => updatePageContent('about', 'content.mission.description2', e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                {/* Quote */}
                <section className="space-y-4 p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
                    <h3 className="text-lg font-bold text-white">Quote Section</h3>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Quote Text</label>
                        <textarea
                            className="input w-full h-20 resize-none"
                            value={page.content?.quote?.text || ''}
                            onChange={(e) => updatePageContent('about', 'content.quote.text', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Author</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.content?.quote?.author || ''}
                                onChange={(e) => updatePageContent('about', 'content.quote.author', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Role/Title</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.content?.quote?.role || ''}
                                onChange={(e) => updatePageContent('about', 'content.quote.role', e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                {/* Team */}
                <section className="space-y-4 p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
                    <h3 className="text-lg font-bold text-white">Team Section</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Company Name</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.content?.team?.company || ''}
                                onChange={(e) => updatePageContent('about', 'content.team.company', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Company Role</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.content?.team?.companyRole || ''}
                                onChange={(e) => updatePageContent('about', 'content.team.companyRole', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Team Description</label>
                        <textarea
                            className="input w-full h-20 resize-none"
                            value={page.content?.team?.description || ''}
                            onChange={(e) => updatePageContent('about', 'content.team.description', e.target.value)}
                        />
                    </div>
                </section>

                {/* CTA */}
                <section className="space-y-4 p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
                    <h3 className="text-lg font-bold text-white">CTA Section</h3>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">CTA Title</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={page.content?.cta?.title || ''}
                            onChange={(e) => updatePageContent('about', 'content.cta.title', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">CTA Description</label>
                        <textarea
                            className="input w-full h-16 resize-none"
                            value={page.content?.cta?.description || ''}
                            onChange={(e) => updatePageContent('about', 'content.cta.description', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Primary Button</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.content?.cta?.primaryBtn || ''}
                                onChange={(e) => updatePageContent('about', 'content.cta.primaryBtn', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Secondary Button</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.content?.cta?.secondaryBtn || ''}
                                onChange={(e) => updatePageContent('about', 'content.cta.secondaryBtn', e.target.value)}
                            />
                        </div>
                    </div>
                </section>
            </div>
        );
    };

    const renderContactEditor = () => {
        const page = pageContents['contact'];
        if (!page) return null;

        return (
            <div className="space-y-8">
                {/* Meta & SEO */}
                <section className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Globe2 className="w-5 h-5 text-green-400" />
                        Page Meta & SEO
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Page Title</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.title || ''}
                                onChange={(e) => updatePageContent('contact', 'title', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Meta Title (SEO)</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.meta_title || ''}
                                onChange={(e) => updatePageContent('contact', 'meta_title', e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                {/* Hero Section */}
                <section className="space-y-4 p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
                    <h3 className="text-lg font-bold text-white">Hero Section</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Title</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.content?.hero?.title || ''}
                                onChange={(e) => updatePageContent('contact', 'content.hero.title', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Title Highlight</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.content?.hero?.titleHighlight || ''}
                                onChange={(e) => updatePageContent('contact', 'content.hero.titleHighlight', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                        <textarea
                            className="input w-full h-20 resize-none"
                            value={page.content?.hero?.description || ''}
                            onChange={(e) => updatePageContent('contact', 'content.hero.description', e.target.value)}
                        />
                    </div>
                </section>

                {/* Company Info */}
                <section className="space-y-4 p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
                    <h3 className="text-lg font-bold text-white">Company Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Company Name</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.content?.company?.name || ''}
                                onChange={(e) => updatePageContent('contact', 'content.company.name', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Parent Company</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.content?.company?.parent || ''}
                                onChange={(e) => updatePageContent('contact', 'content.company.parent', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
                            <input
                                type="email"
                                className="input w-full"
                                value={page.content?.company?.email || ''}
                                onChange={(e) => updatePageContent('contact', 'content.company.email', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Phone</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.content?.company?.phone || ''}
                                onChange={(e) => updatePageContent('contact', 'content.company.phone', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Website</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.content?.company?.website || ''}
                                onChange={(e) => updatePageContent('contact', 'content.company.website', e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                {/* Location */}
                <section className="space-y-4 p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
                    <h3 className="text-lg font-bold text-white">Location & Map</h3>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Address</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={page.content?.location?.address || ''}
                            onChange={(e) => updatePageContent('contact', 'content.location.address', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">City</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.content?.location?.city || ''}
                                onChange={(e) => updatePageContent('contact', 'content.location.city', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">State</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.content?.location?.state || ''}
                                onChange={(e) => updatePageContent('contact', 'content.location.state', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Country</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.content?.location?.country || ''}
                                onChange={(e) => updatePageContent('contact', 'content.location.country', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Pincode</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={page.content?.location?.pincode || ''}
                                onChange={(e) => updatePageContent('contact', 'content.location.pincode', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Google Maps Embed URL</label>
                        <input
                            type="text"
                            className="input w-full text-xs"
                            value={page.content?.location?.mapEmbedUrl || ''}
                            onChange={(e) => updatePageContent('contact', 'content.location.mapEmbedUrl', e.target.value)}
                            placeholder="https://www.google.com/maps/embed?pb=..."
                        />
                        <p className="text-xs text-gray-500">Get embed URL from Google Maps → Share → Embed a map</p>
                    </div>
                </section>

                {/* FAQs */}
                <section className="space-y-4 p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">FAQs</h3>
                        <button
                            onClick={() => {
                                const newFaqs = [...(page.content?.faqs || []), { question: '', answer: '' }];
                                updatePageContent('contact', 'content.faqs', newFaqs);
                            }}
                            className="flex items-center gap-2 text-xs font-medium text-primary-400 hover:text-primary-300"
                        >
                            <Plus className="w-4 h-4" /> Add FAQ
                        </button>
                    </div>
                    <div className="space-y-4">
                        {page.content?.faqs?.map((faq: any, index: number) => (
                            <div key={index} className="p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-bold text-gray-500">FAQ #{index + 1}</span>
                                    <button
                                        onClick={() => {
                                            const newFaqs = page.content.faqs.filter((_: any, i: number) => i !== index);
                                            updatePageContent('contact', 'content.faqs', newFaqs);
                                        }}
                                        className="text-red-400 hover:text-red-300 ml-auto"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        className="input w-full"
                                        value={faq.question}
                                        onChange={(e) => {
                                            const newFaqs = [...page.content.faqs];
                                            newFaqs[index].question = e.target.value;
                                            updatePageContent('contact', 'content.faqs', newFaqs);
                                        }}
                                        placeholder="Question"
                                    />
                                    <textarea
                                        className="input w-full h-16 resize-none"
                                        value={faq.answer}
                                        onChange={(e) => {
                                            const newFaqs = [...page.content.faqs];
                                            newFaqs[index].answer = e.target.value;
                                            updatePageContent('contact', 'content.faqs', newFaqs);
                                        }}
                                        placeholder="Answer"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        );
    };

    const renderEditor = () => {
        switch (activePage) {
            case 'about':
                return renderAboutEditor();
            case 'contact':
                return renderContactEditor();
            default:
                return null;
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Page Content Manager</h1>
                    <p className="text-gray-400">Edit About, Contact, and other static pages content</p>
                </div>
                {activePage && (
                    <div className="flex items-center gap-3">
                        <a
                            href={`http://localhost:3000/${activePage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:border-gray-600 transition-all"
                        >
                            <Eye className="w-4 h-4" />
                            Preview
                        </a>
                        <button
                            onClick={() => handleSave(activePage)}
                            disabled={isSaving}
                            className="btn-primary gap-2"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="card py-20 text-center">
                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading page contents...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Page Cards */}
                    <div className="lg:col-span-1 space-y-4">
                        {pageTypes.map((page, index) => (
                            <motion.button
                                key={page.slug}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setActivePage(page.slug)}
                                className={`w-full text-left card p-5 group transition-all border ${activePage === page.slug
                                    ? 'border-primary-500 bg-primary-500/5'
                                    : 'border-gray-700/50 hover:border-gray-600'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${page.color} flex items-center justify-center text-white shadow-lg`}>
                                        <page.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white flex items-center gap-2">
                                            {page.name}
                                            {activePage === page.slug && <Check className="w-4 h-4 text-primary-400" />}
                                        </h3>
                                        <p className="text-xs text-gray-500 truncate">{page.description}</p>
                                    </div>
                                    <ChevronRight className={`w-5 h-5 text-gray-600 transition-transform ${activePage === page.slug ? 'rotate-90 text-primary-400' : ''}`} />
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    {/* Editor Panel */}
                    <div className="lg:col-span-3">
                        {activePage ? (
                            <motion.div
                                key={activePage}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card p-8"
                            >
                                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-700">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pageTypes.find(p => p.slug === activePage)?.color} flex items-center justify-center text-white`}>
                                        {(() => {
                                            const Icon = pageTypes.find(p => p.slug === activePage)?.icon || FileText;
                                            return <Icon className="w-5 h-5" />;
                                        })()}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            {pageTypes.find(p => p.slug === activePage)?.name}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            Edit content for /{activePage} page
                                        </p>
                                    </div>
                                </div>

                                {renderEditor()}

                                <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end">
                                    <button
                                        onClick={() => handleSave(activePage)}
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
                                <h3 className="text-xl font-bold text-white mb-2">Select a Page to Edit</h3>
                                <p className="text-gray-500 max-w-sm">
                                    Choose a page from the left panel to start editing. Changes will be reflected on the live website after saving.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
