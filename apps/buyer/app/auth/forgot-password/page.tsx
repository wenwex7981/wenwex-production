'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Mail, ArrowRight, ArrowLeft, CheckCircle2,
    Sparkles, Shield, KeyRound, Globe, Rocket
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error('Please enter your email address');
            return;
        }

        setIsLoading(true);

        try {
            const supabase = getSupabaseClient();

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (error) throw error;

            setIsEmailSent(true);
            toast.success('Password reset link sent to your email!');
        } catch (error: any) {
            console.error('Password reset error:', error);
            toast.error(error.message || 'Failed to send reset email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left Side - Vibrant Brand Panel */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500">
                    {/* Animated Gradient Orbs */}
                    <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-3xl opacity-30 animate-pulse" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-red-400 to-pink-500 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-orange-400 to-rose-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />

                    {/* Grid Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center p-16 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Brand Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
                            <KeyRound className="w-4 h-4 text-yellow-200" />
                            <span className="text-sm font-medium">Secure Password Recovery</span>
                        </div>

                        <h2 className="text-5xl font-black mb-6 leading-tight">
                            Don't Worry,
                            <span className="block mt-2 bg-gradient-to-r from-yellow-200 via-white to-pink-200 bg-clip-text text-transparent">
                                We've Got You
                            </span>
                        </h2>

                        <p className="text-xl text-white/80 mb-12 max-w-lg leading-relaxed">
                            It happens to the best of us! Enter your email and we'll send you
                            a secure link to reset your password.
                        </p>

                        {/* Security Features */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-medium text-sm">256-bit encrypted password reset</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
                                    <Mail className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-medium text-sm">Link expires in 1 hour for security</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Floating Elements */}
                <motion.div
                    className="absolute top-32 right-20"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl rotate-12">
                        <Globe className="w-8 h-8 text-white" />
                    </div>
                </motion.div>
                <motion.div
                    className="absolute bottom-40 right-32"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                >
                    <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl -rotate-6">
                        <Rocket className="w-7 h-7 text-white" />
                    </div>
                </motion.div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 mb-10">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                            <span className="text-white font-black text-xl">W</span>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-gray-900 tracking-tight">WENVEX</span>
                            <span className="block text-[10px] font-bold text-orange-600 uppercase tracking-widest">Platform</span>
                        </div>
                    </Link>

                    {!isEmailSent ? (
                        <>
                            <Link href="/auth/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                <span className="text-sm font-medium">Back to sign in</span>
                            </Link>

                            <h1 className="text-3xl font-black text-gray-900 mb-2">Forgot password?</h1>
                            <p className="text-gray-500 mb-8">
                                No worries, we'll send you reset instructions.
                            </p>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Reset Link
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                                <CheckCircle2 className="w-10 h-10 text-white" />
                            </div>

                            <h1 className="text-3xl font-black text-gray-900 mb-2">Check your email</h1>
                            <p className="text-gray-500 mb-8">
                                We've sent a password reset link to<br />
                                <span className="font-semibold text-gray-700">{email}</span>
                            </p>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                <p className="text-sm text-amber-800">
                                    <strong>Didn't receive the email?</strong><br />
                                    Check your spam folder or wait a few minutes.
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setIsEmailSent(false);
                                    setEmail('');
                                }}
                                className="text-orange-600 hover:text-orange-700 font-semibold inline-flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Try a different email
                            </button>

                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <Link
                                    href="/auth/login"
                                    className="text-gray-500 hover:text-gray-700 font-medium"
                                >
                                    ← Back to sign in
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 mt-8 text-gray-400">
                        <Shield className="w-4 h-4" />
                        <span className="text-xs">256-bit SSL Encrypted • Your data is secure</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
