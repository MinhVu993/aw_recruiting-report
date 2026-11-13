"use client";

import React, { useState, useMemo } from "react";
import { Table, Search, ArrowUpDown, ChevronLeft, ChevronRight, AlertCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export interface CriticalDemandItem {
  id: number;
  idCode: string;
  loc: string;
  deptName: string;
  position: string;
  subPosition: string;
  demand: number;
  recruited: number;
  shortage: number;
  rate: number;
  dueDate: string;
  status: string;
}

interface CriticalDemandsMatrixProps {
  demands: CriticalDemandItem[];
  loading: boolean;
}

export const CriticalDemandsMatrix: React.FC<CriticalDemandsMatrixProps> = ({ demands, loading }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof CriticalDemandItem>("shortage");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    let result = demands;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.deptName.toLowerCase().includes(q) ||
          d.idCode.toLowerCase().includes(q) ||
          d.position.toLowerCase().includes(q) ||
          d.loc.toLowerCase().includes(q)
      );
    }

    return [...result].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === "number" && typeof valB === "number") {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [demands, search, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (field: keyof CriticalDemandItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default desc for numbers
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#18181C] border border-[#d8dce2] dark:border-[#26262C] rounded-lg p-3 flex flex-col justify-between shadow-2xs transition-colors">
      {/* Matrix Header & Tools */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide leading-tight">
              {t("criticalDemandsMatrixTitle")}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {t("criticalDemandsMatrixSubtitle")}
            </p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center space-x-2">
          <div className="relative w-44 sm:w-56">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t("searchDeptDemandPlaceholder")}
              className="w-full h-7 pl-7 pr-2 rounded bg-slate-50 dark:bg-[#131316] border border-[#d8dce2] dark:border-[#26262C] text-[11px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" />
          </div>

          <Link
            href="/demand"
            className="h-7 px-2.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 inline-flex items-center space-x-1 transition-colors"
          >
            <span>{t("demandPageLink")}</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="w-full overflow-x-auto my-2 rounded border border-slate-200/80 dark:border-slate-800">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-[#131316] text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-2 px-2.5 text-center">{t("unit")}</th>
              <th
                onClick={() => handleSort("idCode")}
                className="py-2 px-2.5 cursor-pointer hover:text-sky-600"
              >
                <span className="flex items-center gap-1">
                  {t("demandId")} <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                </span>
              </th>
              <th
                onClick={() => handleSort("deptName")}
                className="py-2 px-3 cursor-pointer hover:text-sky-600"
              >
                <span className="flex items-center gap-1">
                  {t("deptAppliedUnit")} <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                </span>
              </th>
              <th className="py-2 px-2.5">{t("position")}</th>
              <th
                onClick={() => handleSort("demand")}
                className="py-2 px-2.5 text-center cursor-pointer hover:text-sky-600"
              >
                <span className="flex items-center justify-center gap-1">
                  {t("targetQuota")} <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                </span>
              </th>
              <th
                onClick={() => handleSort("recruited")}
                className="py-2 px-2.5 text-center cursor-pointer hover:text-sky-600"
              >
                <span className="flex items-center justify-center gap-1">
                  {t("recruitedLabel")} <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                </span>
              </th>
              <th
                onClick={() => handleSort("shortage")}
                className="py-2 px-2.5 text-center cursor-pointer hover:text-rose-600"
              >
                <span className="flex items-center justify-center gap-1 text-rose-600 dark:text-rose-400">
                  {t("stillInNeed")} <ArrowUpDown className="w-2.5 h-2.5 text-rose-400" />
                </span>
              </th>
              <th
                onClick={() => handleSort("rate")}
                className="py-2 px-3 text-center cursor-pointer hover:text-sky-600"
              >
                <span className="flex items-center justify-center gap-1">
                  {t("progressCol")} <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                </span>
              </th>
              <th className="py-2 px-2.5 text-center">{t("status")}</th>
              <th className="py-2 px-2.5 text-center">{t("dueDateCol")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
            {loading ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400 text-xs">
                  {t("loadingMatrix")}
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400 text-xs">
                  {t("noMatchingDemands")}
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50 dark:hover:bg-[#202026] transition-colors"
                >
                  {/* Loc */}
                  <td className="py-2 px-2.5 text-center">
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {row.loc}
                    </span>
                  </td>

                  {/* ID Code Link */}
                  <td className="py-2 px-2.5 font-bold tabular-nums">
                    <Link
                      href={`/candidates?demand_id=${encodeURIComponent(row.idCode)}&recruited=true`}
                      className="text-sky-600 dark:text-sky-400 hover:underline"
                      title={t("filterHiredCandidatesTip")}
                    >
                      {row.idCode}
                    </Link>
                  </td>

                  {/* Dept Name */}
                  <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100 max-w-[220px] truncate">
                    {row.deptName}
                  </td>

                  {/* Position */}
                  <td className="py-2 px-2.5 text-slate-600 dark:text-slate-400">{row.position}</td>

                  {/* Demand */}
                  <td className="py-2 px-2.5 text-center font-bold tabular-nums text-slate-800 dark:text-slate-200">
                    {row.demand}
                  </td>

                  {/* Recruited */}
                  <td className="py-2 px-2.5 text-center font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    <Link
                      href={`/candidates?demand_id=${encodeURIComponent(row.idCode)}&recruited=true`}
                      className="hover:underline"
                    >
                      {row.recruited}
                    </Link>
                  </td>

                  {/* Shortage */}
                  <td className="py-2 px-2.5 text-center font-extrabold tabular-nums">
                    {row.shortage > 0 ? (
                      <span className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900/40">
                        {row.shortage}
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">0</span>
                    )}
                  </td>

                  {/* In-Cell Mini Progress Bar */}
                  <td className="py-2 px-3 text-center">
                    <div className="flex items-center space-x-1.5 justify-center">
                      <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            row.rate >= 100
                              ? "bg-emerald-500"
                              : row.rate >= 70
                              ? "bg-sky-500"
                              : row.rate >= 40
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(100, row.rate)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold tabular-nums text-slate-700 dark:text-slate-300 w-8 text-right">
                        {row.rate}%
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-2 px-2.5 text-center">
                    {row.status === "closed" ? (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                        {t("fulfilled")}
                      </span>
                    ) : row.status === "urgent" ? (
                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900/40">
                        {t("urgent")}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-800/40">
                        {t("inProgress")}
                      </span>
                    )}
                  </td>

                  {/* Due Date */}
                  <td className="py-2 px-2.5 text-center tabular-nums text-slate-500 dark:text-slate-400 text-[10px]">
                    {row.dueDate}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 dark:text-slate-400">
        <span>
          {t("showingCandidates")} {paginatedData.length} / {filteredData.length} {t("targetQuota")}
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-1.5 font-bold tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
