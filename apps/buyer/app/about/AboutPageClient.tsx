'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Target,
    Users,
    Globe2,
    Award,
    Sparkles,
    Shield,
    Zap,
    ArrowRight,
    CheckCircle2,
    Building2,
    TrendingUp,
    Star,
    Rocket,
    Code2,
    Cloud,
    Cpu
} from 'lucide-react';

// Icon mapping for dynamic rendering
const iconMap: Record<string, any> = {
    Users, Building2, Globe2, Star, Shield, Sparkles, Zap, Rocket, Code2, Cloud, Cpu, TrendingUp
};

interface AboutPageClientProps {
    pageData: any;
}

export default function AboutPageClient({ pageData }: AboutPageClientProps) {
    const content = pageData?.content || {};
    const hero = content.hero || {};
    const stats = content.stats || [];
    const mission = content.mission || {};
    const quote = content.quote || {};
    const values = content.values || [];
    const milestones = content.milestones || [];
    const team = content.team || {};
    const cta = content.cta || {};

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-24 lg:py-32">
                {/* Background Effects */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
                </div>

                <div className="container-custom relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-8">
                            <Target className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-semibold text-white/90 uppercase tracking-wider">{hero.badge || 'About WENWEX'}</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                            {hero.title || 'Empowering the Future of'}
                            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {hero.titleHighlight || 'Global Tech Commerce'}
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            {hero.description || 'WENWEX is the premier global marketplace where verified technology agencies offer enterprise solutions as structured products.'}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white border-b border-gray-100">
                <div className="container-custom">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {stats.map((stat: any, index: number) => {
                            const IconComponent = iconMap[stat.icon] || Users;
                            return (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300"
                                >
                                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                        <IconComponent className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="text-3xl lg:text-4xl font-black text-gray-900 mb-1">{stat.value}</div>
                                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 lg:py-28 bg-white">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 text-blue-600 text-sm font-bold uppercase tracking-widest mb-4">
                                <Award className="w-4 h-4" />
                                {mission.badge || 'Our Mission'}
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-6">
                                {mission.title || 'Democratizing Access to World-Class Technology Solutions'}
                            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                {mission.description1 || 'We believe every business deserves access to enterprise-grade technology solutions.'}
                            </p>
                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                {mission.description2 || 'From Fortune 500 enterprises to ambitious startups, we curate the best technology professionals.'}
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                {(mission.services || ['Enterprise Web Development', 'Mobile App Solutions', 'AI & Machine Learning', 'Cloud Infrastructure', 'Digital Transformation', 'Custom Software']).map((service: string) => (
                                    <div key={service} className="flex items-center gap-2 text-gray-700">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        <span className="font-medium text-sm">{service}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                                <div className="aspect-[4/3] bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 lg:p-12 flex flex-col justify-center">
                                    <div className="text-white/80 text-sm font-bold uppercase tracking-widest mb-4">Why Choose Us?</div>
                                    <div className="text-white text-2xl lg:text-3xl font-black leading-tight mb-6">
                                        {quote.text || '"We don\'t just connect businesses with vendors – we curate global tech excellence."'}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">{quote.author || 'WENWEX Leadership'}</div>
                                            <div className="text-white/70 text-sm">{quote.role || 'Pioneering the Future of Tech Commerce'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Cards */}
                            <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 hidden lg:block">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">Enterprise Growth</div>
                                        <div className="text-xs text-gray-500">150% YoY Growth</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 hidden lg:block">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <Globe2 className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">Global Presence</div>
                                        <div className="text-xs text-gray-500">25+ Countries</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 lg:py-28 bg-gray-50">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 text-blue-600 text-sm font-bold uppercase tracking-widest mb-4">
                            <Sparkles className="w-4 h-4" />
                            Our Values
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
                            Built on Enterprise-Grade Foundations
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Our core values guide every decision and power global technology partnerships.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value: any, index: number) => {
                            const IconComponent = iconMap[value.icon] || Shield;
                            return (
                                <motion.div
                                    key={value.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 group"
                                >
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.gradient || 'from-blue-500 to-cyan-500'} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <IconComponent className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="py-20 lg:py-28 bg-white">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
                            Our Journey
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            From vision to global platform – building the future of technology commerce.
                        </p>
                    </motion.div>

                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-full hidden lg:block" />

                        <div className="space-y-8 lg:space-y-0">
                            {milestones.map((milestone: any, index: number) => (
                                <motion.div
                                    key={milestone.year + milestone.title}
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`relative flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} flex-col lg:gap-8`}
                                >
                                    <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:text-right lg:pr-16' : 'lg:text-left lg:pl-16'} text-center mb-4 lg:mb-0`}>
                                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg inline-block">
                                            <div className="text-2xl font-black text-blue-600 mb-2">{milestone.year}</div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                                            <p className="text-gray-600">{milestone.description}</p>
                                        </div>
                                    </div>

                                    {/* Timeline Dot */}
                                    <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-4 border-blue-500 rounded-full shadow-lg hidden lg:block" />

                                    <div className="lg:w-1/2" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 lg:py-28 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 text-blue-400 text-sm font-bold uppercase tracking-widest mb-4">
                                <Users className="w-4 h-4" />
                                {team.badge || 'Our Team'}
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-black mb-6">
                                {team.title || 'World-Class Professionals Building'} <span className="text-blue-400">{team.titleHighlight || 'Global Solutions'}</span>
                            </h2>
                            <p className="text-gray-300 text-lg leading-relaxed mb-8">
                                {team.description || 'Behind WENWEX is a diverse team of technology veterans and enterprise architects committed to delivering excellence.'}
                            </p>

                            <div className="space-y-4 mb-8">
                                {(team.highlights || ['Enterprise Technology Experts', 'Global Support Team 24/7', 'Quality Assurance Specialists', 'Industry Veterans & Advisors']).map((highlight: string) => (
                                    <div key={highlight} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <CheckCircle2 className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <span className="text-gray-200 font-medium">{highlight}</span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all duration-300 group"
                            >
                                Get In Touch
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 text-2xl font-black">
                                            PG
                                        </div>
                                        <div className="font-bold text-lg">{team.company || 'Project Genie'}</div>
                                        <div className="text-gray-400 text-sm">{team.companyRole || 'Enterprise Technology'}</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-white/10">
                                        <div className="text-4xl font-black text-white mb-2">24/7</div>
                                        <div className="text-gray-300 text-sm">Global Support</div>
                                    </div>
                                </div>
                                <div className="space-y-4 mt-8">
                                    <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-white/10">
                                        <div className="text-4xl font-black text-white mb-2">100%</div>
                                        <div className="text-gray-300 text-sm">Enterprise Commitment</div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                        <Globe2 className="w-10 h-10 text-blue-400 mb-4" />
                                        <div className="font-bold text-lg">Global Reach</div>
                                        <div className="text-gray-400 text-sm">25+ Countries</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 lg:py-24 bg-white">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-6">
                            {cta.title || 'Ready to Transform Your Business?'}
                        </h2>
                        <p className="text-gray-600 text-lg mb-8">
                            {cta.description || 'Join thousands of forward-thinking companies leveraging WENWEX for their technology needs.'}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={cta.primaryLink || '/services'}
                                className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all duration-300"
                            >
                                {cta.primaryBtn || 'Explore Services'}
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href={cta.secondaryLink || '/contact'}
                                className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-4 rounded-xl font-bold transition-all duration-300"
                            >
                                {cta.secondaryBtn || 'Contact Us'}
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
