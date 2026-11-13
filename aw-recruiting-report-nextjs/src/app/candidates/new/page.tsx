"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  UserPlus,
  ArrowLeft,
  Save,
  RotateCcw,
  Sparkles,
  Cpu,
  UserCheck,
  Building,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
  CheckCircle,
  Trash2,
  Briefcase,
  Layers,
  History,
  X,
  Plus,
  Search,
  Check,
  AlertTriangle,
  RefreshCw,
  Clock,
  Car,
  FileText,
  BadgeCheck,
  User,
  Shield,
  HelpCircle,
  Database,
  Edit,
  Globe,
  Loader2,
  QrCode,
} from "lucide-react";
import Link from "next/link";
import { useWebSerialScanner } from "@/hooks/useWebSerialScanner";
import { normalizeCccd, parseCccdQrData } from "@/lib/cccd-normalizer";
import { useTableExcelFilter } from "@/hooks/useTableExcelFilter";
import { ExcelColumnFilter } from "@/components/table/ExcelColumnFilter";
import { useSession } from "@/context/SessionContext";
import { useTranslation } from "@/hooks/useTranslation";
import { AppDialog, DialogOptions } from "@/components/ui/AppDialog";

// Master data lists matching legacy create-candidate.vue + companies.json
const COMP_RETURN_OPTIONS = [
  "CTY ETOP",
  "CTY TWINKLE",
  "CTY SUPERRIOR",
  "CTY DỆT TATONG",
  "CTY TONG HONG",
  "CTY MAY THẠNH MỸ",
  "CTY MAY VIỆT AN",
  "CTY MAY THÁI BÌNH DƯƠNG",
  "CTY MAY BẢO ĐÔ",
  "CTY BẠCH KIM",
  "CTY DỆT STAR FLEX",
  "CTY CLOCK & CLOCK",
  "CTY GIẤY SÀI GÒN",
  "CTY BAO BÌ ĐẠM PHÚ MỸ",
  "CTY BAO BÌ CHÂU THÀNH",
  "CTY NITORI",
  "CTY GIÀY CHANG CHUN",
  "CTY GIÀY CHUN IL",
  "CTY ĐIỆN TỬ CORETRONIC",
  "CTY ĐIỆN TỬ PAVONINE",
  "CTY DỆT MEISHENG",
  "CTY DỆT MAY MERRY",
  "CTY DỆT AJ SLUTION",
  "CTY DỆT MAY DAISAN",
  "CTY GIÀY UY VIỆT",
  "CTY GIÀY FULLXIN",
  "CTY NGÀNH GIÀY APEX",
  "CTY NÓN GREENTECH",
  "CTY ĐÔNG PHƯƠNG",
  "CTY VHG",
  "CTY NƯỚC GIẢI KHÁT WANNA",
  "CTY TNHH AIR KING",
  "CTY DỆT MAY DAEYOUN VINA",
  "CTY DỆT AOJIA VN",
  "CTY DỆT XINGCHEN",
  "CTY HONG IN VINA",
  "CTY TNHH NHÀ BẾP AMON VIỆT NAM",
  "CTY DỆT MAY SUH LIM VINA",
  "CTY TNHH COV VINA",
  "CTY TNHH WORLD TOP",
  "CTY DỆT MAY DONG IN",
  "CTY THIẾT BỊ Y TẾ A&T",
  "CTY GĂNG TAY NAM VIỆT",
  "CTY SANG FANG",
  "CTY THÉP VIỆT NHẬT",
  "CTY ỐNG THÉP SÀI GÒN",
  "CTY HÒA PHÁT",
  "CTY ỐNG NHỰA HOA SEN",
];

const DEFAULT_SOURCE_RECRUIT: HrmOptionItem[] = [
  { code: "1", name: "Giới thiệu nội bộ", name_vi: "Giới thiệu nội bộ" },
  { code: "17", name: "Facebook Tuyển dụng", name_vi: "Facebook Tuyển dụng" },
  { code: "2", name: "Chợ Tốt", name_vi: "Chợ Tốt" },
  { code: "3", name: "VietnamWorks", name_vi: "VietnamWorks" },
  { code: "4", name: "Ngày hội việc làm", name_vi: "Ngày hội việc làm" },
  { code: "5", name: "Tờ rơi / Băng rôn", name_vi: "Tờ rơi / Băng rôn" },
  { code: "6", name: "Cán bộ tuyển dụng trực tiếp", name_vi: "Cán bộ tuyển dụng trực tiếp" },
  { code: "99", name: "Khác", name_vi: "Khác" },
];

interface HrmOptionItem {
  code: string;
  name: string;
  name_vi?: string;
  name_en?: string;
  name_cn?: string;
  deptName?: string;
  div?: string;
  dept?: string;
}

interface HrmOptionsData {
  depts: HrmOptionItem[];
  positions: HrmOptionItem[];
  ranks: string[];
  levels: string[];
  parameters: string[];
  trials: number[];
  dantocs: HrmOptionItem[];
  married: HrmOptionItem[];
  directs?: HrmOptionItem[];
  provinces: HrmOptionItem[];
  nations: string[];
  nationalities: string[];
  countries?: Array<{ code: string; name: string }>;
  locApplies?: HrmOptionItem[];
  compReturns?: string[];
  codeMcs?: string[];
  locWorks?: string[];
  edus?: HrmOptionItem[];
  sources?: HrmOptionItem[];
}

interface CompactSwitchProps {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}

function CompactSwitch({ label, checked, onChange, disabled = false }: CompactSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`inline-flex items-center gap-2.5 select-none group focus:outline-none transition-opacity ${
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <div
        className={`w-9 h-5 rounded-full transition-colors duration-200 relative p-0.5 shrink-0 ${
          checked ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </div>
      <span
        className={`text-[13px] tracking-tight whitespace-nowrap transition-colors ${
          checked
            ? "text-zinc-900 dark:text-zinc-100 font-bold"
            : "text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-white font-semibold"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

interface OutlinedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  bgClassName?: string;
}

function OutlinedInput({
  label,
  required,
  bgClassName = "bg-white dark:bg-[#18181C]",
  className = "",
  ...props
}: OutlinedInputProps) {
  return (
    <div className="relative group w-full">
      <input
        {...props}
        className={`w-full h-[38px] rounded-md bg-white dark:bg-[#18181C] border border-zinc-300 dark:border-[#383842] hover:border-zinc-400 dark:hover:border-zinc-500 px-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors shadow-2xs ${className}`}
      />
      <label
        className={`absolute -top-2 left-2.5 px-1.5 ${bgClassName} text-[11px] font-bold text-zinc-700 dark:text-zinc-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors pointer-events-none whitespace-nowrap z-10 leading-none tracking-tight`}
      >
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
    </div>
  );
}

interface OutlinedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  required?: boolean;
  bgClassName?: string;
  children: React.ReactNode;
}

function OutlinedSelect({
  label,
  required,
  bgClassName = "bg-white dark:bg-[#18181C]",
  className = "",
  children,
  ...props
}: OutlinedSelectProps) {
  return (
    <div className="relative group w-full">
      <select
        {...props}
        className={`w-full h-[38px] rounded-md bg-white dark:bg-[#18181C] border border-zinc-300 dark:border-[#383842] hover:border-zinc-400 dark:hover:border-zinc-500 px-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors cursor-pointer shadow-2xs ${className}`}
      >
        {children}
      </select>
      <label
        className={`absolute -top-2 left-2.5 px-1.5 ${bgClassName} text-[11px] font-bold text-zinc-700 dark:text-zinc-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors pointer-events-none whitespace-nowrap z-10 leading-none tracking-tight`}
      >
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
    </div>
  );
}

interface OutlinedBoxProps {
  label: string;
  required?: boolean;
  bgClassName?: string;
  className?: string;
  children: React.ReactNode;
}

function OutlinedBox({
  label,
  required,
  bgClassName = "bg-white dark:bg-[#18181C]",
  className = "",
  children,
}: OutlinedBoxProps) {
  return (
    <div className="relative group w-full">
      <div
        className={`w-full h-[38px] rounded-md bg-white dark:bg-[#18181C] border border-zinc-300 dark:border-[#383842] hover:border-zinc-400 dark:hover:border-zinc-500 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-colors flex items-center shadow-2xs ${className}`}
      >
        {children}
      </div>
      <label
        className={`absolute -top-2 left-2.5 px-1.5 ${bgClassName} text-[11px] font-bold text-zinc-700 dark:text-zinc-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors pointer-events-none whitespace-nowrap z-10 leading-none tracking-tight`}
      >
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
    </div>
  );
}

function CandidateFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, selectedFactory, currentLocale } = useSession();
  const { t } = useTranslation();
  const candidateId = searchParams.get("id");
  const initialCccd = searchParams.get("cccd") || "";
  const isEditing = Boolean(candidateId);

  // Helper hiển thị tên vị trí ứng tuyển theo ngôn ngữ giao diện (vi, en, cn)
  const getLocApplyDisplayName = (la: HrmOptionItem | string) => {
    if (typeof la === "string") {
      const found = hrmOptions.locApplies?.find((item) => item.code === la);
      if (found) {
        if (currentLocale === "en" && found.name_en) return found.name_en;
        if (currentLocale === "cn" && found.name_cn) return found.name_cn;
        return found.name_vi || found.name;
      }
      return la;
    }
    if (currentLocale === "en" && la.name_en) return la.name_en;
    if (currentLocale === "cn" && la.name_cn) return la.name_cn;
    return la.name_vi || la.name || la.code;
  };

  // Helper hiển thị tên nguồn tuyển dụng theo ngôn ngữ giao diện (vi, en, cn)
  const getSourceDisplayName = (s: HrmOptionItem | string) => {
    if (!s) return "";
    if (typeof s === "string") {
      const found = sourcesList.find((item) => {
        if (!item) return false;
        if (typeof item === "string") return item === s;
        return (
          item.code === s ||
          item.name === s ||
          item.name_vi === s ||
          item.name_en === s ||
          item.name_cn === s
        );
      });
      if (found && typeof found !== "string") {
        if (currentLocale === "en" && found.name_en) return found.name_en;
        if (currentLocale === "cn" && found.name_cn) return found.name_cn;
        return found.name_vi || found.name || found.code;
      }
      return s;
    }
    if (currentLocale === "en" && s.name_en) return s.name_en;
    if (currentLocale === "cn" && s.name_cn) return s.name_cn;
    return s.name_vi || s.name || s.code || "";
  };

  // Form State matching legacy pages/create-candidate.vue fields 1-to-1
  const [form, setForm] = useState({
    // Section 1: Thông tin cá nhân
    cccd: initialCccd,
    selectedDatecccd: "",
    name: "",
    dateBirth: "",
    gender: "0",
    address: "",
    sub_address: "",
    tel: "",
    sub_tel: "",
    email: "",

    // Section 2: Thông tin nhu cầu tuyển dụng
    loc: "aw",
    dept_apply: "",
    loc_apply: "Worker",
    dm_id: "",
    dm_Subpos: "",

    // Section 3: Thông tin tuyển dụng & Đánh giá phỏng vấn
    source_recruit: "",
    date_cv: "",
    date_salary: "",
    inVG: "",
    empno_old: "",
    comp_return: "",
    remark: "",
    date_hr_inter: new Date().toISOString().split("T")[0],
    date_hr_review: new Date().toISOString().split("T")[0],
    hrAcc: "no",
    date_dept_inter: "",
    date_dept_review: "",
    deptACC: "no",
    inDateWork: "",
    inDateAccWork: "",
    inWorker: "no",
    change_date: "",

    // Section 4: Thông tin nhân sự HRM
    edu: "",
    school_gra: "",
    empno_hrm: "",
    newDept: "",
    position: "",
    deputy: "",
    level: "",
    parameters: "",
    time_trial: "" as unknown as number,
    code_mc: "SCS006",
    loc_work: "AW",
    direct: "",
    tmp_categoryid: "00001",
    dantoc: "A",
    married: "0",
    nation: "VN",
    nationality: "Việt Nam",
    birth_province: "H10",
    province: "H10",
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [checkingHistory, setCheckingHistory] = useState(false);
  const [historyResult, setHistoryResult] = useState<any | null>(null);
  const [resignData, setResignData] = useState<any[]>([]);
  const [blacklistAlert, setBlacklistAlert] = useState<{ reasons: string[] } | null>(null);
  const [loadingResignData, setLoadingResignData] = useState(false);
  const [selectedFullNote, setSelectedFullNote] = useState<string | null>(null);

  // Dynamic lists
  const [sourcesList, setSourcesList] = useState<HrmOptionItem[]>(DEFAULT_SOURCE_RECRUIT);
  const [demandList, setDemandList] = useState<any[]>([]);
  const [demandSearch, setDemandSearch] = useState<string>("");
  const [departmentDivs, setDepartmentDivs] = useState<
    Array<{ div: string; name: string; label: string }>
  >([]);
  // Lọc chỉ nhu cầu còn thiếu > 0 (mặc định bật)
  const [onlyRemainingDemand, setOnlyRemainingDemand] = useState<boolean>(true);

  // Dynamic HRM options loaded from Database (Card 4)
  const [hrmOptions, setHrmOptions] = useState<HrmOptionsData>({
    depts: [],
    positions: [],
    ranks: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09"],
    levels: [],
    parameters: ["A01", "A02", "CN01", "CN02", "CN03", "TW-VN"],
    trials: [6, 30, 60],
    dantocs: [],
    married: [
      { code: "0", name: "Độc thân", name_vi: "Độc thân", name_en: "Single", name_cn: "未婚" },
      { code: "1", name: "Đã kết hôn", name_vi: "Đã kết hôn", name_en: "Married", name_cn: "已婚" },
    ],
    directs: [
      { code: "0", name: "Trực tiếp", name_vi: "Trực tiếp", name_en: "Direct", name_cn: "直接" },
      { code: "1", name: "Gián tiếp", name_vi: "Gián tiếp", name_en: "Indirect", name_cn: "間接" },
      { code: "3", name: "Bán trực tiếp", name_vi: "Bán trực tiếp", name_en: "Semi-direct", name_cn: "半直接" },
    ],
    provinces: [],
    nations: ["CA", "CN", "DE", "ES", "FR", "IN", "JP", "KH", "MA", "MM", "PH", "SG", "TW", "US", "VN"],
    nationalities: [
      "Việt Nam",
      "Canada",
      "China",
      "Germany",
      "Spain",
      "France",
      "India",
      "Japan",
      "Cambodia",
      "Morocco",
      "Myanmar",
      "Philippines",
      "Singapore",
      "Taiwan",
      "United States",
      "Vietnam",
    ],
    countries: [],
    locApplies: [],
    compReturns: COMP_RETURN_OPTIONS,
    codeMcs: ["SCS006"],
    locWorks: ["AW"],
    edus: [],
    sources: [],
  });
  const [loadingHrmOptions, setLoadingHrmOptions] = useState(true);

  // Dialog states
  const [demandModalOpen, setDemandModalOpen] = useState(false);
  const [resignModalOpen, setResignModalOpen] = useState(false);
  const [newSourceModalOpen, setNewSourceModalOpen] = useState(false);
  const [newSourceVI, setNewSourceVI] = useState("");
  const [newSourceEN, setNewSourceEN] = useState("");
  const [newSourceCN, setNewSourceCN] = useState("");
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [savingNewSource, setSavingNewSource] = useState(false);
  const [sourceMessage, setSourceMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // QR CCCD Scanner Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrModalInput, setQrModalInput] = useState("");
  const qrInputRef = useRef<HTMLTextAreaElement | null>(null);
  // Hidden Background Receiver for USB Barcode / QR Scanner (MC-9103)
  const hiddenScannerRef = useRef<HTMLTextAreaElement | null>(null);

  // Modern AppDialog State
  const [dialog, setDialog] = useState<DialogOptions>({
    isOpen: false,
    title: "",
    message: "",
  });

  // Ref chuyển tiếp hàm xử lý quét QR CCCD
  const handleApplyScannedCccdRef = useRef<(raw: string) => boolean>(() => false);

  // Hook Web Serial Scanner tự động điền form
  const { isConnected, connect, disconnect } = useWebSerialScanner({
    onScan: (raw) => {
      if (raw) {
        setQrModalInput(raw);
        const ok = handleApplyScannedCccdRef.current(raw);
        if (ok) {
          setQrModalOpen(false);
          setQrModalInput("");
        }
      }
    },
  });

  // Load master data options from Database for Card 4
  useEffect(() => {
    let isMounted = true;
    fetch("/api/candidates/hrm-options", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        if (isMounted && res.success && res.data) {
          const loadedData = res.data;
          if (loadedData.departments && (!loadedData.depts || loadedData.depts.length === 0)) {
            loadedData.depts = loadedData.departments.map((d: any) => ({
              code: d.unit || d.deptCode || d.div,
              name: d.deptName || d.name,
              name_vi: d.nameObj?.vi || d.deptName || d.name,
              name_en: d.nameObj?.en || d.deptName || d.name,
              name_cn: d.nameObj?.cn || d.deptName || d.name,
              deptName: d.deptName || d.name,
              div: d.div,
              dept: d.dept,
            }));
          }
          setHrmOptions((prev) => ({ ...prev, ...loadedData }));
          if (loadedData.sources && Array.isArray(loadedData.sources) && loadedData.sources.length > 0) {
            setSourcesList(loadedData.sources);
          } else if (loadedData.sourceRecruits && Array.isArray(loadedData.sourceRecruits) && loadedData.sourceRecruits.length > 0) {
            setSourcesList(loadedData.sourceRecruits);
          }
          setLoadingHrmOptions(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load HRM options from DB:", err);
        if (isMounted) setLoadingHrmOptions(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Tự động chuẩn hóa form.source_recruit sang mã code nếu nhận giá trị là tên tiếng Việt/Anh/Trung
  useEffect(() => {
    if (form.source_recruit && sourcesList.length > 0) {
      const val = String(form.source_recruit).trim().toLowerCase();
      const match = sourcesList.find((s) => {
        if (!s) return false;
        if (typeof s === "string") return String(s).toLowerCase() === val;
        const code = String(s.code || "").toLowerCase();
        const name = String(s.name || "").toLowerCase();
        const nameVi = String(s.name_vi || "").toLowerCase();
        const nameEn = String(s.name_en || "").toLowerCase();
        const nameCn = String(s.name_cn || "").toLowerCase();
        return (
          (code && code === val) ||
          (name && name === val) ||
          (nameVi && nameVi === val) ||
          (nameEn && nameEn === val) ||
          (nameCn && nameCn === val) ||
          (val.includes("facebook") && name.includes("facebook"))
        );
      });
      if (match && typeof match !== "string" && match.code && form.source_recruit !== match.code) {
        setForm((prev) => ({ ...prev, source_recruit: match.code }));
      }
    }
  }, [sourcesList, form.source_recruit]);

  // Tự động chuẩn hóa form.position sang mã duty_no nếu nhận giá trị là tên tiếng Việt
  useEffect(() => {
    if (form.position && hrmOptions.positions.length > 0) {
      const match = hrmOptions.positions.find(
        (p) => p.name.toLowerCase() === form.position.toLowerCase()
      );
      if (match && form.position !== match.code) {
        setForm((prev) => ({ ...prev, position: match.code }));
      }
    }
  }, [hrmOptions.positions, form.position]);

  // Tự động chuẩn hóa form.dantoc sang mã nation_code nếu nhận giá trị là tên tiếng Việt
  useEffect(() => {
    if (form.dantoc && hrmOptions.dantocs.length > 0) {
      const match = hrmOptions.dantocs.find(
        (dt) => dt.name.toLowerCase() === form.dantoc.toLowerCase()
      );
      if (match && form.dantoc !== match.code) {
        setForm((prev) => ({ ...prev, dantoc: match.code }));
      }
    }
  }, [hrmOptions.dantocs, form.dantoc]);

  // Tự động chuẩn hóa form.married sang mã code nếu nhận giá trị là tên tiếng Việt
  useEffect(() => {
    if (form.married && hrmOptions.married.length > 0) {
      const match = hrmOptions.married.find(
        (m) =>
          m.code.toLowerCase() === form.married.toLowerCase() ||
          m.name.toLowerCase() === form.married.toLowerCase()
      );
      if (match && form.married !== match.code) {
        setForm((prev) => ({ ...prev, married: match.code }));
      }
    }
  }, [hrmOptions.married, form.married]);

  // Tự động chuẩn hóa form.birth_province sang mã province_no nếu nhận giá trị là tên tiếng Việt
  useEffect(() => {
    if (form.birth_province && hrmOptions.provinces.length > 0) {
      const match = hrmOptions.provinces.find(
        (p) =>
          p.code.toLowerCase() === form.birth_province.toLowerCase() ||
          p.name.toLowerCase() === form.birth_province.toLowerCase()
      );
      if (match && form.birth_province !== match.code) {
        setForm((prev) => ({ ...prev, birth_province: match.code }));
      }
    }
  }, [hrmOptions.provinces, form.birth_province]);

  // Tự động chuẩn hóa form.province sang mã province_no nếu nhận giá trị là tên tiếng Việt
  useEffect(() => {
    if (form.province && hrmOptions.provinces.length > 0) {
      const match = hrmOptions.provinces.find(
        (p) =>
          p.code.toLowerCase() === form.province.toLowerCase() ||
          p.name.toLowerCase() === form.province.toLowerCase()
      );
      if (match && form.province !== match.code) {
        setForm((prev) => ({ ...prev, province: match.code }));
      }
    }
  }, [hrmOptions.provinces, form.province]);

  // Tự động chuẩn hóa form.edu sang mã edu_no nếu nhận giá trị là tên tiếng Việt
  useEffect(() => {
    if (form.edu && hrmOptions.edus && hrmOptions.edus.length > 0) {
      const match = hrmOptions.edus.find(
        (e) =>
          e.code === form.edu ||
          e.name.toLowerCase() === form.edu.toLowerCase() ||
          (form.edu === "THPT" && (e.code === "004" || e.name.includes("12"))) ||
          (form.edu === "THCS" && (e.code === "002" || e.name.includes("THCS"))) ||
          (form.edu === "Tiểu học" && (e.code === "001" || e.name.includes("Tiểu học"))) ||
          (form.edu === "Cao đẳng" && (e.code === "007" || e.name.includes("Cao đẳng"))) ||
          (form.edu === "Đại học" && (e.code === "008" || e.name.includes("Đại Học"))) ||
          (form.edu === "Sau đại học" && (e.code === "009" || e.name.includes("Thạc Sĩ"))) ||
          (form.edu === "Trung cấp" && (e.code === "006" || e.name.includes("Trung học CN")))
      );
      if (match && form.edu !== match.code) {
        setForm((prev) => ({ ...prev, edu: match.code }));
      }
    }
  }, [hrmOptions.edus, form.edu]);

  // Tự động chuẩn hóa form.loc_apply sang mã code chuẩn nếu nhận giá trị là tên tiếng Việt / Trung
  useEffect(() => {
    if (form.loc_apply && hrmOptions.locApplies && hrmOptions.locApplies.length > 0) {
      const match = hrmOptions.locApplies.find(
        (la) =>
          la.code.toLowerCase() === form.loc_apply.toLowerCase() ||
          la.name.toLowerCase() === form.loc_apply.toLowerCase() ||
          la.name_vi?.toLowerCase() === form.loc_apply.toLowerCase() ||
          la.name_en?.toLowerCase() === form.loc_apply.toLowerCase() ||
          la.name_cn?.toLowerCase() === form.loc_apply.toLowerCase()
      );
      if (match && form.loc_apply !== match.code) {
        setForm((prev) => ({ ...prev, loc_apply: match.code }));
      }
    }
  }, [hrmOptions.locApplies, form.loc_apply]);

  // Load existing candidate if editing
  useEffect(() => {
    if (candidateId) {
      fetch(`/api/candidates?id=${candidateId}`)
        .then((r) => r.json())
        .then((res) => {
          const item =
            res.candidate ||
            (res.data && res.data.find((c: any) => String(c.id) === String(candidateId)));
          if (item) {
            if (item.status === "0") {
              setDialog({
                isOpen: true,
                type: "warning",
                title: "Hồ Sơ Đã Bị Xóa",
                message: "Hồ sơ ứng viên này đã bị xóa hoặc không còn hoạt động trong hệ thống (trạng thái: 0).",
                confirmText: "Về danh sách",
                showCancel: false,
                onConfirm: () => router.push("/candidates"),
              });
              return;
            }
            let parsedNotes: any = {};
            const rawNote = item.notes || item.note || item.remark;
            if (rawNote && typeof rawNote === "string" && rawNote.trim().startsWith("{")) {
              try {
                parsedNotes = JSON.parse(rawNote);
              } catch (e) {
                // not json
              }
            }

            const cleanFlagDate = (val?: string | null) =>
              val && val !== "no" && val !== "null" ? String(val).split("T")[0] : "";

            setForm((prev) => ({
              ...prev,
              ...parsedNotes,
              name: item.candidateName || parsedNotes.name || prev.name,
              cccd: item.empId || item.cccd || parsedNotes.cccd || prev.cccd,
              selectedDatecccd: cleanFlagDate(item.selectedDatecccd || item.datecccd) || parsedNotes.selectedDatecccd || prev.selectedDatecccd,
              dateBirth: cleanFlagDate(item.dateOfBirth) || parsedNotes.dateBirth || prev.dateBirth,
              gender:
                item.gender === "1" || item.gender === "Nữ"
                  ? "1"
                  : item.gender === "0" || item.gender === "Nam"
                  ? "0"
                  : parsedNotes.gender === "Nữ" || parsedNotes.gender === "1"
                  ? "1"
                  : "0",
              tel: item.regTel || item.phone || parsedNotes.tel || prev.tel,
              sub_tel: item.commTel || item.sub_tel || parsedNotes.sub_tel || prev.sub_tel,
              address: item.regAddress || item.addressPermanent || parsedNotes.address || prev.address,
              sub_address: item.commAddress || item.addressTemporary || parsedNotes.sub_address || prev.sub_address,
              email: item.email || parsedNotes.email || prev.email,
              dept_apply: item.applyDp || item.deptCode || item.dept || parsedNotes.dept_apply || prev.dept_apply,
              loc_apply: item.position || item.duty || parsedNotes.loc_apply || prev.loc_apply,
              loc: "aw",
              dm_id: item.empDemandid || item.dm_id || parsedNotes.dm_id || prev.dm_id,
              dm_Subpos: item.subPosition || item.dm_Subpos || parsedNotes.dm_Subpos || prev.dm_Subpos,
              edu: item.edu || parsedNotes.edu || prev.edu,
              school_gra: item.school || item.school_gra || parsedNotes.school_gra || prev.school_gra,
              source_recruit:
                item.recruSource && item.recruSource !== "no"
                  ? item.recruSource
                  : item.source_recruit || parsedNotes.source_recruit || prev.source_recruit,
              comp_return: item.reVgFrom || item.comp_return || parsedNotes.comp_return || prev.comp_return,
              empno_old: item.oldEmpno || item.empno_old || parsedNotes.empno_old || prev.empno_old,
              inVG: item.vgWorkTimes || item.inVG || parsedNotes.inVG || prev.inVG,
              remark:
                item.note && !String(item.note).trim().startsWith("{")
                  ? item.note
                  : item.remark || parsedNotes.remark || prev.remark,
              date_cv: cleanFlagDate(item.cvReceivedAt || item.date_cv) || parsedNotes.date_cv || prev.date_cv,
              date_salary: cleanFlagDate(item.salarySignedAt || item.date_salary) || parsedNotes.date_salary || prev.date_salary,
              date_hr_inter: cleanFlagDate(item.hrIvDate || item.date_hr_inter) || parsedNotes.date_hr_inter || prev.date_hr_inter,
              date_hr_review: cleanFlagDate(item.hrAcDate || item.date_hr_review) || parsedNotes.date_hr_review || prev.date_hr_review,
              hrAcc: item.hrAcQu === "yes" || item.hrAcQu === true ? "yes" : (parsedNotes.hrAcc || "no"),
              date_dept_inter: cleanFlagDate(item.dpIvDate || item.date_dept_inter) || parsedNotes.date_dept_inter || prev.date_dept_inter,
              date_dept_review: cleanFlagDate(item.dpAcDate || item.date_dept_review) || parsedNotes.date_dept_review || prev.date_dept_review,
              deptACC: item.dpAcQu === "yes" || item.dpAcQu === true ? "yes" : (parsedNotes.deptACC || "no"),
              inDateWork: cleanFlagDate(item.exEnDate || item.inDateWork) || parsedNotes.inDateWork || prev.inDateWork,
              inDateAccWork: cleanFlagDate(item.actEnDate || item.inDateAccWork) || parsedNotes.inDateAccWork || prev.inDateAccWork,
              inWorker: item.reg === "yes" || item.reg === true ? "yes" : (parsedNotes.inWorker || "no"),
              change_date: cleanFlagDate(item.changeEnDate || item.change_date) || parsedNotes.change_date || prev.change_date,
              empno_hrm: item.newEmpno || item.empno_hrm || item.empno || parsedNotes.empno_hrm || prev.empno_hrm,
              newDept: item.tmpDepartid || item.newDept || parsedNotes.newDept || prev.newDept,
              position: item.tmpDutyid || item.position_hrm || parsedNotes.position || prev.position,
              deputy: item.tmpRankid || item.deputy || parsedNotes.deputy || prev.deputy,
              level: item.tmpLevelid || item.level || parsedNotes.level || prev.level,
              parameters: item.tmpIdyclass || item.parameters || parsedNotes.parameters || prev.parameters,
              time_trial:
                item.probation !== undefined && item.probation !== null && item.probation !== ""
                  ? item.probation
                  : item.time_trial !== undefined
                  ? item.time_trial
                  : parsedNotes.time_trial !== undefined
                  ? parsedNotes.time_trial
                  : prev.time_trial,
              code_mc: item.tmpSiteid || item.code_mc || parsedNotes.code_mc || prev.code_mc,
              loc_work: item.tmpWorkareaid || item.loc_work || parsedNotes.loc_work || prev.loc_work,
              direct: item.isdirect ?? item.direct ?? parsedNotes.direct ?? prev.direct,
              tmp_categoryid: item.tmpCategoryid || item.tmp_categoryid || parsedNotes.tmp_categoryid || prev.tmp_categoryid,
              dantoc: item.ethnic || item.dantoc || parsedNotes.dantoc || prev.dantoc,
              married: item.marrage ?? item.married ?? parsedNotes.married ?? prev.married,
              nation: item.national || item.nation || parsedNotes.nation || prev.nation,
              nationality: item.countryid || item.nationality || parsedNotes.nationality || prev.nationality,
              birth_province: item.birthProvince || item.birth_province || parsedNotes.birth_province || prev.birth_province,
              province: item.province || parsedNotes.province || prev.province,
            }));

            const cccdForHistory = item.empId || item.cccd;
            if (cccdForHistory) {
              handleCheckHistory(cccdForHistory);
            }
          }
        })
        .catch(console.error);
    }
  }, [candidateId]);

const FALLBACK_DEMANDS = [
  { id: 1, mprId: 1042, id_code: "HR-MPR00-1042", loc: "aw", dem_unit: "VAW1PD01", dept: "Xưởng May 1", dem_unit_name: "Xưởng May 1", duty: "Worker", dem_position: "Worker", dem_sub_position: "-", demandQty: 200, dem_amount: 200, recruitedQty: 185, dem_recruited: 185, stocknumber: 15 },
  { id: 2, mprId: 1043, id_code: "HR-MPR00-1043", loc: "aw", dem_unit: "VAW1PD02", dept: "Xưởng May 2", dem_unit_name: "Xưởng May 2", duty: "Worker", dem_position: "Worker", dem_sub_position: "-", demandQty: 180, dem_amount: 180, recruitedQty: 140, dem_recruited: 140, stocknumber: 40 },
  { id: 3, mprId: 1044, id_code: "HR-MPR00-1044", loc: "aw", dem_unit: "VAW1PD03", dept: "Xưởng Cắt", dem_unit_name: "Xưởng Cắt", duty: "Staff", dem_position: "Staff", dem_sub_position: "-", demandQty: 50, dem_amount: 50, recruitedQty: 45, dem_recruited: 45, stocknumber: 5 },
  { id: 4, mprId: 1045, id_code: "HR-MPR00-1045", loc: "aw", dem_unit: "VAW1PD04", dept: "Xưởng Cao Su", dem_unit_name: "Xưởng Cao Su", duty: "Worker", dem_position: "Worker", dem_sub_position: "-", demandQty: 60, dem_amount: 60, recruitedQty: 32, dem_recruited: 32, stocknumber: 28 },
  { id: 5, mprId: 1046, id_code: "HR-MPR00-1046", loc: "aw", dem_unit: "VAW1PD05", dept: "Xưởng Hoàn Thiện", dem_unit_name: "Xưởng Hoàn Thiện", duty: "Worker", dem_position: "Worker", dem_sub_position: "-", demandQty: 110, dem_amount: 110, recruitedQty: 90, dem_recruited: 90, stocknumber: 20 },
  { id: 6, mprId: 1047, id_code: "HR-MPR00-1047", loc: "aw", dem_unit: "VAW1QC01", dept: "Bộ phận QC", dem_unit_name: "Bộ phận QC", duty: "Leader", dem_position: "Leader", dem_sub_position: "-", demandQty: 40, dem_amount: 40, recruitedQty: 35, dem_recruited: 35, stocknumber: 5 },
  { id: 7, mprId: 1048, id_code: "HR-MPR00-1048", loc: "aw", dem_unit: "VAW1EN01", dept: "Phòng Kỹ Thuật", dem_unit_name: "Phòng Kỹ Thuật", duty: "Engineer", dem_position: "Engineer", dem_sub_position: "-", demandQty: 15, dem_amount: 15, recruitedQty: 12, dem_recruited: 12, stocknumber: 3 },
  { id: 8, mprId: 1049, id_code: "HR-MPR00-1049", loc: "aw", dem_unit: "VAW0AD01", dept: "Phòng Hành Chính Nhân Sự", dem_unit_name: "Phòng Hành Chính Nhân Sự", duty: "Staff (lang)", dem_position: "Staff (lang)", dem_sub_position: "-", demandQty: 10, dem_amount: 10, recruitedQty: 8, dem_recruited: 8, stocknumber: 2 },
];

  // Load demands for demand picker
  useEffect(() => {
    fetch("/api/demand")
      .then((r) => r.json())
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setDemandList(res.data);
        } else {
          setDemandList(FALLBACK_DEMANDS);
        }
      })
      .catch(() => {
        setDemandList(FALLBACK_DEMANDS);
      });
  }, []);

  // Load department divisions from department_code (column div)
  useEffect(() => {
    fetch("/api/depts?type=divs")
      .then((r) => r.json())
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const normalizedDivs = res.data
            .map((d: any) => {
              const divCode = String(d?.div || d?.code || d?.name || "").trim();
              if (!divCode) return null;
              return {
                div: divCode,
                name: String(d?.name || divCode),
                label: String(d?.label || divCode),
              };
            })
            .filter(Boolean) as Array<{ div: string; name: string; label: string }>;
          setDepartmentDivs(normalizedDivs);
        }
      })
      .catch(console.error);
  }, []);

  // Dynamic options for loc_apply that includes database list + all positions from demands + current value
  const locApplyOptions = useMemo(() => {
    const list: HrmOptionItem[] = [];
    const codeSet = new Set<string>();

    const baseList: HrmOptionItem[] =
      hrmOptions.locApplies && hrmOptions.locApplies.length > 0
        ? hrmOptions.locApplies
        : [
            { code: "Worker", name: "Công nhân", name_vi: "Công nhân", name_en: "Worker", name_cn: "工人" },
            { code: "Staff", name: "Nhân viên", name_vi: "Nhân viên", name_en: "Staff", name_cn: "職員" },
            { code: "Staff (lang)", name: "Nhân viên ngoại ngữ", name_vi: "Nhân viên ngoại ngữ", name_en: "Staff (lang)", name_cn: "外語職員" },
            { code: "Leader", name: "Chuyền trưởng / Tổ trưởng", name_vi: "Chuyền trưởng / Tổ trưởng", name_en: "Leader", name_cn: "組長" },
            { code: "Translator", name: "Phiên dịch viên", name_vi: "Phiên dịch viên", name_en: "Translator", name_cn: "翻譯" },
            { code: "Engineer", name: "Kỹ sư", name_vi: "Kỹ sư", name_en: "Engineer", name_cn: "工程師" },
          ];

    baseList.forEach((item) => {
      if (!codeSet.has(item.code)) {
        codeSet.add(item.code);
        list.push(item);
      }
    });

    if (form.loc_apply && !codeSet.has(form.loc_apply)) {
      codeSet.add(form.loc_apply);
      list.push({
        code: form.loc_apply,
        name: form.loc_apply,
        name_vi: form.loc_apply,
        name_en: form.loc_apply,
        name_cn: form.loc_apply,
      });
    }

    demandList.forEach((d) => {
      const pos = d.dem_position || d.duty;
      if (pos && pos !== "-" && !codeSet.has(pos)) {
        codeSet.add(pos);
        list.push({
          code: pos,
          name: pos,
          name_vi: pos,
          name_en: pos,
          name_cn: pos,
        });
      }
    });

    return list;
  }, [hrmOptions.locApplies, form.loc_apply, demandList]);

  // Trạng thái hiển thị toàn bộ bộ phận HRM (bỏ qua lọc theo BP ứng tuyển)
  const [showAllHrmDepts, setShowAllHrmDepts] = useState(false);

  // Danh sách Bộ phận HRM phụ thuộc theo Bộ phận ứng tuyển (form.dept_apply)
  const filteredHrmDepts = useMemo(() => {
    if (showAllHrmDepts || !form.dept_apply) {
      return hrmOptions.depts;
    }
    const target = form.dept_apply.trim().toLowerCase();
    const matched = hrmOptions.depts.filter((d) => {
      const div = (d.div || "").trim().toLowerCase();
      const code = (d.code || "").trim().toLowerCase();
      const dept = (d.dept || "").trim().toLowerCase();
      return div === target || code === target || code.startsWith(target) || dept === target;
    });
    return matched.length > 0 ? matched : hrmOptions.depts;
  }, [hrmOptions.depts, form.dept_apply, showAllHrmDepts]);

  // Handler khi người dùng đổi Bộ phận ứng tuyển -> tự động lọc và gợi ý Bộ phận HRM tương ứng
  const handleDeptApplyChange = (newDeptApply: string) => {
    const target = newDeptApply.trim().toLowerCase();
    setShowAllHrmDepts(false);

    let suggestedDept = "";
    if (target) {
      const matchingUnits = hrmOptions.depts.filter((d) => {
        const div = (d.div || "").trim().toLowerCase();
        const code = (d.code || "").trim().toLowerCase();
        const dept = (d.dept || "").trim().toLowerCase();
        return div === target || code === target || code.startsWith(target) || dept === target;
      });

      // Ưu tiên chọn unit có mã trùng khớp chính xác với division code (ví dụ TAC000VG)
      const exactMatch = matchingUnits.find(
        (d) => (d.code || "").trim().toLowerCase() === target
      );
      // Nếu không có unit trùng khớp chính xác, chọn unit đầu tiên trong division
      suggestedDept = exactMatch
        ? exactMatch.code
        : matchingUnits.length > 0
        ? matchingUnits[0].code
        : "";
    }

    setForm((prev) => ({
      ...prev,
      dept_apply: newDeptApply,
      newDept: suggestedDept || (target ? "" : prev.newDept),
    }));
  };

  // Tự động đồng bộ Bộ phận HRM khi có Bộ phận ứng tuyển mà chưa chọn Bộ phận HRM
  useEffect(() => {
    if (!form.dept_apply || form.newDept || hrmOptions.depts.length === 0) return;
    const target = form.dept_apply.trim().toLowerCase();
    const matchingUnits = hrmOptions.depts.filter((d) => {
      const div = (d.div || "").trim().toLowerCase();
      const code = (d.code || "").trim().toLowerCase();
      return div === target || code === target || code.startsWith(target);
    });
    const exact = matchingUnits.find(
      (d) => (d.code || "").trim().toLowerCase() === target
    );
    const suggested = exact ? exact.code : matchingUnits.length > 0 ? matchingUnits[0].code : "";
    if (suggested) {
      setForm((prev) => ({ ...prev, newDept: suggested }));
    }
  }, [form.dept_apply, form.newDept, hrmOptions.depts]);

  // Custom extractors for Excel column filters & sorting
  const demandExtractors = useMemo(
    () => ({
      mprCode: (d: any) =>
        d.id_code ||
        (d.mprId
          ? String(d.mprId).startsWith("HR-") || String(d.mprId).startsWith("MPR-")
            ? String(d.mprId)
            : `MPR-${d.mprId}`
          : `DM-${d.id}`),
      dem_dept: (d: any) => d.dem_dept || "-",
      dem_unit: (d: any) => d.dem_unit || d.dem_sub_department || "-",
      dem_position: (d: any) => d.dem_position || d.duty || "-",
      dem_sub_position: (d: any) =>
        d.dem_sub_position && d.dem_sub_position !== "-" ? d.dem_sub_position : "",
      dem_amount: (d: any) => d.dem_amount ?? d.demandQty ?? 0,
      dem_recruited: (d: any) => d.dem_recruited ?? d.recruitedQty ?? 0,
      stocknumber: (d: any) =>
        d.stocknumber ??
        Math.max(
          0,
          Number(d.dem_amount ?? d.demandQty ?? 0) - Number(d.dem_recruited ?? d.recruitedQty ?? 0)
        ),
      inputDate: (d: any) =>
        d.dem_inputdate
          ? String(d.dem_inputdate).split("T")[0]
          : d.key_in
          ? String(d.key_in).split("T")[0]
          : "-",
      dem_note: (d: any) => d.dem_note || "",
    }),
    []
  );

  // Base demands list pre-filtered by onlyRemainingDemand and demandSearch
  const baseDemands = useMemo(() => {
    let list = demandList;

    // Lọc còn thiếu > 0 nếu bật (mặc định bật)
    if (onlyRemainingDemand) {
      list = list.filter((d) => {
        const demandQty = d.dem_amount ?? d.demandQty ?? 0;
        const recruitedQty = d.dem_recruited ?? d.recruitedQty ?? 0;
        const needed = d.stocknumber ?? Math.max(0, Number(demandQty) - Number(recruitedQty));
        return Number(needed) > 0;
      });
    }

    // Tìm nhanh toàn bảng
    if (demandSearch.trim()) {
      const q = demandSearch.toLowerCase().trim();
      list = list.filter((d) => {
        const mpr = String(d.id_code || d.mprId || "").toLowerCase();
        const dept = String(d.dem_dept || "").toLowerCase();
        const unit = String(d.dem_unit || d.dem_sub_department || "").toLowerCase();
        const pos = String(d.dem_position || d.duty || "").toLowerCase();
        const sub = String(d.dem_sub_position || "").toLowerCase();
        const note = String(d.dem_note || "").toLowerCase();
        return (
          mpr.includes(q) ||
          dept.includes(q) ||
          unit.includes(q) ||
          pos.includes(q) ||
          sub.includes(q) ||
          note.includes(q)
        );
      });
    }

    return list;
  }, [demandList, onlyRemainingDemand, demandSearch]);

  // Excel Multi-column filtering & sorting hook
  const {
    filteredData: finalDemandList,
    filters: excelFilters,
    sortConfig: excelSortConfig,
    getDistinctValues,
    setFilter: setExcelFilter,
    setSort: setExcelSort,
    resetFilter: resetExcelFilter,
    resetAllFilters: resetAllExcelFilters,
    activeFilterCount,
  } = useTableExcelFilter(baseDemands, {
    customExtractors: demandExtractors,
  });

  // Escape key closes open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDemandModalOpen(false);
        setResignModalOpen(false);
        setNewSourceModalOpen(false);
        setQrModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Tự động focus vào ô nhập mã QR khi mở modal QR, và trả lại focus cho hidden scanner khi đóng modal
  useEffect(() => {
    if (qrModalOpen) {
      const timer = setTimeout(() => {
        qrInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        hiddenScannerRef.current?.focus({ preventScroll: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [qrModalOpen]);

  // CCCD initial check
  useEffect(() => {
    if (initialCccd) {
      handleCheckHistory(initialCccd);
    }
  }, [initialCccd]);

  const handleCheckHistory = async (cccdVal: string) => {
    if (!cccdVal) return;
    setCheckingHistory(true);
    try {
      const normalized = normalizeCccd(cccdVal);
      const [resCccd, resResign] = await Promise.all([
        fetch("/api/candidates/check-cccd", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cccd: normalized }),
        })
          .then((r) => r.json())
          .catch(() => null),
        fetch("/api/aw-recuitingReport/GetDataByCCCDResign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cccd: normalized }),
        })
          .then((r) => r.json())
          .catch(() => []),
      ]);

      let foundEmpno = "";
      let totalTimes = 0;
      let combinedResign = Array.isArray(resResign) && resResign.length > 0 ? resResign : [];

      if (resCccd && Array.isArray(resCccd.resignData) && resCccd.resignData.length > 0) {
        if (combinedResign.length === 0) {
          combinedResign = resCccd.resignData;
        }
      }

      if (combinedResign.length > 0) {
        setResignData(combinedResign);
        totalTimes = combinedResign.length;
        foundEmpno = combinedResign[0]?.er_empid || "";
      } else {
        setResignData([]);
      }

      if (resCccd && resCccd.found) {
        setHistoryResult({ ...resCccd, cccdQuery: cccdVal });
        totalTimes = Math.max(totalTimes, resCccd.count || 1);
        if (resCccd.empno) foundEmpno = resCccd.empno;
      } else {
        setHistoryResult(null);
      }

      // Nhận diện tiền sử vi phạm kỷ luật / bỏ việc
      if (resCccd && resCccd.isBlacklist && Array.isArray(resCccd.blacklistReasons) && resCccd.blacklistReasons.length > 0) {
        setBlacklistAlert({ reasons: resCccd.blacklistReasons });
      } else {
        const hasBad = combinedResign.some(
          (r: any) =>
            String(r.er_type_resign) === "2" ||
            String(r.er_type_resign) === "3" ||
            /bỏ việc|sa thải|kỷ luật|vắng 5 ngày/i.test(`${r.er_reason || ""} ${r.er_note || ""}`)
        );
        if (hasBad) {
          const badList = combinedResign
            .filter(
              (r: any) =>
                String(r.er_type_resign) === "2" ||
                String(r.er_type_resign) === "3" ||
                /bỏ việc|sa thải|kỷ luật|vắng 5 ngày/i.test(`${r.er_reason || ""} ${r.er_note || ""}`)
            )
            .map((r: any) => {
              const tStr = String(r.er_type_resign);
              const label = tStr === "2" ? "Bỏ việc" : tStr === "3" ? "Sa thải" : "Thôi việc (có vi phạm)";
              return `${label}${r.er_reason ? ` [${r.er_reason}]` : ""}${r.er_resigndate ? ` ngày ${r.er_resigndate}` : ""}${r.er_empid ? ` (MSNV: ${r.er_empid})` : ""}`;
            });
          setBlacklistAlert({ reasons: badList });
        } else {
          setBlacklistAlert(null);
        }
      }

      const autoOldEmpno = resCccd?.oldEmpno || resCccd?.empno || foundEmpno;

      setForm((prev) => ({
        ...prev,
        inVG: totalTimes > 0 ? String(totalTimes) : "0",
        empno_old: autoOldEmpno || prev.empno_old || "",
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingHistory(false);
    }
  };

  // Hàm xử lý bóc tách và điền dữ liệu QR CCCD (hỗ trợ cả máy quét USB HID và cổng COM ảo)
  const handleApplyScannedCccd = useCallback(
    (rawPayload: string) => {
      if (!rawPayload) return false;
      const trimmed = rawPayload.trim();

      // Trường hợp 1: Dữ liệu QR CCCD có chứa dấu phân cách "|"
      if (trimmed.includes("|")) {
        const parsed = parseCccdQrData(trimmed);
        if (parsed && parsed.cccd && parsed.fullName) {
          // Tự động nhận diện Tỉnh / TP nơi sinh & cư trú từ địa chỉ quét CCCD
          let detectedProvinceCode = "H10"; // Mặc định TP.Hồ Chí Minh
          const addrLower = (parsed.address || "").toLowerCase();
          if (hrmOptions.provinces && hrmOptions.provinces.length > 0) {
            const foundProv = hrmOptions.provinces.find((p) => {
              const pName = (p.name || "").toLowerCase();
              return pName && addrLower.includes(pName);
            });
            if (foundProv) {
              detectedProvinceCode = foundProv.code;
            }
          }

          setForm((prev) => ({
            ...prev,
            cccd: parsed.cccd,
            name: parsed.fullName || prev.name,
            dateBirth: parsed.dateOfBirth || prev.dateBirth,
            gender: parsed.gender ? (/nam/i.test(parsed.gender) ? "0" : "1") : prev.gender,
            selectedDatecccd: parsed.issueDate || prev.selectedDatecccd,
            address: parsed.address || prev.address,
            sub_address: parsed.address || prev.sub_address,
            nation: prev.nation || "VN",
            nationality: prev.nationality || "Việt Nam",
            birth_province: detectedProvinceCode,
            province: detectedProvinceCode,
          }));
          handleCheckHistory(parsed.cccd);

          // Phát âm thanh phản hồi bíp nhẹ
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
          } catch {
            // ignore audio failure
          }

          return true;
        }
        // Chuỗi có "|" nhưng chưa hoàn tất hoặc lỗi -> return false
        return false;
      }

      // Trường hợp 2: Quét mã vạch 1D chỉ có 12 số CCCD hoặc 9 số CMND (không có dấu "|")
      const digits = trimmed.replace(/\D/g, "");
      if (digits.length === 9 || digits.length === 12) {
        setForm((prev) => ({ ...prev, cccd: digits }));
        handleCheckHistory(digits);
        return true;
      }

      return false;
    },
    [hrmOptions.provinces, handleCheckHistory]
  );
  handleApplyScannedCccdRef.current = handleApplyScannedCccd;

  // Tự động lắng nghe máy quét USB HID (giả lập bàn phím như MC-9103) - Hoạt động cả khi KHÔNG mở dialog
  useEffect(() => {
    let scanBuffer = "";
    let lastKeyTime = 0;
    let scanTimer: any = null;

    // Đảm bảo focus vào hidden scanner receiver khi trang sẵn sàng
    const ensureHiddenFocus = () => {
      if (typeof document === "undefined") return;
      const active = document.activeElement;
      const isEditing =
        active &&
        active.closest(
          'input, textarea:not(#hidden-usb-scanner-receiver), select, [contenteditable="true"]'
        );
      if (!isEditing && hiddenScannerRef.current) {
        hiddenScannerRef.current.focus({ preventScroll: true });
      }
    };

    const initialTimer = setTimeout(ensureHiddenFocus, 200);

    const tryProcessBuffer = () => {
      const bufferToTest = scanBuffer.trim();
      if (!bufferToTest) return false;

      // 1. Trường hợp QR CCCD có dấu '|'
      if (bufferToTest.includes("|") && bufferToTest.length >= 15) {
        const ok = handleApplyScannedCccdRef.current(bufferToTest);
        if (ok) {
          scanBuffer = "";
          if (hiddenScannerRef.current) hiddenScannerRef.current.value = "";
          return true;
        }
      }

      // 2. Trường hợp mã vạch 1D: chỉ có 9 số hoặc 12 số CCCD
      const digitsOnly = bufferToTest.replace(/\D/g, "");
      if (digitsOnly.length === 9 || digitsOnly.length === 12) {
        const ok = handleApplyScannedCccdRef.current(digitsOnly);
        if (ok) {
          scanBuffer = "";
          if (hiddenScannerRef.current) hiddenScannerRef.current.value = "";
          return true;
        }
      }

      return false;
    };

    // Khi người dùng click ra vùng trống ngoài form, tự động đưa focus về hidden scanner receiver
    const handleDocumentPointer = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isInteractive = target.closest(
        'input, textarea, select, button, a, [contenteditable="true"], [role="button"], [role="menuitem"], [role="option"]'
      );
      if (!isInteractive) {
        ensureHiddenFocus();
      }
    };

    // Khi người dùng hoàn thành chỉnh sửa một ô input (blur), tự động trả focus về hidden receiver sau 120ms
    const handleFocusOut = () => {
      setTimeout(ensureHiddenFocus, 120);
    };

    // Lắng nghe sự kiện input toàn cục: Nếu máy quét bắn vào bất kỳ ô input nào trên form hoặc hidden receiver
    const handleGlobalInput = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | null;
      if (!target) return;
      if (target === qrInputRef.current) return; // Nếu trong modal QR thì để modal xử lý

      const val = target.value;
      if (typeof val === "string" && val.includes("|")) {
        const ok = handleApplyScannedCccdRef.current(val);
        if (ok) {
          if (target !== hiddenScannerRef.current) {
            // Khôi phục giá trị hợp lý cho ô input bị bắn nhầm
            if (target.name === "cccd" || target.id?.includes("cccd") || target.placeholder?.includes("CCCD")) {
              target.value = val.split("|")[0].replace(/\D/g, "").slice(0, 12);
            } else {
              target.value = "";
            }
          } else {
            target.value = "";
          }
          scanBuffer = "";
          ensureHiddenFocus();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua các phím điều khiển đơn lẻ
      if (["Control", "Alt", "Shift", "Meta", "CapsLock", "Escape"].includes(e.key)) {
        return;
      }

      const now = Date.now();
      const timeDiff = now - lastKeyTime;
      lastKeyTime = now;

      // Máy quét USB mô phỏng bàn phím: nếu nghỉ quá 600ms thì reset buffer mới
      if (timeDiff > 600) {
        scanBuffer = "";
      }

      // Khi kết thúc bằng phím Enter hoặc Tab
      if (e.key === "Enter" || e.key === "Tab") {
        const hiddenVal = hiddenScannerRef.current?.value.trim() || "";
        if (
          scanBuffer.includes("|") ||
          scanBuffer.replace(/\D/g, "").length === 12 ||
          scanBuffer.replace(/\D/g, "").length === 9 ||
          hiddenVal.includes("|") ||
          hiddenVal.replace(/\D/g, "").length === 12 ||
          hiddenVal.replace(/\D/g, "").length === 9
        ) {
          e.preventDefault();
          e.stopPropagation();

          // Thử từ buffer bàn phím
          let ok = tryProcessBuffer();
          // Nếu chưa được, thử từ hidden scanner textarea
          if (!ok && hiddenVal) {
            ok = handleApplyScannedCccdRef.current(hiddenVal);
            if (ok) {
              if (hiddenScannerRef.current) hiddenScannerRef.current.value = "";
              scanBuffer = "";
            }
          }
          if (ok) {
            scanBuffer = "";
            if (hiddenScannerRef.current) hiddenScannerRef.current.value = "";
            ensureHiddenFocus();
            return;
          }
        }
        return;
      }

      if (e.key && e.key.length === 1) {
        scanBuffer += e.key;

        // Nếu chuỗi đang nhận có dấu '|' và người dùng đang focus ô input khác
        if (scanBuffer.includes("|")) {
          if (
            document.activeElement &&
            (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")
          ) {
            const el = document.activeElement as HTMLElement;
            const isAllowed = el === qrInputRef.current || el === hiddenScannerRef.current;
            if (!isAllowed) {
              e.preventDefault();
              e.stopPropagation();
            }
          }

          // Kiểm tra sớm nếu đã nhận đủ 7 phần tử
          const parts = scanBuffer.split("|");
          if (parts.length >= 7 && parts[6].replace(/\D/g, "").length >= 8) {
            const ok = handleApplyScannedCccdRef.current(scanBuffer);
            if (ok) {
              scanBuffer = "";
              if (hiddenScannerRef.current) hiddenScannerRef.current.value = "";
              if (scanTimer) clearTimeout(scanTimer);
              ensureHiddenFocus();
              return;
            }
          }
        }

        // Tự động xử lý sau 180ms kể từ ký tự cuối nếu máy không gửi Enter
        if (scanTimer) clearTimeout(scanTimer);
        scanTimer = setTimeout(() => {
          let ok = tryProcessBuffer();
          if (!ok && hiddenScannerRef.current && hiddenScannerRef.current.value.includes("|")) {
            ok = handleApplyScannedCccdRef.current(hiddenScannerRef.current.value.trim());
            if (ok) {
              hiddenScannerRef.current.value = "";
              scanBuffer = "";
            }
          }
        }, 180);
      }
    };

    // Lắng nghe sự kiện Paste toàn cục
    const handlePaste = (e: ClipboardEvent) => {
      const pasted = e.clipboardData?.getData("text");
      if (pasted && (pasted.includes("|") || pasted.trim().length === 12 || pasted.trim().length === 9)) {
        const ok = handleApplyScannedCccdRef.current(pasted);
        if (ok) {
          e.preventDefault();
          if (hiddenScannerRef.current) hiddenScannerRef.current.value = "";
          scanBuffer = "";
          ensureHiddenFocus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("input", handleGlobalInput, true);
    window.addEventListener("paste", handlePaste, true);
    window.addEventListener("focusout", handleFocusOut);
    document.addEventListener("pointerdown", handleDocumentPointer);

    return () => {
      clearTimeout(initialTimer);
      if (scanTimer) clearTimeout(scanTimer);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("input", handleGlobalInput, true);
      window.removeEventListener("paste", handlePaste, true);
      window.removeEventListener("focusout", handleFocusOut);
      document.removeEventListener("pointerdown", handleDocumentPointer);
    };
  }, []);

  const handleOpenResignHistory = async () => {
    const queryCccd = form.cccd?.trim();
    const queryEmpno = form.empno_old?.trim();

    if (!queryCccd && !queryEmpno) {
      setDialog({
        isOpen: true,
        title: "Chưa có thông tin tra cứu",
        message: "Vui lòng nhập số CCCD/CMND hoặc Mã NV cũ để tra cứu lịch sử làm việc.",
        type: "info",
      });
      return;
    }

    setLoadingResignData(true);
    try {
      const promises: Promise<any>[] = [];

      // 1. Fetch resign_data theo đúng cccd / empno
      promises.push(
        fetch("/api/aw-recuitingReport/GetDataByCCCDResign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cccd: queryCccd, empno: queryEmpno }),
        })
          .then((r) => r.json())
          .catch(() => [])
      );

      // 2. Fetch check-cccd if cccd present
      if (queryCccd && (!historyResult || historyResult.cccdQuery !== queryCccd)) {
        const normalized = normalizeCccd(queryCccd);
        promises.push(
          fetch("/api/candidates/check-cccd", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cccd: normalized }),
          })
            .then((r) => r.json())
            .catch(() => null)
        );
      }

      const [resignRes, checkRes] = await Promise.all(promises);

      let resignList = Array.isArray(resignRes) && resignRes.length > 0 ? resignRes : [];
      if (checkRes && Array.isArray(checkRes.resignData) && checkRes.resignData.length > 0) {
        if (resignList.length === 0) {
          resignList = checkRes.resignData;
        }
      }
      setResignData(resignList);

      if (checkRes) {
        setHistoryResult({ ...checkRes, cccdQuery: queryCccd });
        if (checkRes.found) {
          const autoOldEmpno = checkRes.oldEmpno || checkRes.empno;
          setForm((prev) => ({
            ...prev,
            inVG: `Có (${checkRes.count || 1} lần)`,
            empno_old: autoOldEmpno || prev.empno_old || "",
          }));
        }
        if (checkRes.isBlacklist && Array.isArray(checkRes.blacklistReasons) && checkRes.blacklistReasons.length > 0) {
          setBlacklistAlert({ reasons: checkRes.blacklistReasons });
        }
      } else if (resignList.some((r: any) => String(r.er_type_resign) === "2" || String(r.er_type_resign) === "3" || /bỏ việc|sa thải|kỷ luật|vắng 5 ngày/i.test(`${r.er_reason || ""} ${r.er_note || ""}`))) {
        const badList = resignList
          .filter((r: any) => String(r.er_type_resign) === "2" || String(r.er_type_resign) === "3" || /bỏ việc|sa thải|kỷ luật|vắng 5 ngày/i.test(`${r.er_reason || ""} ${r.er_note || ""}`))
          .map((r: any) => {
            const tStr = String(r.er_type_resign);
            const label = tStr === "2" ? "Bỏ việc" : tStr === "3" ? "Sa thải" : "Thôi việc (có vi phạm)";
            return `${label}${r.er_reason ? ` [${r.er_reason}]` : ""}${r.er_resigndate ? ` ngày ${r.er_resigndate}` : ""}${r.er_empid ? ` (MSNV: ${r.er_empid})` : ""}`;
          });
        setBlacklistAlert({ reasons: badList });
      }

      if (resignList.length === 0 && (!checkRes || !checkRes.found) && !historyResult?.found) {
        setDialog({
          isOpen: true,
          title: "Lịch sử làm việc",
          message: "Không tìm thấy dữ liệu làm việc hoặc thôi việc nào khớp với thông tin đã cung cấp.",
          type: "info",
        });
        return;
      }

      setResignModalOpen(true);
    } catch (err) {
      console.error("Lỗi tải lịch sử làm việc:", err);
      setDialog({
        isOpen: true,
        title: "Lỗi kết nối",
        message: "Không thể tra cứu dữ liệu lịch sử lúc này. Vui lòng thử lại sau.",
        type: "danger",
      });
    } finally {
      setLoadingResignData(false);
    }
  };

  // Auto-sync Address & Phone fields between main and alternate
  const handleAddressChange = (val: string) => {
    setForm((prev) => {
      const shouldSync = !prev.sub_address || prev.sub_address === prev.address;
      return {
        ...prev,
        address: val,
        sub_address: shouldSync ? val : prev.sub_address,
      };
    });
  };

  const handleSubAddressChange = (val: string) => {
    setForm((prev) => {
      const shouldSync = !prev.address || prev.address === prev.sub_address;
      return {
        ...prev,
        sub_address: val,
        address: shouldSync ? val : prev.address,
      };
    });
  };

  const handleTelChange = (val: string) => {
    setForm((prev) => {
      const shouldSync = !prev.sub_tel || prev.sub_tel === prev.tel;
      return {
        ...prev,
        tel: val,
        sub_tel: shouldSync ? val : prev.sub_tel,
      };
    });
  };

  const handleSubTelChange = (val: string) => {
    setForm((prev) => {
      const shouldSync = !prev.tel || prev.tel === prev.sub_tel;
      return {
        ...prev,
        sub_tel: val,
        tel: shouldSync ? val : prev.tel,
      };
    });
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.cccd) {
      setDialog({
        isOpen: true,
        type: "warning",
        title: "Thiếu Thông Tin Bắt Buộc",
        message: "Vui lòng nhập đầy đủ Họ tên và số CCCD/CMND của ứng viên trước khi lưu.",
        confirmText: "Đã hiểu",
        showCancel: false,
      });
      return;
    }

    setSaving(true);
    try {
      let formattedEmpno = form.empno_hrm ? form.empno_hrm.trim() : "";
      if (formattedEmpno && /^\d+$/.test(formattedEmpno)) {
        formattedEmpno = formattedEmpno.padStart(6, "0");
      }

      const payload = {
        ...form,
        empno_hrm: formattedEmpno,
        position_hrm: form.position,
        keyInDate: isEditing ? undefined : new Date().toISOString().split("T")[0],
        id: candidateId || undefined,
        candidateName: form.name.toUpperCase().trim(),
        dateOfBirth: form.dateBirth,
      };

      const res = await fetch("/api/candidates", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setDialog({
          isOpen: true,
          type: "success",
          title: isEditing ? "Cập Nhật Hồ Sơ Thành Công!" : "Lưu Hồ Sơ Thành Công!",
          message: isEditing
            ? `Hồ sơ của ứng viên "${form.name.toUpperCase().trim()}" (#${candidateId}) đã được cập nhật thành công vào hệ thống.`
            : `Hồ sơ của ứng viên "${form.name.toUpperCase().trim()}" đã được tiếp nhận và lưu thành công vào hệ thống tuyển dụng.`,
          confirmText: "Về danh sách",
          cancelText: "Ở lại trang",
          showCancel: true,
          onConfirm: () => router.push("/candidates"),
        });
      } else {
        setDialog({
          isOpen: true,
          type: "danger",
          title: "Lỗi Lưu Hồ Sơ",
          message: data.error || "Không thể lưu dữ liệu ứng viên. Vui lòng kiểm tra lại thông tin.",
          confirmText: "Đóng",
          showCancel: false,
        });
      }
    } catch (err) {
      setDialog({
        isOpen: true,
        type: "danger",
        title: "Lỗi Kết Nối",
        message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền mạng.",
        confirmText: "Đóng",
        showCancel: false,
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete Candidate
  const handleDelete = async () => {
    if (!candidateId) return;

    setDialog({
      isOpen: true,
      type: "danger",
      title: "Xác Nhận Xóa Hồ Sơ",
      message: `Bạn có chắc chắn muốn xóa hồ sơ của ứng viên "${form.name || ""}" (CCCD: ${form.cccd || "-"}) không? Hồ sơ sẽ được chuyển sang trạng thái ngừng hoạt động.`,
      confirmText: "Xóa hồ sơ",
      cancelText: "Hủy bỏ",
      showCancel: true,
      onConfirm: async () => {
        setDeleting(true);
        try {
          const res = await fetch(`/api/candidates?id=${candidateId}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            // Chuyển hướng ngay về trang Danh Sách Ứng Viên
            window.location.href = "/candidates";
          } else {
            setDialog({
              isOpen: true,
              type: "danger",
              title: "Lỗi Xóa Hồ Sơ",
              message: data.error || "Không thể xóa hồ sơ ứng viên.",
              confirmText: "Đóng",
              showCancel: false,
            });
          }
        } catch (e) {
          setDialog({
            isOpen: true,
            type: "danger",
            title: "Lỗi Máy Chủ",
            message: "Lỗi kết nối máy chủ khi xóa hồ sơ ứng viên.",
            confirmText: "Đóng",
            showCancel: false,
          });
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  // Reset form
  const handleReset = () => {
    setDialog({
      isOpen: true,
      type: "warning",
      title: "Làm Mới Biểu Mẫu",
      message: "Bạn có chắc chắn muốn làm mới toàn bộ biểu mẫu? Mọi thông tin đang nhập sẽ bị xóa để nhập lại từ đầu.",
      confirmText: "Làm mới",
      cancelText: "Hủy bỏ",
      showCancel: true,
      onConfirm: () => {
      setForm({
        cccd: "",
        selectedDatecccd: "",
        name: "",
        dateBirth: "",
        gender: "0",
        address: "",
        sub_address: "",
        tel: "",
        sub_tel: "",
        email: "",
        loc: "aw",
        dept_apply: "",
        loc_apply: "Worker",
        dm_id: "",
        dm_Subpos: "",
        source_recruit: "",
        date_cv: "",
        date_salary: "",
        inVG: "",
        empno_old: "",
        comp_return: "",
        remark: "",
        date_hr_inter: new Date().toISOString().split("T")[0],
        date_hr_review: new Date().toISOString().split("T")[0],
        hrAcc: "no",
        date_dept_inter: "",
        date_dept_review: "",
        deptACC: "no",
        inDateWork: "",
        inDateAccWork: "",
        inWorker: "no",
        change_date: "",
        edu: "",
        school_gra: "",
        empno_hrm: "",
        newDept: "",
        position: "",
        deputy: "",
        level: "",
        parameters: "",
        time_trial: "" as unknown as number,
        code_mc: "SCS006",
        loc_work: "AW",
        direct: "",
        tmp_categoryid: "00001",
        dantoc: "A",
        married: "0",
        nation: "VN",
        nationality: "Việt Nam",
        birth_province: "H10",
        province: "H10",
      });
      setHistoryResult(null);
      setShowAllHrmDepts(false);
    },
  });
};

  return (
    <div className="w-full h-full flex-1 min-h-0 flex flex-col p-2.5 sm:p-3 overflow-hidden bg-[#eaedf0] dark:bg-[#131316] text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between bg-[#f1f3f6] dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#383842] rounded-xl px-3.5 py-2.5 mb-2.5 shadow-xs">
        <div className="flex items-center space-x-3">
          <Link
            href="/candidates"
            className="h-9 px-3 rounded-md bg-white hover:bg-zinc-50 dark:bg-[#202025] dark:hover:bg-[#2a2a32] border border-zinc-300 dark:border-[#383842] text-xs font-bold text-zinc-800 dark:text-zinc-200 inline-flex items-center gap-1.5 transition-all shadow-xs"
            title={t("backToList", "Quay lại danh sách ứng viên")}
          >
            <ArrowLeft className="w-4 h-4 text-zinc-700 dark:text-zinc-300 stroke-[2.5]" />
            <span>{t("back", "Quay lại")}</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white leading-none flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {isEditing ? `${t("editCandidate", "Chỉnh Sửa Hồ Sơ Ứng Viên")} #${candidateId}` : t("candidateSubtitle", "Tiếp Nhận & Đăng Ký Hồ Sơ Ứng Viên")}
              </h1>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md text-white shadow-xs ${
                isEditing
                  ? "bg-amber-600"
                  : "bg-emerald-600"
              }`}>
                {isEditing ? t("edit", "Chế độ Chỉnh sửa") : t("addNew", "Tạo mới")}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Top Tools */}
        <div className="flex items-center space-x-2 mt-1 sm:mt-0">
          {historyResult?.found && (
            <button
              type="button"
              onClick={() => setResignModalOpen(true)}
              className="h-9 px-3.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/40 text-xs font-bold inline-flex items-center space-x-1.5 transition-all shadow-xs"
            >
              <History className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t("resignationHistory", "Lịch sử")} ({historyResult.count})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Scrollable Form */}
      <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3 custom-scrollbar pb-2">
          {/* ========================================================================= */}
          {/* CARD 1: THÔNG TIN CÁ NHÂN & ẢNH CHÂN DUNG 3x4 */}
          {/* ========================================================================= */}
          <div className="bg-white dark:bg-[#18181C] border border-zinc-300 dark:border-[#383842] rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-300 dark:border-[#383842]">
              <div className="flex items-center space-x-2 text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                  1
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-black text-xs uppercase tracking-wide">{t("card1Title", "Thông Tin Cá Nhân")}</span>
              </div>
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
                {t("idRequired", "* Bắt buộc số CCCD và Họ tên")}
              </span>
            </div>

            <div className="space-y-4">
              {/* Row 1: CCCD, Issue Date, Name, DOB, Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-3 gap-y-4">
                {blacklistAlert && blacklistAlert.reasons.length > 0 && (
                  <div className="col-span-12 p-3 bg-rose-500/10 dark:bg-rose-950/40 border-2 border-rose-500/50 rounded-xl flex items-start gap-3 text-rose-800 dark:text-rose-200">
                    <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <div className="font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                        ⚠️ CẢNH BÁO THẨM ĐỊNH TUYỂN DỤNG (BLACKLIST / BỎ VIỆC)
                      </div>
                      <div className="text-zinc-700 dark:text-zinc-300">
                        Ứng viên từng làm việc tại công ty và có lịch sử thôi việc cần lưu ý:
                      </div>
                      <ul className="list-disc list-inside font-semibold text-rose-800 dark:text-rose-200">
                        {blacklistAlert.reasons.map((rs, idx) => (
                          <li key={idx}>{rs}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                  <OutlinedBox label={t("idNo", "Số CCCD / CMND")} required>
                    <input
                      name="cccd"
                      id="cccd"
                      type="text"
                      required
                      value={form.cccd}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.includes("|")) {
                          const ok = handleApplyScannedCccd(val);
                          if (ok) return;
                          // Giữ nguyên chuỗi tạm thời trong ô để máy quét tiếp tục bắn hết chuỗi
                          setForm((prev) => ({ ...prev, cccd: val }));
                          return;
                        }
                        // Nếu đang quét nhanh (nhiều hơn 12 ký tự hoặc có ký tự khác số), không cắt cụt để tránh làm hỏng QR đang truyền
                        if (val.length > 12) {
                          setForm((prev) => ({ ...prev, cccd: val }));
                          return;
                        }
                        setForm((prev) => ({ ...prev, cccd: val.replace(/\D/g, "").slice(0, 12) }));
                      }}
                      onKeyDown={(e) => {
                        const inputVal = (e.target as HTMLInputElement).value;
                        if (e.key === "Enter" && (inputVal.includes("|") || form.cccd.includes("|"))) {
                          e.preventDefault();
                          e.stopPropagation();
                          handleApplyScannedCccd(inputVal || form.cccd);
                        }
                      }}
                      onPaste={(e) => {
                        const pasted = e.clipboardData.getData("text");
                        if (pasted.includes("|")) {
                          e.preventDefault();
                          e.stopPropagation();
                          handleApplyScannedCccd(pasted);
                        }
                      }}
                      onBlur={(e) => {
                        const inputVal = e.target.value;
                        if (inputVal.includes("|") || form.cccd.includes("|")) {
                          const ok = handleApplyScannedCccd(inputVal || form.cccd);
                          if (!ok) {
                            const digits = (inputVal || form.cccd).split("|")[0].replace(/\D/g, "").slice(0, 12);
                            setForm((prev) => ({ ...prev, cccd: digits }));
                          }
                        } else {
                          handleCheckHistory(form.cccd);
                        }
                      }}
                      className="flex-1 h-full bg-transparent px-2.5 text-sm tabular-nums font-bold text-cyan-600 dark:text-cyan-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCheckHistory(form.cccd)}
                      disabled={checkingHistory || !form.cccd}
                      className="h-full px-3.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-[#25252c] dark:hover:bg-[#2f2f38] text-xs font-bold text-zinc-800 dark:text-zinc-200 border-l border-zinc-300 dark:border-[#383842] shrink-0 transition-colors cursor-pointer"
                    >
                      {checkingHistory ? "..." : t("checkHistory", "Kiểm tra")}
                    </button>
                  </OutlinedBox>
                </div>

                <div className="col-span-12 sm:col-span-6 xl:col-span-2">
                  <OutlinedInput
                    type="date"
                    label={t("idIssueDate", "Ngày cấp CCCD")}
                    value={form.selectedDatecccd}
                    onChange={(e) => setForm({ ...form, selectedDatecccd: e.target.value })}
                  />
                </div>

                <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                  <OutlinedInput
                    type="text"
                    label={t("nameUppercase", "Họ và Tên (Viết hoa)")}
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })}
                    className="font-bold uppercase"
                  />
                </div>

                <div className="col-span-12 sm:col-span-3 xl:col-span-2">
                  <OutlinedInput
                    type="date"
                    label={t("birthday", "Ngày sinh")}
                    value={form.dateBirth}
                    onChange={(e) => setForm({ ...form, dateBirth: e.target.value })}
                  />
                </div>

                <div className="col-span-12 sm:col-span-3 xl:col-span-2">
                  <OutlinedBox label={t("gender", "Giới tính")} className="px-3 space-x-4">
                    <label className="inline-flex items-center space-x-1.5 cursor-pointer text-xs font-medium text-zinc-800 dark:text-zinc-200 select-none">
                      <input
                        type="radio"
                        name="gender"
                        value="0"
                        checked={form.gender === "0"}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 cursor-pointer"
                      />
                      <span>{t("male", "Nam")}</span>
                    </label>
                    <label className="inline-flex items-center space-x-1.5 cursor-pointer text-xs font-medium text-zinc-800 dark:text-zinc-200 select-none">
                      <input
                        type="radio"
                        name="gender"
                        value="1"
                        checked={form.gender === "1"}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 cursor-pointer"
                      />
                      <span>{t("female", "Nữ")}</span>
                    </label>
                  </OutlinedBox>
                </div>
              </div>

              {/* Row 2: Address, Sub-address, Tel, Sub-tel */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-3 gap-y-4">
                <div className="col-span-12 sm:col-span-6 xl:col-span-4">
                  <OutlinedInput
                    type="text"
                    label={t("address", "Địa chỉ thường trú")}
                    value={form.address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                  />
                </div>

                <div className="col-span-12 sm:col-span-6 xl:col-span-4">
                  <OutlinedInput
                    type="text"
                    label={t("subAddress", "Địa chỉ tạm trú / khác")}
                    value={form.sub_address}
                    onChange={(e) => handleSubAddressChange(e.target.value)}
                  />
                </div>

                <div className="col-span-12 sm:col-span-6 xl:col-span-2">
                  <OutlinedInput
                    type="tel"
                    label={t("mainPhone", "SĐT chính")}
                    value={form.tel}
                    onChange={(e) => handleTelChange(e.target.value)}
                    className="tabular-nums"
                  />
                </div>

                <div className="col-span-12 sm:col-span-6 xl:col-span-2">
                  <OutlinedInput
                    type="tel"
                    label={t("subPhone", "SĐT phụ")}
                    value={form.sub_tel}
                    onChange={(e) => handleSubTelChange(e.target.value)}
                    className="tabular-nums"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CARD 2: THÔNG TIN NHU CẦU TUYỂN DỤNG (DEMAND INFORMATION) */}
          {/* ========================================================================= */}
          <div className="bg-white dark:bg-[#18181C] border border-zinc-300 dark:border-[#383842] rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-300 dark:border-[#383842]">
              <div className="flex items-center space-x-2 text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-md bg-sky-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                  2
                </span>
                <span className="text-sky-700 dark:text-sky-400 font-black text-xs uppercase tracking-wide">{t("card2Title", "Thông Tin Nhu Cầu Tuyển Dụng")}</span>
              </div>
              
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-3 gap-y-4">
              <div className="col-span-12 sm:col-span-6 lg:col-span-5">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <OutlinedSelect
                      label={t("deptApplied", "Bộ phận ứng tuyển")}     
                      value={form.dept_apply}
                      onChange={(e) => handleDeptApplyChange(e.target.value)}
                      className="font-semibold"
                    >
                      <option value=""> {t("selectDeptApply", "Chọn bộ phận ứng tuyển")} </option>
                      {departmentDivs.map((d, idx) => {
                        const divVal = d.div || (d as any).code || d.name || String(idx);
                        return (
                          <option key={`dept-div-${divVal}-${idx}`} value={divVal}>
                            {divVal}{d.name && d.name !== divVal ? ` - ${d.name}` : ""}
                          </option>
                        );
                      })}
                      {form.dept_apply &&
                        !departmentDivs.some((d) => (d.div || (d as any).code) === form.dept_apply) && (
                          <option key={`dept-div-custom-${form.dept_apply}`} value={form.dept_apply}>
                            {form.dept_apply}
                          </option>
                        )}
                    </OutlinedSelect>
                  </div>
                  {form.dept_apply && (
                    <button
                      type="button"
                      onClick={() => {
                        resetAllExcelFilters();
                        setDemandSearch("");
                        if (form.dept_apply) {
                          const hasExactDept = demandList.some((d) => d.dem_dept === form.dept_apply);
                          if (hasExactDept) {
                            setExcelFilter("dem_dept", new Set([form.dept_apply]));
                          } else {
                            setDemandSearch(form.dept_apply);
                          }
                        }
                        setOnlyRemainingDemand(true);
                        setDemandModalOpen(true);
                      }}
                      className="h-[38px] px-3.5 rounded-md bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer animate-in fade-in zoom-in-95 duration-150"
                      title={`Bấm để chọn nhu cầu tuyển dụng đang mở của bộ phận ${form.dept_apply}`}
                    >
                      <Briefcase className="w-3.5 h-3.5 shrink-0" />
                      <span>{t("chooseDemand", "Chọn Nhu Cầu")}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="col-span-12 sm:col-span-6 lg:col-span-2">
                <OutlinedInput
                  type="text"
                  label={t("mprCode", "Mã MPR")}
                  value={form.dm_id}
                  onChange={(e) => setForm({ ...form, dm_id: e.target.value })}
                  className="tabular-nums font-bold text-amber-500"
                />
              </div>

              <div className="col-span-12 sm:col-span-6 lg:col-span-2">
                <OutlinedSelect
                  label={t("locApply", "Vị trí tuyển dụng")}
                  value={form.loc_apply}
                  onChange={(e) => setForm({ ...form, loc_apply: e.target.value })}
                >
                  {locApplyOptions.map((la, idx) => (
                    <option key={`loc-apply-${la.code || idx}-${idx}`} value={la.code}>
                      {getLocApplyDisplayName(la)}
                    </option>
                  ))}
                </OutlinedSelect>
              </div>

              <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                <OutlinedInput
                  type="text"
                  label={t("subPositionInput", "Vị trí phụ")}
                  value={form.dm_Subpos}
                  onChange={(e) => setForm({ ...form, dm_Subpos: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CARD 3: THÔNG TIN TUYỂN DỤNG & ĐÁNH GIÁ PHỎNG VẤN */}
          {/* ========================================================================= */}
          <div className="bg-white dark:bg-[#18181C] border border-zinc-300 dark:border-[#383842] rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-300 dark:border-[#383842]">
              <div className="flex items-center space-x-2 text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-md bg-amber-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                  3
                </span>
                <span className="text-amber-700 dark:text-amber-400 font-black text-xs uppercase tracking-wide">{t("card3Title", "Thông Tin Tuyển Dụng & Đánh Giá")}</span>
              </div>
              <button
                type="button"
                onClick={() => setNewSourceModalOpen(true)}
                className="h-8 px-3.5 rounded-md bg-red hover:bg-zinc-50 dark:bg-[#202025] dark:hover:bg-[#2a2a32] border border-zinc-300 dark:border-[#383842] text-xs font-bold text-zinc-800 dark:text-zinc-200 inline-flex items-center space-x-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                <span>{t("addSource", "Thêm Nguồn TD")}</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Row 1: Source recruit, Bus, CV date, Worked at VG, Old Empno */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-3 gap-y-4">
                <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                  <OutlinedSelect
                    label={t("recruitmentSource", "Nguồn tuyển dụng")}
                    value={form.source_recruit}
                    onChange={(e) => setForm({ ...form, source_recruit: e.target.value })}
                  >
                    <option key="default-source" value=""> {t("selectSource", "Chọn nguồn tuyển dụng")} </option>
                    {form.source_recruit &&
                      !sourcesList.some(
                        (s) =>
                          s.code === form.source_recruit ||
                          s.name === form.source_recruit ||
                          s.name_vi === form.source_recruit
                      ) && (
                        <option key={`custom-source-${form.source_recruit}`} value={form.source_recruit}>
                          {form.source_recruit}
                        </option>
                      )}
                    {sourcesList.map((s, idx) => {
                      const code = typeof s === "string" ? s : (s.code || s.name || `source-${idx}`);
                      return (
                        <option key={`source-opt-${code}-${idx}`} value={code}>
                          {getSourceDisplayName(s)}
                        </option>
                      );
                    })}
                  </OutlinedSelect>
                </div>

                <div className="col-span-12 sm:col-span-4 xl:col-span-2">
                  <OutlinedInput
                    type="date"
                    label={t("cvReceivedDate", "Ngày nhận CV")}
                    value={form.date_cv}
                    onChange={(e) => setForm({ ...form, date_cv: e.target.value })}
                  />
                </div>

                <div className="col-span-12 sm:col-span-4 xl:col-span-2">
                  <OutlinedInput
                    type="date"
                    label={t("salarySignDate", "Ngày ký lương")}
                    value={form.date_salary}
                    onChange={(e) => setForm({ ...form, date_salary: e.target.value })}
                  />
                </div>

                <div className="col-span-12 sm:col-span-4 xl:col-span-3">
                  <OutlinedBox label={t("workedAtVG", "Đã từng làm việc ở VG?")}>
                    <input
                      type="text"
                      value={form.inVG}
                      onChange={(e) => setForm({ ...form, inVG: e.target.value })}
                      className="flex-1 h-full bg-transparent px-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleOpenResignHistory}
                      disabled={loadingResignData}
                      className={`h-full px-2.5 border-l text-xs font-semibold shrink-0 inline-flex items-center space-x-1 transition-all cursor-pointer ${
                        blacklistAlert?.reasons?.length
                          ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-400 border-rose-500/50"
                          : historyResult?.found ||
                            form.inVG?.toLowerCase().includes("có") ||
                            resignData.length > 0
                          ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 border-emerald-500/40"
                          : "bg-zinc-100 hover:bg-zinc-200 dark:bg-[#202025] dark:hover:bg-[#2a2a32] text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                      }`}
                      title={t("viewResignHistory", "Xem lịch sử làm việc & thôi việc tại công ty")}
                    >
                      {loadingResignData ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <History className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {t("resignationHistory", "Lịch sử")}
                        {historyResult?.count
                          ? ` (${historyResult.count})`
                          : resignData.length > 0
                          ? ` (${resignData.length})`
                          : ""}
                      </span>
                    </button>
                  </OutlinedBox>
                </div>

                <div className="col-span-12 sm:col-span-4 xl:col-span-2">
                  <OutlinedInput
                    type="text"
                    label={t("oldEmpnoVG", "Mã NV cũ")}
                    value={form.empno_old}
                    onChange={(e) => setForm({ ...form, empno_old: e.target.value })}
                    className="tabular-nums"
                  />
                </div>
              </div>

              {/* Row 2: HR Interview & Review + Department Interview & Review */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="w-full sm:w-[175px] shrink-0">
                    <OutlinedInput
                      type="date"
                      label={t("interviewDate", "Ngày HR PV")}
                      value={form.date_hr_inter}
                      onChange={(e) => setForm({ ...form, date_hr_inter: e.target.value })}
                    />
                  </div>

                  <div className="w-full sm:w-[175px] shrink-0">
                    <OutlinedInput
                      type="date"
                      label={t("hrAccept", "Ngày HR duyệt")}
                      value={form.date_hr_review}
                      onChange={(e) => setForm({ ...form, date_hr_review: e.target.value })}
                    />
                  </div>

                  <div className="flex-1 h-[38px] flex items-center">
                    <CompactSwitch
                      label={t("hrAccept", "HR Chấp nhận")}
                      checked={form.hrAcc === "yes"}
                      onChange={(val) => setForm({ ...form, hrAcc: val ? "yes" : "no" })}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="w-full sm:w-[175px] shrink-0">
                    <OutlinedInput
                      type="date"
                      label={t("deptInterviewDate", "Ngày BP PV")}
                      value={form.date_dept_inter}
                      onChange={(e) => setForm({ ...form, date_dept_inter: e.target.value })}
                    />
                  </div>

                  <div className="w-full sm:w-[175px] shrink-0">
                    <OutlinedInput
                      type="date"
                      label={t("deptReviewDate", "Ngày BP duyệt")}
                      value={form.date_dept_review}
                      onChange={(e) => setForm({ ...form, date_dept_review: e.target.value })}
                    />
                  </div>

                  <div className="flex-1 h-[38px] flex items-center">
                    <CompactSwitch
                      label={t("deptApproved", "BP Chấp nhận")}
                      checked={form.deptACC === "yes"}
                      onChange={(val) => setForm({ ...form, deptACC: val ? "yes" : "no" })}
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Expected on board, Actual on board, Change Date, Started working, Comp Return, Note */}
              <div className="flex flex-col sm:flex-row flex-wrap xl:flex-nowrap items-stretch sm:items-center gap-3">
                <div className="w-full sm:w-[165px] shrink-0">
                  <OutlinedInput
                    type="date"
                    label={t("expectedWorkDate", "Ngày vào làm dự kiến")}
                    value={form.inDateWork}
                    onChange={(e) => setForm({ ...form, inDateWork: e.target.value })}
                    className="font-semibold text-sky-600 dark:text-sky-400"
                  />
                </div>

                <div className="w-full sm:w-[165px] shrink-0">
                  <OutlinedInput
                    type="date"
                    label={t("actualWorkDate", "Ngày thực tế vào làm")}
                    value={form.inDateAccWork}
                    onChange={(e) => setForm({ ...form, inDateAccWork: e.target.value })}
                    className="font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>

                <div className="w-full sm:w-[165px] shrink-0">
                  <OutlinedInput
                    type="date"
                    label={t("changeWorkDate", "Ngày đổi vào làm")}
                    value={form.change_date}
                    onChange={(e) => setForm({ ...form, change_date: e.target.value })}
                  />
                </div>

                <div className="w-full sm:w-[165px] shrink-0 h-[38px] flex items-center">
                  <CompactSwitch
                    label={t("startedWorking", "Đã vào làm việc")}
                    checked={form.inWorker === "yes"}
                    onChange={(val) => setForm({ ...form, inWorker: val ? "yes" : "no" })}
                  />
                </div>

                <div className="w-full sm:w-[190px] shrink-0">
                  <OutlinedSelect
                    label={t("returningCompany", "Công ty trở về")}
                    value={form.comp_return}
                    onChange={(e) => setForm({ ...form, comp_return: e.target.value })}
                  >
                    <option key="default-comp" value=""> {t("no", "Không")} </option>
                    {form.comp_return &&
                      !(hrmOptions.compReturns && hrmOptions.compReturns.length > 0 ? hrmOptions.compReturns : COMP_RETURN_OPTIONS).includes(form.comp_return) && (
                        <option key={`custom-comp-${form.comp_return}`} value={form.comp_return}>{form.comp_return}</option>
                      )}
                    {(hrmOptions.compReturns && hrmOptions.compReturns.length > 0 ? hrmOptions.compReturns : COMP_RETURN_OPTIONS).map((c) => (
                      <option key={`comp-${c}`} value={c}>
                        {c}
                      </option>
                    ))}
                  </OutlinedSelect>
                </div>

                <div className="flex-1 min-w-[180px]">
                  <OutlinedInput
                    type="text"
                    label={t("recordNotes", "Ghi chú hồ sơ")}
                    value={form.remark}
                    onChange={(e) => setForm({ ...form, remark: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CARD 4: THÔNG TIN NHÂN SỰ HRM & THAM SỐ (LOAD DYNAMIC TỪ DATABASE) */}
          {/* ========================================================================= */}
          <div className="bg-white dark:bg-[#18181C] border border-zinc-300 dark:border-[#383842] rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-300 dark:border-[#383842]">
              <div className="flex items-center space-x-2 text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                  4
                </span>
                <span className="text-purple-700 dark:text-purple-400 font-black text-xs uppercase tracking-wide">
                  {t("card4Title", "Thông Tin Nhân Sự HRM")}
                </span>
               
              </div>
            </div>

            <div className="space-y-4">
              {/* Row 1: Empno HRM, NewDept, Position, Deputy, Level, Parameters, Trial */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-3 gap-y-4">
                <div className="col-span-12 sm:col-span-6 xl:col-span-1">
                  <OutlinedInput
                    type="text"
                    label={t("hrmEmpno", "Mã NV HRM")}
                    value={form.empno_hrm}
                    onChange={(e) => setForm({ ...form, empno_hrm: e.target.value })}
                    className="tabular-nums font-bold text-purple-600 dark:text-purple-400"
                    title="Mã nhân viên HRM"
                  />
                </div>

                <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                  <div className="flex flex-col gap-1">
                    <OutlinedSelect
                      label={t("hrmDept", "Bộ phận HRM")}
                      value={form.newDept}
                      onChange={(e) => setForm({ ...form, newDept: e.target.value })}
                    >
                      <option value=""> {t("selectDept", "Chọn bộ phận")} </option>
                      {form.newDept &&
                        !filteredHrmDepts.some((d) => d.code === form.newDept || d.name === form.newDept) && (
                          <option value={form.newDept}>{form.newDept}</option>
                        )}
                      {filteredHrmDepts.map((hd, idx) => (
                        <option key={`${hd.code}-${hd.name}-${idx}`} value={hd.code}>
                          {hd.code}{hd.deptName && hd.deptName !== hd.code ? ` - ${hd.deptName}` : ""}
                        </option>
                      ))}
                    </OutlinedSelect>

                    {form.dept_apply && (
                      <div className="flex items-center justify-between px-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span className="truncate">
                          {showAllHrmDepts ? (
                            <span>{t("all", "Tất cả")} ({hrmOptions.depts.length} BP)</span>
                          ) : (
                            <span>
                              {t("filterCandidates", "Lọc theo:")}{" "}
                              <strong className="text-purple-600 dark:text-purple-400 font-semibold">
                                {form.dept_apply}
                              </strong>{" "}
                              ({filteredHrmDepts.length})
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAllHrmDepts(!showAllHrmDepts)}
                          className="text-purple-600 dark:text-purple-400 hover:underline font-semibold cursor-pointer shrink-0 ml-2"
                        >
                          {showAllHrmDepts
                            ? "Lọc theo BP ứng tuyển"
                            : `Hiện tất cả (${hrmOptions.depts.length})`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-12 sm:col-span-6 xl:col-span-2">
                  <OutlinedSelect
                    label={t("hrmPosition", "Vị trí HRM")}
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                  >
                    <option value=""> {t("selectPosition", "Chọn vị trí")} </option>
                    {form.position &&
                      !hrmOptions.positions.some((p) => p.code === form.position) && (
                        <option value={form.position}>
                          {hrmOptions.positions.find((p) => p.name.toLowerCase() === form.position.toLowerCase())?.name || form.position}
                        </option>
                      )}
                    {(hrmOptions.positions || []).map((hp, idx) => (
                      <option key={`pos-${hp.code || idx}-${idx}`} value={hp.code}>
                        {hp.name}
                      </option>
                    ))}
                  </OutlinedSelect>
                </div>

                <div className="col-span-12 sm:col-span-6 xl:col-span-2">
                  <OutlinedSelect
                    label={t("jobRank", "Cấp bậc (Rank)")}
                    value={form.deputy}
                    onChange={(e) => setForm({ ...form, deputy: e.target.value })}
                  >
                    <option value=""> {t("selectRank", "Chọn cấp bậc")} </option>
                    {form.deputy && !hrmOptions.ranks.includes(form.deputy) && (
                      <option value={form.deputy}>{form.deputy}</option>
                    )}
                    {(hrmOptions.ranks || []).map((d, idx) => (
                      <option key={`rank-${d}-${idx}`} value={d}>
                        {d}
                      </option>
                    ))}
                  </OutlinedSelect>
                </div>

                <div className="col-span-6 sm:col-span-3 xl:col-span-1">
                  <OutlinedSelect
                    label={t("jobLevelGrade", "Cấp độ")}
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                  >
                    <option value=""> {t("selectLevel", "Chọn cấp độ")} </option>
                    {form.level && !(hrmOptions.levels || []).includes(form.level) && (
                      <option value={form.level}>{form.level}</option>
                    )}
                    {(hrmOptions.levels || []).map((l, idx) => (
                      <option key={`level-${l}-${idx}`} value={l}>
                        {l}
                      </option>
                    ))}
                  </OutlinedSelect>
                </div>

                <div className="col-span-6 sm:col-span-3 xl:col-span-1">
                  <OutlinedSelect
                    label={t("jobParameters", "Tham số")}
                    value={form.parameters}
                    onChange={(e) => setForm({ ...form, parameters: e.target.value })}
                  >
                    <option value=""> {t("selectParameters", "Chọn tham số")} </option>
                    {form.parameters && !(hrmOptions.parameters || []).includes(form.parameters) && (
                      <option value={form.parameters}>{form.parameters}</option>
                    )}
                    {(hrmOptions.parameters || []).map((p, idx) => (
                      <option key={`param-${p}-${idx}`} value={p}>
                        {p}
                      </option>
                    ))}
                  </OutlinedSelect>
                </div>

                <div className="col-span-12 sm:col-span-6 xl:col-span-2">
                  <OutlinedSelect
                    label={t("probationDays", "Thử việc (ngày)")}
                    value={form.time_trial}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        time_trial: e.target.value ? Number(e.target.value) : ("" as unknown as number),
                      })
                    }
                  >
                    <option value=""> {t("selectTrial", "Chọn ngày")} </option>
                    {form.time_trial && !(hrmOptions.trials || []).includes(Number(form.time_trial)) && (
                      <option value={form.time_trial}>{form.time_trial} {t("daysCount", "ngày")}</option>
                    )}
                    {(hrmOptions.trials || []).map((trialDays, idx) => (
                      <option key={`trial-${trialDays}-${idx}`} value={trialDays}>
                        {trialDays} {t("daysCount", "ngày")}
                      </option>
                    ))}
                  </OutlinedSelect>
                </div>
              </div>

              {/* Row 2: Ethnicity, Marital, Nation, Nationality, Birth Prov, Reside Prov */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-3 gap-y-4">
                <div className="col-span-12 sm:col-span-6 xl:col-span-2">
                  <OutlinedSelect
                    label={t("ethnicity", "Dân tộc")}
                    value={form.dantoc}
                    onChange={(e) => setForm({ ...form, dantoc: e.target.value })}
                  >
                    <option value=""> {t("selectEthnicity", "Chọn dân tộc")} </option>
                    {form.dantoc &&
                      !(hrmOptions.dantocs || []).some((dt) => dt.code === form.dantoc) && (
                        <option value={form.dantoc}>
                          {(hrmOptions.dantocs || []).find((dt) => dt.name.toLowerCase() === form.dantoc.toLowerCase())?.name || form.dantoc}
                        </option>
                      )}
                    {(hrmOptions.dantocs || []).map((dt, idx) => (
                      <option key={`dt-${dt.code || idx}-${idx}`} value={dt.code}>
                        {dt.name}
                      </option>
                    ))}
                  </OutlinedSelect>
                </div>

                <div className="col-span-12 sm:col-span-6 xl:col-span-2">
                  <OutlinedSelect
                    label={t("maritalStatus", "Tình trạng hôn nhân")}
                    value={form.married}
                    onChange={(e) => setForm({ ...form, married: e.target.value })}
                  >
                    <option value=""> {t("selectMarital", "Chọn hôn nhân")} </option>
                    {form.married &&
                      !(hrmOptions.married || []).some((m) => m.code === form.married) && (
                        <option value={form.married}>
                          {(hrmOptions.married || []).find((m) => m.name.toLowerCase() === form.married.toLowerCase())?.name || form.married}
                        </option>
                      )}
                    {(hrmOptions.married || []).map((m, idx) => (
                      <option key={`married-${m.code || idx}-${idx}`} value={m.code}>
                        {m.name}
                      </option>
                    ))}
                  </OutlinedSelect>
                </div>

                <div className="col-span-6 sm:col-span-3 xl:col-span-1">
                  <OutlinedSelect
                    label={t("countryCode", "Mã QG")}
                    value={form.nation}
                    onChange={(e) => {
                      const newNation = e.target.value;
                      const matchedCountry = hrmOptions.countries?.find((c) => c.code === newNation);
                      setForm({
                        ...form,
                        nation: newNation,
                        ...(matchedCountry ? { nationality: matchedCountry.name } : newNation === "VN" ? { nationality: "Việt Nam" } : {}),
                      });
                    }}
                  >
                    <option value=""> {t("selectCountry", "Chọn mã QG")} </option>
                    {form.nation && !(hrmOptions.nations || []).includes(form.nation) && (
                      <option value={form.nation}>{form.nation}</option>
                    )}
                    {(hrmOptions.nations || []).map((n, idx) => (
                      <option key={`nation-${n}-${idx}`} value={n}>
                        {n}
                      </option>
                    ))}
                  </OutlinedSelect>
                </div>

                <div className="col-span-6 sm:col-span-3 xl:col-span-2">
                  <OutlinedSelect
                    label={t("nationality", "Quốc tịch")}
                    value={form.nationality}
                    onChange={(e) => {
                      const newNat = e.target.value;
                      const matchedCountry = hrmOptions.countries?.find((c) => c.name.toLowerCase() === newNat.toLowerCase());
                      setForm({
                        ...form,
                        nationality: newNat,
                        ...(matchedCountry
                          ? { nation: matchedCountry.code }
                          : /vi[ệe]t\s*nam/i.test(newNat)
                          ? { nation: "VN" }
                          : {}),
                      });
                    }}
                  >
                    <option value=""> {t("selectNationality", "Chọn quốc tịch")} </option>
                    {form.nationality &&
                      !(hrmOptions.nationalities || []).some((nt) => nt.toLowerCase() === form.nationality.toLowerCase()) && (
                        <option value={form.nationality}>{form.nationality}</option>
                      )}
                    {(hrmOptions.nationalities || []).map((nt, idx) => (
                      <option key={`nat-${nt}-${idx}`} value={nt}>
                        {nt}
                      </option>
                    ))}
                  </OutlinedSelect>
                </div>

                <div className="col-span-12 sm:col-span-6 xl:col-span-2">
                  <OutlinedSelect
                    label={t("birthProvince", "Tỉnh / TP Nơi sinh")}
                    value={form.birth_province}
                    onChange={(e) => setForm({ ...form, birth_province: e.target.value })}
                  >
                    <option value=""> {t("selectBirthProvince", "Chọn nơi sinh")} </option>
                    {form.birth_province &&
                      !(hrmOptions.provinces || []).some((p) => p.code === form.birth_province) && (
                        <option value={form.birth_province}>
                          {(hrmOptions.provinces || []).find((p) => p.name.toLowerCase() === form.birth_province.toLowerCase())?.name || form.birth_province}
                        </option>
                      )}
                    {(hrmOptions.provinces || []).map((p, idx) => (
                      <option key={`bp-${p.code || idx}-${idx}`} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </OutlinedSelect>
                </div>

                <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                  <OutlinedSelect
                    label={t("resideProvince", "Tỉnh / TP Cư trú")}
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                  >
                    <option value=""> {t("selectResideProvince", "Chọn nơi cư trú")} </option>
                    {form.province &&
                      !(hrmOptions.provinces || []).some((p) => p.code === form.province) && (
                        <option value={form.province}>
                          {(hrmOptions.provinces || []).find((p) => p.name.toLowerCase() === form.province.toLowerCase())?.name || form.province}
                        </option>
                      )}
                    {(hrmOptions.provinces || []).map((p, idx) => (
                      <option key={`p-${p.code || idx}-${idx}`} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </OutlinedSelect>
                </div>
              </div>

              {/* Row 3: Code MC, Work Location, Direct/Indirect, Category, Education, School, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-3 gap-y-4">
                <div className="col-span-6 sm:col-span-4 xl:col-span-2">
                  <OutlinedSelect
                    label={t("timekeepingSite", "Mã máy chấm công")}
                    value={form.code_mc}
                    onChange={(e) => setForm({ ...form, code_mc: e.target.value })}
                  >
                    <option value=""> {t("selectTimekeepingSite", "Chọn mã MCC")} </option>
                    {form.code_mc && !(hrmOptions.codeMcs || ["SCS006"]).includes(form.code_mc) && (
                      <option value={form.code_mc}>{form.code_mc}</option>
                    )}
                    {(hrmOptions.codeMcs && hrmOptions.codeMcs.length > 0 ? hrmOptions.codeMcs : ["SCS006"]).map((mc, idx) => (
                      <option key={`mc-${mc}-${idx}`} value={mc}>
                        {mc}
                      </option>
                    ))}
                  </OutlinedSelect>
                </div>

                <div className="col-span-6 sm:col-span-4 xl:col-span-1">
                  <OutlinedSelect
                    label={t("workArea", "Nơi làm việc")}
                    value={form.loc_work}
                    onChange={(e) => setForm({ ...form, loc_work: e.target.value })}
                  >
                    <option value=""> {t("selectWorkArea", "Chọn nơi LV")} </option>
                    {form.loc_work && !(hrmOptions.locWorks || ["AW"]).includes(form.loc_work) && (
                      <option value={form.loc_work}>{form.loc_work}</option>
                    )}
                    {(hrmOptions.locWorks && hrmOptions.locWorks.length > 0 ? hrmOptions.locWorks : ["AW"]).map((lw, idx) => (
                      <option key={`lw-${lw}-${idx}`} value={lw}>
                        {lw}
                      </option>
                    ))}
                  </OutlinedSelect>
                </div>

                <div className="col-span-12 sm:col-span-4 xl:col-span-2">
                  <OutlinedSelect
                    label={t("isDirect", "Trực tiếp / Gián tiếp")}
                    value={form.direct}
                    onChange={(e) => setForm({ ...form, direct: e.target.value })}
                  >
                    <option value=""> {t("selectIsDirect", "Chọn trực/gián tiếp")} </option>
                    {form.direct && !(hrmOptions.directs || []).some((d) => d.code === form.direct) && (
                      <option value={form.direct}>{form.direct}</option>
                    )}
                    {(hrmOptions.directs && hrmOptions.directs.length > 0
                      ? hrmOptions.directs
                      : [
                          { code: "0", name: "0 - Trực tiếp" },
                          { code: "1", name: "1 - Gián tiếp" },
                          { code: "3", name: "3 - Cán bộ" },
                        ]
                    ).map((d, idx) => (
                      <option key={`direct-${d.code}-${idx}`} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </OutlinedSelect>
                </div>

                <div className="col-span-6 sm:col-span-4 xl:col-span-1">
                  <OutlinedInput
                    type="text"
                    label={t("tmpCategory", "Loại NV")}
                    value={form.tmp_categoryid}
                    onChange={(e) => setForm({ ...form, tmp_categoryid: e.target.value })}
                  />
                </div>

                <div className="col-span-12 sm:col-span-8 xl:col-span-2">
                  <OutlinedSelect
                    label={t("education", "Trình độ học vấn")}
                    value={form.edu}
                    onChange={(e) => setForm({ ...form, edu: e.target.value })}
                  >
                    <option value=""> {t("education", "Chọn trình độ học vấn")} </option>
                    {form.edu &&
                      !hrmOptions.edus?.some((item) => item.code === form.edu) && (
                        <option value={form.edu}>
                          {hrmOptions.edus?.find((item) => item.name.toLowerCase() === form.edu.toLowerCase())?.name || form.edu}
                        </option>
                      )}
                    {(hrmOptions.edus && hrmOptions.edus.length > 0
                      ? hrmOptions.edus
                      : [
                          { code: "001", name: "Tiểu học (5 năm)" },
                          { code: "002", name: "THCS (9 năm)" },
                          { code: "003", name: "Dưới Lớp 12" },
                          { code: "004", name: "Tốt nghiệp 12 (Không có kinh nghiệm)" },
                          { code: "005", name: "Tốt nghiệp 12 (Có kinh nghiệm)" },
                          { code: "006", name: "Trung học CN" },
                          { code: "007", name: "Cao đẳng" },
                          { code: "008", name: "Đại Học" },
                          { code: "009", name: "Thạc Sĩ" },
                          { code: "010", name: "Tiến Sĩ" },
                        ]
                    ).map((e, idx) => (
                      <option key={`edu-${e.code || idx}-${idx}`} value={e.code}>
                        {e.name}
                      </option>
                    ))}
                  </OutlinedSelect>
                </div>

                <div className="col-span-12 sm:col-span-6 xl:col-span-2">
                  <OutlinedInput
                    type="text"
                    label={t("school", "Trường tốt nghiệp")}
                    value={form.school_gra}
                    onChange={(e) => setForm({ ...form, school_gra: e.target.value })}
                  />
                </div>

                <div className="col-span-12 sm:col-span-6 xl:col-span-2">
                  <OutlinedInput
                    type="email"
                    label={t("email", "Địa chỉ Email")}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM STICKY ACTION BAR */}
        {/* ========================================================================= */}
        <div className="pt-2 border border-[#d8dce2] dark:border-[#383842] bg-[#f1f3f6] dark:bg-[#18181C] px-3.5 py-2.5 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="h-9 px-3.5 rounded-md bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800 text-xs font-bold inline-flex items-center space-x-1.5 transition-colors disabled:opacity-50 shadow-xs"
              >
                <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>{deleting ? t("deletingCandidate", "Đang xóa...") : t("deleteCandidate", "Xóa hồ sơ")}</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/candidates"
              className="h-9 px-4 rounded-md bg-white hover:bg-zinc-50 dark:bg-[#202025] dark:hover:bg-[#2a2a32] border border-zinc-300 dark:border-[#383842] text-xs font-bold text-zinc-800 dark:text-zinc-200 inline-flex items-center justify-center transition-colors shadow-xs"
            >
              {t("back", "Quay lại")}
            </Link>

            <button
              type="button"
              onClick={handleReset}
              className="h-9 px-4 rounded-md bg-white hover:bg-zinc-50 dark:bg-[#202025] dark:hover:bg-[#2a2a32] border border-zinc-300 dark:border-[#383842] text-xs font-bold text-zinc-800 dark:text-zinc-200 inline-flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <RotateCcw className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              <span>{t("resetForm", "Nhập lại")}</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="h-9 px-5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 inline-flex items-center space-x-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <Save className="w-4 h-4 text-white" />
              <span className="text-white font-bold">{saving ? t("savingCandidate", "Đang lưu...") : isEditing ? t("updateCandidate", "Cập Nhật Hồ Sơ") : t("save", "Lưu")}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Hidden background receiver textarea for USB Barcode/QR Scanner (MC-9103) */}
      <textarea
        ref={hiddenScannerRef}
        id="hidden-usb-scanner-receiver"
        aria-hidden="true"
        tabIndex={-1}
        className="fixed -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none p-0 m-0 border-0 outline-none"
        defaultValue=""
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      {/* ========================================================================= */}
      {/* MODAL QUÉT MÃ QR CCCD CHUYÊN DỤNG (TƯƠNG TỰ APP CŨ) */}
      {/* ========================================================================= */}
      {qrModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setQrModalOpen(false);
              setQrModalInput("");
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-[#26262C] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-[#26262C] bg-cyan-600 dark:bg-cyan-700 text-white">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider">
                <QrCode className="w-4 h-4 text-white" />
                <span>{t("scanQrCccd")}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQrModalOpen(false);
                  setQrModalInput("");
                }}
                className="p-1 rounded-md text-cyan-100 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t("scanQrPrompt")}
                </label>
                <textarea
                  ref={qrInputRef}
                  autoFocus
                  rows={4}
                  value={qrModalInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQrModalInput(val);
                    if (val.includes("|")) {
                      const ok = handleApplyScannedCccd(val);
                      if (ok) {
                        setQrModalOpen(false);
                        setQrModalInput("");
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const ok = handleApplyScannedCccd(qrModalInput);
                      if (ok) {
                        setQrModalOpen(false);
                        setQrModalInput("");
                      }
                    }
                  }}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 custom-scrollbar"
                />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={isConnected ? disconnect : connect}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors inline-flex items-center space-x-1.5 ${
                    isConnected
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200"
                  }`}
                  title="Web Serial"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{isConnected ? t("connected") : t("connectCom")}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQrModalOpen(false);
                      setQrModalInput("");
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 transition-colors"
                  >
                    {t("close")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (qrModalInput) {
                        const ok = handleApplyScannedCccd(qrModalInput);
                        if (ok) {
                          setQrModalOpen(false);
                          setQrModalInput("");
                        }
                      }
                    }}
                    disabled={!qrModalInput.trim()}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 transition-colors shadow-xs"
                  >
                    {t("detectAndFillForm")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CHỌN NHU CẦU TUYỂN DỤNG (SELECT DEMAND) */}
      {/* ========================================================================= */}
      {demandModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDemandModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3"
        >
          <div className="bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-[#26262C] rounded-2xl w-[96vw] max-w-[1550px] h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-[#26262C] shrink-0">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-500">
                <Briefcase className="w-4 h-4" />
                <span>{t("openDemandsList")} ({finalDemandList.length} {t("demandsCountUnit")})</span>
              </div>
              <button
                type="button"
                onClick={() => setDemandModalOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Search & Global Toolbar */}
            <div className="px-4 py-2.5 bg-zinc-50 dark:bg-[#131316] border-b border-zinc-200 dark:border-[#26262C] flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex-1 max-w-md flex items-center gap-2 bg-white dark:bg-[#18181C] border border-zinc-300 dark:border-[#383842] rounded-lg px-2.5 py-1.5 shadow-2xs">
                <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  value={demandSearch}
                  onChange={(e) => setDemandSearch(e.target.value)}
                  className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
                  autoFocus
                />
                {demandSearch && (
                  <button
                    type="button"
                    onClick={() => setDemandSearch("")}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyRemainingDemand}
                    onChange={(e) => setOnlyRemainingDemand(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-zinc-300 dark:border-zinc-700 cursor-pointer"
                  />
                  <span>{t("onlyRemainingDemandLabel")}</span>
                </label>

                {activeFilterCount > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300">
                    <span>{t("filteringCols")} {activeFilterCount} {t("columnsCount")}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    resetAllExcelFilters();
                    setDemandSearch("");
                  }}
                  className="h-8 px-3 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t("clearFilters")}</span>
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-auto custom-scrollbar relative border-t border-zinc-200 dark:border-[#26262C]">
              <table className="w-full text-left text-xs border-collapse min-w-[1300px]">
                <thead className="sticky top-0 z-20 shadow-xs">
                  {/* Single Row: Column Titles with Excel Filter Trigger Popovers */}
                  <tr className="bg-zinc-100 dark:bg-[#1a1a20] border-b border-zinc-300 dark:border-[#383842] text-[11px] font-bold text-zinc-700 dark:text-zinc-200">
                    <th className="py-2.5 px-3 whitespace-nowrap bg-zinc-100 dark:bg-[#1a1a20]">
                      <ExcelColumnFilter
                        title={t("mprCode")}
                        columnKey="mprCode"
                        distinctValues={getDistinctValues("mprCode")}
                        selectedValues={excelFilters["mprCode"]}
                        onFilterChange={(v) => setExcelFilter("mprCode", v)}
                        sortDirection={excelSortConfig?.key === "mprCode" ? excelSortConfig.direction : null}
                        onSortChange={(dir) => setExcelSort("mprCode", dir)}
                      />
                    </th>
                    <th className="py-2.5 px-3 whitespace-nowrap bg-zinc-100 dark:bg-[#1a1a20]">
                      <ExcelColumnFilter
                        title={t("department")}
                        columnKey="dem_dept"
                        distinctValues={getDistinctValues("dem_dept")}
                        selectedValues={excelFilters["dem_dept"]}
                        onFilterChange={(v) => setExcelFilter("dem_dept", v)}
                        sortDirection={excelSortConfig?.key === "dem_dept" ? excelSortConfig.direction : null}
                        onSortChange={(dir) => setExcelSort("dem_dept", dir)}
                      />
                    </th>
                    <th className="py-2.5 px-3 whitespace-nowrap bg-zinc-100 dark:bg-[#1a1a20]">
                      <ExcelColumnFilter
                        title={t("unit")}
                        columnKey="dem_unit"
                        distinctValues={getDistinctValues("dem_unit")}
                        selectedValues={excelFilters["dem_unit"]}
                        onFilterChange={(v) => setExcelFilter("dem_unit", v)}
                        sortDirection={excelSortConfig?.key === "dem_unit" ? excelSortConfig.direction : null}
                        onSortChange={(dir) => setExcelSort("dem_unit", dir)}
                      />
                    </th>
                    <th className="py-2.5 px-3 whitespace-nowrap bg-zinc-100 dark:bg-[#1a1a20]">
                      <ExcelColumnFilter
                        title={t("position")}
                        columnKey="dem_position"
                        distinctValues={getDistinctValues("dem_position")}
                        selectedValues={excelFilters["dem_position"]}
                        onFilterChange={(v) => setExcelFilter("dem_position", v)}
                        sortDirection={excelSortConfig?.key === "dem_position" ? excelSortConfig.direction : null}
                        onSortChange={(dir) => setExcelSort("dem_position", dir)}
                      />
                    </th>
                    <th className="py-2.5 px-3 whitespace-nowrap bg-zinc-100 dark:bg-[#1a1a20]">
                      <ExcelColumnFilter
                        title={t("subPositionCol")}
                        columnKey="dem_sub_position"
                        distinctValues={getDistinctValues("dem_sub_position")}
                        selectedValues={excelFilters["dem_sub_position"]}
                        onFilterChange={(v) => setExcelFilter("dem_sub_position", v)}
                        sortDirection={excelSortConfig?.key === "dem_sub_position" ? excelSortConfig.direction : null}
                        onSortChange={(dir) => setExcelSort("dem_sub_position", dir)}
                      />
                    </th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap bg-zinc-100 dark:bg-[#1a1a20]">
                      <ExcelColumnFilter
                        title={t("amount")}
                        columnKey="dem_amount"
                        align="center"
                        dataType="number"
                        distinctValues={getDistinctValues("dem_amount")}
                        selectedValues={excelFilters["dem_amount"]}
                        onFilterChange={(v) => setExcelFilter("dem_amount", v)}
                        sortDirection={excelSortConfig?.key === "dem_amount" ? excelSortConfig.direction : null}
                        onSortChange={(dir) => setExcelSort("dem_amount", dir)}
                      />
                    </th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap bg-zinc-100 dark:bg-[#1a1a20]">
                      <ExcelColumnFilter
                        title={t("recruited")}
                        columnKey="dem_recruited"
                        align="center"
                        dataType="number"
                        distinctValues={getDistinctValues("dem_recruited")}
                        selectedValues={excelFilters["dem_recruited"]}
                        onFilterChange={(v) => setExcelFilter("dem_recruited", v)}
                        sortDirection={excelSortConfig?.key === "dem_recruited" ? excelSortConfig.direction : null}
                        onSortChange={(dir) => setExcelSort("dem_recruited", dir)}
                      />
                    </th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap bg-zinc-100 dark:bg-[#1a1a20]">
                      <ExcelColumnFilter
                        title={t("remainingNeeded")}
                        columnKey="stocknumber"
                        align="center"
                        dataType="number"
                        distinctValues={getDistinctValues("stocknumber")}
                        selectedValues={excelFilters["stocknumber"]}
                        onFilterChange={(v) => setExcelFilter("stocknumber", v)}
                        sortDirection={excelSortConfig?.key === "stocknumber" ? excelSortConfig.direction : null}
                        onSortChange={(dir) => setExcelSort("stocknumber", dir)}
                      />
                    </th>
                    <th className="py-2.5 px-3 whitespace-nowrap bg-zinc-100 dark:bg-[#1a1a20]">
                      <ExcelColumnFilter
                        title={t("inputDateCol")}
                        columnKey="inputDate"
                        dataType="date"
                        distinctValues={getDistinctValues("inputDate")}
                        selectedValues={excelFilters["inputDate"]}
                        onFilterChange={(v) => setExcelFilter("inputDate", v)}
                        sortDirection={excelSortConfig?.key === "inputDate" ? excelSortConfig.direction : null}
                        onSortChange={(dir) => setExcelSort("inputDate", dir)}
                      />
                    </th>
                    <th className="py-2.5 px-3 whitespace-nowrap bg-zinc-100 dark:bg-[#1a1a20]">
                      <ExcelColumnFilter
                        title={t("note")}
                        columnKey="dem_note"
                        distinctValues={getDistinctValues("dem_note")}
                        selectedValues={excelFilters["dem_note"]}
                        onFilterChange={(v) => setExcelFilter("dem_note", v)}
                        sortDirection={excelSortConfig?.key === "dem_note" ? excelSortConfig.direction : null}
                        onSortChange={(dir) => setExcelSort("dem_note", dir)}
                      />
                    </th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap bg-zinc-100 dark:bg-[#1a1a20]">
                      {t("actionCol")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-[#26262C]">
                  {finalDemandList.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-16 text-center text-zinc-400 text-xs font-medium">
                        {demandList.length === 0
                          ? t("noDemandsOpen")
                          : t("noDemandsMatchedFilter")}
                      </td>
                    </tr>
                  ) : (
                    finalDemandList.map((d, idx) => {
                      const mprCode =
                        d.id_code ||
                        (d.mprId
                          ? String(d.mprId).startsWith("HR-") || String(d.mprId).startsWith("MPR-")
                            ? String(d.mprId)
                            : `MPR-${d.mprId}`
                          : `DM-${d.id}`);
                      const deptCode = d.dem_dept || "-";
                      const unitName = d.dem_unit || d.dem_sub_department || "-";
                      const positionName = d.dem_position || d.duty || "-";
                      const subPosName =
                        d.dem_sub_position && d.dem_sub_position !== "-"
                          ? d.dem_sub_position
                          : "";
                      const demandQty = d.dem_amount ?? d.demandQty ?? 0;
                      const recruitedQty = d.dem_recruited ?? d.recruitedQty ?? 0;
                      const needed =
                        d.stocknumber ?? Math.max(0, Number(demandQty) - Number(recruitedQty));
                      const inputDateDisplay = d.dem_inputdate
                        ? String(d.dem_inputdate).split("T")[0]
                        : d.key_in
                        ? String(d.key_in).split("T")[0]
                        : "-";

                      return (
                        <tr
                          key={`demand-row-${d.id ?? mprCode}-${idx}`}
                          className="hover:bg-zinc-50 dark:hover:bg-[#202025] transition-colors"
                        >
                          {/* 1. MPR ID */}
                          <td className="py-2.5 px-3 font-medium text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                            {mprCode}
                          </td>
                          {/* 2. Bộ phận */}
                          <td className="py-2.5 px-3 font-medium text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                            {deptCode}
                          </td>
                          {/* 3. Đơn vị */}
                          <td className="py-2.5 px-3 font-medium text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                            {unitName}
                          </td>
                          {/* 4. Vị trí */}
                          <td className="py-2.5 px-3 font-medium text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                            {positionName}
                          </td>
                          {/* 5. Vị trí phụ */}
                          <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                            {subPosName || ""}
                          </td>
                          {/* 6. Số lượng */}
                          <td className="py-2.5 px-3 text-center tabular-nums text-zinc-800 dark:text-zinc-200">
                            {demandQty}
                          </td>
                          {/* 7. Đã tuyển */}
                          <td className="py-2.5 px-3 text-center tabular-nums text-zinc-800 dark:text-zinc-200">
                            {recruitedQty}
                          </td>
                          {/* 8. Số lượng còn thiếu */}
                          <td className="py-2.5 px-3 text-center font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                            {needed}
                          </td>
                          {/* 9. Ngày nhập */}
                          <td className="py-2.5 px-3 tabular-nums text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                            {inputDateDisplay}
                          </td>
                          {/* 10. Ghi chú */}
                          <td className="py-2.5 px-3">
                            {d.dem_note ? (
                              <span
                                className="inline-block max-w-[220px] truncate px-2.5 py-0.5 rounded text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800"
                                title={d.dem_note}
                              >
                                {d.dem_note}
                              </span>
                            ) : null}
                          </td>
                          {/* 11. Hành động */}
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                const demandDept = d.dem_dept || form.dept_apply;
                                let suggestedDept = "";
                                if (demandDept) {
                                  const target = demandDept.trim().toLowerCase();
                                  const matchingUnits = hrmOptions.depts.filter((hd) => {
                                    const div = (hd.div || "").trim().toLowerCase();
                                    const code = (hd.code || "").trim().toLowerCase();
                                    return div === target || code === target || code.startsWith(target);
                                  });
                                  const exact = matchingUnits.find(
                                    (hd) => (hd.code || "").trim().toLowerCase() === target
                                  );
                                  suggestedDept = exact ? exact.code : matchingUnits.length > 0 ? matchingUnits[0].code : "";
                                }
                                setForm((prev) => ({
                                  ...prev,
                                  loc: "aw",
                                  dept_apply: d.dem_dept || prev.dept_apply,
                                  loc_apply: positionName !== "-" ? positionName : prev.loc_apply,
                                  dm_id: mprCode,
                                  dm_Subpos: subPosName || prev.dm_Subpos,
                                  newDept: suggestedDept || prev.newDept,
                                }));
                                setShowAllHrmDepts(false);
                                setDemandModalOpen(false);
                              }}
                              className="h-7 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{t("selectAction")}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: LỊCH SỬ THÔI VIỆC & LÀM VIỆC (RESIGNATION & WORK HISTORY) */}
      {/* ========================================================================= */}
      {resignModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setResignModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 overflow-y-auto"
        >
          <div className="bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-[#26262C] rounded-2xl max-w-5xl xl:max-w-6xl 2xl:max-w-7xl w-full overflow-hidden shadow-2xl my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-200 dark:border-[#26262C] bg-zinc-50/50 dark:bg-[#151518]">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <History className="w-4 h-4" />
                <span>
                  {t("candidateHistoryTitle")} - {historyResult?.candidateName || resignData[0]?.er_name || form.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setResignModalOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 space-y-3 max-h-[75vh] overflow-y-auto">
              {/* Table 1: Resignation History (resign_data) */}
              {resignData && resignData.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                      {t("resignDetailTitle")} ({resignData.length})
                    </span>
                    <span className="text-[10px] text-zinc-400">{t("clickSelectToFillOldEmpno")}</span>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-[#26262C]">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-[#1a1a1f] border-b border-zinc-200 dark:border-[#26262C] text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
                          <th className="py-1.5 px-2 w-16 whitespace-nowrap">{t("empnoCard")}</th>
                          <th className="py-1.5 px-2 w-28 whitespace-nowrap">{t("fullName")}</th>
                          <th className="py-1.5 px-2 w-20 whitespace-nowrap">{t("deptApplied")}</th>
                          <th className="py-1.5 px-2">{t("department")}</th>
                          <th className="py-1.5 px-2 w-20 whitespace-nowrap">{t("jobLevel")}</th>
                          <th className="py-1.5 px-2 w-20 text-center whitespace-nowrap">{t("keyInDate")}</th>
                          <th className="py-1.5 px-2 w-20 text-center whitespace-nowrap">{t("resignDate")}</th>
                          <th className="py-1.5 px-2 min-w-[100px] text-center whitespace-nowrap">{t("seniority")}</th>
                          <th className="py-1.5 px-2 min-w-[120px]">{t("resignReason")}</th>
                          <th className="py-1.5 px-2 min-w-[160px]">{t("note")}</th>
                          <th className="py-1.5 px-2 text-center w-14 whitespace-nowrap">{t("actionCol")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-[#26262C]">
                        {resignData.map((r: any, idx: number) => (
                          <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-[#1e1e23] transition-colors">
                            <td className="py-1.5 px-2 tabular-nums font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                              {r.er_empid || "-"}
                            </td>
                            <td className="py-1.5 px-2 font-medium text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                              {r.er_name || historyResult?.candidateName || form.name || "-"}
                            </td>
                            <td className="py-1.5 px-2 tabular-nums text-zinc-600 dark:text-zinc-400 whitespace-nowrap font-medium">
                              {r.er_deptid || "-"}
                            </td>
                            <td className="py-1.5 px-2 text-zinc-800 dark:text-zinc-200 leading-tight">
                              <div>{r.er_deptname || r.er_deptid || "-"}</div>
                            </td>
                            <td className="py-1.5 px-2 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                              {r.er_joblevel || "-"}
                            </td>
                            <td className="py-1.5 px-2 tabular-nums text-zinc-600 dark:text-zinc-400 text-center whitespace-nowrap">
                              {r.er_indate ? new Date(r.er_indate).toLocaleDateString("vi-VN") : "-"}
                            </td>
                            <td className="py-1.5 px-2 tabular-nums font-semibold text-rose-600 dark:text-rose-400 text-center whitespace-nowrap">
                              {r.er_resigndate ? new Date(r.er_resigndate).toLocaleDateString("vi-VN") : "-"}
                            </td>
                            <td className="py-1.5 px-2 text-center font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                              {r.er_seniority || "-"}
                            </td>
                            <td className="py-1.5 px-2 text-zinc-700 dark:text-zinc-300 font-medium">
                              {r.er_reason || "-"}
                            </td>
                            <td className="py-1.5 px-2 text-zinc-700 dark:text-zinc-300 leading-tight">
                              {r.er_note ? (
                                <div
                                  onClick={() => setSelectedFullNote(r.er_note)}
                                  title="Ghi chú"
                                  className="text-[11px] whitespace-pre-wrap break-words max-w-[260px] cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                                >
                                  {r.er_note}
                                </div>
                              ) : (
                                <span className="text-zinc-400 text-[10px]">-</span>
                              )}
                            </td>
                            <td className="py-1.5 px-2 text-center whitespace-nowrap">
                              {r.er_empid && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setForm((prev) => ({
                                      ...prev,
                                      empno_old: r.er_empid,
                                      inVG: prev.inVG && prev.inVG !== "0" ? prev.inVG : ``,
                                    }));
                                    setResignModalOpen(false);
                                  }}
                                  className="h-5 px-2 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-[10px] font-semibold transition-colors"
                                >
                                  {t("selectAction")}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Table 2: Past Employment Records (empno_info) */}
              {historyResult?.records && historyResult.records.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 px-0.5">
                    <Building className="w-3.5 h-3.5 text-amber-500" />
                    {t("employmentHistoryTitle")} ({historyResult.records.length})
                  </span>

                  <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-[#26262C]">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-[#1a1a1f] border-b border-zinc-200 dark:border-[#26262C] text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
                          <th className="py-1.5 px-2 w-16 whitespace-nowrap">{t("empnoCard")}</th>
                          <th className="py-1.5 px-2 w-28 whitespace-nowrap">{t("fullName")}</th>
                          <th className="py-1.5 px-2 w-16 whitespace-nowrap">{t("unit")}</th>
                          <th className="py-1.5 px-2">{t("department")}</th>
                          <th className="py-1.5 px-2 w-24 whitespace-nowrap">{t("position")}</th>
                          <th className="py-1.5 px-2 w-24 text-center whitespace-nowrap">{t("actualDate")}</th>
                          <th className="py-1.5 px-2 text-center w-14 whitespace-nowrap">{t("actionCol")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-[#26262C]">
                        {historyResult.records.map((r: any, idx: number) => (
                          <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-[#1e1e23] transition-colors">
                            <td className="py-1.5 px-2 tabular-nums font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                              {r.empno || "-"}
                            </td>
                            <td className="py-1.5 px-2 font-medium text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                              {r.candidateName || historyResult?.candidateName || form.name || "-"}
                            </td>
                            <td className="py-1.5 px-2 uppercase font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                              {r.loc || "-"}
                            </td>
                            <td className="py-1.5 px-2 text-zinc-800 dark:text-zinc-200">
                              {r.dept || "-"}
                            </td>
                            <td className="py-1.5 px-2 text-zinc-600 dark:text-zinc-400">
                              {r.duty || "-"}
                            </td>
                            <td className="py-1.5 px-2 tabular-nums text-zinc-600 dark:text-zinc-400 text-center whitespace-nowrap">
                              {r.inDate ? new Date(r.inDate).toLocaleDateString("vi-VN") : "-"}
                            </td>
                            <td className="py-1.5 px-2 text-center whitespace-nowrap">
                              {r.empno && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setForm((prev) => ({
                                      ...prev,
                                      empno_old: r.empno,
                                      inVG: prev.inVG && prev.inVG !== "Không" ? prev.inVG : ``,
                                    }));
                                    setResignModalOpen(false);
                                  }}
                                  className="h-5 px-2 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-[10px] font-semibold transition-colors"
                                >
                                  {t("selectAction")}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-zinc-50 dark:bg-[#131316] border-t border-zinc-200 dark:border-[#26262C] flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">
              </span>
              <button
                type="button"
                onClick={() => setResignModalOpen(false)}
                className="h-8 px-4 rounded-md bg-zinc-200 dark:bg-[#202025] hover:bg-zinc-300 dark:hover:bg-[#2a2a32] text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Dialog: Chi tiết ghi chú thôi việc */}
      {selectedFullNote && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedFullNote(null);
          }}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3"
        >
          <div className="bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-[#26262C] rounded-xl max-w-md w-full overflow-hidden shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#26262C] pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-500" />
                {t("resignNotesTitle")}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedFullNote(null)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {selectedFullNote}
            </p>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedFullNote(null)}
                className="h-7 px-3 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-[#26262C] dark:hover:bg-[#323238] text-xs font-semibold text-zinc-700 dark:text-zinc-200"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: THÊM & QUẢN LÝ NGUỒN TUYỂN DỤNG (3 NGÔN NGỮ: VI, EN, CN) */}
      {/* ========================================================================= */}
      {newSourceModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setNewSourceModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 overflow-y-auto"
        >
          <div className="bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-[#26262C] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-[#26262C] bg-zinc-50/50 dark:bg-[#151518]">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span>
                  {editingSourceId ? t("updateSourceTitle") : t("addNewSourceTitle")} ({t("threeLanguages")})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewSourceModalOpen(false);
                  setEditingSourceId(null);
                  setSourceMessage(null);
                }}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              {/* Alert message */}
              {sourceMessage && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
                    sourceMessage.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                  }`}
                >
                  <span>{sourceMessage.text}</span>
                  <button
                    type="button"
                    onClick={() => setSourceMessage(null)}
                    className="text-xs hover:opacity-75 ml-2"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* 3-Language Input Form */}
              <div className="bg-zinc-50 dark:bg-[#131316] p-4 rounded-xl border border-zinc-200 dark:border-[#26262C] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* VI */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between mb-1.5">
                      <span>Tiếng Việt <span className="text-rose-500">*</span></span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                        VI
                      </span>
                    </label>
                    <input
                      type="text"
                      value={newSourceVI}
                      onChange={(e) => setNewSourceVI(e.target.value)}
                      className="w-full h-[38px] rounded-lg bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-[#26262C] px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>

                  {/* EN */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between mb-1.5">
                      <span>Tiếng Anh</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400">
                        EN
                      </span>
                    </label>
                    <input
                      type="text"
                      value={newSourceEN}
                      onChange={(e) => setNewSourceEN(e.target.value)}
                      className="w-full h-[38px] rounded-lg bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-[#26262C] px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>

                  {/* CN */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between mb-1.5">
                      <span>Tiếng Trung</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        CN
                      </span>
                    </label>
                    <input
                      type="text"
                      value={newSourceCN}
                      onChange={(e) => setNewSourceCN(e.target.value)}
                      className="w-full h-[38px] rounded-lg bg-white dark:bg-[#18181C] border border-zinc-200 dark:border-[#26262C] px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {editingSourceId ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        {t("editingCode")} #{editingSourceId}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center space-x-2">
                    {editingSourceId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSourceId(null);
                          setNewSourceVI("");
                          setNewSourceEN("");
                          setNewSourceCN("");
                        }}
                        className="h-8 px-3 rounded-lg bg-zinc-200 dark:bg-[#202025] hover:bg-zinc-300 dark:hover:bg-[#2a2a32] text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
                      >
                        {t("cancelEdit")}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setNewSourceVI("");
                        setNewSourceEN("");
                        setNewSourceCN("");
                      }}
                      className="h-8 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#202025] dark:hover:bg-[#2a2a32] text-xs font-semibold text-zinc-700 dark:text-zinc-300 inline-flex items-center space-x-1 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t("clearWhite")}</span>
                    </button>
                    <button
                      type="button"
                      disabled={savingNewSource || !newSourceVI.trim()}
                      onClick={async () => {
                        if (!newSourceVI.trim()) {
                          setSourceMessage({
                            type: "error",
                            text: "Vui lòng nhập tên nguồn tuyển dụng (Tiếng Việt)",
                          });
                          return;
                        }
                        setSavingNewSource(true);
                        setSourceMessage(null);
                        try {
                          const isEdit = Boolean(editingSourceId);
                          const url = "/api/candidates/source-recruits";
                          const method = isEdit ? "PUT" : "POST";
                          const payload: any = {
                            vi: newSourceVI.trim(),
                            en: newSourceEN.trim() || newSourceVI.trim(),
                            cn: newSourceCN.trim() || newSourceVI.trim(),
                          };
                          if (isEdit) {
                            payload.id = editingSourceId;
                          }

                          const res = await fetch(url, {
                            method,
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                          });
                          const data = await res.json();
                          if (!res.ok || !data.success) {
                            throw new Error(data.error || "Lỗi lưu nguồn tuyển dụng");
                          }

                          const savedItem: HrmOptionItem = data.data;
                          if (isEdit) {
                            setSourcesList((prev) =>
                              prev.map((s) => (s.code === savedItem.code ? savedItem : s))
                            );
                            setSourceMessage({ type: "success", text: "Cập nhật thành công!" });
                          } else {
                            setSourcesList((prev) => [...prev, savedItem]);
                            setForm((prev) => ({ ...prev, source_recruit: savedItem.code }));
                            setSourceMessage({
                              type: "success",
                              text: `Đã thêm "${savedItem.name}" và chọn cho hồ sơ!`,
                            });
                          }

                          setNewSourceVI("");
                          setNewSourceEN("");
                          setNewSourceCN("");
                          setEditingSourceId(null);
                        } catch (err: any) {
                          setSourceMessage({ type: "error", text: err.message || "Lỗi xử lý" });
                        } finally {
                          setSavingNewSource(false);
                        }
                      }}
                      className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50 inline-flex items-center space-x-1.5 transition-colors shadow-xs"
                    >
                      {savingNewSource ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{t("savingCandidate")}</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>{editingSourceId ? t("saveChanges") : t("addSourceBtn")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Existing Sources Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 tracking-tight flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{t("existingSourcesList")} ({sourcesList.length})</span>
                  </h3>
                  <span className="text-[11px] text-zinc-400">
                    {t("clickSelectToAssign")}
                  </span>
                </div>

                <div className="border border-zinc-200 dark:border-[#26262C] rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-zinc-100/75 dark:bg-[#1f1f25] sticky top-0 z-10 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-[#26262C]">
                      <tr>
                        <th className="py-2 px-3 w-12 text-center">{t("sourceCode")}</th>
                        <th className="py-2 px-3">Tiếng Việt</th>
                        <th className="py-2 px-3">Tiếng Anh</th>
                        <th className="py-2 px-3">Tiếng Trung</th>
                        <th className="py-2 px-3 text-right">{t("actionCol")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-[#26262C] bg-white dark:bg-[#18181C]">
                      {sourcesList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-zinc-400">
                            {t("noSourceData")}
                          </td>
                        </tr>
                      ) : (
                        sourcesList.map((s, idx) => {
                          const code = typeof s === "string" ? s : (s.code || s.name || `${idx}`);
                          const isSelected = form.source_recruit === code;
                          const isBeingEdited = editingSourceId === code;

                          return (
                            <tr
                              key={`modal-source-row-${code}-${idx}`}
                              className={`hover:bg-zinc-50 dark:hover:bg-[#1f1f25] transition-colors ${
                                isSelected
                                  ? "bg-emerald-50/60 dark:bg-emerald-950/20"
                                  : isBeingEdited
                                  ? "bg-amber-50/60 dark:bg-amber-950/20"
                                  : ""
                              }`}
                            >
                              <td className="py-2 px-3 text-center text-zinc-500 font-mono text-[11px]">
                                {s.code}
                              </td>
                              <td className="py-2 px-3 font-semibold text-zinc-900 dark:text-zinc-100">
                                <div className="flex items-center gap-1.5">
                                  <span>{s.name_vi || s.name}</span>
                                  {isSelected && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                      {t("currentlySelected")}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2 px-3 text-zinc-600 dark:text-zinc-300">
                                {s.name_en || "-"}
                              </td>
                              <td className="py-2 px-3 text-zinc-600 dark:text-zinc-300 font-sans">
                                {s.name_cn || "-"}
                              </td>
                              <td className="py-2 px-3 text-right whitespace-nowrap">
                                <div className="inline-flex items-center space-x-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setForm((prev) => ({ ...prev, source_recruit: s.code }));
                                      setNewSourceModalOpen(false);
                                    }}
                                    className={`h-6 px-2 rounded text-[11px] font-semibold transition-colors ${
                                      isSelected
                                        ? "bg-emerald-600 text-white"
                                        : "bg-zinc-100 hover:bg-emerald-50 dark:bg-[#202025] dark:hover:bg-emerald-950/40 text-zinc-700 hover:text-emerald-600 dark:text-zinc-300"
                                    }`}
                                  >
                                    {t("selectAction")}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingSourceId(s.code);
                                      setNewSourceVI(s.name_vi || s.name || "");
                                      setNewSourceEN(s.name_en || "");
                                      setNewSourceCN(s.name_cn || "");
                                      setSourceMessage(null);
                                    }}
                                    className="p-1 rounded text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    title="Chỉnh sửa nguồn"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDialog({
                                        isOpen: true,
                                        type: "danger",
                                        title: "Xác Nhận Xóa Nguồn Tuyển Dụng",
                                        message: `Bạn có chắc muốn xóa nguồn "${s.name_vi || s.name}"?`,
                                        confirmText: "Xóa nguồn",
                                        cancelText: "Hủy bỏ",
                                        showCancel: true,
                                        onConfirm: async () => {
                                          try {
                                            const res = await fetch(
                                              `/api/candidates/source-recruits?id=${s.code}`,
                                              { method: "DELETE" }
                                            );
                                            const data = await res.json();
                                            if (!res.ok || !data.success) {
                                              throw new Error(data.error || "Lỗi xóa");
                                            }
                                            setSourcesList((prev) =>
                                              prev.filter((item) => item.code !== s.code)
                                            );
                                            if (form.source_recruit === s.code) {
                                              setForm((prev) => ({ ...prev, source_recruit: "" }));
                                            }
                                            setSourceMessage({
                                              type: "success",
                                              text: "Đã xóa nguồn thành công!",
                                            });
                                          } catch (err: any) {
                                            setDialog({
                                              isOpen: true,
                                              type: "danger",
                                              title: "Lỗi Khi Xóa Nguồn",
                                              message: err.message || "Lỗi khi xóa nguồn tuyển dụng",
                                              confirmText: "Đóng",
                                            });
                                          }
                                        },
                                      });
                                    }}
                                    className="p-1 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                    title="Xóa nguồn"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end px-5 py-3 border-t border-zinc-200 dark:border-[#26262C] bg-zinc-50/50 dark:bg-[#151518]">
              <button
                type="button"
                onClick={() => {
                  setNewSourceModalOpen(false);
                  setEditingSourceId(null);
                  setSourceMessage(null);
                }}
                className="h-8 px-4 rounded-lg bg-zinc-200 dark:bg-[#202025] hover:bg-zinc-300 dark:hover:bg-[#2a2a32] text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Themed Dialog replacing native alert & confirm */}
      <AppDialog
        options={dialog}
        onClose={() => setDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default function CandidateFormPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full min-h-screen flex items-center justify-center p-6 text-xs text-zinc-500 bg-[#eaedf0] dark:bg-[#121214]">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500 mr-2" /> Đang tải biểu mẫu ứng viên...
        </div>
      }
    >
      <CandidateFormContent />
    </Suspense>
  );
}
