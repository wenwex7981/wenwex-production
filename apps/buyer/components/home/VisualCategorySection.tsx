'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, Smartphone, Code, Palette, Cloud, Brain,
    GraduationCap, FileCode, FileText, ArrowRight,
    Sparkles, Zap, Terminal, MoveRight
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

const categoryImages: Record<string, string> = {
    'Web Development': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
    'Mobile Apps': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800',
    'Custom Software': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
    'UI/UX Design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800',
    'Cloud & DevOps': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    'AI & Data': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    'Mini Projects': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
    'Major Projects': 'https://images.unsplash.com/photo-1523240715630-974bb1ad2724?auto=format&fit=crop&q=80&w=800',
    'Research Papers': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800',
};

const colorMap: Record<string, string> = {
    'Web Development': 'from-blue-600 to-cyan-500',
    'Mobile Apps': 'from-emerald-600 to-teal-500',
    'Custom Software': 'from-indigo-600 to-violet-500',
    'UI/UX Design': 'from-pink-600 to-rose-500',
    'Cloud & DevOps': 'from-cyan-600 to-blue-500',
    'AI & Data': 'from-orange-600 to-amber-500',
    'Mini Projects': 'from-teal-600 to-emerald-500',
    'Major Projects': 'from-violet-600 to-purple-500',
    'Research Papers': 'from-rose-600 to-pink-500',
};

export function VisualCategorySection({ content, mode = 'all' }: { content?: any, mode?: 'tech' | 'academic' | 'all' }) {
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

    const allAcademicCategories = categories.filter(c =>
        c.name.includes('Project') || c.name.includes('Paper') || c.name.includes('Research')
    );
    const allItCategories = categories.filter(c => !allAcademicCategories.includes(c));

    const showTech = mode === 'all' || mode === 'tech';
    const showAcademic = mode === 'all' || mode === 'academic';

    const itCategories = showTech ? allItCategories : [];
    const academicCategories = showAcademic ? allAcademicCategories : [];

    const renderCategoryCard = (category: any, index: number) => {
        const Icon = iconMap[category.name] || Terminal;
        const colorGradient = colorMap[category.name] || 'from-primary-600 to-primary-400';
        const imageUrl = categoryImages[category.name] || 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800';

        return (
            <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative h-[400px] lg:h-[500px] overflow-hidden rounded-[2.5rem] bg-gray-900 shadow-2xl transition-all duration-500 hover:shadow-primary-500/10"
            >
                <Link href={`/categories/${category.slug}`} className="block w-full h-full">
                    {/* Background Image with Zoom and Blur Change */}
                    <div className="absolute inset-0 transition-transform duration-1000 ease-out group-hover:scale-110">
                        <Image
                            src={imageUrl}
                            alt={category.name}
                            fill
                            className="object-cover opacity-50 grayscale-[0.8] group-hover:grayscale-0 group-hover:opacity-70 transition-all duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90" />
                        <div className={`absolute inset-0 bg-gradient-to-br ${colorGradient} opacity-10 group-hover:opacity-30 transition-opacity duration-700`} />
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 p-10 flex flex-col justify-end z-20">
                        {/* Status Badge */}
                        <div className="absolute top-10 left-10">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10"
                            >
                                <div className={`h-2 w-2 rounded-full bg-primary-400 animate-pulse`} />
                                <span className="text-[10px] font-black text-white/90 uppercase tracking-[0.2em]">
                                    {academicCategories.find(c => c.id === category.id) ? 'Academic' : 'Tech Hub'}
                                </span>
                            </motion.div>
                        </div>

                        {/* Main Info */}
                        <div className="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-700 ease-[0.16, 1, 0.3, 1]">
                            <h4 className="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tighter leading-none group-hover:text-primary-300 transition-colors">
                                {category.name}
                            </h4>
                            <p className="text-sm text-gray-400 font-medium leading-relaxed mb-8 line-clamp-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                                {category.description || 'Enterprise-grade solutions designed for global scalability and production excellence.'}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <span className="text-xs font-black text-primary-400 uppercase tracking-[0.3em]">
                                    Browse Solutions
                                </span>
                                <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 group-hover:bg-primary-600 group-hover:border-primary-500 transition-all duration-500 group-hover:rotate-[-45deg]">
                                    <MoveRight className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Corner Glow Overlay on Hover */}
                    <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${colorGradient} blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-1000`} />
                </Link>
            </motion.div>
        );
    };

    return (
        <section className="relative pt-32 pb-24 bg-[#F8FAFC] overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-200/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-200/20 blur-[120px] rounded-full animate-pulse" />
            </div>

            <div className="container-custom relative z-10">
                {/* Stunning Header */}
                <div className="max-w-4xl mb-24">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <div className="h-[1px] w-12 bg-primary-500" />
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-primary-500">
                            The Future of Services
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-6xl lg:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-none"
                    >
                        Browse <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-blue-600">Categories.</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl lg:text-2xl text-slate-600 font-medium leading-relaxed max-w-2xl"
                    >
                        {subtitle}
                    </motion.p>
                </div>

                {/* Grid for IT Categories */}
                {itCategories.length > 0 && (
                    <div className="mb-32">
                        <div className="flex items-end justify-between mb-12 border-b border-slate-200 pb-8">
                            <div>
                                <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                                    Tech & Digital
                                </h3>
                                <p className="text-slate-600 font-medium">Enterprise-grade technology solutions</p>
                            </div>
                            <Link href="/services" className="group flex items-center gap-3 text-sm font-bold text-slate-900 uppercase tracking-widest py-4 px-8 rounded-2xl border border-slate-200 hover:bg-slate-900 hover:text-white transition-all">
                                All Services
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-[500px] rounded-[2.5rem] bg-white/5 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {itCategories.map((cat, i) => renderCategoryCard(cat, i))}
                            </div>
                        )}
                    </div>
                )}

                {/* Grid for Academic Categories */}
                {academicCategories.length > 0 && (
                    <div>
                        <div className="flex items-end justify-between mb-12 border-b border-slate-200 pb-8">
                            <div>
                                <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                                    Academic Hub
                                </h3>
                                <p className="text-slate-600 font-medium">Research assistance and student support</p>
                            </div>
                            <Link href="/academic" className="group flex items-center gap-3 text-sm font-bold text-slate-900 uppercase tracking-widest py-4 px-8 rounded-2xl border border-slate-200 hover:bg-slate-900 hover:text-white transition-all">
                                Academic Core
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-[500px] rounded-[2.5rem] bg-white/5 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {academicCategories.map((cat, i) => renderCategoryCard(cat, i + itCategories.length))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
