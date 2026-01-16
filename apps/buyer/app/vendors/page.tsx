'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    Search, Filter, Star, BadgeCheck, Users, MapPin,
    Grid3X3, List, SlidersHorizontal, X, ArrowUpDown, Loader2
} from 'lucide-react';
import { fetchAllVendors } from '@/lib/data-service';

// Mock data - used as fallback
const mockVendors = [
    {
        id: '1',
        companyName: 'TechCraft Studios',
        slug: 'techcraft-studios',
        logoUrl: 'https://ui-avatars.com/api/?name=TechCraft&background=0c8bff&color=fff&size=200',
        bannerUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        description: 'Full-stack development agency specializing in enterprise solutions and e-commerce platforms.',
        country: 'US',
        isVerified: true,
        rating: 4.9,
        reviewCount: 234,
        followersCount: 1250,
        servicesCount: 15,
        categories: ['Web Development', 'Mobile Apps', 'E-commerce'],
    },
    {
        id: '2',
        companyName: 'AppForge Inc',
        slug: 'appforge-inc',
        logoUrl: 'https://ui-avatars.com/api/?name=AppForge&background=22c55e&color=fff&size=200',
        bannerUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
        description: 'Mobile-first development studio creating beautiful and performant applications.',
        country: 'CA',
        isVerified: true,
        rating: 4.8,
        reviewCount: 189,
        followersCount: 980,
        servicesCount: 12,
        categories: ['Mobile Apps', 'React Native', 'Flutter'],
    },
    {
        id: '3',
        companyName: 'AI Solutions Lab',
        slug: 'ai-solutions-lab',
        logoUrl: 'https://ui-avatars.com/api/?name=AI+Lab&background=d946ef&color=fff&size=200',
        bannerUrl: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800',
        description: 'Cutting-edge AI/ML solutions for modern businesses and startups.',
        country: 'UK',
        isVerified: true,
        rating: 4.9,
        reviewCount: 156,
        followersCount: 820,
        servicesCount: 8,
        categories: ['AI & ML', 'Data Science', 'Automation'],
    },
    {
        id: '4',
        companyName: 'PixelPerfect Design',
        slug: 'pixelperfect-design',
        logoUrl: 'https://ui-avatars.com/api/?name=PixelPerfect&background=f59e0b&color=fff&size=200',
        bannerUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800',
        description: 'Premium UI/UX design agency serving global clients with top-tier designs.',
        country: 'DE',
        isVerified: true,
        rating: 5.0,
        reviewCount: 312,
        followersCount: 1560,
        servicesCount: 10,
        categories: ['UI/UX Design', 'Branding', 'Web Design'],
    },
    {
        id: '5',
        companyName: 'CloudNine DevOps',
        slug: 'cloudnine-devops',
        logoUrl: 'https://ui-avatars.com/api/?name=CloudNine&background=06b6d4&color=fff&size=200',
        bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        description: 'Cloud infrastructure specialists helping companies scale with confidence.',
        country: 'US',
        isVerified: true,
        rating: 4.7,
        reviewCount: 98,
        followersCount: 540,
        servicesCount: 6,
        categories: ['Cloud', 'DevOps', 'AWS'],
    },
    {
        id: '6',
        companyName: 'SecureShield Cyber',
        slug: 'secureshield-cyber',
        logoUrl: 'https://ui-avatars.com/api/?name=SecureShield&background=ef4444&color=fff&size=200',
        bannerUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
        description: 'Enterprise cybersecurity solutions protecting businesses worldwide.',
        country: 'AU',
        isVerified: true,
        rating: 4.8,
        reviewCount: 145,
        followersCount: 720,
        servicesCount: 9,
        categories: ['Cybersecurity', 'Penetration Testing', 'Compliance'],
    },
];

const categories = ['All', 'Web Development', 'Mobile Apps', 'UI/UX Design', 'AI & ML', 'Cloud', 'Cybersecurity'];
const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'reviews', label: 'Most Reviews' },
    { value: 'followers', label: 'Most Followers' },
    { value: 'newest', label: 'Newest' },
];

export default function VendorsPage() {
    const [vendors, setVendors] = useState<any[]>(mockVendors);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('rating');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        async function loadVendors() {
            try {
                const data = await fetchAllVendors();

                // Combine live vendors with mock ones, ensuring no duplicates by slug
                const liveSlugs = new Set(data?.map(v => v.slug) || []);
                const uniqueMockVendors = mockVendors.filter(v => !liveSlugs.has(v.slug));

                setVendors([...(data || []), ...uniqueMockVendors]);
            } catch (error) {
                console.error('Error fetching vendors:', error);
                // Keep using mockVendors on error
            } finally {
                setIsLoading(false);
            }
        }
        loadVendors();
    }, []);

    const filteredVendors = vendors.filter(vendor => {
        const matchesSearch = vendor.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vendor.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || vendor.categories?.some((c: string) => c.includes(selectedCategory));
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-custom py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Agencies</h1>
                    <p className="text-gray-500">
                        Discover {vendors.length}+ verified agencies ready to bring your ideas to life
                    </p>
                </div>
            </div>

            <div className="container-custom py-8">
                {/* Filters Bar */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search agencies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-12 w-full"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="input w-full lg:w-48"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="input w-full lg:w-48"
                    >
                        {sortOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>

                    {/* View Toggle */}
                    <div className="hidden lg:flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-3 ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            <Grid3X3 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-3 ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Results Count */}
                <p className="text-sm text-gray-500 mb-6">
                    Showing <span className="font-medium text-gray-900">{filteredVendors.length}</span> agencies
                </p>

                {/* Vendors Grid/List */}
                <div className={viewMode === 'grid'
                    ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }>
                    {filteredVendors.map((vendor, index) => (
                        <motion.article
                            key={vendor.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={viewMode === 'list' ? 'card flex gap-6 p-4' : 'card-interactive overflow-hidden'}
                        >
                            {viewMode === 'grid' ? (
                                <>
                                    {/* Banner */}
                                    <div className="relative h-24 overflow-hidden">
                                        <Image
                                            src={vendor.bannerUrl}
                                            alt=""
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 pt-0">
                                        {/* Logo */}
                                        <div className="relative -mt-10 mb-4">
                                            <Image
                                                src={vendor.logoUrl}
                                                alt={vendor.companyName}
                                                width={64}
                                                height={64}
                                                className="rounded-xl border-4 border-white shadow-lg"
                                            />
                                        </div>

                                        {/* Name */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <Link href={`/vendors/${vendor.slug}`}>
                                                <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                                                    {vendor.companyName}
                                                </h3>
                                            </Link>
                                            {vendor.isVerified && <BadgeCheck className="w-5 h-5 text-primary-500" />}
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{vendor.description}</p>

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                <span className="font-medium text-gray-900">{vendor.rating}</span>
                                                <span className="text-gray-400">({vendor.reviewCount})</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-500">
                                                <Users className="w-4 h-4" />
                                                {vendor.followersCount}
                                            </div>
                                        </div>

                                        {/* Categories */}
                                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                                            {vendor.categories.slice(0, 2).map((cat: string) => (
                                                <span key={cat} className="badge-gray text-xs">{cat}</span>
                                            ))}
                                            {vendor.categories.length > 2 && (
                                                <span className="badge-gray text-xs">+{vendor.categories.length - 2}</span>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* List View */}
                                    <Image
                                        src={vendor.logoUrl}
                                        alt={vendor.companyName}
                                        width={80}
                                        height={80}
                                        className="rounded-xl flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Link href={`/vendors/${vendor.slug}`}>
                                                <h3 className="font-semibold text-gray-900 hover:text-primary-600">{vendor.companyName}</h3>
                                            </Link>
                                            {vendor.isVerified && <BadgeCheck className="w-5 h-5 text-primary-500" />}
                                            <span className="text-sm text-gray-400 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {vendor.country}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-3">{vendor.description}</p>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                <span className="font-medium">{vendor.rating}</span>
                                                <span className="text-gray-400">({vendor.reviewCount})</span>
                                            </div>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-gray-500">{vendor.servicesCount} services</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-gray-500">{vendor.followersCount} followers</span>
                                        </div>
                                    </div>
                                    <Link href={`/vendors/${vendor.slug}`} className="btn-primary self-center">
                                        View Profile
                                    </Link>
                                </>
                            )}
                        </motion.article>
                    ))}
                </div>

                {/* Load More */}
                <div className="mt-10 text-center">
                    <button className="btn-outline">Load More Agencies</button>
                </div>
            </div>
        </div>
    );
}
