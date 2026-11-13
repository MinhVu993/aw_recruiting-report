"use client";

import React, { useState, useRef } from "react";
import {
  Building2,
  ArrowUpRight,
  CheckCircle2,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { ChartExportButton } from "./ChartExportButton";

interface DeptProgressItem {
  divCode?: string;
  divName?: string;
  deptName: string;
  loc: string;
  demand: number;
  recruited: number;
  shortage: number;
  rate: number;
  status: string;
}

interface DepartmentProgressBarChartProps {
  data: DeptProgressItem[];
  loading: boolean;
  selectedDiv?: string;
  onSelectDiv?: (divCode: string, divName: string) => void;
}

export const DepartmentProgressBarChart: React.FC<DepartmentProgressBarChartProps> = ({
  data,
  loading,
  selectedDiv,
  onSelectDiv,
}) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"chart" | "clustered" | "progress">("chart");
  const cardRef = useRef<HTMLDivElement>(null);

  const isAnySelected = Boolean(selectedDiv);

  // Calculate max value for accurate scaling in clustered bar view
  const maxDemand = Math.max(...data.map((d) => Math.max(d.demand, d.recruited)), 1);

  // Tính các mốc trục X (ticks) chuẩn PowerBI (0, 25%, 50%, 75%, 100% max)
  const xTicks = [
    0,
    Math.round(maxDemand * 0.25),
    Math.round(maxDemand * 0.5),
    Math.round(maxDemand * 0.75),
    maxDemand,
  ];

  return (
    <div
      ref={cardRef}
      className="bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-xl border border-zinc-200/90 dark:border-[#26262C] rounded-xl p-3.5 flex flex-col justify-between shadow-2xs h-full min-h-[340px] transition-colors"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide leading-tight">
              {t("deptProgress")}
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {selectedDiv && (
            <div className="flex items-center gap-1.5 animate-fadeIn">
              <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-100/80 dark:bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-300 dark:border-sky-700">
                {t("selectedDivision")}: {selectedDiv}
              </span>
              <Link
                href={`/candidates?dept=${encodeURIComponent(selectedDiv)}`}
                className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/40 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800 transition-all flex items-center gap-0.5"
                title={`${t("viewList")} ${selectedDiv}`}
              >
                <span>{t("viewList")}</span>
                <ArrowUpRight className="w-2.5 h-2.5" />
              </Link>
            </div>
          )}

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 rounded-lg p-0.5 border border-slate-200/80 dark:border-slate-700/80 text-[10px]">
            <button
              type="button"
              onClick={() => setViewMode("chart")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition-all ${
                viewMode === "chart"
                  ? "bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-2xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
              title="Biểu đồ cột ngang PowerBI có trục tọa độ và vạch lưới"
            >
              <BarChart3 className="w-3 h-3" />
              <span>Biểu Đồ</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("clustered")}
              className={`flex items-center gap-1 px-2 py-1 rounded-md font-bold transition-all ${
                viewMode === "clustered"
                  ? "bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-2xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
              title={t("clusteredBarTip")}
            >
              <span>{t("clustered")}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("progress")}
              className={`flex items-center gap-1 px-2 py-1 rounded-md font-bold transition-all ${
                viewMode === "progress"
                  ? "bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-2xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
              title={t("progressTip")}
            >
              <TrendingUp className="w-3 h-3" />
              <span>%</span>
            </button>
          </div>

          <Link
            href="/demand"
            className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-0.5 ml-1"
          >
            <span>{t("viewAll")}</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>

          <ChartExportButton
            targetRef={cardRef}
            chartTitle={t("deptProgress", "Tiến Độ Tuyển Dụng Theo Bộ Phận")}
            fileNamePrefix="Tien_Do_Tuyen_Dung_Bo_Phan"
          />
        </div>
      </div>

      {/* Quick Indicator Subheader */}
      <div className="flex items-center justify-between text-[10px] py-1.5 px-2 text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40 rounded my-1.5 border border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center space-x-3.5">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <span className="w-3 h-2 rounded-xs bg-indigo-500 dark:bg-indigo-400 inline-block shadow-2xs"></span>
            {t("targetQuota")}: <strong className="text-indigo-600 dark:text-indigo-400">{data.reduce((a, b) => a + b.demand, 0).toLocaleString("vi-VN")}</strong>
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <span className="w-3 h-2 rounded-xs bg-emerald-500 dark:bg-emerald-400 inline-block shadow-2xs"></span>
            {t("recruitedLabel")}: <strong className="text-emerald-600 dark:text-emerald-400">{data.reduce((a, b) => a + b.recruited, 0).toLocaleString("vi-VN")}</strong>
          </span>
        </div>
        <span className="text-[9px] text-slate-400">
          {t("totalLabel")}: {data.length} {t("totalDivisionsWithQuota")}
        </span>
      </div>

      {/* Chart Body */}
      <div className="flex-1 my-1 overflow-y-auto custom-scrollbar pr-1.5 max-h-[480px]">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            {t("loadingDeptProgress")}
          </div>
        ) : data.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            {t("noDemandInPeriod")}
          </div>
        ) : viewMode === "chart" ? (
          /* ========================================================================= */
          /* POWERBI STYLE HORIZONTAL BAR CHART WITH AXIS & GRIDLINES                  */
          /* ========================================================================= */
          <div className="space-y-3 pt-2">
            {/* Top X-Axis Scale & Grid Header */}
            <div className="flex items-center text-[10px] text-slate-400 font-mono pb-1 border-b border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-[180px] sm:w-[220px] shrink-0 font-sans font-bold text-slate-500 text-[11px]">
                Bộ Phận (Đơn vị)
              </div>
              <div className="flex-1 relative h-4">
                {xTicks.map((tick, i) => {
                  const leftPct = (tick / maxDemand) * 100;
                  return (
                    <div
                      key={i}
                      className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
                      style={{ left: `${leftPct}%` }}
                    >
                      <span className="leading-none tabular-nums font-semibold">{tick}</span>
                    </div>
                  );
                })}
              </div>
              <div className="w-16 shrink-0 text-right font-sans font-bold text-slate-500 text-[11px] pr-1">
                Tiến độ
              </div>
            </div>

            {/* Bars with background vertical grid lines */}
            <div className="space-y-2 relative">
              {data.map((item, idx) => {
                const displayName = item.divName || item.deptName;
                const divTag = item.divCode || item.loc;
                const targetPct = Math.max(0, (item.demand / maxDemand) * 100);
                const actualPct = Math.max(0, (item.recruited / maxDemand) * 100);

                const rateBadgeColor =
                  item.rate >= 100
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                    : item.rate >= 70
                    ? "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border-sky-200 dark:border-sky-800"
                    : item.rate >= 40
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800";

                const isSelected = selectedDiv && (item.divCode === selectedDiv || item.loc === selectedDiv);

                return (
                  <div
                    key={item.divCode || idx}
                    onClick={() => onSelectDiv && onSelectDiv(item.divCode || item.loc, displayName)}
                    className={`flex items-center gap-3 py-1 px-1.5 rounded-lg transition-all border cursor-pointer group ${
                      isSelected
                        ? "ring-2 ring-sky-500 bg-sky-50/80 dark:bg-sky-950/50 border-sky-300 dark:border-sky-700/60 shadow-xs scale-[1.005]"
                        : isAnySelected
                        ? "opacity-40 hover:opacity-90 bg-slate-50/40 dark:bg-slate-800/20 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        : "bg-slate-50/40 dark:bg-slate-800/20 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    }`}
                  >
                    {/* Y-Axis Label: Dept Tag & Name */}
                    <div className="w-[180px] sm:w-[220px] shrink-0 min-w-0 flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 shrink-0">
                        {divTag}
                      </span>
                      <span
                        className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors"
                        title={`${divTag} - ${displayName}`}
                      >
                        {displayName}
                      </span>
                    </div>

                    {/* Chart Plot Area with Vertical Gridlines & Clustered Horizontal Bars */}
                    <div className="flex-1 relative py-1">
                      {/* Vertical Gridlines */}
                      <div className="absolute inset-0 pointer-events-none">
                        {xTicks.map((tick, i) => {
                          const leftPct = (tick / maxDemand) * 100;
                          return (
                            <div
                              key={i}
                              className="absolute top-0 bottom-0 w-px border-l border-slate-200/60 dark:border-slate-800/60"
                              style={{ left: `${leftPct}%` }}
                            />
                          );
                        })}
                      </div>

                      {/* Bar 1: Chỉ tiêu (Target) */}
                      <div className="flex items-center gap-2 mb-1 relative z-10">
                        <div className="flex-1 h-3.5 bg-slate-100 dark:bg-slate-800/80 rounded relative overflow-hidden">
                          <div
                            className="h-full rounded bg-indigo-500 dark:bg-indigo-400 transition-all duration-500 shadow-xs flex items-center justify-end pr-1.5"
                            style={{ width: `${Math.max(item.demand > 0 ? 5 : 0, targetPct)}%` }}
                          >
                            {targetPct > 18 && (
                              <span className="text-[9px] font-extrabold text-white leading-none tabular-nums">
                                {item.demand}
                              </span>
                            )}
                          </div>
                        </div>
                        {targetPct <= 18 && (
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tabular-nums w-8">
                            {item.demand}
                          </span>
                        )}
                      </div>

                      {/* Bar 2: Đã tuyển (Recruited) */}
                      <div className="flex items-center gap-2 relative z-10">
                        <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800/80 rounded relative overflow-hidden">
                          <div
                            className="h-full rounded bg-emerald-500 dark:bg-emerald-400 transition-all duration-500 shadow-xs flex items-center justify-end pr-1.5"
                            style={{ width: `${Math.max(item.recruited > 0 ? 5 : 0, actualPct)}%` }}
                          >
                            {actualPct > 18 && (
                              <span className="text-[9px] font-extrabold text-white leading-none tabular-nums">
                                {item.recruited}
                              </span>
                            )}
                          </div>
                        </div>
                        {actualPct <= 18 && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums w-8">
                            {item.recruited}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Metric: Completion Rate & Shortage badge */}
                    <div className="w-16 shrink-0 text-right flex flex-col items-end justify-center">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border tabular-nums ${rateBadgeColor}`}>
                        {item.rate}%
                      </span>
                      {item.shortage > 0 ? (
                        <span className="text-[9px] text-rose-500 dark:text-rose-400 font-bold mt-0.5 tabular-nums">
                          -{item.shortage}
                        </span>
                      ) : (
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Đạt
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* GRID CARD VIEW (Clustered or Progress)                                     */
          /* ========================================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {data.map((item, idx) => {
              const displayName = item.divName || item.deptName;
              const divTag = item.divCode || item.loc;
              const targetWidthPct = Math.max(4, Math.round((item.demand / maxDemand) * 100));
              const actualWidthPct =
                item.recruited > 0
                  ? Math.max(4, Math.round((item.recruited / maxDemand) * 100))
                  : 0;

              const rateBadgeColor =
                item.rate >= 100
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                  : item.rate >= 70
                  ? "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border-sky-200 dark:border-sky-800"
                  : item.rate >= 40
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800";

              const progressBarColor =
                item.rate >= 100
                  ? "bg-emerald-500"
                  : item.rate >= 70
                  ? "bg-sky-500"
                  : item.rate >= 40
                  ? "bg-amber-500"
                  : "bg-rose-500";

              const isSelected = selectedDiv && (item.divCode === selectedDiv || item.loc === selectedDiv);

              return (
                <div
                  key={item.divCode || idx}
                  onClick={() => onSelectDiv && onSelectDiv(item.divCode || item.loc, displayName)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all border group cursor-pointer ${
                    isSelected
                      ? "ring-2 ring-sky-500 bg-sky-50 dark:bg-sky-950/50 border-sky-300 dark:border-sky-700/60 shadow-xs scale-[1.01]"
                      : isAnySelected
                      ? "opacity-40 hover:opacity-85 bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/60"
                      : "bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-800/60"
                  }`}
                >
                  {/* Div Info Header */}
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center space-x-1.5 min-w-0 flex-1 mr-2">
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 shrink-0">
                        {divTag}
                      </span>
                      <span
                        className="font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors"
                        title={`${divTag} - ${displayName}`}
                      >
                        {displayName}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 tabular-nums text-[11px] shrink-0">
                      <span
                        className={`font-black text-[10px] px-1.5 py-0.5 rounded border ${rateBadgeColor}`}
                      >
                        {item.rate}%
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.shortage > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400 font-bold">
                            {t("shortageLabel")}: {item.shortage}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> {t("fulfilledQuota")}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* VISUALIZATION: Clustered Bar Mode vs Progress Mode */}
                  {viewMode === "clustered" ? (
                    <div className="space-y-1 pt-0.5">
                      {/* Target Bar (Chỉ tiêu) */}
                      <div className="flex items-center text-[10px] gap-2">
                        <span className="w-14 text-slate-400 shrink-0 text-right">{t("targetQuota")}:</span>
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800/80 rounded-full h-2 overflow-hidden relative">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                            style={{ width: `${targetWidthPct}%` }}
                          />
                        </div>
                        <span className="w-10 text-right font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                          {item.demand}
                        </span>
                      </div>

                      {/* Actual Bar (Đã tuyển) */}
                      <div className="flex items-center text-[10px] gap-2">
                        <span className="w-14 text-slate-400 shrink-0 text-right">{t("recruitedLabel")}:</span>
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800/80 rounded-full h-2 overflow-hidden relative">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                            style={{ width: `${actualWidthPct}%` }}
                          />
                        </div>
                        <span className="w-10 text-right font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {item.recruited}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Single Progress Bar Mode */
                    <div className="space-y-1">
                      <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-2.5 overflow-hidden border border-slate-200/60 dark:border-slate-700/60 relative">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
                          style={{ width: `${Math.min(100, item.rate)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 px-0.5 tabular-nums">
                        <span>{t("recruitedLabel")}: <strong className="text-slate-800 dark:text-slate-100">{item.recruited}</strong> / {item.demand} {t("people")}</span>
                        <span>{item.rate >= 100 ? t("completed100") : `${t("remainingShortage")} ${item.shortage} ${t("people")}`}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> &ge;100%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span> 70-99%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> 40-69%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> &lt;40%
          </span>
        </div>
      </div>
    </div>
  );
};
