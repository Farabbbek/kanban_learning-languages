"use client";

import { useState, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Plus, SlidersHorizontal } from "lucide-react";
import { TaskCard, TaskItem } from "./task-card";

export interface Column {
  id: string;
  title: string;
  tasks: TaskItem[];
}

export interface KanbanBoardProps {
  columns: Column[];
  onMoveTask: (taskId: string, targetColumnId: string, position: number) => void;
  onToggleComplete?: (taskId: string) => void;
  onAddTask?: (columnId: string) => void;
}

export function KanbanBoard({
  columns,
  onMoveTask,
  onToggleComplete,
  onAddTask,
}: KanbanBoardProps) {
  const [localColumns, setLocalColumns] = useState(columns);

  // Sync when props change
  if (JSON.stringify(columns) !== JSON.stringify(localColumns)) {
    setLocalColumns(columns);
  }

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      if (!result.destination) return;

      const { source, destination, draggableId } = result;

      // Same position — no change
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      // Optimistic update
      const newColumns = localColumns.map((col) => ({
        ...col,
        tasks: [...col.tasks],
      }));

      const sourceCol = newColumns.find(
        (col) => col.id === source.droppableId
      );
      const destCol = newColumns.find(
        (col) => col.id === destination.droppableId
      );

      if (!sourceCol || !destCol) return;

      const [movedTask] = sourceCol.tasks.splice(source.index, 1);

      // Update progress if moving to Done
      if (destCol.id.toLowerCase().includes("done")) {
        movedTask.progress = 100;
      } else if (sourceCol.id.toLowerCase().includes("done")) {
        movedTask.progress = 0;
      } else if (destCol.id.toLowerCase().includes("progress")) {
        movedTask.progress = Math.max(movedTask.progress, 30);
      }

      destCol.tasks.splice(destination.index, 0, movedTask);

      setLocalColumns(newColumns);

      // API call
      try {
        await onMoveTask(draggableId, destination.droppableId, destination.index);
      } catch (err) {
        // Revert on error
        setLocalColumns(columns);
      }
    },
    [localColumns, onMoveTask, columns]
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-medium text-[#1c1917]">
            Today&#39;s Tasks
          </h2>
          <p className="mt-1 text-sm font-light text-[#8d8175]">
            Organize your learning focus for today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-full border border-[#1c1917]/10 bg-white/60 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1c1917] shadow-sm backdrop-blur-md transition-all hover:border-[#1c1917]/20 hover:bg-white/90">
            <SlidersHorizontal className="size-3.5" strokeWidth={1.8} />
            Filter
          </button>
          <button
            onClick={() => onAddTask?.(localColumns[0]?.id ?? "")}
            className="inline-flex items-center gap-2 rounded-full bg-[#1c1917] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_4px_12px_rgba(28,25,23,0.15)] transition-all hover:-translate-y-0.5 hover:bg-[#292524] hover:shadow-[0_6px_16px_rgba(28,25,23,0.2)] active:translate-y-0"
          >
            <Plus className="size-4" strokeWidth={2} />
            Add Task
          </button>
        </div>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-6">
          {localColumns.map((column) => (
            <div
              key={column.id}
              className="flex flex-col rounded-3xl bg-[#1c1917]/[0.02] p-2 border border-[#1c1917]/5"
            >
              {/* Column header */}
              <div className="mb-4 mt-2 px-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="size-2 rounded-full bg-[#1c1917]/20" />
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-[#1c1917]">
                    {column.title}
                  </h3>
                  <span className="ml-1 text-xs font-medium text-[#8d8175]">
                    {column.tasks.length}
                  </span>
                </div>
              </div>

              {/* Droppable area */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 flex-1 min-h-[300px] transition-colors rounded-2xl p-2 ${
                      snapshot.isDraggingOver
                        ? "bg-[#1c1917]/5"
                        : ""
                    }`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TaskCard
                              task={task}
                              isDragging={snapshot.isDragging}
                              onToggleComplete={onToggleComplete}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
