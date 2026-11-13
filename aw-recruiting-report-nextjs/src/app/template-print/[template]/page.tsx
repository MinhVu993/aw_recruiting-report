"use client";

import React, { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";

import Template1 from "../components/Template1";
import Template2Cn from "../components/Template2Cn";
import Template2Sf from "../components/Template2Sf";
import Template3 from "../components/Template3";
import Template4 from "../components/Template4";
import Template5 from "../components/Template5";
import TemplateBqt from "../components/TemplateBqt";
import TemplateHires from "../components/TemplateHires";

const TEMPLATE_NAMES: Record<string, string> = {
  "1": "Thư Hẹn Phỏng Vấn (ADHR02-SP001-13)",
  "2-cn": "Biên Bản Phỏng Vấn Công Nhân (ADHR02-SP001-09)",
  "2-sf": "Biên Bản Phỏng Vấn Cán Bộ (ADHR02-SP001-03)",
  "3": "Biên Bản Trở Lại Công Ty (員工離職回廠紀錄與工作承諾書)",
  "4": "Thư Mời Tuyển Dụng (ADHR02-SP001-05)",
  "5": "Mẫu Đơn Xin Việc (ADHR02-SP001-03)",
  bqt: "Danh Sách Bù Quẹt Thẻ Công Nhân Mới (HR02-SP001-11)",
  hires: "Bảng Theo Dõi Đến Tuyển Dụng (員工報到追蹤表)",
};

function TemplatePrintContent({ template }: { template: string }) {
  const templateKey = template.toLowerCase();
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") || searchParams.get("id") || "";
  const locParam = searchParams.get("loc") || "all";
  const isBlank = searchParams.get("blank") === "true" || (!idsParam && (templateKey === "bqt" || templateKey === "hires"));

  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!idsParam) {
        // Biểu mẫu trống mặc định (để xem hoặc in biểu mẫu trắng điền tay)
        setCandidates([{}]);
        setLoading(false);
        return;
      }

      const idList = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
      try {
        // Fast batch fetch
        const res = await fetch(`/api/vg-recuitingReport/getDataById/${idList.join(",")}`);
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json) ? json : json?.id ? [json] : [];
          setCandidates(list);
        } else {
          // Fallback to individual fetches if needed
          const responses = await Promise.all(
            idList.map(async (id) => {
              try {
                const r = await fetch(`/api/vg-recuitingReport/getDataById/${id}`);
                return r.ok ? await r.json() : null;
              } catch {
                return null;
              }
            })
          );
          setCandidates(responses.filter(Boolean));
        }
      } catch (e) {
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idsParam]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const templateTitle = TEMPLATE_NAMES[templateKey] || `Mẫu In: ${templateKey}`;

  return (
    <div className="w-full min-h-screen flex-1 bg-zinc-100 dark:bg-zinc-950 p-4 sm:p-6 print:p-0 print:m-0 print:bg-white text-zinc-900 dark:text-zinc-100">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: A4 portrait;
                margin: 6mm 8mm;
              }
              html, body, #main-content, main {
                background: #ffffff !important;
                color: #000000 !important;
                overflow: visible !important;
                height: auto !important;
                min-height: 0 !important;
                max-height: none !important;
                display: block !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              body, .template-print-root {
                font-family: "Times New Roman", Times, serif !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                background: #fff !important;
                box-shadow: none !important;
                border: none !important;
                padding: 0 !important;
                margin: 0 !important;
                max-width: none !important;
                width: 100% !important;
              }
              .no-print {
                display: none !important;
              }
              .print-page {
                page-break-after: always !important;
                break-after: page !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                display: block !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .print-page:last-child {
                page-break-after: avoid !important;
                break-after: avoid !important;
              }
              .page-sheet {
                page-break-after: always !important;
                break-after: page !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                display: block !important;
              }
              .page-sheet:last-child {
                page-break-after: avoid !important;
                break-after: avoid !important;
              }
              .print-page:last-child .page-sheet:last-child {
                page-break-after: avoid !important;
                break-after: avoid !important;
              }
            }
            .template-print-root, .template-print-root * {
              font-family: "Times New Roman", Times, serif !important;
            }
          `,
        }}
      />

      {/* Top Floating Controls - Hidden when printing */}
      <div className="no-print max-w-5xl mx-auto mb-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/candidates"
            className="h-8 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Danh Sách Ứng Viên</span>
          </Link>
          <div className="hidden sm:block border-l border-zinc-200 dark:border-zinc-800 pl-3">
            <h1 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
              {templateTitle}
            </h1>
            {candidates.length > 0 && (
              <p className="text-[11px] text-zinc-500">
                Đang in cho <strong>{candidates.length}</strong> ứng viên được chọn
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="h-8 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm inline-flex items-center space-x-2 transition-all active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>In Biểu Mẫu (Ctrl + P)</span>
        </button>
      </div>

      {/* Main Printable Area */}
      <div
        className="template-print-root max-w-5xl mx-auto bg-white text-black p-6 sm:p-10 rounded-xl shadow-lg print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full bqt-page-container"
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
      >
        {loading ? (
          <div className="py-20 text-center font-sans text-sm text-zinc-500">
            Đang tải dữ liệu biểu mẫu...
          </div>
        ) : (
          <>
            {templateKey === "1" && <Template1 candidates={candidates} />}
            {templateKey === "2-cn" && <Template2Cn candidates={candidates} />}
            {templateKey === "2-sf" && <Template2Sf candidates={candidates} />}
            {templateKey === "3" && <Template3 candidates={candidates} />}
            {templateKey === "4" && <Template4 candidates={candidates} />}
            {templateKey === "5" && <Template5 candidates={candidates} />}
            {templateKey === "bqt" && <TemplateBqt candidates={candidates} loc={locParam} blank={isBlank} />}
            {templateKey === "hires" && <TemplateHires candidates={candidates} loc={locParam} blank={isBlank} />}

            {!TEMPLATE_NAMES[templateKey] && (
              <div className="p-8 text-center text-sm font-sans text-rose-600">
                Không tìm thấy mẫu in phù hợp: &ldquo;{templateKey}&rdquo;
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function TemplatePrintPage({
  params,
}: {
  params: Promise<{ template: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8 text-center text-sm font-sans text-zinc-500">
          Đang tải biểu mẫu...
        </div>
      }
    >
      <TemplatePrintContent template={resolvedParams.template} />
    </React.Suspense>
  );
}
