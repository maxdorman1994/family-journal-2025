-- Scottish Adventure Journal Database Schema
-- Migration from Supabase to PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date DATE NOT NULL,
    location TEXT NOT NULL,
    weather TEXT DEFAULT '',
    mood TEXT DEFAULT '',
    miles_traveled NUMERIC(10,2) DEFAULT 0,
    parking TEXT DEFAULT '',
    dog_friendly BOOLEAN DEFAULT false,
    paid_activity BOOLEAN DEFAULT false,
    adult_tickets TEXT DEFAULT '',
    child_tickets TEXT DEFAULT '',
    other_tickets TEXT DEFAULT '',
    pet_notes TEXT DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    photos TEXT[] DEFAULT '{}', -- Minio URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal comments table
CREATE TABLE IF NOT EXISTS journal_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal likes table
CREATE TABLE IF NOT EXISTS journal_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Simple user identifier
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(journal_entry_id, user_id)
);

-- Milestone categories table
CREATE TABLE IF NOT EXISTS milestone_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milestones table
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES milestone_categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    milestone_type TEXT NOT NULL,
    target_value INTEGER,
    icon TEXT,
    completed BOOLEAN DEFAULT false,
    completion_date TIMESTAMP WITH TIME ZONE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User milestone progress table
CREATE TABLE IF NOT EXISTS user_milestone_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    current_value INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completion_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(milestone_id, user_id)
);

-- Adventure stats table
CREATE TABLE IF NOT EXISTS adventure_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stat_type TEXT NOT NULL UNIQUE,
    stat_value INTEGER DEFAULT 0,
    display_name TEXT NOT NULL,
    icon TEXT,
    category TEXT DEFAULT 'general',
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App settings table
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family members table
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    display_avatar TEXT,
    role TEXT DEFAULT 'member',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist items table
CREATE TABLE IF NOT EXISTS wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    category TEXT DEFAULT 'adventure',
    priority INTEGER DEFAULT 1,
    estimated_cost NUMERIC(10,2),
    researched BOOLEAN DEFAULT false,
    family_votes JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    photos TEXT[] DEFAULT '{}',
    notes TEXT,
    date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    target_date DATE,
    completed BOOLEAN DEFAULT false,
    completion_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Castles table
CREATE TABLE IF NOT EXISTS castles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    description TEXT,
    is_custom BOOLEAN DEFAULT false,
    visited BOOLEAN DEFAULT false,
    visit_date DATE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    photos TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lochs table
CREATE TABLE IF NOT EXISTS lochs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    description TEXT,
    is_custom BOOLEAN DEFAULT false,
    visited BOOLEAN DEFAULT false,
    visit_date DATE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    photos TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hidden gems table
CREATE TABLE IF NOT EXISTS hidden_gems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    description TEXT,
    category TEXT DEFAULT 'scenic',
    is_custom BOOLEAN DEFAULT true,
    visited BOOLEAN DEFAULT false,
    visit_date DATE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    photos TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hidden gem visits table
CREATE TABLE IF NOT EXISTS hidden_gem_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gem_id UUID NOT NULL REFERENCES hidden_gems(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    photos TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_comments_entry_id ON journal_comments(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_likes_entry_id ON journal_likes(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_likes_user_id ON journal_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_category_id ON milestones(category_id);
CREATE INDEX IF NOT EXISTS idx_user_milestone_progress_milestone_id ON user_milestone_progress(milestone_id);
CREATE INDEX IF NOT EXISTS idx_user_milestone_progress_user_id ON user_milestone_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_adventure_stats_type ON adventure_stats(stat_type);
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_category ON wishlist_items(category);
CREATE INDEX IF NOT EXISTS idx_castles_region ON castles(region);
CREATE INDEX IF NOT EXISTS idx_lochs_region ON lochs(region);
CREATE INDEX IF NOT EXISTS idx_hidden_gems_region ON hidden_gems(region);

-- Create views for common queries
CREATE OR REPLACE VIEW journal_entry_stats AS
SELECT 
    je.id,
    je.title,
    COUNT(DISTINCT jc.id) as comment_count,
    COUNT(DISTINCT jl.id) as like_count
FROM journal_entries je
LEFT JOIN journal_comments jc ON je.id = jc.journal_entry_id
LEFT JOIN journal_likes jl ON je.id = jl.journal_entry_id
GROUP BY je.id, je.title;

CREATE OR REPLACE VIEW milestone_leaderboard AS
SELECT 
    mc.name as category_name,
    COUNT(*) as total_milestones,
    COUNT(CASE WHEN m.completed = true THEN 1 END) as completed_milestones,
    ROUND(
        (COUNT(CASE WHEN m.completed = true THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as completion_percentage
FROM milestone_categories mc
LEFT JOIN milestones m ON mc.id = m.category_id
GROUP BY mc.id, mc.name
ORDER BY completion_percentage DESC;

CREATE OR REPLACE VIEW adventure_stats_summary AS
SELECT 
    stat_type,
    stat_value,
    display_name,
    icon,
    category,
    is_primary,
    sort_order
FROM adventure_stats
ORDER BY sort_order, display_name;

CREATE OR REPLACE VIEW primary_adventure_stats AS
SELECT 
    stat_type,
    stat_value,
    display_name,
    icon,
    category
FROM adventure_stats
WHERE is_primary = true
ORDER BY sort_order, display_name;

CREATE OR REPLACE VIEW recent_adventures_view AS
SELECT 
    id,
    title,
    date,
    location,
    photos,
    tags,
    created_at
FROM journal_entries
ORDER BY date DESC, created_at DESC
LIMIT 10;

CREATE OR REPLACE VIEW wishlist_stats AS
SELECT 
    category,
    COUNT(*) as total_items,
    COUNT(CASE WHEN completed = true THEN 1 END) as completed_items,
    COUNT(CASE WHEN researched = true THEN 1 END) as researched_items,
    AVG(priority) as avg_priority,
    SUM(estimated_cost) as total_estimated_cost
FROM wishlist_items
GROUP BY category;

CREATE OR REPLACE VIEW castle_visit_stats AS
SELECT 
    region,
    COUNT(*) as total_castles,
    COUNT(CASE WHEN visited = true THEN 1 END) as visited_castles,
    ROUND(
        (COUNT(CASE WHEN visited = true THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as visit_percentage
FROM castles
GROUP BY region
ORDER BY visit_percentage DESC;

CREATE OR REPLACE VIEW loch_visit_stats AS
SELECT 
    region,
    COUNT(*) as total_lochs,
    COUNT(CASE WHEN visited = true THEN 1 END) as visited_lochs,
    ROUND(
        (COUNT(CASE WHEN visited = true THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as visit_percentage
FROM lochs
GROUP BY region
ORDER BY visit_percentage DESC;

CREATE OR REPLACE VIEW hidden_gem_visit_stats AS
SELECT 
    region,
    COUNT(*) as total_gems,
    COUNT(CASE WHEN visited = true THEN 1 END) as visited_gems,
    ROUND(
        (COUNT(CASE WHEN visited = true THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as visit_percentage
FROM hidden_gems
GROUP BY region
ORDER BY visit_percentage DESC;

-- Create stored procedures for common operations
CREATE OR REPLACE FUNCTION update_milestone_progress(
    p_user_id TEXT,
    p_milestone_id UUID,
    p_increment INTEGER DEFAULT 1
) RETURNS TABLE(
    milestone_id UUID,
    old_value INTEGER,
    new_value INTEGER,
    completed BOOLEAN
) AS $$
DECLARE
    current_progress INTEGER;
    target_value INTEGER;
    is_completed BOOLEAN;
BEGIN
    -- Get current progress and target
    SELECT 
        COALESCE(ump.current_value, 0),
        m.target_value
    INTO current_progress, target_value
    FROM milestones m
    LEFT JOIN user_milestone_progress ump ON m.id = ump.milestone_id AND ump.user_id = p_user_id
    WHERE m.id = p_milestone_id;

    -- Calculate new value
    current_progress := current_progress + p_increment;
    is_completed := (target_value IS NOT NULL AND current_progress >= target_value);

    -- Upsert progress record
    INSERT INTO user_milestone_progress (milestone_id, user_id, current_value, completed, completion_date, updated_at)
    VALUES (p_milestone_id, p_user_id, current_progress, is_completed, 
           CASE WHEN is_completed THEN NOW() ELSE NULL END, NOW())
    ON CONFLICT (milestone_id, user_id)
    DO UPDATE SET 
        current_value = EXCLUDED.current_value,
        completed = EXCLUDED.completed,
        completion_date = EXCLUDED.completion_date,
        updated_at = EXCLUDED.updated_at;

    -- Update milestone completed status if reached target
    IF is_completed THEN
        UPDATE milestones 
        SET completed = true, completion_date = NOW()
        WHERE id = p_milestone_id AND completed = false;
    END IF;

    -- Return results
    RETURN QUERY SELECT 
        p_milestone_id,
        current_progress - p_increment,
        current_progress,
        is_completed;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_adventure_stat(
    p_stat_type TEXT,
    p_stat_value INTEGER
) RETURNS void AS $$
BEGIN
    INSERT INTO adventure_stats (stat_type, stat_value, display_name, updated_at)
    VALUES (p_stat_type, p_stat_value, p_stat_type, NOW())
    ON CONFLICT (stat_type)
    DO UPDATE SET 
        stat_value = EXCLUDED.stat_value,
        updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_adventure_stat(
    p_stat_type TEXT,
    p_increment INTEGER DEFAULT 1
) RETURNS INTEGER AS $$
DECLARE
    new_value INTEGER;
BEGIN
    INSERT INTO adventure_stats (stat_type, stat_value, display_name, updated_at)
    VALUES (p_stat_type, p_increment, p_stat_type, NOW())
    ON CONFLICT (stat_type)
    DO UPDATE SET 
        stat_value = adventure_stats.stat_value + EXCLUDED.stat_value,
        updated_at = EXCLUDED.updated_at;
    
    SELECT stat_value INTO new_value 
    FROM adventure_stats 
    WHERE stat_type = p_stat_type;
    
    RETURN new_value;
END;
$$ LANGUAGE plpgsql;

-- Insert default data
INSERT INTO milestone_categories (name, description, icon, color, sort_order) VALUES
('Munros', 'Conquer Scotland''s highest peaks', '🏔️', '#4F46E5', 1),
('Castles', 'Explore historic Scottish castles', '🏰', '#DC2626', 2),
('Lochs', 'Discover beautiful Scottish lochs', '🏞️', '#059669', 3),
('Islands', 'Visit Scotland''s stunning islands', '🏝️', '#0891B2', 4),
('Cities', 'Explore Scottish cities and towns', '🏙️', '#7C3AED', 5),
('Culture', 'Experience Scottish culture and traditions', '🎭', '#EA580C', 6)
ON CONFLICT (name) DO NOTHING;

-- Insert default adventure stats
INSERT INTO adventure_stats (stat_type, display_name, stat_value, icon, category, is_primary, sort_order) VALUES
('total_adventures', 'Total Adventures', 0, '🗺️', 'general', true, 1),
('miles_traveled', 'Miles Traveled', 0, '🚗', 'travel', true, 2),
('munros_climbed', 'Munros Climbed', 0, '⛰️', 'mountains', true, 3),
('castles_visited', 'Castles Visited', 0, '🏰', 'historic', true, 4),
('lochs_discovered', 'Lochs Discovered', 0, '🏞️', 'nature', true, 5),
('photos_taken', 'Photos Taken', 0, '📸', 'memories', false, 6),
('journal_entries', 'Journal Entries', 0, '📝', 'memories', false, 7)
ON CONFLICT (stat_type) DO NOTHING;

-- Insert default app settings
INSERT INTO app_settings (setting_key, setting_value, description) VALUES
('app_name', '"A Wee Adventure"', 'Application name'),
('theme', '"light"', 'Application theme (light/dark)'),
('language', '"en"', 'Application language'),
('notifications_enabled', 'true', 'Enable push notifications'),
('photo_quality', '"high"', 'Photo upload quality setting'),
('auto_backup', 'true', 'Enable automatic backup')
ON CONFLICT (setting_key) DO NOTHING;
