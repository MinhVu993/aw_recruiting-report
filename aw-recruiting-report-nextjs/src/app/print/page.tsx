"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Printer,
  Users,
  Building2,
  Calendar,
  Sparkles,
  Layers,
  ArrowRight,
  Clock,
  Briefcase,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface PrintTemplateItem {
  key: string;
  code: string;
  titleVi: string;
  titleCn: string;
  description: string;
  category: "candidate" | "hr_list" | "form";
  icon: any;
  color: string;
  blankUrl: string;
}

const TEMPLATES: PrintTemplateItem[] = [
  {
    key: "unswiped",
    code: "AW-HR-UNSWIPED",
    titleVi: "Danh Sách Nhân Viên Chưa Quẹt Thẻ",
    titleCn: "未刷卡員工名單",
    description:
      "Danh sách nhân viên chưa quẹt thẻ theo ngày để bộ phận đối soát và theo dõi đi làm thực tế.",
    category: "hr_list",
    icon: Clock,
    color: "from-rose-500 to-red-600",
    blankUrl: "/print/unswiped",
  },
  {
    key: "5",
    code: "ADHR02-SP001-03",
    titleVi: "Mẫu Đơn Xin Việc (Cán bộ / Nhân viên / Kỹ sư)",
    titleCn: "應徵職位申請表 (非工人)",
    description:
      "Biểu mẫu ứng tuyển chính thức 2 trang chuẩn A4 dành cho ứng viên khối văn phòng, chuyên viên, kỹ sư và cán bộ quản lý.",
    category: "form",
    icon: FileText,
    color: "from-blue-500 to-indigo-600",
    blankUrl: "/template-print/5",
  },
  {
    key: "2-cn",
    code: "ADHR02-SP001-09",
    titleVi: "Bảng Tuyển Chọn Phỏng Vấn (Công Nhân)",
    titleCn: "甄選紀錄表 (工人)",
    description:
      "Phiếu đánh giá phỏng vấn và phê duyệt tuyển dụng dành cho công nhân xưởng sản xuất.",
    category: "candidate",
    icon: Layers,
    color: "from-teal-500 to-emerald-600",
    blankUrl: "/template-print/2-cn",
  },
  {
    key: "2-sf",
    code: "ADHR02-SP001-03",
    titleVi: "Bảng Tuyển Chọn Phỏng Vấn (Cán Bộ / Nhân Viên)",
    titleCn: "甄選紀錄表 (幹部 / 職員)",
    description:
      "Phiếu đánh giá phỏng vấn chuyên sâu 3 trang gồm kỹ năng, kinh nghiệm và nhận xét từ các cấp quản lý.",
    category: "candidate",
    icon: Users,
    color: "from-sky-500 to-blue-600",
    blankUrl: "/template-print/2-sf",
  },
  {
    key: "1",
    code: "ADHR02-SP001-13",
    titleVi: "Giấy Hẹn Phỏng Vấn",
    titleCn: "面試通知單",
    description:
      "Thư mời hẹn phỏng vấn hoặc bổ sung hồ sơ gửi đến ứng viên kèm địa chỉ và thông tin liên hệ.",
    category: "candidate",
    icon: Calendar,
    color: "from-amber-500 to-orange-600",
    blankUrl: "/template-print/1",
  },
  {
    key: "4",
    code: "ADHR02-SP001-05",
    titleVi: "Thư Mời Tuyển Dụng (Job Offer Letter)",
    titleCn: "錄用通知書",
    description:
      "Thông báo kết quả trúng tuyển chính thức, ngày tiếp nhận công việc và thời gian thử việc.",
    category: "candidate",
    icon: Sparkles,
    color: "from-emerald-500 to-teal-600",
    blankUrl: "/template-print/4",
  },
  {
    key: "3",
    code: "ADHR02-SP001-FORM",
    titleVi: "Bảng Ghi Nhận Trở Lại Công Ty & Cam Kết",
    titleCn: "員工離職回廠紀錄與工作承諾書",
    description:
      "Bảng tổng hợp tiền sử làm việc, thâm niên và lý do thôi việc của công nhân viên xin vào làm lại.",
    category: "candidate",
    icon: Building2,
    color: "from-rose-500 to-pink-600",
    blankUrl: "/template-print/3",
  },
  {
    key: "bqt",
    code: "HR02-SP001-11",
    titleVi: "Danh Sách Bù Quẹt Thẻ Công Nhân Mới",
    titleCn: "新進員工補刷卡名單",
    description:
      "Bảng in danh sách công nhân mới nhận việc chưa có thẻ hoặc cần bổ sung quẹt thẻ theo nhà máy.",
    category: "hr_list",
    icon: Clock,
    color: "from-indigo-500 to-violet-600",
    blankUrl: "/print/bqt",
  },
  {
    key: "hires",
    code: "HR02-SP001-TRACK",
    titleVi: "Bảng Theo Dõi Đến Tuyển Dụng",
    titleCn: "員工報到追蹤表",
    description:
      "Bảng theo dõi tổng hợp tình hình ứng viên đến làm việc, ngày nhận việc thực tế và ghi chú.",
    category: "hr_list",
    icon: Briefcase,
    color: "from-purple-500 to-indigo-600",
    blankUrl: "/print/hires",
  },
];

export default function PrintCenterHubPage() {
  const { t, locale } = useTranslation();
  const [filter, setFilter] = useState<"all" | "form" | "candidate" | "hr_list">("all");

  const filteredTemplates = TEMPLATES.filter((tpl) => {
    if (filter === "all") return true;
    return tpl.category === filter;
  });

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      {/* Header Banner - Responsive Fullpage Light Mode */}
      <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#18181C] border border-slate-200 dark:border-[#26262C] p-4 sm:p-5 shadow-xs transition-colors duration-200">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Printer className="w-4 h-4" />
              </div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-[#F1F2F4]">
                {t("printHubTitle")}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8E929B] max-w-3xl leading-relaxed">
              {t("printHubSubtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/candidates"
              className="h-8 px-3.5 rounded-lg bg-slate-50 dark:bg-[#222228] hover:bg-slate-100 dark:hover:bg-[#2a2a32] border border-slate-200 dark:border-[#383842] text-slate-700 dark:text-[#F1F2F4] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors duration-150 active:scale-95 shadow-xs"
            >
              <span>{t("backToCandidates")}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setFilter("all")}
          className={`h-8 px-3.5 rounded-lg text-xs font-semibold transition-colors duration-150 active:scale-95 ${
            filter === "all"
              ? "bg-rose-600 text-white shadow-xs font-bold"
              : "bg-white dark:bg-[#18181C] text-slate-700 dark:text-[#8E929B] hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white border border-slate-200 dark:border-[#26262C]"
          }`}
        >
          {t("allTemplates")} ({TEMPLATES.length})
        </button>
        <button
          onClick={() => setFilter("candidate")}
          className={`h-8 px-3.5 rounded-lg text-xs font-semibold transition-colors duration-150 active:scale-95 ${
            filter === "candidate"
              ? "bg-rose-600 text-white shadow-xs font-bold"
              : "bg-white dark:bg-[#18181C] text-slate-700 dark:text-[#8E929B] hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white border border-slate-200 dark:border-[#26262C]"
          }`}
        >
          {t("candidateTemplates")} ({TEMPLATES.filter((t) => t.category === "candidate").length})
        </button>
        <button
          onClick={() => setFilter("form")}
          className={`h-8 px-3.5 rounded-lg text-xs font-semibold transition-colors duration-150 active:scale-95 ${
            filter === "form"
              ? "bg-rose-600 text-white shadow-xs font-bold"
              : "bg-white dark:bg-[#18181C] text-slate-700 dark:text-[#8E929B] hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white border border-slate-200 dark:border-[#26262C]"
          }`}
        >
          {t("formTemplates")} ({TEMPLATES.filter((t) => t.category === "form").length})
        </button>
        <button
          onClick={() => setFilter("hr_list")}
          className={`h-8 px-3.5 rounded-lg text-xs font-semibold transition-colors duration-150 active:scale-95 ${
            filter === "hr_list"
              ? "bg-rose-600 text-white shadow-xs font-bold"
              : "bg-white dark:bg-[#18181C] text-slate-700 dark:text-[#8E929B] hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white border border-slate-200 dark:border-[#26262C]"
          }`}
        >
          {t("hrListTemplates")} ({TEMPLATES.filter((t) => t.category === "hr_list").length})
        </button>
      </div>

      {/* Grid of Templates - Fullpage Responsive 4-Columns on Widescreen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {filteredTemplates.map((tpl) => {
          const Icon = tpl.icon;
          const mainTitle = locale === "cn" ? tpl.titleCn : tpl.titleVi;
          const subTitle = locale === "cn" ? tpl.titleVi : tpl.titleCn;
          return (
            <div
              key={tpl.key}
              className="group relative bg-white dark:bg-[#18181C] border border-slate-200 dark:border-[#26262C] hover:border-rose-400 dark:hover:border-rose-500/50 rounded-xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tpl.color} flex items-center justify-center text-white shadow-md`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-50 dark:bg-[#222228] text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-[#383842]">
                    {tpl.code}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-[#F1F2F4] group-hover:text-rose-600 dark:group-hover:text-[#fb7185] transition-colors leading-snug">
                    {mainTitle}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-[#8E929B] mt-0.5 font-medium">
                    {subTitle}
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-[#8E929B] line-clamp-3 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              <div className="pt-3.5 mt-4 border-t border-slate-100 dark:border-[#26262C] flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-[#8E929B]">
                  {t("paperSize")}: <strong className="text-slate-700 dark:text-zinc-300">A4</strong>
                </span>

                <Link
                  href={tpl.blankUrl}
                  target="_blank"
                  className="h-8 px-3.5 rounded-lg bg-slate-50 dark:bg-[#222228] hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white border border-slate-200 dark:border-[#383842] hover:border-rose-600 dark:hover:border-rose-600 text-slate-700 dark:text-zinc-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t("openBlankForm")}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
