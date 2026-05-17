"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  BarChart3,
  Activity,
  Calendar,
  Target,
  Sparkles,
  Brain,
  BookOpen,
  Volume2,
  Star,
  Clock,
  Flame,
  BookMarked,
  Layers,
} from "lucide-react";

import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────
   CONSTANTS
   ────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Vocabulary Growth",
    desc: "Track how your personal lexicon expands over time with beautiful sigmoid growth curves.",
  },
  {
    icon: Brain,
    title: "Retention Rate",
    desc: "SM-2 spaced repetition analytics — see which words stick and which need more practice.",
  },
  {
    icon: Volume2,
    title: "Speaking Consistency",
    desc: "Pronunciation practice frequency and improvement trends across all languages.",
  },
  {
    icon: Calendar,
    title: "Daily Focus Tracking",
    desc: "Heatmaps, streaks, and daily goals — understand your learning habits at a glance.",
  },
  {
    icon: TrendingUp,
    title: "Fluency Estimation",
    desc: "AI-powered fluency score based on vocabulary size, accuracy, and review consistency.",
  },
  {
    icon: Activity,
    title: "Study Distribution",
    desc: "See how your time splits across flashcards, quizzes, vocabulary, and AI tutor sessions.",
  },
];

const METRICS = [
  { label: "Words Learned", value: "0", icon: BookOpen, color: "#D88A5B" },
  { label: "Day Streak", value: "0", icon: Flame, color: "#D88A5B" },
  { label: "Study Hours", value: "0", icon: Clock, color: "#C9A96E" },
  { label: "Mastery Score", value: "—", icon: Star, color: "#8B9D83" },
];

const TIMELINE_ITEMS = [
  { action: "Practiced vocabulary", detail: "12 new words reviewed", time: "2h ago", icon: BookMarked },
  { action: "Completed flashcard session", detail: "85% accuracy rate", time: "5h ago", icon: Layers },
  { action: "Reached 7-day streak", detail: "Personal best!", time: "1d ago", icon: Flame },
];

/* ──────────────────────────────────────────────
   RETENTION CIRCLE
   ────────────────────────────────────────────── */

function RetentionCircle() {
  const [hovered, setHovered] = useState(false);
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const progress = 72; // 72%

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg width="130" height="130" className="-rotate-90">
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke="rgba(210,190,170,0.12)"
          strokeWidth="6"
        />
        <motion.circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke="url(#retentionGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="retentionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D88A5B" />
            <stop offset="100%" stopColor="#C9A96E" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="text-[24px] font-bold text-[#1F1610]"
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {progress}%
        </motion.span>
        <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#6f6257]/45">
          Retention
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   CHART BARS (realistic)
   ────────────────────────────────────────────── */

function ChartBars() {
  const bars = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      height: 20 + Math.sin(i * 0.4) * 28 + Math.cos(i * 0.15) * 12 + ((i * 13 + 7) % 15),
      delay: i * 0.035,
    })),
  []);

  return (
    <div className="flex items-end gap-[3px] h-36">
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: bar.height, opacity: 1 }}
          transition={{ duration: 0.6, delay: bar.delay, ease: "easeOut" }}
          className="flex-1 rounded-t-[4px] relative group cursor-default"
          style={{
            background:
              i > 17
                ? "linear-gradient(180deg, #D88A5B, #C9A96E)"
                : i > 11
                ? "linear-gradient(180deg, rgba(216,138,91,0.4), rgba(201,169,110,0.20))"
                : "linear-gradient(180deg, rgba(216,138,91,0.20), rgba(201,169,110,0.08))",
          }}
        >
          {/* Hover tooltip */}
          <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-[6px] bg-[#2A211C] px-2 py-1 text-[9px] font-medium text-white whitespace-nowrap">
            {Math.round(bar.height)} words
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   METRIC CARD
   ────────────────────────────────────────────── */

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
  index,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "rounded-[20px] border p-5 transition-all duration-300 cursor-default",
        "hover:-translate-y-[2px]",
        hovered
          ? "border-[#D88A5B]/30 bg-white/85 shadow-[0_16px_48px_rgba(42,33,28,0.08)]"
          : "border-[rgba(210,190,170,0.18)] bg-white/60"
      )}
      style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
    >
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-[14px] border transition-all duration-300",
          hovered
            ? "bg-[#D88A5B]/12 border-[#D88A5B]/25 shadow-[0_0_20px_rgba(216,138,91,0.12)]"
            : "bg-[rgba(216,138,91,0.06)] border-[rgba(216,138,91,0.12)]"
        )}
      >
        <Icon className="size-5" style={{ color }} strokeWidth={1.5} />
      </div>
      <p className="mt-3 text-[30px] font-bold tracking-tight text-[#1F1610]">{value}</p>
      <p className="mt-1 text-[11px] font-medium text-[#6f6257]/55">{label}</p>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   FEATURE CARD
   ────────────────────────────────────────────── */

function FeatureCard({
  icon: Icon,
  title,
  desc,
  index,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 + index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group relative overflow-hidden rounded-[22px] border p-5 transition-all duration-400 cursor-default",
        "hover:-translate-y-[2px]",
        hovered
          ? "border-[#D88A5B]/28 bg-white/85 shadow-[0_16px_48px_rgba(42,33,28,0.08)]"
          : "border-[rgba(210,190,170,0.18)] bg-white/60"
      )}
      style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-[#D88A5B]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex items-start gap-4">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-[14px] border transition-all duration-300",
            hovered
              ? "bg-[#D88A5B]/12 border-[#D88A5B]/25 shadow-[0_0_20px_rgba(216,138,91,0.12)]"
              : "bg-[rgba(216,138,91,0.06)] border-[rgba(216,138,91,0.12)]"
          )}
        >
          <Icon
            className={cn("size-5 transition-all duration-300", hovered ? "text-[#D88A5B]" : "text-[#6f6257]/70")}
            strokeWidth={1.5}
          />
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-[15px] font-semibold text-[#1F1610]">{title}</h3>
          <p className="mt-1.5 text-[12px] leading-relaxed text-[#6f6257]/65">{desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   HEATMAP
   ────────────────────────────────────────────── */

function HeatmapPlaceholder() {
  const weeks = useMemo(() =>
    Array.from({ length: 12 }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const seed = (w * 31 + d * 17) % 100;
        return {
          active: seed > 40,
          intensity: (seed % 100) / 100,
          delay: (w * 7 + d) * 0.012,
        };
      })
    ),
  []);

  return (
    <div className="flex gap-[3px]">
      {weeks.map((week, w) => (
        <div key={w} className="flex flex-col gap-[3px]">
          {week.map((day, d) => (
            <motion.div
              key={d}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: day.delay }}
              className="size-[11px] rounded-[3px] cursor-default"
              style={{
                background: day.active
                  ? day.intensity > 0.7
                    ? "#D88A5B"
                    : day.intensity > 0.4
                    ? "#D88A5B/60"
                    : "#C9A96E/40"
                  : "rgba(210,190,170,0.12)",
                opacity: day.active ? 0.5 + day.intensity * 0.5 : 0.5,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   TIMELINE
   ────────────────────────────────────────────── */

function TimelineCard({
  icon: Icon,
  action,
  detail,
  time,
  index,
}: {
  icon: React.ElementType;
  action: string;
  detail: string;
  time: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
      className="flex items-center gap-3.5 rounded-[16px] border border-[rgba(210,190,170,0.15)] bg-white/55 px-4 py-3 backdrop-blur-sm transition-all duration-200 hover:bg-white/75 hover:border-[#D88A5B]/20"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(216,138,91,0.08)] border border-[rgba(216,138,91,0.12)]">
        <Icon className="size-4 text-[#D88A5B]" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#1F1610] truncate">{action}</p>
        <p className="text-[11px] text-[#6f6257]/55">{detail}</p>
      </div>
      <span className="shrink-0 text-[10px] font-medium text-[#6f6257]/40">{time}</span>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   COMING SOON BADGE
   ────────────────────────────────────────────── */

function ComingSoonBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center gap-2.5 rounded-full border border-[#D88A5B]/20 bg-[#D88A5B]/6 px-4 py-1.5 backdrop-blur-sm"
    >
      <motion.span
        className="size-2 rounded-full bg-[#D88A5B]"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D88A5B]">
        Coming Soon
      </span>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   AMBIENT DUST
   ────────────────────────────────────────────── */

function AmbientDust() {
  const dust = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: (i * 19 + 5) % 100,
      y: (i * 41 + 3) % 100,
      size: 1 + (i * 3) % 3,
      delay: (i * 5) % 12,
      duration: 14 + (i * 9) % 10,
    })),
  []);

  return (
    <div className="pointer-events-none fixed inset-0 ml-[220px] overflow-hidden">
      {dust.map((d) => (
        <motion.div
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`, top: `${d.y}%`,
            width: d.size, height: d.size,
            background: d.size > 2 ? "radial-gradient(circle, rgba(216,138,91,0.20) 0%, rgba(201,169,110,0.06) 100%)" : "#C9A96E",
          }}
          animate={{ y: [0, -28, 18, -14, 0], x: [0, 14, -10, 7, 0], opacity: [0.015, 0.05, 0.01, 0.035, 0.015] }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   NOISE TEXTURE
   ────────────────────────────────────────────── */

function AmbientNoise() {
  return (
    <div
      className="pointer-events-none fixed inset-0 ml-[220px] opacity-[0.012] mix-blend-multiply"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

/* ──────────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────────── */

export default function ProgressPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4EFE8" }}>
      <AmbientNoise />
        <div className="relative min-h-screen">
          {/* Ambient glows */}
          <div className="pointer-events-none fixed right-[5%] top-[4%] size-[550px] rounded-full bg-gradient-to-br from-[#D88A5B]/5 via-[#C9A96E]/3 to-transparent blur-[160px]" />
          <div className="pointer-events-none fixed bottom-[10%] left-[5%] size-[480px] rounded-full bg-gradient-to-tr from-[#C9A96E]/4 via-[#D88A5B]/3 to-transparent blur-[140px]" />
          <div className="pointer-events-none fixed left-[35%] top-[48%] size-[380px] rounded-full bg-[#FFF5E6]/8 blur-[100px]" />

          <AmbientDust />

          <div className="relative z-10 mx-auto max-w-5xl px-6 pt-12 pb-24">
            {/* ─── HERO ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-10 overflow-hidden rounded-[32px] border border-[rgba(210,190,170,0.16)]"
              style={{
                background:
                  "linear-gradient(160deg, rgba(255,250,245,0.97) 0%, rgba(250,244,235,0.92) 35%, rgba(245,238,228,0.88) 100%)",
                boxShadow:
                  "0 32px 100px rgba(42,33,28,0.10), 0 0 0 1px rgba(255,255,255,0.5) inset",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.015] mix-blend-multiply"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }}
              />

              <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-gradient-to-br from-[#D88A5B]/8 to-transparent blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 size-60 rounded-full bg-gradient-to-tr from-[#C9A96E]/6 to-transparent blur-3xl" />

              <div className="relative z-10 flex flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:px-10 md:py-14">
                <div className="flex-1">
                  <ComingSoonBadge />

                  <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mt-5 font-serif text-[42px] font-bold leading-[0.9] tracking-tight text-[#1F1610] md:text-[60px]"
                  >
                    Language
                    <br />
                    <span className="bg-gradient-to-r from-[#D88A5B] via-[#C9A96E] to-[#D88A5B] bg-clip-text text-transparent">
                      Analytics
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.18 }}
                    className="mt-3 max-w-lg text-[14px] leading-relaxed text-[rgba(35,22,14,0.75)] md:text-[15px]"
                  >
                    Track mastery, habits, fluency, and progress with intelligent insights.
                    See your language journey take shape with beautiful analytics.
                  </motion.p>
                </div>

                {/* Retention circle */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="shrink-0"
                >
                  <RetentionCircle />
                </motion.div>
              </div>
            </motion.div>

            {/* ─── METRICS ROW ─── */}
            <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              {METRICS.map((m, i) => (
                <MetricCard key={m.label} {...m} index={i} />
              ))}
            </div>

            {/* ─── CHARTS + HEATMAP SIDE BY SIDE ─── */}
            <div className="mb-8 grid gap-4 md:grid-cols-2">
              {/* Chart */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="rounded-[24px] border border-[rgba(210,190,170,0.16)] bg-white/60 p-6 backdrop-blur-sm transition-all duration-200 hover:bg-white/75 hover:border-[#D88A5B]/20 hover:shadow-[0_12px_40px_rgba(42,33,28,0.06)]"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-[#D88A5B]/5 blur-3xl" />
                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="size-4 text-[#D88A5B]" strokeWidth={1.5} />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6f6257]/55">
                        Daily Activity
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center gap-1 text-[9px] font-medium text-[#6f6257]/35">
                        <span className="size-2 rounded-full bg-[#D88A5B]" /> Study
                      </span>
                      <span className="flex items-center gap-1 text-[9px] font-medium text-[#6f6257]/35">
                        <span className="size-2 rounded-full bg-[rgba(216,138,91,0.25)]" /> Review
                      </span>
                    </div>
                  </div>

                  <ChartBars />

                  <div className="mt-2 flex justify-between text-[8px] font-medium text-[#6f6257]/25">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span>
                    <span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                </div>
              </motion.div>

              {/* Heatmap */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="rounded-[24px] border border-[rgba(210,190,170,0.16)] bg-white/60 p-6 backdrop-blur-sm transition-all duration-200 hover:bg-white/75 hover:border-[#D88A5B]/20 hover:shadow-[0_12px_40px_rgba(42,33,28,0.06)]"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-[#C9A96E]/5 blur-3xl" />
                <div className="relative z-10">
                  <div className="mb-4 flex items-center gap-2">
                    <Calendar className="size-4 text-[#C9A96E]" strokeWidth={1.5} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6f6257]/55">
                      Learning Heatmap
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-[3px] pt-0.5">
                      {[
                        { k: "mon", l: "M" },
                        { k: "tue", l: "T" },
                        { k: "wed", l: "W" },
                        { k: "thu", l: "T" },
                        { k: "fri", l: "F" },
                        { k: "sat", l: "S" },
                        { k: "sun", l: "S" },
                      ].map((d) => (
                        <span key={d.k} className="text-[7px] font-medium text-[#6f6257]/25 h-[11px] leading-[11px]">{d.l}</span>
                      ))}
                    </div>
                    <div className="flex-1 overflow-x-auto">
                      <HeatmapPlaceholder />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-[9px] text-[#6f6257]/35">
                    <span>Less</span>
                    <div className="flex gap-[2px]">
                      <div className="size-[10px] rounded-[2px] bg-[rgba(210,190,170,0.12)]" />
                      <div className="size-[10px] rounded-[2px] bg-[#C9A96E]/30" />
                      <div className="size-[10px] rounded-[2px] bg-[#D88A5B]/50" />
                      <div className="size-[10px] rounded-[2px] bg-[#D88A5B]" />
                    </div>
                    <span>More</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ─── TIMELINE + FLOATING CARD ─── */}
            <div className="mb-8 grid gap-4 md:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="md:col-span-2 rounded-[24px] border border-[rgba(210,190,170,0.16)] bg-white/55 p-6 backdrop-blur-sm"
              >
                <div className="mb-4 flex items-center gap-2">
                  <Activity className="size-4 text-[#D88A5B]" strokeWidth={1.5} />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6f6257]/55">
                    Recent Activity
                  </span>
                </div>
                <div className="space-y-2">
                  {TIMELINE_ITEMS.map((item, i) => (
                    <TimelineCard key={i} {...item} index={i} />
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="rounded-[24px] border border-[rgba(210,190,170,0.16)] bg-white/55 p-6 backdrop-blur-sm"
              >
                <div className="mb-4 flex items-center gap-2">
                  <Target className="size-4 text-[#D88A5B]" strokeWidth={1.5} />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6f6257]/55">
                    Daily Goal
                  </span>
                </div>
                <div className="flex flex-col items-center py-4">
                  <motion.div
                    className="flex items-center justify-center rounded-full border-4 border-[#D88A5B]/20 size-20"
                    animate={{ borderColor: ["rgba(216,138,91,0.15)", "rgba(216,138,91,0.30)", "rgba(216,138,91,0.15)"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <span className="text-[24px] font-bold text-[#1F1610]">0</span>
                  </motion.div>
                  <span className="mt-2 text-[11px] font-medium text-[#6f6257]/45">of 20 words</span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-[rgba(210,190,170,0.12)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#D88A5B] to-[#C9A96E]"
                    initial={{ width: 0 }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            </div>

            {/* ─── FEATURES ─── */}
            <div className="mb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="mb-5 flex items-center gap-2.5"
              >
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(210,190,170,0.2)] to-transparent" />
                <Sparkles className="size-3.5 text-[#D88A5B]" strokeWidth={1.5} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6f6257]/55">
                  Coming Analytics
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(210,190,170,0.2)] to-transparent" />
              </motion.div>

              <div className="grid gap-3 md:grid-cols-2">
                {FEATURES.map((f, i) => (
                  <FeatureCard key={f.title} {...f} index={i} />
                ))}
              </div>
            </div>

            {/* ─── CENTER BADGE ─── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center"
            >
              <div className="inline-flex items-center gap-3 rounded-full border border-[rgba(210,190,170,0.18)] bg-white/70 px-5 py-2.5 backdrop-blur-sm">
                <motion.div
                  className="flex size-7 items-center justify-center rounded-full bg-[#D88A5B]/10"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="size-3.5 text-[#D88A5B]" strokeWidth={1.5} />
                </motion.div>
                <span className="text-[12px] font-semibold text-[#4A3A2E]/75">Launching Soon</span>
                <Star className="size-3.5 text-[#C9A96E]" strokeWidth={1.5} />
              </div>
            </motion.div>
          </div>
        </div>
    </div>
  );
}
