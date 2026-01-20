'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    CreditCard, DollarSign, TrendingUp, Download, Calendar, Clock,
    ChevronRight, CheckCircle2, AlertCircle, Loader2, Crown, Zap,
    ArrowRight, RefreshCw, Banknote, Building2, Shield, Lock,
    LayoutDashboard, Package, FolderOpen, Play, Users, BarChart3,
    Settings, LogOut, Bell, Menu, X, MessageSquare, IndianRupee,
    Receipt, ArrowUpRight, ArrowDownRight, Wallet, ExternalLink
} from 'lucide-react';
import { getCurrentVendor } from '@/lib/vendor-service';
import { getSupabaseClient } from '@/lib/supabase';
import { initializeDodoPayment, toPaise, PaymentResponse } from '@/lib/dodo-payments';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/supabase';

const supabase = getSupabaseClient();

interface SubscriptionPlan {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    billing_period: string;
    services_limit: number;
    features: string[];
    is_popular: boolean;
}

export default function SubscriptionPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [vendor, setVendor] = useState<any>(null);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'subscription' | 'payout'>('overview');

    // Stats
    const [stats, setStats] = useState({
        totalEarnings: 0,
        pendingPayout: 0,
        thisMonthEarnings: 0,
        completedOrders: 0,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Get vendor data
            const vendorData = await getCurrentVendor();
            if (!vendorData) {
                router.push('/onboarding');
                return;
            }
            setVendor(vendorData);

            // Load subscription plans
            const { data: plansData } = await supabase
                .from('subscription_plans')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (plansData) {
                setPlans(plansData);
                // Find current plan
                const current = plansData.find((p: any) => p.id === vendorData.subscription_plan_id);
                setCurrentPlan(current || null);
            }

            // Load orders (earnings from service bookings)
            const { data: ordersData } = await supabase
                .from('orders')
                .select('*')
                .eq('vendor_id', vendorData.slug)
                .order('created_at', { ascending: false })
                .limit(20);

            if (ordersData) {
                setOrders(ordersData);
                // Calculate stats
                const completed = ordersData.filter((o: any) => o.payment_status === 'paid');
                const thisMonth = completed.filter((o: any) => {
                    const orderDate = new Date(o.created_at);
                    const now = new Date();
                    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
                });

                setStats({
                    totalEarnings: completed.reduce((sum: number, o: any) => sum + (o.amount || 0), 0),
                    pendingPayout: completed.reduce((sum: number, o: any) => sum + (o.amount || 0), 0) * 0.9, // 10% platform fee
                    thisMonthEarnings: thisMonth.reduce((sum: number, o: any) => sum + (o.amount || 0), 0),
                    completedOrders: completed.length,
                });
            }

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRenewSubscription = async (plan: SubscriptionPlan) => {
        setIsProcessing(true);
        try {
            const amountInPaise = toPaise(plan.price);

            await initializeDodoPayment(
                {
                    amount: amountInPaise,
                    currency: plan.currency || 'INR',
                    productName: 'WENWEX Partner Subscription',
                    productDescription: `${plan.name} Plan Renewal - ${plan.billing_period}`,
                    customerName: vendor?.company_name,
                    customerEmail: vendor?.email,
                    metadata: {
                        plan_id: plan.id,
                        vendor_id: vendor?.id,
                        type: 'subscription_renewal',
                    },
                },
                async (response: PaymentResponse) => {
                    // Update vendor subscription
                    const { error } = await supabase
                        .from('vendors')
                        .update({
                            subscription_plan_id: plan.id,
                            subscription_status: 'active',
                            dodo_payment_id: response.payment_id,
                            payment_status: 'paid',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', vendor.id);

                    if (error) throw error;

                    toast.success('Subscription renewed successfully!');
                    setCurrentPlan(plan);
                    loadData();
                },
                (error: any) => {
                    if (error.message !== 'Payment cancelled by user') {
                        toast.error(error.message || 'Payment failed');
                    }
                }
            );
        } catch (error: any) {
            toast.error(error.message || 'Failed to process payment');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/auth/login');
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const sidebarLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/services', label: 'My Services', icon: Package },
        { href: '/dashboard/portfolio', label: 'Portfolio', icon: FolderOpen },
        { href: '/dashboard/shorts', label: 'Shorts', icon: Play },
        { href: '/dashboard/followers', label: 'Followers', icon: Users },
        { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/dashboard/subscription', label: 'Billing', icon: CreditCard, active: true },
        { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
        { href: '/dashboard/settings', label: 'Agency Profile', icon: Settings },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gray-50/50">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-xl lg:shadow-none`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-20 px-8 border-b border-gray-50">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <span className="text-white font-black text-xl">W</span>
                            </div>
                            <span className="font-black text-gray-900 text-xl tracking-tight">WENWEX</span>
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-gray-400 hover:bg-gray-50 rounded-xl">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Vendor Info */}
                    <div className="px-6 py-8">
                        <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white text-primary-600 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm">
                                    {vendor?.company_name?.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{vendor?.company_name}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className={`w-2 h-2 rounded-full ${vendor?.status === 'APPROVED' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">{vendor?.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pb-8">
                        {sidebarLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all duration-200 group ${link.active ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
                            >
                                <link.icon className={`w-5 h-5 ${link.active ? 'text-white' : 'group-hover:text-primary-600'}`} />
                                <span className="text-sm">{link.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Logout */}
                    <div className="p-6 border-t border-gray-50">
                        <button onClick={handleSignOut} className="flex items-center gap-4 w-full px-5 py-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all group">
                            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-72">
                {/* Top Header */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center justify-between px-8">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-400 hover:bg-gray-50 rounded-xl">
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="hidden lg:block">
                        <h1 className="text-xl font-black text-gray-900">Billing & Subscription</h1>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Manage your earnings and subscription</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2.5 text-gray-400 hover:bg-gray-50 rounded-2xl transition-all">
                            <Bell className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8 space-y-8">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-[2rem] shadow-lg text-white"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <IndianRupee className="w-6 h-6" />
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-white/60" />
                            </div>
                            <p className="text-3xl font-black">{formatPrice(stats.totalEarnings)}</p>
                            <p className="text-white/70 text-sm font-medium mt-1">Total Earnings</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-gray-900">{formatPrice(stats.thisMonthEarnings)}</p>
                            <p className="text-gray-400 text-sm font-medium mt-1">This Month</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                                    <Wallet className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-gray-900">{formatPrice(stats.pendingPayout)}</p>
                            <p className="text-gray-400 text-sm font-medium mt-1">Available for Payout</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                    <Receipt className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-gray-900">{stats.completedOrders}</p>
                            <p className="text-gray-400 text-sm font-medium mt-1">Completed Orders</p>
                        </motion.div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 w-fit">
                        {[
                            { id: 'overview', label: 'Overview' },
                            { id: 'earnings', label: 'Earnings' },
                            { id: 'subscription', label: 'Subscription' },
                            { id: 'payout', label: 'Payout Settings' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Current Plan */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                                        <Crown className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900">
                                            {currentPlan?.name || 'No Plan'} Plan
                                        </h3>
                                        <p className="text-gray-400 text-sm">Active Subscription</p>
                                    </div>
                                    <span className="ml-auto px-4 py-1.5 bg-green-50 text-green-600 text-xs font-black rounded-full uppercase">Active</span>
                                </div>

                                <div className="space-y-4 mb-6">
                                    {currentPlan?.features?.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            <span className="text-gray-600">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                    <div>
                                        <p className="text-sm text-gray-500">Next billing</p>
                                        <p className="font-black text-gray-900">Feb 19, 2026</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Amount</p>
                                        <p className="font-black text-gray-900">{formatPrice(currentPlan?.price || 0)}/mo</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Recent Transactions */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8"
                            >
                                <h3 className="text-xl font-black text-gray-900 mb-6">Recent Orders</h3>
                                <div className="space-y-4">
                                    {orders.length > 0 ? orders.slice(0, 5).map((order) => (
                                        <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${order.payment_status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                                    {order.payment_status === 'paid' ? <ArrowUpRight className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{order.customer_name || order.customer_email}</p>
                                                    <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-gray-900">+{formatPrice(order.amount)}</p>
                                                <p className={`text-xs font-bold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                                    {order.payment_status}
                                                </p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-center text-gray-400 py-8">No orders yet</p>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {activeTab === 'earnings' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2rem] border border-gray-100 shadow-sm"
                        >
                            <div className="p-8 border-b border-gray-100">
                                <h3 className="text-xl font-black text-gray-900">All Orders & Earnings</h3>
                                <p className="text-gray-400 text-sm">Track payments received from service bookings</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">
                                            <th className="px-8 py-4">Customer</th>
                                            <th className="px-4 py-4">Service</th>
                                            <th className="px-4 py-4">Amount</th>
                                            <th className="px-4 py-4">Status</th>
                                            <th className="px-4 py-4">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {orders.length > 0 ? orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div>
                                                        <p className="font-bold text-gray-900">{order.customer_name || 'N/A'}</p>
                                                        <p className="text-xs text-gray-400">{order.customer_email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 text-sm text-gray-600 max-w-[200px] truncate">{order.service_id}</td>
                                                <td className="px-4 py-5 font-black text-gray-900">{formatPrice(order.amount)}</td>
                                                <td className="px-4 py-5">
                                                    <span className={`px-3 py-1 text-xs font-black rounded-full uppercase ${order.payment_status === 'paid' ? 'bg-green-50 text-green-600' :
                                                        order.payment_status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                                                            'bg-red-50 text-red-600'
                                                        }`}>
                                                        {order.payment_status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-5 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="py-16 text-center text-gray-400">
                                                    <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                                    <p className="font-medium">No orders received yet</p>
                                                    <p className="text-sm mt-1">Orders will appear here when customers book your services</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'subscription' && (
                        <div className="space-y-8">
                            {/* Current Plan */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-8 text-white"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                                            <Crown className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black">{currentPlan?.name || 'No'} Plan</h3>
                                            <p className="text-white/60">Current Subscription</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-black">{formatPrice(currentPlan?.price || 0)}</p>
                                        <p className="text-white/60">per {currentPlan?.billing_period || 'month'}</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Available Plans */}
                            <div>
                                <h3 className="text-xl font-black text-gray-900 mb-6">Available Plans</h3>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {plans.map((plan) => (
                                        <motion.div
                                            key={plan.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`bg-white rounded-[2rem] border-2 p-6 ${plan.id === currentPlan?.id ? 'border-primary-500 shadow-lg shadow-primary-500/10' : 'border-gray-100'}`}
                                        >
                                            {plan.is_popular && (
                                                <div className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-black rounded-full mb-4">Popular</div>
                                            )}
                                            <h4 className="text-xl font-black text-gray-900">{plan.name}</h4>
                                            <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                                            <p className="text-3xl font-black text-gray-900 mb-6">
                                                {formatPrice(plan.price)}
                                                <span className="text-sm font-medium text-gray-400">/{plan.billing_period}</span>
                                            </p>

                                            <div className="space-y-3 mb-6">
                                                {plan.features?.map((feature, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        {feature}
                                                    </div>
                                                ))}
                                            </div>

                                            {plan.id === currentPlan?.id ? (
                                                <div className="w-full py-3 text-center text-primary-600 font-bold bg-primary-50 rounded-xl">
                                                    Current Plan
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleRenewSubscription(plan)}
                                                    disabled={isProcessing}
                                                    className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                                                >
                                                    {isProcessing ? 'Processing...' : 'Upgrade'}
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payout' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                                    <Building2 className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Payout Settings</h3>
                                    <p className="text-gray-400 text-sm">Configure your bank account for receiving payments</p>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
                                <div className="flex items-start gap-4">
                                    <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-amber-900 mb-1">How Payouts Work</h4>
                                        <p className="text-amber-800 text-sm">
                                            When customers pay for your services, the payment is held by WENWEX. After successful delivery and a 7-day holding period, the amount (minus 10% platform fee) is transferred to your registered bank account. Payouts are processed weekly on Mondays.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Bank Account Name</label>
                                    <input
                                        type="text"
                                        placeholder="Account holder name"
                                        className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-gray-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Account Number</label>
                                    <input
                                        type="text"
                                        placeholder="XXXX XXXX XXXX XXXX"
                                        className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary-500 focus:bg-white outline-none transition-all font-mono font-medium text-gray-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">IFSC Code</label>
                                    <input
                                        type="text"
                                        placeholder="ABCD0001234"
                                        className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary-500 focus:bg-white outline-none transition-all font-mono font-medium text-gray-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Bank Name</label>
                                    <input
                                        type="text"
                                        placeholder="State Bank of India"
                                        className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <Shield className="w-4 h-4" />
                                    <span>Your bank details are encrypted and secure</span>
                                </div>
                                <button className="px-8 py-3 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-colors">
                                    Save Payout Details
                                </button>
                            </div>
                        </motion.div>
                    )}
                </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}
        </div>
    );
}
