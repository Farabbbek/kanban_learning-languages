-- Add missing columns for goals feature
-- The original migration used 'goal_type' and 'due_date',
-- but the API and frontend use 'category' and 'deadline'

ALTER TABLE user_goals
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'custom',
  ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ;

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_user_goals_category ON user_goals(category);
