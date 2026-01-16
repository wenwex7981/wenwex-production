
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
 * Send a message in a conversation (Admin intervention)
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
 * Fetch ALL conversations (Admin sees everything)
 */
export async function fetchConversations(): Promise<Conversation[]> {
    try {
        const { data, error } = await supabase
            .from('chat_conversations')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Fetch conversations error:', error);
            return [];
        }

        // Enrich with vendor and buyer names
        if (data && data.length > 0) {
            const enrichedData = await Promise.all(data.map(async (conv) => {
                // Get vendor info
                const { data: vendor } = await supabase
                    .from('vendors')
                    .select('company_name, logo_url')
                    .eq('id', conv.vendor_id)
                    .single();

                // Get buyer info
                const { data: buyer } = await supabase
                    .from('users')
                    .select('full_name, avatar_url')
                    .eq('id', conv.buyer_id)
                    .single();

                return {
                    ...conv,
                    vendor_name: vendor?.company_name || 'Unknown Vendor',
                    vendor_logo: vendor?.logo_url,
                    buyer_name: buyer?.full_name || 'Anonymous',
                    buyer_avatar: buyer?.avatar_url,
                    vendor: vendor ? { company_name: vendor.company_name, logo_url: vendor.logo_url } : undefined,
                    buyer: buyer ? { full_name: buyer.full_name, avatar_url: buyer.avatar_url } : undefined,
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
