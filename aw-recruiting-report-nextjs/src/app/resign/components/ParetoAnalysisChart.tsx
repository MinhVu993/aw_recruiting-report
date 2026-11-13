"use client";

import React, { useMemo, useState } from "react";
import { ReasonBreakdownItem, ResignRecord } from "./types";
import { TrendingUp, AlertTriangle, Lightbulb, CheckCircle2 } from "lucide-react";
import { parseSeniorityYears } from "@/lib/seniority-utils";

interface ParetoAnalysisChartProps {
  data: ReasonBreakdownItem[];
  totalResign: number;
  records?: ResignRecord[];
  selectedReason: string;
  onSelectReason: (reason: string) => void;
}

export const ParetoAnalysisChart: React.FC<ParetoAnalysisChartProps> = ({
  data,
  totalResign,
  records = [],
  selectedReason,
  onSelectReason,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Compute Pareto series: sorted descending, cumulative sum & percent
  const paretoSeries = useMemo(() => {
    if (totalResign <= 0 || data.length === 0) return [];

    let runningSum = 0;
    const sorted = [...data].sort((a, b) => b.count - a.count);

    return sorted.map((item, idx) => {
      const prevSum = runningSum;
      runningSum += item.count;
      const cumPct = Math.round((runningSum / totalResign) * 100);
      const isVital = prevSum / totalResign < 0.8; // Vital few (<= 80%)

      return {
        ...item,
        cumSum: runningSum,
        cumPct,
        isVital,
        idx,
      };
    });
  }, [data, totalResign]);

  // Insights computation
  const insights = useMemo(() => {
    if (totalResign <= 0 || !records || records.length === 0) {
      return {
        topReason: "Chưa có",
        topPct: 0,
        vitalCount: 0,
        highestSeniorityTier: "N/A",
        seniorityPct: 0,
      };
    }

    const top = paretoSeries[0];
    const vitalItems = paretoSeries.filter((p) => p.isVital);

    // Compute dominant seniority tier
    let lessThan1 = 0;
    let oneYear = 0;
    let twoYears = 0;
    let threeUp = 0;

    records.forEach((r) => {
      const s = parseSeniorityYears(r.er_seniority);
      if (s < 1) lessThan1++;
      else if (s >= 1 && s < 2) oneYear++;
      else if (s >= 2 && s < 3) twoYears++;
      else threeUp++;
    });

    const seniorityTiers = [
      { name: "Dưới 1 năm (<1 năm)", count: lessThan1 },
      { name: "Từ 1 - 2 năm", count: oneYear },
      { name: "Từ 2 - 3 năm", count: twoYears },
      { name: "Trên 3 năm (>3 năm)", count: threeUp },
    ].sort((a, b) => b.count - a.count);

    const highestTier = seniorityTiers[0];
    const sPct = totalResign > 0 ? Math.round((highestTier.count / totalResign) * 100) : 0;

    return {
      topReason: top?.reason || "Chưa có",
      topPct: top?.pct || 0,
      vitalCount: vitalItems.length,
      highestSeniorityTier: highestTier.name,
      seniorityPct: sPct,
    };
  }, [paretoSeries, totalResign, records]);

  if (totalResign === 0 || paretoSeries.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
        <TrendingUp className="w-10 h-10 mb-2 stroke-1 opacity-40 text-slate-400" />
        <p className="text-xs font-semibold">Chưa có dữ liệu phân tích Pareto</p>
      </div>
    );
  }

  // Max value for bar scaling
  const maxCount = Math.max(...paretoSeries.map((p) => p.count), 1);
  const displayItems = paretoSeries.slice(0, 10); // Display top 10 in chart for clarity

  // SVG Chart Dimensions
  const svgWidth = 900;
  const svgHeight = 275;
  const paddingLeft = 105;
  const paddingRight = 45;
  const paddingTop = 24;
  const paddingBottom = 105;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const barSlotWidth = chartWidth / displayItems.length;
  const barWidth = Math.max(barSlotWidth * 0.55, 16);

  // Line points for cumulative curve
  const points = displayItems.map((item, idx) => {
    const x = paddingLeft + idx * barSlotWidth + barSlotWidth / 2;
    const y = paddingTop + chartHeight - (item.cumPct / 100) * chartHeight;
    return { x, y, item, idx };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  // 80% Cutoff Y position
  const y80 = paddingTop + chartHeight - 0.8 * chartHeight;

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#e2e6eb] dark:border-[#26262C]">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-rose-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Phân Tích Nguyên Lý Pareto 80/20 & Điểm Nghẽn Thôi Việc
          </h4>
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-medium text-slate-500">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
            <span>Nhóm trọng yếu (&le;80%)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-400 inline-block" />
            <span>Nguyên nhân thứ yếu</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-0.5 bg-amber-500 inline-block" />
            <span>% Tích lũy</span>
          </span>
        </div>
      </div>

      {/* SVG Pareto Combo Chart */}
      <div className="w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[700px]">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
            {/* Grid Lines */}
            <line
              x1={paddingLeft}
              y1={paddingTop + chartHeight}
              x2={svgWidth - paddingRight}
              y2={paddingTop + chartHeight}
              className="stroke-slate-200 dark:stroke-[#26262C]"
              strokeWidth="1"
            />
            <line
              x1={paddingLeft}
              y1={paddingTop}
              x2={svgWidth - paddingRight}
              y2={paddingTop}
              className="stroke-slate-200/60 dark:stroke-[#202026]"
              strokeWidth="1"
              strokeDasharray="3 3"
            />

            {/* 80% Cutoff Dashed Line */}
            <line
              x1={paddingLeft}
              y1={y80}
              x2={svgWidth - paddingRight}
              y2={y80}
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text
              x={svgWidth - paddingRight + 4}
              y={y80 + 3}
              fill="#ef4444"
              fontSize="9"
              fontWeight="bold"
            >
              80%
            </text>

            {/* Left Y-Axis Label (Count) */}
            <text
              x={paddingLeft - 8}
              y={paddingTop + 5}
              fill="#94a3b8"
              fontSize="9"
              textAnchor="end"
            >
              {maxCount}
            </text>
            <text
              x={paddingLeft - 8}
              y={paddingTop + chartHeight}
              fill="#94a3b8"
              fontSize="9"
              textAnchor="end"
            >
              0
            </text>

            {/* Right Y-Axis Label (%) */}
            <text
              x={svgWidth - paddingRight + 6}
              y={paddingTop + 5}
              fill="#f59e0b"
              fontSize="9"
            >
              100%
            </text>

            {/* Bars for Each Reason */}
            {displayItems.map((item, idx) => {
              const x = paddingLeft + idx * barSlotWidth + (barSlotWidth - barWidth) / 2;
              const barHeight = (item.count / maxCount) * chartHeight;
              const y = paddingTop + chartHeight - barHeight;
              const isSelected = selectedReason.toLowerCase() === item.reason.toLowerCase();
              const isHovered = hoveredIdx === idx;

              return (
                <g
                  key={item.reason}
                  className="cursor-pointer"
                  onClick={() =>
                    onSelectReason(
                      selectedReason.toLowerCase() === item.reason.toLowerCase()
                        ? "all"
                        : item.reason
                    )
                  }
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <title>{`${item.reason}: ${item.count.toLocaleString()} người (${item.pct}%) - Tích lũy ${item.cumPct}%`}</title>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="4"
                    fill={item.isVital ? (isSelected ? "#e11d48" : "#f43f5e") : (isSelected ? "#475569" : "#94a3b8")}
                    className="transition-all duration-200"
                    style={{
                      filter: isHovered || isSelected ? "drop-shadow(0 2px 4px rgba(0,0,0,0.15)) brightness(1.1)" : "none",
                    }}
                  />

                  {/* Value on top of bar */}
                  <text
                    x={x + barWidth / 2}
                    y={y - 4}
                    textAnchor="middle"
                    fill={item.isVital ? "#f43f5e" : "#64748b"}
                    fontSize="9"
                    fontWeight="bold"
                  >
                    {item.count}
                  </text>

                  {/* Reason label below X-axis rotated -35 degrees for full readability without truncation */}
                  <g transform={`translate(${x + barWidth / 2}, ${paddingTop + chartHeight + 12})`}>
                    <text
                      x={0}
                      y={0}
                      transform="rotate(-35)"
                      textAnchor="end"
                      fontSize="10"
                      className={`font-semibold select-none transition-colors ${
                        isSelected
                          ? "fill-rose-600 dark:fill-rose-400 font-bold"
                          : isHovered
                          ? "fill-slate-900 dark:fill-white font-bold"
                          : item.isVital
                          ? "fill-slate-800 dark:fill-slate-200"
                          : "fill-slate-600 dark:fill-slate-400"
                      }`}
                    >
                      {item.reason}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Cumulative Percentage Curve */}
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylinePoints}
            />

            {/* Vertices on Cumulative Curve */}
            {points.map((p) => {
              const isHovered = hoveredIdx === p.idx;
              return (
                <g key={p.item.reason}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? "5" : "3.5"}
                    fill="#ffffff"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    className="transition-all duration-200"
                  />
                  {isHovered && (
                    <text
                      x={p.x}
                      y={p.y - 8}
                      textAnchor="middle"
                      fill="#d97706"
                      fontSize="9.5"
                      fontWeight="bold"
                    >
                      {p.item.cumPct}%
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Interactive Detail Box on Hover */}
      <div className="flex items-center justify-between text-[11px] px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#131316] border border-[#e2e6eb] dark:border-[#202026] min-h-[34px]">
        {hoveredIdx !== null && displayItems[hoveredIdx] ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 w-full text-slate-700 dark:text-slate-300">
            <span className="font-bold text-rose-600 dark:text-rose-400">
              #{hoveredIdx + 1}. {displayItems[hoveredIdx].reason}
            </span>
            <span>
              Số lượng: <strong>{displayItems[hoveredIdx].count.toLocaleString()} người</strong> ({displayItems[hoveredIdx].pct}%)
            </span>
            <span>
              Tích lũy Pareto: <strong className="text-amber-600 dark:text-amber-400">{displayItems[hoveredIdx].cumPct}%</strong>
            </span>
            {displayItems[hoveredIdx].isVital ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                Nhóm 80% Trọng Yếu
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                Nguyên nhân thứ yếu
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-400 italic text-[10.5px]">
            * Tên đầy đủ các lý do hiển thị nghiêng 35° không bị rút gọn. Rê chuột vào từng cột để xem phân tích tích lũy.
          </span>
        )}
      </div>

      {/* 2 Smart Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
        {/* Insight Card 1 */}
        <div className="p-2.5 rounded-lg bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-start space-x-2.5">
          <div className="p-1.5 rounded-md bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-rose-800 dark:text-rose-300">
              Nguyên Nhân Chủ Đạo Cần Can Thiệp
            </div>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-[11px] leading-relaxed">
              Lý do <strong className="text-rose-600 dark:text-rose-400">{insights.topReason}</strong> chiếm tới{" "}
              <strong>{insights.topPct}%</strong> tổng số lượt nghỉ việc. Tập trung giải quyết{" "}
              <strong>{insights.vitalCount} nguyên nhân cốt lõi</strong> đầu tiên sẽ giúp giảm đến <strong>80%</strong> tỷ lệ thôi việc tại nhà máy.
            </p>
          </div>
        </div>

        {/* Insight Card 2 */}
        <div className="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start space-x-2.5">
          <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 shrink-0">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-amber-800 dark:text-amber-300">
              Nhóm Thâm Niên Biến Động Lớn Nhất
            </div>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-[11px] leading-relaxed">
              Nhóm nhân sự <strong className="text-amber-700 dark:text-amber-400">{insights.highestSeniorityTier}</strong> chiếm{" "}
              <strong>{insights.seniorityPct}%</strong> tổng số lượt thôi việc. Cần tăng cường khảo sát tâm lý, hỗ trợ thích ứng và điều chỉnh chính sách giữ chân nhóm này.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
