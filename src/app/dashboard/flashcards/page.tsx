"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  Sparkles,
  Layers,
  Volume2,
  Heart,
  ChevronDown,
  BookOpen,
  GraduationCap,
  Brain,
  Quote,
  Trophy,
  Check,
  Loader2,
  ArrowRight,
  Info,
  X,
  Timer,
  RefreshCw,
  Play,
  BookMarked,
  FileText,
  Keyboard,
  ListChecks,
  Mic,
  Shuffle,
  Library,
  Sword,
  SkipForward,
} from "lucide-react";
import { LuxurySelect, LuxurySearchableSelect } from "@/components/ui/luxury-select";
import { applySm2 } from "@/lib/sm2";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toast, Toaster } from "react-hot-toast";
import { usePremiumTts } from "@/hooks/use-premium-tts";

/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */

type Language = "english" | "chinese" | "spanish" | "french";
type Difficulty = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
type SwipeDirection = "right" | "left";
type ViewMode = "flashcards" | "quiz";

interface FlashCard {
  word: string;
  translation: string;
  transcription?: string;
  example?: string;
  example_translation?: string;
  tags: string[];
  difficulty: Difficulty;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: Difficulty;
  sourceWord?: string | null;
  sourceLanguage?: string | null;
  targetLanguage?: string | null;
}

interface LanguageConfig {
  label: string;
  flag: string;
}

/* ──────────────────────────────────────────────
   CONSTANTS
   ────────────────────────────────────────────── */

const LANGUAGES: Record<Language, LanguageConfig> = {
  english: { label: "English", flag: "🇺🇸" },
  chinese: { label: "Chinese", flag: "🇨🇳" },
  spanish: { label: "Spanish", flag: "🇪🇸" },
  french: { label: "French", flag: "🇫🇷" },
};

const LEVELS: Difficulty[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const CARD_COUNTS = [10, 20, 30, 50];
const QUIZ_COUNTS = [5, 10, 15, 20];

const QUIZ_TYPES: { key: string; label: string; icon: React.ElementType }[] = [
  { key: "translation", label: "Translation", icon: BookOpen },
  { key: "grammar", label: "Grammar", icon: FileText },
  { key: "multiple-choice", label: "Multiple Choice", icon: ListChecks },
  { key: "fill-missing", label: "Fill Missing Word", icon: Brain },
  { key: "listening", label: "Listening", icon: Mic },
];

const SUGGESTED_TOPICS = [
  "Daily conversation", "Business meetings", "Travel vocabulary",
  "Restaurant phrases", "IELTS speaking", "News & media",
  "Technology", "Food & cooking", "Emotions & feelings",
  "Academic writing", "Sports & fitness", "Nature & environment",
  "Health & medicine", "Social media", "Slang & idioms",
  "Formal letters", "Shopping & fashion", "Music & arts",
  "Weather & seasons", "Anime & manga",
];

/* ──────────────────────────────────────────────
   FLOATING DUST
   ────────────────────────────────────────────── */

function FloatingDust() {
  const [dust] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i, x: (i * 41) % 100, y: (i * 29) % 100,
      size: 1 + (i * 5) % 3, delay: (i * 7) % 12, duration: 12 + (i * 11) % 10,
    }))
  );

  return (
    <div className="pointer-events-none fixed inset-0 ml-[220px] overflow-hidden">
      {dust.map((d) => (
        <motion.div
          key={d.id}
          className="absolute rounded-full"
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size, background: d.size > 2 ? "radial-gradient(circle, rgba(201,169,110,0.4) 0%, rgba(216,138,91,0.15) 100%)" : "#C9A96E" }}
          animate={{ y: [0, -35, 25, -18, 0], x: [0, 18, -12, 10, 0], opacity: [0.03, 0.08, 0.02, 0.06, 0.03] }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   HERO SECTION — REDESIGNED
   ────────────────────────────────────────────── */

const FLOAT_SYMBOLS = ["A", "文", "語", "字", "ñ", "é", "es", "?", "!"];
const FLOAT_COLORS = ["#D88A5B", "#C9A96E", "#8B9D83", "#D88A5B", "#C9A96E", "#8B9D83", "#B8A28E", "#D88A5B", "#C9A96E"];

function HeroSection({ onModeSelect }: { onModeSelect: (mode: ViewMode) => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
  }, []);

  // Floating language symbols positioned around the cards
  const symbolPositions = useMemo(() =>
    FLOAT_SYMBOLS.map((_, i) => ({
      id: i,
      angle: (i / FLOAT_SYMBOLS.length) * Math.PI * 2 + 0.3,
      label: FLOAT_SYMBOLS[i],
      color: FLOAT_COLORS[i],
      distance: 70 + (i % 3) * 20,
      delay: i * 0.4,
      duration: 8 + (i * 3) % 5,
    })),
  []);

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
      onMouseMove={handleMouseMove}
    >
      {/* Textured background */}
      <div className="pointer-events-none absolute inset-0 rounded-[32px] opacity-[0.020] mix-blend-multiply"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.50' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient glows — controlled, not washed out */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-80 rounded-full bg-gradient-to-br from-[#D88A5B]/12 to-[#C9A96E]/5 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-12 left-[20%] size-56 rounded-full bg-gradient-to-tr from-[#C9A96E]/10 to-transparent blur-[80px]" />
      <div className="pointer-events-none absolute left-[55%] top-[30%] size-40 rounded-full bg-[#FFF5E6]/20 blur-[60px]" />

      <div ref={cardRef} className="relative z-10 flex flex-col items-center px-10 py-14 md:flex-row md:py-16">
        {/* ─── LEFT — 60% ─── */}
        <div className="w-full md:w-[58%] text-center md:text-left md:pr-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D88A5B]/18 bg-[#D88A5B]/8 px-3.5 py-1.5 backdrop-blur-sm"
          >
            <Sparkles className="size-3 text-[#D88A5B]" strokeWidth={1.8} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D88A5B]">Premium AI Language Trainer</span>
          </motion.div>

          {/* Title — reduced size by ~20% */}
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="font-serif text-[42px] font-bold leading-[0.92] tracking-tight text-[#1A100A] md:text-[58px]"
          >
            Flashcards
            <br />
            <span className="bg-gradient-to-r from-[#C96A3A] via-[#C9A96E] to-[#D88050] bg-clip-text text-transparent">Studio</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="mx-auto mt-4 max-w-[440px] text-[14px] leading-[1.6] text-[#5A4A3E] md:mx-0"
          >
            Generate AI-powered flashcards and quizzes for deep language learning. Train your memory through intelligent repetition.
          </motion.p>

          {/* CTA Buttons under subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <motion.button
              onClick={() => onModeSelect("flashcards")}
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 rounded-[18px] px-7 py-3.5 text-[14px] font-semibold text-white transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #2A1E17, #3D2B1F)", boxShadow: "0 8px 28px rgba(42,33,28,0.20), 0 0 0 1px rgba(255,255,255,0.10) inset" }}
            >
              <Layers className="size-4" strokeWidth={1.5} />
              Generate Flashcards
            </motion.button>

            <motion.button
              onClick={() => onModeSelect("quiz")}
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 rounded-[18px] border border-[rgba(210,190,170,0.25)] bg-white/70 px-7 py-3.5 text-[14px] font-semibold text-[#2A1E17] transition-all duration-200 hover:bg-white/90 hover:border-[#D88A5B]/30 shadow-[0_4px_14px_rgba(42,33,28,0.05)]"
            >
              <Sword className="size-4 text-[#D88A5B]" strokeWidth={1.5} />
              Start Quiz
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
            {/* Outer orbital ring */}
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

            {/* Subtle glow behind cards */}
            <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-[#D88A5B]/8 to-[#C9A96E]/4 blur-[30px]" />

            {/* Floating language symbols on orbit */}
            {symbolPositions.map((sym) => (
              <motion.span
                key={sym.id}
                className="absolute text-[11px] font-serif font-semibold tracking-tight"
                style={{ color: sym.color, opacity: 0.55 }}
                animate={{
                  x: [Math.cos(sym.angle) * sym.distance * 0.5, Math.cos(sym.angle + 0.4) * sym.distance * 0.55, Math.cos(sym.angle) * sym.distance * 0.5],
                  y: [Math.sin(sym.angle) * sym.distance * 0.5, Math.sin(sym.angle + 0.4) * sym.distance * 0.55, Math.sin(sym.angle) * sym.distance * 0.5],
                  opacity: [0.35, 0.6, 0.35],
                }}
                transition={{ duration: sym.duration, delay: sym.delay, repeat: Infinity, ease: "easeInOut" }}
              >
                {sym.label}
              </motion.span>
            ))}

            {/* Card stack — 3 cards */}
            {/* Back card */}
            <motion.div
              className="absolute"
              style={{ transform: `translate(${(mousePos.x - 0.5) * -6}px, ${(mousePos.y - 0.5) * -6 + 8}px) rotate(6deg)` }}
              animate={{ rotate: [6, 3, 6], y: [8, 2, 8] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            >
              <div className="flex size-14 items-center justify-center rounded-[12px] border border-[rgba(201,169,110,0.12)] backdrop-blur-[2px]"
                style={{ background: "linear-gradient(145deg, rgba(255,252,248,0.70), rgba(248,241,234,0.60))", boxShadow: "0 4px 16px rgba(42,33,28,0.06)" }}
              >
                <span className="font-serif text-[11px] font-semibold text-[#C9A96E]/70">Hola</span>
              </div>
            </motion.div>

            {/* Middle card */}
            <motion.div
              className="absolute"
              style={{ transform: `translate(${(mousePos.x - 0.5) * -4 + 6}px, ${(mousePos.y - 0.5) * -4 + 4}px) rotate(3deg)` }}
              animate={{ rotate: [3, -1, 3], y: [4, -2, 4] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            >
              <div className="flex size-[62px] items-center justify-center rounded-[14px] border border-[rgba(216,138,91,0.14)] backdrop-blur-[2px]"
                style={{ background: "linear-gradient(145deg, rgba(255,252,248,0.80), rgba(248,241,234,0.70))", boxShadow: "0 6px 20px rgba(42,33,28,0.08)" }}
              >
                <span className="font-serif text-[13px] font-semibold text-[#D88A5B]/80">Gracias</span>
              </div>
            </motion.div>

            {/* Front card — centered, prominent */}
            <motion.div
              className="absolute z-10"
              style={{ transform: `translate(${(mousePos.x - 0.5) * 8}px, ${(mousePos.y - 0.5) * 8}px)` }}
              animate={{ y: [-4, 6, -4], rotate: [-2, 2, -2] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative">
                {/* Glow behind front card */}
                <div className="absolute -inset-2 rounded-[20px] bg-[#D88A5B]/10 blur-[12px]" />
                <div
                  className="relative flex size-[76px] items-center justify-center rounded-[18px] border border-[rgba(216,138,91,0.20)] shadow-xl"
                  style={{
                    background: "linear-gradient(145deg, rgba(255,252,248,0.97), rgba(248,241,234,0.92))",
                    boxShadow: "0 12px 40px rgba(42,33,28,0.14), 0 0 0 1px rgba(255,255,255,0.5) inset",
                  }}
                >
                  <motion.span
                    className="font-serif text-[20px] font-bold text-[#D88A5B]"
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    Bonjour
                  </motion.span>
                </div>
              </div>
            </motion.div>

            {/* Center marker — subtle */}
            <motion.div
              className="relative z-0 flex size-10 items-center justify-center rounded-full"
              style={{ background: "linear-gradient(145deg, rgba(216,138,91,0.12), rgba(201,169,110,0.06))", border: "1px solid rgba(216,138,91,0.16)" }}
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
   MODE SELECTOR — 2 BIG BUTTONS
   ────────────────────────────────────────────── */

function ModeSelector({ activeMode, onSelect }: { activeMode: ViewMode; onSelect: (mode: ViewMode) => void }) {
  return (
    <div className="mb-10 grid grid-cols-2 gap-4">
      <motion.button
        onClick={() => onSelect("flashcards")}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative overflow-hidden rounded-[24px] border-2 p-7 text-left transition-all duration-300",
          activeMode === "flashcards"
            ? "border-[#D88A5B]/40 bg-[#D88A5B]/8 shadow-[0_12px_40px_rgba(216,138,91,0.12)]"
            : "border-[rgba(210,190,170,0.20)] bg-white/60 hover:border-[#D88A5B]/25 hover:bg-white/80 hover:shadow-[0_8px_24px_rgba(42,33,28,0.06)]"
        )}
        style={activeMode === "flashcards" ? { background: "linear-gradient(135deg, rgba(216,138,91,0.10), rgba(201,169,110,0.05))" } : {}}
      >
        {activeMode === "flashcards" && (
          <motion.div layoutId="modeBg" className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-[#D88A5B]/10 blur-3xl" />
        )}
        <div className="relative z-10">
          <div className={cn("mb-4 flex size-14 items-center justify-center rounded-[16px] transition-all", activeMode === "flashcards" ? "bg-[#2A211C] shadow-lg" : "bg-[rgba(232,218,200,0.3)]")}>
            <Layers className={cn("size-6", activeMode === "flashcards" ? "text-white" : "text-[#D88A5B]")} strokeWidth={1.5} />
          </div>
          <h3 className="font-serif text-[22px] font-semibold text-[#1F1610]">Flashcards</h3>
          <p className="mt-1.5 text-[13px] text-[#6f6257]/70 leading-relaxed">Generate AI flashcards with flip animation, swipe gestures, and pronunciation.</p>
        </div>
      </motion.button>

      <motion.button
        onClick={() => onSelect("quiz")}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative overflow-hidden rounded-[24px] border-2 p-7 text-left transition-all duration-300",
          activeMode === "quiz"
            ? "border-[#D88A5B]/40 bg-[#D88A5B]/8 shadow-[0_12px_40px_rgba(216,138,91,0.12)]"
            : "border-[rgba(210,190,170,0.20)] bg-white/60 hover:border-[#D88A5B]/25 hover:bg-white/80 hover:shadow-[0_8px_24px_rgba(42,33,28,0.06)]"
        )}
        style={activeMode === "quiz" ? { background: "linear-gradient(135deg, rgba(216,138,91,0.10), rgba(201,169,110,0.05))" } : {}}
      >
        {activeMode === "quiz" && (
          <motion.div layoutId="modeBg" className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-[#D88A5B]/10 blur-3xl" />
        )}
        <div className="relative z-10">
          <div className={cn("mb-4 flex size-14 items-center justify-center rounded-[16px] transition-all", activeMode === "quiz" ? "bg-[#2A211C] shadow-lg" : "bg-[rgba(232,218,200,0.3)]")}>
            <Sword className={cn("size-6", activeMode === "quiz" ? "text-white" : "text-[#D88A5B]")} strokeWidth={1.5} />
          </div>
          <h3 className="font-serif text-[22px] font-semibold text-[#1F1610]">Quiz</h3>
          <p className="mt-1.5 text-[13px] text-[#6f6257]/70 leading-relaxed">Test your knowledge with AI-generated quizzes. Multiple question types available.</p>
        </div>
      </motion.button>
    </div>
  );
}


/* ──────────────────────────────────────────────
   LOADING STATE
   ────────────────────────────────────────────── */

function LoadingState({ message }: { message: string }) {
  const [dots] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i, x: 20 + Math.cos((i / 6) * Math.PI * 2) * 40, y: 50 + Math.sin((i / 6) * Math.PI * 2) * 30, delay: i * 0.15,
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
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <p className="font-serif text-xl font-semibold text-[#2B1B12]">Generating your study session...</p>
        <p className="mt-2 text-[13px] text-[#8d8175]/60">{message}</p>
      </motion.div>
      <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-[rgba(210,190,170,0.15)]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#D88A5B] to-[#C9A96E]"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   FLASHCARD GENERATOR FORM
   ────────────────────────────────────────────── */

function FlashcardForm({ onGenerate, isGenerating }: { onGenerate: (params: { language: Language; topic: string; count: number; level: Difficulty }) => void; isGenerating: boolean }) {
  const [language, setLanguage] = useState<Language>("english");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(10);
  const [level, setLevel] = useState<Difficulty>("B1");
  const handleSubmit = useCallback(() => {
    if (!topic.trim() || isGenerating) return;
    onGenerate({ language, topic: topic.trim(), count, level });
  }, [topic, count, level, language, isGenerating, onGenerate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[32px] border border-[rgba(210,190,170,0.18)] p-7 md:p-8"
      style={{
        background: "linear-gradient(165deg, rgba(255,250,245,0.96), rgba(250,244,235,0.92))",
        boxShadow: "0 28px 88px rgba(42,33,28,0.10), 0 0 0 1px rgba(255,255,255,0.4) inset",
      }}
    >
      <div className="pointer-events-none absolute -top-8 right-1/4 size-40 rounded-full bg-[#D88A5B]/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 left-1/5 size-32 rounded-full bg-[#C9A96E]/10 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#D88A5B]/18 to-[#C9A96E]/12 border border-[rgba(216,138,91,0.18)]">
            <Sparkles className="size-5 text-[#D88A5B]" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#1F1610]">Create Flashcards</h2>
            <p className="text-[13px] text-[#6f6257]/70">Configure your AI flashcard session</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Language */}
          <div>
            <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f6257]/60">Language</label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(LANGUAGES) as [Language, LanguageConfig][]).map(([key, lang]) => (
                <motion.button
                  key={key}
                  onClick={() => setLanguage(key)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 border",
                    language === key
                      ? "bg-[#D88A5B]/14 border-[#D88A5B]/40 text-[#D88A5B] shadow-[0_0_24px_rgba(216,138,91,0.12)]"
                      : "bg-white/45 border-[rgba(210,190,170,0.25)] text-[#6B5D52]/80 hover:border-[#D88A5B]/30 hover:text-[#4A3A2E]"
                  )}
                >
                  {lang.flag} {lang.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f6257]/60">Topic</label>
            <LuxurySearchableSelect
              value={topic}
              onChange={setTopic}
              placeholder="What would you like to study?"
              suggestions={SUGGESTED_TOPICS}
              onSubmit={handleSubmit}
            />
          </div>
        </div>

        {/* Count + Level + Generate */}
        <div className="mt-5 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f6257]/60">Card Count</label>
            <div className="flex gap-1.5 rounded-[16px] border border-[rgba(210,190,170,0.22)] bg-white/50 p-1">
              {CARD_COUNTS.map((n) => (
                <motion.button
                  key={n}
                  onClick={() => setCount(n)}
                  whileTap={{ scale: 0.95 }}
                  className={cn("relative rounded-[12px] px-4 py-2.5 text-[12px] font-semibold transition-all duration-200", count === n ? "bg-[#2A211C] text-white shadow-lg" : "text-[#6B5D52]/60 hover:text-[#2A211C]")}
                >
                  {n}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f6257]/60">Difficulty</label>
            <div className="flex gap-1.5">
              {LEVELS.map((lvl) => (
                <motion.button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex-1 rounded-[12px] px-3 py-2 text-[12px] font-semibold transition-all duration-200 border",
                    level === lvl
                      ? "bg-[#D88A5B]/14 border-[#D88A5B]/35 text-[#D88A5B] shadow-[0_0_24px_rgba(216,138,91,0.12)]"
                      : "bg-white/45 border-[rgba(210,190,170,0.16)] text-[#6B5D52]/60 hover:border-[#D88A5B]/20 hover:text-[#6B5D52]"
                  )}
                >
                  {lvl}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.button
            onClick={handleSubmit}
            disabled={!topic.trim() || isGenerating}
            whileHover={topic.trim() && !isGenerating ? { y: -3, scale: 1.02 } : {}}
            whileTap={topic.trim() && !isGenerating ? { scale: 0.97 } : {}}
            className={cn(
              "inline-flex items-center gap-2.5 rounded-[18px] px-8 py-4 text-[15px] font-semibold text-white transition-all duration-300 overflow-hidden relative group",
              isGenerating ? "opacity-70 cursor-not-allowed" : ""
            )}
            style={{ background: "linear-gradient(135deg, #2A1E17, #3D2B1F)", boxShadow: "0 12px 40px rgba(42,33,28,0.22), 0 0 0 1px rgba(255,255,255,0.10) inset" }}
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/12 to-transparent opacity-60" />
            <span className="pointer-events-none absolute -inset-full top-0 block h-full w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-white/12 to-transparent opacity-0 transition-all duration-700 group-hover:animate-[shimmer_1.5s_ease-in-out]" />

            {isGenerating ? (
              <><Loader2 className="size-4 animate-spin" strokeWidth={2} /> Generating...</>
            ) : (
              <><Sparkles className="size-4 text-[#D88A5B]" strokeWidth={1.5} /> Generate Flashcards</>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   QUIZ GENERATOR FORM
   ────────────────────────────────────────────── */

function QuizForm({ onGenerate, isGenerating }: { onGenerate: (params: { language: Language; quizType: string; topic: string; count: number; level: Difficulty }) => void; isGenerating: boolean }) {
  const [language, setLanguage] = useState<Language>("english");
  const [quizType, setQuizType] = useState("translation");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [level, setLevel] = useState<Difficulty>("B1");
  const handleSubmit = useCallback(() => {
    if (!topic.trim() || isGenerating) return;
    onGenerate({ language, quizType, topic: topic.trim(), count, level });
  }, [topic, count, level, language, quizType, isGenerating, onGenerate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[32px] border border-[rgba(210,190,170,0.18)] p-7 md:p-8"
      style={{
        background: "linear-gradient(165deg, rgba(255,250,245,0.96), rgba(250,244,235,0.92))",
        boxShadow: "0 28px 88px rgba(42,33,28,0.10), 0 0 0 1px rgba(255,255,255,0.4) inset",
      }}
    >
      <div className="pointer-events-none absolute -top-8 right-1/4 size-40 rounded-full bg-[#D88A5B]/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 left-1/5 size-32 rounded-full bg-[#C9A96E]/10 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#D88A5B]/18 to-[#C9A96E]/12 border border-[rgba(216,138,91,0.18)]">
            <Sword className="size-5 text-[#D88A5B]" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#1F1610]">Create Quiz</h2>
            <p className="text-[13px] text-[#6f6257]/70">Configure your AI-generated quiz</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Language */}
          <div>
            <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f6257]/60">Language</label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(LANGUAGES) as [Language, LanguageConfig][]).map(([key, lang]) => (
                <motion.button
                  key={key}
                  onClick={() => setLanguage(key)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 border",
                    language === key
                      ? "bg-[#D88A5B]/14 border-[#D88A5B]/40 text-[#D88A5B] shadow-[0_0_24px_rgba(216,138,91,0.12)]"
                      : "bg-white/45 border-[rgba(210,190,170,0.25)] text-[#6B5D52]/80 hover:border-[#D88A5B]/30 hover:text-[#4A3A2E]"
                  )}
                >
                  {lang.flag} {lang.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Quiz Type */}
          <div>
            <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f6257]/60">Quiz Type</label>
            <div className="flex flex-wrap gap-2">
              {QUIZ_TYPES.map((qt) => {
                const Icon = qt.icon;
                return (
                  <motion.button
                    key={qt.key}
                    onClick={() => setQuizType(qt.key)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-medium transition-all duration-200 border",
                      quizType === qt.key
                        ? "bg-[#D88A5B]/14 border-[#D88A5B]/40 text-[#D88A5B] shadow-[0_0_24px_rgba(216,138,91,0.12)]"
                        : "bg-white/45 border-[rgba(210,190,170,0.25)] text-[#6B5D52]/80 hover:border-[#D88A5B]/30 hover:text-[#4A3A2E]"
                    )}
                  >
                    <Icon className="size-3" strokeWidth={1.8} />
                    {qt.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Topic */}
        <div className="mt-5">
          <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f6257]/60">Topic</label>
          <LuxurySearchableSelect
            value={topic}
            onChange={setTopic}
            placeholder="What topic should the quiz cover?"
            suggestions={SUGGESTED_TOPICS}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Count + Level + Generate */}
        <div className="mt-5 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f6257]/60">Questions</label>
            <div className="flex gap-1.5 rounded-[16px] border border-[rgba(210,190,170,0.22)] bg-white/50 p-1">
              {QUIZ_COUNTS.map((n) => (
                <motion.button
                  key={n}
                  onClick={() => setCount(n)}
                  whileTap={{ scale: 0.95 }}
                  className={cn("relative rounded-[12px] px-4 py-2.5 text-[12px] font-semibold transition-all duration-200", count === n ? "bg-[#2A211C] text-white shadow-lg" : "text-[#6B5D52]/60 hover:text-[#2A211C]")}
                >
                  {n}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f6257]/60">Difficulty</label>
            <div className="flex gap-1.5">
              {LEVELS.map((lvl) => (
                <motion.button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex-1 rounded-[12px] px-3 py-2 text-[12px] font-semibold transition-all duration-200 border",
                    level === lvl
                      ? "bg-[#D88A5B]/14 border-[#D88A5B]/35 text-[#D88A5B] shadow-[0_0_24px_rgba(216,138,91,0.12)]"
                      : "bg-white/45 border-[rgba(210,190,170,0.16)] text-[#6B5D52]/60 hover:border-[#D88A5B]/20 hover:text-[#6B5D52]"
                  )}
                >
                  {lvl}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.button
            onClick={handleSubmit}
            disabled={!topic.trim() || isGenerating}
            whileHover={topic.trim() && !isGenerating ? { y: -3, scale: 1.02 } : {}}
            whileTap={topic.trim() && !isGenerating ? { scale: 0.97 } : {}}
            className={cn(
              "inline-flex items-center gap-2.5 rounded-[18px] px-8 py-4 text-[15px] font-semibold text-white transition-all duration-300 overflow-hidden relative group",
              isGenerating ? "opacity-70 cursor-not-allowed" : ""
            )}
            style={{ background: "linear-gradient(135deg, #2A1E17, #3D2B1F)", boxShadow: "0 12px 40px rgba(42,33,28,0.22), 0 0 0 1px rgba(255,255,255,0.10) inset" }}
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/12 to-transparent opacity-60" />
            <span className="pointer-events-none absolute -inset-full top-0 block h-full w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-white/12 to-transparent opacity-0 transition-all duration-700 group-hover:animate-[shimmer_1.5s_ease-in-out]" />

            {isGenerating ? (
              <><Loader2 className="size-4 animate-spin" strokeWidth={2} /> Generating...</>
            ) : (
              <><Sparkles className="size-4 text-[#D88A5B]" strokeWidth={1.5} /> Generate Quiz</>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   3D FLASH CARD
   ────────────────────────────────────────────── */

function FlipCard({
  card,
  onSwipe,
  onPronounce,
  index,
  total,
}: {
  card: FlashCard;
  onSwipe: (direction: SwipeDirection) => void;
  onPronounce: () => void;
  index: number;
  total: number;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFavored, setIsFavored] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const [exitX, setExitX] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const rightOpacity = useTransform(x, (v) => (v > 50 ? Math.min(v / 150, 1) : 0));
  const leftOpacity = useTransform(x, (v) => (v < -50 ? Math.min(Math.abs(v) / 150, 1) : 0));

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current || isFlipped) return;
    const rect = cardRef.current.getBoundingClientRect();
    setRotateX((e.clientY - rect.top - rect.height / 2) / 20);
    setRotateY((e.clientX - rect.left - rect.width / 2) / 20);
  }, [isFlipped]);

  const handleMouseLeave = useCallback(() => { setRotateX(0); setRotateY(0); }, []);

  const handleDragEnd = useCallback(
    (_e: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
      const threshold = 100;
      const { x: dx } = info.offset;
      if (dx > threshold) { setIsExiting(true); setExitX(500); setTimeout(() => onSwipe("right"), 300); }
      else if (dx < -threshold) { setIsExiting(true); setExitX(-500); setTimeout(() => onSwipe("left"), 300); }
    },
    [onSwipe]
  );

  const handleKeyboard = useCallback(
    (e: KeyboardEvent) => {
      if (!cardRef.current) return;
      switch (e.key) {
        case "ArrowLeft": setIsExiting(true); setExitX(-500); setTimeout(() => onSwipe("left"), 300); break;
        case "ArrowRight": setIsExiting(true); setExitX(500); setTimeout(() => onSwipe("right"), 300); break;
        case " ": e.preventDefault(); setIsFlipped((f) => !f); break;
      }
    },
    [onSwipe]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [handleKeyboard]);

  if (isExiting) return null;

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[520px] select-none"
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: exitX, scale: 0.85, rotate: exitX > 0 ? 12 : -12 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Swipe indicators */}
      <motion.div className="pointer-events-none absolute -left-4 top-1/2 z-20 -translate-y-1/2" style={{ opacity: leftOpacity }}>
        <div className="flex items-center gap-2 rounded-full border border-[#D88A5B]/40 bg-[#D88A5B]/15 px-4 py-2 backdrop-blur-md shadow-lg">
          <BookOpen className="size-4 text-[#D88A5B]" strokeWidth={2} />
          <span className="text-[13px] font-bold text-[#D88A5B]">PRACTICE</span>
        </div>
      </motion.div>

      <motion.div className="pointer-events-none absolute -right-4 top-1/2 z-20 -translate-y-1/2" style={{ opacity: rightOpacity }}>
        <div className="flex items-center gap-2 rounded-full border border-[#8B9D83]/40 bg-[#8B9D83]/15 px-4 py-2 backdrop-blur-md shadow-lg">
          <Check className="size-4 text-[#8B9D83]" strokeWidth={2.5} />
          <span className="text-[13px] font-bold text-[#8B9D83]">KNOWN</span>
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div
        ref={cardRef}
        className="relative cursor-grab active:cursor-grabbing"
        style={{ perspective: "1200px", x, rotate }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Shadow */}
        <div className="absolute inset-0 rounded-[32px] transition-all duration-300" style={{ background: "rgba(42,33,28,0.06)", filter: "blur(16px)", transform: "translateY(12px) scale(0.96)" }} />

        {/* 3D Flip Container */}
        <motion.div
          className="relative"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY + (isFlipped ? 180 : 0)}deg)`,
            transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* ─── FRONT ─── */}
          <div
            className="relative overflow-hidden rounded-[32px]"
            style={{
              backfaceVisibility: "hidden",
              background: "linear-gradient(180deg, rgba(255,252,248,0.98), rgba(248,241,234,0.95))",
              border: "1px solid rgba(205,170,140,0.18)",
              boxShadow: "0 16px 48px rgba(84,56,36,0.10), 0 0 0 1px rgba(255,255,255,0.5) inset",
            }}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[#D88A5B]/8 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 size-32 rounded-full bg-[#C9A96E]/6 blur-3xl" />

            {/* Progress */}
            <div className="absolute left-6 right-6 top-4 z-10 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-[rgba(210,190,170,0.25)]">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-[#D88A5B] to-[#C9A96E]" initial={{ width: 0 }} animate={{ width: `${((index + 1) / total) * 100}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
              </div>
              <span className="text-[11px] font-semibold text-[#8d8175]/50">{index + 1}/{total}</span>
            </div>

            {/* Favorite */}
            <motion.button
              onClick={(e) => { e.stopPropagation(); setIsFavored(!isFavored); }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              className={cn("absolute right-5 top-12 z-20 flex size-9 items-center justify-center rounded-full transition-all duration-200 border",
                isFavored ? "bg-[rgba(216,138,91,0.16)] text-[#D88A5B] border-[rgba(216,138,91,0.25)]" : "bg-[rgba(255,248,243,0.94)] text-[#8A5A3B]/55 hover:text-[#D88A5B] hover:bg-[rgba(216,138,91,0.12)] border-[rgba(196,154,120,0.20)]"
              )}
            >
              <Heart className={cn("size-[18px]", isFavored && "fill-[#D88A5B]")} strokeWidth={1.5} />
            </motion.button>

            {/* Difficulty badge */}
            <div className="absolute left-5 top-12 z-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(216,138,91,0.10)] border border-[rgba(216,138,91,0.18)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#D88A5B]">
                <GraduationCap className="size-3" strokeWidth={2} /> {card.difficulty}
              </div>
            </div>

            {/* Card content */}
            <div className="relative px-8 pb-10 pt-24">
              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-center font-serif text-[52px] font-bold tracking-tight text-[#241811] leading-[0.95]"
              >
                {card.word}
              </motion.h2>

              {card.transcription && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                  className="mt-3 text-center text-[16px] text-[#8d8175]/60 font-medium tracking-wide"
                >
                  {card.transcription}
                </motion.p>
              )}

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="mx-auto mt-6 max-w-xs rounded-[16px] border border-[rgba(205,170,140,0.18)] bg-[rgba(255,248,243,0.7)] px-5 py-3"
              >
                <p className="text-center text-[17px] text-[#3D2B1F]/90 font-medium">{card.translation}</p>
              </motion.div>

              {/* Audio button */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-6 flex items-center justify-center">
                <motion.button
                  onClick={(e) => { e.stopPropagation(); onPronounce(); }}
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.92 }}
                  className="flex size-14 items-center justify-center rounded-full transition-all duration-200 shadow-lg"
                  style={{ background: "linear-gradient(135deg, #2A1E17, #3D2B1F)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 12px 32px rgba(42,33,28,0.24)" }}
                >
                  <Volume2 className="size-5 text-white" strokeWidth={1.5} />
                </motion.button>
              </motion.div>

              <p className="mt-5 text-center text-[11px] text-[#8d8175]/30">Tap to flip • Swipe or ← → to navigate</p>
            </div>
          </div>

          {/* ─── BACK ─── */}
          <div
            className="absolute inset-0 overflow-hidden rounded-[32px]"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "linear-gradient(180deg, rgba(255,252,248,0.98), rgba(248,241,234,0.95))",
              border: "1px solid rgba(205,170,140,0.18)",
              boxShadow: "0 16px 48px rgba(84,56,36,0.10), 0 0 0 1px rgba(255,255,255,0.5) inset",
            }}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[#D88A5B]/8 blur-3xl" />

            <div className="relative px-8 pb-8 pt-10">
              <p className="text-center font-serif text-[28px] font-bold text-[#241811]">{card.word}</p>
              <p className="mt-1 text-center text-[15px] text-[#8d8175]/60">{card.translation}</p>

              {/* Example */}
              {card.example && (
                <div className="mx-auto mt-6 max-w-sm rounded-[16px] border border-[rgba(205,170,140,0.16)] bg-[rgba(255,248,243,0.7)] px-5 py-4">
                  <div className="flex items-start gap-2">
                    <Quote className="size-4 mt-0.5 shrink-0 text-[#D88A5B]/40" strokeWidth={1.5} />
                    <div>
                      <p className="text-[14px] italic leading-relaxed text-[#3D2B1F]/80">{card.example}</p>
                      {card.example_translation && <p className="mt-1.5 text-[12px] text-[#8d8175]/60">{card.example_translation}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {card.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {card.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-[rgba(232,218,200,0.45)] px-3 py-1 text-[12px] font-medium text-[#5A4A3E] border border-[rgba(205,170,140,0.15)]">#{tag}</span>
                  ))}
                </div>
              )}

              {/* Audio on back */}
              <div className="mt-6 flex justify-center">
                <motion.button
                  onClick={(e) => { e.stopPropagation(); onPronounce(); }}
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.92 }}
                  className="flex size-12 items-center justify-center rounded-full transition-all duration-200 shadow-lg"
                  style={{ background: "linear-gradient(135deg, #2A1E17, #3D2B1F)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 12px 32px rgba(42,33,28,0.24)" }}
                >
                  <Volume2 className="size-5 text-white" strokeWidth={1.5} />
                </motion.button>
              </div>

              <p className="mt-4 text-center text-[11px] text-[#8d8175]/30">Tap to flip back</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Action buttons */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 flex items-center justify-center gap-4">
        <motion.button
          onClick={() => { setIsExiting(true); setExitX(-500); setTimeout(() => onSwipe("left"), 300); }}
          whileHover={{ scale: 1.06, y: -3 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2.5 rounded-[16px] border border-[#D88A5B]/25 bg-[#D88A5B]/8 px-6 py-3 text-[13px] font-semibold text-[#D88A5B] transition-all hover:shadow-[0_8px_24px_rgba(216,138,91,0.15)]"
        >
          <BookOpen className="size-4" strokeWidth={2} />
          Practice
        </motion.button>

        <motion.button
          onClick={() => { setIsExiting(true); setExitX(500); setTimeout(() => onSwipe("right"), 300); }}
          whileHover={{ scale: 1.06, y: -3 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2.5 rounded-[16px] border border-[#8B9D83]/25 bg-[#8B9D83]/8 px-6 py-3 text-[13px] font-semibold text-[#8B9D83] transition-all hover:shadow-[0_8px_24px_rgba(139,157,131,0.15)]"
        >
          <Check className="size-4" strokeWidth={2.5} />
          Known
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   FLASHCARD PLAYER
   ────────────────────────────────────────────── */

function FlashcardPlayer({
  cards,
  onSwipe,
  onPronounce,
  onBack,
}: {
  cards: FlashCard[];
  onSwipe: (card: FlashCard, direction: SwipeDirection) => void;
  onPronounce: (card: FlashCard) => void;
  onBack: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [practiceCount, setPracticeCount] = useState(0);

  const handleSwipe = useCallback((direction: SwipeDirection) => {
    if (currentIndex >= cards.length) return;
    onSwipe(cards[currentIndex], direction);
    if (direction === "right") setKnownCount((c) => c + 1);
    else setPracticeCount((c) => c + 1);
    setCurrentIndex((i) => Math.min(i + 1, cards.length));
  }, [currentIndex, cards, onSwipe]);

  const handlePronounce = useCallback(() => {
    if (currentIndex < cards.length) onPronounce(cards[currentIndex]);
  }, [currentIndex, cards, onPronounce]);

  if (currentIndex >= cards.length) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-20">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="relative mb-6"
        >
          <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-[#D88A5B]/14 to-[#C9A96E]/8 border border-[rgba(216,138,91,0.16)]">
            <Trophy className="size-10 text-[#C9A96E]" strokeWidth={1.5} />
          </div>
        </motion.div>
        <h3 className="font-serif text-2xl font-semibold text-[#2B1B12]">Session Complete!</h3>
        <p className="mt-2 text-[14px] text-[#8d8175]/65">You reviewed all {cards.length} cards.</p>
        <div className="mt-8 flex gap-8">
          <div className="text-center">
            <p className="text-[28px] font-bold text-[#8B9D83]">{knownCount}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8d8175]/60">Known</p>
          </div>
          <div className="text-center">
            <p className="text-[28px] font-bold text-[#D88A5B]">{practiceCount}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8d8175]/60">To Practice</p>
          </div>
        </div>
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.97 }}
          className="mt-8 inline-flex items-center gap-2 rounded-[18px] bg-[#2A211C] px-8 py-3.5 text-[15px] font-semibold text-white shadow-lg transition-all hover:bg-[#3D2B1F] hover:shadow-[0_12px_32px_rgba(42,33,28,0.20)]"
        >
          <RefreshCw className="size-4" strokeWidth={2} />
          New Session
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="font-serif text-2xl font-semibold text-[#2B1B12]">Review Session</h2>
        <p className="mt-1 text-[13px] text-[#8d8175]/60">Swipe right if known, left to practice</p>
      </div>

      <div className="relative min-h-[500px]">
        {[1, 2].map((stackIdx) => {
          if (currentIndex + stackIdx >= cards.length) return null;
          return (
            <div key={`stack-${currentIndex + stackIdx}`}
              className="pointer-events-none absolute inset-0 mx-auto w-full max-w-[520px]"
              style={{ top: stackIdx * 6, transform: `scale(${1 - stackIdx * 0.03})`, opacity: 0.4 - stackIdx * 0.15, zIndex: -stackIdx }}
            >
              <div className="h-full min-h-[450px] rounded-[32px] border border-[rgba(205,170,140,0.10)]" style={{ background: "linear-gradient(165deg, rgba(255,255,255,0.40), rgba(250,246,240,0.25))" }} />
            </div>
          );
        })}

        <AnimatePresence mode="popLayout">
          <FlipCard
            key={currentIndex}
            card={cards[currentIndex]}
            onSwipe={handleSwipe}
            onPronounce={handlePronounce}
            index={currentIndex}
            total={cards.length}
          />
        </AnimatePresence>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 flex items-center justify-center gap-6 text-[11px] text-[#8d8175]/30">
        <span className="flex items-center gap-1.5"><Keyboard className="size-3" strokeWidth={1.5} /> ← → to swipe</span>
        <span className="flex items-center gap-1.5"><Keyboard className="size-3" strokeWidth={1.5} /> Space to flip</span>
      </motion.div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   QUIZ EXPERIENCE — REDESIGNED
   ────────────────────────────────────────────── */

function QuizPlayer({
  questions,
  onBack,
}: {
  questions: QuizQuestion[];
  onBack: () => void;
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleAnswer = useCallback((answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);
    if (answer === questions[currentQ].correctAnswer) {
      setScore((s) => s + 1);
    }
  }, [isAnswered, questions, currentQ]);

  const nextQuestion = useCallback(() => {
    if (currentQ + 1 >= questions.length) {
      setQuizFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setCurrentQ((q) => q + 1);
    setSelectedAnswer(null);
    setIsAnswered(false);
  }, [currentQ, questions]);

  /* ─── RESULTS SCREEN ─── */
  if (quizFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-12">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }} className="relative mb-6">
          <div className={cn("flex size-24 items-center justify-center rounded-full border-2",
            percentage >= 80 ? "border-[#8B9D83]/40 bg-[#8B9D83]/10" : percentage >= 50 ? "border-[#C9A96E]/40 bg-[#C9A96E]/10" : "border-[#D88A5B]/40 bg-[#D88A5B]/10"
          )}>
            {percentage >= 80 ? <Trophy className="size-10 text-[#8B9D83]" strokeWidth={1.5} /> : percentage >= 50 ? <Trophy className="size-10 text-[#C9A96E]" strokeWidth={1.5} /> : <Brain className="size-10 text-[#D88A5B]" strokeWidth={1.5} />}
          </div>
        </motion.div>
        <h3 className="font-serif text-2xl font-semibold text-[#2B1B12]">{percentage >= 80 ? "Outstanding!" : percentage >= 50 ? "Good Effort!" : "Keep Practicing!"}</h3>
        <div className="mt-6 flex gap-8">
          <div className="text-center">
            <p className="text-[36px] font-bold text-[#2B1B12]">{score}/{questions.length}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8d8175]/60">Correct</p>
          </div>
          <div className="text-center">
            <p className="text-[36px] font-bold text-[#D88A5B]">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8d8175]/60">Time</p>
          </div>
        </div>
        <div className="mt-6 h-2 w-64 overflow-hidden rounded-full bg-[rgba(210,190,170,0.2)]">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-[#D88A5B] to-[#8B9D83]" initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
        </div>
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.97 }}
          className="mt-8 inline-flex items-center gap-2 rounded-[18px] bg-[#2A211C] px-8 py-3.5 text-[15px] font-semibold text-white shadow-lg transition-all hover:bg-[#3D2B1F]"
        >
          <RefreshCw className="size-4" strokeWidth={2} />
          New Quiz
        </motion.button>
      </motion.div>
    );
  }

  const q = questions[currentQ];
  const isTranslation = q.sourceWord && q.sourceLanguage && q.targetLanguage;

  return (
    <div className="notranslate mx-auto max-w-[580px]" translate="no">
      {/* ─── Progress bar + Score + Timer ─── */}
      <div className="mb-8 flex items-center gap-4">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[rgba(210,190,170,0.2)]">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-[#D88A5B] to-[#C9A96E]" initial={{ width: 0 }} animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
        <span className="text-[12px] font-semibold text-[#8d8175]/50">{currentQ + 1}/{questions.length}</span>
        <span className="text-[12px] text-[#8d8175]/40"><Timer className="mr-1 inline size-3" strokeWidth={1.5} />{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}</span>
      </div>

      {/* Score */}
      <div className="mb-5 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#8B9D83]/8 border border-[#8B9D83]/20 px-4 py-1.5 text-[12px] font-semibold text-[#8B9D83]">
          <Check className="size-3" strokeWidth={2.5} /> Score: {score}/{currentQ + (isAnswered ? 0 : 0)}
        </span>
      </div>

      {/* ─── Question card ─── */}
      <motion.div
        key={currentQ}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative overflow-hidden rounded-[28px] border border-[rgba(210,190,170,0.18)] p-8"
        style={{ background: "linear-gradient(165deg, rgba(255,252,248,0.97), rgba(248,241,234,0.94))", boxShadow: "0 16px 48px rgba(84,56,36,0.08), 0 0 0 1px rgba(255,255,255,0.4) inset" }}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[#D88A5B]/6 blur-3xl" />

        <div className="relative z-10">
          {/* Difficulty badge */}
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-[rgba(216,138,91,0.10)] border border-[rgba(216,138,91,0.18)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#D88A5B]">
            <GraduationCap className="size-3" strokeWidth={2} /> {q.difficulty}
          </div>

          {isTranslation ? (
            /* ─── TRANSLATION QUIZ LAYOUT ─── */
            <div className="text-center">
              {/* Language direction label */}
              <div className="notranslate mb-2 inline-flex items-center gap-2 rounded-full bg-[rgba(232,218,200,0.25)] border border-[rgba(210,190,170,0.15)] px-3.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-[#6f6257]/70" translate="no">
                <span>{q.sourceLanguage}</span>
                <ArrowRight className="size-3" strokeWidth={2} />
                <span>{q.targetLanguage}</span>
              </div>

              {/* Instruction label */}
              <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.12em] text-[#8d8175]/50">
                Translate the word
              </p>

              {/* Large source word */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="notranslate font-serif text-[56px] font-bold leading-[0.95] tracking-tight text-[#241811]"
                translate="no"
              >
                {q.sourceWord}
              </motion.h2>
            </div>
          ) : (
            /* ─── OTHER QUIZ TYPES ─── */
            <div>
              <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.12em] text-[#8d8175]/50">
                Question
              </p>
              <h3 className="font-serif text-[22px] font-semibold leading-snug text-[#2B1B12]">{q.question}</h3>
            </div>
          )}

          {/* ─── OPTIONS ─── */}
          <div className={cn("grid gap-3", isTranslation ? "mt-8" : "mt-6")}>
            {q.options.map((option, idx) => {
              const isCorrect = option === q.correctAnswer;
              const isSelected = selectedAnswer === option;
              let optionStyle = "border-[rgba(210,190,170,0.2)] bg-white/50 text-[#2B1B12] hover:border-[#D88A5B]/30 hover:shadow-[0_4px_16px_rgba(216,138,91,0.08)] hover:bg-white/70";

              if (isAnswered) {
                if (isCorrect) optionStyle = "border-[#8B9D83]/40 bg-[#8B9D83]/12 text-[#2B1B12] shadow-[0_0_28px_rgba(139,157,131,0.18)]";
                else if (isSelected) optionStyle = "border-[#D88A5B]/35 bg-[#D88A5B]/10 text-[#2B1B12]";
                else optionStyle = "border-[rgba(210,190,170,0.12)] bg-white/30 text-[#8d8175]/50";
              }

              return (
                <motion.button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  whileHover={!isAnswered ? { scale: 1.015, y: -1 } : {}}
                  whileTap={!isAnswered ? { scale: 0.98 } : {}}
                  disabled={isAnswered}
                  className={cn("group relative flex items-center gap-4 rounded-[16px] border px-5 py-4 text-left text-[15px] font-medium transition-all duration-200", optionStyle)}
                >
                  {/* Icon */}
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-[11px] text-[13px] font-bold transition-all duration-200",
                    isAnswered && isCorrect
                      ? "bg-[#8B9D83]/20 text-[#8B9D83]"
                      : isAnswered && isSelected
                      ? "bg-[#D88A5B]/20 text-[#D88A5B]"
                      : "bg-[rgba(210,190,170,0.12)] text-[#8d8175] group-hover:bg-[rgba(216,138,91,0.10)] group-hover:text-[#D88A5B]"
                  )}>
                    {isAnswered && isCorrect
                      ? <Check className="size-[18px]" strokeWidth={2.5} />
                      : isAnswered && isSelected
                      ? <X className="size-[18px]" strokeWidth={2.5} />
                      : String.fromCharCode(65 + idx)}
                  </span>

                  {/* Option text */}
                  <span
                    className={cn("notranslate flex-1",
                    isAnswered && isCorrect ? "font-semibold" : "",
                    isAnswered && isSelected && !isCorrect ? "" : ""
                    )}
                    translate="no"
                  >
                    {option}
                  </span>

                  {/* Correct glow trail */}
                  {isAnswered && isCorrect && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 rounded-[16px] ring-2 ring-[#8B9D83]/30 ring-offset-2 ring-offset-[rgba(255,255,255,0.5)]"
                    />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 rounded-[16px] ring-2 ring-[#D88A5B]/30 ring-offset-2 ring-offset-[rgba(255,255,255,0.5)]"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* ─── Next button ─── */}
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex justify-center"
            >
              <motion.button
                onClick={nextQuestion}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 rounded-[18px] bg-[#2A211C] px-8 py-3.5 text-[14px] font-semibold text-white transition-all hover:bg-[#3D2B1F] shadow-[0_8px_24px_rgba(42,33,28,0.18)]"
              >
                {currentQ + 1 >= questions.length ? "See Results" : "Next Question"}
                <ArrowRight className="size-4" strokeWidth={2} />
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   COLLECTION COUNTERS
   ────────────────────────────────────────────── */

function CollectionCounters({
  learning,
  known,
  favorite,
}: {
  learning: number;
  known: number;
  favorite: number;
}) {
  return (
    <div className="mb-10 grid grid-cols-3 gap-3">
      <div className="rounded-[16px] border border-[rgba(210,190,170,0.18)] bg-white/60 p-4 text-center">
        <p className="text-[22px] font-bold text-[#D88A5B]">{learning}</p>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8d8175]/50">
          <BookOpen className="mr-1 inline size-3" strokeWidth={1.5} />
          Learning
        </p>
      </div>
      <div className="rounded-[16px] border border-[rgba(210,190,170,0.18)] bg-white/60 p-4 text-center">
        <p className="text-[22px] font-bold text-[#8B9D83]">{known}</p>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8d8175]/50">
          <Check className="mr-1 inline size-3" strokeWidth={2} />
          Known
        </p>
      </div>
      <div className="rounded-[16px] border border-[rgba(210,190,170,0.18)] bg-white/60 p-4 text-center">
        <p className="text-[22px] font-bold text-[#D88A5B]/70">{favorite}</p>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8d8175]/50">
          <Heart className="mr-1 inline size-3" strokeWidth={1.5} />
          Favorites
        </p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   SESSION SUMMARY MODAL
   ────────────────────────────────────────────── */

function SessionSummary({
  known,
  practice,
  total,
  onBack,
}: {
  known: number;
  practice: number;
  total: number;
  onBack: () => void;
}) {
  const accuracy = total > 0 ? Math.round((known / total) * 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto max-w-md text-center py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="relative mb-6"
      >
        <div className="flex size-24 items-center justify-center mx-auto rounded-full bg-gradient-to-br from-[#D88A5B]/14 to-[#C9A96E]/8 border border-[rgba(216,138,91,0.16)]">
          <Trophy className="size-10 text-[#C9A96E]" strokeWidth={1.5} />
        </div>
      </motion.div>

      <h3 className="font-serif text-2xl font-semibold text-[#2B1B12]">Session Complete</h3>
      <p className="mt-2 text-[14px] text-[#8d8175]/65">You reviewed {total} cards.</p>

      <div className="mt-8 flex gap-8 justify-center">
        <div className="text-center">
          <p className="text-[32px] font-bold text-[#8B9D83]">{known}</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8d8175]/60">Known</p>
        </div>
        <div className="text-center">
          <p className="text-[32px] font-bold text-[#D88A5B]">{practice}</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8d8175]/60">To Practice</p>
        </div>
      </div>

      <div className="mx-auto mt-6 h-2 w-48 overflow-hidden rounded-full bg-[rgba(210,190,170,0.2)]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#D88A5B] to-[#8B9D83]"
          initial={{ width: 0 }}
          animate={{ width: `${accuracy}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <motion.button
        onClick={onBack}
        whileHover={{ scale: 1.03, y: -3 }}
        whileTap={{ scale: 0.97 }}
        className="mt-8 inline-flex items-center gap-2 rounded-[18px] bg-[#2A211C] px-8 py-3.5 text-[15px] font-semibold text-white shadow-lg transition-all hover:bg-[#3D2B1F]"
      >
        <RefreshCw className="size-4" strokeWidth={2} />
        New Session
      </motion.button>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────────── */

export default function FlashcardsPage() {
  const tts = usePremiumTts({ speed: 1.0 });
  const supabase = useMemo(() => createClient(), []);

  const [activeMode, setActiveMode] = useState<ViewMode>("flashcards");
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  // Counters — synced with DB
  const [counts, setCounts] = useState({ learning: 0, known: 0, favorite: 0 });
  const [sessionStats, setSessionStats] = useState({ known: 0, practice: 0 });

  // Fetch collection counts from DB
  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/vocabulary/counts");
      if (res.ok) {
        const data = await res.json();
        setCounts(data);
      }
    } catch { /* ignore */ }
  }, []);

  // Fetch counts on mount
  useEffect(() => { fetchCounts(); }, []); // eslint-disable-line

  // Save flashcards to vocabulary DB after generation
  const saveCardsToDb = useCallback(async (generatedCards: FlashCard[], lang: Language) => {
    try {
      const words = generatedCards.map((c) => ({
        word: c.word,
        translation: c.translation,
        transcription: c.transcription || null,
        example: c.example || null,
        language: lang,
        level: c.difficulty,
        tags: c.tags || [],
      }));

      const res = await fetch("/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words }),
      });

      if (res.ok) {
        toast.success(`${words.length} cards saved to your vocabulary`, { duration: 3000 });
        fetchCounts();
      }
    } catch (err) {
      console.error("Failed to save to vocabulary:", err);
    }
  }, [fetchCounts]);

  // Update card status in DB with SM-2 spaced repetition
  const updateCardStatus = useCallback(async (card: FlashCard, newStatus: "learning" | "known") => {
    try {
      // Find the word id by word + language
      const findRes = await fetch(`/api/vocabulary?word=${encodeURIComponent(card.word)}&language=${"english"}`);
      const findData = await findRes.json();
      const foundWord = findData.words?.find(
        (w: { word: string; language: string; id: string; ease_factor?: number; interval_days?: number; correct_count?: number; review_count?: number; mastery_level?: number }) =>
          w.word.toLowerCase() === card.word.toLowerCase()
      );

      if (foundWord?.id) {
        // Apply SM-2 algorithm
        const sm2Result = applySm2({
          correct: newStatus === "known",
          currentEaseFactor: foundWord.ease_factor,
          currentIntervalDays: foundWord.interval_days,
          currentCorrectCount: foundWord.correct_count,
          currentReviewCount: foundWord.review_count,
          currentMasteryLevel: foundWord.mastery_level,
        });

        await fetch("/api/vocabulary", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: foundWord.id,
            status: sm2Result.status,
            mastery_level: sm2Result.masteryLevel,
            ease_factor: sm2Result.easeFactor,
            interval_days: sm2Result.intervalDays,
            next_review_at: sm2Result.nextReviewAt,
            correct_count: sm2Result.correctCount,
            review_count: sm2Result.reviewCount,
          }),
        });
      } else {
        // If not found in DB, insert it with SM-2 initial values
        await fetch("/api/vocabulary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            words: [{
              word: card.word,
              translation: card.translation,
              transcription: card.transcription || null,
              example: card.example || null,
              language: "english",
              level: card.difficulty,
              tags: card.tags || [],
            }],
          }),
        });
        // Then apply SM-2 with defaults
        const findRes2 = await fetch(`/api/vocabulary?word=${encodeURIComponent(card.word)}&language=english`);
        const findData2 = await findRes2.json();
        const foundWord2 = findData2.words?.find(
          (w: { word: string; language: string; id: string }) =>
            w.word.toLowerCase() === card.word.toLowerCase()
        );
        if (foundWord2?.id) {
          const sm2Result = applySm2({
            correct: newStatus === "known",
          });

          await fetch("/api/vocabulary", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: foundWord2.id,
              status: sm2Result.status,
              mastery_level: sm2Result.masteryLevel,
              ease_factor: sm2Result.easeFactor,
              interval_days: sm2Result.intervalDays,
              next_review_at: sm2Result.nextReviewAt,
              correct_count: sm2Result.correctCount,
              review_count: sm2Result.reviewCount,
            }),
          });
        }
      }

      fetchCounts();
    } catch (err) {
      console.error("Failed to update card status:", err);
    }
  }, [fetchCounts]);

  const handleGenerateFlashcards = useCallback(async (params: { language: Language; topic: string; count: number; level: Difficulty }) => {
    setIsGenerating(true);
    setError(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("Not authenticated");
      }

      const res = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API error: ${res.status}`);
      }

      const data = await res.json();
      if (!data.cards || data.cards.length === 0) {
        throw new Error("No cards generated. Try a different topic.");
      }

      setCards(data.cards);
      setShowPlayer(true);
      setSessionStats({ known: 0, practice: 0 });

      // Auto-save to vocabulary DB
      await saveCardsToDb(data.cards, params.language);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate flashcards");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [supabase, saveCardsToDb]);

  const handleGenerateQuiz = useCallback(async (params: { language: Language; quizType: string; topic: string; count: number; level: Difficulty }) => {
    setIsGenerating(true);
    setError(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("Not authenticated");
      }

      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API error: ${res.status}`);
      }

      const data = await res.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions generated. Try a different topic.");
      }

      setQuestions(data.questions);
      setShowQuiz(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [supabase]);

  const handleSwipe = useCallback(async (card: FlashCard, direction: SwipeDirection) => {
    const newStatus = direction === "right" ? "known" : "learning";
    // Track progress synchronously so we can check if session is complete
    let nextKnown = 0;
    let nextPractice = 0;
    setSessionStats((prev) => {
      const updated = {
        known: prev.known + (direction === "right" ? 1 : 0),
        practice: prev.practice + (direction === "left" ? 1 : 0),
      };
      nextKnown = updated.known;
      nextPractice = updated.practice;
      return updated;
    });

    // Check if all cards have been reviewed — show summary immediately
    if (cards.length > 0 && nextKnown + nextPractice >= cards.length) {
      setShowSummary(true);
    }

    // Show toast
    if (direction === "right") {
      toast.custom(
        (t) => (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-3 rounded-[16px] border border-[#8B9D83]/30 bg-white/95 px-5 py-3 shadow-[0_8px_32px_rgba(42,33,28,0.12)] backdrop-blur-xl"
          >
            <div className="flex size-8 items-center justify-center rounded-[10px] bg-[#8B9D83]/15">
              <Check className="size-4 text-[#8B9D83]" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#2B1B12]">Word mastered</p>
              <p className="text-[11px] text-[#8d8175]/60">{'"'}{card.word}{'"'} → Known</p>
            </div>
          </motion.div>
        ),
        { duration: 2000, position: "top-center" }
      );
    } else {
      toast.custom(
        (t) => (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-3 rounded-[16px] border border-[#D88A5B]/30 bg-white/95 px-5 py-3 shadow-[0_8px_32px_rgba(42,33,28,0.12)] backdrop-blur-xl"
          >
            <div className="flex size-8 items-center justify-center rounded-[10px] bg-[#D88A5B]/15">
              <BookOpen className="size-4 text-[#D88A5B]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#2B1B12]">Added to Practice</p>
              <p className="text-[11px] text-[#8d8175]/60">{'"'}{card.word}{'"'} → Learning queue</p>
            </div>
          </motion.div>
        ),
        { duration: 2000, position: "top-center" }
      );
    }

    // Sync with DB
    await updateCardStatus(card, newStatus);
  }, [updateCardStatus]);

  const handlePronounce = useCallback((card: FlashCard) => {
    if (card.word) {
      const lang: Language = card.transcription?.includes("ʒ") ? "french" : card.transcription?.includes("θ") ? "spanish" : "english";
      tts.pronounce(card.word, card.word, lang);
    }
  }, [tts]);

  const handleBack = useCallback(() => {
    setShowPlayer(false);
    setShowQuiz(false);
    setShowSummary(false);
    setCards([]);
    setQuestions([]);
    setSessionStats({ known: 0, practice: 0 });
  }, []);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: { background: "transparent", boxShadow: "none", padding: 0 },
        }}
      />
      <div className="relative min-h-screen">
        <div className="cinematic-page fixed inset-0" />
        <div className="workspace-fog fixed inset-0 pointer-events-none" />

        <div className="pointer-events-none fixed right-[8%] top-[15%] size-[700px] rounded-full bg-gradient-to-br from-[#D88A5B]/6 via-[#C9A96E]/4 to-transparent blur-[180px]" />
        <div className="pointer-events-none fixed bottom-[8%] left-[3%] size-[600px] rounded-full bg-gradient-to-tr from-[#C9A96E]/5 via-[#D88A5B]/3 to-transparent blur-[140px]" />
        <div className="pointer-events-none fixed left-[40%] top-[50%] size-[500px] rounded-full bg-[#FFF5E6]/15 blur-[120px]" />

        <FloatingDust />

        <div className="relative z-10 mx-auto max-w-5xl px-6 pt-12 pb-24">
            {/* Header */}
            <div className="mb-10 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8d8175]/45">Flashcards Studio</p>

              {(showPlayer || showQuiz || showSummary) && (
                <motion.button
                  onClick={handleBack}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(196,154,120,0.18)] bg-[rgba(255,248,243,0.94)] px-4 py-2 text-[12px] font-semibold text-[#6B5D52] transition-all hover:border-[#D88A5B]/25 shadow-[0_4px_14px_rgba(80,50,30,0.06)]"
                >
                  <RefreshCw className="size-3" strokeWidth={1.5} />
                  New Session
                </motion.button>
              )}
            </div>

            <HeroSection onModeSelect={setActiveMode} />

            {/* Collection Counters */}
            {!showPlayer && !showQuiz && !showSummary && (
              <CollectionCounters
                learning={counts.learning}
                known={counts.known}
                favorite={counts.favorite}
              />
            )}

            {/* Mode Selector (only when not in player/quiz) */}
            {!showPlayer && !showQuiz && !showSummary && (
              <ModeSelector activeMode={activeMode} onSelect={setActiveMode} />
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="mb-6 overflow-hidden rounded-[16px] border border-red-200/50 bg-red-50/50 px-5 py-3 text-sm text-red-600 backdrop-blur-sm"
                >
                  {error}
                  <button onClick={() => setError(null)} className="ml-3 font-semibold hover:underline">Dismiss</button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content */}
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <LoadingState key="loading" message={activeMode === "flashcards" ? "Creating your personalized flashcards..." : "Creating your AI-powered quiz..."} />
              ) : showSummary ? (
                <SessionSummary
                  key="summary"
                  known={sessionStats.known}
                  practice={sessionStats.practice}
                  total={cards.length}
                  onBack={handleBack}
                />
              ) : showPlayer ? (
                <FlashcardPlayer
                  key="player"
                  cards={cards}
                  onSwipe={handleSwipe}
                  onPronounce={handlePronounce}
                  onBack={handleBack}
                />
              ) : showQuiz ? (
                <QuizPlayer key="quiz" questions={questions} onBack={handleBack} />
              ) : activeMode === "flashcards" ? (
                <FlashcardForm key="flashcard-form" onGenerate={handleGenerateFlashcards} isGenerating={isGenerating} />
              ) : (
                <QuizForm key="quiz-form" onGenerate={handleGenerateQuiz} isGenerating={isGenerating} />
              )}
            </AnimatePresence>
        </div>
      </div>
    </>
  );
}
