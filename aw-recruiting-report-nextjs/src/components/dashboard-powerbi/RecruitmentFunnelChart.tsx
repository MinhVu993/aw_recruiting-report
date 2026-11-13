"use client";

import React from "react";
import { Filter, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export interface FunnelStage {
  stage: string;
  count: number;
  rate: number;
}

export interface PositionDistribution {
  name: string;
  count: number;
  percentage: number;
}

interface RecruitmentFunnelChartProps {
  stages: FunnelStage[];
  positions?: PositionDistribution[];
  loading: boolean;
}

export const RecruitmentFunnelChart: React.FC<RecruitmentFunnelChartProps> = ({
  stages,
  positions = [],
  loading,
}) => {
  const { t } = useTranslation();
  // Only take the first 4 clean stages (Tiếp nhận -> HR duyệt -> BP duyệt -> Cấp mã thẻ)
  const cleanStages = stages.slice(0, 4);
  const maxCount = Math.max(...cleanStages.map((s) => s.count), 1);

  // Modern coordinated colors per stage
  const stageMeta = [
    { bg: "bg-sky-500", text: "text-sky-600 dark:text-sky-400", light: "bg-sky-50 dark:bg-sky-950/40" },
    { bg: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400", light: "bg-indigo-50 dark:bg-indigo-950/40" },
    { bg: "bg-purple-500", text: "text-purple-600 dark:text-purple-400", light: "bg-purple-50 dark:bg-purple-950/40" },
    { bg: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", light: "bg-emerald-50 dark:bg-emerald-950/40" },
  ];

  const finalRate = cleanStages.length >= 4 ? cleanStages[3]?.rate || 0 : 0;

  return (
    <div className="bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl p-3 flex flex-col justify-between shadow-2xs h-full min-h-[300px] transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide leading-tight">
              {t("recruitmentFunnelTitle")}
            </h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
              {t("funnelFourSteps")}
            </p>
          </div>
        </div>

        <Link
          href="/candidates"
          className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center"
        >
          {t("profilesList")} <ArrowRight className="w-3 h-3 ml-0.5" />
        </Link>
      </div>

      {/* Funnel Visual Stack */}
      <div className="my-2.5 flex flex-col space-y-2">
        {loading ? (
          <div className="py-8 text-center text-xs text-zinc-400">{t("loadingFunnel")}</div>
        ) : (
          cleanStages.map((st, i) => {
            const widthPct = Math.max(22, Math.round((st.count / maxCount) * 100));
            const meta = stageMeta[i % stageMeta.length];

            return (
              <div key={st.stage} className="space-y-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 text-[11px] flex items-center gap-1">
                    <span className="text-[10px] text-zinc-400 font-semibold">{i + 1}.</span> {st.stage}
                  </span>
                  <div className="flex items-center space-x-2 tabular-nums text-[11px]">
                    <span className="font-black text-zinc-900 dark:text-white">
                      {st.count.toLocaleString("vi-VN")}
                    </span>
                    <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${meta.light} ${meta.text}`}>
                      {st.rate}%
                    </span>
                  </div>
                </div>

                {/* Funnel Tier Bar */}
                <div className="w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-md h-5 p-0.5 flex items-center justify-center relative overflow-hidden">
                  <div
                    className={`h-full rounded transition-all duration-500 ${meta.bg}`}
                    style={{ width: `${widthPct}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-800 dark:text-white drop-shadow-xs pointer-events-none">
                    {st.count > 0 ? `${st.count.toLocaleString("vi-VN")} ${t("unitLabelPerson")}` : "0"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Position Breakdown Sub-section */}
      {positions.length > 0 && !loading && (
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mb-1">
            <span>{t("positionsHiring")}:</span>
            <span className="text-zinc-700 dark:text-zinc-300">{t("topFourPositions")}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {positions.map((pos) => (
              <div
                key={pos.name}
                className="bg-zinc-50 dark:bg-[#202026] rounded-md px-2 py-1 flex items-center justify-between text-[10px] border border-zinc-100 dark:border-zinc-800/60"
              >
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[85px]" title={pos.name}>
                  {pos.name}
                </span>
                <span className="font-black text-zinc-900 dark:text-white tabular-nums">
                  {pos.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
        <span>{t("intakeToCardRate")}</span>
        <span className="font-black text-emerald-600 dark:text-emerald-400">
          {finalRate}% {t("successRateLabel")}
        </span>
      </div>
    </div>
  );
};

