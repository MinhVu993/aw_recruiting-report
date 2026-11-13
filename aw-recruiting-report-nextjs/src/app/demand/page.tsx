"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Target,
  Plus,
  RefreshCw,
  Search,
  X,
  FileSpreadsheet,
  SlidersHorizontal,
  Info,
  Users,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Save,
  Globe,
} from "lucide-react";
import { useSession } from "@/context/SessionContext";
import { useTranslation } from "@/hooks/useTranslation";
import * as XLSX from "xlsx";
import { useTableExcelFilter } from "@/hooks/useTableExcelFilter";
import { ExcelColumnFilter } from "@/components/table/ExcelColumnFilter";
import { useDialog } from "@/context/DialogContext";
import { getDemandLoc } from "@/lib/demand-utils";

interface CandidateRecord {
  empno: string;
  name: string;
  date: string;
}

interface DemandItem {
  id: number;
  id_code: string;
  demId?: string;
  dem_dept: string;
  dem_sub_department: string;
  dem_unit: string;
  dem_unit_name: string;
  dem_unit_multilang?: {
    vi: string;
    en: string;
    cn: string;
  };
  dem_position: string;
  dem_sub_position: string;
  dem_amount: number;
  key_in: string;
  dem_inputdate: string;
  dem_recruited: number;
  dem_fulfilled: string;
  dem_fullfilldate: string;
  stocknumber: number;
  dem_candidates: string;
  dem_note: string | Record<string, string>;
  dem_pause_start_at: string;
  dem_pause_end_at: string;
  dem_cancel_date: string;
  loc: string;
  status: string;
  candidates_count?: number;
}

const POSITION_FILTERS = [
  { vi: "Tất cả", en: "All" },
  { vi: "Công nhân", en: "Worker" },
  { vi: "Nhân viên", en: "Staff" },
  { vi: "Nhân viên (ngôn ngữ)", en: "Staff (lang)" },
  { vi: "Cán bộ", en: "Leader" },
  { vi: "Phiên dịch", en: "Translator" },
  { vi: "Kỹ sư", en: "Engineer" },
];

function DemandContent() {
  const { selectedFactory, setSelectedFactory } = useSession();
  const { t, locale } = useTranslation();
  const { showError, showSuccess, showConfirm } = useDialog();
  const searchParams = useSearchParams();

  // Read drill-through search parameters
  const paramIdCode = searchParams.get("idCode") || searchParams.get("demand_id");
  const paramPos = searchParams.get("pos") || searchParams.get("position");
  const paramDept = searchParams.get("dept");
  const paramLoc = searchParams.get("loc");

  // Helper to map unit name according to selected header language (VI / EN / CN)
  const getUnitName = (item: DemandItem) => {
    if (item.dem_unit_multilang) {
      return (
        item.dem_unit_multilang[locale] ||
        item.dem_unit_multilang.vi ||
        item.dem_unit_name
      );
    }
    return item.dem_unit_name;
  };

  const [demands, setDemands] = useState<DemandItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingMpr, setSyncingMpr] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [selectedPos, setSelectedPos] = useState<string>("All");

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Dialog states
  const [showAddEditModal, setShowAddEditModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<DemandItem | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Note dialog
  const [noteDialogOpen, setNoteDialogOpen] = useState<boolean>(false);
  const [activeNoteItem, setActiveNoteItem] = useState<DemandItem | null>(null);
  const [noteLang, setNoteLang] = useState<"vi" | "en" | "cn">("vi");

  // Candidates dialog
  const [candDialogOpen, setCandDialogOpen] = useState<boolean>(false);
  const [activeCandidatesList, setActiveCandidatesList] = useState<CandidateRecord[]>([]);
  const [activeCandTitle, setActiveCandTitle] = useState<string>("");

  // Column visibility
  const [showColumnDialog, setShowColumnDialog] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id_code: true,
    dem_unit: true,
    dem_unit_name: true,
    dem_position: true,
    dem_sub_position: true,
    dem_amount: true,
    key_in: true,
    dem_inputdate: true,
    dem_recruited: true,
    stocknumber: true,
    dem_status: true,
    dem_fullfilldate: true,
    dem_candidates: true,
    dem_note: true,
    dem_pause_start_at: false,
    dem_pause_end_at: false,
  });

  // Form inputs for Edit
  const [formData, setFormData] = useState({
    id_code: "",
    loc: "dmc",
    dept: "",
    dem_unit: "",
    dem_position: "Worker",
    dem_sub_position: "",
    dem_amount: 0,
    key_in: "",
    dem_inputdate: "",
    dem_note: "",
  });

  const fetchDemands = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/demand?loc=${selectedFactory}`);
      const json = await res.json();
      if (json.data) {
        const mapped = json.data.map((d: any) => {
          const rawCode = d.demId || d.dem_id || d.id_code || "";
          let cList: CandidateRecord[] = [];
          if (typeof d.dem_candidates === "string") {
            try {
              cList = JSON.parse(d.dem_candidates);
            } catch (e) {
              cList = [];
            }
          } else if (Array.isArray(d.dem_candidates)) {
            cList = d.dem_candidates;
          } else if (Array.isArray(d.demCandidates)) {
            cList = d.demCandidates;
          }
          return {
            ...d,
            id_code: rawCode,
            demId: rawCode,
            dem_dept: d.dem_dept || d.demDept || "",
            dem_sub_department: d.dem_sub_department || d.demSubDepartment || "",
            dem_unit: d.dem_unit || d.demUnit || "",
            dem_unit_name: d.dem_unit_name || d.demUnitName || d.demUnit || "",
            dem_position: d.dem_position || d.demPosition || "",
            dem_sub_position: d.dem_sub_position || d.demSubPosition || "",
            dem_amount: Number(d.dem_amount ?? d.demAmount ?? 0),
            dem_recruited: Number(d.dem_recruited ?? d.demRecruited ?? 0),
            stocknumber: Number(d.stocknumber ?? 0),
            dem_inputdate: d.dem_inputdate || d.demInputdate || "",
            dem_fulfilled: d.dem_fulfilled || d.demFulfilled || "no",
            dem_fullfilldate: d.dem_fullfilldate || d.demFullfilldate || "",
            dem_note: d.dem_note || d.demNote || "",
            loc: getDemandLoc(d.dem_unit || d.demUnit),
            candidates_count: cList.length,
          };
        });
        setDemands(mapped);
      }
    } catch (e) {
      console.error("Lỗi khi tải dữ liệu chỉ tiêu:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, [selectedFactory]);

  const handleManualSyncMpr = async () => {
    if (syncingMpr) return;
    setSyncingMpr(true);
    try {
      const res = await fetch("/api/demand/sync-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      await fetchDemands();
      if (data.success) {
        showSuccess(
          locale === "cn" ? "同步成功" : locale === "en" ? "Sync Completed" : "Đồng Bộ Thành Công",
          locale === "cn"
            ? `已同步 ${data.syncedCount || 0}/${data.totalDemands || 0} 筆指標。`
            : locale === "en"
            ? `Synced ${data.syncedCount || 0}/${data.totalDemands || 0} demands.`
            : `Đã đối soát & đồng bộ ${data.syncedCount || 0}/${data.totalDemands || 0} chỉ tiêu tuyển dụng.`
        );
      } else {
        showError("Lỗi Đồng Bộ", data.error || "Không thể đồng bộ dữ liệu chỉ tiêu.");
      }
    } catch (err) {
      showError("Lỗi Kết Nối", "Không thể kết nối máy chủ khi đồng bộ.");
    } finally {
      setSyncingMpr(false);
    }
  };

  // Base demands filtered by position chips and top search bar
  const baseDemands = useMemo(() => {
    return demands.filter((item) => {
      // 1. Position Filter
      if (selectedPos !== "All") {
        if (item.dem_position?.toLowerCase() !== selectedPos.toLowerCase()) {
          return false;
        }
      }

      // 2. Search Box Filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const match =
          item.id_code?.toLowerCase().includes(q) ||
          item.dem_unit?.toLowerCase().includes(q) ||
          item.dem_unit_name?.toLowerCase().includes(q) ||
          item.dem_position?.toLowerCase().includes(q) ||
          item.dem_sub_position?.toLowerCase().includes(q) ||
          item.dem_dept?.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [demands, selectedPos, search]);

  // Excel multi-column filtering and sorting
  const {
    filteredData: filteredDemands,
    filters: excelFilters,
    sortConfig,
    getDistinctValues,
    setFilter,
    setSort,
    resetFilter,
    resetAllFilters,
    activeFilterCount,
  } = useTableExcelFilter(baseDemands, {
    customExtractors: {
      dem_unit_name: (item) => getUnitName(item),
      status: (item) =>
        item.status === "closed"
          ? "Đã kết thúc"
          : item.status === "on_hold"
          ? "Tạm dừng"
          : "Đang tuyển",
      dem_note: (item) => {
        if (!item.dem_note) return "";
        if (typeof item.dem_note === "string") {
          try {
            const parsed = JSON.parse(item.dem_note);
            return parsed[locale] || parsed.vi || parsed.en || item.dem_note;
          } catch {
            return item.dem_note;
          }
        }
        return item.dem_note[locale] || item.dem_note.vi || "";
      },
      dem_pause_start_at: (item) => item.dem_pause_start_at || "",
      dem_pause_end_at: (item) => item.dem_pause_end_at || "",
    },
    defaultSort: { key: "key_in", direction: "desc" },
  });

  // Sync drill-through search parameters from Dashboard
  useEffect(() => {
    if (paramLoc && paramLoc !== selectedFactory && (paramLoc === "all" || paramLoc === "dmc" || paramLoc === "tb" || paramLoc === "tc")) {
      setSelectedFactory(paramLoc);
    }
    if (paramIdCode) {
      setSearch(paramIdCode);
    } else if (paramDept) {
      setSearch(paramDept);
    }
    if (paramPos) {
      const matched = POSITION_FILTERS.find(
        (p) => p.vi.toLowerCase() === paramPos.toLowerCase() || p.en.toLowerCase() === paramPos.toLowerCase()
      );
      if (matched) {
        setSelectedPos(matched.en);
      } else {
        setSelectedPos(paramPos);
      }
    }
  }, [searchParams]);

  const hasDrillThroughFilters = Boolean(paramIdCode || paramDept || (paramPos && paramPos !== "All"));

  // Totals for Summary Row
  const totals = useMemo(() => {
    return filteredDemands.reduce(
      (acc, cur) => {
        acc.totalAmount += Number(cur.dem_amount || 0);
        acc.totalRecruited += Number(cur.dem_recruited || 0);
        acc.totalStillInNeed += Number(cur.stocknumber || 0);
        acc.totalCandidates += Number(cur.candidates_count || 0);
        return acc;
      },
      { totalAmount: 0, totalRecruited: 0, totalStillInNeed: 0, totalCandidates: 0 }
    );
  }, [filteredDemands]);

  // Pagination slice
  const paginatedDemands = useMemo(() => {
    if (pageSize === -1) return filteredDemands;
    const start = (page - 1) * pageSize;
    return filteredDemands.slice(start, start + pageSize);
  }, [filteredDemands, page, pageSize]);

  const totalPages = pageSize === -1 ? 1 : Math.ceil(filteredDemands.length / pageSize) || 1;

  // Open Edit Modal
  const handleEdit = (item: DemandItem) => {
    setEditingItem(item);
    setFormData({
      id_code: item.id_code || `DM-${item.id}`,
      loc: getDemandLoc(item.dem_unit),
      dept: item.dem_unit_name || item.dem_dept || "",
      dem_unit: item.dem_unit || "",
      dem_position: item.dem_position || "Worker",
      dem_sub_position: item.dem_sub_position || "",
      dem_amount: item.dem_amount || 50,
      key_in: item.key_in || "",
      dem_inputdate: item.dem_inputdate || "",
      dem_note: typeof item.dem_note === "string" ? item.dem_note : JSON.stringify(item.dem_note),
    });
    setShowAddEditModal(true);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem(null);
    const initialLoc = selectedFactory === "all" ? "dmc" : selectedFactory;
    const initialUnit = initialLoc === "tc" ? "VVG0PDTC" : initialLoc === "tb" ? "VVG0TB01" : "VVG0PD01";
    setFormData({
      id_code: `MPR-${new Date().getFullYear()}-${String(demands.length + 1).padStart(3, "0")}`,
      loc: initialLoc,
      dept: "Xưởng May 1",
      dem_unit: initialUnit,
      dem_position: "Worker",
      dem_sub_position: "May 1 kim & Kansai",
      dem_amount: 50,
      key_in: new Date().toISOString().split("T")[0],
      dem_inputdate: new Date().toISOString().split("T")[0],
      dem_note: "",
    });
    setShowAddEditModal(true);
  };

  // Submit Save/Create
  const handleSaveDemand = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = "/api/demand";
      const method = editingItem ? "PUT" : "POST";
      const payload = {
        ...formData,
        demId: formData.id_code,
        dem_id: formData.id_code,
        id: editingItem?.id,
        dem_amount: Number(formData.dem_amount),
        dem_unit_name: formData.dept,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddEditModal(false);
        showSuccess(
          editingItem ? "Cập Nhật Chỉ Tiêu" : "Tạo Mới Chỉ Tiêu",
          `Đã ${editingItem ? "cập nhật" : "tạo mới"} chỉ tiêu tuyển dụng thành công.`
        );
        fetchDemands();
      } else {
        showError("Lỗi Lưu Chỉ Tiêu", data.error || "Lỗi khi lưu chỉ tiêu");
      }
    } catch (err) {
      showError("Lỗi Kết Nối", "Không thể kết nối đến máy chủ.");
    } finally {
      setSaving(false);
    }
  };

  // Delete demand
  const handleDeleteDemand = (item: DemandItem) => {
    showConfirm({
      type: "danger",
      title: "Xác Nhận Xóa Chỉ Tiêu",
      message: `Bạn có chắc chắn muốn xóa chỉ tiêu ${item.id_code} không?`,
      confirmText: "Xóa chỉ tiêu",
      cancelText: "Hủy bỏ",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/demand?id=${item.id}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            showSuccess("Đã Xóa", `Đã xóa thành công chỉ tiêu ${item.id_code}.`);
            fetchDemands();
          } else {
            showError("Lỗi Khi Xóa", data.error || "Lỗi khi xóa dữ liệu");
          }
        } catch (err) {
          showError("Lỗi Kết Nối", "Lỗi khi xóa dữ liệu");
        }
      },
    });
  };

  // Open Candidates Dialog
  const handleShowCandidates = (item: DemandItem) => {
    let cList: CandidateRecord[] = [];
    if (typeof item.dem_candidates === "string") {
      try {
        cList = JSON.parse(item.dem_candidates);
      } catch (e) {
        cList = [];
      }
    } else if (Array.isArray(item.dem_candidates)) {
      cList = item.dem_candidates;
    }
    setActiveCandidatesList(cList);
    setActiveCandTitle(`${item.id_code} - ${getUnitName(item)} (${item.dem_position})`);
    setCandDialogOpen(true);
  };

  // Open Note Dialog
  const handleShowNote = (item: DemandItem) => {
    setActiveNoteItem(item);
    setNoteDialogOpen(true);
  };

  // Note text helper
  const getNoteText = () => {
    if (!activeNoteItem?.dem_note) return "Không có ghi chú chi tiết.";
    if (typeof activeNoteItem.dem_note === "string") {
      try {
        const parsed = JSON.parse(activeNoteItem.dem_note);
        return parsed[noteLang] || parsed.vi || parsed.en || activeNoteItem.dem_note;
      } catch (e) {
        return activeNoteItem.dem_note;
      }
    }
    return activeNoteItem.dem_note[noteLang] || activeNoteItem.dem_note.vi || "";
  };

  // Export to Excel (2-Row Header standard matching demand.vue)
  const handleExportExcel = () => {
    const headersVI = [
      "ID",
      "Mã đơn vị",
      "Tên đơn vị",
      "Vị trí",
      "Vị trí phụ",
      "Số lượng",
      "Ngày nộp",
      "Ngày yêu cầu",
      "Đã tuyển",
      "Còn thiếu",
      "Tiến độ",
      "Trạng Thái",
      "Ngày hoàn thành",
      "Ứng viên",
      "Ghi chú",
      "Tạm dừng bắt đầu",
      "Tạm dừng kết thúc",
      "Phân xưởng",
    ];

    const headersCN = [
      "人員增補單編號",
      "單位代號",
      "單位名稱",
      "職位",
      "子職位",
      "需求人數",
      "申請日期",
      "申請日",
      "入職人數",
      "待招募",
      "達成率",
      "招募狀態",
      "招滿日",
      "應徵者",
      "備註",
      "暫停起始日",
      "暫停結束日",
      "廠區",
    ];

    const dataRows = filteredDemands.map((item) => {
      const pct = item.dem_amount > 0 ? Math.round((item.dem_recruited / item.dem_amount) * 100) : 0;
      let noteStr = "";
      if (typeof item.dem_note === "string") {
        try {
          const parsed = JSON.parse(item.dem_note);
          noteStr = parsed.vi || item.dem_note;
        } catch (e) {
          noteStr = item.dem_note;
        }
      } else if (item.dem_note) {
        noteStr = item.dem_note.vi || "";
      }

      return [
        item.id_code,
        item.dem_unit,
        getUnitName(item),
        item.dem_position,
        item.dem_sub_position,
        item.dem_amount,
        item.key_in || "",
        item.dem_inputdate,
        item.dem_recruited,
        item.stocknumber,
        `${pct}%`,
        item.status === "closed" ? "Đã kết thúc" : item.status === "on_hold" ? "Tạm dừng" : "Đang tuyển",
        item.dem_fullfilldate || "",
        item.candidates_count || 0,
        noteStr,
        item.dem_pause_start_at || "",
        item.dem_pause_end_at || "",
        item.loc.toUpperCase(),
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, [headersVI], { origin: "A1" });
    XLSX.utils.sheet_add_aoa(ws, [headersCN], { origin: "A2" });
    XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: "A3" });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Demand Report");

    const fileName = `demand_report_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 flex flex-col p-2.5 sm:p-3 overflow-hidden bg-[#eaedf0] dark:bg-[#121214] text-slate-900 dark:text-[#F1F2F4]">
      {/* ========================================================================= */}
      {/* TOP COCKPIT TOOLBAR (Matching demand.vue app-bar) */}
      {/* ========================================================================= */}
      <div id="tour-demand-header" className="flex flex-col gap-2.5 bg-[#f1f3f6] dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl p-2.5 sm:px-3.5 sm:py-2.5 mb-2.5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left Title & Position Filter Chips */}
          <div className="flex flex-wrap items-center gap-3 min-w-0">
            <div className="flex items-center space-x-2 shrink-0">
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <Target className="w-4.5 h-4.5" />
              </div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none whitespace-nowrap">
                {t("demandManagement", "Chỉ Tiêu & Nhu Cầu Tuyển Dụng")}
              </h1>
            </div>

            <div className="h-4 w-px bg-[#d8dce2] dark:bg-[#26262C] hidden sm:block" />

            {/* Position Filter Chips matching legacy v-chip-group */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {POSITION_FILTERS.map((pos) => {
                const isSelected = selectedPos === pos.en;
                const posLabel =
                  pos.en === "All"
                    ? t("all", "Tất cả")
                    : pos.en === "Worker"
                    ? t("worker", "Công nhân")
                    : pos.en === "Staff"
                    ? t("staff", "Nhân viên")
                    : pos.en === "Staff (lang)"
                    ? t("staffLang", "Nhân viên (ngôn ngữ)")
                    : pos.en === "Leader"
                    ? t("leader", "Cán bộ")
                    : pos.en === "Translator"
                    ? t("translator", "Phiên dịch")
                    : pos.en === "Engineer"
                    ? t("engineer", "Kỹ sư")
                    : pos.vi;

                return (
                  <button
                    key={pos.en}
                    onClick={() => {
                      setSelectedPos(pos.en);
                      setPage(1);
                    }}
                    className={`h-7 px-2.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors duration-150 active:scale-[0.97] border ${
                      isSelected
                        ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                        : "bg-white dark:bg-[#131316] text-slate-700 dark:text-slate-300 border-[#d8dce2] dark:border-[#26262C] hover:bg-slate-100 dark:hover:bg-[#202026]"
                    }`}
                  >
                    {posLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Factory pills, Search, Column setting, Refresh, Add */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Factory Filter Pills */}
            <div className="flex items-center bg-white dark:bg-[#131316] p-0.5 rounded-md border border-[#d8dce2] dark:border-[#26262C] text-xs">
              {["all", "dmc", "tb", "tc"].map((loc) => {
                const isSelected = selectedFactory === loc;
                return (
                  <button
                    key={loc}
                    onClick={() => {
                      setSelectedFactory(loc);
                      setPage(1);
                    }}
                    className={`h-7 px-2.5 rounded text-xs font-semibold uppercase inline-flex items-center justify-center transition-colors duration-150 active:scale-[0.97] ${
                      isSelected
                        ? "bg-sky-600 text-white shadow-xs font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {loc === "all" ? t("all", "Tất cả") : loc.toUpperCase()}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={t("searchDemandTablePlaceholder")}
                aria-label={t("search")}
                className="w-44 sm:w-56 h-8 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] pl-7 pr-7 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500 transition-colors"
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

            {/* Show/Hide Columns Button */}
            <button
              onClick={() => setShowColumnDialog(true)}
              className="h-8 w-8 rounded-md bg-white hover:bg-slate-100 dark:bg-[#131316] dark:hover:bg-[#202026] text-slate-700 dark:text-slate-300 border border-[#d8dce2] dark:border-[#26262C] flex items-center justify-center transition-colors shrink-0 shadow-xs"
              title={t("columnSettings")}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* Sync All Demands Button */}
            <button
              onClick={handleManualSyncMpr}
              disabled={syncingMpr || loading}
              className="h-8 px-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shrink-0 shadow-xs active:scale-[0.97] cursor-pointer"
              title="Đồng bộ tất cả chỉ tiêu tuyển dụng & đối soát số lượng đã tuyển"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-white ${syncingMpr ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">
                {locale === "cn" ? "同步全部指标" : locale === "en" ? "Sync All" : "Đồng bộ tất cả"}
              </span>
            </button>

            {/* Reload Button */}
            <button
              onClick={fetchDemands}
              disabled={loading}
              className="h-8 w-8 rounded-md bg-white hover:bg-slate-100 dark:bg-[#131316] dark:hover:bg-[#202026] text-slate-700 dark:text-slate-300 border border-[#d8dce2] dark:border-[#26262C] flex items-center justify-center transition-colors shrink-0 shadow-xs"
              title={t("refresh")}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-sky-600" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Active Drill-Through Filter Notification Banner */}
      {hasDrillThroughFilters && (
        <div className="flex items-center justify-between px-3 py-2 bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 rounded-lg text-xs shadow-xs mb-2 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center gap-2 text-sky-900 dark:text-sky-200 font-medium">
            <span className="font-bold">{t("filtering")}</span>
            {paramIdCode && (
              <span className="bg-sky-100 dark:bg-sky-900/60 px-2.5 py-0.5 rounded font-extrabold border border-sky-300 text-xs">
                {t("demandId")}: {paramIdCode}
              </span>
            )}
            {paramDept && (
              <span className="bg-sky-100 dark:bg-sky-900/60 px-2.5 py-0.5 rounded font-extrabold border border-sky-300 text-xs">
                {t("department")}: {paramDept}
              </span>
            )}
            {paramPos && paramPos !== "All" && (
              <span className="bg-sky-100 dark:bg-sky-900/60 px-2.5 py-0.5 rounded font-extrabold border border-sky-300 text-xs">
                {t("position")}: {paramPos}
              </span>
            )}
            <span className="text-zinc-600 dark:text-zinc-400">
              ({filteredDemands.length} {t("demandsCountUnit")})
            </span>
          </div>
          <button
            onClick={() => {
              setSearch("");
              setSelectedPos("All");
              resetAllFilters();
              window.history.replaceState(null, "", "/demand");
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-sky-300 text-xs font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition-colors shadow-2xs cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> {t("clearFilters")}
          </button>
        </div>
      )}

      {/* Active Excel Column Filters Banner */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-lg text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300 font-medium">
            <span className="font-bold">{t("activeFilters")}</span>
            <span className="bg-sky-100 dark:bg-sky-900/60 px-2 py-0.5 rounded font-extrabold text-sky-800 dark:text-sky-200 text-xs border border-sky-300 dark:border-sky-800">
              {activeFilterCount} {t("columnsCount")}
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              ({t("showingCandidates")} {filteredDemands.length} / {demands.length} {t("demandsCountUnit")})
            </span>
          </div>
          <button
            id="btn-reset-all-excel-filters"
            onClick={resetAllFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-sky-300 dark:border-sky-800 text-xs font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-950 transition-colors shadow-2xs"
          >
            <X className="w-3.5 h-3.5" /> {t("clearFilters")}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN DATA TABLE CONTAINER (High Fidelity to pages/demand.vue) */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 w-full rounded-xl border border-[#d8dce2] dark:border-[#26262C] bg-white dark:bg-[#18181C] flex flex-col overflow-hidden shadow-xs">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="sticky top-0 z-20 bg-[#e6e9ee] dark:bg-[#131316] border-b border-[#d0d5dd] dark:border-[#26262C]">
              <tr className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider select-none">
                <th className="py-2.5 px-3 w-10 text-center">{t("stt", "STT")}</th>
                {visibleColumns.id_code && (
                  <th className="py-2 px-3">
                    <ExcelColumnFilter
                      title={t("demandId", "ID")}
                      columnKey="id_code"
                      distinctValues={getDistinctValues("id_code")}
                      selectedValues={excelFilters["id_code"]}
                      onFilterChange={(v) => setFilter("id_code", v)}
                      sortDirection={sortConfig?.key === "id_code" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("id_code", dir)}
                    />
                  </th>
                )}
                {visibleColumns.dem_unit && (
                  <th className="py-2 px-3">
                    <ExcelColumnFilter
                      title={t("unitCode", "Mã Đơn Vị")}
                      columnKey="dem_unit"
                      distinctValues={getDistinctValues("dem_unit")}
                      selectedValues={excelFilters["dem_unit"]}
                      onFilterChange={(v) => setFilter("dem_unit", v)}
                      sortDirection={sortConfig?.key === "dem_unit" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("dem_unit", dir)}
                    />
                  </th>
                )}
                {visibleColumns.dem_unit_name && (
                  <th className="py-2 px-3.5">
                    <ExcelColumnFilter
                      title={t("unitName", "Tên Đơn Vị")}
                      columnKey="dem_unit_name"
                      distinctValues={getDistinctValues("dem_unit_name")}
                      selectedValues={excelFilters["dem_unit_name"]}
                      onFilterChange={(v) => setFilter("dem_unit_name", v)}
                      sortDirection={sortConfig?.key === "dem_unit_name" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("dem_unit_name", dir)}
                    />
                  </th>
                )}
                {visibleColumns.dem_position && (
                  <th className="py-2 px-3">
                    <ExcelColumnFilter
                      title={t("position", "Vị Trí")}
                      columnKey="dem_position"
                      distinctValues={getDistinctValues("dem_position")}
                      selectedValues={excelFilters["dem_position"]}
                      onFilterChange={(v) => setFilter("dem_position", v)}
                      sortDirection={sortConfig?.key === "dem_position" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("dem_position", dir)}
                    />
                  </th>
                )}
                {visibleColumns.dem_sub_position && (
                  <th className="py-2 px-3">
                    <ExcelColumnFilter
                      title={t("subPosition", "Vị Trí Phụ")}
                      columnKey="dem_sub_position"
                      distinctValues={getDistinctValues("dem_sub_position")}
                      selectedValues={excelFilters["dem_sub_position"]}
                      onFilterChange={(v) => setFilter("dem_sub_position", v)}
                      sortDirection={sortConfig?.key === "dem_sub_position" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("dem_sub_position", dir)}
                    />
                  </th>
                )}
                {visibleColumns.dem_amount && (
                  <th className="py-2 px-3 text-center">
                    <ExcelColumnFilter
                      title={t("amount", "Số lượng")}
                      columnKey="dem_amount"
                      align="center"
                      distinctValues={getDistinctValues("dem_amount")}
                      selectedValues={excelFilters["dem_amount"]}
                      onFilterChange={(v) => setFilter("dem_amount", v)}
                      sortDirection={sortConfig?.key === "dem_amount" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("dem_amount", dir)}
                    />
                  </th>
                )}
                {visibleColumns.key_in && (
                  <th className="py-2 px-3 text-center">
                    <ExcelColumnFilter
                      title={t("keyInDate", "Ngày Nộp")}
                      columnKey="key_in"
                      align="center"
                      distinctValues={getDistinctValues("key_in")}
                      selectedValues={excelFilters["key_in"]}
                      onFilterChange={(v) => setFilter("key_in", v)}
                      sortDirection={sortConfig?.key === "key_in" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("key_in", dir)}
                    />
                  </th>
                )}
                {visibleColumns.dem_inputdate && (
                  <th className="py-2 px-3 text-center">
                    <ExcelColumnFilter
                      title={t("requestDate", "Ngày YC")}
                      columnKey="dem_inputdate"
                      align="center"
                      distinctValues={getDistinctValues("dem_inputdate")}
                      selectedValues={excelFilters["dem_inputdate"]}
                      onFilterChange={(v) => setFilter("dem_inputdate", v)}
                      sortDirection={sortConfig?.key === "dem_inputdate" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("dem_inputdate", dir)}
                    />
                  </th>
                )}
                {visibleColumns.dem_recruited && (
                  <th className="py-2 px-3 text-center">
                    <ExcelColumnFilter
                      title={t("recruited", "Đã Tuyển")}
                      columnKey="dem_recruited"
                      align="center"
                      distinctValues={getDistinctValues("dem_recruited")}
                      selectedValues={excelFilters["dem_recruited"]}
                      onFilterChange={(v) => setFilter("dem_recruited", v)}
                      sortDirection={sortConfig?.key === "dem_recruited" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("dem_recruited", dir)}
                    />
                  </th>
                )}
                {visibleColumns.stocknumber && (
                  <th className="py-2 px-3 text-center">
                    <ExcelColumnFilter
                      title={t("stillInNeed", "Còn Thiếu")}
                      columnKey="stocknumber"
                      align="center"
                      distinctValues={getDistinctValues("stocknumber")}
                      selectedValues={excelFilters["stocknumber"]}
                      onFilterChange={(v) => setFilter("stocknumber", v)}
                      sortDirection={sortConfig?.key === "stocknumber" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("stocknumber", dir)}
                    />
                  </th>
                )}
                {visibleColumns.dem_status && (
                  <th className="py-2 px-3 text-center">
                    <ExcelColumnFilter
                      title={t("status", "Trạng Thái")}
                      columnKey="status"
                      align="center"
                      distinctValues={getDistinctValues("status")}
                      selectedValues={excelFilters["status"]}
                      onFilterChange={(v) => setFilter("status", v)}
                      sortDirection={sortConfig?.key === "status" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("status", dir)}
                    />
                  </th>
                )}
                {visibleColumns.dem_fullfilldate && (
                  <th className="py-2 px-3 text-center">
                    <ExcelColumnFilter
                      title={t("fulfilledDate", "Ngày hoàn thành")}
                      columnKey="dem_fullfilldate"
                      align="center"
                      distinctValues={getDistinctValues("dem_fullfilldate")}
                      selectedValues={excelFilters["dem_fullfilldate"]}
                      onFilterChange={(v) => setFilter("dem_fullfilldate", v)}
                      sortDirection={sortConfig?.key === "dem_fullfilldate" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("dem_fullfilldate", dir)}
                    />
                  </th>
                )}
                {visibleColumns.dem_candidates && (
                  <th className="py-2 px-3 text-center">
                    <ExcelColumnFilter
                      title={t("candidates", "Ứng Viên")}
                      columnKey="candidates_count"
                      align="center"
                      distinctValues={getDistinctValues("candidates_count")}
                      selectedValues={excelFilters["candidates_count"]}
                      onFilterChange={(v) => setFilter("candidates_count", v)}
                      sortDirection={sortConfig?.key === "candidates_count" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("candidates_count", dir)}
                    />
                  </th>
                )}
                {visibleColumns.dem_note && (
                  <th className="py-2 px-2.5 text-center">
                    <ExcelColumnFilter
                      title={t("note", "Ghi Chú")}
                      columnKey="dem_note"
                      align="center"
                      distinctValues={getDistinctValues("dem_note")}
                      selectedValues={excelFilters["dem_note"]}
                      onFilterChange={(v) => setFilter("dem_note", v)}
                      sortDirection={sortConfig?.key === "dem_note" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("dem_note", dir)}
                    />
                  </th>
                )}
                {visibleColumns.dem_pause_start_at && (
                  <th className="py-2 px-3 text-center">
                    <ExcelColumnFilter
                      title={t("onHoldStart", "Tạm Dừng Từ")}
                      columnKey="dem_pause_start_at"
                      align="center"
                      dataType="date"
                      distinctValues={getDistinctValues("dem_pause_start_at")}
                      selectedValues={excelFilters["dem_pause_start_at"]}
                      onFilterChange={(v) => setFilter("dem_pause_start_at", v)}
                      sortDirection={sortConfig?.key === "dem_pause_start_at" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("dem_pause_start_at", dir)}
                    />
                  </th>
                )}
                {visibleColumns.dem_pause_end_at && (
                  <th className="py-2 px-3 text-center">
                    <ExcelColumnFilter
                      title={t("onHoldEnd", "Tạm Dừng Đến")}
                      columnKey="dem_pause_end_at"
                      align="center"
                      dataType="date"
                      distinctValues={getDistinctValues("dem_pause_end_at")}
                      selectedValues={excelFilters["dem_pause_end_at"]}
                      onFilterChange={(v) => setFilter("dem_pause_end_at", v)}
                      sortDirection={sortConfig?.key === "dem_pause_end_at" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("dem_pause_end_at", dir)}
                    />
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e2e6eb] dark:divide-[#26262C] font-medium text-xs">
              {loading && demands.length === 0 ? (
                <tr>
                  <td colSpan={20} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="w-5 h-5 text-sky-600 animate-spin" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Đang tải danh sách chỉ tiêu tuyển dụng...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : paginatedDemands.length === 0 ? (
                <tr>
                  <td colSpan={20} className="py-14 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Target className="w-8 h-8 text-slate-400 stroke-[1.5]" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Không tìm thấy chỉ tiêu tuyển dụng phù hợp
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Thử thay đổi bộ lọc vị trí hoặc từ khóa tìm kiếm
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedDemands.map((item, idx) => {
                  const pct =
                    item.dem_amount > 0
                      ? Math.round((item.dem_recruited / item.dem_amount) * 100)
                      : 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#edf0f4] dark:hover:bg-[#202026] transition-colors"
                    >
                      {/* STT */}
                      <td className="py-2 px-3 text-center text-slate-500 tabular-nums text-xs">
                        {(page - 1) * pageSize + idx + 1}
                      </td>

                      {/* ID code (Clickable to edit) */}
                      {visibleColumns.id_code && (
                        <td className="py-2 px-3">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer tracking-tight"
                            title="Bấm để chỉnh sửa chỉ tiêu"
                          >
                            {item.id_code}
                          </button>
                        </td>
                      )}

                      {/* Unit code */}
                      {visibleColumns.dem_unit && (
                        <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300 text-xs">
                          {item.dem_unit}
                        </td>
                      )}

                      {/* Unit name */}
                      {visibleColumns.dem_unit_name && (
                        <td className="py-2 px-3.5 font-bold text-slate-900 dark:text-white">
                          {getUnitName(item)}
                        </td>
                      )}

                      {/* Position */}
                      {visibleColumns.dem_position && (
                        <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {(() => {
                            if (!item.dem_position) return "-";
                            const p = item.dem_position.trim();
                            if (p === "Công nhân" || p.toLowerCase() === "worker") return t("worker");
                            if (p === "Nhân viên" || p.toLowerCase() === "staff") return t("staff");
                            if (p === "Cán bộ" || p === "Cán bộ / Tổ trưởng" || p.toLowerCase() === "leader") return t("leader");
                            if (p === "Phiên dịch" || p.toLowerCase() === "translator") return t("translator");
                            if (p === "Kỹ sư" || p.toLowerCase() === "engineer") return t("engineer");
                            return p;
                          })()}
                        </td>
                      )}

                      {/* Sub position */}
                      {visibleColumns.dem_sub_position && (
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                          {item.dem_sub_position || "-"}
                        </td>
                      )}

                      {/* Amount */}
                      {visibleColumns.dem_amount && (
                        <td className="py-2 px-3 text-center font-bold tabular-nums text-slate-900 dark:text-white">
                          {item.dem_amount}
                        </td>
                      )}

                      {/* Apply date (key_in) */}
                      {visibleColumns.key_in && (
                        <td className="py-2 px-3 text-center tabular-nums text-slate-600 dark:text-slate-400 text-xs">
                          {item.key_in || "-"}
                        </td>
                      )}

                      {/* Request date */}
                      {visibleColumns.dem_inputdate && (
                        <td className="py-2 px-3 text-center tabular-nums text-slate-600 dark:text-slate-400 text-xs">
                          {item.dem_inputdate || "-"}
                        </td>
                      )}

                      {/* Recruited */}
                      {visibleColumns.dem_recruited && (
                        <td className="py-2 px-3 text-center">
                          <Link
                            href={`/candidates?demand_id=${encodeURIComponent(item.id_code || String(item.id))}&recruited=true`}
                            className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400 hover:underline"
                            title={`Bấm để xem danh sách ${item.dem_recruited} ứng viên đã tuyển (đã có mã thẻ) của mã đơn ${item.id_code || item.id}`}
                          >
                            {item.dem_recruited}
                          </Link>
                        </td>
                      )}

                      {/* Still in need (stocknumber) */}
                      {visibleColumns.stocknumber && (
                        <td className="py-2 px-3 text-center font-bold tabular-nums">
                          {item.stocknumber > 0 ? (
                            <span className="text-rose-600 dark:text-rose-400">
                              {item.stocknumber}
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400">0</span>
                          )}
                        </td>
                      )}

                      {/* Status */}
                      {visibleColumns.dem_status && (
                        <td className="py-2 px-3 text-center text-xs font-semibold">
                          {item.status === "closed" || pct >= 100 ? (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {t("demandClosed")}
                            </span>
                          ) : item.status === "on_hold" || item.dem_pause_start_at ? (
                            <span className="text-amber-600 dark:text-amber-400">
                              {t("demandOnHold")}
                            </span>
                          ) : (
                            <span className="text-sky-600 dark:text-sky-400">
                              {t("demandRecruiting")}
                            </span>
                          )}
                        </td>
                      )}

                      {/* Fullfilled date */}
                      {visibleColumns.dem_fullfilldate && (
                        <td className="py-2 px-3 text-center tabular-nums text-slate-600 dark:text-slate-400 text-xs">
                          {item.dem_fullfilldate || "-"}
                        </td>
                      )}

                      {/* Candidates count (Clickable to view modal) */}
                      {visibleColumns.dem_candidates && (
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleShowCandidates(item)}
                            className="tabular-nums font-semibold text-xs text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                            title="Bấm để xem danh sách ứng viên"
                          >
                            {item.candidates_count || 0}
                          </button>
                        </td>
                      )}

                      {/* Note (Clickable Info Icon) */}
                      {visibleColumns.dem_note && (
                        <td className="py-2 px-2.5 text-center">
                          {item.dem_note ? (
                            <button
                              type="button"
                              onClick={() => handleShowNote(item)}
                              className="p-1 rounded text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Bấm để xem chi tiết ghi chú"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">-</span>
                          )}
                        </td>
                      )}

                      {/* On hold start */}
                      {visibleColumns.dem_pause_start_at && (
                        <td className="py-2 px-3 text-center tabular-nums text-slate-600 dark:text-slate-400 text-xs">
                          {item.dem_pause_start_at || "-"}
                        </td>
                      )}

                      {/* On hold end */}
                      {visibleColumns.dem_pause_end_at && (
                        <td className="py-2 px-3 text-center tabular-nums text-slate-600 dark:text-slate-400 text-xs">
                          {item.dem_pause_end_at || "-"}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* ========================================================================= */}
            {/* TOTAL SUMMARY ROW (Matching legacy v-slot:body.append) */}
            {/* ========================================================================= */}
            {filteredDemands.length > 0 && (
              <tfoot className="sticky bottom-0 z-10 bg-[#f1f3f6] dark:bg-[#131316] border-t-2 border-[#d0d5dd] dark:border-[#26262C] font-bold text-xs select-none">
                <tr>
                  <td colSpan={4} className="py-2.5 px-3 text-center uppercase tracking-wide text-slate-700 dark:text-slate-300">
                    {t("total", "TỔNG CỘNG")}
                  </td>
                  {visibleColumns.dem_position && <td></td>}
                  {visibleColumns.dem_sub_position && <td></td>}
                  {visibleColumns.dem_amount && (
                    <td className="py-2.5 px-3 text-center tabular-nums font-black text-slate-900 dark:text-white">
                      {totals.totalAmount}
                    </td>
                  )}
                  {visibleColumns.key_in && <td></td>}
                  {visibleColumns.dem_inputdate && <td></td>}
                  {visibleColumns.dem_recruited && (
                    <td className="py-2.5 px-3 text-center tabular-nums font-black text-emerald-600 dark:text-emerald-400">
                      {totals.totalRecruited}
                    </td>
                  )}
                  {visibleColumns.stocknumber && (
                    <td className="py-2.5 px-3 text-center tabular-nums font-black text-rose-600 dark:text-rose-400">
                      {totals.totalStillInNeed}
                    </td>
                  )}
                  {visibleColumns.dem_status && <td></td>}
                  {visibleColumns.dem_fullfilldate && <td></td>}
                  {visibleColumns.dem_candidates && (
                    <td className="py-2.5 px-3 text-center tabular-nums font-black text-sky-600 dark:text-sky-400">
                      {totals.totalCandidates}
                    </td>
                  )}
                  {visibleColumns.dem_note && <td></td>}
                  {visibleColumns.dem_pause_start_at && <td></td>}
                  {visibleColumns.dem_pause_end_at && <td></td>}
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM COCKPIT FOOTER & PAGINATION (Matching legacy footer.prepend) */}
        {/* ========================================================================= */}
        <div className="border-t border-[#d8dce2] dark:border-[#26262C] bg-[#f1f3f6] dark:bg-[#121214] px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Left: Export Excel */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportExcel}
              className="h-8 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center space-x-1.5 transition-colors shadow-xs active:scale-[0.97]"
              title="Xuất dữ liệu chỉ tiêu ra file Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{t("exportExcel", "Xuất Excel")}</span>
            </button>
          </div>

          {/* Right: Page Size & Navigation */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
              <span className="text-[11px]">{locale === "cn" ? "每页行数:" : locale === "en" ? "Rows/page:" : "Dòng/trang:"}</span>
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
                <option value={-1}>{t("all", "Tất cả")}</option>
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-7 w-7 rounded bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] flex items-center justify-center text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-[#202026]"
                title="Trang trước"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 tabular-nums text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 w-7 rounded bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] flex items-center justify-center text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-[#202026]"
                title="Trang sau"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW CANDIDATES DIALOG */}
      {/* ========================================================================= */}
      {candDialogOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setCandDialogOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3"
        >
          <div className="bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl animate-modal-enter">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#d8dce2] dark:border-[#26262C] bg-[#f1f3f6] dark:bg-[#131316]">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                <Users className="w-4 h-4" />
                <span>{t("hiredCandidates")} ({activeCandidatesList.length})</span>
              </div>
              <button
                onClick={() => setCandDialogOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
                {activeCandTitle}
              </p>

              {activeCandidatesList.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  {t("noCandidatesLinked")}
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto custom-scrollbar border border-[#d8dce2] dark:border-[#26262C] rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#e6e9ee] dark:bg-[#131316] text-xs font-bold text-slate-700 dark:text-slate-400 uppercase">
                      <tr>
                        <th className="py-2 px-3">{t("empnoCard")}</th>
                        <th className="py-2 px-3">{t("fullName")}</th>
                        <th className="py-2 px-3 text-right">{t("actualDate")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e6eb] dark:divide-[#26262C]">
                      {activeCandidatesList.map((c, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-[#202026]">
                          <td className="py-2 px-3 tabular-nums font-bold text-purple-600 dark:text-purple-400">
                            {c.empno}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                            {c.name}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
                            {c.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => setCandDialogOpen(false)}
                  className="h-8 px-4 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 text-xs font-semibold"
                >
                  {t("close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VIEW NOTE DETAILS (MULTILINGUAL VI/EN/CN) */}
      {/* ========================================================================= */}
      {noteDialogOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setNoteDialogOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3"
        >
          <div className="bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-modal-enter">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#d8dce2] dark:border-[#26262C] bg-[#f1f3f6] dark:bg-[#131316]">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                <Info className="w-4 h-4" />
                <span>{t("noteDetailsTitle")}</span>
              </div>
              <button
                onClick={() => setNoteDialogOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#d8dce2] dark:border-[#26262C]">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {activeNoteItem?.id_code} - {activeNoteItem ? getUnitName(activeNoteItem) : ""}
                </span>

                {/* Language Switcher Buttons */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded text-xs font-bold">
                  {(["vi", "en", "cn"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setNoteLang(l)}
                      className={`px-2 py-0.5 rounded uppercase text-[10px] ${
                        noteLang === l
                          ? "bg-sky-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs text-slate-800 dark:text-slate-200 leading-relaxed min-h-[90px] whitespace-pre-wrap">
                {getNoteText()}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setNoteDialogOpen(false)}
                  className="h-8 px-4 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 text-xs font-semibold"
                >
                  {t("close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD / EDIT DEMAND FORM */}
      {/* ========================================================================= */}
      {showAddEditModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddEditModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto"
        >
          <div className="bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl animate-modal-enter my-8">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#d8dce2] dark:border-[#26262C] bg-[#f1f3f6] dark:bg-[#131316]">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                <Target className="w-4 h-4" />
                <span>{editingItem ? t("editDemandTitle") : t("addDemandTitle")}</span>
              </div>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDemand} className="p-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t("demandCodeForm")}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.id_code}
                    onChange={(e) => setFormData({ ...formData, id_code: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs tabular-nums font-bold text-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t("factory")}
                  </label>
                  <select
                    value={formData.loc}
                    onChange={(e) => setFormData({ ...formData, loc: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs font-bold focus:outline-none focus:ring-1 focus:ring-sky-500 uppercase"
                  >
                    <option value="dmc">DMC (Đông Mỹ Cự)</option>
                    <option value="tb">TB (Thái Bình)</option>
                    <option value="tc">TC (Tiền Châu)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t("unitCodeForm")}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dem_unit}
                    onChange={(e) => {
                      const val = e.target.value;
                      const newLoc = getDemandLoc(val);
                      setFormData({ ...formData, dem_unit: val, loc: newLoc });
                    }}
                    placeholder="VD: VVG0PDTC"
                    className="w-full h-8 px-2.5 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t("unitNameForm")}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dept}
                    onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                    placeholder="VD: Xưởng May 1"
                    className="w-full h-8 px-2.5 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t("position")}
                  </label>
                  <select
                    value={formData.dem_position}
                    onChange={(e) => setFormData({ ...formData, dem_position: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="Worker">{t("worker")}</option>
                    <option value="Staff">{t("staff")}</option>
                    <option value="Staff (lang)">{t("staffLang")}</option>
                    <option value="Leader">{t("leader")}</option>
                    <option value="Translator">{t("translator")}</option>
                    <option value="Engineer">{t("engineer")}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t("targetAmount")}
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.dem_amount}
                    onChange={(e) => setFormData({ ...formData, dem_amount: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs tabular-nums font-bold focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t("subPosition")}
                </label>
                <input
                  type="text"
                  value={formData.dem_sub_position}
                  onChange={(e) => setFormData({ ...formData, dem_sub_position: e.target.value })}
                  placeholder="VD: May 1 kim, Kansai, QC đóng gói..."
                  className="w-full h-8 px-2.5 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t("requestDateForm")}
                  </label>
                  <input
                    type="date"
                    value={formData.dem_inputdate}
                    onChange={(e) => setFormData({ ...formData, dem_inputdate: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t("keyInDate")}
                  </label>
                  <input
                    type="date"
                    value={formData.key_in}
                    onChange={(e) => setFormData({ ...formData, key_in: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t("note")}
                </label>
                <textarea
                  rows={2}
                  value={formData.dem_note}
                  onChange={(e) => setFormData({ ...formData, dem_note: e.target.value })}
                  placeholder=""
                  className="w-full p-2.5 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#d8dce2] dark:border-[#26262C]">
                <div>
                  {editingItem && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteDemand(editingItem);
                        setShowAddEditModal(false);
                      }}
                      className="h-8 px-3 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors"
                      title={t("delete")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t("delete")}</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddEditModal(false)}
                    className="h-8 px-4 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="h-8 px-4 rounded-md bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold inline-flex items-center space-x-1.5 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? t("savingCandidate") : editingItem ? t("update") : t("saveDemandAction")}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: SHOW / HIDE COLUMNS DIALOG */}
      {/* ========================================================================= */}
      {showColumnDialog && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowColumnDialog(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3"
        >
          <div className="bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl max-w-sm w-full overflow-hidden shadow-2xl animate-modal-enter">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#d8dce2] dark:border-[#26262C] bg-[#f1f3f6] dark:bg-[#131316]">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                <SlidersHorizontal className="w-4 h-4" />
                <span>{t("columnSettings")}</span>
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
                { key: "id_code", label: t("demandId") },
                { key: "dem_unit", label: t("unitCode") },
                { key: "dem_unit_name", label: t("unitName") },
                { key: "dem_position", label: t("position") },
                { key: "dem_sub_position", label: t("subPosition") },
                { key: "dem_amount", label: t("targetAmount") },
                { key: "key_in", label: t("keyInDate") },
                { key: "dem_inputdate", label: t("requestDate") },
                { key: "dem_recruited", label: t("recruited") },
                { key: "stocknumber", label: t("stillInNeed") },
                { key: "dem_status", label: t("status") },
                { key: "dem_fullfilldate", label: t("fulfilledDate") },
                { key: "dem_candidates", label: t("candidatesCount") },
                { key: "dem_note", label: t("note") },
                { key: "dem_pause_start_at", label: t("onHoldStart") },
                { key: "dem_pause_end_at", label: t("onHoldEnd") },
              ].map((col) => (
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
                    className="w-4 h-4 text-sky-600 rounded border-slate-300 dark:border-slate-600 focus:ring-sky-500"
                  />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{col.label}</span>
                </label>
              ))}
            </div>

            <div className="px-4 py-2.5 bg-[#f1f3f6] dark:bg-[#131316] border-t border-[#d8dce2] dark:border-[#26262C] flex justify-end">
              <button
                onClick={() => setShowColumnDialog(false)}
                className="h-7 px-3.5 rounded-md bg-sky-600 text-white text-xs font-bold"
              >
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DemandPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex-1 flex items-center justify-center p-6 text-xs text-zinc-500 bg-[#eaedf0] dark:bg-[#121214]">
          <RefreshCw className="w-5 h-5 animate-spin text-sky-500 mr-2" /> Đang tải danh sách chỉ tiêu…
        </div>
      }
    >
      <DemandContent />
    </Suspense>
  );
}
