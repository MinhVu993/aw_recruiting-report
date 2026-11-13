"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Printer,
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
  category: "hr_list";
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
  const [filter, setFilter] = useState<"all" | "hr_list">("all");

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
