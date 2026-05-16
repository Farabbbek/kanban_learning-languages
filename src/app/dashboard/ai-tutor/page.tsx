"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, useAnimationFrame } from "framer-motion";
import {
  MessageCircle,
  Mic,
  Zap,
  Sparkles,
  PenTool,
  Volume2,
  Star,
  ArrowRight,
  Brain,
  ChevronRight,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────
   CONSTANTS
   ────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Real-time Conversation",
    desc: "Practice natural dialogues with an AI that understands context, tone, and cultural nuances.",
    gradient: "from-[#D88A5B]/15 via-[#C9A96E]/10 to-transparent",
  },
  {
    icon: Volume2,
    title: "Pronunciation Feedback",
    desc: "Speak and receive instant phoneme-level correction with waveform analysis.",
    gradient: "from-[#C9A96E]/15 via-[#8B9D83]/10 to-transparent",
  },
  {
    icon: PenTool,
    title: "Grammar Correction",
    desc: "Write sentences and get intelligent grammar suggestions with explanations.",
    gradient: "from-[#D88A5B]/15 via-[#C9A96E]/10 to-transparent",
  },
  {
    icon: Mic,
    title: "AI Speaking Partner",
    desc: "A patient, always-available conversation partner that adapts to your level.",
    gradient: "from-[#C9A96E]/15 via-[#8B9D83]/10 to-transparent",
  },
  {
    icon: Zap,
    title: "Smart Lesson Generation",
    desc: "Lessons crafted in real-time based on your weak spots and learning history.",
    gradient: "from-[#D88A5B]/15 via-[#C9A96E]/10 to-transparent",
  },
];

const FLOATING_WORDS = [
  { word: "Bonjour", lang: "fr" },
  { word: "Gracias", lang: "es" },
  { word: "谢谢", lang: "zh" },
  { word: "Merci", lang: "fr" },
  { word: "Hola", lang: "es" },
  { word: "Grazie", lang: "it" },
  { word: "Danke", lang: "de" },
  { word: "ありがとう", lang: "ja" },
];

const BUBBLE_MESSAGES = [
  { text: "Bonjour! Comment allez-vous?", side: "left" as const },
  { text: "How was your day?", side: "right" as const },
  { text: "No comprendo...", side: "left" as const },
  { text: "Wǒ hěn hǎo! 谢谢!", side: "right" as const },
];

/* ──────────────────────────────────────────────
   AI CORE ORB
   ────────────────────────────────────────────── */

function AiCoreOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const w = 300;
    const h = 300;
    canvas.width = w * 2;
    canvas.height = h * 2;
    ctx.scale(2, 2);

    let frame = 0;
    let animId: number;

    function draw() {
      frame++;
      ctx.clearRect(0, 0, w, h);

      // Outer glow
      const grd = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 80);
      grd.addColorStop(0, "rgba(216,138,91,0.12)");
      grd.addColorStop(0.5, "rgba(201,169,110,0.06)");
      grd.addColorStop(1, "rgba(216,138,91,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      // Orbit rings
      for (let r = 0; r < 3; r++) {
        const radius = 35 + r * 22;
        const speed = 0.008 + r * 0.003;
        const phase = r * 1.8;

        ctx.beginPath();
        ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
        ctx.strokeStyle =
          r === 1
            ? `rgba(216,138,91,${0.08 + Math.sin(frame * speed) * 0.04})`
            : `rgba(201,169,110,${0.06 + Math.sin(frame * speed + phase) * 0.03})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Orbiting dot
        const dotAngle = frame * speed * 80 + phase;
        const dx = w / 2 + Math.cos(dotAngle) * radius;
        const dy = h / 2 + Math.sin(dotAngle) * radius;
        ctx.beginPath();
        ctx.arc(dx, dy, r === 1 ? 3 : 2, 0, Math.PI * 2);
        ctx.fillStyle =
          r === 1
            ? `rgba(216,138,91,${0.5 + Math.sin(frame * speed) * 0.2})`
            : `rgba(201,169,110,${0.4 + Math.sin(frame * speed + phase) * 0.2})`;
        ctx.fill();
      }

      // Neural pulses
      for (let p = 0; p < 3; p++) {
        const pulsePhase = frame * 0.02 + p * 2.1;
        const pulseRadius = 20 + Math.sin(pulsePhase) * 15 + 10;
        const alpha = 0.08 + Math.sin(pulsePhase) * 0.05;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(216,138,91,${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Core glow
      const coreGrd = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 16);
      coreGrd.addColorStop(0, "rgba(255,255,255,0.3)");
      coreGrd.addColorStop(0.4, "rgba(216,138,91,0.15)");
      coreGrd.addColorStop(1, "rgba(216,138,91,0)");
      ctx.fillStyle = coreGrd;
      ctx.fillRect(0, 0, w, h);

      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute size-[180px] rounded-full bg-[#D88A5B]/6 blur-[60px]" />
      <canvas
        ref={canvasRef}
        className="relative size-[300px]"
        style={{ imageRendering: "crisp-edges" }}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────
   FLOATING CHAT BUBBLES
   ────────────────────────────────────────────── */

function ChatBubble({ text, side, index }: { text: string; side: "left" | "right"; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.85 }}
      animate={{
        opacity: [0, 0.9, 0.7, 0.9, 0],
        y: [20, -8, 8, -4, -20],
        scale: [0.85, 1, 0.95, 1, 0.9],
      }}
      transition={{
        duration: 6,
        delay: index * 1.2,
        repeat: Infinity,
        repeatDelay: 3,
        ease: "easeInOut",
      }}
      className={cn(
        "absolute max-w-[170px] rounded-[20px] px-4 py-2.5 text-[11px] font-medium leading-snug border backdrop-blur-sm",
        side === "left"
          ? "left-0 bg-white/90 border-[rgba(216,138,91,0.15)] text-[#2A211C]"
          : "right-0 bg-[#D88A5B]/10 border-[#D88A5B]/20 text-[#2A211C]"
      )}
      style={{
        top: `${20 + (index * 18) % 55}%`,
        boxShadow:
          side === "left"
            ? "0 8px 32px rgba(42,33,28,0.06), 0 0 0 1px rgba(255,255,255,0.5) inset"
            : "0 8px 32px rgba(216,138,91,0.10), 0 0 0 1px rgba(216,138,91,0.08) inset",
        filter: `blur(${0.3 - index * 0.06}px)`,
        zIndex: 10 - index,
      }}
    >
      <div className="flex items-center gap-1.5">
        {side === "right" && (
          <span className="size-[5px] rounded-full bg-[#D88A5B]/40" />
        )}
        {text}
        {side === "left" && (
          <span className="size-[5px] rounded-full bg-[#D88A5B]/40" />
        )}
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   LANGUAGE PARTICLES
   ────────────────────────────────────────────── */

function LanguageParticles() {
  const particles = useMemo(() =>
    FLOATING_WORDS.map((item, i) => ({
      ...item,
      x: 3 + (i * 13) % 94,
      y: 3 + (i * 29) % 94,
      size: 10 + (i * 7) % 10,
      delay: (i * 0.7) % 6,
      duration: 15 + (i * 11) % 12,
      opacity: 0.035 + (i % 5) * 0.012,
    })),
  []);

  return (
    <div className="pointer-events-none fixed inset-0 ml-[220px] overflow-hidden">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute font-serif font-semibold italic"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            color: ["#D88A5B", "#C9A96E", "#8B9D83", "#D88A5B", "#C9A96E"][i % 5],
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -30, 15, -10, 0],
            x: [0, 12, -18, 8, 0],
            opacity: [p.opacity, p.opacity * 0.2, p.opacity * 1.8, p.opacity * 0.5, p.opacity],
            rotate: [0, -5, 3, -2, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {p.word}
        </motion.span>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   AMBIENT DUST
   ────────────────────────────────────────────── */

function AmbientDust() {
  const dust = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: (i * 17 + 3) % 100,
      y: (i * 43 + 7) % 100,
      size: 1 + (i * 5) % 3,
      delay: (i * 7) % 14,
      duration: 12 + (i * 11) % 10,
    })),
  []);

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
            background:
              d.size > 2
                ? "radial-gradient(circle, rgba(216,138,91,0.25) 0%, rgba(201,169,110,0.08) 100%)"
                : "#C9A96E",
          }}
          animate={{
            y: [0, -35, 22, -18, 0],
            x: [0, 18, -12, 8, 0],
            opacity: [0.015, 0.06, 0.01, 0.04, 0.015],
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
   AMBIENT NOISE
   ────────────────────────────────────────────── */

function AmbientNoise() {
  return (
    <div
      className="pointer-events-none fixed inset-0 ml-[220px] opacity-[0.012] mix-blend-multiply"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

/* ──────────────────────────────────────────────
   FEATURE CARD
   ────────────────────────────────────────────── */

function FeatureCard({
  icon: Icon,
  title,
  desc,
  gradient,
  index,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  gradient: string;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group relative overflow-hidden rounded-[22px] border p-5 transition-all duration-400 cursor-default",
        "hover:-translate-y-[3px] hover:shadow-[0_20px_60px_rgba(42,33,28,0.10)]",
        hovered
          ? "border-[#D88A5B]/30 bg-white/85"
          : "border-[rgba(210,190,170,0.18)] bg-white/60"
      )}
      style={{
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {/* Hover gradient sweep */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500",
          gradient,
          hovered && "opacity-100"
        )}
      />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-[#D88A5B]/6 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-10 flex items-start gap-4">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-[14px] border transition-all duration-300",
            hovered
              ? "bg-[#D88A5B]/15 border-[#D88A5B]/30 shadow-[0_0_20px_rgba(216,138,91,0.15)]"
              : "bg-[rgba(216,138,91,0.08)] border-[rgba(216,138,91,0.14)]"
          )}
        >
          <Icon
            className={cn(
              "size-5 transition-all duration-300",
              hovered ? "text-[#D88A5B]" : "text-[#6f6257]/70"
            )}
            strokeWidth={1.5}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-[15px] font-semibold text-[#1F1610] transition-colors duration-300">
              {title}
            </h3>
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -4 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center rounded-full bg-[#D88A5B]/10 px-2 py-[2px] text-[8px] font-bold uppercase tracking-[0.1em] text-[#D88A5B]"
            >
              Preview
            </motion.span>
          </div>
          <p className="mt-1.5 text-[12px] leading-relaxed text-[#6f6257]/65 transition-colors duration-300">
            {desc}
          </p>
        </div>
      </div>
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
   WAITLIST
   ────────────────────────────────────────────── */

function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="mx-auto mt-10 max-w-md text-center"
    >
      <p className="text-[12px] font-medium text-[#6f6257]/60">AI Tutor launches soon</p>
      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-[12px] border border-[rgba(210,190,170,0.22)] bg-white/70 px-4 py-2.5 text-[12px] text-[#2A211C] placeholder:text-[#2A211C]/25 transition-all duration-200 focus:outline-none focus:border-[#D88A5B]/35 focus:ring-[2px] focus:ring-[#D88A5B]/8"
          />
        </div>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className={cn(
            "shrink-0 rounded-[12px] px-5 py-2.5 text-[12px] font-semibold text-white transition-all duration-200",
            subscribed
              ? "bg-[#8B9D83]"
              : "bg-[#2A211C] hover:bg-[#3D2B1F] shadow-[0_4px_16px_rgba(42,33,28,0.12)]"
          )}
        >
          {subscribed ? "Notified" : "Join Early Access"}
        </motion.button>
      </form>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────────── */

export default function AiTutorPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4EFE8" }}>
      <Sidebar />
      <AmbientNoise />
      <main className="ml-[220px]">
        <div className="relative min-h-screen">
          {/* Cinematic ambient fog layers */}
          <div className="pointer-events-none fixed right-[5%] top-[3%] size-[700px] rounded-full bg-gradient-to-br from-[#D88A5B]/6 via-[#C9A96E]/4 to-transparent blur-[180px]" />
          <div className="pointer-events-none fixed bottom-[8%] left-[3%] size-[550px] rounded-full bg-gradient-to-tr from-[#C9A96E]/5 via-[#D88A5B]/3 to-transparent blur-[160px]" />
          <div className="pointer-events-none fixed left-[40%] top-[50%] size-[400px] rounded-full bg-[#FFF5E6]/8 blur-[120px]" />
          <div className="pointer-events-none fixed right-[30%] bottom-[20%] size-[300px] rounded-full bg-[#D88A5B]/4 blur-[100px]" />

          <LanguageParticles />
          <AmbientDust />

          <div className="relative z-10 mx-auto max-w-5xl px-6 pt-12 pb-24">
            {/* ─── HERO ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-12 overflow-hidden rounded-[32px] border border-[rgba(210,190,170,0.16)]"
              style={{
                background:
                  "linear-gradient(160deg, rgba(255,250,245,0.97) 0%, rgba(250,244,235,0.92) 35%, rgba(245,238,228,0.88) 100%)",
                boxShadow:
                  "0 32px 100px rgba(42,33,28,0.10), 0 0 0 1px rgba(255,255,255,0.5) inset",
              }}
            >
              {/* Texture overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.015] mix-blend-multiply"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }}
              />

              <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-gradient-to-br from-[#D88A5B]/8 to-transparent blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-gradient-to-tr from-[#C9A96E]/6 to-transparent blur-3xl" />

              <div className="relative z-10 flex flex-col items-center gap-8 px-6 py-12 md:flex-row md:px-10 md:py-14">
                {/* Left: Text */}
                <div className="flex-1 text-center md:text-left">
                  <ComingSoonBadge />

                  <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mt-5 font-serif text-[44px] font-bold leading-[0.9] tracking-tight text-[#1F1610] md:text-[64px]"
                  >
                    AI
                    <br />
                    <span className="bg-gradient-to-r from-[#D88A5B] via-[#C9A96E] to-[#D88A5B] bg-clip-text text-transparent">
                      Tutor
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.18 }}
                    className="mt-3 max-w-md text-[14px] leading-relaxed text-[rgba(35,22,14,0.75)] md:text-[15px]"
                  >
                    Your personal AI language mentor is arriving soon. Real conversations,
                    instant grammar feedback, pronunciation coaching — all powered by
                    advanced AI.
                  </motion.p>

                  {/* Stats row */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-5 flex flex-wrap gap-4 text-[11px] font-medium text-[#6f6257]/50"
                  >
                    <span className="flex items-center gap-1.5">
                      <Brain className="size-3.5 text-[#D88A5B]/50" strokeWidth={1.5} />
                      5 languages
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="size-3.5 text-[#D88A5B]/50" strokeWidth={1.5} />
                      Real-time feedback
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-[#D88A5B]/50" strokeWidth={1.5} />
                      Adaptive AI
                    </span>
                  </motion.div>
                </div>

                {/* Right: AI Orb */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="shrink-0"
                >
                  <AiCoreOrb />
                </motion.div>
              </div>
            </motion.div>

            {/* ─── CHAT BUBBLES PREVIEW ─── */}
            <div className="relative mb-10 h-[200px] md:h-[220px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative size-full max-w-lg">
                  {BUBBLE_MESSAGES.map((msg, i) => (
                    <ChatBubble key={i} text={msg.text} side={msg.side} index={i} />
                  ))}
                </div>
              </div>
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
                  Upcoming Features
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(210,190,170,0.2)] to-transparent" />
              </motion.div>

              <div className="grid gap-3 md:grid-cols-2">
                {FEATURES.map((f, i) => (
                  <FeatureCard key={f.title} {...f} index={i} />
                ))}
              </div>
            </div>

            {/* ─── BOTTOM CTA ─── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative overflow-hidden rounded-[24px] border border-[rgba(210,190,170,0.16)] py-8 text-center"
              style={{
                background:
                  "linear-gradient(160deg, rgba(255,250,245,0.85) 0%, rgba(250,244,235,0.75) 100%)",
              }}
            >
              <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[#D88A5B]/6 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 size-36 rounded-full bg-[#C9A96E]/6 blur-3xl" />

              <div className="relative z-10">
                <motion.div
                  className="mb-4 flex items-center justify-center gap-3"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#D88A5B]/10">
                    <Sparkles className="size-5 text-[#D88A5B]" strokeWidth={1.5} />
                  </div>
                </motion.div>

                <h2 className="font-serif text-[22px] font-bold text-[#1F1610] md:text-[26px]">
                  AI Tutor Launches Soon
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-[13px] text-[#6f6257]/65">
                  Be among the first to experience the future of language learning.
                </p>

                <WaitlistSection />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="mx-auto mt-4 inline-flex items-center gap-2 rounded-[12px] bg-[#2A211C] px-6 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_16px_rgba(42,33,28,0.12)] transition-all duration-200 hover:bg-[#3D2B1F]"
                  onClick={() => {
                    const input = document.querySelector<HTMLInputElement>('input[type="email"]');
                    input?.focus();
                  }}
                >
                  Get Notified
                  <ArrowRight className="size-3.5" strokeWidth={2} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
