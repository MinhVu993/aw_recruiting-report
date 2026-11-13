"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Target,
  Users,
  UserMinus,
  GraduationCap,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export interface PowerBiScorecardsSummary {
  // Pillar 1: Demand
  totalDemand: number;
  totalRecruited: number;
  totalShortage: number;
  fulfillmentRate: number;

  // Pillar 2: Candidates
  totalCandidates: number;
  cardIssuedCount: number;
  pendingReviewCount: number;

  // Pillar 3: Resignations
  totalResignations: number;
  topResignReason?: string;

  // Pillar 4: Interns
  totalInterns: number;
  totalSchools?: number;

  // Backward compatibility
  pendingReview?: number;
  bqtCount?: number;
}

interface PowerBiScorecardsProps {
  summary: PowerBiScorecardsSummary;
  loading: boolean;
}

const SkeletonValue: React.FC<{ width?: string }> = ({ width = "w-24" }) => (
  <div className={`h-8 ${width} rounded-md bg-zinc-200/80 dark:bg-zinc-800/80 animate-pulse`} />
);

export const PowerBiScorecards: React.FC<PowerBiScorecardsProps> = ({ summary, loading }) => {
  const { t } = useTranslation();
  const fulfillment = summary.fulfillmentRate || 0;
  const isFulfilledGood = fulfillment >= 90;
  const onboarded = summary.cardIssuedCount || 0;
  const totalCands = summary.totalCandidates || 1;
  const conversionRate = Math.min(Math.round((onboarded / totalCands) * 100), 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full">
      {/* 🎯 PILLAR 1: NHU CẦU TUYỂN DỤNG */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-xl border border-zinc-200/90 dark:border-[#26262C] hover:border-rose-400/80 dark:hover:border-rose-500/50 rounded-xl p-3 flex flex-col justify-between shadow-2xs hover:shadow-[0_16px_32px_-12px_rgba(244,63,94,0.12)] dark:hover:shadow-[0_16px_32px_-12px_rgba(244,63,94,0.2)] transition-all duration-200"
      >
        <div>
          {/* Card Header */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20">
                <Target className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  1. {t("pillarDemand", "Nhu Cầu Nhân Lực")}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${
                  isFulfilledGood
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                }`}
              >
                {loading ? "..." : `${fulfillment.toFixed(1)}%`}
              </span>
              <Link
                href="/demand"
                aria-label="Xem chi tiết nhu cầu tuyển dụng"
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-opacity"
                title="Xem chi tiết nhu cầu"
              >
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Metric Numbers */}
          <div className="my-2.5 flex items-baseline justify-between">
            <div>
              {loading ? (
                <SkeletonValue width="w-28" />
              ) : (
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl sm:text-[26px] font-mono font-black text-zinc-900 dark:text-white tabular-nums tracking-tight">
                    {summary.totalDemand.toLocaleString("vi-VN")}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-semibold">{t("targetQuota", "chỉ tiêu")}</span>
                </div>
              )}
            </div>

            <div className="text-right">
              {loading ? (
                <SkeletonValue width="w-20" />
              ) : (
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {t("recruitedLabel", "Đã đạt")}: {summary.totalRecruited.toLocaleString("vi-VN")}
                  </span>
                  <p className="text-[10px] font-mono font-semibold text-rose-500 dark:text-rose-400 tabular-nums">
                    {t("shortageLabel", "Còn thiếu")}: {summary.totalShortage.toLocaleString("vi-VN")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fluid Micro Progress Gauge */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between text-[10px] mb-1 font-semibold text-slate-500 dark:text-slate-400">
            <span>{t("fulfillmentRate", "Tỷ lệ đáp ứng")}</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{fulfillment.toFixed(1)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                isFulfilledGood
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                  : "bg-gradient-to-r from-rose-500 to-amber-500"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(Math.max(fulfillment, 0), 100)}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
            />
          </div>
        </div>
      </motion.div>

      {/* 👥 PILLAR 2: ỨNG VIÊN MỚI */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-xl border border-zinc-200/90 dark:border-[#26262C] hover:border-sky-400/80 dark:hover:border-sky-500/50 rounded-xl p-3 flex flex-col justify-between shadow-2xs hover:shadow-[0_16px_32px_-12px_rgba(2,132,199,0.12)] dark:hover:shadow-[0_16px_32px_-12px_rgba(2,132,199,0.2)] transition-all duration-200"
      >
        <div>
          {/* Card Header */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/20">
                <Users className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  2. {t("pillarCandidates", "Hồ Sơ Ứng Viên")}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                {loading ? "..." : `${summary.cardIssuedCount?.toLocaleString("vi-VN") || 0} ${t("onboardedCount", "đã phát thẻ")}`}
              </span>
              <Link
                href="/candidates"
                aria-label="Xem danh sách ứng viên"
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-opacity"
                title="Xem danh sách ứng viên"
              >
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Metric Numbers */}
          <div className="my-2.5 flex items-baseline justify-between">
            <div>
              {loading ? (
                <SkeletonValue width="w-28" />
              ) : (
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl sm:text-[26px] font-mono font-black text-zinc-900 dark:text-white tabular-nums tracking-tight">
                    {(summary.totalCandidates || 0).toLocaleString("vi-VN")}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-semibold">{t("candidatesCount", "ứng viên")}</span>
                </div>
              )}
            </div>

            <div className="text-right">
              {loading ? (
                <SkeletonValue width="w-20" />
              ) : (
                <div>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    {t("pendingOnboard", "Chờ nhận việc")}: {(summary.pendingReviewCount ?? summary.pendingReview ?? 0).toLocaleString("vi-VN")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Micro Conversion Rate Status */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-sky-500" />
              Tỷ lệ nhận việc
            </span>
            <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">{conversionRate}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mt-1">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${conversionRate}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
            />
          </div>
        </div>
      </motion.div>

      {/* 📉 PILLAR 3: THÔI VIỆC / BIẾN ĐỘNG NHÂN SỰ */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-xl border border-zinc-200/90 dark:border-[#26262C] hover:border-amber-400/80 dark:hover:border-amber-500/50 rounded-xl p-3 flex flex-col justify-between shadow-2xs hover:shadow-[0_16px_32px_-12px_rgba(245,158,11,0.12)] dark:hover:shadow-[0_16px_32px_-12px_rgba(245,158,11,0.2)] transition-all duration-200"
      >
        <div>
          {/* Card Header */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
                <UserMinus className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  3. {t("pillarTurnover", "Biến Động Thôi Việc")}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <Link
                href="/resign"
                aria-label="Xem chi tiết thôi việc"
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-opacity"
                title="Xem chi tiết thôi việc"
              >
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Metric Numbers */}
          <div className="my-2.5 flex items-baseline justify-between">
            <div>
              {loading ? (
                <SkeletonValue width="w-24" />
              ) : (
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl sm:text-[26px] font-mono font-black text-amber-600 dark:text-amber-400 tabular-nums tracking-tight">
                    {(summary.totalResignations || 0).toLocaleString("vi-VN")}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-semibold">{t("unitLabelPerson", "người")}</span>
                </div>
              )}
            </div>

            <div className="text-right max-w-[150px]">
              {loading ? (
                <SkeletonValue width="w-24" />
              ) : (
                <div>
                  <span
                    className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 truncate block"
                    title={summary.topResignReason}
                  >
                    {summary.topResignReason || "Đang cập nhật"}
                  </span>
                  <p className="text-[10px] text-zinc-400 font-medium">{t("topResignReasonLabel", "Lý do hàng đầu")}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Risk / Resign Reason Pill Footer */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold">{t("topResignReasonLabel", "Lý do chính")}:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 truncate max-w-[140px]">
              {summary.topResignReason || "—"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 🎓 PILLAR 4: THỰC TẬP SINH */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-xl border border-zinc-200/90 dark:border-[#26262C] hover:border-violet-400/80 dark:hover:border-violet-500/50 rounded-xl p-3 flex flex-col justify-between shadow-2xs hover:shadow-[0_16px_32px_-12px_rgba(139,92,246,0.12)] dark:hover:shadow-[0_16px_32px_-12px_rgba(139,92,246,0.2)] transition-all duration-200"
      >
        <div>
          {/* Card Header */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 ring-1 ring-violet-500/20">
                <GraduationCap className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  4. {t("pillarInterns", "Thực Tập Sinh")}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                {loading ? "..." : `${summary.totalSchools || 0} ${t("partnerSchools", "trường liên kết")}`}
              </span>
              <Link
                href="/intern"
                aria-label="Xem chương trình thực tập sinh"
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-opacity"
                title="Xem chương trình thực tập sinh"
              >
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Metric Numbers */}
          <div className="my-2.5 flex items-baseline justify-between">
            <div>
              {loading ? (
                <SkeletonValue width="w-24" />
              ) : (
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl sm:text-[26px] font-mono font-black text-violet-600 dark:text-violet-400 tabular-nums tracking-tight">
                    {(summary.totalInterns || 0).toLocaleString("vi-VN")}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-semibold">{t("students", "sinh viên")}</span>
                </div>
              )}
            </div>

            <div className="text-right">
              {loading ? (
                <SkeletonValue width="w-20" />
              ) : (
                <span className="text-xs font-mono font-bold text-violet-500 dark:text-violet-400 tabular-nums">
                  {summary.totalSchools || 0} đối tác
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold">Mạng lưới đào tạo:</span>
            <span className="font-mono font-bold text-violet-600 dark:text-violet-400">Đang hoạt động</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
