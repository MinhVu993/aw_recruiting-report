"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Search,
  Layers,
  X,
  Save,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  Edit2,
  Filter,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useTableExcelFilter } from "@/hooks/useTableExcelFilter";
import { ExcelColumnFilter } from "@/components/table/ExcelColumnFilter";
import { useDialog } from "@/context/DialogContext";

export interface AwDeptItem {
  id: number;
  department: string;
  main_group?: string | null;
  sub_department: string;
  sub_division: string;
  name?: {
    vi?: string;
    en?: string;
    cn?: string;
  } | string;
  nameObj?: {
    vi: string;
    en: string;
    cn: string;
  };
  deptName?: string;
  start_date?: string | null;
  end_date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function DeptControlPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useSession();
  const { t, locale } = useTranslation();
  const { showError, showWarning, showSuccess } = useDialog();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/");
    }
  }, [isLoading, isAdmin, router]);

  const [depts, setDepts] = useState<AwDeptItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState("");
  const [selectedDivFilter, setSelectedDivFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Pagination state
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Form state
  const [formData, setFormData] = useState({
    department: "",
    main_group: "",
    sub_department: "",
    sub_division: "",
    name_vi: "",
    name_en: "",
    name_cn: "",
    start_date: new Date().toISOString().slice(0, 10),
    end_date: "",
  });

  const fetchDepts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/deptcontrol");
      const json = await res.json();
      if (json.success && json.data) {
        setDepts(json.data);
      } else {
        setDepts([]);
      }
    } catch (e) {
      console.error("Lỗi khi tải danh sách bộ phận:", e);
      setDepts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  // Unique divisions for dropdown
  const divisionOptions = useMemo(() => {
    const set = new Set<string>();
    depts.forEach((d) => {
      if (d.department?.trim()) set.add(d.department.trim());
    });
    return Array.from(set).sort();
  }, [depts]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      department: "",
      main_group: "",
      sub_department: "",
      sub_division: "",
      name_vi: "",
      name_en: "",
      name_cn: "",
      start_date: new Date().toISOString().slice(0, 10),
      end_date: "",
    });
    setShowModal(true);
  };

  const openEditModal = (item: AwDeptItem) => {
    setEditingId(item.id);
    let vi = "";
    let en = "";
    let cn = "";

    if (item.nameObj) {
      vi = item.nameObj.vi || "";
      en = item.nameObj.en || "";
      cn = item.nameObj.cn || "";
    } else if (typeof item.name === "object" && item.name !== null) {
      const n = item.name as { vi?: string; en?: string; cn?: string };
      vi = n.vi || "";
      en = n.en || "";
      cn = n.cn || "";
    } else if (typeof item.name === "string") {
      vi = item.name;
      en = item.name;
      cn = item.name;
    }

    setFormData({
      department: item.department || "",
      main_group: item.main_group || "",
      sub_department: item.sub_department || "",
      sub_division: item.sub_division || "",
      name_vi: vi,
      name_en: en,
      name_cn: cn,
      start_date: item.start_date || item.startDate || "",
      end_date: item.end_date || item.endDate || "",
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.department.trim() || !formData.sub_department.trim() || !formData.sub_division.trim()) {
      showWarning("Thiếu thông tin", "Vui lòng nhập đầy đủ Division, Sub Department và Sub Division!");
      return;
    }
    if (!formData.name_vi.trim()) {
      showWarning("Thiếu thông tin", "Vui lòng nhập Tên bộ phận (Tiếng Việt)!");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: editingId || undefined,
        department: formData.department.trim(),
        main_group: formData.main_group.trim() || null,
        sub_department: formData.sub_department.trim(),
        sub_division: formData.sub_division.trim(),
        name: {
          vi: formData.name_vi.trim(),
          en: formData.name_en.trim() || formData.name_vi.trim(),
          cn: formData.name_cn.trim() || formData.name_vi.trim(),
        },
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      const res = await fetch("/api/deptcontrol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (resData.success) {
        showSuccess(
          editingId ? "Cập nhật thành công" : "Tạo thành công",
          `Đã lưu bộ phận [${payload.sub_division} - ${payload.name.vi}]!`
        );
        setShowModal(false);
        await fetchDepts();
      } else {
        showError("Lỗi lưu bộ phận", resData.error || "Không thể lưu bộ phận");
      }
    } catch (err) {
      console.error("Lỗi khi lưu bộ phận:", err);
      showError("Lỗi kết nối", "Đã xảy ra lỗi khi lưu dữ liệu");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for localized name display
  const getDeptDisplayName = (item: AwDeptItem) => {
    if (item.nameObj) {
      return item.nameObj[locale as "vi" | "en" | "cn"] || item.nameObj.vi || item.deptName || item.sub_division;
    }
    if (typeof item.name === "object" && item.name !== null) {
      const n = item.name as Record<string, string>;
      return n[locale] || n.vi || item.deptName || item.sub_division;
    }
    return String(item.name || item.deptName || item.sub_division);
  };

  // Base filtered list
  const filteredDepts = useMemo(() => {
    return depts.filter((item) => {
      // Division filter
      if (selectedDivFilter !== "all" && item.department !== selectedDivFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === "active" && !item.active) return false;
      if (statusFilter === "inactive" && item.active) return false;

      // Text search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesDiv = item.department?.toLowerCase().includes(q);
        const matchesMainGroup = item.main_group?.toLowerCase().includes(q);
        const matchesSubDept = item.sub_department?.toLowerCase().includes(q);
        const matchesSubDiv = item.sub_division?.toLowerCase().includes(q);
        const matchesVi = item.nameObj?.vi?.toLowerCase().includes(q);
        const matchesEn = item.nameObj?.en?.toLowerCase().includes(q);
        const matchesCn = item.nameObj?.cn?.toLowerCase().includes(q);
        const matchesName = typeof item.name === "string" && item.name.toLowerCase().includes(q);

        return (
          matchesDiv ||
          matchesMainGroup ||
          matchesSubDept ||
          matchesSubDiv ||
          matchesVi ||
          matchesEn ||
          matchesCn ||
          matchesName
        );
      }

      return true;
    });
  }, [depts, selectedDivFilter, statusFilter, search]);

  // Excel column filtering
  const {
    filteredData,
    filters: excelFilters,
    sortConfig,
    getDistinctValues,
    setFilter,
    setSort,
    resetFilter,
    resetAllFilters,
    activeFilterCount,
  } = useTableExcelFilter<AwDeptItem>(filteredDepts, {
    customExtractors: {
      deptName: (item) => getDeptDisplayName(item),
      active: (item) => (item.active ? "Đang hoạt động" : "Ngừng hoạt động"),
    },
  });

  // Pagination calculation
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedDepts = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, validCurrentPage, pageSize]);

  const exportExcel = () => {
    const rows = filteredData.map((d, index) => ({
      STT: index + 1,
      ID: d.id,
      Division: d.department,
      "Main Group": d.main_group || "",
      "Sub Department": d.sub_department,
      "Sub Division": d.sub_division,
      "Tên (VI)": d.nameObj?.vi || (typeof d.name === "object" ? (d.name as any)?.vi : d.name) || "",
      "Tên (EN)": d.nameObj?.en || (typeof d.name === "object" ? (d.name as any)?.en : "") || "",
      "Tên (CN)": d.nameObj?.cn || (typeof d.name === "object" ? (d.name as any)?.cn : "") || "",
      "Ngày bắt đầu": d.start_date || d.startDate || "",
      "Ngày kết thúc": d.end_date || d.endDate || "",
      "Trạng thái": d.active ? "Đang hoạt động" : "Ngừng hoạt động",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AW_Departments");
    XLSX.writeFile(wb, `aw_departments_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const activeCount = useMemo(() => depts.filter((d) => d.active).length, [depts]);
  const inactiveCount = depts.length - activeCount;

  return (
    <div className="flex-1 w-full bg-[#eaedf0] dark:bg-[#121214] min-h-[calc(100vh-4rem)] p-4 md:p-6 transition-colors">
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1e1e20] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Quản lý Bộ Phận (Dept Control)
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300">
                  AW Dept
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quản lý mã phòng ban, phân cấp nhóm chính, phụ và tên đa ngôn ngữ (VI / EN / CN)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm"
              title="Xuất file Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>

            <button
              onClick={fetchDepts}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200 transition-colors shadow-sm disabled:opacity-50"
              title="Tải lại dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-rose-600" : ""}`} />
              <span>Tải lại</span>
            </button>

            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm mới</span>
            </button>
          </div>
        </div>

        {/* Stats summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-[#1e1e20] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tổng số bộ phận</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{depts.length}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === "active" ? "all" : "active")}
            className={`cursor-pointer p-4 rounded-xl border shadow-sm flex items-center justify-between transition-all ${
              statusFilter === "active"
                ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-400 ring-2 ring-emerald-500/20"
                : "bg-white dark:bg-[#1e1e20] border-slate-200 dark:border-slate-800 hover:border-emerald-300"
            }`}
          >
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Đang hoạt động</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === "inactive" ? "all" : "inactive")}
            className={`cursor-pointer p-4 rounded-xl border shadow-sm flex items-center justify-between transition-all ${
              statusFilter === "inactive"
                ? "bg-slate-100 dark:bg-slate-800 border-slate-400 ring-2 ring-slate-500/20"
                : "bg-white dark:bg-[#1e1e20] border-slate-200 dark:border-slate-800 hover:border-slate-300"
            }`}
          >
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ngừng hoạt động</p>
              <p className="text-2xl font-bold text-slate-500 dark:text-slate-400 mt-1">{inactiveCount}</p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white dark:bg-[#1e1e20] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3 w-full">
            {/* Search input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm theo Division, Sub Dept, Sub Division, Tên..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Division dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                Division:
              </label>
              <select
                value={selectedDivFilter}
                onChange={(e) => {
                  setSelectedDivFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              >
                <option value="all">Tất cả Division ({divisionOptions.length})</option>
                {divisionOptions.map((div) => (
                  <option key={div} value={div}>
                    {div}
                  </option>
                ))}
              </select>
            </div>

            {/* Status toggle buttons */}
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-900">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  statusFilter === "all"
                    ? "bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  statusFilter === "active"
                    ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Hoạt động
              </button>
              <button
                onClick={() => setStatusFilter("inactive")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  statusFilter === "inactive"
                    ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Ngừng
              </button>
            </div>

            {/* Clear Excel Filters if active */}
            {activeFilterCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-lg hover:bg-rose-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Xóa lọc cột ({activeFilterCount})</span>
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Hiển thị <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredData.length}</span> kết quả
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white dark:bg-[#1e1e20] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#171719] border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3 px-3 text-center w-12">STT</th>
                  <th className="py-3 px-3 text-center w-14">ID</th>
                  <th className="py-3 px-4">
                    <ExcelColumnFilter
                      title="Division"
                      columnKey="department"
                      distinctValues={getDistinctValues("department")}
                      selectedValues={excelFilters["department"]}
                      onFilterChange={(v) => setFilter("department", v)}
                      sortDirection={sortConfig?.key === "department" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("department", dir)}
                    />
                  </th>
                  <th className="py-3 px-4">
                    <ExcelColumnFilter
                      title="Sub Dept"
                      columnKey="sub_department"
                      distinctValues={getDistinctValues("sub_department")}
                      selectedValues={excelFilters["sub_department"]}
                      onFilterChange={(v) => setFilter("sub_department", v)}
                      sortDirection={sortConfig?.key === "sub_department" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("sub_department", dir)}
                    />
                  </th>
                  <th className="py-3 px-4">
                    <ExcelColumnFilter
                      title="Sub Division"
                      columnKey="sub_division"
                      distinctValues={getDistinctValues("sub_division")}
                      selectedValues={excelFilters["sub_division"]}
                      onFilterChange={(v) => setFilter("sub_division", v)}
                      sortDirection={sortConfig?.key === "sub_division" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("sub_division", dir)}
                    />
                  </th>
                  <th className="py-3 px-4">
                    <ExcelColumnFilter
                      title="Tên bộ phận (VI / EN / CN)"
                      columnKey="deptName"
                      distinctValues={getDistinctValues("deptName")}
                      selectedValues={excelFilters["deptName"]}
                      onFilterChange={(v) => setFilter("deptName", v)}
                      sortDirection={sortConfig?.key === "deptName" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("deptName", dir)}
                    />
                  </th>
                  <th className="py-3 px-3 text-center w-28">Ngày BĐ</th>
                  <th className="py-3 px-3 text-center w-28">Ngày KT</th>
                  <th className="py-3 px-3 text-center w-28">
                    <ExcelColumnFilter
                      title="Trạng thái"
                      columnKey="active"
                      distinctValues={getDistinctValues("active")}
                      selectedValues={excelFilters["active"]}
                      onFilterChange={(v) => setFilter("active", v)}
                      sortDirection={sortConfig?.key === "active" ? sortConfig.direction : null}
                      onSortChange={(dir) => setSort("active", dir)}
                    />
                  </th>
                  <th className="py-3 px-3 text-center w-20">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                      Đang tải danh sách bộ phận...
                    </td>
                  </tr>
                ) : paginatedDepts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-slate-400">
                      Không tìm thấy bản ghi nào
                    </td>
                  </tr>
                ) : (
                  paginatedDepts.map((item, index) => {
                    const rowNumber = (validCurrentPage - 1) * pageSize + index + 1;
                    const viName = item.nameObj?.vi || (typeof item.name === "object" ? (item.name as any)?.vi : item.name) || "-";
                    const enName = item.nameObj?.en || (typeof item.name === "object" ? (item.name as any)?.en : "") || "";
                    const cnName = item.nameObj?.cn || (typeof item.name === "object" ? (item.name as any)?.cn : "") || "";

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {rowNumber}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-600 dark:text-slate-300 text-[11px]">
                          {item.id}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-100">
                          <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">
                            {item.department || "-"}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-700 dark:text-slate-200">
                          <span className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-100">
                            {item.sub_department || "-"}
                          </span>
                          {item.main_group && (
                            <div className="text-[10px] text-slate-400">
                              Nhóm: {item.main_group}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                          {item.sub_division || "-"}
                        </td>
                        <td className="py-2.5 px-4 text-slate-700 dark:text-slate-200">
                          <div className="font-medium text-slate-900 dark:text-slate-100">{viName}</div>
                          {(enName || cnName) && (
                            <div className="text-[11px] text-slate-400 flex flex-wrap gap-2 mt-0.5">
                              {enName && <span>EN: {enName}</span>}
                              {cnName && <span>CN: {cnName}</span>}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                          {item.start_date || item.startDate || "-"}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                          {item.end_date || item.endDate || "-"}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {item.active ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                              Ngừng
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => openEditModal(item)}
                            className="inline-flex items-center justify-center p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="bg-slate-50 dark:bg-[#171719] px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 focus:outline-none font-medium"
              >
                <option value={15}>15 dòng</option>
                <option value={25}>25 dòng</option>
                <option value={50}>50 dòng</option>
                <option value={100}>100 dòng</option>
              </select>
              <span>trên tổng số {totalItems} dòng</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={validCurrentPage === 1}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40"
                title="Trang đầu"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validCurrentPage === 1}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-semibold text-slate-800 dark:text-slate-200">
                {validCurrentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage >= totalPages}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={validCurrentPage >= totalPages}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40"
                title="Trang cuối"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Department Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#1e1e20] w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    {editingId ? "Chỉnh sửa Bộ Phận AW" : "Thêm Bộ Phận AW Mới"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingId ? `Cập nhật mã bộ phận #${editingId}` : "Nhập đầy đủ thông tin phân cấp và ngôn ngữ"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Division <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: AW000, CUT, SEW..."
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Main Group (Nhóm chính)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: PROD, OFFICE..."
                    value={formData.main_group}
                    onChange={(e) => setFormData({ ...formData, main_group: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sub Department <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: AW_SEW1, HR..."
                    value={formData.sub_department}
                    onChange={(e) => setFormData({ ...formData, sub_department: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sub Division (Mã Đơn Vị) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: AW_SEW_L01..."
                    value={formData.sub_division}
                    onChange={(e) => setFormData({ ...formData, sub_division: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tên bộ phận đa ngôn ngữ
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tên Tiếng Việt <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Chuyền may 1"
                    value={formData.name_vi}
                    onChange={(e) => setFormData({ ...formData, name_vi: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Tên Tiếng Anh (EN)
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Sewing Line 1"
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Tên Tiếng Trung (CN)
                    </label>
                    <input
                      type="text"
                      placeholder="VD: 车缝一车间"
                      value={formData.name_cn}
                      onChange={(e) => setFormData({ ...formData, name_cn: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Ngày bắt đầu (Start Date)
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Ngày kết thúc (End Date - để trống nếu đang hoạt động)
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Tạo mới"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
