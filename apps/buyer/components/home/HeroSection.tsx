'use client';

import { motion } from 'framer-motion';
import { Search, ArrowRight, Star, Shield, Users, Zap } from 'lucide-react';
import Link from 'next/link';

const stats = [
    { value: '500+', label: 'Verified Agencies', icon: Shield },
    { value: '10K+', label: 'Services Listed', icon: Zap },
    { value: '50K+', label: 'Happy Clients', icon: Users },
    { value: '4.9', label: 'Average Rating', icon: Star },
];

const iconMap: any = { Shield, Zap, Users, Star };

export function HeroSection({ content }: { content?: any }) {
    const data = content?.config || {};
    const title = content?.title || 'UI Design Process Timelapse';
    const bannerImage = data.banner_image || "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000";
    const featuredVendor = data.featured_vendor || 'PixelPerfect Design';
    const primaryCTA = data.primary_cta || { text: 'Watch Showcase', link: '#' };
    const secondaryCTA = data.secondary_cta || { text: 'Explore Services', link: '/services' };
    const dynamicStats = data.stats || stats;

    return (
        <section className="relative bg-white pb-20">
            <div className="container-custom">
                {/* Visual Banner */}
                <div className="relative w-full h-[400px] lg:h-[500px] rounded-[32px] overflow-hidden group shadow-2xl">
                    <img
                        src={bannerImage}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=2000';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Banner Content */}
                    <div className="absolute bottom-10 left-10 right-10 flex flex-col items-start">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white/20">
                                <Shield className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white font-bold text-sm tracking-tight drop-shadow-md">{featuredVendor} <Shield className="w-3.5 h-3.5 inline ml-1 fill-blue-400 text-blue-400" /></span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-4 drop-shadow-lg max-w-2xl">
                            {title}
                        </h1>
                        <div className="flex items-center gap-6 mt-2">
                            <button className="bg-white text-gray-900 px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-gray-100 transition-all active:scale-95 shadow-xl">
                                <Zap className="w-4 h-4 fill-primary-500 text-primary-500" />
                                {primaryCTA.text}
                            </button>
                            <Link href={secondaryCTA.link} className="text-white/90 font-bold text-sm hover:text-white transition-colors flex items-center gap-2 group/link">
                                {secondaryCTA.text}
                                <ArrowRight className="w-4 h-4 translate-x-0 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Floating Badge */}
                    <div className="absolute top-10 right-10 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-3xl flex flex-col items-start gap-1">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                        </div>
                        <span className="text-white font-black text-xl">4.9 / 5.0</span>
                        <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Client Satisfaction</span>
                    </div>
                </div>

                {/* Stats Section - Precisely as requested */}
                <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 px-4">
                    {dynamicStats.map((stat: any, index: number) => {
                        const Icon = iconMap[stat.icon] || Star;
                        return (
                            <div key={stat.label} className="flex flex-col items-center group cursor-default">
                                <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5 transition-all group-hover:bg-primary-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-primary-500/20 group-hover:-translate-y-1">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="text-3xl font-black text-gray-900 leading-none mb-2 tracking-tighter">
                                    {stat.value}
                                </div>
                                <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">
                                    {stat.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
