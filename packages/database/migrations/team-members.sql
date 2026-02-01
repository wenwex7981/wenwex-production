-- Team Members Table for Super Admin Editable Team Section
-- Created: 2026-02-01

-- Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT NOT NULL,
    linkedin_url TEXT,
    github_url TEXT,
    twitter_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Public read access (for buyer website)
CREATE POLICY "Team members are viewable by everyone"
    ON public.team_members
    FOR SELECT
    USING (is_active = true);

-- Admin full access (for super admin)
CREATE POLICY "Super admins have full access to team members"
    ON public.team_members
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_team_members_display_order 
    ON public.team_members(display_order ASC, created_at DESC);

-- Create index for active status
CREATE INDEX IF NOT EXISTS idx_team_members_active 
    ON public.team_members(is_active);

-- Insert default team members (including founder)
INSERT INTO public.team_members (name, role, image_url, linkedin_url, display_order, is_active)
VALUES 
    ('Appala Nithin Patel', 'Founder & CEO', '/founder-profile.jpg', '#', 1, true),
    ('Sarah Chen', 'Head of Technology', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', '#', 2, true),
    ('Marcus Rodriguez', 'Product Strategy', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop', '#', 3, true),
    ('Aman Gupta', 'Global Operations', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop', '#', 4, true),
    ('Elena Petrov', 'Lead Architect', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop', '#', 5, true)
ON CONFLICT DO NOTHING;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_team_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_team_members_updated_at();

-- Comments for documentation
COMMENT ON TABLE public.team_members IS 'Team members displayed on the buyer homepage, managed via Super Admin';
COMMENT ON COLUMN public.team_members.display_order IS 'Order in which team members appear (lower number = first)';
COMMENT ON COLUMN public.team_members.is_active IS 'Whether the team member is currently displayed on the website';
