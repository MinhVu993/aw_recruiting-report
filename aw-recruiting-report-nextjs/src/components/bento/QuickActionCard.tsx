"use client";

import React from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Printer,
  Download,
  Settings,
  FileCheck,
  ChevronRight,
} from "lucide-react";

export const QuickActionCard: React.FC = () => {
  const handleExportAll = () => {
    window.location.href = "/api/candidates/export?type=all";
  };

  const handleExportHrm = () => {
    window.location.href = "/api/candidates/export?type=hrm";
  };

  return (
    <div className="bento-card col-span-12 md:col-span-12 lg:col-span-4 lg:row-span-3 min-h-0 flex flex-col justify-between overflow-hidden p-3 lg:p-3.5">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Settings className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight leading-none">Tiện Ích & Mẫu In</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Xuất dữ liệu & Thao tác tức thì</p>
        </div>
      </div>

      {/* Grid of Action Buttons */}
      <div className="grid grid-cols-2 gap-2 my-1 flex-1 items-center">
        {/* Export All Excel */}
        <button
          onClick={handleExportAll}
          aria-label="Xuất file Excel dữ liệu thô"
          className="flex flex-col items-start p-2 rounded-xl bg-zinc-100/80 dark:bg-slate-950/50 hover:bg-zinc-200/80 dark:hover:bg-slate-900 border border-zinc-200 dark:border-slate-800 hover:border-emerald-500/40 transition-[background-color,border-color,transform] duration-150 active:scale-[0.97] group text-left h-full justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 mb-1 group-hover:scale-110 transition-transform duration-150 ease-out">
            <FileSpreadsheet className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span className="text-[11px] font-bold text-zinc-900 dark:text-slate-200 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors duration-150 leading-tight">
            Xuất File Excel
          </span>
          <span className="text-[9px] text-zinc-500 dark:text-slate-500">Dữ liệu thô</span>
        </button>

        {/* Export HRM */}
        <button
          onClick={handleExportHrm}
          aria-label="Xuất file mẫu HRM nạp nhân sự"
          className="flex flex-col items-start p-2 rounded-xl bg-zinc-100/80 dark:bg-slate-950/50 hover:bg-zinc-200/80 dark:hover:bg-slate-900 border border-zinc-200 dark:border-slate-800 hover:border-cyan-500/40 transition-[background-color,border-color,transform] duration-150 active:scale-[0.97] group text-left h-full justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
        >
          <div className="p-1 rounded-md bg-cyan-500/10 text-cyan-400 mb-1 group-hover:scale-110 transition-transform duration-150 ease-out">
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span className="text-[11px] font-bold text-zinc-900 dark:text-slate-200 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors duration-150 leading-tight">
            Xuất Mẫu HRM
          </span>
          <span className="text-[9px] text-zinc-500 dark:text-slate-500">Mẫu nạp nhân sự</span>
        </button>

        {/* Print BQT */}
        <Link
          href="/print/bqt"
          aria-label="In danh sách BQT thẻ chưa quẹt"
          className="flex flex-col items-start p-2 rounded-xl bg-zinc-100/80 dark:bg-slate-950/50 hover:bg-zinc-200/80 dark:hover:bg-slate-900 border border-zinc-200 dark:border-slate-800 hover:border-amber-500/40 transition-[background-color,border-color,transform] duration-150 active:scale-[0.97] group h-full justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
        >
          <div className="p-1 rounded-md bg-amber-500/10 text-amber-400 mb-1 group-hover:scale-110 transition-transform duration-150 ease-out">
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span className="text-[11px] font-bold text-zinc-900 dark:text-slate-200 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors duration-150 leading-tight">
            In Danh Sách BQT
          </span>
          <span className="text-[9px] text-zinc-500 dark:text-slate-500">Thẻ chưa quẹt</span>
        </Link>

        {/* Print Hires */}
        <Link
          href="/print/hires"
          aria-label="In danh sách nhân sự Tuyển dụng"
          className="flex flex-col items-start p-2 rounded-xl bg-zinc-100/80 dark:bg-slate-950/50 hover:bg-zinc-200/80 dark:hover:bg-slate-900 border border-zinc-200 dark:border-slate-800 hover:border-indigo-500/40 transition-[background-color,border-color,transform] duration-150 active:scale-[0.97] group h-full justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        >
          <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-400 mb-1 group-hover:scale-110 transition-transform duration-150 ease-out">
            <FileCheck className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span className="text-[11px] font-bold text-zinc-900 dark:text-slate-200 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-150 leading-tight">
            In DS Tuyển dụng
          </span>
          <span className="text-[9px] text-zinc-500 dark:text-slate-500">Hires danh sách</span>
        </Link>
      </div>

      {/* Footer Link */}
      <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 leading-none">
        <Link
          href="/print"
          className="text-emerald-400 font-bold hover:underline flex items-center gap-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 rounded"
        >
          <span>Trung Tâm Mẫu In A4</span>
          <ChevronRight className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};
