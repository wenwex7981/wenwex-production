'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Heart, Eye, ArrowRight, BadgeCheck, Loader2 } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';

const supabase = getSupabaseClient();

// Fallback shorts data
const fallbackShorts = [
    {
        id: '1',
        title: 'Building a React Dashboard in 60 Seconds',
        thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=700&fit=crop',
        view_count: 45600,
        likes_count: 3200,
        vendor: { company_name: 'TechCraft Studios', is_verified: true },
    },
    {
        id: '2',
        title: 'Flutter Animation Tips',
        thumbnail_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=700&fit=crop',
        view_count: 32100,
        likes_count: 2800,
        vendor: { company_name: 'AppForge Inc', is_verified: true },
    },
    {
        id: '3',
        title: 'AI Model Training Demo',
        thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=700&fit=crop',
        view_count: 28900,
        likes_count: 2100,
        vendor: { company_name: 'AI Solutions Lab', is_verified: true },
    },
    {
        id: '4',
        title: 'UI Design Process Timelapse',
        thumbnail_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=700&fit=crop',
        view_count: 56700,
        likes_count: 4500,
        vendor: { company_name: 'PixelPerfect Design', is_verified: true },
    },
];

const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

export function ShortsPreview({ content }: { content?: any }) {
    const [shorts, setShorts] = useState<any[]>(fallbackShorts);
    const [isLoading, setIsLoading] = useState(true);

    const title = content?.title || "Discover Shorts";
    const subtitle = content?.subtitle || "Quick previews of amazing services from our vendors";

    useEffect(() => {
        async function loadShorts() {
            try {
                // Fetch approved shorts
                const { data: shortsData, error: sError } = await supabase
                    .from('shorts')
                    .select('*')
                    .eq('is_approved', true)
                    .order('created_at', { ascending: false })
                    .limit(4);

                if (sError) throw sError;
                if (!shortsData || shortsData.length === 0) {
                    setShorts(fallbackShorts);
                    setIsLoading(false);
                    return;
                }

                // Fetch vendor info separately
                const vendorIds = [...new Set(shortsData.map(s => s.vendor_id))].filter(Boolean);
                const { data: vendors } = await supabase
                    .from('vendors')
                    .select('id, company_name, slug, logo_url, is_verified')
                    .in('id', vendorIds);

                const enrichedShorts = shortsData.map(short => ({
                    ...short,
                    vendor: vendors?.find(v => v.id === short.vendor_id) || { company_name: 'WENVEX Vendor', is_verified: false }
                }));

                setShorts(enrichedShorts);
            } catch (error) {
                console.error('Error loading shorts:', error);
                setShorts(fallbackShorts);
            } finally {
                setIsLoading(false);
            }
        }
        loadShorts();
    }, []);

    if (isLoading) {
        return (
            <section className="py-16 lg:py-24 bg-gray-900">
                <div className="container-custom">
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 lg:py-24 bg-gray-900">
            <div className="container-custom">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                                <Play className="w-5 h-5 text-white fill-white" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white">{title}</h2>
                        </div>
                        <p className="text-lg text-gray-400">
                            {subtitle}
                        </p>
                    </div>
                    <Link
                        href="/shorts"
                        className="btn bg-white text-gray-900 hover:bg-gray-100"
                    >
                        Watch All Shorts
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Shorts Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                    {shorts.map((short, index) => (
                        <motion.div
                            key={short.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group"
                        >
                            <Link href={`/shorts?id=${short.id}`} className="block">
                                <div className="relative aspect-[9/16] rounded-[2.5rem] overflow-hidden bg-gray-800 border border-white/5 shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-primary-500/20">
                                    {/* Thumbnail */}
                                    <img
                                        src={short.thumbnail_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=700&fit=crop'}
                                        alt={short.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=700&fit=crop';
                                        }}
                                    />

                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                    {/* Play Button */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 scale-90 group-hover:scale-100 transition-transform">
                                            <Play className="w-8 h-8 text-white fill-white ml-1" />
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="absolute top-5 right-5 flex flex-col gap-2">
                                        <div className="flex items-center gap-1.5 text-white text-[10px] font-black bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 uppercase tracking-widest">
                                            <Eye className="w-3.5 h-3.5 text-primary-400" />
                                            {formatNumber(short.view_count || 0)}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-white text-[10px] font-black bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 uppercase tracking-widest">
                                            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                                            {formatNumber(short.likes_count || 0)}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-3">
                                            <span>{short.vendor?.company_name || 'WENVEX Vendor'}</span>
                                            {short.vendor?.is_verified && (
                                                <BadgeCheck className="w-4 h-4 text-primary-400 fill-primary-400/20" />
                                            )}
                                        </div>
                                        <h3 className="text-white font-bold leading-tight line-clamp-2 text-base group-hover:text-primary-300 transition-colors">
                                            {short.title || 'Untitled Short'}
                                        </h3>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-12 text-center">
                    <p className="text-gray-400 mb-4">
                        Vendors upload short videos to showcase their work. Discover talent in seconds!
                    </p>
                    <Link href="/shorts" className="text-primary-400 hover:text-primary-300 font-medium inline-flex items-center gap-2">
                        Explore the full library
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
