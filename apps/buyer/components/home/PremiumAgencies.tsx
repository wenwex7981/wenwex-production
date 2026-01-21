'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, BadgeCheck, Users, ArrowRight, Loader2, Award, ExternalLink, ShieldCheck } from 'lucide-react';
import { fetchAllVendors } from '@/lib/data-service';
import { VendorLogo } from '@/components/ui/VendorLogo';

// Mock data as fallback
const mockAgencies = [
    {
        id: '1',
        name: 'TechCraft Studios',
        slug: 'techcraft-studios',
        logo: 'https://ui-avatars.com/api/?name=TechCraft&background=0c8bff&color=fff&size=200',
        banner: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800',
        description: 'Elite full-stack development studio specializing in enterprise software architecture and cloud solutions.',
        isVerified: true,
        rating: 4.9,
        reviewCount: 234,
        followersCount: '1.2K',
        servicesCount: 15,
        tag: 'Market Leader'
    },
    {
        id: '4',
        name: 'PixelPerfect Design',
        slug: 'pixelperfect-design',
        logo: 'https://ui-avatars.com/api/?name=PixelPerfect&background=f59e0b&color=fff&size=200',
        banner: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800',
        description: 'Global award-winning design agency crafting high-end digital experiences and luxury brand identities.',
        isVerified: true,
        rating: 5.0,
        reviewCount: 312,
        followersCount: '1.5K',
        servicesCount: 10,
        tag: 'Creative Elite'
    },
    {
        id: '2',
        name: 'AppForge Inc',
        slug: 'appforge-inc',
        logo: 'https://ui-avatars.com/api/?name=AppForge&background=22c55e&color=fff&size=200',
        banner: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800',
        description: 'Mobile-first innovation hub building world-class iOS and Android applications for startups and scale-ups.',
        isVerified: true,
        rating: 4.8,
        reviewCount: 189,
        followersCount: '980',
        servicesCount: 12,
        tag: 'Mobile Expert'
    }
];

export function PremiumAgencies({ content }: { content?: any }) {
    const title = content?.title || "Global Elite Agencies";
    const subtitle = content?.subtitle || "Partner with the world's most prestigious and technically capable verified providers.";
    const [agencies, setAgencies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadAgencies() {
            try {
                const liveVendors = await fetchAllVendors();
                const mappedLive = (liveVendors || []).map(v => ({
                    id: v.id,
                    name: v.companyName,
                    slug: v.slug,
                    logo: v.logoUrl,
                    banner: v.bannerUrl,
                    description: v.description,
                    isVerified: v.isVerified,
                    rating: v.rating,
                    reviewCount: v.reviewCount,
                    followersCount: v.followersCount > 1000 ? (v.followersCount / 1000).toFixed(1) + 'K' : v.followersCount,
                    servicesCount: v.servicesCount,
                    tag: v.rating >= 4.9 ? 'Top Rated' : 'Verified'
                }));

                const uniqueSlugs = new Set(mappedLive.map(v => v.slug));
                const filteredMock = mockAgencies.filter(m => !uniqueSlugs.has(m.slug));
                const all = [...mappedLive, ...filteredMock].sort((a, b) => b.rating - a.rating);
                setAgencies(all.slice(0, 3));
            } catch (error) {
                console.error('Error loading agencies:', error);
                setAgencies(mockAgencies);
            } finally {
                setIsLoading(false);
            }
        }
        loadAgencies();
    }, []);

    if (isLoading) {
        return (
            <div className="py-24 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <section className="relative py-24 lg:py-32 overflow-hidden bg-[#050505]">
            {/* Ultra-Premium Animated Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(12,139,255,0.08),transparent_50%)]" />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-blue-600/20 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] bg-purple-600/20 blur-[120px] rounded-full"
                />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                </div>
            </div>

            <div className="container-custom relative z-10">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-20">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-3 mb-6"
                        >
                            <span className="h-px w-12 bg-primary-500" />
                            <span className="text-primary-400 text-[11px] font-black uppercase tracking-[0.4em] drop-shadow-[0_0_10px_rgba(12,139,255,0.5)]">The Industry Leaders</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tighter"
                        >
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-primary-400">
                                Global Elite <br /> Agencies.
                            </span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-white/50 font-medium leading-relaxed max-w-xl"
                        >
                            Partner with the world&apos;s most prestigious and technically capable verified providers.
                        </motion.p>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <Link
                            href="/vendors"
                            className="h-16 px-10 rounded-2xl bg-primary-600 text-white font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-primary-500 transition-all active:scale-95 shadow-[0_20px_40px_-10px_rgba(12,139,255,0.4)] group"
                        >
                            Discover Portfolio
                            <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                {/* Ultra-Modern Agencies Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {agencies.map((agency, idx) => (
                        <motion.div
                            key={agency.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.15, duration: 0.6 }}
                            className="group relative"
                        >
                            <Link href={`/vendors/${agency.slug}`} className="block h-full">
                                <article className="relative h-full bg-white/[0.03] backdrop-blur-3xl rounded-[48px] border border-white/10 p-10 pt-0 overflow-hidden transition-all duration-700 hover:border-primary-500/50 hover:bg-white/[0.05] hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">

                                    {/* Glass Highlight Effect */}
                                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-600/10 blur-[60px] rounded-full group-hover:bg-primary-600/20 transition-all duration-700" />

                                    {/* Top Tag - Floating */}
                                    <div className="absolute top-8 right-10 z-20">
                                        <div className="bg-primary-600/20 backdrop-blur-xl px-4 py-2 rounded-2xl border border-primary-500/30 flex items-center gap-2 shadow-[0_0_20px_rgba(12,139,255,0.15)]">
                                            <Award className="w-4 h-4 text-primary-400" />
                                            <span className="text-[10px] font-black uppercase tracking-wider text-primary-300">{agency.tag}</span>
                                        </div>
                                    </div>

                                    {/* Background Visual */}
                                    <div className="absolute top-0 left-0 right-0 h-48 overflow-hidden pointer-events-none">
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/0 via-[#050505]/20 to-[#050505]/40 z-10" />
                                        <img
                                            src={agency.banner}
                                            alt=""
                                            className="w-full h-full object-cover opacity-20 filter grayscale transition-all duration-1000 group-hover:scale-125 group-hover:filter-none group-hover:opacity-40"
                                        />
                                    </div>

                                    {/* Main Content */}
                                    <div className="relative z-20 pt-24 flex flex-col items-center">
                                        {/* Avatar with Glow */}
                                        <div className="relative mb-8 transform group-hover:scale-105 transition-transform duration-700">
                                            <div className="absolute inset-0 bg-primary-500/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                            <div className="relative w-28 h-28 rounded-[36px] overflow-hidden border-8 border-[#111] shadow-2xl bg-[#090909]">
                                                <VendorLogo
                                                    src={agency.logo}
                                                    alt={agency.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2.5 mb-4 px-2 text-center justify-center">
                                            <h3 className="text-3xl font-black text-white tracking-tighter group-hover:text-primary-400 transition-colors duration-300">
                                                {agency.name}
                                            </h3>
                                            {agency.isVerified && (
                                                <div className="w-7 h-7 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(12,139,255,0.3)]">
                                                    <ShieldCheck className="w-4 h-4 text-primary-400" />
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-[14px] text-white/40 font-medium text-center leading-relaxed mb-10 line-clamp-3 group-hover:text-white/60 transition-colors">
                                            {agency.description}
                                        </p>

                                        {/* Performance Matrix - Dark Theme */}
                                        <div className="w-full grid grid-cols-3 gap-3 mb-10">
                                            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-4 flex flex-col items-center border border-white/5 transition-all duration-300 group-hover:bg-primary-500/10 group-hover:border-primary-500/20">
                                                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.1em] mb-2">Success</span>
                                                <div className="flex items-center gap-1.5">
                                                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                                    <span className="text-sm font-black text-white">{agency.rating}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-4 flex flex-col items-center border border-white/5 transition-all duration-300 group-hover:bg-primary-500/10 group-hover:border-primary-500/20">
                                                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.1em] mb-2">Reach</span>
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="w-3.5 h-3.5 text-primary-400" />
                                                    <span className="text-sm font-black text-white">{agency.followersCount}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-4 flex flex-col items-center border border-white/5 transition-all duration-300 group-hover:bg-primary-500/10 group-hover:border-primary-500/20">
                                                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.1em] mb-2">Projects</span>
                                                <span className="text-sm font-black text-white">{agency.servicesCount}</span>
                                            </div>
                                        </div>

                                        {/* Action Hint */}
                                        <div className="flex items-center gap-3 py-3 px-6 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-4 transition-all duration-500">
                                            <span>Explore Agency Profiles</span>
                                            <div className="w-4 h-4 rounded-full bg-primary-600 flex items-center justify-center">
                                                <ArrowRight className="w-2.5 h-2.5 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
