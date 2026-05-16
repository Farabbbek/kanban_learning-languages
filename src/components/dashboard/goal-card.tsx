"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Trash2,
  RotateCcw,
  Calendar,
  Flag,
  Target,
  Sparkles,
  BookOpen,
  Layers,
  Brain,
  Mic,
  BookMarked,
  PenTool,
  Clock,
  Zap,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: "active" | "completed" | "archived";
  progress: number;
  target: number | null;
  deadline: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  vocabulary: { icon: BookMarked, label: "Vocabulary", color: "#D88A5B" },
  flashcards: { icon: Layers, label: "Flashcards", color: "#C9A96E" },
  grammar: { icon: PenTool, label: "Grammar", color: "#8B9D83" },
  speaking: { icon: Mic, label: "Speaking", color: "#D4A574" },
  reading: { icon: BookOpen, label: "Reading", color: "#B8A28E" },
  listening: { icon: Brain, label: "Listening", color: "#A3B5A0" },
  "study habit": { icon: Clock, label: "Study Habit", color: "#C9A96E" },
  productivity: { icon: Zap, label: "Productivity", color: "#D88A5B" },
  personal: { icon: User, label: "Personal", color: "#8B9D83" },
  custom: { icon: Target, label: "Custom", color: "#C9A96E" },
};

const PRIORITY_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  low: { bg: "bg-[#8B9D83]/8", text: "text-[#8B9D83]", border: "border-[#8B9D83]/18", dot: "bg-[#8B9D83]" },
  medium: { bg: "bg-[#C9A96E]/8", text: "text-[#C9A96E]", border: "border-[#C9A96E]/18", dot: "bg-[#C9A96E]" },
  high: { bg: "bg-[#D88A5B]/8", text: "text-[#D88A5B]", border: "border-[#D88A5B]/18", dot: "bg-[#D88A5B]" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

interface GoalCardProps {
  goal: Goal;
  onToggleComplete: (id: string, currentStatus: string) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  isCompleted?: boolean;
}

export function GoalCard({
  goal,
  onToggleComplete,
  onDelete,
  onRestore,
  isCompleted = false,
}: GoalCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const handleToggle = useCallback(() => {
    setIsChecked(true);
    setTimeout(() => {
      onToggleComplete(goal.id, goal.status);
      setIsChecked(false);
    }, 400);
  }, [goal.id, goal.status, onToggleComplete]);

  const daysLeft = daysUntil(goal.deadline);
  const catConfig = CATEGORY_CONFIG[goal.category?.toLowerCase()] || CATEGORY_CONFIG.custom;
  const Icon = catConfig.icon;
  const priorityStyle = PRIORITY_STYLES[goal.priority] || PRIORITY_STYLES.medium;
  const progressPercent = goal.target && goal.target > 0 ? Math.min((goal.progress / goal.target) * 100, 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isChecked ? 0.97 : 1,
      }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "group relative overflow-hidden rounded-[20px] border transition-all duration-300",
        isCompleted
          ? "border-[#8B9D83]/12 bg-white/35 opacity-65"
          : "border-[rgba(210,190,170,0.16)] bg-white/55 hover:border-[#D88A5B]/14 hover:shadow-[0_12px_40px_rgba(42,33,28,0.07)] hover:-translate-y-[2px]"
      )}
      style={!isCompleted ? { boxShadow: "0 4px 16px rgba(42,33,28,0.03)" } : {}}
    >
      {/* Hover glow */}
      <AnimatePresence>
        {isHovered && !isCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute -right-20 -top-20 size-40 rounded-full bg-[#D88A5B]/4 blur-3xl"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex items-start gap-4 p-5">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          disabled={isCompleted}
          className={cn(
            "relative mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-[8px] border-2 transition-all duration-200",
            isCompleted
              ? "border-[#8B9D83]/35 bg-[#8B9D83]/12"
              : "border-[rgba(210,190,170,0.28)] bg-white/75 hover:border-[#D88A5B]/35 hover:bg-[#D88A5B]/5 hover:shadow-[0_0_20px_rgba(216,138,91,0.08)]"
          )}
        >
          <AnimatePresence>
            {(isCompleted || isChecked) && (
              <motion.span
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Check className="size-3.5 text-[#8B9D83]" strokeWidth={3} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                {/* Category icon */}
                <div
                  className="flex size-8 items-center justify-center rounded-[10px]"
                  style={{ background: `${catConfig.color}12` }}
                >
                  <Icon className="size-4" style={{ color: catConfig.color }} strokeWidth={1.5} />
                </div>
                <h3
                  className={cn(
                    "text-[15px] font-semibold leading-snug transition-all duration-200",
                    isCompleted ? "text-[#8d8175]/45 line-through" : "text-[#2B1B12]"
                  )}
                >
                  {goal.title}
                </h3>
              </div>
              {goal.description && (
                <p
                  className={cn(
                    "mt-1.5 ml-10 text-[13px] leading-relaxed transition-all duration-200",
                    isCompleted ? "text-[#8d8175]/25" : "text-[#8d8175]/65"
                  )}
                >
                  {goal.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1">
              {isCompleted && onRestore && (
                <button
                  onClick={() => onRestore(goal.id)}
                  className="flex size-8 items-center justify-center rounded-[10px] text-[#8d8175]/25 transition-all duration-200 hover:bg-[rgba(210,190,170,0.12)] hover:text-[#8B9D83]"
                  title="Restore goal"
                >
                  <RotateCcw className="size-3.5" strokeWidth={1.5} />
                </button>
              )}
              <button
                onClick={() => onDelete(goal.id)}
                className="flex size-8 items-center justify-center rounded-[10px] text-[#8d8175]/15 opacity-0 transition-all duration-200 hover:bg-[#D88A5B]/8 hover:text-[#D88A5B] group-hover:opacity-100"
                title="Delete goal"
              >
                <Trash2 className="size-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* Priority badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em]",
                priorityStyle.bg, priorityStyle.text, priorityStyle.border
              )}
            >
              <span className={cn("size-1.5 rounded-full", priorityStyle.dot)} />
              {goal.priority}
            </span>

            {/* Category badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(210,190,170,0.12)] bg-[rgba(255,255,255,0.4)] px-2.5 py-0.5 text-[10px] font-semibold text-[#8d8175]/55">
              <Icon className="size-2.5" strokeWidth={2} style={{ color: catConfig.color }} />
              {catConfig.label}
            </span>

            {/* Deadline */}
            {goal.deadline && !isCompleted && (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
                  daysLeft !== null && daysLeft <= 3
                    ? "border-[#D88A5B]/18 bg-[#D88A5B]/6 text-[#D88A5B]"
                    : "border-[rgba(210,190,170,0.12)] bg-[rgba(255,255,255,0.4)] text-[#8d8175]/55"
                )}
              >
                <Calendar className="size-2.5" strokeWidth={2} />
                {formatDate(goal.deadline)}
                {daysLeft !== null && daysLeft > 0 && (
                  <span className="ml-0.5 opacity-60">({daysLeft}d)</span>
                )}
              </span>
            )}

            {/* Completed date */}
            {isCompleted && goal.completed_at && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8B9D83]/12 bg-[#8B9D83]/6 px-2.5 py-0.5 text-[10px] font-semibold text-[#8B9D83]/55">
                <Sparkles className="size-2.5" strokeWidth={2} />
                {formatDate(goal.completed_at)}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {goal.target && goal.target > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] text-[#8d8175]/45">
                <span>Progress</span>
                <span>{goal.progress}/{goal.target}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[rgba(210,190,170,0.12)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    isCompleted ? "bg-[#8B9D83]/35" : "bg-gradient-to-r from-[#D88A5B] to-[#C9A96E]"
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
