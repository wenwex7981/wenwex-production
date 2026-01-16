
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
 * Get or create a conversation between a buyer and vendor
 * Uses Supabase Auth user ID directly (not the users table ID)
 */
export async function getOrCreateConversation(buyerAuthId: string, vendorId: string, serviceId?: string): Promise<Conversation> {
    // First, check if conversation already exists
    const { data: existing, error: fetchError } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('buyer_id', buyerAuthId)
        .eq('vendor_id', vendorId)
        .maybeSingle();

    if (fetchError) {
        console.error('Fetch conversation error:', fetchError);
        // If table doesn't exist, provide helpful message
        if (fetchError.message?.includes('does not exist') || fetchError.code === '42P01') {
            throw new Error('Chat system not configured. Please run database setup.');
        }
        throw new Error('Chat service temporarily unavailable');
    }

    if (existing) {
        return existing;
    }

    // Create new conversation
    const insertData: any = {
        buyer_id: buyerAuthId,
        vendor_id: vendorId,
        status: 'OPEN'
    };

    if (serviceId) {
        insertData.service_id = serviceId;
    }

    const { data: newConv, error: createError } = await supabase
        .from('chat_conversations')
        .insert(insertData)
        .select('*')
        .single();

    if (createError) {
        console.error('Create conversation error:', createError);

        // Handle specific errors
        if (createError.message?.includes('does not exist') || createError.code === '42P01') {
            throw new Error('Chat system not configured. Please run database setup.');
        }
        if (createError.message?.includes('violates foreign key')) {
            throw new Error('Invalid user or vendor reference');
        }

        throw new Error('Unable to start chat. Please try again.');
    }

    return newConv;
}

/**
 * Fetch all conversations for a user
 */
export async function fetchConversations(userId: string, role: 'BUYER' | 'VENDOR' | 'SUPER_ADMIN'): Promise<Conversation[]> {
    try {
        let query = supabase
            .from('chat_conversations')
            .select('*')
            .order('updated_at', { ascending: false });

        if (role === 'BUYER') {
            query = query.eq('buyer_id', userId);
        } else if (role === 'VENDOR') {
            // For vendors, we need to find their vendor ID first
            const { data: vendor } = await supabase
                .from('vendors')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (vendor) {
                query = query.eq('vendor_id', vendor.id);
            } else {
                return []; // No vendor profile found
            }
        }
        // SUPER_ADMIN sees all - no filter needed

        const { data, error } = await query;

        if (error) {
            console.error('Fetch conversations error:', error);
            return [];
        }

        // Enrich with vendor/buyer names
        if (data && data.length > 0) {
            const enrichedData = await Promise.all(data.map(async (conv) => {
                // Get vendor info
                const { data: vendor } = await supabase
                    .from('vendors')
                    .select('company_name, logo_url')
                    .eq('id', conv.vendor_id)
                    .single();

                // Get buyer info from users table or auth
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
