'use client';

import { motion } from 'framer-motion';
import {
    Search,
    ShoppingCart,
    MessageSquare,
    CheckCircle2,
    Zap,
    ShieldCheck,
    Users,
    Star,
    ArrowRight,
    Briefcase,
    FileText,
    Rocket
} from 'lucide-react';
import Link from 'next/link';

const steps = [
    {
        icon: Search,
        title: "1. Browse Services",
        description: "Explore our curated marketplace of tech and academic services. Use filters to find exactly what you need, from web development to research assistance.",
        color: "text-blue-600",
        bg: "bg-blue-50"
    },
    {
        icon: ShoppingCart,
        title: "2. Productized Purchase",
        description: "Services are listed as fixed-price products. Choose your plan, add to cart, and checkout securely without the hassle of lengthy negotiations.",
        color: "text-purple-600",
        bg: "bg-purple-50"
    },
    {
        icon: MessageSquare,
        title: "3. Direct Communication",
        description: "Once purchased, communicate directly with your assigned agency through our secure portal to share specific project requirements.",
        color: "text-green-600",
        bg: "bg-green-50"
    },
    {
        icon: Rocket,
        title: "4. Fast Delivery",
        description: "Receive your high-quality deliverables within the agreed-upon timeframe. Approve the work and download your files instantly.",
        color: "text-orange-600",
        bg: "bg-orange-50"
    }
];

const features = [
    {
        icon: ShieldCheck,
        title: "Escrow Protection",
        desc: "Your payment is held securely and only released to the vendor once you've approved the work."
    },
    {
        icon: Users,
        title: "Verified Agencies",
        desc: "We manually vet every agency and freelancer on our platform to ensure top-tier quality."
    },
    {
        icon: Zap,
        title: "Time-Saving",
        desc: "No more long bidding processes. Find your expert, see their work, and start immediately."
    }
];

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-24 bg-gray-900 text-white overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-600/10 blur-[120px] rounded-full" />
                    <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-blue-600/10 blur-[100px] rounded-full" />
                </div>

                <div className="container-custom relative z-10 text-center max-w-4xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block py-1.5 px-4 rounded-full bg-primary-500/20 text-primary-400 text-sm font-bold tracking-wider uppercase mb-6 border border-primary-500/30">
                            The WENWEX Method
                        </span>
                        <h1 className="text-4xl md:text-7xl font-black mb-8 leading-tight tracking-tight">
                            Simple. Structured. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-400">Successful.</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Discover how we've transformed professional services into a seamless e-commerce experience. No friction, just results.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/services" className="btn-primary py-4 px-8 text-lg font-bold">
                                Get Started Now
                            </Link>
                            <Link href="/help" className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all border border-white/10">
                                Visit Help Center
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Process Section */}
            <section className="py-24 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">Four Steps to Excellence</h2>
                        <p className="text-lg text-gray-500">We've broken down complex service procurement into four manageable steps.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 hover:shadow-2xl transition-all duration-300 relative group"
                            >
                                <div className={`w-16 h-16 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                                    <step.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-4">{step.title}</h3>
                                <p className="text-gray-500 leading-relaxed">
                                    {step.description}
                                </p>

                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-6 translate-y-[-50%] z-20">
                                        <ArrowRight className="w-8 h-8 text-gray-200" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why WENWEX Section */}
            <section className="py-24 overflow-hidden">
                <div className="container-custom">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-tight">
                                    The Marketplace <br />
                                    Designed for Trust.
                                </h2>
                                <p className="text-xl text-gray-500 mb-10 leading-relaxed">
                                    Unlike traditional freelancer platforms where you hunt for individuals, WENWEX brings you established agencies and research teams with proven track records.
                                </p>

                                <div className="space-y-8">
                                    {features.map((feature, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="shrink-0 w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                                                <feature.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg text-gray-900 mb-1">{feature.title}</h4>
                                                <p className="text-gray-500">{feature.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1522071823991-b9671f9d7f1c?w=800&auto=format&fit=crop&q=60"
                                    alt="Working Team"
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>
                            {/* Decorative background shape */}
                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary-600 rounded-full blur-[80px] -z-10 opacity-30" />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-primary-900 relative overflow-hidden">
                {/* Abstract pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                <div className="container-custom relative z-10 text-center">
                    <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl p-12 md:p-16 rounded-[4rem] border border-white/10 shadow-2xl">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Ready to Experience <br /> the Future?</h2>
                        <p className="text-primary-100 text-lg mb-10 max-w-lg mx-auto">
                            Join thousands of businesses and students who trust WENWEX for their professional and academic needs.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/auth/register" className="bg-white text-primary-900 px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-transform">
                                Join Now
                            </Link>
                            <Link href="/contact" className="bg-primary-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-primary-500 transition-colors border border-primary-500/50">
                                Contact Sales
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
