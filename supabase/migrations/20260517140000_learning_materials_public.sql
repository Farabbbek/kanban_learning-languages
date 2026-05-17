-- ============================================================
-- PUBLIC LEARNING MATERIALS
-- Community library: public read, owner-only write/delete
-- ============================================================

ALTER TABLE public.learning_materials
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_learning_materials_public_created
  ON public.learning_materials(is_public, created_at DESC);

DROP POLICY IF EXISTS "Users manage own learning materials" ON public.learning_materials;
DROP POLICY IF EXISTS "Public learning materials are readable" ON public.learning_materials;
DROP POLICY IF EXISTS "Users insert own learning materials" ON public.learning_materials;
DROP POLICY IF EXISTS "Users update own learning materials" ON public.learning_materials;
DROP POLICY IF EXISTS "Users delete own learning materials" ON public.learning_materials;

CREATE POLICY "Public learning materials are readable"
  ON public.learning_materials
  FOR SELECT
  TO authenticated
  USING (is_public OR auth.uid() = user_id);

CREATE POLICY "Users insert own learning materials"
  ON public.learning_materials
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own learning materials"
  ON public.learning_materials
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own learning materials"
  ON public.learning_materials
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_materials TO authenticated;

-- Storage bucket used by Learn page file uploads.
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'learning-materials',
  'learning-materials',
  TRUE,
  FALSE,
  10485760,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Anyone can view learning materials'
  ) THEN
    CREATE POLICY "Anyone can view learning materials"
      ON storage.objects FOR SELECT
      TO anon, authenticated
      USING (bucket_id = 'learning-materials');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users upload own learning materials'
  ) THEN
    CREATE POLICY "Users upload own learning materials"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'learning-materials'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users update own learning materials'
  ) THEN
    CREATE POLICY "Users update own learning materials"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'learning-materials'
        AND (storage.foldername(name))[1] = auth.uid()::text
      )
      WITH CHECK (
        bucket_id = 'learning-materials'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users delete own learning materials'
  ) THEN
    CREATE POLICY "Users delete own learning materials"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'learning-materials'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END;
$$;
