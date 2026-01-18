'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Mock Sponsored Data
const sponsoredItems = [
    {
        id: 1,
        title: "Cloud Infrastructure Summit 2024",
        sponsor: "AWS",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000",
        description: "Join the world's leading cloud providers for a 3-day virtual summit.",
        cta: "Register Free",
        tag: "Featured Event",
        color: "from-blue-600 to-cyan-500"
    },
    {
        id: 2,
        title: "Next-Gen AI Development Tools",
        sponsor: "NVIDIA",
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000",
        description: "Accelerate your AI workflows with the new Omniverse suite.",
        cta: "Learn More",
        tag: "Product Launch",
        color: "from-green-600 to-emerald-500"
    },
    {
        id: 3,
        title: "Global Freelancer Awards",
        sponsor: "WENWEX",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2000",
        description: "Celebrating the top 1% of talent on our platform. Nominations open.",
        cta: "Nominate Now",
        tag: "Community",
        color: "from-violet-600 to-purple-500"
    }
];

export function SponsoredCarousel() {
    const [activeIndex, setActiveIndex] = useState(0);

    // Auto-rotate
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % sponsoredItems.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const goNext = () => setActiveIndex((prev) => (prev + 1) % sponsoredItems.length);
    const goPrev = () => setActiveIndex((prev) => (prev - 1 + sponsoredItems.length) % sponsoredItems.length);

    return (
        <section className="py-12 bg-white overflow-hidden">
            <div className="container-custom">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-bold tracking-widest uppercase text-gray-500">Sponsored Highlights</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={goPrev}
                            className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={goNext}
                            className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Carousel */}
                <div className="relative h-[400px] md:h-[320px] rounded-[2rem] overflow-hidden bg-gray-100 border border-gray-200 shadow-xl">
                    {sponsoredItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{
                                opacity: index === activeIndex ? 1 : 0,
                                x: index === activeIndex ? 0 : 100
                            }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="absolute inset-0 w-full h-full"
                            style={{ pointerEvents: index === activeIndex ? 'auto' : 'none' }}
                        >
                            {/* Background Image */}
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/60" />

                            {/* Content */}
                            <div className="absolute inset-0 flex items-center p-8 md:p-12">
                                <div className="max-w-xl">
                                    <motion.span
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: index === activeIndex ? 0 : 20, opacity: index === activeIndex ? 1 : 0 }}
                                        transition={{ delay: 0.2 }}
                                        className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${item.color} text-white text-xs font-bold uppercase tracking-wider mb-4 shadow-lg`}
                                    >
                                        {item.tag}
                                    </motion.span>
                                    <motion.h3
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: index === activeIndex ? 0 : 20, opacity: index === activeIndex ? 1 : 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight"
                                    >
                                        {item.title}
                                    </motion.h3>
                                    <motion.p
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: index === activeIndex ? 0 : 20, opacity: index === activeIndex ? 1 : 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-lg text-gray-600 mb-8"
                                    >
                                        {item.description}
                                    </motion.p>
                                    <motion.button
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: index === activeIndex ? 0 : 20, opacity: index === activeIndex ? 1 : 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="group flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
                                    >
                                        {item.cta}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Indicators */}
                    <div className="absolute bottom-6 left-8 md:left-12 flex gap-2">
                        {sponsoredItems.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-8 bg-primary-500' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
