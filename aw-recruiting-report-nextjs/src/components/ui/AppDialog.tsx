"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type DialogType = "success" | "danger" | "warning" | "info";

export interface DialogOptions {
  isOpen: boolean;
  type?: DialogType;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  isLoading?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface AppDialogProps {
  options: DialogOptions;
  onClose: () => void;
}

export function AppDialog({ options, onClose }: AppDialogProps) {
  const {
    isOpen,
    type = "info",
    title,
    message,
    confirmText = "Xác nhận",
    cancelText = "Hủy bỏ",
    showCancel = false,
    isLoading = false,
    onConfirm,
    onCancel,
  } = options;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        if (onCancel) onCancel();
        onClose();
      } else if (e.key === "Enter" && !showCancel) {
        if (onConfirm) onConfirm();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel, onConfirm, onClose, showCancel]);

  // Visual themes mapped to dialog type
  const themeStyles = {
    success: {
      bar: "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />,
      btnConfirm:
        "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-700/25",
    },
    danger: {
      bar: "bg-gradient-to-r from-rose-500 via-red-500 to-rose-400",
      iconBg: "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20",
      icon: <AlertTriangle className="w-5 h-5 stroke-[2.2]" />,
      btnConfirm:
        "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-700/25",
    },
    warning: {
      bar: "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400",
      iconBg: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20",
      icon: <AlertCircle className="w-5 h-5 stroke-[2.2]" />,
      btnConfirm:
        "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-700/25",
    },
    info: {
      bar: "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-400",
      iconBg: "bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
      icon: <Info className="w-5 h-5 stroke-[2.2]" />,
      btnConfirm:
        "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-700/25",
    },
  }[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="app-dialog-backdrop"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 dark:bg-black/75 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isLoading) {
              if (onCancel) onCancel();
              onClose();
            }
          }}
        >
          <motion.div
            key="app-dialog-panel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="w-full max-w-sm sm:max-w-md rounded-2xl bg-white dark:bg-[#18181c] border border-zinc-200/90 dark:border-zinc-800 shadow-2xl shadow-zinc-950/20 dark:shadow-black/60 overflow-hidden text-zinc-900 dark:text-zinc-100"
          >
            {/* Top gradient decorative bar */}
            <div className={`h-1.5 w-full ${themeStyles.bar}`} />

            <div className="p-5 sm:p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-xs ${themeStyles.iconBg}`}
                  >
                    {themeStyles.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                      {title}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    if (onCancel) onCancel();
                    onClose();
                  }}
                  className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body message */}
              <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal pt-1">
                {message}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
                {showCancel && (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      if (onCancel) onCancel();
                      onClose();
                    }}
                    className="h-9 px-4 rounded-xl bg-zinc-100 dark:bg-[#222228] hover:bg-zinc-200 dark:hover:bg-[#2c2c34] text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white inline-flex items-center justify-center active:scale-[0.97] transition-all disabled:opacity-50"
                  >
                    {cancelText}
                  </button>
                )}

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={async () => {
                    if (onConfirm) {
                      await onConfirm();
                    }
                    onClose();
                  }}
                  className={`h-9 px-5 rounded-xl text-xs font-bold shadow-sm inline-flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all disabled:opacity-60 cursor-pointer ${themeStyles.btnConfirm}`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang xử lý…</span>
                    </>
                  ) : (
                    <span>{confirmText}</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
