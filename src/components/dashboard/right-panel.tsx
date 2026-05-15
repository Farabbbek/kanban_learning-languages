"use client";

import { Brain, Target } from "lucide-react";

export interface RightPanelProps {
  dailyGoal: number;
  todayMinutes: number;
  quizzesCompleted: number;
  dueReviews: number;
}

export function RightPanel({
  dailyGoal,
  todayMinutes,
  quizzesCompleted,
  dueReviews,
}: RightPanelProps) {
  const progressPercent = Math.min(
    Math.round((todayMinutes / dailyGoal) * 100),
    100
  );

  return (
    <div className="space-y-4 pt-1 lg:pt-0">
      <div className="mb-2">
        <h3 className="font-serif text-lg font-medium text-[#1c1917]">Overview</h3>
        <p className="text-xs text-[#8d8175]">Your daily learning statistics</p>
      </div>

      {/* Daily Goal */}
      <div className="group rounded-3xl border border-[#1c1917]/5 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8d8175]">
          <Target className="size-3.5 text-[#1c1917]" strokeWidth={1.5} />
          Daily Goal
        </div>
        <div className="mt-4">
          <div className="flex items-end justify-between">
            <p className="font-serif text-3xl font-medium text-[#1c1917] tracking-tight">
              {todayMinutes}
              <span className="text-sm font-normal text-[#8d8175] ml-1">/ {dailyGoal}m</span>
            </p>
            <span className="text-[11px] font-semibold text-[#1c1917] bg-[#1c1917]/5 px-2 py-1 rounded-full">
              {progressPercent}%
            </span>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#1c1917]/5">
            <div
              className="h-full rounded-full bg-[#1c1917] transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Due Reviews */}
        <div className="rounded-3xl border border-[#1c1917]/5 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex justify-between items-start">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#b88c6e]/10">
              <BookOpen className="size-4 text-[#8f6346]" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-4">
            <p className="font-serif text-2xl font-medium tracking-tight text-[#1c1917]">
              {dueReviews}
            </p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.1em] text-[#8d8175]">Reviews Due</p>
          </div>
        </div>

        {/* Quizzes */}
        <div className="rounded-3xl border border-[#1c1917]/5 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex justify-between items-start">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#d97757]/10">
              <Brain className="size-4 text-[#d97757]" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-4">
            <p className="font-serif text-2xl font-medium tracking-tight text-[#1c1917]">
              {quizzesCompleted}
            </p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.1em] text-[#8d8175]">Quizzes done</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 rounded-3xl border border-[#1c1917]/5 bg-white p-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8d8175] mb-4">
          Quick Access
        </p>
        <div className="space-y-1">
          {[
            { href: "/dashboard/vocabulary", label: "Vocabulary", icon: "📖" },
            { href: "/dashboard/flashcards", label: "Flashcards", icon: "🃏" },
            { href: "/dashboard/quizzes", label: "Take a Quiz", icon: "🧠" },
            { href: "/dashboard/ai-tutor", label: "AI Tutor", icon: "🤖" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-medium text-[#1c1917] transition-all hover:bg-[#1c1917]/[0.02]"
            >
              <span className="opacity-70">{link.icon}</span>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookOpen(props: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      className={props.className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={props.strokeWidth ?? 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
