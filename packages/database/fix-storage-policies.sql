-- Enable the storage extension if not already enabled (usually enabled by default)
-- create extension if not exists "storage" schema "extensions";

-- 1. Create Buckets (if they don't exist)
insert into storage.buckets (id, name, public)
values 
  ('avatars', 'avatars', true),
  ('onboarding', 'onboarding', true),
  ('services', 'services', true),
  ('portfolio', 'portfolio', true),
  ('shorts', 'shorts', true),
  ('chat-attachments', 'chat-attachments', true)
on conflict (id) do update set public = true;

-- 2. Drop existing policies to avoid conflicts/duplicates
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Public Read" on storage.objects;
drop policy if exists "Authenticated Upload" on storage.objects;
drop policy if exists "Owner Delete" on storage.objects;
drop policy if exists "Give me access" on storage.objects;
drop policy if exists "Allow all for onboarding" on storage.objects;
drop policy if exists "Allow all for avatars" on storage.objects;
drop policy if exists "Allow all for services" on storage.objects;
drop policy if exists "Allow all for portfolio" on storage.objects;
drop policy if exists "Allow all for shorts" on storage.objects;
drop policy if exists "Allow all for chat-attachments" on storage.objects;

-- 3. Create permissive policies for each bucket

-- Policy to allow ANYONE to read ANY file (Public Read)
create policy "Give public read access"
on storage.objects for select
using ( bucket_id in ('avatars', 'onboarding', 'services', 'portfolio', 'shorts', 'chat-attachments') );

-- Policy to allow AUTHENTICATED users to upload files
create policy "Give authenticated upload access"
on storage.objects for insert
to authenticated
with check ( bucket_id in ('avatars', 'onboarding', 'services', 'portfolio', 'shorts', 'chat-attachments') );

-- Policy to allow AUTHENTICATED users to update their own files
create policy "Give authenticated update access"
on storage.objects for update
to authenticated
using ( (select auth.uid()) = owner );

-- Policy to allow AUTHENTICATED users to delete their own files
create policy "Give authenticated delete access"
on storage.objects for delete
to authenticated
using ( (select auth.uid()) = owner );

-- SPECIAL CASE: Onboarding bucket might need stricter or looser permissions depending on flow
-- If users upload BEFORE fully signing in (unlikely in your flow, but possible if anon), enable anon uploads:
-- create policy "Give anon upload access to onboarding"
-- on storage.objects for insert
-- to anon
-- with check ( bucket_id = 'onboarding' );
