-- ============================================================
-- Optional: indexes for the inbox and unread-message badges.
-- Safe to run more than once.
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_messages_case_created
  ON messages (case_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_unread
  ON messages (case_id)
  WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_ai_roadmaps_youth
  ON ai_roadmaps (youth_profile_id, created_at DESC);
