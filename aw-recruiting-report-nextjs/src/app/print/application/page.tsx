"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Template5 from "@/app/template-print/components/Template5";

function ApplicationContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") || searchParams.get("id") || "";
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idsParam) {
      setCandidates([
        {
          candidate_name: "",
          emp_id: "",
          regTel: "",
          regAddress: "",
          key_in_date: new Date().toISOString().split("T")[0],
        },
      ]);
      return;
    }

    const fetchCand = async () => {
      setLoading(true);
      try {
        const idList = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
        const resList = await Promise.all(
          idList.map(async (id) => {
            const r = await fetch(`/api/aw-recuitingReport/getDataById/${id}`);
            return r.ok ? await r.json() : null;
          })
        );
        setCandidates(resList.filter(Boolean));
      } catch {
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCand();
  }, [idsParam]);

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
          className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm inline-flex items-center space-x-2 transition-all active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>In Đơn Xin Việc (A4)</span>
        </button>
      </div>

      <div
        className="max-w-5xl mx-auto bg-white text-black p-6 sm:p-10 rounded-xl shadow-lg print:shadow-none print:p-0"
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
      >
        {loading ? (
          <div className="py-20 text-center font-sans text-sm text-zinc-500">
            Đang tải dữ liệu hồ sơ...
          </div>
        ) : (
          <Template5 candidates={candidates} />
        )}
      </div>
    </div>
  );
}

export default function PrintApplicationPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center font-sans text-sm text-zinc-500">
          Đang tải dữ liệu hồ sơ...
        </div>
      }
    >
      <ApplicationContent />
    </Suspense>
  );
}
