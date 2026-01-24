-- NUCLEAR RESET & SETUP FOR FEED FEATURE
-- Run this script to completely fix the schema and permissions.

-- 1. DROP EVERYTHING related to feed (Clean Slate)
DROP TABLE IF EXISTS public.feed_likes CASCADE;
DROP TABLE IF EXISTS public.feed_comments CASCADE;
DROP TABLE IF EXISTS public.feed_posts CASCADE;

-- 2. CREATE TABLES (With correct TEXT types for FKs to match Prisma schema)
-- Note: vendor_id and user_id must be TEXT because Supabase/Prisma tables use TEXT IDs.
CREATE TABLE public.feed_posts (
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

CREATE TABLE public.feed_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE public.feed_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. ENABLE RLS
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES (Strictly checked against text IDs with explicit casting)

-- Posts: Everyone views, Only correct Vendor inserts
CREATE POLICY "Everyone can view posts" ON public.feed_posts FOR SELECT USING (true);

-- The INSERT policy:
-- Checks if the authenticated user's ID matches the user_id of the vendor owner.
-- We cast auth.uid() to text to ensure safe comparison with vendor.user_id (which is text).
CREATE POLICY "Vendors can create posts" ON public.feed_posts FOR INSERT WITH CHECK (
  auth.uid()::text = (SELECT user_id FROM public.vendors WHERE id = vendor_id LIMIT 1)
);

-- Posts: Update/Delete own
CREATE POLICY "Vendors can update own posts" ON public.feed_posts FOR UPDATE USING (
  auth.uid()::text = (SELECT user_id FROM public.vendors WHERE id = vendor_id LIMIT 1)
);
CREATE POLICY "Vendors can delete own posts" ON public.feed_posts FOR DELETE USING (
  auth.uid()::text = (SELECT user_id FROM public.vendors WHERE id = vendor_id LIMIT 1)
);

-- Likes: Everyone views, Auth users interact
CREATE POLICY "Everyone can view likes" ON public.feed_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON public.feed_likes FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can unlike" ON public.feed_likes FOR DELETE USING (auth.uid()::text = user_id);

-- Comments: Everyone views, Auth users interact
CREATE POLICY "Everyone can view comments" ON public.feed_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.feed_comments FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- 5. REALTIME (Ignore errors if publication modifies)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_posts;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_likes;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_comments;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 6. STORAGE BUCKET (Ensure it exists)
INSERT INTO storage.buckets (id, name, public) VALUES ('feed-media', 'feed-media', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- We do a safer drop to avoid errors
DO $$
BEGIN
    DROP POLICY IF EXISTS "Vendors can upload feed media" ON storage.objects;
    DROP POLICY IF EXISTS "Everyone can view feed media" ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Vendors can upload feed media" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'feed-media' );
CREATE POLICY "Everyone can view feed media" ON storage.objects FOR SELECT TO public USING ( bucket_id = 'feed-media' );
