/**
 * SUPABASE SCHEMA - TEA TIME NETWORK CONTENT ARCHITECTURE
 * 
 * Tables establish the database spine for all content.
 * Relationships prevent duplication.
 * RLS policies enforce access control.
 */

-- ============================================================================
-- SHOWS TABLE (IMMUTABLE REGISTRY)
-- ============================================================================

CREATE TABLE IF NOT EXISTS shows (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  baseColor TEXT NOT NULL,
  secondaryColor TEXT NOT NULL,
  icon TEXT NOT NULL,
  schedule TEXT NOT NULL,
  hostName TEXT NOT NULL,
  hostBio TEXT,
  episodeCount INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraint: only canonical shows allowed
  CHECK (id IN ('tea-time-cj', 'motivation-court', 'confession-court', 'sunday-power-hour'))
);

CREATE INDEX idx_shows_id ON shows(id);

-- ============================================================================
-- EPISODES TABLE (ATOMIC UNIT)
-- ============================================================================

CREATE TABLE IF NOT EXISTS episodes (
  id TEXT PRIMARY KEY,
  showId TEXT NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  airDate TIMESTAMP NOT NULL,
  durationSeconds INTEGER NOT NULL CHECK (durationSeconds > 0),
  accessLevel TEXT DEFAULT 'free' CHECK (accessLevel IN ('free', 'locked')),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  episodeNumber INTEGER,
  season INTEGER,
  replayUrl TEXT,
  transcriptUrl TEXT,
  attachedNoteIds UUID[] DEFAULT ARRAY[]::UUID[],
  attachedChallengeIds UUID[] DEFAULT ARRAY[]::UUID[],
  attachedWorkbookIds UUID[] DEFAULT ARRAY[]::UUID[],
  reflectionPromptIds UUID[] DEFAULT ARRAY[]::UUID[],
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  publishedAt TIMESTAMP,
  visibility TEXT DEFAULT 'draft' CHECK (visibility IN ('public', 'draft', 'archived')),
  
  -- Constraint: valid tags
  CHECK (tags <@ ARRAY[
    'discipline', 'boundaries', 'identity', 'mindset', 'relationships',
    'selfcare', 'productivity', 'confidence', 'purpose', 'habit-building'
  ]::TEXT[])
);

CREATE INDEX idx_episodes_showId ON episodes(showId);
CREATE INDEX idx_episodes_airDate ON episodes(airDate DESC);
CREATE INDEX idx_episodes_accessLevel ON episodes(accessLevel);
CREATE INDEX idx_episodes_visibility ON episodes(visibility);
CREATE INDEX idx_episodes_tags ON episodes USING GIN(tags);

-- ============================================================================
-- TEA TIME NOTES (ATTACHMENT)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tea_time_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episodeId TEXT NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private'))
);

CREATE INDEX idx_tea_time_notes_episodeId ON tea_time_notes(episodeId);
CREATE INDEX idx_tea_time_notes_visibility ON tea_time_notes(visibility);

-- ============================================================================
-- CHALLENGES (ATTACHMENT)
-- ============================================================================

CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episodeId TEXT NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  difficulty TEXT DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  objectives TEXT[] DEFAULT ARRAY[]::TEXT[],
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_challenges_episodeId ON challenges(episodeId);
CREATE INDEX idx_challenges_difficulty ON challenges(difficulty);

-- ============================================================================
-- WORKBOOK LINKS (ATTACHMENT)
-- ============================================================================

CREATE TABLE IF NOT EXISTS workbook_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episodeId TEXT NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  downloadUrl TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workbook_links_episodeId ON workbook_links(episodeId);

-- ============================================================================
-- REFLECTION PROMPTS (ATTACHMENT)
-- ============================================================================

CREATE TABLE IF NOT EXISTS reflection_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episodeId TEXT NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  guidance TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reflection_prompts_episodeId ON reflection_prompts(episodeId);

-- ============================================================================
-- EPISODE PLAYBACK STATE (USER-SPECIFIC)
-- ============================================================================

CREATE TABLE IF NOT EXISTS episode_playback_state (
  userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  episodeId TEXT NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  watchedSeconds INTEGER DEFAULT 0 CHECK (watchedSeconds >= 0),
  completionPercentage DECIMAL(5, 2) DEFAULT 0 CHECK (completionPercentage >= 0 AND completionPercentage <= 100),
  isCompleted BOOLEAN DEFAULT FALSE,
  lastWatchedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resumePosition INTEGER DEFAULT 0,
  PRIMARY KEY (userId, episodeId)
);

CREATE INDEX idx_playback_state_userId ON episode_playback_state(userId);
CREATE INDEX idx_playback_state_lastWatchedAt ON episode_playback_state(lastWatchedAt DESC);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================================

-- Shows: Public read-only
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shows are readable by everyone" ON shows
  FOR SELECT USING (true);

-- Episodes: Visibility-based access
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public episodes readable by everyone" ON episodes
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Authenticated users see draft episodes they own" ON episodes
  FOR SELECT USING (
    visibility = 'public' 
    OR (auth.role() = 'authenticated' AND visibility = 'draft')
  );

-- Tea Time Notes: Visible based on visibility setting
ALTER TABLE tea_time_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public notes readable by everyone" ON tea_time_notes
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Private notes readable by authenticated users" ON tea_time_notes
  FOR SELECT USING (
    visibility = 'public' 
    OR (auth.role() = 'authenticated' AND visibility = 'private')
  );

-- Challenges: Readable by all authenticated users
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges readable by authenticated users" ON challenges
  FOR SELECT USING (auth.role() = 'authenticated');

-- Workbook Links: Readable by all authenticated users
ALTER TABLE workbook_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workbook links readable by authenticated users" ON workbook_links
  FOR SELECT USING (auth.role() = 'authenticated');

-- Reflection Prompts: Readable by all authenticated users
ALTER TABLE reflection_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reflection prompts readable by authenticated users" ON reflection_prompts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Playback State: Users can only access their own state
ALTER TABLE episode_playback_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own playback state" ON episode_playback_state
  FOR SELECT USING (auth.uid() = userId);

CREATE POLICY "Users can insert their own playback state" ON episode_playback_state
  FOR INSERT WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own playback state" ON episode_playback_state
  FOR UPDATE USING (auth.uid() = userId);

-- ============================================================================
-- DATABASE FUNCTIONS (OPTIONAL, FOR OPTIMIZATION)
-- ============================================================================

-- Function to get all episodes for a show with playback state
CREATE OR REPLACE FUNCTION get_show_episodes(
  p_showId TEXT,
  p_userId UUID DEFAULT NULL
)
RETURNS TABLE (
  id TEXT,
  showId TEXT,
  title TEXT,
  description TEXT,
  airDate TIMESTAMP,
  durationSeconds INTEGER,
  accessLevel TEXT,
  tags TEXT[],
  replayUrl TEXT,
  watchedSeconds INTEGER,
  completionPercentage DECIMAL,
  isCompleted BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.showId,
    e.title,
    e.description,
    e.airDate,
    e.durationSeconds,
    e.accessLevel,
    e.tags,
    e.replayUrl,
    COALESCE(ps.watchedSeconds, 0),
    COALESCE(ps.completionPercentage, 0),
    COALESCE(ps.isCompleted, FALSE)
  FROM episodes e
  LEFT JOIN episode_playback_state ps ON e.id = ps.episodeId AND ps.userId = p_userId
  WHERE e.showId = p_showId AND e.visibility = 'public'
  ORDER BY e.airDate DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get episode with all attachments
CREATE OR REPLACE FUNCTION get_episode_detail(
  p_episodeId TEXT
)
RETURNS TABLE (
  episode_id TEXT,
  episode_title TEXT,
  episode_description TEXT,
  episode_airDate TIMESTAMP,
  episode_durationSeconds INTEGER,
  notes_count INTEGER,
  challenges_count INTEGER,
  workbooks_count INTEGER,
  prompts_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.title,
    e.description,
    e.airDate,
    e.durationSeconds,
    (SELECT COUNT(*) FROM tea_time_notes WHERE episodeId = p_episodeId)::INTEGER,
    (SELECT COUNT(*) FROM challenges WHERE episodeId = p_episodeId)::INTEGER,
    (SELECT COUNT(*) FROM workbook_links WHERE episodeId = p_episodeId)::INTEGER,
    (SELECT COUNT(*) FROM reflection_prompts WHERE episodeId = p_episodeId)::INTEGER
  FROM episodes e
  WHERE e.id = p_episodeId AND e.visibility = 'public';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update episode.updatedAt on any change
CREATE OR REPLACE FUNCTION update_episode_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_episode_update
BEFORE UPDATE ON episodes
FOR EACH ROW
EXECUTE FUNCTION update_episode_timestamp();

-- Update note.updatedAt on any change
CREATE OR REPLACE FUNCTION update_note_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_note_update
BEFORE UPDATE ON tea_time_notes
FOR EACH ROW
EXECUTE FUNCTION update_note_timestamp();

-- ============================================================================
-- SEED DATA (SHOWS ONLY - EPISODES ADDED VIA APP)
-- ============================================================================

INSERT INTO shows (id, title, description, baseColor, secondaryColor, icon, schedule, hostName, hostBio, episodeCount)
VALUES
  ('tea-time-cj', 'Tea Time with CJ', 'Weekly conversations about discipline, boundaries, and intentional living', '#7C9885', '#F4A460', '🍵', 'Tuesdays 6pm CST', 'CJ Adisa', 'Founder of Tea Time Network', 0),
  ('motivation-court', 'Motivation Court', 'Real-time motivation, accountability, and action-oriented advice', '#5a7a64', '#FFD700', '⚖️', 'Mondays 6pm CST', 'CJ Adisa', NULL, 0),
  ('confession-court', 'Confession Court', 'Honest conversations about the hard things', '#8B4513', '#FFB6C1', '🎭', 'Saturdays 6pm CST', 'CJ Adisa', NULL, 0),
  ('sunday-power-hour', 'Sunday Power Hour', 'Start your week with intention, strategy, and momentum', '#FFD700', '#7C9885', '⚡', 'Sundays 6pm CST', 'CJ Adisa', NULL, 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- COMMENT ON SCHEMA
-- ============================================================================

COMMENT ON TABLE shows IS 'Canonical shows registry. Immutable. No new shows without code changes.';
COMMENT ON TABLE episodes IS 'Atomic content unit. All other content attaches here via episodeId.';
COMMENT ON TABLE tea_time_notes IS 'Notes attached to episodes. No duplication - one episodeId per note.';
COMMENT ON TABLE challenges IS 'Challenges attached to episodes. No duplication - one episodeId per challenge.';
COMMENT ON TABLE workbook_links IS 'Workbook links attached to episodes. No duplication - one episodeId per workbook.';
COMMENT ON TABLE reflection_prompts IS 'Reflection prompts attached to episodes. No duplication - one episodeId per prompt.';
COMMENT ON TABLE episode_playback_state IS 'User-specific playback state. Separate from Episode to avoid duplication.';
