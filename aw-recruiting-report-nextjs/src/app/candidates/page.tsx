"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users,
  Search,
  UserPlus,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  RefreshCw,
  ChevronLeft,
  CheckSquare,
  Square,
  Download,
  ScanFace,
  Image as ImageIcon,
  FileText,
  ChevronDown,
  Info,
  X,
  Calendar,
  Settings,
  Sparkles,
  Check,
  Minus,
  Maximize2,
  Building2,
  Layers,
  ArrowRight,
  UserCheck,
  Trash2,
} from "lucide-react";
import { useSession } from "@/context/SessionContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useTableExcelFilter } from "@/hooks/useTableExcelFilter";
import { ExcelColumnFilter } from "@/components/table/ExcelColumnFilter";
import { AppDialog, DialogOptions } from "@/components/ui/AppDialog";

interface CandidateRecord {
  id: number;
  keyInDate?: string;
  candidateName: string;
  dateOfBirth?: string;
  gender?: string;
  cccd: string;
  duty?: string;
  position?: string;
  deptCode?: string;
  dept?: string;
  applyDp?: string;
  tmpDepartid?: string;
  deptName?: string;
  loc?: string;
  hrAcQu?: boolean;
  dpAcQu?: boolean;
  reg?: boolean;
  replyCheck?: boolean;
  exEnDate?: string;
  actEnDate?: string;
  empno?: string;
  empDemandid?: string;
  photoUrl?: string | null;
  notes?: string;
  isHires?: boolean;
  isBqt?: boolean;
  status?: string;
  recru_source?: string;
  source_recruit?: string;
  source_name?: string;
  edu?: string;
  edu_name?: string;
  date_hr_inter?: string;
  date_hr_review?: string;
  date_dept_review?: string;
}

const FACTORY_CARD_RULES: Record<string, { prefix: string; label: string; example: string; hint: string }> = {
  aw: { prefix: "0", label: "AW", example: "050331", hint: "Quy chuẩn AW: 6 chữ số bắt đầu bằng 0 (0xxxxx)" },
};


const formatDate = (dateStr?: string | null) => {
  if (!dateStr || dateStr === "no" || dateStr === "0000-00-00") return "-";
  const clean = dateStr.split("T")[0].replace(/\//g, "-");
  const parts = clean.split("-");
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }
  return dateStr;
};

const toInputDate = (dateStr?: string | null): string => {
  if (!dateStr || dateStr === "no" || dateStr === "0000-00-00" || dateStr === "-") return "";
  const clean = dateStr.split("T")[0].replace(/\//g, "-");
  const parts = clean.split("-");
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
    }
    if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }
  return "";
};

const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getVietnamDateInfo = () => {
  const nowVN = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  const formatYMD = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const todayStr = formatYMD(nowVN);
  const currentYearStr = String(nowVN.getFullYear());
  const currentMonthStr = `${nowVN.getFullYear()}-${String(nowVN.getMonth() + 1).padStart(2, "0")}`;

  const currentDayOfWeek = nowVN.getDay();
  const distToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const mondayDate = new Date(nowVN);
  mondayDate.setDate(nowVN.getDate() + distToMonday);
  const saturdayDate = new Date(mondayDate);
  saturdayDate.setDate(mondayDate.getDate() + 5);

  const weekStartStr = formatYMD(mondayDate);
  const weekEndStr = formatYMD(saturdayDate);

  return { nowVN, todayStr, currentYearStr, currentMonthStr, weekStartStr, weekEndStr };
};

const isDateEmpty = (d?: string | null): boolean => {
  if (!d) return true;
  const s = String(d).trim().toLowerCase();
  return s === "" || s === "no" || s === "null" || s === "undefined" || s === "-" || s === "0000-00-00";
};

const getInitials = (name?: string) => {
  if (!name) return "UV";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const EPM_BASE_URL = process.env.NEXT_PUBLIC_EPM_API_URL || "http://10.13.34.160:7303";

const getCandidatePhotoUrl = (c: CandidateRecord): string | null => {
  if (c.photoUrl && c.photoUrl.trim() !== "" && c.photoUrl !== "no") {
    return c.photoUrl;
  }
  if (c.empno && c.empno.trim() !== "" && c.empno !== "-") {
    return `/api/epm-photo/aw/${encodeURIComponent(c.empno.trim())}`;
  }
  return null;
};

function CandidatesContent() {
  const { selectedFactory } = useSession();
  const { t, locale } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  const demandIdFromUrl =
    searchParams.get("demand_id") ||
    searchParams.get("demandId") ||
    (searchParams.get("id") && isNaN(Number(searchParams.get("id")))
      ? searchParams.get("id")
      : "");
  const recruitedFromUrl =
    searchParams.get("recruited") === "true" || searchParams.get("recruited") === "1";

  // Drill-through URL parameters from Dashboard
  const paramDuty = searchParams.get("duty") || searchParams.get("position");
  const paramGender = searchParams.get("gender");
  const paramApplyDp = searchParams.get("applyDp") || searchParams.get("dept");
  const paramSource = searchParams.get("source");
  const paramEdu = searchParams.get("edu");
  const paramAgeGroup = searchParams.get("ageGroup");
  const paramTimeRange = searchParams.get("timeRange");
  const paramStartDate = searchParams.get("startDate");
  const paramEndDate = searchParams.get("endDate");
  const paramFromDate = searchParams.get("fromDate");
  const paramToDate = searchParams.get("toDate");
  const paramReportSource = searchParams.get("reportSource");

  const [activeDemandId, setActiveDemandId] = useState<string>(demandIdFromUrl || "");
  const [activeRecruitedOnly, setActiveRecruitedOnly] = useState<boolean>(recruitedFromUrl);
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingMpr, setSyncingMpr] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [total, setTotal] = useState<number>(0);

  // Sync activeDemandId & activeRecruitedOnly with URL changes
  useEffect(() => {
    const dId =
      searchParams.get("demand_id") ||
      searchParams.get("demandId") ||
      (searchParams.get("id") && isNaN(Number(searchParams.get("id")))
        ? searchParams.get("id")
        : "");
    const rec =
      searchParams.get("recruited") === "true" || searchParams.get("recruited") === "1";
    if (dId !== activeDemandId) {
      setActiveDemandId(dId || "");
      setPage(1);
    }
    if (rec !== activeRecruitedOnly) {
      setActiveRecruitedOnly(rec);
      setPage(1);
    }
  }, [searchParams]);

  // Checkbox multi-select states
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);

  // Modals
  const [assigningEmpno, setAssigningEmpno] = useState<boolean>(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRecord | null>(null);
  const [customEmpno, setCustomEmpno] = useState<string>("");
  const [actualWorkDate, setActualWorkDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [empnoModalLoading, setEmpnoModalLoading] = useState<boolean>(false);
  const [suggestedStartEmpno, setSuggestedStartEmpno] = useState<string>("");
  const [eligibleCandidatesForDate, setEligibleCandidatesForDate] = useState<any[]>([]);

  // Quy chuẩn mã thẻ nhà máy AW (6 chữ số bắt đầu bằng 0)
  const factoryCardRule = FACTORY_CARD_RULES.aw;

  // Kiểm tra cảnh báo nếu mã thẻ bắt đầu không khớp tiền tố quy chuẩn
  const isPrefixMismatch = useMemo(() => {
    if (!customEmpno.trim()) return false;
    const clean = customEmpno.trim().toUpperCase();
    if (factoryCardRule.prefix === "A") {
      return !clean.startsWith("A");
    }
    return !clean.startsWith(factoryCardRule.prefix);
  }, [customEmpno, factoryCardRule]);

  // Note dialog
  const [noteDialogCandidate, setNoteDialogCandidate] = useState<CandidateRecord | null>(null);
  const [noteLanguage, setNoteLanguage] = useState<"vi" | "en" | "cn">("vi");

  // Photo preview lightbox modal
  const [previewPhotoCandidate, setPreviewPhotoCandidate] = useState<CandidateRecord | null>(null);

  // Confirm Registration Dialog (Update Reg)
  const [regConfirmCandidate, setRegConfirmCandidate] = useState<CandidateRecord | null>(null);
  const [isUpdatingReg, setIsUpdatingReg] = useState<boolean>(false);
  const [confirmExDate, setConfirmExDate] = useState<string>("");
  const [confirmActDate, setConfirmActDate] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [dialog, setDialog] = useState<DialogOptions>({
    isOpen: false,
    title: "",
    message: "",
  });

  // Print templates dropdown menu
  const [showPrintMenu, setShowPrintMenu] = useState<boolean>(false);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const demandQuery = activeDemandId
        ? `&demand_id=${encodeURIComponent(activeDemandId)}`
        : "";
      const recruitedQuery = activeRecruitedOnly ? "&recruited=true" : "";
      const res = await fetch(`/api/candidates?loc=aw&limit=all${demandQuery}${recruitedQuery}`);
      const json = await res.json();
      if (json.data) {
        setCandidates(json.data);
        setTotal(json.total || json.data.length);
      }
    } catch (e) {
      console.error("Lỗi khi tải danh sách ứng viên:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
    setSelectedIds([]);
    setSelectAll(false);
  }, [selectedFactory, activeDemandId, activeRecruitedOnly]);

  const handleManualSyncMpr = async () => {
    if (syncingMpr) return;
    setSyncingMpr(true);
    try {
      const payload = activeDemandId ? { req_id: activeDemandId } : {};
      const res = await fetch("/api/demand/sync-mpr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      await fetchCandidates();
      if (data.success) {
        const msg =
          data.mode === "single"
            ? `Đã đồng bộ đơn ${activeDemandId} sang App MPR thành công!`
            : `Đã đối soát & đồng bộ ${data.totalProcessed || 0} mã đơn (Cập nhật MPR: ${data.mprUpdatedCount || 0} đơn, Cập nhật Chỉ tiêu: ${data.demandUpdatedCount || 0} đơn).`;
        setDialog({
          isOpen: true,
          type: "success",
          title: locale === "cn" ? "MPR 同步成功" : locale === "en" ? "MPR Sync Completed" : "Đồng Bộ MPR Thành Công",
          message: msg,
          confirmText: "Đóng",
        });
      } else {
        setDialog({
          isOpen: true,
          type: "danger",
          title: "Lỗi Đồng Bộ MPR",
          message: data.error || "Không thể đồng bộ dữ liệu sang App MPR.",
          confirmText: "Đóng",
        });
      }
    } catch (err) {
      setDialog({
        isOpen: true,
        type: "danger",
        title: "Lỗi Kết Nối",
        message: "Không thể kết nối máy chủ khi đồng bộ MPR.",
        confirmText: "Đóng",
      });
    } finally {
      setSyncingMpr(false);
    }
  };

  // Handle select all
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredCandidates.length && filteredCandidates.length > 0) {
      setSelectedIds([]);
      setSelectAll(false);
    } else {
      setSelectedIds(filteredCandidates.map((c) => c.id));
      setSelectAll(true);
    }
  };

  const handleToggleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Mở modal cấp mã thẻ nhân viên mới
  const handleOpenEmpnoModal = async (c?: CandidateRecord) => {
    const today = getTodayDateString();
    const effectiveDate = c?.actEnDate && c.actEnDate !== "no" ? toInputDate(c.actEnDate) : actualWorkDate || today;
    setActualWorkDate(effectiveDate);

    setSelectedCandidate(c || null);
    setAssigningEmpno(true);
    setEmpnoModalLoading(true);

    try {
      const res = await fetch(`/api/candidates/set-empno?loc=aw&actEnDate=${effectiveDate}`);
      const data = await res.json();
      if (data.success) {
        const currentRule = FACTORY_CARD_RULES.aw;
        const defaultEmpno = currentRule.example;
        setCustomEmpno(data.nextSuggestedEmpno || defaultEmpno);
        setSuggestedStartEmpno(data.nextSuggestedEmpno || defaultEmpno);
        setEligibleCandidatesForDate(data.eligibleCandidates || []);
      }
    } catch (e) {
      console.error("Lỗi lấy thông tin mã thẻ:", e);
    } finally {
      setEmpnoModalLoading(false);
    }
  };

  // Cập nhật ngày thực tế trong modal và tải lại danh sách ứng viên đủ điều kiện
  const handleDateChangeInEmpnoModal = async (newDate: string) => {
    setActualWorkDate(newDate);
    if (!newDate) return;
    try {
      setEmpnoModalLoading(true);
      const res = await fetch(`/api/candidates/set-empno?loc=aw&actEnDate=${newDate}`);
      const data = await res.json();
      if (data.success) {
        const currentRule = FACTORY_CARD_RULES.aw;
        if (!customEmpno) setCustomEmpno(data.nextSuggestedEmpno || currentRule.example);
        setEligibleCandidatesForDate(data.eligibleCandidates || []);
      }
    } catch (e) {
      console.error("Lỗi cập nhật danh sách ứng viên theo ngày:", e);
    } finally {
      setEmpnoModalLoading(false);
    }
  };

  // Thực thi cấp mã thẻ sau khi đã kiểm tra điều kiện & xác nhận
  const executeAssignEmpno = async (idsToUpdate: number[]) => {
    try {
      setEmpnoModalLoading(true);
      const res = await fetch("/api/candidates/set-empno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateIds: idsToUpdate,
          actEnDate: actualWorkDate,
          loc: "aw",
          customStartEmpno: customEmpno,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setDialog({
          isOpen: true,
          type: "danger",
          title: "Lỗi Cấp Mã Thẻ",
          message: data.error || "Không thể cấp mã thẻ và cấn trừ nhu cầu.",
          confirmText: "Đóng",
        });
        return;
      }

      setAssigningEmpno(false);
      setSelectedIds([]);
      setSelectedCandidate(null);

      // Refresh candidates list
      await fetchCandidates();

      const mprMsg = data.reconciledDemandCodes && data.reconciledDemandCodes.length > 0
        ? `\nĐã tự động cấn trừ số liệu vào ${data.reconciledDemandCodes.length} phiếu MPR: ${data.reconciledDemandCodes.join(", ")}`
        : "";

      setDialog({
        isOpen: true,
        type: "success",
        title: "Cấp Mã Thẻ & Cấn Trừ Nhu Cầu Thành Công!",
        message: `Đã cấp ${data.count} mã thẻ nhân viên (từ ${data.startEmpno} đến ${data.endEmpno}) cho nhân sự nhận việc ngày ${formatDate(actualWorkDate)}.${mprMsg}`,
        confirmText: "Tuyệt vời",
      });
    } catch (e: any) {
      setDialog({
        isOpen: true,
        type: "danger",
        title: "Lỗi Kết Nối",
        message: e.message || "Đã xảy ra lỗi trong quá trình cấp mã thẻ nhân viên.",
        confirmText: "Đóng",
      });
    } finally {
      setEmpnoModalLoading(false);
    }
  };

  // Thực hiện cấp mã thẻ và tự động cấn trừ Nhu cầu tuyển dụng (Demand) theo MPR ID (id_code)
  const handleAssignEmpno = async () => {
    if (!actualWorkDate) {
      setDialog({
        isOpen: true,
        type: "warning",
        title: "Thiếu Ngày Vào Làm Thực Tế",
        message: "Vui lòng chọn Ngày Vào Làm Thực Tế (act_en_date).",
        confirmText: "Đã hiểu",
      });
      return;
    }

    const idsToUpdate = selectedCandidate
      ? [selectedCandidate.id]
      : selectedIds.length > 0
      ? selectedIds
      : eligibleCandidatesForDate.map((c) => c.id);

    if (idsToUpdate.length === 0) {
      setDialog({
        isOpen: true,
        type: "warning",
        title: "Chưa Có Ứng Viên",
        message: "Không tìm thấy ứng viên nào có ngày thực tế này và đã xác nhận nhận việc (reg = 'yes') để cấp mã thẻ.",
        confirmText: "Đã hiểu",
      });
      return;
    }

    // Kiểm tra tiền tố quy chuẩn của nhà máy
    if (isPrefixMismatch) {
      setDialog({
        isOpen: true,
        type: "warning",
        title: "Cảnh Báo Tiền Tố Mã Thẻ",
        message: `Mã thẻ '${customEmpno}' không bắt đầu bằng '${factoryCardRule.prefix}' theo đúng quy chuẩn của nhà máy ${factoryCardRule.label}.\n\nBạn có chắc chắn muốn tiếp tục cấp mã này?`,
        showCancel: true,
        confirmText: "Vẫn Tiếp Tục",
        cancelText: "Kiểm Tra Lại",
        onConfirm: () => {
          setDialog((prev) => ({ ...prev, isOpen: false }));
          executeAssignEmpno(idsToUpdate);
        },
      });
      return;
    }

    await executeAssignEmpno(idsToUpdate);
  };

  // Interactive toggle Reg (Tuyển dụng) with confirmation
  const handleTriggerReg = (c: CandidateRecord) => {
    if (c.reg) {
      return; // Already registered
    }
    const today = getTodayDateString();
    const existingEx = toInputDate(c.exEnDate);
    const existingAct = toInputDate(c.actEnDate);

    setConfirmExDate(existingEx || today);
    setConfirmActDate(existingAct || today);
    setRegConfirmCandidate(c);
  };

  const handleConfirmReg = async () => {
    if (!regConfirmCandidate) return;
    setIsUpdatingReg(true);
    const candidateToUpdate = regConfirmCandidate;

    const targetExEnDate = confirmExDate || getTodayDateString();
    const targetActEnDate = confirmActDate || getTodayDateString();

    // Optimistically update UI so user immediately sees both columns filled and Tuyển dụng checked
    setCandidates((prev) =>
      prev.map((item) =>
        item.id === candidateToUpdate.id
          ? {
              ...item,
              reg: true,
              isHires: true,
              exEnDate: targetExEnDate,
              actEnDate: targetActEnDate,
            }
          : item
      )
    );
    setRegConfirmCandidate(null);

    try {
      const res = await fetch("/api/candidates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: candidateToUpdate.id,
          reg: true,
          exEnDate: targetExEnDate,
          actEnDate: targetActEnDate,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        console.error("Lỗi khi lưu Tuyển dụng:", data.error);
        setDialog({
          isOpen: true,
          type: "danger",
          title: "Lỗi Lưu Tuyển Dụng",
          message: "Lỗi khi cập nhật dữ liệu Tuyển dụng vào CSDL.",
          confirmText: "Đóng",
        });
        fetchCandidates();
      }
    } catch (e) {
      console.error("Lỗi kết nối khi cập nhật Tuyển dụng:", e);
      setDialog({
        isOpen: true,
        type: "danger",
        title: "Lỗi Kết Nối",
        message: "Lỗi kết nối khi cập nhật trạng thái Tuyển dụng.",
        confirmText: "Đóng",
      });
      fetchCandidates();
    } finally {
      setIsUpdatingReg(false);
    }
  };

  const handleUncheckReg = (c: CandidateRecord) => {
    setDialog({
      isOpen: true,
      type: "warning",
      title: "Hủy Tuyển Dụng",
      message: (
        <span>
          Bạn có chắc chắn muốn hủy trạng thái Tuyển dụng của ứng viên{" "}
          <strong className="text-zinc-900 dark:text-zinc-100 font-bold">&ldquo;{c.candidateName}&rdquo;</strong>?
        </span>
      ),
      confirmText: "Hủy Tuyển dụng",
      cancelText: "Giữ nguyên",
      showCancel: true,
      onConfirm: async () => {
        setIsUpdatingReg(true);
        setCandidates((prev) =>
          prev.map((item) =>
            item.id === c.id ? { ...item, reg: false, isHires: false } : item
          )
        );
        try {
          const res = await fetch("/api/candidates", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: c.id,
              reg: false,
            }),
          });
          const data = await res.json();
          if (!data.success) {
            console.error("Lỗi khi hủy Tuyển dụng:", data.error);
            fetchCandidates();
          }
        } catch (e) {
          console.error("Lỗi kết nối khi hủy Tuyển dụng:", e);
          fetchCandidates();
        } finally {
          setIsUpdatingReg(false);
        }
      },
    });
  };

  // State for tracking Excel exporting progress
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Helper function to trigger Excel file export based on filtered or selected candidates
  const triggerExcelDownload = async (type: "all" | "hrm" | "face") => {
    const targetIds = selectedIds.length > 0 ? selectedIds : filteredCandidates.map((c) => c.id);
    if (targetIds.length === 0) {
      setDialog({
        isOpen: true,
        type: "warning",
        title: "Không Có Dữ Liệu",
        message: "Không có ứng viên nào phù hợp với bộ lọc hiện tại để xuất Excel.",
        confirmText: "Đã hiểu",
      });
      return;
    }

    setIsExporting(true);
    try {
      const res = await fetch("/api/candidates/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          loc: "aw",
          ids: targetIds,
        }),
      });

      if (!res.ok) {
        throw new Error("Lỗi khi tạo file Excel xuất báo cáo từ máy chủ");
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      let filename = `Export_${type}.xlsx`;
      if (disposition && disposition.includes("filename=")) {
        const matches = disposition.match(/filename="?([^"]+)"?/);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setDialog({
        isOpen: true,
        type: "danger",
        title: "Lỗi Xuất File",
        message: e.message || "Không thể xuất file báo cáo.",
        confirmText: "Đóng",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = () => triggerExcelDownload("all");
  const handleExportHrm = () => triggerExcelDownload("hrm");
  const handleExportFaceRecog = () => triggerExcelDownload("face");

  // Open Print Template (100% fidelity to legacy template-print routes)
  const handleOpenPrintTemplate = (templateKey: string) => {
    setShowPrintMenu(false);
    if (selectedIds.length === 0) {
      setDialog({
        isOpen: true,
        type: "warning",
        title: "Chưa Chọn Ứng Viên",
        message: "Vui lòng tích chọn ít nhất 1 ứng viên trong danh sách để mở mẫu in!",
        confirmText: "Đã hiểu",
      });
      return;
    }
    if (selectedIds.length > 100) {
      setDialog({
        isOpen: true,
        type: "warning",
        title: "Số Lượng In Quá Lớn",
        message: `Bạn đang chọn ${selectedIds.length} ứng viên. Trình duyệt chỉ có thể xử lý in biểu mẫu tối đa 100 ứng viên mỗi lần để tránh quá tải bộ nhớ. Vui lòng lọc hoặc tích chọn tối đa 100 ứng viên!`,
        confirmText: "Đã hiểu",
      });
      return;
    }
    const ids = selectedIds.join(",");
    window.open(`/template-print/${templateKey}?ids=${ids}`, "_blank");
  };

  // Print BQT (Unswiped Card)
  const handlePrintBqt = () => {
    const query =
      selectedIds.length > 0
        ? `ids=${selectedIds.join(",")}&loc=aw`
        : `loc=aw`;
    window.open(`/template-print/bqt?${query}`, "_blank");
  };

  // Print Hires (Tuyển Dụng)
  const handlePrintHires = () => {
    const query =
      selectedIds.length > 0
        ? `ids=${selectedIds.join(",")}&loc=aw`
        : `loc=aw`;
    window.open(`/template-print/hires?${query}`, "_blank");
  };

  // Delete single candidate from table row
  const handleDeleteCandidate = (c: CandidateRecord) => {
    setDialog({
      isOpen: true,
      type: "danger",
      title: "Xác Nhận Xóa Hồ Sơ",
      message: (
        <span>
          Bạn có chắc chắn muốn xóa hồ sơ ứng viên{" "}
          <strong className="text-zinc-900 dark:text-zinc-100 font-bold">&ldquo;{c.candidateName}&rdquo;</strong>{" "}
          (CCCD: <span className="font-mono">{c.cccd || "—"}</span>)? Hành động này không thể hoàn tác.
        </span>
      ),
      confirmText: "Xóa hồ sơ",
      cancelText: "Hủy bỏ",
      showCancel: true,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const res = await fetch(`/api/candidates?id=${c.id}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            setCandidates((prev) => prev.filter((item) => item.id !== c.id));
            setSelectedIds((prev) => prev.filter((id) => id !== c.id));
            setTotal((prev) => Math.max(0, prev - 1));
            setDialog({
              isOpen: true,
              type: "success",
              title: "Đã Xóa Hồ Sơ",
              message: `Đã xóa hồ sơ ứng viên "${c.candidateName}" thành công!`,
              confirmText: "Đóng",
            });
          } else {
            setDialog({
              isOpen: true,
              type: "danger",
              title: "Không Thể Xóa Hồ Sơ",
              message: data.error || "Lỗi khi xóa hồ sơ ứng viên",
              confirmText: "Đóng",
            });
            fetchCandidates();
          }
        } catch (e) {
          setDialog({
            isOpen: true,
            type: "danger",
            title: "Lỗi Kết Nối",
            message: "Lỗi kết nối khi xóa hồ sơ ứng viên",
            confirmText: "Đóng",
          });
          fetchCandidates();
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  // Bulk delete selected candidates
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDialog({
      isOpen: true,
      type: "danger",
      title: "Xác Nhận Xóa Hàng Loạt",
      message: (
        <span>
          Bạn có chắc chắn muốn xóa{" "}
          <strong className="text-rose-600 dark:text-rose-400 font-bold">{selectedIds.length}</strong> hồ sơ ứng viên đã chọn không?
          Hành động này sẽ xóa dữ liệu và không thể hoàn tác.
        </span>
      ),
      confirmText: `Xóa ${selectedIds.length} hồ sơ`,
      cancelText: "Hủy bỏ",
      showCancel: true,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const res = await fetch(`/api/candidates?ids=${selectedIds.join(",")}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            const deletedIdsSet = new Set(selectedIds);
            setCandidates((prev) => prev.filter((item) => !deletedIdsSet.has(item.id)));
            setTotal((prev) => Math.max(0, prev - selectedIds.length));
            setSelectedIds([]);
            setDialog({
              isOpen: true,
              type: "success",
              title: "Đã Xóa Thành Công",
              message: data.message || `Đã xóa thành công ${selectedIds.length} hồ sơ ứng viên!`,
              confirmText: "Đóng",
            });
          } else {
            setDialog({
              isOpen: true,
              type: "danger",
              title: "Không Thể Xóa",
              message: data.error || "Lỗi khi xóa hồ sơ ứng viên",
              confirmText: "Đóng",
            });
            fetchCandidates();
          }
        } catch (e) {
          setDialog({
            isOpen: true,
            type: "danger",
            title: "Lỗi Kết Nối",
            message: "Lỗi kết nối khi xóa hồ sơ ứng viên",
            confirmText: "Đóng",
          });
          fetchCandidates();
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  // Inline update candidate date (Ngày Dự Kiến or Ngày Thực Tế)
  const handleUpdateCandidateDate = async (
    id: number,
    field: "exEnDate" | "actEnDate",
    newDate: string
  ) => {
    // Optimistic UI update
    setCandidates((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: newDate };
        if (field === "actEnDate" && newDate) {
          updated.reg = true;
          updated.isHires = true;
        }
        return updated;
      })
    );

    try {
      const res = await fetch("/api/candidates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          [field]: newDate,
          ...(field === "actEnDate" && newDate ? { reg: true } : {}),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        console.error("Lỗi khi lưu ngày:", data.error);
      }
    } catch (err) {
      console.error("Lỗi cập nhật ngày ứng viên:", err);
    }
  };

  // Inline toggle approval (HR Duyệt - hrAcQu, BP. Duyệt - dpAcQu)
  const [updatingApprovalKey, setUpdatingApprovalKey] = useState<string | null>(null);
  const [isBatchApproving, setIsBatchApproving] = useState(false);

  const handleToggleApproval = async (
    candidate: CandidateRecord,
    field: "hrAcQu" | "dpAcQu",
    nextVal: boolean
  ) => {
    const key = `${candidate.id}-${field}`;
    if (updatingApprovalKey === key) return;
    setUpdatingApprovalKey(key);

    // Optimistically update UI
    setCandidates((prev) =>
      prev.map((item) =>
        item.id === candidate.id ? { ...item, [field]: nextVal } : item
      )
    );

    try {
      const res = await fetch("/api/candidates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: candidate.id,
          [field]: nextVal,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        console.error(`Lỗi cập nhật ${field}:`, data.error);
        // Rollback on error
        setCandidates((prev) =>
          prev.map((item) =>
            item.id === candidate.id ? { ...item, [field]: !nextVal } : item
          )
        );
        setDialog({
          isOpen: true,
          type: "danger",
          title: "Lỗi Cập Nhật",
          message: data.error || "Không thể cập nhật trạng thái duyệt.",
          confirmText: "Đóng",
        });
      }
    } catch (err) {
      console.error(`Lỗi kết nối khi cập nhật ${field}:`, err);
      // Rollback on error
      setCandidates((prev) =>
        prev.map((item) =>
          item.id === candidate.id ? { ...item, [field]: !nextVal } : item
        )
      );
      setDialog({
        isOpen: true,
        type: "danger",
        title: "Lỗi Kết Nối",
        message: "Lỗi kết nối khi cập nhật trạng thái duyệt.",
        confirmText: "Đóng",
      });
    } finally {
      setUpdatingApprovalKey(null);
    }
  };

  const handleToggleReg = async (candidate: CandidateRecord, nextVal: boolean) => {
    // Không cho phép thay đổi nếu ứng viên đã có mã thẻ nhân viên
    const hasEmpno = Boolean(candidate.empno && candidate.empno.trim() && candidate.empno.trim() !== "-");
    if (hasEmpno) return;

    const key = `${candidate.id}-reg`;
    if (updatingApprovalKey === key) return;
    setUpdatingApprovalKey(key);

    const today = getTodayDateString();
    const targetExEnDate = nextVal
      ? candidate.exEnDate && candidate.exEnDate !== "no"
        ? candidate.exEnDate
        : today
      : candidate.exEnDate;
    const targetActEnDate = nextVal
      ? candidate.actEnDate && candidate.actEnDate !== "no"
        ? candidate.actEnDate
        : today
      : candidate.actEnDate;

    // Optimistically update UI
    setCandidates((prev) =>
      prev.map((item) =>
        item.id === candidate.id
          ? {
              ...item,
              reg: nextVal,
              isHires: nextVal,
              ...(nextVal ? { exEnDate: targetExEnDate, actEnDate: targetActEnDate } : {}),
            }
          : item
      )
    );

    try {
      const res = await fetch("/api/candidates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: candidate.id,
          reg: nextVal,
          ...(nextVal ? { exEnDate: targetExEnDate, actEnDate: targetActEnDate } : {}),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        console.error("Lỗi cập nhật Tuyển dụng:", data.error);
        // Rollback on error
        setCandidates((prev) =>
          prev.map((item) =>
            item.id === candidate.id ? { ...item, reg: !nextVal, isHires: !nextVal } : item
          )
        );
        setDialog({
          isOpen: true,
          type: "danger",
          title: "Lỗi Cập Nhật",
          message: data.error || "Không thể cập nhật trạng thái Tuyển dụng.",
          confirmText: "Đóng",
        });
      }
    } catch (err) {
      console.error("Lỗi kết nối khi cập nhật Tuyển dụng:", err);
      // Rollback on error
      setCandidates((prev) =>
        prev.map((item) =>
          item.id === candidate.id ? { ...item, reg: !nextVal, isHires: !nextVal } : item
        )
      );
      setDialog({
        isOpen: true,
        type: "danger",
        title: "Lỗi Kết Nối",
        message: "Lỗi kết nối khi cập nhật trạng thái Tuyển dụng.",
        confirmText: "Đóng",
      });
    } finally {
      setUpdatingApprovalKey(null);
    }
  };

  const handleBatchApproval = async (field: "hrAcQu" | "dpAcQu", value: boolean) => {
    if (selectedIds.length === 0) return;
    setIsBatchApproving(true);
    const targetIds = [...selectedIds];

    // Optimistic UI update
    setCandidates((prev) =>
      prev.map((c) =>
        targetIds.includes(c.id) ? { ...c, [field]: value } : c
      )
    );

    try {
      const res = await fetch("/api/candidates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: targetIds,
          [field]: value,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setDialog({
          isOpen: true,
          type: "danger",
          title: "Lỗi Duyệt Hàng Loạt",
          message: data.error || "Không thể cập nhật trạng thái duyệt hàng loạt.",
          confirmText: "Đóng",
        });
        fetchCandidates();
      } else {
        setDialog({
          isOpen: true,
          type: "success",
          title: "Duyệt Thành Công",
          message: `Đã cập nhật ${field === "hrAcQu" ? "HR duyệt" : "BP. duyệt"} cho ${targetIds.length} ứng viên!`,
          confirmText: "Tuyệt vời",
        });
      }
    } catch (err) {
      setDialog({
        isOpen: true,
        type: "danger",
        title: "Lỗi Kết Nối",
        message: "Lỗi kết nối khi cập nhật duyệt hàng loạt.",
        confirmText: "Đóng",
      });
      fetchCandidates();
    } finally {
      setIsBatchApproving(false);
    }
  };

  // Base candidates filtered by factory location, top search bar, and drill-through parameters
  const baseCandidates = useMemo(() => {
    const dateInfo = paramTimeRange ? getVietnamDateInfo() : null;
    const nowYear = new Date().getFullYear();

    return candidates.filter((c) => {
      // Single factory location: AW
      if (c.loc && c.loc.toLowerCase() !== "aw") return false;

      // Filter only recruited candidates (already in company, has employee card)
      if (activeRecruitedOnly) {
        const cleanEmp = (c.empno || "").replace(/^'+/, "").trim();
        if (!cleanEmp || cleanEmp === "-" || cleanEmp === "no") return false;
      }

      // Drill-through Filter: Duty / Position (Vị trí)
      if (paramDuty) {
        const pDuty = paramDuty.toLowerCase().trim();
        const cDuty = (c.duty || c.position || "").toLowerCase().trim();
        if (!cDuty.includes(pDuty) && !pDuty.includes(cDuty)) return false;
      }

      // Drill-through Filter: Gender (Giới tính)
      if (paramGender) {
        const pG = paramGender.toLowerCase().trim();
        const isLookingForFemale = pG === "nữ" || pG === "nu" || pG === "f" || pG === "1";
        const g = (c.gender || "").toLowerCase().trim();
        const isRowFemale = g === "nữ" || g === "nu" || g === "f" || g === "1";
        if (isLookingForFemale ? !isRowFemale : isRowFemale) return false;
      }

      // Drill-through Filter: Department (Bộ phận / Khối)
      if (paramApplyDp) {
        const pDp = paramApplyDp.toLowerCase().trim();
        const cDp = (c.applyDp || c.deptCode || c.dept || c.tmpDepartid || "").toLowerCase().trim();
        if (!cDp.includes(pDp) && !pDp.includes(cDp)) return false;
      }

      // Drill-through Filter: Recruitment Source (Nguồn tuyển)
      if (paramSource) {
        const pSrc = paramSource.toLowerCase().trim();
        const sName = (c.source_name || c.source_recruit || "").toLowerCase().trim();
        const sRaw = (c.recru_source || "").toLowerCase().trim();
        const matchesSrc =
          sName === pSrc ||
          sName.includes(pSrc) ||
          pSrc.includes(sName) ||
          sRaw === pSrc;
        if (!matchesSrc) return false;
      }

      // Drill-through Filter: Education Level (Trình độ học vấn)
      if (paramEdu) {
        const pEdu = paramEdu.toLowerCase().trim();
        const eName = (c.edu_name || "").toLowerCase().trim();
        const eRaw = (c.edu || "").toLowerCase().trim();
        const matchesEdu =
          eName === pEdu ||
          eName.includes(pEdu) ||
          pEdu.includes(eName) ||
          eRaw === pEdu;
        if (!matchesEdu) return false;
      }

      // Drill-through Filter: Age Group (Nhóm tuổi)
      if (paramAgeGroup) {
        if (!c.dateOfBirth) return false;
        const cleanAgeGroup = paramAgeGroup.replace(/\s*tuổi\s*/gi, "").trim();
        const matchYear = String(c.dateOfBirth).match(/\b(19\d{2}|20\d{2})\b/);
        const bYear = matchYear ? parseInt(matchYear[1], 10) : 0;
        if (!bYear) return false;
        const age = nowYear - bYear;
        if ((cleanAgeGroup === "< 20" || cleanAgeGroup === "18 - 20") && age >= 20) return false;
        if ((cleanAgeGroup === "20 - 30" || cleanAgeGroup === "21 - 30" || cleanAgeGroup === "18 - 30") && (age < 18 || age > 30)) return false;
        if (cleanAgeGroup === "31 - 40" && (age < 31 || age > 40)) return false;
        if (cleanAgeGroup === "31 - 45" && (age < 31 || age > 45)) return false;
        if (cleanAgeGroup === "41 - 50" && (age < 41 || age > 50)) return false;
        if (cleanAgeGroup === "> 50" && age <= 50) return false;
        if (cleanAgeGroup === "> 46" && age < 46) return false;
      }

      // Drill-through Filter: Time Range (Ngày nhập hồ sơ: keyInDate)
      if (paramTimeRange && dateInfo) {
        const cDate = c.keyInDate ? c.keyInDate.split("T")[0].replace(/\//g, "-") : "";
        if (!cDate) return false;

        if (paramTimeRange === "today") {
          if (cDate !== dateInfo.todayStr) return false;
        } else if (paramTimeRange === "week") {
          if (cDate < dateInfo.weekStartStr || cDate > dateInfo.weekEndStr) return false;
        } else if (paramTimeRange === "month") {
          if (!cDate.startsWith(dateInfo.currentMonthStr)) return false;
        } else if (paramTimeRange === "year") {
          if (!cDate.startsWith(dateInfo.currentYearStr)) return false;
        } else if (paramTimeRange === "custom" || paramTimeRange === "range") {
          if (paramStartDate && cDate < paramStartDate) return false;
          if (paramEndDate && cDate > paramEndDate) return false;
        }
      }

      // Drill-through Filter from Recruiting Report (/recruiting-report)
      if (paramReportSource) {
        const fDate = paramFromDate ? toInputDate(paramFromDate) : "";
        const tDate = paramToDate ? toInputDate(paramToDate) : "";
        const inRange = (dStr?: string | null) => {
          const norm = toInputDate(dStr);
          if (!norm) return false;
          if (fDate && norm < fDate) return false;
          if (tDate && norm > tDate) return false;
          return true;
        };

        if (paramReportSource === "comeToInterview") {
          if (!inRange(c.date_hr_inter)) return false;
        } else if (paramReportSource === "accHR") {
          if (!c.hrAcQu) return false;
          const hasHrDate = Boolean(toInputDate(c.date_hr_review));
          if (hasHrDate ? !inRange(c.date_hr_review) : !inRange(c.date_hr_inter)) return false;
        } else if (paramReportSource === "accDept") {
          if (!c.dpAcQu) return false;
          const hasDpDate = Boolean(toInputDate(c.date_dept_review));
          const hasHrDate = Boolean(toInputDate(c.date_hr_review));
          if (
            hasDpDate
              ? !inRange(c.date_dept_review)
              : hasHrDate
              ? !inRange(c.date_hr_review)
              : !inRange(c.date_hr_inter)
          ) {
            return false;
          }
        } else if (paramReportSource === "enrolled") {
          if (!inRange(c.actEnDate)) return false;
        } else if (paramReportSource === "expToEnroll") {
          if (!c.hrAcQu || !c.dpAcQu || !inRange(c.exEnDate)) return false;
        }
      }

      // Search filter
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        (c.candidateName && c.candidateName.toLowerCase().includes(s)) ||
        (c.cccd && c.cccd.toLowerCase().includes(s)) ||
        (c.empno && c.empno.toLowerCase().includes(s)) ||
        (c.dept && c.dept.toLowerCase().includes(s)) ||
        (c.deptCode && c.deptCode.toLowerCase().includes(s)) ||
        (c.applyDp && c.applyDp.toLowerCase().includes(s)) ||
        (c.tmpDepartid && c.tmpDepartid.toLowerCase().includes(s)) ||
        (c.duty && c.duty.toLowerCase().includes(s)) ||
        (c.source_name && c.source_name.toLowerCase().includes(s)) ||
        (c.edu_name && c.edu_name.toLowerCase().includes(s))
      );
    });
  }, [
    candidates,
    selectedFactory,
    activeRecruitedOnly,
    search,
    paramDuty,
    paramGender,
    paramApplyDp,
    paramSource,
    paramEdu,
    paramAgeGroup,
    paramTimeRange,
    paramStartDate,
    paramEndDate,
    paramFromDate,
    paramToDate,
    paramReportSource,
  ]);

  // Excel multi-column filtering and sorting
  const {
    filteredData: filteredCandidates,
    filters: excelFilters,
    sortConfig,
    getDistinctValues,
    setFilter,
    setSort,
    resetFilter,
    resetAllFilters,
    activeFilterCount,
  } = useTableExcelFilter(baseCandidates, {
    customExtractors: {
      gender: (c) =>
        c.gender === "0" || c.gender === "M" || c.gender === "Nam"
          ? "Nam"
          : c.gender === "1" || c.gender === "F" || c.gender === "Nữ"
          ? "Nữ"
          : c.gender || "",
      hrAcQu: (c) => (c.hrAcQu ? "Đạt" : "Chưa"),
      dpAcQu: (c) => (c.dpAcQu ? "Đạt" : "Chưa"),
      reg: (c) => (c.reg ? "Đã tuyển" : "Chưa"),
      tmpDepartid: (c) => c.tmpDepartid || c.dept || "",
      applyDp: (c) => c.applyDp || c.deptCode || "",
      note: (c) => c.notes || "",
      empno: (c) => c.empno || "",
    },
    defaultSort: { key: "id", direction: "desc" },
  });

  // Reset page to 1 whenever search or Excel filters change
  useEffect(() => {
    setPage(1);
  }, [search, excelFilters, activeDemandId]);

  // Sync selectAll state when selectedIds or filteredCandidates change
  useEffect(() => {
    if (filteredCandidates.length > 0 && selectedIds.length === filteredCandidates.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedIds, filteredCandidates]);

  // Client-side pagination over all filtered candidates
  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCandidates.slice(startIndex, startIndex + pageSize);
  }, [filteredCandidates, currentPage, pageSize]);

  return (
    <div className="w-full h-full flex-1 min-h-0 flex flex-col p-2 sm:p-2.5 lg:p-3 space-y-2 overflow-hidden bg-[#eaedf0] dark:bg-[#121214] text-zinc-900 dark:text-[#F1F2F4] transition-colors duration-200">
      {/* Top Cockpit Toolbar: App Bar (Fidelity to pages/index.vue v-app-bar) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 bg-[#f1f3f6] dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-lg p-2 sm:px-3 sm:py-2 shadow-xs transition-colors duration-200">
        {/* Left: Title */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Users className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-[#F1F2F4] leading-none">
                {t("candidateListing", "Danh Sách Ứng Viên Tuyển Dụng")}
              </h1>
            </div>
          </div>
        </div>

        {/* Right: Search Input, Refresh & Add New Candidate */}
        <div className="flex items-center space-x-2" id="tour-candidate-controls">
          <div className="relative w-48 sm:w-60">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchCandidates()}
              placeholder={`${t("search", "Tìm kiếm")}...`}
              aria-label="Tìm kiếm ứng viên"
              className="w-full h-9 rounded-md bg-zinc-50 dark:bg-[#131316] border border-zinc-200 dark:border-[#26262C] pl-8 pr-8 text-xs text-zinc-900 dark:text-[#F1F2F4] placeholder-zinc-400 dark:placeholder-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 focus-visible:border-rose-500 transition-colors"
            />
            <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Xóa tìm kiếm"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={handleManualSyncMpr}
            disabled={syncingMpr || loading}
            className="h-9 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-xs font-bold text-white shadow-xs inline-flex items-center justify-center space-x-1.5 transition-colors duration-150 active:scale-[0.97] cursor-pointer"
            title="Đồng bộ danh sách nhân viên đã cấp thẻ & thôi việc sang App MPR"
            aria-label="Đồng bộ MPR"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-white ${syncingMpr ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span className="whitespace-nowrap hidden sm:inline">
              {locale === "cn" ? "同步 MPR" : locale === "en" ? "Sync to MPR" : "Đồng bộ đến MPR"}
            </span>
          </button>

          <button
            onClick={fetchCandidates}
            className="h-9 w-9 rounded-md bg-zinc-50 dark:bg-[#131316] border border-zinc-200 dark:border-[#26262C] inline-flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#222228] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 active:scale-[0.97]"
            title={t("refresh", "Làm mới")}
            aria-label="Tải lại dữ liệu ứng viên"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin text-rose-500 dark:text-rose-400" : ""}`}
              aria-hidden="true"
            />
          </button>

          <Link
            href="/candidates/new"
            aria-label="Tiếp nhận ứng viên mới"
            className="h-9 px-4 rounded-md bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs shadow-rose-600/20 inline-flex items-center justify-center space-x-1.5 transition-colors duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
          >
            <UserPlus className="w-4 h-4 text-white" aria-hidden="true" />
            <span className="whitespace-nowrap text-white">{t("addNew", "Thêm mới")}</span>
          </Link>
        </div>
      </div>

      {/* Active Demand, Recruited, or Drill-Through Filter Notification Banner */}
      {(activeDemandId || activeRecruitedOnly || paramDuty || paramGender || paramApplyDp || paramSource || paramEdu || paramAgeGroup || paramTimeRange || paramReportSource) && (
        <div className="flex items-center justify-between px-3 py-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs shadow-xs animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center gap-2 text-rose-800 dark:text-rose-200 font-medium">
            <span className="font-bold">{t("filterCandidates", "Đang lọc ứng viên:")}</span>
            {activeDemandId && (
              <span className="tabular-nums bg-rose-100 dark:bg-rose-900/60 px-2.5 py-0.5 rounded font-extrabold text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 text-xs">
                {t("demandId", "Mã đơn")}: {activeDemandId}
              </span>
            )}
            {paramReportSource && (
              <span className="bg-rose-100 dark:bg-rose-900/60 px-2.5 py-0.5 rounded font-bold border border-rose-300 dark:border-rose-800 text-xs">
                {paramReportSource === "comeToInterview"
                  ? t("comeToInterview", "Đến phỏng vấn")
                  : paramReportSource === "accHR"
                  ? t("accByHR", "HR Duyệt")
                  : paramReportSource === "accDept"
                  ? t("accByDept", "BP Duyệt")
                  : paramReportSource === "enrolled"
                  ? t("todayEnrolled", "Thực tế nhận việc")
                  : t("expToEnroll", "Dự kiến nhận việc")}
                {paramFromDate && paramToDate ? ` (${formatDate(paramFromDate)} - ${formatDate(paramToDate)})` : ""}
              </span>
            )}
            {paramSource && (
              <span className="bg-rose-100 dark:bg-rose-900/60 px-2.5 py-0.5 rounded font-bold border border-rose-300 dark:border-rose-800 text-xs">
                {t("recruitmentSource", "Nguồn")}: {paramSource}
              </span>
            )}
            {paramEdu && (
              <span className="bg-rose-100 dark:bg-rose-900/60 px-2.5 py-0.5 rounded font-bold border border-rose-300 dark:border-rose-800 text-xs">
                {t("education", "Trình độ")}: {paramEdu}
              </span>
            )}
            {paramAgeGroup && (
              <span className="bg-rose-100 dark:bg-rose-900/60 px-2.5 py-0.5 rounded font-bold border border-rose-300 dark:border-rose-800 text-xs">
                {t("age", "Độ tuổi")}: {paramAgeGroup}
              </span>
            )}
            {paramDuty && (
              <span className="bg-rose-100 dark:bg-rose-900/60 px-2.5 py-0.5 rounded font-bold border border-rose-300 dark:border-rose-800 text-xs">
                {t("position", "Vị trí")}: {paramDuty}
              </span>
            )}
            {paramGender && (
              <span className="bg-rose-100 dark:bg-rose-900/60 px-2.5 py-0.5 rounded font-bold border border-rose-300 dark:border-rose-800 text-xs">
                {t("gender", "Giới tính")}: {paramGender}
              </span>
            )}
            {paramApplyDp && (
              <span className="bg-rose-100 dark:bg-rose-900/60 px-2.5 py-0.5 rounded font-bold border border-rose-300 dark:border-rose-800 text-xs">
                {t("department", "Bộ phận")}: {paramApplyDp}
              </span>
            )}
            {paramTimeRange && (
              <span className="bg-rose-100 dark:bg-rose-900/60 px-2.5 py-0.5 rounded font-bold border border-rose-300 dark:border-rose-800 text-xs">
                {t("filterTimeRange", "Thời gian")}: {paramTimeRange === "today" ? t("today", "Hôm nay") : paramTimeRange === "week" ? t("thisWeek", "Tuần này") : paramTimeRange === "month" ? t("thisMonth", "Tháng này") : paramTimeRange === "year" ? t("thisYear", "Năm nay") : t("customRange", "Tùy chọn")}
              </span>
            )}
            {activeRecruitedOnly && (
              <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded font-bold border border-emerald-300 dark:border-emerald-800 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t("alreadyInCompany", "Đã vào Cty (Đã có mã thẻ)")}
              </span>
            )}
            <span className="text-zinc-600 dark:text-zinc-400 font-semibold">({filteredCandidates.length} {t("candidatesCount", "ứng viên")})</span>
          </div>
          <button
            onClick={() => {
              window.location.href = "/candidates";
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors shadow-2xs cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> {t("clearFilter", "Bỏ lọc")}
          </button>
        </div>
      )}

      {/* Active Excel Column Filters Banner */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-medium">
            <span className="font-bold">{t("activeFilters", "Bộ lọc:")}</span>
            <span className="bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded font-extrabold text-rose-800 dark:text-rose-200 text-xs border border-rose-300 dark:border-rose-800">
              {activeFilterCount} {t("columnsCount", "cột")}
            </span>
            <span className="text-zinc-600 dark:text-zinc-400">
              ({t("showingCandidates", "Hiển thị")} {filteredCandidates.length} / {candidates.length} {t("candidatesCount", "ứng viên")})
            </span>
          </div>
          <button
            id="btn-reset-candidates-excel-filters"
            onClick={resetAllFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-rose-300 dark:border-rose-800 text-xs font-bold text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors shadow-2xs cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> {t("clearFilters", "Xóa lọc")}
          </button>
        </div>
      )}

      {/* Main Full-Page Data Table Container (Legacy index.vue Fidelity) */}
      <div className="flex-1 min-h-0 w-full rounded-lg border border-[#d8dce2] dark:border-[#26262C] bg-white dark:bg-[#18181C] flex flex-col overflow-hidden shadow-xs transition-colors duration-200">
        {/* Table Body with Custom Scrollbar */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="sticky top-0 z-20 bg-[#e6e9ee] dark:bg-[#121214]/95 border-b border-[#d0d5dd] dark:border-[#26262C]">
              <tr className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider select-none">
                {/* 1. Checkbox Select All */}
                <th className="py-2 px-2.5 w-8 text-center">
                  <button
                    onClick={handleToggleSelectAll}
                    aria-label="Chọn tất cả ứng viên"
                    className="flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                  >
                    {selectAll ? (
                      <CheckSquare className="w-4 h-4 text-rose-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>

                {/* 3. Key in (Ngày nhập hồ sơ) */}
                <th className="py-2 px-2.5">
                  <ExcelColumnFilter
                    title={t("keyInDate", "Ngày nhập")}
                    columnKey="keyInDate"
                    distinctValues={getDistinctValues("keyInDate")}
                    selectedValues={excelFilters["keyInDate"]}
                    onFilterChange={(v) => setFilter("keyInDate", v)}
                    sortDirection={sortConfig?.key === "keyInDate" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("keyInDate", dir)}
                  />
                </th>

                {/* 3.5. Mã đơn (Demand ID) */}
                <th className="py-2 px-2.5">
                  <ExcelColumnFilter
                    title={t("demandCode", "Mã đơn")}
                    columnKey="empDemandid"
                    distinctValues={getDistinctValues("empDemandid")}
                    selectedValues={excelFilters["empDemandid"]}
                    onFilterChange={(v) => setFilter("empDemandid", v)}
                    sortDirection={sortConfig?.key === "empDemandid" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("empDemandid", dir)}
                  />
                </th>

                {/* 4. Họ và tên (Name) */}
                <th className="py-2 px-3">
                  <ExcelColumnFilter
                    title={t("fullName", "Họ và tên")}
                    columnKey="candidateName"
                    distinctValues={getDistinctValues("candidateName")}
                    selectedValues={excelFilters["candidateName"]}
                    onFilterChange={(v) => setFilter("candidateName", v)}
                    sortDirection={sortConfig?.key === "candidateName" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("candidateName", dir)}
                  />
                </th>

                {/* 5. Ngày sinh (Birth day) */}
                <th className="py-2 px-2.5">
                  <ExcelColumnFilter
                    title={t("birthday", "Ngày sinh")}
                    columnKey="dateOfBirth"
                    distinctValues={getDistinctValues("dateOfBirth")}
                    selectedValues={excelFilters["dateOfBirth"]}
                    onFilterChange={(v) => setFilter("dateOfBirth", v)}
                    sortDirection={sortConfig?.key === "dateOfBirth" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("dateOfBirth", dir)}
                  />
                </th>

                {/* 6. Giới tính (Sex) */}
                <th className="py-2 px-2 text-center">
                  <ExcelColumnFilter
                    title={t("gender", "Giới tính")}
                    columnKey="gender"
                    align="center"
                    distinctValues={getDistinctValues("gender")}
                    selectedValues={excelFilters["gender"]}
                    onFilterChange={(v) => setFilter("gender", v)}
                    sortDirection={sortConfig?.key === "gender" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("gender", dir)}
                  />
                </th>

                {/* 7. Số CCCD (ID no) */}
                <th className="py-2 px-3">
                  <ExcelColumnFilter
                    title={t("idNo", "Số CCCD")}
                    columnKey="cccd"
                    distinctValues={getDistinctValues("cccd")}
                    selectedValues={excelFilters["cccd"]}
                    onFilterChange={(v) => setFilter("cccd", v)}
                    sortDirection={sortConfig?.key === "cccd" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("cccd", dir)}
                  />
                </th>

                {/* 8. Vị trí công việc (Position) */}
                <th className="py-2 px-3">
                  <ExcelColumnFilter
                    title={t("position", "Vị trí")}
                    columnKey="duty"
                    distinctValues={getDistinctValues("duty")}
                    selectedValues={excelFilters["duty"]}
                    onFilterChange={(v) => setFilter("duty", v)}
                    sortDirection={sortConfig?.key === "duty" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("duty", dir)}
                  />
                </th>

                {/* 9. Mã BP (Dept applied) */}
                <th className="py-2 px-2.5">
                  <ExcelColumnFilter
                    title={t("deptApplied", "Mã BP")}
                    columnKey="applyDp"
                    distinctValues={getDistinctValues("applyDp")}
                    selectedValues={excelFilters["applyDp"]}
                    onFilterChange={(v) => setFilter("applyDp", v)}
                    sortDirection={sortConfig?.key === "applyDp" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("applyDp", dir)}
                  />
                </th>

                {/* 10. Bộ phận / Bp. duyệt (Unit) */}
                <th className="py-2 px-3">
                  <ExcelColumnFilter
                    title={t("deptAppliedUnit", "BP ứng tuyển")}
                    columnKey="tmpDepartid"
                    distinctValues={getDistinctValues("tmpDepartid")}
                    selectedValues={excelFilters["tmpDepartid"]}
                    onFilterChange={(v) => setFilter("tmpDepartid", v)}
                    sortDirection={sortConfig?.key === "tmpDepartid" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("tmpDepartid", dir)}
                  />
                </th>

                {/* 11. HR duyệt (HR acc) */}
                <th className="py-2 px-2 text-center">
                  <ExcelColumnFilter
                    title={t("hrAccept", "HR duyệt")}
                    columnKey="hrAcQu"
                    align="center"
                    distinctValues={getDistinctValues("hrAcQu")}
                    selectedValues={excelFilters["hrAcQu"]}
                    onFilterChange={(v) => setFilter("hrAcQu", v)}
                    sortDirection={sortConfig?.key === "hrAcQu" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("hrAcQu", dir)}
                  />
                </th>

                {/* 13. Bp. duyệt đạt (Dept acc) */}
                <th className="py-2 px-2 text-center">
                  <ExcelColumnFilter
                    title={t("deptAccept", "Bp. duyệt")}
                    columnKey="dpAcQu"
                    align="center"
                    distinctValues={getDistinctValues("dpAcQu")}
                    selectedValues={excelFilters["dpAcQu"]}
                    onFilterChange={(v) => setFilter("dpAcQu", v)}
                    sortDirection={sortConfig?.key === "dpAcQu" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("dpAcQu", dir)}
                  />
                </th>

                {/* 14. Tuyển dụng (Reg) */}
                <th className="py-2 px-2 text-center">
                  <ExcelColumnFilter
                    title={t("registered", "Tuyển dụng")}
                    columnKey="reg"
                    align="center"
                    distinctValues={getDistinctValues("reg")}
                    selectedValues={excelFilters["reg"]}
                    onFilterChange={(v) => setFilter("reg", v)}
                    sortDirection={sortConfig?.key === "reg" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("reg", dir)}
                  />
                </th>

                {/* 15. Ngày dự kiến (Expected date) */}
                <th className="py-2 px-2.5">
                  <ExcelColumnFilter
                    title={t("expectedDate", "Ngày dự kiến")}
                    columnKey="exEnDate"
                    distinctValues={getDistinctValues("exEnDate")}
                    selectedValues={excelFilters["exEnDate"]}
                    onFilterChange={(v) => setFilter("exEnDate", v)}
                    sortDirection={sortConfig?.key === "exEnDate" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("exEnDate", dir)}
                  />
                </th>

                {/* 16. Ngày thực tế (Actually date) */}
                <th className="py-2 px-2.5">
                  <ExcelColumnFilter
                    title={t("actualDate", "Ngày thực tế")}
                    columnKey="actEnDate"
                    distinctValues={getDistinctValues("actEnDate")}
                    selectedValues={excelFilters["actEnDate"]}
                    onFilterChange={(v) => setFilter("actEnDate", v)}
                    sortDirection={sortConfig?.key === "actEnDate" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("actEnDate", dir)}
                  />
                </th>

                {/* 17. Mã thẻ HRM (Empno HRM) */}
                <th className="py-2 px-3 text-center">
                  <ExcelColumnFilter
                    title={t("empnoCard", "Mã thẻ")}
                    columnKey="empno"
                    align="center"
                    distinctValues={getDistinctValues("empno")}
                    selectedValues={excelFilters["empno"]}
                    onFilterChange={(v) => setFilter("empno", v)}
                    sortDirection={sortConfig?.key === "empno" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("empno", dir)}
                  />
                </th>

                {/* 19. Ghi chú (Note) */}
                <th className="py-2 px-2 text-center">
                  <ExcelColumnFilter
                    title={t("note", "Ghi chú")}
                    columnKey="note"
                    align="center"
                    distinctValues={getDistinctValues("note")}
                    selectedValues={excelFilters["note"]}
                    onFilterChange={(v) => setFilter("note", v)}
                    sortDirection={sortConfig?.key === "note" ? sortConfig.direction : null}
                    onSortChange={(dir) => setSort("note", dir)}
                  />
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-200/80 dark:divide-[#26262C]/80 font-medium text-xs">
              {loading && candidates.length === 0 ? (
                <tr>
                  <td colSpan={17} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="w-6 h-6 text-rose-500 animate-spin" aria-hidden="true" />
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("loading", "Đang tải dữ liệu...")}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={17} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-1.5">
                      <Users className="w-7 h-7 text-zinc-400 dark:text-zinc-600" aria-hidden="true" />
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("candidatesNotFound", "Không tìm thấy ứng viên phù hợp")}</p>
                      <p className="text-[11px] text-zinc-500">
                        {t("tryAdjustFilter", "Hãy thử thay đổi điều kiện tìm kiếm hoặc bộ lọc")}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((c, idx) => {
                  const isSelected = selectedIds.includes(c.id);
                  const hasEmpno = Boolean(c.empno && c.empno.trim() && c.empno.trim() !== "-");

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-zinc-50/90 dark:hover:bg-[#222228]/50 transition-colors group ${
                        isSelected ? "bg-rose-500/10 dark:bg-[#341117]/30" : ""
                      }`}
                    >
                      {/* 1. Checkbox Select Row */}
                      <td className="py-1.5 px-2.5 text-center">
                        <button
                          onClick={() => handleToggleSelectRow(c.id)}
                          aria-label={`Chọn ứng viên ${c.candidateName}`}
                          className="flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-rose-500" />
                          ) : (
                            <Square className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>

                      {/* 3. Key In Date (Cố định, không chỉnh sửa) */}
                      <td className="py-1.5 px-2.5 text-zinc-600 dark:text-zinc-400 tabular-nums text-xs">
                        {c.keyInDate ? formatDate(c.keyInDate) : "-"}
                      </td>

                      {/* 3.5. Mã đơn (Demand ID) */}
                      <td className="py-1.5 px-2.5 tabular-nums text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {c.empDemandid && c.empDemandid !== "no" ? c.empDemandid : "-"}
                      </td>

                      {/* 4. Candidate Name (Link to Profile/Edit) */}
                      <td className="py-1.5 px-3">
                        <Link
                          href={`/candidates/new?id=${c.id}`}
                          title="Chỉnh sửa hoặc xem hồ sơ ứng viên"
                          className="font-bold text-zinc-900 dark:text-[#F1F2F4] group-hover:text-rose-600 dark:group-hover:text-[#fb7185] transition-colors truncate max-w-[160px] inline-block"
                        >
                          {c.candidateName}
                        </Link>
                      </td>

                      {/* 5. Date of Birth */}
                      <td className="py-1.5 px-2.5 text-zinc-700 dark:text-zinc-300 tabular-nums text-xs">
                        {c.dateOfBirth ? formatDate(c.dateOfBirth) : "-"}
                      </td>

                      {/* 6. Gender */}
                      <td className="py-1.5 px-2 text-center text-zinc-600 dark:text-zinc-400 text-xs">
                        {c.gender === "1" || c.gender === "Nữ" || c.gender?.toLowerCase() === "female"
                          ? t("female")
                          : t("male")}
                      </td>

                      {/* 7. CCCD / ID Card */}
                      <td className="py-1.5 px-3 tabular-nums text-zinc-900 dark:text-zinc-300 text-xs">
                        {c.cccd}
                      </td>

                      {/* 8. Position (Duty) */}
                      <td className="py-1.5 px-3 text-zinc-800 dark:text-zinc-300 truncate max-w-[140px]">
                        {(() => {
                          if (!c.duty) return "-";
                          const d = c.duty.trim();
                          if (d === "Công nhân" || d.toLowerCase() === "worker") return t("worker");
                          if (d === "Nhân viên" || d.toLowerCase() === "staff") return t("staff");
                          if (d === "Cán bộ" || d === "Cán bộ / Tổ trưởng" || d.toLowerCase() === "leader") return t("leader");
                          if (d === "Phiên dịch" || d.toLowerCase() === "translator") return t("translator");
                          if (d === "Kỹ sư" || d.toLowerCase() === "engineer") return t("engineer");
                          return d;
                        })()}
                      </td>

                      {/* 9. Dept Applied Code (apply_dp) */}
                      <td className="py-1.5 px-2.5 font-semibold text-zinc-600 dark:text-zinc-400 text-xs">
                        {c.applyDp || c.deptCode || "-"}
                      </td>

                      {/* 10. Unit / Dept Name (tmp_departid) */}
                      <td
                        className="py-1.5 px-3 text-zinc-800 dark:text-zinc-200 truncate max-w-[180px]"
                        title={c.deptName ? `${c.tmpDepartid || c.dept} (${c.deptName})` : c.tmpDepartid || c.dept}
                      >
                        {c.tmpDepartid || c.dept || "-"}
                      </td>

                      {/* 11. HR Acc (HR duyệt) */}
                      <td className="py-1.5 px-2 text-center">
                        <div className="flex items-center justify-center">
                          <label
                            className="inline-flex items-center justify-center p-0.5 cursor-pointer select-none"
                            title={c.hrAcQu ? "HR Đã Đạt (Bỏ chọn để hủy duyệt)" : "HR Chưa Đạt (Chọn để duyệt)"}
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(c.hrAcQu)}
                              disabled={updatingApprovalKey === `${c.id}-hrAcQu`}
                              onChange={(e) => handleToggleApproval(c, "hrAcQu", e.target.checked)}
                              className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-emerald-600 focus:ring-emerald-500/20 cursor-pointer accent-emerald-600 transition-transform active:scale-90 disabled:opacity-50"
                            />
                          </label>
                        </div>
                      </td>

                      {/* 12. Dept Acc (Bp. duyệt Đạt) */}
                      <td className="py-1.5 px-2 text-center">
                        <div className="flex items-center justify-center">
                          <label
                            className="inline-flex items-center justify-center p-0.5 cursor-pointer select-none"
                            title={c.dpAcQu ? "Bp. duyệt Đã Đạt (Bỏ chọn để hủy duyệt)" : "Bp. duyệt Chưa Đạt (Chọn để duyệt)"}
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(c.dpAcQu)}
                              disabled={updatingApprovalKey === `${c.id}-dpAcQu`}
                              onChange={(e) => handleToggleApproval(c, "dpAcQu", e.target.checked)}
                              className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-emerald-600 focus:ring-emerald-500/20 cursor-pointer accent-emerald-600 transition-transform active:scale-90 disabled:opacity-50"
                            />
                          </label>
                        </div>
                      </td>

                      {/* 13. Reg (Tuyển dụng) */}
                      <td className="py-1.5 px-2 text-center">
                        <div className="flex items-center justify-center">
                          <label
                            className={`inline-flex items-center justify-center p-0.5 select-none ${
                              hasEmpno ? "cursor-not-allowed" : "cursor-pointer"
                            }`}
                            title={
                              hasEmpno
                                ? "Ứng viên đã có mã thẻ (new empno), không thể thay đổi trạng thái tuyển dụng"
                                : c.reg
                                ? "Đã Tuyển dụng (Bấm để hủy tuyển dụng)"
                                : "Chưa Tuyển dụng (Bấm để xác nhận tuyển dụng)"
                            }
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(c.reg)}
                              readOnly={hasEmpno}
                              disabled={updatingApprovalKey === `${c.id}-reg`}
                              onClick={(e) => {
                                if (hasEmpno) {
                                  e.preventDefault();
                                }
                              }}
                              onChange={(e) => {
                                if (hasEmpno) return;
                                handleToggleReg(c, e.target.checked);
                              }}
                              className={`w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-emerald-600 focus:ring-emerald-500/20 accent-emerald-600 transition-transform ${
                                hasEmpno
                                  ? "cursor-not-allowed"
                                  : "cursor-pointer active:scale-90"
                              }`}
                            />
                          </label>
                        </div>
                      </td>

                      {/* 15. Expected Date (Dự kiến Tuyển dụng) */}
                      <td className="py-1 px-2.5 text-xs">
                        {hasEmpno ? (
                          <div
                            className="inline-flex items-center gap-1.5 px-2 py-1 text-zinc-500 dark:text-zinc-400 cursor-not-allowed select-none"
                            title="Ứng viên đã có mã thẻ (new empno), không thể thay đổi ngày dự kiến"
                          >
                            <span className="tabular-nums font-medium text-xs">
                              {c.exEnDate && c.exEnDate !== "no" ? formatDate(c.exEnDate) : "-"}
                            </span>
                          </div>
                        ) : (
                          <div className="relative group/date inline-flex items-center gap-1.5 px-2 py-1 rounded bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer">
                            <span
                              className={`tabular-nums font-medium text-xs ${
                                c.exEnDate && c.exEnDate !== "no"
                                  ? "text-zinc-700 dark:text-zinc-300"
                                  : "text-zinc-400 dark:text-zinc-500 italic"
                              }`}
                            >
                              {c.exEnDate && c.exEnDate !== "no" ? formatDate(c.exEnDate) : t("selectDate")}
                            </span>
                            <Calendar className="w-3.5 h-3.5 text-zinc-400 group-hover/date:text-rose-500 transition-colors shrink-0" />
                            <input
                              type="date"
                              value={toInputDate(c.exEnDate)}
                              onClick={(e) => {
                                try {
                                  (e.currentTarget as any).showPicker?.();
                                } catch {}
                              }}
                              onChange={(e) => handleUpdateCandidateDate(c.id, "exEnDate", e.target.value)}
                              title="Bấm để chọn Ngày Dự Kiến"
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                            />
                            {c.exEnDate && c.exEnDate !== "no" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateCandidateDate(c.id, "exEnDate", "");
                                }}
                                title="Xóa ngày dự kiến"
                                className="opacity-0 group-hover/date:opacity-100 hover:text-rose-600 dark:hover:text-rose-400 text-zinc-400 p-0.5 z-20 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 16. Actually Date (Ngày vào làm thực tế) */}
                      <td className="py-1 px-2.5 text-xs">
                        {hasEmpno ? (
                          <div
                            className="inline-flex items-center gap-1.5 px-2 py-1 text-zinc-700 dark:text-zinc-300 cursor-not-allowed select-none"
                            title="Ứng viên đã có mã thẻ (new empno), không thể thay đổi ngày thực tế"
                          >
                            <span className="tabular-nums font-semibold text-xs">
                              {c.actEnDate && c.actEnDate !== "no" ? formatDate(c.actEnDate) : "-"}
                            </span>
                          </div>
                        ) : (
                          <div className="relative group/date inline-flex items-center gap-1.5 px-2 py-1 rounded bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer">
                            <span
                              className={`tabular-nums font-semibold text-xs ${
                                c.actEnDate && c.actEnDate !== "no"
                                  ? "text-zinc-900 dark:text-zinc-100"
                                  : "text-zinc-400 dark:text-zinc-500 italic"
                              }`}
                            >
                              {c.actEnDate && c.actEnDate !== "no" ? formatDate(c.actEnDate) : t("selectDate")}
                            </span>
                            <Calendar className="w-3.5 h-3.5 text-zinc-400 group-hover/date:text-emerald-500 transition-colors shrink-0" />
                            <input
                              type="date"
                              value={toInputDate(c.actEnDate)}
                              onClick={(e) => {
                                try {
                                  (e.currentTarget as any).showPicker?.();
                                } catch {}
                              }}
                              onChange={(e) => handleUpdateCandidateDate(c.id, "actEnDate", e.target.value)}
                              title="Bấm để chọn Ngày Vào Làm Thực Tế"
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                            />
                            {c.actEnDate && c.actEnDate !== "no" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateCandidateDate(c.id, "actEnDate", "");
                                }}
                                title="Xóa ngày thực tế"
                                className="opacity-0 group-hover/date:opacity-100 hover:text-rose-600 dark:hover:text-rose-400 text-zinc-400 p-0.5 z-20 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 16. Empno HRM */}
                      <td className="py-1.5 px-3 text-center">
                        {c.empno ? (
                          <span className="tabular-nums font-bold text-rose-600 dark:text-[#fb7185] bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-500/20 text-xs inline-block">
                            {c.empno}
                          </span>
                        ) : c.reg ? (
                          <button
                            onClick={() => handleOpenEmpnoModal(c)}
                            className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline px-1.5 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center gap-1 cursor-pointer transition-colors"
                            title="Bấm để cấp mã thẻ cho nhân viên đã nhận việc này"
                          >
                            <CreditCard className="w-3 h-3" /> Cấp mã
                          </button>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-600 text-xs">-</span>
                        )}
                      </td>

                      {/* 19. Note Details Button */}
                      <td className="py-1.5 px-2 text-center">
                        {c.notes ? (
                          <button
                            onClick={() => setNoteDialogCandidate(c)}
                            className="p-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            title="Xem chi tiết ghi chú"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-600">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Cockpit Action Bar & Pagination (Fidelity to pages/index.vue footer.prepend) */}
        <div className="border-t border-[#d8dce2] dark:border-[#26262C] bg-[#f1f3f6] dark:bg-[#121214] px-2.5 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs transition-colors duration-200">
          {/* Left Action Buttons matching legacy app */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Cấp mã thẻ mới (Set new empno) */}
            <button
              onClick={() => handleOpenEmpnoModal()}
              className={`h-7 px-3 rounded-md text-xs font-bold inline-flex items-center justify-center space-x-1.5 transition-colors duration-150 active:scale-[0.97] cursor-pointer shadow-xs ${
                selectedIds.length > 0
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-white dark:bg-[#222228] hover:bg-zinc-100 dark:hover:bg-[#2e2e38] text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-900/60"
              }`}
              title="Cấp mã thẻ cho nhân sự đã đến nhận việc thực tế (act_en_date) và cấn trừ Nhu cầu"
            >
              <CreditCard className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t("setEmpno", "Cấu hình MST")}</span>
            </button>

            {/* Xuất Excel toàn bộ (Export all data) */}
            <button
              onClick={handleExportAll}
              disabled={isExporting}
              className="h-7 px-3 rounded-md bg-white dark:bg-[#18181C] hover:bg-zinc-100 dark:hover:bg-[#222228] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-[#26262C] text-xs font-semibold inline-flex items-center justify-center space-x-1.5 transition-colors duration-150 active:scale-[0.97] disabled:opacity-60"
              title="Xuất toàn bộ dữ liệu đang lọc ra Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span>{t("exportAll", "Xuất tất cả dữ liệu")}</span>
            </button>

            {/* Xuất HRM (Export HRM standard file) */}
            <button
              onClick={handleExportHrm}
              disabled={isExporting}
              className="h-7 px-3 rounded-md bg-white dark:bg-[#18181C] hover:bg-zinc-100 dark:hover:bg-[#222228] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-[#26262C] text-xs font-semibold inline-flex items-center justify-center space-x-1.5 transition-colors duration-150 active:scale-[0.97] disabled:opacity-60"
              title="Xuất mẫu file HRM chuẩn HUM0020100A theo danh sách đang lọc"
            >
              <Download className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
              <span>{t("exportHRM", "Xuất HRM")}</span>
            </button>

            {/* Thẻ chưa quẹt BQT (Unswiped Card) */}
            <button
              onClick={handlePrintBqt}
              className="h-7 px-3 rounded-md bg-white dark:bg-[#18181C] hover:bg-zinc-100 dark:hover:bg-[#222228] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-[#26262C] text-xs font-semibold inline-flex items-center justify-center space-x-1.5 transition-colors duration-150 active:scale-[0.97]"
              title="In danh sách thẻ chưa quẹt BQT (HR02-SP001-11)"
            >
              <Printer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span>{t("unswipedCard", "In BQT")}</span>
            </button>

            {/* In DS Tuyển dụng (Print Hires) */}
            <button
              onClick={handlePrintHires}
              className="h-7 px-3 rounded-md bg-white dark:bg-[#18181C] hover:bg-zinc-100 dark:hover:bg-[#222228] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-[#26262C] text-xs font-semibold inline-flex items-center justify-center space-x-1.5 transition-colors duration-150 active:scale-[0.97]"
              title="In bảng theo dõi công nhân viên đến tuyển dụng"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              <span>{t("printHires", "In danh sách")}</span>
            </button>

            {/* Selected Count Indicator */}
            {selectedIds.length > 0 && (
              <span className="h-7 px-2.5 rounded-md font-bold text-xs text-rose-600 dark:text-[#fb7185] bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 inline-flex items-center justify-center">
                {t("selectedCount", "Đã chọn")} {selectedIds.length}
              </span>
            )}
          </div>

          {/* Right: Record Counter & Pagination Controls */}
          <div className="flex items-center space-x-3 text-zinc-500 dark:text-zinc-400 text-xs">
            <span className="hidden sm:inline">
              {t("showingCandidates", "Hiển thị")}{" "}
              <strong className="text-zinc-900 dark:text-white tabular-nums">
                {filteredCandidates.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
              </strong>
              {" - "}
              <strong className="text-zinc-900 dark:text-white tabular-nums">
                {Math.min(currentPage * pageSize, filteredCandidates.length)}
              </strong>
              {" / "}
              <strong className="text-zinc-900 dark:text-white tabular-nums">
                {filteredCandidates.length}
              </strong>
              {filteredCandidates.length !== candidates.length && (
                <span className="text-zinc-400 dark:text-zinc-500 ml-1">
                  ({t("total", "Tổng")} {candidates.length})
                </span>
              )}
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center space-x-1">
              <span className="text-[11px] text-zinc-500">{t("columnsCount", "cột") ? "" : "Cỡ:"}</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="h-7 px-2 text-xs tabular-nums rounded-md bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-[#26262C] text-zinc-800 dark:text-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500 inline-flex items-center justify-center cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={filteredCandidates.length || 1000}>{t("all", "Tất cả")} ({filteredCandidates.length})</option>
              </select>
            </div>

            {/* Pagination Prev / Next */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setPage(1)}
                disabled={currentPage <= 1}
                aria-label="Về trang đầu"
                title="Về trang đầu"
                className="h-7 px-1.5 rounded-md bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-[#26262C] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 inline-flex items-center justify-center transition-colors text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 active:scale-[0.97]"
              >
                «
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                aria-label="Trang trước"
                className="h-7 w-7 rounded-md bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-[#26262C] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 active:scale-[0.97]"
              >
                <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <span className="px-2 font-bold text-zinc-900 dark:text-zinc-200 tabular-nums text-xs">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                aria-label="Trang sau"
                className="h-7 w-7 rounded-md bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-[#26262C] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 active:scale-[0.97]"
              >
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={currentPage >= totalPages}
                aria-label="Đến trang cuối"
                title="Đến trang cuối"
                className="h-7 px-1.5 rounded-md bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-[#26262C] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 inline-flex items-center justify-center transition-colors text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 active:scale-[0.97]"
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Cấp Mã Thẻ Nhân Viên & Cấn Trừ Nhu Cầu (dialogSetEmpno) */}
      {assigningEmpno && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-empno-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 backdrop-blur-xs p-4 transition-opacity duration-150"
        >
          <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-xl bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-[#26262C] shadow-2xl overflow-hidden animate-modal-enter text-zinc-900 dark:text-[#F1F2F4]">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-[#26262C] bg-zinc-50 dark:bg-[#131316] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 id="modal-empno-title" className="text-sm font-bold text-zinc-900 dark:text-white">
                    Cấp Mã Thẻ Nhân Viên
                  </h3>
                 
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssigningEmpno(false)}
                className="h-7 w-7 rounded-md inline-flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-[#222228] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto custom-scrollbar space-y-4 text-xs">
              {/* Form Row: Date + Start Empno */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 dark:bg-[#131316] p-3.5 rounded-lg border border-zinc-200 dark:border-[#26262C]">
                {/* 1. Ngày vào làm thực tế */}
                <div>
                  <label htmlFor="modal-work-date" className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Ngày Nhận Việc Thực Tế <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="modal-work-date"
                    type="date"
                    value={actualWorkDate}
                    onChange={(e) => handleDateChangeInEmpnoModal(e.target.value)}
                    className="w-full h-8 rounded-md bg-white dark:bg-[#18181C] border border-zinc-300 dark:border-[#26262C] px-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-semibold tabular-nums"
                  />
                </div>

                {/* 2. Mã thẻ bắt đầu */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="modal-start-empno" className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      Mã Thẻ Bắt Đầu (HRM No.) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-200/70 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                      Chuẩn {factoryCardRule.label}: <strong className="text-rose-600 dark:text-rose-400 font-bold">{factoryCardRule.prefix}</strong>...
                    </span>
                  </div>
                  <input
                    id="modal-start-empno"
                    type="text"
                    value={customEmpno}
                    onChange={(e) => setCustomEmpno(e.target.value.toUpperCase())}
                    placeholder={`Ví dụ: ${factoryCardRule.example}`}
                    className={`w-full h-8 rounded-md bg-white dark:bg-[#18181C] border px-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none font-bold tabular-nums transition-colors ${
                      isPrefixMismatch
                        ? "border-amber-400 dark:border-amber-500 text-amber-600 dark:text-amber-400 focus:ring-1 focus:ring-amber-500"
                        : "border-zinc-300 dark:border-[#26262C] text-rose-600 dark:text-rose-400 focus:ring-1 focus:ring-rose-500"
                    }`}
                  />
                  {isPrefixMismatch ? (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mt-1">
                      ⚠️ Chú ý: Mã thẻ nhà máy {factoryCardRule.label} cần bắt đầu bằng &apos;{factoryCardRule.prefix}&apos;.
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400 block mt-1">
                      {factoryCardRule.hint}
                    </span>
                  )}
                </div>
              </div>

              {/* Preview Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-rose-500" />
                    Danh Sách Nhân Sự Dự Kiến Cấp Thẻ (
                    <strong className="text-rose-600 dark:text-rose-400">
                      {selectedCandidate ? 1 : selectedIds.length > 0 ? selectedIds.length : eligibleCandidatesForDate.length}
                    </strong>{" "}
                    người):
                  </span>
                  {empnoModalLoading && (
                    <span className="text-[11px] text-zinc-400 inline-flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin text-rose-500" /> Đang cập nhật...
                    </span>
                  )}
                </div>

                {/* Candidate Preview Table */}
                <div className="border border-zinc-200 dark:border-[#26262C] rounded-lg overflow-hidden max-h-64 overflow-y-auto custom-scrollbar">
                  {(() => {
                    const listToDisplay = selectedCandidate
                      ? [selectedCandidate]
                      : selectedIds.length > 0
                      ? candidates.filter((c) => selectedIds.includes(c.id))
                      : eligibleCandidatesForDate;

                    if (listToDisplay.length === 0) {
                      return (
                        <div className="py-8 text-center text-zinc-400 dark:text-zinc-500 space-y-1">
                          <AlertCircle className="w-6 h-6 mx-auto text-amber-500 opacity-80" />
                          <p className="font-semibold">Không tìm thấy ứng viên nào thỏa mãn điều kiện!</p>
                          <p className="text-[11px]">
                            Ngày vào làm thực tế <span className="font-bold tabular-nums text-zinc-700 dark:text-zinc-300">{formatDate(actualWorkDate)}</span> chưa có ứng viên nào được xác nhận nhận việc (<span className="text-emerald-500 font-semibold">reg = yes</span>) và chưa có thẻ.
                          </p>
                        </div>
                      );
                    }

                    const match = customEmpno.trim().match(/^([A-Za-z]*)(\d+)$/);
                    const prefix = match ? match[1].toUpperCase() : factoryCardRule.prefix === "A" ? "A" : "";
                    const rawNum = match
                      ? parseInt(match[2], 10)
                      : parseInt(customEmpno.replace(/\D/g, "") || "0", 10);
                    const digitLen = prefix ? 5 : 6;

                    return (
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="sticky top-0 bg-zinc-100 dark:bg-[#131316] border-b border-zinc-200 dark:border-[#26262C] text-[11px] text-zinc-600 dark:text-zinc-400 font-bold uppercase">
                          <tr>
                            <th className="py-2.5 px-4 text-center w-12">STT</th>
                            <th className="py-2.5 px-4">Họ và Tên</th>
                            <th className="py-2.5 px-4 text-center">Giới tính</th>
                            <th className="py-2.5 px-4">Mã Phiếu MPR (Demand)</th>
                            <th className="py-2.5 px-4">Bộ Phận / Đơn Vị</th>
                            <th className="py-2.5 px-4 text-center font-bold text-rose-600 dark:text-rose-400">
                              Mã Thẻ Sẽ Cấp
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-[#26262C] bg-white dark:bg-[#18181C]">
                          {listToDisplay.map((item: any, idx: number) => {
                            const generatedEmpno =
                              prefix + String(rawNum + idx).padStart(digitLen, "0");
                            const mpr = item.empDemandid || item.dm_id || "-";

                            return (
                              <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-[#202026] transition-colors">
                                <td className="py-2 px-4 text-center text-zinc-400 tabular-nums">{idx + 1}</td>
                                <td className="py-2 px-4 font-semibold text-zinc-900 dark:text-white">
                                  {item.candidateName}
                                </td>
                                <td className="py-2 px-4 text-center text-zinc-500">
                                  {String(item.gender) === "0" || String(item.gender).toLowerCase() === "nam"
                                    ? "Nam"
                                    : String(item.gender) === "1" || String(item.gender).toLowerCase() === "nữ"
                                    ? "Nữ"
                                    : item.gender || "-"}
                                </td>
                                <td className="py-2 px-4 font-mono text-[11px]">
                                  {mpr !== "-" ? (
                                    <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 font-bold">
                                      {mpr}
                                    </span>
                                  ) : (
                                    <span className="text-zinc-400 italic">Chưa gắn MPR</span>
                                  )}
                                </td>
                                <td className="py-2 px-4 text-zinc-700 dark:text-zinc-300 font-medium">
                                  {item.tmpDepartid || item.dept || "-"}
                                </td>
                                <td className="py-2 px-4 text-center font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                                  <span className="bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded border border-rose-200 dark:border-rose-900/60 inline-block font-mono tracking-wide">
                                    {generatedEmpno}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              </div>

              {/* Demand Reconciliation Notice */}
              <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Cơ chế cấn trừ tự động:</strong> Mỗi mã thẻ được cấp sẽ tự động tăng số lượng đã tuyển (<code className="font-bold text-emerald-700 dark:text-emerald-300">dem_recruited</code>), giảm số lượng còn thiếu (<code className="font-bold text-emerald-700 dark:text-emerald-300">stocknumber</code>), và tự động hoàn thành phiếu yêu cầu khi đủ định biên tuyển dụng.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-zinc-200 dark:border-[#26262C] bg-zinc-50 dark:bg-[#131316] flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Nhà máy: <strong className="uppercase font-bold text-zinc-800 dark:text-zinc-200">AW</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAssigningEmpno(false)}
                  disabled={empnoModalLoading}
                  className="h-8 px-3.5 rounded-md bg-white dark:bg-[#202026] hover:bg-zinc-100 dark:hover:bg-[#2a2a32] text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-[#2e2e38] transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleAssignEmpno}
                  disabled={empnoModalLoading}
                  className="h-8 px-4 rounded-md bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs inline-flex items-center justify-center space-x-1.5 transition-all duration-150 active:scale-[0.97] cursor-pointer disabled:opacity-50"
                >
                  {empnoModalLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang xử lý & cấn trừ...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Xác Nhận</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Detail Modal (Fidelity to pages/index.vue noteDialog) */}
      {noteDialogCandidate && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/60 backdrop-blur-xs p-4 transition-opacity duration-150"
        >
          <div className="w-full max-w-sm rounded-lg bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-[#26262C] p-4 shadow-2xl space-y-3 animate-modal-enter text-zinc-900 dark:text-[#F1F2F4]">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-[#26262C]">
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <span>Chi Tiết Ghi Chú Hồ Sơ</span>
              </h3>
              <div className="flex items-center space-x-1">
                {(["vi", "en", "cn"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setNoteLanguage(lang)}
                    className={`h-7 px-2 rounded-md text-[10px] font-bold uppercase inline-flex items-center justify-center transition-colors duration-150 active:scale-[0.97] ${
                      noteLanguage === lang
                        ? "bg-rose-600 text-white"
                        : "bg-zinc-100 dark:bg-[#222228] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
                <button
                  onClick={() => setNoteDialogCandidate(null)}
                  className="h-7 w-7 rounded-md inline-flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#222228] transition-colors ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-[#131316] p-2.5 rounded border border-zinc-200 dark:border-[#26262C]">
              <p className="font-semibold text-zinc-900 dark:text-white mb-1">
                {noteDialogCandidate.candidateName} (Mã thẻ: {noteDialogCandidate.empno || "Chưa cấp"}):
              </p>
              <p>{noteDialogCandidate.notes || "Không có ghi chú thêm."}</p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setNoteDialogCandidate(null)}
                className="h-7 px-3 rounded-md bg-zinc-100 dark:bg-[#222228] text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white inline-flex items-center justify-center transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox Preview Modal */}
      {previewPhotoCandidate && getCandidatePhotoUrl(previewPhotoCandidate) && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 backdrop-blur-xs p-4 animate-modal-enter"
        >
          <div className="relative max-w-xs w-full bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-[#26262C] rounded-lg p-3 text-center space-y-2.5 shadow-2xl">
            <button
              onClick={() => setPreviewPhotoCandidate(null)}
              className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white h-7 w-7 rounded-md bg-zinc-100 dark:bg-[#222228] hover:bg-zinc-200 dark:hover:bg-[#2e2e38] inline-flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white pt-1">
              {previewPhotoCandidate.candidateName}
            </h4>
            <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 tabular-nums">
              <span>CCCD: {previewPhotoCandidate.cccd || "-"}</span>
              {previewPhotoCandidate.empno && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">MST: {previewPhotoCandidate.empno}</span>
                </>
              )}
            </div>
            <div className="flex items-center justify-center p-2 bg-zinc-50 dark:bg-[#121214] rounded-md border border-zinc-200 dark:border-[#26262C]">
              <img
                src={getCandidatePhotoUrl(previewPhotoCandidate)!}
                alt={previewPhotoCandidate.candidateName}
                className="max-h-64 object-contain rounded"
              />
            </div>
            <button
              onClick={() => setPreviewPhotoCandidate(null)}
              className="w-full h-7 rounded-md bg-zinc-100 dark:bg-[#222228] hover:bg-zinc-200 dark:hover:bg-[#2e2e38] text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white font-semibold inline-flex items-center justify-center transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Update Reg (Tuyển dụng) */}
      {regConfirmCandidate && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-reg-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#18181c] border border-zinc-200/90 dark:border-zinc-800 shadow-2xl shadow-zinc-950/20 dark:shadow-black/60 overflow-hidden animate-modal-enter text-zinc-900 dark:text-zinc-100">
            {/* Top decorative gradient bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />

            <div className="p-5 sm:p-6 space-y-4">
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
                    <UserCheck className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 id="confirm-reg-title" className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                      Xác Nhận Tuyển Dụng
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setRegConfirmCandidate(null)}
                  className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Candidate Info Profile Cardlet */}
              <div className="rounded-xl bg-zinc-50 dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide truncate">
                        {regConfirmCandidate.candidateName}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                        CCCD: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{regConfirmCandidate.cccd || "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 text-[11px]">
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Bộ phận:</span>{" "}
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {regConfirmCandidate.applyDp || regConfirmCandidate.deptCode || regConfirmCandidate.dept || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">Vị trí:</span>{" "}
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {regConfirmCandidate.duty || "Worker"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Date pickers section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Thời gian vào làm</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const today = getTodayDateString();
                      setConfirmExDate(today);
                      setConfirmActDate(today);
                    }}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Expected date */}
                  <div>
                    <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                      Ngày dự kiến vào làm
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={confirmExDate}
                        onChange={(e) => setConfirmExDate(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#131316] text-zinc-900 dark:text-zinc-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 tabular-nums transition-colors shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Actual date */}
                  <div>
                    <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                      Ngày vào làm thực tế
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={confirmActDate}
                        onChange={(e) => setConfirmActDate(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#131316] text-zinc-900 dark:text-zinc-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 tabular-nums transition-colors shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setRegConfirmCandidate(null)}
                  className="h-9 px-4 rounded-xl bg-zinc-100 dark:bg-[#222228] hover:bg-zinc-200 dark:hover:bg-[#2c2c34] text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white inline-flex items-center justify-center active:scale-[0.97] transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isUpdatingReg}
                  onClick={handleConfirmReg}
                  className="h-9 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-sm shadow-emerald-700/30 inline-flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all disabled:opacity-60"
                >
                  {isUpdatingReg ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu…</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Xác Nhận Tuyển Dụng</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Modern App Dialog */}
      <AppDialog
        options={dialog}
        onClose={() => setDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex-1 flex items-center justify-center p-6 text-xs text-zinc-500 bg-[#eaedf0] dark:bg-[#121214]">
          <RefreshCw className="w-5 h-5 animate-spin text-rose-500 mr-2" /> Đang tải danh sách ứng viên…
        </div>
      }
    >
      <CandidatesContent />
    </Suspense>
  );
}
