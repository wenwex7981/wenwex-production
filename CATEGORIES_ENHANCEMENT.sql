-- ===========================================
-- WENVEX CATEGORIES ENHANCEMENT
-- ===========================================
-- Run this in Supabase SQL Editor to add new columns for admin-managed categories
-- This enables Super Admin to fully customize category appearance on buyer website

-- Add new columns to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS icon_name VARCHAR(50) DEFAULT 'Globe',
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS color VARCHAR(100) DEFAULT 'from-blue-600 to-cyan-500',
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'IT_TECH';

-- Add new columns to sub_categories table
ALTER TABLE sub_categories 
ADD COLUMN IF NOT EXISTS icon_name VARCHAR(50) DEFAULT 'Package',
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS color VARCHAR(100) DEFAULT 'from-blue-600 to-cyan-500',
ADD COLUMN IF NOT EXISTS service_count INTEGER DEFAULT 0;

-- Update existing IT/Tech categories with proper styling
UPDATE sub_categories SET 
    icon_name = 'Globe',
    color = 'from-blue-600 to-cyan-500',
    image_url = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
    service_count = 245
WHERE name ILIKE '%web%development%';

UPDATE sub_categories SET 
    icon_name = 'Smartphone',
    color = 'from-emerald-600 to-teal-500',
    image_url = 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800',
    service_count = 189
WHERE name ILIKE '%mobile%app%';

UPDATE sub_categories SET 
    icon_name = 'Code',
    color = 'from-indigo-600 to-violet-500',
    image_url = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
    service_count = 156
WHERE name ILIKE '%custom%software%';

UPDATE sub_categories SET 
    icon_name = 'Palette',
    color = 'from-pink-600 to-rose-500',
    image_url = 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800',
    service_count = 312
WHERE name ILIKE '%ui%ux%' OR name ILIKE '%design%';

UPDATE sub_categories SET 
    icon_name = 'Cloud',
    color = 'from-cyan-600 to-blue-500',
    image_url = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    service_count = 98
WHERE name ILIKE '%cloud%' OR name ILIKE '%devops%';

UPDATE sub_categories SET 
    icon_name = 'Brain',
    color = 'from-orange-600 to-amber-500',
    image_url = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    service_count = 134
WHERE name ILIKE '%ai%' OR name ILIKE '%data%' OR name ILIKE '%machine%learning%';

UPDATE sub_categories SET 
    icon_name = 'Shield',
    color = 'from-red-600 to-rose-500',
    image_url = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    service_count = 67
WHERE name ILIKE '%security%' OR name ILIKE '%cyber%';

UPDATE sub_categories SET 
    icon_name = 'TestTube',
    color = 'from-indigo-600 to-blue-500',
    image_url = 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=800',
    service_count = 89
WHERE name ILIKE '%qa%' OR name ILIKE '%testing%';

UPDATE sub_categories SET 
    icon_name = 'Cog',
    color = 'from-orange-600 to-yellow-500',
    image_url = 'https://images.unsplash.com/photo-1518433278988-2b2a1a2067ed?auto=format&fit=crop&q=80&w=800',
    service_count = 112
WHERE name ILIKE '%automation%' OR name ILIKE '%tools%';

-- Update Academic categories
UPDATE sub_categories SET 
    icon_name = 'FileCode',
    color = 'from-emerald-600 to-green-500',
    image_url = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
    service_count = 423
WHERE name ILIKE '%mini%project%';

UPDATE sub_categories SET 
    icon_name = 'GraduationCap',
    color = 'from-violet-600 to-purple-500',
    image_url = 'https://images.unsplash.com/photo-1523240715630-974bb1ad2724?auto=format&fit=crop&q=80&w=800',
    service_count = 567
WHERE name ILIKE '%major%project%' OR name ILIKE '%final%year%';

UPDATE sub_categories SET 
    icon_name = 'FileText',
    color = 'from-rose-600 to-red-500',
    image_url = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800',
    service_count = 234
WHERE name ILIKE '%research%paper%' OR name ILIKE '%ieee%';

UPDATE sub_categories SET 
    icon_name = 'Edit',
    color = 'from-sky-600 to-blue-500',
    image_url = 'https://images.unsplash.com/photo-1434030216411-0bb7c3f3dfad?auto=format&fit=crop&q=80&w=800',
    service_count = 789
WHERE name ILIKE '%assignment%' OR name ILIKE '%coursework%';

UPDATE sub_categories SET 
    icon_name = 'BookOpen',
    color = 'from-yellow-600 to-orange-500',
    image_url = 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&q=80&w=800',
    service_count = 156
WHERE name ILIKE '%exam%' OR name ILIKE '%preparation%';

UPDATE sub_categories SET 
    icon_name = 'Briefcase',
    color = 'from-teal-600 to-emerald-500',
    image_url = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800',
    service_count = 198
WHERE name ILIKE '%internship%' OR name ILIKE '%placement%';

-- Update parent category types
UPDATE categories SET type = 'IT_TECH' WHERE name ILIKE '%tech%' OR name ILIKE '%it%' OR name ILIKE '%software%';
UPDATE categories SET type = 'ACADEMIC' WHERE name ILIKE '%academic%' OR name ILIKE '%education%' OR name ILIKE '%student%';

-- Success message
SELECT 'Categories enhancement complete! Admin can now fully customize category appearance.' as status;
