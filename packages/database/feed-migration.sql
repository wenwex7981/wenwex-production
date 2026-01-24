-- Migrate feed tables (FIXED TYPES)
-- This file creates the necessary tables for the feed feature: posts, likes, comments
-- and enables Row Level Security (RLS) policies.
-- FIX: Changed vendor_id and user_id to text to match existing Prisma schema types.

-- 1. Create feed_posts table
CREATE TABLE IF NOT EXISTS public.feed_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id text NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  content text NOT NULL,
  media_url text,
  media_type text CHECK (media_type IN ('IMAGE', 'VIDEO', 'LINK', 'NONE')),
  likes_count int DEFAULT 0,
  comments_count int DEFAULT 0,
  shares_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create feed_likes table
CREATE TABLE IF NOT EXISTS public.feed_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- 3. Create feed_comments table
CREATE TABLE IF NOT EXISTS public.feed_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- FEED POSTS
-- Everyone can view posts
CREATE POLICY "Everyone can view posts" ON public.feed_posts
  FOR SELECT USING (true);

-- Only vendors can insert posts (Auth check required + Vendor check)
-- Assuming 'authenticated' role + checking if the user is the owner of the vendor profile
CREATE POLICY "Vendors can create posts" ON public.feed_posts
  FOR INSERT WITH CHECK (
    auth.uid()::text IN (SELECT user_id FROM public.vendors WHERE id = vendor_id)
  );

-- Vendors can update/delete their own posts
CREATE POLICY "Vendors can update own posts" ON public.feed_posts
  FOR UPDATE USING (
    auth.uid()::text IN (SELECT user_id FROM public.vendors WHERE id = vendor_id)
  );

CREATE POLICY "Vendors can delete own posts" ON public.feed_posts
  FOR DELETE USING (
    auth.uid()::text IN (SELECT user_id FROM public.vendors WHERE id = vendor_id)
  );

-- FEED LIKES
-- Everyone can view likes
CREATE POLICY "Everyone can view likes" ON public.feed_likes
  FOR SELECT USING (true);

-- Authenticated users (Buyers & Vendors) can toggle likes
CREATE POLICY "Authenticated users can like" ON public.feed_likes
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can unlike" ON public.feed_likes
  FOR DELETE USING (auth.uid()::text = user_id);

-- FEED COMMENTS
-- Everyone can view comments
CREATE POLICY "Everyone can view comments" ON public.feed_comments
  FOR SELECT USING (true);

-- Authenticated users can comment
CREATE POLICY "Authenticated users can comment" ON public.feed_comments
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Start Realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_comments;
