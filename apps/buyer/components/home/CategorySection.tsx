'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Globe, Smartphone, Code, Palette, Cloud, Brain,
    GraduationCap, FileCode, FileText, ArrowRight,
    Sparkles, Zap, SmartphoneNfc, Terminal
} from 'lucide-react';
import { fetchCategories } from '@/lib/data-service';

const iconMap: Record<string, any> = {
    'Web Development': Globe,
    'Mobile Apps': Smartphone,
    'Custom Software': Code,
    'UI/UX Design': Palette,
    'Cloud & DevOps': Cloud,
    'AI & Data': Brain,
    'Mini Projects': FileCode,
    'Major Projects': GraduationCap,
    'Research Papers': FileText,
};

const gradientMap: Record<string, string> = {
    'Web Development': 'from-blue-500/20 to-blue-600/5',
    'Mobile Apps': 'from-emerald-500/20 to-emerald-600/5',
    'Custom Software': 'from-violet-500/20 to-violet-600/5',
    'UI/UX Design': 'from-pink-500/20 to-pink-600/5',
    'Cloud & DevOps': 'from-cyan-500/20 to-cyan-600/5',
    'AI & Data': 'from-orange-500/20 to-orange-600/5',
    'Mini Projects': 'from-teal-500/20 to-teal-600/5',
    'Major Projects': 'from-indigo-500/20 to-indigo-600/5',
    'Research Papers': 'from-rose-500/20 to-rose-600/5',
};

const borderMap: Record<string, string> = {
    'Web Development': 'group-hover:border-blue-500/50',
    'Mobile Apps': 'group-hover:border-emerald-500/50',
    'Custom Software': 'group-hover:border-violet-500/50',
    'UI/UX Design': 'group-hover:border-pink-500/50',
    'Cloud & DevOps': 'group-hover:border-cyan-500/50',
    'AI & Data': 'group-hover:border-orange-500/50',
    'Mini Projects': 'group-hover:border-teal-500/50',
    'Major Projects': 'group-hover:border-indigo-500/50',
    'Research Papers': 'group-hover:border-rose-500/50',
};

const iconColorMap: Record<string, string> = {
    'Web Development': 'text-blue-500',
    'Mobile Apps': 'text-emerald-500',
    'Custom Software': 'text-violet-500',
    'UI/UX Design': 'text-pink-500',
    'Cloud & DevOps': 'text-cyan-500',
    'AI & Data': 'text-orange-500',
    'Mini Projects': 'text-teal-500',
    'Major Projects': 'text-indigo-500',
    'Research Papers': 'text-rose-500',
};

export function CategorySection({ content }: { content?: any }) {
    const title = content?.title || "Explore Global Expertise";
    const subtitle = content?.subtitle || "Discover specialized solutions across world-class digital and academic domains.";
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        async function load() {
            try {
                const data = await fetchCategories();
                setCategories(data || []);
            } catch (error) {
                console.error('Error loading categories:', error);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    if (!mounted) return null;
    if (isLoading) return null;

    const academicCategories = categories.filter(c =>
        c.name.includes('Project') || c.name.includes('Paper') || c.name.includes('Research')
    );
    const itCategories = categories.filter(c => !academicCategories.includes(c));

    const renderCategoryCard = (category: any, index: number) => {
        const Icon = iconMap[category.name] || Terminal;
        const gradient = gradientMap[category.name] || 'from-gray-500/10 to-gray-600/5';
        const borderColor = borderMap[category.name] || 'group-hover:border-primary-500/50';
        const iconColor = iconColorMap[category.name] || 'text-primary-500';

        return (
            <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
            >
                <Link
                    href={`/categories/${category.slug}`}
                    className={`group relative flex flex-col items-center text-center p-8 rounded-[32px] bg-white border border-gray-100 transition-all duration-500 hover:-translate-y-2 ${borderColor} hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] overflow-hidden`}
                >
                    {/* Animated Background Blob */}
                    <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradient} blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                    {/* Icon Container */}
                    <div className={`relative mb-6 p-5 rounded-2xl bg-gray-50 transition-all duration-500 group-hover:scale-110 group-hover:bg-white`}>
                        <Icon className={`w-8 h-8 ${iconColor}`} />
                        <div className={`absolute inset-0 bg-current opacity-0 group-hover:opacity-5 blur-xl transition-opacity ${iconColor}`} />
                    </div>

                    <h4 className="relative text-lg font-black text-gray-900 mb-2 tracking-tight group-hover:text-primary-600 transition-colors">
                        {category.name}
                    </h4>
                    <p className="relative text-[13px] text-gray-500 font-medium leading-relaxed line-clamp-2 px-2">
                        {category.description || 'Professional end-to-end solutions for enterprise growth.'}
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300">
                        <span>Explore</span>
                        <Zap className="w-3 h-3 fill-primary-600" />
                    </div>
                </Link>
            </motion.div>
        );
    };

    return (
        <section className="relative pt-24 lg:pt-32 pb-10 lg:pb-16 bg-[#fff]">
            {/* Soft Artistic Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-blue-50/50 to-transparent blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-purple-50/50 to-transparent blur-[120px]" />
            </div>

            <div className="container-custom relative z-10">
                {/* Header */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-primary-600" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-primary-600">Curated Categories</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-tight"
                    >
                        Browse by <span className="text-primary-600">Category.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed"
                    >
                        {subtitle}
                    </motion.p>
                </div>

                {/* Grid for IT Categories */}
                {itCategories.length > 0 && (
                    <div className="mb-24">
                        <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-6">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                <Code className="w-6 h-6 text-primary-600" />
                                Tech & Digital
                            </h3>
                            <Link href="/services" className="text-sm font-black text-primary-600 uppercase tracking-widest hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                                All Services
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {itCategories.map((cat, i) => renderCategoryCard(cat, i))}
                        </div>
                    </div>
                )}

                {/* Grid for Academic Categories */}
                {academicCategories.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-6">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                <GraduationCap className="w-6 h-6 text-primary-600" />
                                Academic Excellence
                            </h3>
                            <Link href="/academic" className="text-sm font-black text-primary-600 uppercase tracking-widest hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                                Academic Hub
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {academicCategories.map((cat, i) => renderCategoryCard(cat, i + itCategories.length))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
