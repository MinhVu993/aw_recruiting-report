/**
 * Helper utilities for parsing and filtering employee seniority values.
 */

export function parseSeniorityYears(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  const str = String(val).trim();
  if (!str) return 0;
  const yMatch = str.match(/(\d+)\s*năm/i);
  const mMatch = str.match(/(\d+)\s*tháng/i);
  const dMatch = str.match(/(\d+)\s*ngày/i);
  if (yMatch || mMatch || dMatch) {
    const y = yMatch ? parseInt(yMatch[1], 10) : 0;
    const m = mMatch ? parseInt(mMatch[1], 10) : 0;
    const d = dMatch ? parseInt(dMatch[1], 10) : 0;
    return y + m / 12 + d / 365;
  }
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export function matchesSeniorityRange(years: number, rangeStr: string): boolean {
  if (!rangeStr) return true;
  const sLower = rangeStr.toLowerCase().trim();
  if (sLower.includes("< 1") || sLower.includes("dưới 1")) return years < 1;
  if (sLower.includes("1 - 3") || sLower.includes("1-3")) return years >= 1 && years <= 3;
  if (sLower.includes("3 - 5") || sLower.includes("3-5")) return years > 3 && years <= 5;
  if (sLower.includes("5 - 10") || sLower.includes("5-10")) return years > 5 && years <= 10;
  if (sLower.includes("> 10") || sLower.includes("trên 10") || sLower.includes("lớn hơn 10")) return years > 10;
  if (sLower.includes("> 3") || sLower.includes("trên 3")) return years > 3;
  return true;
}
