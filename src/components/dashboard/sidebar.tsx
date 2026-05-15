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

export interface SidebarProps {
  displayName: string;
  streak: number;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/learn", label: "Learn", icon: BookOpen },
  { href: "/dashboard/vocabulary", label: "Vocabulary", icon: BookMarked },
  { href: "/dashboard/flashcards", label: "Flashcards", icon: Layers },
  { href: "/dashboard/ai-tutor", label: "AI Tutor", icon: Brain },
  { href: "/dashboard/progress", label: "Progress", icon: LineChart },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ displayName, streak }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col border-r border-[#1c1917]/5 bg-[#faf7f2]">
      {/* Logo */}
      <div className="flex h-[88px] items-center gap-3 px-6">
        <div className="flex size-7 items-center justify-center rounded-lg bg-[#1c1917]/5 text-[#1c1917]">
          <Orbit className="size-4" strokeWidth={1.5} />
        </div>
        <span className="font-serif text-[17px] font-medium tracking-wide text-[#1c1917]">
          LinguaBoard
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-4 py-4">
        <div className="mb-4 px-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8d8175]">
          Menu
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "bg-white text-[#1c1917] shadow-sm border border-[#1c1917]/5"
                  : "text-[#8d8175] hover:bg-[#1c1917]/[0.02] hover:text-[#1c1917]"
              )}
            >
              <Icon
                className={cn("size-4 shrink-0 transition-transform duration-200", isActive && "scale-110")}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Profile + Streak */}
      <div className="p-4 pb-6">
        {/* Profile mini card */}
        <div className="group flex items-center gap-3 rounded-2xl bg-white/60 px-3 py-3 shadow-[0_2px_8px_rgba(28,25,23,0.03)] border border-[#1c1917]/5 backdrop-blur-md cursor-pointer transition-all hover:bg-white hover:shadow-md">
          <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1c1917] to-[#292524] text-xs font-medium text-white shadow-sm transition-transform group-hover:scale-105">
            {displayName?.charAt(0)?.toUpperCase() ?? "L"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#1c1917]">
              {displayName ?? "Learner"}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#d97757]">
              Premium
            </p>
          </div>
        </div>

        {/* Streak mini card */}
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#d97757]/10 to-[#d97757]/5 px-3 py-3 border border-[#d97757]/10">
          <div className="flex size-7 items-center justify-center rounded-full bg-[#d97757]/20">
            <Flame className="size-3.5 text-[#d97757]" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1c1917]">{streak} days</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#8d8175]">Best streak</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
