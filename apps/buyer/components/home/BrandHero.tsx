'use client';

import { motion } from 'framer-motion';
import { Search, ArrowRight, Zap, Globe, Sparkles, Building2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { fetchSiteSettings } from '@/lib/data-service';

const defaultStats = [
    { value: '500+', label: 'Verified Agencies', icon: Building2 },
    { value: '10K+', label: 'Services Listed', icon: Zap },
    { value: '50K+', label: 'Happy Clients', icon: Globe },
    { value: '4.9', label: 'Average Rating', icon: TrendingUp },
];

export function BrandHero() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [settings, setSettings] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20,
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        async function loadSettings() {
            try {
                const data = await fetchSiteSettings();
                setSettings(data);
            } catch (error) {
                console.error('Failed to load settings:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadSettings();
    }, []);

    // Dynamic content with fallbacks
    const heroTitle = settings.hero_title || 'Global Tech Commerce Hub.';
    const heroSubtitle = settings.hero_subtitle || 'Empowering the world\'s most innovative companies through elite technology partnerships, global scalability, and production-grade excellence.';
    const ctaPrimaryText = settings.hero_cta_primary_text || 'Get Started';
    const ctaPrimaryLink = settings.hero_cta_primary_link || '/services';
    const ctaSecondaryText = settings.hero_cta_secondary_text || 'View Global Agencies';
    const ctaSecondaryLink = settings.hero_cta_secondary_link || '/vendors';
    // Professional office workspace image as poster/fallback
    const bannerImage = settings.hero_banner_image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000';
    // Premium video background - loops silently for professional effect
    // NOTE: Super Admin can set 'hero_video' setting to any video URL
    // For local video, place MP4 in /public folder and use: /your-video.mp4
    const heroVideo = settings.hero_video || '/17564202-uhd_3840_2160_30fps.mp4'; // Professional office/business video

    const stats = [
        { value: settings.stat_agencies || '500+', label: settings.stat_agencies_label || 'Verified Agencies', icon: Building2 },
        { value: settings.stat_services || '10K+', label: settings.stat_services_label || 'Services Listed', icon: Zap },
        { value: settings.stat_clients || '50K+', label: settings.stat_clients_label || 'Happy Clients', icon: Globe },
        { value: settings.stat_rating || '4.9', label: settings.stat_rating_label || 'Average Rating', icon: TrendingUp },
    ];

    return (
        <section className="relative bg-white pt-6 pb-20 overflow-hidden">
            <div className="container-custom">
                {/* Main Hero Container */}
                <div className="relative w-full min-h-[550px] lg:min-h-[650px] rounded-[48px] overflow-hidden group shadow-2xl bg-gray-900 border border-white/5">

                    {/* Animated Background Layers */}
                    <div className="absolute inset-0 z-0">
                        {/* Premium Video Background - Professional Look */}
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            poster={bannerImage}
                            className="w-full h-full object-cover opacity-45 transition-transform duration-[10s] ease-linear group-hover:scale-105"
                        >
                            <source src={heroVideo} type="video/mp4" />
                            {/* Fallback to image if video fails */}
                        </video>
                        {/* Fallback Image (shown if video doesn't load) */}
                        <img
                            src={bannerImage}
                            alt="Global Tech Commerce"
                            className="absolute inset-0 w-full h-full object-cover opacity-60 -z-10"
                        />

                        {/* Floating Mesh Gradients */}
                        <motion.div
                            animate={{
                                x: mousePosition.x,
                                y: mousePosition.y
                            }}
                            className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary-600/30 blur-[120px] rounded-full pointer-events-none"
                        />
                        <motion.div
                            animate={{
                                x: -mousePosition.x,
                                y: -mousePosition.y
                            }}
                            className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"
                        />

                        {/* Dark Overlay - stronger for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    </div>

                    {/* Content Layer */}
                    <div className="relative z-10 h-full flex flex-col justify-center px-8 lg:px-20 py-20">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-4xl"
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <span className="bg-primary-600/20 backdrop-blur-xl border border-primary-500/30 text-primary-400 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 fill-primary-400" />
                                    Welcome to Wenwex
                                </span>
                                <div className="h-[1px] w-12 bg-white/20" />
                                <span className="text-white/40 text-[11px] font-bold uppercase tracking-[0.2em]">Next-Gen Platform</span>
                            </div>

                            <h1 className="text-5xl lg:text-8xl font-black text-white leading-[1.05] tracking-tighter mb-8">
                                {heroTitle.includes('.') ? (
                                    <>
                                        {heroTitle.split('.')[0]} <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-blue-200 to-primary-500">
                                            {heroTitle.split('.').slice(1).join('.') || 'Commerce Hub.'}
                                        </span>
                                    </>
                                ) : heroTitle}
                            </h1>

                            <p className="text-lg lg:text-2xl text-white/60 font-medium max-w-2xl leading-relaxed mb-12">
                                {heroSubtitle}
                            </p>

                            <div className="flex flex-wrap items-center gap-6">
                                <Link
                                    href={ctaPrimaryLink}
                                    className="bg-white text-gray-900 h-16 px-10 rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-primary-500 hover:text-white transition-all active:scale-95 shadow-2xl shadow-white/5 group/btn"
                                >
                                    {ctaPrimaryText}
                                    <Zap className="w-4 h-4 text-primary-600 group-hover/btn:text-white fill-current" />
                                </Link>
                                <Link
                                    href={ctaSecondaryLink}
                                    className="h-16 px-8 rounded-2xl font-bold text-white border border-white/10 backdrop-blur-md hover:bg-white/5 transition-all flex items-center gap-2 group/link"
                                >
                                    {ctaSecondaryText}
                                    <ArrowRight className="w-4 h-4 translate-x-0 group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none hidden lg:block overflow-hidden">
                        <motion.div
                            animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
                            transition={{ duration: 10, repeat: Infinity }}
                            className="absolute -right-20 top-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full"
                        />
                        <motion.div
                            animate={{ opacity: [0.05, 0.15, 0.05], scale: [0.9, 1, 0.9] }}
                            transition={{ duration: 8, repeat: Infinity, delay: 1 }}
                            className="absolute -right-10 top-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full"
                        />
                    </div>
                </div>

                {/* Refined Stats Grid */}
                <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 px-2">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="flex items-center gap-5 group cursor-default"
                        >
                            <div className="w-14 h-14 rounded-[20px] bg-gray-50 border border-gray-100 text-gray-900 flex items-center justify-center transition-all group-hover:bg-primary-600 group-hover:text-white group-hover:shadow-2xl group-hover:shadow-primary-500/20 group-hover:-translate-y-1">
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-gray-900 tracking-tighter leading-none mb-1">
                                    {stat.value}
                                </span>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                    {stat.label}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
