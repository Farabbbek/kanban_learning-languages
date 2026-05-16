-- ============================================================
-- ADD file_path COLUMN TO learning_materials
-- Для хранения ссылок на загруженные PDF/DOCX/XLSX/TXT
-- ============================================================

ALTER TABLE public.learning_materials
  ADD COLUMN IF NOT EXISTS file_path TEXT;

COMMENT ON COLUMN public.learning_materials.file_path IS 'Public URL of uploaded file in Supabase Storage (PDF, DOCX, TXT, XLSX)';