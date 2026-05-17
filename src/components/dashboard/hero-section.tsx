"use client";

import { Sparkles, Clock, ArrowRight } from "lucide-react";

export interface HeroSectionProps {
  displayName: string;
  todayMinutes: number;
  dailyGoal: number;
}

export function HeroSection({
  displayName,
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

  const progressPercent = Math.min(Math.round((todayMinutes / dailyGoal) * 100), 100);

  return (
    <section
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(135deg, #f8f2eb 0%, #f5efe8 45%, #f2ece5 100%)",
        boxShadow: "0 20px 60px rgba(120,90,60,0.08), 0 6px 20px rgba(120,90,60,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
        border: "1px solid rgba(216,138,91,0.08)",
      }}
    >
      {/* Subtle parchment texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Soft warm light beam from right */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,245,225,0.08) 40%, rgba(255,235,205,0.20) 70%, transparent 100%)",
        }}
      />

      {/* Atmospheric glow behind compass */}
      <div
        className="pointer-events-none absolute"
        style={{
          right: "20px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "380px",
          height: "380px",
          background: "radial-gradient(circle, rgba(255,225,185,0.25) 0%, rgba(255,225,185,0.12) 35%, rgba(255,225,185,0.04) 60%, transparent 80%)",
          filter: "blur(30px)",
        }}
      />

      {/* REAL compass PNG — clearly visible, not CSS-generated */}
      <img
        src="/compas.png"
        alt=""
        className="pointer-events-none absolute hidden select-none sm:block"
        style={{
          right: "36px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "280px",
          height: "280px",
          objectFit: "contain",
          opacity: 0.24,
          filter: "drop-shadow(0 0 30px rgba(220,190,150,0.18))",
          animation: "hero-compass-spin 120s linear infinite",
        }}
        draggable={false}
      />

      {/* Content */}
      <div className="relative px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          {/* Left: Greeting */}
          <div className="min-w-0">
            <h1 className="font-serif text-[24px] font-medium leading-[1.1] tracking-tight text-[#1F1610] sm:text-[28px]">
              {greeting}, {displayName?.split(" ")[0] ?? "Learner"}.
            </h1>
            <p className="mt-1.5 text-sm font-medium leading-relaxed" style={{ color: "rgba(100,80,65,0.65)" }}>
              What are you learning today?
            </p>

            {/* Action buttons */}
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
              <a
                href="/dashboard/learn"
                className="tactile-button inline-flex items-center justify-center gap-2 rounded-xl bg-[#2A211C] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(42,33,28,0.2)] hover:bg-[#3D322B] hover:shadow-[0_6px_16px_rgba(42,33,28,0.25)] sm:py-2"
              >
                <Sparkles className="size-3.5" strokeWidth={1.8} />
                Continue Learning
                <ArrowRight className="size-3" strokeWidth={2} />
              </a>
              <a
                href="/dashboard/flashcards"
                className="tactile-button inline-flex items-center justify-center gap-2 rounded-xl border border-[#D88A5B]/15 bg-white/70 px-4 py-2.5 text-xs font-semibold text-[#2A211C] shadow-sm backdrop-blur-md hover:bg-white/90 hover:shadow-md sm:py-2"
              >
                <Clock className="size-3.5" strokeWidth={1.8} />
                Quick Review
              </a>
            </div>
          </div>

          {/* Right: Daily goal — frosted glass container */}
          <div
            className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 md:w-auto md:justify-start md:py-2.5"
            style={{
              background: "rgba(255,255,255,0.35)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.45)",
            }}
          >
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8d8175]">
              <span className="size-2 rounded-full bg-[#D88A5B]" />
              {todayMinutes}m / {dailyGoal}m
            </span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#2A211C]/8 md:w-20">
              <div
                className="h-full rounded-full bg-[#2A211C] transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Keyframes for compass rotation */}
      <style>{`
        @keyframes hero-compass-spin {
          from { transform: translateY(-50%) rotate(0deg); }
          to { transform: translateY(-50%) rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
