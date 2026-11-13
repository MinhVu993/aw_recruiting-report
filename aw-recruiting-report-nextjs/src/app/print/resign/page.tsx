"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";

interface ResignPrintItem {
  id?: number;
  er_empid: string;
  er_name: string;
  er_deptid?: string;
  er_deptname?: string;
  er_joblevel?: string;
  er_indate?: string;
  er_resigndate?: string;
  er_numberid?: string;
  er_reason?: string;
  er_type_resign?: string;
  photoUrl?: string;
  [key: string]: any;
}

function formatDate(val?: string) {
  if (!val) return "-";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return val;
  }
}

function ResignPrintContent() {
  const searchParams = useSearchParams();
  const printKey = searchParams.get("key");

  const [resignData, setResignData] = useState<ResignPrintItem[]>([]);
  const [dateRange, setDateRange] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        let stored = printKey
          ? localStorage.getItem(printKey) || sessionStorage.getItem(printKey)
          : null;

        if (!stored) {
          stored = localStorage.getItem("latest-resign-print-data") || sessionStorage.getItem("latest-resign-print-data");
        }

        if (stored) {
          const parsed = JSON.parse(stored);
          const list = Array.isArray(parsed.data) ? parsed.data : [];
          setResignData(list);
          setDateRange(parsed.dateRange || "");

          if (list.length > 0 && printKey) {
            const timer = setTimeout(() => {
              if (typeof window !== "undefined") {
                window.print();
              }
            }, 600);
            return () => clearTimeout(timer);
          }
        } else {
          // If navigated directly without cache, fetch latest batch from API
          const res = await fetch("/api/resign?limit=50");
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            setResignData(json.data);
            setDateRange("Gần đây / 最近");
          }
        }
      } catch (e) {
        console.error("Lỗi đọc dữ liệu in:", e);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, [printKey]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#eaedf0] dark:bg-[#121214] print:bg-white text-black p-3 sm:p-6 print:p-0">
      {/* Top Floating Control Bar (Hidden on print) */}
      <div className="no-print max-w-5xl mx-auto mb-4 flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-lg text-white">
        <div className="flex items-center space-x-3">
          <Link
            href="/resign"
            className="h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white inline-flex items-center space-x-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay Lại Thôi Việc</span>
          </Link>
          <div className="h-4 w-px bg-slate-700 hidden sm:block" />
          <span className="text-xs text-slate-300">
            Số lượng: <strong className="text-rose-400 font-bold">{resignData.length}</strong> nhân viên
            {dateRange && <span className="ml-1 text-slate-400 font-mono">({dateRange})</span>}
          </span>
        </div>

        <button
          onClick={handlePrint}
          className="h-8 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md inline-flex items-center space-x-1.5 transition-all active:scale-[0.97] cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>In Danh Sách (A4)</span>
        </button>
      </div>

      {/* Printable Sheet (Fidelity to legacy pages/template-print/resign.vue) */}
      <div
        className="max-w-5xl mx-auto bg-white p-6 sm:p-10 print:p-0 shadow-2xl print:shadow-none print:max-w-none text-black"
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
      >
        {resignData.length === 0 && isLoaded ? (
          <div className="text-center py-12 text-slate-500 font-sans space-y-2">
            <p className="font-bold text-base">Không có dữ liệu in!</p>
            <p className="text-xs">Vui lòng quay lại trang Quản lý Thôi việc và chọn &quot;In Danh Sách&quot;.</p>
            <Link
              href="/resign"
              className="inline-block mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
            >
              Về Trang Thôi Việc
            </Link>
          </div>
        ) : (
          <div className="print-area">
            {/* Header ISO Table */}
            <table className="w-full border-collapse border border-black text-center text-xs mb-0">
              <tbody>
                <tr>
                  <td rowSpan={2} className="border border-black p-2 align-middle w-[15%]">
                    <img
                      src="/logo.png"
                      alt="Company Logo"
                      className="max-w-[75px] max-h-[50px] mx-auto object-contain"
                    />
                  </td>
                  <td rowSpan={3} className="border border-black p-3 align-middle font-bold text-base leading-snug w-[55%]">
                    <span className="text-[17px] font-bold block tracking-wide">
                      DANH SÁCH CÔNG NHÂN VIÊN THÔI VIỆC
                    </span>
                    <span className="text-[15px] font-normal font-['Kaiti','SimSun','宋体',serif] block mt-1">
                      員工離職名單
                    </span>
                  </td>
                  <td className="border border-black p-1.5 text-center text-[11px] leading-tight w-[16%]">
                    Ngày thiết lập (sửa đổi) <br />
                    <span className="font-['Kaiti','SimSun','宋体',serif]">(修)訂日期</span>
                  </td>
                  <td className="border border-black p-1.5 text-center font-bold text-xs w-[14%]">
                    22.10.2025
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 text-center text-[11px] leading-tight">
                    Mã số tài liệu <br />
                    <span className="font-['Kaiti','SimSun','宋体',serif]">文件編號</span>
                  </td>
                  <td className="border border-black p-1.5 text-center font-bold text-xs">
                    ADHR02-SP008-02
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 align-middle text-[11px] leading-tight">
                    Bộ phận soạn thảo <br />
                    <span className="font-['Kaiti','SimSun','宋体',serif]">編訂部門</span> <br />
                    <span className="whitespace-nowrap">Tài Nguyên Nhân Lực</span> <br />
                    <span className="font-['Kaiti','SimSun','宋体',serif]">人力資源部</span>
                  </td>
                  <td className="border border-black p-1.5 text-center text-[11px] leading-tight">
                    Phiên bản <span className="font-['Kaiti','SimSun','宋体',serif]">版本</span>: <strong className="font-bold">4</strong>
                  </td>
                  <td className="border border-black p-1.5 text-center text-[11px] leading-tight">
                    Trang <span className="font-['Kaiti','SimSun','宋体',serif]">頁次</span>: <strong className="font-bold">1/1</strong>
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="border border-black px-3 py-1.5 text-left font-bold text-xs">
                    Từ/從: <span className="font-normal font-mono">{dateRange || "Tất cả / 全部"}</span>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Main Resignation Data Table */}
            <table className="w-full border-collapse border border-black border-t-0 text-center text-[11px] mb-0">
              <thead>
                <tr className="bg-transparent font-bold">
                  <th className="border border-black border-t-0 p-1.5 w-9">
                    STT <br />
                    <span className="font-normal font-['Kaiti','SimSun','宋体',serif]">序號</span>
                  </th>
                  <th className="border border-black border-t-0 p-1.5 w-16">
                    Số thẻ <br />
                    <span className="font-normal font-['Kaiti','SimSun','宋体',serif]">工號</span>
                  </th>
                  <th className="border border-black border-t-0 p-1.5 min-w-[120px] text-left">
                    Họ và tên <br />
                    <span className="font-normal font-['Kaiti','SimSun','宋体',serif]">姓名</span>
                  </th>
                  <th className="border border-black border-t-0 p-1.5 text-left min-w-[120px]">
                    BỘ PHẬN <br />
                    <span className="font-normal font-['Kaiti','SimSun','宋体',serif]">部門</span>
                  </th>
                  <th className="border border-black border-t-0 p-1.5 min-w-[110px] text-left">
                    LÝ DO <br />
                    <span className="font-normal font-['Kaiti','SimSun','宋体',serif]">離職原因</span>
                  </th>
                  <th className="border border-black border-t-0 p-1.5 min-w-[85px]">
                    LOẠI NGHỈ <br />
                    <span className="font-normal font-['Kaiti','SimSun','宋体',serif]">離職種類</span>
                  </th>
                  <th className="border border-black border-t-0 p-1.5 w-20">
                    NGÀY VÀO <br />
                    <span className="font-normal font-['Kaiti','SimSun','宋体',serif]">進廠日期</span>
                  </th>
                  <th className="border border-black border-t-0 p-1.5 w-20">
                    NGÀY THÔI VIỆC <br />
                    <span className="font-normal font-['Kaiti','SimSun','宋体',serif]">離職日期</span>
                  </th>
                  <th className="border border-black border-t-0 p-1.5 w-24">
                    SỐ CCCD <br />
                    <span className="font-normal font-['Kaiti','SimSun','宋体',serif]">身分證號碼</span>
                  </th>
                  <th className="border border-black border-t-0 p-1.5 w-16">
                    HÌNH <br />
                    <span className="font-normal font-['Kaiti','SimSun','宋体',serif]">相片</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {resignData.map((item, index) => {
                  return (
                    <tr key={item.id || index} className="break-inside-avoid">
                      <td className="border border-black p-1.5 text-center tabular-nums">
                        {index + 1}
                      </td>
                      <td className="border border-black p-1.5 text-center font-bold tabular-nums">
                        {item.er_empid}
                      </td>
                      <td className="border border-black p-1.5 text-left font-bold uppercase">
                        {item.er_name}
                      </td>
                      <td className="border border-black p-1.5 text-left">
                        {item.er_deptname || item.er_deptid || "-"}
                      </td>
                      <td className="border border-black p-1.5 text-left">
                        {item.er_reason || "-"}
                      </td>
                      <td className="border border-black p-1.5 text-center">
                        {item.er_type_resign || "-"}
                      </td>
                      <td className="border border-black p-1.5 text-center tabular-nums">
                        {formatDate(item.er_indate)}
                      </td>
                      <td className="border border-black p-1.5 text-center tabular-nums font-semibold">
                        {formatDate(item.er_resigndate)}
                      </td>
                      <td className="border border-black p-1.5 text-center tabular-nums font-mono text-[10px]">
                        {item.er_numberid || "-"}
                      </td>
                      <td className="border border-black p-1 text-center align-middle">
                        {item.photoUrl ? (
                          <img
                            src={item.photoUrl}
                            alt="Photo"
                            className="max-w-[45px] max-h-[55px] mx-auto object-cover rounded-xs"
                          />
                        ) : (
                          <span className="text-[10px] text-gray-500 italic">No photo</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Signature Footer Table */}
            <table className="w-full mt-5 border-collapse text-center text-xs break-inside-avoid">
              <tbody>
                <tr className="font-bold">
                  <td className="w-1/3 p-2">
                    Chủ quản BP Tài Nguyên Nhân Lực <br />
                    <span className="font-normal font-['Kaiti','SimSun','宋体',serif]">人力資源部</span>
                  </td>
                  <td className="w-1/3 p-2">
                    Trưởng nhóm ER <br />
                    <span className="font-normal font-['Kaiti','SimSun','宋体',serif]">ER組長</span>
                  </td>
                  <td className="w-1/3 p-2">
                    Người lập biểu <br />
                    <span className="font-normal font-['Kaiti','SimSun','宋体',serif]">填表人</span>
                  </td>
                </tr>
                <tr>
                  <td className="h-28"></td>
                  <td className="h-28"></td>
                  <td className="h-28"></td>
                </tr>
                <tr>
                  <td colSpan={3} className="text-left p-2.5 text-[11px] leading-relaxed border-t border-dashed border-gray-400">
                    <div>
                      <strong className="font-bold">Lưu trình trình ký:</strong> Người lập biểu ➜ Trưởng nhóm ER ➜ Chủ quản BP tài nguyên nhân lực
                    </div>
                    <div className="font-['Kaiti','SimSun','宋体',serif] text-gray-700">
                      簽認流程: 填表人 ➜ ER組長 ➜ 人力資源部
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx global>{`
        .print-area, .print-area * {
          font-family: "Times New Roman", Times, serif !important;
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 8mm 10mm 8mm;
          }
          body, .print-area, .print-area * {
            background: #ffffff !important;
            color: #000000 !important;
            font-family: "Times New Roman", Times, serif !important;
          }
          .no-print {
            display: none !important;
          }
          .break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          table {
            border-collapse: collapse !important;
          }
          th, td {
            border-color: #000000 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ResignPrintPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs font-sans text-slate-500">
          Đang tải dữ liệu in danh sách thôi việc...
        </div>
      }
    >
      <ResignPrintContent />
    </Suspense>
  );
}
