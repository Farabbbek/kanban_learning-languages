"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Compass,
  Feather,
  Flame,
  Headphones,
  LibraryBig,
  LineChart,
  Mic2,
  MessageCircle,
  NotebookTabs,
  Orbit,
  Play,
  Quote,
  Search,
  Settings2,
  Sparkles,
  Target,
  WandSparkles,
} from "lucide-react";
import { domAnimation, LazyMotion, m, useReducedMotion, useScroll, useTransform } from "framer-motion";

import section2Bg from "@/utils/section2.png";

const sidebarItems = [
  { icon: Compass, label: "Workspace", active: true },
  { icon: BookOpen, label: "Sessions" },
  { icon: LibraryBig, label: "Vocabulary" },
  { icon: Brain, label: "AI Insights" },
  { icon: LineChart, label: "Journey" },
  { icon: NotebookTabs, label: "Notebook" },
  { icon: Settings2, label: "Settings" },
];

const metrics = [
  {
    icon: Clock3,
    label: "Study Time",
    value: "2h 34m",
    detail: "+18m yesterday",
    path: "M2 24 C10 20 14 21 22 16 C30 11 36 14 44 9 C52 5 57 8 64 4",
  },
  {
    icon: LibraryBig,
    label: "Words Learned",
    value: "1,248",
    detail: "+156 this week",
    bars: [6, 8, 7, 11, 15, 13, 20, 28],
  },
  {
    icon: Target,
    label: "Daily Goal",
    value: "78%",
    detail: "39 / 50 tasks",
    ring: true,
  },
  {
    icon: Flame,
    label: "Streak",
    value: "28",
    detail: "days in a row",
    dots: 7,
  },
  {
    icon: Sparkles,
    label: "Accuracy",
    value: "92%",
    detail: "+6% this week",
    path: "M2 25 C11 22 15 19 22 21 C31 23 35 14 43 13 C51 12 56 9 64 6",
  },
];

const focusCards = [
  {
    icon: Mic2,
    title: "Current Session",
    language: "Italian Speaking",
    copy: "Practice a market dialogue with gentle AI corrections.",
    progress: 72,
    meta: "18 min left",
  },
  {
    icon: Headphones,
    title: "Listening Room",
    language: "French Shadowing",
    copy: "Slow cinema clips with phrase-by-phrase repetition.",
    progress: 48,
    meta: "B1 rhythm",
  },
  {
    icon: Feather,
    title: "Writing Ritual",
    language: "Spanish Journal",
    copy: "Turn today’s notes into more natural phrases.",
    progress: 34,
    meta: "7 prompts",
  },
];

const learningPanels = [
  { label: "Vocabulary Orbit", value: "340", unit: "review-ready", tone: "from-[#d06d46]/22 to-[#f0c58b]/20" },
  { label: "Grammar Drift", value: "12", unit: "patterns unlocked", tone: "from-[#7d8f74]/18 to-[#c8d1a4]/18" },
  { label: "AI Confidence", value: "High", unit: "pronunciation trend", tone: "from-[#a87751]/18 to-[#e6baa2]/18" },
];

const journey = ["Spanish", "Italian", "French", "Japanese"];

const steps = [
  {
    number: "01",
    title: "Create Your Learning System",
    copy: "Set your goals, choose your languages, and build a calm weekly rhythm.",
    icon: Compass,
  },
  {
    number: "02",
    title: "Generate With AI",
    copy: "AI builds personalized vocabulary, lessons, and exercises around your context.",
    icon: WandSparkles,
  },
  {
    number: "03",
    title: "Study & Practice",
    copy: "Move through flashcards, listening, speaking, writing, and focused quizzes.",
    icon: Headphones,
  },
  {
    number: "04",
    title: "Track & Grow",
    copy: "Measure consistency, accuracy, recall strength, and the next best action.",
    icon: LineChart,
  },
];

const testimonials = [
  {
    name: "Michael T.",
    language: "Learning Japanese",
    quote: "The spaced repetition system is insanely effective. My vocabulary growth never stopped.",
  },
  {
    name: "Anna K.",
    language: "Learning French",
    quote: "I love how everything is connected: tasks, quizzes, AI feedback. It keeps me consistent.",
  },
  {
    name: "David R.",
    language: "Learning Chinese",
    quote: "Finally a platform that combines productivity and language learning in such a beautiful way.",
  },
];

const particles = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${8 + ((index * 23) % 86)}%`,
  top: `${10 + ((index * 31) % 76)}%`,
  delay: `${index * 0.42}s`,
}));

function MetricChart({ metric }: { metric: (typeof metrics)[number] }) {
  if (metric.bars) {
    return (
      <div className="mt-5 flex h-8 items-end gap-1.5" aria-hidden="true">
        {metric.bars.map((bar) => (
          <span
            key={bar}
            className="w-1 rounded-full bg-[#c76745]/55"
            style={{ height: `${bar}px` }}
          />
        ))}
      </div>
    );
  }

  if (metric.ring) {
    return (
      <div className="mt-4 size-12 rounded-full bg-[conic-gradient(from_120deg,#c76745_0deg,#c76745_280deg,rgba(93,64,42,0.08)_280deg)] p-1.5" aria-hidden="true">
        <div className="size-full rounded-full bg-[#fbf4e8]/90 shadow-[inset_0_1px_8px_rgba(93,64,42,0.08)]" />
      </div>
    );
  }

  if (metric.dots) {
    return (
      <div className="mt-5 flex items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: metric.dots }, (_, index) => (
          <span key={index} className="size-1.5 rounded-full bg-[#c76745]/55 shadow-[0_0_10px_rgba(199,103,69,0.32)]" />
        ))}
      </div>
    );
  }

  return (
    <svg className="mt-5 h-8 w-20 overflow-visible text-[#c76745]/55" viewBox="0 0 66 30" aria-hidden="true">
      <path d={metric.path} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
      <path d={metric.path} fill="none" stroke="rgba(255,255,255,0.72)" strokeLinecap="round" strokeWidth="0.45" />
    </svg>
  );
}

export function OperatingSystemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const workspaceY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [22, -26]);
  const glowY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [18, -48]);
  const orbitRotate = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [-10, 18]);

  return (
    <LazyMotion features={domAnimation}>
      <m.section
        ref={sectionRef}
        className="cinematic-next-section relative -mt-px overflow-hidden pb-28 pt-12 sm:pt-14 lg:pt-16"
      >
        <div className="absolute inset-0 z-[-3]">
          <Image
            src={section2Bg}
            alt=""
            fill
            sizes="100vw"
            quality={62}
            loading="lazy"
            className="object-cover object-top opacity-[0.18] mix-blend-luminosity"
          />
        </div>
        <div className="absolute inset-0 z-[-2] bg-[#fbf4e8]/70 mix-blend-multiply" />
        <div className="absolute inset-x-0 top-0 z-[-1] h-[50vh] bg-gradient-to-b from-[var(--bg)] via-[var(--bg)]/82 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-[-1] h-[34vh] bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/88 to-transparent" />
        <div className="cinematic-transition-texture absolute inset-x-[-10%] top-[-300px] z-[1] h-[720px] opacity-[0.045]" aria-hidden="true" />

        <m.div
          style={{ y: glowY }}
          className="pointer-events-none absolute left-[8%] top-[20%] h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(207,116,74,0.18),rgba(239,196,139,0.12)_38%,transparent_70%)] blur-3xl"
          aria-hidden="true"
        />
        <m.div
          style={{ rotate: orbitRotate }}
          className="workspace-orbit-lines pointer-events-none absolute right-[-10rem] top-[6rem] h-[44rem] w-[44rem]"
          aria-hidden="true"
        />
        <div className="workspace-fog pointer-events-none absolute inset-x-[-10%] top-[18%] h-[42rem]" aria-hidden="true" />
        <div className="workspace-grain pointer-events-none absolute inset-0 z-[2]" aria-hidden="true" />
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="workspace-particle pointer-events-none absolute z-[3] rounded-full"
            style={{ left: particle.left, top: particle.top, animationDelay: particle.delay }}
            aria-hidden="true"
          />
        ))}

        <div id="features" className="container relative z-10 mx-auto grid scroll-mt-24 items-center gap-16 px-6 lg:grid-cols-12 lg:px-8 xl:gap-20">
          <div className="relative flex flex-col justify-center lg:col-span-4 lg:pr-4">
            <div className="mb-8 inline-flex w-fit items-center gap-3 rounded-full border border-[#7c5a3a]/10 bg-white/32 px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_16px_48px_rgba(93,64,42,0.06)] backdrop-blur-xl">
              <span className="size-1.5 rounded-full bg-[#c76745] shadow-[0_0_14px_rgba(199,103,69,0.62)]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#5d402a]/72">
                Language Operating System
              </span>
            </div>

            <h2 className="max-w-md text-pretty font-heading text-4xl font-medium leading-[1.05] text-[#261d16] sm:text-5xl lg:text-[3.45rem]">
              A quiet cinematic workspace for serious language momentum.
            </h2>
            <p className="mt-7 max-w-sm text-[15px] font-light leading-relaxed text-[#6f5b49]/88">
              LinguaBoard turns daily study into an elegant ritual: one place for focus sessions,
              vocabulary memory, AI feedback, and the long arc of fluency.
            </p>

            <div className="mt-12 grid gap-3">
              {learningPanels.map((panel) => (
                <div
                  key={panel.label}
                  className="group grid grid-cols-[1fr_auto] items-center gap-5 rounded-[8px] border border-white/48 bg-white/28 p-4 shadow-[0_18px_60px_rgba(93,64,42,0.055),inset_0_1px_0_rgba(255,255,255,0.68)] backdrop-blur-2xl transition-[transform,border-color,background-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-white/80 hover:bg-white/46 hover:shadow-[0_22px_74px_rgba(93,64,42,0.08),inset_0_1px_0_rgba(255,255,255,0.82)]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#2a2018]">{panel.label}</p>
                    <p className="mt-1 truncate text-xs text-[#735f4e]/76">{panel.unit}</p>
                  </div>
                  <span className={`rounded-[8px] bg-gradient-to-br ${panel.tone} px-4 py-2 font-heading text-xl text-[#3b2b20] shadow-[inset_0_1px_0_rgba(255,255,255,0.58)]`}>
                    {panel.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <m.div
            style={{ y: workspaceY }}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1 }}
            viewport={{ once: true, margin: "-12%" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative lg:col-span-8"
          >
            <div className="absolute inset-x-[8%] -top-12 h-40 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.72),rgba(207,116,74,0.1)_52%,transparent_74%)] blur-3xl" aria-hidden="true" />

            <div className="workspace-frame relative overflow-hidden rounded-[22px] border border-white/68 bg-white/36 p-2 shadow-[0_42px_120px_rgba(62,42,29,0.14),0_16px_46px_rgba(199,103,69,0.055),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-2xl">
              <div className="relative flex min-h-[760px] overflow-hidden rounded-[16px] border border-[#6b4b34]/8 bg-[#fbf4e8]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
                <aside className="hidden w-60 shrink-0 flex-col justify-between border-r border-[#6b4b34]/8 bg-white/26 p-5 backdrop-blur-2xl md:flex">
                  <div>
                    <a
                      href="#top"
                      className="group mb-9 flex items-center gap-3 rounded-full px-2 py-2 outline-none transition-colors duration-200 hover:text-[#c76745] focus-visible:ring-2 focus-visible:ring-[#c76745]/40 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fbf4e8]"
                    >
                      <span className="flex size-9 items-center justify-center rounded-full bg-[#231915] text-[#fbf4e8] shadow-[0_14px_34px_rgba(35,25,21,0.18)]">
                        <Orbit className="size-4" aria-hidden="true" />
                      </span>
                      <span className="font-heading text-xl font-medium text-[#241a13]" translate="no">
                        LinguaBoard
                      </span>
                    </a>

                    <nav aria-label="Workspace navigation" className="space-y-1.5">
                      {sidebarItems.map((item) => {
                        const Icon = item.icon;

                        return (
                          <a
                            key={item.label}
                            href="#features"
                            aria-current={item.active ? "page" : undefined}
                            className={`group flex min-h-10 items-center gap-3 rounded-[8px] px-3 text-[13px] font-semibold outline-none transition-[background-color,color,box-shadow,transform] duration-200 hover:-translate-y-px hover:bg-white/42 hover:text-[#3a291e] focus-visible:ring-2 focus-visible:ring-[#c76745]/40 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fbf4e8] ${
                              item.active
                                ? "bg-white/58 text-[#c76745] shadow-[0_14px_34px_rgba(199,103,69,0.10),inset_0_1px_0_rgba(255,255,255,0.78)]"
                                : "text-[#786250]/72"
                            }`}
                          >
                            <Icon className="size-4" strokeWidth={1.7} aria-hidden="true" />
                            <span>{item.label}</span>
                          </a>
                        );
                      })}
                    </nav>
                  </div>

                  <div className="rounded-[8px] border border-white/56 bg-[#fffaf2]/44 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
                    <p className="font-heading text-lg leading-tight text-[#2d2118]">Premium Studio</p>
                    <p className="mt-2 text-xs leading-relaxed text-[#725d4b]/78">AI pronunciation, memory maps, and deep review rituals.</p>
                    <button
                      type="button"
                      className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-full bg-[#231915] px-4 text-xs font-semibold text-[#fff8ed] shadow-[0_14px_34px_rgba(35,25,21,0.18)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#3a2a20] hover:shadow-[0_18px_44px_rgba(35,25,21,0.22)] focus-visible:ring-2 focus-visible:ring-[#c76745]/40 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fbf4e8]"
                    >
                      Upgrade
                      <ChevronRight className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </aside>

                <div className="min-w-0 flex-1 overflow-hidden">
                  <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#6b4b34]/8 bg-white/24 px-5 py-5 backdrop-blur-xl lg:px-7">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a7356]/72">Good morning, Alex</p>
                      <h3 className="mt-1 truncate font-heading text-3xl font-medium text-[#241a13]">Today’s Learning Atelier</h3>
                    </div>

                    <div className="flex min-w-0 items-center gap-2">
                      <label className="relative hidden min-w-0 sm:block">
                        <span className="sr-only">Search Learning Workspace</span>
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8b715f]/70" aria-hidden="true" />
                        <input
                          name="workspace-search"
                          type="search"
                          autoComplete="off"
                          placeholder="Search notes…"
                          className="h-10 w-52 rounded-full border border-[#6b4b34]/10 bg-white/38 pl-9 pr-4 text-sm text-[#2c2119] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-[#8b715f]/54 focus-visible:border-[#c76745]/35 focus-visible:bg-white/56 focus-visible:ring-2 focus-visible:ring-[#c76745]/28"
                        />
                      </label>
                      <button
                        type="button"
                        aria-label="Open Calendar"
                        className="flex size-10 items-center justify-center rounded-full border border-[#6b4b34]/10 bg-white/38 text-[#66513f] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition-[transform,background-color,color] duration-200 hover:-translate-y-0.5 hover:bg-white/62 hover:text-[#241a13] focus-visible:ring-2 focus-visible:ring-[#c76745]/35 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fbf4e8]"
                      >
                        <CalendarDays className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label="Open Notifications"
                        className="flex size-10 items-center justify-center rounded-full border border-[#6b4b34]/10 bg-white/38 text-[#66513f] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition-[transform,background-color,color] duration-200 hover:-translate-y-0.5 hover:bg-white/62 hover:text-[#241a13] focus-visible:ring-2 focus-visible:ring-[#c76745]/35 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fbf4e8]"
                      >
                        <Bell className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </header>

                  <div className="workspace-dashboard-scroll h-[calc(760px-81px)] overflow-y-auto px-5 py-6 lg:px-7">
                    <section aria-labelledby="workspace-metrics-title">
                      <h4 id="workspace-metrics-title" className="sr-only">Learning Metrics</h4>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        {metrics.map((metric) => {
                          const Icon = metric.icon;

                          return (
                            <article key={metric.label} className="dashboard-panel min-w-0 rounded-[8px] p-4">
                              <div className="flex items-center gap-2 text-[#6e5946]/75">
                                <Icon className="size-4" strokeWidth={1.6} aria-hidden="true" />
                                <p className="truncate text-xs font-semibold">{metric.label}</p>
                              </div>
                              <p className="mt-4 font-heading text-3xl font-medium leading-none text-[#2a1e16] tabular-nums">{metric.value}</p>
                              <p className="mt-2 truncate text-[11px] text-[#816b58]/72">{metric.detail}</p>
                              <MetricChart metric={metric} />
                            </article>
                          );
                        })}
                      </div>
                    </section>

                    <section aria-labelledby="focus-title" className="mt-5 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
                      <div className="dashboard-panel rounded-[8px] p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a7356]/72">Focus Flow</p>
                            <h4 id="focus-title" className="mt-1 font-heading text-2xl font-medium text-[#241a13]">Continue Learning</h4>
                          </div>
                          <button
                            type="button"
                            className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#6b4b34]/10 bg-white/36 px-4 text-xs font-semibold text-[#624d3c] transition-[transform,background-color,color] duration-200 hover:-translate-y-0.5 hover:bg-white/64 hover:text-[#241a13] focus-visible:ring-2 focus-visible:ring-[#c76745]/35 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fbf4e8]"
                          >
                            View All
                            <ChevronRight className="size-3.5" aria-hidden="true" />
                          </button>
                        </div>

                        <div className="mt-5 grid gap-3">
                          {focusCards.map((card) => {
                            const Icon = card.icon;

                            return (
                              <article key={card.title} className="group grid gap-4 rounded-[8px] border border-[#6b4b34]/8 bg-white/28 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.62)] transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-white/46 hover:shadow-[0_16px_44px_rgba(93,64,42,0.07)] sm:grid-cols-[auto_1fr_auto] sm:items-center">
                                <span className="flex size-11 items-center justify-center rounded-[8px] bg-[#fff6ea]/70 text-[#c76745] shadow-[inset_0_1px_0_rgba(255,255,255,0.76),0_12px_28px_rgba(199,103,69,0.08)]">
                                  <Icon className="size-5" strokeWidth={1.6} aria-hidden="true" />
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-[#2d2118]">{card.title}</p>
                                  <p className="mt-1 truncate text-xs font-semibold text-[#c76745]/88">{card.language}</p>
                                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#725d4b]/82">{card.copy}</p>
                                </div>
                                <div className="min-w-[9rem]">
                                  <div className="mb-2 flex items-center justify-between text-[11px] text-[#816b58]/76">
                                    <span>{card.meta}</span>
                                    <span className="tabular-nums">{card.progress}%</span>
                                  </div>
                                  <div className="h-1.5 overflow-hidden rounded-full bg-[#6b4b34]/8">
                                    <span className="block h-full rounded-full bg-[#c76745]/72" style={{ width: `${card.progress}%` }} />
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </div>

                      <aside className="grid gap-4">
                        <article className="dashboard-panel rounded-[8px] p-5">
                          <div className="flex items-center gap-3">
                            <span className="flex size-10 items-center justify-center rounded-full bg-[#2a2018] text-[#fbf4e8]">
                              <WandSparkles className="size-4" aria-hidden="true" />
                            </span>
                            <div>
                              <h4 className="font-heading text-xl font-medium text-[#241a13]">AI Insight</h4>
                              <p className="text-xs text-[#826a56]/74">Updated after your last session</p>
                            </div>
                          </div>
                          <p className="mt-5 text-pretty font-heading text-xl leading-snug text-[#37281d]">
                            Your sentence rhythm improves fastest when you shadow short cinematic dialogue before speaking.
                          </p>
                          <button
                            type="button"
                            className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#231915] px-4 text-xs font-semibold text-[#fff8ed] shadow-[0_14px_34px_rgba(35,25,21,0.18)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#3a2a20] hover:shadow-[0_18px_44px_rgba(35,25,21,0.22)] focus-visible:ring-2 focus-visible:ring-[#c76745]/40 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fbf4e8]"
                          >
                            Start Drill
                            <Play className="size-3.5 fill-current" aria-hidden="true" />
                          </button>
                        </article>

                        <article className="dashboard-panel rounded-[8px] p-5">
                          <h4 className="font-heading text-xl font-medium text-[#241a13]">Language Journey</h4>
                          <div className="mt-5 space-y-3">
                            {journey.map((language, index) => (
                              <div key={language} className="grid grid-cols-[5rem_1fr_auto] items-center gap-3">
                                <span className="truncate text-xs font-semibold text-[#5f4a39]">{language}</span>
                                <span className="h-1.5 overflow-hidden rounded-full bg-[#6b4b34]/8">
                                  <span className="block h-full rounded-full bg-[#c76745]/65" style={{ width: `${82 - index * 13}%` }} />
                                </span>
                                <span className="text-[11px] tabular-nums text-[#816b58]/74">{82 - index * 13}%</span>
                              </div>
                            ))}
                          </div>
                        </article>
                      </aside>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </m.div>
        </div>

        <div className="container relative z-10 mx-auto mt-24 px-6 lg:px-8">
          <section id="how-it-works" aria-labelledby="journey-title" className="scroll-mt-24 grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#8c6549]/76">Your Journey</p>
              <h2 id="journey-title" className="mt-5 max-w-md font-heading text-4xl font-medium leading-[1.04] text-[#261d16] sm:text-5xl">
                How LinguaBoard <span className="italic text-[#b94025]">works</span>
              </h2>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-[#6f5b49]/84">
                A simple path to mastering any language with AI, structured practice, and beautiful daily consistency.
              </p>
              <a
                href="#languages"
                className="mt-8 inline-flex min-h-11 items-center gap-3 rounded-full border border-[#6b4b34]/10 bg-white/38 px-5 text-xs font-semibold text-[#2d2118] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-white/64 hover:shadow-[0_16px_38px_rgba(93,64,42,0.08)] focus-visible:ring-2 focus-visible:ring-[#c76745]/35 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fbf4e8]"
              >
                Explore Features
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <m.article
                    key={step.number}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-12%" }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className="dashboard-panel min-h-[18rem] rounded-[8px] p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-heading text-2xl text-[#261d16]">{step.number}</span>
                      <span className="flex size-11 items-center justify-center rounded-full bg-[#fff6ea]/70 text-[#c76745] shadow-[inset_0_1px_0_rgba(255,255,255,0.76),0_12px_28px_rgba(199,103,69,0.08)]">
                        <Icon className="size-5" strokeWidth={1.6} aria-hidden="true" />
                      </span>
                    </div>
                    <div className="mt-14">
                      <h3 className="font-heading text-2xl font-medium leading-tight text-[#2b2018]">{step.title}</h3>
                      <p className="mt-4 text-sm leading-relaxed text-[#725d4b]/84">{step.copy}</p>
                    </div>
                  </m.article>
                );
              })}
            </div>
          </section>

          <section id="languages" aria-labelledby="ai-agent-title" className="relative mt-24 scroll-mt-24 overflow-hidden rounded-[14px] bg-[#16110d] px-6 py-10 text-[#fff8ed] shadow-[0_42px_120px_rgba(30,20,13,0.22)] sm:px-10 lg:px-14 lg:py-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_50%,rgba(243,176,91,0.26),transparent_24%),radial-gradient(circle_at_42%_48%,rgba(255,250,242,0.12),transparent_18%),linear-gradient(110deg,rgba(255,255,255,0.08),transparent_38%,rgba(199,103,69,0.12))]" aria-hidden="true" />
            <div className="workspace-orbit-lines pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 opacity-35" aria-hidden="true" />
            <div className="relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#f4b36b]/76">AI Agent</p>
                <h2 id="ai-agent-title" className="mt-4 max-w-sm font-heading text-4xl font-medium leading-[1.05] sm:text-5xl">
                  Your intelligent learning companion.
                </h2>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#e8d8c6]/76">
                  Powered by AI to guide, teach, correct pronunciation, and elevate your learning every day.
                </p>
                <a
                  href="#start"
                  className="mt-8 inline-flex min-h-11 items-center gap-3 rounded-full bg-[#fff8ed] px-5 text-xs font-semibold text-[#231915] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(255,248,237,0.14)] focus-visible:ring-2 focus-visible:ring-[#f4b36b]/55 focus-visible:ring-offset-4 focus-visible:ring-offset-[#16110d]"
                >
                  Meet Your Agent
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "What do you want to learn today?",
                  "I want to improve my speaking in Spanish.",
                  "Great. I’ll create a speaking plan focused on real conversations.",
                  "Review weak vocabulary before tomorrow’s session.",
                ].map((message, index) => (
                  <div
                    key={message}
                    className={`rounded-[8px] border border-white/10 bg-white/[0.08] p-4 text-sm leading-relaxed text-[#fff8ed]/86 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl ${index === 1 ? "bg-[#8a472f]/42 text-white" : ""}`}
                  >
                    <div className="mb-3 flex items-center gap-2 text-[#f4b36b]/78">
                      {index === 2 ? <CheckCircle2 className="size-4" aria-hidden="true" /> : <MessageCircle className="size-4" aria-hidden="true" />}
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Lingua AI</span>
                    </div>
                    {message}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="about" aria-labelledby="stories-title" className="mt-24 scroll-mt-24 grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#8c6549]/76">Loved By Learners</p>
              <h2 id="stories-title" className="mt-5 max-w-sm font-heading text-4xl font-medium leading-[1.04] text-[#261d16] sm:text-5xl">
                Real stories. Real progress.
              </h2>
              <div className="mt-8 flex gap-4">
                <Quote className="mt-1 size-6 shrink-0 fill-[#c76745] text-[#c76745]" aria-hidden="true" />
                <p className="max-w-xs text-sm leading-relaxed text-[#6f5b49]/84">
                  LinguaBoard changed the way I learn. Everything I need is in one calm place and the AI feels like a real tutor.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <article key={testimonial.name} className="dashboard-panel rounded-[8px] p-6">
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#231915] text-xs font-semibold text-[#fff8ed]">
                    {testimonial.name.slice(0, 1)}
                  </div>
                  <p className="mt-8 font-heading text-xl leading-snug text-[#2d2118]">“{testimonial.quote}”</p>
                  <p className="mt-8 text-sm font-semibold text-[#2d2118]">{testimonial.name}</p>
                  <p className="mt-1 text-xs font-semibold text-[#c76745]">{testimonial.language}</p>
                </article>
              ))}
            </div>
          </section>

        </div>
      </m.section>
    </LazyMotion>
  );
}
