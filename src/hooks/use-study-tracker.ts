"use client";

import { useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "lingua-study-session";

interface SessionState {
  sessionId: string | null;
  date: string;
  minutes: number;
}

/**
 * Auto-tracks study time:
 * - Creates a study session on mount
 * - Ticks every 60s to update duration
 * - Persists sessionId in localStorage so it survives refresh
 * - Ends session on unmount / beforeunload
 */
export function useStudyTracker() {
  const sessionIdRef = useRef<string | null>(null);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const minutesRef = useRef(0);

  const startSession = useCallback(async () => {
    try {
      const res = await fetch("/api/study/start", { method: "POST" });
      if (!res.ok) return;
      const data = await res.json();
      sessionIdRef.current = data.id;
      minutesRef.current = 0;

      // Persist to localStorage
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          sessionId: data.id,
          date: new Date().toISOString().split("T")[0],
          minutes: 0,
        } satisfies SessionState)
      );

      // Start ticker — every 60 seconds
      tickIntervalRef.current = setInterval(async () => {
        if (!sessionIdRef.current) return;
        minutesRef.current += 1;
        try {
          await fetch(`/api/study/${sessionIdRef.current}/tick`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ duration_minutes: minutesRef.current }),
          });
        } catch {
          // silent fail
        }
      }, 60_000);
    } catch {
      // silent fail
    }
  }, []);

  const endSession = useCallback(async () => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
    if (sessionIdRef.current) {
      try {
        await fetch(`/api/study/${sessionIdRef.current}/end`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ duration_minutes: minutesRef.current }),
        });
      } catch {
        // silent fail
      }
      sessionIdRef.current = null;
    }
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    // Check localStorage for existing session
    const stored = localStorage.getItem(STORAGE_KEY);
    const today = new Date().toISOString().split("T")[0];

    if (stored) {
      try {
        const parsed: SessionState = JSON.parse(stored);
        if (parsed.date === today && parsed.sessionId) {
          // Resume existing session
          sessionIdRef.current = parsed.sessionId;
          minutesRef.current = parsed.minutes;

          // Resume ticker
          tickIntervalRef.current = setInterval(async () => {
            if (!sessionIdRef.current) return;
            minutesRef.current += 1;
            try {
              await fetch(`/api/study/${sessionIdRef.current}/tick`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ duration_minutes: minutesRef.current }),
              });
            } catch {
              // silent fail
            }
          }, 60_000);

          return; // Don't start a new session
        }
      } catch {
        // corrupted storage, start fresh
      }
    }

    // Start new session
    startSession();

    return () => {
      endSession();
    };
  }, [startSession, endSession]);

  // End session on tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
      if (sessionIdRef.current) {
        // Use sendBeacon for reliable delivery
        const payload = JSON.stringify({ duration_minutes: minutesRef.current });
        navigator.sendBeacon(
          `/api/study/${sessionIdRef.current}/end`,
          new Blob([payload], { type: "application/json" })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [endSession]);
}
