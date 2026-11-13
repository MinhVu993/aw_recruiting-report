"use client";

import React from "react";
import { RefreshCw, Layers, Calendar, FileDown } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface PowerBiSlicersBarProps {
  selectedFactory: string;
  onFactoryChange: (loc: string) => void;
  timeRange: string;
  onTimeRangeChange: (r: string) => void;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (d: string) => void;
  onEndDateChange?: (d: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  onRefresh: () => void;
  loading: boolean;
  onOpenExportPdf?: () => void;
}

export const PowerBiSlicersBar: React.FC<PowerBiSlicersBarProps> = ({
  selectedFactory,
  onFactoryChange,
  timeRange,
  onTimeRangeChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  loading,
  onOpenExportPdf,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-xl border border-zinc-200/90 dark:border-[#26262C] rounded-xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs transition-colors">
      {/* Left: Brand & Live Indicator */}
      <div className="flex items-center space-x-3 shrink-0">
        <div className="h-9 w-9 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center shadow-2xs">
          <Layers className="w-4.5 h-4.5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xs sm:text-[13px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 leading-none">
              {t("recruitmentPerformance", "Tuyển Dụng Analytics")}
            </h2>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Data
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-none">
            {t("demandManagement", "Bảng điều khiển chỉ số định biên & tiến độ nhân lực")}
          </p>
        </div>
      </div>

      {/* Center & Right: Power BI Interactive Slicers */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Factory Slicer */}
        <div className="flex items-center bg-[#f1f3f6] dark:bg-[#131316] p-1 rounded-lg border border-[#d8dce2] dark:border-[#26262C] gap-0.5">
          {[
            { label: t("all", "Tất Cả"), value: "all" },
            { label: "AW", value: "aw" },
          ].map((item) => {
            const isSelected = selectedFactory.toLowerCase() === item.value;
            return (
              <button
                key={item.value}
                onClick={() => onFactoryChange(item.value)}
                className={`h-9 px-3.5 rounded-md text-xs font-bold uppercase inline-flex items-center justify-center transition-colors duration-150 active:scale-[0.97] cursor-pointer ${
                  isSelected
                    ? "bg-rose-600 text-white shadow-xs font-black border border-rose-600"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#1e1e24]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Time Period Slicer */}
        <div className="flex items-center bg-[#f1f3f6] dark:bg-[#131316] p-1 rounded-lg border border-[#d8dce2] dark:border-[#26262C] gap-0.5 overflow-x-auto max-w-full no-scrollbar">
          {[
            { label: t("all", "Tất cả"), value: "all" },
            { label: t("today", "Hôm nay"), value: "today" },
            { label: t("thisWeek", "Tuần"), value: "week" },
            { label: t("thisMonth", "Tháng"), value: "month" },
            { label: t("thisYear", "Năm"), value: "year" },
            { label: t("customRange", "Khoảng ngày"), value: "custom" },
          ].map((item) => {
            const isSelected = timeRange === item.value;
            return (
              <button
                key={item.value}
                onClick={() => onTimeRangeChange(item.value)}
                className={`h-9 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1.5 justify-center transition-colors duration-150 active:scale-[0.97] cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? "bg-white dark:bg-[#202028] text-slate-900 dark:text-white font-bold shadow-xs border border-slate-300 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#1e1e24]"
                }`}
              >
                <span>{item.label}</span>
                {item.value === "week" && (
                  <span
                    className={`text-[10px] px-1 py-0.2 rounded font-semibold ${
                      isSelected
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                        : "bg-slate-200/70 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                    title="Từ Thứ 2 đến Thứ 7 trong tuần hiện tại (bỏ qua Chủ nhật)"
                  >
                  </span>
                )}
                {item.value === "month" && (
                  <span
                    className={`text-[10px] px-1 py-0.2 rounded font-semibold ${
                      isSelected
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                        : "bg-slate-200/70 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                    title={`Lấy trong tháng hiện tại (Tháng ${new Date().getMonth() + 1})`}
                  >
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Date Range Picker: Only shown when timeRange is 'custom' */}
        {timeRange === "custom" && (
          <div className="flex flex-wrap items-center gap-1.5 bg-[#f1f3f6] dark:bg-[#131316] p-1 rounded-lg border border-rose-300 dark:border-rose-900/60 shadow-2xs">
            <div className="flex items-center gap-1.5 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {t("From date", "Từ")}
              </span>
              <input
                type="date"
                aria-label={t("From date", "Từ ngày")}
                value={startDate || ""}
                onChange={(e) => onStartDateChange && onStartDateChange(e.target.value)}
                className="h-7 px-2 py-0.5 text-xs font-semibold rounded bg-white dark:bg-[#202028] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
              />
            </div>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold" aria-hidden="true">→</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {t("to date", "Đến")}
              </span>
              <input
                type="date"
                aria-label={t("to date", "Đến ngày")}
                value={endDate || ""}
                onChange={(e) => onEndDateChange && onEndDateChange(e.target.value)}
                className="h-7 px-2 py-0.5 text-xs font-semibold rounded bg-white dark:bg-[#202028] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Status Slicer */}
        <div className="flex items-center bg-[#f1f3f6] dark:bg-[#131316] p-1 rounded-lg border border-[#d8dce2] dark:border-[#26262C] gap-0.5">
          {[
            { label: t("inProgress", "Đang tuyển"), value: "open" },
            { label: t("fulfilled", "Đã hoàn thành"), value: "closed" },
            { label: t("all", "Toàn bộ"), value: "all" },
          ].map((item) => {
            const isSelected = statusFilter === item.value;
            return (
              <button
                key={item.value}
                onClick={() => onStatusFilterChange(item.value)}
                className={`h-9 px-3.5 rounded-md text-xs font-semibold inline-flex items-center justify-center transition-colors duration-150 active:scale-[0.97] cursor-pointer ${
                  isSelected
                    ? "bg-sky-600 text-white shadow-xs font-bold border border-sky-600"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#1e1e24]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Export PDF Button */}
        {onOpenExportPdf && (
          <button
            onClick={onOpenExportPdf}
            aria-label={t("exportPdfReport", "Xuất Báo Cáo PDF")}
            className="h-9 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center space-x-1.5 shadow-xs shadow-rose-600/20 active:scale-[0.97] transition-all cursor-pointer"
            title={t("exportPdfReport", "Xuất file PDF chart biểu đồ báo cáo")}
          >
            <FileDown className="w-4 h-4 text-white" aria-hidden="true" />
            <span className="hidden sm:inline">{t("exportPdf", "Xuất PDF")}</span>
          </button>
        )}

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          aria-label={t("refresh", "Tải lại số liệu mới nhất")}
          className="h-9 w-9 rounded-lg bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#383842] inline-flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-[#202028] transition-colors duration-150 shadow-xs active:scale-[0.97] cursor-pointer"
          title={t("refresh", "Tải lại số liệu mới nhất")}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-rose-500" : ""}`} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
