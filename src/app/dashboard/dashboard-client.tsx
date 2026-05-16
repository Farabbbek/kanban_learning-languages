"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "@/components/dashboard/sidebar";
import { HeroSection } from "@/components/dashboard/hero-section";
import { KanbanBoard, Column } from "@/components/dashboard/kanban-board";
import { AddTaskModal } from "@/components/dashboard/add-task-modal";
import { DeleteConfirmModal } from "@/components/dashboard/delete-confirm-modal";
import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer";
import { useStudyTracker } from "@/hooks/use-study-tracker";

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
      tags: string[];
      priority: number;
      estimated_minutes?: number;
      column_id: string;
      position: number;
    }[];
  }[];
}

interface DashboardClientProps {
  displayName: string;
  todayMinutes: number;
  dailyGoal: number;
  boards: BoardData[];
  initialStreak: number;
}

function flattenColumns(boards: BoardData[]): Column[] {
  if (boards.length === 0) return [];
  return boards[0].columns.map((col) => ({
    id: col.id,
    title: col.title,
    tasks: col.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      tags: t.tags,
      priority: t.priority,
      estimated_minutes: t.estimated_minutes,
      column_id: t.column_id,
      position: t.position,
    })),
  }));
}

export function DashboardClient({
  displayName,
  todayMinutes,
  dailyGoal,
  boards,
  initialStreak,
}: DashboardClientProps) {
  const freshColumns = useMemo(() => flattenColumns(boards), [boards]);
  const [columns, setColumns] = useState<Column[]>(freshColumns);
  const columnsRef = useRef(columns);

  useEffect(() => {
    columnsRef.current = columns;
  });

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  // Auto-track study time
  useStudyTracker();

  // Streak state
  const [streak, setStreak] = useState(initialStreak);

  // Fetch streak on mount and periodically
  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await fetch("/api/study/streak");
        if (res.ok) {
          const data = await res.json();
          setStreak(data.streak);
        }
      } catch {
        // silent
      }
    };
    fetchStreak();
    const interval = setInterval(fetchStreak, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Pomodoro state
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);

  const handleMoveTask = useCallback(
    (taskId: string, targetColumnId: string, position: number) => {
      setColumns((prev) => {
        let sourceColIdx = -1;
        let taskIdx = -1;

        for (let ci = 0; ci < prev.length; ci++) {
          const ti = prev[ci].tasks.findIndex((t) => t.id === taskId);
          if (ti !== -1) { sourceColIdx = ci; taskIdx = ti; break; }
        }

        if (sourceColIdx === -1 || taskIdx === -1) return prev;
        const destColIdx = prev.findIndex((c) => c.id === targetColumnId);
        if (destColIdx === -1) return prev;

        const newCols = prev.map((c) => ({ ...c, tasks: [...c.tasks] }));
        const [movedTask] = newCols[sourceColIdx].tasks.splice(taskIdx, 1);
        newCols[destColIdx].tasks.splice(position, 0, movedTask);

        fetch(`/api/tasks/${taskId}/move`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ column_id: targetColumnId, position }),
        }).catch((err) => console.error("Move API error:", err));

        return newCols;
      });
    },
    []
  );

  const handleToggleComplete = useCallback((taskId: string) => {
    setColumns((prev) => {
      let sourceColIdx = -1;
      let taskIdx = -1;
      for (let ci = 0; ci < prev.length; ci++) {
        const ti = prev[ci].tasks.findIndex((t) => t.id === taskId);
        if (ti !== -1) { sourceColIdx = ci; taskIdx = ti; break; }
      }
      if (sourceColIdx === -1 || taskIdx === -1) return prev;
      const isDone = prev[sourceColIdx].title.toLowerCase() === "done";
      const doneColIdx = prev.findIndex((c) => c.title.toLowerCase() === "done");
      const targetColIdx = isDone ? 0 : doneColIdx;
      if (targetColIdx === -1) return prev;
      const newCols = prev.map((c) => ({ ...c, tasks: [...c.tasks] }));
      const [moved] = newCols[sourceColIdx].tasks.splice(taskIdx, 1);
      newCols[targetColIdx].tasks.unshift(moved);
      const targetColId = newCols[targetColIdx].id;
      fetch(`/api/tasks/${taskId}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ column_id: targetColId, position: 0 }),
      }).catch((err) => console.error("Toggle API error:", err));
      return newCols;
    });
  }, []);

  const handleDeleteRequest = useCallback((taskId: string) => {
    const task = columnsRef.current.flatMap((c) => c.tasks).find((t) => t.id === taskId);
    if (task) setDeleteTarget({ id: taskId, title: task.title });
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setColumns((prev) => prev.map((col) => ({ ...col, tasks: col.tasks.filter((t) => t.id !== id) })));
    setDeleteTarget(null);
    fetch(`/api/tasks/${id}`, { method: "DELETE" }).catch((err) => console.error("Delete API error:", err));
  }, [deleteTarget]);

  useEffect(() => {
    const supabase = createClient();
    const colIds = columnsRef.current.map((c) => c.id);
    if (colIds.length === 0) return;
    const channel = supabase
      .channel("tasks-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, async () => {
        const { data: freshTasks } = await supabase.from("tasks").select("*").in("column_id", colIds).order("position", { ascending: true });
        if (freshTasks) {
          setColumns((prev) =>
            prev.map((col) => ({
              ...col,
              tasks: freshTasks.filter((t) => t.column_id === col.id).map((t) => ({
                id: t.id, title: t.title, description: t.description ?? undefined,
                tags: t.tags ?? [], priority: t.priority ?? 2,
                estimated_minutes: t.estimated_minutes ?? undefined,
                column_id: t.column_id, position: t.position,
              })),
            }))
          );
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const handleAddTaskToColumn = useCallback((_columnId: string) => setIsAddTaskModalOpen(true), []);

  return (
    <>
      <AddTaskModal isOpen={isAddTaskModalOpen} onClose={() => setIsAddTaskModalOpen(false)} targetColumnId={columns[0]?.id ?? ""} />
      <DeleteConfirmModal isOpen={deleteTarget !== null} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} taskTitle={deleteTarget?.title ?? ""} />
      <PomodoroTimer isOpen={isPomodoroOpen} onClose={() => setIsPomodoroOpen(false)} />

      {/* Floating Pomodoro Button — Toggle */}
      <button
        onClick={() => setIsPomodoroOpen((prev) => !prev)}
        className={`group fixed bottom-7 right-7 z-50 flex size-[68px] items-center justify-center rounded-full transition-all duration-[350ms] cubic-bezier(0.16,1,0.3,1) hover:-translate-y-1 hover:scale-[1.04] ${
          isPomodoroOpen
            ? "shadow-[0_8px_24px_rgba(40,20,10,0.15)] scale-[0.96] opacity-80"
            : "shadow-[0_14px_40px_rgba(40,20,10,0.25),0_0_40px_rgba(220,170,110,0.18)] hover:shadow-[0_20px_50px_rgba(40,20,10,0.35),0_0_60px_rgba(220,170,110,0.25)]"
        }`}
        style={{
          background: isPomodoroOpen
            ? "linear-gradient(145deg, #3a2920 0%, #2d1f18 100%)"
            : "linear-gradient(145deg, #2d1f18 0%, #3a2920 100%)",
          border: isPomodoroOpen
            ? "1px solid rgba(255,255,255,0.04)"
            : "1px solid rgba(255,255,255,0.08)",
        }}
        aria-label={isPomodoroOpen ? "Close Pomodoro Timer" : "Open Pomodoro Timer"}
      >
        {/* Inner glow */}
        <div className={`pointer-events-none absolute inset-0 rounded-full blur-sm transition-opacity duration-300 ${
          isPomodoroOpen ? "opacity-0" : "opacity-100 bg-[rgba(220,170,110,0.06)]"
        }`} />

        {/* Icon */}
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f1d2a8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-10"
        >
          <path d="M12 2a10 10 0 1 0 10 10" />
          <path d="M12 6v6l4 2" />
          <path d="M20 2v6" />
          <path d="M17 5h6" />
        </svg>
      </button>

      <div
        className="min-h-screen font-sans text-[#2A211C] selection:bg-[#D88A5B]/20"
        style={{
          background: "linear-gradient(180deg, #f7f2ea 0%, #f3eee6 100%)",
        }}
      >
        {/* Subtle warm lighting — reduced */}
        <div className="pointer-events-none fixed -right-32 -top-32 z-0 size-[350px] rounded-full bg-[#D88A5B]/2 blur-[60px]" />
        <div className="pointer-events-none fixed -left-32 bottom-0 z-0 size-[250px] rounded-full bg-[#D88A5B]/1.5 blur-[50px]" />

        {/* Subtle noise texture */}
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.012] mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        <Sidebar
          displayName={displayName}
          streak={streak}
        />

        <div className="relative z-10 pl-[220px]">
          <main className="mx-auto max-w-[1440px] px-8 py-5">
            <HeroSection displayName={displayName} todayMinutes={todayMinutes} dailyGoal={dailyGoal} />

            {/* Kanban — full width, dominant */}
            <div className="mt-4">
              <KanbanBoard
                columns={columns}
                onMoveTask={handleMoveTask}
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteRequest}
                onAddTask={handleAddTaskToColumn}
              />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
