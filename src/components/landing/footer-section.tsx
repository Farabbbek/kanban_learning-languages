"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import footerBg from "@/utils/footer1.png";
import { CheckCircle2, Loader2, Play } from "lucide-react";

const FOOTER_LINKS = {
  product: ["Features", "TaskFlow", "LinguaLab", "AI Agent", "Smart Quizzes", "Spaced Repetition", "Analytics"],
  learn: ["How it works", "Languages", "Study Methods", "Pricing", "Resources", "Blog"],
  company: ["About", "Careers", "Contact", "Privacy", "Terms", "Security"],
};

const socials = [
  { name: "X", icon: "X" },
  { name: "Instagram", icon: "IG" },
  { name: "YouTube", icon: "YT" },
  { name: "Discord", icon: "DC" },
];

export function FooterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Successfully subscribed!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <footer className="relative w-full overflow-hidden bg-[#f7f2ed]">
      {/* ================================================================ */}
      {/* CINEMATIC HERO — centered editorial composition                  */}
      {/* ================================================================ */}
      <section className="relative flex min-h-[480px] w-full items-center justify-center overflow-hidden">
        {/* Artwork — fades in softly from the right, no hard edge */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url(${footerBg.src})`,
            backgroundSize: "cover",
            backgroundPosition: "top right",
            backgroundRepeat: "no-repeat",
            filter: "brightness(1.02) contrast(0.94) saturate(0.92)",
            WebkitMaskImage:
              "linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0) 100%)",
            maskImage:
              "linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0) 100%)",
          }}
        />

        {/* Cinematic cream overlay — softer atmospheric fade */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to left, rgba(247,242,235,0) 45%, rgba(247,242,235,0.75) 78%, rgba(247,242,235,1) 100%)",
          }}
        />

        {/* Soft blur haze over center-left transition */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 35% 50%, rgba(247,242,237,0.6) 0%, rgba(247,242,237,0.2) 40%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />

        {/* Soft atmospheric haze */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(212,92,60,0.012)_0%,transparent_50%)]" />

        {/* Gentle vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(circle at 45% 50%, transparent 45%, rgba(0,0,0,0.02) 100%)" }}
        />

        {/* VERY SUBTLE RADIAL AMBIENT GLOW — ultra-premium section depth */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, rgba(255,255,255,0.45), transparent 70%)",
          }}
        />

        {/* ================================================================ */}
        {/* CENTERED CONTENT — one-line headline, luxury editorial          */}
        {/* ================================================================ */}
        <div className="relative z-10 w-full px-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-[980px] text-center"
          >
            {/* Eyebrow */}
            <p className="mb-6 text-[12px] font-semibold uppercase tracking-[0.42em] text-[rgba(10,10,10,0.42)]">
              Your journey starts now
            </p>

            {/* Headline — single line, elegant, rich black */}
            <h2
              className="font-serif font-[500] leading-[0.94] tracking-[-0.05em] text-[#0a0a0a]"
              style={{
                fontSize: "clamp(64px, 5.8vw, 104px)",
                WebkitFontSmoothing: "antialiased",
                textRendering: "geometricPrecision",
              }}
            >
              Discipline becomes{" "}
              <span
                className="font-[500] font-serif italic text-[#c96f46]"
                style={{
                  color: "#c96f46",
                  fontStyle: "italic",
                  fontWeight: 500,
                }}
              >
                freedom.
              </span>
            </h2>

            {/* Subtext */}
            <p
              className="mx-auto mt-6 max-w-[620px] font-light leading-[1.55] text-[rgba(10,10,10,0.72)]"
              style={{ fontSize: "21px" }}
            >
              Step into LinguaBoard and build the future you.
            </p>

            {/* Buttons — centered */}
            <div className="mt-9 flex flex-col items-center justify-center gap-[18px] sm:flex-row">
              <motion.a
                href="#start"
                whileHover={{ y: -1.5, scale: 1.006 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-[#050505] px-8 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.10)] outline-none transition-[box-shadow,transform] duration-300 hover:shadow-[0_18px_42px_rgba(0,0,0,0.14),0_0_40px_rgba(197,107,71,0.04)] focus-visible:ring-2 focus-visible:ring-[#c56b47]/35 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f7f2ed]"
                style={{ borderRadius: "999px" }}
              >
                Start Your Journey
              </motion.a>
              <button
                type="button"
                className="group inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full border border-[rgba(10,10,10,0.08)] bg-[rgba(255,255,255,0.7)] px-7 text-sm font-medium text-[#333] backdrop-blur-[10px] transition-[border-color,background-color,box-shadow] duration-300 hover:border-[#c56b47]/20 hover:bg-white/85 hover:shadow-[0_8px_24px_rgba(160,120,90,0.04)] focus-visible:ring-2 focus-visible:ring-[#c56b47]/35 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f7f2ed]"
              >
                <Play className="size-3 fill-current" aria-hidden="true" />
                Watch Film
              </button>
            </div>

            {/* Decorative star */}
            <span className="pointer-events-none mx-auto mt-14 block font-serif text-lg text-[#c96d45]/12">✦</span>
          </motion.div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FOOTER GRID                                                     */}
      {/* ================================================================ */}
      <section className="relative w-full px-8 pb-6 lg:px-16 xl:px-20">
        {/* Divider */}
        <div className="mb-12 h-px w-full bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.04)] to-transparent" />

        {/* 5-column grid */}
        <div className="mx-auto grid max-w-[1600px] gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {/* COL 1 — Brand */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-lg font-semibold tracking-[-0.02em] text-[#0a0a0a] transition-opacity hover:opacity-80"
            >
              LinguaBoard
              <span className="text-2xl leading-none text-[#c96d45]">*</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm font-light leading-[1.9] text-[rgba(10,10,10,0.72)]">
              AI-powered operating system for language learning, productivity and personal growth.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href="#"
                  aria-label={social.name}
                  className="flex size-9 items-center justify-center rounded-full bg-[#e5dcd1]/30 text-[11px] font-semibold tracking-wide text-[rgba(10,10,10,0.72)]/80 transition-all duration-300 hover:bg-[#e5dcd1]/60 hover:text-[rgba(10,10,10,1)]"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* COL 2 — Product */}
          <div>
            <p className="mb-5 text-[12px] font-semibold uppercase tracking-[0.24em] text-[rgba(10,10,10,0.5)]">Product</p>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replaceAll(" ", "-")}`}
                    className="text-sm text-[rgba(10,10,10,0.72)] transition-colors duration-200 ease-in-out hover:text-[rgba(10,10,10,1)]"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 3 — Learn */}
          <div>
            <p className="mb-5 text-[12px] font-semibold uppercase tracking-[0.24em] text-[rgba(10,10,10,0.5)]">Learn</p>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.learn.map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replaceAll(" ", "-")}`}
                    className="text-sm text-[rgba(10,10,10,0.72)] transition-colors duration-200 ease-in-out hover:text-[rgba(10,10,10,1)]"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 4 — Company */}
          <div>
            <p className="mb-5 text-[12px] font-semibold uppercase tracking-[0.24em] text-[rgba(10,10,10,0.5)]">Company</p>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replaceAll(" ", "-")}`}
                    className="text-sm text-[rgba(10,10,10,0.72)] transition-colors duration-200 ease-in-out hover:text-[rgba(10,10,10,1)]"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 5 — Newsletter + Quote */}
          <div>
            <p className="mb-5 text-[12px] font-semibold uppercase tracking-[0.24em] text-[rgba(10,10,10,0.5)]">Stay inspired</p>
            <p className="mb-4 text-sm font-light leading-relaxed text-[rgba(10,10,10,0.72)]">
              Get tips, updates and exclusive resources.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={status === "loading"}
                className="min-h-[46px] flex-1 rounded-full border border-[#e5dcd1]/60 bg-white/55 px-5 text-sm text-[#333] placeholder:text-[#8a7b70]/35 outline-none transition-[border-color] duration-200 focus:border-[#c96d45]/30 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-[#0a0a0a] px-6 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(17,17,17,0.06)] transition-[box-shadow,opacity] duration-300 hover:shadow-[0_14px_36px_rgba(17,17,17,0.12)] disabled:opacity-60"
              >
                {status === "loading" ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : status === "success" ? (
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                ) : null}
                {status === "loading" ? "Sending…" : status === "success" ? "Subscribed" : "Subscribe"}
              </button>
            </form>
            {message && (
              <p
                className={`mt-2 text-xs ${
                  status === "success" ? "text-[#2d7a4a]" : "text-[#c56b47]"
                }`}
              >
                {message}
              </p>
            )}

            {/* Quote */}
            <div className="mt-8">
              <span className="font-serif text-3xl leading-none text-[#c96d45]/20">&ldquo;</span>
              <p className="mt-1 font-serif text-sm leading-relaxed italic text-[rgba(10,10,10,0.72)]">
                The roots of education are bitter,<br />
                but the fruit is sweet.
              </p>
              <p className="mt-2 text-xs text-[rgba(10,10,10,0.5)]">&mdash; Aristotle</p>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* BOTTOM BAR */}
        {/* ================================================================ */}
        <div className="mx-auto mt-14 max-w-[1600px]">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.04)] to-transparent" />
          <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-[11px] font-light text-[rgba(10,10,10,0.5)]">
              &copy; 2025 LinguaBoard. All rights reserved.
            </p>
            <span className="font-serif text-base text-[#c96d45]/15">✦</span>
            <p className="text-[11px] font-light text-[rgba(10,10,10,0.5)]">
              Made with &hearts; for lifelong learners worldwide.
            </p>
          </div>
        </div>
      </section>
    </footer>
  );
}
