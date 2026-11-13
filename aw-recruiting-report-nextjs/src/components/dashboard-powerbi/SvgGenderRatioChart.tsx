"use client";

import React, { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export interface SvgGenderRatioChartProps {
  maleCount: number;
  femaleCount: number;
  malePercentage?: number;
  femalePercentage?: number;
  title?: string;
  subtitle?: string;
  maleLabel?: string;
  femaleLabel?: string;
  className?: string;
  compact?: boolean;
  selectedGender?: string;
  onGenderClick?: (gender: "Nam" | "Nữ") => void;
}

export const SvgGenderRatioChart: React.FC<SvgGenderRatioChartProps> = ({
  maleCount = 0,
  femaleCount = 0,
  malePercentage,
  femalePercentage,
  title,
  subtitle,
  maleLabel,
  femaleLabel,
  className = "",
  compact = false,
  selectedGender,
  onGenderClick,
}) => {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState<"male" | "female" | null>(null);

  const finalMaleLabel = maleLabel || t("male");
  const finalFemaleLabel = femaleLabel || t("female");

  const total = maleCount + femaleCount || 1;
  const malePct = malePercentage !== undefined ? malePercentage : Number(((maleCount / total) * 100).toFixed(1));
  const femalePct = femalePercentage !== undefined ? femalePercentage : Number(((femaleCount / total) * 100).toFixed(1));

  const isMaleSelected = selectedGender?.toLowerCase() === "nam" || selectedGender?.toLowerCase() === "male";
  const isFemaleSelected = selectedGender?.toLowerCase() === "nữ" || selectedGender?.toLowerCase() === "female";
  const isAnySelected = Boolean(selectedGender);

  return (
    <div className={`w-full flex flex-col items-center justify-center select-none ${className}`}>
      {/* Optional Title */}
      {title && (
        <div className="w-full flex items-center justify-between mb-2">
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

      {/* Main Infographic SVG matching User's Reference exactly */}
      <div className="w-full flex items-center justify-center overflow-visible">
        <svg
          viewBox="0 0 510 210"
          className="w-full max-w-[490px] h-auto overflow-visible"
        >
          <defs>
            {/* Glow filters for interactive hover */}
            <filter id="maleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#38bdf8" floodOpacity="0.45" />
            </filter>
            <filter id="femaleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#f472b6" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* ========================================================= */}
          {/* LEFT: MALE SIDE                                            */}
          {/* ========================================================= */}
          <g
            className="cursor-pointer transition-all duration-200"
            onMouseEnter={() => setHovered("male")}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onGenderClick && onGenderClick("Nam")}
            filter={hovered === "male" || isMaleSelected ? "url(#maleGlow)" : undefined}
            opacity={isMaleSelected ? 1 : isAnySelected ? 0.35 : 1}
          >
            {/* Blue Surrounding Arc with Arrow pointing LEFT on TOP */}
            {/* Center (175, 105), R=56. Top is y=49, Bottom is y=161 */}
            {/* Starts at 8 o'clock (125, 133), curves around bottom & right to top (175, 49), then straight left to (35, 49) */}
            <path
              d="M 125 133 A 56 56 0 1 0 175 49 L 34 49"
              fill="none"
              stroke="#4fa5f8"
              strokeWidth={isMaleSelected ? "9" : "7"}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Arrowhead pointing Left at (20, 49) */}
            <polygon
              points="18,49 34,41 34,57"
              fill="#4fa5f8"
            />

            {/* Inner Avatar Circle (Vibrant Sky Blue from comp) */}
            <circle
              cx="175"
              cy="105"
              r="46"
              fill="#5ba4f5"
              className="transition-all duration-200"
            />

            {/* Male Figure Silhouette (Cutout Silhouette matching comp) */}
            <g transform="translate(175, 105)" className="fill-white">
              {/* Head */}
              <circle cx="0" cy="-21" r="8" />
              {/* Torso, Arms & Legs */}
              <path d="M -12 -9 C -12 -13 -7 -13 0 -13 C 7 -13 12 -13 12 -9 L 12 9 L 7.5 9 L 7.5 -1 L 4.5 -1 L 4.5 24 C 4.5 26.5 1.5 26.5 1.5 24 L 1.5 8 L -1.5 8 L -1.5 24 C -1.5 26.5 -4.5 26.5 -4.5 24 L -4.5 -1 L -7.5 -1 L -7.5 9 L -12 9 Z" />
            </g>

            {/* Data Labels: Centered under the top arrow shaft */}
            <g transform="translate(70, 95)" textAnchor="middle">
              <text
                x="0"
                y="0"
                className="fill-zinc-900 dark:fill-white font-black text-[28px] tracking-tight font-sans"
              >
                {malePct}%
              </text>
              <text
                x="0"
                y="22"
                className="fill-sky-600 dark:fill-sky-400 font-bold text-[14px] font-sans"
              >
                {finalMaleLabel}
              </text>
              {maleCount > 0 && (
                <text
                  x="0"
                  y="38"
                  className="fill-zinc-400 dark:fill-zinc-500 font-medium text-[10px] font-sans"
                >
                  {maleCount.toLocaleString("vi-VN")} {t("unitLabelPerson")}
                </text>
              )}
            </g>
          </g>

          {/* ========================================================= */}
          {/* RIGHT: FEMALE SIDE                                         */}
          {/* ========================================================= */}
          <g
            className="cursor-pointer transition-all duration-200"
            onMouseEnter={() => setHovered("female")}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onGenderClick && onGenderClick("Nữ")}
            filter={hovered === "female" || isFemaleSelected ? "url(#femaleGlow)" : undefined}
            opacity={isFemaleSelected ? 1 : isAnySelected ? 0.35 : 1}
          >
            {/* Pink Surrounding Arc with Arrow pointing RIGHT on BOTTOM */}
            {/* Center (335, 105), R=56. Top is y=49, Bottom is y=161 */}
            {/* Starts at 2 o'clock (385, 77), curves counter-clockwise over top & left to bottom (335, 161), then straight right to (476, 161) */}
            <path
              d="M 385 77 A 56 56 0 1 0 335 161 L 476 161"
              fill="none"
              stroke="#f472b6"
              strokeWidth={isFemaleSelected ? "9" : "7"}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Arrowhead pointing Right at (492, 161) */}
            <polygon
              points="492,161 476,153 476,169"
              fill="#f472b6"
            />

            {/* Inner Avatar Circle (Vibrant Pink from comp) */}
            <circle
              cx="335"
              cy="105"
              r="46"
              fill="#f472b6"
              className="transition-all duration-200"
            />

            {/* Female Figure Silhouette (Dress Cutout Silhouette matching comp) */}
            <g transform="translate(335, 105)" className="fill-white">
              {/* Head */}
              <circle cx="0" cy="-21" r="8" />
              {/* Torso, Dress & Legs */}
              <path d="M -10 -9 C -10 -13 -6 -13 0 -13 C 6 -13 10 -13 10 -9 L 14 11 L 4.5 11 L 4.5 24 C 4.5 26.5 1.5 26.5 1.5 24 L 1.5 11 L -1.5 11 L -1.5 24 C -1.5 26.5 -4.5 26.5 -4.5 24 L -4.5 11 L -14 11 Z" />
            </g>

            {/* Data Labels: Centered above the bottom arrow shaft */}
            <g transform="translate(440, 105)" textAnchor="middle">
              <text
                x="0"
                y="0"
                className="fill-zinc-900 dark:fill-white font-black text-[28px] tracking-tight font-sans"
              >
                {femalePct}%
              </text>
              <text
                x="0"
                y="22"
                className="fill-pink-600 dark:fill-pink-400 font-bold text-[14px] font-sans"
              >
                {finalFemaleLabel}
              </text>
              {femaleCount > 0 && (
                <text
                  x="0"
                  y="38"
                  className="fill-zinc-400 dark:fill-zinc-500 font-medium text-[10px] font-sans"
                >
                  {femaleCount.toLocaleString("vi-VN")} {t("unitLabelPerson")}
                </text>
              )}
            </g>
          </g>
        </svg>
      </div>

      {/* Comparison Bottom Bar */}
      {!compact && (
        <div className="w-full mt-1 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
            <span>{finalMaleLabel}: {malePct}%</span>
          </span>
          <span className="font-semibold text-zinc-600 dark:text-zinc-300">
            {malePct > femalePct ? `${finalMaleLabel} > ${finalFemaleLabel}` : femalePct > malePct ? `${finalFemaleLabel} > ${finalMaleLabel}` : `${malePct}% : ${femalePct}%`}
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />
            <span>{finalFemaleLabel}: {femalePct}%</span>
          </span>
        </div>
      )}
    </div>
  );
};
