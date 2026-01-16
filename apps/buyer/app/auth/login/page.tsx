'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Chrome } from 'lucide-react';
import { signInWithGoogle } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
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

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
                    <p className="text-gray-500 mb-8">
                        Don't have an account?{' '}
                        <Link href="/auth/register" className="text-primary-600 hover:text-primary-700 font-medium">
                            Sign up
                        </Link>
                    </p>

                    {/* Google Sign In */}
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
                            <span className="px-4 bg-white text-gray-400">or sign in with email</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
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
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <Link href="/auth/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="input pl-12 pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                            <label htmlFor="remember" className="text-sm text-gray-600">Remember me</label>
                        </div>

                        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
                            {isLoading ? 'Signing in...' : 'Sign In'}
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
                        Your gateway to premium tech services
                    </h2>
                    <p className="text-xl text-primary-100 mb-8">
                        Discover verified agencies, browse thousands of services, and get your projects done by experts.
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
