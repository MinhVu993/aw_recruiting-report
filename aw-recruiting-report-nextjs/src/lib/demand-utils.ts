/**
 * Utilities for Demand (Chỉ tiêu / Nhu cầu tuyển dụng)
 * Single-factory mode: always 'aw' (AW).
 */

export function getDemandLoc(_demUnit?: string | null): "aw" {
  return "aw";
}

/**
 * Normalized factory display code ('AW')
 */
export function getDemandLocUpper(_demUnit?: string | null): "AW" {
  return "AW";
}
