'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap,
    BookOpen,
    FileText,
    FileCode,
    Search,
    Filter,
    Star,
    CheckCircle2,
    Clock,
    ArrowRight,
    Brain,
    Database,
    Cpu,
    Zap,
    Network,
    CircuitBoard,
    X,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { VisualCategorySection } from '@/components/home/VisualCategorySection';
import { AcademicSpotlight } from '@/components/home/AcademicSpotlight';
import { useSearchParams } from 'next/navigation';
import { useCurrencyStore } from '@/lib/currency-store';
import { fetchAcademicServices } from '@/lib/data-service';

// Fallback Mock Data (used when no real services exist)
const fallbackAcademicServices = [
    {
        id: 'a1',
        title: 'Advanced AI/ML Plant Disease Detection System',
        category: 'Major Projects',
        domain: 'AI/ML',
        price: 115, // USD Base
        rating: 4.9,
        reviews: 42,
        delivery: '10 Days',
        vendor: 'TechCraft Academy',
        imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        features: ['Full Source Code', 'Project Report', 'PPT Presentation', 'Viva Support']
    },
    {
        id: 'a2',
        title: 'IOT Based Smart Health Monitoring System',
        category: 'Major Projects',
        domain: 'IOT',
        price: 120, // USD Base
        rating: 4.8,
        reviews: 38,
        delivery: '15 Days',
        vendor: 'Embedded Solutions',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
        features: ['Hardware Schema', 'Firmware Code', 'Mobile App', 'Component List']
    },
    {
        id: 'a3',
        title: 'Python Based Attendance System using Face Recognition',
        category: 'Mini Projects',
        domain: 'CSE',
        price: 49, // USD Base
        rating: 4.7,
        reviews: 85,
        delivery: '3 Days',
        vendor: 'CodeMaster Academy',
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
        features: ['Clean Code', 'Installation Guide', 'Demo Video', 'Quick Support']
    },
    {
        id: 'a4',
        title: 'Predictive Analytics for Customer Churn using Big Data',
        category: 'Major Projects',
        domain: 'Data Science',
        price: 120, // USD Base
        rating: 4.8,
        reviews: 24,
        delivery: '12 Days',
        vendor: 'DataInsight Studio',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        features: ['Dataset Included', 'ML Model Docs', 'Visualizations', 'Source Notebook']
    },
    {
        id: 'a5',
        title: 'Implementation of IEEE Paper on Blockchain Security',
        category: 'Research Paper Writing',
        domain: 'CSE',
        price: 89, // USD Base
        rating: 4.9,
        reviews: 12,
        delivery: '7 Days',
        vendor: 'Scholarly Writers',
        imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
        features: ['Plagiarism Report', 'Formatting', 'Abstract Writing', 'References']
    },
    {
        id: 'a6',
        title: 'Control System Simulation using MATLAB',
        category: 'Mini Projects',
        domain: 'EEE',
        price: 39, // USD Base
        rating: 4.6,
        reviews: 31,
        delivery: '5 Days',
        vendor: 'PowerTech Lab',
        imageUrl: 'https://images.unsplash.com/photo-1523240715639-963c6ada8142?w=800',
        features: ['MATLAB Files', 'Graph Analysis', 'Theory Docs', 'Simulation Results']
    }
];

const domains = [
    { name: 'AI/ML', icon: Brain, color: 'text-violet-600 bg-violet-100' },
    { name: 'Data Science', icon: Database, color: 'text-blue-600 bg-blue-100' },
    { name: 'CSE', icon: Cpu, color: 'text-emerald-600 bg-emerald-100' },
    { name: 'EEE', icon: Zap, color: 'text-amber-600 bg-amber-100' },
    { name: 'ECE', icon: CircuitBoard, color: 'text-rose-600 bg-rose-100' },
    { name: 'IOT', icon: Network, color: 'text-orange-600 bg-orange-100' },
];

const categories = ['All', 'Mini Projects', 'Major Projects', 'Research Paper Writing'];

function AcademicContent() {
    const formatPrice = useCurrencyStore((state) => state.formatPrice);
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category') || 'All';
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [academicServices, setAcademicServices] = useState<any[]>(fallbackAcademicServices);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch real academic services from database
    useEffect(() => {
        async function loadAcademicServices() {
            try {
                const dbServices = await fetchAcademicServices();
                if (dbServices && dbServices.length > 0) {
                    // Use real services from DB
                    setAcademicServices(dbServices);
                } else {
                    // Fallback to mock data if no real services
                    setAcademicServices(fallbackAcademicServices);
                }
            } catch (error) {
                console.error('Error loading academic services:', error);
                setAcademicServices(fallbackAcademicServices);
            } finally {
                setIsLoading(false);
            }
        }
        loadAcademicServices();
    }, []);

    const filteredServices = academicServices.filter(service => {
        const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
        const matchesDomain = !selectedDomain || service.domain === selectedDomain;
        const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesDomain && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Hero Section */}
            <section className="relative pt-12 pb-20 overflow-hidden bg-white border-b border-gray-100">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary-50 rounded-full blur-[120px] opacity-50" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-violet-50 rounded-full blur-[100px] opacity-40" />

                <div className="container-custom relative z-10">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-xs font-black uppercase tracking-widest mb-6"
                        >
                            <GraduationCap className="w-4 h-4" />
                            Academic Excellence
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tighter"
                        >
                            Your Journey to <span className="text-primary-600">Top Grades</span> Starts Here.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-gray-500 leading-relaxed mb-10 max-w-2xl font-medium"
                        >
                            Get professional guidance on Mini Projects, Major Projects, and Research Paper writing from verified academic experts.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 relative"
                        >
                            <div className="relative flex-1 group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search for projects, domains..."
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-100 border-none focus:ring-2 focus:ring-primary-500 text-gray-900 font-bold placeholder-gray-400 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsFilterOpen(!isFilterOpen);
                                }}
                                type="button"
                                className={`px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl ${isFilterOpen
                                    ? 'bg-primary-600 text-white shadow-primary-600/20'
                                    : 'bg-gray-900 text-white shadow-gray-900/10 hover:bg-gray-800'
                                    }`}
                            >
                                <Filter className="w-5 h-5" />
                                {selectedDomain ? `Domain: ${selectedDomain}` : 'All Domains'}
                            </button>
                        </motion.div>
                    </div>
                </div>

                {/* Inline Filter Drawer */}
                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className="container-custom mt-8 pb-8 overflow-hidden"
                        >
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-2xl relative">
                                <button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="absolute top-6 right-6 p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest">Select Domain</h3>
                                        <p className="text-gray-400 text-sm font-medium mt-1">Filter projects by your technical domain</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedDomain(null);
                                            setIsFilterOpen(false);
                                        }}
                                        className="text-xs font-black text-primary-600 hover:underline uppercase tracking-widest"
                                    >
                                        Clear Filter
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                    {domains.map((domain) => (
                                        <button
                                            key={domain.name}
                                            onClick={() => {
                                                setSelectedDomain(selectedDomain === domain.name ? null : domain.name);
                                                setIsFilterOpen(false);
                                            }}
                                            className={`flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all hover:scale-[1.02] ${selectedDomain === domain.name
                                                ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-500/10'
                                                : 'border-gray-50 bg-gray-50/50 hover:border-primary-200'
                                                }`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${domain.color} shadow-sm`}>
                                                <domain.icon className="w-7 h-7" />
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest text-center ${selectedDomain === domain.name ? 'text-primary-700' : 'text-gray-500'
                                                }`}>
                                                {domain.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* Shifted Sections from Home Page */}
            <VisualCategorySection mode="academic" content={{ title: "Academic Disciplines", subtitle: "Explore specialized domains for your academic success." }} />
            <AcademicSpotlight content={{ title: "Featured Projects & Papers", subtitle: "Top-rated academic resources curated for you." }} />

            {/* Category Navigation - RESTORED */}
            <section className="bg-white border-b border-gray-100 sticky top-16 lg:top-20 z-30 overflow-x-auto scrollbar-hide">
                <div className="container-custom">
                    <div className="flex items-center gap-10 py-4">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`text-sm font-black whitespace-nowrap transition-all relative py-2 uppercase tracking-widest ${selectedCategory === cat ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {cat}
                                {selectedCategory === cat && (
                                    <motion.div
                                        layoutId="categoryLine"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="container-custom py-16">
                {/* Header for Results */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">
                            {selectedCategory === 'All' ? 'All Academic Services' : selectedCategory}
                        </h2>
                        <p className="text-gray-400 font-medium mt-1">
                            Showing {filteredServices.length} results {selectedDomain && `in ${selectedDomain}`}
                        </p>
                    </div>
                </div>

                {/* Grid */}
                {filteredServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredServices.map((service, index) => (
                            <motion.article
                                key={service.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="group bg-white rounded-[2.5rem] border border-gray-100 hover:border-primary-200 hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden h-full"
                            >
                                {/* Image Wrapper */}
                                <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
                                    <img
                                        src={service.imageUrl}
                                        alt={service.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                        <div className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-white/20 shadow-lg">
                                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{service.domain}</span>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 right-4 z-10">
                                        <div className="px-3 py-1.5 rounded-xl bg-primary-600 text-white shadow-lg flex items-center gap-1.5">
                                            <Star className="w-3.5 h-3.5 fill-white" />
                                            <span className="text-xs font-black">{service.rating}</span>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                {/* Content */}
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-1 rounded-md">{service.category}</span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{service.vendor}</span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors leading-tight min-h-[3rem]">
                                        {service.title}
                                    </h3>

                                    {/* Features */}
                                    <div className="space-y-2 mb-8">
                                        {service.features.map((feature: string, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-1 text-gray-400 mb-0.5">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-[10px] uppercase font-black tracking-widest">{service.delivery}</span>
                                            </div>
                                            <p className="text-2xl font-black text-gray-900">
                                                {formatPrice(service.price)}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/services/${service.id}`}
                                            className="h-12 px-6 rounded-2xl bg-gray-900 text-white text-xs font-black flex items-center justify-center gap-2 hover:bg-primary-600 transition-all shadow-lg active:scale-95"
                                        >
                                            View Project
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No projects found</h3>
                        <p className="text-gray-400 font-medium max-w-sm mx-auto">
                            We couldn't find any projects matching your current filters. Try adjusting your search or categories.
                        </p>
                        <button
                            onClick={() => {
                                setSelectedCategory('All');
                                setSelectedDomain(null);
                                setSearchQuery('');
                            }}
                            className="mt-8 text-primary-600 font-black text-sm uppercase tracking-widest hover:underline"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}
            </main>

            {/* Newsletter / CTA for Students */}
            <section className="container-custom pb-20">
                <div className="bg-primary-600 rounded-[3.5rem] p-12 lg:p-20 relative overflow-hidden text-center shadow-2xl shadow-primary-600/20">
                    <div className="absolute top-0 right-0 p-20 -translate-y-1/2 translate-x-1/2 bg-white/10 rounded-full blur-3xl" />
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 tracking-tighter">
                            Need Custom Project Help?
                        </h2>
                        <p className="text-primary-100 text-lg font-medium mb-10">
                            Our verified experts are ready to assist you with custom requirements, documentation, and hardware setups.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="w-full sm:w-auto px-10 py-5 rounded-3xl bg-white text-primary-600 font-black text-sm uppercase tracking-widest shadow-xl shadow-black/5 hover:scale-105 transition-all">
                                Post a Requirement
                            </button>
                            <button className="w-full sm:w-auto px-10 py-5 rounded-3xl bg-primary-700 text-white font-black text-sm uppercase tracking-widest hover:bg-primary-800 transition-all flex items-center justify-center gap-3">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function AcademicPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center font-black text-gray-400 uppercase tracking-widest">Loading Academic Hub...</div>}>
            <AcademicContent />
        </Suspense>
    );
}
