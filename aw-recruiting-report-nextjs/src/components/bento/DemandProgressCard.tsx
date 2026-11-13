"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Target, ArrowUpRight } from "lucide-react";

interface DeptDemand {
  id?: number;
  dept: string;
  recruitedQty?: number;
  demandQty?: number;
  loc: string;
}

export const DemandProgressCard: React.FC = () => {
  const [demands, setDemands] = useState<DeptDemand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDemands = async () => {
      try {
        const res = await fetch("/api/demand");
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setDemands(json.data);
        } else {
          setDemands([]);
        }
      } catch (e) {
        setDemands([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDemands();
  }, []);

  const totalDemand = demands.reduce((acc, d) => acc + (d.demandQty || 0), 0);
  const totalRecruited = demands.reduce((acc, d) => acc + (d.recruitedQty || 0), 0);
  const totalPct = totalDemand > 0 ? Math.min(Math.round((totalRecruited / totalDemand) * 100), 100) : 0;

  return (
    <div className="bento-card col-span-12 md:col-span-6 lg:col-span-4 lg:row-span-3 min-h-0 flex flex-col justify-between overflow-hidden p-3 lg:p-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Target className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight leading-none">Nhu Cầu Theo Bp. duyệt</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Tiến độ đáp ứng chỉ tiêu tuyển</p>
          </div>
        </div>

        <Link
          href="/demand"
          aria-label="Xem chi tiết nhu cầu theo Bp. duyệt"
          className="p-1 rounded-md text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 active:scale-[0.97]"
          title="Xem chi tiết"
        >
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* List of Department Progress */}
      <div className="space-y-2 my-1.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {loading ? (
          <div className="py-6 text-center text-slate-400 text-xs">Đang tải nhu cầu...</div>
        ) : demands.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            Chưa có dữ liệu nhu cầu tuyển dụng
          </div>
        ) : (
          demands.map((d, idx) => {
            const target = d.demandQty || 0;
            const recruited = d.recruitedQty || 0;
            const pct = target > 0 ? Math.min(Math.round((recruited / target) * 100), 100) : 0;
            const gap = target - recruited;

            return (
              <div key={idx} className="space-y-0.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-200 truncate max-w-[140px]">
                    {d.dept}{" "}
                    <span className="text-[9px] text-slate-500 font-bold uppercase">
                      ({d.loc})
                    </span>
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    <strong className="text-white">{recruited}</strong>/{target}{" "}
                    <span className="text-sky-400 font-bold">({pct}%)</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-[width] duration-300 ease-out ${
                      pct >= 90
                        ? "bg-emerald-400"
                        : pct >= 70
                        ? "bg-sky-400"
                        : "bg-amber-400"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-end text-[9px] text-slate-500">
                  {gap > 0 ? (
                    <span>Thiếu: <strong className="text-rose-400">{gap}</strong></span>
                  ) : (
                    <span className="text-emerald-400 font-bold">Đạt chỉ tiêu</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 leading-none">
        <span>Tổng: {totalDemand} chỉ tiêu</span>
        <span className="text-sky-400 font-bold">Đáp ứng {totalPct}%</span>
      </div>
    </div>
  );
};
