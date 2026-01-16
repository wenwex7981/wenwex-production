'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    Globe, Smartphone, Code, Palette, Cloud, Brain, Shield, TestTube, Cog,
    GraduationCap, FileCode, FileText, Edit, BookOpen, Briefcase,
    ArrowRight, Sparkles, MoveRight, Zap, Search, Loader2, Package
} from 'lucide-react';
import { fetchCategories } from '@/lib/data-service';

// Icon mapping for dynamic categories
const iconMap: Record<string, any> = {
    'Globe': Globe,
    'Smartphone': Smartphone,
    'Code': Code,
    'Palette': Palette,
    'Cloud': Cloud,
    'Brain': Brain,
    'Shield': Shield,
    'TestTube': TestTube,
    'Cog': Cog,
    'GraduationCap': GraduationCap,
    'FileCode': FileCode,
    'FileText': FileText,
    'Edit': Edit,
    'BookOpen': BookOpen,
    'Briefcase': Briefcase,
    'Package': Package,
    'Zap': Zap,
};

// Color gradients mapping
const colorGradients = [
    'from-blue-600 to-cyan-500',
    'from-emerald-600 to-teal-500',
    'from-indigo-600 to-violet-500',
    'from-pink-600 to-rose-500',
    'from-cyan-600 to-blue-500',
    'from-orange-600 to-amber-500',
    'from-red-600 to-rose-500',
    'from-indigo-600 to-blue-500',
    'from-orange-600 to-yellow-500',
    'from-violet-600 to-purple-500',
    'from-teal-600 to-emerald-500',
    'from-sky-600 to-blue-500',
];

// Default images for categories
const defaultCategoryImages: Record<string, string> = {
    'Web Development': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
    'Mobile Apps': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800',
    'Custom Software': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
    'UI/UX Design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800',
    'Cloud & DevOps': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    'AI & Data': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    'Cybersecurity': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    'QA & Testing': 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=800',
    'Automation': 'https://images.unsplash.com/photo-1518433278988-2b2a1a2067ed?auto=format&fit=crop&q=80&w=800',
    'Mini Projects': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
    'Major Projects': 'https://images.unsplash.com/photo-1523240715630-974bb1ad2724?auto=format&fit=crop&q=80&w=800',
    'Research Papers': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800',
    'Assignments': 'https://images.unsplash.com/photo-1434030216411-0bb7c3f3dfad?auto=format&fit=crop&q=80&w=800',
    'Exam Preparation': 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&q=80&w=800',
    'Internship Help': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800',
};

// Fallback categories for when database is empty
const fallbackItCategories = [
    { icon: 'Globe', name: 'Web Development', slug: 'web-application-development', description: 'Full-stack web applications, e-commerce, and SaaS platforms', service_count: 245 },
    { icon: 'Smartphone', name: 'Mobile Apps', slug: 'mobile-app-development', description: 'iOS, Android, and cross-platform mobile applications', service_count: 189 },
    { icon: 'Code', name: 'Custom Software', slug: 'custom-software', description: 'Enterprise solutions, APIs, and integrations', service_count: 156 },
    { icon: 'Palette', name: 'UI/UX Design', slug: 'ui-ux-product-design', description: 'User interface design, prototypes, and design systems', service_count: 312 },
    { icon: 'Cloud', name: 'Cloud & DevOps', slug: 'cloud-devops', description: 'AWS, Azure, GCP setup and CI/CD pipelines', service_count: 98 },
    { icon: 'Brain', name: 'AI & Data', slug: 'ai-data-solutions', description: 'Machine learning, data analysis, and AI solutions', service_count: 134 },
    { icon: 'Shield', name: 'Cybersecurity', slug: 'cybersecurity', description: 'Security audits, penetration testing, and compliance', service_count: 67 },
    { icon: 'TestTube', name: 'QA & Testing', slug: 'qa-testing', description: 'Automated testing, manual QA, and performance testing', service_count: 89 },
    { icon: 'Cog', name: 'Automation', slug: 'automation-tools', description: 'Workflow automation, bots, and scripts', service_count: 112 },
];

const fallbackAcademicCategories = [
    { icon: 'FileCode', name: 'Mini Projects', slug: 'mini-projects', description: '2nd and 3rd year academic projects with documentation', service_count: 423 },
    { icon: 'GraduationCap', name: 'Major Projects', slug: 'major-projects', description: 'Final year projects with complete implementation', service_count: 567 },
    { icon: 'FileText', name: 'Research Papers', slug: 'research-papers', description: 'IEEE, Scopus papers with publication support', service_count: 234 },
    { icon: 'Edit', name: 'Assignments', slug: 'assignments', description: 'Programming assignments and coursework help', service_count: 789 },
    { icon: 'BookOpen', name: 'Exam Preparation', slug: 'exam-preparation', description: 'GATE, GRE, and university exam materials', service_count: 156 },
    { icon: 'Briefcase', name: 'Internship Help', slug: 'internship-assistance', description: 'Internship projects and certification assistance', service_count: 198 },
];

export function VisualCategories() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [itCategories, setItCategories] = useState<any[]>([]);
    const [academicCategories, setAcademicCategories] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        async function loadCategories() {
            try {
                const data = await fetchCategories();

                if (data && data.length > 0) {
                    // Split by category type (IT_TECH vs ACADEMIC)
                    const techCats = data.filter((c: any) => c.type === 'IT_TECH' || !c.type);
                    const acadCats = data.filter((c: any) => c.type === 'ACADEMIC');

                    // If we have subcategories, use those as the display items
                    const techSubs = techCats.flatMap((c: any) => c.sub_categories || []);
                    const acadSubs = acadCats.flatMap((c: any) => c.sub_categories || []);

                    // Use subcategories if available, otherwise use main categories
                    setItCategories(techSubs.length > 0 ? techSubs : (techCats.length > 0 ? techCats : fallbackItCategories));
                    setAcademicCategories(acadSubs.length > 0 ? acadSubs : (acadCats.length > 0 ? acadCats : fallbackAcademicCategories));
                } else {
                    // Use fallback data
                    setItCategories(fallbackItCategories);
                    setAcademicCategories(fallbackAcademicCategories);
                }
            } catch (error) {
                console.error('Error loading categories:', error);
                // Use fallback data on error
                setItCategories(fallbackItCategories);
                setAcademicCategories(fallbackAcademicCategories);
            } finally {
                setIsLoading(false);
            }
        }
        loadCategories();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/services?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const renderCategoryCard = (category: any, index: number, isAcademic: boolean = false) => {
        const iconName = category.icon || category.icon_name || 'Package';
        const Icon = iconMap[iconName] || Package;
        const colorGradient = category.color || colorGradients[index % colorGradients.length];
        const imageUrl = category.image_url || defaultCategoryImages[category.name] || 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800';
        const serviceCount = category.service_count || category.count || 0;

        return (
            <motion.div
                key={category.id || category.slug || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: (index * 0.05) % 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="group relative h-[380px] lg:h-[420px] overflow-hidden rounded-[2.5rem] bg-gray-900 border border-white/5"
            >
                <Link href={`/services?category=${encodeURIComponent(category.name)}`} className="block w-full h-full">
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                        <Image
                            src={imageUrl}
                            alt={category.name}
                            fill
                            className="object-cover opacity-60 grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        <div className={`absolute inset-0 bg-gradient-to-br ${colorGradient} opacity-20 group-hover:opacity-40 transition-opacity duration-700`} />
                    </div>

                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <div className="absolute top-8 left-8">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                                <Icon className="w-4 h-4 text-white" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                                    {isAcademic ? 'Academic' : 'Tech Hub'}
                                </span>
                            </div>
                        </div>

                        <div className="relative z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <h4 className="text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight leading-none">
                                {category.name}
                            </h4>
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`h-1 w-1 rounded-full bg-gradient-to-r ${colorGradient}`} />
                                <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">
                                    {serviceCount} Services Available
                                </span>
                            </div>
                            <p className="text-[13px] text-gray-300 font-medium leading-relaxed mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-2">
                                {category.description || 'Professional services in this category'}
                            </p>

                            <div className="flex items-center justify-between border-t border-white/10 pt-4">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                    Explore Now
                                </span>
                                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-white group-hover:text-black transition-all">
                                    <MoveRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            </motion.div>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">Loading Categories...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-hidden pb-10">
            {/* Immersive Header */}
            <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 px-6">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000"
                        alt="Background"
                        fill
                        className="object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-[#050505]" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                </div>

                <div className="container-custom relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary-600/10 border border-primary-500/30 mb-8 backdrop-blur-md"
                    >
                        <Sparkles className="w-4 h-4 text-primary-400" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary-400">
                            Curated Masterclasses
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl lg:text-9xl font-black text-white mb-8 tracking-tighter leading-[0.9]"
                    >
                        Browse <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-300 to-blue-500">
                            Categories.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl lg:text-3xl text-gray-400 font-medium max-w-3xl mx-auto leading-tight mb-12"
                    >
                        Find the perfect service from our world-class collection of IT and Academic domains.
                    </motion.p>

                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        onSubmit={handleSearch}
                        className="relative max-w-2xl mx-auto mb-16 px-4"
                    >
                        <div className="group relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-blue-600 rounded-[2rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
                            <div className="relative flex items-center bg-gray-900/90 border border-white/10 rounded-[2rem] p-2 pr-4 backdrop-blur-xl">
                                <div className="p-4 bg-primary-600/10 rounded-2xl">
                                    <Search className="w-6 h-6 text-primary-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search across all categories..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 font-medium px-6 text-lg"
                                />
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all active:scale-95"
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    </motion.form>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap justify-center gap-4"
                    >
                        <a href="#tech" className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
                            Tech Solutions
                        </a>
                        <a href="#academic" className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
                            Academic Core
                        </a>
                    </motion.div>
                </div>
            </section>

            <div className="container-custom py-24 px-6">
                {/* Tech Section */}
                <section id="tech" className="mb-48 scroll-mt-32">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8 border-b border-white/10 pb-12">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <Zap className="w-6 h-6 text-primary-500 fill-primary-500" />
                                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary-500">Digital Innovation</span>
                            </div>
                            <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter mb-4 leading-none">
                                Tech & IT <br /> <span className="text-gray-600">Services.</span>
                            </h2>
                            <p className="text-xl text-gray-500 font-medium">Professional technology solutions engineered for the modern enterprise.</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                            <div className="text-4xl font-black text-white mb-1">{itCategories.length.toString().padStart(2, '0')}+</div>
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Premium Tech Verticals</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {itCategories.map((cat, i) => renderCategoryCard(cat, i))}
                    </div>
                </section>

                {/* Academic Section */}
                <section id="academic" className="scroll-mt-32">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8 border-b border-white/10 pb-12">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <GraduationCap className="w-6 h-6 text-purple-500 fill-purple-500" />
                                <span className="text-xs font-black uppercase tracking-[0.3em] text-purple-500">Academic Excellence</span>
                            </div>
                            <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter mb-4 leading-none">
                                Scholarly <br /> <span className="text-gray-600">Hub.</span>
                            </h2>
                            <p className="text-xl text-gray-500 font-medium">Quality-driven research assistance and student support programs.</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                            <div className="text-4xl font-black text-white mb-1">{academicCategories.length.toString().padStart(2, '0')}+</div>
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Academic Frameworks</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {academicCategories.map((cat, i) => renderCategoryCard(cat, i, true))}
                    </div>
                </section>
            </div>
        </div>
    );
}
