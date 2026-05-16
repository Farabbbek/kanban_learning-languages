-- Enable RLS on vocabulary_words
ALTER TABLE vocabulary_words ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own vocabulary" ON vocabulary_words;
DROP POLICY IF EXISTS "Users can insert own vocabulary" ON vocabulary_words;
DROP POLICY IF EXISTS "Users can update own vocabulary" ON vocabulary_words;
DROP POLICY IF EXISTS "Users can delete own vocabulary" ON vocabulary_words;

-- Allow users to SELECT their own vocabulary
CREATE POLICY "Users can view own vocabulary"
  ON vocabulary_words FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to INSERT their own vocabulary
CREATE POLICY "Users can insert own vocabulary"
  ON vocabulary_words FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to UPDATE their own vocabulary
CREATE POLICY "Users can update own vocabulary"
  ON vocabulary_words FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to DELETE their own vocabulary
CREATE POLICY "Users can delete own vocabulary"
  ON vocabulary_words FOR DELETE
  USING (auth.uid() = user_id);
