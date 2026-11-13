"use client";

import React, { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export interface ColumnLineComboItem {
  id?: string | number;
  label: string;
  count: number;
  percentage: number;
  color?: string;
}

interface SvgClusteredColumnLineComboChartProps {
  data: ColumnLineComboItem[];
  maxCount?: number;
  maxPercentage?: number;
  colorPalette?: string[];
  maxHeight?: string;
  unitLabel?: string;
  selectedLabel?: string;
  onItemClick?: (item: ColumnLineComboItem) => void;
}

export const SvgClusteredColumnLineComboChart: React.FC<SvgClusteredColumnLineComboChartProps> = ({
  data = [],
  maxCount: customMaxCount,
  maxPercentage: customMaxPct,
  colorPalette = [
    "#f43f5e", // Rose (< 1 năm)
    "#f59e0b", // Amber (1 - 3 năm)
    "#0284c7", // Sky (3 - 5 năm)
    "#6366f1", // Indigo (5 - 10 năm)
    "#8b5cf6", // Purple (> 10 năm)
  ],
  maxHeight = "310px",
  unitLabel,
  selectedLabel,
  onItemClick,
}) => {
  const { t } = useTranslation();
  const effectiveUnitLabel = unitLabel || t("unitLabelPerson", "người");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="py-10 text-center text-xs text-zinc-400">
        {t("noData", "Chưa có dữ liệu")}
      </div>
    );
  }

  // Calculate Primary Axis (Count) Max with 15% headroom for top data labels
  const calculatedMaxCount = Math.max(...data.map((d) => d.count), 1);
  const maxVal = customMaxCount || Math.ceil(calculatedMaxCount * 1.15);

  // Secondary Axis (Percentage) Max: 100%
  const maxPctVal = customMaxPct || 100;

  // SVG Geometry Dimensions
  const svgWidth = 560;
  const svgHeight = 250;
  const padLeft = 52;
  const padRight = 44;
  const padTop = 38;
  const padBottom = 48;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  // Grid Ticks
  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal].map((v) => Math.round(v));
  const rightYTicks = [0, 25, 50, 75, 100];

  const colSlotWidth = plotWidth / data.length;
  const isAnySelected = Boolean(selectedLabel);

  // Build Line Path Points (slotCenterX, lineY)
  const linePoints = data.map((item, idx) => {
    const slotCenterX = padLeft + (idx + 0.5) * colSlotWidth;
    const clampedPct = Math.min(Math.max(item.percentage, 0), maxPctVal);
    const lineY = padTop + plotHeight - (clampedPct / maxPctVal) * plotHeight;
    return { x: slotCenterX, y: lineY, item, idx };
  });

  // Smooth Bezier Curve Path Generator
  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) * 0.45;
      const cpX2 = p1.x - (p1.x - p0.x) * 0.45;
      d += ` C ${cpX1} ${p0.y}, ${cpX2} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const smoothLinePath = generateSmoothPath(linePoints);

  return (
    <div className="w-full flex flex-col justify-between select-none" style={{ maxHeight }}>
      {/* Chart Top Header Bar: Series Legend */}
      <div className="flex items-center justify-between pb-1.5 px-1 border-b border-zinc-100 dark:border-zinc-800/60 mb-1">
        <div className="flex items-center space-x-4 text-[10px] font-bold">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-sky-600 to-sky-400 inline-block shadow-2xs" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              {t("count", "Số người")} (cột)
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-1 bg-amber-500 rounded-full inline-block" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 -ml-2.5 ring-2 ring-white dark:ring-zinc-900 inline-block" />
            <span className="text-amber-600 dark:text-amber-400 font-black">
              {t("ratePercent", "% Tỷ lệ")} (line)
            </span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full relative flex items-center justify-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[250px] overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Linear gradients for each column */}
            {data.map((item, idx) => {
              const baseColor = item.color || colorPalette[idx % colorPalette.length];
              return (
                <linearGradient
                  key={`col-combo-grad-${idx}`}
                  id={`col-combo-grad-${idx}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={baseColor} stopOpacity="1" />
                  <stop offset="100%" stopColor={baseColor} stopOpacity="0.75" />
                </linearGradient>
              );
            })}

            {/* Line Glow Effect */}
            <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.35" />
            </filter>

            {/* Soft Shadow for Bar and Label */}
            <filter id="combo-soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodOpacity="0.1" />
            </filter>
          </defs>

          {/* Left Y-Axis Gridlines & Count Numbers */}
          {yTicks.map((tick, i) => {
            const y = padTop + plotHeight - (tick / maxVal) * plotHeight;
            return (
              <g key={`ytick-left-${i}`}>
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
                  x={padLeft - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[9px] font-bold fill-slate-400 dark:fill-slate-500 tabular-nums font-mono"
                >
                  {tick.toLocaleString("vi-VN")}
                </text>
              </g>
            );
          })}

          {/* Right Y-Axis % Tick Numbers */}
          {rightYTicks.map((pct, i) => {
            const y = padTop + plotHeight - (pct / maxPctVal) * plotHeight;
            return (
              <text
                key={`ytick-right-${i}`}
                x={svgWidth - padRight + 6}
                y={y + 3.5}
                textAnchor="start"
                className="text-[9px] font-black fill-amber-600/80 dark:fill-amber-400/80 tabular-nums font-mono"
              >
                {pct}%
              </text>
            );
          })}

          {/* Single Column for each seniority group */}
          {data.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            const isSelected =
              selectedLabel &&
              (item.label.toLowerCase() === selectedLabel.toLowerCase() ||
                (item.id && String(item.id) === selectedLabel));

            const slotCenterX = padLeft + (idx + 0.5) * colSlotWidth;
            const barW = Math.min(42, Math.max(28, colSlotWidth * 0.48));
            const barX = slotCenterX - barW / 2;

            const rawH = maxVal > 0 ? (item.count / maxVal) * plotHeight : 0;
            const barH = item.count > 0 ? Math.max(rawH, 10) : 0;
            const barY = padTop + plotHeight - barH;

            return (
              <g
                key={item.id || item.label + idx}
                className="cursor-pointer transition-all duration-300 group"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onItemClick && onItemClick(item)}
              >
                <title>{`${item.label}: ${item.count.toLocaleString("vi-VN")} ${effectiveUnitLabel} | Tỷ lệ: ${item.percentage}%`}</title>

                {/* Subtle Hover Slot Highlight Track */}
                <rect
                  x={slotCenterX - colSlotWidth * 0.46}
                  y={padTop}
                  width={colSlotWidth * 0.92}
                  height={plotHeight}
                  rx="6"
                  fill={isHovered ? "currentColor" : "transparent"}
                  className="text-zinc-500/5 dark:text-zinc-300/5 transition-colors"
                />

                {/* Selected Halo Outline */}
                {isSelected && (
                  <rect
                    x={barX - 3}
                    y={barY - 3}
                    width={barW + 6}
                    height={barH + 4}
                    rx="8"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2.5"
                    className="animate-pulse"
                  />
                )}

                {/* Main Column Bar with Gradient Fill & Rounded Top */}
                <rect
                  x={barX}
                  y={barY}
                  width={barW}
                  height={barH}
                  rx="6"
                  fill={`url(#col-combo-grad-${idx})`}
                  filter="url(#combo-soft-shadow)"
                  opacity={isAnySelected && !isSelected ? 0.35 : isHovered ? 1 : 0.92}
                  className="transition-all duration-200"
                  style={{
                    transformOrigin: `${slotCenterX}px ${padTop + plotHeight}px`,
                    transform: isHovered ? "scaleY(1.02)" : "scaleY(1)",
                  }}
                />

                {/* Count above Column */}
                <text
                  x={slotCenterX}
                  y={Math.max(16, barY - 5)}
                  textAnchor="middle"
                  className={`text-[10px] font-black tabular-nums transition-colors ${
                    isSelected
                      ? "fill-sky-600 dark:fill-sky-400 font-extrabold"
                      : "fill-slate-900 dark:fill-white font-extrabold"
                  }`}
                >
                  {item.count.toLocaleString("vi-VN")}
                </text>

                {/* X-Axis Category Label Below Column */}
                <g transform={`translate(${slotCenterX}, ${padTop + plotHeight + 16})`}>
                  {/* Rank badge */}
                  <rect
                    x="-10"
                    y="-1"
                    width="20"
                    height="12"
                    rx="3"
                    className={`${
                      idx === 0
                        ? "fill-rose-500"
                        : idx === 1
                        ? "fill-amber-500"
                        : "fill-slate-200 dark:fill-[#2a2a32]"
                    }`}
                  />
                  <text
                    x="0"
                    y="8"
                    textAnchor="middle"
                    fontSize="8.5"
                    className={`font-black ${
                      idx < 2 ? "fill-white" : "fill-slate-600 dark:fill-slate-300"
                    }`}
                  >
                    #{idx + 1}
                  </text>

                  {/* Range Label */}
                  <text
                    x="0"
                    y="22"
                    textAnchor="middle"
                    className={`text-[11px] select-none transition-colors ${
                      isSelected
                        ? "fill-sky-600 dark:fill-sky-400 font-extrabold"
                        : isHovered
                        ? "fill-slate-950 dark:fill-white font-bold"
                        : "fill-slate-700 dark:fill-slate-300 font-bold"
                    }`}
                  >
                    {item.label}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Secondary Metric Line (Percentage Curve) */}
          <path
            d={smoothLinePath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#line-glow)"
            className="transition-all duration-300"
          />

          {/* Secondary Metric Dots & Floating Rate % Badges */}
          {linePoints.map(({ x, y, item, idx }) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g
                key={`line-dot-${idx}`}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onItemClick && onItemClick(item)}
              >
                {/* Glow ring on hover */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? "9" : "6"}
                  fill="#f59e0b"
                  opacity={isHovered ? 0.35 : 0.2}
                  className="transition-all duration-200"
                />

                {/* Crisp Point Dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? "5" : "4"}
                  fill="white"
                  stroke="#d97706"
                  strokeWidth="2.5"
                  className="transition-all duration-200"
                />

                {/* Floating Percentage Badge Above Point */}
                <g transform={`translate(${x}, ${Math.max(16, y - 16)})`}>
                  <rect
                    x="-18"
                    y="-9"
                    width="36"
                    height="14"
                    rx="4"
                    className="fill-amber-500/95 dark:fill-amber-600 shadow-sm"
                  />
                  <text
                    x="0"
                    y="1.5"
                    textAnchor="middle"
                    className="text-[9px] font-black fill-white tabular-nums select-none"
                  >
                    {item.percentage}%
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Axis Scale Legend Footer */}
      <div className="pt-1.5 mt-1 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[9px] text-zinc-400 font-mono">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-500 dark:text-slate-400">Trục trái (Cột):</span>
          <span>0</span>
          <span>{Math.round(maxVal * 0.5).toLocaleString("vi-VN")}</span>
          <span className="font-bold text-zinc-700 dark:text-zinc-200">
            Max: {maxVal.toLocaleString("vi-VN")} {effectiveUnitLabel}
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-bold">
          <span>Trục phải (Line): 0% → 100%</span>
        </div>
      </div>
    </div>
  );
};
