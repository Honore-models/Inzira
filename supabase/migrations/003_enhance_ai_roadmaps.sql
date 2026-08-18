-- ============================================================
-- ENHANCE AI ROADMAPS TABLE
-- Add structured JSON storage for AI-generated roadmap data
-- ============================================================

-- Add columns to store the full AI-generated roadmap JSON
ALTER TABLE ai_roadmaps
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS steps_data JSONB,
  ADD COLUMN IF NOT EXISTS sources JSONB,
  ADD COLUMN IF NOT EXISTS officer_notes TEXT,
  ADD COLUMN IF NOT EXISTS youth_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_roadmaps_case ON ai_roadmaps(case_id);
CREATE INDEX IF NOT EXISTS idx_ai_roadmaps_status ON ai_roadmaps(status);
