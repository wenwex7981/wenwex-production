'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Sparkles, CheckCircle } from 'lucide-react';
import { useCurrencyStore } from '@/lib/currency-store';

const benefits = [
    'Reach thousands of potential clients',
    'Showcase your portfolio & reels',
    'Subscription-based, no hidden fees',
    'Verified agency badge',
    'Dashboard analytics & insights',
    'Priority support for vendors',
];

export function CTASection({ content }: { content?: any }) {
    const title = content?.title || "Grow Your Business with WENWEX";
    const subtitle = content?.subtitle || "Join thousands of verified agencies selling their services to clients worldwide. Get discovered, build your reputation, and grow your revenue.";
    const formatPrice = useCurrencyStore((state) => state.formatPrice);
    return (
        <section className="py-16 lg:py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/5 to-transparent rounded-full" />
            </div>

            <div className="container-custom relative">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 className="w-6 h-6 text-primary-200" />
                            <span className="text-primary-200 font-medium">For Agencies & Freelancers</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                            {title}
                        </h2>

                        <p className="text-lg text-primary-100 mb-8 max-w-xl">
                            {subtitle}
                        </p>

                        {/* Benefits List */}
                        <ul className="grid sm:grid-cols-2 gap-3 mb-8">
                            {benefits.map((benefit) => (
                                <li key={benefit} className="flex items-center gap-2 text-white">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/become-vendor"
                                className="btn bg-white text-primary-700 hover:bg-gray-100 shadow-lg shadow-black/20 px-8"
                            >
                                <Sparkles className="w-5 h-5" />
                                Start Selling Today
                            </Link>
                            <Link
                                href="/pricing"
                                className="btn border-2 border-white/30 text-white hover:bg-white/10 px-8"
                            >
                                View Pricing
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right Content - Stats/Feature Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    Simple, Transparent Pricing
                                </h3>
                                <p className="text-primary-200">
                                    Choose a plan that works for your business
                                </p>
                            </div>

                            {/* Pricing Preview */}
                            <div className="space-y-4">
                                {/* Starter */}
                                <div className="bg-white/10 rounded-2xl p-4 flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-white">Starter</h4>
                                        <p className="text-sm text-primary-200">Up to 5 services</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-white">{formatPrice(19)}<span className="text-sm font-normal text-primary-200">/mo</span></p>
                                    </div>
                                </div>

                                {/* Professional */}
                                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-4 flex items-center justify-between border-2 border-yellow-400/50">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-white">Professional</h4>
                                            <span className="badge bg-yellow-400 text-yellow-900 text-xs">Popular</span>
                                        </div>
                                        <p className="text-sm text-primary-200">Up to 25 services</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-white">{formatPrice(49)}<span className="text-sm font-normal text-primary-200">/mo</span></p>
                                    </div>
                                </div>

                                {/* Enterprise */}
                                <div className="bg-white/10 rounded-2xl p-4 flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-white">Enterprise</h4>
                                        <p className="text-sm text-primary-200">Unlimited everything</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-white">{formatPrice(99)}<span className="text-sm font-normal text-primary-200">/mo</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <Link
                                    href="/pricing"
                                    className="text-primary-200 hover:text-white font-medium inline-flex items-center gap-1"
                                >
                                    Compare all features
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
