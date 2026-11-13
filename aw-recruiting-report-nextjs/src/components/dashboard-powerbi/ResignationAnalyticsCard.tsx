"use client";

import React, { useState } from "react";
import { UserMinus, ArrowRight, AlertTriangle, Building2, PieChart } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export interface ResignReasonItem {
  reasonId: string;
  reasonName: string;
  count: number;
  percentage: number;
}

export interface ResignDeptItem {
  deptName: string;
  count: number;
}

interface ResignationAnalyticsCardProps {
  data: {
    topReasons: ResignReasonItem[];
    topDepts: ResignDeptItem[];
    total: number;
  };
  loading: boolean;
}

export const ResignationAnalyticsCard: React.FC<ResignationAnalyticsCardProps> = ({
  data,
  loading,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"reasons" | "depts">("reasons");

  const topReasons = data?.topReasons || [];
  const topDepts = data?.topDepts || [];
  const total = data?.total || 0;

  const maxReasonCount = Math.max(...topReasons.map((r) => r.count), 1);
  const maxDeptCount = Math.max(...topDepts.map((d) => d.count), 1);

  return (
    <div className="bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl p-3 flex flex-col justify-between shadow-2xs h-full min-h-[300px] transition-colors">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <UserMinus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide leading-tight">
                {t("turnoverAnalytics")}
              </h3>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {t("turnoverSubtitle")}
              </p>
            </div>
          </div>

          <Link
            href="/resign"
            className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center"
          >
            {t("details")} <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center space-x-1 mt-2.5 mb-1 bg-zinc-100 dark:bg-[#202026] p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab("reasons")}
            className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all ${
              activeTab === "reasons"
                ? "bg-white dark:bg-[#2b2b34] text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {t("topReasons")} ({topReasons.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("depts")}
            className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all ${
              activeTab === "depts"
                ? "bg-white dark:bg-[#2b2b34] text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {t("topDepts")} ({topDepts.length})
          </button>
        </div>
      </div>

      {/* Main List Body */}
      <div className="flex-1 my-1.5 flex flex-col justify-center">
        {loading ? (
          <div className="py-8 text-center text-xs text-zinc-400">{t("loadingResignData")}</div>
        ) : total === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">{t("noResignDataInPeriod")}</div>
        ) : activeTab === "reasons" ? (
          <div className="space-y-1.5">
            {topReasons.map((item, index) => {
              const widthPct = Math.max(12, Math.round((item.count / maxReasonCount) * 100));

              return (
                <div key={item.reasonId || index} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[190px]"
                      title={item.reasonName}
                    >
                      <span className="text-[10px] text-zinc-400 font-bold mr-1">{index + 1}.</span>
                      {item.reasonName}
                    </span>
                    <div className="flex items-center space-x-1.5 tabular-nums text-[11px]">
                      <span className="font-black text-zinc-900 dark:text-white">
                        {item.count.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        index === 0
                          ? "bg-amber-500"
                          : index === 1
                          ? "bg-amber-400"
                          : "bg-amber-300/80 dark:bg-amber-500/50"
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-1.5">
            {topDepts.map((item, index) => {
              const widthPct = Math.max(12, Math.round((item.count / maxDeptCount) * 100));

              return (
                <div key={item.deptName || index} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[190px]"
                      title={item.deptName}
                    >
                      <span className="text-[10px] text-zinc-400 font-bold mr-1">{index + 1}.</span>
                      {item.deptName}
                    </span>
                    <div className="flex items-center space-x-1.5 tabular-nums text-[11px]">
                      <span className="font-black text-zinc-900 dark:text-white">
                        {item.count.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-[10px] text-zinc-400">{t("unitLabelPerson")}</span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-rose-400 dark:bg-rose-500 transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
        <span>{t("totalResignedRecorded")}</span>
        <span className="font-black text-amber-600 dark:text-amber-400 tabular-nums">
          {loading ? "..." : total.toLocaleString("vi-VN")} {t("timesCount")}
        </span>
      </div>
    </div>
  );
};
