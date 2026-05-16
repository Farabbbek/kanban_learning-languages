"use client";

import { useCallback, useRef, useState } from "react";

/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */

export type TtsStatus = "idle" | "loading" | "playing" | "error";

export interface TtsState {
  status: TtsStatus;
  wordId: string | null;
  error: string | null;
}

export interface TtsOptions {
  /** Playback speed: 0.75 | 1 | 1.25 */
  speed?: number;
}

/* ──────────────────────────────────────────────
   LANGUAGE → BROWSER VOICE MAP
   ────────────────────────────────────────────── */

const LANGUAGE_BCP47: Record<string, string> = {
  english: "en-US",
  french: "fr-FR",
  spanish: "es-ES",
  chinese: "zh-CN",
  japanese: "ja-JP",
  korean: "ko-KR",
  german: "de-DE",
  italian: "it-IT",
  portuguese: "pt-BR",
  russian: "ru-RU",
};

/* ──────────────────────────────────────────────
   IN-MEMORY AUDIO CACHE
   ────────────────────────────────────────────── */

const audioCache = new Map<string, string>(); // key → base64 data

function cacheKey(text: string, language: string, speed: number): string {
  return `${language}:${speed}:${text.toLowerCase().trim()}`;
}

/* ──────────────────────────────────────────────
   BROWSER SPEECHSYNTHESIS (PRIMARY)
   ────────────────────────────────────────────── */

// macOS Siri neural voice names for each language
const PREMIUM_VOICES: Record<string, string[]> = {
  english:   ["Samantha", "Karen", "Moira", "Fiona", "Tessa", "Veena", "Amalee"],
  french:    ["Amélie", "Stéphanie", "Claire", "Daniel"],
  spanish:   ["Mónica", "Paulina", "Jorge", "Juan"],
  chinese:   ["Tingting", "Sinji", "Meijia", "Xiaoxiao"],
  japanese:  ["Kyoko", "Otoya", "Hattori"],
  korean:    ["Yuna", "Nari", "Seoyeon"],
  german:    ["Anna", "Petra", "Markus"],
  italian:   ["Alice", "Federica", "Luca"],
  portuguese:["Luciana"], // Brazilian

  russian:   ["Milena", "Katya"],
};

function speakViaBrowser(
  text: string,
  language: string,
  speed: number,
  onStart: () => void,
  onEnd: () => void,
  onError: (err: string) => void
): () => void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onError("Speech synthesis not supported");
    return () => {};
  }

  window.speechSynthesis.cancel();

  const bcp47 = LANGUAGE_BCP47[language] || "en-US";
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = bcp47;
  utterance.rate = speed * 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1;

  // Find the best voice: premium/siri > enhanced > local > any
  const allVoices = window.speechSynthesis.getVoices();
  const preferredNames = PREMIUM_VOICES[language] || [];

  const preferredVoice =
    // 1. Try matching by preferred name
    (preferredNames.length > 0
      ? allVoices.find((v) => preferredNames.some((n) => v.name.includes(n)))
      : null) ||
    // 2. Try "Neural" (macOS/Siri)
    allVoices.find((v) => v.lang.startsWith(bcp47.split("-")[0]) && v.name.includes("Neural")) ||
    // 3. Try "Premium"
    allVoices.find((v) => v.lang.startsWith(bcp47.split("-")[0]) && v.name.includes("Premium")) ||
    // 4. Try local service
    allVoices.find((v) => v.lang.startsWith(bcp47.split("-")[0]) && v.localService) ||
    // 5. Any voice for this language
    allVoices.find((v) => v.lang.startsWith(bcp47.split("-")[0]));

  if (preferredVoice) utterance.voice = preferredVoice;

  let finished = false;
  utterance.onstart = () => {
    finished = false;
    onStart();
  };
  utterance.onend = () => {
    if (!finished) {
      finished = true;
      onEnd();
    }
  };
  utterance.onerror = (e) => {
    if (!finished) {
      finished = true;
      // Chrome sometimes cancels speech mid-way — ignore gracefully
      if (e.error === "canceled" || e.error === "interrupted") {
        onEnd();
      } else {
        onError("Browser speech error: " + e.error);
      }
    }
  };

  window.speechSynthesis.speak(utterance);

  // Safety timeout — some voices may not fire onend on all browsers
  const timeout = setTimeout(() => {
    if (!finished) {
      finished = true;
      onEnd();
    }
  }, text.length * 120 + 2000);

  return () => {
    clearTimeout(timeout);
    finished = true;
    window.speechSynthesis.cancel();
  };
}


/* ──────────────────────────────────────────────
   PREMIUM TTS HOOK
   ────────────────────────────────────────────── */

export function usePremiumTts(options: TtsOptions = {}) {
  const { speed = 1.0 } = options;
  const [state, setState] = useState<TtsState>({ status: "idle", wordId: null, error: null });
  const cancelRef = useRef<() => void>(() => {});

  /** Check cache for existing audio */
  const getCached = useCallback((text: string, language: string): string | undefined => {
    return audioCache.get(cacheKey(text, language, speed));
  }, [speed]);

  /** Store in cache */
  const setCached = useCallback((text: string, language: string, data: string) => {
    audioCache.set(cacheKey(text, language, speed), data);
    // Keep cache under 200 entries
    if (audioCache.size > 200) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey) audioCache.delete(firstKey);
    }
  }, [speed]);

  /** Play from base64 audio data */
  const playAudio = useCallback((base64: string, format: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio(`data:audio/${format};base64,${base64}`);
        audio.preload = "auto";
        audio.onended = () => resolve();
        audio.onerror = (e) => reject(e);
        cancelRef.current = () => {
          audio.pause();
          audio.currentTime = 0;
          resolve();
        };
        audio.play().catch((e) => {
          console.warn("Audio play failed, trying browser fallback:", e);
          reject(e);
        });
      } catch (e) {
        reject(e);
      }
    });
  }, []);


  /** Pronounce a word — the main API */
  const pronounce = useCallback(
    async (wordId: string, text: string, language: string) => {
      // Cancel any current playback
      cancelRef.current();
      setState({ status: "loading", wordId, error: null });

      try {
        // 1. Check cache first
        const cached = getCached(text, language);
        if (cached) {
          setState({ status: "playing", wordId, error: null });
          await playAudio(cached, "mp3");
          setState({ status: "idle", wordId: null, error: null });
          return;
        }

        // 2. Try TTS API
        const res = await fetch("/api/vocabulary/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language, speed }),
        });

        const data = await res.json();

        if (data.audioContent && data.format) {
          // Cache the result
          setCached(text, language, data.audioContent);
          setState({ status: "playing", wordId, error: null });
          await playAudio(data.audioContent, data.format);
          setState({ status: "idle", wordId: null, error: null });
          return;
        }

        // 3. Fallback to browser speech synthesis
        if (data.fallback) {
          await new Promise<void>((resolve, reject) => {
            cancelRef.current = speakViaBrowser(
              text,
              language,
              speed,
              () => setState({ status: "playing", wordId, error: null }),
              () => {
                setState({ status: "idle", wordId: null, error: null });
                resolve();
              },
              (err) => {
                setState({ status: "error", wordId, error: err });
                reject(new Error(err));
              }
            );
          });
          return;
        }

        throw new Error("No audio available");
      } catch (err) {
        console.warn("TTS error, trying browser fallback:", err);

        // Last resort: browser speech
        try {
          await new Promise<void>((resolve, reject) => {
            cancelRef.current = speakViaBrowser(
              text,
              language,
              speed,
              () => setState({ status: "playing", wordId, error: null }),
              () => {
                setState({ status: "idle", wordId: null, error: null });
                resolve();
              },
              (e) => {
                setState({ status: "error", wordId, error: e });
                reject(new Error(e));
              }
            );
          });
        } catch {
          setState({ status: "error", wordId, error: "All TTS methods failed" });
        }
      }
    },
    [speed, getCached, setCached, playAudio]
  );

  /** Cancel current playback */
  const cancel = useCallback(() => {
    cancelRef.current();
    setState({ status: "idle", wordId: null, error: null });
  }, []);

  /** Preload audio into cache (silent) */
  const preload = useCallback(
    async (text: string, language: string) => {
      if (getCached(text, language)) return; // Already cached

      try {
        const res = await fetch("/api/vocabulary/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language, speed }),
        });
        const data = await res.json();
        if (data.audioContent && data.format) {
          setCached(text, language, data.audioContent);
        }
      } catch {
        // Silent fail — will use fallback during actual play
      }
    },
    [speed, getCached, setCached]
  );

  return {
    state,
    pronounce,
    cancel,
    preload,
    isPlaying: state.status === "playing",
    isLoading: state.status === "loading",
  };
}
