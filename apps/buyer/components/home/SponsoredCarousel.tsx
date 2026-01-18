'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Fallback Sponsored Data (used when no database content)
const fallbackSponsoredItems = [
    {
        id: 1,
        title: "Cloud Infrastructure Summit 2024",
        sponsor_name: "AWS",
        image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000",
        description: "Join the world's leading cloud providers for a 3-day virtual summit.",
        cta_text: "Register Free",
        cta_link: "#",
        tag: "Featured Event",
        color_from: "#2563eb",
        color_to: "#06b6d4"
    },
    {
        id: 2,
        title: "Next-Gen AI Development Tools",
        sponsor_name: "NVIDIA",
        image_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000",
        description: "Accelerate your AI workflows with the new Omniverse suite.",
        cta_text: "Learn More",
        cta_link: "#",
        tag: "Product Launch",
        color_from: "#059669",
        color_to: "#10b981"
    },
    {
        id: 3,
        title: "Global Freelancer Awards",
        sponsor_name: "WENWEX",
        image_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2000",
        description: "Celebrating the top 1% of talent on our platform. Nominations open.",
        cta_text: "Nominate Now",
        cta_link: "#",
        tag: "Community",
        color_from: "#7c3aed",
        color_to: "#a855f7"
    }
];

export function SponsoredCarousel() {
    const [sponsoredItems, setSponsoredItems] = useState<any[]>(fallbackSponsoredItems);
    const [activeIndex, setActiveIndex] = useState(0);

    // Fetch sponsored items from database
    useEffect(() => {
        async function fetchSponsoredItems() {
            try {
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );

                const { data, error } = await supabase
                    .from('sponsored_carousel_items')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });

                if (!error && data && data.length > 0) {
                    setSponsoredItems(data);
                }
            } catch (error) {
                console.error('Error fetching sponsored items:', error);
            }
        }
        fetchSponsoredItems();
    }, []);

    // Auto-rotate
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % sponsoredItems.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [sponsoredItems.length]);

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
                                src={item.image_url}
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
                                        className="inline-block px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider mb-4 shadow-lg"
                                        style={{ background: `linear-gradient(135deg, ${item.color_from}, ${item.color_to})` }}
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
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: index === activeIndex ? 0 : 20, opacity: index === activeIndex ? 1 : 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <Link
                                            href={item.cta_link || '#'}
                                            className="group inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
                                        >
                                            {item.cta_text}
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </motion.div>
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
