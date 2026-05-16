-- ============================================================
-- LEARNING MATERIALS TABLE
-- Knowledge library / Learn page
-- ============================================================

CREATE TABLE IF NOT EXISTS public.learning_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  url TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'article'
    CHECK (category IN ('youtube', 'article', 'pdf', 'vocabulary', 'grammar', 'podcast', 'course', 'website', 'other')),
  notes TEXT,
  favorite BOOLEAN DEFAULT FALSE,
  thumbnail TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own learning materials' AND tablename = 'learning_materials') THEN
    CREATE POLICY "Users manage own learning materials"
      ON public.learning_materials FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END;
$$;


COMMENT ON TABLE public.learning_materials IS 'Learning materials saved by users — articles, videos, podcasts, notes, etc.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_learning_materials_user ON public.learning_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_materials_category ON public.learning_materials(user_id, category);
CREATE INDEX IF NOT EXISTS idx_learning_materials_tags ON public.learning_materials USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_learning_materials_created ON public.learning_materials(user_id, created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_learning_materials_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_learning_materials_updated_at ON public.learning_materials;
CREATE TRIGGER update_learning_materials_updated_at
  BEFORE UPDATE ON public.learning_materials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_learning_materials_updated_at();

-- Enable realtime (safe to re-run)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'learning_materials' AND schemaname = 'public') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_materials;
  END IF;
END;
$$;


-- Grants
GRANT ALL ON public.learning_materials TO authenticated;
GRANT SELECT ON public.learning_materials TO anon;