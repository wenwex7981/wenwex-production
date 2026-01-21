'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, BellRing, Check, CheckCheck,
    Package, MessageSquare, Star, Tag,
    AlertCircle, BadgeCheck, Clock, ChevronRight,
    Settings, X
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
}

// Mock notifications data (recent ones only for panel)
const recentNotifications: Notification[] = [
    {
        id: '1',
        type: 'order',
        title: 'Order Confirmed',
        message: 'Your order #WNX-2024-8742 has been confirmed.',
        timestamp: '2 min ago',
        isRead: false,
        actionUrl: '/orders/WNX-2024-8742',
        imageUrl: 'https://ui-avatars.com/api/?name=TC&background=0c8bff&color=fff&size=100',
    },
    {
        id: '2',
        type: 'message',
        title: 'New Message',
        message: 'PixelPerfect Design: "We\'ve reviewed your requirements..."',
        timestamp: '15 min ago',
        isRead: false,
        actionUrl: '/messages',
        imageUrl: 'https://ui-avatars.com/api/?name=PP&background=f59e0b&color=fff&size=100',
    },
    {
        id: '3',
        type: 'promotion',
        title: '🎉 Flash Sale!',
        message: 'Get 30% off on all services. Code: FLASH30',
        timestamp: '1h ago',
        isRead: false,
        actionUrl: '/services',
    },
    {
        id: '4',
        type: 'review',
        title: 'Review Helpful',
        message: '5 people found your review helpful.',
        timestamp: '3h ago',
        isRead: true,
        actionUrl: '/reviews',
    },
    {
        id: '5',
        type: 'order',
        title: 'Milestone Completed',
        message: 'AppForge Inc completed "UI/UX Design Phase"',
        timestamp: '5h ago',
        isRead: true,
        actionUrl: '/orders',
        imageUrl: 'https://ui-avatars.com/api/?name=AF&background=22c55e&color=fff&size=100',
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

import { useNotifications } from '@/components/providers/NotificationProvider';

// ... (keep types if useful, or adapt)

export default function NotificationPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead, refresh } = useNotifications();
    const panelRef = useRef<HTMLDivElement>(null);

    // Refresh on open
    useEffect(() => {
        if (isOpen) {
            refresh();
        }
    }, [isOpen, refresh]);

    // Close panel when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper to format time
    const timeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors group"
                aria-label="Notifications"
            >
                <Bell className={`w-5 h-5 transition-colors ${isOpen ? 'text-blue-600' : 'text-gray-600 group-hover:text-gray-900'}`} />

                {/* Notification Badge */}
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                            <div className="flex items-center gap-2">
                                <BellRing className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-900">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="p-1.5 hover:bg-white/80 rounded-lg transition-colors"
                                        title="Mark all as read"
                                    >
                                        <CheckCheck className="w-4 h-4 text-gray-500" />
                                    </button>
                                )}
                                <Link
                                    href="/settings/notifications"
                                    className="p-1.5 hover:bg-white/80 rounded-lg transition-colors"
                                    title="Settings"
                                >
                                    <Settings className="w-4 h-4 text-gray-500" />
                                </Link>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-white/80 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {notifications.map((notification) => {
                                        const typeKey = (notification.type || 'system').toLowerCase() as NotificationType;
                                        const config = notificationTypeConfig[typeKey] || notificationTypeConfig.system;
                                        const IconComponent = config.icon;

                                        return (
                                            <Link
                                                key={notification.id}
                                                href={notification.link || '/notifications'}
                                                onClick={() => markAsRead(notification.id)}
                                                className={`flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50/30' : ''
                                                    }`}
                                            >
                                                {/* Icon */}
                                                <div className="relative flex-shrink-0">
                                                    <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center`}>
                                                        <IconComponent className={`w-4 h-4 ${config.iconColor}`} />
                                                    </div>
                                                    {!notification.isRead && (
                                                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white" />
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className={`text-sm font-medium truncate ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                        <Clock className="w-2.5 h-2.5" />
                                                        {timeAgo(notification.createdAt)}
                                                    </span>
                                                </div>

                                                {/* Arrow */}
                                                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-2" />
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-12 px-5 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Bell className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-1">All Caught Up!</h4>
                                    <p className="text-sm text-gray-500">No notifications right now.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                            <Link
                                href="/notifications"
                                onClick={() => setIsOpen(false)}
                                className="block w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                View All Notifications
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
