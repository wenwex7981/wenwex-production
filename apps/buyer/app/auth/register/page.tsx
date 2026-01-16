'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Chrome } from 'lucide-react';
import { signInWithGoogle } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Handle form submission
        setTimeout(() => setIsLoading(false), 2000);
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await signInWithGoogle();
            if (error) throw error;
        } catch (error: any) {
            toast.error(error.message || 'Error signing in with Google');
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                            <span className="text-white font-bold text-lg">W</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">WENVEX</span>
                    </Link>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
                    <p className="text-gray-500 mb-8">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
                            Sign in
                        </Link>
                    </p>

                    {/* Google Sign Up */}
                    <button
                        onClick={handleGoogleLogin}
                        className="btn-outline w-full mb-6"
                    >
                        <Chrome className="w-5 h-5" />
                        Continue with Google
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-400">or register with email</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    className="input pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="input pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="input pl-12 pr-12"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Must be at least 8 characters</p>
                        </div>

                        <div className="flex items-start gap-3">
                            <input type="checkbox" id="terms" className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" required />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                                I agree to the{' '}
                                <Link href="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>
                                {' '}and{' '}
                                <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
                            </label>
                        </div>

                        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
                            {isLoading ? 'Creating account...' : 'Create Account'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>
                </motion.div>
            </div>

            {/* Right Side - Brand */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 items-center justify-center p-12 text-white">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-lg text-center"
                >
                    <h2 className="text-4xl font-bold mb-6">
                        Join thousands of clients finding amazing services
                    </h2>
                    <p className="text-xl text-primary-100 mb-8">
                        Access verified agencies, track your orders, save favorites, and get personalized recommendations.
                    </p>
                    <div className="flex justify-center gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold">500+</div>
                            <div className="text-primary-200">Vendors</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold">10K+</div>
                            <div className="text-primary-200">Services</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold">50K+</div>
                            <div className="text-primary-200">Clients</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
