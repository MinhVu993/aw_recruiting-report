"use client";

import React, { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export interface ClusteredColumnItem {
  id?: string | number;
  label: string;
  count: number;
  percentage?: number;
  color?: string;
}

interface SvgClusteredColumnChartProps {
  data: ClusteredColumnItem[];
  maxCount?: number;
  colorPalette?: string[];
  maxHeight?: string;
  unitLabel?: string;
  selectedLabel?: string;
  onItemClick?: (item: ClusteredColumnItem) => void;
}

export const SvgClusteredColumnChart: React.FC<SvgClusteredColumnChartProps> = ({
  data = [],
  maxCount: customMax,
  colorPalette = [
    "#f43f5e", // Rose
    "#f59e0b", // Amber
    "#0284c7", // Sky
    "#6366f1", // Indigo
    "#8b5cf6", // Purple
    "#10b981", // Emerald
  ],
  maxHeight = "280px",
  unitLabel,
  selectedLabel,
  onItemClick,
}) => {
  const { t } = useTranslation();
  const effectiveUnitLabel = unitLabel || t("unitLabelPerson", "người");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const calculatedMax = Math.max(...data.map((d) => d.count), 1);
  const maxVal = customMax || calculatedMax;

  if (data.length === 0) {
    return (
      <div className="py-10 text-center text-xs text-zinc-400">
        {t("noData", "Chưa có dữ liệu")}
      </div>
    );
  }

  // Dimensions of SVG plot
  const svgWidth = 540;
  const svgHeight = 240;
  const padLeft = 56;
  const padRight = 16;
  const padTop = 38;
  const padBottom = 48;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal].map((v) => Math.round(v));
  const colSlotWidth = plotWidth / data.length;
  const barWidth = Math.min(48, Math.max(30, colSlotWidth * 0.56));

  const isAnySelected = Boolean(selectedLabel);

  return (
    <div className="w-full flex flex-col justify-between select-none" style={{ maxHeight }}>
      {/* SVG Clustered Column Chart Canvas */}
      <div className="w-full relative flex items-center justify-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[240px] overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Soft shadow for columns */}
            <filter id="column-soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.12" />
            </filter>

            {/* Glowing filter for selected column */}
            <filter id="column-active-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Linear gradients for each column */}
            {data.map((item, idx) => {
              const baseColor = item.color || colorPalette[idx % colorPalette.length];
              return (
                <linearGradient
                  key={`col-grad-${idx}`}
                  id={`col-grad-${idx}`}
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
          </defs>

          {/* Y-Axis Horizontal Gridlines & Tick Numbers */}
          {yTicks.map((tick, i) => {
            const y = padTop + plotHeight - (tick / maxVal) * plotHeight;
            return (
              <g key={`ytick-${i}`}>
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
                  className="text-[9.5px] font-bold fill-slate-400 dark:fill-slate-500 tabular-nums font-mono"
                >
                  {tick.toLocaleString("vi-VN")}
                </text>
              </g>
            );
          })}

          {/* Columns */}
          {data.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            const isSelected =
              selectedLabel &&
              (item.label.toLowerCase() === selectedLabel.toLowerCase() ||
                (item.id && String(item.id) === selectedLabel));

            const slotCenterX = padLeft + (idx + 0.5) * colSlotWidth;
            const barX = slotCenterX - barWidth / 2;

            // Height scaling: guarantee a visible bar even for smaller values
            const rawHeight = maxVal > 0 ? (item.count / maxVal) * plotHeight : 0;
            const barH = item.count > 0 ? Math.max(rawHeight, 10) : 0;
            const barY = padTop + plotHeight - barH;

            const baseColor = item.color || colorPalette[idx % colorPalette.length];

            return (
              <g
                key={item.id || item.label + idx}
                className="cursor-pointer transition-all duration-300 group"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onItemClick && onItemClick(item)}
              >
                <title>{`${item.label}: ${item.count.toLocaleString("vi-VN")} ${effectiveUnitLabel} (${item.percentage ?? 0}%)`}</title>

                {/* Subtle hover track over slot */}
                <rect
                  x={slotCenterX - colSlotWidth * 0.44}
                  y={padTop}
                  width={colSlotWidth * 0.88}
                  height={plotHeight}
                  rx="6"
                  fill={isHovered ? "currentColor" : "transparent"}
                  className="text-zinc-500/5 dark:text-zinc-300/5 transition-colors"
                />

                {/* Active Selection Outline / Pulse Ring */}
                {isSelected && (
                  <rect
                    x={barX - 3}
                    y={barY - 3}
                    width={barWidth + 6}
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
                  width={barWidth}
                  height={barH}
                  rx="6"
                  fill={`url(#col-grad-${idx})`}
                  filter={isSelected ? "url(#column-active-glow)" : "url(#column-soft-shadow)"}
                  opacity={isAnySelected && !isSelected ? 0.35 : isHovered ? 1 : 0.92}
                  className="transition-all duration-300"
                  style={{
                    transformOrigin: `${slotCenterX}px ${padTop + plotHeight}px`,
                    transform: isHovered ? "scaleY(1.02)" : "scaleY(1)",
                  }}
                />

                {/* Glossy top shine strip */}
                {barH > 14 && (
                  <rect
                    x={barX + 2}
                    y={barY + 1}
                    width={barWidth - 4}
                    height={3.5}
                    rx="2"
                    fill="white"
                    opacity="0.35"
                  />
                )}

                {/* Count & Percentage Above Bar */}
                <g className="transition-all duration-200">
                  <text
                    x={slotCenterX}
                    y={Math.max(16, barY - 14)}
                    textAnchor="middle"
                    className={`text-[10.5px] font-black tabular-nums transition-colors ${
                      isSelected
                        ? "fill-sky-600 dark:fill-sky-400 font-extrabold"
                        : "fill-slate-900 dark:fill-white font-extrabold"
                    }`}
                  >
                    {item.count.toLocaleString("vi-VN")}
                  </text>
                  {item.percentage !== undefined && (
                    <text
                      x={slotCenterX}
                      y={Math.max(27, barY - 3.5)}
                      textAnchor="middle"
                      className="text-[9px] font-bold tabular-nums"
                      fill={baseColor}
                    >
                      {item.percentage}%
                    </text>
                  )}
                </g>

                {/* X-Axis Category Label Below Column */}
                <g transform={`translate(${slotCenterX}, ${padTop + plotHeight + 16})`}>
                  {/* Rank badge circle */}
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
        </svg>
      </div>

      {/* Axis Scale Legend Footer */}
      <div className="pt-1.5 mt-1 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[9px] text-zinc-400 font-mono">
        <span>0</span>
        <span>{Math.round(maxVal * 0.25).toLocaleString("vi-VN")}</span>
        <span>{Math.round(maxVal * 0.5).toLocaleString("vi-VN")}</span>
        <span>{Math.round(maxVal * 0.75).toLocaleString("vi-VN")}</span>
        <span className="font-bold text-zinc-600 dark:text-zinc-300">
          Max: {maxVal.toLocaleString("vi-VN")} {effectiveUnitLabel}
        </span>
      </div>
    </div>
  );
};
