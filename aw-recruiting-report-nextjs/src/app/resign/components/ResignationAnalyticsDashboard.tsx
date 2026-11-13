"use client";

import React from "react";
import { ResignRecord, ReasonBreakdownItem } from "./types";
import { DonutReasonChart } from "./DonutReasonChart";
import { CrossDimensionChart } from "./CrossDimensionChart";
import { ParetoAnalysisChart } from "./ParetoAnalysisChart";
import { BarChart3, Filter, RotateCcw } from "lucide-react";

interface ResignationAnalyticsDashboardProps {
  records?: ResignRecord[];
  initialGroupedData?: Array<{
    reason: string;
    total: number;
    seniority: { lessThan1: number; oneYear: number; twoYears: number; threeUp: number };
    age: { age18to30: number; age31to45: number; age46up: number };
  }>;
  reasonBreakdown: ReasonBreakdownItem[];
  totalResign: number;
  selectedReason: string;
  onSelectReason: (reason: string) => void;
}

export const ResignationAnalyticsDashboard: React.FC<ResignationAnalyticsDashboardProps> = ({
  records,
  initialGroupedData,
  reasonBreakdown,
  totalResign,
  selectedReason,
  onSelectReason,
}) => {
  const isFiltered = selectedReason && selectedReason !== "all";

  return (
    <div className="shrink-0 rounded-xl border border-[#d8dce2] dark:border-[#26262C] bg-white dark:bg-[#18181C] flex flex-col shadow-xs overflow-hidden">
      {/* Dashboard Card Header */}
      <div className="px-3.5 py-2.5 border-b border-[#d8dce2] dark:border-[#26262C] bg-[#f1f3f6] dark:bg-[#131316] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-md bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Phân Tích Chuyên Sâu Tỷ Trọng & Nguyên Nhân Thôi Việc
            </h3>

          </div>
        </div>

        {/* Filter State indicator & Reset Button */}
        <div className="flex items-center space-x-2">
          {isFiltered && (
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-semibold animate-pulse">
              <Filter className="w-3 h-3 text-sky-500" />
              <span>Đang lọc lý do:</span>
              <strong className="text-sky-800 dark:text-sky-200 uppercase">{selectedReason}</strong>
              <button
                onClick={() => onSelectReason("all")}
                className="ml-1 text-sky-600 hover:text-sky-900 dark:hover:text-white"
                title="Hủy lọc"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bento Grid Content */}
      <div className="p-3.5 grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Block 1: Donut / Horizontal Bar Chart & Rankings (5 cols on lg) */}
        <div className="lg:col-span-5 p-3 rounded-xl bg-white dark:bg-[#151518] border border-[#e2e6eb] dark:border-[#222228] flex flex-col shadow-2xs min-h-0">
          <DonutReasonChart
            data={reasonBreakdown}
            totalResign={totalResign}
            selectedReason={selectedReason}
            onSelectReason={onSelectReason}
          />
        </div>

        {/* Block 2: Cross Dimension Analysis (7 cols on lg) */}
        <div className="lg:col-span-7 p-3 rounded-xl bg-white dark:bg-[#151518] border border-[#e2e6eb] dark:border-[#222228] flex flex-col shadow-2xs">
          <CrossDimensionChart
            records={records}
            initialGroupedData={initialGroupedData}
            selectedReason={selectedReason}
            onSelectReason={onSelectReason}
          />
        </div>

        {/* Block 3: Pareto 80/20 Chart & Smart Insights (12 cols on lg) */}
        <div className="lg:col-span-12 p-3.5 rounded-xl bg-white dark:bg-[#151518] border border-[#e2e6eb] dark:border-[#222228] flex flex-col shadow-2xs">
          <ParetoAnalysisChart
            data={reasonBreakdown}
            totalResign={totalResign}
            records={records || []}
            selectedReason={selectedReason}
            onSelectReason={onSelectReason}
          />
        </div>
      </div>
    </div>
  );
};
