-- Create storage bucket for feed media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('feed-media', 'feed-media', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users (vendors) to upload
CREATE POLICY "Vendors can upload feed media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'feed-media' );

-- Policy to allow everyone to view feed media
CREATE POLICY "Everyone can view feed media"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'feed-media' );

-- Policy for vendors to update/delete their own media
CREATE POLICY "Vendors can update own feed media"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'feed-media' AND owner = auth.uid() );

CREATE POLICY "Vendors can delete own feed media"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'feed-media' AND owner = auth.uid() );
