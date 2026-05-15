"use client";

import { GripVertical, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  progress: number;
  column_id: string;
  position: number;
}

export interface TaskCardProps {
  task: TaskItem;
  isDragging?: boolean;
  onToggleComplete?: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  vocabulary: "bg-[#d97757]/10 text-[#d97757] border-[#d97757]/20",
  flashcards: "bg-[#8a9a82]/10 text-[#54664c] border-[#8a9a82]/20",
  listening: "bg-[#b88c6e]/10 text-[#8f6346] border-[#b88c6e]/20",
  speaking: "bg-[#5a8694]/10 text-[#3f6571] border-[#5a8694]/20",
  grammar: "bg-[#9a7d97]/10 text-[#71546e] border-[#9a7d97]/20",
  general: "bg-[#1c1917]/5 text-[#1c1917] border-[#1c1917]/10",
};

export function TaskCard({ task, isDragging, onToggleComplete }: TaskCardProps) {
  const isDone = task.column_id.includes("done") || task.progress >= 100;
  const colorClasses = categoryColors[task.category] ?? categoryColors.general;

  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-[#1c1917]/5 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        isDragging && "shadow-lg opacity-90 ring-1 ring-[#1c1917]/10 -translate-y-1 scale-[1.02]",
        isDone && "opacity-50 hover:opacity-70 bg-white/50"
      )}
    >
      {/* Drag handle */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <GripVertical className="size-4 text-[#8d8175]/30 cursor-grab active:cursor-grabbing" strokeWidth={1.5} />
      </div>

      <div className="flex items-start gap-3.5 pl-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete?.(task.id)}
          className="mt-0.5 shrink-0 transition-all hover:scale-110"
        >
          {isDone ? (
            <CheckCircle2 className="size-5 text-[#4b6a53]" strokeWidth={1.5} />
          ) : (
            <Circle className="size-5 text-[#1c1917]/20 transition-colors group-hover:text-[#1c1917]/40" strokeWidth={1.5} />
          )}
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-[13px] font-semibold leading-relaxed text-[#1c1917]",
              isDone && "line-through text-[#8d8175] font-medium"
            )}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="mt-1 text-xs leading-relaxed text-[#8d8175] font-light line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Footer: category chip + optional progress */}
          <div className="mt-3.5 flex items-center gap-2.5">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                colorClasses
              )}
            >
              {task.category}
            </span>

            {/* Progress bar (for in-progress tasks) */}
            {task.progress > 0 && task.progress < 100 && (
              <div className="flex items-center gap-2">
                <div className="h-1 w-16 overflow-hidden rounded-full bg-[#1c1917]/10">
                  <div
                    className="h-full rounded-full bg-[#1c1917] transition-all duration-500 ease-out"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-[#1c1917]">
                  {task.progress}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
