'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, MessageCircle, Share2, Volume2, VolumeX, Play, Pause,
    ChevronUp, ChevronDown, BadgeCheck, X, Send, Loader2
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';

const supabase = getSupabaseClient();

// Fallback shorts data
const fallbackShorts = [
    {
        id: '1',
        title: 'Building a React Dashboard in 60 Seconds',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=700&fit=crop',
        view_count: 45600,
        likes_count: 3200,
        comments_count: 156,
        vendor: {
            company_name: 'TechCraft Studios',
            slug: 'techcraft-studios',
            logo_url: 'https://ui-avatars.com/api/?name=TechCraft&background=0c8bff&color=fff',
            is_verified: true
        },
        service: { title: 'Full-Stack Dashboard Development', slug: 'fullstack-dashboard' },
    },
    {
        id: '2',
        title: 'Flutter Animation Tips & Tricks',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=700&fit=crop',
        view_count: 32100,
        likes_count: 2800,
        comments_count: 89,
        vendor: {
            company_name: 'AppForge Inc',
            slug: 'appforge-inc',
            logo_url: 'https://ui-avatars.com/api/?name=AppForge&background=22c55e&color=fff',
            is_verified: true
        },
        service: { title: 'Flutter Mobile App Development', slug: 'flutter-app' },
    },
    {
        id: '3',
        title: 'AI Model Training Demo - GPT Fine-tuning',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=700&fit=crop',
        view_count: 28900,
        likes_count: 2100,
        comments_count: 234,
        vendor: {
            company_name: 'AI Solutions Lab',
            slug: 'ai-solutions-lab',
            logo_url: 'https://ui-avatars.com/api/?name=AI+Lab&background=d946ef&color=fff',
            is_verified: true
        },
        service: { title: 'Custom AI Model Training', slug: 'ai-model-training' },
    },
    {
        id: '4',
        title: 'UI Design Process - From Wireframe to Final',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=700&fit=crop',
        view_count: 56700,
        likes_count: 4500,
        comments_count: 312,
        vendor: {
            company_name: 'PixelPerfect Design',
            slug: 'pixelperfect-design',
            logo_url: 'https://ui-avatars.com/api/?name=PixelPerfect&background=f59e0b&color=fff',
            is_verified: true
        },
        service: { title: 'Premium UI/UX Design', slug: 'ui-ux-design' },
    },
];

const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

export default function ShortsPage() {
    const [shorts, setShorts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [showComments, setShowComments] = useState(false);
    const [likedShorts, setLikedShorts] = useState<Set<string>>(new Set());
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function loadShorts() {
            try {
                // Fetch approved shorts
                const { data: shortsData, error: sError } = await supabase
                    .from('shorts')
                    .select('*')
                    .eq('is_approved', true)
                    .order('created_at', { ascending: false });

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

                // Fetch services info
                const serviceIds = [...new Set(shortsData.map(s => s.service_id))].filter(Boolean);
                let services: any[] = [];
                if (serviceIds.length > 0) {
                    const { data: servicesData } = await supabase
                        .from('services')
                        .select('id, title, slug')
                        .in('id', serviceIds);
                    services = servicesData || [];
                }

                const enrichedShorts = shortsData.map(short => ({
                    ...short,
                    vendor: vendors?.find(v => v.id === short.vendor_id) || {
                        company_name: 'WENVEX Vendor',
                        slug: 'vendor',
                        logo_url: 'https://ui-avatars.com/api/?name=Vendor&background=6366f1&color=fff',
                        is_verified: false
                    },
                    service: services.find(s => s.id === short.service_id) || null
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

    const currentShort = shorts[currentIndex];

    const goToNext = () => {
        if (currentIndex < shorts.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleLike = (id: string) => {
        setLikedShorts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') {
                goToPrevious();
            } else if (e.key === 'ArrowDown') {
                goToNext();
            } else if (e.key === ' ') {
                e.preventDefault();
                togglePlay();
            } else if (e.key === 'm') {
                setIsMuted(!isMuted);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, isPlaying, isMuted]);

    // Auto-play when index changes
    useEffect(() => {
        if (videoRef.current && shorts.length > 0) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => { });
            setIsPlaying(true);
        }
    }, [currentIndex, shorts]);

    if (isLoading) {
        return (
            <div className="h-[100dvh] bg-black flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">Loading shorts...</p>
                </div>
            </div>
        );
    }

    if (shorts.length === 0) {
        return (
            <div className="h-[100dvh] bg-black flex items-center justify-center">
                <div className="text-center">
                    <Play className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">No Shorts Available</h2>
                    <p className="text-gray-400">Check back soon for new content!</p>
                    <Link href="/" className="btn-primary mt-6">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[100dvh] bg-black overflow-hidden flex">
            {/* Main Video Container */}
            <div
                ref={containerRef}
                className="flex-1 relative flex items-center justify-center"
            >
                {/* Video */}
                <div className="relative w-full max-w-md h-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentShort.id}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="absolute inset-0"
                        >
                            <video
                                ref={videoRef}
                                src={currentShort.video_url}
                                poster={currentShort.thumbnail_url}
                                className="w-full h-full object-cover"
                                loop
                                muted={isMuted}
                                playsInline
                                autoPlay
                                onClick={togglePlay}
                            />

                            {/* Play/Pause Overlay */}
                            <AnimatePresence>
                                {!isPlaying && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute inset-0 flex items-center justify-center bg-black/30"
                                        onClick={togglePlay}
                                    >
                                        <div className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                                            <Play className="w-10 h-10 text-white fill-white ml-1" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                            {/* Top Bar */}
                            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
                                <Link href="/" className="text-white font-bold text-lg">
                                    Shorts
                                </Link>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setIsMuted(!isMuted)}
                                        className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                                    >
                                        {isMuted ? (
                                            <VolumeX className="w-5 h-5 text-white" />
                                        ) : (
                                            <Volume2 className="w-5 h-5 text-white" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Bottom Content */}
                            <div className="absolute bottom-0 left-0 right-16 p-4">
                                {/* Vendor */}
                                <Link href={`/vendors/${currentShort.vendor?.slug || 'vendor'}`} className="flex items-center gap-3 mb-3">
                                    <Image
                                        src={currentShort.vendor?.logo_url || 'https://ui-avatars.com/api/?name=V&background=6366f1&color=fff'}
                                        alt={currentShort.vendor?.company_name || 'Vendor'}
                                        width={40}
                                        height={40}
                                        className="rounded-full border-2 border-white"
                                    />
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-white font-semibold">{currentShort.vendor?.company_name || 'WENVEX Vendor'}</span>
                                            {currentShort.vendor?.is_verified && (
                                                <BadgeCheck className="w-4 h-4 text-primary-400" />
                                            )}
                                        </div>
                                    </div>
                                    <button className="ml-2 px-4 py-1 border border-white text-white text-sm rounded-full hover:bg-white hover:text-black transition-colors">
                                        Follow
                                    </button>
                                </Link>

                                {/* Title */}
                                <h2 className="text-white font-medium mb-2">{currentShort.title || 'Untitled Short'}</h2>

                                {/* Service Link */}
                                {currentShort.service && (
                                    <Link
                                        href={`/services/${currentShort.service.slug}`}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm hover:bg-white/30 transition-colors"
                                    >
                                        🛒 {currentShort.service.title}
                                    </Link>
                                )}

                                {/* Stats */}
                                <div className="flex items-center gap-4 mt-3 text-white/70 text-sm">
                                    <span>{formatNumber(currentShort.view_count || 0)} views</span>
                                </div>
                            </div>

                            {/* Right Actions */}
                            <div className="absolute right-4 bottom-24 flex flex-col gap-6">
                                {/* Like */}
                                <button
                                    onClick={() => toggleLike(currentShort.id)}
                                    className="flex flex-col items-center gap-1"
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${likedShorts.has(currentShort.id) ? 'bg-red-500' : 'bg-white/20 backdrop-blur-sm'
                                        }`}>
                                        <Heart className={`w-6 h-6 ${likedShorts.has(currentShort.id) ? 'text-white fill-white' : 'text-white'}`} />
                                    </div>
                                    <span className="text-white text-xs">{formatNumber(currentShort.likes_count || 0)}</span>
                                </button>

                                {/* Comments */}
                                <button
                                    onClick={() => setShowComments(true)}
                                    className="flex flex-col items-center gap-1"
                                >
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                        <MessageCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-white text-xs">{formatNumber(currentShort.comments_count || 0)}</span>
                                </button>

                                {/* Share */}
                                <button className="flex flex-col items-center gap-1">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                        <Share2 className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-white text-xs">Share</span>
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                        <button
                            onClick={goToPrevious}
                            disabled={currentIndex === 0}
                            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center disabled:opacity-30"
                        >
                            <ChevronUp className="w-6 h-6 text-white" />
                        </button>
                        <button
                            onClick={goToNext}
                            disabled={currentIndex === shorts.length - 1}
                            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center disabled:opacity-30"
                        >
                            <ChevronDown className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    {/* Progress Dots */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                        {shorts.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-1.5 h-8 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/30'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Comments Panel */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-gray-900 border-l border-gray-800 flex flex-col"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-800">
                            <h3 className="text-white font-semibold">{currentShort.comments_count || 0} Comments</h3>
                            <button onClick={() => setShowComments(false)}>
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <p className="text-gray-500 text-center py-8">Comments coming soon...</p>
                        </div>
                        <div className="p-4 border-t border-gray-800">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500"
                                />
                                <button className="btn-primary px-4">
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
