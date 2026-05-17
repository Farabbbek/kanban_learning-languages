"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, X, Timer, Coffee } from "lucide-react";

const STORAGE_KEY = "lingua-pomodoro-v2";

interface PomodoroState {
  mode: "work" | "break";
  workMinutes: number;
  breakMinutes: number;
  remainingSeconds: number;
  isRunning: boolean;
  startedAt: number | null;
}

const DEFAULT_WORK = 25;
const DEFAULT_BREAK = 5;

function playSound(type: "work" | "break") {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "work") {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3);
    } else {
      osc.frequency.setValueAtTime(783.99, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2);
      osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.4);
    }

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    // Audio not supported
  }
}

function loadState(): PomodoroState {
  if (typeof window === "undefined") {
    return {
      mode: "work",
      workMinutes: DEFAULT_WORK,
      breakMinutes: DEFAULT_BREAK,
      remainingSeconds: DEFAULT_WORK * 60,
      isRunning: false,
      startedAt: null,
    };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return {
      mode: "work",
      workMinutes: DEFAULT_WORK,
      breakMinutes: DEFAULT_BREAK,
      remainingSeconds: DEFAULT_WORK * 60,
      isRunning: false,
      startedAt: null,
    };
  }

  try {
    const parsed: PomodoroState = JSON.parse(stored);

    if (parsed.isRunning && parsed.startedAt) {
      const elapsed = Math.floor((Date.now() - parsed.startedAt) / 1000);
      const totalSeconds =
        parsed.mode === "work"
          ? parsed.workMinutes * 60
          : parsed.breakMinutes * 60;
      const remaining = Math.max(0, totalSeconds - elapsed);

      return {
        ...parsed,
        remainingSeconds: remaining,
        isRunning: remaining > 0,
        startedAt: remaining > 0 ? parsed.startedAt : null,
      };
    }

    return parsed;
  } catch {
    return {
      mode: "work",
      workMinutes: DEFAULT_WORK,
      breakMinutes: DEFAULT_BREAK,
      remainingSeconds: DEFAULT_WORK * 60,
      isRunning: false,
      startedAt: null,
    };
  }
}

function saveState(state: PomodoroState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full
  }
}

export interface PomodoroTimerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PomodoroTimer({ isOpen, onClose }: PomodoroTimerProps) {
  const [mode, setMode] = useState<"work" | "break">(loadState().mode);
  const [workMinutes, setWorkMinutes] = useState(loadState().workMinutes);
  const [breakMinutes, setBreakMinutes] = useState(loadState().breakMinutes);
  const [remainingSeconds, setRemainingSeconds] = useState(loadState().remainingSeconds);
  const [isRunning, setIsRunning] = useState(loadState().isRunning);
  const startedAtRef = useRef<number | null>(loadState().startedAt);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [closing, setClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Persist helper
  const persist = useCallback(
    (overrides: Partial<PomodoroState>) => {
      const state: PomodoroState = {
        mode,
        workMinutes,
        breakMinutes,
        remainingSeconds,
        isRunning,
        startedAt: startedAtRef.current,
        ...overrides,
      };
      saveState(state);
    },
    [mode, workMinutes, breakMinutes, remainingSeconds, isRunning]
  );

  // Timer tick — uses Date.now() for accuracy
  useEffect(() => {
    if (isRunning && startedAtRef.current) {
      const tick = () => {
        const elapsed = Math.floor((Date.now() - startedAtRef.current!) / 1000);
        const totalSeconds =
          mode === "work" ? workMinutes * 60 : breakMinutes * 60;
        const remaining = Math.max(0, totalSeconds - elapsed);

        setRemainingSeconds(remaining);
        persist({ remainingSeconds: remaining });

        if (remaining <= 0) {
          setIsRunning(false);
          startedAtRef.current = null;
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          playSound(mode);

          if (mode === "work") {
            const newMode = "break";
            const newRemaining = breakMinutes * 60;
            setMode(newMode);
            setRemainingSeconds(newRemaining);
            persist({
              mode: newMode,
              remainingSeconds: newRemaining,
              isRunning: false,
              startedAt: null,
            });
          } else {
            const newMode = "work";
            const newRemaining = workMinutes * 60;
            setMode(newMode);
            setRemainingSeconds(newRemaining);
            persist({
              mode: newMode,
              remainingSeconds: newRemaining,
              isRunning: false,
              startedAt: null,
            });
          }
        }
      };

      tick();
      intervalRef.current = setInterval(tick, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, mode, workMinutes, breakMinutes, persist]);

  // Smooth close
  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 280);
  }, [onClose]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  const handleStart = useCallback(() => {
    const now = Date.now();
    startedAtRef.current = now;
    setIsRunning(true);
    persist({ isRunning: true, startedAt: now });
  }, [persist]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
    startedAtRef.current = null;
    persist({ isRunning: false, startedAt: null });
  }, [persist]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    startedAtRef.current = null;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const newRemaining =
      mode === "work" ? workMinutes * 60 : breakMinutes * 60;
    setRemainingSeconds(newRemaining);
    persist({
      isRunning: false,
      remainingSeconds: newRemaining,
      startedAt: null,
    });
  }, [mode, workMinutes, breakMinutes, persist]);

  const handleModeChange = useCallback(
    (newMode: "work" | "break") => {
      if (mode === "work" && newMode === "break" && remainingSeconds > 0) {
        return;
      }
      setIsRunning(false);
      startedAtRef.current = null;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setMode(newMode);
      const newRemaining =
        newMode === "work" ? workMinutes * 60 : breakMinutes * 60;
      setRemainingSeconds(newRemaining);
      persist({
        mode: newMode,
        remainingSeconds: newRemaining,
        isRunning: false,
        startedAt: null,
      });
    },
    [mode, remainingSeconds, workMinutes, breakMinutes, persist]
  );

  const handleWorkChange = useCallback(
    (val: number) => {
      const clamped = Math.max(5, Math.min(60, val));
      setWorkMinutes(clamped);
      if (mode === "work") {
        setRemainingSeconds(clamped * 60);
        persist({ workMinutes: clamped, remainingSeconds: clamped * 60 });
      } else {
        persist({ workMinutes: clamped });
      }
    },
    [mode, persist]
  );

  const handleBreakChange = useCallback(
    (val: number) => {
      const clamped = Math.max(5, Math.min(15, val));
      setBreakMinutes(clamped);
      if (mode === "break") {
        setRemainingSeconds(clamped * 60);
        persist({ breakMinutes: clamped, remainingSeconds: clamped * 60 });
      } else {
        persist({ breakMinutes: clamped });
      }
    },
    [mode, persist]
  );

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const totalSeconds =
    mode === "work" ? workMinutes * 60 : breakMinutes * 60;
  const progress =
    totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 0;
  const circumference = 2 * Math.PI * 72;
  const strokeDashoffset = circumference * (1 - progress);
  const isBreakLocked = mode === "work" && remainingSeconds > 0;

  if (!isOpen && !closing) return null;

  return (
    <>
      {/* Backdrop — click outside to close */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-[280ms] ease-out ${
          closing
            ? "opacity-0"
            : "opacity-100"
        }`}
        style={{ backgroundColor: closing ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.08)", backdropFilter: closing ? "blur(0px)" : "blur(6px)", WebkitBackdropFilter: closing ? "blur(0px)" : "blur(6px)" }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-[380px] rounded-2xl border border-[rgba(210,190,170,0.18)] shadow-[0_30px_80px_rgba(42,33,28,0.15)] pointer-events-auto transition-all duration-[280ms] ease-out ${
            closing
              ? "opacity-0 scale-[0.96] translate-y-3 blur-[2px]"
              : "opacity-100 scale-100 translate-y-0 blur-0"
          }`}
          style={{
            backgroundColor: "rgba(250,246,240,0.95)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 flex size-7 items-center justify-center rounded-full text-[#8d8175]/60 transition-colors hover:bg-white/80 hover:text-[#2A211C]"
          >
            <X className="size-3.5" strokeWidth={2} />
          </button>

          <div className="flex flex-col px-6 pt-6 pb-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#2A211C]">
                <Timer className="size-4 text-[#f1d2a8]" strokeWidth={1.8} />
              </div>
              <h2 className="font-serif text-[18px] font-semibold tracking-tight text-[#2A1E17]">
                Pomodoro
              </h2>
            </div>

            {/* Mode toggle */}
            <div className="flex gap-1.5 mb-5">
              <button
                onClick={() => handleModeChange("work")}
                className={`flex-1 rounded-lg py-2 text-[11px] font-semibold uppercase tracking-wider transition-all ${
                  mode === "work"
                    ? "bg-[#2A211C] text-white shadow-sm"
                    : "bg-white/60 text-[#8d8175]/60 hover:bg-white/80 hover:text-[#2A211C]"
                }`}
              >
                <Timer className="mx-auto mb-0.5 size-3.5" strokeWidth={1.8} />
                Focus
              </button>
              <button
                onClick={() => handleModeChange("break")}
                disabled={isBreakLocked}
                title={isBreakLocked ? "Break unlocks after focus time ends" : "Switch to break"}
                className={`flex-1 rounded-lg py-2 text-[11px] font-semibold uppercase tracking-wider transition-all ${
                  mode === "break"
                    ? "bg-[#2A211C] text-white shadow-sm"
                    : isBreakLocked
                      ? "cursor-not-allowed bg-white/40 text-[#8d8175]/35"
                      : "bg-white/60 text-[#8d8175]/60 hover:bg-white/80 hover:text-[#2A211C]"
                }`}
              >
                <Coffee className="mx-auto mb-0.5 size-3.5" strokeWidth={1.8} />
                Break
              </button>
            </div>

            {/* Timer circle */}
            <div className="flex flex-col items-center">
              <div className="relative flex items-center justify-center mb-5">
                <svg width="200" height="200" className="-rotate-90">
                  <circle
                    cx="100"
                    cy="100"
                    r="82"
                    fill="none"
                    stroke="rgba(216,138,91,0.08)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="82"
                    fill="none"
                    stroke={mode === "work" ? "#2A211C" : "#D88A5B"}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>

                <div className="absolute flex flex-col items-center">
                  <span className="font-serif text-[52px] font-bold tracking-tight text-[#2A1E17] leading-none tabular-nums">
                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                  </span>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8d8175]/50">
                    {mode === "work" ? "Focus Time" : "Break Time"}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 mb-5">
                {!isRunning ? (
                  <button
                    onClick={handleStart}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2A211C] px-7 py-2.5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(42,33,28,0.2)] transition-all hover:bg-[#3D322B] hover:shadow-[0_6px_16px_rgba(42,33,28,0.25)]"
                  >
                    <Play className="size-3.5" strokeWidth={2} />
                    Start
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/80 px-7 py-2.5 text-xs font-semibold text-[#2A211C] shadow-sm transition-all hover:bg-white hover:shadow-md"
                  >
                    <Pause className="size-3.5" strokeWidth={2} />
                    Pause
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#D88A5B]/10 bg-white/50 px-4 py-2.5 text-xs font-semibold text-[#8d8175]/70 transition-all hover:bg-white/80 hover:text-[#2A211C]"
                >
                  <RotateCcw className="size-3.5" strokeWidth={1.8} />
                  Reset
                </button>
              </div>

              {/* Settings */}
              <div className="w-full">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-full text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8d8175]/40 transition-colors hover:text-[#8d8175]/70"
                >
                  {showSettings ? "Hide settings" : "Timer settings"}
                </button>

                {showSettings && (
                  <div className="mt-3 flex gap-4 rounded-xl bg-white/60 p-3">
                    <div className="flex-1">
                      <label className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8d8175]/50 mb-1.5">
                        Focus (min)
                      </label>
                      <div className="flex items-center gap-1">
                        {[15, 25, 30, 45, 60].map((val) => (
                          <button
                            key={val}
                            onClick={() => handleWorkChange(val)}
                            className={`flex-1 rounded-lg py-1.5 text-[10px] font-semibold transition-all ${
                              workMinutes === val
                                ? "bg-[#2A211C] text-white"
                                : "bg-white/70 text-[#8d8175]/60 hover:bg-white hover:text-[#2A211C]"
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8d8175]/50 mb-1.5">
                        Break (min)
                      </label>
                      <div className="flex items-center gap-1">
                        {[5, 10, 15].map((val) => (
                          <button
                            key={val}
                            onClick={() => handleBreakChange(val)}
                            className={`flex-1 rounded-lg py-1.5 text-[10px] font-semibold transition-all ${
                              breakMinutes === val
                                ? "bg-[#2A211C] text-white"
                                : "bg-white/70 text-[#8d8175]/60 hover:bg-white hover:text-[#2A211C]"
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
