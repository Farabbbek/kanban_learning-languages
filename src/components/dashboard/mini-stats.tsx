"use client";

import { Clock, Flame, BookMarked } from "lucide-react";

export interface MiniStatsProps {
  studyMinutes: number;
  streak: number;
  wordsLearned: number;
}

export function MiniStats({ studyMinutes, streak, wordsLearned }: MiniStatsProps) {
  const stats = [
    {
      icon: Clock,
      label: "Study Time",
      value: studyMinutes,
      unit: "minutes",
      color: "#c56b47",
    },
    {
      icon: Flame,
      label: "Streak",
      value: streak,
      unit: "days",
      color: "#d48c5c",
    },
    {
      icon: BookMarked,
      label: "Words Learned",
      value: wordsLearned,
      unit: "words",
      color: "#7d8f74",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-3xl border border-[#1c1917]/5 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div
                className="flex size-10 items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
                style={{ background: `${stat.color}15` }}
              >
                <Icon
                  className="size-5"
                  strokeWidth={1.5}
                  style={{ color: stat.color }}
                />
              </div>
            </div>
            <p className="mt-5 font-serif text-3xl font-medium tracking-tight text-[#1c1917]">
              {stat.value}
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8d8175]">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
