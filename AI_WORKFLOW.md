# 🤖 Стратегия разработки LinguaBoard: Разделение AI-ассистентов

Документ описывает зоны ответственности различных AI-моделей в проекте LinguaBoard.

## 🎨 Gemini 3.1 Pro (Frontend & UI/UX)
**Роль:** Frontend Engineer
**Зона ответственности:** Next.js App Router (Client-side), Tailwind CSS, shadcn/ui, Drag-n-Drop, анимации, адаптив.

**Задачи (Task List):**
- [ ] Обертка проекта: `layout.tsx`, Navbar, Sidebar для дашборда.
- [ ] UI Авторизации: формы `/login` и `/register` с кнопкой `Войти через Google` (Supabase Auth).
- [ ] Канбан-доски (TaskFlow & LinguaLab): реализация Drag & Drop логики на `@hello-pangea/dnd`.
- [ ] Компоненты UI: настройка и стилизация карточек, модальных окон, кнопок через `shadcn/ui`.
- [ ] Плеер квизов и режим Флеш-карточек: интерактивный интерфейс пролистывания и чекинга ответов.
- [ ] Дашборд: интеграция графиков статистики (`Recharts`).

## ⚙️ DeepSeek (Backend, AI Integration & Supabase)
**Роль:** Backend Engineer & AI Orchestrator
**Зона ответственности:** Server Actions, API Routes (`/api/*`), База данных (Supabase, PostgreSQL, RLS), интеграция LLM-агентов.

**Задачи (Task List):**
- [ ] Безопасность БД: написать Row Level Security (RLS) политики для базы данных (изоляция по `user_id`).
- [ ] API Авторизации: настройка серверных сессий Supabase (`@supabase/ssr` middleware).
- [ ] CRUD API: маршруты для получения/создания/обновления задач, досок, языковых карточек.
- [ ] AI-Провайдеры: маршруты `/api/generate` (генерация карточек) и `/api/quiz` (генерация тестов).
- [ ] Function Calling Router: реализация `executeTool` и маршрутизатора в `/api/agent`.
- [ ] Поиск похожих слов: написание SQL-функций для `pgvector` гибридного поиска.

## 🧠 GPT / Codex (Алгоритмика & Бизнес-логика)
**Роль:** Data Scientist & Core Logic Engineer
**Зона ответственности:** Сложные вычисления, алгоритмы машинного обучения (SM-2, RAG), математические модели, анализ данных.

**Задачи (Task List):**
- [ ] Spaced Repetition: написать класс/функции алгоритма SM-2 (`src/lib/spaced-repetition.ts`).
- [ ] Расчет карточек на сегодня: алгоритмика отбора `get_due_reviews` и обновление параметров `ease_factor`, `interval`.
- [ ] Механика квизов: логика перемешивания вопросов, валидация ответов, расчет score/точности.
- [ ] RAG Pipeline: чанкинг заметок, векторизация текста, расчет скоринга релевантности (Embeddings cosine similarity).
- [ ] Агрегация статистики: сложные reduce/map функции для подготовки данных к выводу в дашборде (дни в стрике, процент успеха).