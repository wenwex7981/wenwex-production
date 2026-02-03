'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogIn, UserPlus, X, Sparkles, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';

interface AuthGateProps {
    children: React.ReactNode;
    /** Number of items to show before blurring (default: 2) */
    previewCount?: number;
    /** Type of content being protected */
    contentType?: 'services' | 'agencies' | 'feed' | 'categories' | 'general';
    /** Whether to show the gate even if authenticated (for testing) */
    forceShow?: boolean;
}

export function AuthGate({
    children,
    previewCount = 2,
    contentType = 'general',
    forceShow = false
}: AuthGateProps) {
    const { isAuthenticated, isLoading } = useAuthStore();
    const [showModal, setShowModal] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Show modal automatically for non-authenticated users after a delay
    useEffect(() => {
        if (mounted && !isAuthenticated && !isLoading) {
            const timer = setTimeout(() => {
                setShowModal(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [mounted, isAuthenticated, isLoading]);

    // If still loading or authenticated, show content normally
    if (isLoading || (isAuthenticated && !forceShow)) {
        return <>{children}</>;
    }

    const getContentMessage = () => {
        switch (contentType) {
            case 'services':
                return {
                    title: 'Unlock Premium Services',
                    subtitle: 'Sign up to browse 1000+ professional services',
                    icon: Sparkles
                };
            case 'agencies':
                return {
                    title: 'Discover Top Agencies',
                    subtitle: 'Connect with verified vendors and agencies',
                    icon: Shield
                };
            case 'feed':
                return {
                    title: 'Join the Community',
                    subtitle: 'See updates, posts, and connect with vendors',
                    icon: Zap
                };
            case 'categories':
                return {
                    title: 'Explore All Categories',
                    subtitle: 'Find the perfect service for your needs',
                    icon: Sparkles
                };
            default:
                return {
                    title: 'Sign Up to Continue',
                    subtitle: 'Create a free account to access all features',
                    icon: Lock
                };
        }
    };

    const content = getContentMessage();
    const ContentIcon = content.icon;

    return (
        <div className="relative">
            {/* Content with blur effect */}
            <div className="relative">
                {children}

                {/* Blur overlay - covers from a certain point */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'linear-gradient(to bottom, transparent 0%, transparent 20%, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.95) 50%, white 70%)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                    }}
                />
            </div>

            {/* Floating CTA at bottom */}
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-white via-white to-transparent pb-8">
                <div className="container-custom">
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-6 shadow-2xl shadow-primary-500/30"
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 text-white">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{content.title}</h3>
                                    <p className="text-white/80 text-sm">{content.subtitle}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/auth/login"
                                    className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
                                >
                                    <LogIn className="w-5 h-5" />
                                    Login
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="px-6 py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2 shadow-lg"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    Sign Up Free
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary-50 to-blue-50 rounded-full translate-y-1/2 -translate-x-1/2" />

                            {/* Close button */}
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Content */}
                            <div className="relative text-center">
                                {/* Icon */}
                                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30">
                                    <ContentIcon className="w-10 h-10 text-white" />
                                </div>

                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    {content.title}
                                </h2>
                                <p className="text-gray-600 mb-8">
                                    {content.subtitle}
                                </p>

                                {/* Benefits */}
                                <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
                                    <p className="text-sm font-semibold text-gray-700 mb-3">With a free account you get:</p>
                                    <ul className="space-y-2">
                                        {[
                                            'Access to 1000+ services',
                                            'Connect with verified vendors',
                                            'Save & compare services',
                                            'Real-time chat with sellers',
                                            'Exclusive deals & offers'
                                        ].map((benefit, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                                <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                {benefit}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Buttons */}
                                <div className="space-y-3">
                                    <Link
                                        href="/auth/signup"
                                        className="block w-full py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-bold rounded-xl hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg shadow-primary-500/30"
                                    >
                                        Create Free Account
                                    </Link>
                                    <Link
                                        href="/auth/login"
                                        className="block w-full py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                                    >
                                        Already have an account? Login
                                    </Link>
                                </div>

                                <p className="text-xs text-gray-400 mt-4">
                                    By signing up, you agree to our Terms of Service
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AuthGate;
