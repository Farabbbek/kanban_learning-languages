"use client";

import { Clock, Sparkles } from "lucide-react";

export interface HeroSectionProps {
  displayName: string;
  streak: number;
  todayMinutes: number;
  dailyGoal: number;
}

export function HeroSection({
  displayName,
  streak,
  todayMinutes,
  dailyGoal,
}: HeroSectionProps) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
        ? "Good afternoon"
        : "Good evening";

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#faf7f2] via-[#f5eedf] to-[#f0e6d6] p-8 shadow-sm lg:p-10 border border-[#1c1917]/5">
      {/* Subtle background atmosphere - noise texture and soft gradients */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      <div className="pointer-events-none absolute -right-20 -top-20 size-96 rounded-full bg-[#d97757]/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-[#8d8175]/10 blur-[80px]" />

      <div className="relative flex items-center justify-between gap-10">
        {/* Left: Text content */}
        <div className="max-w-xl">
          <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight text-[#1c1917] sm:text-5xl">
            {greeting}, {displayName?.split(" ")[0] ?? "Learner"}.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#8d8175] font-light">
            {streak > 0
              ? `You're on a ${streak}-day streak. Keep your momentum going today.`
              : "Welcome to your focused learning environment. Let's begin."}
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="/dashboard/learn"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-[#1c1917] px-8 py-4 text-sm font-medium text-white shadow-[0_8px_16px_rgba(28,25,23,0.15)] transition-all hover:-translate-y-0.5 hover:bg-[#292524] hover:shadow-[0_12px_24px_rgba(28,25,23,0.25)] active:translate-y-0 active:scale-[0.98]"
            >
              <Sparkles className="size-4" strokeWidth={1.8} />
              Continue Learning
            </a>
            <a
              href="/dashboard/flashcards"
              className="inline-flex items-center gap-2.5 rounded-2xl border border-[#1c1917]/10 bg-white/70 px-8 py-4 text-sm font-medium text-[#1c1917] shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-md hover:border-[#1c1917]/20 active:translate-y-0 active:scale-[0.98]"
            >
              <Clock className="size-4" strokeWidth={1.8} />
              Quick Review
            </a>
          </div>

          {/* Today's progress mini */}
          <div className="mt-8 flex items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8d8175]">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#d97757] shadow-[0_0_8px_rgba(217,119,87,0.5)]" />
              {todayMinutes} min studied
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#1c1917]/20" />
              {dailyGoal} min target
            </span>
          </div>
        </div>

        {/* Right: Atmospheric illustration */}
        <div className="hidden lg:block pr-8">
          <div className="relative flex size-56 items-center justify-center">
            {/* Elegant minimal architectural/compass shapes */}
            <div className="absolute size-48 rounded-full border-[0.5px] border-[#1c1917]/10" />
            <div
              className="absolute size-40 rounded-full border-[0.5px] border-dashed border-[#1c1917]/20"
              style={{ transform: "rotate(15deg)" }}
            />
            <div
              className="absolute h-64 w-[0.5px] bg-gradient-to-b from-transparent via-[#1c1917]/10 to-transparent"
              style={{ transform: "rotate(45deg)" }}
            />
            <div
              className="absolute h-64 w-[0.5px] bg-gradient-to-b from-transparent via-[#1c1917]/10 to-transparent"
              style={{ transform: "rotate(-45deg)" }}
            />

            {/* Center subtle icon wrapper */}
            <div className="absolute flex size-24 items-center justify-center rounded-3xl bg-white/40 shadow-sm backdrop-blur-xl border border-white/60" style={{ transform: "rotate(10deg)" }}>
              <Sparkles className="size-10 text-[#1c1917]/70" strokeWidth={1} style={{ transform: "rotate(-10deg)" }} />
            </div>

            {/* Micro details */}
            <div className="absolute -top-4 right-10 size-1 rounded-full bg-[#1c1917]/30" />
            <div className="absolute bottom-4 left-10 size-1.5 rounded-full bg-[#d97757]/40" />
          </div>
        </div>
      </div>
    </section>
  );
}

function BookOpen(props: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      className={props.className}
      width="40"
      height="40"
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
