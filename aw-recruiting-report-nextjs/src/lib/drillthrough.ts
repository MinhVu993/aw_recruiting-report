export interface CrossFilterState {
  ageGroup?: string;
  gender?: string;
  position?: string;
  div?: string;
  source?: string;
  edu?: string;
  resignReason?: string;
  seniority?: string;
  loc?: string;
}

export type PerspectiveType = "turnover" | "profile" | "recruitment";

export interface GlobalSlicersState {
  loc?: string;
  timeRange?: string;
  startDate?: string;
  endDate?: string;
}

export interface DrillThroughContext {
  perspective?: PerspectiveType;
  filters: CrossFilterState;
  globalSlicers: GlobalSlicersState;
}

export interface DrillThroughResult {
  url: string;
  pageName: "resign" | "candidates" | "demand";
  label: string;
  subtitle?: string;
  badgeText: string;
}

/**
 * Builds the drill-through target URL and human-friendly labels based on
 * active dashboard cross-filter state, perspective, and global slicers.
 */
export function buildDrillThroughTarget(context: DrillThroughContext): DrillThroughResult | null {
  const { perspective = "turnover", filters, globalSlicers } = context;
  const params = new URLSearchParams();

  // Attach factory location if specified
  if (globalSlicers.loc && globalSlicers.loc !== "all") {
    params.set("loc", globalSlicers.loc);
  } else if (globalSlicers.loc === "all") {
    params.set("loc", "all");
  }

  // Attach time range parameters
  if (globalSlicers.timeRange) {
    params.set("timeRange", globalSlicers.timeRange);
    if (globalSlicers.timeRange === "custom") {
      if (globalSlicers.startDate) params.set("startDate", globalSlicers.startDate);
      if (globalSlicers.endDate) params.set("endDate", globalSlicers.endDate);
    }
  }

  const isCandidateSpecific = Boolean(
    filters.edu || filters.source || (perspective === "profile" && (filters.ageGroup || filters.gender || filters.position || filters.div))
  );
  const isResignSpecific = Boolean(
    filters.resignReason || filters.seniority || (perspective === "turnover" && (filters.div || filters.ageGroup || filters.position || filters.gender))
  );

  // Priority 1: Candidate Profile Dimension active or in Profile perspective
  if (
    (perspective === "profile" && !filters.resignReason && !filters.seniority) ||
    (isCandidateSpecific && !filters.resignReason && !filters.seniority)
  ) {
    if (filters.position) params.set("duty", filters.position);
    if (filters.gender) params.set("gender", filters.gender);
    if (filters.div) params.set("applyDp", filters.div);
    if (filters.source) params.set("source", filters.source);
    if (filters.edu) params.set("edu", filters.edu);
    if (filters.ageGroup) params.set("ageGroup", filters.ageGroup);

    const parts: string[] = [];
    if (filters.source) parts.push(`Nguồn: "${filters.source}"`);
    if (filters.edu) parts.push(`Trình độ: "${filters.edu}"`);
    if (filters.position) parts.push(`Vị trí: "${filters.position}"`);
    if (filters.gender) parts.push(`Giới tính: "${filters.gender}"`);
    if (filters.ageGroup) parts.push(`Tuổi: "${filters.ageGroup}"`);
    if (filters.div) parts.push(`Bộ phận: "${filters.div}"`);

    const filterDesc = parts.length > 0 ? parts.join(", ") : "Toàn bộ ứng viên";

    const queryString = params.toString();
    return {
      url: `/candidates${queryString ? `?${queryString}` : ""}`,
      pageName: "candidates",
      label: `Mở danh sách Ứng viên: ${filterDesc}`,
      subtitle: "Mở chi tiết danh sách ứng viên trong tab mới",
      badgeText: "Ứng viên",
    };
  }

  // Priority 2: Resignation / Turnover Dimension active or in Turnover perspective
  if (
    (perspective === "turnover" && !filters.edu && !filters.source) ||
    isResignSpecific
  ) {
    if (filters.position) params.set("jobLevel", filters.position);
    if (filters.resignReason) params.set("reason", filters.resignReason);
    if (filters.seniority) params.set("seniority", filters.seniority);
    if (filters.div) params.set("dept", filters.div);
    if (filters.gender) params.set("gender", filters.gender);
    if (filters.ageGroup) params.set("ageGroup", filters.ageGroup);

    const parts: string[] = [];
    if (filters.resignReason) parts.push(`Lý do: "${filters.resignReason}"`);
    if (filters.position) parts.push(`Chức vụ: "${filters.position}"`);
    if (filters.seniority) parts.push(`Thâm niên: "${filters.seniority}"`);
    if (filters.div) parts.push(`Bộ phận: "${filters.div}"`);
    if (filters.gender) parts.push(`Giới tính: "${filters.gender}"`);
    if (filters.ageGroup) parts.push(`Tuổi: "${filters.ageGroup}"`);

    const filterDesc = parts.length > 0 ? parts.join(", ") : "Toàn bộ thôi việc";

    const queryString = params.toString();
    return {
      url: `/resign${queryString ? `?${queryString}` : ""}`,
      pageName: "resign",
      label: `Mở danh sách Thôi việc: ${filterDesc}`,
      subtitle: "Mở chi tiết danh sách thôi việc trong tab mới",
      badgeText: "Thôi việc",
    };
  }

  // Priority 3: Recruitment Performance
  if (perspective === "recruitment") {
    if (filters.div) params.set("dept", filters.div);
    if (filters.position) params.set("pos", filters.position);

    const filterDesc = filters.div
      ? `Bộ phận: "${filters.div}"`
      : filters.position
      ? `Vị trí: "${filters.position}"`
      : "Toàn bộ chỉ tiêu";

    const queryString = params.toString();
    return {
      url: `/demand${queryString ? `?${queryString}` : ""}`,
      pageName: "demand",
      label: `Mở danh sách Chỉ tiêu: ${filterDesc}`,
      subtitle: "Mở chi tiết nhu cầu tuyển dụng trong tab mới",
      badgeText: "Nhu cầu",
    };
  }

  return null;
}
