"use client";

import React from "react";
import { PieChart, Users2, Briefcase } from "lucide-react";

interface DistributionItem {
  name: string;
  count: number;
  percentage: number;
}

interface DemographicsDonutChartProps {
  positions: DistributionItem[];
  genders: DistributionItem[];
  loading: boolean;
}

export const DemographicsDonutChart: React.FC<DemographicsDonutChartProps> = ({
  positions,
  genders,
  loading,
}) => {
  const posColors = [
    { bg: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
    { bg: "bg-sky-500", text: "text-sky-600 dark:text-sky-400" },
    { bg: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
    { bg: "bg-purple-500", text: "text-purple-600 dark:text-purple-400" },
  ];

  return (
    <div className="bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-lg p-3 flex flex-col justify-between shadow-2xs h-full min-h-[290px] transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide leading-tight">
              Cơ Cấu Nhân Lực Tuyển
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Vị trí chức danh & Giới tính</p>
          </div>
        </div>
      </div>

      {/* Body: Two Mini Distribution Sections */}
      <div className="flex-1 my-2 flex flex-col justify-between space-y-3">
        {/* Section 1: By Position */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-slate-400" /> Vị Trí Tuyển
            </span>
          </div>

          {/* Segmented Bar for Position */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
            {positions.map((p, i) => (
              <div
                key={p.name}
                className={`${posColors[i % posColors.length].bg} h-full transition-all duration-500`}
                style={{ width: `${p.percentage}%` }}
                title={`${p.name}: ${p.percentage}% (${p.count})`}
              />
            ))}
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            {positions.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between pr-1">
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 truncate max-w-[90px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${posColors[i % posColors.length].bg}`} />
                  <span className="truncate">{p.name}</span>
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {p.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: By Gender */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <Users2 className="w-3 h-3 text-slate-400" /> Tỷ Lệ Giới Tính
            </span>
          </div>

          {/* Segmented Bar for Gender */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
            <div
              className="bg-rose-500 h-full transition-all duration-500"
              style={{ width: `${genders.find((g) => g.name === "Nữ")?.percentage || 50}%` }}
              title={`Nữ: ${genders.find((g) => g.name === "Nữ")?.percentage || 50}%`}
            />
            <div
              className="bg-sky-500 h-full transition-all duration-500"
              style={{ width: `${genders.find((g) => g.name === "Nam")?.percentage || 50}%` }}
              title={`Nam: ${genders.find((g) => g.name === "Nam")?.percentage || 50}%`}
            />
          </div>

          {/* Gender Legend */}
          <div className="flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Nữ:{" "}
              {genders.find((g) => g.name === "Nữ")?.percentage || 0}%
            </span>
            <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Nam:{" "}
              {genders.find((g) => g.name === "Nam")?.percentage || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Tỷ trọng công nhân xưởng</span>
        <span className="font-extrabold text-slate-900 dark:text-white">
          {positions.find((p) => p.name === "Công nhân")?.percentage || 88}%
        </span>
      </div>
    </div>
  );
};
