'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    Search, Filter, Star, Clock, BadgeCheck, ArrowUpDown,
    Grid3X3, List, X, ChevronDown, SlidersHorizontal, Loader2
} from 'lucide-react';
import { useCurrencyStore } from '@/lib/currency-store';
import { fetchAllServices } from '@/lib/data-service';
import { AuthGate } from '@/components/ui/AuthGate';

// Mock data - used as fallback when no database services
const mockServices = [
    {
        id: '1',
        title: 'Full-Stack E-commerce Platform Development',
        slug: 'full-stack-ecommerce-platform',
        shortDescription: 'Custom e-commerce solutions with payment integration, admin panel, and mobile-responsive design.',
        price: 30,
        currency: 'USD',
        deliveryDays: 14,
        rating: 4.9,
        reviewCount: 127,
        imageUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=800',
        vendor: { name: 'TechCraft Studios', slug: 'techcraft-studios', isVerified: true },
        category: 'Web Development',
    },
    {
        id: '2',
        title: 'Cross-Platform Mobile App with React Native',
        slug: 'cross-platform-mobile-app-react-native',
        shortDescription: 'Build iOS and Android apps from a single codebase with native performance.',
        price: 42,
        currency: 'USD',
        deliveryDays: 21,
        rating: 4.8,
        reviewCount: 89,
        imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800',
        vendor: { name: 'AppForge Inc', slug: 'appforge-inc', isVerified: true },
        category: 'Mobile Apps',
    },
    {
        id: '3',
        title: 'AI-Powered Chatbot Development',
        slug: 'ai-powered-chatbot-development',
        shortDescription: 'Custom AI chatbots with NLP, integrations, and 24/7 customer support capabilities.',
        price: 24,
        currency: 'USD',
        deliveryDays: 10,
        rating: 4.7,
        reviewCount: 64,
        imageUrl: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&q=80&w=800',
        vendor: { name: 'AI Solutions Lab', slug: 'ai-solutions-lab', isVerified: true },
        category: 'AI & Data',
    },
    {
        id: '4',
        title: 'Premium UI/UX Design Package',
        slug: 'premium-ui-ux-design-package',
        shortDescription: 'Complete design system with wireframes, prototypes, and developer handoff.',
        price: 18,
        currency: 'USD',
        deliveryDays: 7,
        rating: 5.0,
        reviewCount: 156,
        imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800',
        vendor: { name: 'PixelPerfect Design', slug: 'pixelperfect-design', isVerified: true },
        category: 'UI/UX Design',
    },
    {
        id: '5',
        title: 'AWS Cloud Infrastructure Setup',
        slug: 'aws-cloud-infrastructure-setup',
        shortDescription: 'Complete AWS setup with CI/CD, monitoring, auto-scaling, and security best practices.',
        price: 26,
        currency: 'USD',
        deliveryDays: 5,
        rating: 4.8,
        reviewCount: 67,
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
        vendor: { name: 'CloudNine DevOps', slug: 'cloudnine-devops', isVerified: true },
        category: 'Cloud & DevOps',
    },
    {
        id: '6',
        title: 'Security Audit & Penetration Testing',
        slug: 'security-audit-penetration-testing',
        shortDescription: 'Comprehensive security assessment with detailed vulnerability report and remediation guide.',
        price: 60,
        currency: 'USD',
        deliveryDays: 14,
        rating: 4.9,
        reviewCount: 56,
        imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
        vendor: { name: 'SecureShield Cyber', slug: 'secureshield-cyber', isVerified: true },
        category: 'Cybersecurity',
    },
    {
        id: '7',
        title: 'Enterprise ERP System Development',
        slug: 'enterprise-erp-system',
        shortDescription: 'Scalable ERP solutions for resource planning, inventory, and HR management.',
        price: 102,
        currency: 'USD',
        deliveryDays: 45,
        rating: 4.9,
        reviewCount: 42,
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
        vendor: { name: 'TechCraft Studios', slug: 'techcraft-studios', isVerified: true },
        category: 'Web Development',
    },
    {
        id: '8',
        title: 'Cybersecurity Threat Detection',
        slug: 'cybersecurity-threat-detection',
        shortDescription: 'Real-time monitoring and threat intelligence set up for your enterprise network.',
        price: 45,
        currency: 'USD',
        deliveryDays: 10,
        rating: 4.8,
        reviewCount: 29,
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
        vendor: { name: 'SecureShield Cyber', slug: 'secureshield-cyber', isVerified: true },
        category: 'Cybersecurity',
    },
    {
        id: '9',
        title: 'Data Warehouse & Analytics',
        slug: 'data-warehouse-analytics',
        shortDescription: 'Modern data stack with Snowflake/BigQuery and BI dashboards.',
        price: 66,
        currency: 'USD',
        deliveryDays: 30,
        rating: 4.7,
        reviewCount: 38,
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
        vendor: { name: 'AI Solutions Lab', slug: 'ai-solutions-lab', isVerified: true },
        category: 'AI & Data',
    },
    {
        id: '10',
        title: 'Quality Assurance & Automated Testing',
        slug: 'qa-automated-testing',
        shortDescription: 'Comprehensive test automation using Playwright, Selenium, and Jest.',
        price: 15,
        currency: 'USD',
        deliveryDays: 10,
        rating: 4.9,
        reviewCount: 74,
        imageUrl: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&q=80&w=800',
        vendor: { name: 'Elite Testing', slug: 'elite-testing', isVerified: true },
        category: 'QA & Testing',
    },
    {
        id: '11',
        title: 'Social Media App Development',
        slug: 'social-media-app',
        shortDescription: 'Next-gen social platform with real-time chat, feeds, and multimedia support.',
        price: 54,
        currency: 'USD',
        deliveryDays: 40,
        rating: 4.8,
        reviewCount: 51,
        imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800',
        vendor: { name: 'AppForge Inc', slug: 'appforge-inc', isVerified: true },
        category: 'Mobile Apps',
    },
    {
        id: '12',
        title: 'Custom Font & Logo Design',
        slug: 'custom-font-logo-design',
        shortDescription: 'Exclusive typography and branding for unique corporate identity.',
        price: 15,
        currency: 'USD',
        deliveryDays: 5,
        rating: 5.0,
        reviewCount: 204,
        imageUrl: 'https://images.unsplash.com/photo-1572044162444-ad60f128bde2?auto=format&fit=crop&q=80&w=800',
        vendor: { name: 'PixelPerfect Design', slug: 'pixelperfect-design', isVerified: true },
        category: 'UI/UX Design',
    },
];

const categories = [
    'All Categories',
    'Web Development',
    'Mobile Apps',
    'UI/UX Design',
    'AI & Data',
    'Cloud & DevOps',
    'Cybersecurity',
    'QA & Testing',
];

const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest' },
];

export default function ServicesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>}>
            <ServicesContent />
        </Suspense>
    );
}

function ServicesContent() {
    const formatPrice = useCurrencyStore((state) => state.formatPrice);
    const currentCurrency = useCurrencyStore((state) => state.currentCurrency);
    const [services, setServices] = useState<any[]>(mockServices);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const searchParams = useSearchParams();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All Categories');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [sortBy, setSortBy] = useState('recommended');
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });

    useEffect(() => {
        setSearchQuery(searchParams.get('q') || '');
    }, [searchParams]);

    // Update URL when searchQuery or selectedCategory changes (with debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentQ = searchParams.get('q') || '';
            const currentCat = searchParams.get('category') || 'All Categories';

            if (searchQuery !== currentQ || selectedCategory !== currentCat) {
                const params = new URLSearchParams(searchParams.toString());

                if (searchQuery) {
                    params.set('q', searchQuery);
                } else {
                    params.delete('q');
                }

                if (selectedCategory && selectedCategory !== 'All Categories') {
                    params.set('category', selectedCategory);
                } else {
                    params.delete('category');
                }

                router.push(`/services?${params.toString()}`, { scroll: false });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, selectedCategory, router, searchParams]);

    useEffect(() => {
        async function loadServices() {
            try {
                const dbServices = await fetchAllServices();
                // Merge database services with mock services (db services first)
                if (dbServices && dbServices.length > 0) {
                    // Filter out any mock services that might have same slug as db services
                    const dbSlugs = new Set(dbServices.map(s => s.slug));
                    const filteredMock = mockServices.filter(m => !dbSlugs.has(m.slug));
                    setServices([...dbServices, ...filteredMock]);
                }
            } catch (error) {
                console.error('Error fetching services:', error);
                // Keep mock services on error
            } finally {
                setIsLoading(false);
            }
        }
        loadServices();
    }, []);

    // Filter services based on search, category, and price range
    const filteredServices = services.filter(service => {
        const matchesSearch = !searchQuery ||
            service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'All Categories' ||
            service.category === selectedCategory;

        // Price filtering
        // Assuming service.price is in USD, we convert it to current currency for comparison with filters
        // Or if the filter inputs are assumed to be in the current currency
        const priceInCurrency = service.price * currentCurrency.rate;
        const matchesPrice = priceInCurrency >= priceRange.min && priceInCurrency <= priceRange.max;

        return matchesSearch && matchesCategory && matchesPrice;
    });

    return (
        <AuthGate contentType="services">
            <div className="min-h-screen bg-gray-50">
                {/* Page Header */}
                <div className="bg-white border-b border-gray-100">
                    <div className="container-custom py-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Services</h1>
                        <p className="text-gray-500">
                            Discover {services.length}+ premium services from verified agencies
                        </p>
                    </div>
                </div>

                <div className="container-custom py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Toolbar */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                {/* Search */}
                                <div className="relative w-full sm:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search services..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="input pl-10"
                                    />
                                </div>

                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    {/* Mobile Filter Button */}
                                    <button
                                        onClick={() => setShowFilters(true)}
                                        className="btn-outline lg:hidden"
                                    >
                                        <SlidersHorizontal className="w-4 h-4" />
                                        Filters
                                    </button>

                                    {/* Sort */}
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="input w-auto pr-10"
                                    >
                                        {sortOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>

                                    {/* View Mode */}
                                    <div className="hidden sm:flex items-center border border-gray-200 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2.5 ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:bg-gray-50'}`}
                                        >
                                            <Grid3X3 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2.5 ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:bg-gray-50'}`}
                                        >
                                            <List className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Results Count */}
                            <p className="text-sm text-gray-500 mb-6">
                                Showing <span className="font-medium text-gray-900">{filteredServices.length}</span> results
                            </p>

                            {/* Services Grid/List */}
                            <div className={viewMode === 'grid'
                                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                                : 'space-y-4'
                            }>
                                {filteredServices.map((service, index) => (
                                    <motion.article
                                        key={service.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={viewMode === 'list' ? 'card-interactive flex flex-col md:flex-row gap-6 p-4' : 'card-interactive overflow-hidden flex flex-col h-full'}
                                    >
                                        {/* Image */}
                                        <Link
                                            href={`/services/${service.slug}`}
                                            className={`${viewMode === 'list' ? 'relative w-full md:w-64 h-48 md:h-40 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-50' : 'relative aspect-[16/10] overflow-hidden bg-gray-50'} block`}
                                        >
                                            <div className="absolute inset-0">
                                                <img
                                                    src={service.imageUrl}
                                                    alt={service.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=800`;
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                                            </div>
                                            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                                                <div className="px-2.5 py-1.5 rounded-lg bg-white/95 backdrop-blur-md shadow-sm border border-white/20">
                                                    <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest whitespace-nowrap">
                                                        {service.category}
                                                    </span>
                                                </div>
                                                {service.serviceType && (
                                                    <div className={`px-2.5 py-1.5 rounded-lg backdrop-blur-md shadow-sm border border-white/20 ${service.serviceType === 'ACADEMIC'
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-primary-600 text-white'
                                                        }`}>
                                                        <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                                                            {service.serviceType}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>

                                        {/* Content */}
                                        <div className={`flex-1 flex flex-col ${viewMode === 'list' ? 'py-2' : 'p-5'}`}>
                                            {/* Vendor */}
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                                <span>{service.vendor.name}</span>
                                                {service.vendor.isVerified && (
                                                    <BadgeCheck className="w-4 h-4 text-primary-500 fill-primary-500/10" />
                                                )}
                                            </div>

                                            {/* Title */}
                                            <Link href={`/services/${service.slug}`}>
                                                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors leading-tight">
                                                    {service.title}
                                                </h3>
                                            </Link>

                                            {/* Description (list view only) */}
                                            {viewMode === 'list' && (
                                                <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1 leading-relaxed">
                                                    {service.shortDescription}
                                                </p>
                                            )}

                                            {/* Rating & Delivery */}
                                            <div className="flex items-center gap-4 text-sm mb-4">
                                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                    <span className="font-bold text-yellow-700">{service.rating}</span>
                                                    <span className="text-gray-400">({service.reviewCount})</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-500 font-medium">
                                                    <Clock className="w-4 h-4 text-primary-400" />
                                                    <span>{service.deliveryDays}d Delivery</span>
                                                </div>
                                            </div>

                                            {/* Price Section */}
                                            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                                <div>
                                                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-0.5">Starting From</span>
                                                    <p className="text-xl font-black text-gray-900 tracking-tight">
                                                        {formatPrice(service.price)}
                                                    </p>
                                                </div>
                                                <Link
                                                    href={`/services/${service.slug}`}
                                                    className="h-10 px-5 rounded-xl bg-gray-900 text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-primary-600 transition-all active:scale-95 shadow-lg shadow-gray-900/10"
                                                >
                                                    View details
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.article>
                                ))}
                            </div>

                            {/* Load More */}
                            <div className="mt-10 text-center">
                                <button className="btn-outline">
                                    Load More Services
                                </button>
                            </div>
                        </div>

                        {/* Sidebar Filters - Desktop (Now on Right) */}
                        <aside className="hidden lg:block w-64 flex-shrink-0">
                            <div className="card sticky top-24">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Filter className="w-5 h-5" />
                                    Filters
                                </h3>

                                {/* Category Filter */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Category</h4>
                                    <div className="space-y-2">
                                        {categories.map((cat) => (
                                            <label key={cat} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    checked={selectedCategory === cat}
                                                    onChange={() => setSelectedCategory(cat)}
                                                    className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                                                />
                                                <span className="text-sm text-gray-600">{cat}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={priceRange.min || ''}
                                            onChange={(e) => setPriceRange(p => ({ ...p, min: Number(e.target.value) }))}
                                            className="input text-sm py-2"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={priceRange.max || ''}
                                            onChange={(e) => setPriceRange(p => ({ ...p, max: Number(e.target.value) }))}
                                            className="input text-sm py-2"
                                        />
                                    </div>
                                </div>

                                {/* Rating Filter */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Minimum Rating</h4>
                                    <div className="space-y-2">
                                        {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                                            <label key={rating} className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="rating" className="w-4 h-4 text-primary-500 focus:ring-primary-500" />
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                    <span className="text-sm text-gray-600">{rating}+</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button className="btn-primary w-full">Apply Filters</button>
                            </div>
                        </aside>
                    </div>
                </div>

                {/* Mobile Filters Modal */}
                {showFilters && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-semibold text-gray-900">Filters</h3>
                                <button onClick={() => setShowFilters(false)}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            {/* Same filter content as desktop */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Category</h4>
                                <div className="space-y-2">
                                    {categories.map((cat) => (
                                        <label key={cat} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="category-mobile"
                                                checked={selectedCategory === cat}
                                                onChange={() => setSelectedCategory(cat)}
                                                className="w-4 h-4 text-primary-500"
                                            />
                                            <span className="text-sm text-gray-600">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button className="btn-primary w-full" onClick={() => setShowFilters(false)}>
                                Apply Filters
                            </button>
                        </motion.div>
                    </div>
                )}
            </div>
        </AuthGate>
    );
}
