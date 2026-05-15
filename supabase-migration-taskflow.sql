-- ============================================================
-- TASKFLOW — КАНБАН-ДОСКИ ЗАДАЧ
-- Добавить к основной схеме LinguaBoard
-- ============================================================

-- ============================================================
-- TF.0 ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: update_updated_at_column
-- Если уже есть в основной схеме — удалится и создастся заново
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- TF.1 TASK BOARDS — доски задач
-- ============================================================
CREATE TABLE IF NOT EXISTS public.task_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#FF6B35',
  icon TEXT DEFAULT '📋',
  position INT DEFAULT 0,
  
  -- Связь с языком (опционально)
  linked_language_id UUID REFERENCES public.languages(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.task_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own task boards"
  ON public.task_boards FOR ALL
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.task_boards IS 'Доски задач: AITU, Спорт, Проекты, Личное';
COMMENT ON COLUMN public.task_boards.linked_language_id IS 'Связь с языком — для кнопки «Сгенерировать слова»';

-- ============================================================
-- TF.2 TASK COLUMNS — колонки внутри доски
-- ============================================================
CREATE TABLE IF NOT EXISTS public.task_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.task_boards(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  color TEXT,
  wip_limit INT,                      -- Work In Progress limit
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.task_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage columns of own boards"
  ON public.task_columns FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.task_boards
      WHERE task_boards.id = task_columns.board_id
      AND task_boards.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.task_columns IS 'Колонки: Бэклог, На сегодня, В процессе, Готово';
COMMENT ON COLUMN public.task_columns.wip_limit IS 'Лимит задач в колонке (опционально)';

-- Seed: дефолтные колонки создаются через API при создании доски

-- ============================================================
-- TF.3 TASKS — задачи
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id UUID NOT NULL REFERENCES public.task_columns(id) ON DELETE CASCADE,
  board_id UUID NOT NULL REFERENCES public.task_boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Основное
  title TEXT NOT NULL,
  description TEXT,
  
  -- Приоритет и статус
  priority INT DEFAULT 2 CHECK (priority IN (1, 2, 3)),
  -- 1 = 🔴 Высокий
  -- 2 = 🟡 Средний
  -- 3 = 🔵 Низкий
  
  -- Время
  deadline TIMESTAMPTZ,
  estimated_minutes INT,
  actual_minutes INT,
  
  -- Теги
  tags TEXT[] DEFAULT '{}',
  
  -- Повторяемость
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_rule TEXT,                -- 'daily', 'weekly', 'weekdays', CRON
  recurring_days TEXT[] DEFAULT '{}', -- '{mon,wed,fri}'
  
  -- Связь с языком
  linked_language_id UUID REFERENCES public.languages(id) ON DELETE SET NULL,
  linked_vocabulary_ids UUID[] DEFAULT '{}',
  
  -- Связь с челленджем
  linked_challenge_id UUID REFERENCES public.challenges(id) ON DELETE SET NULL,
  
  -- Позиция в колонке
  position INT DEFAULT 0,
  
  -- Прогресс подзадач (вычисляется)
  subtasks_total INT DEFAULT 0,
  subtasks_completed INT DEFAULT 0,
  
  -- Время выполнения
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tasks"
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.tasks IS 'Задачи внутри колонок канбан-доски';
COMMENT ON COLUMN public.tasks.priority IS '1-Высокий 🔴, 2-Средний 🟡, 3-Низкий 🔵';
COMMENT ON COLUMN public.tasks.linked_language_id IS 'Связь с языком → кнопка «Сгенерировать слова»';
COMMENT ON COLUMN public.tasks.recurring_rule IS 'Правило повторения: daily, weekly, weekdays, или CRON';

-- ============================================================
-- TF.4 SUBTASKS — чеклист внутри задачи
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  position INT NOT NULL DEFAULT 0,
  
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage subtasks of own tasks"
  ON public.subtasks FOR ALL
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.subtasks IS 'Чеклист подзадач внутри задачи';

-- ============================================================
-- TF.5 TASK COMMENTS — комментарии к задаче
-- ============================================================
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage comments on own tasks"
  ON public.task_comments FOR ALL
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.task_comments IS 'Комментарии к задаче';

-- ============================================================
-- TF.6 TASK LABELS — метки/теги (опционально, если нужно больше чем tags[])
-- ============================================================
CREATE TABLE IF NOT EXISTS public.task_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  color TEXT DEFAULT '#FF6B35',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, name)
);

ALTER TABLE public.task_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own labels"
  ON public.task_labels FOR ALL
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.task_label_links (
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.task_labels(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, label_id)
);

ALTER TABLE public.task_label_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own task labels"
  ON public.task_label_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id = task_label_links.task_id
      AND tasks.user_id = auth.uid()
    )
  );

-- ============================================================
-- TF.7 POMODORO SESSIONS — сессии фокусировки
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  
  duration_minutes INT DEFAULT 25,
  type TEXT DEFAULT 'focus' CHECK (type IN ('focus', 'short_break', 'long_break')),
  
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own pomodoro"
  ON public.pomodoro_sessions FOR ALL
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.pomodoro_sessions IS 'Pomodoro-сессии для фокусировки на задачах';

-- ============================================================
-- ТРИГГЕРЫ TASKFLOW
-- ============================================================

-- TF-TRIGGER 1: Автообновление subtasks_total/subtasks_completed
CREATE OR REPLACE FUNCTION public.update_task_subtask_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    UPDATE public.tasks
    SET 
      subtasks_total = (SELECT COUNT(*) FROM public.subtasks WHERE task_id = COALESCE(NEW.task_id, OLD.task_id)),
      subtasks_completed = (SELECT COUNT(*) FROM public.subtasks WHERE task_id = COALESCE(NEW.task_id, OLD.task_id) AND is_completed = TRUE),
      updated_at = NOW()
    WHERE id = COALESCE(NEW.task_id, OLD.task_id);
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.tasks
    SET 
      subtasks_total = (SELECT COUNT(*) FROM public.subtasks WHERE task_id = OLD.task_id),
      subtasks_completed = (SELECT COUNT(*) FROM public.subtasks WHERE task_id = OLD.task_id AND is_completed = TRUE),
      updated_at = NOW()
    WHERE id = OLD.task_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_subtask_counts ON public.subtasks;
CREATE TRIGGER trigger_update_subtask_counts
  AFTER INSERT OR UPDATE OR DELETE ON public.subtasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_task_subtask_counts();

-- TF-TRIGGER 2: Авто-updated_at для task boards
DROP TRIGGER IF EXISTS update_task_boards_updated_at ON public.task_boards;
CREATE TRIGGER update_task_boards_updated_at
  BEFORE UPDATE ON public.task_boards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TF-TRIGGER 3: Авто-updated_at для tasks
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TF-TRIGGER 4: Авто-updated_at для task comments
DROP TRIGGER IF EXISTS update_task_comments_updated_at ON public.task_comments;
CREATE TRIGGER update_task_comments_updated_at
  BEFORE UPDATE ON public.task_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TF-TRIGGER 5: Авто-completed_at для задачи (когда перемещается в колонку «Готово»)
CREATE OR REPLACE FUNCTION public.set_task_completed_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_column_title TEXT;
BEGIN
  SELECT title INTO v_column_title
  FROM public.task_columns
  WHERE id = NEW.column_id;
  
  -- Если переместили в колонку «Готово» — ставим completed_at
  IF v_column_title IN ('Готово', 'Done', 'Completed', '✅ Готово') 
     AND NEW.completed_at IS NULL THEN
    NEW.completed_at = NOW();
  END IF;
  
  -- Если переместили из «Готово» — убираем completed_at
  IF v_column_title NOT IN ('Готово', 'Done', 'Completed', '✅ Готово') 
     AND OLD.completed_at IS NOT NULL THEN
    NEW.completed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_task_completed ON public.tasks;
CREATE TRIGGER trigger_set_task_completed
  BEFORE UPDATE OF column_id ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_task_completed_at();

-- ============================================================
-- ИНДЕКСЫ TASKFLOW
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_task_boards_user ON public.task_boards(user_id);
CREATE INDEX IF NOT EXISTS idx_task_boards_pos ON public.task_boards(user_id, position);

CREATE INDEX IF NOT EXISTS idx_task_columns_board ON public.task_columns(board_id);
CREATE INDEX IF NOT EXISTS idx_task_columns_pos ON public.task_columns(board_id, position);

CREATE INDEX IF NOT EXISTS idx_tasks_column ON public.tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_tasks_board ON public.tasks(board_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON public.tasks(user_id, deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_recurring ON public.tasks(user_id, is_recurring);
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON public.tasks USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_subtasks_task ON public.subtasks(task_id);

CREATE INDEX IF NOT EXISTS idx_task_comments_task ON public.task_comments(task_id);

CREATE INDEX IF NOT EXISTS idx_pomodoro_user ON public.pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_task ON public.pomodoro_sessions(task_id);

-- ============================================================
-- RLS: SERVER-SIDE (service_role bypass)
-- ============================================================

CREATE POLICY "Service role full access task boards"
  ON public.task_boards FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access task columns"
  ON public.task_columns FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access tasks"
  ON public.tasks FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access subtasks"
  ON public.subtasks FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- GRANTS
-- ============================================================
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT, UPDATE, DELETE ON 
  public.task_boards, 
  public.task_columns, 
  public.tasks, 
  public.subtasks, 
  public.task_comments,
  public.task_labels,
  public.task_label_links,
  public.pomodoro_sessions
TO authenticated;

-- ============================================================
-- ГОТОВО: TASKFLOW
-- ============================================================
-- Таблиц добавлено: 7
--   • task_boards        — доски задач
--   • task_columns       — колонки (Бэклог, На сегодня, В процессе, Готово)
--   • tasks              — задачи
--   • subtasks           — чеклист подзадач
--   • task_comments      — комментарии
--   • task_labels        — метки (опционально)
--   • pomodoro_sessions  — фокус-сессии
-- Триггеров: 5
-- Индексов: 13
-- ============================================================
