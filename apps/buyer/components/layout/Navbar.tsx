'use client';

import Link from 'next/link';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { useCurrencyStore, currencies } from '@/lib/currency-store';
import { signOut } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationPanel from '@/components/ui/NotificationPanel';
import {
    Search,
    Menu,
    X,
    User,
    Heart,
    Bell,
    ChevronDown,
    LogIn,
    UserPlus,
    Building2,
    LayoutGrid,
    GraduationCap,
    Play,
    Zap,
    Crown,
    Settings,
    HelpCircle,
    UserCircle,
    Globe2,
    Briefcase,
    Sparkles,
    MessageSquare,
    Newspaper,
    LayoutList
} from 'lucide-react';

const navLinks = [
    { href: '/categories', label: 'Categories', icon: LayoutGrid },
    { href: '/feed', label: 'Feed', icon: LayoutList },
    { href: '/services', label: 'Services', icon: null },
    { href: '/vendors', label: 'Agencies', icon: Building2 },
    { href: '/academic', label: 'Academic', icon: GraduationCap },
    { href: '/shorts', label: 'Shorts', icon: Play },
];

// Search input component that safely uses useSearchParams
function SearchInput({
    searchInput,
    setSearchInput,
    searchInputRef
}: {
    searchInput: string;
    setSearchInput: (v: string) => void;
    searchInputRef: React.RefObject<HTMLInputElement>;
}) {
    const searchParams = useSearchParams();

    useEffect(() => {
        const query = searchParams.get('q');
        if (query) setSearchInput(query);
    }, [searchParams, setSearchInput]);

    return null; // This component only syncs the state
}

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const { user, isAuthenticated, logout } = useAuthStore();
    const router = useRouter();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            router.push(`/services?q=${encodeURIComponent(searchInput.trim())}`);
            setIsOpen(false); // Close mobile menu if open
        }
    };

    const handleSignOut = async () => {
        try {
            const { error } = await signOut();
            if (error) throw error;
            logout();
            toast.success('Signed out successfully');
        } catch (error: any) {
            toast.error(error.message || 'Error signing out');
        }
    };

    const isLoggedIn = isAuthenticated;
    const { currentCurrency, setCurrency } = useCurrencyStore();
    const [showCurrencySelector, setShowCurrencySelector] = useState(false);
    const currencyRef = useRef<HTMLDivElement>(null);

    // Keyboard shortcut handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
                setShowCurrencySelector(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!mounted) return null;

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            {/* Suspense boundary for useSearchParams */}
            <Suspense fallback={null}>
                <SearchInput searchInput={searchInput} setSearchInput={setSearchInput} searchInputRef={searchInputRef} />
            </Suspense>
            {/* Premium Top Bar - Desktop */}
            <div className="bg-gray-900 text-white py-2 px-4 hidden lg:block">
                <div className="container-custom flex items-center justify-between text-[11px] font-bold tracking-widest uppercase">
                    <div className="flex items-center gap-6">
                        <Link href="/about" className="flex items-center gap-1.5 hover:text-primary-400 transition-colors">
                            About
                        </Link>
                        <Link href="/contact" className="flex items-center gap-1.5 hover:text-primary-400 transition-colors">
                            Contact
                        </Link>
                        <Link href="/support" className="flex items-center gap-1.5 hover:text-primary-400 transition-colors">
                            <HelpCircle className="w-3.5 h-3.5" />
                            Help & Support
                        </Link>
                        <div className="flex items-center gap-1.5 text-primary-400">
                            <Crown className="w-3.5 h-3.5" />
                            Wenwex Premium
                        </div>
                        <a
                            href={process.env.NEXT_PUBLIC_VENDOR_URL ? `${process.env.NEXT_PUBLIC_VENDOR_URL}/onboarding` : "https://vendor.wenwex.online/onboarding"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-white bg-primary-600/20 px-3 py-1 rounded-full border border-primary-500/30 hover:bg-primary-600/40 transition-all group"
                        >
                            <Briefcase className="w-3.5 h-3.5 text-primary-400 group-hover:scale-110 transition-transform" />
                            <span className="text-primary-400 group-hover:text-primary-300 transition-colors">Become Service Partner</span>
                        </a>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative" ref={currencyRef}>
                            <div
                                onClick={() => setShowCurrencySelector(!showCurrencySelector)}
                                className="flex items-center gap-1.5 cursor-pointer hover:text-primary-400 transition-colors"
                            >
                                <Globe2 className="w-3.5 h-3.5" />
                                <span>{currentCurrency.flag} {currentCurrency.code}</span>
                                <ChevronDown className={`w-3 h-3 transition-transform ${showCurrencySelector ? 'rotate-180' : ''}`} />
                            </div>

                            <AnimatePresence>
                                {showCurrencySelector && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl py-2 z-[60] overflow-hidden"
                                    >
                                        <div className="px-3 py-2 border-b border-gray-700">
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Select Country / Currency</span>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                            {currencies.map((curr) => (
                                                <button
                                                    key={curr.code}
                                                    onClick={() => {
                                                        setCurrency(curr);
                                                        setShowCurrencySelector(false);
                                                        toast.success(`Currency switched to ${curr.code}`);
                                                    }}
                                                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-700 transition-colors ${currentCurrency.code === curr.code ? 'bg-primary-600/20 text-primary-400' : 'text-gray-300'}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{curr.flag}</span>
                                                        <div className="flex flex-col leading-tight">
                                                            <span className="text-[11px] font-bold">{curr.name}</span>
                                                            <span className="text-[9px] opacity-60">{curr.code} ({curr.symbol})</span>
                                                        </div>
                                                    </div>
                                                    {currentCurrency.code === curr.code && (
                                                        <Sparkles className="w-3 h-3 text-primary-400" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        {isLoggedIn ? (
                            <Link href="/account/subscription" className="flex items-center gap-1.5 bg-primary-600 px-3 py-1 rounded-full animate-pulse">
                                <Zap className="w-3.5 h-3.5" />
                                Active Plan: Pro
                            </Link>
                        ) : (
                            <Link href="/pricing" className="hover:text-primary-400 transition-colors">
                                View Pricing
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <nav className="bg-white/95 backdrop-blur-lg border-b border-gray-100">
                <div className="container-custom">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden bg-white">
                                <img src="/logo.png" alt="WENWEX" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-xl font-black text-gray-900 tracking-tighter">
                                    WENWEX
                                </span>
                                <span className="text-[8px] font-bold text-primary-600 tracking-[0.2em] ml-0.5">PLATFORM</span>
                            </div>
                        </Link>

                        {/* Search Bar - Desktop */}
                        <div className="hidden lg:flex flex-1 max-w-sm mx-8">
                            <form onSubmit={handleSearch} className="search-bar w-full group py-1.5 px-3">
                                <Search className="w-4 h-4 text-gray-400 mr-2 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search services..."
                                    className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-[12px] font-medium"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => setSearchFocused(false)}
                                />
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 text-[8px] font-bold text-gray-400 border border-gray-200">
                                    <span>⌘</span>
                                    <span>K</span>
                                </div>
                            </form>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-[13px] font-bold text-gray-600 hover:text-primary-600 transition-colors uppercase tracking-wide whitespace-nowrap"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-2">
                            {/* Mobile Search - Always Visible */}
                            <form onSubmit={handleSearch} className="lg:hidden flex-1 max-w-[180px] mr-1">
                                <div className="search-bar w-full py-1 px-2">
                                    <Search className="w-4 h-4 text-gray-400 mr-1.5" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-xs font-medium w-full"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                    />
                                </div>
                            </form>

                            {isLoggedIn ? (
                                <>
                                    {/* Notifications Panel */}
                                    <NotificationPanel />

                                    {/* Saved */}
                                    <Link href="/account/saved" className="btn-icon hidden sm:flex">
                                        <Heart className="w-5 h-5 text-gray-600" />
                                    </Link>

                                    {/* Chat Icon */}
                                    <Link href="/messages" className="btn-icon">
                                        <MessageSquare className="w-5 h-5 text-gray-600" />
                                    </Link>

                                    {/* User Menu */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowUserMenu(!showUserMenu)}
                                            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="avatar avatar-md bg-primary-100 text-primary-600 group-hover:ring-2 group-ring-primary-100 transition-all overflow-hidden">
                                                {user?.avatarUrl ? (
                                                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-bold">{user?.fullName?.charAt(0) || 'U'}</span>
                                                )}
                                            </div>
                                            <div className="hidden sm:flex flex-col items-start leading-none text-left">
                                                <span className="text-[12px] font-black text-gray-900">{user?.fullName}</span>
                                                <span className="text-[10px] font-bold text-primary-600 uppercase tracking-tighter">{user?.role} Member</span>
                                            </div>
                                            <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block group-hover:translate-y-0.5 transition-transform" />
                                        </button>

                                        <AnimatePresence>
                                            {showUserMenu && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 overflow-hidden"
                                                >
                                                    {/* User Info Header in Menu */}
                                                    <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 mb-2">
                                                        <div className="font-black text-gray-900 text-sm">{user?.fullName}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase truncate">{user?.email}</div>
                                                    </div>

                                                    <Link href="/account" className="flex items-center gap-3 px-5 py-3 hover:bg-primary-50 hover:text-primary-600 group transition-all">
                                                        <UserCircle className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
                                                        <span className="text-sm font-bold text-gray-700">Account Profile</span>
                                                    </Link>
                                                    <Link href="/account/subscription" className="flex items-center gap-3 px-5 py-3 hover:bg-primary-50 hover:text-primary-600 group transition-all">
                                                        <Zap className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
                                                        <span className="text-sm font-bold text-gray-700">My Subscription</span>
                                                    </Link>
                                                    <Link href="/account/saved" className="flex items-center gap-3 px-5 py-3 hover:bg-primary-50 hover:text-primary-600 group transition-all">
                                                        <Heart className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
                                                        <span className="text-sm font-bold text-gray-700">Watchlist</span>
                                                    </Link>
                                                    <Link href="/account/settings" className="flex items-center gap-3 px-5 py-3 hover:bg-primary-50 hover:text-primary-600 group transition-all">
                                                        <Settings className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
                                                        <span className="text-sm font-bold text-gray-700">Manage Settings</span>
                                                    </Link>

                                                    <div className="px-4 mt-4 mb-2">
                                                        <div className="bg-primary-600 p-4 rounded-xl text-white relative overflow-hidden group/card shadow-lg shadow-primary-500/20">
                                                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
                                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Current Plan</div>
                                                            <div className="font-black text-lg mb-3 flex items-center gap-2">
                                                                <Crown className="w-4 h-4" />
                                                                WENWEX PRO
                                                            </div>
                                                            <button className="w-full py-1.5 bg-white text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-100 transition-colors">
                                                                Manage Billing
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <hr className="my-2 border-gray-100" />
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 text-red-600 group transition-all"
                                                    >
                                                        <LogIn className="w-4 h-4 rotate-180" />
                                                        <span className="text-sm font-bold">Sign Out</span>
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-4 ml-4">
                                    {/* Notifications for non-logged users */}
                                    <NotificationPanel />
                                    <Link href="/auth/login" className="text-[13px] font-bold text-gray-600 hover:text-gray-900 transition-colors py-2 whitespace-nowrap">
                                        Sign In
                                    </Link>
                                    <Link href="/auth/register" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-primary-500/20 transition-all active:scale-95 whitespace-nowrap">
                                        Get Started
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="lg:hidden btn-icon"
                            >
                                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="lg:hidden border-t border-gray-100 overflow-hidden"
                            >
                                <div className="py-4 space-y-1">
                                    {/* Mobile Top Bar Links - Same as Desktop */}
                                    <div className="px-4 pb-4 border-b border-gray-100 mb-2">
                                        <div className="flex flex-col gap-3">
                                            <Link
                                                href="/about"
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium"
                                            >
                                                About Us
                                            </Link>
                                            <Link
                                                href="/contact"
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium"
                                            >
                                                Contact Us
                                            </Link>
                                            <Link
                                                href="/support"
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium"
                                            >
                                                <HelpCircle className="w-4 h-4" />
                                                Help & Support
                                            </Link>
                                            <div className="flex items-center gap-2 text-primary-600 text-sm font-bold">
                                                <Crown className="w-4 h-4" />
                                                WENWEX Premium
                                            </div>
                                            <a
                                                href={process.env.NEXT_PUBLIC_VENDOR_URL ? `${process.env.NEXT_PUBLIC_VENDOR_URL}/onboarding` : "https://vendor.wenwex.online/onboarding"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center gap-2 bg-primary-600/10 text-primary-600 px-3 py-2 rounded-lg text-sm font-bold"
                                            >
                                                <Briefcase className="w-4 h-4" />
                                                Become Service Partner
                                            </a>
                                        </div>
                                    </div>

                                    {/* Mobile Search */}
                                    <div className="px-2 pb-4">
                                        <form onSubmit={handleSearch} className="search-bar">
                                            <Search className="w-5 h-5 text-gray-400 mr-3" />
                                            <input
                                                type="text"
                                                placeholder="Search services..."
                                                className="flex-1 bg-transparent border-none outline-none"
                                                value={searchInput}
                                                onChange={(e) => setSearchInput(e.target.value)}
                                            />
                                        </form>
                                    </div>

                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl mx-2"
                                        >
                                            {link.icon && <link.icon className="w-5 h-5 text-gray-400" />}
                                            <span className="font-medium">{link.label}</span>
                                        </Link>
                                    ))}

                                    {!isLoggedIn && (
                                        <>
                                            <hr className="my-3 border-gray-100" />
                                            <div className="px-4 space-y-2">
                                                <Link
                                                    href="/auth/login"
                                                    className="btn btn-secondary w-full"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    Sign In
                                                </Link>
                                                <Link
                                                    href="/auth/register"
                                                    className="btn-primary w-full"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    Get Started
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </nav>
        </header>
    );
}
