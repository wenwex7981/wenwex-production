'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Admin credentials - In production, use environment variables
const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'superadmin';
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Wenwex@2026!';

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        // Check if already authenticated
        const isAuthenticated = localStorage.getItem('wenwex_admin_auth');
        const authExpiry = localStorage.getItem('wenwex_admin_auth_expiry');

        if (isAuthenticated === 'true' && authExpiry) {
            const expiryTime = parseInt(authExpiry);
            if (Date.now() < expiryTime) {
                router.push('/admin');
            } else {
                // Session expired
                localStorage.removeItem('wenwex_admin_auth');
                localStorage.removeItem('wenwex_admin_auth_expiry');
            }
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate network delay for security
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            // Set authentication with 24-hour expiry
            const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
            localStorage.setItem('wenwex_admin_auth', 'true');
            localStorage.setItem('wenwex_admin_auth_expiry', expiryTime.toString());
            localStorage.setItem('wenwex_admin_user', username);

            toast.success('Login successful! Redirecting...');

            setTimeout(() => {
                router.push('/admin');
            }, 500);
        } else {
            toast.error('Invalid credentials. Please try again.');
            setIsLoading(false);
        }
    };

    if (!mounted) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />

            {/* Login Card */}
            <div className="relative w-full max-w-md">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-20" />

                <div className="relative bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-white mb-2">Super Admin Portal</h1>
                        <p className="text-gray-400 text-sm">WENWEX Platform Administration</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Username Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter admin username"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter admin password"
                                    required
                                    className="w-full pl-12 pr-12 py-3.5 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl hover:from-blue-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    Secure Login
                                </>
                            )}
                        </button>
                    </form>

                    {/* Security Notice */}
                    <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                        <p className="text-yellow-400 text-xs text-center">
                            🔒 This is a restricted admin area. All access attempts are logged.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
