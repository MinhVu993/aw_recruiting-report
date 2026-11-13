/**
 * Bo xu ly chuan hoa so the can cuoc (CCCD / CMND) va phan tich du lieu QR Code.
 */

export interface CandidateQrInfo {
  cccd: string;
  normalizedCccd: string;
  cmndOld?: string;
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: string; // Nam / Nu
  address: string;
  issueDate?: string;
}

/**
 * Loai bo toan bo cac so 0 o dau chuoi de doi soat dong nhat voi cac he thong HRM cu.
 * Vi du: "079201004523" -> "79201004523"
 */
export function normalizeCccd(cccd: string | null | undefined): string {
  if (!cccd) return "";
  const cleaned = String(cccd).trim().replace(/\s+/g, "");
  return cleaned.replace(/^0+/, "");
}

/**
 * Kiem tra dinh dang so CCCD (12 so) hoac CMND (9 so).
 */
export function isValidCccd(cccd: string | null | undefined): boolean {
  if (!cccd) return false;
  const digits = String(cccd).trim().replace(/\D/g, "");
  return digits.length === 9 || digits.length === 12;
}

/**
 * Boc tach du lieu tu ma QR tren the CCCD gan chip Viet Nam.
 * Dinh dang: So_CCCD|So_CMND_cu|Ho_ten|Ngay_sinh(ddmmyyyy)|Gioi_tinh|Dia_chi|Ngay_cap(ddmmyyyy)
 */
export function parseCccdQrData(rawPayload: string): CandidateQrInfo | null {
  if (!rawPayload || typeof rawPayload !== "string") return null;
  const parts = rawPayload.split("|");
  if (parts.length < 7) return null;

  const rawCccd = parts[0]?.trim() || "";
  const cccdMatch = rawCccd.match(/\d{12}/) || rawCccd.match(/\d{9}/);
  const cccd = cccdMatch ? cccdMatch[0] : rawCccd.replace(/\D/g, "");
  if (cccd.length !== 9 && cccd.length !== 12) return null;

  const cmndOld = parts[1]?.trim() || undefined;
  const fullName = parts[2]?.trim().toUpperCase();
  if (!fullName) return null;

  const rawDob = parts[3]?.trim();
  const gender = parts[4]?.trim();
  const address = parts[5]?.trim() || "";
  const rawIssueDate = parts[6]?.trim();

  if (!address || address.length < 2) return null;

  let dateOfBirth = "";
  const digitsDob = rawDob?.replace(/\D/g, "") || "";
  if (digitsDob.length >= 8) {
    const day = digitsDob.substring(0, 2);
    const month = digitsDob.substring(2, 4);
    const year = digitsDob.substring(4, 8);
    dateOfBirth = `${year}-${month}-${day}`;
  }

  let issueDate = "";
  const digitsIssue = rawIssueDate ? rawIssueDate.replace(/\D/g, "") : "";
  if (digitsIssue.length >= 8) {
    const day = digitsIssue.substring(0, 2);
    const month = digitsIssue.substring(2, 4);
    const year = digitsIssue.substring(4, 8);
    issueDate = `${year}-${month}-${day}`;
  }

  return {
    cccd,
    normalizedCccd: normalizeCccd(cccd),
    cmndOld,
    fullName,
    dateOfBirth,
    gender,
    address,
    issueDate,
  };
}
