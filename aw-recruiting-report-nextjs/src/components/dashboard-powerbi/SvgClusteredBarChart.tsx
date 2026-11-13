"use client";

import React, { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export interface ClusteredBarItem {
  id?: string | number;
  label: string;
  count: number;
  percentage?: number;
  color?: string;
  subLabel?: string;
}

interface SvgClusteredBarChartProps {
  data: ClusteredBarItem[];
  maxCount?: number;
  barColor?: string;
  colorPalette?: string[];
  maxHeight?: string;
  unitLabel?: string;
  showRank?: boolean;
  selectedLabel?: string;
  onItemClick?: (item: ClusteredBarItem) => void;
}

export const SvgClusteredBarChart: React.FC<SvgClusteredBarChartProps> = ({
  data = [],
  maxCount: customMax,
  barColor = "#0284c7",
  colorPalette = [
    "#f43f5e", // Rose (Rank 1)
    "#f59e0b", // Amber (Rank 2)
    "#0284c7", // Sky (Rank 3)
    "#6366f1", // Indigo
    "#8b5cf6", // Purple
    "#10b981", // Emerald
    "#06b6d4", // Cyan
    "#ec4899", // Pink
  ],
  maxHeight = "340px",
  unitLabel,
  showRank = true,
  selectedLabel,
  onItemClick,
}) => {
  const { t } = useTranslation();
  const effectiveUnitLabel = unitLabel || t("unitLabelPerson");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const calculatedMax = Math.max(...data.map((d) => d.count), 1);
  const maxVal = customMax || calculatedMax;

  if (data.length === 0) {
    return (
      <div className="py-10 text-center text-xs text-zinc-400">
        {t("noData")}
      </div>
    );
  }

  const isAnySelected = Boolean(selectedLabel);

  return (
    <div className="w-full flex flex-col justify-between">
      {/* Clustered Bars Container with Custom Scrollbar */}
      <div
        className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1 relative"
        style={{ maxHeight }}
      >
        {data.map((item, index) => {
          const widthPct = Math.max(5, Math.round((item.count / maxVal) * 100));
          const isHovered = hoveredIdx === index;
          const isTop1 = index === 0;
          const isTop3 = index < 3;
          const isSelected =
            selectedLabel &&
            (item.label.toLowerCase() === selectedLabel.toLowerCase() ||
              (item.id && String(item.id) === selectedLabel));

          const barFill =
            item.color ||
            (isTop1
              ? colorPalette[0]
              : index === 1
              ? colorPalette[1]
              : isTop3
              ? colorPalette[2]
              : colorPalette[index % colorPalette.length] || barColor);

          return (
            <div
              key={item.id || item.label + index}
              onMouseEnter={() => setHoveredIdx(index)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => onItemClick && onItemClick(item)}
              className={`p-1.5 rounded-lg transition-all group cursor-pointer ${
                isSelected
                  ? "ring-2 ring-sky-500 bg-sky-50 dark:bg-sky-950/50 shadow-xs scale-[1.01]"
                  : isAnySelected
                  ? "opacity-40 hover:opacity-85 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30"
                  : isHovered
                  ? "bg-zinc-50 dark:bg-zinc-800/60"
                  : "hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30"
              }`}
            >
              {/* Category Label Row */}
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center space-x-1.5 min-w-0 flex-1 pr-1.5">
                  {showRank && (
                    <span
                      className={`text-[9.5px] font-black px-1.5 py-0.2 rounded shrink-0 ${
                        isTop1
                          ? "bg-rose-500 text-white"
                          : isTop3
                          ? "bg-amber-500 text-white"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      #{index + 1}
                    </span>
                  )}
                  <span
                    className={`font-bold text-[11px] truncate ${
                      isHovered
                        ? "text-zinc-950 dark:text-white"
                        : "text-zinc-800 dark:text-zinc-200"
                    }`}
                    title={item.label}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Values & Percentage */}
                <div className="flex items-center space-x-1.5 tabular-nums text-right shrink-0">
                  <span className="font-black text-zinc-900 dark:text-white text-xs">
                    {item.count.toLocaleString("vi-VN")}
                  </span>
                  <span className="text-[10px] text-zinc-400">{effectiveUnitLabel}</span>
                  {item.percentage !== undefined && (
                    <span
                      className={`text-[9.5px] font-black px-1.5 py-0.5 rounded ml-1 ${
                        isTop1
                          ? "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                          : isTop3
                          ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {item.percentage}%
                    </span>
                  )}
                </div>
              </div>

              {/* Clustered Horizontal Bar with Grid Background */}
              <div className="relative w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-full h-2.5 overflow-hidden">
                {/* 25%, 50%, 75% tick markers */}
                <div className="absolute inset-0 flex justify-between pointer-events-none px-1">
                  <span className="w-px h-full bg-zinc-200 dark:bg-zinc-700/60" style={{ left: "25%" }} />
                  <span className="w-px h-full bg-zinc-200 dark:bg-zinc-700/60" style={{ left: "50%" }} />
                  <span className="w-px h-full bg-zinc-200 dark:bg-zinc-700/60" style={{ left: "75%" }} />
                </div>

                {/* Active Bar Fill */}
                <div
                  className="h-full rounded-full transition-all duration-500 relative z-10"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: barFill,
                    opacity: isHovered ? 1 : 0.9,
                    boxShadow: isHovered ? `0 0 8px ${barFill}66` : undefined,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Axis Scale Legend Footer */}
      <div className="pt-2 mt-1 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[9px] text-zinc-400 font-mono">
        <span>0</span>
        <span>{Math.round(maxVal * 0.25).toLocaleString("vi-VN")}</span>
        <span>{Math.round(maxVal * 0.5).toLocaleString("vi-VN")}</span>
        <span>{Math.round(maxVal * 0.75).toLocaleString("vi-VN")}</span>
        <span className="font-bold text-zinc-600 dark:text-zinc-300">
          Max: {maxVal.toLocaleString("vi-VN")}
        </span>
      </div>
    </div>
  );
};
