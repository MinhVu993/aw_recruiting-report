"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
import {
  FileBarChart2,
  Search,
  RefreshCw,
  FileSpreadsheet,
  Calendar,
  FileText,
  X,
  Settings,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Filter,
  Building2,
  Layers,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useSession } from "@/context/SessionContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useTableExcelFilter } from "@/hooks/useTableExcelFilter";
import { ExcelColumnFilter } from "@/components/table/ExcelColumnFilter";
import { AppDialog, DialogOptions } from "@/components/ui/AppDialog";

interface RecruitingReportRow {
  id: number;
  id_code: string;
  dem_dept: string;
  dem_sub_department: string;
  dem_unit: string;
  dem_unit_name: { vi: string; en: string; cn: string };
  dem_note: string;
  dem_inputdate: string;
  demand: number;
  position: string;
  sub_position: string;
  comeToInterview: number;
  comeByBus: number;
  accByHR: number;
  accByDept: number;
  deptAccRate: string;
  deptAccRateNum: number;
  expectedEnrollDate: number;
  actualEnrollDate: number;
  totalRecruitedUntilToday: number;
  employmentRate: string;
  employmentRateNum: number;
  offerCycleTimeAvg: number;
  enrolledCycleTimeAvg: number;
  stillInNeedUntilToday: number;
  actualVacancies: number;
}

interface HierarchyMeta {
  divisions: string[];
  departments: string[];
  units: string[];
  deptByDiv: Record<string, string[]>;
  unitByDept: Record<string, string[]>;
}

const POSITION_OPTIONS = [
  { key: "all", labelVi: "Tất cả", labelEn: "All", labelCn: "全部" },
  { key: "Worker", labelVi: "Công nhân", labelEn: "Worker", labelCn: "工人" },
  { key: "Staff", labelVi: "Nhân viên", labelEn: "Staff", labelCn: "职员" },
  { key: "Staff (lang)", labelVi: "NV Ngôn ngữ", labelEn: "Staff (lang)", labelCn: "语言职员" },
  { key: "Leader", labelVi: "Cán bộ", labelEn: "Leader", labelCn: "干部" },
  { key: "Translator", labelVi: "Phiên dịch", labelEn: "Translator", labelCn: "翻译" },
  { key: "Engineer", labelVi: "Kỹ sư", labelEn: "Engineer", labelCn: "工程师" },
];

function getDefaultDateRange() {
  const now = new Date();
  const toDate = now.toISOString().split("T")[0];
  const fromObj = new Date(now);
  fromObj.setMonth(fromObj.getMonth() - 1);
  const fromDate = fromObj.toISOString().split("T")[0];
  return { fromDate, toDate };
}

function formatDateDisplay(d?: string) {
  if (!d) return "-";
  const parts = d.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return d;
}

function RecruitingReportContent() {
  const { selectedFactory } = useSession();
  const { t, locale } = useTranslation();
  const searchParams = useSearchParams();

  const defaultRange = useMemo(() => getDefaultDateRange(), []);
  const [fromDate, setFromDate] = useState<string>(
    searchParams.get("fromDate") || defaultRange.fromDate
  );
  const [toDate, setToDate] = useState<string>(
    searchParams.get("toDate") || defaultRange.toDate
  );

  const [rows, setRows] = useState<RecruitingReportRow[]>([]);
  const [hierarchy, setHierarchy] = useState<HierarchyMeta>({
    divisions: [],
    departments: [],
    units: [],
    deptByDiv: {},
    unitByDept: {},
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  // Cascading hierarchy & position filters (matching legacy recruiting-report.vue)
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [selectedDivision, setSelectedDivision] = useState<string>("all");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");

  // Column visibility settings
  const [showColMenu, setShowColMenu] = useState<boolean>(false);
  const [hiddenCols, setHiddenCols] = useState<string[]>([]);

  // Note modal state
  const [noteModalRow, setNoteModalRow] = useState<RecruitingReportRow | null>(null);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  const [dialog, setDialog] = useState<DialogOptions>({
    isOpen: false,
    title: "",
    message: "",
  });

  const fetchReport = async (overrideFrom?: string, overrideTo?: string) => {
    setLoading(true);
    try {
      const f = overrideFrom ?? fromDate;
      const to = overrideTo ?? toDate;
      const res = await fetch(
        `/api/recruiting-report?loc=aw&fromDate=${encodeURIComponent(f)}&toDate=${encodeURIComponent(to)}`
      );
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRows(
          json.data.map((r: any) => ({
            ...r,
            id_code: r.id_code || r.dem_id || "",
          }))
        );
        if (json.hierarchy) {
          setHierarchy(json.hierarchy);
        }
      } else {
        setRows([]);
      }
    } catch (e) {
      console.error("Lỗi khi tải Báo cáo tuyển dụng:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedFactory, fromDate, toDate]);

  // Quick date presets
  const applyQuickPreset = (preset: "today" | "week" | "month" | "3months" | "year") => {
    const now = new Date();
    const endStr = now.toISOString().split("T")[0];
    const startObj = new Date(now);

    if (preset === "today") {
      setFromDate(endStr);
      setToDate(endStr);
      return;
    }
    if (preset === "week") {
      const day = now.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      startObj.setDate(now.getDate() + diff);
    } else if (preset === "month") {
      startObj.setDate(1);
    } else if (preset === "3months") {
      startObj.setMonth(now.getMonth() - 3);
    } else if (preset === "year") {
      startObj.setMonth(0, 1);
    }
    setFromDate(startObj.toISOString().split("T")[0]);
    setToDate(endStr);
  };

  // Available cascading options
  const availableDepts = useMemo(() => {
    if (selectedDivision === "all") return hierarchy.departments;
    return hierarchy.deptByDiv[selectedDivision] || [];
  }, [selectedDivision, hierarchy]);

  const availableUnits = useMemo(() => {
    if (selectedDept !== "all") {
      return hierarchy.unitByDept[selectedDept] || [];
    }
    if (selectedDivision !== "all") {
      const deptsInDiv = hierarchy.deptByDiv[selectedDivision] || [];
      const uSet = new Set<string>();
      deptsInDiv.forEach((d) => {
        (hierarchy.unitByDept[d] || []).forEach((u) => uSet.add(u));
      });
      return Array.from(uSet).sort();
    }
    return hierarchy.units;
  }, [selectedDivision, selectedDept, hierarchy]);

  // Helper to get localized unit name
  const getUnitDisplayName = (r: RecruitingReportRow) => {
    if (!r.dem_unit_name) return r.dem_unit || "-";
    const nameStr =
      locale === "cn"
        ? r.dem_unit_name.cn
        : locale === "en"
        ? r.dem_unit_name.en
        : r.dem_unit_name.vi;
    if (r.dem_unit && nameStr && nameStr.toUpperCase() !== r.dem_unit.toUpperCase()) {
      return `${r.dem_unit} (${nameStr})`;
    }
    return nameStr || r.dem_unit || "-";
  };

  // Base filtered rows by Position, Division, Dept, Unit, and Search
  const baseFilteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (selectedPosition !== "all") {
        const posNorm = (r.position || "").toLowerCase().trim();
        const targetNorm = selectedPosition.toLowerCase().trim();
        if (posNorm !== targetNorm) return false;
      }
      if (selectedDivision !== "all" && r.dem_dept !== selectedDivision) {
        return false;
      }
      if (selectedDept !== "all" && r.dem_sub_department !== selectedDept) {
        return false;
      }
      if (selectedUnit !== "all" && r.dem_unit !== selectedUnit) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const unitLabel = getUnitDisplayName(r).toLowerCase();
        const matches =
          (r.id_code && r.id_code.toLowerCase().includes(q)) ||
          (r.dem_dept && r.dem_dept.toLowerCase().includes(q)) ||
          (r.dem_sub_department && r.dem_sub_department.toLowerCase().includes(q)) ||
          (r.dem_unit && r.dem_unit.toLowerCase().includes(q)) ||
          unitLabel.includes(q) ||
          (r.position && r.position.toLowerCase().includes(q)) ||
          (r.dem_note && r.dem_note.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [rows, selectedPosition, selectedDivision, selectedDept, selectedUnit, search, locale]);

  // Excel multi-column filtering and sorting
  const {
    filteredData: filteredRows,
    filters: excelFilters,
    sortConfig,
    getDistinctValues,
    setFilter,
    setSort,
    resetAllFilters,
    activeFilterCount,
  } = useTableExcelFilter(baseFilteredRows, {
    customExtractors: {
      dem_unit: (r) => getUnitDisplayName(r),
      dem_note: (r) => r.dem_note || "",
    },
    defaultSort: { key: "id", direction: "desc" },
  });

  useEffect(() => {
    setPage(1);
  }, [search, selectedPosition, selectedDivision, selectedDept, selectedUnit, excelFilters, fromDate, toDate, selectedFactory]);

  // Summary Totals (matching legacy recruiting-report.vue footer)
  const summaryTotals = useMemo(() => {
    let demand = 0;
    let comeToInterview = 0;
    let comeByBus = 0;
    let accByHR = 0;
    let accByDept = 0;
    let expectedEnrollDate = 0;
    let actualEnrollDate = 0;
    let totalRecruitedUntilToday = 0;
    let stillInNeedUntilToday = 0;
    let actualVacancies = 0;

    let offerCycleSum = 0;
    let offerCycleValidRows = 0;
    let enrolledCycleSum = 0;
    let enrolledCycleValidRows = 0;

    for (const r of filteredRows) {
      demand += Number(r.demand || 0);
      comeToInterview += Number(r.comeToInterview || 0);
      comeByBus += Number(r.comeByBus || 0);
      accByHR += Number(r.accByHR || 0);
      accByDept += Number(r.accByDept || 0);
      expectedEnrollDate += Number(r.expectedEnrollDate || 0);
      actualEnrollDate += Number(r.actualEnrollDate || 0);
      totalRecruitedUntilToday += Number(r.totalRecruitedUntilToday || 0);
      stillInNeedUntilToday += Number(r.stillInNeedUntilToday || 0);
      actualVacancies += Number(r.actualVacancies || 0);

      if (r.offerCycleTimeAvg > 0) {
        offerCycleSum += r.offerCycleTimeAvg;
        offerCycleValidRows++;
      }
      if (r.enrolledCycleTimeAvg > 0) {
        enrolledCycleSum += r.enrolledCycleTimeAvg;
        enrolledCycleValidRows++;
      }
    }

    const deptAccRate = accByHR > 0 ? `${Math.round((accByDept / accByHR) * 100)}%` : "0%";
    const employmentRate = accByDept > 0 ? `${Math.round((actualEnrollDate / accByDept) * 100)}%` : "0%";
    const offerCycleTimeAvg =
      offerCycleValidRows > 0 ? Math.round(offerCycleSum / offerCycleValidRows) : 0;
    const enrolledCycleTimeAvg =
      enrolledCycleValidRows > 0 ? Math.round(enrolledCycleSum / enrolledCycleValidRows) : 0;

    return {
      demand,
      comeToInterview,
      comeByBus,
      accByHR,
      accByDept,
      deptAccRate,
      expectedEnrollDate,
      actualEnrollDate,
      totalRecruitedUntilToday,
      employmentRate,
      offerCycleTimeAvg,
      enrolledCycleTimeAvg,
      stillInNeedUntilToday,
      actualVacancies,
    };
  }, [filteredRows]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Export Excel (100% matching legacy exportTableToExcel columns & totals)
  const handleExportExcel = () => {
    if (filteredRows.length === 0) {
      setDialog({
        isOpen: true,
        type: "warning",
        title: t("noData", "Không có dữ liệu"),
        message: "Không có dữ liệu báo cáo tuyển dụng phù hợp để xuất file Excel.",
        confirmText: t("close", "Đóng"),
      });
      return;
    }

    const exportData = filteredRows.map((r, idx) => ({
      STT: idx + 1,
      [t("demandId", "Mã đơn")]: r.id_code,
      [t("division", "Cấp sở")]: r.dem_dept,
      [t("department", "Bộ phận")]: r.dem_sub_department,
      [t("unit", "Đơn vị")]: getUnitDisplayName(r),
      [t("amount", "Nhu cầu")]: r.demand,
      [t("position", "Vị trí")]: r.position,
      [t("comeToInterview", "Đến phỏng vấn")]: r.comeToInterview,
      [t("comeByBus", "Đi bằng xe bus")]: r.comeByBus,
      [t("accByHR", "HR Duyệt")]: r.accByHR,
      [t("accByDept", "BP Duyệt")]: r.accByDept,
      [t("deptAccRate", "Tỷ lệ BP duyệt")]: r.deptAccRate,
      [t("expToEnroll", "Dự kiến nhận việc")]: r.expectedEnrollDate,
      [t("todayEnrolled", "Thực tế nhận việc")]: r.actualEnrollDate,
      [t("employmentRate", "Tỷ lệ nhận việc")]: r.employmentRate,
      [t("offerCycleTimeAvg", "TG mời việc TB")]: r.offerCycleTimeAvg,
      [t("enrolledCycleTimeAvg", "TG tuyển dụng TB")]: r.enrolledCycleTimeAvg,
      [t("totalRecruitedUntilToday", "Tổng đã tuyển")]: r.totalRecruitedUntilToday,
      [t("stillInNeedUntilToday", "Còn thiếu")]: r.stillInNeedUntilToday,
      [t("actualVacancies", "Số lượng thiếu thực tế")]: r.actualVacancies,
      [t("note", "Ghi chú")]: r.dem_note || "",
    }));

    // Append Total row at the bottom
    exportData.push({
      STT: "" as any,
      [t("demandId", "Mã đơn")]: t("total", "Tổng cộng"),
      [t("division", "Cấp sở")]: "",
      [t("department", "Bộ phận")]: "",
      [t("unit", "Đơn vị")]: "",
      [t("amount", "Nhu cầu")]: summaryTotals.demand,
      [t("position", "Vị trí")]: "",
      [t("comeToInterview", "Đến phỏng vấn")]: summaryTotals.comeToInterview,
      [t("comeByBus", "Đi bằng xe bus")]: summaryTotals.comeByBus,
      [t("accByHR", "HR Duyệt")]: summaryTotals.accByHR,
      [t("accByDept", "BP Duyệt")]: summaryTotals.accByDept,
      [t("deptAccRate", "Tỷ lệ BP duyệt")]: summaryTotals.deptAccRate,
      [t("expToEnroll", "Dự kiến nhận việc")]: summaryTotals.expectedEnrollDate,
      [t("todayEnrolled", "Thực tế nhận việc")]: summaryTotals.actualEnrollDate,
      [t("employmentRate", "Tỷ lệ nhận việc")]: summaryTotals.employmentRate,
      [t("offerCycleTimeAvg", "TG mời việc TB")]: summaryTotals.offerCycleTimeAvg,
      [t("enrolledCycleTimeAvg", "TG tuyển dụng TB")]: summaryTotals.enrolledCycleTimeAvg,
      [t("totalRecruitedUntilToday", "Tổng đã tuyển")]: summaryTotals.totalRecruitedUntilToday,
      [t("stillInNeedUntilToday", "Còn thiếu")]: summaryTotals.stillInNeedUntilToday,
      [t("actualVacancies", "Số lượng thiếu thực tế")]: summaryTotals.actualVacancies,
      [t("note", "Ghi chú")]: "",
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Recruiting_Report");
    XLSX.writeFile(workbook, `Recruiting_Report_${fromDate}_to_${toDate}.xlsx`);
  };

  const ALL_COLUMNS = [
    { key: "id_code", label: t("demandId", "Mã đơn") },
    { key: "dem_dept", label: t("division", "Cấp sở") },
    { key: "dem_sub_department", label: t("department", "Bộ phận") },
    { key: "dem_unit", label: t("unit", "Đơn vị") },
    { key: "dem_note", label: t("note", "Ghi chú") },
    { key: "demand", label: t("amount", "Nhu cầu") },
    { key: "position", label: t("position", "Vị trí") },
    { key: "comeToInterview", label: t("comeToInterview", "Đến PV") },
    { key: "comeByBus", label: t("comeByBus", "Đi xe bus") },
    { key: "accByHR", label: t("accByHR", "HR Duyệt") },
    { key: "accByDept", label: t("accByDept", "BP Duyệt") },
    { key: "deptAccRate", label: t("deptAccRate", "Tỷ lệ BP duyệt") },
    { key: "expectedEnrollDate", label: t("expToEnroll", "DK nhận việc") },
    { key: "actualEnrollDate", label: t("todayEnrolled", "TT nhận việc") },
    { key: "employmentRate", label: t("employmentRate", "Tỷ lệ nhận việc") },
    { key: "offerCycleTimeAvg", label: t("offerCycleTimeAvg", "TG mời việc TB") },
    { key: "enrolledCycleTimeAvg", label: t("enrolledCycleTimeAvg", "TG tuyển TB") },
    { key: "actualVacancies", label: t("actualVacancies", "Thiếu thực tế") },
  ];

  const isColVisible = (colKey: string) => !hiddenCols.includes(colKey);

  const toggleColVisibility = (colKey: string) => {
    setHiddenCols((prev) =>
      prev.includes(colKey) ? prev.filter((k) => k !== colKey) : [...prev, colKey]
    );
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 flex flex-col p-2 sm:p-2.5 lg:p-3 space-y-2 overflow-hidden bg-[#eaedf0] dark:bg-[#121214] text-zinc-900 dark:text-[#F1F2F4] transition-colors duration-200">
      {/* Row 1: Top Cockpit Toolbar */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2 bg-[#f1f3f6] dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-lg p-2 sm:px-3 sm:py-2 shadow-xs transition-colors duration-200">
        {/* Left: Title & Factory Selector + Date Range */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <FileBarChart2 className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-[#F1F2F4] leading-none">
                {t("recruitingReport", "Báo Cáo Tuyển Dụng")}
              </h1>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                {formatDateDisplay(fromDate)} — {formatDateDisplay(toDate)}
              </p>
            </div>
          </div>

          {/* Date Range Picker: fromDate ~ toDate */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-[#131316] px-2.5 py-1 rounded-md border border-zinc-200 dark:border-[#26262C]">
            <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              {t("fromDate", "Từ")}:
            </span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-7 bg-transparent text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            />
            <span className="text-zinc-400 font-bold">→</span>
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              {t("toDate", "Đến")}:
            </span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-7 bg-transparent text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Quick Date Presets */}
          <div className="hidden 2xl:flex items-center gap-1">
            {[
              { id: "today", label: t("today", "Hôm nay") },
              { id: "week", label: t("thisWeek", "Tuần này") },
              { id: "month", label: t("thisMonth", "Tháng này") },
              { id: "year", label: t("thisYear", "Năm nay") },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => applyQuickPreset(p.id as any)}
                className="h-8 px-2.5 rounded-md text-[11px] font-semibold bg-white dark:bg-[#131316] border border-zinc-200 dark:border-[#26262C] text-zinc-600 dark:text-zinc-300 hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Search, Column Toggle, Refresh, Excel Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-48 sm:w-56">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`${t("search", "Tìm mã đơn, bộ phận")}...`}
              className="w-full h-8 rounded-md bg-white dark:bg-[#131316] border border-zinc-200 dark:border-[#26262C] pl-8 pr-7 text-xs text-zinc-900 dark:text-[#F1F2F4] placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Column Settings Menu */}
          <div className="relative">
            <button
              onClick={() => setShowColMenu((prev) => !prev)}
              className="h-8 px-2.5 rounded-md bg-white dark:bg-[#131316] border border-zinc-200 dark:border-[#26262C] text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#222228] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title={t("toggleColumns", "Ẩn/Hiện Cột")}
            >
              <Settings className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">{t("toggleColumns", "Ẩn/Hiện Cột")}</span>
            </button>
            {showColMenu && (
              <div className="absolute right-0 mt-1.5 w-60 max-h-80 overflow-y-auto rounded-lg bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-[#26262C] shadow-xl p-2 z-50">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                    {t("columnSettingsTitle", "Cấu Hình Hiển Thị Cột")}
                  </span>
                  <button
                    onClick={() => setHiddenCols([])}
                    className="text-[11px] font-semibold text-rose-600 hover:underline"
                  >
                    {t("selectAll", "Hiện tất cả")}
                  </button>
                </div>
                <div className="space-y-1">
                  {ALL_COLUMNS.map((col) => (
                    <label
                      key={col.key}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-xs cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isColVisible(col.key)}
                        onChange={() => toggleColVisibility(col.key)}
                        className="rounded border-zinc-300 text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate">
                        {col.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => fetchReport()}
            className="h-8 w-8 rounded-md bg-white dark:bg-[#131316] border border-zinc-200 dark:border-[#26262C] inline-flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 transition-colors cursor-pointer"
            title={t("refresh", "Làm mới")}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-rose-500" : ""}`} />
          </button>

          <button
            onClick={handleExportExcel}
            className="h-8 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{t("exportExcel", "Xuất Excel")}</span>
          </button>
        </div>
      </div>

      {/* Row 2: Secondary Filter Bar (Position Chips + Cascading Division / Dept / Unit + KPI Summary Pills) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 bg-[#f1f3f6] dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-lg px-3 py-1.5 shadow-2xs">
        {/* Position Chips */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mr-1 inline-flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-rose-500" />
            {t("position", "Vị trí")}:
          </span>
          {POSITION_OPTIONS.map((pos) => {
            const active = selectedPosition === pos.key;
            const label =
              locale === "cn" ? pos.labelCn : locale === "en" ? pos.labelEn : pos.labelVi;
            return (
              <button
                key={pos.key}
                onClick={() => setSelectedPosition(pos.key)}
                className={`h-7 px-2.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-rose-600 text-white shadow-2xs font-bold"
                    : "bg-white dark:bg-[#131316] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-[#26262C] hover:border-rose-300"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Cascading Division -> Dept -> Unit Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Division */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#131316] px-2 py-0.5 rounded border border-zinc-200 dark:border-[#26262C]">
            <Building2 className="w-3 h-3 text-zinc-400" />
            <span className="text-[11px] font-semibold text-zinc-500">{t("division", "Cấp sở")}:</span>
            <select
              value={selectedDivision}
              onChange={(e) => {
                setSelectedDivision(e.target.value);
                setSelectedDept("all");
                setSelectedUnit("all");
              }}
              className="h-6 bg-transparent text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="all">{t("all", "Tất cả")}</option>
              {hierarchy.divisions.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#131316] px-2 py-0.5 rounded border border-zinc-200 dark:border-[#26262C]">
            <Layers className="w-3 h-3 text-zinc-400" />
            <span className="text-[11px] font-semibold text-zinc-500">{t("department", "Bộ phận")}:</span>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedUnit("all");
              }}
              className="h-6 bg-transparent text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="all">{t("all", "Tất cả")}</option>
              {availableDepts.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Unit */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#131316] px-2 py-0.5 rounded border border-zinc-200 dark:border-[#26262C]">
            <Users className="w-3 h-3 text-zinc-400" />
            <span className="text-[11px] font-semibold text-zinc-500">{t("unit", "Đơn vị")}:</span>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="h-6 bg-transparent text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer max-w-[140px]"
            >
              <option value="all">{t("all", "Tất cả")}</option>
              {availableUnits.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {(selectedPosition !== "all" ||
            selectedDivision !== "all" ||
            selectedDept !== "all" ||
            selectedUnit !== "all" ||
            activeFilterCount > 0) && (
            <button
              onClick={() => {
                setSelectedPosition("all");
                setSelectedDivision("all");
                setSelectedDept("all");
                setSelectedUnit("all");
                resetAllFilters();
              }}
              className="h-7 px-2.5 rounded bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-[11px] font-bold text-rose-600 dark:text-rose-300 hover:bg-rose-100 inline-flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              {t("clearFilters", "Xóa lọc")}
            </button>
          )}
        </div>
      </div>

      {/* Main Data Table with Sticky Header & Sticky Summary Footer */}
      <div className="flex-1 min-h-0 w-full rounded-lg border border-[#d8dce2] dark:border-[#26262C] bg-white dark:bg-[#18181C] flex flex-col overflow-hidden shadow-xs">
        <div className="flex-1 min-h-0 overflow-auto custom-scrollbar">
          <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
            <thead className="sticky top-0 z-20 bg-[#e6e9ee] dark:bg-[#121214] border-b border-[#d0d5dd] dark:border-[#26262C]">
              <tr className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider select-none">
                <th className="py-2.5 px-2.5 text-center w-10">#</th>

                {isColVisible("id_code") && (
                  <th className="py-2.5 px-2.5">
                    <ExcelColumnFilter
                      title={t("demandId", "Mã đơn")}
                      columnKey="id_code"
                      distinctValues={getDistinctValues("id_code")}
                      selectedValues={excelFilters["id_code"]}
                      onFilterChange={(v) => setFilter("id_code", v)}
                      sortDirection={sortConfig?.key === "id_code" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("id_code", dir)}
                    />
                  </th>
                )}

                {isColVisible("dem_dept") && (
                  <th className="py-2.5 px-2.5">
                    <ExcelColumnFilter
                      title={t("division", "Cấp sở")}
                      columnKey="dem_dept"
                      distinctValues={getDistinctValues("dem_dept")}
                      selectedValues={excelFilters["dem_dept"]}
                      onFilterChange={(v) => setFilter("dem_dept", v)}
                      sortDirection={sortConfig?.key === "dem_dept" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("dem_dept", dir)}
                    />
                  </th>
                )}

                {isColVisible("dem_sub_department") && (
                  <th className="py-2.5 px-2.5">
                    <ExcelColumnFilter
                      title={t("department", "Bộ phận")}
                      columnKey="dem_sub_department"
                      distinctValues={getDistinctValues("dem_sub_department")}
                      selectedValues={excelFilters["dem_sub_department"]}
                      onFilterChange={(v) => setFilter("dem_sub_department", v)}
                      sortDirection={
                        sortConfig?.key === "dem_sub_department" ? sortConfig.direction : null
                      }
                      onSortChange={(dir) => setSort("dem_sub_department", dir)}
                    />
                  </th>
                )}

                {isColVisible("dem_unit") && (
                  <th className="py-2.5 px-2.5">
                    <ExcelColumnFilter
                      title={t("unit", "Đơn vị")}
                      columnKey="dem_unit"
                      distinctValues={getDistinctValues("dem_unit")}
                      selectedValues={excelFilters["dem_unit"]}
                      onFilterChange={(v) => setFilter("dem_unit", v)}
                      sortDirection={sortConfig?.key === "dem_unit" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("dem_unit", dir)}
                    />
                  </th>
                )}

                {isColVisible("dem_note") && (
                  <th className="py-2.5 px-2 text-center">{t("note", "Ghi chú")}</th>
                )}

                {isColVisible("demand") && (
                  <th className="py-2.5 px-2.5 text-center bg-blue-50/60 dark:bg-blue-950/20">
                    <ExcelColumnFilter
                      title={t("amount", "Nhu cầu")}
                      columnKey="demand"
                      align="center"
                      distinctValues={getDistinctValues("demand")}
                      selectedValues={excelFilters["demand"]}
                      onFilterChange={(v) => setFilter("demand", v)}
                      sortDirection={sortConfig?.key === "demand" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("demand", dir)}
                    />
                  </th>
                )}

                {isColVisible("position") && (
                  <th className="py-2.5 px-2.5">
                    <ExcelColumnFilter
                      title={t("position", "Vị trí")}
                      columnKey="position"
                      distinctValues={getDistinctValues("position")}
                      selectedValues={excelFilters["position"]}
                      onFilterChange={(v) => setFilter("position", v)}
                      sortDirection={sortConfig?.key === "position" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("position", dir)}
                    />
                  </th>
                )}

                {isColVisible("comeToInterview") && (
                  <th className="py-2.5 px-2.5 text-center">
                    <ExcelColumnFilter
                      title={t("comeToInterview", "Đến PV")}
                      columnKey="comeToInterview"
                      align="center"
                      distinctValues={getDistinctValues("comeToInterview")}
                      selectedValues={excelFilters["comeToInterview"]}
                      onFilterChange={(v) => setFilter("comeToInterview", v)}
                      sortDirection={
                        sortConfig?.key === "comeToInterview" ? sortConfig.direction : null
                      }
                      onSortChange={(dir) => setSort("comeToInterview", dir)}
                    />
                  </th>
                )}

                {isColVisible("comeByBus") && (
                  <th className="py-2.5 px-2.5 text-center">
                    <ExcelColumnFilter
                      title={t("comeByBus", "Đi xe bus")}
                      columnKey="comeByBus"
                      align="center"
                      distinctValues={getDistinctValues("comeByBus")}
                      selectedValues={excelFilters["comeByBus"]}
                      onFilterChange={(v) => setFilter("comeByBus", v)}
                      sortDirection={sortConfig?.key === "comeByBus" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("comeByBus", dir)}
                    />
                  </th>
                )}

                {isColVisible("accByHR") && (
                  <th className="py-2.5 px-2.5 text-center">
                    <ExcelColumnFilter
                      title={t("accByHR", "HR Duyệt")}
                      columnKey="accByHR"
                      align="center"
                      distinctValues={getDistinctValues("accByHR")}
                      selectedValues={excelFilters["accByHR"]}
                      onFilterChange={(v) => setFilter("accByHR", v)}
                      sortDirection={sortConfig?.key === "accByHR" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("accByHR", dir)}
                    />
                  </th>
                )}

                {isColVisible("accByDept") && (
                  <th className="py-2.5 px-2.5 text-center">
                    <ExcelColumnFilter
                      title={t("accByDept", "BP Duyệt")}
                      columnKey="accByDept"
                      align="center"
                      distinctValues={getDistinctValues("accByDept")}
                      selectedValues={excelFilters["accByDept"]}
                      onFilterChange={(v) => setFilter("accByDept", v)}
                      sortDirection={sortConfig?.key === "accByDept" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("accByDept", dir)}
                    />
                  </th>
                )}

                {isColVisible("deptAccRate") && (
                  <th className="py-2.5 px-2.5 text-center">
                    <ExcelColumnFilter
                      title={t("deptAccRate", "Tỷ lệ BP duyệt")}
                      columnKey="deptAccRate"
                      align="center"
                      distinctValues={getDistinctValues("deptAccRate")}
                      selectedValues={excelFilters["deptAccRate"]}
                      onFilterChange={(v) => setFilter("deptAccRate", v)}
                      sortDirection={
                        sortConfig?.key === "deptAccRate" ? sortConfig.direction : null
                      }
                      onSortChange={(dir) => setSort("deptAccRate", dir)}
                    />
                  </th>
                )}

                {isColVisible("expectedEnrollDate") && (
                  <th className="py-2.5 px-2.5 text-center">
                    <ExcelColumnFilter
                      title={t("expToEnroll", "DK nhận việc")}
                      columnKey="expectedEnrollDate"
                      align="center"
                      distinctValues={getDistinctValues("expectedEnrollDate")}
                      selectedValues={excelFilters["expectedEnrollDate"]}
                      onFilterChange={(v) => setFilter("expectedEnrollDate", v)}
                      sortDirection={
                        sortConfig?.key === "expectedEnrollDate" ? sortConfig.direction : null
                      }
                      onSortChange={(dir) => setSort("expectedEnrollDate", dir)}
                    />
                  </th>
                )}

                {isColVisible("actualEnrollDate") && (
                  <th className="py-2.5 px-2.5 text-center bg-emerald-50/60 dark:bg-emerald-950/20">
                    <ExcelColumnFilter
                      title={t("todayEnrolled", "TT nhận việc")}
                      columnKey="actualEnrollDate"
                      align="center"
                      distinctValues={getDistinctValues("actualEnrollDate")}
                      selectedValues={excelFilters["actualEnrollDate"]}
                      onFilterChange={(v) => setFilter("actualEnrollDate", v)}
                      sortDirection={
                        sortConfig?.key === "actualEnrollDate" ? sortConfig.direction : null
                      }
                      onSortChange={(dir) => setSort("actualEnrollDate", dir)}
                    />
                  </th>
                )}

                {isColVisible("employmentRate") && (
                  <th className="py-2.5 px-2.5 text-center">
                    <ExcelColumnFilter
                      title={t("employmentRate", "Tỷ lệ nhận việc")}
                      columnKey="employmentRate"
                      align="center"
                      distinctValues={getDistinctValues("employmentRate")}
                      selectedValues={excelFilters["employmentRate"]}
                      onFilterChange={(v) => setFilter("employmentRate", v)}
                      sortDirection={
                        sortConfig?.key === "employmentRate" ? sortConfig.direction : null
                      }
                      onSortChange={(dir) => setSort("employmentRate", dir)}
                    />
                  </th>
                )}

                {isColVisible("offerCycleTimeAvg") && (
                  <th className="py-2.5 px-2.5 text-center">
                    <ExcelColumnFilter
                      title={t("offerCycleTimeAvg", "TG mời việc TB")}
                      columnKey="offerCycleTimeAvg"
                      align="center"
                      distinctValues={getDistinctValues("offerCycleTimeAvg")}
                      selectedValues={excelFilters["offerCycleTimeAvg"]}
                      onFilterChange={(v) => setFilter("offerCycleTimeAvg", v)}
                      sortDirection={
                        sortConfig?.key === "offerCycleTimeAvg" ? sortConfig.direction : null
                      }
                      onSortChange={(dir) => setSort("offerCycleTimeAvg", dir)}
                    />
                  </th>
                )}

                {isColVisible("enrolledCycleTimeAvg") && (
                  <th className="py-2.5 px-2.5 text-center">
                    <ExcelColumnFilter
                      title={t("enrolledCycleTimeAvg", "TG tuyển TB")}
                      columnKey="enrolledCycleTimeAvg"
                      align="center"
                      distinctValues={getDistinctValues("enrolledCycleTimeAvg")}
                      selectedValues={excelFilters["enrolledCycleTimeAvg"]}
                      onFilterChange={(v) => setFilter("enrolledCycleTimeAvg", v)}
                      sortDirection={
                        sortConfig?.key === "enrolledCycleTimeAvg" ? sortConfig.direction : null
                      }
                      onSortChange={(dir) => setSort("enrolledCycleTimeAvg", dir)}
                    />
                  </th>
                )}

                {isColVisible("actualVacancies") && (
                  <th className="py-2.5 px-2.5 text-center bg-amber-50/60 dark:bg-amber-950/20">
                    <ExcelColumnFilter
                      title={t("actualVacancies", "Thiếu thực tế")}
                      columnKey="actualVacancies"
                      align="center"
                      distinctValues={getDistinctValues("actualVacancies")}
                      selectedValues={excelFilters["actualVacancies"]}
                      onFilterChange={(v) => setFilter("actualVacancies", v)}
                      sortDirection={
                        sortConfig?.key === "actualVacancies" ? sortConfig.direction : null
                      }
                      onSortChange={(dir) => setSort("actualVacancies", dir)}
                    />
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-200/70 dark:divide-[#26262C]">
              {loading ? (
                <tr>
                  <td colSpan={20} className="py-16 text-center text-zinc-500">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
                      <span>{t("loading", "Đang tải dữ liệu báo cáo tuyển dụng...")}</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={20} className="py-16 text-center text-zinc-500">
                    {t("noData", "Không có dữ liệu trong khoảng thời gian này")}
                  </td>
                </tr>
              ) : (
                paginatedRows.map((r, idx) => {
                  const rowIndex = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={`${r.id_code}-${r.dem_dept}-${r.dem_unit}-${r.position}-${idx}`}
                      className="hover:bg-rose-50/40 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-2 px-2.5 text-center text-zinc-400 font-mono text-[11px]">
                        {rowIndex}
                      </td>

                      {isColVisible("id_code") && (
                        <td className="py-2 px-2.5 font-mono font-bold text-rose-600 dark:text-rose-400">
                          <Link
                            href={`/demand?idCode=${encodeURIComponent(r.id_code)}`}
                            className="hover:underline inline-flex items-center gap-1"
                            title="Xem chi tiết nhu cầu"
                          >
                            {r.id_code}
                          </Link>
                        </td>
                      )}

                      {isColVisible("dem_dept") && (
                        <td className="py-2 px-2.5 font-semibold text-zinc-800 dark:text-zinc-200">
                          {r.dem_dept || "-"}
                        </td>
                      )}

                      {isColVisible("dem_sub_department") && (
                        <td className="py-2 px-2.5 text-zinc-700 dark:text-zinc-300">
                          {r.dem_sub_department || "-"}
                        </td>
                      )}

                      {isColVisible("dem_unit") && (
                        <td className="py-2 px-2.5 text-zinc-700 dark:text-zinc-300 font-medium">
                          {getUnitDisplayName(r)}
                        </td>
                      )}

                      {isColVisible("dem_note") && (
                        <td className="py-2 px-2 text-center">
                          {r.dem_note && r.dem_note.trim() !== "" ? (
                            <button
                              onClick={() => setNoteModalRow(r)}
                              className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 cursor-pointer"
                              title={r.dem_note}
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-zinc-300 dark:text-zinc-700">-</span>
                          )}
                        </td>
                      )}

                      {isColVisible("demand") && (
                        <td className="py-2 px-2.5 text-center font-bold tabular-nums bg-blue-50/30 dark:bg-blue-950/10">
                          <Link
                            href={`/demand?idCode=${encodeURIComponent(r.id_code)}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline px-1.5 py-0.5 rounded"
                          >
                            {r.demand}
                          </Link>
                        </td>
                      )}

                      {isColVisible("position") && (
                        <td className="py-2 px-2.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {r.position}
                          </span>
                        </td>
                      )}

                      {isColVisible("comeToInterview") && (
                        <td className="py-2 px-2.5 text-center font-bold tabular-nums">
                          {r.comeToInterview > 0 ? (
                            <Link
                              href={`/candidates?demand_id=${encodeURIComponent(r.id_code)}&fromDate=${fromDate}&toDate=${toDate}&reportSource=comeToInterview`}
                              className="text-indigo-600 dark:text-indigo-400 hover:underline px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40"
                            >
                              {r.comeToInterview}
                            </Link>
                          ) : (
                            <span className="text-zinc-400">0</span>
                          )}
                        </td>
                      )}

                      {isColVisible("comeByBus") && (
                        <td className="py-2 px-2.5 text-center tabular-nums text-zinc-700 dark:text-zinc-300">
                          {r.comeByBus}
                        </td>
                      )}

                      {isColVisible("accByHR") && (
                        <td className="py-2 px-2.5 text-center font-bold tabular-nums">
                          {r.accByHR > 0 ? (
                            <Link
                              href={`/candidates?demand_id=${encodeURIComponent(r.id_code)}&fromDate=${fromDate}&toDate=${toDate}&reportSource=accHR`}
                              className="text-sky-600 dark:text-sky-400 hover:underline px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/40"
                            >
                              {r.accByHR}
                            </Link>
                          ) : (
                            <span className="text-zinc-400">0</span>
                          )}
                        </td>
                      )}

                      {isColVisible("accByDept") && (
                        <td className="py-2 px-2.5 text-center font-bold tabular-nums">
                          {r.accByDept > 0 ? (
                            <Link
                              href={`/candidates?demand_id=${encodeURIComponent(r.id_code)}&fromDate=${fromDate}&toDate=${toDate}&reportSource=accDept`}
                              className="text-violet-600 dark:text-violet-400 hover:underline px-1.5 py-0.5 rounded bg-violet-50 dark:bg-violet-950/40"
                            >
                              {r.accByDept}
                            </Link>
                          ) : (
                            <span className="text-zinc-400">0</span>
                          )}
                        </td>
                      )}

                      {isColVisible("deptAccRate") && (
                        <td className="py-2 px-2.5 text-center tabular-nums font-semibold text-zinc-700 dark:text-zinc-300">
                          {r.deptAccRate}
                        </td>
                      )}

                      {isColVisible("expectedEnrollDate") && (
                        <td className="py-2 px-2.5 text-center font-bold tabular-nums">
                          {r.expectedEnrollDate > 0 ? (
                            <Link
                              href={`/candidates?demand_id=${encodeURIComponent(r.id_code)}&fromDate=${fromDate}&toDate=${toDate}&reportSource=expToEnroll`}
                              className="text-teal-600 dark:text-teal-400 hover:underline px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40"
                            >
                              {r.expectedEnrollDate}
                            </Link>
                          ) : (
                            <span className="text-zinc-400">0</span>
                          )}
                        </td>
                      )}

                      {isColVisible("actualEnrollDate") && (
                        <td className="py-2 px-2.5 text-center font-extrabold tabular-nums bg-emerald-50/30 dark:bg-emerald-950/10">
                          {r.actualEnrollDate > 0 ? (
                            <Link
                              href={`/candidates?demand_id=${encodeURIComponent(r.id_code)}&fromDate=${fromDate}&toDate=${toDate}&reportSource=enrolled`}
                              className="text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-0.5 rounded bg-emerald-100/70 dark:bg-emerald-950/60"
                            >
                              {r.actualEnrollDate}
                            </Link>
                          ) : (
                            <span className="text-zinc-400">0</span>
                          )}
                        </td>
                      )}

                      {isColVisible("employmentRate") && (
                        <td className="py-2 px-2.5 text-center tabular-nums font-semibold text-zinc-700 dark:text-zinc-300">
                          {r.employmentRate}
                        </td>
                      )}

                      {isColVisible("offerCycleTimeAvg") && (
                        <td className="py-2 px-2.5 text-center tabular-nums text-zinc-700 dark:text-zinc-300">
                          {r.offerCycleTimeAvg}
                        </td>
                      )}

                      {isColVisible("enrolledCycleTimeAvg") && (
                        <td className="py-2 px-2.5 text-center tabular-nums text-zinc-700 dark:text-zinc-300">
                          {r.enrolledCycleTimeAvg}
                        </td>
                      )}

                      {isColVisible("actualVacancies") && (
                        <td className="py-2 px-2.5 text-center font-extrabold tabular-nums bg-amber-50/30 dark:bg-amber-950/10">
                          <span
                            className={
                              r.actualVacancies > 0
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            }
                          >
                            {r.actualVacancies}
                          </span>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Sticky Summary Footer (Total Row) */}
            {filteredRows.length > 0 && (
              <tfoot className="sticky bottom-0 z-20 bg-zinc-100 dark:bg-[#1e1e24] border-t-2 border-rose-500/40 font-extrabold text-xs text-zinc-900 dark:text-white shadow-inner">
                <tr>
                  <td className="py-2.5 px-2.5 text-center text-rose-600 dark:text-rose-400">Σ</td>
                  {isColVisible("id_code") && (
                    <td className="py-2.5 px-2.5 uppercase tracking-wide text-rose-600 dark:text-rose-400">
                      {t("total", "Tổng cộng")} ({filteredRows.length})
                    </td>
                  )}
                  {isColVisible("dem_dept") && <td className="py-2.5 px-2.5"></td>}
                  {isColVisible("dem_sub_department") && <td className="py-2.5 px-2.5"></td>}
                  {isColVisible("dem_unit") && <td className="py-2.5 px-2.5"></td>}
                  {isColVisible("dem_note") && <td className="py-2.5 px-2"></td>}

                  {isColVisible("demand") && (
                    <td className="py-2.5 px-2.5 text-center tabular-nums text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30">
                      {summaryTotals.demand}
                    </td>
                  )}

                  {isColVisible("position") && <td className="py-2.5 px-2.5"></td>}

                  {isColVisible("comeToInterview") && (
                    <td className="py-2.5 px-2.5 text-center tabular-nums text-indigo-600 dark:text-indigo-400">
                      {summaryTotals.comeToInterview}
                    </td>
                  )}

                  {isColVisible("comeByBus") && (
                    <td className="py-2.5 px-2.5 text-center tabular-nums">
                      {summaryTotals.comeByBus}
                    </td>
                  )}

                  {isColVisible("accByHR") && (
                    <td className="py-2.5 px-2.5 text-center tabular-nums text-sky-600 dark:text-sky-400">
                      {summaryTotals.accByHR}
                    </td>
                  )}

                  {isColVisible("accByDept") && (
                    <td className="py-2.5 px-2.5 text-center tabular-nums text-violet-600 dark:text-violet-400">
                      {summaryTotals.accByDept}
                    </td>
                  )}

                  {isColVisible("deptAccRate") && (
                    <td className="py-2.5 px-2.5 text-center tabular-nums">
                      {summaryTotals.deptAccRate}
                    </td>
                  )}

                  {isColVisible("expectedEnrollDate") && (
                    <td className="py-2.5 px-2.5 text-center tabular-nums text-teal-600 dark:text-teal-400">
                      {summaryTotals.expectedEnrollDate}
                    </td>
                  )}

                  {isColVisible("actualEnrollDate") && (
                    <td className="py-2.5 px-2.5 text-center tabular-nums text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30">
                      {summaryTotals.actualEnrollDate}
                    </td>
                  )}

                  {isColVisible("employmentRate") && (
                    <td className="py-2.5 px-2.5 text-center tabular-nums">
                      {summaryTotals.employmentRate}
                    </td>
                  )}

                  {isColVisible("offerCycleTimeAvg") && (
                    <td className="py-2.5 px-2.5 text-center tabular-nums">
                      {summaryTotals.offerCycleTimeAvg}
                    </td>
                  )}

                  {isColVisible("enrolledCycleTimeAvg") && (
                    <td className="py-2.5 px-2.5 text-center tabular-nums">
                      {summaryTotals.enrolledCycleTimeAvg}
                    </td>
                  )}

                  {isColVisible("actualVacancies") && (
                    <td className="py-2.5 px-2.5 text-center tabular-nums text-rose-600 dark:text-rose-400 bg-amber-50/60 dark:bg-amber-950/30">
                      {summaryTotals.actualVacancies}
                    </td>
                  )}
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Bottom Pagination Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#f1f3f6] dark:bg-[#141418] border-t border-[#d8dce2] dark:border-[#26262C] text-xs">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-medium">
            <span>
              {t("showingCandidates", "Hiển thị")}{" "}
              <strong className="text-zinc-900 dark:text-white">{paginatedRows.length}</strong> /{" "}
              <strong className="text-zinc-900 dark:text-white">{filteredRows.length}</strong>{" "}
              {locale === "cn" ? "条记录" : locale === "en" ? "records" : "dòng báo cáo"}
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-7 px-2 rounded bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200"
            >
              {[25, 50, 100, 200, 500].map((sz) => (
                <option key={sz} value={sz}>
                  {sz} / trang
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="h-7 px-2.5 rounded bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 inline-flex items-center gap-1 font-semibold hover:bg-zinc-50 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2.5 font-bold text-zinc-700 dark:text-zinc-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="h-7 px-2.5 rounded bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 inline-flex items-center gap-1 font-semibold hover:bg-zinc-50 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Note Details Modal */}
      {noteModalRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={() => setNoteModalRow(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-[#26262C] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-rose-600 text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <h3 className="text-sm font-bold">
                  {t("noteDetails", "Chi Tiết Ghi Chú")} — {noteModalRow.id_code}
                </h3>
              </div>
              <button
                onClick={() => setNoteModalRow(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                <span>
                  {t("department", "Bộ phận")}:{" "}
                  <strong className="text-zinc-800 dark:text-zinc-200">
                    {noteModalRow.dem_dept} / {getUnitDisplayName(noteModalRow)}
                  </strong>
                </span>
                <span>
                  {t("position", "Vị trí")}:{" "}
                  <strong className="text-zinc-800 dark:text-zinc-200">
                    {noteModalRow.position}
                  </strong>
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {noteModalRow.dem_note}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setNoteModalRow(null)}
                  className="h-8 px-4 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold hover:opacity-90 cursor-pointer"
                >
                  {t("close", "Đóng")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AppDialog
        options={dialog}
        onClose={() => setDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default function RecruitingReportPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center p-8 text-xs text-zinc-500">
          Đang tải Báo Cáo Tuyển Dụng...
        </div>
      }
    >
      <RecruitingReportContent />
    </Suspense>
  );
}
