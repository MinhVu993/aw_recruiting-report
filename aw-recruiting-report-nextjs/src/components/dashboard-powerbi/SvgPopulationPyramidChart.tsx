"use client";

import React, { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export interface AgePyramidRow {
  group: string; // e.g. "> 50", "41 - 50", "31 - 40", "21 - 30", "18 - 20"
  maleCount: number;
  femaleCount: number;
  malePct?: number; // percentage (0 - 100)
  femalePct?: number; // percentage (0 - 100)
}

export interface SvgPopulationPyramidChartProps {
  title?: string;
  subtitle?: string;
  total?: number;
  maleTotal?: number;
  femaleTotal?: number;
  malePercentage?: number;
  femalePercentage?: number;
  data: AgePyramidRow[];
  className?: string;
  compact?: boolean;
  selectedGroup?: string;
  onGroupClick?: (group: string) => void;
}

export const SvgPopulationPyramidChart: React.FC<SvgPopulationPyramidChartProps> = ({
  title,
  subtitle,
  total,
  maleTotal,
  femaleTotal,
  malePercentage,
  femalePercentage,
  data = [],
  className = "",
  compact = false,
  selectedGroup,
  onGroupClick,
}) => {
  const { t } = useTranslation();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const isAnySelected = Boolean(selectedGroup);

  // Fallbacks if totals not explicitly provided
  const calcMaleTotal = maleTotal ?? data.reduce((sum, d) => sum + d.maleCount, 0);
  const calcFemaleTotal = femaleTotal ?? data.reduce((sum, d) => sum + d.femaleCount, 0);
  const calcTotal = total ?? (calcMaleTotal + calcFemaleTotal || 1);

  const maleOverallPct = malePercentage ?? Number(((calcMaleTotal / calcTotal) * 100).toFixed(1));
  const femaleOverallPct = femalePercentage ?? Number(((calcFemaleTotal / calcTotal) * 100).toFixed(1));

  // Determine percentages for each bar (relative to that gender's total, matching comp)
  const rows = data.map((d) => {
    const mPct = d.malePct !== undefined 
      ? d.malePct 
      : calcMaleTotal > 0 ? Number(((d.maleCount / calcMaleTotal) * 100).toFixed(1)) : 0;
    const fPct = d.femalePct !== undefined 
      ? d.femalePct 
      : calcFemaleTotal > 0 ? Number(((d.femaleCount / calcFemaleTotal) * 100).toFixed(1)) : 0;
    return {
      ...d,
      mPct,
      fPct,
      rowTotal: d.maleCount + d.femaleCount,
    };
  });

  // Scale: find highest percentage to normalize bar widths
  const maxPct = Math.max(...rows.map((r) => Math.max(r.mPct, r.fPct)), 15);

  const centerX = 230;
  const maxBarWidth = 145;
  const barHeight = 13;
  const rowStep = 33;
  const startY = 54;

  return (
    <div className={`w-full flex flex-col items-center justify-center select-none ${className}`}>
      {/* Optional Top Title Header */}
      {title && (
        <div className="w-full flex items-center justify-between mb-1.5">
          <div>
            <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              {title}
            </h4>
            {subtitle && (
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{subtitle}</p>
            )}
          </div>
        </div>
      )}

      {/* Main Population Pyramid SVG */}
      <div className="w-full flex items-center justify-center overflow-visible relative">
        <svg
          viewBox="0 0 460 225"
          className="w-full max-w-[460px] h-auto overflow-visible"
        >
          <defs>
            <linearGradient id="maleBarGrad" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="femaleBarGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>

            {/* Subtle glow filter on hover */}
            <filter id="pyramidGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* ========================================================= */}
          {/* TOP SUMMARY HEADER (Men vs Women)                          */}
          {/* ========================================================= */}
          {/* Left: Men */}
          <g transform="translate(85, 14)" textAnchor="middle">
            <text
              x="0"
              y="0"
              className="fill-sky-500 dark:fill-sky-400 font-black text-[14px] font-sans tracking-wide"
            >
              {t("male")}
            </text>
            <text
              x="0"
              y="18"
              className="fill-zinc-900 dark:fill-white font-black text-[17px] font-sans tracking-tight"
            >
              {maleOverallPct}%
            </text>
            {calcMaleTotal > 0 && (
              <text
                x="0"
                y="31"
                className="fill-zinc-400 dark:fill-zinc-500 font-medium text-[9.5px] font-sans"
              >
                {calcMaleTotal.toLocaleString("vi-VN")} {t("unitLabelPerson")}
              </text>
            )}
          </g>

          {/* Center Divider / Label */}
          <g transform={`translate(${centerX}, 20)`} textAnchor="middle">
            <text
              x="0"
              y="0"
              className="fill-zinc-400 dark:fill-zinc-500 font-bold text-[9px] font-sans tracking-widest uppercase opacity-70"
            >
              {t("agePyramid")}
            </text>
            <circle cx="-5" cy="10" r="2" fill="#38bdf8" />
            <circle cx="5" cy="10" r="2" fill="#f472b6" />
          </g>

          {/* Right: Women */}
          <g transform="translate(375, 14)" textAnchor="middle">
            <text
              x="0"
              y="0"
              className="fill-pink-500 dark:fill-pink-400 font-black text-[14px] font-sans tracking-wide"
            >
              {t("female")}
            </text>
            <text
              x="0"
              y="18"
              className="fill-zinc-900 dark:fill-white font-black text-[17px] font-sans tracking-tight"
            >
              {femaleOverallPct}%
            </text>
            {calcFemaleTotal > 0 && (
              <text
                x="0"
                y="31"
                className="fill-zinc-400 dark:fill-zinc-500 font-medium text-[9.5px] font-sans"
              >
                {calcFemaleTotal.toLocaleString("vi-VN")} {t("unitLabelPerson")}
              </text>
            )}
          </g>

          {/* Spine vertical guideline */}
          <line
            x1={centerX}
            y1={startY - 6}
            x2={centerX}
            y2={startY + rows.length * rowStep - 8}
            className="stroke-zinc-200 dark:stroke-zinc-800"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* ========================================================= */}
          {/* PYRAMID BARS (Back-to-Back Tornado Rows)                   */}
          {/* ========================================================= */}
          {rows.map((row, idx) => {
            const y = startY + idx * rowStep;
            const maleBarWidth = Math.max((row.mPct / maxPct) * maxBarWidth, row.maleCount > 0 ? 3 : 0);
            const femaleBarWidth = Math.max((row.fPct / maxPct) * maxBarWidth, row.femaleCount > 0 ? 3 : 0);
            const isHovered = hoveredRow === idx;
            const isSelected = selectedGroup && (row.group === selectedGroup || row.group.includes(selectedGroup));

            return (
              <g
                key={row.group}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredRow(idx)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => onGroupClick && onGroupClick(row.group)}
                opacity={isSelected ? 1 : isAnySelected ? 0.35 : hoveredRow !== null && !isHovered ? 0.45 : 1}
              >
                {/* Row Hover / Selected Background Highlight */}
                {(isHovered || isSelected) && (
                  <rect
                    x="20"
                    y={y - 4}
                    width="420"
                    height={rowStep - 2}
                    className={isSelected ? "fill-sky-500/15 stroke-sky-500/40" : "fill-zinc-100/70 dark:fill-zinc-800/40"}
                    rx="6"
                  />
                )}

                {/* Male Bar (Leftwards from Center) */}
                <rect
                  x={centerX - maleBarWidth}
                  y={y}
                  width={maleBarWidth}
                  height={barHeight}
                  fill={isHovered ? "#0284c7" : "url(#maleBarGrad)"}
                  rx="3"
                  className="transition-all duration-200"
                />

                {/* Male Percentage Label (Left of Bar) */}
                <text
                  x={centerX - maleBarWidth - 7}
                  y={y + 10}
                  textAnchor="end"
                  className={`font-mono text-[11px] font-bold ${
                    isHovered
                      ? "fill-sky-600 dark:fill-sky-400 font-black text-[12px]"
                      : "fill-zinc-700 dark:fill-zinc-300"
                  }`}
                >
                  {row.mPct}%
                </text>

                {/* Female Bar (Rightwards from Center) */}
                <rect
                  x={centerX}
                  y={y}
                  width={femaleBarWidth}
                  height={barHeight}
                  fill={isHovered ? "#db2777" : "url(#femaleBarGrad)"}
                  rx="3"
                  className="transition-all duration-200"
                />

                {/* Female Percentage Label (Right of Bar) */}
                <text
                  x={centerX + femaleBarWidth + 7}
                  y={y + 10}
                  textAnchor="start"
                  className={`font-mono text-[11px] font-bold ${
                    isHovered
                      ? "fill-pink-600 dark:fill-pink-400 font-black text-[12px]"
                      : "fill-zinc-700 dark:fill-zinc-300"
                  }`}
                >
                  {row.fPct}%
                </text>

                {/* Age Bracket Label (Centered underneath junction) */}
                <text
                  x={centerX}
                  y={y + barHeight + 11}
                  textAnchor="middle"
                  className={`font-sans text-[10px] tracking-tight ${
                    isHovered
                      ? "fill-zinc-900 dark:fill-white font-black"
                      : "fill-zinc-500 dark:fill-zinc-400 font-semibold"
                  }`}
                >
                  {row.group.includes("tuổi") ? row.group : `${row.group} tuổi`}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Floating Tooltip */}
        {hoveredRow !== null && rows[hoveredRow] && (
          <div
            className="absolute z-20 bg-zinc-900/95 text-white dark:bg-white/95 dark:text-zinc-900 px-3 py-1.5 rounded-lg shadow-xl text-xs pointer-events-none transition-all flex items-center space-x-3 border border-zinc-700 dark:border-zinc-300 backdrop-blur-xs"
            style={{
              top: `${startY + hoveredRow * rowStep - 15}px`,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <span className="font-bold text-amber-300 dark:text-amber-600">
              {rows[hoveredRow].group} {t("age").toLowerCase()}
            </span>
            <span className="opacity-40">|</span>
            <span className="text-sky-400 dark:text-sky-600 font-semibold">
              {t("male")}: {rows[hoveredRow].maleCount.toLocaleString("vi-VN")} ({rows[hoveredRow].mPct}%)
            </span>
            <span className="opacity-40">|</span>
            <span className="text-pink-400 dark:text-pink-600 font-semibold">
              {t("female")}: {rows[hoveredRow].femaleCount.toLocaleString("vi-VN")} ({rows[hoveredRow].fPct}%)
            </span>
          </div>
        )}
      </div>

      {/* Footer Insight bar */}
      {!compact && (
        <div className="w-full mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
            <span>{t("male")}: {maleOverallPct}%</span>
          </span>
          <span className="font-semibold text-zinc-600 dark:text-zinc-300">
            {t("agePyramid")}: {rows[0]?.group || "> 50"} → {rows[rows.length - 1]?.group || "< 20"}
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />
            <span>{t("female")}: {femaleOverallPct}%</span>
          </span>
        </div>
      )}
    </div>
  );
};
