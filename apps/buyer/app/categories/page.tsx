'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Globe, Smartphone, Code, Palette, Cloud, Brain, Shield, TestTube, Cog,
    GraduationCap, FileCode, FileText, Edit, BookOpen, Briefcase,
    ArrowRight, ChevronRight, Package
} from 'lucide-react';

const itCategories = [
    { icon: Globe, name: 'Web Development', slug: 'web-application-development', description: 'Full-stack web applications, e-commerce, and SaaS platforms', color: 'from-blue-500 to-blue-600', count: 245 },
    { icon: Smartphone, name: 'Mobile Apps', slug: 'mobile-app-development', description: 'iOS, Android, and cross-platform mobile applications', color: 'from-green-500 to-green-600', count: 189 },
    { icon: Code, name: 'Custom Software', slug: 'custom-software', description: 'Enterprise solutions, APIs, and integrations', color: 'from-purple-500 to-purple-600', count: 156 },
    { icon: Palette, name: 'UI/UX Design', slug: 'ui-ux-product-design', description: 'User interface design, prototypes, and design systems', color: 'from-pink-500 to-pink-600', count: 312 },
    { icon: Cloud, name: 'Cloud & DevOps', slug: 'cloud-devops', description: 'AWS, Azure, GCP setup and CI/CD pipelines', color: 'from-cyan-500 to-cyan-600', count: 98 },
    { icon: Brain, name: 'AI & Data', slug: 'ai-data-solutions', description: 'Machine learning, data analysis, and AI solutions', color: 'from-amber-500 to-amber-600', count: 134 },
    { icon: Shield, name: 'Cybersecurity', slug: 'cybersecurity', description: 'Security audits, penetration testing, and compliance', color: 'from-red-500 to-red-600', count: 67 },
    { icon: TestTube, name: 'QA & Testing', slug: 'qa-testing', description: 'Automated testing, manual QA, and performance testing', color: 'from-indigo-500 to-indigo-600', count: 89 },
    { icon: Cog, name: 'Automation', slug: 'automation-tools', description: 'Workflow automation, bots, and scripts', color: 'from-orange-500 to-orange-600', count: 112 },
];

const academicCategories = [
    { icon: FileCode, name: 'Mini Projects', slug: 'mini-projects', description: '2nd and 3rd year academic projects with documentation', color: 'from-emerald-500 to-emerald-600', count: 423 },
    { icon: GraduationCap, name: 'Major Projects', slug: 'major-projects', description: 'Final year projects with complete implementation', color: 'from-violet-500 to-violet-600', count: 567 },
    { icon: FileText, name: 'Research Papers', slug: 'research-papers', description: 'IEEE, Scopus papers with publication support', color: 'from-rose-500 to-rose-600', count: 234 },
    { icon: Edit, name: 'Assignments', slug: 'assignments', description: 'Programming assignments and coursework help', color: 'from-sky-500 to-sky-600', count: 789 },
    { icon: BookOpen, name: 'Exam Preparation', slug: 'exam-preparation', description: 'GATE, GRE, and university exam materials', color: 'from-yellow-500 to-yellow-600', count: 156 },
    { icon: Briefcase, name: 'Internship Help', slug: 'internship-assistance', description: 'Internship projects and certification assistance', color: 'from-teal-500 to-teal-600', count: 198 },
];

import { VisualCategories } from '@/components/categories/VisualCategories';
import { AuthGate } from '@/components/ui/AuthGate';

export default function CategoriesPage() {
    return (
        <AuthGate contentType="categories">
            <VisualCategories />
        </AuthGate>
    );
}

// Previous implementation kept for reference or quick rollback if needed
function OldCategoriesPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
                <div className="container-custom py-16 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        Browse Categories
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-primary-100 max-w-2xl mx-auto"
                    >
                        Find the perfect service from our curated collection of IT and Academic categories
                    </motion.p>
                </div>
            </div>

            <div className="container-custom py-12">
                {/* IT & Tech Services */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                            <Code className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">IT & Tech Services</h2>
                            <p className="text-gray-500">Professional technology solutions for your business</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {itCategories.map((category, index) => (
                            <motion.div
                                key={category.slug}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link href={`/categories/${category.slug}`}>
                                    <div className="card-interactive h-full p-6">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4`}>
                                            <category.icon className="w-7 h-7 text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                                            {category.name}
                                        </h3>
                                        <p className="text-gray-500 text-sm mb-4">{category.description}</p>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400">{category.count} services</span>
                                            <span className="text-primary-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Browse <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Academic Services */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Academic & Student Services</h2>
                            <p className="text-gray-500">Quality assistance for students and researchers</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {academicCategories.map((category, index) => (
                            <motion.div
                                key={category.slug}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.05 }}
                            >
                                <Link href={`/categories/${category.slug}`}>
                                    <div className="card-interactive h-full p-6">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4`}>
                                            <category.icon className="w-7 h-7 text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                                            {category.name}
                                        </h3>
                                        <p className="text-gray-500 text-sm mb-4">{category.description}</p>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400">{category.count} services</span>
                                            <span className="text-primary-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Browse <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
