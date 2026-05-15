"use client";

import Image, { type StaticImageData } from "next/image";
import { type MouseEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Play, Star } from "lucide-react";

import coastPainting from "@/utils/2.png";
import heroBackground from "@/utils/hero2.png";
import portraitPainting from "@/utils/3.png";
import palmsPainting from "@/utils/4.png";
import womanPainting from "@/utils/1.png";

const NAV_ITEMS = ["Features", "How It Works", "Languages", "Pricing", "About"];

const PARTICLES = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  left: `${12 + ((index * 19) % 78)}%`,
  top: `${16 + ((index * 23) % 70)}%`,
  delay: index * 0.28,
}));

const DUST = Array.from({ length: 48 }, (_, index) => ({
  id: index,
  left: `${8 + ((index * 17) % 86)}%`,
  top: `${10 + ((index * 29) % 76)}%`,
  delay: index * 0.34,
  size: `${1 + (index % 3) * 0.5}px`,
}));

const CELESTIAL_NODES = [
  { id: 0, left: "18%", top: "26%", size: "5px", delay: 0.1 },
  { id: 1, left: "31%", top: "12%", size: "4px", delay: 0.8 },
  { id: 2, left: "45%", top: "21%", size: "3px", delay: 1.4 },
  { id: 3, left: "62%", top: "18%", size: "5px", delay: 0.4 },
  { id: 4, left: "72%", top: "36%", size: "3px", delay: 1.1 },
  { id: 5, left: "77%", top: "61%", size: "4px", delay: 1.8 },
  { id: 6, left: "57%", top: "76%", size: "3px", delay: 0.6 },
  { id: 7, left: "36%", top: "72%", size: "4px", delay: 1.6 },
  { id: 8, left: "22%", top: "54%", size: "3px", delay: 0.9 },
  { id: 9, left: "49%", top: "46%", size: "4px", delay: 2.1 },
];

const learners = ["AF", "MR", "SK", "NL", "JD", "YS"];

interface ArtCardProps {
  alt: string;
  className: string;
  image: StaticImageData;
  priority?: boolean;
  sizes: string;
}

function ArtCard({ alt, className, image, priority, sizes }: ArtCardProps) {
  return (
    <div className={className}>
      <Image
        src={image}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
      />
    </div>
  );
}

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothPointerX = useSpring(pointerX, { stiffness: 42, damping: 26, mass: 0.8 });
  const smoothPointerY = useSpring(pointerY, { stiffness: 42, damping: 26, mass: 0.8 });
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 900], [0, -26]);
  const yMain = useTransform(scrollY, [0, 900], [0, 66]);
  const yNear = useTransform(scrollY, [0, 900], [0, -38]);
  const orbitBackX = useTransform(smoothPointerX, [-1, 1], [-8, 8]);
  const orbitBackY = useTransform(smoothPointerY, [-1, 1], [-6, 6]);
  const orbitFrontX = useTransform(smoothPointerX, [-1, 1], [-16, 16]);
  const orbitFrontY = useTransform(smoothPointerY, [-1, 1], [-12, 12]);
  const particleFieldX = useTransform(smoothPointerX, [-1, 1], [-10, 10]);
  const particleFieldY = useTransform(smoothPointerY, [-1, 1], [-8, 8]);
  const opacityParallax = useTransform(scrollY, [0, 520], [1, 0.9]);
  const navHeight = useTransform(scrollY, [0, 140], [76, 64]);
  const navY = useTransform(scrollY, [0, 140], [0, 8]);
  const navBackground = useTransform(
    scrollY,
    [0, 140],
    ["rgba(251, 247, 240, 0.42)", "rgba(251, 247, 240, 0.72)"],
  );
  const navShadow = useTransform(
    scrollY,
    [0, 140],
    [
      "0 18px 64px rgba(45, 34, 22, 0.05), 0 0 54px rgba(255, 250, 241, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.58), inset 0 -1px 0 rgba(120, 88, 58, 0.06)",
      "0 24px 82px rgba(45, 34, 22, 0.12), 0 0 76px rgba(212, 92, 60, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7), inset 0 -1px 0 rgba(120, 88, 58, 0.08)",
    ],
  );
  const navBackdrop = useTransform(scrollY, [0, 140], ["blur(18px) saturate(1.08)", "blur(30px) saturate(1.18)"]);

  const floatMain = shouldReduceMotion
    ? {}
    : { y: [0, -12, 0, 7, 0], x: [0, 4, 0, -3, 0], rotate: [-3.2, -2.2, -3, -3.8, -3.2], scale: [1, 1.012, 1.004, 1.016, 1] };
  const floatSoft = shouldReduceMotion
    ? {}
    : { y: [0, 10, 3, -4, 0], x: [0, -4, 2, 5, 0], rotate: [4, 5.6, 4.8, 3.5, 4] };
  const floatReverse = shouldReduceMotion
    ? {}
    : { y: [0, -9, -2, 6, 0], x: [0, 3, -2, -4, 0], rotate: [-6, -4.6, -5.4, -6.5, -6] };
  const orbitMotion = shouldReduceMotion
    ? {}
    : { rotate: [0, 360], scale: [1, 1.01, 1], opacity: [0.62, 0.82, 0.62] };

  function handleVisualPointerMove(event: MouseEvent<HTMLDivElement>) {
    if (shouldReduceMotion) return;

    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
  }

  function handleVisualPointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <section className="cinematic-hero relative min-h-screen overflow-visible pb-48 xl:pb-60">
      {/* Cinematic transition glow — bleeds into the next section */}
      <div className="cinematic-hero-glow" aria-hidden="true" />
      <div className="hero-shell relative min-h-screen overflow-visible bg-[var(--bg)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_62%_34%,rgba(255,188,140,0.15)_0%,rgba(240,140,110,0.05)_42%,transparent_72%),linear-gradient(115deg,rgba(255,230,210,0.22)_0%,rgba(250,210,195,0.12)_45%,rgba(220,160,180,0.05)_100%)] pointer-events-none" />
        <motion.div style={{ y: yBg }} className="hero-background-image absolute inset-0" aria-hidden="true">
          <Image
            src={heroBackground}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        <div className="hero-background-veil absolute inset-0 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.055] mix-blend-multiply pointer-events-none [background-image:url('data:image/svg+xml,%3Csvg_viewBox=%220_0_180_180%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter_id=%22n%22%3E%3CfeTurbulence_type=%22fractalNoise%22_baseFrequency=%220.72%22_numOctaves=%222%22_stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect_width=%22100%25%22_height=%22100%25%22_filter=%22url(%23n)%22_opacity=%220.6%22/%3E%3C/svg%3E')]" />
        <div className="hero-atmosphere hero-atmosphere-a" aria-hidden="true" />
        <div className="hero-atmosphere hero-atmosphere-b" aria-hidden="true" />
        <div className="hero-atmosphere hero-atmosphere-c" aria-hidden="true" />
        <div className="hero-fog-sheet" aria-hidden="true" />
        <div className="absolute right-[-6%] top-[12%] h-[780px] w-[880px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(212,92,60,0.12)_0%,rgba(240,165,130,0.15)_38%,transparent_72%)] blur-[40px] opacity-60 pointer-events-none" />
        <div className="absolute bottom-[5%] right-[-8%] h-[420px] w-[680px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,200,160,0.35)_0%,rgba(220,130,160,0.18)_46%,transparent_76%)] blur-[32px] opacity-60 pointer-events-none" />
        <div className="absolute bottom-[-12%] right-[2%] h-[360px] w-[560px] rounded-full border border-dashed border-accent/[0.12] opacity-80 pointer-events-none [mask-image:linear-gradient(to_bottom,transparent_0%,black_32%,transparent_100%)]" />
        {/* Full-bottom bleed gradient — extends deeply into the next section with rich tones */}
        <div className="absolute inset-x-[-12%] bottom-[-220px] h-[820px] bg-[linear-gradient(to_bottom,transparent_0%,rgba(250,225,210,0.25)_12%,rgba(250,210,195,0.78)_36%,rgba(245,195,175,0.85)_52%,rgba(240,185,160,0.65)_68%,transparent_100%)] pointer-events-none" />
        <div className="absolute inset-x-[-12%] bottom-[-280px] h-[560px] bg-[radial-gradient(ellipse_at_42%_24%,rgba(240,140,110,0.55)_0%,rgba(220,120,140,0.28)_38%,transparent_72%)] blur-[50px] pointer-events-none" />

        <motion.header
          style={{
            height: navHeight,
            y: navY,
            backgroundColor: navBackground,
            boxShadow: navShadow,
            backdropFilter: navBackdrop,
            WebkitBackdropFilter: navBackdrop,
          }}
          className="hero-navbar sticky top-3 z-40 mx-auto flex w-[calc(100%-1.25rem)] max-w-[1780px] items-center justify-between rounded-full border border-white/55 px-5 sm:top-4 sm:w-[calc(100%-2rem)] sm:px-7 lg:px-9"
        >
          <a
            href="#top"
            className="group relative inline-flex items-center gap-1.5 rounded-full px-2 py-2 text-lg font-semibold tracking-[-0.02em] text-foreground outline-none transition-colors duration-300 hover:text-foreground/78 focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:text-xl"
            translate="no"
          >
            LinguaBoard
            <span className="text-2xl leading-none text-accent transition-[transform,opacity] duration-500 group-hover:rotate-45 group-hover:opacity-85" aria-hidden="true">
              *
            </span>
          </a>

          <nav aria-label="Primary navigation" className="hidden items-center gap-9 rounded-full bg-background/24 px-8 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.36),inset_0_-1px_0_rgba(120,88,58,0.045)] backdrop-blur-xl lg:flex xl:gap-12 xl:px-10">
            {NAV_ITEMS.map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
                whileHover={shouldReduceMotion ? undefined : { y: -1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="group relative rounded-full px-1 py-1 text-sm font-medium text-foreground/70 outline-none transition-colors duration-300 hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                <span className="relative z-10">{item}</span>
                <span className="absolute -inset-x-3 -inset-y-2 z-0 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,250,241,0.72),transparent_70%)] opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute -bottom-1 left-1/2 h-px w-0 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(199,70,46,0.85),transparent)] opacity-0 transition-[width,opacity] duration-500 ease-out group-hover:w-full group-hover:opacity-100" />
              </motion.a>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <a
              href="#login"
              className="group relative hidden rounded-full px-2 py-2 text-sm font-medium text-foreground/72 outline-none transition-colors duration-300 hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:inline-flex"
            >
              Log In
              <span className="absolute bottom-1 left-1/2 h-px w-0 -translate-x-1/2 bg-accent/70 opacity-0 transition-[width,opacity] duration-500 ease-out group-hover:w-[72%] group-hover:opacity-100" />
            </a>
            <motion.a
              href="#start"
              whileHover={shouldReduceMotion ? undefined : { y: -2, x: 1, scale: 1.015 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="group relative inline-flex min-h-12 items-center gap-3 overflow-hidden rounded-full bg-foreground px-6 text-sm font-semibold text-background shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15),0_16px_42px_rgba(17,17,17,0.18)] outline-none transition-[box-shadow,background-color] duration-500 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22),0_22px_58px_rgba(17,17,17,0.24),0_0_54px_rgba(199,70,46,0.18)] focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(255,255,255,0.28)_0%,transparent_56%)] opacity-60 transition-opacity duration-500 group-hover:opacity-90" />
              <span className="absolute inset-y-0 left-[-45%] w-[38%] rotate-12 bg-white/18 blur-md transition-transform duration-700 ease-out group-hover:translate-x-[430%]" />
              <span className="relative">Try LinguaBoard</span>
              <ArrowUpRight className="relative size-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </motion.a>
          </div>
        </motion.header>

        <div className="pointer-events-none absolute left-6 top-[22%] z-20 hidden h-[74%] w-16 flex-col items-center justify-between xl:flex">
          <div className="h-44 w-px bg-gradient-to-b from-border/10 via-foreground/22 to-border/10" />
          <p className="rotate-180 [writing-mode:vertical-rl] text-[11px] font-semibold uppercase tracking-[0.46em] text-foreground/50">
            Discipline · Language · Growth
          </p>
          <span className="text-4xl font-heading text-foreground/48" aria-hidden="true">
            ✶
          </span>
        </div>

        <p className="pointer-events-none absolute right-12 top-[34%] z-20 hidden [writing-mode:vertical-rl] text-[11px] font-semibold uppercase tracking-[0.48em] text-accent/75 xl:block">
          LinguaBoard v1.0
        </p>

        <motion.div
          style={{ opacity: opacityParallax }}
          className="container relative z-10 mx-auto grid min-h-[calc(100svh-7rem)] items-center gap-8 px-5 pb-24 pt-10 sm:px-6 lg:grid-cols-12 lg:px-12 lg:pt-12 xl:pb-20 xl:pt-14"
        >
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-30 flex max-w-[44rem] flex-col lg:col-span-5 xl:pl-8"
          >
            <div className="mb-6 inline-flex items-center gap-4 2xl:mb-7">
              <span className="size-2.5 rounded-full bg-accent" />
              <span className="rounded-full border border-border/70 bg-surface/52 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-foreground/55 backdrop-blur-md">
                AI-Powered Learning OS
              </span>
            </div>

            <h1
              id="top"
              className="hero-headline scroll-mt-28 font-heading text-5xl font-medium leading-[0.94] tracking-normal text-foreground sm:text-6xl md:text-7xl lg:text-[5.15rem] xl:text-[5.65rem] 2xl:text-[6.1rem]"
            >
              <span className="block">Discover</span>
              <span className="block">
                the <span className="hero-world-word italic font-light">world</span>
              </span>
              <span className="block">with more</span>
              <span className="block">languages</span>
            </h1>

            <p className="mt-7 max-w-[360px] text-lg font-light leading-relaxed text-muted-foreground 2xl:mt-8 2xl:text-xl">
              Learn from anywhere and anytime with no pressure.
            </p>

            <figure className="mt-7 flex max-w-md gap-5 2xl:mt-8">
              <span className="font-heading text-4xl leading-none text-accent 2xl:text-5xl" aria-hidden="true">
                “
              </span>
              <blockquote>
                <p className="text-balance font-heading text-xl leading-snug text-foreground/86 2xl:text-2xl">
                  A different language is a different vision of life.
                </p>
                <figcaption className="mt-4 text-sm text-muted-foreground">— Federico Fellini</figcaption>
              </blockquote>
            </figure>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center 2xl:mt-10 2xl:gap-5">
              <a
                id="start"
                href="#features"
                className="inline-flex min-h-14 items-center justify-center gap-4 rounded-full bg-foreground px-7 text-sm font-semibold text-background shadow-[0_18px_42px_rgba(17,17,17,0.18)] outline-none transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_54px_rgba(17,17,17,0.22)] focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                Start Your Journey
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
              <button
                type="button"
                className="inline-flex min-h-14 items-center justify-center gap-4 rounded-full border border-border/70 bg-surface/28 px-7 text-sm font-semibold text-foreground/82 shadow-[0_12px_32px_rgba(17,17,17,0.035)] outline-none backdrop-blur-md transition-[transform,border-color,background-color,color] duration-200 hover:-translate-y-0.5 hover:border-accent/35 hover:bg-surface/55 hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                Watch Demo
                <Play className="size-3.5 fill-current" aria-hidden="true" />
              </button>
            </div>
          </motion.div>

          <div
            className="hero-visual relative hidden h-[680px] -translate-y-6 lg:col-span-7 lg:block xl:h-[700px] 2xl:h-[730px]"
            onMouseMove={handleVisualPointerMove}
            onMouseLeave={handleVisualPointerLeave}
          >
            <motion.div
              style={{ x: orbitBackX, y: orbitBackY }}
              className="hero-celestial-field hero-celestial-field-back absolute inset-[-12%]"
              aria-hidden="true"
            >
              <motion.div
                className="hero-celestial-bloom absolute left-[18%] top-[10%] h-[620px] w-[760px]"
                animate={shouldReduceMotion ? undefined : { opacity: [0.5, 0.82, 0.5], scale: [1, 1.035, 1] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="hero-celestial-orbit hero-celestial-orbit-a absolute left-[13%] top-[10%] h-[610px] w-[760px]"
                animate={shouldReduceMotion ? undefined : { rotate: [0, 360] }}
                transition={{ duration: 140, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="hero-celestial-orbit hero-celestial-orbit-b absolute left-[6%] top-[19%] h-[520px] w-[900px]"
                animate={shouldReduceMotion ? undefined : { rotate: [360, 0] }}
                transition={{ duration: 172, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="hero-celestial-orbit hero-celestial-orbit-c absolute left-[24%] top-[7%] h-[640px] w-[540px]"
                animate={shouldReduceMotion ? undefined : { rotate: [0, -360] }}
                transition={{ duration: 118, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>

            <motion.div
              style={{ x: orbitFrontX, y: orbitFrontY }}
              className="hero-celestial-field hero-celestial-field-front absolute inset-[-12%]"
              aria-hidden="true"
            >
              <motion.div
                className="hero-celestial-orbit hero-celestial-orbit-d absolute left-[18%] top-[17%] h-[500px] w-[710px]"
                animate={shouldReduceMotion ? undefined : { rotate: [0, 360], opacity: [0.38, 0.62, 0.38] }}
                transition={{ duration: 96, repeat: Infinity, ease: "linear" }}
              />
              {CELESTIAL_NODES.map((node) => (
                <motion.span
                  key={node.id}
                  className="hero-orbit-node absolute rounded-full"
                  style={{ left: node.left, top: node.top, width: node.size, height: node.size }}
                  animate={shouldReduceMotion ? undefined : { opacity: [0.3, 0.92, 0.3], scale: [0.72, 1.24, 0.72] }}
                  transition={{ duration: 4.8, delay: node.delay, repeat: Infinity, ease: "easeInOut" }}
                />
              ))}
            </motion.div>

            <motion.div style={{ y: yBg }} className="hero-generated-orbit-system absolute inset-[-8%]">
              <motion.div
                animate={orbitMotion}
                transition={{ duration: 92, repeat: Infinity, ease: "linear" }}
                className="hero-orbit absolute left-[12%] top-[12%] size-[700px] rounded-full"
              />
              <motion.div
                animate={shouldReduceMotion ? undefined : { rotate: [360, 0], opacity: [0.54, 0.76, 0.54] }}
                transition={{ duration: 118, repeat: Infinity, ease: "linear" }}
                className="hero-orbit hero-orbit-dashed absolute left-[4%] top-[19%] size-[860px] rounded-full"
              />
              <motion.div
                animate={shouldReduceMotion ? undefined : { rotate: [0, -360], scale: [1, 0.992, 1], opacity: [0.5, 0.72, 0.5] }}
                transition={{ duration: 76, repeat: Infinity, ease: "linear" }}
                className="hero-orbit hero-orbit-inner absolute left-[24%] top-[24%] size-[540px] rounded-full"
              />
              <motion.div
                animate={shouldReduceMotion ? undefined : { x: [0, 12, -6, 0], y: [0, -8, 8, 0], scale: [1, 1.035, 0.99, 1] }}
                transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-[18%] top-[20%] h-[570px] w-[680px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(17,17,17,0.14)_0%,rgba(17,17,17,0.065)_31%,transparent_61%)] opacity-42 [mask-image:radial-gradient(circle,black_0%,black_42%,transparent_72%)]"
              />
              <motion.div
                animate={shouldReduceMotion ? undefined : { x: [0, -8, 5, 0], y: [0, 7, -5, 0], opacity: [0.2, 0.28, 0.2] }}
                transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
                className="hero-globe-lines absolute left-[17%] top-[18%] h-[600px] w-[700px]"
              />
              <div className="absolute left-[5%] top-[10%] h-[760px] w-[900px] bg-[radial-gradient(ellipse_at_center,rgba(255,250,241,0.62)_0%,rgba(239,223,211,0.28)_48%,transparent_76%)] blur-[48px]" />
              <motion.div
                animate={shouldReduceMotion ? undefined : { opacity: [0.72, 0.98, 0.72], scale: [1, 1.04, 1] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[2%] right-[-2%] h-[300px] w-[440px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(212,92,60,0.105)_0%,rgba(239,223,211,0.2)_42%,transparent_72%)] blur-[56px]"
              />
              <div className="hero-globe-haze absolute left-[19%] top-[17%] h-[620px] w-[760px]" />
            </motion.div>

            <motion.div style={{ x: particleFieldX, y: particleFieldY }} className="absolute inset-[-4%] z-10" aria-hidden="true">
              {DUST.map((dust) => (
                <motion.span
                  key={dust.id}
                  className="hero-dust absolute rounded-full"
                  style={{ left: dust.left, top: dust.top, width: dust.size, height: dust.size }}
                  animate={shouldReduceMotion ? undefined : { x: [0, 9, -4, 0], y: [0, -13, 6, 0], opacity: [0.06, 0.3, 0.12, 0.06] }}
                  transition={{ duration: 11 + (dust.id % 7), delay: dust.delay, repeat: Infinity, ease: "easeInOut" }}
                />
              ))}

              {PARTICLES.map((particle) => (
                <motion.span
                  key={particle.id}
                  className="hero-light-particle absolute rounded-full"
                  style={{ left: particle.left, top: particle.top }}
                  animate={shouldReduceMotion ? undefined : { x: [0, 5, -2, 0], y: [0, -8, 4, 0], opacity: [0.14, 0.58, 0.14], scale: [0.64, 1.05, 0.64] }}
                  transition={{ duration: 7.2, delay: particle.delay, repeat: Infinity, ease: "easeInOut" }}
                />
              ))}
            </motion.div>

            <motion.div
              style={{ y: yMain }}
              animate={floatMain}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="hero-art-frame absolute left-[22%] top-[24%] z-40 h-[390px] w-[276px] rotate-[1deg] rounded-[9px] bg-[#eee7da] p-3 shadow-[0_26px_80px_rgba(32,23,14,0.16),0_100px_180px_rgba(32,23,14,0.08)] xl:h-[420px] xl:w-[298px] 2xl:h-[440px] 2xl:w-[312px]"
            >
              <div className="hero-image-surface relative h-full w-full overflow-hidden rounded-[5px]">
                <Image
                  src={womanPainting}
                  alt="Painting of a woman with a green umbrella in a field"
                  fill
                  priority
                  sizes="318px"
                  className="object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              animate={floatReverse}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              className="hero-note-card absolute left-[6%] top-[-2%] z-30 w-[136px] rotate-[-5deg] rounded-[18px] border border-white/70 bg-surface/62 p-5 shadow-[0_22px_60px_rgba(32,23,14,0.1)] backdrop-blur-xl xl:w-[142px]"
            >
              <p className="font-heading text-2xl leading-none text-foreground">mundo</p>
              <p className="mt-2 text-xs text-muted-foreground">/ˈmundo/</p>
              <div className="my-4 h-px bg-border/60" />
              <p className="text-sm text-foreground/62">мир</p>
            </motion.div>

            <motion.div
              style={{ y: yNear }}
              animate={floatSoft}
              transition={{ duration: 19, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="hero-note-card absolute left-[-4%] top-[70%] z-30 w-[198px] rotate-[8deg] rounded-[18px] border border-white/70 bg-surface/68 p-5 shadow-[0_24px_66px_rgba(32,23,14,0.105)] backdrop-blur-xl xl:w-[214px]"
            >
              <p className="font-heading text-2xl leading-none text-foreground">hello</p>
              <p className="mt-1.5 text-xs text-muted-foreground">/həˈloʊ/</p>
              <div className="my-4 h-px bg-border/60" />
              <p className="text-sm text-foreground/62">привет</p>
            </motion.div>

            <motion.div
              animate={floatSoft}
              transition={{ duration: 21, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
              className="hero-glyph-card absolute right-[2%] top-[50%] z-50 flex h-[170px] w-[142px] rotate-[13deg] flex-col items-center justify-center rounded-[16px] bg-[#d9bd8e]/88 p-5 shadow-[0_28px_78px_rgba(32,23,14,0.16)] xl:h-[182px] xl:w-[152px]"
            >
              <span className="font-heading text-7xl leading-none text-foreground">学</span>
              <span className="mt-3 text-xs italic text-foreground/72">xué</span>
              <span className="mt-1 text-sm text-foreground/70">to learn</span>
            </motion.div>

            <motion.div
              animate={floatSoft}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              className="absolute right-[-4%] top-[6%] z-30 h-[114px] w-[204px] xl:h-[124px] xl:w-[220px]"
            >
              <ArtCard
                image={palmsPainting}
                alt="Warm landscape painting with palm trees"
                sizes="220px"
                className="hero-small-art relative h-full w-full rotate-[6deg] overflow-hidden rounded-[9px] border-[8px] border-[#f4eee5] bg-surface shadow-[0_24px_64px_rgba(32,23,14,0.14)]"
              />
            </motion.div>

            <motion.div
              animate={floatReverse}
              transition={{ duration: 17, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              className="absolute left-[44%] top-[86%] z-40 h-[132px] w-[112px] xl:h-[144px] xl:w-[120px]"
            >
              <ArtCard
                image={portraitPainting}
                alt="Small portrait painting"
                sizes="126px"
                className="hero-small-art relative h-full w-full rotate-[-5deg] overflow-hidden rounded-[9px] shadow-[0_22px_58px_rgba(32,23,14,0.16)]"
              />
            </motion.div>

            <motion.div
              animate={floatSoft}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute bottom-[-10%] right-[4%] z-30 h-[138px] w-[212px] xl:h-[150px] xl:w-[230px]"
            >
              <ArtCard
                image={coastPainting}
                alt="Coastal landscape painting"
                sizes="238px"
                className="hero-small-art relative h-full w-full rotate-[-4deg] overflow-hidden rounded-[10px] shadow-[0_26px_70px_rgba(32,23,14,0.15)]"
              />
            </motion.div>
          </div>
        </motion.div>

        <div className="absolute bottom-8 left-1/2 z-30 hidden -translate-x-1/2 flex-col items-center gap-4 xl:flex">
          <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-foreground/48">
            Join thousands of learners worldwide
          </p>
          <div className="flex items-center gap-5">
            <div className="flex -space-x-2">
              {learners.map((learner, index) => (
                <span
                  key={learner}
                  className="flex size-8 items-center justify-center rounded-full border-2 border-[var(--bg)] bg-foreground text-[9px] font-semibold text-background shadow-[0_8px_22px_rgba(17,17,17,0.12)]"
                  style={{ opacity: 0.72 + index * 0.04 }}
                >
                  {learner}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-lg font-medium text-foreground">
              <span>4.9/5</span>
              <span className="flex gap-1 text-accent" aria-label="Rated 4.9 out of 5">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star key={index} className="size-4 fill-current" aria-hidden="true" />
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
