"use client";

import React, { useState, useRef } from "react";
import {
  FileDown,
  Printer,
  X,
  Check,
  Building2,
  Users,
  Briefcase,
  UserMinus,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Clock,
  TrendingUp,
  AlertTriangle,
  Award,
  Calendar,
  Filter,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useTranslation } from "@/hooks/useTranslation";
import { CrossFilterState } from "./ActiveCrossFilterRibbon";
import { PerspectiveType } from "./PerspectiveNav";
import { SvgGenderRatioChart } from "./SvgGenderRatioChart";
import { SvgPopulationPyramidChart, AgePyramidRow } from "./SvgPopulationPyramidChart";

export interface ExportDashboardPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  analyticsData: any;
  globalFilters: {
    selectedFactory: string;
    timeRange: string;
    startDate?: string;
    endDate?: string;
    statusFilter: string;
    crossFilter?: CrossFilterState;
  };
  activePerspective: PerspectiveType;
}

export const ExportDashboardPdfModal: React.FC<ExportDashboardPdfModalProps> = ({
  isOpen,
  onClose,
  analyticsData,
  globalFilters,
  activePerspective,
}) => {
  const { t } = useTranslation();

  // Export options
  const [scope, setScope] = useState<"current" | "all">("all");
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgressText, setExportProgressText] = useState<string>("");

  const printRootRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const { selectedFactory, timeRange, startDate, endDate, statusFilter } = globalFilters;

  // Format factory label
  const factoryLabel =
    selectedFactory === "all"
      ? t("all", "Tất Cả Nhà Máy")
      : selectedFactory.toUpperCase();

  // Format time range label
  const timeLabel =
    timeRange === "today"
      ? t("today", "Hôm nay")
      : timeRange === "week"
      ? t("thisWeek", "Tuần này")
      : timeRange === "month"
      ? t("thisMonth", "Tháng này")
      : timeRange === "year"
      ? t("thisYear", "Năm nay")
      : timeRange === "custom" && (startDate || endDate)
      ? `${startDate || ""} → ${endDate || ""}`
      : t("all", "Toàn bộ thời gian");

  // Format status label
  const statusLabel =
    statusFilter === "open"
      ? t("inProgress", "Đang tuyển")
      : statusFilter === "closed"
      ? t("fulfilled", "Đã hoàn thành")
      : t("all", "Toàn bộ");

  const perspectiveTitle =
    activePerspective === "recruitment"
      ? t("recruitmentPerformance", "Hiệu Suất Tuyển Dụng")
      : activePerspective === "profile"
      ? t("candidateProfile", "Chân Dung Ứng Viên")
      : t("turnoverAnalytics", "Biến Động Thôi Việc");

  const currentDateTimeStr = new Date().toLocaleString("vi-VN", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const currentDateFileStr = new Date().toISOString().split("T")[0];

  // Data helpers
  const summary = analyticsData?.summary || {};
  const funnelDetailed = analyticsData?.recruitmentFunnelDetailed || { stages: [], timeToFillByPosition: [], avgTimeToFillDays: 0 };
  const candidateDemographics = analyticsData?.candidateDemographics || {
    genders: [],
    ageGroups: [],
    agePyramid: [],
    educationLevels: [],
    recruitmentSources: [],
    positions: [],
  };
  const resignationDeepAnalytics = analyticsData?.resignationDeepAnalytics || {
    topReasons: [],
    bySeniority: [],
    byJobLevel: [],
    byAgeGroup: [],
    agePyramid: [],
    byGender: [],
    topDepts: [],
    total: 0,
  };
  const departmentProgress = (analyticsData?.departmentProgress || []) as Array<{
    divCode?: string;
    divName?: string;
    deptName: string;
    loc?: string;
    demand: number;
    recruited: number;
    shortage: number;
    rate: number;
    status: string;
  }>;
  const internAnalytics = analyticsData?.internAnalytics || { bySchool: [], byStatus: [], total: 0 };

  // Core function to generate PDF from sections
  const handleDownloadPdf = async () => {
    if (!printRootRef.current || isExporting) return;

    setIsExporting(true);
    setExportProgressText("Đang chuẩn bị trang báo cáo...");

    try {
      // Allow slight tick for fonts & styles to settle
      await new Promise((resolve) => setTimeout(resolve, 350));

      const isLandscape = orientation === "landscape";
      const pdf = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = isLandscape ? 297 : 210;
      const pageHeight = isLandscape ? 210 : 297;
      const margin = 8;
      const targetWidth = pageWidth - margin * 2;
      const maxAvailableHeight = pageHeight - margin * 2;

      // Query visible pages to render
      const pageElements = printRootRef.current.querySelectorAll<HTMLElement>(
        "[data-pdf-page]"
      );

      if (pageElements.length === 0) {
        throw new Error("Không tìm thấy nội dung biểu đồ để xuất PDF.");
      }

      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        setExportProgressText(
          `Đang kết xuất trang (${i + 1}/${pageElements.length}) với độ nét cao…`
        );

        // Capture with scale: 2.5 for crisp vector lines, sharp text & numbers
        const canvas = await html2canvas(pageEl, {
          scale: 2.5,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          ignoreElements: (el) => el.hasAttribute("data-export-ignore"),
        });

        // Use lossless PNG to prevent JPEG text distortion & artifacts
        const imgData = canvas.toDataURL("image/png");
        const canvasAspect = canvas.width / canvas.height;

        let printWidth = targetWidth;
        let printHeight = targetWidth / canvasAspect;

        // If height exceeds page height, scale down BOTH width and height proportionally (Strict Aspect Ratio preservation!)
        if (printHeight > maxAvailableHeight) {
          printHeight = maxAvailableHeight;
          printWidth = printHeight * canvasAspect;
        }

        // Center on the A4 sheet
        const posX = margin + (targetWidth - printWidth) / 2;
        const posY = margin + (maxAvailableHeight - printHeight) / 2;

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, "PNG", posX, posY, printWidth, printHeight, undefined, "FAST");
      }

      setExportProgressText("Đang lưu file PDF…");

      const filename = `Bao_Cao_Dashboard_${selectedFactory.toUpperCase()}_${scope === "all" ? "360" : activePerspective}_${currentDateFileStr}.pdf`;
      pdf.save(filename);

      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 500);
    } catch (err: any) {
      console.error("Lỗi khi tạo PDF:", err);
      alert(err?.message || "Đã xảy ra lỗi khi tạo file PDF biểu đồ. Vui lòng thử lại.");
      setIsExporting(false);
    }
  };

  // Browser Native Print dialog
  const handleBrowserPrint = () => {
    window.print();
  };

  // Determine which pages to include
  const shouldRenderRecruitmentPages = scope === "all" || activePerspective === "recruitment";
  const shouldRenderProfilePage = scope === "all" || activePerspective === "profile";
  const shouldRenderTurnoverPage = scope === "all" || activePerspective === "turnover";

  // Calculate total pages for footer counters
  const totalPdfPages =
    (shouldRenderRecruitmentPages ? 2 : 0) +
    (shouldRenderProfilePage ? 1 : 0) +
    (shouldRenderTurnoverPage ? 1 : 0);

  let currentPageCounter = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={isExporting ? undefined : onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-[#26262C] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-md">
              <FileDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-tight">
                {t("exportPdfReport", "Xuất Báo Cáo PDF Biểu Đồ Dashboard")}
              </h3>
              <p className="text-[11px] text-rose-100 mt-0.5">
                {factoryLabel} • {timeLabel} • {scope === "all" ? "Báo Cáo Toàn Diện 360°" : perspectiveTitle}
              </p>
            </div>
          </div>
          {!isExporting && (
            <button
              onClick={onClose}
              aria-label="Đóng"
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body Settings */}
        <div className="p-5 space-y-4">
          {/* Scope Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
              {t("reportScope", "Phạm Vi Báo Cáo")}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setScope("current")}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all focus-visible:ring-2 focus-visible:ring-rose-500 ${
                  scope === "current"
                    ? "border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20"
                    : "border-zinc-200 dark:border-[#26262C] bg-zinc-50/60 dark:bg-[#131316] text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-extrabold">
                    {t("exportCurrentView", "Góc nhìn hiện tại")}
                  </span>
                  {scope === "current" && <Check className="w-4 h-4 text-rose-600" />}
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {perspectiveTitle} ({activePerspective === "recruitment" ? "2 trang" : "1 trang"} A4)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScope("all")}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all focus-visible:ring-2 focus-visible:ring-rose-500 ${
                  scope === "all"
                    ? "border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20"
                    : "border-zinc-200 dark:border-[#26262C] bg-zinc-50/60 dark:bg-[#131316] text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-extrabold">
                    {t("exportAllViews", "Toàn bộ báo cáo 360°")}
                  </span>
                  {scope === "all" && <Check className="w-4 h-4 text-rose-600" />}
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Cả 3 góc nhìn (4 trang A4 chuyên đề chuẩn điều hành)
                </span>
              </button>
            </div>
          </div>

          {/* Orientation Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
              {t("paperSize", "Khổ Giấy & Hướng Trang")}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setOrientation("landscape")}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all focus-visible:ring-2 focus-visible:ring-rose-500 ${
                  orientation === "landscape"
                    ? "border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold"
                    : "border-zinc-200 dark:border-[#26262C] bg-zinc-50/60 dark:bg-[#131316] text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-3.5 border-2 border-current rounded-xs" />
                  <span className="text-xs">{t("pdfLandscape", "Khổ ngang (A4 Landscape)")}</span>
                </div>
                {orientation === "landscape" && <Check className="w-3.5 h-3.5 text-rose-600" />}
              </button>

              <button
                type="button"
                onClick={() => setOrientation("portrait")}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all focus-visible:ring-2 focus-visible:ring-rose-500 ${
                  orientation === "portrait"
                    ? "border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold"
                    : "border-zinc-200 dark:border-[#26262C] bg-zinc-50/60 dark:bg-[#131316] text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3.5 h-5 border-2 border-current rounded-xs" />
                  <span className="text-xs">{t("pdfPortrait", "Khổ dọc (A4 Portrait)")}</span>
                </div>
                {orientation === "portrait" && <Check className="w-3.5 h-3.5 text-rose-600" />}
              </button>
            </div>
          </div>

          {/* Current Filter Preview Box */}
          <div className="p-3 bg-zinc-50 dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800 rounded-xl space-y-1.5 text-xs">
            <div className="flex items-center justify-between font-semibold text-zinc-700 dark:text-zinc-300">
              <span className="text-zinc-500 dark:text-zinc-400">{t("factory", "Nhà máy")}:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">{factoryLabel}</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-zinc-700 dark:text-zinc-300">
              <span className="text-zinc-500 dark:text-zinc-400">{t("filterTimeRange", "Kỳ phân tích")}:</span>
              <span className="font-bold">{timeLabel}</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-zinc-700 dark:text-zinc-300">
              <span className="text-zinc-500 dark:text-zinc-400">{t("status", "Trạng thái")}:</span>
              <span className="font-bold">{statusLabel}</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-zinc-700 dark:text-zinc-300 pt-1 border-t border-zinc-200/50 dark:border-zinc-800/60">
              <span className="text-zinc-500 dark:text-zinc-400">Số trang dự kiến:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">{totalPdfPages} trang A4</span>
            </div>
          </div>

          {/* Loading Indicator */}
          {isExporting && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center space-x-3 animate-pulse">
              <RefreshCw className="w-5 h-5 text-rose-600 animate-spin shrink-0" />
              <div>
                <p className="text-xs font-bold text-rose-800 dark:text-rose-200">
                  {exportProgressText || "Đang xử lý kết xuất file PDF…"}
                </p>
                <p className="text-[11px] text-rose-600 dark:text-rose-300">
                  Hệ thống đang chụp và render biểu đồ với độ phân giải cao 2.5x DPI, vui lòng đợi trong giây lát…
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              disabled={isExporting}
              onClick={onClose}
              className="h-9 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-200 disabled:opacity-50 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              {t("cancel", "Hủy")}
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={handleBrowserPrint}
              className="h-9 px-3.5 rounded-lg bg-white dark:bg-[#202028] border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold hover:bg-zinc-50 inline-flex items-center space-x-1.5 shadow-2xs transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400"
              title="Mở hộp thoại in ấn / lưu PDF trực tiếp của trình duyệt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t("printOrSavePdf", "In / Lưu Trình Duyệt")}</span>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownloadPdf}
              className="h-9 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center space-x-1.5 shadow-xs shadow-rose-600/20 active:scale-[0.98] transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              {isExporting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>{isExporting ? "Đang xuất…" : t("downloadPdfFile", "Tải File PDF (.pdf)")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HIGH-PRECISION OFF-SCREEN PRINT CONTAINER FOR HTML2CANVAS & PRINTING     */}
      {/* ========================================================================= */}
      <div
        ref={printRootRef}
        className="fixed -left-[9999px] top-0 bg-white text-zinc-900 pointer-events-none select-none z-[-100] print:static print:left-0 print:w-full print:pointer-events-auto"
        style={{
          width: orientation === "landscape" ? "1140px" : "800px",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* =================================================================== */}
        {/* PAGE 1: RECRUITMENT OVERVIEW & 5-STAGE FUNNEL                       */}
        {/* =================================================================== */}
        {shouldRenderRecruitmentPages && (() => {
          currentPageCounter += 1;
          const pageNum = currentPageCounter;
          const stages = funnelDetailed?.stages || [];
          const maxFunnelCount = Math.max(...stages.map((s: any) => s.count), 1);
          const ttfPositions = funnelDetailed?.timeToFillByPosition || [];
          const avgTTF = funnelDetailed?.avgTimeToFillDays || 0;
          const maxTtfDays = Math.max(...ttfPositions.map((p: any) => p.avgDays), 1);

          return (
            <div
              key="pdf-page-recruitment-funnel"
              data-pdf-page="recruitment-funnel"
              className={`bg-white text-zinc-900 flex flex-col justify-between p-7 border-b border-zinc-200 ${
                orientation === "landscape" ? "w-[1140px] min-h-[790px] max-h-[790px]" : "w-[800px] min-h-[1100px]"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3.5 border-b-2 border-rose-600 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 text-white flex items-center justify-center font-black text-lg shadow-sm">
                      VG
                    </div>
                    <div>
                      <h1 className="text-base font-black uppercase tracking-wide text-zinc-900 leading-tight">
                        BÁO CÁO HIỆU SUẤT TUYỂN DỤNG & PHỄU CHUYỂN ĐỔI
                      </h1>
                      <p className="text-xs text-zinc-500 font-medium mt-0.5">
                        Hệ thống Quản lý Tuyển Dụng VG • Phân tích định biên nhân sự 360°
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="inline-block px-2.5 py-1 rounded bg-rose-50 text-rose-700 font-extrabold border border-rose-200">
                      {factoryLabel}
                    </span>
                    <p className="text-[11px] text-zinc-500 mt-1 font-medium">
                      Kỳ báo cáo: <strong className="text-zinc-800">{timeLabel}</strong>
                    </p>
                  </div>
                </div>

                {/* 4-Pillar Executive KPI Scorecards */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-center">
                    <span className="text-[10px] font-black text-rose-800 uppercase tracking-wider">Tổng Nhu Cầu</span>
                    <div className="text-2xl font-black text-rose-700 mt-1 tabular-nums">
                      {(summary.totalDemand || 0).toLocaleString("vi-VN")}
                    </div>
                    <span className="text-[10px] text-rose-600 font-semibold">Chỉ tiêu định biên duyệt</span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Đã Tuyển Dụng</span>
                    <div className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">
                      {(summary.totalRecruited || 0).toLocaleString("vi-VN")}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      Đạt {summary.fulfillmentRate || 0}% chỉ tiêu
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-center">
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Còn Thiếu</span>
                    <div className="text-2xl font-black text-amber-700 mt-1 tabular-nums">
                      {(summary.totalShortage || 0).toLocaleString("vi-VN")}
                    </div>
                    <span className="text-[10px] text-amber-600 font-semibold">Cần tiếp tục bổ sung</span>
                  </div>

                  <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-center">
                    <span className="text-[10px] font-black text-sky-800 uppercase tracking-wider">Ứng Viên Tiếp Nhận</span>
                    <div className="text-2xl font-black text-sky-700 mt-1 tabular-nums">
                      {(summary.totalCandidates || 0).toLocaleString("vi-VN")}
                    </div>
                    <span className="text-[10px] text-sky-600 font-semibold">
                      Đã cấp thẻ: {(summary.cardIssuedCount || 0).toLocaleString("vi-VN")}
                    </span>
                  </div>
                </div>

                {/* Charts Grid: Funnel (Left) & Time-to-Fill (Right) */}
                <div className="grid grid-cols-12 gap-3.5">
                  {/* Left: 5-Stage Funnel */}
                  <div className="col-span-6 bg-zinc-50/80 border border-zinc-200 rounded-xl p-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                        <div className="flex items-center space-x-2">
                          <Filter className="w-4 h-4 text-sky-600" />
                          <h2 className="text-xs font-black uppercase text-zinc-800 tracking-wide">
                            Phễu Chuyển Đổi Tuyển Dụng
                          </h2>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500">5 Giai Đoạn Tuyển Dụng</span>
                      </div>

                      <div className="mt-3 space-y-2.5">
                        {stages.map((st: any, idx: number) => {
                          const widthPct = Math.max(16, Math.round((st.count / maxFunnelCount) * 100));
                          const colors = ["bg-sky-500", "bg-indigo-500", "bg-purple-500", "bg-amber-500", "bg-emerald-500"];
                          const barBg = colors[idx % colors.length];

                          return (
                            <div key={st.stage} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-bold text-zinc-800 text-[11px]">{st.stage}</span>
                                  {st.dropRate > 0 && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 border border-rose-200">
                                      - {st.dropRate}%
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 text-[11px] tabular-nums">
                                  <span className="font-black text-zinc-900">{st.count.toLocaleString("vi-VN")} người</span>
                                  <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded">
                                    {st.rate}%
                                  </span>
                                </div>
                              </div>
                              <div className="w-full bg-zinc-200/80 rounded-md h-5 p-0.5 flex items-center justify-center relative overflow-hidden">
                                <div className={`h-full rounded ${barBg}`} style={{ width: `${widthPct}%` }} />
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-900">
                                  {st.count.toLocaleString("vi-VN")} người ({st.rate}%)
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2.5 mt-2 border-t border-zinc-200 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-600 font-semibold">Tỷ lệ chuyển đổi hồ sơ ➔ Cấp thẻ:</span>
                      <span className="font-black text-emerald-700 text-xs tabular-nums">
                        {stages[4]?.rate || stages[stages.length - 1]?.rate || 0}%
                      </span>
                    </div>
                  </div>

                  {/* Right: Time-to-Fill by Position */}
                  <div className="col-span-6 bg-zinc-50/80 border border-zinc-200 rounded-xl p-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <h2 className="text-xs font-black uppercase text-zinc-800 tracking-wide">
                            Thời Gian Tuyển Dụng Trung Bình (TTF)
                          </h2>
                        </div>
                        <span className="text-[11px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 tabular-nums">
                          TB: {avgTTF} ngày
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {ttfPositions.slice(0, 6).map((pos: any, idx: number) => {
                          const widthPct = Math.max(12, Math.round((pos.avgDays / maxTtfDays) * 100));
                          const isSlow = pos.avgDays >= 45;

                          return (
                            <div key={pos.position || idx} className="space-y-0.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-zinc-800 text-[11px] truncate max-w-[200px]">
                                  {pos.position}
                                </span>
                                <div className="flex items-center space-x-1.5 tabular-nums text-[11px]">
                                  <span className={`font-black ${isSlow ? "text-rose-600" : "text-zinc-900"}`}>
                                    {pos.avgDays} ngày
                                  </span>
                                  <span className="text-[10px] text-zinc-500 font-medium">({pos.count} đơn)</span>
                                </div>
                              </div>
                              <div className="w-full bg-zinc-200/80 rounded-md h-4 p-0.5 overflow-hidden">
                                <div
                                  className={`h-full rounded ${
                                    isSlow ? "bg-rose-500" : pos.avgDays >= 30 ? "bg-amber-500" : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${widthPct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2.5 mt-2 border-t border-zinc-200 flex items-center justify-between text-[11px] text-zinc-600">
                      <span>Chuẩn KPI: &lt; 30 ngày (Công nhân & Nhân viên phổ thông)</span>
                      <span className="font-bold text-zinc-800">Đạt chuẩn quản trị</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Page Footer */}
              <div className="pt-3 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-500">
                <span>Hệ thống Quản trị Tuyển Dụng & Nhân Sự VG • {currentDateTimeStr}</span>
                <span className="font-bold">Trang {pageNum} / {totalPdfPages}</span>
              </div>
            </div>
          );
        })()}

        {/* =================================================================== */}
        {/* PAGE 2: DEPARTMENT RECRUITMENT PROGRESS (FULL BREAKDOWN)           */}
        {/* =================================================================== */}
        {shouldRenderRecruitmentPages && (() => {
          currentPageCounter += 1;
          const pageNum = currentPageCounter;
          const completedDepts = departmentProgress.filter((d) => d.rate >= 100).length;
          const completedPct = departmentProgress.length > 0 ? Math.round((completedDepts / departmentProgress.length) * 100) : 0;
          const topShortageDept = [...departmentProgress].sort((a, b) => b.shortage - a.shortage)[0];

          return (
            <div
              key="pdf-page-recruitment-depts"
              data-pdf-page="recruitment-depts"
              className={`bg-white text-zinc-900 flex flex-col justify-between p-7 border-b border-zinc-200 ${
                orientation === "landscape" ? "w-[1140px] min-h-[790px] max-h-[790px]" : "w-[800px] min-h-[1100px]"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3.5 border-b-2 border-sky-600 mb-3.5">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-600 to-sky-700 text-white flex items-center justify-center font-black text-lg shadow-sm">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-base font-black uppercase tracking-wide text-zinc-900 leading-tight">
                        TIẾN ĐỘ ĐỊNH BIÊN & TUYỂN DỤNG THEO BỘ PHẬN
                      </h1>
                      <p className="text-xs text-zinc-500 font-medium mt-0.5">
                        Thống kê chi tiết chỉ tiêu, tuyển dụng và mức độ đáp ứng theo từng đơn vị
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="inline-block px-2.5 py-1 rounded bg-sky-50 text-sky-700 font-extrabold border border-sky-200">
                      {factoryLabel}
                    </span>
                    <p className="text-[11px] text-zinc-500 mt-1 font-medium">
                      Kỳ báo cáo: <strong className="text-zinc-800">{timeLabel}</strong>
                    </p>
                  </div>
                </div>

                {/* Mini Summary KPIs */}
                <div className="grid grid-cols-3 gap-3 mb-3.5">
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Tổng số bộ phận</span>
                      <div className="text-xl font-black text-zinc-800 tabular-nums">{departmentProgress.length} đơn vị</div>
                    </div>
                    <Building2 className="w-7 h-7 text-zinc-400 opacity-60" />
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase">Số bộ phận đạt 100%</span>
                      <div className="text-xl font-black text-emerald-700 tabular-nums">
                        {completedDepts} đơn vị ({completedPct}%)
                      </div>
                    </div>
                    <Award className="w-7 h-7 text-emerald-500 opacity-80" />
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase">Thiếu hụt nhiều nhất</span>
                      <div className="text-xl font-black text-amber-700 truncate max-w-[200px]">
                        {topShortageDept?.deptName || "—"} (-{topShortageDept?.shortage || 0})
                      </div>
                    </div>
                    <AlertTriangle className="w-7 h-7 text-amber-500 opacity-80" />
                  </div>
                </div>

                {/* 2-Column Department Breakdown Grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-1">
                  {departmentProgress.slice(0, 18).map((dept, idx) => {
                    const isCompleted = dept.rate >= 100;
                    const isLow = dept.rate < 60;

                    return (
                      <div
                        key={dept.deptName || idx}
                        className="p-2 rounded-lg border border-zinc-200/90 bg-zinc-50/60 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <div className="flex items-center space-x-1.5 min-w-0">
                            <span className="inline-block w-4 h-4 rounded text-[9px] font-black bg-zinc-200 text-zinc-700 text-center leading-4 shrink-0">
                              #{idx + 1}
                            </span>
                            <span className="font-bold text-zinc-900 text-[11px] truncate" title={dept.deptName}>
                              {dept.divCode || dept.divName || dept.deptName}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 tabular-nums text-[11px] shrink-0">
                            <span className="text-zinc-600">
                              <strong className="text-emerald-700">{dept.recruited}</strong> / {dept.demand}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                                isCompleted
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : isLow
                                  ? "bg-rose-100 text-rose-800 border border-rose-300"
                                  : "bg-sky-100 text-sky-800 border border-sky-300"
                              }`}
                            >
                              {dept.rate}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isCompleted ? "bg-emerald-500" : isLow ? "bg-rose-500" : "bg-sky-500"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, dept.rate))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Page Footer */}
              <div className="pt-3 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-500">
                <span>Hệ thống Quản trị Tuyển Dụng & Nhân Sự VG • {currentDateTimeStr}</span>
                <span className="font-bold">Trang {pageNum} / {totalPdfPages}</span>
              </div>
            </div>
          );
        })()}

        {/* =================================================================== */}
        {/* PAGE 3: CANDIDATE PROFILE, DEMOGRAPHICS & INTERNS                   */}
        {/* =================================================================== */}
        {shouldRenderProfilePage && (() => {
          currentPageCounter += 1;
          const pageNum = currentPageCounter;
          const sources = candidateDemographics?.recruitmentSources || [];
          const edus = candidateDemographics?.educationLevels || [];
          const genders = candidateDemographics?.genders || [];
          const positions = candidateDemographics?.positions || [];
          const internSchools = internAnalytics?.bySchool || [];

          const maleStat = genders.find((g: any) => g.name === "Nam" || g.name === "Male") || { count: 0, percentage: 0 };
          const femaleStat = genders.find((g: any) => g.name === "Nữ" || g.name === "Female") || { count: 0, percentage: 0 };

          const maxSourceCount = Math.max(...sources.map((s: any) => s.count), 1);
          const maxEduCount = Math.max(...edus.map((e: any) => e.count), 1);

          return (
            <div
              key="pdf-page-candidate-profile"
              data-pdf-page="candidate-profile"
              className={`bg-white text-zinc-900 flex flex-col justify-between p-7 border-b border-zinc-200 ${
                orientation === "landscape" ? "w-[1140px] min-h-[790px] max-h-[790px]" : "w-[800px] min-h-[1100px]"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3.5 border-b-2 border-indigo-600 mb-3.5">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-black text-lg shadow-sm">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-base font-black uppercase tracking-wide text-zinc-900 leading-tight">
                        BÁO CÁO CHÂN DUNG ỨNG VIÊN & NGUỒN TUYỂN DỤNG
                      </h1>
                      <p className="text-xs text-zinc-500 font-medium mt-0.5">
                        Phân tích kênh nguồn, trình độ học vấn, cơ cấu giới tính/độ tuổi & thực tập sinh
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="inline-block px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-200">
                      {factoryLabel}
                    </span>
                    <p className="text-[11px] text-zinc-500 mt-1 font-medium">
                      Tổng ứng viên: <strong className="text-indigo-700">{(summary.totalCandidates || 0).toLocaleString("vi-VN")} hồ sơ</strong>
                    </p>
                  </div>
                </div>

                {/* Row 1: Sourcing Channels, Education, Demographics (3 Columns) */}
                <div className="grid grid-cols-12 gap-3.5 mb-3.5">
                  {/* Sourcing Channels */}
                  <div className="col-span-4 p-3 bg-zinc-50/80 border border-zinc-200 rounded-xl flex flex-col justify-between">
                    <div>
                      <h2 className="text-xs font-black uppercase text-zinc-800 pb-2 border-b border-zinc-200 mb-2.5 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                        Kênh Nguồn Tuyển Dụng
                      </h2>
                      <div className="space-y-2">
                        {sources.slice(0, 5).map((s: any, idx: number) => {
                          const widthPct = Math.max(14, Math.round((s.count / maxSourceCount) * 100));
                          return (
                            <div key={s.sourceName || idx} className="space-y-0.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-zinc-800 text-[11px] truncate max-w-[130px]">{s.sourceName}</span>
                                <span className="font-black text-indigo-700 text-[11px] tabular-nums">
                                  {s.count.toLocaleString("vi-VN")} ({s.percentage}%)
                                </span>
                              </div>
                              <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${widthPct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Education Levels */}
                  <div className="col-span-4 p-3 bg-zinc-50/80 border border-zinc-200 rounded-xl flex flex-col justify-between">
                    <div>
                      <h2 className="text-xs font-black uppercase text-zinc-800 pb-2 border-b border-zinc-200 mb-2.5 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-sky-600" />
                        Trình Độ Học Vấn
                      </h2>
                      <div className="space-y-2">
                        {edus.slice(0, 5).map((e: any, idx: number) => {
                          const widthPct = Math.max(14, Math.round((e.count / maxEduCount) * 100));
                          return (
                            <div key={e.level || idx} className="space-y-0.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-zinc-800 text-[11px] truncate max-w-[130px]">{e.level}</span>
                                <span className="font-black text-sky-700 text-[11px] tabular-nums">
                                  {e.count.toLocaleString("vi-VN")} ({e.percentage}%)
                                </span>
                              </div>
                              <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
                                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${widthPct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Demographics Ratio Infographic */}
                  <div className="col-span-4 p-3 bg-zinc-50/80 border border-zinc-200 rounded-xl flex flex-col justify-between">
                    <div>
                      <h2 className="text-xs font-black uppercase text-zinc-800 pb-2 border-b border-zinc-200 mb-2 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-rose-600" />
                        Cơ Cấu Giới Tính
                      </h2>
                      <div className="py-1">
                        <SvgGenderRatioChart
                          maleCount={maleStat.count}
                          femaleCount={femaleStat.count}
                          malePercentage={maleStat.percentage}
                          femalePercentage={femaleStat.percentage}
                          compact={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Top Positions & Interns Analytics (2 Columns) */}
                <div className="grid grid-cols-12 gap-3.5">
                  {/* Top Positions Applied */}
                  <div className="col-span-6 p-3 bg-zinc-50/80 border border-zinc-200 rounded-xl">
                    <h2 className="text-xs font-black uppercase text-zinc-800 pb-2 border-b border-zinc-200 mb-2.5 flex items-center justify-between">
                      <span>Top Vị Trí Ứng Tuyển Nhiều Nhất</span>
                      <span className="text-[10px] text-zinc-500 font-bold">Số lượng hồ sơ</span>
                    </h2>
                    <div className="grid grid-cols-2 gap-2">
                      {positions.slice(0, 6).map((pos: any, idx: number) => (
                        <div key={pos.name || idx} className="p-2 bg-white rounded-lg border border-zinc-200/90 flex flex-col justify-between">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-zinc-800 text-[11px] truncate max-w-[120px]">{pos.name}</span>
                            <span className="font-black text-indigo-700 text-[11px] tabular-nums">{pos.percentage}%</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1">
                            <span>{pos.count.toLocaleString("vi-VN")} ứng viên</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Intern Analytics */}
                  <div className="col-span-6 p-3 bg-zinc-50/80 border border-zinc-200 rounded-xl">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200 mb-2.5">
                      <h2 className="text-xs font-black uppercase text-zinc-800 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                        Phân Tích Nguồn Thực Tập Sinh
                      </h2>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        Tổng: {internAnalytics.total || 0} TTS
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {internSchools.slice(0, 4).map((sch: any, idx: number) => (
                        <div key={sch.schoolName || idx} className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-zinc-200 text-xs">
                          <span className="font-bold text-zinc-800 text-[11px] truncate max-w-[220px]">{sch.schoolName}</span>
                          <span className="font-black text-emerald-700 tabular-nums">
                            {sch.count} sinh viên ({sch.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Page Footer */}
              <div className="pt-3 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-500">
                <span>Hệ thống Quản trị Tuyển Dụng & Nhân Sự VG • {currentDateTimeStr}</span>
                <span className="font-bold">Trang {pageNum} / {totalPdfPages}</span>
              </div>
            </div>
          );
        })()}

        {/* =================================================================== */}
        {/* PAGE 4: TURNOVER & RESIGNATION DEEP ANALYTICS                       */}
        {/* =================================================================== */}
        {shouldRenderTurnoverPage && (() => {
          currentPageCounter += 1;
          const pageNum = currentPageCounter;
          const topReasons = resignationDeepAnalytics?.topReasons || [];
          const bySeniority = resignationDeepAnalytics?.bySeniority || [];
          const byJobLevel = resignationDeepAnalytics?.byJobLevel || [];
          const byGender = resignationDeepAnalytics?.byGender || [];
          const topDepts = resignationDeepAnalytics?.topDepts || [];
          const totalResign = resignationDeepAnalytics?.total || summary.totalResignations || 0;

          const topReason = topReasons[0];
          const topDept = topDepts[0];

          return (
            <div
              key="pdf-page-turnover-analytics"
              data-pdf-page="turnover-analytics"
              className={`bg-white text-zinc-900 flex flex-col justify-between p-7 border-b border-zinc-200 ${
                orientation === "landscape" ? "w-[1140px] min-h-[790px] max-h-[790px]" : "w-[800px] min-h-[1100px]"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3.5 border-b-2 border-rose-600 mb-3.5">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 text-white flex items-center justify-center font-black text-lg shadow-sm">
                      <UserMinus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-base font-black uppercase tracking-wide text-zinc-900 leading-tight">
                        BÁO CÁO PHÂN TÍCH BIẾN ĐỘNG & THÔI VIỆC
                      </h1>
                      <p className="text-xs text-zinc-500 font-medium mt-0.5">
                        Thống kê nguyên nhân thôi việc, thâm niên, cấp bậc & top bộ phận biến động cao
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="inline-block px-2.5 py-1 rounded bg-rose-50 text-rose-700 font-extrabold border border-rose-200">
                      {factoryLabel}
                    </span>
                    <p className="text-[11px] text-zinc-500 mt-1 font-medium">
                      Tổng thôi việc: <strong className="text-rose-600">{totalResign.toLocaleString("vi-VN")} nhân sự</strong>
                    </p>
                  </div>
                </div>

                {/* Mini Summary KPIs */}
                <div className="grid grid-cols-3 gap-3 mb-3.5">
                  <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-rose-800 uppercase">Tổng thôi việc ghi nhận</span>
                      <div className="text-xl font-black text-rose-700 tabular-nums">{totalResign.toLocaleString("vi-VN")} người</div>
                    </div>
                    <UserMinus className="w-7 h-7 text-rose-500 opacity-60" />
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase">Lý do phổ biến nhất</span>
                      <div className="text-xl font-black text-amber-700 truncate max-w-[200px]">
                        {topReason ? `${topReason.reasonName} (${topReason.percentage}%)` : "—"}
                      </div>
                    </div>
                    <AlertTriangle className="w-7 h-7 text-amber-500 opacity-80" />
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Bộ phận biến động cao nhất</span>
                      <div className="text-xl font-black text-zinc-800 truncate max-w-[200px]">
                        {topDept ? `${topDept.deptCode || topDept.deptName} (${topDept.count} lượt)` : "—"}
                      </div>
                    </div>
                    <Building2 className="w-7 h-7 text-zinc-400 opacity-80" />
                  </div>
                </div>

                {/* Row 1: 4 Balanced Analytical Cards */}
                <div className="grid grid-cols-4 gap-3 mb-3.5">
                  {/* Top Reasons */}
                  <div className="p-3 bg-zinc-50/80 border border-zinc-200 rounded-xl">
                    <h2 className="text-[11px] font-black uppercase text-zinc-800 pb-1.5 border-b border-zinc-200 mb-2">
                      Top Lý Do Nghỉ Việc
                    </h2>
                    <div className="space-y-1.5">
                      {topReasons.slice(0, 4).map((r: any, idx: number) => (
                        <div key={r.reasonId || idx} className="flex items-center justify-between text-xs">
                          <span className="font-bold text-zinc-700 text-[10px] truncate max-w-[120px]">{r.reasonName}</span>
                          <span className="font-black text-rose-600 tabular-nums text-[10px]">
                            {r.count} ({r.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Turnover by Job Level */}
                  <div className="p-3 bg-zinc-50/80 border border-zinc-200 rounded-xl">
                    <h2 className="text-[11px] font-black uppercase text-zinc-800 pb-1.5 border-b border-zinc-200 mb-2">
                      Nhóm Cấp Bậc
                    </h2>
                    <div className="space-y-1.5">
                      {byJobLevel.slice(0, 4).map((lvl: any, idx: number) => (
                        <div key={lvl.role || idx} className="flex items-center justify-between text-xs">
                          <span className="font-bold text-zinc-700 text-[10px] truncate max-w-[120px]">{lvl.role}</span>
                          <span className="font-black text-indigo-700 tabular-nums text-[10px]">
                            {lvl.count} ({lvl.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seniority Breakdown */}
                  <div className="p-3 bg-zinc-50/80 border border-zinc-200 rounded-xl">
                    <h2 className="text-[11px] font-black uppercase text-zinc-800 pb-1.5 border-b border-zinc-200 mb-2">
                      Thâm Niên Trước Nghỉ
                    </h2>
                    <div className="space-y-1.5">
                      {bySeniority.slice(0, 4).map((sen: any, idx: number) => (
                        <div key={sen.range || idx} className="flex items-center justify-between text-xs">
                          <span className="font-bold text-zinc-700 text-[10px] truncate max-w-[120px]">{sen.range}</span>
                          <span className="font-black text-amber-700 tabular-nums text-[10px]">
                            {sen.count} ({sen.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gender Demographics */}
                  <div className="p-3 bg-zinc-50/80 border border-zinc-200 rounded-xl">
                    <h2 className="text-[11px] font-black uppercase text-zinc-800 pb-1.5 border-b border-zinc-200 mb-2">
                      Cơ Cấu Giới Tính
                    </h2>
                    <div className="space-y-2 pt-1">
                      {byGender.map((g: any, idx: number) => (
                        <div key={g.name || idx} className="space-y-0.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-zinc-700 text-[10px]">{g.name}</span>
                            <span className="font-black text-zinc-900 tabular-nums text-[10px]">
                              {g.count} ({g.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${g.name === "Nam" ? "bg-sky-500" : "bg-pink-500"}`}
                              style={{ width: `${g.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 2: Top 12 Departments with Highest Turnover */}
                <div className="p-3.5 bg-zinc-50/80 border border-zinc-200 rounded-xl">
                  <h2 className="text-xs font-black uppercase text-zinc-800 pb-2 border-b border-zinc-200 mb-2.5 flex items-center justify-between">
                    <span>Top Bộ Phận Có Biến Động Thôi Việc Cao Nhất</span>
                    <span className="text-[10px] text-zinc-500 font-bold">Thống kê số lượt thôi việc</span>
                  </h2>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {topDepts.slice(0, 10).map((d: any, idx: number) => {
                      const maxDeptResign = Math.max(...topDepts.map((item: any) => item.count), 1);
                      const widthPct = Math.max(12, Math.round((d.count / maxDeptResign) * 100));

                      return (
                        <div key={d.deptCode || d.deptName || idx} className="space-y-0.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1 min-w-0">
                              <span className="inline-block w-4 h-4 rounded text-[9px] font-black bg-zinc-200 text-zinc-700 text-center leading-4 shrink-0">
                                #{idx + 1}
                              </span>
                              <span className="font-bold text-zinc-800 text-[11px] truncate max-w-[200px]">
                                {d.deptCode || d.deptName}
                              </span>
                            </div>
                            <span className="font-black text-rose-600 text-[11px] tabular-nums">
                              {d.count} người ({d.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${widthPct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Page Footer */}
              <div className="pt-3 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-500">
                <span>Hệ thống Quản trị Tuyển Dụng & Nhân Sự VG • {currentDateTimeStr}</span>
                <span className="font-bold">Trang {pageNum} / {totalPdfPages}</span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
