'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, BellRing, Check, CheckCheck, Trash2, Settings,
    ShoppingBag, MessageSquare, Star, BadgeCheck, Tag,
    Package, AlertCircle, Gift, Megaphone, Clock,
    ChevronRight, Filter, MoreHorizontal, X
} from 'lucide-react';

// Notification Types
type NotificationType = 'order' | 'message' | 'review' | 'promotion' | 'system' | 'follow';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    actionUrl?: string;
    imageUrl?: string;
    vendorName?: string;
}

// Mock notifications data
const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'order',
        title: 'Order Confirmed',
        message: 'Your order #WNX-2024-8742 has been confirmed and is being processed by TechCraft Studios.',
        timestamp: '2 minutes ago',
        isRead: false,
        actionUrl: '/orders/WNX-2024-8742',
        vendorName: 'TechCraft Studios',
        imageUrl: 'https://ui-avatars.com/api/?name=TechCraft&background=0c8bff&color=fff&size=100',
    },
    {
        id: '2',
        type: 'message',
        title: 'New Message from PixelPerfect Design',
        message: 'Hi! We\'ve reviewed your requirements and have some exciting ideas to share. When would be a good time to discuss?',
        timestamp: '15 minutes ago',
        isRead: false,
        actionUrl: '/messages/pixelperfect-design',
        vendorName: 'PixelPerfect Design',
        imageUrl: 'https://ui-avatars.com/api/?name=PixelPerfect&background=f59e0b&color=fff&size=100',
    },
    {
        id: '3',
        type: 'promotion',
        title: '🎉 Flash Sale! 30% Off All Services',
        message: 'Limited time offer! Get 30% off on all web development and design services. Use code: FLASH30',
        timestamp: '1 hour ago',
        isRead: false,
        actionUrl: '/services?promo=FLASH30',
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100',
    },
    {
        id: '4',
        type: 'review',
        title: 'Your Review was Helpful!',
        message: '5 people found your review for "Enterprise Web Development" helpful. Thank you for sharing your experience!',
        timestamp: '3 hours ago',
        isRead: true,
        actionUrl: '/reviews/my-reviews',
        vendorName: 'TechCraft Studios',
        imageUrl: 'https://ui-avatars.com/api/?name=TechCraft&background=0c8bff&color=fff&size=100',
    },
    {
        id: '5',
        type: 'order',
        title: 'Project Milestone Completed',
        message: 'AppForge Inc has completed Milestone 2: "UI/UX Design Phase" for your mobile app project.',
        timestamp: '5 hours ago',
        isRead: true,
        actionUrl: '/orders/WNX-2024-8695',
        vendorName: 'AppForge Inc',
        imageUrl: 'https://ui-avatars.com/api/?name=AppForge&background=22c55e&color=fff&size=100',
    },
    {
        id: '6',
        type: 'follow',
        title: 'AI Solutions Lab Started Following You',
        message: 'You have a new follower! AI Solutions Lab is now following your activity on WENWEX.',
        timestamp: '1 day ago',
        isRead: true,
        actionUrl: '/vendors/ai-solutions-lab',
        vendorName: 'AI Solutions Lab',
        imageUrl: 'https://ui-avatars.com/api/?name=AI+Lab&background=d946ef&color=fff&size=100',
    },
    {
        id: '7',
        type: 'system',
        title: 'Account Security Update',
        message: 'We\'ve added new security features to protect your account. Review your security settings to stay protected.',
        timestamp: '2 days ago',
        isRead: true,
        actionUrl: '/settings/security',
        imageUrl: undefined,
    },
    {
        id: '8',
        type: 'promotion',
        title: 'New Service Recommendation',
        message: 'Based on your interests, you might like "Custom CRM Solutions" by TechCraft Studios.',
        timestamp: '3 days ago',
        isRead: true,
        actionUrl: '/services/custom-crm-solutions',
        vendorName: 'TechCraft Studios',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100',
    },
    {
        id: '9',
        type: 'message',
        title: 'Project Discussion',
        message: 'SecureShield Cyber sent you project files for review. Please check and provide your feedback.',
        timestamp: '4 days ago',
        isRead: true,
        actionUrl: '/messages/secureshield-cyber',
        vendorName: 'SecureShield Cyber',
        imageUrl: 'https://ui-avatars.com/api/?name=SecureShield&background=ef4444&color=fff&size=100',
    },
    {
        id: '10',
        type: 'order',
        title: 'Payment Successful',
        message: 'Your payment of $2,999 for "Enterprise Web Development" has been processed successfully.',
        timestamp: '1 week ago',
        isRead: true,
        actionUrl: '/orders/WNX-2024-8700',
        vendorName: 'TechCraft Studios',
        imageUrl: 'https://ui-avatars.com/api/?name=TechCraft&background=0c8bff&color=fff&size=100',
    },
];

const notificationTypeConfig: Record<NotificationType, { icon: any; bgColor: string; iconColor: string }> = {
    order: { icon: Package, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
    message: { icon: MessageSquare, bgColor: 'bg-green-100', iconColor: 'text-green-600' },
    review: { icon: Star, bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' },
    promotion: { icon: Tag, bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
    system: { icon: AlertCircle, bgColor: 'bg-gray-100', iconColor: 'text-gray-600' },
    follow: { icon: BadgeCheck, bgColor: 'bg-pink-100', iconColor: 'text-pink-600' },
};

const filterOptions = [
    { value: 'all', label: 'All Notifications' },
    { value: 'unread', label: 'Unread' },
    { value: 'order', label: 'Orders' },
    { value: 'message', label: 'Messages' },
    { value: 'promotion', label: 'Promotions' },
    { value: 'system', label: 'System' },
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [filter, setFilter] = useState('all');
    const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.isRead;
        return n.type === filter;
    });

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, isRead: true }))
        );
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const deleteSelected = () => {
        setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
        setSelectedNotifications([]);
    };

    const toggleSelect = (id: string) => {
        setSelectedNotifications(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedNotifications.length === filteredNotifications.length) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(filteredNotifications.map(n => n.id));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="container-custom py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <Bell className="w-6 h-6 text-white" />
                                </div>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                                <p className="text-sm text-gray-500">
                                    {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="btn-outline flex items-center gap-2"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                    Mark All Read
                                </button>
                            )}
                            <Link href="/settings/notifications" className="btn-ghost p-2.5 rounded-xl">
                                <Settings className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-24">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Filter
                            </h3>
                            <div className="space-y-1">
                                {filterOptions.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setFilter(option.value)}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === option.value
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {option.label}
                                        {option.value === 'unread' && unreadCount > 0 && (
                                            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Quick Stats */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                    Quick Stats
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Total</span>
                                        <span className="font-medium text-gray-900">{notifications.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Unread</span>
                                        <span className="font-medium text-blue-600">{unreadCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">This Week</span>
                                        <span className="font-medium text-gray-900">
                                            {notifications.filter(n => !n.timestamp.includes('week') && !n.timestamp.includes('day')).length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="lg:col-span-3">
                        {/* Bulk Actions */}
                        {selectedNotifications.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4 flex items-center justify-between"
                            >
                                <span className="text-sm font-medium text-blue-700">
                                    {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} selected
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            selectedNotifications.forEach(id => markAsRead(id));
                                            setSelectedNotifications([]);
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                    >
                                        <Check className="w-4 h-4" />
                                        Mark Read
                                    </button>
                                    <button
                                        onClick={deleteSelected}
                                        className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Select All */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={selectAll}
                                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
                            >
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'border-gray-300'
                                    }`}>
                                    {selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0 && (
                                        <Check className="w-3 h-3 text-white" />
                                    )}
                                </div>
                                Select All
                            </button>
                            <p className="text-sm text-gray-500">
                                Showing {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* Notifications */}
                        <div className="space-y-3">
                            <AnimatePresence>
                                {filteredNotifications.length > 0 ? (
                                    filteredNotifications.map((notification, index) => {
                                        const config = notificationTypeConfig[notification.type];
                                        const IconComponent = config.icon;

                                        return (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={`card group hover:shadow-lg transition-all duration-300 cursor-pointer ${!notification.isRead ? 'bg-blue-50/50 border-blue-100' : ''
                                                    }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Checkbox */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleSelect(notification.id);
                                                        }}
                                                        className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors mt-1 ${selectedNotifications.includes(notification.id)
                                                            ? 'bg-blue-600 border-blue-600'
                                                            : 'border-gray-300 hover:border-blue-400'
                                                            }`}
                                                    >
                                                        {selectedNotifications.includes(notification.id) && (
                                                            <Check className="w-3 h-3 text-white" />
                                                        )}
                                                    </button>

                                                    {/* Icon/Image */}
                                                    <div className="relative flex-shrink-0">
                                                        {notification.imageUrl ? (
                                                            <Image
                                                                src={notification.imageUrl}
                                                                alt=""
                                                                width={48}
                                                                height={48}
                                                                className="rounded-xl object-cover"
                                                            />
                                                        ) : (
                                                            <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center`}>
                                                                <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
                                                            </div>
                                                        )}
                                                        {!notification.isRead && (
                                                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0" onClick={() => markAsRead(notification.id)}>
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className={`font-semibold truncate ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                                                    {notification.title}
                                                                </h3>
                                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                                    {notification.message}
                                                                </p>
                                                                <div className="flex items-center gap-3 mt-2">
                                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        {notification.timestamp}
                                                                    </span>
                                                                    {notification.vendorName && (
                                                                        <span className="text-xs text-blue-600 font-medium">
                                                                            {notification.vendorName}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {!notification.isRead && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            markAsRead(notification.id);
                                                                        }}
                                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                                        title="Mark as read"
                                                                    >
                                                                        <Check className="w-4 h-4 text-gray-500" />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteNotification(notification.id);
                                                                    }}
                                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                                                </button>
                                                                {notification.actionUrl && (
                                                                    <Link
                                                                        href={notification.actionUrl}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                                        title="View details"
                                                                    >
                                                                        <ChevronRight className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="card text-center py-16"
                                    >
                                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                                            <Bell className="w-10 h-10 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {filter === 'unread' ? 'All Caught Up!' : 'No Notifications'}
                                        </h3>
                                        <p className="text-gray-500 mb-6">
                                            {filter === 'unread'
                                                ? 'You have no unread notifications.'
                                                : 'You\'ll see notifications here when you have them.'}
                                        </p>
                                        {filter !== 'all' && (
                                            <button
                                                onClick={() => setFilter('all')}
                                                className="btn-outline"
                                            >
                                                View All Notifications
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Load More */}
                        {filteredNotifications.length > 0 && (
                            <div className="mt-8 text-center">
                                <button className="btn-outline">
                                    Load More Notifications
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
