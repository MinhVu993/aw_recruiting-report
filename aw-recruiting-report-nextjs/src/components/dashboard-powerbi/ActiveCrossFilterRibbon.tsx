"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Briefcase,
  Users,
  Calendar,
  GraduationCap,
  Share2,
  LogOut,
  Clock,
  FilterX,
  X,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { buildDrillThroughTarget, GlobalSlicersState } from "@/lib/drillthrough";
import type { PerspectiveType } from "./PerspectiveNav";
import { useTranslation } from "@/hooks/useTranslation";

export interface CrossFilterState {
  div?: string;
  divName?: string;
  position?: string;
  gender?: string;
  ageGroup?: string;
  edu?: string;
  source?: string;
  resignReason?: string;
  seniority?: string;
}

interface ActiveCrossFilterRibbonProps {
  filters: CrossFilterState;
  activePerspective?: PerspectiveType;
  globalSlicers?: GlobalSlicersState;
  onRemoveFilter: (key: keyof CrossFilterState) => void;
  onClearAll: () => void;
}

export const ActiveCrossFilterRibbon: React.FC<ActiveCrossFilterRibbonProps> = ({
  filters,
  activePerspective,
  globalSlicers,
  onRemoveFilter,
  onClearAll,
}) => {
  const { t } = useTranslation();
  // Build Drill-Through Target Link
  const drillTarget = buildDrillThroughTarget({
    perspective: activePerspective,
    filters,
    globalSlicers: globalSlicers || {},
  });
  // Build active filter items
  const items: Array<{
    key: keyof CrossFilterState;
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = [];

  if (filters.div) {
    items.push({
      key: "div",
      label: activePerspective === "turnover" ? t("department") : t("division"),
      value: filters.divName ? `${filters.div} - ${filters.divName}` : filters.div,
      icon: Building2,
      color: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700/60",
    });
  }

  if (filters.position) {
    items.push({
      key: "position",
      label: t("position"),
      value: filters.position,
      icon: Briefcase,
      color: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700/60",
    });
  }

  if (filters.gender) {
    items.push({
      key: "gender",
      label: t("gender"),
      value: filters.gender,
      icon: Users,
      color: "bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-700/60",
    });
  }

  if (filters.ageGroup) {
    items.push({
      key: "ageGroup",
      label: t("ageGroup"),
      value: filters.ageGroup,
      icon: Calendar,
      color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/60",
    });
  }

  if (filters.edu) {
    items.push({
      key: "edu",
      label: t("internEdu"),
      value: filters.edu,
      icon: GraduationCap,
      color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60",
    });
  }

  if (filters.source) {
    items.push({
      key: "source",
      label: t("internSource"),
      value: filters.source,
      icon: Share2,
      color: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700/60",
    });
  }

  if (filters.resignReason) {
    items.push({
      key: "resignReason",
      label: t("resignReason"),
      value: filters.resignReason,
      icon: LogOut,
      color: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700/60",
    });
  }

  if (filters.seniority) {
    items.push({
      key: "seniority",
      label: t("seniorityLabel"),
      value: filters.seniority,
      icon: Clock,
      color: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700/60",
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -8, height: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-transparent dark:from-sky-950/50 dark:via-indigo-950/30 dark:to-transparent border border-sky-500/30 dark:border-sky-500/20 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-xs"
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Tag Title */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-xs">
            <span>{t("crossFilterRelation")}</span>
          </div>

          {/* Filter Chips */}
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.key}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border shadow-2xs transition-all hover:scale-[1.02] ${item.color}`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                <span className="font-semibold opacity-75">{item.label}:</span>
                <span className="font-bold max-w-[200px] truncate" title={item.value}>
                  {item.value}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFilter(item.key);
                  }}
                  className="ml-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors cursor-pointer"
                  title={t("removeFilterTip")}
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Action Buttons: Drill-Through and Clear All */}
        <div className="flex items-center gap-2">
          {drillTarget && (
            <a
              href={drillTarget.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer group animate-in fade-in"
              title={drillTarget.subtitle || drillTarget.label}
            >
              <span>{drillTarget.label}</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          )}

          {/* Clear All Button */}
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#202026] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs font-semibold shadow-2xs transition-all hover:border-rose-400 cursor-pointer"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>{t("clearAllFilters")} ({items.length})</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
