-- =============================================
-- WENWEX CHAT TABLES - RUN IN SUPABASE SQL EDITOR
-- =============================================

-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_buyer_id ON chat_conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_vendor_id ON chat_conversations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated_at ON chat_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Enable Row Level Security
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_conversations
CREATE POLICY "Users can view their own conversations" ON chat_conversations
    FOR SELECT USING (
        auth.uid() = buyer_id OR 
        auth.uid() IN (SELECT user_id FROM vendors WHERE id = vendor_id)
    );

CREATE POLICY "Users can insert conversations" ON chat_conversations
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update their conversations" ON chat_conversations
    FOR UPDATE USING (
        auth.uid() = buyer_id OR 
        auth.uid() IN (SELECT user_id FROM vendors WHERE id = vendor_id)
    );

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their conversations" ON chat_messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM chat_conversations 
            WHERE buyer_id = auth.uid() OR 
                  vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Enable Realtime for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_conversations;

-- Grant permissions (for development - adjust for production)
GRANT ALL ON chat_conversations TO authenticated;
GRANT ALL ON chat_messages TO authenticated;
