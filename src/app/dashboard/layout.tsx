"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer";
import { useStudyTracker } from "@/hooks/use-study-tracker";
import { useAuthStore } from "@/store/auth-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const setStreak = useAuthStore((s) => s.setStreak);
  const pathname = usePathname();
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const showPomodoro = !pathname.startsWith("/dashboard/settings");

  useStudyTracker();

  const refreshStreak = useCallback(async () => {
    try {
      const res = await fetch("/api/study/streak");
      if (!res.ok) return;
      const data = await res.json();
      if (typeof data?.streak === "number") {
        setStreak(data.streak);
      }
    } catch {
      // Keep the previous sidebar value if the refresh fails.
    }
  }, [setStreak]);

  useEffect(() => {
    refreshStreak();
    const interval = setInterval(refreshStreak, 60_000);
    return () => clearInterval(interval);
  }, [refreshStreak]);

  return (
    <div
      className="min-h-screen font-sans text-[#2A211C] selection:bg-[#D88A5B]/20"
      style={{
        background: "linear-gradient(180deg, #f7f2ea 0%, #f3eee6 100%)",
      }}
    >
      {/* Subtle warm lighting — global */}
      <div className="pointer-events-none fixed -right-32 -top-32 z-0 size-[350px] rounded-full bg-[#D88A5B]/2 blur-[60px]" />
      <div className="pointer-events-none fixed -left-32 bottom-0 z-0 size-[250px] rounded-full bg-[#D88A5B]/1.5 blur-[50px]" />

      {/* Subtle noise texture — global */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.012] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Global Sidebar — persists across all dashboard routes */}
      <Sidebar />

      {showPomodoro && (
        <>
          <PomodoroTimer isOpen={isPomodoroOpen} onClose={() => setIsPomodoroOpen(false)} />

          <button
            onClick={() => setIsPomodoroOpen((prev) => !prev)}
            className={`group fixed bottom-24 right-5 z-50 flex size-14 items-center justify-center rounded-full transition-all duration-[350ms] ease-out hover:-translate-y-1 hover:scale-[1.04] md:bottom-7 md:right-7 md:size-[68px] ${
              isPomodoroOpen
                ? "scale-[0.96] opacity-80 shadow-[0_8px_24px_rgba(40,20,10,0.15)]"
                : "shadow-[0_14px_40px_rgba(40,20,10,0.25),0_0_40px_rgba(220,170,110,0.18)] hover:shadow-[0_20px_50px_rgba(40,20,10,0.35),0_0_60px_rgba(220,170,110,0.25)]"
            }`}
            style={{
              background: isPomodoroOpen
                ? "linear-gradient(145deg, #3a2920 0%, #2d1f18 100%)"
                : "linear-gradient(145deg, #2d1f18 0%, #3a2920 100%)",
              border: isPomodoroOpen
                ? "1px solid rgba(255,255,255,0.04)"
                : "1px solid rgba(255,255,255,0.08)",
            }}
            aria-label={isPomodoroOpen ? "Close Pomodoro Timer" : "Open Pomodoro Timer"}
          >
            <div
              className={`pointer-events-none absolute inset-0 rounded-full blur-sm transition-opacity duration-300 ${
                isPomodoroOpen ? "opacity-0" : "bg-[rgba(220,170,110,0.06)] opacity-100"
              }`}
            />

            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f1d2a8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative z-10"
            >
              <path d="M12 2a10 10 0 1 0 10 10" />
              <path d="M12 6v6l4 2" />
              <path d="M20 2v6" />
              <path d="M17 5h6" />
            </svg>
          </button>
        </>
      )}

      {/* Main content area — offset by sidebar width */}
      <div className="relative z-10 md:pl-[220px]">
        <main className="mx-auto max-w-[1440px] px-4 pb-28 pt-4 sm:px-6 md:px-8 md:py-5">
          {children}
        </main>
      </div>
    </div>
  );
}
