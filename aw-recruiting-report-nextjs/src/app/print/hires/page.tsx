"use client";

import React from "react";
import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";
import { useSession } from "@/context/SessionContext";
import TemplateHires from "@/app/template-print/components/TemplateHires";

export default function PrintHiresPage() {
  const { selectedFactory } = useSession();

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-4 sm:p-6 print:p-0 print:bg-white text-zinc-900 dark:text-zinc-100">
      <div className="no-print max-w-5xl mx-auto mb-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-md flex items-center justify-between">
        <Link
          href="/candidates"
          className="h-8 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về Danh Sách Ứng Viên</span>
        </Link>

        <button
          onClick={handlePrint}
          className="h-8 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm inline-flex items-center space-x-2 transition-all active:scale-95 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>In Bảng Theo Dõi Tuyển Dụng</span>
        </button>
      </div>

      <div
        className="max-w-5xl mx-auto bg-white text-black p-6 sm:p-10 rounded-xl shadow-lg print:shadow-none print:p-0"
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
      >
        <TemplateHires loc={selectedFactory} blank={true} />
      </div>
    </div>
  );
}
