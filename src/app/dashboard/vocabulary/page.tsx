"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  Sparkles,
  BookMarked,
  Volume2,
  Heart,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
  X,
  Check,
  Loader2,
  Library,
  Brain,
  ChevronDown,
  Trash2,
  Quote,
  Trophy,
  Gauge,
  Play,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { usePremiumTts } from "@/hooks/use-premium-tts";
import { PronounceButton, SoundwaveAnimation, BreathingDots } from "@/components/dashboard/pronounce-button";


/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */

interface VocabWord {
  id?: string;
  word: string;
  translation: string;
  transcription?: string | null;
  example?: string | null;
  level?: string;
  tags?: string[];
  language: string;
  status?: "known" | "learning" | "favorite";
  mastery_level?: number;
  created_at?: string;
}

type Language = "english" | "chinese" | "spanish" | "french";

interface LanguageConfig {
  label: string;
  flag: string;
  prompt: string;
}

const LANGUAGES: Record<Language, LanguageConfig> = {
  english: { label: "English", flag: "🇺🇸", prompt: "English with IPA transcription" },
  chinese: { label: "Chinese", flag: "🇨🇳", prompt: "Chinese with pinyin transcription" },
  spanish: { label: "Spanish", flag: "🇪🇸", prompt: "Spanish with IPA transcription" },
  french: { label: "French", flag: "🇫🇷", prompt: "French with IPA transcription" },
};

const WORD_COUNTS = [10, 20, 30, 50, 100];
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const COLORS = {
  cream: "#FFF5E6",
  champagne: "#F5E6D0",
  espresso: "#2A1E17",
  warmBrown: "#3D2B1F",
  mutedOrange: "#D88A5B",
  softGold: "#C9A96E",
  ivory: "#FBF5ED",
  warmIvory: "#F7F1E8",
  parchment: "#F0E6D0",
  sage: "#8B9D83",
  blush: "#E8C4B8",
  deepEspresso: "#1A120E",
  cardBg: "rgba(255,250,245,0.85)",
};

/* ──────────────────────────────────────────────
   DEFAULT TOPICS
   ────────────────────────────────────────────── */

const SUGGESTED_TOPICS = [
  "Daily conversation",
  "Business meetings",
  "Travel vocabulary",
  "Restaurant phrases",
  "IELTS speaking",
  "Anime & manga",
  "News & media",
  "Technology",
  "Food & cooking",
  "Emotions & feelings",
  "Academic writing",
  "Sports & fitness",
  "Nature & environment",
  "Health & medicine",
  "Social media",
  "Slang & idioms",
  "Formal letters",
  "Weather & seasons",
  "Shopping & fashion",
  "Music & arts",
];

/* ──────────────────────────────────────────────
   TTS CONTEXT SHARING — premium pronunciation
   ────────────────────────────────────────────── */

// No more old browser-only speakWord — we use the premium usePremiumTts hook
// from the main component, passed down via props.
// The PronounceButton component handles all visual micro-interactions.


/* ──────────────────────────────────────────────
   ATMOSPHERIC BACKGROUND PARTICLES
   ────────────────────────────────────────────── */

function generateParticles(length: number, minSize: number, maxSize: number, minDelay: number, maxDelay: number, minDuration: number, maxDuration: number) {
  const result: Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number; letter: string; opacity: number }> = [];
  for (let i = 0; i < length; i++) {
    result.push({
      id: i,
      x: 25 + (i * 37) % 75,
      y: 5 + (i * 53) % 90,
      size: minSize + (i * 7) % (maxSize - minSize + 1),
      delay: minDelay + (i * 3) % (maxDelay - minDelay + 1),
      duration: minDuration + (i * 11) % (maxDuration - minDuration + 1),
      letter: String.fromCharCode(65 + (i * 13) % 26),
      opacity: 0.05 + (i * 3) % 10 / 100,
    });
  }
  return result;
}

function FloatingParticles() {
  const [particles] = useState(() => generateParticles(20, 2, 6, 0, 8, 14, 30));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute font-serif"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size * 6}px`,
            color: "#D88A5B",
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -28, 14, -12, 0],
            x: [0, 12, -16, 10, 0],
            opacity: [p.opacity, p.opacity * 0.3, p.opacity * 1.5, p.opacity * 0.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {p.letter}
        </motion.span>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   DECORATIVE DIVIDER
   ────────────────────────────────────────────── */

function SectionDivider() {
  return (
    <div className="relative my-12 flex items-center gap-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(210,190,170,0.20)] to-transparent" />
      <div className="flex size-6 items-center justify-center">
        <motion.div
          className="size-1.5 rotate-45 bg-[#D88A5B]/30"
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(210,190,170,0.20)] to-transparent" />
    </div>
  );
}

/* ──────────────────────────────────────────────
   FLOATING DUST MOTES
   ────────────────────────────────────────────── */

function generateDust(length: number) {
  const result: Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number }> = [];
  for (let i = 0; i < length; i++) {
    result.push({
      id: i,
      x: (i * 41) % 100,
      y: (i * 29) % 100,
      size: 1 + (i * 5) % 3,
      delay: (i * 7) % 12,
      duration: 12 + (i * 11) % 10,
    });
  }
  return result;
}

function FloatingDust() {
  const [dust] = useState(() => generateDust(25));

  return (
    <div className="pointer-events-none fixed inset-0 ml-[220px] overflow-hidden">
      {dust.map((d) => (
        <motion.div
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            background: d.size > 2 ? "radial-gradient(circle, rgba(201,169,110,0.4) 0%, rgba(216,138,91,0.15) 100%)" : "#C9A96E",
          }}
          animate={{
            y: [0, -35, 25, -18, 0],
            x: [0, 18, -12, 10, 0],
            opacity: [0.03, 0.08, 0.02, 0.06, 0.03],
          }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   HERO SECTION
   ────────────────────────────────────────────── */

function HeroSection({ stats }: { stats: { known: number; learning: number; favorites: number; total: number } }) {
  const [floatingLetters] = useState(() =>
    "ABCDEFGH".split("").map((ch, i) => ({
      letter: ch,
      x: 25 + (i * 17) % 50,
      y: 5 + (i * 23) % 70,
      delay: i * 0.3,
      duration: 5 + (i * 7) % 4,
    }))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative mb-14 overflow-hidden rounded-[32px] border border-[rgba(210,190,170,0.18)]"
      style={{
        background: "linear-gradient(160deg, rgba(255,250,245,0.96) 0%, rgba(250,244,235,0.90) 40%, rgba(245,238,228,0.84) 100%)",
        boxShadow: "0 28px 88px rgba(42,33,28,0.12), 0 0 0 1px rgba(255,255,255,0.5) inset, 0 -1px 0 rgba(255,255,255,0.7) inset",
      }}
    >
      {/* Parchment texture */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[32px] opacity-[0.025] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='parchment'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23parchment)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating background letters */}
      <FloatingParticles />

      {/* Deep atmospheric glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 size-96 rounded-full bg-gradient-to-br from-[#D88A5B]/15 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-gradient-to-tr from-[#C9A96E]/12 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 top-1/4 size-48 rounded-full bg-[#FFF5E6]/25 blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] bottom-[10%] size-32 rounded-full bg-[#8B9D83]/8 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center px-8 py-14 md:flex-row md:justify-between md:py-18">
        {/* Left content */}
        <div className="max-w-xl text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D88A5B]/20 bg-[#D88A5B]/10 px-4 py-1.5 backdrop-blur-sm"
          >
            <Sparkles className="size-3.5 text-[#D88A5B]" strokeWidth={1.8} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#D88A5B]">AI-Powered Vocabulary</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-[48px] font-semibold leading-[0.92] tracking-tight text-[#1F1610] md:text-[64px]"
          >
            Vocabulary
            <br />
            <span className="bg-gradient-to-r from-[#D88A5B] via-[#C9A96E] to-[#D88A5B] bg-clip-text text-transparent">Vault</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[#4A3A2E]/90 md:mx-0"
          >
            Build your personal language memory with AI-powered vocabulary learning. Generate, swipe, and master words effortlessly.
          </motion.p>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start"
          >
            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              className="group relative flex items-center gap-2.5 rounded-[14px] border border-[rgba(210,190,170,0.25)] bg-white/60 px-4 py-3 backdrop-blur-sm transition-all duration-300"
              style={{ boxShadow: "0 4px 16px rgba(42,33,28,0.06)" }}
            >
              <BookOpen className="size-4 text-[#D88A5B]" strokeWidth={1.8} />
              <div>
                <p className="text-[22px] font-bold leading-none text-[#2B1B12]">{stats.total}</p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#8d8175]/55">Total</p>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              className="group relative flex items-center gap-2.5 rounded-[14px] border border-[rgba(210,190,170,0.25)] bg-white/60 px-4 py-3 backdrop-blur-sm transition-all duration-300"
              style={{ boxShadow: "0 4px 16px rgba(42,33,28,0.06)" }}
            >
              <Check className="size-4 text-[#8B9D83]" strokeWidth={2.5} />
              <div>
                <p className="text-[22px] font-bold leading-none text-[#2B1B12]">{stats.known}</p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#8d8175]/55">Known</p>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              className="group relative flex items-center gap-2.5 rounded-[14px] border border-[rgba(210,190,170,0.25)] bg-white/60 px-4 py-3 backdrop-blur-sm transition-all duration-300"
              style={{ boxShadow: "0 4px 16px rgba(42,33,28,0.06)" }}
            >
              <Brain className="size-4 text-[#C9A96E]" strokeWidth={1.8} />
              <div>
                <p className="text-[22px] font-bold leading-none text-[#2B1B12]">{stats.learning}</p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#8d8175]/55">Learning</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right decorative illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative mt-10 md:mt-0"
        >
          <div className="relative flex size-48 items-center justify-center md:size-56">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-[#D88A5B]/12 via-[#C9A96E]/8 to-transparent blur-3xl" style={{ animationDuration: "4s" }} />

            <motion.div className="absolute inset-0 rounded-full border border-[rgba(216,138,91,0.18)]" animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} />
            <motion.div className="absolute inset-[12%] rounded-full border border-dashed border-[rgba(201,169,110,0.22)]" animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} />
            <motion.div className="absolute inset-[24%] rounded-full border border-[rgba(216,138,91,0.12)]" animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }} />

            <span className="absolute -left-3 -top-2 font-serif text-3xl text-[#D88A5B]/40">S</span>
            <span className="absolute -right-2 top-6 font-serif text-2xl text-[#C9A96E]/35">P</span>
            <span className="absolute bottom-2 -left-2 font-serif text-xl text-[#8B9D83]/30">E</span>
            <span className="absolute bottom-6 right-0 font-serif text-2xl text-[#D88A5B]/30">A</span>
            <span className="absolute right-6 top-0 font-serif text-lg text-[#C9A96E]/25">K</span>
            <span className="absolute -bottom-3 left-6 font-serif text-xl text-[#8B9D83]/25">L</span>

            {floatingLetters.map(({ letter, x, y, delay, duration }) => (
                <motion.span
                  key={letter}
                  className="absolute font-serif text-lg text-[#D88A5B]/14"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  animate={{ y: [0, -18, 10, -8, 0], opacity: [0.12, 0.25, 0.08, 0.20, 0.12] }}
                  transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
                >
                  {letter}
                </motion.span>
              ))}

            <motion.div
              className="relative flex size-20 items-center justify-center rounded-full"
              style={{
                background: "linear-gradient(145deg, rgba(216,138,91,0.20), rgba(201,169,110,0.10))",
                border: "1px solid rgba(216,138,91,0.28)",
                boxShadow: "0 16px 48px rgba(216,138,91,0.20), 0 0 0 1px rgba(255,255,255,0.35) inset",
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <BookMarked className="size-8 text-[#D88A5B]" strokeWidth={1.5} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   AI GENERATOR PANEL
   ────────────────────────────────────────────── */

function AiGeneratorPanel({
  onGenerate,
  isGenerating,
}: {
  onGenerate: (params: { language: Language; topic: string; count: number; level: string }) => void;
  isGenerating: boolean;
}) {
  const [language, setLanguage] = useState<Language>("english");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(20);
  const [level, setLevel] = useState("B1");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const topicRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [focusField, setFocusField] = useState<string | null>(null);

  useEffect(() => {
    if (showSuggestions) {
      suggestionsRef.current?.scrollTo({ top: 0 });
    }
  }, [showSuggestions]);

  const handleSubmit = useCallback(() => {
    if (!topic.trim() || isGenerating) return;
    onGenerate({ language, topic: topic.trim(), count, level });
  }, [topic, count, level, language, isGenerating, onGenerate]);

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
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-20 mb-12 overflow-visible rounded-[32px] border border-[rgba(210,190,170,0.18)] transition-all duration-500"
      style={{
        background: "linear-gradient(165deg, rgba(255,250,245,0.96), rgba(250,244,235,0.92))",
        backdropFilter: "blur(18px)",
        boxShadow: "0 28px 88px rgba(42,33,28,0.10), 0 0 0 1px rgba(255,255,255,0.4) inset, 0 -1px 0 rgba(255,255,255,0.6) inset",
      }}
    >
      <div className="pointer-events-none absolute -top-8 right-1/4 size-40 rounded-full bg-[#D88A5B]/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 left-1/5 size-32 rounded-full bg-[#C9A96E]/10 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 rounded-[32px] opacity-[0.020] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 px-6 py-8 md:px-8 md:py-9">
        <div className="mb-6 flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 20, scale: 1.08 }}
            className="flex size-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#D88A5B]/18 to-[#C9A96E]/12 border border-[rgba(216,138,91,0.18)]"
          >
            <Sparkles className="size-5 text-[#D88A5B]" strokeWidth={1.5} />
          </motion.div>
          <div>
            <h2 className="font-serif text-xl font-semibold tracking-tight text-[#1F1610]">AI Vocabulary Generator</h2>
            <p className="text-[13px] text-[#8d8175]/65">Generate custom vocabulary lists powered by AI</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* Language */}
          <div>
            <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8d8175]/65">Language</label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(LANGUAGES) as [Language, LanguageConfig][]).map(([key, lang]) => (
                <motion.button
                  key={key}
                  onClick={() => setLanguage(key)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 border",
                    language === key
                      ? "bg-[#D88A5B]/14 border-[#D88A5B]/35 text-[#D88A5B] shadow-[0_0_24px_rgba(216,138,91,0.12)]"
                      : "bg-white/45 border-[rgba(210,190,170,0.22)] text-[#6B5D52]/75 hover:border-[#D88A5B]/30 hover:text-[#6B5D52] hover:bg-white/65"
                  )}
                >
                  {language === key && (
                    <motion.span layoutId="langGlow" className="absolute inset-0 rounded-full bg-[#D88A5B]/5 blur-sm" transition={{ type: "spring", stiffness: 300, damping: 25 }} />
                  )}
                  {lang.flag} {lang.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div className="md:col-span-2">
            <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8d8175]/65">Topic</label>
            <div className="relative">
              <textarea
                ref={topicRef}
                value={topic}
                onChange={(e) => { setTopic(e.target.value); setShowSuggestions(false); }}
                onFocus={() => { setShowSuggestions(!topic && true); setFocusField("topic"); }}
                onBlur={() => setFocusField(null)}
                onKeyDown={handleKeyDown}
                placeholder="What vocabulary would you like to learn?"
                rows={1}
                className={cn(
                  "w-full resize-none rounded-[16px] border bg-white/55 px-4 py-3 pr-10 text-[14px] text-[#2A211C] placeholder:text-[#2A211C]/35 transition-all duration-200 focus:outline-none",
                  focusField === "topic" ? "border-[#D88A5B]/40 ring-[4px] ring-[#D88A5B]/10" : "border-[rgba(210,190,170,0.25)]"
                )}
              />
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d8175]/40 hover:text-[#8d8175]/70 transition-colors"
              >
                <ChevronDown className={cn("size-4 transition-transform duration-200", showSuggestions && "rotate-180")} strokeWidth={2} />
              </button>

              <AnimatePresence>
                {showSuggestions && (
	                  <motion.div
	                    ref={suggestionsRef}
	                    initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
	                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
	                    exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
	                    transition={{ duration: 0.2 }}
	                    className="absolute left-0 right-0 z-[80] mt-1.5 max-h-[232px] overflow-y-auto overscroll-contain rounded-[16px] border border-[rgba(210,190,170,0.22)] bg-white/98 backdrop-blur-xl shadow-[0_22px_64px_rgba(42,33,28,0.18)]"
	                  >
                    {SUGGESTED_TOPICS.map((suggestion) => (
                      <motion.button
                        key={suggestion}
                        onClick={() => { setTopic(suggestion); setShowSuggestions(false); }}
                        whileHover={{ x: 4 }}
                        className="w-full px-4 py-2.5 text-left text-[13px] text-[#2A211C]/80 transition-colors hover:bg-[#D88A5B]/6 hover:text-[#D88A5B]"
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Word Count */}
          <div>
            <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8d8175]/65">Word Count</label>
            <div className="flex gap-1.5 rounded-[16px] border border-[rgba(210,190,170,0.22)] bg-white/50 p-1">
              {WORD_COUNTS.map((n) => (
                <motion.button
                  key={n}
                  onClick={() => setCount(n)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "relative flex-1 rounded-[12px] px-2 py-2.5 text-[12px] font-semibold transition-all duration-200",
                    count === n ? "bg-[#2A211C] text-white shadow-lg" : "text-[#6B5D52]/60 hover:text-[#2A211C] hover:bg-white/55"
                  )}
                >
                  {count === n && (
                    <motion.span layoutId="countPill" className="absolute inset-0 rounded-[12px] bg-[#2A211C]" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                  )}
                  <span className="relative z-10">{n}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Difficulty + Generate */}
        <div className="mt-6 flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8d8175]/65">Difficulty Level</label>
            <div className="flex gap-1.5">
              {LEVELS.map((lvl) => (
                <motion.button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "relative flex-1 rounded-[12px] px-3 py-2 text-[12px] font-semibold transition-all duration-200 border",
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
            whileHover={topic.trim() && !isGenerating ? { scale: 1.02, y: -3 } : {}}
            whileTap={topic.trim() && !isGenerating ? { scale: 0.97 } : {}}
            className={cn(
              "group relative inline-flex items-center gap-2.5 rounded-[18px] px-8 py-3.5 text-[15px] font-semibold tracking-tight text-white transition-all duration-300 overflow-hidden",
              isGenerating ? "opacity-70 cursor-not-allowed" : "hover:shadow-[0_28px_64px_rgba(42,33,28,0.28)]"
            )}
            style={{
              background: "linear-gradient(135deg, #2A1E17, #3D2B1F)",
              boxShadow: "0 12px 40px rgba(42,33,28,0.22), 0 0 0 1px rgba(255,255,255,0.10) inset",
            }}
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/12 to-transparent opacity-60" />
            <span className="pointer-events-none absolute -inset-full top-0 block h-full w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-white/12 to-transparent opacity-0 transition-all duration-700 group-hover:animate-[shimmer_1.5s_ease-in-out]" />

            {isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin" strokeWidth={2} />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="size-4 text-[#D88A5B]" strokeWidth={1.5} />
                Generate Vocabulary
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   SWIPEABLE VOCABULARY CARD
   ────────────────────────────────────────────── */

function SwipeableCard({
  word,
  onSwipeLeft,
  onSwipeRight,
  onFavorite,
  onPronounce,
  index,
  total,
}: {
  word: VocabWord;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onFavorite: () => void;
  onPronounce: () => void;
  index: number;
  total: number;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFavorite, setIsFavorite] = useState(word.status === "favorite");

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const cardOpacity = useTransform(x, [-300, -100, 0, 100, 300], [0.3, 0.8, 1, 0.8, 0.3]);
  const isLeft = useTransform(x, (v) => v < -50);
  const isRight = useTransform(x, (v) => v > 50);
  const leftOpacity = useTransform(isLeft, (v) => (v ? 1 : 0));
  const rightOpacity = useTransform(isRight, (v) => (v ? 1 : 0));
  const cardScale = useTransform(x, [-300, 0, 300], [0.95, 1, 0.95]);
  const dragGlowOpacity = useTransform(x, (v) => Math.abs(v) / 300 * 0.6);

  const [exitX, setExitX] = useState(0);
  const [exitY, setExitY] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const handleDragEnd = useCallback(
    (_e: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
      const threshold = 120;
      if (info.offset.x > threshold) {
        setIsExiting(true);
        setExitX(500);
        setExitY(-50);
        setTimeout(() => onSwipeRight(), 300);
      } else if (info.offset.x < -threshold) {
        setIsExiting(true);
        setExitX(-500);
        setExitY(-50);
        setTimeout(() => onSwipeLeft(), 300);
      }
    },
    [onSwipeLeft, onSwipeRight]
  );

  const handleFavoriteToggle = useCallback(() => {
    setIsFavorite(!isFavorite);
    setTimeout(() => onFavorite(), 0);
  }, [isFavorite, onFavorite]);

  if (isExiting) return null;

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[480px]"
      initial={{ opacity: 0, y: 50, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: exitX, y: exitY, scale: 0.85, rotate: exitX > 0 ? 10 : -10 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ x, rotate, opacity: cardOpacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: "grabbing" }}
    >
      {/* Swipe indicator - Left */}
      <motion.div className="pointer-events-none absolute -left-4 top-1/2 z-10 -translate-y-1/2" style={{ opacity: leftOpacity }}>
        <div className="flex items-center gap-2 rounded-full border border-[#D88A5B]/40 bg-[#D88A5B]/15 px-4 py-2 backdrop-blur-md shadow-lg">
          <BookOpen className="size-4 text-[#D88A5B]" strokeWidth={2} />
          <span className="text-[13px] font-bold text-[#D88A5B]">LEARN</span>
        </div>
      </motion.div>

      {/* Swipe indicator - Right */}
      <motion.div className="pointer-events-none absolute -right-4 top-1/2 z-10 -translate-y-1/2" style={{ opacity: rightOpacity }}>
        <div className="flex items-center gap-2 rounded-full border border-[#8B9D83]/40 bg-[#8B9D83]/15 px-4 py-2 backdrop-blur-md shadow-lg">
          <Check className="size-4 text-[#8B9D83]" strokeWidth={2.5} />
          <span className="text-[13px] font-bold text-[#8B9D83]">KNOWN</span>
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div
        className="relative cursor-grab select-none overflow-hidden rounded-[36px] transition-all duration-500"
        style={{
          background: "linear-gradient(180deg, rgba(255,252,248,0.97), rgba(248,241,234,0.94))",
          border: "1px solid rgba(205,170,140,0.18)",
          boxShadow: "0 16px 48px rgba(84,56,36,0.10), 0 0 0 1px rgba(255,255,255,0.5) inset",
          scale: cardScale,
        }}
        whileHover={{ boxShadow: "0 40px 96px rgba(84,56,36,0.16), 0 0 0 1px rgba(216,138,91,0.12) inset" }}
        onClick={() => setIsFlipped(!isFlipped)}
        layout
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-[36px] opacity-[0.016] mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Drag glow */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[36px]"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, rgba(216,138,91,0.10) 0%, transparent 70%)",
            opacity: dragGlowOpacity,
          }}
        />

        {/* Progress */}
        <div className="absolute left-6 right-6 top-4 z-10 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-[rgba(210,190,170,0.25)]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#D88A5B] to-[#C9A96E]"
              initial={{ width: 0 }}
              animate={{ width: `${((index + 1) / total) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="text-[11px] font-semibold text-[#8d8175]/50">{index + 1}/{total}</span>
        </div>

        {/* Favorite */}
        <motion.button
          onClick={(e) => { e.stopPropagation(); handleFavoriteToggle(); }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "absolute right-5 top-12 z-20 flex size-9 items-center justify-center rounded-full transition-all duration-200",
            isFavorite
              ? "bg-[rgba(216,138,91,0.16)] text-[#D88A5B] border border-[rgba(216,138,91,0.25)]"
              : "bg-[rgba(255,248,243,0.94)] text-[#8A5A3B]/55 hover:text-[#D88A5B] hover:bg-[rgba(216,138,91,0.12)] border border-[rgba(196,154,120,0.20)] shadow-[0_4px_16px_rgba(80,50,30,0.08)]"
          )}
        >
          <Heart className={cn("size-[18px]", isFavorite && "fill-[#D88A5B]")} strokeWidth={1.5} />
        </motion.button>

        <AnimatePresence mode="wait">
          {!isFlipped ? (
            /* ─── FRONT ─── */
            <motion.div key="front" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="relative px-8 pb-8 pt-16">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center font-serif text-[52px] font-bold tracking-tight text-[#241811] leading-[0.95]"
              >
                {word.word}
              </motion.h2>

              {word.transcription && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-2 text-center text-[16px] text-[#8d8175]/60 font-medium tracking-wide">
                  {word.transcription}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mx-auto mt-6 max-w-xs rounded-[16px] border border-[rgba(205,170,140,0.18)] bg-[rgba(255,248,243,0.7)] px-5 py-3"
              >
                <p className="text-center text-[17px] text-[#3D2B1F]/90 font-medium">{word.translation}</p>
              </motion.div>

              {/* Action buttons */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-6 flex items-center justify-center gap-4">
                <motion.button
                  onClick={(e) => { e.stopPropagation(); onSwipeLeft(); }}
                  whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.92 }}
                  className="flex size-11 items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    background: "rgba(255,248,243,0.94)",
                    border: "1px solid rgba(196,154,120,0.20)",
                    boxShadow: "0 4px 14px rgba(80,50,30,0.08)",
                    color: "#8A5A3B",
                  }}
                >
                  <ChevronLeft className="size-5" strokeWidth={2.5} />
                </motion.button>

                <motion.button
                  onClick={(e) => { e.stopPropagation(); onPronounce(); }}
                  whileHover={{ scale: 1.15, y: -3 }} whileTap={{ scale: 0.92 }}
                  className="flex size-14 items-center justify-center rounded-full transition-all duration-200 shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #2A1E17, #3D2B1F)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow: "0 12px 32px rgba(42,33,28,0.24), 0 0 0 1px rgba(255,255,255,0.08) inset",
                  }}
                >
                  <Volume2 className="size-5 text-white" strokeWidth={1.5} />
                </motion.button>

                <motion.button
                  onClick={(e) => { e.stopPropagation(); onSwipeRight(); }}
                  whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.92 }}
                  className="flex size-11 items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    background: "rgba(255,248,243,0.94)",
                    border: "1px solid rgba(196,154,120,0.20)",
                    boxShadow: "0 4px 14px rgba(80,50,30,0.08)",
                    color: "#8B9D83",
                  }}
                >
                  <ChevronRight className="size-5" strokeWidth={2.5} />
                </motion.button>
              </motion.div>

              <p className="mt-4 text-center text-[11px] text-[#8d8175]/30">Tap to see example & details</p>
            </motion.div>
          ) : (
            /* ─── BACK ─── */
            <motion.div key="back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="relative px-8 pb-8 pt-16">
              <p className="text-center font-serif text-[30px] font-bold text-[#241811]">{word.word}</p>

              {word.example && (
                <div className="mx-auto mt-5 max-w-sm rounded-[16px] border border-[rgba(205,170,140,0.16)] bg-[rgba(255,248,243,0.7)] px-5 py-4">
                  <div className="flex items-start gap-2">
                    <Quote className="size-4 mt-0.5 shrink-0 text-[#D88A5B]/40" strokeWidth={1.5} />
                    <p className="text-[14px] italic leading-relaxed text-[#3D2B1F]/80">{word.example}</p>
                  </div>
                </div>
              )}

              {word.tags && word.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {word.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-[rgba(232,218,200,0.45)] px-3 py-1 text-[12px] font-medium text-[#5A4A3E] border border-[rgba(205,170,140,0.15)]">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {word.level && (
                <div className="mt-4 flex justify-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D88A5B]/12 border border-[#D88A5B]/22 px-3 py-1 text-[11px] font-semibold text-[#D88A5B]">
                    <GraduationCap className="size-3" strokeWidth={2} />
                    {word.level}
                  </span>
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <motion.button
                  onClick={(e) => { e.stopPropagation(); onPronounce(); }}
                  whileHover={{ scale: 1.15, y: -3 }} whileTap={{ scale: 0.92 }}
                  className="flex size-12 items-center justify-center rounded-full transition-all duration-200 shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #2A1E17, #3D2B1F)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow: "0 12px 32px rgba(42,33,28,0.24)",
                  }}
                >
                  <Volume2 className="size-5 text-white" strokeWidth={1.5} />
                </motion.button>
              </div>

              <p className="mt-4 text-center text-[11px] text-[#8d8175]/30">Tap to go back</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   VOCABULARY STACK
   ────────────────────────────────────────────── */

function VocabStack({
  words,
  onSwipeLeft,
  onSwipeRight,
  onFavorite,
  onPronounce,
}: {
  words: VocabWord[];
  onSwipeLeft: (word: VocabWord) => void;
  onSwipeRight: (word: VocabWord) => void;
  onFavorite: (word: VocabWord) => void;
  onPronounce: (word: VocabWord) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeLeft = useCallback(() => {
    onSwipeLeft(words[currentIndex]);
    setCurrentIndex((i) => Math.min(i + 1, words.length));
  }, [currentIndex, onSwipeLeft, words]);

  const handleSwipeRight = useCallback(() => {
    onSwipeRight(words[currentIndex]);
    setCurrentIndex((i) => Math.min(i + 1, words.length));
  }, [currentIndex, onSwipeRight, words]);

  const handleFavorite = useCallback(() => {
    onFavorite(words[currentIndex]);
  }, [currentIndex, onFavorite, words]);

  const handlePronounce = useCallback(() => {
    onPronounce(words[currentIndex]);
  }, [currentIndex, onPronounce, words]);

  if (currentIndex >= words.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }} className="relative mb-6">
          <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-[#D88A5B]/14 to-[#C9A96E]/8 border border-[rgba(216,138,91,0.16)]">
            <Trophy className="size-10 text-[#C9A96E]" strokeWidth={1.5} />
          </div>
          <motion.div className="absolute -inset-2 rounded-full border border-[#8B9D83]/14" animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
        </motion.div>
        <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="font-serif text-2xl font-semibold text-[#2B1B12]">
          All done!
        </motion.h3>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-2 text-[14px] text-[#8d8175]/65">
          You&apos;ve reviewed all {words.length} words.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          onClick={() => setCurrentIndex(0)}
          whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.97 }}
          className="mt-6 rounded-[16px] bg-[#2A211C] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#3D2B1F] shadow-lg hover:shadow-[0_12px_32px_rgba(42,33,28,0.20)]"
        >
          Review Again
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="relative min-h-[500px]">
      {[1, 2].map((stackIdx) => {
        if (currentIndex + stackIdx >= words.length) return null;
        return (
          <div
            key={`stack-${currentIndex + stackIdx}`}
            className="pointer-events-none absolute inset-0 mx-auto w-full max-w-[480px]"
            style={{ top: stackIdx * 6, transform: `scale(${1 - stackIdx * 0.03})`, opacity: 0.4 - stackIdx * 0.15, zIndex: -stackIdx }}
          >
            <div
              className="h-full rounded-[36px] border border-[rgba(205,170,140,0.10)]"
              style={{ background: "linear-gradient(165deg, rgba(255,255,255,0.40), rgba(250,246,240,0.25))" }}
            />
          </div>
        );
      })}

      <AnimatePresence mode="popLayout">
        <SwipeableCard
          key={currentIndex}
          word={words[currentIndex]}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onFavorite={handleFavorite}
          onPronounce={handlePronounce}
          index={currentIndex}
          total={words.length}
        />
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
   CLEAR LEARNING CONFIRMATION MODAL
   ────────────────────────────────────────────── */

function ClearLearningModal({
  isOpen,
  onClose,
  onConfirm,
  wordCount,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  wordCount: number;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 backdrop-blur-[6px]"
            style={{ background: "rgba(30,22,16,0.35)" }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative w-full max-w-[420px] overflow-hidden rounded-[28px]"
            style={{
              background: "linear-gradient(165deg, rgba(255,252,248,0.98), rgba(248,241,234,0.96))",
              border: "1px solid rgba(205,170,140,0.18)",
              boxShadow: "0 32px 80px rgba(30,22,16,0.25), 0 0 0 1px rgba(255,255,255,0.4) inset",
            }}
          >
            {/* Subtle top glow */}
            <div className="pointer-events-none absolute -inset-20 opacity-30" style={{
              background: "radial-gradient(ellipse at 50% 0%, rgba(216,138,91,0.08) 0%, transparent 70%)",
            }} />

            <div className="relative z-10 p-8">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full"
                style={{
                  background: "linear-gradient(135deg, rgba(224,90,74,0.08), rgba(216,138,91,0.04))",
                  border: "1px solid rgba(224,90,74,0.12)",
                }}
              >
                <Trash2 className="size-6" strokeWidth={1.4} style={{ color: "#C05A4A" }} />
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-center font-serif text-[22px] font-semibold tracking-tight text-[#2B1B12]"
              >
                Clear learning queue?
              </motion.h3>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mx-auto mt-2 max-w-sm text-center text-[14px] text-[#8d8175]/70 leading-relaxed"
              >
                This will remove <strong className="text-[#6B5D52]">{wordCount} learning {wordCount === 1 ? "word" : "words"}</strong> from your current learning section. Known words and favorites will be kept.
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-7 flex gap-3"
              >
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 rounded-[14px] px-5 py-3 text-[13px] font-semibold text-[#6B5D52] transition-all duration-200"
                  style={{
                    background: "rgba(255,248,243,0.94)",
                    border: "1px solid rgba(196,154,120,0.18)",
                    boxShadow: "0 4px 14px rgba(80,50,30,0.04)",
                  }}
                >
                  Cancel
                </motion.button>

                <motion.button
                  onClick={onConfirm}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 rounded-[14px] px-5 py-3 text-[13px] font-semibold text-white transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #C05A4A, #D88A5B)",
                    border: "1px solid rgba(224,90,74,0.2)",
                    boxShadow: "0 8px 24px rgba(192,90,74,0.20)",
                  }}
                >
                  Clear Queue
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ──────────────────────────────────────────────
   VOCABULARY GRID (saved words)
   ────────────────────────────────────────────── */

function VocabGrid({

  words,
  tab,
  onUpdateStatus,
  onPronounce,
  onDelete,
}: {
  words: VocabWord[];
  tab: "learning" | "known" | "favorite";
  onUpdateStatus: (word: VocabWord, status: string) => void;
  onPronounce: (word: VocabWord) => void;
  onDelete: (word: VocabWord) => void;
}) {
  const filtered = useMemo(() => {
    if (tab === "favorite") return words.filter((w) => w.status === "favorite");
    if (tab === "known") return words.filter((w) => w.status === "known");
    return words.filter((w) => w.status === "learning" || !w.status);
  }, [words, tab]);

  if (filtered.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center justify-center py-24 text-center">
        <div className="relative mb-8">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="relative">
            <div className="flex size-28 items-center justify-center rounded-full bg-gradient-to-br from-[#D88A5B]/12 to-[#C9A96E]/6 border border-[rgba(216,138,91,0.14)] shadow-[0_8px_32px_rgba(216,138,91,0.08)]">
              <BookMarked className="size-12 text-[#D88A5B]/30" strokeWidth={1.2} />
            </div>
            <motion.span className="absolute -left-4 top-2 font-serif text-2xl text-[#D88A5B]/20" animate={{ y: [0, -8, 0], opacity: [0.1, 0.22, 0.1] }} transition={{ duration: 3, repeat: Infinity }}>
              L
            </motion.span>
            <motion.span className="absolute -right-3 bottom-4 font-serif text-xl text-[#C9A96E]/20" animate={{ y: [0, 6, 0], opacity: [0.1, 0.22, 0.1] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}>
              M
            </motion.span>
            <motion.span className="absolute -bottom-3 left-6 font-serif text-lg text-[#8B9D83]/20" animate={{ y: [0, -5, 0], opacity: [0.08, 0.20, 0.08] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}>
              O
            </motion.span>
            <motion.div className="absolute -inset-4 rounded-full border border-[#D88A5B]/10" animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 4, repeat: Infinity }} />
          </motion.div>
        </div>

        <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="font-serif text-2xl font-semibold text-[#2B1B12]">
          Your language memory begins here.
        </motion.h3>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-2 max-w-sm text-[14px] text-[#8d8175]/65">
          {tab === "favorite"
            ? "Words you mark as favorites will appear here."
            : tab === "known"
              ? "Swipe right on generated words to mark them as known."
              : "Generate AI-powered vocabulary and start building your personal language vault."}
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filtered.map((word, idx) => (
        <motion.div
          key={word.id || `${word.word}-${word.translation}-${idx}`}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ delay: idx * 0.04, type: "spring", stiffness: 200, damping: 25 }}
          className="group relative overflow-hidden rounded-[24px] transition-all duration-300 hover:-translate-y-[8px]"
          style={{
            background: "linear-gradient(180deg, rgba(255,252,248,0.97), rgba(248,241,234,0.94))",
            border: "1px solid rgba(205,170,140,0.16)",
            boxShadow: "0 16px 48px rgba(84,56,36,0.08), 0 0 0 1px rgba(255,255,255,0.4) inset",
          }}
        >
          <div className="pointer-events-none absolute -inset-2 rounded-[28px] bg-gradient-to-br from-[#D88A5B]/5 to-transparent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

          <div className="absolute inset-0 opacity-[0.012] mix-blend-multiply pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }} />

          {/* Hover ring glow */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[24px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(216,138,91,0.12)",
              background: "radial-gradient(ellipse at 50% 0%, rgba(216,138,91,0.04) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-serif text-[22px] font-bold tracking-tight text-[#241811] leading-[1.1]">{word.word}</h4>
                {word.transcription && <p className="mt-0.5 text-[12px] text-[#8d8175]/55">{word.transcription}</p>}
              </div>
              {word.level && (
                <span className="shrink-0 rounded-full bg-[#D88A5B]/12 border border-[#D88A5B]/18 px-2.5 py-0.5 text-[9px] font-bold text-[#D88A5B]">{word.level}</span>
              )}
            </div>

            <p className="mt-2.5 text-[14px] text-[#3D2B1F]/85 font-medium leading-relaxed">{word.translation}</p>

            {word.tags && word.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {word.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-[rgba(232,218,200,0.45)] px-2.5 py-0.5 text-[10px] font-medium text-[#5A4A3E] border border-[rgba(205,170,140,0.12)]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center gap-2 pt-2 border-t border-[rgba(205,170,140,0.10)]">
              <motion.button
                onClick={() => onPronounce(word)}
                whileHover={{ scale: 1.12, y: -1, color: "#D88A5B", background: "rgba(216,138,91,0.10)" }}
                whileTap={{ scale: 0.9 }}
                className="flex size-9 items-center justify-center rounded-full transition-all duration-200"
                style={{
                  background: "rgba(255,248,243,0.94)",
                  border: "1px solid rgba(196,154,120,0.18)",
                  boxShadow: "0 4px 14px rgba(80,50,30,0.06)",
                  color: "#7A4A3B",
                }}
                title="Pronounce"
              >
                <Volume2 className="size-[15px]" strokeWidth={1.5} />
              </motion.button>

              {word.status !== "known" && (
                <motion.button
                  onClick={() => onUpdateStatus(word, "known")}
                  whileHover={{ scale: 1.12, y: -1, color: "#8B9D83", background: "rgba(139,157,131,0.10)" }}
                  whileTap={{ scale: 0.9 }}
                  className="flex size-9 items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    background: "rgba(255,248,243,0.94)",
                    border: "1px solid rgba(196,154,120,0.18)",
                    boxShadow: "0 4px 14px rgba(80,50,30,0.06)",
                    color: "#7A4A3B",
                  }}
                  title="Mark as known"
                >
                  <Check className="size-[15px]" strokeWidth={2.5} />
                </motion.button>
              )}

              {word.status !== "favorite" && (
                <motion.button
                  onClick={() => onUpdateStatus(word, "favorite")}
                  whileHover={{ scale: 1.12, y: -1, color: "#D88A5B", background: "rgba(216,138,91,0.10)" }}
                  whileTap={{ scale: 0.9 }}
                  className="flex size-9 items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    background: "rgba(255,248,243,0.94)",
                    border: "1px solid rgba(196,154,120,0.18)",
                    boxShadow: "0 4px 14px rgba(80,50,30,0.06)",
                    color: "#7A4A3B",
                  }}
                  title="Add to favorites"
                >
                  <Heart className="size-[15px]" strokeWidth={1.5} />
                </motion.button>
              )}

              <motion.button
                onClick={() => onDelete(word)}
                whileHover={{ scale: 1.12, y: -1, color: "#E05A4A", background: "rgba(224,90,74,0.10)" }}
                whileTap={{ scale: 0.9 }}
                className="ml-auto flex size-9 items-center justify-center rounded-full transition-all duration-200"
                style={{
                  background: "rgba(255,248,243,0.94)",
                  border: "1px solid rgba(196,154,120,0.18)",
                  boxShadow: "0 4px 14px rgba(80,50,30,0.06)",
                  color: "rgba(122,74,59,0.50)",
                }}
                title="Delete"
              >
                <Trash2 className="size-[15px]" strokeWidth={1.5} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────────── */

export default function VocabularyPage() {
  const supabase = useMemo(() => createClient(), []);
  const tts = usePremiumTts({ speed: 1.0 });

  const [allWords, setAllWords] = useState<VocabWord[]>([]);
  const [generatedWords, setGeneratedWords] = useState<VocabWord[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"learning" | "known" | "favorite">("learning");
  const [error, setError] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearCount, setClearCount] = useState(0);
  const prevTotalRef = useRef(allWords.length);


  const stats = useMemo(
    () => ({
      total: allWords.length,
      known: allWords.filter((w) => w.status === "known").length,
      learning: allWords.filter((w) => w.status === "learning" || !w.status).length,
      favorites: allWords.filter((w) => w.status === "favorite").length,
    }),
    [allWords]
  );

  const loadWords = useRef(false);
  const fetchWords = useCallback(async () => {
    const { data } = await supabase.from("vocabulary_words").select("*").order("created_at", { ascending: false });
    if (data) setAllWords(data as VocabWord[]);
  }, [supabase]);

  useEffect(() => {
    if (loadWords.current) return;
    loadWords.current = true;
    fetchWords();
  }, [fetchWords]);

  const handleGenerate = useCallback(
    async (params: { language: Language; topic: string; count: number; level: string }) => {
      setIsGenerating(true);
      setError(null);
      try {
        const res = await fetch("/api/vocabulary/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to generate vocabulary");
          return;
        }
        setGeneratedWords(data.words);
        setShowLibrary(false);
        setActiveTab("learning");
        fetchWords();
      } catch (err) {
        setError("Network error. Please try again.");
        console.error(err);
      } finally {
        setIsGenerating(false);
      }
    },
    [fetchWords]
  );

  const handleSwipeLeft = useCallback(
    async (word: VocabWord) => {
      if (!word.id) return;
      await supabase.from("vocabulary_words").update({ status: "learning", updated_at: new Date().toISOString() }).eq("id", word.id);
      fetchWords();
    },
    [supabase, fetchWords]
  );

  const handleSwipeRight = useCallback(
    async (word: VocabWord) => {
      if (!word.id) return;
      await supabase.from("vocabulary_words").update({ status: "known", mastery_level: 1, updated_at: new Date().toISOString() }).eq("id", word.id);
      fetchWords();
    },
    [supabase, fetchWords]
  );

  const handleFavorite = useCallback(
    async (word: VocabWord) => {
      if (!word.id) return;
      const newStatus = word.status === "favorite" ? "learning" : "favorite";
      await supabase.from("vocabulary_words").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", word.id);
      setGeneratedWords((prev) => prev.map((w) => (w.id === word.id ? { ...w, status: newStatus as VocabWord["status"] } : w)));
      fetchWords();
    },
    [supabase, fetchWords]
  );

  const handlePronounce = useCallback((word: VocabWord) => {
    if (word.word) {
      tts.pronounce(word.id || word.word, word.word, word.language);
    }
  }, [tts]);


  const handleUpdateStatus = useCallback(
    async (word: VocabWord, status: string) => {
      if (!word.id) return;
      await supabase.from("vocabulary_words").update({ status, updated_at: new Date().toISOString() }).eq("id", word.id);
      fetchWords();
    },
    [supabase, fetchWords]
  );

  const handleDelete = useCallback(
    async (word: VocabWord) => {
      if (!word.id) return;
      await supabase.from("vocabulary_words").delete().eq("id", word.id);
      fetchWords();
    },
    [supabase, fetchWords]
  );

  const handleClearLearning = useCallback(async () => {
    setIsClearing(true);
    try {
      const res = await fetch("/api/vocabulary?clearLearning=true", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setClearCount(data.deleted || 0);
        setTimeout(() => {
          setShowClearModal(false);
          setGeneratedWords([]);
          fetchWords();
          setIsClearing(false);
        }, 400);
      }
    } catch (err) {
      console.error("Clear learning error:", err);
      setIsClearing(false);
    }
  }, [fetchWords]);

  const learningCount = useMemo(
    () => allWords.filter((w) => w.status === "learning" || !w.status).length,
    [allWords]
  );

  const swipeWords = useMemo(() => generatedWords.filter((w) => w.id && w.word), [generatedWords]);

  const tabs = [
    { key: "learning" as const, label: "Learning", icon: Brain, color: "#D88A5B" },
    { key: "known" as const, label: "Known", icon: Check, color: "#8B9D83" },
    { key: "favorite" as const, label: "Favorites", icon: Heart, color: "#D88A5B" },
  ];

  return (
    <>
      <div className="relative min-h-screen">
        {/* Cinematic background layers - now inherited from layout */}
        <div className="cinematic-page fixed inset-0" />
        <div className="workspace-fog fixed inset-0 pointer-events-none" />

        {/* Warm radial glows */}
        <div className="pointer-events-none fixed right-[8%] top-[15%] size-[700px] rounded-full bg-gradient-to-br from-[#D88A5B]/6 via-[#C9A96E]/4 to-transparent blur-[180px]" />
        <div className="pointer-events-none fixed bottom-[8%] left-[3%] size-[600px] rounded-full bg-gradient-to-tr from-[#C9A96E]/5 via-[#D88A5B]/3 to-transparent blur-[140px]" />
        <div className="pointer-events-none fixed left-[40%] top-[50%] size-[500px] rounded-full bg-[#FFF5E6]/15 blur-[120px]" />
        <div className="pointer-events-none fixed left-[10%] top-[20%] size-[400px] rounded-full bg-[#8B9D83]/4 blur-[100px]" />

        {/* Watercolor paper texture overlay */}
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.020] mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='watercolor'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23watercolor)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Subtle renaissance pattern overlay */}
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D88A5B' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating dust motes */}
        <FloatingDust />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-12 pb-24">
            {/* Header bar - no breadcrumb, just breathing room */}
            <div className="mb-10 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8d8175]/45">Vocabulary</p>
              </div>

              <motion.button
                onClick={() => setShowLibrary(!showLibrary)}
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition-all duration-200 border",
                  showLibrary
                    ? "bg-[#2A211C] text-white border-[#2A211C] shadow-lg"
                    : "bg-[rgba(255,248,243,0.94)] text-[#6B5D52] border-[rgba(196,154,120,0.18)] shadow-[0_4px_14px_rgba(80,50,30,0.06)] hover:border-[#D88A5B]/25 hover:shadow-[0_8px_24px_rgba(80,50,30,0.12)]"
                )}
              >
                <Library className="size-3.5" strokeWidth={1.5} />
                {showLibrary ? "Generator" : "My Library"}
              </motion.button>
            </div>

            <HeroSection stats={stats} />

            {!showLibrary && <AiGeneratorPanel onGenerate={handleGenerate} isGenerating={isGenerating} />}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-6 overflow-hidden rounded-[16px] border border-red-200/50 bg-red-50/50 px-5 py-3 text-sm text-red-600 backdrop-blur-sm"
                >
                  {error}
                  <button onClick={() => setError(null)} className="ml-3 font-semibold hover:underline">
                    Dismiss
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {!showLibrary && swipeWords.length > 0 && (
              <div className="mb-16">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: [0.16, 1, 0.3, 1] }} className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-[#2B1B12]">Review Generated Words</h2>
                    <p className="text-[13px] text-[#8d8175]/65">Swipe right if you know it, left if you want to learn it</p>
                  </div>
                  <motion.button
                    onClick={() => setGeneratedWords([])}
                    whileHover={{ rotate: 90, scale: 1.12 }}
                    className="flex size-9 items-center justify-center rounded-full transition-all duration-200"
                    style={{
                      background: "rgba(255,248,243,0.94)",
                      border: "1px solid rgba(196,154,120,0.18)",
                      boxShadow: "0 4px 14px rgba(80,50,30,0.06)",
                      color: "rgba(138,90,59,0.50)",
                    }}
                  >
                    <X className="size-4" strokeWidth={1.5} />
                  </motion.button>
                </motion.div>

                <VocabStack words={swipeWords} onSwipeLeft={handleSwipeLeft} onSwipeRight={handleSwipeRight} onFavorite={handleFavorite} onPronounce={handlePronounce} />
              </div>
            )}

            <div>
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <h2 className="font-serif text-[26px] font-semibold text-[#2B1B12] leading-tight">{showLibrary ? "My Vocabulary Library" : "Your Vocabulary Library"}</h2>
                  <p className="mt-1 text-[13px] text-[#8d8175]/60">Your AI-generated language vault.</p>
                </div>
                <div className="flex items-center gap-3">
                  {learningCount > 0 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 }}
                      onClick={() => setShowClearModal(true)}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all duration-200"
                      style={{
                        background: "rgba(255,248,243,0.94)",
                        border: "1px solid rgba(190,140,110,0.18)",
                        boxShadow: "0 4px 14px rgba(80,50,30,0.04)",
                        color: "#6B5D52",
                      }}
                    >
                      <Trash2 className="size-3" strokeWidth={1.5} style={{ color: "#C05A4A" }} />
                      Clear Learning
                      <motion.span
                        key={allWords.length}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="inline-flex items-center justify-center rounded-full bg-[#C05A4A]/10 px-2 py-0.5 text-[10px] font-bold"
                        style={{ color: "#C05A4A" }}
                      >
                        {learningCount}
                      </motion.span>
                    </motion.button>
                  )}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-[13px] font-semibold text-[#8d8175]/55"
                  >
                    {allWords.length} words saved
                  </motion.p>
                </div>
              </div>

              <SectionDivider />

              {/* Premium segmented tab control */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative mb-8 flex gap-1.5 rounded-[16px] p-1.5"
                style={{
                  background: "rgba(255,248,243,0.80)",
                  border: "1px solid rgba(205,170,140,0.14)",
                  boxShadow: "0 4px 20px rgba(80,50,30,0.05), 0 0 0 1px rgba(255,255,255,0.4) inset",
                }}
              >
                {tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <motion.button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        "relative flex flex-1 items-center justify-center gap-2 rounded-[12px] px-4 py-2.5 text-[13px] font-semibold transition-all duration-200",
                        isActive ? "text-[#2B1B12]" : "text-[#7A6A5E]/50 hover:text-[#6B5D52]"
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="tabPill"
                          className="absolute inset-0 rounded-[12px] bg-white shadow-[0_4px_14px_rgba(80,50,30,0.06)]"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <TabIcon className="size-4" strokeWidth={1.8} style={{ color: isActive ? tab.color : undefined }} />
                        {tab.label}
                      </span>
                    </motion.button>
                  );
                })}
              </motion.div>

              <VocabGrid words={allWords} tab={activeTab} onUpdateStatus={handleUpdateStatus} onPronounce={handlePronounce} onDelete={handleDelete} />
            </div>
        </div>
      </div>

      {/* Clear Learning Modal */}
      <ClearLearningModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearLearning}
        wordCount={learningCount}
      />
    </>
  );
}
