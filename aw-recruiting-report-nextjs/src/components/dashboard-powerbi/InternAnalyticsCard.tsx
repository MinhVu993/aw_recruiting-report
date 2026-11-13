"use client";

import React, { useRef } from "react";
import { GraduationCap, ArrowRight, School, BookOpen } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { ChartExportButton } from "./ChartExportButton";

export interface InternSchoolItem {
  school: string;
  count: number;
  percentage: number;
}

export interface InternStatusItem {
  status: string;
  count: number;
}

interface InternAnalyticsCardProps {
  data: {
    bySchool: InternSchoolItem[];
    byStatus?: InternStatusItem[];
    total: number;
  };
  loading: boolean;
}

export const InternAnalyticsCard: React.FC<InternAnalyticsCardProps> = ({
  data,
  loading,
}) => {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const bySchool = data?.bySchool || [];
  const total = data?.total || 0;
  const maxCount = Math.max(...bySchool.map((s) => s.count), 1);

  return (
    <div
      ref={cardRef}
      className="bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl p-3 flex flex-col justify-between shadow-2xs h-full min-h-[300px] transition-colors"
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide leading-tight">
                {t("intern")}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/intern"
              className="text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center"
            >
              {t("viewList")} <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>

            <ChartExportButton
              targetRef={cardRef}
              chartTitle={t("intern", "Phân Tích Thực Tập Sinh")}
              fileNamePrefix="Thuc_Tap_Sinh"
            />
          </div>
        </div>

        {/* Quick Snapshot Badge */}
        <div className="flex items-center justify-between mt-2.5 mb-1 bg-violet-50/60 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 px-2 py-1.5 rounded-lg">
          <span className="text-[11px] font-bold text-violet-900 dark:text-violet-300">
            {t("partnerSchoolsSource")}:
          </span>
          <span className="text-xs font-black text-violet-700 dark:text-violet-300 tabular-nums">
            {loading ? "..." : `${total} ${t("unitLabelPerson")}`}
          </span>
        </div>
      </div>

      {/* Main List Body */}
      <div className="flex-1 my-1.5 flex flex-col justify-center">
        {loading ? (
          <div className="py-8 text-center text-xs text-zinc-400">{t("loading")}</div>
        ) : total === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">{t("noInternsInPeriod")}</div>
        ) : (
          <div className="space-y-2">
            {bySchool.map((item, index) => {
              const widthPct = Math.max(15, Math.round((item.count / maxCount) * 100));

              return (
                <div key={item.school || index} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[130px]"
                      title={item.school}
                    >
                      <span className="text-[10px] text-zinc-400 font-bold mr-1">{index + 1}.</span>
                      {item.school}
                    </span>
                    <div className="flex items-center space-x-1.5 tabular-nums text-[11px]">
                      <span className="font-black text-zinc-900 dark:text-white">
                        {item.count} {t("unitLabelPerson")}
                      </span>
                      <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-1 py-0.2 rounded">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        index === 0
                          ? "bg-violet-600 dark:bg-violet-500"
                          : index === 1
                          ? "bg-violet-500 dark:bg-violet-400"
                          : "bg-violet-400/80 dark:bg-violet-400/50"
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
