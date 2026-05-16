CREATE TABLE IF NOT EXISTS vocabulary_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  transcription TEXT,
  example TEXT,
  language TEXT NOT NULL,
  level TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'learning' CHECK (status IN ('known', 'learning', 'favorite')),
  mastery_level INT DEFAULT 0,
  source TEXT DEFAULT 'ai_generated',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vocabulary_words_unique_word_lang ON vocabulary_words(user_id, LOWER(word), language);
CREATE INDEX IF NOT EXISTS idx_vocabulary_words_user_id ON vocabulary_words(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_words_language ON vocabulary_words(user_id, language);
CREATE INDEX IF NOT EXISTS idx_vocabulary_words_status ON vocabulary_words(user_id, status);
