'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Settings, Bell, Lock, CreditCard, Heart,
    Camera, Save, Loader2, Mail, Phone, MapPin,
    Shield, Eye, EyeOff, Check, ChevronRight, Star, Trash2
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { getSupabaseClient } from '@/lib/supabase';
import { useCurrencyStore } from '@/lib/currency-store';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

// Buyer Settings Page - Profile, Notifications, Security, Saved Items
export default function BuyerSettingsPage() {
    const { user, isAuthenticated } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedServices, setSavedServices] = useState<any[]>([]);
    const [loadingSaved, setLoadingSaved] = useState(false);
    const supabase = getSupabaseClient();
    const formatPrice = useCurrencyStore((state) => state.formatPrice);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        country: '',
        bio: '',
        avatar_url: '',
        notification_email: true,
        notification_push: true,
        notification_sms: false,
        marketing_emails: false,
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [showPasswords, setShowPasswords] = useState(false);

    useEffect(() => {
        if (user) {
            loadUserProfile();
        }
    }, [user]);

    // Load saved items when tab changes
    useEffect(() => {
        if (activeTab === 'saved' && user) {
            loadSavedItems();
        }
    }, [activeTab, user]);

    const loadSavedItems = async () => {
        if (!user?.id) return;
        setLoadingSaved(true);

        try {
            // Fetch saved services with service details
            const { data: savedData, error } = await supabase
                .from('saved_services')
                .select(`
                    id,
                    created_at,
                    service:services (
                        id,
                        title,
                        slug,
                        price,
                        image_url,
                        rating,
                        vendor:vendors (
                            company_name,
                            slug
                        )
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading saved items:', error);
            } else {
                setSavedServices(savedData || []);
            }
        } catch (error) {
            console.error('Error loading saved items:', error);
        } finally {
            setLoadingSaved(false);
        }
    };

    const handleRemoveSaved = async (savedId: string) => {
        try {
            const { error } = await supabase
                .from('saved_services')
                .delete()
                .eq('id', savedId);

            if (error) throw error;

            setSavedServices(prev => prev.filter(s => s.id !== savedId));
            toast.success('Removed from saved');
        } catch (error) {
            console.error('Error removing saved item:', error);
            toast.error('Failed to remove');
        }
    };

    const loadUserProfile = async () => {
        if (!user?.id) return;
        setIsLoading(true);

        try {
            // Get user data from users table
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setFormData({
                    full_name: data.full_name || (user as any)?.user_metadata?.full_name || '',
                    email: data.email || user.email || '',
                    phone_number: data.phone_number || '',
                    country: data.country || '',
                    bio: data.bio || '',
                    avatar_url: data.avatar_url || (user as any)?.user_metadata?.avatar_url || '',
                    notification_email: data.notification_email ?? true,
                    notification_push: data.notification_push ?? true,
                    notification_sms: data.notification_sms ?? false,
                    marketing_emails: data.marketing_emails ?? false,
                });
            } else {
                // Use auth user data
                setFormData({
                    ...formData,
                    full_name: (user as any)?.user_metadata?.full_name || '',
                    email: user.email || '',
                    avatar_url: (user as any)?.user_metadata?.avatar_url || '',
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!user?.id) return;
        setIsSaving(true);

        try {
            // Upsert user data
            const { error } = await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    full_name: formData.full_name,
                    email: formData.email,
                    phone_number: formData.phone_number,
                    country: formData.country,
                    bio: formData.bio,
                    avatar_url: formData.avatar_url,
                    notification_email: formData.notification_email,
                    notification_push: formData.notification_push,
                    notification_sms: formData.notification_sms,
                    marketing_emails: formData.marketing_emails,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            toast.success('Profile updated successfully!');
        } catch (error: any) {
            console.error('Error saving profile:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error('Passwords do not match');
            return;
        }

        if (passwordData.new_password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setIsSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.new_password
            });

            if (error) throw error;
            toast.success('Password updated successfully!');
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (error: any) {
            toast.error(error.message || 'Failed to update password');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('users')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('users')
                .getPublicUrl(filePath);

            setFormData({ ...formData, avatar_url: publicUrl });
            toast.success('Avatar uploaded!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload avatar');
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'saved', label: 'Saved Items', icon: Heart },
    ];

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-500 mb-6">Please sign in to access your settings</p>
                    <Link href="/auth/signin" className="btn-primary">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container-custom max-w-5xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Account Settings</h1>
                    <p className="text-gray-500 font-medium">Manage your profile and preferences</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="bg-white p-3 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-300 font-bold ${activeTab === tab.id
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                                        : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-300'}`} />
                                    <span className="text-sm">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        {activeTab === 'profile' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Avatar Section */}
                                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                    <h2 className="text-xs font-black text-primary-600 uppercase tracking-widest mb-6">Profile Photo</h2>
                                    <div className="flex items-center gap-6">
                                        <div className="relative group w-24 h-24">
                                            <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                                                {formData.avatar_url ? (
                                                    <img src={formData.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{(formData.full_name || 'U')[0].toUpperCase()}</span>
                                                )}
                                            </div>
                                            <label
                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center cursor-pointer"
                                            >
                                                <Camera className="w-6 h-6 text-white" />
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleAvatarUpload}
                                                />
                                            </label>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Upload new photo</p>
                                            <p className="text-sm text-gray-500">JPG, PNG, GIF. Max 2MB</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Info */}
                                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                    <h2 className="text-xs font-black text-primary-600 uppercase tracking-widest mb-6">Personal Information</h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                                            <input
                                                type="text"
                                                value={formData.full_name}
                                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                className="w-full h-14 px-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium text-gray-900"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full h-14 px-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium text-gray-900"
                                                placeholder="john@example.com"
                                                disabled
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={formData.phone_number}
                                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                                className="w-full h-14 px-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium text-gray-900"
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Country</label>
                                            <input
                                                type="text"
                                                value={formData.country}
                                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                className="w-full h-14 px-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium text-gray-900"
                                                placeholder="India"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Bio</label>
                                            <textarea
                                                rows={4}
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                className="w-full p-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium text-gray-900 resize-none"
                                                placeholder="Tell us about yourself..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all active:scale-[0.98] flex items-center gap-3"
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'notifications' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6"
                            >
                                <h2 className="text-xs font-black text-primary-600 uppercase tracking-widest mb-6">Notification Preferences</h2>

                                {[
                                    { id: 'notification_email', label: 'Email Notifications', desc: 'Receive updates via email' },
                                    { id: 'notification_push', label: 'Push Notifications', desc: 'Receive in-app notifications' },
                                    { id: 'notification_sms', label: 'SMS Notifications', desc: 'Receive updates via SMS' },
                                    { id: 'marketing_emails', label: 'Marketing Communications', desc: 'Promotional offers and news' },
                                ].map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                                        <div>
                                            <p className="font-bold text-gray-900">{item.label}</p>
                                            <p className="text-sm text-gray-500">{item.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => setFormData({ ...formData, [item.id]: !formData[item.id as keyof typeof formData] })}
                                            className={`w-14 h-8 rounded-full transition-colors ${formData[item.id as keyof typeof formData] ? 'bg-primary-600' : 'bg-gray-300'
                                                } relative`}
                                        >
                                            <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${formData[item.id as keyof typeof formData] ? 'left-7' : 'left-1'
                                                }`} />
                                        </button>
                                    </div>
                                ))}

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all active:scale-[0.98] flex items-center gap-3"
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Save Preferences
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'security' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6"
                            >
                                <h2 className="text-xs font-black text-primary-600 uppercase tracking-widest mb-6">Change Password</h2>

                                <div className="space-y-4 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Current Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords ? 'text' : 'password'}
                                                value={passwordData.current_password}
                                                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                                className="w-full h-14 px-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium text-gray-900"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(!showPasswords)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                            >
                                                {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">New Password</label>
                                        <input
                                            type={showPasswords ? 'text' : 'password'}
                                            value={passwordData.new_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                            className="w-full h-14 px-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium text-gray-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Confirm New Password</label>
                                        <input
                                            type={showPasswords ? 'text' : 'password'}
                                            value={passwordData.confirm_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                            className="w-full h-14 px-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-start pt-4">
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={isSaving}
                                        className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all active:scale-[0.98] flex items-center gap-3"
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                                        Update Password
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'saved' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Saved Services</h3>

                                {loadingSaved ? (
                                    <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
                                        <p className="text-gray-500 mt-4">Loading saved items...</p>
                                    </div>
                                ) : savedServices.length === 0 ? (
                                    <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center">
                                        <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">No Saved Items</h4>
                                        <p className="text-gray-500 max-w-sm mx-auto mb-6">
                                            Services you save will appear here for quick access.
                                        </p>
                                        <Link href="/services" className="btn-primary">
                                            Explore Services
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {savedServices.map((item) => (
                                            <div
                                                key={item.id}
                                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-center gap-4 p-4">
                                                    <Link
                                                        href={`/services/${item.service?.slug}`}
                                                        className="w-24 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0"
                                                    >
                                                        <img
                                                            src={item.service?.image_url || 'https://images.unsplash.com/photo-1557821552-17105176677c?w=200'}
                                                            alt={item.service?.title}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=200';
                                                            }}
                                                        />
                                                    </Link>
                                                    <div className="flex-1 min-w-0">
                                                        <Link
                                                            href={`/services/${item.service?.slug}`}
                                                            className="font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1"
                                                        >
                                                            {item.service?.title || 'Service'}
                                                        </Link>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            by {item.service?.vendor?.company_name || 'Vendor'}
                                                        </p>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className="font-bold text-primary-600">
                                                                {formatPrice(item.service?.price || 0)}
                                                            </span>
                                                            {item.service?.rating && (
                                                                <span className="flex items-center gap-1 text-sm text-gray-500">
                                                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                                    {item.service.rating}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveSaved(item.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Remove from saved"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
