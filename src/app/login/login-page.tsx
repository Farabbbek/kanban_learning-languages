"use client";

import { useCallback, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { motion } from "framer-motion";
import loginBg from "@/utils/login.png";

/** Deterministic pseudo-random for stable SSR */
function hash(n: number): number {
  let h = n;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = (h >> 16) ^ h;
  return Math.abs(h);
}

const FLOATING_PARTICLES = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  x: `${6 + ((i * 23) % 88)}%`,
  y: `${8 + ((i * 17) % 82)}%`,
  delay: i * 0.3,
  size: `${1.5 + (i % 5) * 0.7}px`,
}));

const LEFT_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: `${8 + ((i * 29) % 84)}%`,
  y: `${6 + ((i * 19) % 88)}%`,
  delay: i * 0.4,
  size: `${1 + (i % 4) * 0.5}px`,
}));

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
      }
    } catch {
      setError("Failed to sign in. Please try again.");
      setIsLoading(false);
    }
  }, []);

  const particleDrift = useMemo(
    () =>
      FLOATING_PARTICLES.map((_, i) => ({
        x: ((hash(i * 37) % 200) - 100) / 10,
        y: ((hash(i * 41) % 160) - 80) / 10,
      })),
    [],
  );

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-[#f8f3ee]">
      {/* =================================================== */}
      {/* LEFT PANEL — Cinematic Artwork (48%)               */}
      {/* =================================================== */}
      <div className="relative hidden w-[48%] overflow-hidden md:block">
        {/* ARTWORK — deep cinematic grade */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${loginBg.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "contrast(1.08) saturate(1.08) brightness(0.96)",
          }}
        />

        {/* CINEMATIC VIGNETTE — soft atmospheric edge darkening */}
        <div
          className="absolute inset-0 z-5"
          style={{
            background: "radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.12) 100%)",
          }}
        />

        {/* DARK CINEMATIC LEFT VIGNETTE — readability + depth */}
        <div
          className="absolute inset-0 z-5"
          style={{
            background: "linear-gradient(to right, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.10) 28%, transparent 55%)",
          }}
        />

        {/* WARM GOLDEN OVERLAY — subtle renaissance tone */}
        <div
          className="absolute inset-0 z-5"
          style={{
            background: "linear-gradient(to bottom, rgba(214,144,92,0.06) 0%, rgba(0,0,0,0.08) 100%)",
          }}
        />

        {/* MINIMAL OVERLAYS */}
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/[0.015] via-transparent to-black/[0.008]" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#f8f3ee]/5 via-transparent to-transparent" />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-[#f8f3ee]/6" />

        {/* FOG FADE NEAR SPLIT CENTER — smooth right-edge blend */}
        <div className="absolute inset-y-0 right-0 z-10 w-48 bg-gradient-to-r from-transparent to-[#f8f3ee]/10 pointer-events-none" />

        {/* FLOATING DUST PARTICLES */}
        {LEFT_PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute z-20 rounded-full bg-white/10"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -12, 0],
              opacity: [0.02, 0.08, 0.02],
            }}
            transition={{
              duration: 10 + (p.id % 8),
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* LOGO — dark minimal, more visible */}
        <div className="absolute left-12 top-12 z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 tracking-[-0.02em] transition-opacity hover:opacity-80"
          >
            <span className="text-lg font-semibold text-[#0a0a0a]">LinguaBoard</span>
            <span className="text-2xl leading-none text-[#c96b43]">*</span>
          </Link>
        </div>

        {/* SOFT GLOW BEHIND QUOTE — readability in bright sky */}
        <div
          className="absolute left-1/2 top-[30%] z-15 h-48 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle at center, rgba(255,245,230,0.18) 0%, transparent 70%)",
          }}
        />

        {/* QUOTE — editorial, refined scale, right-shifted */}
        <div className="absolute left-[58%] top-[30%] z-20 -translate-x-1/2 -translate-y-1/2" style={{ width: "min(420px, 60vw)" }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              className="font-serif font-medium leading-[1.35] tracking-wide"
              style={{
                fontSize: "clamp(26px, 2.2vw, 38px)",
                color: "#17120f",
                textShadow: "0 2px 14px rgba(255,255,255,0.14)",
              }}
            >
              A different language<br />
              is a different vision of life.
            </p>
            <p
              className="mt-[22px] text-[13px] font-light tracking-widest"
              style={{
                color: "rgba(0,0,0,0.45)",
                textShadow: "0 1px 6px rgba(255,255,255,0.08)",
              }}
            >
              — Federico Fellini
            </p>
          </motion.div>
        </div>

        {/* BOTTOM FADE — cinematic emptiness */}
        <div className="absolute bottom-0 left-0 right-0 z-10 h-36 bg-gradient-to-t from-[#f8f3ee]/12 to-transparent" />
      </div>

      {/* =================================================== */}
      {/* RIGHT PANEL — Login Content (52%)                  */}
      {/* =================================================== */}
      <div className="relative flex w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#fcf8f2] via-[#f8f3ee] to-[#f5ede4] md:w-[52%]">
        {/* SOFT EDGE TRANSITION — blends left panel seamlessly */}
        <div className="pointer-events-none absolute inset-y-0 -left-24 w-32 bg-gradient-to-r from-[#f8f3ee]/70 to-transparent z-10" />

        {/* Warm radial glow behind content */}
        <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,248,240,0.6)_0%,rgba(197,107,71,0.035)_38%,transparent_65%)]" />

        {/* Abstract orbit lines */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 140, repeat: Infinity, ease: "linear" }}
            className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#e5dcd1]/20"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
            className="absolute left-1/2 top-1/2 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#e5dcd1]/15"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 220, repeat: Infinity, ease: "linear" }}
            className="absolute left-1/2 top-1/2 h-[1300px] w-[1300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#e5dcd1]/8"
          />
        </div>

        {/* Floating golden particles */}
        {FLOATING_PARTICLES.map((p, i) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-[#c56b47]/18"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
            }}
            animate={{
              x: [0, particleDrift[i]?.x ?? 0, 0],
              y: [0, particleDrift[i]?.y ?? 0, 0],
              opacity: [0.06, 0.3, 0.06],
            }}
            transition={{
              duration: 12 + (i % 10),
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Vertical decorative text */}
        <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 lg:block">
          <p className="rotate-180 text-[10px] font-semibold uppercase tracking-[0.5em] text-[#8d8175]/18 [writing-mode:vertical-rl]">
            Discipline · Language · Growth
          </p>
        </div>

        {/* Bottom-right decorative star */}
        <div className="pointer-events-none absolute bottom-8 right-8 hidden lg:block">
          <span className="font-serif text-2xl text-[#c56b47]/25">✦</span>
        </div>

        {/* ============================================= */}
        {/* CONTENT — centered login form               */}
        {/* ============================================= */}
        <div className="relative z-10 mx-auto w-full max-w-[540px] px-10 py-20 md:py-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
          >
            {/* Top label */}
            <p className="mb-10 text-[10px] font-semibold uppercase tracking-[0.4em] text-[#8d8175]/45">
              Welcome back
            </p>

            {/* Main heading */}
            <h1 className="font-serif text-5xl leading-[1.15] tracking-tight text-[#111] sm:text-6xl lg:text-7xl">
              Log in to your
              <br />
              <span className="font-serif text-[#c56b47] font-light italic drop-shadow-[0_1px_2px_rgba(197,107,71,0.08)]">
                LinguaBoard.
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-7 max-w-[420px] text-base font-light leading-relaxed text-[#8d8175]">
              Access your learning system, continue your journey and stay disciplined.
            </p>

            {/* Google button with warm glow behind */}
            <div className="relative mt-12 w-full">
              {/* Subtle glow behind button */}
              <div className="absolute left-1/2 top-1/2 h-28 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(197,107,71,0.06)_0%,transparent_60%)] blur-[20px]" />

              <motion.div
                className="relative w-full"
                whileHover={{ scale: 1.012 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="group flex h-20 w-full items-center justify-center gap-4 rounded-2xl border border-[#e5dcd1]/60 bg-white/55 px-8 shadow-[0_12px_40px_rgba(160,120,90,0.07),0_4px_12px_rgba(160,120,90,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition-all duration-400 hover:border-[#c56b47]/30 hover:bg-white/75 hover:shadow-[0_20px_60px_rgba(160,120,90,0.12),0_0_50px_rgba(197,107,71,0.08),inset_0_1px_0_rgba(255,255,255,1)] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <svg className="size-6 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-base font-semibold text-[#333] transition-colors group-hover:text-[#111]">
                      {isLoading ? "Redirecting…" : "Continue with Google"}
                    </span>
                  </button>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 text-sm text-[#c56b47]"
                    >
                      {error}
                    </motion.p>
                  )}
              </motion.div>
            </div>

            {/* Divider */}
            <div className="mt-10 flex w-full items-center gap-5">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e5dcd1]/40 to-transparent" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#8d8175]/35">
                More options soon
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e5dcd1]/40 to-transparent" />
            </div>

            {/* Bottom features */}
            <div className="mt-12 grid w-full grid-cols-3 gap-6">
              {[
                {
                  icon: (
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  ),
                  title: "Secure",
                  desc: "Your data protected",
                },
                {
                  icon: (
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                    </svg>
                  ),
                  title: "AI-Powered",
                  desc: "Smart learning engine",
                },
                {
                  icon: (
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: "Always with you",
                  desc: "Cross-device sync",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col items-center gap-3 rounded-xl px-2 py-5 text-center transition-colors hover:bg-white/30"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-[#c56b47]/8 text-[#c56b47]">
                    {feature.icon}
                  </span>
                  <p className="text-xs font-semibold text-[#333]">{feature.title}</p>
                  <p className="text-[10px] font-light leading-relaxed text-[#8d8175]">{feature.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}