-- ==========================================
-- FINAL POLISH MIGRATION
-- Adds Triggers and RPC functions
-- ==========================================

-- 1. Helper RPC for incrementing share count
CREATE OR REPLACE FUNCTION increment_share_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE feed_posts
  SET shares_count = COALESCE(shares_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Follower Count Trigger (Ensuring it exists and works)
CREATE OR REPLACE FUNCTION update_vendor_follower_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE vendors 
        SET followers_count = COALESCE(followers_count, 0) + 1 
        WHERE id = NEW.vendor_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE vendors 
        SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0) 
        WHERE id = OLD.vendor_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_vendor_follow ON vendor_followers;
CREATE TRIGGER on_vendor_follow
AFTER INSERT OR DELETE ON vendor_followers
FOR EACH ROW EXECUTE FUNCTION update_vendor_follower_count();

-- 3. Feed Post Count Triggers (Optional but good for consistency)
-- Update comments count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE feed_posts 
        SET comments_count = COALESCE(comments_count, 0) + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE feed_posts 
        SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0) 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_feed_comment ON feed_comments;
CREATE TRIGGER on_feed_comment
AFTER INSERT OR DELETE ON feed_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Update likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE feed_posts 
        SET likes_count = COALESCE(likes_count, 0) + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE feed_posts 
        SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_feed_like ON feed_likes;
CREATE TRIGGER on_feed_like
AFTER INSERT OR DELETE ON feed_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();
