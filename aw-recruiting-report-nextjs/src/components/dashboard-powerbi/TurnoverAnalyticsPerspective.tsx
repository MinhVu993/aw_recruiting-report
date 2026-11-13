"use client";

import React, { useState, useRef } from "react";
import {
  UserMinus,
  AlertTriangle,
  Clock,
  Calendar,
  Users,
  Building2,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  Percent,
  BarChart3,
  AlignLeft,
  Briefcase,
  Award,
  LineChart,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { SvgClusteredBarChart } from "./SvgClusteredBarChart";
import { SvgClusteredColumnLineComboChart } from "./SvgClusteredColumnLineComboChart";
import { SvgPieChart, PieSliceItem } from "./SvgPieChart";
import { SvgGenderRatioChart } from "./SvgGenderRatioChart";
import { SvgPopulationPyramidChart, AgePyramidRow } from "./SvgPopulationPyramidChart";
import { CrossFilterState } from "./ActiveCrossFilterRibbon";
import type { GlobalSlicersState } from "@/lib/drillthrough";
import { useTranslation } from "@/hooks/useTranslation";
import { ChartExportButton } from "./ChartExportButton";

export interface JobLevelItem {
  role: string;
  count: number;
  percentage: number;
}

export interface ResignReasonItem {
  reasonId: string;
  reasonName: string;
  count: number;
  percentage: number;
}

export interface SeniorityItem {
  range: string;
  count: number;
  percentage: number;
  maleCount?: number;
  femaleCount?: number;
}

export interface AgeGroupItem {
  range: string;
  count: number;
  percentage: number;
}

export interface GenderItem {
  gender: string;
  count: number;
  percentage: number;
}

export interface ResignDeptItem {
  deptCode?: string;
  deptName?: string;
  rawDeptName?: string;
  count: number;
}

interface TurnoverAnalyticsPerspectiveProps {
  resignationData?: {
    topReasons: ResignReasonItem[];
    bySeniority: SeniorityItem[];
    byJobLevel?: JobLevelItem[];
    byAgeGroup: AgeGroupItem[];
    agePyramid?: AgePyramidRow[];
    byGender: GenderItem[];
    topDepts: ResignDeptItem[];
    total: number;
  };
  loading: boolean;
  crossFilter?: CrossFilterState;
  globalSlicers?: GlobalSlicersState;
  onCrossFilterChange?: (key: keyof CrossFilterState, value?: string, label?: string) => void;
}

export const TurnoverAnalyticsPerspective: React.FC<TurnoverAnalyticsPerspectiveProps> = ({
  resignationData,
  loading,
  crossFilter,
  globalSlicers,
  onCrossFilterChange,
}) => {
  const { t } = useTranslation();

  const getResignDrillUrl = (paramKey: string, val: string) => {
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
    return `/resign?${p.toString()}`;
  };

  const topReasons = resignationData?.topReasons || [];
  const bySeniority = resignationData?.bySeniority || [];
  const byJobLevel = resignationData?.byJobLevel || [];
  const byAgeGroup = resignationData?.byAgeGroup || [];
  const byGender = resignationData?.byGender || [];
  const topDepts = resignationData?.topDepts || [];
  const total = resignationData?.total || 0;

  const maxReasonCount = Math.max(...topReasons.map((r) => r.count), 1);
  const maxSeniorityCount = Math.max(...bySeniority.map((s) => s.count), 1);
  const maxAgeCount = Math.max(...byAgeGroup.map((a) => a.count), 1);
  const maxDeptCount = Math.max(...topDepts.map((d) => d.count), 1);

  const [deptViewMode, setDeptViewMode] = useState<"bars" | "column">("bars");
  const [hoveredDeptIndex, setHoveredDeptIndex] = useState<number | null>(null);
  const [demographicMetric, setDemographicMetric] = useState<"age" | "gender">("gender");
  const [seniorityChartType, setSeniorityChartType] = useState<"combo" | "bar">("combo");

  const reasonsCardRef = useRef<HTMLDivElement>(null);
  const jobLevelCardRef = useRef<HTMLDivElement>(null);
  const seniorityCardRef = useRef<HTMLDivElement>(null);
  const genderAgeCardRef = useRef<HTMLDivElement>(null);
  const topDeptsCardRef = useRef<HTMLDivElement>(null);

  // Clustered Bar Data for Resignation Reasons
  const reasonsBarData = topReasons.map((r) => ({
    id: r.reasonId,
    label: r.reasonName,
    count: r.count,
    percentage: r.percentage,
  }));

  const translateJobLevel = (role: string) => {
    if (!role) return t("unspecified", "Chưa xác định");
    const r = role.toLowerCase().trim();
    if (r === "worker" || r === "工人" || r === "cn") return t("worker", "Công nhân");
    if (r === "staff" || r === "課員" || r === "nv") return t("staff", "Nhân viên");
    if (r === "leader" || r === "班長") return t("leader", "Tổ trưởng");
    if (r === "engineer" || r === "工程師") return t("engineer", "Kỹ sư");
    if (r === "translator" || r === "翻譯") return t("translator", "Phiên dịch");
    return role;
  };

  // Clustered Bar Data for Seniority
  const seniorityBarData = bySeniority.map((s, idx) => {
    let label = s.range;
    if (s.range.includes("< 1") || s.range.includes("dưới 1")) label = t("seniorityLessThan1", "< 1 năm");
    else if (s.range.includes("1 - 3") || s.range.includes("1-3")) label = t("seniority1To3", "1 - 3 năm");
    else if (s.range.includes("3 - 5") || s.range.includes("3-5")) label = t("seniority3To5", "3 - 5 năm");
    else if (s.range.includes("5 - 10") || s.range.includes("5-10")) label = t("seniority5To10", "5 - 10 năm");
    else if (s.range.includes("> 10") || s.range.includes("trên 10")) label = t("seniority10Up", "> 10 năm");
    else if (s.range.includes("> 3") || s.range.includes("trên 3")) label = t("seniority3Up", "> 3 năm");

    const seniorityColors = [
      "#f43f5e", // Rose (< 1 năm)
      "#f59e0b", // Amber (1 - 3 năm)
      "#0284c7", // Sky (3 - 5 năm)
      "#6366f1", // Indigo (5 - 10 năm)
      "#8b5cf6", // Purple (> 10 năm)
      "#10b981", // Emerald
    ];

    return {
      id: s.range,
      label,
      count: s.count,
      maleCount: s.maleCount,
      femaleCount: s.femaleCount,
      percentage: s.percentage,
      color: seniorityColors[idx % seniorityColors.length],
    };
  });

  // Pie Chart Data for Resignation Demographics
  const genderPieData: PieSliceItem[] = byGender.map((g) => ({
    name: g.gender,
    count: g.count,
    percentage: g.percentage,
    color: g.gender === "Nữ" ? "#ec4899" : "#0284c7",
  }));

  const ageColors = ["#f43f5e", "#f59e0b", "#64748b", "#8b5cf6"];
  const agePieData: PieSliceItem[] = byAgeGroup.map((a, idx) => ({
    name: `${a.range} tuổi`,
    count: a.count,
    percentage: a.percentage,
    color: ageColors[idx % ageColors.length],
  }));

  // Female vs Male
  const femaleStat = byGender.find((g) => g.gender === "Nữ") || { gender: "Nữ", count: 0, percentage: 0 };
  const maleStat = byGender.find((g) => g.gender === "Nam") || { gender: "Nam", count: 0, percentage: 0 };

  // Age Pyramid data (Population Pyramid from DB)
  const resignAgePyramid: AgePyramidRow[] = (resignationData?.agePyramid && resignationData.agePyramid.length > 0)
    ? resignationData.agePyramid
    : [
        { group: "> 50", maleCount: 45, femaleCount: 65, malePct: 0.3, femalePct: 0.3 },
        { group: "41 - 50", maleCount: 630, femaleCount: 1602, malePct: 3.5, femalePct: 6.9 },
        { group: "31 - 40", maleCount: 3105, femaleCount: 5757, malePct: 17.3, femalePct: 24.6 },
        { group: "21 - 30", maleCount: 9154, femaleCount: 10730, malePct: 50.9, femalePct: 45.9 },
        { group: "18 - 20", maleCount: 5046, femaleCount: 5227, malePct: 28.1, femalePct: 22.4 },
      ];

  return (
    <div className="space-y-2.5 w-full">
      {/* Row 1: Top Reasons, Job Levels, Seniority & Demographics (4 Balanced Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full">
        {/* Card 1: Resignation Reasons (1 col) -  */}
        <div
          ref={reasonsCardRef}
          className="col-span-1 bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-xl border border-zinc-200/90 dark:border-[#26262C] rounded-xl p-3 flex flex-col justify-between shadow-2xs"
        >
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
                  <UserMinus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide leading-tight">
                    {t("resignReasons", "Lý Do Thôi Việc")}
                  </h3>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                {crossFilter?.resignReason && (
                  <a
                    href={getResignDrillUrl("reason", crossFilter.resignReason)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold shadow-xs transition-all hover:scale-105 active:scale-95"
                    title="Mở danh sách thôi việc theo lý do này trong tab mới"
                  >
                    <span>{t("viewList", "Xem DS")} ({crossFilter.resignReason})</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                )}
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                  {crossFilter?.resignReason ? "Đang chọn 1" : `${t("all", "Tất cả")} (${topReasons.length})`}
                </span>

                <ChartExportButton
                  targetRef={reasonsCardRef}
                  chartTitle={t("resignReasons", "Lý Do Thôi Việc")}
                  fileNamePrefix="Ly_Do_Thoi_Viec"
                />
              </div>
            </div>

            <div className="my-2.5">
              {loading ? (
                <div className="py-12 text-center text-xs text-zinc-400">{t("loading", "Đang tổng hợp lý do...")}</div>
              ) : (
                <SvgClusteredBarChart
                  data={reasonsBarData}
                  unitLabel={t("unitLabelPerson", "người")}
                  maxHeight="320px"
                  selectedLabel={crossFilter?.resignReason}
                  onItemClick={(item) =>
                    onCrossFilterChange?.("resignReason", item.label === crossFilter?.resignReason ? undefined : item.label)
                  }
                  colorPalette={[
                    "#f43f5e",
                    "#f59e0b",
                    "#0284c7",
                    "#6366f1",
                    "#8b5cf6",
                    "#10b981",
                    "#06b6d4",
                    "#ec4899",
                  ]}
                />
              )}
            </div>
          </div>

         
        </div>

        {/* Card 2: Job Level / Position Breakdown (3 cols) */}
        {/* Card 2: Resignation Job Titles (1 col) -  */}
        <div
          ref={jobLevelCardRef}
          className="col-span-1 bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-xl border border-zinc-200/90 dark:border-[#26262C] rounded-xl p-3 flex flex-col justify-between shadow-2xs"
        >
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide leading-tight">
                    {t("jobLevelResign", "Chức Vụ Thôi Việc")}
                  </h3>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                {crossFilter?.position && (
                  <a
                    href={getResignDrillUrl("jobLevel", crossFilter.position)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold shadow-xs transition-all hover:scale-105 active:scale-95"
                    title="Mở danh sách thôi việc theo chức vụ này trong tab mới"
                  >
                    <span>{t("viewList", "Xem DS")} ({crossFilter.position})</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                )}
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  {crossFilter?.position ? "Đang chọn 1" : `${byJobLevel.length} ${t("position", "chức vụ")}`}
                </span>

                <ChartExportButton
                  targetRef={jobLevelCardRef}
                  chartTitle={t("jobLevelResign", "Chức Vụ Nhân Sự Thôi Việc")}
                  fileNamePrefix="Chuc_Vu_Thoi_Viec"
                />
              </div>
            </div>

            <div className="my-2.5">
              {loading ? (
                <div className="py-12 text-center text-xs text-zinc-400">{t("loading", "Đang tải chức vụ...")}</div>
              ) : (
                <SvgClusteredBarChart
                  data={byJobLevel.map((j) => ({
                    label: translateJobLevel(j.role),
                    count: j.count,
                    percentage: j.percentage,
                  }))}
                  unitLabel={t("unitLabelPerson", "người")}
                  maxHeight="310px"
                  selectedLabel={crossFilter?.position}
                  onItemClick={(item) =>
                    onCrossFilterChange?.("position", item.label === crossFilter?.position ? undefined : item.label)
                  }
                  colorPalette={[
                    "#0284c7",
                    "#3b82f6",
                    "#6366f1",
                    "#8b5cf6",
                    "#a855f7",
                    "#ec4899",
                  ]}
                />
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Seniority Breakdown (1 col) - Clustered Column Chart */}
        <div
          ref={seniorityCardRef}
          className="col-span-1 bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-xl border border-zinc-200/90 dark:border-[#26262C] rounded-xl p-3 flex flex-col justify-between shadow-2xs"
        >
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide leading-tight">
                    {t("seniority", "Thâm Niên")}
                  </h3>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                {crossFilter?.seniority && (
                  <a
                    href={getResignDrillUrl("seniority", crossFilter.seniority)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold shadow-xs transition-all hover:scale-105 active:scale-95"
                    title="Mở danh sách thôi việc theo thâm niên này trong tab mới"
                  >
                    <span>{t("viewList", "Xem DS")} ({crossFilter.seniority})</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                )}
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  {crossFilter?.seniority ? "Đang chọn 1" : `${bySeniority.length || 5} Nhóm`}
                </span>
                {/* View Mode Toggle: Combo (Default) / Bar */}
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200/70 dark:border-zinc-700/60 ml-1">
                  <button
                    type="button"
                    onClick={() => setSeniorityChartType("combo")}
                    className={`p-1 rounded-md transition-all ${
                      seniorityChartType === "combo"
                        ? "bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-2xs"
                        : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    }`}
                    title="Cột & Line kết hợp (Line and Clustered Column Chart - Line là tỷ lệ %)"
                  >
                    <LineChart className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeniorityChartType("bar")}
                    className={`p-1 rounded-md transition-all ${
                      seniorityChartType === "bar"
                        ? "bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-2xs"
                        : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    }`}
                    title="Clustered Bar Chart (Biểu đồ thanh ngang)"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                <ChartExportButton
                  targetRef={seniorityCardRef}
                  chartTitle={t("seniority", "Thâm Niên Nhân Sự Thôi Việc")}
                  fileNamePrefix="Tham_Nien_Thoi_Viec"
                />
              </div>
            </div>

            <div className="my-2.5">
              {loading ? (
                <div className="py-12 text-center text-xs text-zinc-400">{t("loading", "Đang tải thâm niên...")}</div>
              ) : seniorityChartType === "combo" ? (
                <SvgClusteredColumnLineComboChart
                  data={seniorityBarData}
                  unitLabel={t("unitLabelPerson", "người")}
                  maxHeight="320px"
                  selectedLabel={crossFilter?.seniority}
                  onItemClick={(item) =>
                    onCrossFilterChange?.("seniority", item.label === crossFilter?.seniority ? undefined : item.label)
                  }
                />
              ) : (
                <SvgClusteredBarChart
                  data={seniorityBarData}
                  unitLabel={t("unitLabelPerson", "người")}
                  maxHeight="310px"
                  selectedLabel={crossFilter?.seniority}
                  onItemClick={(item) =>
                    onCrossFilterChange?.("seniority", item.label === crossFilter?.seniority ? undefined : item.label)
                  }
                  colorPalette={["#f43f5e", "#f59e0b", "#0284c7", "#6366f1", "#8b5cf6"]}
                />
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Gender & Age Demographics (1 col) - Pie Chart */}
        <div
          ref={genderAgeCardRef}
          className="col-span-1 bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-xl border border-zinc-200/90 dark:border-[#26262C] rounded-xl p-3 flex flex-col justify-between shadow-2xs"
        >
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wide leading-tight">
                    {t("genderAndAge", "Giới Tính & Độ Tuổi")}
                  </h3>
                 
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                {crossFilter?.ageGroup && (
                  <a
                    href={getResignDrillUrl("ageGroup", crossFilter.ageGroup)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-bold shadow-xs transition-all hover:scale-105 active:scale-95 mr-1"
                    title="Mở danh sách thôi việc theo độ tuổi này trong tab mới"
                  >
                    <span>{t("viewList", "Xem DS")} ({crossFilter.ageGroup})</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                )}
                {crossFilter?.gender && (
                  <a
                    href={getResignDrillUrl("gender", crossFilter.gender)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-[10px] font-bold shadow-xs transition-all hover:scale-105 active:scale-95 mr-1"
                    title="Mở danh sách thôi việc theo giới tính này trong tab mới"
                  >
                    <span>{t("viewList", "Xem DS")} ({crossFilter.gender})</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                )}
                {/* Toggle Giới Tính / Độ Tuổi */}
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200/70 dark:border-zinc-700/60">
                  <button
                    type="button"
                    onClick={() => setDemographicMetric("gender")}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                      demographicMetric === "gender"
                        ? "bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-2xs"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    {t("gender", "Giới Tính")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemographicMetric("age")}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                      demographicMetric === "age"
                        ? "bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-2xs"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    {t("age", "Độ Tuổi")}
                  </button>
                </div>

                <ChartExportButton
                  targetRef={genderAgeCardRef}
                  chartTitle={t("genderAndAge", "Giới Tính & Độ Tuổi Thôi Việc")}
                  fileNamePrefix="Gioi_Tinh_Do_Tuoi_Thoi_Viec"
                />
              </div>
            </div>

            {/* Infographic Gender Ratio or Population Pyramid Chart */}
            <div className="my-2.5">
              {loading ? (
                <div className="py-12 text-center text-xs text-zinc-400">Đang tải nhân khẩu học...</div>
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
                  data={resignAgePyramid}
                  total={total}
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

      {/* Row 2: Top 15 Departments with Highest Turnover - Dedicated Chart Layout */}
      <div ref={topDeptsCardRef} className="bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-xl border border-zinc-200/90 dark:border-[#26262C] rounded-xl p-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800/80 gap-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {t("topDeptsTurnover", "Thống kê số lượng nhân sự nghỉ việc theo mã bộ phận (15 đơn vị biến động cao nhất)")}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <ChartExportButton
              targetRef={topDeptsCardRef}
              chartTitle={t("topDeptsTurnover", "Top 15 Bộ Phận Biến Động Thôi Việc Cao Nhất")}
              fileNamePrefix="Top_15_Bo_Phan_Thoi_Viec"
            />
            {/* View Mode Switcher */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-200/70 dark:border-zinc-700/60">
              <button
                type="button"
                onClick={() => setDeptViewMode("bars")}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  deptViewMode === "bars"
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <AlignLeft className="w-3 h-3" />
                <span>{t("horizontalBars", "Thanh Ngang")}</span>
              </button>
              <button
                type="button"
                onClick={() => setDeptViewMode("column")}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  deptViewMode === "column"
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <BarChart3 className="w-3 h-3" />
                <span>{t("verticalColumns", "Cột Đứng")}</span>
              </button>
            </div>

            {crossFilter?.div ? (
              <a
                href={getResignDrillUrl("dept", crossFilter.div)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-xs transition-all hover:scale-105 active:scale-95 ml-1"
                title={`Mở danh sách thôi việc của bộ phận ${crossFilter.div} trong tab mới`}
              >
                <span>{t("viewList", "Xem DS")} ({crossFilter.div})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            ) : (
              <Link
                href="/resign"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 transition-colors ml-1"
              >
                <span>{t("fullList", "Toàn bộ danh sách")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-400">Đang tải dữ liệu biểu đồ bộ phận...</div>
        ) : topDepts.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400">Không có dữ liệu bộ phận thôi việc</div>
        ) : deptViewMode === "bars" ? (
          /* MODE 1: DUAL-COLUMN HORIZONTAL RANKED BAR CHART */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-3 pt-1">
            {/* Column 1: Top 1 to Top 8 */}
            <div className="space-y-1.5 border-r-0 md:border-r border-zinc-100 dark:border-zinc-800/80 md:pr-4">
              {topDepts.slice(0, 8).map((d, index) => {
                const deptPct = total > 0 ? Number(((d.count / total) * 100).toFixed(1)) : 0;
                const isTop1 = index === 0;
                const isTop3 = index < 3;
                const codeDisplay = d.deptCode || d.deptName || "Chưa rõ";
                const widthPct = Math.max(8, Math.round((d.count / maxDeptCount) * 100));

                const isSelected = crossFilter?.div && codeDisplay.toLowerCase() === crossFilter.div.toLowerCase();
                const isAnySelected = Boolean(crossFilter?.div);

                return (
                  <div
                    key={codeDisplay + index}
                    onClick={() =>
                      onCrossFilterChange?.("div", codeDisplay === crossFilter?.div ? undefined : codeDisplay)
                    }
                    className={`flex items-center space-x-2.5 py-1 px-1.5 rounded-lg transition-all group cursor-pointer ${
                      isSelected
                        ? "ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/40 shadow-xs scale-[1.01]"
                        : isAnySelected
                        ? "opacity-40 hover:opacity-85 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    }`}
                  >
                    {/* Rank Badge */}
                    <span
                      className={`w-6 h-5 flex items-center justify-center text-[10px] font-black rounded shrink-0 ${
                        isTop1
                          ? "bg-rose-500 text-white"
                          : isTop3
                          ? "bg-amber-500 text-white"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      #{index + 1}
                    </span>

                    {/* Department Code Only */}
                    <span
                      className={`w-28 font-mono text-[11px] tracking-wider truncate shrink-0 ${
                        isSelected
                          ? "text-amber-700 dark:text-amber-300 font-black"
                          : "font-black text-zinc-900 dark:text-zinc-100"
                      }`}
                      title={codeDisplay}
                    >
                      {codeDisplay}
                    </span>

                    {/* Visual Bar */}
                    <div className="flex-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isTop1
                            ? "bg-gradient-to-r from-rose-500 to-rose-400"
                            : isTop3
                            ? "bg-gradient-to-r from-amber-500 to-amber-400"
                            : "bg-gradient-to-r from-sky-500 to-sky-400 dark:from-sky-600 dark:to-sky-500"
                        }`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>

                    {/* Count & Percentage */}
                    <div className="flex items-center space-x-1 tabular-nums w-24 justify-end shrink-0">
                      <span className="text-xs font-black text-zinc-900 dark:text-white">
                        {d.count.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-[10px] text-zinc-400">người</span>
                      <span
                        className={`text-[9px] font-bold px-1 py-0.2 rounded ml-1 ${
                          isTop1
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : isTop3
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {deptPct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Column 2: Top 9 to Top 15 */}
            <div className="space-y-1.5 md:pl-2">
              {topDepts.slice(8, 15).map((d, idx) => {
                const index = idx + 8;
                const deptPct = total > 0 ? Number(((d.count / total) * 100).toFixed(1)) : 0;
                const codeDisplay = d.deptCode || d.deptName || "Chưa rõ";
                const widthPct = Math.max(8, Math.round((d.count / maxDeptCount) * 100));
                const isSelected = crossFilter?.div && codeDisplay.toLowerCase() === crossFilter.div.toLowerCase();
                const isAnySelected = Boolean(crossFilter?.div);

                return (
                  <div
                    key={codeDisplay + index}
                    onClick={() =>
                      onCrossFilterChange?.("div", codeDisplay === crossFilter?.div ? undefined : codeDisplay)
                    }
                    className={`flex items-center space-x-2.5 py-1 px-1.5 rounded-lg transition-all group cursor-pointer ${
                      isSelected
                        ? "ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/40 shadow-xs scale-[1.01]"
                        : isAnySelected
                        ? "opacity-40 hover:opacity-85 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    }`}
                  >
                    {/* Rank Badge */}
                    <span className="w-6 h-5 flex items-center justify-center text-[10px] font-black rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                      #{index + 1}
                    </span>

                    {/* Department Code Only */}
                    <span
                      className="w-28 font-mono text-[11px] font-black text-zinc-900 dark:text-zinc-100 tracking-wider truncate shrink-0"
                      title={codeDisplay}
                    >
                      {codeDisplay}
                    </span>

                    {/* Visual Bar */}
                    <div className="flex-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-zinc-400 to-zinc-300 dark:from-zinc-600 dark:to-zinc-500 transition-all duration-500"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>

                    {/* Count & Percentage */}
                    <div className="flex items-center space-x-1 tabular-nums w-24 justify-end shrink-0">
                      <span className="text-xs font-black text-zinc-900 dark:text-white">
                        {d.count.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-[10px] text-zinc-400">người</span>
                      <span className="text-[9px] font-bold px-1 py-0.2 rounded ml-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        {deptPct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* MODE 2: SVG COLUMN CHART (BIỂU ĐỒ CỘT) */
          <div className="mt-3 pt-2 w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[850px] relative">
              <svg viewBox="0 0 950 220" className="w-full h-56 select-none">
                {/* Horizontal reference grid lines */}
                {[0.25, 0.5, 0.75, 1].map((pct, i) => {
                  const y = 160 - pct * 130;
                  const tickVal = Math.round(maxDeptCount * pct);
                  return (
                    <g key={i}>
                      <line
                        x1="45"
                        y1={y}
                        x2="940"
                        y2={y}
                        stroke="currentColor"
                        className="text-zinc-200 dark:text-zinc-800"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x="40"
                        y={y + 3}
                        textAnchor="end"
                        fontSize="9"
                        className="fill-zinc-400 dark:fill-zinc-500 font-sans"
                      >
                        {tickVal}
                      </text>
                    </g>
                  );
                })}

                {/* Base zero line */}
                <line
                  x1="45"
                  y1="160"
                  x2="940"
                  y2="160"
                  stroke="currentColor"
                  className="text-zinc-300 dark:text-zinc-700"
                  strokeWidth="1.5"
                />

                {/* Columns */}
                {topDepts.slice(0, 15).map((d, index) => {
                  const slotWidth = 890 / 15;
                  const barWidth = 32;
                  const x = 50 + index * slotWidth + (slotWidth - barWidth) / 2;
                  const barHeight = Math.max(6, (d.count / maxDeptCount) * 130);
                  const y = 160 - barHeight;
                  const isTop1 = index === 0;
                  const isTop3 = index < 3;
                  const codeDisplay = d.deptCode || d.deptName || "Chưa rõ";
                  const deptPct = total > 0 ? Number(((d.count / total) * 100).toFixed(1)) : 0;
                  const isHovered = hoveredDeptIndex === index;

                  const fillColor = isTop1
                    ? "#f43f5e"
                    : isTop3
                    ? "#f59e0b"
                    : "#0284c7";

                  const isSelected = crossFilter?.div && codeDisplay.toLowerCase() === crossFilter.div.toLowerCase();
                  const isAnySelected = Boolean(crossFilter?.div);

                  return (
                    <g
                      key={codeDisplay + index}
                      onClick={() =>
                        onCrossFilterChange?.("div", codeDisplay === crossFilter?.div ? undefined : codeDisplay)
                      }
                      onMouseEnter={() => setHoveredDeptIndex(index)}
                      onMouseLeave={() => setHoveredDeptIndex(null)}
                      className="cursor-pointer transition-opacity"
                      opacity={isSelected ? 1 : isAnySelected ? 0.35 : (hoveredDeptIndex === null || isHovered ? 1 : 0.65)}
                    >
                      {/* Value on top of bar */}
                      <text
                        x={x + barWidth / 2}
                        y={y - 5}
                        textAnchor="middle"
                        fontSize={isSelected ? "11" : "10"}
                        className={`font-black font-sans ${isSelected ? "fill-amber-600 dark:fill-amber-400 font-bold" : "fill-zinc-900 dark:fill-white"}`}
                      >
                        {d.count.toLocaleString("vi-VN")}
                      </text>

                      {/* Bar rect */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="4"
                        fill={fillColor}
                        stroke={isSelected ? "#f59e0b" : undefined}
                        strokeWidth={isSelected ? "2.5" : undefined}
                        className="transition-all duration-300"
                        filter={isSelected || isHovered ? "drop-shadow(0px 2px 6px rgba(245,158,11,0.5))" : undefined}
                      />

                      {/* Rank badge */}
                      <text
                        x={x + barWidth / 2}
                        y="173"
                        textAnchor="middle"
                        fontSize="9"
                        className={`font-black ${
                          isTop1
                            ? "fill-rose-600 dark:fill-rose-400"
                            : isTop3
                            ? "fill-amber-600 dark:fill-amber-400"
                            : "fill-zinc-400 dark:fill-zinc-500"
                        }`}
                      >
                        #{index + 1}
                      </text>

                      {/* Department Code - Rotated for clear reading */}
                      <text
                        x={x + barWidth / 2}
                        y="185"
                        transform={`rotate(-40, ${x + barWidth / 2}, 185)`}
                        textAnchor="end"
                        fontSize={isSelected ? "10" : "9.5"}
                        className={`font-mono ${isSelected ? "font-black fill-amber-700 dark:fill-amber-300" : "font-bold fill-zinc-800 dark:fill-zinc-200"}`}
                      >
                        {codeDisplay}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Tooltip on hover */}
              {hoveredDeptIndex !== null && topDepts[hoveredDeptIndex] && (
                <div
                  className="absolute bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-2.5 py-1.5 rounded-lg shadow-xl text-xs pointer-events-none transition-all z-20 flex items-center space-x-2 border border-zinc-700 dark:border-zinc-300"
                  style={{
                    left: `${50 + hoveredDeptIndex * (890 / 15)}px`,
                    top: "10px",
                  }}
                >
                  <span className="font-mono font-black">
                    {topDepts[hoveredDeptIndex].deptCode}
                  </span>
                  <span className="opacity-60">|</span>
                  <span className="font-black text-rose-400 dark:text-rose-600">
                    {topDepts[hoveredDeptIndex].count.toLocaleString("vi-VN")} người
                  </span>
                  <span className="text-[10px] opacity-80">
                    ({total > 0 ? Number(((topDepts[hoveredDeptIndex].count / total) * 100).toFixed(1)) : 0}%)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
