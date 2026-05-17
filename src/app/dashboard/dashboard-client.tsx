"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { HeroSection } from "@/components/dashboard/hero-section";
import { KanbanBoard, Column } from "@/components/dashboard/kanban-board";
import { AddTaskModal } from "@/components/dashboard/add-task-modal";
import { DeleteConfirmModal } from "@/components/dashboard/delete-confirm-modal";

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
}: DashboardClientProps) {
  const freshColumns = useMemo(() => flattenColumns(boards), [boards]);
  const [columns, setColumns] = useState<Column[]>(freshColumns);
  const columnsRef = useRef(columns);

  useEffect(() => {
    columnsRef.current = columns;
  });

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

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
    </>
  );
}
