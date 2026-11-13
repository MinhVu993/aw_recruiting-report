"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Search, UserPlus, ChevronRight, Clock, AlertCircle } from "lucide-react";

interface Candidate {
  id: number;
  candidateName: string;
  empno?: string;
  cccd: string;
  loc: string;
  dept: string;
  duty: string;
  inDate: string;
  status: "active" | "pending" | "bqt" | "hired";
}

export const PipelineStreamCard: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStream = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/candidates?limit=15");
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          const mapped: Candidate[] = json.data.map((c: any) => ({
            id: c.id,
            candidateName: c.candidateName || c.name || "Chưa đặt tên",
            empno: c.empno || undefined,
            cccd: c.cccd || "",
            loc: (c.loc || "AW").toUpperCase(),
            dept: c.dept || "Chưa phân bộ phận",
            duty: c.duty || "--",
            inDate: c.inDate ? new Date(c.inDate).toISOString().split("T")[0] : "--",
            status: c.isHires ? "hired" : c.isBqt ? "bqt" : "pending",
          }));
          setCandidates(mapped);
        } else {
          setCandidates([]);
        }
      } catch (err) {
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStream();
  }, []);

  const filteredCandidates = candidates.filter(
    (c) =>
      c.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      c.cccd.includes(search) ||
      (c.empno && c.empno.includes(search)) ||
      c.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bento-card col-span-12 lg:row-span-5 min-h-0 flex flex-col justify-between overflow-hidden p-3 lg:p-3.5">
      {/* Table Header & Controls */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 leading-none">
              Luồng Tiếp Nhận Ứng Viên Trực Tiếp
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {filteredCandidates.length} hồ sơ
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Danh sách tiếp nhận, đối soát và cấp phát mã thẻ</p>
          </div>
        </div>

        {/* Action Buttons & Search */}
        <div className="flex items-center space-x-2">
          <div className="relative w-48 sm:w-60">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm nhanh Tên, CCCD…"
              aria-label="Tìm kiếm ứng viên trực tiếp"
              className="w-full rounded-lg bg-slate-950/80 border border-slate-800 py-1 pl-8 pr-2.5 text-[11px] text-white placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 focus-visible:border-rose-500 transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1.5" aria-hidden="true" />
          </div>

          <Link
            href="/candidates/new"
            aria-label="Thêm ứng viên mới"
            className="flex items-center space-x-1 rounded-lg bg-rose-600 hover:bg-rose-700 px-2.5 py-1 text-[11px] font-bold text-white shadow-md shadow-rose-600/20 transition-colors duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
          >
            <UserPlus className="w-3 h-3" aria-hidden="true" />
            <span className="hidden sm:inline">Thêm Ứng Viên</span>
          </Link>
        </div>
      </div>

      {/* Internal Scrollable Table Container */}
      <div className="flex-1 min-h-0 overflow-y-auto rounded-lg border border-slate-800/80 bg-slate-950/40 custom-scrollbar">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
            <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-2 px-3">Ứng Viên</th>
              <th className="py-2 px-2.5">Mã Thẻ</th>
              <th className="py-2 px-2.5">Số CCCD</th>
              <th className="py-2 px-2.5">Bp. duyệt & Bộ Phận</th>
              <th className="py-2 px-2.5">Vị Trí</th>
              <th className="py-2 px-2.5">Ngày vào làm</th>
              <th className="py-2 px-2.5">Trạng Thái</th>
              <th className="py-2 px-3 text-right">Chi Tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                  Đang tải luồng ứng viên...
                </td>
              </tr>
            ) : filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                  Chưa có dữ liệu ứng viên nào trong hệ thống
                </td>
              </tr>
            ) : (
              filteredCandidates.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/40 transition-colors group">
                  <td className="py-1.5 px-3 flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-md bg-slate-800 flex items-center justify-center text-[11px] font-bold text-emerald-400 border border-slate-700">
                      {c.candidateName.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors text-xs truncate max-w-[150px]">
                      {c.candidateName}
                    </span>
                  </td>
                  <td className="py-1.5 px-2.5">
                    {c.empno ? (
                      <span className="tabular-nums font-bold text-rose-500 dark:text-[#fb7185] bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20 text-[11px]">
                        {c.empno}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">Chưa cấp</span>
                    )}
                  </td>
                  <td className="py-1.5 px-2.5 tabular-nums text-slate-300 text-[11px]">{c.cccd}</td>
                  <td className="py-1.5 px-2.5 text-slate-300">
                    <span className="font-semibold text-xs">{c.dept}</span>
                    <span className="ml-1 text-[9px] font-bold uppercase px-1 py-0.2 rounded bg-teal-500/15 text-teal-400 border border-teal-500/25">
                      {c.loc}
                    </span>
                  </td>
                  <td className="py-1.5 px-2.5 text-slate-400 text-xs">{c.duty}</td>
                  <td className="py-1.5 px-2.5 text-slate-400 text-[11px] tabular-nums">{c.inDate}</td>
                  <td className="py-1.5 px-2.5">
                    {c.status === "hired" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/40 px-2 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Bình thường
                      </span>
                    )}
                    {c.status === "bqt" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-950/40 px-2 py-0.2 text-[9px] font-bold text-rose-400 border border-rose-500/30">
                        <Clock className="w-2.5 h-2.5" aria-hidden="true" /> Thiếu chứng từ
                      </span>
                    )}
                    {c.status === "pending" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/60 px-2 py-0.2 text-[9px] font-bold text-slate-400 border border-slate-700/60">
                        <AlertCircle className="w-2.5 h-2.5" aria-hidden="true" /> Chưa học
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 px-3 text-right">
                    <Link
                      href={`/candidates/new?id=${c.id}`}
                      aria-label={`Xem chi tiết hồ sơ ${c.candidateName}`}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors duration-150 active:scale-[0.97] inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
                    >
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
