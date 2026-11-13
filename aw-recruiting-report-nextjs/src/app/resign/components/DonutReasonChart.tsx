"use client";

import React, { useState, useMemo } from "react";
import { ReasonBreakdownItem } from "./types";
import { AlignLeft, PieChart, XCircle, TrendingUp, Sparkles } from "lucide-react";

interface DonutReasonChartProps {
  data: ReasonBreakdownItem[];
  totalResign: number;
  selectedReason: string;
  onSelectReason: (reason: string) => void;
}

type ChartViewMode = "bar" | "donut";

const PALETTE = [
  "#f43f5e", // Rose
  "#f59e0b", // Amber
  "#0ea5e9", // Sky
  "#10b981", // Emerald
  "#6366f1", // Indigo
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#e11d48", // Dark Rose
  "#d97706", // Amber-600
  "#0284c7", // Sky-600
  "#059669", // Emerald-600
  "#64748b", // Slate
];

// Helper: Convert polar to cartesian coordinates for Donut fallback
function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

// Helper: Describe an SVG arc path
function describeArc(
  x: number,
  y: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const outerStart = polarToCartesian(x, y, outerRadius, endAngle);
  const outerEnd = polarToCartesian(x, y, outerRadius, startAngle);
  const innerStart = polarToCartesian(x, y, innerRadius, endAngle);
  const innerEnd = polarToCartesian(x, y, innerRadius, startAngle);

  const arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", outerStart.x, outerStart.y,
    "A", outerRadius, outerRadius, 0, arcSweep, 0, outerEnd.x, outerEnd.y,
    "L", innerEnd.x, innerEnd.y,
    "A", innerRadius, innerRadius, 0, arcSweep, 1, innerStart.x, innerStart.y,
    "Z",
  ].join(" ");
}

export const DonutReasonChart: React.FC<DonutReasonChartProps> = ({
  data,
  totalResign,
  selectedReason,
  onSelectReason,
}) => {
  // Default to Horizontal Bar Chart as requested
  const [viewMode, setViewMode] = useState<ChartViewMode>("bar");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Maximum value for proportional scaling in horizontal bars
  const maxCount = useMemo(() => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map((d) => d.count), 1);
  }, [data]);

  // Compute angles for Donut mode
  const arcs = useMemo(() => {
    if (totalResign <= 0 || data.length === 0) return [];

    let currentAngle = 0;
    return data.map((item, index) => {
      const angle = (item.count / totalResign) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      return {
        ...item,
        startAngle,
        endAngle: Math.min(endAngle, 359.99),
        color: PALETTE[index % PALETTE.length],
        index,
      };
    });
  }, [data, totalResign]);

  // Donut Center display data
  const centerInfo = useMemo(() => {
    if (hoveredIdx !== null && arcs[hoveredIdx]) {
      const item = arcs[hoveredIdx];
      return {
        label: item.reason,
        count: item.count,
        pct: item.pct,
        color: item.color,
      };
    }

    if (selectedReason && selectedReason !== "all") {
      const match = arcs.find(
        (a) => a.reason.toLowerCase() === selectedReason.toLowerCase()
      );
      if (match) {
        return {
          label: match.reason,
          count: match.count,
          pct: match.pct,
          color: match.color,
        };
      }
    }

    return {
      label: "Tổng thôi việc",
      count: totalResign,
      pct: 100,
      color: "#0284c7",
    };
  }, [hoveredIdx, selectedReason, arcs, totalResign]);

  if (totalResign === 0 || data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
        <AlignLeft className="w-10 h-10 mb-2 stroke-1 opacity-40 text-slate-400" />
        <p className="text-xs font-semibold">Chưa có dữ liệu nguyên nhân thôi việc</p>
        <p className="text-[11px] text-slate-500 mt-0.5">Vui lòng điều chỉnh bộ lọc để xem thống kê</p>
      </div>
    );
  }

  const topReason = data[0];

  return (
    <div className="flex flex-col h-full">
      {/* Header with Title, Clear Filter, and Chart Mode Switcher */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e2e6eb] dark:border-[#26262C]">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Tỷ Trọng Nguyên Nhân Thôi Việc
          </h4>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Active Filter Badge & Reset */}
          {selectedReason && selectedReason !== "all" && (
            <button
              onClick={() => onSelectReason("all")}
              className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
              title="Bỏ lọc nguyên nhân"
            >
              <XCircle className="w-3 h-3" />
              <span>Bỏ lọc</span>
            </button>
          )}

          {/* Chart Type Toggle: Horizontal Bar Chart vs Donut Chart */}
          <div className="flex items-center bg-slate-200/70 dark:bg-[#131316] p-0.5 rounded-lg border border-[#d8dce2] dark:border-[#26262C]">
            <button
              onClick={() => setViewMode("bar")}
              title="Biểu đồ thanh ngang (Horizontal Bar Chart)"
              className={`p-1 rounded-md transition-all ${
                viewMode === "bar"
                  ? "bg-white dark:bg-[#202026] text-sky-600 dark:text-sky-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("donut")}
              title="Biểu đồ tròn (Donut Chart)"
              className={`p-1 rounded-md transition-all ${
                viewMode === "donut"
                  ? "bg-white dark:bg-[#202026] text-sky-600 dark:text-sky-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MODE 1: HORIZONTAL BAR CHART (Default & Highly Recommended) */}
      {viewMode === "bar" ? (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Quick Metrics Strip */}
          <div className="flex items-center justify-between px-2 py-1 mb-2 rounded-md bg-slate-50/80 dark:bg-[#18181d] border border-slate-200/60 dark:border-[#222228] text-[11px]">
            <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
              <span>Tổng:</span>
              <strong className="text-slate-900 dark:text-white tabular-nums">{totalResign}</strong>
              <span className="text-[10px]">thôi việc</span>
            </div>
            {topReason && (
              <div className="flex items-center space-x-1 text-[10.5px] truncate max-w-[210px] text-slate-600 dark:text-slate-400">
                <TrendingUp className="w-3 h-3 text-rose-500 shrink-0" />
                <span className="truncate">Hàng đầu: <strong className="text-rose-600 dark:text-rose-400 font-semibold">{topReason.reason}</strong></span>
                <span className="font-bold text-rose-600 dark:text-rose-400 shrink-0">({topReason.pct}%)</span>
              </div>
            )}
          </div>

          {/* Scale Benchmark Headers */}
          <div className="flex items-center justify-between px-1 mb-1 text-[9.5px] font-semibold text-slate-400 dark:text-slate-500 select-none">
            <span>Nguyên nhân</span>
            <div className="flex items-center space-x-8 pr-1">
              <span>Tỷ trọng (%)</span>
              <span>Số lượng</span>
            </div>
          </div>

          {/* Scrollable Horizontal Bars List */}
          <div className="flex-1 min-h-0 max-h-[295px] xl:max-h-[310px] overflow-y-auto custom-scrollbar flex flex-col gap-1.5 pr-1 py-0.5">
            {data.map((item, idx) => {
              const isSelected =
                selectedReason.toLowerCase() === item.reason.toLowerCase();
              const isHovered = hoveredIdx === idx;
              const color = PALETTE[idx % PALETTE.length];
              
              // Proportional width relative to total 100% with min 4% for tiny items
              const barWidth = Math.max(item.pct, 4);

              return (
                <div
                  key={item.reason}
                  onClick={() =>
                    onSelectReason(
                      selectedReason.toLowerCase() === item.reason.toLowerCase()
                        ? "all"
                        : item.reason
                    )
                  }
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-sky-500/10 dark:bg-sky-950/40 border-sky-400 dark:border-sky-500 shadow-xs ring-1 ring-sky-400/50"
                      : isHovered
                      ? "bg-slate-100/90 dark:bg-[#1f1f26] border-slate-300 dark:border-slate-700"
                      : "bg-[#f8fafc]/90 dark:bg-[#141418]/90 border-[#e8ecf1] dark:border-[#24242a] hover:bg-slate-100 dark:hover:bg-[#1d1d22]"
                  }`}
                  title={`Lọc: ${item.reason} (${item.count} trường hợp, chiếm ${item.pct}% tổng số)`}
                >
                  {/* Top Line: Rank, Reason Name, Count & Percentage */}
                  <div className="flex items-center justify-between text-xs mb-1 gap-2">
                    <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                      {/* Rank badge */}
                      <span
                        className={`text-[9.5px] font-black px-1.5 py-0.2 rounded shrink-0 ${
                          idx === 0
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/80"
                            : idx === 1
                            ? "bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-300/80"
                            : idx === 2
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/80"
                            : "bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        #{idx + 1}
                      </span>

                      {/* Reason label */}
                      <span
                        className={`truncate text-[11.5px] leading-tight ${
                          isSelected
                            ? "text-sky-600 dark:text-sky-300 font-bold"
                            : "text-slate-800 dark:text-slate-200 font-medium"
                        }`}
                      >
                        {item.reason}
                      </span>
                    </div>

                    {/* Numeric Count & Percentage Badge */}
                    <div className="shrink-0 flex items-center space-x-1.5 tabular-nums">
                      <span
                        className="text-[10px] font-black px-1.5 py-0.2 rounded border"
                        style={{
                          backgroundColor: `${color}18`,
                          color: color,
                          borderColor: `${color}35`,
                        }}
                      >
                        {item.pct}%
                      </span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-100 text-[11.5px] min-w-[20px] text-right">
                        {item.count}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Line: Horizontal Bar Track */}
                  <div className="w-full bg-slate-200/80 dark:bg-slate-800/80 h-2.5 rounded-full overflow-hidden relative">
                    <div
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: color,
                      }}
                      className="h-full rounded-full transition-all duration-500 ease-out shadow-2xs relative"
                    >
                      {/* Subtle glossy sheen */}
                      <div className="absolute inset-0 bg-white/20 dark:bg-white/10 rounded-full" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Guide */}
          <div className="pt-1.5 mt-1 border-t border-[#e8ecf1] dark:border-[#222228] flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
            <span>* Nhấn vào thanh để lọc danh sách theo lý do</span>
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              {data.length} nhóm lý do
            </span>
          </div>
        </div>
      ) : (
        /* MODE 2: DONUT CHART (Toggleable Alternative) */
        <div className="flex flex-col md:flex-row items-center gap-3.5 flex-1 min-h-0">
          {/* SVG Donut */}
          <div className="relative shrink-0 flex items-center justify-center w-[210px] h-[210px]">
            <svg
              viewBox="0 0 220 220"
              className="w-full h-full transform -rotate-90 filter drop-shadow-xs"
            >
              <circle
                cx="110"
                cy="110"
                r="70"
                className="fill-none stroke-slate-100 dark:stroke-[#202026]"
                strokeWidth="32"
              />

              {arcs.map((arc) => {
                const isSelected =
                  selectedReason.toLowerCase() === arc.reason.toLowerCase();
                const isHovered = hoveredIdx === arc.index;
                const pathD = describeArc(110, 110, 88, 52, arc.startAngle, arc.endAngle);

                return (
                  <path
                    key={arc.reason}
                    d={pathD}
                    fill={arc.color}
                    className="cursor-pointer transition-all duration-300 hover:opacity-90"
                    style={{
                      filter: isHovered || isSelected ? "brightness(1.15)" : "none",
                      transformOrigin: "110px 110px",
                      transform: isHovered ? "scale(1.03)" : "scale(1)",
                    }}
                    onMouseEnter={() => setHoveredIdx(arc.index)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={() =>
                      onSelectReason(
                        selectedReason.toLowerCase() === arc.reason.toLowerCase()
                          ? "all"
                          : arc.reason
                      )
                    }
                  />
                );
              })}
            </svg>

            {/* Centered Stats Info */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              <span
                className="text-[10px] font-bold uppercase tracking-tight text-slate-500 dark:text-slate-400 truncate max-w-[110px]"
                title={centerInfo.label}
              >
                {centerInfo.label}
              </span>
              <span className="text-2xl font-black tabular-nums text-slate-900 dark:text-white mt-0.5 leading-none">
                {centerInfo.count}
              </span>
              <span
                className="text-xs font-bold tabular-nums mt-0.5"
                style={{ color: centerInfo.color }}
              >
                {centerInfo.pct}%
              </span>
            </div>
          </div>

          {/* Compact Legend List */}
          <div className="flex-1 w-full min-h-0 max-h-[235px] overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-1">
            {data.map((item, idx) => {
              const isSelected =
                selectedReason.toLowerCase() === item.reason.toLowerCase();
              const isHovered = hoveredIdx === idx;
              const color = PALETTE[idx % PALETTE.length];

              return (
                <button
                  key={item.reason}
                  onClick={() =>
                    onSelectReason(
                      selectedReason.toLowerCase() === item.reason.toLowerCase()
                        ? "all"
                        : item.reason
                    )
                  }
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`w-full text-left px-2 py-1 rounded-md border transition-all text-[11px] flex items-center justify-between gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-sky-500/10 dark:bg-sky-950/40 border-sky-400 dark:border-sky-500 shadow-2xs ring-1 ring-sky-400/50"
                      : isHovered
                      ? "bg-slate-100 dark:bg-[#1f1f26] border-slate-300 dark:border-slate-700"
                      : "bg-[#f8fafc]/80 dark:bg-[#141418]/80 border-[#e8ecf1] dark:border-[#24242a] hover:bg-slate-100 dark:hover:bg-[#1d1d22]"
                  }`}
                  title={`Lọc: ${item.reason} (${item.count} trường hợp, ${item.pct}%)`}
                >
                  <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                    <span
                      className="w-2 h-2 rounded-full shrink-0 shadow-2xs transition-transform"
                      style={{
                        backgroundColor: color,
                        transform: isHovered || isSelected ? "scale(1.3)" : "scale(1)",
                      }}
                    />
                    <span
                      className={`truncate text-[11px] leading-tight ${
                        isSelected
                          ? "text-sky-600 dark:text-sky-300 font-bold"
                          : "text-slate-700 dark:text-slate-300 font-medium"
                      }`}
                    >
                      {item.reason}
                    </span>
                  </div>

                  <div className="shrink-0 flex items-center gap-1 tabular-nums">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                      {item.count}
                    </span>
                    <span
                      className="text-[9.5px] font-bold px-1 py-0.2 rounded border"
                      style={{
                        backgroundColor: `${color}18`,
                        color: color,
                        borderColor: `${color}35`,
                      }}
                    >
                      {item.pct}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

