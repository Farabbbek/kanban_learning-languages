"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  BookMarked,
  Layers,
  Brain,
  LineChart,
  Target,
  Settings,
  Flame,
  Orbit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export interface SidebarProps {
  displayName?: string;
  streak?: number;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/learn", label: "Learn", icon: BookOpen },
  { href: "/dashboard/vocabulary", label: "Vocabulary", icon: BookMarked },
  { href: "/dashboard/flashcards", label: "Flashcards", icon: Layers },
  { href: "/dashboard/ai-tutor", label: "AI Tutor", icon: Brain, soon: true },
  { href: "/dashboard/progress", label: "Progress", icon: LineChart, soon: true },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ displayName: propName, streak: propStreak }: SidebarProps) {
  const storeName = useAuthStore((s) => s.displayName);
  const storeUsername = useAuthStore((s) => s.username);
  const storeAvatarUrl = useAuthStore((s) => s.avatarUrl);
  const storeStreak = useAuthStore((s) => s.streak);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const displayName = propName || storeName || "Learner";
  const username = storeUsername;
  const avatarUrl = storeAvatarUrl;
  const streak = propStreak ?? storeStreak;
  const pathname = usePathname();

  return (
    <aside
      className="dashboard-mobile-nav fixed inset-x-3 bottom-3 z-40 flex h-[76px] flex-col overflow-hidden rounded-[22px] border border-[rgba(210,190,170,0.34)] shadow-[0_18px_54px_rgba(42,33,28,0.18),inset_0_1px_0_rgba(255,255,255,0.55)] md:inset-x-auto md:bottom-auto md:left-0 md:top-0 md:h-screen md:w-[220px] md:rounded-none md:border-r md:border-[rgba(210,190,170,0.22)] md:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_0_60px_rgba(210,180,140,0.12)]"
      style={{
        backgroundColor: "rgba(250,246,240,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        backgroundImage: `url('/sidebar.png')`,
        backgroundPosition: "left bottom",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay gradient — cleaner */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(248,244,238,0.75) 0%, rgba(248,244,238,0.50) 40%, rgba(248,244,238,0.20) 70%, rgba(248,244,238,0.08) 100%)",
        }}
      />

      {/* Noise grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ========== CONTENT ========== */}
      <div className="relative z-10 flex h-full flex-col md:flex-col">
        {/* ========== LOGO ========== */}
        <div className="hidden items-center gap-2.5 px-5 pb-5 pt-6 md:flex">
          <div className="relative flex size-[32px] items-center justify-center rounded-xl bg-[#F4ECE4] shadow-[0_6px_20px_rgba(120,80,40,0.08)]">
            <Orbit className="size-[16px] text-[#D57B45]" strokeWidth={1.8} />
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 tracking-[-0.02em] transition-opacity hover:opacity-80"
          >
            <span className="font-serif text-[16px] font-semibold tracking-tight text-[#2A1E17]">LinguaBoard</span>
            <span className="text-xs leading-none text-[#D57B45] mt-[1px]">✦</span>
          </Link>
        </div>

        {/* ========== NAVIGATION ========== */}
        <nav className="scrollbar-hide flex-1 overflow-x-auto overscroll-x-contain px-2 py-2 md:overflow-visible md:px-3 md:py-1">
          <div className="mb-3 hidden px-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8d8175]/50 md:block">
            Menu
          </div>

          <div className="flex min-w-max items-center gap-1 md:block md:min-w-0 md:space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-semibold transition-all duration-200 ease-out md:min-w-0 md:flex-row md:justify-start md:gap-3 md:rounded-xl md:px-3 md:py-2.5 md:text-[13px] md:font-medium",
                    isActive
                      ? "bg-[rgba(255,250,245,0.95)] text-[#1F1610] shadow-[0_8px_24px_rgba(180,140,100,0.10)] border border-[#D88A5B]/10"
                      : "text-[#6B5D52] hover:translate-x-[2px] hover:bg-[rgba(255,250,245,0.5)] hover:text-[#1F1610]"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5 shrink-0 transition-all duration-200 ease-out md:size-4",
                      isActive
                        ? "text-[#D88A5B]"
                        : "text-[#8d8175]/70 group-hover:text-[#2A211C]/80",
                      item.soon && !isActive && "opacity-50"
                    )}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  <span className={cn("max-w-[58px] truncate md:max-w-none", item.soon && !isActive && "opacity-50")}>{item.label}</span>

                  {item.soon && (
                    <span
                      className={cn(
                        "ml-auto hidden items-center rounded-full px-1.5 py-[2px] text-[7px] font-bold uppercase tracking-[0.12em] md:inline-flex",
                        isActive
                          ? "bg-[#D88A5B]/15 text-[#D88A5B]"
                          : "bg-gradient-to-r from-[#D88A5B]/12 to-[#C9A96E]/12 text-[#D88A5B]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      )}
                    >
                      <span className="mr-[3px] size-1 rounded-full bg-[#D88A5B] opacity-60" />
                      SOON
                    </span>
                  )}

                  {isActive && !item.soon && (
                    <span className="absolute bottom-1.5 size-1 rounded-full bg-[#D88A5B] shadow-[0_0_6px_rgba(216,138,91,0.35)] md:bottom-auto md:right-2.5 md:size-1.5" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ========== PROFILE CARD ========== */}
        <div className="hidden px-3 pb-2.5 pt-1 md:block">
          <div className="group flex items-center gap-3 rounded-xl bg-[rgba(255,250,245,0.85)] backdrop-blur-[8px] px-3 py-2.5 shadow-[0_2px_12px_rgba(42,33,28,0.05),0_0_0_1px_rgba(216,138,91,0.06)] cursor-pointer transition-all duration-200 hover:shadow-[0_8px_24px_rgba(42,33,28,0.08)] hover:-translate-y-0.5">
            {/* Avatar */}
            <div className="relative shrink-0">
              {avatarUrl ? (
                <div className="size-8 overflow-hidden rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-[#D88A5B]/10 transition-transform duration-200 group-hover:scale-105">
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="size-full rounded-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2A211C] to-[#3D322B] text-xs font-semibold text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                  {displayName?.charAt(0)?.toUpperCase() ?? "L"}
                </div>
              )}
              <div className="absolute -inset-[3px] rounded-full border border-[#D88A5B]/15 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </div>

            {/* Name + Username */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#1F1610] leading-tight">
                {displayName ?? "Learner"}
              </p>
              {username && (
                <p className="truncate text-[11px] text-[#8d8175]/70 leading-tight mt-[1px]">
                  @{username}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ========== STREAK ========== */}
        <div className="hidden px-3 pb-5 md:block">
          <div
            className="flex items-center gap-3 rounded-[22px] px-3.5 py-3.5"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,248,238,0.92), rgba(255,240,220,0.82))",
              border: "1px solid rgba(255,180,90,0.25)",
              boxShadow:
                "0 10px 30px rgba(255,180,90,0.10), 0 0 40px rgba(255,200,120,0.06)",
            }}
          >
            {/* Glowing flame */}
            <div className="relative shrink-0">
              <div
                className="flex size-10 items-center justify-center rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,180,70,0.35), rgba(255,180,70,0.05))",
                }}
              >
                <Flame className="size-4 text-[#D88A5B]" strokeWidth={2} />
              </div>
              <div className="absolute inset-0 rounded-full bg-[#D88A5B]/10 blur-md" />
            </div>

            <div>
              <p className="text-[24px] font-bold tracking-tight text-[#2A1E17] leading-none">
                {streak}
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8d8175]/60 mt-1">
                Day streak
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
