"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  GraduationCap,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  School,
  X,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Info,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Check,
  Search,
  Building2,
  Calendar,
  AlertCircle,
  Upload,
  UploadCloud,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { useTableExcelFilter } from "@/hooks/useTableExcelFilter";
import { ExcelColumnFilter } from "@/components/table/ExcelColumnFilter";
import { useDialog } from "@/context/DialogContext";
import { useTranslation } from "@/hooks/useTranslation";

export interface InternItem {
  id: number;
  empId: string;
  studentName: string;
  deptCode: number | null;
  deptName: string;
  school: string;
  educationLevel: string;
  major: string;
  startDate: string;
  endDate: string;
  allowance: boolean;
  bus: boolean;
  recruitType: string;
  workingTime: string;
  notes: string;
  photoUrl: string | null;
  loc: string;
  status: "active" | "completed";
}

export interface DepartmentOption {
  id: number;
  code: string;
  name: string;
}

const EDUCATION_LEVELS = [
  "University",
  "College",
  "Master",
  "PhD",
  "Vocational",
];

const RECRUIT_SOURCES = [
  "Job Fair",
  "At School",
  "VG website",
  "Referral",
  "Social Media",
  "Others",
];

const INITIAL_FORM = {
  id: 0,
  empId: "",
  studentName: "",
  deptCode: "" as string | number,
  school: "",
  educationLevel: "University",
  major: "",
  startDate: "",
  endDate: "",
  allowance: false,
  bus: false,
  recruitType: "Job Fair",
  workingTime: '["2","3","4","5","6","7"]',
  notes: "",
  photoUrl: "",
};

export default function InternPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { selectedFactory, isAdmin, isLoading } = useSession();
  const { showError } = useDialog();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/");
    }
  }, [isLoading, isAdmin, router]);

  const [interns, setInterns] = useState<InternItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Modals
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");
  const [updatingToggleKey, setUpdatingToggleKey] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleToggleField = async (
    item: InternItem,
    field: "allowance" | "bus",
    nextVal: boolean
  ) => {
    const key = `${item.id}-${field}`;
    if (updatingToggleKey === key) return;
    setUpdatingToggleKey(key);

    // Optimistically update
    setInterns((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, [field]: nextVal } : i))
    );

    try {
      const res = await fetch("/api/intern", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          [field]: nextVal,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `Lỗi cập nhật ${field}`);
      }
    } catch (err: any) {
      console.error(`Error updating ${field}:`, err);
      showError("Lỗi Cập Nhật", err.message || `Không thể cập nhật ${field}`);
      // Rollback
      setInterns((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, [field]: !nextVal } : i))
      );
    } finally {
      setUpdatingToggleKey(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Vui lòng chọn tệp hình ảnh (JPG, PNG, WEBP, ...)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Dung lượng ảnh tối đa là 5MB");
      return;
    }

    setUploadingImage(true);
    setFormError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.url) {
        setForm((prev) => ({ ...prev, photoUrl: json.url }));
      } else {
        // Fallback to FileReader base64
        const reader = new FileReader();
        reader.onload = () => {
          setForm((prev) => ({ ...prev, photoUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    } catch {
      // Fallback to FileReader base64
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  // Viewing modals
  const [noteModal, setNoteModal] = useState<{ open: boolean; title: string; note: string }>({
    open: false,
    title: "",
    note: "",
  });
  const [photoModal, setPhotoModal] = useState<{ open: boolean; url: string; name: string }>({
    open: false,
    url: "",
    name: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; item: InternItem | null }>({
    open: false,
    item: null,
  });

  const fetchInterns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/intern?loc=${selectedFactory}`);
      const json = await res.json();
      if (json.success && json.data) {
        setInterns(json.data);
      }
      if (json.departments) {
        setDepartments(json.departments);
      }
    } catch (e) {
      console.error("Error fetching interns:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedFactory]);

  useEffect(() => {
    fetchInterns();
  }, [fetchInterns]);

  // Base list filtered by Search string & Status tab
  const baseInterns = useMemo(() => {
    return interns.filter((i) => {
      // Status filter
      if (statusFilter !== "all" && i.status !== statusFilter) {
        return false;
      }
      // Text search
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        i.studentName?.toLowerCase().includes(q) ||
        i.empId?.toLowerCase().includes(q) ||
        i.school?.toLowerCase().includes(q) ||
        i.major?.toLowerCase().includes(q) ||
        i.deptName?.toLowerCase().includes(q) ||
        i.recruitType?.toLowerCase().includes(q)
      );
    });
  }, [interns, search, statusFilter]);

  // Excel filter hook
  const {
    filteredData: filteredInterns,
    filters: excelFilters,
    sortConfig,
    getDistinctValues,
    setFilter,
    setSort,
    resetAllFilters,
    activeFilterCount,
  } = useTableExcelFilter(baseInterns, {
    customExtractors: {
      period: (i) => {
        const s = i.startDate || "";
        const e = i.endDate || "";
        if (!s && !e) return "";
        return `${s} ~ ${e}`;
      },
      allowance: (i) => (i.allowance ? "Có phụ cấp" : "Không"),
      bus: (i) => (i.bus ? "Có xe đưa rước" : "Không"),
      status: (i) => (i.status === "active" ? "Đang thực tập" : "Hoàn thành"),
    },
    defaultSort: { key: "id", direction: "desc" },
  });

  // Calculate pagination
  const totalPages = useMemo(() => {
    if (pageSize === -1) return 1;
    return Math.max(1, Math.ceil(filteredInterns.length / pageSize));
  }, [filteredInterns.length, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const paginatedInterns = useMemo(() => {
    if (pageSize === -1) return filteredInterns;
    const start = (page - 1) * pageSize;
    return filteredInterns.slice(start, start + pageSize);
  }, [filteredInterns, page, pageSize]);

  // Open Add Dialog
  const handleOpenAdd = () => {
    setForm(INITIAL_FORM);
    setIsEditing(false);
    setFormError("");
    setModalOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (item: InternItem) => {
    setForm({
      id: item.id,
      empId: item.empId || "",
      studentName: item.studentName || "",
      deptCode: item.deptCode || "",
      school: item.school === "-" ? "" : item.school,
      educationLevel: item.educationLevel === "-" ? "University" : item.educationLevel,
      major: item.major === "-" ? "" : item.major,
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      allowance: item.allowance,
      bus: item.bus,
      recruitType: item.recruitType === "-" ? "Job Fair" : item.recruitType,
      workingTime: item.workingTime || '["2","3","4","5","6","7"]',
      notes: item.notes || "",
      photoUrl: item.photoUrl || "",
    });
    setIsEditing(true);
    setFormError("");
    setModalOpen(true);
  };

  // Submit Add / Edit
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentName.trim()) {
      setFormError("Vui lòng nhập họ và tên thực tập sinh");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const url = "/api/intern";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          deptCode: form.deptCode ? Number(form.deptCode) : null,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Không thể lưu thông tin thực tập sinh");
      }

      setModalOpen(false);
      await fetchInterns();
    } catch (err: any) {
      setFormError(err.message || "Lỗi khi lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  // Delete intern
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.item) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/intern?id=${deleteConfirm.item.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Không thể xóa thực tập sinh");
      }
      setDeleteConfirm({ open: false, item: null });
      await fetchInterns();
    } catch (err: any) {
      showError("Lỗi Khi Xóa", err.message || "Lỗi khi xóa thực tập sinh");
    } finally {
      setSaving(false);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const headers = [
      t("stt"),
      t("internEmpId"),
      t("internName"),
      t("internSchool"),
      t("internDept"),
      t("internEdu"),
      t("internMajor"),
      t("internSource"),
      t("periodFrom") || "Ngày bắt đầu",
      t("periodTo") || "Ngày kết thúc",
      t("internAllowance"),
      t("internBus"),
      t("internStatus"),
      t("note"),
    ];

    const dataRows = filteredInterns.map((item, index) => [
      index + 1,
      item.empId,
      item.studentName,
      item.school,
      item.deptName,
      item.educationLevel,
      item.major,
      item.recruitType,
      item.startDate,
      item.endDate,
      item.allowance ? t("yes") : t("no"),
      item.bus ? t("yes") : t("no"),
      item.status === "active" ? t("internActive") : t("internCompleted"),
      item.notes || "",
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh_sach_TTS");
    const fileName = `Danh_Sach_Thuc_Tap_Sinh_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 flex flex-col p-2.5 sm:p-3 overflow-hidden bg-[#eaedf0] dark:bg-[#121214] text-slate-900 dark:text-[#F1F2F4]">
      {/* ========================================================================= */}
      {/* TOP COCKPIT TOOLBAR */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-2.5 bg-[#f1f3f6] dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl p-2.5 sm:px-3.5 sm:py-2.5 mb-2.5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left Title & Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-3 min-w-0">
            <div className="flex items-center space-x-2 shrink-0">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <GraduationCap className="w-4.5 h-4.5" />
              </div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none whitespace-nowrap">
                {t("internManagement")}
              </h1>
            </div>

            <div className="h-4 w-px bg-[#d8dce2] dark:bg-[#26262C] hidden sm:block" />

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {[
                { key: "all", label: t("all"), count: interns.length },
                {
                  key: "active",
                  label: t("internActive"),
                  count: interns.filter((i) => i.status === "active").length,
                },
                {
                  key: "completed",
                  label: t("internCompleted"),
                  count: interns.filter((i) => i.status === "completed").length,
                },
              ].map((tab) => {
                const isSelected = statusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setStatusFilter(tab.key as any);
                      setPage(1);
                    }}
                    className={`h-7 px-2.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors duration-150 active:scale-[0.97] border flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-white dark:bg-[#131316] text-slate-700 dark:text-slate-300 border-[#d8dce2] dark:border-[#26262C] hover:bg-slate-100 dark:hover:bg-[#202026]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Search, Refresh, Add */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={t("searchInternPlaceholder")}
                aria-label="Tìm kiếm thực tập sinh"
                className="w-44 sm:w-64 h-8 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] pl-7 pr-7 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchInterns}
              aria-label={t("refresh")}
              className="h-8 w-8 rounded-md bg-white dark:bg-[#131316] hover:bg-slate-100 dark:hover:bg-[#202026] border border-[#d8dce2] dark:border-[#26262C] text-slate-700 dark:text-slate-300 transition-colors inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 active:scale-[0.97]"
              title={t("refresh")}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  loading ? "animate-spin text-emerald-600 dark:text-emerald-400" : ""
                }`}
              />
            </button>

            {/* Add Intern Button */}
            <button
              onClick={handleOpenAdd}
              className="h-8 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center space-x-1.5 transition-colors shadow-xs active:scale-[0.97]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t("newIntern")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACTIVE EXCEL COLUMN FILTERS BANNER */}
      {/* ========================================================================= */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-lg text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
            <span className="font-bold">{t("activeFilters")}</span>
            <span className="bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded font-extrabold text-emerald-800 dark:text-emerald-200 text-xs border border-emerald-300 dark:border-emerald-800">
              {activeFilterCount} {t("columnsCount")}
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              ({t("showingCandidates")} {filteredInterns.length} / {interns.length} {t("intern").toLowerCase()})
            </span>
          </div>
          <button
            onClick={resetAllFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors shadow-2xs cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> {t("clearFilters")}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN TABLE CONTAINER */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 w-full rounded-xl border border-[#d8dce2] dark:border-[#26262C] bg-white dark:bg-[#18181C] flex flex-col overflow-hidden shadow-xs">
        {/* Scrollable Table Area */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="sticky top-0 z-20 bg-[#e6e9ee] dark:bg-[#131316] border-b border-[#d0d5dd] dark:border-[#26262C]">
              <tr className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider select-none">
                <th className="py-2.5 px-3 w-10 text-center">{t("stt")}</th>

                <th className="py-2 px-3">
                  <ExcelColumnFilter
                    title={t("internEmpId")}
                    columnKey="empId"
                    distinctValues={getDistinctValues("empId")}
                    selectedValues={excelFilters["empId"]}
                    onFilterChange={(v) => setFilter("empId", v)}
                    sortDirection={sortConfig?.key === "empId" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("empId", dir)}
                  />
                </th>

                <th className="py-2 px-3.5">
                  <ExcelColumnFilter
                    title={t("internName")}
                    columnKey="studentName"
                    distinctValues={getDistinctValues("studentName")}
                    selectedValues={excelFilters["studentName"]}
                    onFilterChange={(v) => setFilter("studentName", v)}
                    sortDirection={sortConfig?.key === "studentName" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("studentName", dir)}
                  />
                </th>

                <th className="py-2 px-3">
                  <ExcelColumnFilter
                    title={t("internSchool")}
                    columnKey="school"
                    distinctValues={getDistinctValues("school")}
                    selectedValues={excelFilters["school"]}
                    onFilterChange={(v) => setFilter("school", v)}
                    sortDirection={sortConfig?.key === "school" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("school", dir)}
                  />
                </th>

                <th className="py-2 px-3">
                  <ExcelColumnFilter
                    title={t("internDept")}
                    columnKey="deptName"
                    distinctValues={getDistinctValues("deptName")}
                    selectedValues={excelFilters["deptName"]}
                    onFilterChange={(v) => setFilter("deptName", v)}
                    sortDirection={sortConfig?.key === "deptName" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("deptName", dir)}
                  />
                </th>

                <th className="py-2 px-3 text-center">
                  <ExcelColumnFilter
                    title={t("internEdu")}
                    columnKey="educationLevel"
                    align="center"
                    distinctValues={getDistinctValues("educationLevel")}
                    selectedValues={excelFilters["educationLevel"]}
                    onFilterChange={(v) => setFilter("educationLevel", v)}
                    sortDirection={sortConfig?.key === "educationLevel" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("educationLevel", dir)}
                  />
                </th>

                <th className="py-2 px-3">
                  <ExcelColumnFilter
                    title={t("internMajor")}
                    columnKey="major"
                    distinctValues={getDistinctValues("major")}
                    selectedValues={excelFilters["major"]}
                    onFilterChange={(v) => setFilter("major", v)}
                    sortDirection={sortConfig?.key === "major" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("major", dir)}
                  />
                </th>

                <th className="py-2 px-3">
                  <ExcelColumnFilter
                    title={t("internSource")}
                    columnKey="recruitType"
                    distinctValues={getDistinctValues("recruitType")}
                    selectedValues={excelFilters["recruitType"]}
                    onFilterChange={(v) => setFilter("recruitType", v)}
                    sortDirection={sortConfig?.key === "recruitType" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("recruitType", dir)}
                  />
                </th>

                <th className="py-2 px-3 text-center">
                  <ExcelColumnFilter
                    title={t("internPeriod")}
                    columnKey="period"
                    align="center"
                    distinctValues={getDistinctValues("period")}
                    selectedValues={excelFilters["period"]}
                    onFilterChange={(v) => setFilter("period", v)}
                    sortDirection={sortConfig?.key === "period" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("period", dir)}
                  />
                </th>

                <th className="py-2 px-2.5 text-center">
                  <ExcelColumnFilter
                    title={t("internAllowance")}
                    columnKey="allowance"
                    align="center"
                    distinctValues={getDistinctValues("allowance")}
                    selectedValues={excelFilters["allowance"]}
                    onFilterChange={(v) => setFilter("allowance", v)}
                    sortDirection={sortConfig?.key === "allowance" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("allowance", dir)}
                  />
                </th>

                <th className="py-2 px-2.5 text-center">
                  <ExcelColumnFilter
                    title={t("internBus")}
                    columnKey="bus"
                    align="center"
                    distinctValues={getDistinctValues("bus")}
                    selectedValues={excelFilters["bus"]}
                    onFilterChange={(v) => setFilter("bus", v)}
                    sortDirection={sortConfig?.key === "bus" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("bus", dir)}
                  />
                </th>

                <th className="py-2 px-3 text-center">
                  <ExcelColumnFilter
                    title={t("internStatus")}
                    columnKey="status"
                    align="center"
                    distinctValues={getDistinctValues("status")}
                    selectedValues={excelFilters["status"]}
                    onFilterChange={(v) => setFilter("status", v)}
                    sortDirection={sortConfig?.key === "status" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("status", dir)}
                  />
                </th>

                <th className="py-2 px-2.5 text-center">{t("photo")}</th>
                <th className="py-2 px-2.5 text-center">{t("note")}</th>
                <th className="py-2 px-3 text-center">{t("action")}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#26262C]">
              {loading ? (
                <tr>
                  <td colSpan={15} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                      <span className="text-xs text-slate-500">{t("loading")}</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedInterns.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center space-y-1.5">
                      <School className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t("noInternsFound")}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {t("noInternsHint")}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedInterns.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#edf0f4] dark:hover:bg-[#202026] transition-colors"
                  >
                    {/* STT */}
                    <td className="py-2 px-3 text-center text-slate-500 tabular-nums text-xs">
                      {(page - 1) * (pageSize === -1 ? 0 : pageSize) + idx + 1}
                    </td>

                    {/* Mã TTS (Clickable to edit) */}
                    <td className="py-2 px-3">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer tracking-tight"
                        title={t("edit")}
                      >
                        {item.empId}
                      </button>
                    </td>

                    {/* Họ và tên sinh viên (Sharp, high contrast text) */}
                    <td className="py-2 px-3.5 font-bold text-slate-900 dark:text-white">
                      {item.studentName}
                    </td>

                    {/* Trường đào tạo */}
                    <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {item.school}
                    </td>

                    {/* Bộ phận thực tập */}
                    <td className="py-2 px-3 font-medium text-slate-700 dark:text-slate-300">
                      {item.deptName}
                    </td>

                    {/* Trình độ */}
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {item.educationLevel}
                      </span>
                    </td>

                    {/* Chuyên ngành */}
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                      {item.major}
                    </td>

                    {/* Nguồn tuyển */}
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {item.recruitType}
                      </span>
                    </td>

                    {/* Kỳ thực tập */}
                    <td className="py-2 px-3 text-center tabular-nums text-slate-600 dark:text-slate-400 text-xs">
                      {item.startDate && item.endDate
                        ? `${item.startDate} ~ ${item.endDate}`
                        : item.startDate || item.endDate || "-"}
                    </td>

                    {/* Phụ cấp */}
                    <td className="py-2 px-2.5 text-center">
                      <div className="flex items-center justify-center">
                        <label
                          className="inline-flex items-center justify-center p-0.5 cursor-pointer select-none"
                          title={item.allowance ? t("hasAllowance") : t("noAllowance") || "Không có phụ cấp"}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(item.allowance)}
                            disabled={updatingToggleKey === `${item.id}-allowance`}
                            onChange={(e) => handleToggleField(item, "allowance", e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-zinc-600 text-emerald-600 focus:ring-emerald-500/20 cursor-pointer accent-emerald-600 transition-transform active:scale-90 disabled:opacity-50"
                          />
                        </label>
                      </div>
                    </td>

                    {/* Xe đưa rước */}
                    <td className="py-2 px-2.5 text-center">
                      <div className="flex items-center justify-center">
                        <label
                          className="inline-flex items-center justify-center p-0.5 cursor-pointer select-none"
                          title={item.bus ? t("hasBus") : t("noBus") || "Không có xe đưa rước"}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(item.bus)}
                            disabled={updatingToggleKey === `${item.id}-bus`}
                            onChange={(e) => handleToggleField(item, "bus", e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-zinc-600 text-emerald-600 focus:ring-emerald-500/20 cursor-pointer accent-emerald-600 transition-transform active:scale-90 disabled:opacity-50"
                          />
                        </label>
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-2 px-3 text-center">
                      {item.status === "active" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{t("internActive")}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{t("internCompleted")}</span>
                        </span>
                      )}
                    </td>

                    {/* Ảnh chân dung (Clickable thumbnail) */}
                    <td className="py-2 px-2.5 text-center">
                      {item.photoUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPhotoModal({
                              open: true,
                              url: item.photoUrl!,
                              name: item.studentName,
                            })
                          }
                          className="p-1 rounded text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title={t("photo")}
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">-</span>
                      )}
                    </td>

                    {/* Ghi chú */}
                    <td className="py-2 px-2.5 text-center">
                      {item.notes ? (
                        <button
                          type="button"
                          onClick={() =>
                            setNoteModal({
                              open: true,
                              title: `${t("note")}: ${item.studentName} (${item.empId})`,
                              note: item.notes,
                            })
                          }
                          className="p-1 rounded text-slate-600 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title={t("noteDetails")}
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">-</span>
                      )}
                    </td>

                    {/* Thao tác (Sửa / Xóa) */}
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1 rounded text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={t("edit")}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm({ open: true, item })}
                          className="p-1 rounded text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={t("delete")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ========================================================================= */}
        {/* TABLE FOOTER & PAGINATION */}
        {/* ========================================================================= */}
        <div className="px-3.5 py-2 border-t border-[#d8dce2] dark:border-[#26262C] bg-[#f8fafc] dark:bg-[#131316] flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Export Excel */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportExcel}
              className="h-8 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center space-x-1.5 transition-colors shadow-xs active:scale-[0.97]"
              title={t("exportExcel")}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{t("exportExcel")}</span>
            </button>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {t("total")}: <strong className="text-slate-800 dark:text-slate-200">{filteredInterns.length}</strong> {t("unitLabelPerson")}
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
                <option value={-1}>{t("all")}</option>
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
      {/* MODAL 1: ADD / EDIT INTERN MODAL */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-[#d8dce2] dark:border-[#26262C] bg-[#f8fafc] dark:bg-[#131316] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isEditing ? t("editIntern") : t("newIntern")}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="h-7 w-7 rounded-md hover:bg-slate-200 dark:hover:bg-[#202026] flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Basic Info */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t("basicInfo")}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t("internEmpId")}
                    </label>
                    <input
                      type="text"
                      value={form.empId}
                      onChange={(e) => setForm({ ...form, empId: e.target.value })}
                      placeholder="Tự động nếu để trống (VD: INT0037)"
                      className="w-full h-8 px-2.5 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t("fullName")} *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.studentName}
                      onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                      placeholder="VD: NGUYỄN VĂN A"
                      className="w-full h-8 px-2.5 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{t("academicInfo")}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t("internEdu")}
                    </label>
                    <select
                      value={form.educationLevel}
                      onChange={(e) => setForm({ ...form, educationLevel: e.target.value })}
                      className="w-full h-8 px-2 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {EDUCATION_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t("internSchool")}
                    </label>
                    <input
                      type="text"
                      value={form.school}
                      onChange={(e) => setForm({ ...form, school: e.target.value })}
                      placeholder="VD: ĐẠI HỌC BÁCH KHOA"
                      className="w-full h-8 px-2.5 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t("internMajor")}
                    </label>
                    <input
                      type="text"
                      value={form.major}
                      onChange={(e) => setForm({ ...form, major: e.target.value })}
                      placeholder="VD: Chinese Language"
                      className="w-full h-8 px-2.5 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Company Details */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>{t("companyDetails")}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t("internDept")}
                    </label>
                    <select
                      value={form.deptCode}
                      onChange={(e) => setForm({ ...form, deptCode: e.target.value })}
                      className="w-full h-8 px-2 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">-- {t("department")} --</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.code} - {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t("internSource")}
                    </label>
                    <select
                      value={form.recruitType}
                      onChange={(e) => setForm({ ...form, recruitType: e.target.value })}
                      className="w-full h-8 px-2 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {RECRUIT_SOURCES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t("periodFrom") || "Ngày Bắt Đầu"}
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full h-8 px-2.5 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t("periodTo") || "Ngày Kết Thúc"}
                    </label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full h-8 px-2.5 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Options */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                  {t("additionalOptions")}
                </h4>
                <div className="flex items-center space-x-6 py-1">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.allowance}
                      onChange={(e) => setForm({ ...form, allowance: e.target.checked })}
                      className="h-4 w-4 rounded border-[#d8dce2] text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {t("hasAllowance")}
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.bus}
                      onChange={(e) => setForm({ ...form, bus: e.target.checked })}
                      className="h-4 w-4 rounded border-[#d8dce2] dark:border-zinc-600 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                    />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {t("hasBus")}
                    </span>
                  </label>
                </div>
              </div>

              {/* Photo and Note */}
              <div className="space-y-3">
                {/* Photo Upload Section */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t("photoTitle")}</span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                  {form.photoUrl ? (
                    <div className="flex items-center gap-4 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20">
                      <div className="relative group shrink-0 w-20 h-24 rounded-lg overflow-hidden border border-[#d8dce2] dark:border-[#26262C] bg-white dark:bg-slate-900 shadow-xs flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={form.photoUrl}
                          alt="Ảnh chân dung"
                          className="w-full h-full object-cover"
                        />
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 text-white animate-spin" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{t("photoUploaded")}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {t("photoUploadedHint")}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            disabled={uploadingImage}
                            onClick={() => fileInputRef.current?.click()}
                            className="h-7 px-2.5 rounded-md bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#202026] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5 text-sky-600" />
                            <span>{t("changePhoto")}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, photoUrl: "" }))}
                            className="h-7 px-2.5 rounded-md text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t("deletePhoto")}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#d8dce2] dark:border-[#26262C] hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 dark:bg-[#131316] dark:hover:bg-emerald-950/10 transition-colors group"
                    >
                      <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-105 transition-transform">
                        {uploadingImage ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <UploadCloud className="w-5 h-5" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {uploadingImage ? t("loading") : t("uploadPhotoPrompt")}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {t("uploadPhotoHint")}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t("note")}
                  </label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Nhập ghi chú thêm về sinh viên, yêu cầu dự án, mentor..."
                    className="w-full p-2 rounded-md bg-white dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-[#d8dce2] dark:border-[#26262C] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-8 px-4 rounded-md border border-[#d8dce2] dark:border-[#26262C] text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-[#202026] transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-8 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center space-x-1.5 transition-colors shadow-xs disabled:opacity-50"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isEditing ? t("updateInfo") : t("saveInfo")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VIEW NOTE DIALOG */}
      {/* ========================================================================= */}
      {noteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl w-full max-w-md shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#d8dce2] dark:border-[#26262C] pb-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Info className="w-4 h-4 text-sky-600" />
                <span>{noteModal.title}</span>
              </h4>
              <button
                onClick={() => setNoteModal({ open: false, title: "", note: "" })}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
              {noteModal.note || t("noData")}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setNoteModal({ open: false, title: "", note: "" })}
                className="h-7 px-3 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VIEW PHOTO DIALOG */}
      {/* ========================================================================= */}
      {photoModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#d8dce2] dark:border-[#26262C] pb-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {t("photoTitle")}: {photoModal.name}
              </h4>
              <button
                onClick={() => setPhotoModal({ open: false, url: "", name: "" })}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-center items-center py-2 bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden max-h-96">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoModal.url}
                alt={photoModal.name}
                className="max-h-80 w-auto object-contain rounded"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setPhotoModal({ open: false, url: "", name: "" })}
                className="h-7 px-3 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deleteConfirm.open && deleteConfirm.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-xl w-full max-w-sm shadow-2xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-rose-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {t("confirm")} {t("delete").toLowerCase()}?
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {deleteConfirm.item.studentName} ({deleteConfirm.item.empId})?
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirm({ open: false, item: null })}
                className="h-7 px-3 rounded border border-[#d8dce2] dark:border-[#26262C] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t("cancel")}
              </button>
              <button
                disabled={saving}
                onClick={handleDeleteConfirm}
                className="h-7 px-3 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50"
              >
                {saving ? t("loading") : t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
