"use client";

import React, { useState } from "react";
import { Camera, Check, RefreshCw } from "lucide-react";
import html2canvas from "html2canvas";
import { useTranslation } from "@/hooks/useTranslation";

interface ChartExportButtonProps {
  targetRef: React.RefObject<HTMLElement | null>;
  chartTitle: string;
  className?: string;
  fileNamePrefix?: string;
}

export const ChartExportButton: React.FC<ChartExportButtonProps> = ({
  targetRef,
  chartTitle,
  className = "",
  fileNamePrefix,
}) => {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleExportChartImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!targetRef.current || isExporting) return;

    setIsExporting(true);

    let container: HTMLDivElement | null = null;

    try {
      // Allow slight tick for any pending layout settle
      await new Promise((resolve) => setTimeout(resolve, 80));

      const element = targetRef.current;
      const isDarkMode = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
      const defaultBg = isDarkMode ? "#18181c" : "#ffffff";

      // 1. Measure exact dimensions
      const rect = element.getBoundingClientRect();
      const targetWidth = Math.round(rect.width) || element.offsetWidth || 600;
      const targetHeight = Math.round(rect.height) || element.offsetHeight || 400;

      // 2. Clone the element deeply to isolate from live DOM transforms and scroll offsets
      const clone = element.cloneNode(true) as HTMLElement;

      // 3. Remove all export buttons or ignored elements inside the clone
      clone.querySelectorAll("[data-export-ignore]").forEach((el) => el.remove());

      // 4. Reset troublesome CSS on the clone (remove backdrop-filter and parent transforms)
      clone.style.width = `${targetWidth}px`;
      clone.style.minWidth = `${targetWidth}px`;
      clone.style.maxWidth = `${targetWidth}px`;
      clone.style.height = `${targetHeight}px`;
      clone.style.minHeight = `${targetHeight}px`;
      clone.style.maxHeight = `${targetHeight}px`;
      clone.style.margin = "0";
      clone.style.boxSizing = "border-box";
      clone.style.transform = "none";
      clone.style.transition = "none";
      clone.style.animation = "none";
      clone.style.backdropFilter = "none";
      (clone.style as any).webkitBackdropFilter = "none";
      clone.style.backgroundColor = defaultBg;
      clone.style.borderRadius = "12px";
      clone.style.boxShadow = "none";
      clone.style.overflow = "hidden";

      // 5. Ensure text nodes don't get vertically clipped by flex/truncate baselines
      clone.querySelectorAll("*").forEach((node) => {
        const el = node as HTMLElement;
        el.style.animation = "none";
        el.style.transition = "none";
        if (el.tagName === "SPAN" || el.tagName === "P" || el.classList?.contains("truncate")) {
          el.style.lineHeight = "1.35";
        }
      });

      // 6. Mount the clone in an isolated off-screen container at the root of document.body
      container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-99999px";
      container.style.top = "0";
      container.style.width = `${targetWidth}px`;
      container.style.height = `${targetHeight}px`;
      container.style.overflow = "hidden";
      container.style.zIndex = "-99999";
      container.style.backgroundColor = defaultBg;
      container.appendChild(clone);
      document.body.appendChild(container);

      // 7. Capture the isolated clone with strict (0, 0) coordinates and 2.5x resolution
      const canvas = await html2canvas(clone, {
        scale: 2.5, // 2.5x DPI for crisp high-resolution charts
        useCORS: true,
        logging: false,
        backgroundColor: defaultBg,
        width: targetWidth,
        height: targetHeight,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
      });

      // 8. Sanitize file title and trigger PNG download
      const todayStr = new Date().toISOString().split("T")[0];
      const cleanTitle = (fileNamePrefix || chartTitle || "Chart")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");

      const fileName = `${cleanTitle}_${todayStr}.png`;

      const link = document.createElement("a");
      link.download = fileName;
      link.href = canvas.toDataURL("image/png", 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (err) {
      console.error("Lỗi khi xuất ảnh biểu đồ:", err);
      alert("Không thể xuất ảnh biểu đồ. Vui lòng thử lại.");
    } finally {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
      setIsExporting(false);
    }
  };

  const tooltipText = isSuccess
    ? t("success", "Đã lưu ảnh!")
    : isExporting
    ? t("loading", "Đang xử lý ảnh...")
    : `${t("export", "Xuất ảnh")} "${chartTitle}" (PNG)`;

  return (
    <button
      type="button"
      data-export-ignore="true"
      onClick={handleExportChartImage}
      disabled={isExporting}
      className={`h-7 px-2 rounded-lg border text-xs font-semibold inline-flex items-center gap-1 transition-all duration-150 cursor-pointer shadow-2xs ${
        isSuccess
          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
          : isExporting
          ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 opacity-80"
          : "bg-white dark:bg-[#202028] border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
      } ${className}`}
      title={tooltipText}
      aria-label={tooltipText}
    >
      {isSuccess ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
            {t("success", "Đã lưu")}
          </span>
        </>
      ) : isExporting ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-600" />
          <span className="hidden sm:inline text-[10px] font-bold text-rose-600">
            {t("loading", "Đang chụp...")}
          </span>
        </>
      ) : (
        <>
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden xl:inline text-[10px] font-medium">
            {t("export", "Tải ảnh")}
          </span>
        </>
      )}
    </button>
  );
};
