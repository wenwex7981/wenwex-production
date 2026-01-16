'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, BadgeCheck, Users, ArrowRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchAllVendors } from '@/lib/data-service';

// Mock data - replace with API call
const topAgencies = [
    {
        id: '1',
        name: 'TechCraft Studios',
        slug: 'techcraft-studios',
        logo: 'https://ui-avatars.com/api/?name=TechCraft&background=0c8bff&color=fff&size=200',
        banner: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        description: 'Full-stack development agency specializing in enterprise solutions.',
        isVerified: true,
        rating: 4.9,
        reviewCount: 234,
        followersCount: 1250,
        servicesCount: 15,
    },
    {
        id: '2',
        name: 'AppForge Inc',
        slug: 'appforge-inc',
        logo: 'https://ui-avatars.com/api/?name=AppForge&background=22c55e&color=fff&size=200',
        banner: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
        description: 'Mobile-first development studio creating beautiful apps.',
        isVerified: true,
        rating: 4.8,
        reviewCount: 189,
        followersCount: 980,
        servicesCount: 12,
    },
    {
        id: '3',
        name: 'AI Solutions Lab',
        slug: 'ai-solutions-lab',
        logo: 'https://ui-avatars.com/api/?name=AI+Lab&background=d946ef&color=fff&size=200',
        banner: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800',
        description: 'Cutting-edge AI/ML solutions for modern businesses.',
        isVerified: true,
        rating: 4.9,
        reviewCount: 156,
        followersCount: 820,
        servicesCount: 8,
    },
    {
        id: '4',
        name: 'PixelPerfect Design',
        slug: 'pixelperfect-design',
        logo: 'https://ui-avatars.com/api/?name=PixelPerfect&background=f59e0b&color=fff&size=200',
        banner: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800',
        description: 'Premium UI/UX design agency with global clients.',
        isVerified: true,
        rating: 5.0,
        reviewCount: 312,
        followersCount: 1560,
        servicesCount: 10,
    },
    {
        id: '5',
        name: 'CloudNine DevOps',
        slug: 'cloudnine-devops',
        logo: 'https://ui-avatars.com/api/?name=CloudNine&background=06b6d4&color=fff&size=200',
        banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        description: 'Cloud infrastructure and DevOps experts.',
        isVerified: true,
        rating: 4.7,
        reviewCount: 98,
        followersCount: 540,
        servicesCount: 6,
    },
    {
        id: '6',
        name: 'SecureShield Cyber',
        slug: 'secureshield-cyber',
        logo: 'https://ui-avatars.com/api/?name=SecureShield&background=ef4444&color=fff&size=200',
        banner: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
        description: 'Enterprise cybersecurity solutions and audits.',
        isVerified: true,
        rating: 4.8,
        reviewCount: 145,
        followersCount: 720,
        servicesCount: 9,
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

export function TopAgencies({ content }: { content?: any }) {
    const title = content?.title || "Top Agencies";
    const subtitle = content?.subtitle || "Trusted vendors with proven track records";
    const [agencies, setAgencies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadAgencies() {
            try {
                const liveVendors = await fetchAllVendors();

                // Map live vendors to the shape expected by this component
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
                    followersCount: v.followersCount,
                    servicesCount: v.servicesCount
                }));

                // Combine with mock data, ensuring no duplicates by slug
                const liveSlugs = new Set(mappedLive.map(v => v.slug));
                const uniqueMock = topAgencies.filter(v => !liveSlugs.has(v.slug));

                // Sort by rating or just take the top ones
                const allAgencies = [...mappedLive, ...uniqueMock].sort((a, b) => b.rating - a.rating);
                setAgencies(allAgencies.slice(0, 6));
            } catch (error) {
                console.error('Error loading top agencies:', error);
                setAgencies(topAgencies.slice(0, 6));
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
        <section className="py-16 lg:py-24 bg-white">
            <div className="container-custom">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
                    <div>
                        <h2 className="section-title">{title}</h2>
                        <p className="section-subtitle">
                            {subtitle}
                        </p>
                    </div>
                    <Link
                        href="/vendors"
                        className="btn-outline"
                    >
                        View All Agencies
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Agencies Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {agencies.map((agency) => (
                        <motion.div key={agency.id} variants={itemVariants} className="h-full">
                            <Link href={`/vendors/${agency.slug}`} className="block h-full">
                                <article className="group h-full bg-white rounded-[32px] border border-gray-100 hover:border-primary-200 hover:shadow-2xl transition-all duration-500 flex flex-col p-6 relative overflow-hidden">
                                    {/* Banner */}
                                    <div className="relative h-28 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-[32px] bg-gray-100">
                                        <img
                                            src={agency.banner}
                                            alt=""
                                            className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-1000"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    </div>

                                    {/* Logo */}
                                    <div className="relative -mt-16 mb-4 z-10 flex justify-center">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white transition-transform duration-500 group-hover:scale-105">
                                            <img
                                                src={agency.logo}
                                                alt={agency.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agency.name)}&background=random&color=fff&size=200`;
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="text-center flex-1 flex flex-col">
                                        <div className="flex items-center justify-center gap-2 mb-3">
                                            <h3 className="font-black text-xl text-gray-900 group-hover:text-primary-600 transition-colors tracking-tight">
                                                {agency.name}
                                            </h3>
                                            {agency.isVerified && (
                                                <BadgeCheck className="w-5 h-5 text-primary-500 fill-primary-50/50" />
                                            )}
                                        </div>

                                        <p className="text-[13px] text-gray-500 mb-6 line-clamp-2 leading-relaxed min-h-[40px]">
                                            {agency.description}
                                        </p>

                                        {/* Stats */}
                                        <div className="flex items-center justify-center gap-6 text-[13px] mb-2">
                                            <div className="flex items-center gap-1.5 font-bold text-gray-900 bg-yellow-400/10 px-2.5 py-1 rounded-lg">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                <span>{agency.rating}</span>
                                                <span className="text-gray-400 font-medium">({agency.reviewCount})</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-700 font-bold">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span>{agency.followersCount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Services Footer */}
                                    <div className="mt-8 pt-5 border-t border-gray-100 flex justify-center">
                                        <span className="px-5 py-2 bg-primary-50 text-primary-700 text-[10px] font-black rounded-xl uppercase tracking-[0.2em] border border-primary-100 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all duration-300">
                                            {agency.servicesCount} Services
                                        </span>
                                    </div>
                                </article>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
