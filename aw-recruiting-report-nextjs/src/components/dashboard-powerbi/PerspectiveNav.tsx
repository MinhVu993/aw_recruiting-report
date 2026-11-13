"use client";

import React from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, TrendingDown, Sparkles } from "lucide-react";

import { useTranslation } from "@/hooks/useTranslation";

export type PerspectiveType = "recruitment" | "profile" | "turnover";

interface PerspectiveNavProps {
  activePerspective: PerspectiveType;
  onPerspectiveChange: (p: PerspectiveType) => void;
  metrics?: {
    funnelCount?: number;
    candidateCount?: number;
    resignCount?: number;
    avgTTF?: number;
  };
}

export const PerspectiveNav: React.FC<PerspectiveNavProps> = ({
  activePerspective,
  onPerspectiveChange,
  metrics = {},
}) => {
  const { t } = useTranslation();

  const tabs = [
    {
      id: "recruitment" as PerspectiveType,
      label: t("recruitmentPerformance", "Tuyển Dụng & Hiệu Suất"),
      subLabel: "",
      icon: BarChart3,
      badge: metrics.avgTTF ? `TTF ~${metrics.avgTTF} ${t("unitLabelPerson", "ngày")}` : "Live Data",
      badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      activeText: "text-rose-600 dark:text-rose-400",
      activeBg: "bg-rose-50/70 dark:bg-rose-950/40 border-rose-400/50 dark:border-rose-800/60 shadow-xs",
      dotColor: "bg-rose-500",
    },
    {
      id: "profile" as PerspectiveType,
      label: t("candidateProfile", "Chân Dung & Nguồn Tuyển"),
      subLabel: "",
      icon: Users,
      badge: `${(metrics.candidateCount || 0).toLocaleString()} ${t("candidates", "ứng viên")}`,
      badgeColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
      activeText: "text-sky-600 dark:text-sky-400",
      activeBg: "bg-sky-50/70 dark:bg-sky-950/40 border-sky-400/50 dark:border-sky-800/60 shadow-xs",
      dotColor: "bg-sky-500",
    },
    {
      id: "turnover" as PerspectiveType,
      label: t("turnoverAnalytics", "Thôi Việc & Biến Động"),
      subLabel: "",
      icon: TrendingDown,
      badge: `${(metrics.resignCount || 0).toLocaleString()} ${t("resign", "thôi việc")}`,
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      activeText: "text-amber-600 dark:text-amber-400",
      activeBg: "bg-amber-50/70 dark:bg-amber-950/40 border-amber-400/50 dark:border-amber-800/60 shadow-xs",
      dotColor: "bg-amber-500",
    },
  ];

  return (
    <div className="w-full bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-xl border border-zinc-200/90 dark:border-[#26262C] rounded-xl p-1.5 shadow-2xs">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5" role="tablist" aria-label="Góc nhìn báo cáo phân tích">
        {tabs.map((tab) => {
          const isActive = activePerspective === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPerspectiveChange(tab.id)}
              className={`relative flex items-center justify-between p-2.5 rounded-lg text-left transition-colors duration-150 cursor-pointer ${
                isActive
                  ? "bg-zinc-50/80 dark:bg-[#202026]/90"
                  : "hover:bg-zinc-100/60 dark:hover:bg-[#1c1c22]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activePerspectiveIndicator"
                  className={`absolute inset-0 rounded-lg border ${tab.activeBg}`}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}

              <div className="relative z-10 flex items-center space-x-2.5">
                <div
                  className={`p-2 rounded-lg transition-colors ring-1 ${
                    isActive
                      ? `${tab.badgeColor} ring-current/20`
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 ring-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-black tracking-tight ${
                        isActive
                          ? tab.activeText
                          : "text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      {tab.label}
                    </span>
                    {isActive && (
                      <span className={`w-1.5 h-1.5 rounded-full ${tab.dotColor} animate-pulse`} />
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium line-clamp-1 mt-0.5">
                    {tab.subLabel}
                  </p>
                </div>
              </div>

              <div className="relative z-10 hidden sm:block">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    isActive
                      ? tab.badgeColor
                      : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/60"
                  }`}
                >
                  {tab.badge}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
