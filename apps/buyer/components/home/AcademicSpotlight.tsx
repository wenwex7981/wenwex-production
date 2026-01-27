'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { GraduationCap, Star, ArrowRight, BadgeCheck, FileCode, BookOpen } from 'lucide-react';
import { useCurrencyStore } from '@/lib/currency-store';

// Mock data - replace with API call
const academicServices = [
    {
        id: '1',
        title: 'Machine Learning Final Year Project with Documentation',
        slug: 'ml-final-year-project-documentation',
        shortDescription: 'Complete ML project with source code, documentation, PPT, and viva support.',
        price: 100,
        currency: 'USD',
        rating: 4.9,
        reviewCount: 89,
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
        vendor: { name: 'ProjectGenie', isVerified: true },
        category: 'Major Projects',
    },
    {
        id: '2',
        title: 'Web Development Mini Project - E-commerce',
        slug: 'web-dev-mini-project-ecommerce',
        shortDescription: 'Fully functional e-commerce site with admin panel, perfect for 3rd year submission.',
        price: 60,
        currency: 'USD',
        rating: 4.8,
        reviewCount: 156,
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600',
        vendor: { name: 'CodeAcademy Pro', isVerified: true },
        category: 'Mini Projects',
    },
    {
        id: '3',
        title: 'IEEE Research Paper Writing Assistance',
        slug: 'ieee-research-paper-writing',
        shortDescription: 'Professional research paper writing with plagiarism-free content and publication support.',
        price: 110,
        currency: 'USD',
        rating: 4.7,
        reviewCount: 67,
        imageUrl: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=600',
        vendor: { name: 'ResearchHub', isVerified: true },
        category: 'Research Papers',
    },
    {
        id: '4',
        title: 'Python Programming Assignments Help',
        slug: 'python-programming-assignments',
        shortDescription: 'Expert help with Python assignments, data structures, and algorithm problems.',
        price: 18,
        currency: 'USD',
        rating: 4.9,
        reviewCount: 312,
        imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
        vendor: { name: 'CodeMentor', isVerified: true },
        category: 'Assignments',
    },
    {
        id: '5',
        title: 'GATE Exam Preparation - CSE Complete Package',
        slug: 'gate-exam-prep-cse-complete',
        shortDescription: 'Comprehensive GATE CSE preparation with video lectures, notes, and mock tests.',
        price: 36,
        currency: 'USD',
        rating: 4.8,
        reviewCount: 234,
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600',
        vendor: { name: 'ExamGenius', isVerified: true },
        category: 'Exam Prep',
    },
    {
        id: '6',
        title: 'Internship Project - Full Stack Development',
        slug: 'internship-project-full-stack',
        shortDescription: 'Ready-to-submit internship project with professional documentation and certification.',
        price: 96,
        currency: 'USD',
        rating: 4.6,
        reviewCount: 78,
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600',
        vendor: { name: 'InternReady', isVerified: true },
        category: 'Internships',
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export function AcademicSpotlight({ content }: { content?: any }) {
    const title = content?.title || "Academic Services Spotlight";
    const subtitle = content?.subtitle || "Top-rated help for students - projects, papers, and more";
    const formatPrice = useCurrencyStore((state) => state.formatPrice);
    return (
        <section className="py-16 lg:py-24 bg-gradient-to-br from-violet-50 via-white to-purple-50">
            <div className="container-custom">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <GraduationCap className="w-6 h-6 text-violet-600" />
                            <h2 className="section-title mb-0">{title}</h2>
                        </div>
                        <p className="section-subtitle">
                            {subtitle}
                        </p>
                    </div>
                    <Link
                        href="/academic"
                        className="btn-primary bg-violet-600 hover:bg-violet-700 shadow-violet-500/25"
                    >
                        Explore Academic Hub
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Services Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {academicServices.map((service) => (
                        <motion.article
                            key={service.id}
                            variants={itemVariants}
                            className="group h-full bg-white rounded-[32px] border border-gray-100 hover:border-violet-200 hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden"
                        >
                            {/* Image */}
                            <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
                                <img
                                    src={service.imageUrl}
                                    alt={service.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
                                    }}
                                />
                                <div className="absolute top-4 left-4 z-10">
                                    <div className="px-3 py-1.5 rounded-xl bg-violet-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                                        {service.category}
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 flex flex-col">
                                {/* Vendor */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center">
                                        <GraduationCap className="w-3 h-3 text-violet-600" />
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{service.vendor.name}</span>
                                    {service.vendor.isVerified && (
                                        <BadgeCheck className="w-3.5 h-3.5 text-violet-500 fill-violet-50" />
                                    )}
                                </div>

                                {/* Title */}
                                <Link href={`/services/${service.slug}`}>
                                    <h3 className="text-lg font-black text-gray-900 mb-3 group-hover:text-violet-600 transition-colors line-clamp-2 leading-tight">
                                        {service.title}
                                    </h3>
                                </Link>

                                {/* Description */}
                                <p className="text-[13px] text-gray-500 mb-6 line-clamp-2 leading-relaxed">
                                    {service.shortDescription}
                                </p>

                                {/* Rating - Pushed down if text is short */}
                                <div className="mt-auto flex items-center gap-2 mb-6">
                                    <div className="flex items-center gap-1.5 bg-violet-50 px-2 py-1 rounded-lg">
                                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                        <span className="font-bold text-gray-900 text-sm">{service.rating}</span>
                                    </div>
                                    <span className="text-gray-400 text-xs font-medium">({service.reviewCount} reviews)</span>
                                </div>

                                {/* Price Footer */}
                                <div className="pt-5 border-t border-gray-100 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-0.5">Investment</span>
                                        <p className="text-xl font-black text-gray-900">
                                            {formatPrice(service.price)}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/services/${service.slug}`}
                                        className="h-10 px-5 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-all flex items-center justify-center shadow-lg shadow-violet-600/20"
                                    >
                                        Enroll Now
                                    </Link>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </motion.div>

                {/* Quick Links */}
                <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { icon: FileCode, label: 'Mini Projects', href: '/categories/mini-projects' },
                        { icon: GraduationCap, label: 'Major Projects', href: '/categories/major-projects' },
                        { icon: BookOpen, label: 'Research Papers', href: '/categories/research-papers' },
                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50 transition-colors"
                        >
                            <item.icon className="w-5 h-5 text-violet-600" />
                            <span className="font-medium text-gray-700">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
