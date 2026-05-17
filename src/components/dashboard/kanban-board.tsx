"use client";

import { useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
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
  onDeleteTask?: (taskId: string) => void;
  onAddTask?: (columnId: string) => void;
}

const columnConfig: Record<string, {
  bg: string;
  gradient: string;
  dot: string;
  label: string;
  icon: string;
  emptyTitle: string;
  emptySub: string;
}> = {
  "to do": {
    bg: "rgba(255,248,242,0.72)",
    gradient: "linear-gradient(180deg, rgba(255,248,242,0.72) 0%, rgba(255,245,235,0.65) 100%)",
    dot: "bg-[#8d8175]",
    label: "text-[#8d8175]",
    icon: "/todo.png",
    emptyTitle: "Ready to begin?",
    emptySub: "Create your first learning task.",
  },
  "in progress": {
    bg: "rgba(255,244,230,0.72)",
    gradient: "linear-gradient(180deg, rgba(255,244,230,0.72) 0%, rgba(255,238,220,0.65) 100%)",
    dot: "bg-[#D88A5B]",
    label: "text-[#D88A5B]",
    icon: "/inprogress.png",
    emptyTitle: "Keep moving forward.",
    emptySub: "Your active learning sessions appear here.",
  },
  "done": {
    bg: "rgba(247,245,239,0.72)",
    gradient: "linear-gradient(180deg, rgba(247,245,239,0.72) 0%, rgba(243,242,235,0.65) 100%)",
    dot: "bg-[#7D8F74]",
    label: "text-[#7D8F74]",
    icon: "/done.png",
    emptyTitle: "Nothing completed yet.",
    emptySub: "Finish a task and it will appear here.",
  },
};

export function KanbanBoard({
  columns,
  onMoveTask,
  onToggleComplete,
  onDeleteTask,
  onAddTask,
}: KanbanBoardProps) {
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const { source, destination, draggableId } = result;

      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      onMoveTask(draggableId, destination.droppableId, destination.index);
    },
    [onMoveTask]
  );

  const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0);

  return (
    <div>
      {/* Header — editorial, dominant */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-serif text-[26px] font-semibold tracking-tight text-[#1F1610]">
            Task Board
          </h2>
          <p className="mt-0.5 text-[13px] font-medium text-[#8d8175]/80 tracking-wide">
            {totalTasks} task{totalTasks !== 1 ? "s" : ""} · {columns.length} stages
          </p>
        </div>
        <button
          onClick={() => onAddTask?.(columns[0]?.id ?? "")}
          className="tactile-button inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#2A211C] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white shadow-[0_2px_8px_rgba(42,33,28,0.12)] hover:bg-[#3D322B] hover:shadow-[0_4px_12px_rgba(42,33,28,0.18)] sm:w-auto sm:py-2"
        >
          <Plus className="size-3.5" strokeWidth={2} />
          Add Task
        </button>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {columns.map((column) => {
            const config = columnConfig[column.title.toLowerCase()] ?? columnConfig["to do"];

            return (
              <div
                key={column.id}
                className="flex min-h-[360px] flex-col rounded-2xl border p-4"
                style={{
                  background: config.gradient,
                  borderColor: "rgba(216,138,91,0.06)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 3px rgba(42,33,28,0.02), 0 10px 30px rgba(90,60,30,0.04)",
                }}
              >
                {/* Column header — larger */}
                <div className="mb-3 px-0.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`size-2 rounded-full ${config.dot} shadow-[0_0_4px_rgba(0,0,0,0.04)]`} />
                    <h3 className={`text-[12px] font-bold uppercase tracking-[0.16em] ${config.label}`}>
                      {column.title}
                    </h3>
                    <span className={`flex items-center justify-center size-[20px] rounded-full ${column.tasks.length > 0 ? 'bg-white/85 ' + config.label : 'bg-white/50 text-[#8d8175]/50'} text-[10px] font-semibold border border-[#D88A5B]/6`}>
                      {column.tasks.length}
                    </span>
                  </div>
                </div>

                {/* Subtle divider */}
                <div className="mb-3 mx-0.5 h-px rounded-full bg-[#D88A5B]/6" />

                {/* Droppable area — taller */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2.5 flex-1 min-h-[220px] max-h-[420px] overflow-y-auto rounded-xl p-1.5 transition-all lg:max-h-[560px] ${
                        snapshot.isDraggingOver
                          ? "bg-white/50 ring-1 ring-[#D88A5B]/12"
                          : ""
                      } ${
                        column.tasks.length === 0 && !snapshot.isDraggingOver
                          ? "flex flex-col items-center justify-center"
                          : ""
                      }`}
                    >
                      {column.tasks.length === 0 && !snapshot.isDraggingOver ? (
                        <div className="flex flex-col items-center gap-5 py-8 text-center lg:gap-7 lg:pb-6 lg:pt-[80px]">
                          {/* Icon with atmospheric warm glow — primary visual anchor */}
                          <div className="relative flex items-center justify-center group">
                            <div
                              className="absolute inset-0 size-[200px] rounded-full transition-all duration-500"
                              style={{
                                background: "radial-gradient(circle, rgba(255,245,225,1) 0%, rgba(255,240,210,0.55) 38%, rgba(255,240,210,0.12) 65%, transparent 80%)",
                                filter: "blur(40px)",
                                opacity: 0.9,
                              }}
                            />
                            <img
                              src={config.icon}
                              alt=""
                              className="size-28 object-contain drop-shadow-[0_12px_32px_rgba(42,33,28,0.12)] transition-all duration-[0.35s] ease-out group-hover:-translate-y-1 sm:size-[132px] lg:size-[152px]"
                              draggable={false}
                              style={{
                                animation: "column-icon-fade-in 0.6s ease-out",
                              }}
                            />
                          </div>
                          <div>
                            <p className="text-[20px] font-semibold text-[#3A2A20]">
                              {config.emptyTitle}
                            </p>
                            <p className="mt-1.5 text-[15px] font-normal leading-relaxed max-w-[200px]" style={{ color: "rgba(141,129,117,0.68)" }}>
                              {config.emptySub}
                            </p>
                          </div>
                          <button
                            onClick={() => onAddTask?.(column.id)}
                            className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-dashed border-[rgba(180,140,100,0.25)] bg-white/60 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8d8175]/70 transition-all hover:border-[rgba(180,140,100,0.4)] hover:text-[#2A211C] hover:bg-white/80 hover:shadow-[0_4px_12px_rgba(216,138,91,0.08)]"
                          >
                            <Plus className="size-3" strokeWidth={2} />
                            Add one
                          </button>
                        </div>
                      ) : (
                        column.tasks.map((task, index) => (
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
                                onDeleteTask={onDeleteTask}
                                isDone={column.title.toLowerCase() === "done"}
                              />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Keyframes for icon fade-in */}
      <style>{`
        @keyframes column-icon-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
