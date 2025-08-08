-- Hidden Gems Database Schema for Scottish Hidden Gems Tracking
-- Creates tables for hidden gems and visits with full tracking capabilities

-- Create hidden_gems table
CREATE TABLE IF NOT EXISTS hidden_gems (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Secret Beach', 'Hidden Waterfall', 'Ancient Site', 'Natural Wonder', 'Historic Village', 'Remote Island', 'Mountain Peak', 'Forest Grove', 'Cave System', 'Coastal Feature')),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT NOT NULL,
    how_to_find TEXT NOT NULL,
    best_seasons TEXT[] NOT NULL,
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('Easy', 'Moderate', 'Challenging', 'Expert')),
    requires_hiking BOOLEAN DEFAULT FALSE,
    nearest_town TEXT NOT NULL,
    special_features TEXT NOT NULL,
    photography_tips TEXT,
    rank INTEGER NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create hidden_gem_visits table
CREATE TABLE IF NOT EXISTS hidden_gem_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    hidden_gem_id TEXT NOT NULL REFERENCES hidden_gems(id) ON DELETE CASCADE,
    visited_date DATE NOT NULL DEFAULT CURRENT_DATE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    photo_count INTEGER DEFAULT 0,
    weather_conditions TEXT,
    would_recommend BOOLEAN DEFAULT TRUE,
    difficulty_experienced TEXT CHECK (difficulty_experienced IN ('Easy', 'Moderate', 'Challenging', 'Expert')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, hidden_gem_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hidden_gems_region ON hidden_gems(region);
CREATE INDEX IF NOT EXISTS idx_hidden_gems_type ON hidden_gems(type);
CREATE INDEX IF NOT EXISTS idx_hidden_gems_rank ON hidden_gems(rank);
CREATE INDEX IF NOT EXISTS idx_hidden_gem_visits_user ON hidden_gem_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_hidden_gem_visits_gem ON hidden_gem_visits(hidden_gem_id);

-- Create view for hidden gem statistics
CREATE OR REPLACE VIEW hidden_gem_visit_stats AS
SELECT 
    user_id,
    COUNT(*) as visited_count,
    AVG(rating) as average_rating,
    COUNT(CASE WHEN photo_count > 0 THEN 1 END) as gems_with_photos,
    SUM(photo_count) as total_photos,
    COUNT(CASE WHEN would_recommend = TRUE THEN 1 END) as recommended_count,
    MAX(visited_date) as last_visit_date,
    MIN(visited_date) as first_visit_date
FROM hidden_gem_visits 
GROUP BY user_id;

-- Create trigger to update timestamp
CREATE OR REPLACE FUNCTION update_hidden_gem_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_hidden_gems_updated_at
    BEFORE UPDATE ON hidden_gems
    FOR EACH ROW
    EXECUTE FUNCTION update_hidden_gem_updated_at();

CREATE TRIGGER trigger_update_hidden_gem_visits_updated_at
    BEFORE UPDATE ON hidden_gem_visits
    FOR EACH ROW
    EXECUTE FUNCTION update_hidden_gem_updated_at();

-- Enable Row Level Security
ALTER TABLE hidden_gems ENABLE ROW LEVEL SECURITY;
ALTER TABLE hidden_gem_visits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hidden_gems (readable by all authenticated users)
CREATE POLICY "Hidden gems are viewable by authenticated users" ON hidden_gems
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Hidden gems are insertable by authenticated users" ON hidden_gems
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for hidden_gem_visits (users can only see their own visits)
CREATE POLICY "Users can view own hidden gem visits" ON hidden_gem_visits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hidden gem visits" ON hidden_gem_visits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hidden gem visits" ON hidden_gem_visits
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hidden gem visits" ON hidden_gem_visits
    FOR DELETE USING (auth.uid() = user_id);

-- Success message
SELECT 'Hidden Gems database schema created successfully!' as status;
