'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    Star, Clock, BadgeCheck, ArrowLeft, Loader2,
    Filter, SlidersHorizontal, Grid3X3, List, ChevronRight, Search
} from 'lucide-react';
import { useCurrencyStore } from '@/lib/currency-store';
import { getSupabaseClient } from '@/lib/supabase';

const supabase = getSupabaseClient();

export default function CategoryDetailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#050505]"><Loader2 className="w-10 h-10 animate-spin text-primary-500" /></div>}>
            <CategoryContent />
        </Suspense>
    );
}

function CategoryContent() {
    const params = useParams();
    const slug = params.slug as string;
    const formatPrice = useCurrencyStore((state) => state.formatPrice);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [services, setServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        async function loadData() {
            try {
                // 1. Try to fetch from SubCategories first (since that's what we list now)
                const { data: subData, error: subError } = await supabase
                    .from('sub_categories')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                let categoryId = '';
                let subCategoryId = '';

                if (subData) {
                    setTitle(subData.name);
                    setDescription(subData.description || '');
                    setImageUrl(subData.image_url || '');
                    subCategoryId = subData.id;
                } else {
                    // 2. Try falling back to Main Categories
                    const { data: catData } = await supabase
                        .from('categories')
                        .select('*')
                        .eq('slug', slug)
                        .single();

                    if (catData) {
                        setTitle(catData.name);
                        setDescription(catData.description || '');
                        setImageUrl(catData.image_url || '');
                        categoryId = catData.id;
                    } else {
                        throw new Error('Category not found');
                    }
                }

                // 3. Fetch Services
                let query = supabase
                    .from('services')
                    .select('*, vendors(company_name, slug, logo_url, is_verified)')
                    .eq('status', 'APPROVED');

                if (subCategoryId) {
                    query = query.eq('sub_category_id', subCategoryId);
                } else if (categoryId) {
                    query = query.eq('category_id', categoryId);
                }

                const { data: servicesData, error: sError } = await query;

                if (sError) throw sError;

                setServices(servicesData.map(s => ({
                    ...s,
                    vendor: s.vendors ? {
                        name: s.vendors.company_name,
                        slug: s.vendors.slug,
                        is_verified: s.vendors.is_verified
                    } : { name: 'Verified Vendor', slug: '', is_verified: true }
                })));

            } catch (error) {
                console.error('Error loading category data:', error);
            } finally {
                setIsLoading(false);
            }
        }
        if (slug) loadData();
    }, [slug]);

    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Redirect to services with both the category name and the search query
            const params = new URLSearchParams();
            params.set('q', searchQuery.trim());
            params.set('category', title);
            router.push(`/services?${params.toString()}`);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505]">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500 mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">Assembling Services...</p>
        </div>
    );

    if (!title) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white">
            <h1 className="text-4xl font-black mb-4">Category Not Found</h1>
            <Link href="/categories" className="text-primary-500 font-bold hover:underline">Return to Categories</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Immersive Header */}
            <div className="relative pt-32 pb-20 px-6 border-b border-white/5 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src={imageUrl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000'}
                        alt={title}
                        fill
                        className="object-cover opacity-20 grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
                </div>

                <div className="container-custom relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                        <div className="flex-1">
                            <Link href="/categories" className="inline-flex items-center gap-2 text-primary-400 font-bold text-xs uppercase tracking-widest mb-8 hover:text-white transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Categories
                            </Link>

                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-6xl lg:text-8xl font-black mb-6 tracking-tighter leading-none"
                            >
                                {title}.
                            </motion.h1>
                            <p className="text-xl text-gray-400 max-w-2xl font-medium leading-relaxed">
                                {description || `Explore specialized ${title} solutions from our global network of verified agencies.`}
                            </p>
                        </div>

                        <div className="w-full lg:w-1/3">
                            <form onSubmit={handleSearch} className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
                                <div className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
                                    <div className="pl-4">
                                        <Search className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={`Search in ${title}...`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-600 font-medium p-4 text-sm"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-white text-black px-6 py-4 font-black text-[10px] uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all"
                                    >
                                        Go
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Body */}
            <div className="container-custom py-16 px-6">
                <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">
                            Showing {services.length} Solutions
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-white/5 rounded-2xl p-1 border border-white/10">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}
                            >
                                <Grid3X3 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {services.length === 0 ? (
                    <div className="py-32 text-center border border-dashed border-white/10 rounded-[3rem] bg-white/[0.02]">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Loader2 className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">No Services Yet.</h3>
                        <p className="text-gray-500 font-medium">Be the first to list a service in this category.</p>
                        <Link href="/vendors" className="mt-8 inline-block px-8 py-4 bg-primary-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-500 transition-all">
                            Partner With Us
                        </Link>
                    </div>
                ) : (
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'
                        : 'space-y-6'
                    }>
                        {services.map((service, index) => (
                            <motion.article
                                key={service.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`group bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-white/20 transition-all duration-500 ${viewMode === 'list' ? 'flex flex-col md:flex-row' : ''}`}
                            >
                                {/* Image Section */}
                                <Link
                                    href={`/services/${service.slug}`}
                                    className={`block relative overflow-hidden bg-gray-900 ${viewMode === 'list' ? 'w-full md:w-[400px] h-[250px]' : 'aspect-[16/10]'}`}
                                >
                                    <img
                                        src={service.main_image_url || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=800'}
                                        alt={service.title}
                                        className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                                    <div className="absolute top-6 right-6">
                                        <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
                                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{service.rating || '5.0'} ★</span>
                                        </div>
                                    </div>
                                </Link>

                                {/* Details Section */}
                                <div className="p-10 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500">{service.vendor?.name}</span>
                                        {service.vendor?.is_verified && <BadgeCheck className="w-4 h-4 text-primary-500 fill-primary-500/10" />}
                                    </div>

                                    <Link href={`/services/${service.slug}`}>
                                        <h3 className="text-2xl font-black text-white hover:text-primary-400 transition-colors mb-4 leading-tight line-clamp-2">
                                            {service.title}
                                        </h3>
                                    </Link>

                                    <p className="text-gray-500 text-sm font-medium line-clamp-2 mb-8 leading-relaxed">
                                        {service.description}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between pt-8 border-t border-white/5">
                                        <div>
                                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest block mb-1">Starting from</span>
                                            <span className="text-2xl font-black text-white tracking-tight">{formatPrice(service.price)}</span>
                                        </div>
                                        <Link
                                            href={`/services/${service.slug}`}
                                            className="px-6 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all group-hover:translate-x-1"
                                        >
                                            View Solution
                                        </Link>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
