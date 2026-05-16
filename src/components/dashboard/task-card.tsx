"use client";

import { useState, useRef, useEffect } from "react";
import { GripVertical, CheckCircle2, Circle, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  priority: number;
  estimated_minutes?: number;
  column_id: string;
  position: number;
}

export interface TaskCardProps {
  task: TaskItem;
  isDragging?: boolean;
  onToggleComplete?: (id: string) => void;
  onDeleteTask?: (id: string) => void;
  isDone?: boolean;
}

const tagColors: Record<string, string> = {
  vocabulary: "bg-[#D88A5B]/8 text-[#B56A3C] border-[#D88A5B]/15",
  flashcards: "bg-[#8a9a82]/10 text-[#54664c] border-[#8a9a82]/15",
  listening: "bg-[#b88c6e]/10 text-[#8f6346] border-[#b88c6e]/15",
  speaking: "bg-[#5a8694]/10 text-[#3f6571] border-[#5a8694]/15",
  grammar: "bg-[#9a7d97]/10 text-[#71546e] border-[#9a7d97]/15",
  reading: "bg-[#7d8f74]/10 text-[#54664c] border-[#7d8f74]/15",
  writing: "bg-[#c56b47]/10 text-[#8f4a2e] border-[#c56b47]/15",
};

const difficultyColors: Record<number, string> = {
  1: "bg-[#8a9a82]",
  2: "bg-[#D88A5B]",
  3: "bg-[#C56B47]",
};

const difficultyLabels: Record<number, string> = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
};

const timeLabels: Record<number, string> = {
  5: "5m",
  10: "10m",
  15: "15m",
  30: "30m",
  60: "1h",
};

export function TaskCard({ task, isDragging, onToggleComplete, onDeleteTask, isDone }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const primaryTag = task.tags?.[0]?.toLowerCase() ?? "general";
  const colorClasses = tagColors[primaryTag] ?? "bg-[#D88A5B]/8 text-[#8d8175] border-[#D88A5B]/10";
  const priority = task.priority ?? 2;
  const dotColor = difficultyColors[priority] ?? difficultyColors[2];
  const timeLabel = task.estimated_minutes
    ? timeLabels[task.estimated_minutes] ?? `${task.estimated_minutes}m`
    : null;

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-[#D88A5B]/6 bg-white/90 p-3 transition-all duration-200",
        "shadow-[0_1px_4px_rgba(42,33,28,0.03),0_0_0_1px_rgba(42,33,28,0.01)]",
        "hover:shadow-[0_6px_16px_rgba(42,33,28,0.06),0_0_0_1px_rgba(42,33,28,0.02)] hover:-translate-y-[1px] hover:border-[#D88A5B]/10",
        isDragging && "shadow-[0_8px_20px_rgba(42,33,28,0.1)] opacity-90 ring-1 ring-[#D88A5B]/15 -translate-y-1 scale-[1.01]"
      )}
    >
      {/* Drag handle */}
      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <GripVertical className="size-3.5 text-[#8d8175]/20 cursor-grab active:cursor-grabbing" strokeWidth={1.5} />
      </div>

      {/* Three-dot menu */}
      <div ref={menuRef} className="absolute right-2 top-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          className={cn(
            "flex size-6 items-center justify-center rounded-lg opacity-0 transition-all duration-200",
            "hover:bg-[#D88A5B]/8 group-hover:opacity-100",
            menuOpen && "opacity-100 bg-[#D88A5B]/8"
          )}
        >
          <MoreHorizontal className="size-3.5 text-[#8d8175]" strokeWidth={1.5} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-8 w-32 rounded-xl border border-[#D88A5B]/10 bg-[#F7F3EE] py-1 shadow-[0_8px_24px_rgba(42,33,28,0.1)] animate-in fade-in zoom-in-95 duration-150 origin-top-right">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onDeleteTask?.(task.id);
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-[#C56B47] transition-colors hover:bg-red-50/80"
            >
              <Trash2 className="size-3" strokeWidth={1.5} />
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2.5 pl-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete?.(task.id)}
          className="mt-0.5 shrink-0 transition-all hover:scale-110"
        >
          {isDone ? (
            <CheckCircle2 className="size-4 text-[#7D8F74]" strokeWidth={2} />
          ) : (
            <Circle className="size-4 text-[#D88A5B]/20 transition-colors group-hover:text-[#D88A5B]/40" strokeWidth={1.5} />
          )}
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1 relative z-[1]">
          <p className={cn(
            "text-[12px] font-semibold leading-snug pr-5 tracking-tight",
            isDone ? "text-[#8d8175] line-through" : "text-[#1F1610]"
          )}>
            {task.title}
          </p>

          {task.description && (
            <p className={cn(
              "mt-1 text-[10px] leading-relaxed font-light line-clamp-2",
              isDone ? "text-[#b0a49a] line-through" : "text-[#8d8175]/70"
            )}>
              {task.description}
            </p>
          )}

          {!isDone && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <span className={cn("size-1 rounded-full", dotColor)} />
                <span className="text-[8px] font-semibold uppercase tracking-wider text-[#8d8175]/60">
                  {difficultyLabels[priority] ?? "Medium"}
                </span>
              </span>

              {primaryTag && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0 text-[8px] font-semibold uppercase tracking-wider",
                    colorClasses
                  )}
                >
                  {primaryTag}
                </span>
              )}

              {timeLabel && (
                <span className="text-[9px] font-medium text-[#8d8175]/50">
                  {timeLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
