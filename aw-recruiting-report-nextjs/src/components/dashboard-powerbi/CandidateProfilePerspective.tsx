"use client";

import React, { useState, useRef } from "react";
import { Users, GraduationCap, Share2, Calendar, Briefcase, Award, ArrowRight, PieChart as PieIcon, BarChart2 } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { InternAnalyticsCard } from "./InternAnalyticsCard";
import { SvgClusteredBarChart } from "./SvgClusteredBarChart";
import { SvgPieChart, PieSliceItem } from "./SvgPieChart";
import { SvgGenderRatioChart } from "./SvgGenderRatioChart";
import { SvgPopulationPyramidChart, AgePyramidRow } from "./SvgPopulationPyramidChart";
import { CrossFilterState } from "./ActiveCrossFilterRibbon";
import type { GlobalSlicersState } from "@/lib/drillthrough";
import { ChartExportButton } from "./ChartExportButton";

interface StatItem {
  name?: string;
  sourceName?: string;
  level?: string;
  group?: string;
  count: number;
  percentage: number;
}

interface CandidateProfilePerspectiveProps {
  demographics?: {
    genders: StatItem[];
    ageGroups: StatItem[];
    agePyramid?: AgePyramidRow[];
    educationLevels: StatItem[];
    recruitmentSources: StatItem[];
    positions: StatItem[];
  };
  internData?: {
    bySchool: any[];
    byStatus?: any[];
    total: number;
  };
  loading: boolean;
  crossFilter?: CrossFilterState;
  globalSlicers?: GlobalSlicersState;
  onCrossFilterChange?: (key: keyof CrossFilterState, value?: string, label?: string) => void;
}

export const CandidateProfilePerspective: React.FC<CandidateProfilePerspectiveProps> = ({
  demographics,
  internData,
  loading,
  crossFilter,
  globalSlicers,
  onCrossFilterChange,
}) => {
  const { t } = useTranslation();

  const getCandidateDrillUrl = (paramKey: string, val: string) => {
    const p = new URLSearchParams();
    if (globalSlicers?.loc && globalSlicers.loc !== "all") {
      p.set("loc", globalSlicers.loc);
    } else if (globalSlicers?.loc === "all") {
      p.set("loc", "all");
    }
    if (globalSlicers?.timeRange) {
      p.set("timeRange", globalSlicers.timeRange);
      if (globalSlicers.timeRange === "custom") {
        if (globalSlicers.startDate) p.set("startDate", globalSlicers.startDate);
        if (globalSlicers.endDate) p.set("endDate", globalSlicers.endDate);
      }
    }
    p.set(paramKey, val);
    return `/candidates?${p.toString()}`;
  };

  const sources = demographics?.recruitmentSources || [];
  const edus = demographics?.educationLevels || [];
  const ageGroups = demographics?.ageGroups || [];
  const genders = demographics?.genders || [];
  const positions = demographics?.positions || [];

  const [demographicMetric, setDemographicMetric] = useState<"gender" | "age">("gender");
  const [positionViewMode, setPositionViewMode] = useState<"donut" | "list">("donut");

  const sourcesCardRef = useRef<HTMLDivElement>(null);
  const edusCardRef = useRef<HTMLDivElement>(null);
  const genderAgeCardRef = useRef<HTMLDivElement>(null);
  const positionsCardRef = useRef<HTMLDivElement>(null);

  // Donut Chart Data for Positions
  const positionPalette = [
    "#f59e0b", // Amber - Công nhân
    "#0284c7", // Sky blue - Nhân viên
    "#8b5cf6", // Violet - Staff (lang)
    "#ec4899", // Pink - Cán bộ / Tổ trưởng
    "#10b981", // Emerald - Kỹ sư
    "#06b6d4", // Cyan - Phiên dịch viên
    "#64748b", // Slate - Khác
  ];

  const totalPositionsCount = positions.reduce((sum, p) => sum + (p.count || 0), 0);

  const positionsDonutData: PieSliceItem[] = positions.map((p, idx) => ({
    name: p.name || `Vị trí #${idx + 1}`,
    count: p.count,
    percentage: p.percentage,
    color: positionPalette[idx % positionPalette.length],
  }));

  // Clustered Bar Data for Sourcing Channels
  const sourcesBarData = sources.map((s) => ({
    label: s.sourceName || "Khác",
    count: s.count,
    percentage: s.percentage,
  }));

  // Clustered Bar Data for Education
  const edusBarData = edus.map((e) => ({
    label: e.level || "Chưa rõ",
    count: e.count,
    percentage: e.percentage,
  }));

  // Extract Male / Female Stats for Gender Ratio Infographic
  const maleStat = genders.find((g) => g.name === "Nam" || g.name === "Male") || { count: 0, percentage: 0 };
  const femaleStat = genders.find((g) => g.name === "Nữ" || g.name === "Female") || { count: 0, percentage: 0 };

  // Candidate Age Pyramid Data
  const candidateAgePyramid: AgePyramidRow[] = (demographics?.agePyramid && demographics.agePyramid.length > 0)
    ? demographics.agePyramid
    : [
        { group: "> 50", maleCount: 27, femaleCount: 10, malePct: 0.7, femalePct: 0.9 },
        { group: "41 - 50", maleCount: 507, femaleCount: 105, malePct: 13.3, femalePct: 9.8 },
        { group: "31 - 40", maleCount: 1146, femaleCount: 277, malePct: 30.0, femalePct: 25.7 },
        { group: "21 - 30", maleCount: 1717, femaleCount: 543, malePct: 45.0, femalePct: 50.4 },
        { group: "< 20", maleCount: 424, femaleCount: 143, malePct: 11.1, femalePct: 13.3 },
      ];

  // Pie Chart Data for Gender & Age Groups
  const genderPieData: PieSliceItem[] = genders.map((g) => ({
    name: g.name || "Khác",
    count: g.count,
    percentage: g.percentage,
    color: g.name === "Nữ" ? "#ec4899" : "#0284c7",
  }));

  const ageColors = ["#06b6d4", "#8b5cf6", "#3b82f6", "#f59e0b", "#ef4444"];
  const agePieData: PieSliceItem[] = ageGroups.map((a, idx) => ({
    name: `${a.group} tuổi`,
    count: a.count,
    percentage: a.percentage,
    color: ageColors[idx % ageColors.length],
  }));

  return (
    <div className="space-y-2.5 w-full">
      {/* Row 1: Sourcing Channels, Education, and Demographics (3 Balanced Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full">
        {/* Card 1: Recruitment Sources (4 cols) -  */}
        <div
          ref={sourcesCardRef}
          className="col-span-12 lg:col-span-4 bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-xl border border-zinc-200/90 dark:border-[#26262C] rounded-xl p-3 flex flex-col justify-between shadow-2xs"
        >
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide leading-tight">
                    {t("recruitmentSource")}
                  </h3>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                {crossFilter?.source && (
                  <a
                    href={getCandidateDrillUrl("source", crossFilter.source)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold shadow-xs transition-all hover:scale-105 active:scale-95 mr-1"
                    title="Mở danh sách ứng viên theo nguồn này trong tab mới"
                  >
                    <span>{t("viewList")} ({crossFilter.source})</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                )}
                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md">
                  {crossFilter?.source ? "Đang chọn 1" : t("topChannels")}
                </span>

                <ChartExportButton
                  targetRef={sourcesCardRef}
                  chartTitle={t("recruitmentSource", "Kênh Nguồn Tuyển Dụng")}
                  fileNamePrefix="Kenh_Nguon_Tuyen_Dung"
                />
              </div>
            </div>

            <div className="my-2.5">
              {loading ? (
                <div className="py-12 text-center text-xs text-zinc-400">{t("loading")}</div>
              ) : (
                <SvgClusteredBarChart
                  data={sourcesBarData}
                  unitLabel={t("unitLabelPerson")}
                  selectedLabel={crossFilter?.source}
                  onItemClick={(item) =>
                    onCrossFilterChange?.("source", item.label === crossFilter?.source ? undefined : item.label)
                  }
                  colorPalette={[
                    "#0284c7",
                    "#3b82f6",
                    "#6366f1",
                    "#8b5cf6",
                    "#a855f7",
                    "#ec4899",
                  ]}
                  maxHeight="250px"
                />
              )}
            </div>
          </div>

        </div>

        {/* Card 2: Education Levels (4 cols) -  */}
        <div
          ref={edusCardRef}
          className="col-span-12 sm:col-span-6 lg:col-span-4 bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-xl border border-zinc-200/90 dark:border-[#26262C] rounded-xl p-3 flex flex-col justify-between shadow-2xs"
        >
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide leading-tight">
                    {t("educationLevelsTitle")}
                  </h3>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                {crossFilter?.edu && (
                  <a
                    href={getCandidateDrillUrl("edu", crossFilter.edu)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-xs transition-all hover:scale-105 active:scale-95 mr-1"
                    title="Mở danh sách ứng viên theo trình độ này trong tab mới"
                  >
                    <span>{t("viewList")} ({crossFilter.edu})</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                )}
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  {crossFilter?.edu ? "Đang chọn 1" : t("educationLevelsCount")}
                </span>

                <ChartExportButton
                  targetRef={edusCardRef}
                  chartTitle={t("educationLevelsTitle", "Trình Độ Học Vấn Ứng Viên")}
                  fileNamePrefix="Trinh_Do_Hoc_Van"
                />
              </div>
            </div>

            <div className="my-2.5">
              {loading ? (
                <div className="py-12 text-center text-xs text-zinc-400">{t("loading")}</div>
              ) : (
                <SvgClusteredBarChart
                  data={edusBarData}
                  unitLabel={t("unitLabelPerson")}
                  selectedLabel={crossFilter?.edu}
                  onItemClick={(item) =>
                    onCrossFilterChange?.("edu", item.label === crossFilter?.edu ? undefined : item.label)
                  }
                  colorPalette={[
                    "#10b981",
                    "#059669",
                    "#047857",
                    "#0d9488",
                    "#0891b2",
                  ]}
                  maxHeight="250px"
                />
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Gender & Age Demographics (4 cols) - Pie Chart */}
        <div
          ref={genderAgeCardRef}
          className="col-span-12 sm:col-span-6 lg:col-span-4 bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-xl border border-zinc-200/90 dark:border-[#26262C] rounded-xl p-3 flex flex-col justify-between shadow-2xs"
        >
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide leading-tight">
                    {t("genderAndAgeGroup")}
                  </h3>
                 
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {crossFilter?.gender && (
                  <a
                    href={getCandidateDrillUrl("gender", crossFilter.gender)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-[10px] font-bold shadow-xs transition-all hover:scale-105 active:scale-95"
                    title="Mở danh sách ứng viên theo giới tính này trong tab mới"
                  >
                    <span>{t("viewList")} ({crossFilter.gender})</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                )}
                {crossFilter?.ageGroup && (
                  <a
                    href={getCandidateDrillUrl("ageGroup", crossFilter.ageGroup)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold shadow-xs transition-all hover:scale-105 active:scale-95"
                    title="Mở danh sách ứng viên theo nhóm tuổi này trong tab mới"
                  >
                    <span>{t("viewList")} ({crossFilter.ageGroup})</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                )}
                {/* Toggle Giới Tính / Nhóm Tuổi */}
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200/70 dark:border-zinc-700/60">
                  <button
                    type="button"
                    onClick={() => setDemographicMetric("gender")}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                      demographicMetric === "gender"
                        ? "bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-2xs"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    {t("gender")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemographicMetric("age")}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                      demographicMetric === "age"
                        ? "bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-2xs"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    {t("age")}
                  </button>
                </div>

                <ChartExportButton
                  targetRef={genderAgeCardRef}
                  chartTitle={t("genderAndAgeGroup", "Giới Tính & Độ Tuổi Ứng Viên")}
                  fileNamePrefix="Gioi_Tinh_Do_Tuoi"
                />
              </div>
            </div>

            {/* Gender Ratio Infographic or Population Pyramid Chart */}
            <div className="my-2.5">
              {loading ? (
                <div className="py-12 text-center text-xs text-zinc-400">{t("loading")}</div>
              ) : demographicMetric === "gender" ? (
                <SvgGenderRatioChart
                  maleCount={maleStat.count}
                  femaleCount={femaleStat.count}
                  malePercentage={maleStat.percentage}
                  femalePercentage={femaleStat.percentage}
                  compact={true}
                  selectedGender={crossFilter?.gender}
                  onGenderClick={(g) =>
                    onCrossFilterChange?.("gender", g === crossFilter?.gender ? undefined : g)
                  }
                />
              ) : (
                <SvgPopulationPyramidChart
                  data={candidateAgePyramid}
                  maleTotal={maleStat.count}
                  femaleTotal={femaleStat.count}
                  malePercentage={maleStat.percentage}
                  femalePercentage={femaleStat.percentage}
                  compact={true}
                  selectedGroup={crossFilter?.ageGroup}
                  onGroupClick={(grp) => {
                    const cleanGrp = grp ? grp.replace(/\s*tuổi\s*/gi, "").trim() : grp;
                    onCrossFilterChange?.("ageGroup", cleanGrp === crossFilter?.ageGroup ? undefined : cleanGrp);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Position Breakdown & Partner Interns */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 w-full">
        {/* Positions Breakdown (6 cols) */}
        <div
          ref={positionsCardRef}
          className="col-span-12 md:col-span-6 bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-xl border border-zinc-200/90 dark:border-[#26262C] rounded-xl p-3 shadow-2xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide leading-tight">
                    {t("positionsHiring")}
                  </h3>
                </div>
              </div>

              {/* View mode toggle: Donut vs List */}
              <div className="flex items-center space-x-2">
                {crossFilter?.position && (
                  <a
                    href={getCandidateDrillUrl("duty", crossFilter.position)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold shadow-xs transition-all hover:scale-105 active:scale-95"
                    title="Mở danh sách ứng viên theo vị trí này trong tab mới"
                  >
                    <span>{t("viewList")} ({crossFilter.position})</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                )}
                <span className="hidden sm:inline text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  {crossFilter?.position ? "Đang chọn 1" : `${positions.length} ${t("position").toLowerCase()}`}
                </span>
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200/70 dark:border-zinc-700/60">
                  <button
                    type="button"
                    onClick={() => setPositionViewMode("donut")}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 ${
                      positionViewMode === "donut"
                        ? "bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-2xs"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    <PieIcon className="w-3 h-3" />
                    <span>{t("donutView")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPositionViewMode("list")}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 ${
                      positionViewMode === "list"
                        ? "bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-2xs"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    <BarChart2 className="w-3 h-3" />
                    <span>{t("listView")}</span>
                  </button>
                </div>

                <ChartExportButton
                  targetRef={positionsCardRef}
                  chartTitle={t("positionsHiring", "Cơ Cấu Vị Trí Tuyển Dụng")}
                  fileNamePrefix="Co_Cau_Vi_Tri"
                />
              </div>
            </div>

            {/* Main Content: Donut Chart or Ranked List */}
            {positionViewMode === "donut" ? (
              <div className="py-2.5 flex items-center justify-center">
                <SvgPieChart
                  data={positionsDonutData}
                  size={195}
                  donut={true}
                  innerRadiusRatio={0.58}
                  direction="row"
                  className="w-full"
                  selectedName={crossFilter?.position}
                  onSliceClick={(slice) =>
                    onCrossFilterChange?.("position", slice.name === crossFilter?.position ? undefined : slice.name)
                  }
                  centerText={{
                    title: t("totalLabel"),
                    value: totalPositionsCount.toLocaleString("vi-VN"),
                  }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5 max-h-[340px] overflow-y-auto custom-scrollbar pr-0.5">
                {positions.map((pos, idx) => {
                  const isSelected = crossFilter?.position && pos.name?.toLowerCase() === crossFilter.position.toLowerCase();
                  const isAnySelected = Boolean(crossFilter?.position);

                  return (
                    <div
                      key={pos.name || idx}
                      onClick={() =>
                        onCrossFilterChange?.("position", pos.name === crossFilter?.position ? undefined : pos.name)
                      }
                      className={`p-2.5 rounded-lg border transition-all flex flex-col justify-between group cursor-pointer ${
                        isSelected
                          ? "ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 shadow-xs scale-[1.01]"
                          : isAnySelected
                          ? "opacity-40 hover:opacity-85 bg-zinc-50 dark:bg-[#202026] border-zinc-100 dark:border-zinc-800/60"
                          : "bg-zinc-50 dark:bg-[#202026] border-zinc-100 dark:border-zinc-800/60 hover:border-amber-500/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-black bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                            #{idx + 1}
                          </span>
                          <span
                            className={`text-xs font-bold truncate transition-colors ${
                              isSelected
                                ? "text-amber-700 dark:text-amber-300 font-black"
                                : "text-zinc-800 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-400"
                            }`}
                            title={pos.name}
                          >
                            {pos.name}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 tabular-nums shrink-0">
                          {pos.percentage}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                        <span>{pos.count.toLocaleString("vi-VN")} {t("candidatesCount")}</span>
                      </div>

                      {/* Visual micro progress bar */}
                      <div className="w-full h-1 bg-zinc-200/70 dark:bg-zinc-800 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(pos.percentage, pos.count > 0 ? 3 : 0))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Intern Analytics (6 cols) */}
        <div className="col-span-12 md:col-span-6">
          <InternAnalyticsCard data={internData as any} loading={loading} />
        </div>
      </div>
    </div>
  );
};
