"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { HeroSection } from "@/components/dashboard/hero-section";
import { MiniStats } from "@/components/dashboard/mini-stats";
import { KanbanBoard, Column } from "@/components/dashboard/kanban-board";
import { RightPanel } from "@/components/dashboard/right-panel";
import { AddTaskModal } from "@/components/dashboard/add-task-modal";
import {
  BookOpen,
  Brain,
  LineChart,
} from "lucide-react";

interface BoardData {
  id: string;
  title: string;
  color: string;
  icon: string;
  columns: {
    id: string;
    title: string;
    color: string;
    tasks: {
      id: string;
      title: string;
      description?: string;
      category: string;
      progress: number;
      column_id: string;
      position: number;
    }[];
  }[];
}

interface UserLanguageData {
  id: string;
  name: string;
  flag: string;
  proficiency: string;
  streakDays: number;
}

interface QuizData {
  id: string;
  title: string;
  correctCount: number;
  totalQuestions: number;
  completed: boolean;
  score: number;
}

interface DashboardClientProps {
  displayName: string;
  streak: number;
  todayMinutes: number;
  dailyGoal: number;
  wordsLearned: number;
  quizzesCompleted: number;
  dueReviews: number;
  boards: BoardData[];
  userLanguages: UserLanguageData[];
  recentQuizzes: QuizData[];
  vocabByDifficulty: Record<string, number>;
}

export function DashboardClient({
  displayName,
  streak,
  todayMinutes,
  dailyGoal,
  wordsLearned,
  quizzesCompleted,
  dueReviews,
  boards,
  userLanguages,
  recentQuizzes,
  vocabByDifficulty,
}: DashboardClientProps) {
  const router = useRouter();

  // Flatten first board's columns into Kanban columns
  const initialColumns: Column[] =
    boards.length > 0
      ? boards[0].columns.map((col) => ({
          id: col.id,
          title: col.title,
          tasks: col.tasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            category: t.category,
            progress: t.progress,
            column_id: t.column_id,
            position: t.position,
          })),
        }))
      : [];

  const [columns, setColumns] = useState<Column[]>(initialColumns);

  // Sync when boards data changes
  if (boards.length > 0 && JSON.stringify(initialColumns) !== JSON.stringify(columns)) {
    setColumns(initialColumns);
  }

  const handleMoveTask = useCallback(
    async (taskId: string, targetColumnId: string, position: number) => {
      try {
        const res = await fetch(`/api/tasks/${taskId}/move`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ column_id: targetColumnId, position }),
        });
        if (!res.ok) throw new Error("Failed to move task");
        router.refresh();
      } catch (err) {
        console.error("Move error:", err);
      }
    },
    [router]
  );

  const handleToggleComplete = useCallback(
    async (taskId: string) => {
      try {
        // Find the task
        for (const col of columns) {
          const task = col.tasks.find((t) => t.id === taskId);
          if (task) {
            const isDone = col.id.toLowerCase().includes("done") || task.progress >= 100;

            // If done → move back to first column. If not → move to done column.
            const doneColumn = columns.find((c) => c.id.toLowerCase().includes("done"));
            const firstColumn = columns[0];

            const targetColId = isDone
              ? firstColumn?.id ?? col.id
              : doneColumn?.id ?? col.id;
            const progress = isDone ? 0 : 100;

            const res = await fetch(`/api/tasks/${taskId}/move`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ column_id: targetColId, position: 0 }),
            });
            if (!res.ok) throw new Error("Failed to update task");

            // Also update progress
            await fetch(`/api/tasks/${taskId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ progress }),
            });

            router.refresh();
            break;
          }
        }
      } catch (err) {
        console.error("Toggle error:", err);
      }
    },
    [columns, router]
  );

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [addTaskTargetColumn, setAddTaskTargetColumn] = useState("");

  const handleAddTask = useCallback(
    (columnId: string) => {
      setAddTaskTargetColumn(columnId);
      setIsAddTaskModalOpen(true);
    },
    []
  );

  return (
    <>
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        targetColumnId={addTaskTargetColumn}
      />
      <div className="min-h-screen bg-[#faf7f2] font-sans text-[#1c1917] selection:bg-[#d97757]/20">
      {/* Sidebar */}
      <Sidebar displayName={displayName} streak={streak} />

      {/* Main content area */}
      <div className="pl-[240px]">
        <main className="mx-auto max-w-[1400px] px-10 py-10">
          {/* Hero Section */}
          <HeroSection
            displayName={displayName}
            streak={streak}
            todayMinutes={todayMinutes}
            dailyGoal={dailyGoal}
          />

          {/* Today Tasks Kanban */}
          <div className="mt-8">
            <KanbanBoard
              columns={columns}
              onMoveTask={handleMoveTask}
              onToggleComplete={handleToggleComplete}
              onAddTask={handleAddTask}
            />
          </div>

          {/* Stats + Languages + Right Panel */}
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
            {/* Left content */}
            <div className="space-y-8">
              {/* Mini Stats */}
              <MiniStats
                studyMinutes={todayMinutes}
                streak={streak}
                wordsLearned={wordsLearned}
              />

              {/* Two columns: Languages + Recent */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Languages */}
                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-serif text-xl font-medium text-[#1c1917]">
                      Your Languages
                    </h2>
                    <a
                      href="/dashboard/languages"
                      className="text-xs font-semibold text-[#d97757] transition-colors hover:text-[#c56b47]"
                    >
                      + Add Language
                    </a>
                  </div>

                  {userLanguages.length > 0 ? (
                    <div className="space-y-4">
                      {userLanguages.map((ul) => (
                        <div
                          key={ul.id}
                          className="flex items-center gap-4 rounded-2xl border border-[#1c1917]/5 bg-white/60 p-5 shadow-sm backdrop-blur-md transition-all hover:shadow-md hover:-translate-y-0.5"
                        >
                          <span className="text-3xl">{ul.flag}</span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#1c1917]">
                              {ul.name}
                            </p>
                            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8d8175]">
                              {ul.proficiency.replace("_", " ")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-[#d97757]">
                              {ul.streakDays}d
                            </p>
                            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8d8175]">
                              streak
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#1c1917]/10 bg-white/20 p-8 text-center backdrop-blur-sm">
                      <BookOpen className="mx-auto mb-3 size-8 text-[#8d8175]/40" />
                      <p className="text-sm font-medium text-[#1c1917]">
                        No languages yet
                      </p>
                      <p className="mt-1 text-xs text-[#8d8175]">
                        Add your first language to get started
                      </p>
                    </div>
                  )}
                </section>

                {/* Recent Quizzes */}
                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-serif text-xl font-medium text-[#1c1917]">
                      Recent Quizzes
                    </h2>
                    <a
                      href="/dashboard/quizzes"
                      className="text-xs font-semibold text-[#d97757] transition-colors hover:text-[#c56b47]"
                    >
                      View All
                    </a>
                  </div>

                  {recentQuizzes.length > 0 ? (
                    <div className="space-y-4">
                      {recentQuizzes.map((q) => (
                        <div
                          key={q.id}
                          className="flex items-center gap-4 rounded-2xl border border-[#1c1917]/5 bg-white/60 p-5 shadow-sm backdrop-blur-md transition-all hover:shadow-md hover:-translate-y-0.5"
                        >
                          <div className="flex size-10 items-center justify-center rounded-full bg-[#d97757]/10">
                            <Brain className="size-5 text-[#d97757]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#1c1917]">
                              {q.title}
                            </p>
                            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8d8175]">
                              {q.completed
                                ? `${q.correctCount}/${q.totalQuestions} correct`
                                : "In progress"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-sm font-medium ${
                                q.totalQuestions > 0 && q.score >= 80
                                  ? "text-[#4b6a53]"
                                  : q.totalQuestions > 0 && q.score >= 50
                                    ? "text-[#d97757]"
                                    : "text-[#8d8175]"
                              }`}
                            >
                              {q.totalQuestions > 0 ? `${q.score}%` : "—"}
                            </p>
                            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8d8175]">
                              score
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#1c1917]/10 bg-white/20 p-8 text-center backdrop-blur-sm">
                      <LineChart className="mx-auto mb-3 size-8 text-[#8d8175]/40" />
                      <p className="text-sm font-medium text-[#1c1917]">
                        No quizzes yet
                      </p>
                      <p className="mt-1 text-xs text-[#8d8175]">
                        Complete your first quiz to see results
                      </p>
                    </div>
                  )}
                </section>
              </div>

              {/* Vocabulary Overview */}
              <section>
                <h2 className="mb-4 font-serif text-xl font-medium text-[#1c1917]">
                  Vocabulary Overview
                </h2>
                <div className="grid gap-6 sm:grid-cols-3">
                  {["beginner", "intermediate", "advanced"].map((level) => (
                    <div
                      key={level}
                      className="rounded-2xl border border-[#1c1917]/5 bg-white/60 p-6 shadow-sm backdrop-blur-md transition-all hover:shadow-md hover:-translate-y-0.5"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8d8175]">
                        {level}
                      </p>
                      <p className="mt-3 font-serif text-3xl font-medium text-[#1c1917]">
                        {vocabByDifficulty[level] ?? "—"}
                      </p>
                      <p className="mt-2 text-xs text-[#8d8175]">
                        words to review
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Panel */}
            <div className="lg:sticky lg:top-10 lg:self-start">
              <RightPanel
                dailyGoal={dailyGoal}
                todayMinutes={todayMinutes}
                quizzesCompleted={quizzesCompleted}
                dueReviews={dueReviews}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
    </>
  );
}
