
import { getSupabaseClient } from './supabase';

const supabase = getSupabaseClient();

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
    sender_name?: string;
    sender_avatar?: string;
}

export interface Conversation {
    id: string;
    buyer_id: string;
    vendor_id: string;
    service_id?: string;
    created_at: string;
    updated_at: string;
    last_message?: string;
    vendor_name?: string;
    vendor_logo?: string;
    buyer_name?: string;
    buyer_avatar?: string;
    vendor?: {
        company_name: string;
        logo_url: string;
    };
    buyer?: {
        full_name: string;
        avatar_url: string;
    };
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
    const { data: message, error } = await supabase
        .from('chat_messages')
        .insert({
            conversation_id: conversationId,
            sender_id: senderId,
            content: content
        })
        .select('*')
        .single();

    if (error) {
        console.error('Send message error:', error);
        throw new Error('Failed to send message');
    }

    // Update conversation timestamp
    await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

    return message;
}

/**
 * Fetch all conversations for a vendor
 */
export async function fetchConversations(userId: string, role: string): Promise<Conversation[]> {
    try {
        // For vendors, we need to find their vendor ID first
        const { data: vendor } = await supabase
            .from('vendors')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (!vendor) {
            console.log('No vendor profile found for user:', userId);
            return [];
        }

        const { data, error } = await supabase
            .from('chat_conversations')
            .select('*')
            .eq('vendor_id', vendor.id)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Fetch conversations error:', error);
            return [];
        }

        // Enrich with buyer names
        if (data && data.length > 0) {
            const enrichedData = await Promise.all(data.map(async (conv) => {
                // Get buyer info
                const { data: buyer } = await supabase
                    .from('users')
                    .select('full_name, avatar_url')
                    .eq('id', conv.buyer_id)
                    .single();

                return {
                    ...conv,
                    buyer_name: buyer?.full_name || 'Customer',
                    buyer_avatar: buyer?.avatar_url,
                    buyer: buyer ? { full_name: buyer.full_name, avatar_url: buyer.avatar_url } : { full_name: 'Customer', avatar_url: null },
                };
            }));
            return enrichedData;
        }

        return data || [];
    } catch (error) {
        console.error('fetchConversations error:', error);
        return [];
    }
}

/**
 * Fetch messages for a conversation
 */
export async function fetchMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Fetch messages error:', error);
        return [];
    }

    return data || [];
}

/**
 * Subscribe to new messages in a conversation (real-time)
 */
export function subscribeToMessages(conversationId: string, onMessage: (message: Message) => void) {
    return supabase
        .channel(`chat:${conversationId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `conversation_id=eq.${conversationId}`
            },
            (payload) => {
                onMessage(payload.new as Message);
            }
        )
        .subscribe();
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(conversationId: string, userId: string) {
    const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId);

    if (error) {
        console.error('Mark messages read error:', error);
    }
}
