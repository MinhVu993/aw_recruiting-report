import * as XLSX from "xlsx";

/**
 * Format Date sang chuoi hien thi tren Excel (dd/mm/yyyy)
 */
export function formatExcelDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN");
}

/**
 * Xuat mang du lieu ra file Excel (.xlsx) chuan
 */
export function exportCandidatesToExcel(candidates: any[], fileName: string = "Danh_Sach_Ung_Vien") {
  const formattedData = candidates.map((c, idx) => ({
    "STT": idx + 1,
    "Họ và Tên": c.candidateName,
    "Mã Thẻ (EMPNO)": c.empno || "",
    "Số CCCD": c.cccd,
    "Ngày Sinh": formatExcelDate(c.dateOfBirth),
    "Giới Tính": c.gender || "Nam",
    "Số Điện Thoại": c.phone || "",
    "Bp. duyệt": (c.loc === "vg" ? "DMC" : (c.loc || "DMC")).toUpperCase(),
    "Phòng Ban / Bp. duyệt Con": c.dept || "",
    "Chức Danh": c.duty || "",
    "Quê Quán": c.birthProvince || "",
    "Địa Chỉ Thường Trú": c.addressPermanent || "",
    "Ngày vào làm": formatExcelDate(c.inDate),
    "Trạng Thái": c.isHires ? "Đã Tuyển dụng" : c.isBqt ? "Chưa quẹt thẻ" : "Tiếp nhận",
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Can chinh do rong cot
  worksheet["!cols"] = [
    { wch: 6 },  // STT
    { wch: 25 }, // Ho ten
    { wch: 15 }, // Ma the
    { wch: 16 }, // CCCD
    { wch: 12 }, // Ngay sinh
    { wch: 10 }, // Gioi tinh
    { wch: 14 }, // Dien thoai
    { wch: 8 },  // Bp. duyet
    { wch: 22 }, // Phong ban
    { wch: 20 }, // Chuc danh
    { wch: 18 }, // Que quan
    { wch: 35 }, // Dia chi
    { wch: 14 }, // Ngay nhan
    { wch: 16 }, // Trang thai
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");

  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`);
}
