'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Trash2, Edit3, Save, X, CreditCard, IndianRupee,
    Loader2, Check, Star, Crown, Zap, Package, AlertCircle,
    ChevronUp, ChevronDown, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

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
    is_active: boolean;
    display_order: number;
    badge_text: string | null;
    badge_color: string | null;
    created_at: string;
    updated_at: string;
}

const BADGE_COLORS = [
    { value: 'yellow', label: 'Yellow', class: 'bg-yellow-400 text-yellow-900' },
    { value: 'green', label: 'Green', class: 'bg-green-400 text-green-900' },
    { value: 'blue', label: 'Blue', class: 'bg-blue-400 text-blue-900' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-400 text-purple-900' },
    { value: 'red', label: 'Red', class: 'bg-red-400 text-red-900' },
];

const BILLING_PERIODS = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'one_time', label: 'One Time' },
];

export default function SubscriptionsManagementPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingPlan, setIsAddingPlan] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // New plan form state
    const [newPlan, setNewPlan] = useState({
        name: '',
        slug: '',
        description: '',
        price: 0,
        currency: 'INR',
        billing_period: 'monthly',
        services_limit: 5,
        features: [''],
        is_popular: false,
        is_active: true,
        badge_text: '',
        badge_color: 'yellow',
    });

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('subscription_plans')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setPlans(data || []);
        } catch (error: any) {
            console.error('Error loading plans:', error);
            if (error.code === '42P01') {
                toast.error('Subscription plans table not found. Please run the SQL script.');
            } else {
                toast.error('Failed to load subscription plans');
            }
            setPlans([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPlan = async () => {
        if (!newPlan.name || newPlan.price <= 0) {
            toast.error('Plan name and price are required');
            return;
        }

        const slug = newPlan.slug || newPlan.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        setIsSaving(true);
        try {
            const { data, error } = await supabase
                .from('subscription_plans')
                .insert([{
                    ...newPlan,
                    slug,
                    features: newPlan.features.filter(f => f.trim() !== ''),
                    display_order: plans.length,
                    badge_text: newPlan.badge_text || null,
                }])
                .select()
                .single();

            if (error) {
                if (error.code === '23505') {
                    toast.error('A plan with this slug already exists');
                } else {
                    throw error;
                }
                return;
            }

            setPlans([...plans, data]);
            resetNewPlan();
            setIsAddingPlan(false);
            toast.success('Plan created successfully!');
        } catch (error) {
            console.error('Error adding plan:', error);
            toast.error('Failed to create plan');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePlan = async () => {
        if (!editingPlan) return;

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('subscription_plans')
                .update({
                    name: editingPlan.name,
                    description: editingPlan.description,
                    price: editingPlan.price,
                    currency: editingPlan.currency,
                    billing_period: editingPlan.billing_period,
                    services_limit: editingPlan.services_limit,
                    features: editingPlan.features,
                    is_popular: editingPlan.is_popular,
                    is_active: editingPlan.is_active,
                    badge_text: editingPlan.badge_text || null,
                    badge_color: editingPlan.badge_color,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', editingPlan.id);

            if (error) throw error;

            setPlans(plans.map(p => p.id === editingPlan.id ? editingPlan : p));
            setEditingPlan(null);
            toast.success('Plan updated successfully!');
        } catch (error) {
            console.error('Error updating plan:', error);
            toast.error('Failed to update plan');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePlan = async (planId: string) => {
        if (!confirm('Are you sure you want to delete this plan? This may affect vendors subscribed to it.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('subscription_plans')
                .delete()
                .eq('id', planId);

            if (error) throw error;

            setPlans(plans.filter(p => p.id !== planId));
            toast.success('Plan deleted successfully!');
        } catch (error) {
            console.error('Error deleting plan:', error);
            toast.error('Failed to delete plan');
        }
    };

    const handleToggleActive = async (plan: SubscriptionPlan) => {
        try {
            const { error } = await supabase
                .from('subscription_plans')
                .update({ is_active: !plan.is_active, updated_at: new Date().toISOString() })
                .eq('id', plan.id);

            if (error) throw error;

            setPlans(plans.map(p => p.id === plan.id ? { ...p, is_active: !p.is_active } : p));
            toast.success(`Plan ${!plan.is_active ? 'activated' : 'deactivated'}`);
        } catch (error) {
            console.error('Error toggling plan:', error);
            toast.error('Failed to update plan');
        }
    };

    const handleMoveOrder = async (planId: string, direction: 'up' | 'down') => {
        const index = plans.findIndex(p => p.id === planId);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === plans.length - 1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        const newPlans = [...plans];
        [newPlans[index], newPlans[newIndex]] = [newPlans[newIndex], newPlans[index]];

        try {
            await Promise.all([
                supabase.from('subscription_plans').update({ display_order: newIndex }).eq('id', planId),
                supabase.from('subscription_plans').update({ display_order: index }).eq('id', newPlans[index].id),
            ]);

            setPlans(newPlans.map((p, i) => ({ ...p, display_order: i })));
        } catch (error) {
            console.error('Error reordering plans:', error);
            toast.error('Failed to reorder plans');
        }
    };

    const resetNewPlan = () => {
        setNewPlan({
            name: '',
            slug: '',
            description: '',
            price: 0,
            currency: 'INR',
            billing_period: 'monthly',
            services_limit: 5,
            features: [''],
            is_popular: false,
            is_active: true,
            badge_text: '',
            badge_color: 'yellow',
        });
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
        }).format(price);
    };

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        Subscription Plans
                    </h1>
                    <p className="text-gray-400 mt-2">Manage pricing plans for vendor subscriptions</p>
                </div>
                <button
                    onClick={() => setIsAddingPlan(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add New Plan
                </button>
            </div>

            {/* Plans Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
            ) : plans.length === 0 ? (
                <div className="bg-gray-800 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">No subscription plans yet</h3>
                    <p className="text-gray-400 mb-6">Create your first plan to start accepting vendor subscriptions</p>
                    <button
                        onClick={() => setIsAddingPlan(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-xl font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        Create First Plan
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative bg-gray-800 rounded-2xl border ${plan.is_popular ? 'border-yellow-500/50' : 'border-gray-700'
                                } overflow-hidden ${!plan.is_active ? 'opacity-60' : ''}`}
                        >
                            {/* Badge */}
                            {plan.badge_text && (
                                <div className={`absolute top-4 right-4 px-3 py-1 ${BADGE_COLORS.find(c => c.value === plan.badge_color)?.class || 'bg-yellow-400 text-yellow-900'
                                    } text-xs font-black rounded-full uppercase`}>
                                    {plan.badge_text}
                                </div>
                            )}

                            {/* Header */}
                            <div className="p-6 border-b border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleMoveOrder(plan.id, 'up')}
                                            disabled={index === 0}
                                            className="p-1 text-gray-500 hover:text-white disabled:opacity-30"
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleMoveOrder(plan.id, 'down')}
                                            disabled={index === plans.length - 1}
                                            className="p-1 text-gray-500 hover:text-white disabled:opacity-30"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleActive(plan)}
                                            className={`p-2 rounded-lg transition-colors ${plan.is_active ? 'text-green-400 hover:bg-green-500/10' : 'text-gray-500 hover:bg-gray-700'
                                                }`}
                                            title={plan.is_active ? 'Deactivate' : 'Activate'}
                                        >
                                            {plan.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => setEditingPlan(plan)}
                                            className="p-2 text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                                        >
                                            <Edit3 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeletePlan(plan.id)}
                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                <p className="text-sm text-gray-400 mt-1">{plan.description}</p>

                                <div className="mt-4">
                                    <div className="text-3xl font-black text-white">
                                        {formatPrice(plan.price, plan.currency)}
                                    </div>
                                    <div className="text-sm text-gray-500">per {plan.billing_period}</div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="p-6">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                    {plan.services_limit === -1 ? 'Unlimited' : `Up to ${plan.services_limit}`} Services
                                </div>
                                <div className="space-y-2">
                                    {plan.features.slice(0, 5).map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                    {plan.features.length > 5 && (
                                        <div className="text-xs text-gray-500">+{plan.features.length - 5} more features</div>
                                    )}
                                </div>
                            </div>

                            {/* Status indicator */}
                            {plan.is_popular && (
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add/Edit Plan Modal */}
            <AnimatePresence>
                {(isAddingPlan || editingPlan) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                        onClick={() => {
                            setIsAddingPlan(false);
                            setEditingPlan(null);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white">
                                        {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setIsAddingPlan(false);
                                            setEditingPlan(null);
                                        }}
                                        className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Plan Name *</label>
                                        <input
                                            type="text"
                                            value={editingPlan?.name || newPlan.name}
                                            onChange={(e) => editingPlan
                                                ? setEditingPlan({ ...editingPlan, name: e.target.value })
                                                : setNewPlan({ ...newPlan, name: e.target.value })
                                            }
                                            placeholder="e.g., Professional"
                                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                                        <input
                                            type="text"
                                            value={editingPlan?.description || newPlan.description}
                                            onChange={(e) => editingPlan
                                                ? setEditingPlan({ ...editingPlan, description: e.target.value })
                                                : setNewPlan({ ...newPlan, description: e.target.value })
                                            }
                                            placeholder="Brief description"
                                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Price *</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editingPlan?.price || newPlan.price}
                                                onChange={(e) => editingPlan
                                                    ? setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) })
                                                    : setNewPlan({ ...newPlan, price: parseFloat(e.target.value) })
                                                }
                                                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Currency</label>
                                        <select
                                            value={editingPlan?.currency || newPlan.currency}
                                            onChange={(e) => editingPlan
                                                ? setEditingPlan({ ...editingPlan, currency: e.target.value })
                                                : setNewPlan({ ...newPlan, currency: e.target.value })
                                            }
                                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            <option value="INR">INR (₹)</option>
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Billing Period</label>
                                        <select
                                            value={editingPlan?.billing_period || newPlan.billing_period}
                                            onChange={(e) => editingPlan
                                                ? setEditingPlan({ ...editingPlan, billing_period: e.target.value })
                                                : setNewPlan({ ...newPlan, billing_period: e.target.value })
                                            }
                                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            {BILLING_PERIODS.map(p => (
                                                <option key={p.value} value={p.value}>{p.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Services Limit */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Services Limit (-1 for unlimited)</label>
                                    <input
                                        type="number"
                                        value={editingPlan?.services_limit ?? newPlan.services_limit}
                                        onChange={(e) => editingPlan
                                            ? setEditingPlan({ ...editingPlan, services_limit: parseInt(e.target.value) })
                                            : setNewPlan({ ...newPlan, services_limit: parseInt(e.target.value) })
                                        }
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Badge */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Badge Text (optional)</label>
                                        <input
                                            type="text"
                                            value={editingPlan?.badge_text || newPlan.badge_text}
                                            onChange={(e) => editingPlan
                                                ? setEditingPlan({ ...editingPlan, badge_text: e.target.value })
                                                : setNewPlan({ ...newPlan, badge_text: e.target.value })
                                            }
                                            placeholder="e.g., Popular, Best Value"
                                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Badge Color</label>
                                        <select
                                            value={editingPlan?.badge_color || newPlan.badge_color}
                                            onChange={(e) => editingPlan
                                                ? setEditingPlan({ ...editingPlan, badge_color: e.target.value })
                                                : setNewPlan({ ...newPlan, badge_color: e.target.value })
                                            }
                                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            {BADGE_COLORS.map(c => (
                                                <option key={c.value} value={c.value}>{c.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Features */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Features (one per line)</label>
                                    <textarea
                                        value={(editingPlan?.features || newPlan.features).join('\n')}
                                        onChange={(e) => {
                                            const features = e.target.value.split('\n');
                                            editingPlan
                                                ? setEditingPlan({ ...editingPlan, features })
                                                : setNewPlan({ ...newPlan, features });
                                        }}
                                        rows={5}
                                        placeholder="Enter each feature on a new line"
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                    />
                                </div>

                                {/* Options */}
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editingPlan?.is_popular ?? newPlan.is_popular}
                                            onChange={(e) => editingPlan
                                                ? setEditingPlan({ ...editingPlan, is_popular: e.target.checked })
                                                : setNewPlan({ ...newPlan, is_popular: e.target.checked })
                                            }
                                            className="w-5 h-5 rounded border-gray-600 text-primary-600 focus:ring-primary-500 bg-gray-900"
                                        />
                                        <span className="text-sm font-medium text-gray-300">Mark as Popular</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editingPlan?.is_active ?? newPlan.is_active}
                                            onChange={(e) => editingPlan
                                                ? setEditingPlan({ ...editingPlan, is_active: e.target.checked })
                                                : setNewPlan({ ...newPlan, is_active: e.target.checked })
                                            }
                                            className="w-5 h-5 rounded border-gray-600 text-primary-600 focus:ring-primary-500 bg-gray-900"
                                        />
                                        <span className="text-sm font-medium text-gray-300">Active</span>
                                    </label>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-700 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setIsAddingPlan(false);
                                        setEditingPlan(null);
                                        resetNewPlan();
                                    }}
                                    className="px-6 py-3 bg-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={editingPlan ? handleUpdatePlan : handleAddPlan}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            {editingPlan ? 'Update Plan' : 'Create Plan'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
