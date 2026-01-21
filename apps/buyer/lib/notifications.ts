
import { getSupabaseClient } from './supabase';

const supabase = getSupabaseClient();

export type NotificationType = 'SYSTEM' | 'ORDER' | 'PAYMENT' | 'MESSAGE' | 'OTHER';

export interface NotificationItem {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

/**
 * Fetch unread notifications for a user
 */
export async function fetchUnreadNotifications(userId: string) {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }

    return data as NotificationItem[];
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

    if (error) {
        console.error('Error marking notification as read:', error);
        return false;
    }
    return true;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
    }
    return true;
}

/**
 * Create a notification (Server-side or Admin usage)
 */
export async function createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = 'SYSTEM',
    link?: string
) {
    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            title,
            message,
            type,
            link
        });

    if (error) {
        console.error('Error creating notification:', error);
        return false;
    }
    return true;
}
