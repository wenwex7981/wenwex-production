'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Clock, ArrowRight, BadgeCheck, Loader2, Zap, Heart, TrendingUp, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCurrencyStore } from '@/lib/currency-store';
import { fetchFeaturedServices } from '@/lib/data-service';

export function FeaturedServices({ content }: { content?: any }) {
    const title = content?.title || "Handpicked Excellence";
    const subtitle = content?.subtitle || "Premium services from our top-tier global verification program.";
    const [services, setServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const formatPrice = useCurrencyStore((state) => state.formatPrice);

    useEffect(() => {
        setMounted(true);
        async function loadServices() {
            try {
                const data = await fetchFeaturedServices();

                // Ensure we have at least 6 services for a good scroll experience
                if (!data || data.length < 6) {
                    const mockServices = [
                        {
                            id: 'mock-1',
                            title: 'Enterprise AI Strategy & Implementation',
                            slug: 'enterprise-ai-strategy',
                            description: 'Comprehensive AI roadmap and custom model training for global enterprise scaling.',
                            image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
                            price: 250000,
                            rating: 5.0,
                            total_reviews: 48,
                            delivery_days: 30,
                            category: { name: 'AI & Data' },
                            vendor: { name: 'AI Solutions Lab', is_verified: true }
                        },
                        {
                            id: 'mock-3',
                            title: 'Next-Gen Mobile App Ecosystem',
                            slug: 'next-gen-mobile',
                            description: 'Scalable iOS & Android applications with integrated cloud architecture.',
                            image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
                            price: 320000,
                            rating: 4.8,
                            total_reviews: 112,
                            delivery_days: 45,
                            category: { name: 'Mobile Apps' },
                            vendor: { name: 'AppForge Inc', is_verified: true }
                        },
                        {
                            id: 'mock-4',
                            title: 'Blockchain Security Audit',
                            slug: 'blockchain-security',
                            description: 'Rigorous smart contract auditing and vulnerability assessment for DeFi protocols.',
                            image_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
                            price: 180000,
                            rating: 5.0,
                            total_reviews: 32,
                            delivery_days: 10,
                            category: { name: 'Custom Software' },
                            vendor: { name: 'SecureShield', is_verified: true }
                        }
                    ];
                    setServices([...(data || []), ...mockServices]);
                } else {
                    setServices(data);
                }
            } catch (error) {
                console.error('Error loading featured services:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadServices();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.8;
            scrollRef.current.scrollTo({
                left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (!mounted) return null;

    if (isLoading) {
        return (
            <div className="py-24 text-center bg-[#fdfdfd]">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-6" />
                <h3 className="text-xl font-black text-gray-900 mb-2">Curating Excellence</h3>
                <p className="text-gray-500 font-medium">Scanning our global network for premium services...</p>
            </div>
        );
    }

    if (services.length === 0) return null;

    return (
        <section className="relative pt-10 lg:pt-16 pb-24 lg:pb-32 bg-[#fdfdfd] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="container-custom relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-3 mb-6"
                        >
                            <div className="p-2 rounded-xl bg-orange-100">
                                <TrendingUp className="w-4 h-4 text-orange-600" />
                            </div>
                            <span className="text-orange-600 text-[11px] font-black uppercase tracking-[0.3em]">Featured Listings</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-[1.1]"
                        >
                            Marketplace <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Spotlight.</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-gray-500 font-medium leading-relaxed"
                        >
                            Explore top-tier digital assets and academic projects handpicked for their exceptional quality and reliability.
                        </motion.p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 mr-4">
                            <button
                                onClick={() => scroll('left')}
                                className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 shadow-sm text-gray-600"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 shadow-sm text-gray-600"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                        <Link
                            href="/services"
                            className="h-16 px-10 rounded-2xl bg-gray-900 text-white font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-primary-600 transition-all active:scale-95 shadow-2xl shadow-gray-200 group"
                        >
                            Browse All
                            <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                    <div
                        ref={scrollRef}
                        className="flex flex-nowrap gap-8 overflow-x-auto pb-12 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                    >
                        {services.map((service, idx) => (
                            <motion.article
                                key={service.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group flex flex-col bg-white rounded-[40px] border border-gray-100 overflow-hidden transition-all duration-500 hover:border-primary-200 hover:shadow-[0_32px_80px_-20px_rgba(0,0,0,0.1)] w-[320px] md:w-[420px] h-[680px] flex-shrink-0 snap-start"
                            >
                                {/* Fixed Visual Header */}
                                <div className="relative h-60 w-full flex-shrink-0">
                                    <img
                                        src={service.image_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800'}
                                        alt={service.title}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />

                                    <div className="absolute top-6 left-6">
                                        <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-900 border border-white/20 shadow-xl">
                                            {service.category?.name || 'Service'}
                                        </span>
                                    </div>
                                    <button className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-primary-600 transition-all">
                                        <Heart className="w-4 h-4" />
                                    </button>

                                    <div className="absolute bottom-6 left-6">
                                        <div className="flex items-center gap-2 bg-primary-600/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary-400/30">
                                            <Clock className="w-3.5 h-3.5 text-white" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-wider">{service.delivery_days || 7} Days</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 p-8 pb-10 flex flex-col h-full">
                                    {/* Fixed Vendor Line */}
                                    <div className="flex items-center justify-between mb-5 h-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-lg bg-gray-50 flex-shrink-0">
                                                <img
                                                    src={service.vendor?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.vendor?.name || 'V')}&background=random&color=fff`}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Provider</span>
                                                <span className="text-xs font-bold text-gray-700 hover:text-primary-600 transition-colors line-clamp-1">{service.vendor?.name}</span>
                                            </div>
                                        </div>
                                        {service.vendor?.is_verified && (
                                            <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                                                <Shield className="w-3.5 h-3.5 text-blue-600" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Main Title & Description with Fixed Block Spacing */}
                                    <div className="flex-1 flex flex-col">
                                        <Link href={`/services/${service.slug}`} className="block mb-4">
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-tight group-hover:text-primary-600 transition-colors mb-3 line-clamp-2 min-h-[56px]">
                                                {service.title}
                                            </h3>
                                        </Link>
                                        <p className="text-[14px] text-gray-500 font-medium leading-relaxed line-clamp-2 min-h-[40px] mb-4">
                                            {service.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 mb-8 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-100">
                                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                            <span className="text-sm font-black text-amber-700">{service.rating || '5.0'}</span>
                                            <span className="text-[10px] text-amber-600/60 font-bold">({service.total_reviews || 120})</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Zap className="w-3.5 h-3.5 fill-current" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest italic">Fast Execution</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Premium Tier</span>
                                            <span className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter whitespace-nowrap overflow-visible">
                                                {formatPrice(service.price)}
                                            </span>
                                        </div>
                                        <Link
                                            href={`/services/${service.slug}`}
                                            className="h-12 px-6 rounded-xl bg-primary-50 text-primary-600 font-black text-[11px] uppercase tracking-widest flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all active:scale-95"
                                        >
                                            Enter Hub
                                        </Link>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
