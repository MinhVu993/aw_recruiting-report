"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { AppDialog, DialogOptions, DialogType } from "@/components/ui/AppDialog";

export interface ConfirmOptions {
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: DialogType;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface DialogContextValue {
  showDialog: (options: Omit<DialogOptions, "isOpen">) => void;
  showSuccess: (title: string, message: string | React.ReactNode, confirmText?: string) => void;
  showError: (title: string, message: string | React.ReactNode, confirmText?: string) => void;
  showWarning: (title: string, message: string | React.ReactNode, confirmText?: string) => void;
  showInfo: (title: string, message: string | React.ReactNode, confirmText?: string) => void;
  showConfirm: (options: ConfirmOptions) => void;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogOptions>({
    isOpen: false,
    title: "",
    message: "",
  });

  const closeDialog = useCallback(() => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showDialog = useCallback((opts: Omit<DialogOptions, "isOpen">) => {
    setDialog({ ...opts, isOpen: true });
  }, []);

  const showSuccess = useCallback((title: string, message: string | React.ReactNode, confirmText = "Đóng") => {
    setDialog({
      isOpen: true,
      type: "success",
      title,
      message,
      confirmText,
      showCancel: false,
    });
  }, []);

  const showError = useCallback((title: string, message: string | React.ReactNode, confirmText = "Đóng") => {
    setDialog({
      isOpen: true,
      type: "danger",
      title,
      message,
      confirmText,
      showCancel: false,
    });
  }, []);

  const showWarning = useCallback((title: string, message: string | React.ReactNode, confirmText = "Đã hiểu") => {
    setDialog({
      isOpen: true,
      type: "warning",
      title,
      message,
      confirmText,
      showCancel: false,
    });
  }, []);

  const showInfo = useCallback((title: string, message: string | React.ReactNode, confirmText = "Đã hiểu") => {
    setDialog({
      isOpen: true,
      type: "info",
      title,
      message,
      confirmText,
      showCancel: false,
    });
  }, []);

  const showConfirm = useCallback((opts: ConfirmOptions) => {
    setDialog({
      isOpen: true,
      type: opts.type || "warning",
      title: opts.title,
      message: opts.message,
      confirmText: opts.confirmText || "Xác nhận",
      cancelText: opts.cancelText || "Hủy bỏ",
      showCancel: true,
      onConfirm: opts.onConfirm,
      onCancel: opts.onCancel,
    });
  }, []);

  // Intercept window.alert as a safety net so browser popup never appears
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message?: any) => {
      showWarning("Thông Báo", String(message ?? ""));
    };
    return () => {
      window.alert = originalAlert;
    };
  }, [showWarning]);

  return (
    <DialogContext.Provider
      value={{
        showDialog,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
        closeDialog,
      }}
    >
      {children}
      <AppDialog options={dialog} onClose={closeDialog} />
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}
