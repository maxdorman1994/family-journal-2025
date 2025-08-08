-- ============================================
-- Castles and Lochs Tracking Database Schema for Supabase
-- Famous Scottish Castles and Top Ten Lochs
-- ============================================
-- Copy and paste this entire code into your Supabase SQL Editor and click "Run"

-- Create castles table
CREATE TABLE IF NOT EXISTS castles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Royal Castle', 'Historic Fortress', 'Clan Castle', 'Ruin', 'Palace')),
    built_century TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT NOT NULL,
    visiting_info TEXT NOT NULL,
    best_seasons TEXT[] NOT NULL,
    admission_fee TEXT DEFAULT 'Free',
    managed_by TEXT DEFAULT 'Historic Environment Scotland',
    accessibility TEXT DEFAULT 'Check individual castle details',
    rank INTEGER NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lochs table
CREATE TABLE IF NOT EXISTS lochs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Freshwater Loch', 'Sea Loch', 'Tidal Loch')),
    length_km DECIMAL(6, 2),
    max_depth_m INTEGER,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT NOT NULL,
    activities TEXT[] NOT NULL,
    best_seasons TEXT[] NOT NULL,
    famous_for TEXT NOT NULL,
    nearest_town TEXT NOT NULL,
    rank INTEGER NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create castle_visits table to track user progress
CREATE TABLE IF NOT EXISTS castle_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    castle_id TEXT NOT NULL REFERENCES castles(id) ON DELETE CASCADE,
    visited_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT DEFAULT '',
    photo_count INTEGER DEFAULT 0,
    weather_conditions TEXT DEFAULT '',
    visit_duration TEXT DEFAULT '',
    favorite_part TEXT DEFAULT '',
    would_recommend BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one visit record per castle (for family sharing)
    UNIQUE(castle_id)
);

-- Create loch_visits table to track user progress
CREATE TABLE IF NOT EXISTS loch_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loch_id TEXT NOT NULL REFERENCES lochs(id) ON DELETE CASCADE,
    visited_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT DEFAULT '',
    photo_count INTEGER DEFAULT 0,
    weather_conditions TEXT DEFAULT '',
    activities_done TEXT[] DEFAULT '{}',
    water_temperature TEXT DEFAULT '',
    wildlife_spotted TEXT[] DEFAULT '{}',
    would_recommend BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one visit record per loch (for family sharing)
    UNIQUE(loch_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_castles_region ON castles(region);
CREATE INDEX IF NOT EXISTS idx_castles_type ON castles(type);
CREATE INDEX IF NOT EXISTS idx_castles_century ON castles(built_century);
CREATE INDEX IF NOT EXISTS idx_castles_rank ON castles(rank);
CREATE INDEX IF NOT EXISTS idx_castles_custom ON castles(is_custom);

CREATE INDEX IF NOT EXISTS idx_lochs_region ON lochs(region);
CREATE INDEX IF NOT EXISTS idx_lochs_type ON lochs(type);
CREATE INDEX IF NOT EXISTS idx_lochs_rank ON lochs(rank);
CREATE INDEX IF NOT EXISTS idx_lochs_custom ON lochs(is_custom);

CREATE INDEX IF NOT EXISTS idx_castle_visits_date ON castle_visits(visited_date DESC);
CREATE INDEX IF NOT EXISTS idx_castle_visits_castle_id ON castle_visits(castle_id);

CREATE INDEX IF NOT EXISTS idx_loch_visits_date ON loch_visits(visited_date DESC);
CREATE INDEX IF NOT EXISTS idx_loch_visits_loch_id ON loch_visits(loch_id);

-- Create a view for castle visit statistics
CREATE OR REPLACE VIEW castle_visit_stats AS
SELECT 
    COUNT(cv.id) AS visited_count,
    (SELECT COUNT(*) FROM castles WHERE NOT is_custom) AS total_castles,
    ROUND((COUNT(cv.id)::numeric / NULLIF((SELECT COUNT(*) FROM castles WHERE NOT is_custom), 0)) * 100, 1) AS completion_percentage,
    COUNT(cv.id) FILTER (WHERE cv.photo_count > 0) AS castles_with_photos,
    SUM(cv.photo_count) AS total_photos,
    MIN(cv.visited_date) AS first_visit,
    MAX(cv.visited_date) AS latest_visit,
    COUNT(cv.id) FILTER (WHERE cv.would_recommend = true) AS recommended_count
FROM castle_visits cv;

-- Create a view for loch visit statistics  
CREATE OR REPLACE VIEW loch_visit_stats AS
SELECT 
    COUNT(lv.id) AS visited_count,
    (SELECT COUNT(*) FROM lochs WHERE NOT is_custom) AS total_lochs,
    ROUND((COUNT(lv.id)::numeric / NULLIF((SELECT COUNT(*) FROM lochs WHERE NOT is_custom), 0)) * 100, 1) AS completion_percentage,
    COUNT(lv.id) FILTER (WHERE lv.photo_count > 0) AS lochs_with_photos,
    SUM(lv.photo_count) AS total_photos,
    MIN(lv.visited_date) AS first_visit,
    MAX(lv.visited_date) AS latest_visit,
    COUNT(lv.id) FILTER (WHERE lv.would_recommend = true) AS recommended_count
FROM loch_visits lv;

-- Insert famous Scottish castles
INSERT INTO castles (id, name, region, type, built_century, latitude, longitude, description, visiting_info, best_seasons, admission_fee, managed_by, rank) VALUES
('1', 'Edinburgh Castle', 'Edinburgh', 'Royal Castle', '12th Century', 55.9486, -3.1999, 'Scotland''s most famous castle, perched on Castle Rock overlooking the capital. Home to the Crown Jewels, Stone of Destiny, and the One O''Clock Gun.', 'Open daily with timed entry tickets. Allow 2-3 hours for full visit.', '{"April", "May", "June", "July", "August", "September"}', 'Adult £19.50', 'Historic Environment Scotland', 1),
('2', 'Stirling Castle', 'Stirling', 'Royal Castle', '12th Century', 56.1242, -3.9456, 'One of Scotland''s grandest castles with spectacular views. Witness to many pivotal moments in Scottish history including battles and royal ceremonies.', 'Open daily. Great for families with interactive exhibits and costumed interpreters.', '{"April", "May", "June", "July", "August", "September"}', 'Adult £16.00', 'Historic Environment Scotland', 2),
('3', 'Eilean Donan Castle', 'Highland', 'Clan Castle', '13th Century', 57.2742, -5.5164, 'Scotland''s most photographed castle, situated on a small tidal island. Featured in countless films and offering breathtaking Highland scenery.', 'Open March to October. Popular for weddings and photography. Book ahead in summer.', '{"May", "June", "July", "August", "September"}', 'Adult £10.00', 'Private', 3),
('4', 'Urquhart Castle', 'Highland', 'Historic Fortress', '13th Century', 57.3230, -4.4364, 'Dramatic ruins overlooking Loch Ness. Perfect for monster spotting! One of Scotland''s largest castles with a fascinating visitor centre.', 'Open daily with excellent visitor centre. Great views over Loch Ness.', '{"April", "May", "June", "July", "August", "September"}', 'Adult £11.00', 'Historic Environment Scotland', 4),
('5', 'Caerlaverock Castle', 'Dumfries and Galloway', 'Historic Fortress', '13th Century', 55.0057, -3.5262, 'Unique triangular castle with impressive twin-towered gatehouse. Surrounded by a water-filled moat and set in beautiful countryside.', 'Open daily. Family-friendly with nature reserve nearby. Medieval siege machine demonstrations.', '{"April", "May", "June", "July", "August", "September"}', 'Adult £6.00', 'Historic Environment Scotland', 5),
('6', 'Dunnottar Castle', 'Aberdeenshire', 'Historic Fortress', '14th Century', 56.9461, -2.1969, 'Dramatic clifftop ruins where the Scottish Crown Jewels were once hidden. Spectacular coastal location with breathtaking views.', 'Open daily. Steep walk down to castle. Stunning photography opportunities.', '{"April", "May", "June", "July", "August", "September"}', 'Adult £7.00', 'Private', 6),
('7', 'Glamis Castle', 'Angus', 'Royal Castle', '14th Century', 56.6206, -3.0186, 'Childhood home of the Queen Mother and birthplace of Princess Margaret. Beautiful fairy-tale castle with magnificent gardens.', 'Guided tours of castle and grounds. Famous for its ghosts and royal connections.', '{"April", "May", "June", "July", "August", "September", "October"}', 'Adult £15.50', 'Private', 7),
('8', 'Culzean Castle', 'South Ayrshire', 'Palace', '18th Century', 55.3494, -4.7894, 'Elegant castle designed by Robert Adam, perched on dramatic cliffs. Beautiful country park with beaches and woodland walks.', 'Castle and country park. Perfect for families. Eisenhower exhibition.', '{"April", "May", "June", "July", "August", "September", "October"}', 'Adult £18.50', 'National Trust for Scotland', 8),
('9', 'Inveraray Castle', 'Argyll and Bute', 'Clan Castle', '18th Century', 56.2332, -5.0743, 'Fairy-tale castle and ancestral home of the Duke of Argyll. Beautiful lakeside location with stunning interiors and armory.', 'Open April to October. Famous for Downton Abbey filming. Beautiful gardens.', '{"April", "May", "June", "July", "August", "September", "October"}', 'Adult £13.00', 'Private', 9),
('10', 'Balmoral Castle', 'Aberdeenshire', 'Royal Castle', '19th Century', 57.0435, -3.2269, 'The Royal Family''s private residence in Scotland. Beautiful estate with gardens, exhibitions and stunning Highland scenery.', 'Open April to July only. Ballroom and grounds. Book exhibitions in advance.', '{"April", "May", "June", "July"}', 'Adult £15.00', 'Royal Family', 10),
('11', 'Craigievar Castle', 'Aberdeenshire', 'Historic Fortress', '17th Century', 57.2089, -2.6789, 'Pink fairy-tale castle that inspired Disney. Remarkable seven-story tower house with original painted ceilings.', 'Limited access - exterior viewing and some interior tours. Very popular.', '{"May", "June", "July", "August", "September"}', 'Adult £12.00', 'National Trust for Scotland', 11),
('12', 'Cawdor Castle', 'Highland', 'Clan Castle', '14th Century', 57.5055, -3.9989, 'Beautiful castle associated with Shakespeare''s Macbeth. Stunning gardens and fascinating family history.', 'Open May to October. Private family home with beautiful gardens.', '{"May", "June", "July", "August", "September", "October"}', 'Adult £12.00', 'Private', 12),
('13', 'Castle Fraser', 'Aberdeenshire', 'Historic Fortress', '16th Century', 57.2856, -2.5198, 'Spectacular Z-plan castle, one of the most elaborate tower houses in Scotland. Beautiful parkland and walled garden.', 'Open Easter to October. Family-friendly with adventure playground.', '{"April", "May", "June", "July", "August", "September", "October"}', 'Adult £12.50', 'National Trust for Scotland', 13),
('14', 'Floors Castle', 'Scottish Borders', 'Palace', '18th Century', 55.6067, -2.4567, 'Scotland''s largest inhabited castle, home to the Duke of Roxburghe. Magnificent art collection and beautiful gardens.', 'Open Easter to October. Family home with excellent tearoom.', '{"April", "May", "June", "July", "August", "September", "October"}', 'Adult £12.00', 'Private', 14),
('15', 'Tantallon Castle', 'East Lothian', 'Historic Fortress', '14th Century', 56.0572, -2.6478, 'Spectacular clifftop fortress facing the Bass Rock. Massive red sandstone walls and dramatic coastal setting.', 'Open daily. Excellent for photography and birdwatching. Windy location!', '{"April", "May", "June", "July", "August", "September"}', 'Adult £6.00', 'Historic Environment Scotland', 15),
('16', 'Doune Castle', 'Stirling', 'Historic Fortress', '14th Century', 56.1859, -4.0506, 'Well-preserved medieval castle famous for Monty Python and Outlander filming. Excellent audio guide narrated by Terry Jones.', 'Open daily. Famous film location. Interactive audio guide included.', '{"April", "May", "June", "July", "August", "September"}', 'Adult £6.00', 'Historic Environment Scotland', 16),
('17', 'Kilchurn Castle', 'Argyll and Bute', 'Clan Castle', '15th Century', 56.4089, -5.0267, 'Romantic ruins on Loch Awe with stunning mountain backdrop. One of Scotland''s most photographed castle ruins.', 'Seasonal access. Free entry. Beautiful for photography. Can be reached by boat.', '{"April", "May", "June", "July", "August", "September", "October"}', 'Free', 'Historic Environment Scotland', 17),
('18', 'Blackness Castle', 'West Lothian', 'Historic Fortress', '15th Century', 55.9825, -3.5156, 'Ship-shaped fortress on the Forth, nicknamed "the ship that never sailed". Featured in Outlander as Fort William.', 'Open daily. Unusual ship-like design. Great views over the Forth.', '{"April", "May", "June", "July", "August", "September"}', 'Adult £6.00', 'Historic Environment Scotland', 18),
('19', 'Crathes Castle', 'Aberdeenshire', 'Historic Fortress', '16th Century', 57.0978, -2.5267, 'Beautiful tower house with remarkable painted ceilings and stunning gardens. Famous for its topiary and herbaceous borders.', 'Open daily. Magnificent gardens. Family-friendly with adventure playground.', '{"April", "May", "June", "July", "August", "September", "October"}', 'Adult £13.50', 'National Trust for Scotland', 19),
('20', 'Duart Castle', 'Isle of Mull', 'Clan Castle', '13th Century', 56.4556, -5.6578, 'Ancestral seat of Clan MacLean on dramatic clifftop overlooking the Sound of Mull. Recently restored with clan exhibitions.', 'Open May to October. Spectacular location. Rich clan history.', '{"May", "June", "July", "August", "September", "October"}', 'Adult £7.50', 'Private', 20);

-- Insert top ten Scottish lochs
INSERT INTO lochs (id, name, region, type, length_km, max_depth_m, latitude, longitude, description, activities, best_seasons, famous_for, nearest_town, rank) VALUES
('1', 'Loch Ness', 'Highland', 'Freshwater Loch', 36.3, 230, 57.3229, -4.4244, 'Scotland''s most famous loch, home of the legendary Loch Ness Monster. The largest loch by volume in the British Isles, stretching 36km through the Great Glen.', '{"Monster spotting", "Boat trips", "Castle visits", "Hiking", "Photography"}', '{"April", "May", "June", "July", "August", "September", "October"}', 'The Loch Ness Monster (Nessie) and its mysterious depths', 'Inverness', 1),
('2', 'Loch Lomond', 'Central Scotland', 'Freshwater Loch', 36.4, 190, 56.1089, -4.6206, 'Scotland''s largest loch by surface area and part of the first National Park. Beautiful islands and surrounded by mountains, offering endless recreational opportunities.', '{"Boating", "Swimming", "Hiking", "Island hopping", "Cycling", "Fishing"}', '{"April", "May", "June", "July", "August", "September", "October"}', 'Being Scotland''s largest loch and the song "The Bonnie Banks"', 'Balloch', 2),
('3', 'Loch Katrine', 'Stirling', 'Freshwater Loch', 12.5, 151, 56.2567, -4.5789, 'The heart of the Trossachs, inspiration for Sir Walter Scott''s "Lady of the Lake". Pure mountain water that supplies Glasgow, surrounded by beautiful Highland scenery.', '{"Steamship cruises", "Cycling", "Hiking", "Photography", "Wildlife watching"}', '{"April", "May", "June", "July", "August", "September", "October"}', 'Sir Walter Scott''s "Lady of the Lake" and Victorian steamship cruises', 'Callander', 3),
('4', 'Loch Earn', 'Stirling', 'Freshwater Loch', 10.5, 87, 56.3856, -4.2067, 'Beautiful loch in the heart of Scotland surrounded by mountains. Popular for water sports and home to the famous Lochearnhead Water Sports Centre.', '{"Water skiing", "Jet skiing", "Sailing", "Fishing", "Mountain biking", "Hiking"}', '{"May", "June", "July", "August", "September"}', 'Water sports and the annual Loch Earn Highland Games', 'Lochearnhead', 4),
('5', 'Loch Awe', 'Argyll and Bute', 'Freshwater Loch', 41.0, 94, 56.4089, -5.0267, 'Scotland''s longest freshwater loch, stretching 41km through stunning Highland scenery. Home to the romantic ruins of Kilchurn Castle.', '{"Boat trips", "Fishing", "Castle visits", "Hiking", "Photography", "Kayaking"}', '{"April", "May", "June", "July", "August", "September", "October"}', 'Being Scotland''s longest freshwater loch and Kilchurn Castle', 'Oban', 5),
('6', 'Loch Tay', 'Highland', 'Freshwater Loch', 23.2, 150, 56.5167, -4.1133, 'Beautiful Highland loch overlooked by Ben Lawers, Scotland''s 10th highest mountain. Rich in wildlife and archaeological sites including ancient crannogs.', '{"Crannog visits", "Ben Lawers hiking", "Fishing", "Cycling", "Wildlife watching", "Watersports"}', '{"April", "May", "June", "July", "August", "September", "October"}', 'Ancient crannogs (lake dwellings) and Ben Lawers National Nature Reserve', 'Aberfeldy', 6),
('7', 'Loch Tummel', 'Highland', 'Freshwater Loch', 11.0, 43, 56.7067, -3.9133, 'Scenic loch in Highland Perthshire, famous for the Queen''s View - one of Scotland''s most photographed viewpoints. Part of beautiful Tummel Valley.', '{"Photography", "Hiking", "Cycling", "Fishing", "Forest walks", "Dam visits"}', '{"April", "May", "June", "July", "August", "September", "October"}', 'The Queen''s View viewpoint and hydroelectric power generation', 'Pitlochry', 7),
('8', 'Loch Achray', 'Stirling', 'Freshwater Loch', 2.5, 25, 56.2333, -4.4667, 'Small but perfectly formed loch in the heart of the Trossachs. Peaceful setting surrounded by woodland and mountains, perfect for quiet contemplation.', '{"Fishing", "Walking", "Photography", "Picnicking", "Wildlife watching", "Quiet reflection"}', '{"April", "May", "June", "July", "August", "September", "October"}', 'Tranquil beauty and its role in the Trossachs water cycle', 'Aberfoyle', 8),
('9', 'Loch Vennachar', 'Stirling', 'Freshwater Loch', 6.0, 38, 56.2167, -4.3833, 'Beautiful loch in the Trossachs, popular with anglers and nature lovers. Part of Glasgow''s water supply system with excellent walking opportunities around its shores.', '{"Fishing", "Walking", "Cycling", "Photography", "Birdwatching", "Canoeing"}', '{"April", "May", "June", "July", "August", "September", "October"}', 'Excellent brown trout fishing and peaceful woodland walks', 'Callander', 9),
('10', 'Loch Rannoch', 'Highland', 'Freshwater Loch', 15.7, 134, 56.6833, -4.2667, 'Remote and wild loch in Highland Perthshire, gateway to the Rannoch Moor. Stunning mountain scenery and one of Scotland''s most isolated and beautiful lochs.', '{"Hiking", "Photography", "Wildlife watching", "Fishing", "Camping", "Stargazing"}', '{"May", "June", "July", "August", "September"}', 'Gateway to Rannoch Moor and remote Highland wilderness', 'Kinloch Rannoch', 10);

-- Create triggers to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_castles_updated_at BEFORE UPDATE ON castles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lochs_updated_at BEFORE UPDATE ON lochs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_castle_visits_updated_at BEFORE UPDATE ON castle_visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loch_visits_updated_at BEFORE UPDATE ON loch_visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Castles and Lochs database schema created successfully! Ready to track your Scottish adventures!' as status;
