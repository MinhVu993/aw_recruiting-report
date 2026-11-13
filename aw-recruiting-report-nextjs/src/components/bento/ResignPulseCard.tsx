"use client";

import React from "react";
import Link from "next/link";
import { UserMinus, ArrowUpRight, TrendingDown } from "lucide-react";

export const ResignPulseCard: React.FC = () => {
  return (
    <div className="bento-card col-span-12 md:col-span-6 lg:col-span-4 lg:row-span-3 min-h-0 flex flex-col justify-between overflow-hidden p-3 lg:p-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <UserMinus className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight leading-none">Biến Động Thôi Việc</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Tỷ lệ nghỉ việc & Nguyên nhân</p>
          </div>
        </div>

        <Link
          href="/resign"
          aria-label="Xem chi tiết biến động thôi việc"
          className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 active:scale-[0.97]"
          title="Xem chi tiết"
        >
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* Metric & Sparkline */}
      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-2.5 my-1">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-medium">Tỷ lệ thôi việc tháng</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5 tabular-nums">
              <span className="text-xl font-extrabold text-white tracking-tight">3.5%</span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                <TrendingDown className="w-2.5 h-2.5" aria-hidden="true" /> Giảm 0.4%
              </span>
            </div>
          </div>

          {/* Mini SVG Trend Line */}
          <div className="w-20 h-7">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
              <path
                d="M 0 32 Q 25 20, 50 25 T 100 12"
                fill="none"
                stroke="#F43F5E"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="100" cy="12" r="3" fill="#F43F5E" />
            </svg>
          </div>
        </div>
      </div>

      {/* Top Reasons Breakdown */}
      <div className="space-y-1 my-1 text-[11px] flex-1 flex flex-col justify-center">
        <div className="space-y-1">
          <div>
            <div className="flex items-center justify-between text-slate-300 text-[10px]">
              <span className="truncate">1. Việc gia đình / Con nhỏ</span>
              <span className="font-bold text-rose-400">42%</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
              <div className="bg-rose-500 h-full rounded-full" style={{ width: "42%" }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-slate-300 text-[10px]">
              <span className="truncate">2. Tìm việc gần nhà</span>
              <span className="font-bold text-amber-400">28%</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: "28%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 leading-none">
        <span>Thôi việc: 25</span>
        <span className="text-slate-300 font-semibold">Tăng trưởng: +687</span>
      </div>
    </div>
  );
};
