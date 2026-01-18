'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Star, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Fallback slides (used if no database content)
const fallbackSlides = [
    {
        id: 1,
        title: "Enterprise Solutions for Global Growth",
        subtitle: "Scale your business with our premium network of verified technology partners.",
        image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000",
        badge_text: "Enterprise",
        cta_text: "Get Started",
        cta_link: "/services"
    },
    {
        id: 2,
        title: "Advanced AI & Data Analytics",
        subtitle: "Unlock the power of your data with industry-leading AI models and experts.",
        image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000",
        badge_text: "Innovation",
        cta_text: "Explore",
        cta_link: "/services"
    },
    {
        id: 3,
        title: "Elite UI/UX Design Standards",
        subtitle: "Crafting digital experiences that captivate, convert, and command attention.",
        image_url: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=2000",
        badge_text: "Creative",
        cta_text: "View Portfolio",
        cta_link: "/services"
    }
];

export function PromoCarousel() {
    const [slides, setSlides] = useState<any[]>(fallbackSlides);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    // Fetch carousel slides from database
    useEffect(() => {
        async function fetchSlides() {
            try {
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );

                const { data, error } = await supabase
                    .from('promo_carousel_slides')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });

                if (!error && data && data.length > 0) {
                    setSlides(data);
                }
            } catch (error) {
                console.error('Error fetching promo slides:', error);
            }
        }
        fetchSlides();
    }, []);

    const slideNext = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const slidePrev = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }, [slides.length]);

    useEffect(() => {
        const timer = setInterval(slideNext, 6000);
        return () => clearInterval(timer);
    }, [slideNext]);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    };

    const currentSlide = slides[currentIndex] || fallbackSlides[0];

    return (
        <section className="py-10 bg-white overflow-hidden">
            <div className="container-custom">
                <div className="relative h-[450px] lg:h-[550px] w-full rounded-[40px] overflow-hidden group shadow-2xl bg-gray-900">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={(e, { offset, velocity }) => {
                                const swipe = Math.abs(offset.x) > 50;
                                if (swipe) {
                                    if (offset.x > 0) slidePrev();
                                    else slideNext();
                                }
                            }}
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            className="absolute inset-0 cursor-grab active:cursor-grabbing"
                        >
                            <div className="absolute inset-0">
                                <img
                                    src={currentSlide.image_url || currentSlide.image}
                                    alt={currentSlide.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
                            </div>

                            <div className="absolute inset-0 flex flex-col justify-center px-10 lg:px-20">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex items-center gap-3 mb-6"
                                >
                                    {currentSlide.badge_text && (
                                        <span className="px-4 py-1.5 bg-primary-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-primary-500/30">
                                            {currentSlide.badge_text}
                                        </span>
                                    )}
                                    {currentSlide.description && (
                                        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                            <span className="text-white text-[10px] font-bold uppercase tracking-wider">{currentSlide.description}</span>
                                        </div>
                                    )}
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-4xl lg:text-7xl font-black text-white leading-[1.1] mb-6 max-w-3xl tracking-tight"
                                >
                                    {currentSlide.title}
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-lg lg:text-xl text-white/70 max-w-xl mb-10 leading-relaxed font-medium"
                                >
                                    {currentSlide.subtitle}
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex flex-wrap items-center gap-5"
                                >
                                    <Link
                                        href={currentSlide.cta_link || '/services'}
                                        className="bg-white text-gray-900 px-10 py-4 rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-gray-100 transition-all active:scale-95 shadow-2xl shadow-white/10"
                                    >
                                        <Zap className="w-4 h-4 text-primary-600 fill-primary-600" />
                                        {currentSlide.cta_text || 'Get Started Now'}
                                    </Link>
                                    <Link
                                        href="/vendors"
                                        className="text-white font-bold text-sm hover:text-primary-400 transition-colors flex items-center gap-2 group/btn"
                                    >
                                        View Agencies
                                        <ArrowRight className="w-4 h-4 translate-x-0 group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="absolute bottom-10 right-10 flex items-center gap-4 z-20">
                        <button
                            onClick={(e) => { e.stopPropagation(); slidePrev(); }}
                            className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-gray-900 transition-all active:scale-90 group"
                        >
                            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); slideNext(); }}
                            className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-gray-900 transition-all active:scale-90 group"
                        >
                            <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>

                    {/* Progress Dots */}
                    <div className="absolute bottom-10 left-10 lg:left-20 flex items-center gap-2.5 z-20">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setDirection(index > currentIndex ? 1 : -1);
                                    setCurrentIndex(index);
                                }}
                                className="relative h-1.5 focus:outline-none group"
                                style={{ width: currentIndex === index ? '40px' : '10px' }}
                            >
                                <div className={`absolute inset-0 rounded-full transition-all duration-500 ${currentIndex === index ? 'bg-primary-500 w-full' : 'bg-white/30 w-10px group-hover:bg-white/50'}`} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
