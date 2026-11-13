"use client";

import React, { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export interface PieSliceItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

interface SvgPieChartProps {
  data: PieSliceItem[];
  size?: number;
  donut?: boolean;
  innerRadiusRatio?: number;
  className?: string;
  showLegend?: boolean;
  direction?: "auto" | "row" | "column";
  centerText?: {
    title?: string;
    value?: string;
  };
  selectedName?: string;
  onSliceClick?: (slice: PieSliceItem) => void;
}

export const SvgPieChart: React.FC<SvgPieChartProps> = ({
  data = [],
  size = 180,
  donut = false,
  innerRadiusRatio = 0.55,
  className = "",
  showLegend = true,
  direction = "auto",
  centerText,
  selectedName,
  onSliceClick,
}) => {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const validData = data.filter((d) => d.count > 0 || d.percentage > 0);
  const totalCount = validData.reduce((acc, d) => acc + d.count, 0);

  if (validData.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 text-xs text-zinc-400">
        {t("noData")}
      </div>
    );
  }

  const isAnySelected = Boolean(selectedName);

  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) * 0.88;
  const innerR = donut ? r * innerRadiusRatio : 0;

  // Convert polar coordinates to Cartesian
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  let accumulatedAngle = 0;
  const totalPct = validData.reduce((acc, d) => acc + d.percentage, 0) || 100;
  const minAngle = 2.5;
  const rawAngles = validData.map((d) => Math.max((d.percentage / totalPct) * 360, d.count > 0 ? minAngle : 0));
  const sumAngles = rawAngles.reduce((a, b) => a + b, 0) || 360;
  const sliceAngles = rawAngles.map((a) => (a / sumAngles) * 360);

  const slices = validData.map((item, index) => {
    const sliceAngle = Math.min(359.99, sliceAngles[index]);
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + sliceAngle;
    accumulatedAngle = endAngle;

    const startOuter = polarToCartesian(cx, cy, r, startAngle);
    const endOuter = polarToCartesian(cx, cy, r, endAngle);
    const largeArcFlag = sliceAngle > 180 ? 1 : 0;

    let pathData = "";
    if (donut && innerR > 0) {
      const startInner = polarToCartesian(cx, cy, innerR, endAngle);
      const endInner = polarToCartesian(cx, cy, innerR, startAngle);
      pathData = [
        `M ${startOuter.x} ${startOuter.y}`,
        `A ${r} ${r} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
        `L ${startInner.x} ${startInner.y}`,
        `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${endInner.x} ${endInner.y}`,
        "Z",
      ].join(" ");
    } else {
      // True Solid Pie Chart slice
      pathData = [
        `M ${cx} ${cy}`,
        `L ${startOuter.x} ${startOuter.y}`,
        `A ${r} ${r} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
        "Z",
      ].join(" ");
    }

    return {
      ...item,
      pathData,
      startAngle,
      endAngle,
      index,
    };
  });

  const containerFlexClass =
    direction === "row"
      ? "flex flex-row items-center justify-around gap-3"
      : direction === "column"
      ? "flex flex-col items-center gap-2.5"
      : "flex flex-col sm:flex-row items-center justify-around gap-3";

  const legendClass =
    direction === "column"
      ? "w-full space-y-1 mt-1"
      : "flex-1 w-full space-y-1.5 pl-2 max-w-[320px]";

  return (
    <div className={`${containerFlexClass} w-full ${className}`}>
      {/* SVG Circle */}
      <div className="relative shrink-0 flex items-center justify-center my-1" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible select-none">
          <g>
            {slices.map((slice) => {
              const isHovered = hoveredIndex === slice.index;
              const isSelected = selectedName && slice.name.toLowerCase() === selectedName.toLowerCase();

              return (
                <path
                  key={slice.name + slice.index}
                  d={slice.pathData}
                  fill={slice.color}
                  stroke="currentColor"
                  className="text-white dark:text-[#18181C] transition-all duration-200 cursor-pointer"
                  strokeWidth={isSelected ? "2.5" : "1.5"}
                  strokeLinejoin="round"
                  onMouseEnter={() => setHoveredIndex(slice.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => onSliceClick && onSliceClick(slice)}
                  style={{
                    transformOrigin: `${cx}px ${cy}px`,
                    transform: isSelected
                      ? "scale(1.08)"
                      : isHovered
                      ? "scale(1.05)"
                      : "scale(1)",
                    opacity: isSelected ? 1 : isAnySelected ? 0.35 : 1,
                    filter:
                      isSelected || isHovered
                        ? "drop-shadow(0px 3px 6px rgba(0,0,0,0.35))"
                        : undefined,
                  }}
                />
              );
            })}
          </g>
        </svg>

        {/* Optional Donut Center text */}
        {donut && centerText && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {centerText.title && (
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                {centerText.title}
              </span>
            )}
            {centerText.value && (
              <span className="text-sm font-black text-zinc-900 dark:text-white tabular-nums">
                {centerText.value}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legend list */}
      {showLegend && (
        <div className={legendClass}>
          {validData.map((item, idx) => {
            const isHovered = hoveredIndex === idx;
            const isSelected = selectedName && item.name.toLowerCase() === selectedName.toLowerCase();

            return (
              <div
                key={item.name + idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSliceClick && onSliceClick(item)}
                className={`flex items-center justify-between text-xs px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-sky-500 bg-sky-50 dark:bg-sky-950/40 shadow-xs scale-[1.01]"
                    : isAnySelected
                    ? "opacity-40 hover:opacity-85 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    : isHovered
                    ? "bg-zinc-100 dark:bg-zinc-800"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <div className="flex items-center space-x-1.5 truncate pr-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <span
                    className={`text-[11px] font-semibold truncate ${
                      isSelected
                        ? "text-sky-700 dark:text-sky-300 font-bold"
                        : isHovered
                        ? "text-zinc-900 dark:text-white font-bold"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                    title={item.name}
                  >
                    {item.name}
                  </span>
                </div>

                <div className="text-right shrink-0 tabular-nums space-x-1">
                  <span className="font-black text-zinc-900 dark:text-white text-[11px]">
                    {item.percentage}%
                  </span>
                  {item.count > 0 && (
                    <span className="text-[9px] text-zinc-400">
                      ({item.count.toLocaleString("vi-VN")})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
