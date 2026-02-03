'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { getSupabaseClient } from '@/lib/supabase';
import { fetchUnreadNotifications, markNotificationAsRead, markAllNotificationsAsRead, NotificationItem } from '@/lib/notifications';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';

interface NotificationContextType {
    notifications: NotificationItem[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refresh: () => Promise<void>;
    isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    markAsRead: async () => { },
    markAllAsRead: async () => { },
    refresh: async () => { },
    isConnected: false,
});

export function useNotifications() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const supabase = getSupabaseClient();
    const subscriptionRef = useRef<any>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const refresh = useCallback(async () => {
        if (!user?.id) return;
        try {
            const data = await fetchUnreadNotifications(user.id);
            setNotifications(data);
        } catch (error) {
            console.error('Failed to refresh notifications:', error);
        }
    }, [user?.id]);

    const markAsRead = async (id: string) => {
        await markNotificationAsRead(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const markAllAsRead = async () => {
        if (!user?.id) return;
        // Call server to mark all as read
        await markAllNotificationsAsRead(user.id);
        // Optimistic update
        setNotifications([]);
    };

    useEffect(() => {
        if (!user?.id) {
            setNotifications([]);
            setIsConnected(false);
            return;
        }

        // Initial fetch
        refresh();

        // Cleanup function for retry timeout
        const cleanupRetry = () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
                retryTimeoutRef.current = null;
            }
        };

        // Set up realtime subscription with unique channel name per user
        const channelName = `notifications:${user.id}`;
        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    const newNotification = payload.new as NotificationItem;

                    // Update state
                    setNotifications(prev => [newNotification, ...prev]);

                    // Show toast
                    toast((t) => (
                        <div className="flex items-start gap-3" onClick={() => toast.dismiss(t.id)}>
                            <div className="bg-primary-100 p-2 rounded-full text-primary-600">
                                <Bell size={18} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">{newNotification.title}</h4>
                                <p className="text-sm text-gray-500">{newNotification.message}</p>
                            </div>
                        </div>
                    ), {
                        duration: 5000,
                        position: 'top-right',
                    });
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setIsConnected(true);
                    console.log('Realtime notifications connected');
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    setIsConnected(false);
                    console.warn('Realtime notifications disconnected, will retry...');
                    // Retry connection after 5 seconds
                    cleanupRetry();
                    retryTimeoutRef.current = setTimeout(() => {
                        refresh();
                    }, 5000);
                }
            });

        subscriptionRef.current = channel;

        return () => {
            cleanupRetry();
            if (subscriptionRef.current) {
                supabase.removeChannel(subscriptionRef.current);
            }
            setIsConnected(false);
        };
    }, [user?.id, refresh]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount: notifications.length,
            markAsRead,
            markAllAsRead,
            refresh,
            isConnected
        }}>
            {children}
        </NotificationContext.Provider>
    );
}
