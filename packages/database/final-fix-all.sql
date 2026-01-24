-- ==========================================
-- FINAL FIX ALL MIGRATION
-- Use with care. Idempotent.
-- ==========================================

-- 1. FIX VENDOR FOLLOWERS
CREATE TABLE IF NOT EXISTS public.vendor_followers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id TEXT NOT NULL, -- referencing vendors.id
    user_id TEXT NOT NULL,   -- referencing auth.users.id
    followed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vendor_id, user_id)
);

-- Enable RLS
ALTER TABLE public.vendor_followers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "vendor_followers_public_read" ON public.vendor_followers;
DROP POLICY IF EXISTS "vendor_followers_auth_insert" ON public.vendor_followers;
DROP POLICY IF EXISTS "vendor_followers_auth_delete" ON public.vendor_followers;

-- Create Policies
CREATE POLICY "vendor_followers_public_read" ON public.vendor_followers FOR SELECT USING (true);
CREATE POLICY "vendor_followers_auth_insert" ON public.vendor_followers FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "vendor_followers_auth_delete" ON public.vendor_followers FOR DELETE USING (auth.uid()::text = user_id);

-- Add followers_count to vendors if missing
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;

-- 2. FIX CHAT TABLES
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id TEXT NOT NULL,
    vendor_id TEXT NOT NULL,
    service_id TEXT,
    status TEXT DEFAULT 'OPEN',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat Policies
DROP POLICY IF EXISTS "Users can view their conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can view messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.chat_messages;

-- A user can view conversation if they are the buyer or the vendor owner
-- Note: vendor_id in conversation refers to the vendor profile ID, NOT the user ID of vendor.
-- We need to check if auth.uid() is the buyer OR if auth.uid() owns the vendor.
-- Complex RLS can be slow, simplified for now:
CREATE POLICY "Users can view their conversations" ON public.chat_conversations
    FOR SELECT USING (
        auth.uid()::text = buyer_id 
        OR 
        auth.uid()::text IN (SELECT user_id FROM public.vendors WHERE id = vendor_id)
    );

CREATE POLICY "Users can create conversations" ON public.chat_conversations
    FOR INSERT WITH CHECK (
        auth.uid()::text = buyer_id
    );
-- Vendors usually don't initiate chats in this model, but if they do:
-- OR auth.uid()::text IN (SELECT user_id FROM vendors WHERE id = vendor_id)

CREATE POLICY "Users can view messages" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_conversations c
            WHERE c.id = conversation_id
            AND (
                c.buyer_id = auth.uid()::text 
                OR 
                auth.uid()::text IN (SELECT user_id FROM public.vendors WHERE id = c.vendor_id)
            )
        )
    );

CREATE POLICY "Users can send messages" ON public.chat_messages
    FOR INSERT WITH CHECK (
        auth.uid()::text = sender_id
        AND
        EXISTS (
            SELECT 1 FROM public.chat_conversations c
            WHERE c.id = conversation_id
            AND (
                c.buyer_id = auth.uid()::text 
                OR 
                auth.uid()::text IN (SELECT user_id FROM public.vendors WHERE id = c.vendor_id)
            )
        )
    );

-- 3. FIX FEED TABLES
CREATE TABLE IF NOT EXISTS public.feed_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id text NOT NULL, -- references vendors(id)
  content text NOT NULL,
  media_url text,
  media_type text CHECK (media_type IN ('IMAGE', 'VIDEO', 'LINK', 'NONE')),
  likes_count int DEFAULT 0,
  comments_count int DEFAULT 0,
  shares_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.feed_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id text NOT NULL, -- references auth.users(id)
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.feed_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id text NOT NULL, -- references auth.users(id)
  user_name text,        -- cache name for display
  user_avatar text,      -- cache avatar for display
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;

-- Drop Feed Policies
DROP POLICY IF EXISTS "Everyone can view posts" ON public.feed_posts;
DROP POLICY IF EXISTS "Vendors can create posts" ON public.feed_posts;
DROP POLICY IF EXISTS "Everyone can view likes" ON public.feed_likes;
DROP POLICY IF EXISTS "Authenticated users can like" ON public.feed_likes;
DROP POLICY IF EXISTS "Users can unlike" ON public.feed_likes;
DROP POLICY IF EXISTS "Everyone can view comments" ON public.feed_comments;
DROP POLICY IF EXISTS "Authenticated users can comment" ON public.feed_comments;

-- Recreate Feed Policies
CREATE POLICY "Everyone can view posts" ON public.feed_posts FOR SELECT USING (true);
CREATE POLICY "Vendors can create posts" ON public.feed_posts FOR INSERT WITH CHECK (
    auth.uid()::text IN (SELECT user_id FROM public.vendors WHERE id = vendor_id)
);

CREATE POLICY "Everyone can view likes" ON public.feed_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON public.feed_likes FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can unlike" ON public.feed_likes FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "Everyone can view comments" ON public.feed_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.feed_comments FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Realtime
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'vendor_followers') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_followers;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'feed_posts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_posts;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'feed_comments') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_comments;
  END IF;
END $$;
