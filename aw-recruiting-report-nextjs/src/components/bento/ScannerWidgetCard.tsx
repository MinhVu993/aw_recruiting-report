"use client";

import React, { useState, useEffect } from "react";
import { useScanner } from "@/context/ScannerContext";
import { normalizeCccd } from "@/lib/cccd-normalizer";
import { QrCode, Cpu, UserCheck, Search, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import Link from "next/link";

export const ScannerWidgetCard: React.FC = () => {
  const [manualCccd, setManualCccd] = useState<string>("");
  const [checking, setChecking] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{
    found: boolean;
    count?: number;
    empno?: string;
    candidateName?: string;
    inDate?: string;
  } | null>(null);

  const { isConnected, connect, disconnect, lastCandidateInfo, lastScannedData } = useScanner();

  useEffect(() => {
    if (lastScannedData) {
      const cccdToCheck = lastCandidateInfo?.cccd || lastScannedData;
      if (cccdToCheck) {
        handleCheckCccd(cccdToCheck);
      }
    }
  }, [lastScannedData, lastCandidateInfo]);

  const handleCheckCccd = async (cccdVal: string) => {
    if (!cccdVal) return;
    setChecking(true);
    try {
      const normalized = normalizeCccd(cccdVal);
      const res = await fetch("/api/candidates/check-cccd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cccd: normalized }),
      });
      if (res.ok) {
        const data = await res.json();
        setVerificationResult(data);
      } else {
        setVerificationResult({
          found: false,
          candidateName: lastCandidateInfo?.fullName || "Ứng viên mới",
        });
      }
    } catch (e) {
      console.error(e);
      setVerificationResult({ found: false });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="bento-card col-span-12 lg:col-span-4 lg:row-span-4 min-h-0 flex flex-col justify-between overflow-hidden p-3 lg:p-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight leading-none">Máy Quét CCCD Chip</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Web Serial & Tra cứu tức thì</p>
          </div>
        </div>

        {/* Connect Button */}
        <button
          onClick={() => (isConnected ? disconnect() : connect())}
          aria-label={isConnected ? "Ngắt kết nối máy quét cổng COM" : "Kết nối máy quét cổng COM"}
          className={`flex items-center space-x-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-lg transition-colors duration-150 active:scale-[0.97] border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 ${
            isConnected
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
          }`}
        >
          <Cpu className="w-3 h-3" aria-hidden="true" />
          <span>{isConnected ? "Đã nối COM" : "Kết nối cổng"}</span>
        </button>
      </div>

      {/* Input Box */}
      <div className="space-y-2 my-1.5 flex-1 flex flex-col justify-center">
        <div className="relative">
          <input
            type="text"
            value={manualCccd}
            onChange={(e) => setManualCccd(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheckCccd(manualCccd)}
            placeholder="Quét thẻ hoặc nhập CCCD…"
            aria-label="Nhập hoặc quét mã số CCCD"
            className="w-full rounded-xl bg-slate-950/80 border border-slate-800 py-1.5 pl-3 pr-8 text-xs text-white placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500 transition-colors tabular-nums"
          />
          <button
            onClick={() => handleCheckCccd(manualCccd)}
            disabled={checking || !manualCccd}
            aria-label="Kiểm tra tiền án tiền sự và hồ sơ cũ CCCD"
            className="absolute right-2 top-1.5 p-1 rounded-md text-slate-400 hover:text-cyan-400 disabled:opacity-40 active:scale-[0.97] transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
          >
            <Search className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Verification Status Card */}
        {verificationResult ? (
          <div
            className={`p-2.5 rounded-xl border transition-[background-color,border-color] duration-200 ${
              verificationResult.found
                ? "bg-amber-950/30 border-amber-500/30 text-amber-200"
                : "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
            }`}
          >
            <div className="flex items-center space-x-2">
              {verificationResult.found ? (
                <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" aria-hidden="true" />
              ) : (
                <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" aria-hidden="true" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-white truncate">
                  {verificationResult.found
                    ? `ĐÃ TỪNG LÀM VIỆC (${verificationResult.count || 1} LẦN)`
                    : "ỨNG VIÊN MỚI HOÀN TOÀN"}
                </p>
                <p className="text-[10px] text-slate-300 truncate">
                  {verificationResult.candidateName || lastCandidateInfo?.fullName || "Chưa có tên"}
                  {verificationResult.empno && ` • Thẻ cũ: ${verificationResult.empno}`}
                </p>
              </div>
              <Link
                href={`/candidates/new?cccd=${manualCccd || lastCandidateInfo?.cccd || ""}`}
                aria-label="Tạo hồ sơ cho ứng viên này"
                className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 active:scale-[0.97] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                title="Tạo hồ sơ"
              >
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl border border-dashed border-slate-800/80 bg-slate-950/20 text-center text-[11px] text-slate-400">
            <p className="flex items-center justify-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Sẵn sàng nhận dữ liệu quét chip
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/60 flex items-center justify-between">
        <span>Chuẩn hóa CCCD (TRIM 0)</span>
        <span className="text-emerald-400 font-medium">Tự động đối soát</span>
      </div>
    </div>
  );
};
