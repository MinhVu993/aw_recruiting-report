"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/context/SessionContext";
import { PowerBiSlicersBar } from "@/components/dashboard-powerbi/PowerBiSlicersBar";
import { PowerBiScorecards } from "@/components/dashboard-powerbi/PowerBiScorecards";
import {
  PerspectiveNav,
  PerspectiveType,
} from "@/components/dashboard-powerbi/PerspectiveNav";
import { RecruitmentPerformancePerspective } from "@/components/dashboard-powerbi/RecruitmentPerformancePerspective";
import { CandidateProfilePerspective } from "@/components/dashboard-powerbi/CandidateProfilePerspective";
import { TurnoverAnalyticsPerspective } from "@/components/dashboard-powerbi/TurnoverAnalyticsPerspective";
import {
  ActiveCrossFilterRibbon,
  CrossFilterState,
} from "@/components/dashboard-powerbi/ActiveCrossFilterRibbon";
import { ExportDashboardPdfModal } from "@/components/dashboard-powerbi/ExportDashboardPdfModal";

interface AnalyticsResponseState {
  summary: {
    totalDemand: number;
    totalRecruited: number;
    totalShortage: number;
    fulfillmentRate: number;
    totalCandidates: number;
    cardIssuedCount: number;
    pendingReviewCount: number;
    totalResignations: number;
    topResignReason: string;
    totalInterns: number;
    totalSchools: number;
    avgTimeToFillDays?: number;
  };
  recruitmentFunnelDetailed: {
    stages: any[];
    timeToFillByPosition: any[];
    avgTimeToFillDays: number;
  };
  candidateDemographics: {
    genders: any[];
    ageGroups: any[];
    agePyramid?: any[];
    educationLevels: any[];
    recruitmentSources: any[];
    positions: any[];
  };
  resignationDeepAnalytics: {
    topReasons: any[];
    bySeniority: any[];
    byJobLevel?: any[];
    byAgeGroup: any[];
    agePyramid?: any[];
    byGender: any[];
    topDepts: any[];
    total: number;
  };
  departmentProgress: any[];
  internAnalytics: {
    bySchool: any[];
    byStatus: any[];
    total: number;
  };
  criticalDemands: any[];
}

const initialAnalyticsState: AnalyticsResponseState = {
  summary: {
    totalDemand: 0,
    totalRecruited: 0,
    totalShortage: 0,
    fulfillmentRate: 0,
    totalCandidates: 0,
    cardIssuedCount: 0,
    pendingReviewCount: 0,
    totalResignations: 0,
    topResignReason: "",
    totalInterns: 0,
    totalSchools: 0,
    avgTimeToFillDays: 0,
  },
  recruitmentFunnelDetailed: {
    stages: [],
    timeToFillByPosition: [],
    avgTimeToFillDays: 0,
  },
  candidateDemographics: {
    genders: [],
    ageGroups: [],
    agePyramid: [],
    educationLevels: [],
    recruitmentSources: [],
    positions: [],
  },
  resignationDeepAnalytics: {
    topReasons: [],
    bySeniority: [],
    byJobLevel: [],
    byAgeGroup: [],
    agePyramid: [],
    byGender: [],
    topDepts: [],
    total: 0,
  },
  departmentProgress: [],
  internAnalytics: {
    bySchool: [],
    byStatus: [],
    total: 0,
  },
  criticalDemands: [],
};

export default function HomePage() {
  const { selectedFactory, setSelectedFactory } = useSession();
  const [timeRange, setTimeRange] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [loading, setLoading] = useState<boolean>(true);
  const [activePerspective, setActivePerspective] =
    useState<PerspectiveType>("recruitment");
  const [showExportPdfModal, setShowExportPdfModal] = useState<boolean>(false);

  // Power BI Cross-Filtering State
  const [crossFilter, setCrossFilter] = useState<CrossFilterState>({});

  const [analyticsData, setAnalyticsData] =
    useState<AnalyticsResponseState>(initialAnalyticsState);

  const handleTimeRangeChange = (r: string) => {
    setTimeRange(r);
    if (r === "custom" && !startDate && !endDate) {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      setStartDate(`${y}-${m}-01`);
      setEndDate(`${y}-${m}-${d}`);
    }
  };

  const handleCrossFilterChange = (
    key: keyof CrossFilterState,
    value?: string,
    label?: string
  ) => {
    setCrossFilter((prev) => {
      const next = { ...prev };
      if (!value) {
        delete next[key];
        if (key === "div") delete next.divName;
      } else {
        next[key] = value;
        if (key === "div" && label) {
          next.divName = label;
        }
      }
      return next;
    });
  };

  const handleRemoveFilter = (key: keyof CrossFilterState) => {
    setCrossFilter((prev) => {
      const next = { ...prev };
      delete next[key];
      if (key === "div") delete next.divName;
      return next;
    });
  };

  const handleClearAllFilters = () => {
    setCrossFilter({});
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        loc: selectedFactory,
        timeRange,
        status: statusFilter,
      });

      if (timeRange === "custom") {
        if (startDate) queryParams.set("startDate", startDate);
        if (endDate) queryParams.set("endDate", endDate);
      }

      if (crossFilter.div) queryParams.set("crossDiv", crossFilter.div);
      if (crossFilter.position) queryParams.set("crossPosition", crossFilter.position);
      if (crossFilter.gender) queryParams.set("crossGender", crossFilter.gender);
      if (crossFilter.ageGroup) queryParams.set("crossAgeGroup", crossFilter.ageGroup);
      if (crossFilter.edu) queryParams.set("crossEdu", crossFilter.edu);
      if (crossFilter.source) queryParams.set("crossSource", crossFilter.source);
      if (crossFilter.resignReason) queryParams.set("crossResignReason", crossFilter.resignReason);
      if (crossFilter.seniority) queryParams.set("crossSeniority", crossFilter.seniority);

      const res = await fetch(`/api/dashboard/analytics?${queryParams.toString()}`);
      const json = await res.json();
      if (json.success) {
        setAnalyticsData(json);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu phân tích Dashboard 360:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedFactory, timeRange, statusFilter, crossFilter, startDate, endDate]);

  return (
    <div className="w-full h-full flex-1 min-h-0 flex flex-col p-2.5 sm:p-3 overflow-y-auto custom-scrollbar space-y-2.5 bg-[#f1f3f6] dark:bg-[#0f0f12]">
      {/* 1. Slicers Bar */}
      <div id="tour-slicers-bar" className="w-full print:hidden">
        <PowerBiSlicersBar
          selectedFactory={selectedFactory}
          onFactoryChange={setSelectedFactory}
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onRefresh={fetchAnalytics}
          loading={loading}
          onOpenExportPdf={() => setShowExportPdfModal(true)}
        />
      </div>

      {/* 1.5 Power BI Relationships Active Filter Ribbon */}
      <div className="w-full print:hidden">
        <ActiveCrossFilterRibbon
          filters={crossFilter}
          activePerspective={activePerspective}
          globalSlicers={{
            loc: selectedFactory,
            timeRange,
            startDate,
            endDate,
          }}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
        />
      </div>

      {/* 2. Executive 4-Pillar Scorecards Ribbon */}
      <div id="tour-kpi-scorecards" className="w-full">
        <PowerBiScorecards summary={analyticsData.summary} loading={loading} />
      </div>

      {/* 3. 360° Perspectives Navigation Switcher */}
      <div id="tour-perspective-nav" className="w-full print:hidden">
        <PerspectiveNav
          activePerspective={activePerspective}
          onPerspectiveChange={setActivePerspective}
          metrics={{
            funnelCount: analyticsData.recruitmentFunnelDetailed?.stages?.[0]?.count,
            candidateCount: analyticsData.summary.totalCandidates,
            resignCount: analyticsData.summary.totalResignations,
            avgTTF: analyticsData.summary.avgTimeToFillDays,
          }}
        />
      </div>

      {/* 4. Perspective Content Views */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePerspective}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="w-full"
          >
            {activePerspective === "recruitment" && (
              <RecruitmentPerformancePerspective
                funnelDetailed={analyticsData.recruitmentFunnelDetailed}
                departmentProgress={analyticsData.departmentProgress}
                criticalDemands={analyticsData.criticalDemands}
                loading={loading}
                crossFilter={crossFilter}
                onCrossFilterChange={handleCrossFilterChange}
              />
            )}

            {activePerspective === "profile" && (
              <CandidateProfilePerspective
                demographics={analyticsData.candidateDemographics}
                internData={analyticsData.internAnalytics}
                loading={loading}
                crossFilter={crossFilter}
                globalSlicers={{ loc: selectedFactory, timeRange, startDate, endDate }}
                onCrossFilterChange={handleCrossFilterChange}
              />
            )}

            {activePerspective === "turnover" && (
              <TurnoverAnalyticsPerspective
                resignationData={analyticsData.resignationDeepAnalytics}
                loading={loading}
                crossFilter={crossFilter}
                globalSlicers={{ loc: selectedFactory, timeRange, startDate, endDate }}
                onCrossFilterChange={handleCrossFilterChange}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 5. PDF Charts Export Modal */}
      <ExportDashboardPdfModal
        isOpen={showExportPdfModal}
        onClose={() => setShowExportPdfModal(false)}
        analyticsData={analyticsData}
        globalFilters={{
          selectedFactory,
          timeRange,
          startDate,
          endDate,
          statusFilter,
          crossFilter,
        }}
        activePerspective={activePerspective}
      />
    </div>
  );
}
