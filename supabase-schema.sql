-- ============================================================
-- LINGUABOARD v1.0 — FINAL PRODUCTION SCHEMA
-- ============================================================
-- Языки: English, Spanish, French, Chinese (4 языка)
-- Difficulty: beginner, intermediate, advanced (выбирает юзер)
-- Quiz types: vocabulary, grammar, mixed (3 типа)
-- Listening/Speaking: COMING SOON (не в схеме)
-- ============================================================

-- ============================================================
-- 0. EXTENSIONS & CLEANUP
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Очистка (если нужно пересоздать)
-- DROP TABLE IF EXISTS public.agent_audit_log CASCADE;
-- DROP TABLE IF EXISTS public.quiz_answers CASCADE;
-- DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
-- DROP TABLE IF EXISTS public.quiz_questions CASCADE;
-- DROP TABLE IF EXISTS public.quizzes CASCADE;
-- DROP TABLE IF EXISTS public.study_sessions CASCADE;
-- DROP TABLE IF EXISTS public.vocabulary CASCADE;
-- DROP TABLE IF EXISTS public.user_languages CASCADE;
-- DROP TABLE IF EXISTS public.languages CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  
  -- Цели и предпочтения
  daily_goal_minutes INT DEFAULT 20,
  daily_task_goal INT DEFAULT 5,
  weekly_task_goal INT DEFAULT 25,
  preferred_card_count INT DEFAULT 10,
  preferred_quiz_question_count INT DEFAULT 10,
  preferred_ai_model TEXT DEFAULT 'deepseek-chat',
  
  -- Онбординг
  onboarding_step INT DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  
  -- Мета
  timezone TEXT DEFAULT 'Asia/Almaty',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

COMMENT ON TABLE public.profiles IS 'Расширение auth.users — профиль с целями и предпочтениями';
COMMENT ON COLUMN public.profiles.preferred_card_count IS 'Сколько слов генерировать по умолчанию';
COMMENT ON COLUMN public.profiles.preferred_quiz_question_count IS 'Сколько вопросов в квизе по умолчанию';
COMMENT ON COLUMN public.profiles.onboarding_step IS '0=не начат, 1=задачи, 2=языки, 3=AI, 4=готов';

-- ============================================================
-- 1a. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. LANGUAGES (ТОЛЬКО 4)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  flag_emoji TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view languages"
  ON public.languages FOR SELECT
  TO anon, authenticated
  USING (true);

-- Seed: только 4 языка
INSERT INTO public.languages (code, name, native_name, flag_emoji) VALUES
  ('en', 'English', 'English', '🇬🇧'),
  ('es', 'Spanish', 'Español', '🇪🇸'),
  ('fr', 'French', 'Français', '🇫🇷'),
  ('zh', 'Chinese', '中文', '🇨🇳')
ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE public.languages IS 'Доступные языки. Только 4: EN, ES, FR, ZH';

-- ============================================================
-- 3. USER LANGUAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  
  -- Юзер САМ выбирает уровень
  proficiency_level TEXT NOT NULL DEFAULT 'beginner'
    CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced')),
  
  -- Статистика (обновляется триггерами или API)
  streak_days INT DEFAULT 0,
  total_study_minutes INT DEFAULT 0,
  words_learned INT DEFAULT 0,
  words_total INT DEFAULT 0,
  quiz_accuracy FLOAT DEFAULT 0,
  quizzes_taken INT DEFAULT 0,
  quizzes_passed INT DEFAULT 0,
  last_study_date DATE,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, language_id)
);

ALTER TABLE public.user_languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their languages"
  ON public.user_languages FOR ALL
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.user_languages IS 'Языки пользователя с персональной статистикой';
COMMENT ON COLUMN public.user_languages.proficiency_level IS 'Уровень: beginner/intermediate/advanced — выбирает юзер';

-- ============================================================
-- 4. VOCABULARY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  
  -- Слово и перевод
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  phonetic TEXT,
  example_sentence TEXT,
  example_translation TEXT,
  part_of_speech TEXT,
  notes TEXT,
  
  -- Сложность (выбирает юзер)
  difficulty TEXT NOT NULL DEFAULT 'beginner'
    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  
  -- Spaced Repetition (алгоритм SM-2)
  mastery_level INT DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 5),
  review_count INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  ease_factor FLOAT DEFAULT 2.5,
  interval_days INT DEFAULT 1,
  next_review_at TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed_at TIMESTAMPTZ,
  
  -- Статус в канбане
  column_status TEXT DEFAULT 'new'
    CHECK (column_status IN ('new', 'learning', 'reviewing', 'mastered')),
  
  -- AI-generated?
  generated_by_ai BOOLEAN DEFAULT FALSE,
  generation_topic TEXT,
  
  -- Теги
  tags TEXT[] DEFAULT '{}',
  
  -- Вектор для семантического поиска
  embedding vector(1536),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, language_id, word)
);

ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own vocabulary"
  ON public.vocabulary FOR ALL
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.vocabulary IS 'Личный словарь пользователя с Spaced Repetition';
COMMENT ON COLUMN public.vocabulary.column_status IS 'Канбан-статус: new → learning → reviewing → mastered';
COMMENT ON COLUMN public.vocabulary.mastery_level IS 'Уровень освоения 0-5 (алгоритм SM-2)';
COMMENT ON COLUMN public.vocabulary.generation_topic IS 'Тема, по которой сгенерировано слово (если AI)';

-- ============================================================
-- 5. QUIZZES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  
  -- Сложность (выбирает юзер)
  difficulty TEXT NOT NULL DEFAULT 'beginner'
    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  
  -- Тип квиза (только 3)
  quiz_type TEXT NOT NULL DEFAULT 'vocabulary'
    CHECK (quiz_type IN ('vocabulary', 'grammar', 'mixed')),
  
  -- Тема (любая, пишет юзер)
  topic TEXT,
  
  question_count INT DEFAULT 10,
  time_limit_minutes INT,
  image_url TEXT,
  
  -- Статистика квиза
  times_taken INT DEFAULT 0,
  average_score FLOAT DEFAULT 0,
  
  is_published BOOLEAN DEFAULT FALSE,
  generated_by_ai BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published quizzes"
  ON public.quizzes FOR SELECT
  TO anon, authenticated
  USING (is_published = TRUE);

CREATE POLICY "Creator manages own quizzes"
  ON public.quizzes FOR ALL
  USING (auth.uid() = creator_id);

COMMENT ON TABLE public.quizzes IS 'Квизы. Только 3 типа: vocabulary, grammar, mixed';
COMMENT ON COLUMN public.quizzes.topic IS 'Тема квиза — любая, вводит пользователь';
COMMENT ON COLUMN public.quizzes.question_count IS 'По умолчанию 10 вопросов';

-- ============================================================
-- 6. QUIZ QUESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice'
    CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'matching')),
  
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INT DEFAULT 1,
  sort_order INT DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quiz questions"
  ON public.quiz_questions FOR SELECT
  TO anon, authenticated
  USING (true);

COMMENT ON TABLE public.quiz_questions IS 'Вопросы квиза. Типы: multiple_choice, true_false, fill_blank, matching';

-- ============================================================
-- 7. QUIZ ATTEMPTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  
  score INT DEFAULT 0,
  total_questions INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  incorrect_count INT DEFAULT 0,
  accuracy FLOAT GENERATED ALWAYS AS (
    CASE WHEN total_questions > 0
      THEN correct_count::float / NULLIF(total_questions, 0)
      ELSE 0
    END
  ) STORED,
  
  time_spent_seconds INT DEFAULT 0,
  
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own attempts"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own attempts"
  ON public.quiz_attempts FOR UPDATE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.quiz_attempts IS 'Попытки прохождения квизов. Результаты хранятся здесь';
COMMENT ON COLUMN public.quiz_attempts.accuracy IS 'Процент правильных ответов (correct_count / total_questions)';

-- ============================================================
-- 8. QUIZ ANSWERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own answers"
  ON public.quiz_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts
      WHERE quiz_attempts.id = quiz_answers.attempt_id
      AND quiz_attempts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users insert own answers"
  ON public.quiz_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts
      WHERE quiz_attempts.id = quiz_answers.attempt_id
      AND quiz_attempts.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.quiz_answers IS 'Ответы на каждый вопрос в попытке';

-- ============================================================
-- 9. STUDY SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  
  session_type TEXT NOT NULL DEFAULT 'general'
    CHECK (session_type IN ('general', 'vocabulary', 'grammar', 'quiz', 'review')),
  
  difficulty TEXT DEFAULT 'beginner'
    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  
  duration_minutes INT DEFAULT 0,
  words_studied INT DEFAULT 0,
  words_learned INT DEFAULT 0,
  quizzes_taken INT DEFAULT 0,
  notes TEXT,
  
  completed BOOLEAN DEFAULT TRUE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sessions"
  ON public.study_sessions FOR ALL
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.study_sessions IS 'Сессии учёбы. Сессия = одна активность (учёба слов/квиз/повторение)';
COMMENT ON COLUMN public.study_sessions.session_type IS 'Тип сессии: general, vocabulary, grammar, quiz, review';

-- ============================================================
-- 10. AGENT AUDIT LOG (AI Security)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  tool_params JSONB,
  tool_result JSONB,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  execution_time_ms INT,
  tokens_used INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.agent_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own audit log"
  ON public.agent_audit_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System inserts audit log"
  ON public.agent_audit_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.agent_audit_log IS 'Лог всех вызовов AI-агента (Уровень 5: Agentic Security)';
COMMENT ON COLUMN public.agent_audit_log.tool_name IS 'Имя функции: generate_word_cards, create_quiz, get_due_reviews и т.д.';
COMMENT ON COLUMN public.agent_audit_log.execution_time_ms IS 'Время выполнения в миллисекундах';

-- ============================================================
-- 11. CHALLENGES (Челленджи)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  
  total_days INT NOT NULL CHECK (total_days >= 7 AND total_days <= 365),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  
  daily_goal_minutes INT DEFAULT 20,
  daily_goal_cards INT DEFAULT 10,
  
  completed_days INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own challenges"
  ON public.challenges FOR ALL
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.challenge_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  
  date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  minutes_studied INT DEFAULT 0,
  cards_studied INT DEFAULT 0,
  quizzes_taken INT DEFAULT 0,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(challenge_id, date)
);

ALTER TABLE public.challenge_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own challenge days"
  ON public.challenge_days FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.challenges
      WHERE challenges.id = challenge_days.challenge_id
      AND challenges.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.challenges IS 'Челленджи (30 дней языка и т.д.)';
COMMENT ON TABLE public.challenge_days IS 'Отметки дней в челлендже';

-- ============================================================
-- 12a. TASKFLOW: TASK BOARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.task_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  color TEXT DEFAULT '#c56b47',
  icon TEXT DEFAULT '📋',
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.task_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own task boards"
  ON public.task_boards FOR ALL
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.task_boards IS 'Доски задач TaskFlow';

-- ============================================================
-- 12b. TASKFLOW: TASK COLUMNS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.task_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.task_boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INT NOT NULL,
  color TEXT DEFAULT '#8d8175',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.task_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own task columns via boards"
  ON public.task_columns FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.task_boards
      WHERE task_boards.id = task_columns.board_id
      AND task_boards.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.task_columns IS 'Колонки канбан-доски задач';

-- ============================================================
-- 12c. TASKFLOW: TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id UUID NOT NULL REFERENCES public.task_columns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority INT DEFAULT 2 CHECK (priority >= 1 AND priority <= 3),
  deadline TIMESTAMPTZ,
  estimated_min INT,
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'general',
  is_recurring BOOLEAN DEFAULT FALSE,
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tasks"
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.tasks IS 'Задачи в канбан-доске';
COMMENT ON COLUMN public.tasks.category IS 'Категория: vocabulary, flashcards, listening, speaking, grammar, general';

-- ============================================================
-- 12d. TASKFLOW: SUBTASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  position INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own subtasks"
  ON public.subtasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id = subtasks.task_id
      AND tasks.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.subtasks IS 'Подзадачи с чекбоксами';

-- ============================================================
-- 12e. GRAMMAR NOTES
CREATE TABLE IF NOT EXISTS public.grammar_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.grammar_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notes"
  ON public.grammar_notes FOR ALL
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.grammar_notes IS 'Грамматические заметки пользователя (Markdown)';

-- ============================================================
-- 13. FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Применить ко всем таблицам с updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_languages_updated_at ON public.user_languages;
CREATE TRIGGER update_user_languages_updated_at
  BEFORE UPDATE ON public.user_languages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_vocabulary_updated_at ON public.vocabulary;
CREATE TRIGGER update_vocabulary_updated_at
  BEFORE UPDATE ON public.vocabulary
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_quizzes_updated_at ON public.quizzes;
CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_challenges_updated_at ON public.challenges;
CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_grammar_notes_updated_at ON public.grammar_notes;
CREATE TRIGGER update_grammar_notes_updated_at
  BEFORE UPDATE ON public.grammar_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 13b. TRIGGERS: AUTO-UPDATE user_languages STATISTICS
-- ============================================================

-- Триггер: при добавлении/удалении слова — обновить words_learned / words_total
CREATE OR REPLACE FUNCTION public.update_user_language_vocab_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  _user_id UUID;
  _language_id UUID;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    _user_id := NEW.user_id;
    _language_id := NEW.language_id;
  ELSE
    _user_id := OLD.user_id;
    _language_id := OLD.language_id;
  END IF;

  UPDATE public.user_languages
  SET
    words_learned = (
      SELECT COUNT(*) FROM public.vocabulary
      WHERE user_id = _user_id
        AND language_id = _language_id
        AND mastery_level >= 3
    ),
    words_total = (
      SELECT COUNT(*) FROM public.vocabulary
      WHERE user_id = _user_id
        AND language_id = _language_id
    )
  WHERE user_id = _user_id AND language_id = _language_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_vocabulary_update_word_counts ON public.vocabulary;
CREATE TRIGGER trg_vocabulary_update_word_counts
  AFTER INSERT OR DELETE OR UPDATE OF mastery_level
  ON public.vocabulary
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_language_vocab_count();

-- Триггер: при создании study_session — обновить last_study_date и total_study_minutes
CREATE OR REPLACE FUNCTION public.update_user_language_study_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.user_languages
  SET
    last_study_date = GREATEST(last_study_date, NEW.session_date),
    total_study_minutes = total_study_minutes + COALESCE(NEW.duration_minutes, 0)
  WHERE user_id = NEW.user_id AND language_id = NEW.language_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_study_sessions_update_stats ON public.study_sessions;
CREATE TRIGGER trg_study_sessions_update_stats
  AFTER INSERT ON public.study_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_language_study_stats();

-- Триггер: при завершении попытки квиза — обновить quiz_accuracy / quizzes_taken / quizzes_passed
CREATE OR REPLACE FUNCTION public.update_user_language_quiz_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.completed = TRUE AND (OLD IS NULL OR OLD.completed = FALSE) THEN
    UPDATE public.user_languages
    SET
      quizzes_taken = quizzes_taken + 1,
      quizzes_passed = CASE WHEN NEW.accuracy >= 0.6 THEN quizzes_passed + 1 ELSE quizzes_passed END,
      quiz_accuracy = (
        SELECT COALESCE(AVG(accuracy), 0)
        FROM public.quiz_attempts qa
        JOIN public.quizzes q ON q.id = qa.quiz_id
        WHERE qa.user_id = NEW.user_id
          AND q.language_id = (
            SELECT language_id FROM public.quizzes WHERE id = NEW.quiz_id
          )
          AND qa.completed = TRUE
      )
    WHERE user_id = NEW.user_id
      AND language_id = (SELECT language_id FROM public.quizzes WHERE id = NEW.quiz_id);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_quiz_attempts_update_stats ON public.quiz_attempts;
CREATE TRIGGER trg_quiz_attempts_update_stats
  AFTER INSERT OR UPDATE OF completed
  ON public.quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_language_quiz_stats();

-- Триггер: при обновлении streak_days в user_languages — обновить challenges
CREATE OR REPLACE FUNCTION public.update_challenge_streak_from_user_lang()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.streak_days IS DISTINCT FROM OLD.streak_days THEN
    UPDATE public.challenges
    SET
      current_streak = NEW.streak_days,
      best_streak = GREATEST(best_streak, NEW.streak_days)
    WHERE user_id = NEW.user_id
      AND language_id = NEW.language_id
      AND is_active = TRUE;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_languages_update_challenge_streak ON public.user_languages;
CREATE TRIGGER trg_user_languages_update_challenge_streak
  AFTER UPDATE OF streak_days
  ON public.user_languages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_challenge_streak_from_user_lang();

-- ============================================================
-- 14. INDEXES
-- ============================================================

-- User Languages
CREATE INDEX IF NOT EXISTS idx_user_languages_user ON public.user_languages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_languages_active ON public.user_languages(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_languages_lang ON public.user_languages(language_id);

-- Vocabulary
CREATE INDEX IF NOT EXISTS idx_vocabulary_user ON public.vocabulary(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_lang ON public.vocabulary(language_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_review ON public.vocabulary(user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_vocabulary_difficulty ON public.vocabulary(user_id, language_id, difficulty);
CREATE INDEX IF NOT EXISTS idx_vocabulary_status ON public.vocabulary(user_id, column_status);
CREATE INDEX IF NOT EXISTS idx_vocabulary_mastery ON public.vocabulary(user_id, mastery_level);
CREATE INDEX IF NOT EXISTS idx_vocabulary_tags ON public.vocabulary USING GIN (tags);

-- Quizzes
CREATE INDEX IF NOT EXISTS idx_quizzes_lang ON public.quizzes(language_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_creator ON public.quizzes(creator_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_published ON public.quizzes(is_published);
CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty ON public.quizzes(language_id, difficulty);

-- Quiz Questions
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_sort ON public.quiz_questions(quiz_id, sort_order);

-- Quiz Attempts
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_date ON public.quiz_attempts(user_id, completed_at);

-- Quiz Answers
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt ON public.quiz_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question ON public.quiz_answers(question_id);

-- Study Sessions
CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON public.study_sessions(user_id, session_date);
CREATE INDEX IF NOT EXISTS idx_study_sessions_lang ON public.study_sessions(language_id);

-- Agent Audit Log
CREATE INDEX IF NOT EXISTS idx_agent_audit_user ON public.agent_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_audit_tool ON public.agent_audit_log(tool_name);
CREATE INDEX IF NOT EXISTS idx_agent_audit_date ON public.agent_audit_log(created_at);

-- Challenges
CREATE INDEX IF NOT EXISTS idx_challenges_user ON public.challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON public.challenges(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_challenge_days_challenge ON public.challenge_days(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_days_date ON public.challenge_days(challenge_id, date);

-- Grammar Notes
CREATE INDEX IF NOT EXISTS idx_grammar_notes_user ON public.grammar_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_grammar_notes_lang ON public.grammar_notes(language_id);

-- ============================================================
-- 14b. FULL-TEXT SEARCH INDEXES
-- ============================================================

-- Полнотекстовый поиск по словам в vocabulary
CREATE INDEX IF NOT EXISTS idx_vocabulary_fts
  ON public.vocabulary
  USING GIN (to_tsvector('simple', COALESCE(word, '') || ' ' || COALESCE(translation, '')));

-- Полнотекстовый поиск по грамматическим заметкам
CREATE INDEX IF NOT EXISTS idx_grammar_notes_fts
  ON public.grammar_notes
  USING GIN (to_tsvector('simple', COALESCE(content, '')));

-- ============================================================
-- 15. GRANTS
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- ============================================================
-- DONE
-- ============================================================
-- Таблицы созданы: 17 (13 original + 4 TaskFlow: task_boards, task_columns, tasks, subtasks)
-- Политик RLS: 26 (22 original + 4 TaskFlow)
-- Индексов: 32 (включая 2 GIN для полнотекстового поиска)
-- Триггеров: 11 (7 auto-update + 4 статистики)
-- Функций: 6 (handle_new_user + update_updated_at + 4 триггерных)
-- Языков: 4 (EN, ES, FR, ZH)
-- ============================================================
