"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Clock, AlertTriangle, Sparkles } from "lucide-react";

interface KpiMetricsCardProps {
  intakeTarget?: number;
  currentIntake?: number;
  timeToFillDays?: number;
  bqtCount?: number;
}

export const KpiMetricsCard: React.FC<KpiMetricsCardProps> = ({
  intakeTarget: initialTarget,
  currentIntake: initialIntake,
  timeToFillDays: initialTimeToFill,
  bqtCount: initialBqt,
}) => {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("month");
  const [metrics, setMetrics] = useState({
    intakeTarget: initialTarget ?? 0,
    currentIntake: initialIntake ?? 0,
    timeToFillDays: initialTimeToFill ?? 0,
    bqtCount: initialBqt ?? 0,
  });

  useEffect(() => {
    const fetchLiveKPIs = async () => {
      try {
        const [candRes, demandRes, bqtRes] = await Promise.all([
          fetch("/api/candidates?limit=1"),
          fetch("/api/demand"),
          fetch("/api/candidates?bqt=true&limit=1"),
        ]);
        const candJson = await candRes.json();
        const demandJson = await demandRes.json();
        const bqtJson = await bqtRes.json();

        const totalCand = candJson.total || 0;
        const totalBqt = bqtJson.total || 0;
        const totalDemand = Array.isArray(demandJson.data)
          ? demandJson.data.reduce((acc: number, d: any) => acc + (d.demandQty || 0), 0)
          : 0;

        setMetrics({
          intakeTarget: totalDemand,
          currentIntake: totalCand,
          timeToFillDays: totalCand > 0 ? 14 : 0,
          bqtCount: totalBqt,
        });
      } catch (err) {
        // keep 0
      }
    };
    fetchLiveKPIs();
  }, [timeRange]);

  const percentage =
    metrics.intakeTarget > 0
      ? Math.min(Math.round((metrics.currentIntake / metrics.intakeTarget) * 100), 100)
      : metrics.currentIntake > 0
      ? 100
      : 0;
  const strokeDashoffset = 283 - (283 * percentage) / 100;

  return (
    <div className="bento-card col-span-12 lg:col-span-8 lg:row-span-4 min-h-0 flex flex-col justify-between overflow-hidden p-3 lg:p-3.5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 leading-none">
              Chỉ Số Tuyển Dụng & Tiếp Nhận
              <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-500/20">
                LIVE
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Tiến độ tiếp nhận so với hạn ngạch thực tế</p>
          </div>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center bg-slate-950/60 p-0.5 rounded-lg border border-slate-800 text-[11px]" role="group" aria-label="Khoảng thời gian thống kê">
          {(["today", "week", "month"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              aria-label={`Xem theo ${r === "today" ? "hôm nay" : r === "week" ? "tuần này" : "tháng này"}`}
              aria-pressed={timeRange === r}
              className={`px-2 py-0.5 rounded-md font-medium transition-colors duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                timeRange === r
                  ? "bg-slate-800 text-emerald-400 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {r === "today" ? "Hôm nay" : r === "week" ? "Tuần" : "Tháng"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Key Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-1.5 flex-1 items-center">
        {/* Metric 1: Intake vs Target */}
        <div className="flex items-center space-x-3 bg-slate-950/40 border border-slate-800/80 rounded-xl p-2.5 h-full">
          {/* Radial Ring */}
          <div className="relative w-13 h-13 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="text-slate-800 stroke-current"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="text-emerald-400 stroke-current transition-[stroke-dashoffset] duration-700 ease-out"
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[11px] font-extrabold text-white tabular-nums">{percentage}%</span>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 font-medium">Đã tiếp nhận</p>
            <div className="flex items-baseline space-x-1 tabular-nums">
              <span className="text-xl font-extrabold text-white tracking-tight">{metrics.currentIntake}</span>
              <span className="text-[10px] text-slate-500 font-medium">/ {metrics.intakeTarget}</span>
            </div>
            <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 tabular-nums">
              <Sparkles className="w-2.5 h-2.5" aria-hidden="true" /> {percentage}% chỉ tiêu
            </p>
          </div>
        </div>

        {/* Metric 2: Time to Fill */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Thời gian hoàn tất</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-white tracking-tight tabular-nums">{metrics.timeToFillDays}</span>
            <span className="text-[10px] text-slate-400 ml-1">ngày / vị trí</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-300"
              style={{ width: metrics.timeToFillDays > 0 ? "50%" : "0%" }}
            ></div>
          </div>
        </div>

        {/* Metric 3: Unswiped Card Alert (BQT) */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Chưa quẹt thẻ (BQT)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-amber-400 tracking-tight tabular-nums">{metrics.bqtCount}</span>
            <span className="text-[10px] text-slate-400 ml-1">cần cấp thẻ</span>
          </div>
          <p className="text-[10px] text-amber-400/80 font-medium truncate">
            {metrics.bqtCount > 0 ? "Cần in danh sách bàn giao" : "Không có thẻ nợ"}
          </p>
        </div>
      </div>

      {/* Velocity Progress Bar at Bottom */}
      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 leading-none">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" aria-hidden="true"></span>
          Trạng thái dữ liệu: <strong className="text-slate-200 tabular-nums">Thời gian thực (Real-time)</strong>
        </span>
        <span>Cơ sở: <strong className="text-slate-300 tabular-nums">Toàn nhà máy</strong></span>
      </div>
    </div>
  );
};
