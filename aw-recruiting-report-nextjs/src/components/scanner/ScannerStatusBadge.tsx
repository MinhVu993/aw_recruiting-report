"use client";

import React, { useState } from "react";
import { Cpu, RefreshCw, Unplug, CheckCircle2 } from "lucide-react";
import { useScanner } from "@/context/ScannerContext";

export const ScannerStatusBadge: React.FC = () => {
  const { isSupported, isConnected, portInfo, connect, disconnect, errorMessage } = useScanner();
  const [connecting, setConnecting] = useState(false);

  const handleClick = async () => {
    if (!isSupported) {
      alert("Trình duyệt hiện tại không hỗ trợ Web Serial/USB API. Vui lòng truy cập qua HTTPS bằng Google Chrome hoặc Microsoft Edge.");
      return;
    }

    if (isConnected) {
      const confirmDisconnect = window.confirm(`Thiết bị ${portInfo || "Máy quét CCCD"} đang kết nối.\nBạn có muốn ngắt kết nối không?`);
      if (confirmDisconnect) {
        await disconnect();
      }
      return;
    }

    setConnecting(true);
    try {
      await connect("com");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={connecting}
      className={`flex items-center space-x-2 rounded-lg border px-2.5 h-9 text-xs transition-all duration-150 active:scale-[0.97] cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 ${
        isConnected
          ? "bg-emerald-50/80 hover:bg-emerald-100/70 border-emerald-300 text-emerald-800"
          : "bg-white hover:bg-zinc-50 border-[#d8dce2] hover:border-zinc-400 text-zinc-700"
      }`}
      title={
        !isSupported
          ? "Trình duyệt không hỗ trợ Web Serial/USB (Yêu cầu HTTPS & Chrome/Edge)"
          : isConnected
          ? `Máy quét CCCD: ĐÃ KẾT NỐI (${portInfo || "Cổng COM/USB"}). Nhấp để ngắt kết nối.`
          : "Máy quét CCCD: CHƯA KẾT NỐI. Bấm vào đây để chọn cổng USB/COM kết nối thực tế."
      }
    >
      {connecting ? (
        <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
      ) : isConnected ? (
        <Cpu className="w-4 h-4 text-emerald-600 animate-pulse" />
      ) : (
        <Cpu className="w-4 h-4 text-zinc-500" />
      )}

      <span className="hidden xl:inline font-bold text-zinc-800">
        CCCD Scanner:
      </span>

      <div className="flex items-center space-x-1.5">
        <span
          className={`h-2.5 w-2.5 rounded-full transition-colors ${
            !isSupported
              ? "bg-zinc-400"
              : isConnected
              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse"
              : "bg-amber-500 shadow-xs"
          }`}
        />
        <span
          className={`text-xs font-bold ${
            isConnected
              ? "text-emerald-700"
              : "text-zinc-700"
          }`}
        >
          {connecting
            ? "Connecting…"
            : isConnected
            ? portInfo ? "Connected" : "Connected"
            : "Chưa kết nối"}
        </span>
      </div>
    </button>
  );
};
