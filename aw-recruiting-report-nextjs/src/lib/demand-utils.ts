/**
 * Utilities for Demand (Chỉ tiêu / Nhu cầu tuyển dụng)
 */

/**
 * Determines the factory location ('tc' | 'tb' | 'dmc') for a demand record
 * based on its unit code (`dem_unit`).
 *
 * Rules:
 * - dem_unit starts with 'VVG0PDTC' -> 'tc' (Tiền Châu)
 * - dem_unit starts with 'VVG0TB' -> 'tb' (Trảng Bàng)
 * - All others -> 'dmc' (Đông Mỹ Cự)
 */
export function getDemandLoc(demUnit?: string | null): "tc" | "tb" | "dmc" {
  const u = (demUnit || "").trim().toUpperCase();
  if (u.startsWith("VVG0PDTC")) return "tc";
  if (u.startsWith("VVG0TB")) return "tb";
  return "dmc";
}

/**
 * Normalized factory display code (e.g. 'TC', 'TB', 'DMC')
 */
export function getDemandLocUpper(demUnit?: string | null): "TC" | "TB" | "DMC" {
  return getDemandLoc(demUnit).toUpperCase() as "TC" | "TB" | "DMC";
}
