'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, TrendingUp, ArrowRight, BadgeCheck, Clock } from 'lucide-react';
import { useCurrencyStore } from '@/lib/currency-store';

// Mock data - replace with API call
const trendingServices = [
    {
        id: '1',
        title: 'SaaS Dashboard Development',
        slug: 'saas-dashboard-development',
        price: 22,
        rating: 4.9,
        reviewCount: 78,
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
        vendor: { name: 'TechCraft Studios', isVerified: true },
        viewCount: 12500,
    },
    {
        id: '2',
        title: 'Flutter App Development',
        slug: 'flutter-app-development',
        price: 30,
        rating: 4.8,
        reviewCount: 92,
        imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600',
        vendor: { name: 'AppForge Inc', isVerified: true },
        viewCount: 9800,
    },
    {
        id: '3',
        title: 'Machine Learning Model Training',
        slug: 'machine-learning-model-training',
        price: 40,
        rating: 4.7,
        reviewCount: 45,
        imageUrl: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=600',
        vendor: { name: 'AI Solutions Lab', isVerified: true },
        viewCount: 7600,
    },
    {
        id: '4',
        title: 'Brand Identity Design',
        slug: 'brand-identity-design',
        price: 14,
        rating: 5.0,
        reviewCount: 134,
        imageUrl: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=600',
        vendor: { name: 'PixelPerfect Design', isVerified: true },
        viewCount: 15200,
    },
    {
        id: '5',
        title: 'AWS Cloud Architecture',
        slug: 'aws-cloud-architecture',
        price: 26,
        rating: 4.8,
        reviewCount: 67,
        imageUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600',
        vendor: { name: 'CloudNine DevOps', isVerified: true },
        viewCount: 6400,
    },
    {
        id: '6',
        title: 'Security Audit & Penetration Testing',
        slug: 'security-audit-penetration-testing',
        price: 60,
        rating: 4.9,
        reviewCount: 56,
        imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600',
        vendor: { name: 'SecureShield Cyber', isVerified: true },
        viewCount: 5200,
    },
    {
        id: '7',
        title: 'WordPress Theme Customization',
        slug: 'wordpress-theme-customization',
        price: 18,
        rating: 4.6,
        reviewCount: 245,
        imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600',
        vendor: { name: 'WebMasters Pro', isVerified: false },
        viewCount: 18900,
    },
    {
        id: '8',
        title: 'API Integration Services',
        slug: 'api-integration-services',
        price: 15.6,
        rating: 4.7,
        reviewCount: 89,
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600',
        vendor: { name: 'IntegratePro', isVerified: true },
        viewCount: 8700,
    },
    {
        id: '9',
        title: 'Smart Contract Development (Solidity)',
        slug: 'smart-contract-development',
        price: 72,
        rating: 4.8,
        reviewCount: 42,
        imageUrl: 'https://images.unsplash.com/photo-1621504450168-b8c6816db70a?w=600',
        vendor: { name: 'BlockChain Wizards', isVerified: true },
        viewCount: 11200,
    },
    {
        id: '10',
        title: 'IoT Dashboard & Device Management',
        slug: 'iot-dashboard-management',
        price: 35,
        rating: 4.7,
        reviewCount: 38,
        imageUrl: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=600',
        vendor: { name: 'Connected Things', isVerified: true },
        viewCount: 6100,
    },
    {
        id: '11',
        title: 'DevOps CI/CD Pipeline Setup',
        slug: 'devops-cicd-setup',
        price: 19,
        rating: 4.9,
        reviewCount: 85,
        imageUrl: 'https://images.unsplash.com/photo-1667372393119-c81c0e289e82?w=600',
        vendor: { name: 'DevOps Pro', isVerified: true },
        viewCount: 9400,
    },
    {
        id: '12',
        title: 'Cloud Security Compliance Audit',
        slug: 'cloud-security-compliance',
        price: 42,
        rating: 5.0,
        reviewCount: 29,
        imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600',
        vendor: { name: 'CyberSafe Solutions', isVerified: true },
        viewCount: 4800,
    },
];

export function TrendingServices({ content }: { content?: any }) {
    const title = content?.title || "Trending Now";
    const subtitle = content?.subtitle || "Most popular services right now";
    const formatPrice = useCurrencyStore((state) => state.formatPrice);

    return (
        <section className="py-16 lg:py-24 bg-gray-50">
            <div className="container-custom">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
                    <div className="text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                            <TrendingUp className="w-6 h-6 text-primary-500" />
                            <h2 className="section-title mb-0">{title}</h2>
                        </div>
                        <p className="section-subtitle">
                            {subtitle}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/services?sort=trending"
                            className="hidden sm:flex btn-outline"
                        >
                            See All
                        </Link>
                    </div>
                </div>

                {/* Horizontal Scroll Container */}
                <div className="relative -mx-4 px-4 lg:mx-0 lg:px-0">
                    <motion.div
                        className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide lg:grid lg:grid-cols-4 lg:overflow-visible"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        {trendingServices.map((service, index) => (
                            <motion.article
                                key={service.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="flex-shrink-0 w-80 lg:w-auto mt-2 lg:mt-0 group h-full bg-white rounded-[2rem] border border-gray-100 hover:border-primary-200 hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden"
                            >
                                {/* Image */}
                                <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
                                    <img
                                        src={service.imageUrl}
                                        alt={service.title}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800';
                                        }}
                                    />
                                    {/* Trending Badge */}
                                    <div className="absolute top-4 left-4 z-10">
                                        <div className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-2">
                                            <TrendingUp className="w-3.5 h-3.5 text-primary-500" />
                                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{service.viewCount.toLocaleString()} VIEWS</span>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col">
                                    {/* Vendor */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[11px] font-black text-primary-600 uppercase tracking-widest">{service.vendor.name}</span>
                                        {service.vendor.isVerified && (
                                            <BadgeCheck className="w-4 h-4 text-primary-500 fill-primary-50" />
                                        )}
                                    </div>

                                    {/* Title */}
                                    <Link href={`/services/${service.slug}`}>
                                        <h3 className="text-lg font-black text-gray-900 mb-4 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight min-h-[3rem]">
                                            {service.title}
                                        </h3>
                                    </Link>

                                    {/* Rating */}
                                    <div className="mt-auto flex items-center gap-4 mb-6">
                                        <div className="flex items-center gap-1.5 bg-yellow-400/10 px-2 py-1 rounded-lg">
                                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                            <span className="font-bold text-gray-900 text-sm">{service.rating}</span>
                                        </div>
                                        <span className="text-gray-400 text-xs font-medium">({service.reviewCount})</span>
                                    </div>

                                    {/* Price Footer */}
                                    <div className="pt-5 border-t border-gray-100 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-0.5">Starting at</span>
                                            <p className="text-xl font-black text-gray-900">
                                                {formatPrice(service.price)}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/services/${service.slug}`}
                                            className="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30 group/btn"
                                        >
                                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
