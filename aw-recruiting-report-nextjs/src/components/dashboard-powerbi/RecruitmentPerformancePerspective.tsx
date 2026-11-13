"use client";

import React, { useRef } from "react";
import { Filter, Clock, TrendingUp, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { DepartmentProgressBarChart } from "./DepartmentProgressBarChart";
import { TimeToFillChart } from "./TimeToFillChart";
import { CrossFilterState } from "./ActiveCrossFilterRibbon";
import { ChartExportButton } from "./ChartExportButton";

interface FunnelStageItem {
  stage: string;
  count: number;
  rate: number;
  dropRate: number;
}

interface TTFItem {
  position: string;
  avgDays: number;
  count: number;
}

interface RecruitmentPerformancePerspectiveProps {
  funnelDetailed?: {
    stages: FunnelStageItem[];
    timeToFillByPosition: TTFItem[];
    avgTimeToFillDays: number;
  };
  departmentProgress: any[];
  criticalDemands: any[];
  loading: boolean;
  crossFilter?: CrossFilterState;
  onCrossFilterChange?: (key: keyof CrossFilterState, value?: string, label?: string) => void;
}

export const RecruitmentPerformancePerspective: React.FC<RecruitmentPerformancePerspectiveProps> = ({
  funnelDetailed,
  departmentProgress,
  criticalDemands,
  loading,
  crossFilter,
  onCrossFilterChange,
}) => {
  const { t } = useTranslation();
  const funnelCardRef = useRef<HTMLDivElement>(null);

  const stages = funnelDetailed?.stages || [];
  const maxFunnelCount = Math.max(...stages.map((s) => s.count), 1);
  const avgTTF = funnelDetailed?.avgTimeToFillDays;
  const ttfPositions = funnelDetailed?.timeToFillByPosition || [];

  const stageColors = [
    { bg: "bg-sky-500", text: "text-sky-600 dark:text-sky-400", light: "bg-sky-50 dark:bg-sky-950/40" },
    { bg: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400", light: "bg-indigo-50 dark:bg-indigo-950/40" },
    { bg: "bg-purple-500", text: "text-purple-600 dark:text-purple-400", light: "bg-purple-50 dark:bg-purple-950/40" },
    { bg: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", light: "bg-amber-50 dark:bg-amber-950/40" },
    { bg: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", light: "bg-emerald-50 dark:bg-emerald-950/40" },
  ];

  return (
    <div className="space-y-2.5 w-full">
      {/* Row 1: 5-Stage Conversion Funnel & Time-to-Fill (2 Balanced Matched-Height Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full">
        {/* Left: 5-Stage Conversion Funnel with Drop-off tracking */}
        <div
          ref={funnelCardRef}
          className="col-span-12 lg:col-span-6 bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-xl border border-zinc-200/90 dark:border-[#26262C] rounded-xl p-3.5 flex flex-col justify-between shadow-2xs h-full"
        >
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide leading-tight">
                    {t("deepFunnel")}
                  </h3>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    {t("funnelDesc")}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  href="/candidates"
                  className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center"
                >
                  {t("candidateProfilesLink")} <ArrowRight className="w-3 h-3 ml-0.5" />
                </Link>

                <ChartExportButton
                  targetRef={funnelCardRef}
                  chartTitle={t("deepFunnel", "Phễu Chuyển Đổi Tuyển Dụng")}
                  fileNamePrefix="Pheu_Chuyen_Doi_Tuyen_Dung"
                />
              </div>
            </div>

            {/* Stages Stack */}
            <div className="my-3 space-y-2.5">
              {loading ? (
                <div className="py-12 text-center text-xs text-zinc-400">{t("loading")}</div>
              ) : (
                stages.map((st, i) => {
                  const widthPct = Math.max(18, Math.round((st.count / maxFunnelCount) * 100));
                  const meta = stageColors[i % stageColors.length];

                  return (
                    <div key={st.stage} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-zinc-800 dark:text-zinc-200 text-[11px]">
                            {st.stage}
                          </span>
                          {st.dropRate > 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              - {st.dropRate}% {t("notPass").toLowerCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 tabular-nums text-[11px]">
                          <span className="font-black text-zinc-900 dark:text-white">
                            {st.count.toLocaleString("vi-VN")}
                          </span>
                          <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${meta.light} ${meta.text}`}>
                            {st.rate}%
                          </span>
                        </div>
                      </div>

                      {/* Bar */}
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-md h-5 p-0.5 flex items-center justify-center relative overflow-hidden">
                        <div
                          className={`h-full rounded transition-all duration-500 ${meta.bg}`}
                          style={{ width: `${widthPct}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-800 dark:text-white drop-shadow-xs pointer-events-none">
                          {st.count.toLocaleString("vi-VN")} {t("unitLabelPerson")}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick summary footer for funnel efficiency */}
          {stages.length >= 5 && (
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
              <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {t("overallEfficiency")}:
              </span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                {stages[4]?.rate || stages[stages.length - 1]?.rate}%
              </span>
            </div>
          )}
        </div>

        {/* Right: Time-to-Fill Analysis (6 cols - Perfectly Matched Height) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col h-full">
          <TimeToFillChart
            positions={ttfPositions}
            avgTTF={avgTTF || 0}
            loading={loading}
            selectedPosition={crossFilter?.position}
            onSelectPosition={(pos) =>
              onCrossFilterChange?.("position", pos === crossFilter?.position ? undefined : pos)
            }
          />
        </div>
      </div>

      {/* Row 2: Department Progress Bar Chart (Full Width - Wide, Spacious & Multi-column) */}
      <div className="w-full">
        <DepartmentProgressBarChart
          data={departmentProgress}
          loading={loading}
          selectedDiv={crossFilter?.div}
          onSelectDiv={(code, name) =>
            onCrossFilterChange?.("div", code === crossFilter?.div ? undefined : code, name)
          }
        />
      </div>
    </div>
  );
};
