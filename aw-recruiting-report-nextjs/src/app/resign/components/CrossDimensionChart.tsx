"use client";

import React, { useState, useMemo } from "react";
import { ResignRecord } from "./types";
import { Layers, Calendar, Clock, BarChart3, AlignLeft, Info } from "lucide-react";
import { parseSeniorityYears } from "@/lib/seniority-utils";

interface CrossDimensionChartProps {
  records?: ResignRecord[];
  initialGroupedData?: Array<{
    reason: string;
    total: number;
    seniority: { lessThan1: number; oneYear: number; twoYears: number; threeUp: number };
    age: { age18to30: number; age31to45: number; age46up: number };
  }>;
  selectedReason: string;
  onSelectReason: (reason: string) => void;
}

type DimensionType = "seniority" | "age";
type ChartMode = "vertical" | "horizontal";

const SENIORITY_CONFIG = [
  { key: "lessThan1", label: "<1 Năm", color: "#38bdf8" },
  { key: "oneYear", label: "1-2 Năm", color: "#34d399" },
  { key: "twoYears", label: "2-3 Năm", color: "#fbbf24" },
  { key: "threeUp", label: ">3 Năm", color: "#a855f7" },
];

const AGE_CONFIG = [
  { key: "age18to30", label: "18-30 Tuổi", color: "#38bdf8" },
  { key: "age31to45", label: "31-45 Tuổi", color: "#f59e0b" },
  { key: "age46up", label: ">46 Tuổi", color: "#f43f5e" },
];

export const CrossDimensionChart: React.FC<CrossDimensionChartProps> = ({
  records = [],
  initialGroupedData,
  selectedReason,
  onSelectReason,
}) => {
  const [dimension, setDimension] = useState<DimensionType>("seniority");
  const [chartMode, setChartMode] = useState<ChartMode>("vertical");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Group and compute cross-dimensional metrics per reason
  const groupedData = useMemo(() => {
    if (initialGroupedData && initialGroupedData.length > 0) {
      return initialGroupedData;
    }
    if (!records || records.length === 0) return [];

    const map: Record<
      string,
      {
        reason: string;
        total: number;
        seniority: { lessThan1: number; oneYear: number; twoYears: number; threeUp: number };
        age: { age18to30: number; age31to45: number; age46up: number };
      }
    > = {};

    records.forEach((r) => {
      const reason = (r.er_reason || "Khác").trim();
      if (!map[reason]) {
        map[reason] = {
          reason,
          total: 0,
          seniority: { lessThan1: 0, oneYear: 0, twoYears: 0, threeUp: 0 },
          age: { age18to30: 0, age31to45: 0, age46up: 0 },
        };
      }

      map[reason].total += 1;

      // Seniority
      const sen = parseSeniorityYears(r.er_seniority);
      if (sen < 1) map[reason].seniority.lessThan1 += 1;
      else if (sen >= 1 && sen < 2) map[reason].seniority.oneYear += 1;
      else if (sen >= 2 && sen < 3) map[reason].seniority.twoYears += 1;
      else map[reason].seniority.threeUp += 1;

      // Age
      const age = Number(r.er_age) || 0;
      if (age >= 18 && age <= 30) map[reason].age.age18to30 += 1;
      else if (age >= 31 && age <= 45) map[reason].age.age31to45 += 1;
      else if (age > 45) map[reason].age.age46up += 1;
    });

    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 7); // Show top 7 dominant reasons for clean presentation
  }, [records]);

  const activeConfig = dimension === "seniority" ? SENIORITY_CONFIG : AGE_CONFIG;

  // Maximum value for scaling the vertical / horizontal columns
  const maxVal = useMemo(() => {
    if (groupedData.length === 0) return 100;
    const max = Math.max(...groupedData.map((d) => d.total));
    // Round up to nice number
    if (max <= 50) return Math.ceil(max / 10) * 10;
    if (max <= 200) return Math.ceil(max / 50) * 50;
    if (max <= 500) return Math.ceil(max / 100) * 100;
    if (max <= 1500) return Math.ceil(max / 250) * 250;
    return Math.ceil(max / 500) * 500;
  }, [groupedData]);

  if (records.length === 0 || groupedData.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
        <Layers className="w-10 h-10 mb-2 stroke-1 opacity-40 text-slate-400" />
        <p className="text-xs font-semibold">Chưa có dữ liệu phân tích thâm niên & độ tuổi</p>
      </div>
    );
  }

  // Vertical SVG Chart Coordinates
  const svgWidth = 680;
  const svgHeight = 280;
  const padLeft = 65;
  const padRight = 16;
  const padTop = 26;
  const padBottom = 96;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal].map((v) => Math.round(v));
  const colSlotWidth = plotWidth / groupedData.length;
  const barWidth = Math.min(46, Math.max(26, colSlotWidth * 0.52));

  const hoveredRow = hoveredIdx !== null ? groupedData[hoveredIdx] : null;

  return (
    <div className="flex flex-col h-full select-none">
      {/* Header with Controls */}
      <div className="flex flex-wrap items-center justify-between pb-2 mb-2 border-b border-[#e2e6eb] dark:border-[#26262C] gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-md bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Biểu Đồ Cột: Tương Quan Lý Do & {dimension === "seniority" ? "Thâm Niên" : "Độ Tuổi"}
            </h4>
            <p className="text-[10px] text-slate-500">
              Chiều cao cột biểu thị số người thực tế • Phân tầng tỷ lệ theo màu sắc
            </p>
          </div>
        </div>

        {/* Controls: Chart Mode Toggle & Dimension Toggle */}
        <div className="flex items-center gap-1.5">
          {/* Chart Type: Vertical Column vs Horizontal Bar */}
          <div className="flex items-center bg-slate-200/70 dark:bg-[#131316] p-0.5 rounded-lg border border-[#d8dce2] dark:border-[#26262C]">
            <button
              onClick={() => setChartMode("vertical")}
              title="Biểu đồ Cột Đứng (Vertical Columns)"
              className={`p-1 rounded-md transition-all ${
                chartMode === "vertical"
                  ? "bg-white dark:bg-[#202026] text-sky-600 dark:text-sky-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartMode("horizontal")}
              title="Biểu đồ Cột Ngang (Horizontal Bars)"
              className={`p-1 rounded-md transition-all ${
                chartMode === "horizontal"
                  ? "bg-white dark:bg-[#202026] text-sky-600 dark:text-sky-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dimension Toggle: Seniority vs Age */}
          <div className="flex items-center bg-slate-200/70 dark:bg-[#131316] p-0.5 rounded-lg border border-[#d8dce2] dark:border-[#26262C]">
            <button
              onClick={() => setDimension("seniority")}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                dimension === "seniority"
                  ? "bg-white dark:bg-[#202026] text-sky-600 dark:text-sky-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Thâm Niên</span>
            </button>
            <button
              onClick={() => setDimension("age")}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                dimension === "age"
                  ? "bg-white dark:bg-[#202026] text-amber-600 dark:text-amber-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Độ Tuổi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Legend Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1 text-[11px]">
        <div className="flex items-center gap-3">
          {activeConfig.map((item) => (
            <div key={item.key} className="flex items-center space-x-1.5">
              <span
                className="w-2.5 h-2.5 rounded-xs"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {item.label}
              </span>
            </div>
          ))}
        </div>
        <span className="text-[10px] text-slate-400 hidden sm:inline">
          * Nhấn vào cột để lọc lý do trong danh sách
        </span>
      </div>

      {/* Chart Canvas Area */}
      <div className="flex-1 min-h-[250px] relative flex flex-col justify-center">
        {chartMode === "vertical" ? (
          /* ========================================================================= */
          /* MODE 1: VERTICAL STACKED COLUMN CHART (Biểu đồ cột đứng trực quan)        */
          /* ========================================================================= */
          <div className="w-full h-full flex flex-col justify-center">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Glow filter for selected / hovered column */}
                <filter id="column-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Y-Axis Grid Lines & Numbers */}
              {yTicks.map((tick, i) => {
                const y = padTop + plotHeight - (tick / maxVal) * plotHeight;
                return (
                  <g key={i}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={svgWidth - padRight}
                      y2={y}
                      stroke="currentColor"
                      strokeDasharray={i === 0 ? "none" : "3 3"}
                      className="text-slate-200 dark:text-[#26262C]"
                      strokeWidth={i === 0 ? "1.5" : "1"}
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      className="text-[9.5px] font-bold fill-slate-400 dark:fill-slate-500 tabular-nums"
                    >
                      {tick.toLocaleString()}
                    </text>
                  </g>
                );
              })}

              {/* Data Columns */}
              {groupedData.map((row, idx) => {
                const isSelected = selectedReason.toLowerCase() === row.reason.toLowerCase();
                const isHovered = hoveredIdx === idx;
                const slotCenterX = padLeft + (idx + 0.5) * colSlotWidth;
                const barX = slotCenterX - barWidth / 2;
                const counts = dimension === "seniority" ? row.seniority : row.age;

                // Stack segments from bottom up
                let currentY = padTop + plotHeight;
                const segments: { key: string; color: string; val: number; y: number; h: number; pct: number }[] = [];

                activeConfig.forEach((cfg) => {
                  const val = counts[cfg.key as keyof typeof counts] || 0;
                  const h = maxVal > 0 ? (val / maxVal) * plotHeight : 0;
                  const pct = row.total > 0 ? Math.round((val / row.total) * 100) : 0;
                  if (h > 0) {
                    currentY -= h;
                    segments.push({
                      key: cfg.key,
                      color: cfg.color,
                      val,
                      y: currentY,
                      h,
                      pct,
                    });
                  }
                });

                const totalBarHeight = (row.total / maxVal) * plotHeight;
                const topBarY = padTop + plotHeight - totalBarHeight;

                return (
                  <g
                    key={row.reason}
                    className="cursor-pointer transition-all duration-200 group"
                    onClick={() =>
                      onSelectReason(
                        selectedReason.toLowerCase() === row.reason.toLowerCase() ? "all" : row.reason
                      )
                    }
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    <title>{`${row.reason}: Tổng ${row.total.toLocaleString()} người`}</title>
                    {/* Background Slot Highlight on Hover */}
                    <rect
                      x={padLeft + idx * colSlotWidth + 2}
                      y={padTop}
                      width={colSlotWidth - 4}
                      height={plotHeight}
                      rx="6"
                      className={`transition-colors ${
                        isSelected
                          ? "fill-sky-500/15 dark:fill-sky-400/20"
                          : isHovered
                          ? "fill-slate-200/50 dark:fill-[#222228]"
                          : "fill-transparent"
                      }`}
                    />

                    {/* Stacked Segments inside Column */}
                    {segments.map((seg, sIdx) => {
                      const isTop = sIdx === segments.length - 1;
                      return (
                        <rect
                          key={seg.key}
                          x={barX}
                          y={seg.y}
                          width={barWidth}
                          height={seg.h}
                          fill={seg.color}
                          rx={isTop ? 4 : 0}
                          ry={isTop ? 4 : 0}
                          className="transition-all duration-300"
                          opacity={isHovered || isSelected ? 1 : 0.88}
                        />
                      );
                    })}

                    {/* Column Border / Glow when Selected */}
                    {isSelected && (
                      <rect
                        x={barX - 2}
                        y={topBarY - 2}
                        width={barWidth + 4}
                        height={totalBarHeight + 2}
                        rx="5"
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                    )}

                    {/* Total Count Label Above Bar */}
                    <text
                      x={slotCenterX}
                      y={Math.max(12, topBarY - 6)}
                      textAnchor="middle"
                      className={`text-[10px] font-black tabular-nums transition-colors ${
                        isSelected
                          ? "fill-sky-600 dark:fill-sky-400 font-extrabold"
                          : "fill-slate-700 dark:fill-slate-200"
                      }`}
                    >
                      {row.total.toLocaleString()}
                    </text>

                    {/* X-Axis Category Label rotated -35 degrees for full readability without truncation */}
                    <g transform={`translate(${slotCenterX}, ${padTop + plotHeight + 12})`}>
                      <text
                        x={0}
                        y={0}
                        transform="rotate(-35)"
                        textAnchor="end"
                        fontSize="10"
                        className={`font-semibold select-none transition-colors ${
                          isSelected
                            ? "fill-sky-600 dark:fill-sky-400 font-bold"
                            : isHovered
                            ? "fill-slate-900 dark:fill-white font-bold"
                            : "fill-slate-600 dark:fill-slate-400 font-medium"
                        }`}
                      >
                        {row.reason}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          /* ========================================================================= */
          /* MODE 2: HORIZONTAL BAR CHART WITH PROPORTIONAL SCALING                    */
          /* ========================================================================= */
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-1 py-1">
            {groupedData.map((row, idx) => {
              const isSelected = selectedReason.toLowerCase() === row.reason.toLowerCase();
              const counts = dimension === "seniority" ? row.seniority : row.age;
              const isHovered = hoveredIdx === idx;
              const barPctOfMax = maxVal > 0 ? (row.total / maxVal) * 100 : 0;

              return (
                <div
                  key={row.reason}
                  onClick={() =>
                    onSelectReason(
                      selectedReason.toLowerCase() === row.reason.toLowerCase() ? "all" : row.reason
                    )
                  }
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-sky-50/70 dark:bg-sky-950/30 border-sky-400 dark:border-sky-600 shadow-xs ring-1 ring-sky-400"
                      : isHovered
                      ? "bg-slate-100/90 dark:bg-[#1b1b20] border-slate-300 dark:border-slate-700"
                      : "bg-[#f8fafc] dark:bg-[#131316] border-[#e8ecf1] dark:border-[#26262C]"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                      {row.reason}
                    </span>
                    <span className="tabular-nums font-bold text-slate-700 dark:text-slate-300 shrink-0 text-[11px]">
                      {row.total.toLocaleString()} người
                    </span>
                  </div>

                  {/* Proportional Width Container */}
                  <div className="w-full bg-slate-200/70 dark:bg-slate-800/80 h-3 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${Math.max(4, barPctOfMax)}%` }}
                      className="h-full flex rounded-full overflow-hidden shadow-2xs"
                    >
                      {activeConfig.map((cfg) => {
                        const val = counts[cfg.key as keyof typeof counts] || 0;
                        const pct = row.total > 0 ? (val / row.total) * 100 : 0;
                        if (pct <= 0) return null;

                        return (
                          <div
                            key={cfg.key}
                            style={{
                              width: `${pct}%`,
                              backgroundColor: cfg.color,
                            }}
                            className="h-full transition-all duration-300 hover:brightness-110"
                            title={`${row.reason} - ${cfg.label}: ${val} người (${Math.round(pct)}%)`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Detail Box / Footer Insight */}
      <div className="mt-2 pt-2 border-t border-[#e2e6eb] dark:border-[#202026] flex items-center justify-between text-[11px] min-h-[32px]">
        {hoveredRow ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 w-full bg-sky-50/60 dark:bg-sky-950/20 px-2.5 py-1 rounded-md border border-sky-100 dark:border-sky-900/40">
            <span className="font-bold text-sky-700 dark:text-sky-300 truncate max-w-[200px]">
              {hoveredRow.reason}:
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
              Tổng {hoveredRow.total.toLocaleString()} người
            </span>
            <div className="flex items-center gap-3 ml-auto text-[10.5px]">
              {activeConfig.map((cfg) => {
                const counts = dimension === "seniority" ? hoveredRow.seniority : hoveredRow.age;
                const val = counts[cfg.key as keyof typeof counts] || 0;
                const pct = hoveredRow.total > 0 ? Math.round((val / hoveredRow.total) * 100) : 0;
                return (
                  <div key={cfg.key} className="flex items-center space-x-1 tabular-nums">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                    <span className="text-slate-500 dark:text-slate-400">{cfg.label}:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{val}</strong>
                    <span className="text-slate-400 text-[10px]">({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 text-slate-400 italic">
            <Info className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span>Rê chuột vào cột để xem chi tiết số lượng và phần trăm từng nhóm thâm niên / độ tuổi</span>
          </div>
        )}
      </div>
    </div>
  );
};
