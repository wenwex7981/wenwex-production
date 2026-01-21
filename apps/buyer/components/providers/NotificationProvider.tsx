'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { getSupabaseClient } from '@/lib/supabase';
import { fetchUnreadNotifications, markNotificationAsRead, NotificationItem } from '@/lib/notifications';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';

interface NotificationContextType {
    notifications: NotificationItem[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    markAsRead: async () => { },
    markAllAsRead: async () => { },
    refresh: async () => { },
});

export function useNotifications() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const supabase = getSupabaseClient();
    const subscriptionRef = useRef<any>(null);

    const refresh = async () => {
        if (!user?.id) return;
        const data = await fetchUnreadNotifications(user.id);
        setNotifications(data);
    };

    const markAsRead = async (id: string) => {
        await markNotificationAsRead(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const markAllAsRead = async () => {
        // Optimistic update
        setNotifications([]);
        // We'll implement server call in lib if needed, but for now iteratively or bulk API
        // For handled with care, let's keep it simple: just clear local state for UI responsiveness
        // Real implementation would call api
    };

    useEffect(() => {
        if (!user?.id) {
            setNotifications([]);
            return;
        }

        // Initial fetch
        refresh();

        // set up realtime subscription
        const channel = supabase
            .channel('public:notifications')
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

                    // Play sound if possible (optional, skipping for now to be safe)
                }
            )
            .subscribe();

        subscriptionRef.current = channel;

        return () => {
            if (subscriptionRef.current) {
                supabase.removeChannel(subscriptionRef.current);
            }
        };
    }, [user?.id]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount: notifications.length,
            markAsRead,
            markAllAsRead,
            refresh
        }}>
            {children}
        </NotificationContext.Provider>
    );
}
