'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Eye, EyeOff, Mail, Lock, User, ArrowRight, Chrome,
    Sparkles, Shield, Zap, Award, CheckCircle2, Star,
    Rocket, Globe, Users, TrendingUp
} from 'lucide-react';
import { signInWithGoogle, signUpWithEmail, getSupabaseClient } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        agreeTerms: false,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.fullName.trim()) {
            toast.error('Please enter your full name');
            return;
        }
        if (!formData.email.trim()) {
            toast.error('Please enter your email address');
            return;
        }
        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        if (!formData.agreeTerms) {
            toast.error('Please agree to the Terms of Service');
            return;
        }

        setIsLoading(true);

        try {
            // Sign up with Supabase
            const { data, error } = await signUpWithEmail(
                formData.email,
                formData.password,
                formData.fullName
            );

            if (error) throw error;

            if (data.user) {
                // Also create a record in our users table
                const supabase = getSupabaseClient();

                // Insert user into our custom users table
                const { error: insertError } = await supabase
                    .from('users')
                    .insert({
                        id: data.user.id,
                        email: formData.email,
                        full_name: formData.fullName,
                        role: 'BUYER',
                        supabase_id: data.user.id,
                    });

                if (insertError && !insertError.message.includes('duplicate')) {
                    console.error('User insert error:', insertError);
                }

                // Check if user is already confirmed (email confirmation disabled in Supabase)
                if (data.user.email_confirmed_at || data.session) {
                    toast.success('Account created successfully! Welcome to WENVEX!');
                    router.push('/');
                } else {
                    // Email confirmation required
                    toast.success('Account created! Please check your email to verify your account.');
                    router.push('/auth/login?registered=true');
                }
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            if (error.message.includes('already registered')) {
                toast.error('This email is already registered. Please sign in.');
            } else {
                toast.error(error.message || 'Failed to create account. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            const { error } = await signInWithGoogle();
            if (error) throw error;
        } catch (error: any) {
            toast.error(error.message || 'Error signing in with Google');
        }
    };

    const features = [
        { icon: Shield, text: 'Verified Agencies Only', color: 'from-emerald-400 to-teal-500' },
        { icon: Zap, text: 'Instant Connections', color: 'from-amber-400 to-orange-500' },
        { icon: Award, text: 'Quality Guaranteed', color: 'from-violet-400 to-purple-500' },
        { icon: TrendingUp, text: 'Track Your Projects', color: 'from-pink-400 to-rose-500' },
    ];

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left Side - Vibrant Brand Panel */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
                    {/* Animated Gradient Orbs */}
                    <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-3xl opacity-30 animate-pulse" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />

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
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span className="text-sm font-medium">Join 50,000+ Happy Clients</span>
                        </div>

                        <h2 className="text-5xl font-black mb-6 leading-tight">
                            Your Gateway to
                            <span className="block mt-2 bg-gradient-to-r from-cyan-300 via-yellow-200 to-pink-300 bg-clip-text text-transparent">
                                Premium Tech Services
                            </span>
                        </h2>

                        <p className="text-xl text-white/80 mb-12 max-w-lg leading-relaxed">
                            Connect with world-class agencies, track your projects in real-time,
                            and experience the future of tech commerce.
                        </p>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-2 gap-4 mb-12">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/20 transition-all duration-300"
                                >
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                                        <feature.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-medium text-sm">{feature.text}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-8">
                            <div className="text-center">
                                <div className="text-4xl font-black bg-gradient-to-r from-cyan-300 to-white bg-clip-text text-transparent">500+</div>
                                <div className="text-sm text-white/60 font-medium">Verified Agencies</div>
                            </div>
                            <div className="w-px h-12 bg-white/20" />
                            <div className="text-center">
                                <div className="text-4xl font-black bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent">10K+</div>
                                <div className="text-sm text-white/60 font-medium">Active Services</div>
                            </div>
                            <div className="w-px h-12 bg-white/20" />
                            <div className="text-center">
                                <div className="text-4xl font-black bg-gradient-to-r from-pink-300 to-white bg-clip-text text-transparent">4.9</div>
                                <div className="text-sm text-white/60 font-medium flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> Rating
                                </div>
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
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl rotate-12">
                        <Globe className="w-8 h-8 text-white" />
                    </div>
                </motion.div>
                <motion.div
                    className="absolute bottom-40 right-32"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                >
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl -rotate-6">
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
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                            <span className="text-white font-black text-xl">W</span>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-gray-900 tracking-tight">WENVEX</span>
                            <span className="block text-[10px] font-bold text-purple-600 uppercase tracking-widest">Platform</span>
                        </div>
                    </Link>

                    <h1 className="text-3xl font-black text-gray-900 mb-2">Create your account</h1>
                    <p className="text-gray-500 mb-8">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                            Sign in
                        </Link>
                    </p>

                    {/* Google Sign Up - Premium Style */}
                    <button
                        onClick={handleGoogleSignUp}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-lg transition-all duration-300 mb-6 group"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Continue with Google</span>
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </button>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-gray-50 text-gray-400 font-medium">or continue with email</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity -z-10" />
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="John Doe"
                                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="you@example.com"
                                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <div className={`h-1 flex-1 rounded-full transition-colors ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`} />
                                <div className={`h-1 flex-1 rounded-full transition-colors ${formData.password.length >= 10 ? 'bg-green-500' : 'bg-gray-200'}`} />
                                <div className={`h-1 flex-1 rounded-full transition-colors ${formData.password.length >= 12 ? 'bg-green-500' : 'bg-gray-200'}`} />
                                <span className="text-xs text-gray-400 ml-2">
                                    {formData.password.length < 8 ? 'Min 8 chars' : formData.password.length < 10 ? 'Good' : formData.password.length < 12 ? 'Strong' : 'Very Strong'}
                                </span>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <input
                                type="checkbox"
                                id="agreeTerms"
                                name="agreeTerms"
                                checked={formData.agreeTerms}
                                onChange={handleInputChange}
                                className="mt-0.5 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                required
                            />
                            <label htmlFor="agreeTerms" className="text-sm text-gray-600 leading-relaxed">
                                I agree to the{' '}
                                <Link href="/terms" className="text-purple-600 hover:underline font-semibold">Terms of Service</Link>
                                {' '}and{' '}
                                <Link href="/privacy" className="text-purple-600 hover:underline font-semibold">Privacy Policy</Link>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

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
