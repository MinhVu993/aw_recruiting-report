"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserMinus,
  Search,
  X,
  FileSpreadsheet,
  SlidersHorizontal,
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Building,
  Calendar,
  AlertCircle,
  Save,
  Trash2,
  Table,
  BarChart3,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  Car,
  Printer,
  User,
} from "lucide-react";
import { useSession } from "@/context/SessionContext";
import { useTranslation } from "@/hooks/useTranslation";
import * as XLSX from "xlsx";
import { useTableExcelFilter } from "@/hooks/useTableExcelFilter";
import { ExcelColumnFilter } from "@/components/table/ExcelColumnFilter";
import { useDialog } from "@/context/DialogContext";
import { ResignationAnalyticsDashboard } from "./components/ResignationAnalyticsDashboard";
import { parseSeniorityYears, matchesSeniorityRange } from "@/lib/seniority-utils";

interface ResignItem {
  id: number;
  er_empid: string;
  er_name: string;
  er_indate: string;
  er_resigndate: string;
  er_numberid: string;
  er_deptid: string;
  er_deptname: string;
  er_joblevel: string;
  er_age: number;
  er_seniority: number;
  er_bus: string;
  er_gender: string;
  er_hometown: string;
  er_address?: string;
  er_reason: string;
  er_type_resign: string;
  er_note: string;
  loc: string;
}

interface ReasonOption {
  id: number;
  reasonCode: string;
  reasonName: string;
  reason?: string;
}

export interface MatrixRowData {
  dept: string;
  deptName: string;
  totalResign: number;
  age18to30: number;
  age31to45: number;
  age46up: number;
  seniorityLessThan1: number;
  seniority1: number;
  seniority2: number;
  seniority3up: number;
  bus: number;
  genderMale: number;
  genderFemale: number;
  tayNinh: number;
  notTayNinh: number;
  reasonHometown: number;
  reasonStudy: number;
  reasonWorkIsUnsuitable: number;
  reasonOther: number;
  reasonAbsenteeismForFiveDays: number;
  reasonReturnHomeToTakeCareOfChildren: number;
  reasonPersonalReasons: number;
  reasonHealthIsNotSufficientToContinueWorking: number;
  reasonFamilyMatters: number;
  reasonMisconductDismissedByTheCompany: number;
  reasonContractExpired: number;
  reasonFoundANewJob: number;
  reasonFailedProbationPeriod: number;
}

const MATRIX_COLUMNS: {
  key: keyof Omit<MatrixRowData, "dept" | "deptName">;
  labelVI: string;
  labelCN: string;
  headerLines: string[];
}[] = [
  { key: "totalResign", labelVI: "Tổng", labelCN: "总计", headerLines: ["TỔNG"] },
  { key: "age18to30", labelVI: "Tuổi [18-30]", labelCN: "年龄[18-30]", headerLines: ["TUỔI", "[18-30]"] },
  { key: "age31to45", labelVI: "Tuổi [31-45]", labelCN: "年龄[31-45]", headerLines: ["TUỔI", "[31-45]"] },
  { key: "age46up", labelVI: "Tuổi [>46]", labelCN: "年龄[>46]", headerLines: ["TUỔI", "[>46]"] },
  { key: "seniorityLessThan1", labelVI: "Thâm Niên [<1 Năm]", labelCN: "年资[<1年]", headerLines: ["THÂM NIÊN", "[<1 NĂM]"] },
  { key: "seniority1", labelVI: "Thâm Niên [1 Năm]", labelCN: "年资[1年]", headerLines: ["THÂM NIÊN", "[1 NĂM]"] },
  { key: "seniority2", labelVI: "Thâm Niên [2 Năm]", labelCN: "年资[2年]", headerLines: ["THÂM NIÊN", "[2 NĂM]"] },
  { key: "seniority3up", labelVI: "Thâm Niên [>3 Năm]", labelCN: "年资[>3年]", headerLines: ["THÂM NIÊN", "[>3 NĂM]"] },
  { key: "bus", labelVI: "Dịch Vụ Xe Buýt", labelCN: "厂车", headerLines: ["DỊCH VỤ", "XE BUÝT"] },
  { key: "genderMale", labelVI: "Nam", labelCN: "男", headerLines: ["NAM"] },
  { key: "genderFemale", labelVI: "Nữ", labelCN: "女", headerLines: ["NỮ"] },
  { key: "tayNinh", labelVI: "Tây Ninh", labelCN: "西宁", headerLines: ["TÂY NINH"] },
  { key: "notTayNinh", labelVI: "Địa Điểm Khác", labelCN: "外省", headerLines: ["ĐỊA ĐIỂM", "KHÁC"] },
  { key: "reasonHometown", labelVI: "Về Quê", labelCN: "回乡", headerLines: ["VỀ", "QUÊ"] },
  { key: "reasonStudy", labelVI: "Đi Học", labelCN: "进修", headerLines: ["ĐI", "HỌC"] },
  { key: "reasonWorkIsUnsuitable", labelVI: "Công Việc Không Phù Hợp", labelCN: "工作不适应", headerLines: ["CÔNG VIỆC", "KHÔNG", "PHÙ HỢP"] },
  { key: "reasonOther", labelVI: "Khác", labelCN: "其他", headerLines: ["KHÁC"] },
  { key: "reasonAbsenteeismForFiveDays", labelVI: "Vắng Mặt 5 Ngày KP", labelCN: "旷工5天", headerLines: ["VẮNG MẶT", "5 NGÀY KP"] },
  { key: "reasonReturnHomeToTakeCareOfChildren", labelVI: "Chăm Sóc Con Nhỏ", labelCN: "回家带小孩", headerLines: ["CHĂM SÓC", "CON NHỎ"] },
  { key: "reasonPersonalReasons", labelVI: "Lý Do Cá Nhân", labelCN: "个人原因", headerLines: ["LÝ DO", "CÁ NHÂN"] },
  { key: "reasonHealthIsNotSufficientToContinueWorking", labelVI: "Sức Khỏe Không Tốt", labelCN: "身体不佳", headerLines: ["SỨC KHỎE", "KHÔNG TỐT"] },
  { key: "reasonFamilyMatters", labelVI: "Vấn Đề Gia Đình", labelCN: "家中有事", headerLines: ["VẤN ĐỀ", "GIA ĐÌNH"] },
  { key: "reasonMisconductDismissedByTheCompany", labelVI: "Hành Vi Xấu Sai Trái", labelCN: "不良行为解雇", headerLines: ["HÀNH VI", "XẤU SAI TRÁI"] },
  { key: "reasonContractExpired", labelVI: "Hợp Đồng Hết Hạn", labelCN: "合同期满", headerLines: ["HỢP ĐỒNG", "HẾT HẠN"] },
  { key: "reasonFoundANewJob", labelVI: "Tìm Được Việc Mới", labelCN: "另谋高就", headerLines: ["TÌM ĐƯỢC", "VIỆC MỚI"] },
  { key: "reasonFailedProbationPeriod", labelVI: "Thử Việc Không Đạt", labelCN: "试用期不合格", headerLines: ["THỬ VIỆC", "KHÔNG ĐẠT"] },
];

function classifyReasonKey(rawReason: string): keyof Pick<
  MatrixRowData,
  | "reasonHometown"
  | "reasonStudy"
  | "reasonWorkIsUnsuitable"
  | "reasonOther"
  | "reasonAbsenteeismForFiveDays"
  | "reasonReturnHomeToTakeCareOfChildren"
  | "reasonPersonalReasons"
  | "reasonHealthIsNotSufficientToContinueWorking"
  | "reasonFamilyMatters"
  | "reasonMisconductDismissedByTheCompany"
  | "reasonContractExpired"
  | "reasonFoundANewJob"
  | "reasonFailedProbationPeriod"
> {
  if (!rawReason) return "reasonOther";
  const s = rawReason.toLowerCase().trim();

  // 1: Về quê
  if (s === "1" || s.includes("về quê") || s.includes("ve que")) return "reasonHometown";
  // 2: Đi học
  if (s === "2" || s.includes("đi học") || s.includes("di hoc")) return "reasonStudy";
  // 3: Công việc không phù hợp
  if (s === "3" || s.includes("không phù hợp") || s.includes("khong phu hop")) return "reasonWorkIsUnsuitable";
  // 5: Vắng 5 ngày không có lý do / Vắng mặt 5 ngày KP
  if (s === "5" || s.includes("vắng") || s.includes("vang") || s.includes("5 ngày") || s.includes("5 ngay") || s.includes("kp")) return "reasonAbsenteeismForFiveDays";
  // 6: Về nhà chăm con / Chăm sóc con nhỏ
  if (s === "6" || s.includes("chăm con") || s.includes("cham con") || s.includes("con nhỏ") || s.includes("con nho")) return "reasonReturnHomeToTakeCareOfChildren";
  // 7: Việc riêng / Lý do cá nhân
  if (s === "7" || s.includes("việc riêng") || s.includes("viec rieng") || s.includes("cá nhân") || s.includes("ca nhan")) return "reasonPersonalReasons";
  // 8: Không đủ sức khoẻ / Sức khỏe không tốt
  if (s === "8" || s.includes("sức khoẻ") || s.includes("sức khỏe") || s.includes("suc khoe")) return "reasonHealthIsNotSufficientToContinueWorking";
  // 9: Bận việc nhà / Vấn đề gia đình / Việc gia đình
  if (s === "9" || s.includes("việc nhà") || s.includes("viec nha") || s.includes("gia đình") || s.includes("gia dinh")) return "reasonFamilyMatters";
  // 10: Hành vi xấu sa thải / Hành vi xấu sai trái
  if (s === "10" || s.includes("hành vi") || s.includes("hanh vi") || s.includes("sa thải") || s.includes("sa thai") || s.includes("sai trái")) return "reasonMisconductDismissedByTheCompany";
  // 11: Hết hạn hợp đồng / Hợp đồng hết hạn
  if (s === "11" || s.includes("hết hạn") || s.includes("het han") || s.includes("hợp đồng") || s.includes("hop dong")) return "reasonContractExpired";
  // 12: Tìm được công việc khác / Tìm được việc mới
  if (s === "12" || s.includes("việc mới") || s.includes("viec moi") || s.includes("công việc khác") || s.includes("cong viec khac")) return "reasonFoundANewJob";
  // 13: Thử việc không đạt
  if (s === "13" || s.includes("thử việc") || s.includes("thu viec")) return "reasonFailedProbationPeriod";

  // 4: Khác
  return "reasonOther";
}

// Helpers for month calculation
function getMonthRange(monthStr: string): { from: string; to: string } {
  if (!monthStr) return { from: "", to: "" };
  const [yearStr, monthNumStr] = monthStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthNumStr, 10);
  const lastDay = new Date(year, month, 0).getDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    from: `${year}-${pad(month)}-01`,
    to: `${year}-${pad(month)}-${pad(lastDay)}`,
  };
}

function shiftMonth(monthStr: string, offset: number): string {
  if (!monthStr) return monthStr;
  const [yearStr, monthNumStr] = monthStr.split("-");
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthNumStr, 10) + offset;
  while (month > 12) {
    year += 1;
    month -= 12;
  }
  while (month < 1) {
    year -= 1;
    month += 12;
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${year}-${pad(month)}`;
}

function ResignContent() {
  const { selectedFactory, setSelectedFactory, isUserOnly } = useSession();
  const { showError, showWarning, showSuccess, showConfirm } = useDialog();
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  // Read Drill-Through URL parameters
  const paramJobLevel = searchParams.get("jobLevel") || searchParams.get("position");
  const paramReason = searchParams.get("reason");
  const paramSeniority = searchParams.get("seniority");
  const paramDept = searchParams.get("dept");
  const paramGender = searchParams.get("gender");
  const paramAgeGroup = searchParams.get("ageGroup");
  const paramLoc = searchParams.get("loc");
  const paramTimeRange = searchParams.get("timeRange");
  const paramStartDate = searchParams.get("startDate") || searchParams.get("fromDate");
  const paramEndDate = searchParams.get("endDate") || searchParams.get("toDate");

  // Mode: "list" (Danh sách) | "report" (Báo cáo ma trận 27 cột) | "chart" (Biểu đồ phân tích)
  const [viewMode, setViewMode] = useState<"list" | "report" | "chart">("list");

  // Data states
  const [resignations, setResignations] = useState<ResignItem[]>([]);
  const [reasonsList, setReasonsList] = useState<ReasonOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Month & Date filters (Hiển thị theo tháng mặc định để tối ưu tốc độ và giảm tải)
  const defaultMonth = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const hasDrillThroughFilters = Boolean(
    paramJobLevel || paramReason || paramSeniority || paramDept || paramGender || paramAgeGroup
  );

  const initialDateMode: "month" | "range" | "all" = (() => {
    if (paramTimeRange === "all" || (hasDrillThroughFilters && !paramStartDate && !paramEndDate && (!paramTimeRange || paramTimeRange === "all"))) {
      return "all";
    }
    if (paramStartDate && paramEndDate) return "range";
    if (paramTimeRange === "month" || (!paramTimeRange && !hasDrillThroughFilters)) return "month";
    return "all";
  })();

  const [dateMode, setDateMode] = useState<"month" | "range" | "all">(initialDateMode);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [fromDate, setFromDate] = useState<string>(() => {
    if (initialDateMode === "all") return "";
    if (paramStartDate) return paramStartDate;
    const d = new Date();
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return getMonthRange(m).from;
  });
  const [toDate, setToDate] = useState<string>(() => {
    if (initialDateMode === "all") return "";
    if (paramEndDate) return paramEndDate;
    const d = new Date();
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return getMonthRange(m).to;
  });

  const handleMonthSelect = (m: string) => {
    setSelectedMonth(m);
    const range = getMonthRange(m);
    setFromDate(range.from);
    setToDate(range.to);
    setPage(1);
  };

  const handleShiftMonth = (offset: number) => {
    const newM = shiftMonth(selectedMonth, offset);
    handleMonthSelect(newM);
  };

  const handleDateModeChange = (mode: "month" | "range" | "all") => {
    setDateMode(mode);
    setPage(1);
    if (mode === "month") {
      const range = getMonthRange(selectedMonth);
      setFromDate(range.from);
      setToDate(range.to);
    } else if (mode === "all") {
      setFromDate("");
      setToDate("");
    }
  };

  // Filters
  const [search, setSearch] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedReason, setSelectedReason] = useState<string>("all");
  const [matrixDeptSearch, setMatrixDeptSearch] = useState<string>("");

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Column visibility
  const [showColumnDialog, setShowColumnDialog] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    er_empid: true,
    photo: true,
    er_name: true,
    er_indate: true,
    er_resigndate: true,
    er_numberid: true,
    er_deptid: true,
    er_deptname: true,
    er_joblevel: true,
    er_age: true,
    er_seniority: true,
    er_bus: false,
    er_gender: true,
    er_hometown: false,
    er_reason: true,
    er_type_resign: true,
    er_note: true,
  });

  // Ẩn hoàn toàn cột Quê quán (er_hometown) & Xe đưa rước (er_bus) cho tất cả (bao gồm admin & user) giống app cũ
  // Role user ẩn thêm các cột nhạy cảm khác: er_age, er_seniority, er_gender
  const isColVisible = (key: string) => {
    if (key === "er_bus" || key === "er_hometown") {
      return false;
    }
    if (isUserOnly && ["er_age", "er_seniority", "er_gender"].includes(key)) {
      return false;
    }
    return !!visibleColumns[key];
  };

  const [previewPhotoItem, setPreviewPhotoItem] = useState<ResignItem | null>(null);

  const getResignPhotoUrl = (item: ResignItem): string | null => {
    if (!item.er_empid || item.er_empid.trim() === "" || item.er_empid === "-") return null;
    const rawLoc = (item.loc || "dmc").toLowerCase();
    const cleanLoc = rawLoc === "tb" ? "tb" : rawLoc === "tc" || rawLoc === "vg3" ? "tc" : "dmc";
    return `/api/epm-photo/${cleanLoc}/${encodeURIComponent(item.er_empid.trim())}`;
  };

  // Modal Input / Edit
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchingEmp, setSearchingEmp] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);

  // Form inputs
  const [form, setForm] = useState({
    empno: "",
    name: "",
    numid: "",
    gender: "",
    age: "",
    inDate: "",
    dept: "",
    deptName: "",
    position: "",
    seniority: "",
    hometown: "",
    address: "",
    vehicle: "Tự túc",
    dateResign: new Date().toISOString().split("T")[0],
    reason: "",
    typeResign: "Tự ý nghỉ việc",
    note: "",
    loc: "dmc",
  });

  // Fetch reasons list
  const fetchReasons = async () => {
    try {
      const res = await fetch("/api/resign/reasons");
      const json = await res.json();
      if (json.data) {
        setReasonsList(json.data);
      }
    } catch (e) {
      // ignore
    }
  };

  // Fetch resignations list
  const fetchResignations = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      const effectiveLoc = paramLoc || selectedFactory;
      if (effectiveLoc !== "all") query.set("loc", effectiveLoc);
      if (paramDept) {
        query.set("dept", paramDept);
      } else if (selectedDept !== "all") {
        query.set("dept", selectedDept);
      }
      if (fromDate) query.set("fromDate", fromDate);
      if (toDate) query.set("toDate", toDate);
      if (search) query.set("search", search);
      query.set("limit", "all");

      const res = await fetch(`/api/resign?${query.toString()}`);
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setResignations(json.data);
      } else {
        setResignations([]);
      }
    } catch (e) {
      setResignations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReasons();
  }, []);

  useEffect(() => {
    fetchResignations();
    setPage(1);
  }, [selectedFactory, paramLoc, selectedDept, paramDept, fromDate, toDate]);

  // Unique departments for filter dropdown
  const uniqueDepts = useMemo(() => {
    const set = new Set<string>();
    resignations.forEach((r) => {
      const d = r.er_deptname || r.er_deptid;
      if (d) set.add(d);
    });
    return Array.from(set).sort();
  }, [resignations]);

  // Full dataset for analytics charts (before reason filter is applied)
  const allResignationsForAnalytics = useMemo(() => {
    if (!search || !search.trim()) return resignations;
    const s = search.toLowerCase().trim();
    return resignations.filter((r) => {
      return (
        r.er_empid?.toLowerCase().includes(s) ||
        r.er_name?.toLowerCase().includes(s) ||
        r.er_numberid?.includes(s) ||
        r.er_deptname?.toLowerCase().includes(s) ||
        r.er_deptid?.toLowerCase().includes(s) ||
        r.er_reason?.toLowerCase().includes(s)
      );
    });
  }, [resignations, search]);

  // Base dataset (with all drill-through parameters applied directly)
  const baseResignations = useMemo(() => {
    let list = allResignationsForAnalytics;

    // Factory location filter
    const effectiveLoc = paramLoc || selectedFactory;
    if (effectiveLoc !== "all") {
      const target = effectiveLoc === "vg" ? "dmc" : effectiveLoc.toLowerCase();
      list = list.filter((r) => {
        const rawLoc = (r.loc || "dmc").toLowerCase();
        const rLoc = rawLoc === "vg" ? "dmc" : rawLoc;
        return rLoc === target;
      });
    }

    // Filter by Reason (Lý do thôi việc)
    const effectiveReason = paramReason || (selectedReason !== "all" ? selectedReason : null);
    if (effectiveReason) {
      const sr = effectiveReason.toLowerCase().trim();
      list = list.filter((r) => {
        const rr = (r.er_reason || "").toLowerCase().trim();
        return rr === sr || rr.includes(sr) || sr.includes(rr);
      });
    }

    // Filter by Seniority (Thâm niên thôi việc)
    if (paramSeniority) {
      list = list.filter((r) => {
        const s = parseSeniorityYears(r.er_seniority);
        return matchesSeniorityRange(s, paramSeniority);
      });
    }

    // Filter by Department (Mã bộ phận / Tên bộ phận)
    const effectiveDept = selectedDept !== "all" ? selectedDept : paramDept;
    if (effectiveDept) {
      const pD = effectiveDept.toLowerCase().trim();
      list = list.filter((r) => {
        const dId = (r.er_deptid || "").toLowerCase().trim();
        const dName = (r.er_deptname || "").toLowerCase().trim();
        return dId === pD || dId.includes(pD) || pD.includes(dId) || dName.includes(pD) || pD.includes(dName);
      });
    }

    // Filter by Job Level (Chức vụ thôi việc)
    if (paramJobLevel) {
      const pJ = paramJobLevel.toLowerCase().trim();
      list = list.filter((r) => {
        const jl = (r.er_joblevel || "").toLowerCase().trim();
        return jl === pJ || jl.includes(pJ) || pJ.includes(jl);
      });
    }

    // Filter by Gender (Giới tính thôi việc)
    if (paramGender) {
      const pG = paramGender.toLowerCase().trim();
      const isLookingForFemale = pG === "nữ" || pG === "nu" || pG === "f" || pG === "1";
      list = list.filter((r) => {
        const g = (r.er_gender || "").toLowerCase().trim();
        const isRowFemale = g === "nữ" || g === "nu" || g === "f" || g === "1";
        return isLookingForFemale ? isRowFemale : !isRowFemale;
      });
    }

    // Filter by Age Group (Độ tuổi thôi việc)
    if (paramAgeGroup) {
      const cleanAgeGroup = paramAgeGroup.replace(/\s*tuổi\s*/gi, "").trim();
      list = list.filter((r) => {
        const age = Number(r.er_age) || 0;
        if (!age) return false;
        if (cleanAgeGroup === "< 20" || cleanAgeGroup === "18 - 20") return age <= 20;
        if (cleanAgeGroup === "20 - 30" || cleanAgeGroup === "21 - 30" || cleanAgeGroup === "18 - 30") return age >= 18 && age <= 30;
        if (cleanAgeGroup === "31 - 40") return age >= 31 && age <= 40;
        if (cleanAgeGroup === "31 - 45") return age >= 31 && age <= 45;
        if (cleanAgeGroup === "41 - 50") return age >= 41 && age <= 50;
        if (cleanAgeGroup === "> 50") return age > 50;
        if (cleanAgeGroup === "> 46") return age >= 46;
        return true;
      });
    }

    return list;
  }, [
    allResignationsForAnalytics,
    selectedFactory,
    paramLoc,
    selectedDept,
    selectedReason,
    paramReason,
    paramSeniority,
    paramDept,
    paramJobLevel,
    paramGender,
    paramAgeGroup,
  ]);

  // Excel multi-column filtering and sorting
  const {
    filteredData: filteredResignations,
    filters: excelFilters,
    sortConfig,
    getDistinctValues,
    setFilter,
    setSort,
    resetFilter,
    resetAllFilters,
    activeFilterCount,
  } = useTableExcelFilter(baseResignations, {
    customExtractors: {
      er_gender: (r) =>
        r.er_gender === "M" || r.er_gender === "Nam"
          ? "Nam"
          : r.er_gender === "F" || r.er_gender === "Nữ"
          ? "Nữ"
          : r.er_gender || "",
      er_age: (r) => (r.er_age ? Number(r.er_age) : null),
      er_seniority: (r) => (r.er_seniority ? parseSeniorityYears(r.er_seniority) : null),
      er_note: (r) => r.er_note || "",
    },
    defaultSort: { key: "er_resigndate", direction: "desc" },
  });

  // Sync factory from URL query
  useEffect(() => {
    if (paramLoc && paramLoc !== selectedFactory && (paramLoc === "all" || paramLoc === "dmc" || paramLoc === "tb" || paramLoc === "tc")) {
      setSelectedFactory(paramLoc);
    }
  }, [paramLoc]);


  // Sync date range or all time from URL query
  useEffect(() => {
    if (paramTimeRange === "all" || (hasDrillThroughFilters && !paramStartDate && !paramEndDate && (!paramTimeRange || paramTimeRange === "all"))) {
      handleDateModeChange("all");
    } else if (paramStartDate && paramEndDate) {
      setDateMode("range");
      setFromDate(paramStartDate);
      setToDate(paramEndDate);
      setPage(1);
    }
  }, [paramTimeRange, paramStartDate, paramEndDate, hasDrillThroughFilters]);

  // Paginated dataset
  const paginatedResignations = useMemo(() => {
    if (pageSize === -1) return filteredResignations;
    const start = (page - 1) * pageSize;
    return filteredResignations.slice(start, start + pageSize);
  }, [filteredResignations, page, pageSize]);

  const totalPages = pageSize === -1 ? 1 : Math.ceil(filteredResignations.length / pageSize) || 1;

  // Totals & Averages for sticky footer
  const statsSummary = useMemo(() => {
    const count = filteredResignations.length;
    if (count === 0) return { count: 0, avgAge: 0, avgSeniority: 0 };

    const totalAge = filteredResignations.reduce((acc, cur) => acc + (Number(cur.er_age) || 0), 0);
    const totalSeniority = filteredResignations.reduce((acc, cur) => acc + parseSeniorityYears(cur.er_seniority), 0);

    return {
      count,
      avgAge: Math.round(totalAge / count),
      avgSeniority: Number((totalSeniority / count).toFixed(1)),
    };
  }, [filteredResignations]);

  // Matrix Report calculations (grouped by department with all 27 columns from legacy app)
  // Lazy evaluated only when user enters 'report' or 'chart' tab
  const matrixReportData = useMemo<MatrixRowData[]>(() => {
    if (viewMode !== "report" && viewMode !== "chart") return [];
    const map: Record<string, MatrixRowData> = {};

    filteredResignations.forEach((r) => {
      // Group by department ID (like VVG0PDS1722 in legacy app) or name
      const d = r.er_deptid || r.er_deptname || "Chưa phân bộ phận";
      const dName = r.er_deptname || "";

      if (!map[d]) {
        map[d] = {
          dept: d,
          deptName: dName,
          totalResign: 0,
          age18to30: 0,
          age31to45: 0,
          age46up: 0,
          seniorityLessThan1: 0,
          seniority1: 0,
          seniority2: 0,
          seniority3up: 0,
          bus: 0,
          genderMale: 0,
          genderFemale: 0,
          tayNinh: 0,
          notTayNinh: 0,
          reasonHometown: 0,
          reasonStudy: 0,
          reasonWorkIsUnsuitable: 0,
          reasonOther: 0,
          reasonAbsenteeismForFiveDays: 0,
          reasonReturnHomeToTakeCareOfChildren: 0,
          reasonPersonalReasons: 0,
          reasonHealthIsNotSufficientToContinueWorking: 0,
          reasonFamilyMatters: 0,
          reasonMisconductDismissedByTheCompany: 0,
          reasonContractExpired: 0,
          reasonFoundANewJob: 0,
          reasonFailedProbationPeriod: 0,
        };
      }

      map[d].totalResign += 1;

      // Age brackets: 18-30, 31-45, >46
      const age = Number(r.er_age) || 0;
      if (age >= 18 && age <= 30) map[d].age18to30 += 1;
      else if (age >= 31 && age <= 45) map[d].age31to45 += 1;
      else if (age > 45) map[d].age46up += 1;

      // Seniority brackets: <1, 1, 2, >3
      const sen = parseSeniorityYears(r.er_seniority);
      if (sen < 1) map[d].seniorityLessThan1 += 1;
      else if (sen >= 1 && sen < 2) map[d].seniority1 += 1;
      else if (sen >= 2 && sen < 3) map[d].seniority2 += 1;
      else map[d].seniority3up += 1;

      // Gender: Nam / Nữ
      const g = (r.er_gender || "").toLowerCase().trim();
      if (g === "nam" || g === "m" || g === "male") {
        map[d].genderMale += 1;
      } else {
        map[d].genderFemale += 1;
      }

      // Bus: Xe đưa rước / Xe buýt
      const busStr = (r.er_bus || "").toLowerCase();
      if (
        busStr.includes("xe đưa rước") ||
        busStr.includes("xe buýt") ||
        (busStr && !busStr.includes("tự túc") && !busStr.includes("tu tuc"))
      ) {
        map[d].bus += 1;
      }

      // Location: Tây Ninh / Địa điểm khác
      const addr = (r.er_address || "").toLowerCase();
      const ht = (r.er_hometown || "").toLowerCase();
      if (
        addr.includes("tây ninh") ||
        addr.includes("tay ninh") ||
        ht.includes("tây ninh") ||
        ht.includes("tay ninh")
      ) {
        map[d].tayNinh += 1;
      } else {
        map[d].notTayNinh += 1;
      }

      // Reason column mapping (13 individual reason columns)
      const rKey = classifyReasonKey(r.er_reason || "");
      map[d][rKey] += 1;
    });

    return Object.values(map).sort((a, b) => b.totalResign - a.totalResign);
  }, [filteredResignations, viewMode]);

  // Filtered Matrix Data by in-card search
  const displayedMatrixData = useMemo(() => {
    if (viewMode !== "report") return [];
    if (!matrixDeptSearch.trim()) return matrixReportData;
    const s = matrixDeptSearch.toLowerCase().trim();
    return matrixReportData.filter(
      (r) => r.dept.toLowerCase().includes(s) || r.deptName.toLowerCase().includes(s)
    );
  }, [matrixReportData, matrixDeptSearch, viewMode]);

  // Totals across all departments in the matrix for all 26 metric columns
  const matrixTotals = useMemo(() => {
    if (viewMode !== "report") return {};
    const totals: Record<string, number> = {};
    MATRIX_COLUMNS.forEach((col) => {
      totals[col.key] = 0;
    });

    return matrixReportData.reduce((acc, row) => {
      MATRIX_COLUMNS.forEach((col) => {
        acc[col.key] = (acc[col.key] || 0) + row[col.key];
      });
      return acc;
    }, totals);
  }, [matrixReportData, viewMode]);

  // Overall Reason breakdown with percentage (across all reasons for the current date/factory filters)
  // Only calculated when in 'chart' mode
  const reasonBreakdown = useMemo(() => {
    if (viewMode !== "chart") return [];
    const total = allResignationsForAnalytics.length;
    if (total === 0) return [];

    const map: Record<string, number> = {};
    allResignationsForAnalytics.forEach((r) => {
      const re = r.er_reason || "Khác";
      map[re] = (map[re] || 0) + 1;
    });

    return Object.entries(map)
      .map(([reason, count]) => ({
        reason,
        count,
        pct: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [allResignationsForAnalytics, viewMode]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearch("");
    setSelectedDept("all");
    setSelectedReason("all");
    setDateMode("month");
    setSelectedMonth(defaultMonth);
    const range = getMonthRange(defaultMonth);
    setFromDate(range.from);
    setToDate(range.to);
    setMatrixDeptSearch("");
  };

  // Handle Sync Daily Resign from HRM SOAP SCS005
  const handleSyncDailyResign = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/resign/sync-daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (json.success) {
        showSuccess(
          "Đồng Bộ Thành Công",
          json.message || "Đã đồng bộ dữ liệu thôi việc mới nhất từ hệ thống HRM!"
        );
        await fetchResignations();
      } else {
        showError(
          "Lỗi Đồng Bộ",
          json.message || "Không thể đồng bộ danh sách thôi việc."
        );
      }
    } catch (err: any) {
      showError("Lỗi Kết Nối", err?.message || "Lỗi khi gọi API đồng bộ danh sách thôi việc.");
    } finally {
      setSyncing(false);
    }
  };

  // Open modal create
  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      empno: "",
      name: "",
      numid: "",
      gender: "",
      age: "",
      inDate: "",
      dept: "",
      deptName: "",
      position: "",
      seniority: "",
      hometown: "",
      address: "",
      vehicle: "",
      dateResign: new Date().toISOString().split("T")[0],
      reason: reasonsList[0]?.reasonName || reasonsList[0]?.reason || "",
      typeResign: "",
      note: "",
      loc: selectedFactory === "all" ? "dmc" : selectedFactory,
    });
    setModalOpen(true);
  };

  // Open modal edit
  const handleOpenEdit = (item: ResignItem) => {
    setEditingId(item.id);
    setForm({
      empno: item.er_empid,
      name: item.er_name,
      numid: item.er_numberid,
      gender: item.er_gender,
      age: String(item.er_age || ""),
      inDate: item.er_indate,
      dept: item.er_deptid,
      deptName: item.er_deptname,
      position: item.er_joblevel,
      seniority: String(item.er_seniority || ""),
      hometown: item.er_hometown,
      address: "",
      vehicle: item.er_bus,
      dateResign: item.er_resigndate,
      reason: item.er_reason,
      typeResign: item.er_type_resign,
      note: item.er_note,
      loc: item.loc,
    });
    setModalOpen(true);
  };

  // Auto lookup employee info by empno
  const handleLookupEmpno = async (empCode?: string, targetLoc?: string) => {
    const targetEmpno = empCode || form.empno;
    const lookupLoc = targetLoc || form.loc;
    if (!targetEmpno || targetEmpno.length < 4) return;

    setSearchingEmp(true);
    try {
      const res = await fetch(`/api/resign/employee?empno=${targetEmpno.trim()}&loc=${lookupLoc}`);
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setForm((prev) => ({
          ...prev,
          name: d.name || prev.name,
          numid: d.numid || prev.numid,
          gender: d.gender || prev.gender,
          age: d.age ? String(d.age) : prev.age,
          inDate: d.inDate || prev.inDate,
          dept: d.dept || prev.dept,
          deptName: d.deptName || prev.deptName,
          position: d.position || prev.position,
          seniority: d.seniority !== undefined ? String(d.seniority) : prev.seniority,
          hometown: d.hometown || prev.hometown,
          address: d.address || prev.address,
        }));
      }
    } catch (err) {
      // ignore
    } finally {
      setSearchingEmp(false);
    }
  };

  // Save / Update resignation
  const handleSaveResign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.empno || !form.name) {
      showWarning("Thiếu Thông Tin", "Vui lòng nhập Mã thẻ nhân viên và Họ tên");
      return;
    }

    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const payload = {
        id: editingId,
        empno: form.empno,
        candidateName: form.name,
        dept: form.deptName || form.dept,
        loc: form.loc,
        inDate: form.inDate || null,
        outDate: form.dateResign,
        reasonName: form.reason,
        notes: form.note,
        vehicle: form.vehicle,
        typeResign: form.typeResign,
      };

      const res = await fetch("/api/resign", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setModalOpen(false);
        showSuccess(
          editingId ? "Cập Nhật Thành Công" : "Lưu Thành Công",
          `Đã ${editingId ? "cập nhật" : "lưu"} thông tin thôi việc của nhân viên [${form.empno} - ${form.name}] thành công.`
        );
        fetchResignations();
      } else {
        showError("Lỗi Lưu Dữ Liệu", json.error || "Lỗi khi lưu dữ liệu");
      }
    } catch (err) {
      showError("Lỗi Kết Nối", "Không thể kết nối đến máy chủ.");
    } finally {
      setSaving(false);
    }
  };

  // Delete resignation
  const handleDeleteResign = () => {
    if (!editingId) return;
    showConfirm({
      type: "danger",
      title: "Xác Nhận Xóa Thôi Việc",
      message: `Bạn có chắc chắn muốn xóa lượt thôi việc của NV [${form.empno} - ${form.name}] không?`,
      confirmText: "Xóa lượt thôi việc",
      cancelText: "Hủy bỏ",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/resign?id=${editingId}`, { method: "DELETE" });
          const json = await res.json();
          if (json.success) {
            setModalOpen(false);
            showSuccess("Đã Xóa", "Đã xóa bản ghi thôi việc thành công.");
            fetchResignations();
          } else {
            showError("Lỗi Khi Xóa", json.error || "Lỗi khi xóa dữ liệu");
          }
        } catch (e) {
          showError("Lỗi Kết Nối", "Lỗi máy chủ khi xóa");
        }
      },
    });
  };

  // Export to Excel (Bilingual 2-Row Header)
  const handleExportExcel = () => {
    const headersVI = [
      "STT",
      "Mã NV",
      "Họ và Tên",
      "Ngày Vào Làm",
      "Ngày Thôi Việc",
      "Số CCCD",
      "Mã Đơn Vị",
      "Tên Đơn Vị",
      "Chức Vụ",
      "Tuổi",
      "Thâm Niên (Năm)",
      "Phương Tiện",
      "Giới Tính",
      "Quê Quán",
      "Lý Do Thôi Việc",
      "Phân Loại Thôi Việc",
      "Ghi Chú",
      "Xưởng",
    ];

    const headersCN = [
      "序号",
      "工号",
      "姓名",
      "入职日期",
      "离职日期",
      "身份证号",
      "单位编号",
      "部门名称",
      "职位",
      "年龄",
      "年资(年)",
      "交通方式",
      "性别",
      "籍贯",
      "离职原因",
      "离职类型",
      "备注",
      "厂区",
    ];

    const dataRows = filteredResignations.map((item, idx) => [
      idx + 1,
      item.er_empid,
      item.er_name,
      item.er_indate,
      item.er_resigndate,
      item.er_numberid,
      item.er_deptid,
      item.er_deptname,
      item.er_joblevel,
      item.er_age,
      item.er_seniority,
      item.er_bus,
      item.er_gender,
      item.er_hometown,
      item.er_reason,
      item.er_type_resign,
      item.er_note,
      item.loc.toUpperCase(),
    ]);

    const ws = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, [headersVI], { origin: "A1" });
    XLSX.utils.sheet_add_aoa(ws, [headersCN], { origin: "A2" });
    XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: "A3" });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resignation Listing");

    const fileName = `danh_sach_thoi_viec_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Export Matrix Report to Excel with all 27 columns
  const handleExportMatrixExcel = () => {
    const headersVI = ["STT", "Bộ Phận", ...MATRIX_COLUMNS.map((col) => col.labelVI)];
    const headersCN = ["序号", "部门", ...MATRIX_COLUMNS.map((col) => col.labelCN)];

    const dataRows = displayedMatrixData.map((row, idx) => [
      idx + 1,
      row.dept,
      ...MATRIX_COLUMNS.map((col) => row[col.key]),
    ]);

    const totalRow = [
      "",
      "TỔNG CỘNG / 总计",
      ...MATRIX_COLUMNS.map((col) => matrixTotals[col.key]),
    ];

    const ws = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, [headersVI], { origin: "A1" });
    XLSX.utils.sheet_add_aoa(ws, [headersCN], { origin: "A2" });
    XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: "A3" });
    XLSX.utils.sheet_add_aoa(ws, [totalRow], { origin: `A${dataRows.length + 3}` });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Matrix Report");

    const fileName = `bao_cao_ma_tran_thoi_viec_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Print Resignation List (High fidelity to legacy template-print/resign.vue)
  const handlePrintResignList = () => {
    if (filteredResignations.length === 0) {
      showWarning("Không Có Dữ Liệu", "Không có nhân viên thôi việc nào phù hợp với bộ lọc hiện tại để in.");
      return;
    }

    let dateRangeLabel = "";
    if (dateMode === "month") {
      dateRangeLabel = `Tháng ${selectedMonth}`;
    } else if (dateMode === "range") {
      dateRangeLabel = fromDate && toDate ? `${fromDate} ~ ${toDate}` : fromDate ? `Từ ${fromDate}` : toDate ? `Đến ${toDate}` : "Tất cả";
    } else {
      dateRangeLabel = "Tất cả các năm";
    }

    if (selectedFactory && selectedFactory !== "all") {
      dateRangeLabel += ` - Xưởng ${selectedFactory.toUpperCase()}`;
    }

    // Only keep essential fields for printable report to avoid localStorage quota issues
    const minimalData = filteredResignations.map((item, idx) => ({
      id: item.id || idx + 1,
      er_empid: item.er_empid,
      er_name: item.er_name,
      er_deptname: item.er_deptname || item.er_deptid || "-",
      er_deptid: item.er_deptid,
      er_reason: item.er_reason || "-",
      er_type_resign: item.er_type_resign || "-",
      er_indate: item.er_indate,
      er_resigndate: item.er_resigndate,
      er_numberid: item.er_numberid,
    }));

    const printPayload = {
      data: minimalData,
      dateRange: dateRangeLabel,
      factory: selectedFactory,
      total: minimalData.length,
      timestamp: Date.now(),
    };

    const printKey = `resign-print-data-${Date.now()}`;
    const payloadStr = JSON.stringify(printPayload);
    try {
      localStorage.setItem(printKey, payloadStr);
      localStorage.setItem("latest-resign-print-data", payloadStr);
    } catch {
      try {
        sessionStorage.setItem(printKey, payloadStr);
        sessionStorage.setItem("latest-resign-print-data", payloadStr);
      } catch (err) {
        console.warn("Storage quota exceeded", err);
      }
    }

    const printUrl = `/print/resign?key=${printKey}`;
    const win = window.open(printUrl, "_blank");
    if (!win || win.closed || typeof win.closed === "undefined") {
      window.location.href = printUrl;
    }
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 flex flex-col p-2.5 sm:p-3 overflow-hidden bg-[#eaedf0] dark:bg-[#121214] text-slate-900 dark:text-[#F1F2F4]">
      {/* ========================================================================= */}
      {/* COCKPIT TOOLBAR (Matching Legacy resign.vue & modern neutrality) */}
      {/* ========================================================================= */}
      <div id="tour-resign-controls" className="flex flex-col gap-2.5 bg-[#f1f3f6] dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl p-2.5 sm:px-3.5 sm:py-2.5 mb-2.5 shadow-xs">
        {/* Row 1: Title, View Switcher & Factory Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left Title & Mode Switcher */}
          <div className="flex flex-wrap items-center gap-3 min-w-0">
            <div className="flex items-center space-x-2 shrink-0">
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <UserMinus className="w-4.5 h-4.5" />
              </div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none whitespace-nowrap">
                Biến Động Thôi Việc & Phân Tích
              </h1>
            </div>

            <div className="h-4 w-px bg-[#d8dce2] dark:bg-[#26262C] hidden sm:block" />

            {/* View Mode Tabs: Danh sách vs Báo cáo vs Biểu đồ */}
            <div className="inline-flex p-0.5 rounded-lg bg-[#e2e6eb] dark:bg-[#222228] border border-[#d0d5dd] dark:border-[#26262C]">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`h-7 px-2 sm:px-3 rounded-md text-xs font-bold transition-all flex items-center space-x-1.5 active:scale-95 ${
                  viewMode === "list"
                    ? "bg-white dark:bg-[#18181C] text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("resignList")}</span>
                <span className="sm:hidden">{t("listView")}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("report")}
                className={`h-7 px-2 sm:px-3 rounded-md text-xs font-bold transition-all flex items-center space-x-1.5 active:scale-95 ${
                  viewMode === "report"
                    ? "bg-white dark:bg-[#18181C] text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("reportView")}</span>
                <span className="sm:hidden">{t("details")}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("chart")}
                className={`h-7 px-2 sm:px-3 rounded-md text-xs font-bold transition-all flex items-center space-x-1.5 active:scale-95 ${
                  viewMode === "chart"
                    ? "bg-white dark:bg-[#18181C] text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("chartViewMode")}</span>
                <span className="sm:hidden">{t("chartView")}</span>
              </button>
            </div>
          </div>

          {/* Right: Factory Filter Chips */}
          <div className="flex items-center space-x-1 p-0.5 bg-[#e2e6eb] dark:bg-[#222228] border border-[#d0d5dd] dark:border-[#26262C] rounded-lg h-8">
            {(["all", "dmc", "tb", "tc"] as const).map((loc) => {
              const active = selectedFactory === loc;
              const label = loc === "all" ? t("all") : loc.toUpperCase();
              return (
                <button
                  key={loc}
                  onClick={() => setSelectedFactory(loc)}
                  className={`h-7 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-sky-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Comprehensive Filters & Cockpit Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#d8dce2] dark:border-[#26262C]">
          {/* Left: Search & Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={t("searchResignPlaceholder")}
                className="w-48 sm:w-60 h-8 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] pl-7 pr-7 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500 transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPage(1);
              }}
              className="h-8 px-2.5 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">{t("allDepts")}</option>
              {uniqueDepts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Reason Filter */}
            <select
              value={selectedReason}
              onChange={(e) => {
                setSelectedReason(e.target.value);
                setPage(1);
              }}
              className="h-8 px-2.5 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 max-w-[190px] truncate"
            >
              <option value="all">{t("allReasons")}</option>
              {reasonsList.map((r) => {
                const label = r.reasonName || r.reason || String(r.id);
                return (
                  <option key={r.id} value={label}>
                    {label}
                  </option>
                );
              })}
            </select>

            {/* Bộ lọc Thời gian: Theo Tháng (Mặc định) / Khoảng Ngày / Tất Cả */}
            <div className="flex items-center space-x-1.5">
              <div className="flex items-center bg-[#e5e9ef] dark:bg-[#202026] p-0.5 rounded-md border border-[#d8dce2] dark:border-[#2b2b32] h-8">
                <button
                  type="button"
                  onClick={() => handleDateModeChange("month")}
                  className={`h-7 px-2.5 rounded text-xs font-bold transition-all cursor-pointer ${
                    dateMode === "month"
                      ? "bg-white dark:bg-[#151518] text-rose-600 dark:text-rose-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Hiển thị dữ liệu thôi việc theo từng tháng"
                >
                  {t("byMonth")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDateModeChange("range")}
                  className={`h-7 px-2.5 rounded text-xs font-bold transition-all cursor-pointer ${
                    dateMode === "range"
                      ? "bg-white dark:bg-[#151518] text-rose-600 dark:text-rose-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Lọc tùy chọn từ ngày đến ngày"
                >
                  {t("byDateRange")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDateModeChange("all")}
                  className={`h-7 px-2.5 rounded text-xs font-bold transition-all cursor-pointer ${
                    dateMode === "all"
                      ? "bg-white dark:bg-[#151518] text-rose-600 dark:text-rose-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Tải toàn bộ lịch sử thôi việc (tất cả các năm)"
                >
                  {t("allTime")}
                </button>
              </div>

              {/* Mode 1: Theo Tháng */}
              {dateMode === "month" && (
                <div className="flex items-center space-x-1 px-2 h-8 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C]">
                  <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <button
                    type="button"
                    onClick={() => handleShiftMonth(-1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-[#202026] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    title="Tháng trước"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => handleMonthSelect(e.target.value)}
                    className="h-7 px-1 rounded-sm bg-transparent border-0 text-xs font-bold tabular-nums focus:outline-none text-slate-800 dark:text-slate-200 cursor-pointer"
                    title="Bấm để chọn tháng"
                  />
                  <button
                    type="button"
                    onClick={() => handleShiftMonth(1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-[#202026] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    title="Tháng sau"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  {selectedMonth !== defaultMonth && (
                    <button
                      type="button"
                      onClick={() => handleMonthSelect(defaultMonth)}
                      className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline px-1 whitespace-nowrap cursor-pointer"
                      title="Trở về tháng hiện tại"
                    >
                      Hiện tại
                    </button>
                  )}
                </div>
              )}

              {/* Mode 2: Khoảng Ngày */}
              {dateMode === "range" && (
                <div className="flex items-center space-x-1.5 px-2.5 h-8 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-slate-700 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="text-xs font-bold whitespace-nowrap text-slate-600 dark:text-slate-400 hidden sm:inline">
                    Ngày:
                  </span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setPage(1);
                    }}
                    className="h-7 px-1 rounded-sm bg-transparent border-0 text-xs tabular-nums focus:outline-none text-slate-800 dark:text-slate-200"
                    title="Từ ngày"
                  />
                  <span className="text-xs text-slate-400">~</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setPage(1);
                    }}
                    className="h-7 px-1 rounded-sm bg-transparent border-0 text-xs tabular-nums focus:outline-none text-slate-800 dark:text-slate-200"
                    title="Đến ngày"
                  />
                </div>
              )}
            </div>

            {/* Show/Hide Columns Button */}
            {viewMode === "list" && !isUserOnly && (
              <button
                onClick={() => setShowColumnDialog(true)}
                aria-label={t("toggleColumns")}
                className="h-8 w-8 rounded-md bg-white hover:bg-slate-100 dark:bg-[#131316] dark:hover:bg-[#202026] text-slate-700 dark:text-slate-300 border border-[#d8dce2] dark:border-[#26262C] flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                title={t("toggleColumns")}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}

            {/* Print Resign List Button */}
            {viewMode === "list" && (
              <button
                onClick={handlePrintResignList}
                className="h-8 px-3 rounded-md bg-white hover:bg-slate-100 dark:bg-[#131316] dark:hover:bg-[#202026] text-slate-700 dark:text-slate-300 border border-[#d8dce2] dark:border-[#26262C] inline-flex items-center space-x-1.5 transition-colors shadow-xs active:scale-[0.97] cursor-pointer text-xs font-semibold"
                title={t("printList")}
              >
                <Printer className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                <span>{t("printList")}</span>
              </button>
            )}

            {/* Reload Button */}
            <button
              onClick={fetchResignations}
              disabled={loading}
              aria-label={t("refresh")}
              className="h-8 w-8 rounded-md bg-white hover:bg-slate-100 dark:bg-[#131316] dark:hover:bg-[#202026] text-slate-700 dark:text-slate-300 border border-[#d8dce2] dark:border-[#26262C] flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              title={t("refresh")}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-rose-600" : ""}`} aria-hidden="true" />
            </button>

            {/* Sync Resign Button */}
            {!isUserOnly && (
              <button
                onClick={handleSyncDailyResign}
                disabled={syncing || loading}
                className="h-8 px-3.5 rounded-md bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold inline-flex items-center space-x-1.5 shadow-xs transition-colors shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                title={t("syncResign")}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-white ${syncing ? "animate-spin" : ""}`} aria-hidden="true" />
                <span>{syncing ? t("syncing") : t("syncResign")}</span>
              </button>
            )}

            {/* Input Resign Button */}
            {!isUserOnly && (
              <button
                onClick={handleOpenCreate}
                className="h-8 px-3.5 rounded-md bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold inline-flex items-center space-x-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                title={t("addResign")}
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span className="text-white">{t("addResign")}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: DATA LIST TABLE (High Fidelity to pages/resign.vue) */}
      {/* ========================================================================= */}
      {viewMode === "list" ? (
        <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
          {/* Active Drill-Through Navigation Filter Banner */}
          {hasDrillThroughFilters && (
            <div className="flex items-center justify-between px-3 py-2 mb-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-xl text-xs shadow-xs animate-in fade-in duration-200 shrink-0">
              <div className="flex flex-wrap items-center gap-2 text-amber-900 dark:text-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span className="font-bold">{t("filtering")}</span>
                {paramJobLevel && (
                  <span className="bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded font-bold border border-amber-300 text-xs">
                    {t("jobRank")}: {paramJobLevel}
                  </span>
                )}
                {paramReason && (
                  <span className="bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded font-bold border border-amber-300 text-xs">
                    {t("resignReason")}: {paramReason}
                  </span>
                )}
                {paramSeniority && (
                  <span className="bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded font-bold border border-amber-300 text-xs">
                    {t("seniority")}: {paramSeniority}
                  </span>
                )}
                {paramDept && (
                  <span className="bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded font-bold border border-amber-300 text-xs">
                    {t("department")}: {paramDept}
                  </span>
                )}
                {paramGender && (
                  <span className="bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded font-bold border border-amber-300 text-xs">
                    {t("gender")}: {paramGender}
                  </span>
                )}
                {paramAgeGroup && (
                  <span className="bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded font-bold border border-amber-300 text-xs">
                    {t("age")}: {paramAgeGroup}
                  </span>
                )}
                <span className="text-zinc-600 dark:text-zinc-400 font-semibold">
                  ({filteredResignations.length} {t("candidatesCount")})
                </span>
              </div>
              <button
                onClick={() => {
                  window.location.href = `/resign?loc=${selectedFactory}`;
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer shadow-2xs"
              >
                <X className="w-3.5 h-3.5" /> {t("clearFilters")}
              </button>
            </div>
          )}

          {/* Active Excel Column Filters Banner */}
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs animate-in fade-in duration-200 shrink-0">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-medium">
                <span className="font-bold">{t("activeFilters")}</span>
                <span className="bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded font-extrabold text-rose-800 dark:text-rose-200 text-xs border border-rose-300 dark:border-rose-800">
                  {activeFilterCount} {t("columnsCount")}
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  ({t("showingCandidates")} {filteredResignations.length} / {resignations.length} {t("unitLabelPerson")})
                </span>
              </div>
              <button
                id="btn-reset-resign-excel-filters"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-rose-300 dark:border-rose-800 text-xs font-bold text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors shadow-2xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> {t("clearFilters")}
              </button>
            </div>
          )}

          <div className="flex-1 min-h-0 w-full rounded-xl border border-[#d8dce2] dark:border-[#26262C] bg-white dark:bg-[#18181C] flex flex-col overflow-hidden shadow-xs">
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="sticky top-0 z-20 bg-[#e6e9ee] dark:bg-[#131316] border-b border-[#d0d5dd] dark:border-[#26262C]">
                  <tr className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider select-none">
                    <th className="py-2.5 px-3 w-10 text-center">STT</th>
                    {isColVisible("er_empid") && (
                      <th className="py-2 px-3">
                        <ExcelColumnFilter
                          title={t("empno", "Mã NV")}
                          columnKey="er_empid"
                          distinctValues={getDistinctValues("er_empid")}
                          selectedValues={excelFilters["er_empid"]}
                          onFilterChange={(v) => setFilter("er_empid", v)}
                          sortDirection={sortConfig?.key === "er_empid" ? sortConfig.direction : null}
                          onSortChange={(dir) => setSort("er_empid", dir)}
                        />
                      </th>
                    )}
                    {isColVisible("photo") && (
                      <th className="py-2.5 px-2 w-12 text-center font-bold text-slate-700 dark:text-slate-300">
                        {t("photo", "Hình ảnh")}
                      </th>
                    )}
                    {isColVisible("er_name") && (
                      <th className="py-2 px-3.5">
                        <ExcelColumnFilter
                          title={t("fullName", "Họ và Tên")}
                          columnKey="er_name"
                          distinctValues={getDistinctValues("er_name")}
                          selectedValues={excelFilters["er_name"]}
                          onFilterChange={(v) => setFilter("er_name", v)}
                          sortDirection={sortConfig?.key === "er_name" ? sortConfig.direction : null}
                          onSortChange={(dir) => setSort("er_name", dir)}
                        />
                      </th>
                    )}
                    {isColVisible("er_indate") && (
                      <th className="py-2 px-3 text-center">
                        <ExcelColumnFilter
                          title={t("inDate", "Ngày Vào")}
                          columnKey="er_indate"
                          align="center"
                          distinctValues={getDistinctValues("er_indate")}
                          selectedValues={excelFilters["er_indate"]}
                          onFilterChange={(v) => setFilter("er_indate", v)}
                          sortDirection={sortConfig?.key === "er_indate" ? sortConfig.direction : null}
                          onSortChange={(dir) => setSort("er_indate", dir)}
                        />
                      </th>
                    )}
                    {isColVisible("er_resigndate") && (
                      <th className="py-2 px-3 text-center">
                        <ExcelColumnFilter
                          title={t("resignDate", "Ngày Thôi Việc")}
                          columnKey="er_resigndate"
                          align="center"
                          distinctValues={getDistinctValues("er_resigndate")}
                          selectedValues={excelFilters["er_resigndate"]}
                          onFilterChange={(v) => setFilter("er_resigndate", v)}
                          sortDirection={sortConfig?.key === "er_resigndate" ? sortConfig.direction : null}
                          onSortChange={(dir) => setSort("er_resigndate", dir)}
                        />
                      </th>
                    )}
                    {isColVisible("er_numberid") && (
                      <th className="py-2 px-3">
                        <ExcelColumnFilter
                          title={t("idNo", "Số CCCD")}
                          columnKey="er_numberid"
                          distinctValues={getDistinctValues("er_numberid")}
                          selectedValues={excelFilters["er_numberid"]}
                          onFilterChange={(v) => setFilter("er_numberid", v)}
                          sortDirection={sortConfig?.key === "er_numberid" ? sortConfig.direction : null}
                          onSortChange={(dir) => setSort("er_numberid", dir)}
                        />
                      </th>
                    )}
                    {isColVisible("er_deptid") && (
                      <th className="py-2 px-3">
                        <ExcelColumnFilter
                          title={t("dept", "Mã BP")}
                          columnKey="er_deptid"
                          distinctValues={getDistinctValues("er_deptid")}
                          selectedValues={excelFilters["er_deptid"]}
                          onFilterChange={(v) => setFilter("er_deptid", v)}
                          sortDirection={sortConfig?.key === "er_deptid" ? sortConfig.direction : null}
                          onSortChange={(dir) => setSort("er_deptid", dir)}
                        />
                      </th>
                    )}
                    {isColVisible("er_deptname") && (
                      <th className="py-2 px-3.5">
                        <ExcelColumnFilter
                          title={t("deptName", "Tên Bộ Phận")}
                          columnKey="er_deptname"
                          distinctValues={getDistinctValues("er_deptname")}
                          selectedValues={excelFilters["er_deptname"]}
                          onFilterChange={(v) => setFilter("er_deptname", v)}
                          sortDirection={sortConfig?.key === "er_deptname" ? sortConfig.direction : null}
                          onSortChange={(dir) => setSort("er_deptname", dir)}
                        />
                      </th>
                    )}
                    {isColVisible("er_joblevel") && (
                      <th className="py-2 px-3">
                        <ExcelColumnFilter
                          title={t("jobLevel", "Chức Vụ")}
                          columnKey="er_joblevel"
                          distinctValues={getDistinctValues("er_joblevel")}
                          selectedValues={excelFilters["er_joblevel"]}
                          onFilterChange={(v) => setFilter("er_joblevel", v)}
                          sortDirection={sortConfig?.key === "er_joblevel" ? sortConfig.direction : null}
                          onSortChange={(dir) => setSort("er_joblevel", dir)}
                        />
                      </th>
                    )}
                    {isColVisible("er_age") && (
                      <th className="py-2 px-3 text-center">
                        <ExcelColumnFilter
                          title={t("age", "Tuổi")}
                          columnKey="er_age"
                          align="center"
                          distinctValues={getDistinctValues("er_age")}
                          selectedValues={excelFilters["er_age"]}
                          onFilterChange={(v) => setFilter("er_age", v)}
                          sortDirection={sortConfig?.key === "er_age" ? sortConfig.direction : null}
                          onSortChange={(dir) => setSort("er_age", dir)}
                        />
                      </th>
                    )}
                    {isColVisible("er_seniority") && (
                      <th className="py-2 px-3 text-center">
                        <ExcelColumnFilter
                          title={t("seniority", "Thâm Niên")}
                          columnKey="er_seniority"
                          align="center"
                          distinctValues={getDistinctValues("er_seniority")}
                          selectedValues={excelFilters["er_seniority"]}
                          onFilterChange={(v) => setFilter("er_seniority", v)}
                          sortDirection={sortConfig?.key === "er_seniority" ? sortConfig.direction : null}
                          onSortChange={(dir) => setSort("er_seniority", dir)}
                        />
                      </th>
                    )}
                    {isColVisible("er_bus") && (
                      <th className="py-2 px-3 text-center">
                        <ExcelColumnFilter
                          title={t("bus", "Phương Tiện")}
                          columnKey="er_bus"
                          align="center"
                          distinctValues={getDistinctValues("er_bus")}
                          selectedValues={excelFilters["er_bus"]}
                          onFilterChange={(v) => setFilter("er_bus", v)}
                          sortDirection={sortConfig?.key === "er_bus" ? sortConfig.direction : null}
                          onSortChange={(dir) => setSort("er_bus", dir)}
                        />
                      </th>
                    )}
                    {isColVisible("er_gender") && (
                      <th className="py-2 px-3 text-center">
                        <ExcelColumnFilter
                          title={t("gender", "Giới Tính")}
                          columnKey="er_gender"
                          align="center"
                          distinctValues={getDistinctValues("er_gender")}
                          selectedValues={excelFilters["er_gender"]}
                          onFilterChange={(v) => setFilter("er_gender", v)}
                          sortDirection={sortConfig?.key === "er_gender" ? sortConfig.direction : null}
                          onSortChange={(dir) => setSort("er_gender", dir)}
                        />
                      </th>
                    )}
                    {isColVisible("er_hometown") && (
                      <th className="py-2 px-3">
                        <ExcelColumnFilter
                          title={t("hometown", "Quê Quán")}
                          columnKey="er_hometown"
                          distinctValues={getDistinctValues("er_hometown")}
                          selectedValues={excelFilters["er_hometown"]}
                          onFilterChange={(v) => setFilter("er_hometown", v)}
                          sortDirection={sortConfig?.key === "er_hometown" ? sortConfig.direction : null}
                          onSortChange={(dir) => setSort("er_hometown", dir)}
                        />
                      </th>
                    )}
                    {isColVisible("er_reason") && (
                      <th className="py-2 px-3">
                        <ExcelColumnFilter
                          title={t("resignReason", "Lý Do Thôi Việc")}
                          columnKey="er_reason"
                          distinctValues={getDistinctValues("er_reason")}
                          selectedValues={excelFilters["er_reason"]}
                          onFilterChange={(v) => setFilter("er_reason", v)}
                          sortDirection={sortConfig?.key === "er_reason" ? sortConfig.direction : null}
                          onSortChange={(dir) => setSort("er_reason", dir)}
                        />
                      </th>
                    )}
                    {isColVisible("er_type_resign") && (
                      <th className="py-2 px-3">
                        <ExcelColumnFilter
                          title={t("typeResign", "Loại Thôi Việc")}
                          columnKey="er_type_resign"
                          distinctValues={getDistinctValues("er_type_resign")}
                          selectedValues={excelFilters["er_type_resign"]}
                          onFilterChange={(v) => setFilter("er_type_resign", v)}
                          sortDirection={sortConfig?.key === "er_type_resign" ? sortConfig.direction : null}
                          onSortChange={(dir) => setSort("er_type_resign", dir)}
                        />
                      </th>
                    )}
                    {isColVisible("er_note") && (
                      <th className="py-2 px-3 min-w-[280px]">
                        <ExcelColumnFilter
                          title={t("note", "Ghi Chú")}
                          columnKey="er_note"
                          distinctValues={getDistinctValues("er_note")}
                          selectedValues={excelFilters["er_note"]}
                          onFilterChange={(v) => setFilter("er_note", v)}
                          sortDirection={sortConfig?.key === "er_note" ? sortConfig.direction : null}
                          onSortChange={(dir) => setSort("er_note", dir)}
                        />
                      </th>
                    )}
                  </tr>
                </thead>

              <tbody className="divide-y divide-[#e2e6eb] dark:divide-[#26262C] font-medium text-xs">
                {loading && resignations.length === 0 ? (
                  <tr>
                    <td colSpan={20} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <RefreshCw className="w-5 h-5 text-rose-600 animate-spin" />
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Đang tải danh sách nhân viên thôi việc...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedResignations.length === 0 ? (
                  <tr>
                    <td colSpan={20} className="py-14 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <UserMinus className="w-8 h-8 text-slate-400 stroke-[1.5]" />
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Không tìm thấy nhân viên thôi việc phù hợp
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Thử thay đổi bộ lọc hoặc bấm "Nhập Thôi Việc" để thêm mới
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedResignations.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#edf0f4] dark:hover:bg-[#202026] transition-colors"
                    >
                      {/* STT */}
                      <td className="py-2 px-3 text-center text-slate-500 tabular-nums text-xs">
                        {(page - 1) * pageSize + idx + 1}
                      </td>

                      {/* Empno (Clickable to edit only if not isUserOnly) */}
                      {isColVisible("er_empid") && (
                        <td className="py-2 px-3">
                          {!isUserOnly ? (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="tabular-nums font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                              title="Bấm để chỉnh sửa thông tin thôi việc"
                            >
                              {item.er_empid}
                            </button>
                          ) : (
                            <span className="tabular-nums font-bold text-slate-700 dark:text-slate-300">
                              {item.er_empid}
                            </span>
                          )}
                        </td>
                      )}

                      {/* Photo Thumbnail */}
                      {isColVisible("photo") && (
                        <td className="py-1.5 px-2 text-center">
                          {(() => {
                            const photoUrl = getResignPhotoUrl(item);
                            if (photoUrl) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => setPreviewPhotoItem(item)}
                                  title="Bấm để xem ảnh lớn"
                                  className="group inline-flex items-center justify-center p-0.5 rounded-full hover:ring-2 hover:ring-rose-400 dark:hover:ring-rose-500 transition-all cursor-pointer focus:outline-none"
                                >
                                  <img
                                    src={photoUrl}
                                    alt={item.er_name || item.er_empid}
                                    className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-zinc-700 shadow-2xs group-hover:scale-105 transition-transform"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLElement).style.display = "none";
                                      const next = (e.currentTarget as HTMLElement).nextElementSibling;
                                      if (next) (next as HTMLElement).classList.remove("hidden");
                                    }}
                                  />
                                  <div className="hidden w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-400">
                                    <User className="w-3.5 h-3.5" />
                                  </div>
                                </button>
                              );
                            }
                            return (
                              <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center mx-auto text-slate-400">
                                <User className="w-3.5 h-3.5" />
                              </div>
                            );
                          })()}
                        </td>
                      )}

                      {/* Full Name */}
                      {isColVisible("er_name") && (
                        <td className="py-2 px-3.5">
                          {!isUserOnly ? (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="font-bold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer"
                            >
                              {item.er_name}
                            </button>
                          ) : (
                            <span className="font-bold text-slate-900 dark:text-white">
                              {item.er_name}
                            </span>
                          )}
                        </td>
                      )}

                      {/* In date */}
                      {isColVisible("er_indate") && (
                        <td className="py-2 px-3 text-center">
                          {item.er_indate ? (
                            <span className="px-2 py-0.5 rounded text-xs tabular-nums font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                              {item.er_indate}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      )}

                      {/* Resign date */}
                      {isColVisible("er_resigndate") && (
                        <td className="py-2 px-3 text-center">
                          {item.er_resigndate ? (
                            <span className="px-2 py-0.5 rounded text-xs tabular-nums font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800">
                              {item.er_resigndate}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      )}

                      {/* CCCD / IC No */}
                      {isColVisible("er_numberid") && (
                        <td className="py-2 px-3 tabular-nums text-slate-600 dark:text-slate-300 text-xs">
                          {item.er_numberid || "-"}
                        </td>
                      )}

                      {/* Dept Code */}
                      {isColVisible("er_deptid") && (
                        <td className="py-2 px-3 tabular-nums font-bold text-slate-700 dark:text-slate-300">
                          {item.er_deptid || "-"}
                        </td>
                      )}

                      {/* Dept Name */}
                      {isColVisible("er_deptname") && (
                        <td className="py-2 px-3.5 text-slate-800 dark:text-slate-200">
                          {item.er_deptname || "-"}
                        </td>
                      )}

                      {/* Job Level / Position */}
                      {isColVisible("er_joblevel") && (
                        <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                          {(() => {
                            if (!item.er_joblevel) return "-";
                            const jl = item.er_joblevel.trim();
                            if (jl === "Công nhân" || jl.toLowerCase() === "worker") return t("worker");
                            if (jl === "Nhân viên" || jl.toLowerCase() === "staff") return t("staff");
                            if (jl === "Cán bộ" || jl === "Cán bộ / Tổ trưởng" || jl.toLowerCase() === "leader") return t("leader");
                            if (jl === "Phiên dịch" || jl.toLowerCase() === "translator") return t("translator");
                            if (jl === "Kỹ sư" || jl.toLowerCase() === "engineer") return t("engineer");
                            return jl;
                          })()}
                        </td>
                      )}

                      {/* Age */}
                      {isColVisible("er_age") && (
                        <td className="py-2 px-3 text-center tabular-nums">
                          {item.er_age || "-"}
                        </td>
                      )}

                      {/* Seniority */}
                      {isColVisible("er_seniority") && (
                        <td className="py-2 px-3 text-center tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                          {item.er_seniority
                            ? String(item.er_seniority).includes("năm") || String(item.er_seniority).includes("tháng") || String(item.er_seniority).includes("ngày")
                              ? item.er_seniority
                              : `${item.er_seniority} ${t("yearsLabel")}`
                            : `0 ${t("yearsLabel")}`}
                        </td>
                      )}

                      {/* Vehicle / Bus */}
                      {isColVisible("er_bus") && (
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              item.er_bus === "Xe đưa rước" || item.er_bus?.toLowerCase() === "bus"
                                ? "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {item.er_bus === "Xe đưa rước" || item.er_bus?.toLowerCase() === "bus"
                              ? t("companyBus")
                              : t("selfVehicle")}
                          </span>
                        </td>
                      )}

                      {/* Gender */}
                      {isColVisible("er_gender") && (
                        <td className="py-2 px-3 text-center text-slate-700 dark:text-slate-300">
                          {item.er_gender === "Nam" || item.er_gender?.toLowerCase() === "male"
                            ? t("male")
                            : t("female")}
                        </td>
                      )}

                      {/* Hometown */}
                      {isColVisible("er_hometown") && (
                        <td className="py-2 px-3 text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                          {item.er_hometown || "-"}
                        </td>
                      )}

                      {/* Reason */}
                      {isColVisible("er_reason") && (
                        <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                          {item.er_reason || "-"}
                        </td>
                      )}

                      {/* Type Resign */}
                      {isColVisible("er_type_resign") && (
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                          {item.er_type_resign || "-"}
                        </td>
                      )}

                      {/* Note */}
                      {isColVisible("er_note") && (
                        <td className="py-2 px-3 text-slate-700 dark:text-slate-300 min-w-[280px]" title={item.er_note || ""}>
                          {item.er_note || "-"}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>

              {/* Sticky Summary Row */}
              {filteredResignations.length > 0 && (
                <tfoot className="sticky bottom-0 z-10 bg-[#f1f3f6] dark:bg-[#131316] border-t-2 border-[#d0d5dd] dark:border-[#26262C] font-bold text-xs select-none">
                  <tr>
                    <td colSpan={1 + (isColVisible("er_empid") ? 1 : 0) + (isColVisible("photo") ? 1 : 0)} className="py-2.5 px-3 text-center uppercase tracking-wide text-slate-700 dark:text-slate-300">
                      TỔNG CỘNG ({statsSummary.count} người)
                    </td>
                    {isColVisible("er_indate") && <td></td>}
                    {isColVisible("er_resigndate") && <td></td>}
                    {isColVisible("er_numberid") && <td></td>}
                    {isColVisible("er_deptid") && <td></td>}
                    {isColVisible("er_deptname") && <td></td>}
                    {isColVisible("er_joblevel") && <td></td>}
                    {isColVisible("er_age") && (
                      <td className="py-2.5 px-3 text-center tabular-nums font-bold text-slate-900 dark:text-white" title="Tuổi trung bình">
                        TB: {statsSummary.avgAge}
                      </td>
                    )}
                    {isColVisible("er_seniority") && (
                      <td className="py-2.5 px-3 text-center tabular-nums font-bold text-slate-900 dark:text-white" title="Thâm niên trung bình">
                        TB: {statsSummary.avgSeniority} năm
                      </td>
                    )}
                    {isColVisible("er_bus") && <td></td>}
                    {isColVisible("er_gender") && <td></td>}
                    {isColVisible("er_hometown") && <td></td>}
                    {isColVisible("er_reason") && <td></td>}
                    {isColVisible("er_type_resign") && <td></td>}
                    {isColVisible("er_note") && <td></td>}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Footer & Pagination */}
          <div className="border-t border-[#d8dce2] dark:border-[#26262C] bg-[#f1f3f6] dark:bg-[#121214] px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Left: Export Excel & Print List */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportExcel}
                className="h-8 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center space-x-1.5 transition-colors shadow-xs active:scale-[0.97]"
                title="Xuất dữ liệu thôi việc ra file Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Xuất Excel</span>
              </button>
              <button
                onClick={handlePrintResignList}
                className="h-8 px-3 rounded-md bg-white hover:bg-slate-100 dark:bg-[#202026] dark:hover:bg-[#282832] text-slate-800 dark:text-slate-200 border border-[#d8dce2] dark:border-[#26262C] font-bold text-xs inline-flex items-center space-x-1.5 transition-colors shadow-xs active:scale-[0.97] cursor-pointer"
                title="In danh sách công nhân viên thôi việc theo chuẩn biểu mẫu A4"
              >
                <Printer className="w-3.5 h-3.5 text-rose-500" />
                <span>In Danh Sách</span>
              </button>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Tổng số: <strong>{filteredResignations.length}</strong> nhân viên
              </span>
            </div>

            {/* Right: Page Size & Navigation */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
                <span className="text-[11px]">Dòng/trang:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-7 px-2 rounded bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] text-xs font-semibold focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={-1}>Tất cả</option>
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-7 w-7 rounded bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-[11px] tabular-nums text-slate-700 dark:text-slate-300">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-7 w-7 rounded bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      ) : viewMode === "report" ? (
        /* ========================================================================= */
        /* VIEW MODE 2: MATRIX REPORT (Matching pages/resign-report.vue) */
        /* ========================================================================= */
        <div className="flex-1 min-h-0 w-full flex flex-col gap-3.5 overflow-y-auto custom-scrollbar pr-0.5 pb-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="p-3 bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Tổng Thôi Việc</span>
                <UserMinus className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-xl tabular-nums font-black text-slate-900 dark:text-white">
                {statsSummary.count} <span className="text-xs font-normal text-slate-500">người</span>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Độ Tuổi TB</span>
                <Clock className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-xl tabular-nums font-black text-slate-900 dark:text-white">
                {statsSummary.avgAge} <span className="text-xs font-normal text-slate-500">tuổi</span>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Thâm Niên TB</span>
                <Calendar className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl tabular-nums font-black text-slate-900 dark:text-white">
                {statsSummary.avgSeniority} <span className="text-xs font-normal text-slate-500">năm</span>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Top Bộ Phận</span>
                <Building className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white truncate" title={matrixReportData[0]?.dept || "N/A"}>
                {matrixReportData[0]?.dept || "Chưa có"}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {matrixReportData[0]?.totalResign || 0} lượt thôi việc
              </div>
            </div>
          </div>

          {/* Department Cross-tab Matrix Table */}
          <div className="shrink-0 rounded-xl border border-[#d8dce2] dark:border-[#26262C] bg-white dark:bg-[#18181C] flex flex-col shadow-xs overflow-hidden">
            {/* Table Card Header with Search & Export */}
            <div className="px-3.5 py-2.5 border-b border-[#d8dce2] dark:border-[#26262C] bg-[#f1f3f6] dark:bg-[#131316] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Ma Trận Thôi Việc Theo Bộ Phận, Nhóm Tuổi, Thâm Niên & Lý Do (27 Cột Chuẩn)
                </span>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  {displayedMatrixData.length} / {matrixReportData.length} bộ phận
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <input
                    type="text"
                    value={matrixDeptSearch}
                    onChange={(e) => setMatrixDeptSearch(e.target.value)}
                    placeholder="Tìm nhanh mã hoặc tên bộ phận..."
                    className="h-7.5 w-48 sm:w-64 rounded-md bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] pl-7 pr-7 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  {matrixDeptSearch && (
                    <button
                      onClick={() => setMatrixDeptSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <button
                  onClick={handleExportMatrixExcel}
                  className="h-7.5 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center space-x-1.5 transition-colors shadow-xs active:scale-[0.97]"
                  title="Xuất bảng ma trận phân tích 27 cột ra file Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Xuất Báo Cáo</span>
                </button>
              </div>
            </div>

            {/* Scrollable Matrix Table with Sticky Thead, Sticky Tfoot & Sticky Left Department Column */}
            <div className="max-h-[500px] overflow-y-auto overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
                <thead className="sticky top-0 z-20 bg-[#e6e9ee] dark:bg-[#131316] border-b border-[#d0d5dd] dark:border-[#26262C] select-none">
                  <tr className="border-b border-[#d0d5dd] dark:border-[#26262C]">
                    <th className="py-2.5 px-3 text-left min-w-[150px] sticky left-0 z-30 bg-[#e6e9ee] dark:bg-[#131316] text-[#00695c] dark:text-teal-400 font-bold border-r border-[#d0d5dd] dark:border-[#26262C] shadow-[1px_0_0_0_#d0d5dd] dark:shadow-[1px_0_0_0_#26262C]">
                      BỘ PHẬN
                    </th>
                    {MATRIX_COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        className={`py-2 px-2 text-center text-[#00695c] dark:text-teal-400 font-bold text-[10.5px] uppercase tracking-tight leading-tight select-none min-w-[68px] border-r border-[#d8dce2] dark:border-[#26262C] last:border-r-0 ${
                          col.key === "totalResign" ? "bg-rose-50/60 dark:bg-rose-950/20" : ""
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center">
                          {col.headerLines.map((line, lIdx) => (
                            <span key={lIdx} className="block whitespace-nowrap">
                              {line}
                            </span>
                          ))}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e6eb] dark:divide-[#26262C] font-medium text-xs">
                  {displayedMatrixData.length === 0 ? (
                    <tr>
                      <td colSpan={27} className="py-12 text-center text-slate-500">
                        {matrixDeptSearch
                          ? `Không tìm thấy bộ phận nào khớp với "${matrixDeptSearch}"`
                          : "Chưa có dữ liệu thống kê cho bộ lọc hiện tại"}
                      </td>
                    </tr>
                  ) : (
                    displayedMatrixData.map((row) => (
                      <tr key={row.dept} className="hover:bg-[#edf0f4] dark:hover:bg-[#202026] transition-colors">
                        <td className="py-2 px-3 text-left sticky left-0 z-10 bg-white dark:bg-[#18181C] border-r border-[#e2e6eb] dark:border-[#26262C] font-semibold text-slate-900 dark:text-white shadow-[1px_0_0_0_#e2e6eb] dark:shadow-[1px_0_0_0_#26262C]">
                          <div className="truncate max-w-[150px]" title={row.deptName ? `${row.dept} - ${row.deptName}` : row.dept}>
                            {row.dept}
                          </div>
                        </td>
                        {MATRIX_COLUMNS.map((col) => {
                          const val = row[col.key];
                          const isTotal = col.key === "totalResign";
                          const hasVal = val > 0;
                          return (
                            <td
                              key={col.key}
                              className={`py-2 px-2 text-center tabular-nums text-xs border-r border-[#eef1f4] dark:border-[#222228] last:border-r-0 ${
                                isTotal
                                  ? "font-bold text-rose-600 dark:text-rose-400 bg-rose-50/30 dark:bg-rose-950/10"
                                  : hasVal
                                  ? "font-semibold text-slate-800 dark:text-slate-200"
                                  : "text-slate-400 dark:text-slate-600 font-normal"
                              }`}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
                {displayedMatrixData.length > 0 && (
                  <tfoot className="sticky bottom-0 z-20 bg-[#f1f3f6] dark:bg-[#131316] border-t-2 border-[#d0d5dd] dark:border-[#26262C] font-bold text-xs select-none">
                    <tr>
                      <td className="py-2.5 px-3 text-left sticky left-0 z-30 bg-[#f1f3f6] dark:bg-[#131316] border-r border-[#d0d5dd] dark:border-[#26262C] uppercase font-bold text-slate-800 dark:text-slate-200 shadow-[1px_0_0_0_#d0d5dd] dark:shadow-[1px_0_0_0_#26262C]">
                        TỔNG CỘNG
                      </td>
                      {MATRIX_COLUMNS.map((col) => (
                        <td
                          key={col.key}
                          className={`py-2.5 px-2 text-center tabular-nums font-bold border-r border-[#d8dce2] dark:border-[#26262C] last:border-r-0 ${
                            col.key === "totalResign"
                              ? "text-rose-600 dark:text-rose-400 bg-rose-100/60 dark:bg-rose-950/30"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {matrixTotals[col.key]}
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW MODE 3: CHART & BENTO ANALYTICS DASHBOARD                            */
        /* ========================================================================= */
        <div className="flex-1 min-h-0 w-full flex flex-col gap-3.5 overflow-y-auto custom-scrollbar pr-0.5 pb-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="p-3 bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Tổng Thôi Việc</span>
                <UserMinus className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-xl tabular-nums font-black text-slate-900 dark:text-white">
                {statsSummary.count} <span className="text-xs font-normal text-slate-500">người</span>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Độ Tuổi TB</span>
                <Clock className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-xl tabular-nums font-black text-slate-900 dark:text-white">
                {statsSummary.avgAge} <span className="text-xs font-normal text-slate-500">tuổi</span>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Thâm Niên TB</span>
                <Calendar className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl tabular-nums font-black text-slate-900 dark:text-white">
                {statsSummary.avgSeniority} <span className="text-xs font-normal text-slate-500">năm</span>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Top Bộ Phận</span>
                <Building className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white truncate" title={matrixReportData[0]?.dept || "N/A"}>
                {matrixReportData[0]?.dept || "Chưa có"}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {matrixReportData[0]?.totalResign || 0} lượt thôi việc
              </div>
            </div>
          </div>

          {/* Executive Bento Grid Charts */}
          <ResignationAnalyticsDashboard
            records={allResignationsForAnalytics}
            reasonBreakdown={reasonBreakdown}
            totalResign={allResignationsForAnalytics.length}
            selectedReason={selectedReason}
            onSelectReason={(r) => {
              setSelectedReason(r);
              setPage(1);
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INPUT / EDIT RESIGNATION */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            key="resign-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalOpen(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto"
          >
            <motion.div
              key="resign-modal-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              className="bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl max-w-3xl w-full overflow-hidden shadow-2xl my-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#d8dce2] dark:border-[#26262C] bg-[#f1f3f6] dark:bg-[#131316]">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  <UserMinus className="w-4 h-4 text-rose-600" />
                  <span>{editingId ? t("editResign") : t("addResign")}</span>
                </div>
                <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveResign} className="p-4 space-y-3.5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  [1. {t("lookupEmployeeTitle")}]
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      {t("branchFactory")} <span className="text-[10px] font-normal text-slate-400">({t("readOnly")})</span>
                    </label>
                    <div
                      className="flex items-center bg-zinc-100 dark:bg-[#131316] p-0.5 rounded-md border border-zinc-200 dark:border-[#26262C] h-8 opacity-75 cursor-not-allowed"
                      role="radiogroup"
                      aria-label="Chi Nhánh / Xưởng"
                    >
                      {[
                        { value: "dmc", label: "DMC", title: "DMC (Đông Mỹ Cự)" },
                        { value: "tb", label: "TB", title: "TB (Thái Bình)" },
                        { value: "tc", label: "TC", title: "TC (Tiền Châu)" },
                      ].map((item) => {
                        const active = form.loc === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            disabled
                            title={item.title}
                            className={`flex-1 h-7 px-2 rounded font-bold text-xs inline-flex items-center justify-center transition-colors cursor-not-allowed ${
                              active
                                ? "bg-slate-700 text-white shadow-xs"
                                : "text-zinc-400 bg-transparent"
                            }`}
                          >
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {t("empnoCard")} {!editingId && <span className="text-rose-500">*</span>}
                    </label>
                    <div className="flex space-x-1.5">
                      <input
                        type="text"
                        required
                        disabled={!!editingId}
                        maxLength={10}
                        placeholder="VD: 048991"
                        value={form.empno}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm({ ...form, empno: val });
                          if (val.length === 6) handleLookupEmpno(val);
                        }}
                        onBlur={() => !editingId && handleLookupEmpno()}
                        className={`flex-1 h-8 px-2.5 rounded-md border border-[#d8dce2] dark:border-[#26262C] text-xs tabular-nums font-bold ${
                          editingId
                            ? "bg-slate-100 dark:bg-[#1c1c22] text-slate-500 cursor-not-allowed"
                            : "bg-white dark:bg-[#131316] text-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        }`}
                      />
                      {!editingId && (
                        <button
                          type="button"
                          onClick={() => handleLookupEmpno()}
                          disabled={searchingEmp}
                          className="h-8 px-3 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          {searchingEmp ? t("empLookupSearching") : t("empLookupAction")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Auto-filled details preview (Disabled / Read-only) */}
                <div className="mt-2.5 p-2.5 bg-slate-100/70 dark:bg-[#18181c] border border-[#d8dce2] dark:border-[#26262C] rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t("fullName")}:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block truncate" title={form.name}>
                      {form.name || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t("idNo")}:</span>
                    <span className="tabular-nums font-bold text-slate-800 dark:text-slate-200 block truncate">
                      {form.numid || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t("gender")} / {t("age")}:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                      {form.gender || "-"} {form.age ? `(${form.age}${t("yearsOld")})` : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t("actualDate")}:</span>
                    <span className="tabular-nums font-bold text-emerald-600 block truncate">
                      {form.inDate || "-"}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[10px]">{t("department")}:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate" title={form.deptName}>
                      {form.deptName ? `${form.deptName} (${form.dept || "-"})` : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t("position")}:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                      {form.position || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t("seniority")}:</span>
                    <span className="tabular-nums font-bold text-sky-600 block truncate">
                      {form.seniority ? `${form.seniority} ${t("yearsLabel")}` : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Part 2: Resignation Details (Core fields disabled) */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  [2. {t("resignDetailTitle")}]
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      {t("resignDate")} <span className="text-[10px] font-normal text-slate-400">({t("readOnly")})</span>
                    </label>
                    <input
                      type="date"
                      disabled
                      value={form.dateResign}
                      className="w-full h-8 px-2.5 rounded-md bg-slate-100 dark:bg-[#1c1c22] border border-[#d8dce2] dark:border-[#26262C] text-xs tabular-nums font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      {t("resignReason")} <span className="text-[10px] font-normal text-slate-400">({t("readOnly")})</span>
                    </label>
                    <select
                      disabled
                      value={form.reason}
                      className="w-full h-8 px-2.5 rounded-md bg-slate-100 dark:bg-[#1c1c22] border border-[#d8dce2] dark:border-[#26262C] text-xs font-medium text-slate-500 cursor-not-allowed"
                    >
                      <option value={form.reason}>{form.reason || "-"}</option>
                      {reasonsList.map((r) => {
                        const label = r.reasonName || r.reason || String(r.id);
                        return (
                          <option key={r.id} value={label}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      {t("typeResign")} <span className="text-[10px] font-normal text-slate-400">({t("readOnly")})</span>
                    </label>
                    <select
                      disabled
                      value={form.typeResign}
                      className="w-full h-8 px-2.5 rounded-md bg-slate-100 dark:bg-[#1c1c22] border border-[#d8dce2] dark:border-[#26262C] text-xs font-medium text-slate-500 cursor-not-allowed"
                    >
                      <option value={form.typeResign}>{form.typeResign || "-"}</option>
                      <option value="Tự ý nghỉ việc">{t("typeResignQuit")}</option>
                      <option value="Hết hạn hợp đồng">{t("typeResignContractEnd")}</option>
                      <option value="Thỏa thuận chấm dứt HĐ">{t("typeResignAgreement")}</option>
                      <option value="Kỷ luật sa thải">{t("typeResignDiscipline")}</option>
                      <option value="Lý do khác">{t("typeResignOther")}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Part 3: Editable Fields (Phương tiện & Ghi chú) */}
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-300 dark:border-emerald-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5">
                    <Car className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>[3. Thông Tin Cho Phép Chỉnh Sửa]</span>
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    {t("colVehicle")} <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <select
                    value={form.vehicle}
                    onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                    className="w-full h-9 px-3 rounded-md bg-white dark:bg-[#131316] border-2 border-emerald-500 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer shadow-xs"
                  >
                    <option value="Tự túc">{t("selfVehicle")}</option>
                    <option value="Xe đưa rước">{t("companyBus")}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    {t("moreNotes")}
                  </label>
                  <textarea
                    rows={3}
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder={t("notesPlaceholder")}
                    className="w-full p-2.5 rounded-md bg-white dark:bg-[#131316] border-2 border-emerald-500 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-xs"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-[#d8dce2] dark:border-[#26262C]">
                <div>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleDeleteResign}
                      className="h-8 px-3 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
                      title="Xóa hồ sơ thôi việc này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t("delete")}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="h-8 px-4 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="h-8 px-4 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center space-x-1.5 shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? t("savingCandidate") : editingId ? t("update") : t("saveCandidate")}</span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: COLUMN SETTINGS DIALOG */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showColumnDialog && (
          <motion.div
            key="column-dialog-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowColumnDialog(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          >
            <motion.div
              key="column-dialog-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
              className="bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl max-w-sm w-full overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#d8dce2] dark:border-[#26262C] bg-[#f1f3f6] dark:bg-[#131316]">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                <SlidersHorizontal className="w-4 h-4" />
                <span>{t("columnSettingsTitle")}</span>
              </div>
              <button
                onClick={() => setShowColumnDialog(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-2 max-h-80 overflow-y-auto custom-scrollbar text-xs">
              {[
                { key: "er_empid", label: t("colEmpid") },
                { key: "photo", label: t("photo", "Hình ảnh") },
                { key: "er_name", label: t("fullName") },
                { key: "er_indate", label: t("colInDate") },
                { key: "er_resigndate", label: t("colResignDate") },
                { key: "er_numberid", label: t("colNumberId") },
                { key: "er_deptid", label: t("colDeptId") },
                { key: "er_deptname", label: t("colDeptName") },
                { key: "er_joblevel", label: t("colJobLevel") },
                { key: "er_age", label: t("age") },
                { key: "er_seniority", label: t("colSeniority") },
                { key: "er_gender", label: t("gender") },
                { key: "er_reason", label: t("colReason") },
                { key: "er_type_resign", label: t("colTypeResign") },
                { key: "er_note", label: t("colNote") },
              ]
                .filter((col) => !isUserOnly || !["er_age", "er_seniority", "er_gender"].includes(col.key))
                .map((col) => (
                <label
                  key={col.key}
                  className="flex items-center space-x-2.5 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-[#202026] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns[col.key]}
                    onChange={(e) =>
                      setVisibleColumns({ ...visibleColumns, [col.key]: e.target.checked })
                    }
                    className="w-4 h-4 text-rose-600 rounded border-slate-300 dark:border-slate-600 focus:ring-rose-500"
                  />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{col.label}</span>
                </label>
              ))}
            </div>

            <div className="px-4 py-2.5 bg-[#f1f3f6] dark:bg-[#131316] border-t border-[#d8dce2] dark:border-[#26262C] flex justify-end">
              <button
                onClick={() => setShowColumnDialog(false)}
                className="h-7 px-3.5 rounded-md bg-rose-600 text-white text-xs font-bold"
              >
                {t("confirm")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
      {/* Modal xem ảnh phóng to */}
      {previewPhotoItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewPhotoItem(null)}
        >
          <div
            className="w-full max-w-xs bg-white dark:bg-[#18181C] rounded-xl border border-slate-200 dark:border-[#26262C] p-4 shadow-2xl flex flex-col items-center gap-3 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
              <div className="flex flex-col">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {previewPhotoItem.er_name}
                </span>
                <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold tabular-nums">
                  MSNV: {previewPhotoItem.er_empid}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhotoItem(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full flex items-center justify-center p-2 bg-slate-50 dark:bg-zinc-900/50 rounded-lg border border-slate-200 dark:border-zinc-800 min-h-[160px]">
              <img
                src={getResignPhotoUrl(previewPhotoItem)!}
                alt={previewPhotoItem.er_name}
                className="max-h-72 w-auto object-contain rounded-md shadow-sm"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                  const next = (e.currentTarget as HTMLElement).nextElementSibling;
                  if (next) (next as HTMLElement).classList.remove("hidden");
                }}
              />
              <div className="hidden py-8 flex flex-col items-center justify-center text-slate-400 gap-1.5">
                <User className="w-12 h-12 stroke-1" />
                <span className="text-xs">Chưa có ảnh thẻ</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPreviewPhotoItem(null)}
              className="w-full h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResignPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex-1 flex items-center justify-center p-6 text-xs text-zinc-500 bg-[#eaedf0] dark:bg-[#121214]">
          <RefreshCw className="w-5 h-5 animate-spin text-rose-500 mr-2" /> Đang tải danh sách thôi việc…
        </div>
      }
    >
      <ResignContent />
    </Suspense>
  );
}
