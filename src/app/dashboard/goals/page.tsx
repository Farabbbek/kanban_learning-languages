"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Plus,
  ChevronDown,
  Trophy,
  Sparkles,
  CheckCircle2,
  ListTodo,
  Calendar,
  Loader2,
  X,
  Zap,
  Clock,
  TrendingUp,
  Check,
  BookMarked,
  Archive,
  Flag,
  Orbit,
  BookOpen,
  Layers,
  Brain,
  Mic,
  PenTool,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { GoalCard, Goal } from "@/components/dashboard/goal-card";

/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */

interface GoalForm {
  title: string;
  description: string;
  category: string;
  priority: string;
  target: string;
  deadline: string;
}

const CATEGORIES = [
  { value: "vocabulary", label: "Vocabulary", icon: "📖" },
  { value: "flashcards", label: "Flashcards", icon: "🃏" },
  { value: "grammar", label: "Grammar", icon: "✍️" },
  { value: "speaking", label: "Speaking", icon: "🎤" },
  { value: "reading", label: "Reading", icon: "📚" },
  { value: "listening", label: "Listening", icon: "🎧" },
  { value: "study habit", label: "Study Habit", icon: "🔥" },
  { value: "productivity", label: "Productivity", icon: "⚡" },
  { value: "personal", label: "Personal", icon: "👤" },
  { value: "custom", label: "Custom", icon: "🎯" },
];

const PRIORITIES = [
  { value: "low", label: "Low", color: "#8B9D83" },
  { value: "medium", label: "Medium", color: "#C9A96E" },
  { value: "high", label: "High", color: "#D88A5B" },
];

/* ──────────────────────────────────────────────
   CONFETTI
   ────────────────────────────────────────────── */

const CONFETTI_COLORS = ["#D88A5B", "#C9A96E", "#8B9D83", "#E8C4A0", "#F5E6D3", "#D4A574"];

function ConfettiBurst() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: (i * 17.3 - 255) % 600,
    y: -((i * 13.7 + 100) % 400 + 200),
    rotate: (i * 47) % 720,
    duration: 1.2 + (i % 10) * 0.08,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: 0,
            scale: [0, 1.5, 0],
            x: p.x,
            y: p.y,
            rotate: p.rotate,
          }}
          transition={{ duration: p.duration, ease: "easeOut" }}
          className="absolute size-3 rounded-full"
          style={{ background: p.color }}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   FLOATING DUST
   ────────────────────────────────────────────── */

function FloatingDust() {
  const [dust] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: (i * 41) % 100,
      y: (i * 29) % 100,
      size: 1 + (i * 5) % 3,
      delay: (i * 7) % 12,
      duration: 12 + (i * 11) % 10,
    }))
  );

  return (
    <div className="pointer-events-none fixed inset-0 ml-[220px] hidden overflow-hidden md:block">
      {dust.map((d) => (
        <motion.div
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            background: d.size > 2
              ? "radial-gradient(circle, rgba(201,169,110,0.4) 0%, rgba(216,138,91,0.15) 100%)"
              : "#C9A96E",
          }}
          animate={{
            y: [0, -35, 25, -18, 0],
            x: [0, 18, -12, 10, 0],
            opacity: [0.03, 0.08, 0.02, 0.06, 0.03],
          }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   HERO SECTION — Matches Flashcards pattern
   ────────────────────────────────────────────── */

const FLOAT_SYMBOLS = ["🎯", "⭐", "🏆", "🔥", "📈", "✅", "📋", "⚡", "🎯"];
const FLOAT_COLORS = ["#D88A5B", "#C9A96E", "#8B9D83", "#D88A5B", "#C9A96E", "#8B9D83", "#B8A28E", "#D88A5B", "#C9A96E"];

function HeroSection({ onAction }: { onAction: (action: "create" | "archive") => void }) {
  const [floatingSymbols] = useState(() =>
    FLOAT_SYMBOLS.map((_, i) => ({
      id: i,
      angle: (i / FLOAT_SYMBOLS.length) * Math.PI * 2 + 0.3,
      label: FLOAT_SYMBOLS[i],
      color: FLOAT_COLORS[i],
      distance: 70 + (i % 3) * 20,
      delay: i * 0.4,
      duration: 8 + (i * 3) % 5,
    }))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative mb-12 overflow-hidden rounded-[32px]"
      style={{
        background: "linear-gradient(165deg, #FCF8F3 0%, #F8F2EA 35%, #F4EDE3 65%, #F1EBE2 100%)",
        boxShadow: "0 32px 100px rgba(42,33,28,0.14), 0 0 0 1px rgba(205,170,140,0.08) inset, 0 -1px 0 rgba(255,255,255,0.6) inset",
      }}
    >
      {/* Noise texture */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[32px] opacity-[0.020] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.50' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient glows */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-80 rounded-full bg-gradient-to-br from-[#D88A5B]/12 to-[#C9A96E]/5 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-12 left-[20%] size-56 rounded-full bg-gradient-to-tr from-[#C9A96E]/10 to-transparent blur-[80px]" />
      <div className="pointer-events-none absolute left-[55%] top-[30%] size-40 rounded-full bg-[#FFF5E6]/20 blur-[60px]" />

      <div className="relative z-10 flex flex-col items-center px-10 py-14 md:flex-row md:py-16">
        {/* ─── LEFT — 60% ─── */}
        <div className="w-full md:w-[58%] text-center md:text-left md:pr-8">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D88A5B]/18 bg-[#D88A5B]/8 px-3.5 py-1.5 backdrop-blur-sm"
          >
            <Sparkles className="size-3 text-[#D88A5B]" strokeWidth={1.8} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D88A5B]">Personal Productivity</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="font-serif text-[42px] font-bold leading-[0.92] tracking-tight text-[#1A100A] md:text-[58px]"
          >
            Goals
            <br />
            <span className="bg-gradient-to-r from-[#C96A3A] via-[#C9A96E] to-[#D88050] bg-clip-text text-transparent">Tracker</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="mx-auto mt-4 max-w-[440px] text-[14px] leading-[1.6] text-[#5A4A3E] md:mx-0"
          >
            Track milestones, build habits, and stay focused on your language journey. Create, manage, and celebrate your progress.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <motion.button
              onClick={() => onAction("create")}
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 rounded-[18px] px-7 py-3.5 text-[14px] font-semibold text-white transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #2A1E17, #3D2B1F)",
                boxShadow: "0 8px 28px rgba(42,33,28,0.20), 0 0 0 1px rgba(255,255,255,0.10) inset",
              }}
            >
              <Plus className="size-4" strokeWidth={1.5} />
              Create Goal
            </motion.button>

            <motion.button
              onClick={() => onAction("archive")}
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 rounded-[18px] border border-[rgba(210,190,170,0.25)] bg-white/70 px-7 py-3.5 text-[14px] font-semibold text-[#2A1E17] transition-all duration-200 hover:bg-white/90 hover:border-[#D88A5B]/30 shadow-[0_4px_14px_rgba(42,33,28,0.05)]"
            >
              <Archive className="size-4 text-[#D88A5B]" strokeWidth={1.5} />
              View Completed
            </motion.button>
          </motion.div>
        </div>

        {/* ─── RIGHT — 40% ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="relative mt-12 flex w-full items-center justify-center md:mt-0 md:w-[42%]"
        >
          {/* Orbit ring */}
          <div className="relative flex size-44 items-center justify-center md:size-52">
            {/* Outer orbital rings */}
            <motion.div
              className="absolute inset-[6%] rounded-full border border-[rgba(216,138,91,0.14)]"
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-[18%] rounded-full border border-dashed border-[rgba(201,169,110,0.16)]"
              animate={{ rotate: -360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />

            {/* Subtle glow */}
            <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-[#D88A5B]/8 to-[#C9A96E]/4 blur-[30px]" />

            {/* Floating symbols on orbit */}
            {floatingSymbols.map((sym) => (
              <motion.span
                key={sym.id}
                className="absolute text-[16px]"
                style={{ color: sym.color, opacity: 0.55 }}
                animate={{
                  x: [
                    Math.cos(sym.angle) * sym.distance * 0.5,
                    Math.cos(sym.angle + 0.4) * sym.distance * 0.55,
                    Math.cos(sym.angle) * sym.distance * 0.5,
                  ],
                  y: [
                    Math.sin(sym.angle) * sym.distance * 0.5,
                    Math.sin(sym.angle + 0.4) * sym.distance * 0.55,
                    Math.sin(sym.angle) * sym.distance * 0.5,
                  ],
                  opacity: [0.35, 0.6, 0.35],
                }}
                transition={{ duration: sym.duration, delay: sym.delay, repeat: Infinity, ease: "easeInOut" }}
              >
                {sym.label}
              </motion.span>
            ))}

            {/* Card stack — 3 layered goal cards */}
            <motion.div
              className="absolute"
              animate={{ rotate: [6, 3, 6], y: [8, 2, 8] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            >
              <div
                className="flex size-14 items-center justify-center rounded-[12px] border border-[rgba(201,169,110,0.12)] backdrop-blur-[2px]"
                style={{
                  background: "linear-gradient(145deg, rgba(255,252,248,0.70), rgba(248,241,234,0.60))",
                  boxShadow: "0 4px 16px rgba(42,33,28,0.06)",
                }}
              >
                <CheckCircle2 className="size-5 text-[#C9A96E]/70" strokeWidth={1.5} />
              </div>
            </motion.div>

            <motion.div
              className="absolute"
              style={{ transform: "translate(6px, 4px)" }}
              animate={{ rotate: [3, -1, 3], y: [4, -2, 4] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            >
              <div
                className="flex size-[62px] items-center justify-center rounded-[14px] border border-[rgba(216,138,91,0.14)] backdrop-blur-[2px]"
                style={{
                  background: "linear-gradient(145deg, rgba(255,252,248,0.80), rgba(248,241,234,0.70))",
                  boxShadow: "0 6px 20px rgba(42,33,28,0.08)",
                }}
              >
                <ListTodo className="size-6 text-[#D88A5B]/80" strokeWidth={1.5} />
              </div>
            </motion.div>

            {/* Front card — centered, prominent */}
            <motion.div
              className="absolute z-10"
              animate={{ y: [-4, 6, -4], rotate: [-2, 2, -2] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative">
                <div className="absolute -inset-2 rounded-[20px] bg-[#D88A5B]/10 blur-[12px]" />
                <div
                  className="relative flex size-[76px] items-center justify-center rounded-[18px] border border-[rgba(216,138,91,0.20)] shadow-xl"
                  style={{
                    background: "linear-gradient(145deg, rgba(255,252,248,0.97), rgba(248,241,234,0.92))",
                    boxShadow: "0 12px 40px rgba(42,33,28,0.14), 0 0 0 1px rgba(255,255,255,0.5) inset",
                  }}
                >
                  <motion.span
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Target className="size-8 text-[#D88A5B]" strokeWidth={1.5} />
                  </motion.span>
                </div>
              </div>
            </motion.div>

            {/* Center marker */}
            <motion.div
              className="relative z-0 flex size-10 items-center justify-center rounded-full"
              style={{
                background: "linear-gradient(145deg, rgba(216,138,91,0.12), rgba(201,169,110,0.06))",
                border: "1px solid rgba(216,138,91,0.16)",
              }}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="size-2.5 rounded-full bg-[#D88A5B]/30" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   STATS ROW — Glassmorphism cards
   ────────────────────────────────────────────── */

function StatsRow({ stats }: { stats: { active: number; completed: number; rate: number; weekly: number } }) {
  const cards = [
    { icon: ListTodo, label: "Active Goals", value: stats.active, color: "#D88A5B" },
    { icon: CheckCircle2, label: "Completed", value: stats.completed, color: "#8B9D83" },
    { icon: TrendingUp, label: "Rate", value: `${stats.rate}%`, color: "#C9A96E" },
    { icon: Zap, label: "Weekly", value: stats.weekly, color: "#D88A5B" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mb-8 grid grid-cols-2 gap-2.5 md:mb-10 md:grid-cols-4 md:gap-3"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            whileHover={{ y: -3, scale: 1.02 }}
            className="group relative overflow-hidden rounded-[16px] border border-[rgba(210,190,170,0.18)] bg-white/70 p-3 transition-all duration-300 hover:border-[rgba(216,138,91,0.18)] hover:bg-white/80 hover:shadow-[0_8px_28px_rgba(42,33,28,0.07)] md:bg-white/55 md:p-4 md:backdrop-blur-sm"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100 blur-2xl"
              style={{ background: `${card.color}12` }}
            />
            <div className="relative z-10">
              <Icon className="mb-2 size-4" style={{ color: card.color }} strokeWidth={1.8} />
              <p className="text-[22px] font-bold leading-none text-[#2B1B12]">{card.value}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8d8175]/50">{card.label}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   MODE SELECTOR — 2 big feature panels
   ────────────────────────────────────────────── */

function ModeSelector({
  activeMode,
  onSelect,
}: {
  activeMode: "goals" | "completed";
  onSelect: (mode: "goals" | "completed") => void;
}) {
  return (
    <div className="mb-8 grid grid-cols-2 gap-3 md:mb-10 md:gap-4">
      <motion.button
        onClick={() => onSelect("goals")}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "mobile-flat-glass relative overflow-hidden rounded-[22px] border-2 p-4 text-left transition-all duration-300 sm:p-5 md:rounded-[24px] md:p-7",
          activeMode === "goals"
            ? "border-[#D88A5B]/40 bg-[#D88A5B]/8 shadow-[0_12px_40px_rgba(216,138,91,0.12)]"
            : "border-[rgba(210,190,170,0.20)] bg-white/60 hover:border-[#D88A5B]/25 hover:bg-white/80 hover:shadow-[0_8px_24px_rgba(42,33,28,0.06)]"
        )}
        style={activeMode === "goals" ? { background: "linear-gradient(135deg, rgba(216,138,91,0.10), rgba(201,169,110,0.05))" } : {}}
      >
        {activeMode === "goals" && (
          <motion.div layoutId="modeBg" className="pointer-events-none absolute -right-8 -top-8 hidden size-40 rounded-full bg-[#D88A5B]/10 blur-3xl md:block" />
        )}
        <div className="relative z-10">
          <div className={cn("mb-4 flex size-12 items-center justify-center rounded-[16px] transition-all md:size-14", activeMode === "goals" ? "bg-[#2A211C] shadow-lg" : "bg-[rgba(232,218,200,0.3)]")}>
            <ListTodo className={cn("size-5 md:size-6", activeMode === "goals" ? "text-white" : "text-[#D88A5B]")} strokeWidth={1.5} />
          </div>
          <h3 className="font-serif text-[22px] font-semibold leading-tight text-[#1F1610]">Active Goals</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-[#6f6257]/70 md:mt-1.5">Manage current milestones and learning habits.</p>
        </div>
      </motion.button>

      <motion.button
        onClick={() => onSelect("completed")}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "mobile-flat-glass relative overflow-hidden rounded-[22px] border-2 p-4 text-left transition-all duration-300 sm:p-5 md:rounded-[24px] md:p-7",
          activeMode === "completed"
            ? "border-[#D88A5B]/40 bg-[#D88A5B]/8 shadow-[0_12px_40px_rgba(216,138,91,0.12)]"
            : "border-[rgba(210,190,170,0.20)] bg-white/60 hover:border-[#D88A5B]/25 hover:bg-white/80 hover:shadow-[0_8px_24px_rgba(42,33,28,0.06)]"
        )}
        style={activeMode === "completed" ? { background: "linear-gradient(135deg, rgba(216,138,91,0.10), rgba(201,169,110,0.05))" } : {}}
      >
        {activeMode === "completed" && (
          <motion.div layoutId="modeBg" className="pointer-events-none absolute -right-8 -top-8 hidden size-40 rounded-full bg-[#D88A5B]/10 blur-3xl md:block" />
        )}
        <div className="relative z-10">
          <div className={cn("mb-4 flex size-12 items-center justify-center rounded-[16px] transition-all md:size-14", activeMode === "completed" ? "bg-[#2A211C] shadow-lg" : "bg-[rgba(232,218,200,0.3)]")}>
            <Archive className={cn("size-5 md:size-6", activeMode === "completed" ? "text-white" : "text-[#D88A5B]")} strokeWidth={1.5} />
          </div>
          <h3 className="font-serif text-[22px] font-semibold leading-tight text-[#1F1610]">Completed Goals</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-[#6f6257]/70 md:mt-1.5">Review finished milestones and progress.</p>
        </div>
      </motion.button>
    </div>
  );
}

/* ──────────────────────────────────────────────
   CREATE GOAL PANEL
   ────────────────────────────────────────────── */

function CreateGoalPanel({
  isOpen,
  onClose,
  onSubmit,
  submitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: GoalForm) => void;
  submitting: boolean;
}) {
  const [form, setForm] = useState<GoalForm>({
    title: "",
    description: "",
    category: "custom",
    priority: "medium",
    target: "",
    deadline: "",
  });

  const handleSubmit = useCallback(() => {
    if (!form.title.trim() || submitting) return;
    onSubmit(form);
    setForm({
      title: "",
      description: "",
      category: "custom",
      priority: "medium",
      target: "",
      deadline: "",
    });
  }, [form, submitting, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="relative mb-8 overflow-hidden rounded-[28px] border border-[rgba(210,190,170,0.18)]"
            style={{
              background: "linear-gradient(165deg, rgba(255,250,245,0.96), rgba(250,244,235,0.92))",
              boxShadow: "0 28px 88px rgba(42,33,28,0.10), 0 0 0 1px rgba(255,255,255,0.4) inset",
            }}
          >
            <div className="pointer-events-none absolute -top-8 right-1/4 size-40 rounded-full bg-[#D88A5B]/12 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 left-1/5 size-32 rounded-full bg-[#C9A96E]/10 blur-3xl" />

            <div className="relative z-10 px-7 py-7 md:px-8 md:py-8">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#D88A5B]/18 to-[#C9A96E]/12 border border-[rgba(216,138,91,0.18)]">
                    <Plus className="size-5 text-[#D88A5B]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-semibold tracking-tight text-[#1F1610]">Create New Goal</h2>
                    <p className="text-[13px] text-[#8d8175]/65">Define a milestone for your learning journey</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex size-8 items-center justify-center rounded-full text-[#8d8175]/40 transition-colors hover:bg-[rgba(210,190,170,0.15)] hover:text-[#8d8175]"
                >
                  <X className="size-4" strokeWidth={1.5} />
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8d8175]/60">
                    Goal Title *
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. Master 1000 Spanish words"
                    className="w-full rounded-[14px] border border-[rgba(210,190,170,0.22)] bg-white/60 px-4 py-3 text-[14px] text-[#2A211C] placeholder:text-[#2A211C]/30 transition-all duration-200 focus:border-[#D88A5B]/40 focus:outline-none focus:ring-[4px] focus:ring-[#D88A5B]/10"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8d8175]/60">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="What does this goal involve?"
                    rows={2}
                    className="w-full resize-none rounded-[14px] border border-[rgba(210,190,170,0.22)] bg-white/60 px-4 py-3 text-[14px] text-[#2A211C] placeholder:text-[#2A211C]/30 transition-all duration-200 focus:border-[#D88A5B]/40 focus:outline-none focus:ring-[4px] focus:ring-[#D88A5B]/10"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8d8175]/60">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <motion.button
                        key={cat.value}
                        onClick={() => setForm((f) => ({ ...f, category: cat.value }))}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={cn(
                          "rounded-full px-3.5 py-2 text-[12px] font-medium transition-all duration-200 border",
                          form.category === cat.value
                            ? "bg-[#D88A5B]/14 border-[#D88A5B]/35 text-[#D88A5B] shadow-[0_0_24px_rgba(216,138,91,0.12)]"
                            : "bg-white/45 border-[rgba(210,190,170,0.22)] text-[#6B5D52]/75 hover:border-[#D88A5B]/30 hover:text-[#6B5D52] hover:bg-white/65"
                        )}
                      >
                        {cat.icon} {cat.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8d8175]/60">
                    Priority
                  </label>
                  <div className="flex gap-2">
                    {PRIORITIES.map((p) => (
                      <motion.button
                        key={p.value}
                        onClick={() => setForm((f) => ({ ...f, priority: p.value }))}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={cn(
                          "flex-1 rounded-[12px] px-3 py-2.5 text-[12px] font-semibold transition-all duration-200 border",
                          form.priority === p.value
                            ? "bg-[#D88A5B]/14 border-[#D88A5B]/35 text-[#D88A5B] shadow-[0_0_24px_rgba(216,138,91,0.12)]"
                            : "bg-white/45 border-[rgba(210,190,170,0.16)] text-[#6B5D52]/60 hover:border-[#D88A5B]/20 hover:text-[#6B5D52]"
                        )}
                      >
                        {p.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Target */}
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8d8175]/60">
                    Progress Target
                  </label>
                  <input
                    type="number"
                    value={form.target}
                    onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}
                    placeholder="e.g. 100"
                    min={1}
                    className="w-full rounded-[14px] border border-[rgba(210,190,170,0.22)] bg-white/60 px-4 py-3 text-[14px] text-[#2A211C] placeholder:text-[#2A211C]/30 transition-all duration-200 focus:border-[#D88A5B]/40 focus:outline-none focus:ring-[4px] focus:ring-[#D88A5B]/10"
                  />
                </div>

                {/* Deadline */}
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8d8175]/60">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                    className="w-full rounded-[14px] border border-[rgba(210,190,170,0.22)] bg-white/60 px-4 py-3 text-[14px] text-[#2A211C] transition-all duration-200 focus:border-[#D88A5B]/40 focus:outline-none focus:ring-[4px] focus:ring-[#D88A5B]/10"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="rounded-[14px] px-5 py-2.5 text-[13px] font-medium text-[#8d8175]/70 transition-colors hover:text-[#2A211C]"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={!form.title.trim() || submitting}
                  whileHover={form.title.trim() && !submitting ? { scale: 1.02, y: -2 } : {}}
                  whileTap={form.title.trim() && !submitting ? { scale: 0.97 } : {}}
                  className={cn(
                    "inline-flex items-center gap-2.5 rounded-[16px] px-6 py-3 text-[14px] font-semibold text-white transition-all duration-300 overflow-hidden relative group",
                    submitting ? "opacity-70 cursor-not-allowed" : ""
                  )}
                  style={{
                    background: "linear-gradient(135deg, #2A1E17, #3D2B1F)",
                    boxShadow: "0 12px 40px rgba(42,33,28,0.22), 0 0 0 1px rgba(255,255,255,0.10) inset",
                  }}
                >
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/12 to-transparent opacity-60" />
                  {submitting ? (
                    <><Loader2 className="size-4 animate-spin" strokeWidth={2} /> Creating...</>
                  ) : (
                    <><Sparkles className="size-4 text-[#D88A5B]" strokeWidth={1.5} /> Create Goal</>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ──────────────────────────────────────────────
   LOADING STATE (matching Flashcards)
   ────────────────────────────────────────────── */

function LoadingState() {
  const [dots] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: 20 + Math.cos((i / 6) * Math.PI * 2) * 40,
      y: 50 + Math.sin((i / 6) * Math.PI * 2) * 30,
      delay: i * 0.15,
    }))
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
      <div className="relative mb-8 flex size-24 items-center justify-center">
        {dots.map((d) => (
          <motion.div
            key={d.id}
            className="absolute size-2 rounded-full"
            style={{ background: "radial-gradient(circle, #D88A5B, #C9A96E)" }}
            animate={{
              x: [0, Math.cos((d.id / 6) * Math.PI * 2) * 40],
              y: [0, Math.sin((d.id / 6) * Math.PI * 2) * 30],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.6, 1.2, 0.6],
            }}
            transition={{ duration: 2, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
        <motion.div
          className="size-10 rounded-full border-2 border-[#D88A5B]/20"
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
        <p className="font-serif text-xl font-semibold text-[#2B1B12]">Loading your goals...</p>
        <p className="mt-2 text-[13px] text-[#8d8175]/60">Fetching your milestones</p>
      </motion.div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────────── */

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [activeMode, setActiveMode] = useState<"goals" | "completed">("goals");
  const [showConfetti, setShowConfetti] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* ─── Fetch goals ─── */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/goals");
        if (res.ok && mounted) {
          const data = await res.json();
          setGoals(data.goals || []);
        }
      } catch (err) {
        console.error("Failed to fetch goals:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  /* ─── Create goal ─── */
  const handleCreate = useCallback(async (form: GoalForm) => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          category: form.category,
          priority: form.priority,
          target: form.target ? parseInt(form.target, 10) : null,
          deadline: form.deadline || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGoals((prev) => [data.goal, ...prev]);
        setShowCreatePanel(false);
      }
    } catch (err) {
      console.error("Failed to create goal:", err);
    } finally {
      setSubmitting(false);
    }
  }, []);

  /* ─── Toggle complete ─── */
  const handleToggleComplete = useCallback(async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "active" : "completed";

    setGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, status: newStatus as "active" | "completed", completed_at: newStatus === "completed" ? new Date().toISOString() : null }
          : g
      )
    );

    if (newStatus === "completed") {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }

    try {
      await fetch(`/api/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update goal:", err);
      try { const res = await fetch("/api/goals"); if (res.ok) { const d = await res.json(); setGoals(d.goals || []); } } catch {}
    }
  }, []);

  /* ─── Delete goal ─── */
  const handleDelete = useCallback(async (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    try { await fetch(`/api/goals/${id}`, { method: "DELETE" }); }
    catch (err) {
      console.error("Failed to delete goal:", err);
      try { const res = await fetch("/api/goals"); if (res.ok) { const d = await res.json(); setGoals(d.goals || []); } } catch {}
    }
  }, []);

  /* ─── Restore goal ─── */
  const handleRestore = useCallback(async (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: "active" as const, completed_at: null } : g))
    );
    try {
      await fetch(`/api/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
    } catch (err) {
      console.error("Failed to restore goal:", err);
      try { const res = await fetch("/api/goals"); if (res.ok) { const d = await res.json(); setGoals(d.goals || []); } } catch {}
    }
  }, []);

  /* ─── Hero action ─── */
  const handleHeroAction = useCallback((action: "create" | "archive") => {
    if (action === "create") {
      setShowCreatePanel((p) => !p);
    } else {
      setActiveMode("completed");
    }
  }, []);

  /* ─── Derived data ─── */
  const activeGoals = useMemo(() => goals.filter((g) => g.status === "active"), [goals]);
  const completedGoals = useMemo(() => goals.filter((g) => g.status === "completed"), [goals]);
  const completionRate = useMemo(
    () => (goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0),
    [goals, completedGoals]
  );
  const weeklyProgress = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return goals.filter((g) => new Date(g.created_at) >= startOfWeek).length;
  }, [goals]);

  const stats = useMemo(
    () => ({ active: activeGoals.length, completed: completedGoals.length, rate: completionRate, weekly: weeklyProgress }),
    [activeGoals, completedGoals, completionRate, weeklyProgress]
  );

  return (
    <div className="relative min-h-screen">
      <div className="cinematic-page fixed inset-0 ml-[220px]" />
      <div className="workspace-fog fixed inset-0 ml-[220px] pointer-events-none" />

      <div className="pointer-events-none fixed right-[8%] top-[15%] hidden size-[700px] rounded-full bg-gradient-to-br from-[#D88A5B]/6 via-[#C9A96E]/4 to-transparent blur-[180px] md:block" />
      <div className="pointer-events-none fixed bottom-[8%] left-[3%] hidden size-[600px] rounded-full bg-gradient-to-tr from-[#C9A96E]/5 via-[#D88A5B]/3 to-transparent blur-[140px] md:block" />
      <div className="pointer-events-none fixed left-[40%] top-[50%] hidden size-[500px] rounded-full bg-[#FFF5E6]/15 blur-[120px] md:block" />

      {/* Confetti overlay */}
      <AnimatePresence>{showConfetti && <ConfettiBurst />}</AnimatePresence>

        <div className="mobile-quiet-motion relative z-10 mx-auto max-w-5xl px-3 pb-24 pt-4 sm:px-5 md:px-6 md:pt-12">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between md:mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8d8175]/45">Goals Tracker</p>
          </div>

          <HeroSection onAction={handleHeroAction} />

          {/* Stats Row */}
          <StatsRow stats={stats} />

          {/* Mode Selector (feature panels) */}
          <ModeSelector activeMode={activeMode} onSelect={setActiveMode} />

          {/* Content area — inline, never redirect */}
          <AnimatePresence mode="wait">
            {loading ? (
              <LoadingState key="loading" />
            ) : activeMode === "goals" ? (
              <motion.div
                key="goals"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Create panel */}
                <CreateGoalPanel
                  isOpen={showCreatePanel}
                  onClose={() => setShowCreatePanel(false)}
                  onSubmit={handleCreate}
                  submitting={submitting}
                />

                {!showCreatePanel && activeGoals.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-[rgba(210,190,170,0.25)] bg-white/30 px-8 py-16 text-center"
                  >
                    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[#D88A5B]/8">
                      <Target className="size-7 text-[#D88A5B]/40" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[17px] font-semibold text-[#2B1B12]">No active goals yet</h3>
                    <p className="mt-1.5 max-w-xs text-[13px] text-[#8d8175]/55">
                      Create your first goal to start tracking your learning milestones.
                    </p>
                    <motion.button
                      onClick={() => setShowCreatePanel(true)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="mt-5 inline-flex items-center gap-2 rounded-[12px] bg-[#2A1E17] px-5 py-2.5 text-[13px] font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#3D2B1F]"
                    >
                      <Plus className="size-4" strokeWidth={1.5} />
                      Create Goal
                    </motion.button>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    <div className="grid gap-4 md:grid-cols-2">
                      {activeGoals.map((goal) => (
                        <GoalCard
                          key={goal.id}
                          goal={goal}
                          onToggleComplete={handleToggleComplete}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </AnimatePresence>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="completed"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {completedGoals.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-[rgba(210,190,170,0.25)] bg-white/30 px-8 py-16 text-center"
                  >
                    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[#8B9D83]/8">
                      <Trophy className="size-7 text-[#8B9D83]/40" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[17px] font-semibold text-[#2B1B12]">No completed goals yet</h3>
                    <p className="mt-1.5 max-w-xs text-[13px] text-[#8d8175]/55">
                      Complete your first goal to see it appear here.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div>
                    <div className="mb-4 flex items-center gap-2">
                      <Trophy className="size-4 text-[#8B9D83]" strokeWidth={1.5} />
                      <p className="text-[13px] font-medium text-[#8d8175]/60">
                        {completedGoals.length} goal{completedGoals.length !== 1 ? "s" : ""} completed
                      </p>
                    </div>
                    <AnimatePresence mode="popLayout">
                      <div className="grid gap-4 md:grid-cols-2">
                        {completedGoals.map((goal) => (
                          <GoalCard
                            key={goal.id}
                            goal={goal}
                            onToggleComplete={handleToggleComplete}
                            onDelete={handleDelete}
                            onRestore={handleRestore}
                            isCompleted
                          />
                        ))}
                      </div>
                    </AnimatePresence>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom spacing */}
          <div className="h-20" />
        </div>
    </div>
  );
}
