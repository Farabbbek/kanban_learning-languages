-- ============================================================
-- SM-2 (Spaced Repetition) columns for vocabulary_words
-- ============================================================

-- Add SM-2 fields to vocabulary_words
ALTER TABLE vocabulary_words
  ADD COLUMN IF NOT EXISTS ease_factor FLOAT DEFAULT 2.5,
  ADD COLUMN IF NOT EXISTS interval_days INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_review_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS correct_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0;
