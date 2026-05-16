"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { TtsStatus } from "@/hooks/use-premium-tts";

/* ──────────────────────────────────────────────
   PREMIUM PRONOUNCE BUTTON
   Duolingo + ElevenLabs + Apple style
   ────────────────────────────────────────────── */

interface PronounceButtonProps {
  onPress: () => void;
  status?: TtsStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Show waveform animation when playing */
  showWaveform?: boolean;
  /** Tooltip text */
  label?: string;
}

export function PronounceButton({
  onPress,
  status = "idle",
  size = "md",
  className,
  showWaveform = false,
  label = "Pronounce",
}: PronounceButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const btnRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);

  const isActive = status === "playing" || status === "loading";

  // Add ripple on click
  const handleClick = (e: React.MouseEvent) => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = rippleId.current++;
      setRipples((prev) => [...prev, { id, x, y }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 700);
    }
    onPress();
  };

  const sizeClasses = {
    sm: "size-9",
    md: "size-14",
    lg: "size-16",
  };

  const iconSizes = {
    sm: "size-[15px]",
    md: "size-5",
    lg: "size-6",
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      {/* Play state: glow pulse ring */}
      <AnimatePresence>
        {isActive && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.4, opacity: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(216,138,91,0.20) 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Glow pulse when playing */}
      <AnimatePresence>
        {isActive && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.06, 1] }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(216,138,91,0.25) 0%, rgba(201,169,110,0.10) 50%, transparent 80%)",
              boxShadow: "0 0 30px rgba(216,138,91,0.15), 0 0 60px rgba(201,169,110,0.08)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        ref={btnRef}
        onClick={handleClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.92 }}
        title={label}
        aria-label={label}
        className={cn(
          "relative z-10 flex items-center justify-center rounded-full transition-all duration-200 overflow-hidden",
          sizeClasses[size],
          isActive
            ? "shadow-[0_0_40px_rgba(216,138,91,0.20),0_12px_32px_rgba(42,33,28,0.24)]"
            : "shadow-lg hover:shadow-[0_20px_48px_rgba(42,33,28,0.20)]"
        )}
        style={{
          background: isActive
            ? "linear-gradient(135deg, #3D2B1F, #2A1E17)"
            : "linear-gradient(135deg, #2A1E17, #3D2B1F)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: isActive
            ? "0 0 40px rgba(216,138,91,0.20), 0 12px 32px rgba(42,33,28,0.24), 0 0 0 1px rgba(255,255,255,0.08) inset"
            : "0 12px 32px rgba(42,33,28,0.24), 0 0 0 1px rgba(255,255,255,0.08) inset",
        }}
      >
        {/* Subtle inner sheen on hover */}
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-full"
          animate={{
            background: isHovered
              ? "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)"
              : "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)",
          }}
        />

        {/* Ripple effect */}
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="pointer-events-none absolute rounded-full"
            initial={{ width: 0, height: 0, x: r.x, y: r.y, opacity: 0.5 }}
            animate={{ width: 200, height: 200, x: r.x - 100, y: r.y - 100, opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.20) 0%, transparent 70%)",
            }}
          />
        ))}

        {/* Icon */}
        {status === "loading" ? (
          <Loader2 className={cn("animate-spin text-white", iconSizes[size])} strokeWidth={1.5} />
        ) : (
          <motion.div
            animate={
              isActive
                ? { scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }
                : { scale: 1, rotate: 0 }
            }
            transition={isActive ? { duration: 0.6, repeat: Infinity } : {}}
          >
            <Volume2
              className={cn(
                "text-white transition-all duration-200",
                iconSizes[size],
                isActive && "drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]"
              )}
              strokeWidth={1.5}
            />
          </motion.div>
        )}

        {/* Soundwave bars overlay when playing */}
        {isActive && showWaveform && size !== "sm" && (
          <div className="pointer-events-none absolute flex items-end gap-[2px]" style={{ bottom: "22%", height: "30%" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.span
                key={i}
                className="block w-[2px] rounded-full bg-white/40"
                animate={{
                  height: ["30%", "100%", "50%", "90%", "30%"],
                  opacity: [0.3, 0.8, 0.4, 0.7, 0.3],
                }}
                transition={{
                  duration: 0.8 + i * 0.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        )}
      </motion.button>
    </div>
  );
}

/* ──────────────────────────────────────────────
   WAVEFORM ANIMATION (standalone)
   ────────────────────────────────────────────── */

export function SoundwaveAnimation({ isActive, className }: { isActive: boolean; className?: string }) {
  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn("flex items-center gap-[3px]", className)}
    >
      {[1, 2, 3, 4, 3, 2, 1].map((_, i) => (
        <motion.span
          key={i}
          className="block w-[3px] rounded-full"
          style={{
            background: "linear-gradient(180deg, #D88A5B, #C9A96E)",
            height: "16px",
          }}
          animate={{
            height: ["8px", "20px", "10px", "18px", "8px"],
            opacity: [0.4, 0.9, 0.5, 0.8, 0.4],
          }}
          transition={{
            duration: 0.6 + i * 0.08,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.12,
          }}
        />
      ))}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   BREATHING DOTS (micro-interaction)
   ────────────────────────────────────────────── */

export function BreathingDots({ isActive, className }: { isActive: boolean; className?: string }) {
  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn("flex items-center gap-1", className)}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block rounded-full"
          style={{
            width: 4,
            height: 4,
            background: i === 1 ? "#D88A5B" : i === 0 ? "#C9A96E" : "#E8C4B8",
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </motion.div>
  );
}
