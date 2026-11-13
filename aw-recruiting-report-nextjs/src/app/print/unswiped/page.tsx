"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Printer, ArrowLeft, Calendar, RefreshCw, AlertCircle } from "lucide-react";

interface UnswipedRecord {
  newEmpno: string | null;
  candidate_name: string | null;
  tmp_departid: string | null;
  tmp_dutyid: string | null;
  name: unknown;
  duty_name: string | null;
}

function parseDeptName(raw: unknown): string {
  if (!raw) return "-";
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed.vi || parsed.en || parsed.cn || raw;
    } catch {
      return raw;
    }
  }
  if (typeof raw === "object") {
    const obj = raw as Record<string, string>;
    return obj.vi || obj.en || obj.cn || "-";
  }
  return String(raw);
}

function UnswipedPrintContent() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date") || new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState<string>(dateParam);
  const [data, setData] = useState<UnswipedRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (targetDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/print/unswiped?date=${encodeURIComponent(targetDate)}`);
      const json = await res.json();
      if (Array.isArray(json)) {
        setData(json);
      } else if (json.data && Array.isArray(json.data)) {
        setData(json.data);
      } else {
        setData([]);
        if (json.error || json.message) {
          setError(json.error || json.message);
        }
      }
    } catch (err: any) {
      setError(err?.message || "Lỗi tải dữ liệu");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(date);
  }, [date]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const formattedDate = () => {
    if (!date) return "";
    const parts = date.split("-");
    if (parts.length === 3) {
      return `Ngày ${parts[2]} Tháng ${parts[1]} Năm ${parts[0]}`;
    }
    return date;
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-4 sm:p-6 print:p-0 print:bg-white text-zinc-900 dark:text-zinc-100">
      {/* Non-print control bar */}
      <div className="no-print max-w-5xl mx-auto mb-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/print"
            className="h-8 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Mục lục in</span>
          </Link>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-500" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-8 px-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-100"
            />
          </div>

          <button
            onClick={() => fetchData(date)}
            disabled={loading}
            className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors disabled:opacity-50"
            title="Tải lại"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-rose-600" : ""}`} />
          </button>
        </div>

        <button
          onClick={handlePrint}
          className="h-8 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm inline-flex items-center space-x-2 transition-all active:scale-95 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>In Danh Sách (A4)</span>
        </button>
      </div>

      {/* Printable ISO A4 Container */}
      <div
        className="max-w-[210mm] mx-auto bg-white text-black p-8 sm:p-12 shadow-lg print:shadow-none print:p-0 print:max-w-none print:w-full"
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
      >
        {/* Header */}
        <div className="border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-sm uppercase tracking-wide">CÔNG TY TNHH VẢI KHÔNG DỆT ALL WELL</p>
              <p className="text-xs">Phòng Nhân Sự - HR Department</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono border border-black px-2 py-0.5">
                AW-HR-UNSWIPED
              </span>
            </div>
          </div>

          <div className="text-center mt-4">
            <h1 className="text-xl font-bold uppercase tracking-wider">
              DANH SÁCH NHÂN VIÊN CHƯA QUẸT THẺ
            </h1>
            <p className="text-sm italic mt-1">{formattedDate()}</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-50 text-red-700 border border-red-200 text-xs rounded no-print flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Data Table */}
        <table className="w-full text-xs border-collapse border border-black">
          <thead>
            <tr className="bg-gray-100 print:bg-transparent text-center font-bold">
              <th className="border border-black p-2 w-10">STT</th>
              <th className="border border-black p-2 w-28">Mã Thẻ (Emp No)</th>
              <th className="border border-black p-2">Họ Và Tên</th>
              <th className="border border-black p-2 w-32">Bộ Phận</th>
              <th className="border border-black p-2 w-32">Chức Vụ</th>
              <th className="border border-black p-2 w-24">Ghi Chú</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="border border-black p-6 text-center italic text-gray-500">
                  Đang nạp dữ liệu...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="border border-black p-6 text-center italic text-gray-500">
                  Không có nhân viên nào chưa quẹt thẻ trong ngày {date}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={`${row.newEmpno}-${idx}`} className="text-center">
                  <td className="border border-black p-1.5">{idx + 1}</td>
                  <td className="border border-black p-1.5 font-bold font-mono">
                    {row.newEmpno || "-"}
                  </td>
                  <td className="border border-black p-1.5 text-left font-medium px-2">
                    {row.candidate_name || "-"}
                  </td>
                  <td className="border border-black p-1.5 text-left px-2">
                    {parseDeptName(row.name)}
                  </td>
                  <td className="border border-black p-1.5 text-left px-2">
                    {row.duty_name || row.tmp_dutyid || "-"}
                  </td>
                  <td className="border border-black p-1.5"></td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Total summary & signatures */}
        <div className="mt-4 flex justify-between items-center text-xs font-semibold">
          <p>Tổng số: {data.length} người</p>
        </div>

        <div className="mt-8 grid grid-cols-3 text-center text-xs gap-4 pt-4">
          <div>
            <p className="font-bold">Người Lập Biểu</p>
            <p className="text-[10px] italic mt-0.5">(Ký và ghi rõ họ tên)</p>
            <div className="h-16"></div>
          </div>
          <div>
            <p className="font-bold">Xác Nhận Bộ Phận</p>
            <p className="text-[10px] italic mt-0.5">(Ký và ghi rõ họ tên)</p>
            <div className="h-16"></div>
          </div>
          <div>
            <p className="font-bold">Phê Duyệt Nhân Sự</p>
            <p className="text-[10px] italic mt-0.5">(Ký và đóng dấu)</p>
            <div className="h-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PrintUnswipedPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Đang tải biểu mẫu...</div>}>
      <UnswipedPrintContent />
    </Suspense>
  );
}
