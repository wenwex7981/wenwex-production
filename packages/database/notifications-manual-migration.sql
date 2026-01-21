-- ===========================================
-- WENWEX NOTIFICATIONS TABLE (Manual Creation - FIXED)
-- ===========================================
-- Run this script in your Supabase SQL Editor.
-- Fix: Using TEXT for user_id to match public.users table type.

-- 1. Create the notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'SYSTEM', 'ORDER', 'PAYMENT', 'MESSAGE'
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- 3. Enable Realtime (This is required for the live notifications to work!)
-- Note: 'supabase_realtime' publication usually exists.
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies

-- Policy: Users can view their own notifications
-- Cast auth.uid() to text because user_id is text
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid()::text = user_id);

-- Policy: Users can update their own notifications (e.g. mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid()::text = user_id);
