"use client";

import React, { useState, useRef } from "react";
import { Clock, BarChart3, LayoutGrid, ArrowUpDown } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { ChartExportButton } from "./ChartExportButton";

export interface TTFItem {
  position: string;
  avgDays: number;
  count: number;
}

interface TimeToFillChartProps {
  positions: TTFItem[];
  avgTTF: number;
  loading: boolean;
  selectedPosition?: string;
  onSelectPosition?: (pos: string) => void;
}

export const TimeToFillChart: React.FC<TimeToFillChartProps> = ({
  positions,
  avgTTF,
  loading,
  selectedPosition,
  onSelectPosition,
}) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"chart" | "grid">("chart");
  const [sortBy, setSortBy] = useState<"days" | "count">("days");
  const cardRef = useRef<HTMLDivElement>(null);

  const isAnySelected = Boolean(selectedPosition);

  // Determine speed category and styling
  const getSpeedCategory = (days: number) => {
    if (days < 45) {
      return {
        label: t("speedFast"),
        color: "text-emerald-700 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
        bar: "bg-gradient-to-r from-emerald-500 to-teal-500",
      };
    }
    if (days <= 65) {
      return {
        label: t("speedNormal"),
        color: "text-sky-700 dark:text-sky-400",
        bg: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800",
        bar: "bg-gradient-to-r from-sky-500 to-blue-600",
      };
    }
    if (days <= 100) {
      return {
        label: t("speedSlow"),
        color: "text-amber-700 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
        bar: "bg-gradient-to-r from-amber-500 to-orange-500",
      };
    }
    return {
      label: t("speedBottleneck"),
      color: "text-rose-700 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
      bar: "bg-gradient-to-r from-rose-500 to-red-600",
    };
  };

  // Sort positions based on active preference
  const sortedPositions = [...positions].sort((a, b) => {
    if (sortBy === "days") {
      return a.avgDays - b.avgDays; // Ascending: fastest first
    }
    return b.count - a.count; // Most volume first
  });

  // Calculate scaling domain
  const maxDays = Math.max(...positions.map((p) => p.avgDays), avgTTF, 60) * 1.08;
  const benchmarkLeftPct = Math.min(95, Math.max(5, (avgTTF / maxDays) * 100));

  return (
    <div
      ref={cardRef}
      className="bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-xl border border-zinc-200/90 dark:border-[#26262C] rounded-xl p-3.5 shadow-2xs transition-colors flex flex-col justify-between h-full"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800/80 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide leading-tight">
              {t("timeToFill")}
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 rounded-lg p-0.5 border border-slate-200/80 dark:border-slate-700/80 text-[10px]">
            <button
              type="button"
              onClick={() => setViewMode("chart")}
              className={`flex items-center gap-1 px-2 py-1 rounded-md font-bold transition-all ${
                viewMode === "chart"
                  ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-2xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
              title={t("chartViewTip")}
            >
              <BarChart3 className="w-3 h-3" />
              <span>{t("chartView")}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1 px-2 py-1 rounded-md font-bold transition-all ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-2xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
              title={t("gridCardsTip")}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>{t("gridCardsView")}</span>
            </button>
          </div>

          {/* Quick Sort Switcher */}
          <button
            type="button"
            onClick={() => setSortBy(sortBy === "days" ? "count" : "days")}
            className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700"
            title={t("sortOrder")}
          >
            <ArrowUpDown className="w-2.5 h-2.5" />
            <span>{sortBy === "days" ? t("byDays") : t("byCount")}</span>
          </button>

          {/* KPI Overall Metric */}
          <div className="text-right pl-2 border-l border-zinc-200 dark:border-zinc-800">
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums leading-tight">
              {loading ? "..." : `${avgTTF} ${t("daysCount")}`}
            </span>
          </div>

          <ChartExportButton
            targetRef={cardRef}
            chartTitle={t("timeToFill", "Thời Gian Tuyển Dụng Trung Bình")}
            fileNamePrefix="Thoi_Gian_Tuyen_Dung_TTF"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="my-2.5">
        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            {t("loadingTTF")}
          </div>
        ) : positions.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            {t("noTTFData")}
          </div>
        ) : viewMode === "chart" ? (
          /* ========================================================================= */
          /* 1. HORIZONTAL BAR CHART WITH BENCHMARK LINE                               */
          /* ========================================================================= */
          <div className="space-y-2 relative pt-3">
            {/* Benchmark Vertical Guideline */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-10 flex flex-col items-center"
              style={{ left: `calc(130px + (100% - 210px) * ${benchmarkLeftPct / 100})` }}
            >
              <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-white/90 dark:bg-[#18181C]/90 px-1 rounded shadow-2xs border border-emerald-500/30 whitespace-nowrap -mt-2.5">
                {t("avgDaysBenchmark")}: {avgTTF} {t("daysCount")}
              </span>
              <div className="w-px flex-1 border-r border-dashed border-emerald-500/50 dark:border-emerald-400/50 my-0.5"></div>
            </div>

            {sortedPositions.map((pos) => {
              const category = getSpeedCategory(pos.avgDays);
              const barWidthPct = Math.min(100, Math.max(3, (pos.avgDays / maxDays) * 100));
              const isSelected = selectedPosition && pos.position.toLowerCase() === selectedPosition.toLowerCase();

              return (
                <div
                  key={pos.position}
                  onClick={() => onSelectPosition && onSelectPosition(pos.position)}
                  className={`flex items-center text-xs group py-1.5 px-1.5 rounded-lg transition-all cursor-pointer min-h-[34px] ${
                    isSelected
                      ? "ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 shadow-xs scale-[1.01]"
                      : isAnySelected
                      ? "opacity-40 hover:opacity-85 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40"
                      : "hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  {/* Position Name & Count */}
                  <div className="w-[130px] shrink-0 pr-2 min-w-0 flex items-center justify-between">
                    <span
                      className={`font-bold truncate leading-relaxed py-0.5 transition-colors ${
                        isSelected
                          ? "text-emerald-700 dark:text-emerald-300 font-black"
                          : "text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                      }`}
                      title={pos.position}
                    >
                      {pos.position}
                    </span>
                    <span className="text-[10px] text-zinc-400 tabular-nums shrink-0 ml-1 leading-relaxed py-0.5">
                      {pos.count} {t("demandsCount")}
                    </span>
                  </div>

                  {/* Horizontal Bar Track */}
                  <div className="flex-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-full h-3 overflow-hidden relative mx-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${category.bar}`}
                      style={{ width: `${barWidthPct}%` }}
                    />
                  </div>

                  {/* Days Label & Speed Tag */}
                  <div className="w-[80px] shrink-0 text-right flex items-center justify-end space-x-1.5 tabular-nums">
                    <span className="font-black text-zinc-900 dark:text-white text-xs">
                      {pos.avgDays}
                      <span className="text-[10px] font-normal text-zinc-400 ml-0.5">d</span>
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1 py-0.2 rounded border ${category.bg} ${category.color} shrink-0`}
                    >
                      {category.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================================= */
          /* 2. GRID CARDS VIEW (All Positions)                                        */
          /* ========================================================================= */
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {sortedPositions.map((pos) => {
              const category = getSpeedCategory(pos.avgDays);
              const isSelected = selectedPosition && pos.position.toLowerCase() === selectedPosition.toLowerCase();

              return (
                <div
                  key={pos.position}
                  onClick={() => onSelectPosition && onSelectPosition(pos.position)}
                  className={`p-2.5 rounded-lg border transition-all flex flex-col justify-between group cursor-pointer ${
                    isSelected
                      ? "ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700/60 shadow-xs scale-[1.01]"
                      : isAnySelected
                      ? "opacity-40 hover:opacity-85 bg-zinc-50/80 dark:bg-[#202026] border-zinc-100 dark:border-zinc-800/80"
                      : "bg-zinc-50/80 dark:bg-[#202026] border-zinc-100 dark:border-zinc-800/80 hover:border-emerald-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                      title={pos.position}
                    >
                      {pos.position}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${category.bg} ${category.color}`}
                    >
                      {category.label}
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-base font-black text-zinc-900 dark:text-white tabular-nums">
                      {pos.avgDays}{" "}
                      <span className="text-[10px] font-normal text-zinc-400">{t("daysCount")}</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-semibold tabular-nums">
                      {pos.count} {t("demandsCount")}
                    </span>
                  </div>

                  {/* Micro Progress Track */}
                  <div className="w-full bg-zinc-200/70 dark:bg-zinc-700/60 rounded-full h-1 mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${category.bar}`}
                      style={{ width: `${Math.min(100, Math.max(5, (pos.avgDays / maxDays) * 100))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between text-[10px] text-zinc-400 gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {t("speedFastLegend")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span> {t("speedNormalLegend")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> {t("speedSlowLegend")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> {t("speedBottleneckLegend")}
          </span>
        </div>
        <span className="text-zinc-500 font-medium">
          {t("viewAll")} {positions.length} {t("allJobPositions")}
        </span>
      </div>
    </div>
  );
};
