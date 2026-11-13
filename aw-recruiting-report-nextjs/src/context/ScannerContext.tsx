"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { parseCccdQrData, CandidateQrInfo } from "@/lib/cccd-normalizer";

export type ConnectionType = "com" | "usb" | "none";

interface ScannerContextType {
  isSupported: boolean;
  isConnected: boolean;
  connectionType: ConnectionType;
  portInfo: string | null;
  lastScannedData: string;
  lastCandidateInfo: CandidateQrInfo | null;
  errorMessage: string | null;
  connect: (preferredType?: "com" | "usb") => Promise<boolean>;
  disconnect: () => Promise<void>;
  clearLastScan: () => void;
}

const ScannerContext = createContext<ScannerContextType>({
  isSupported: false,
  isConnected: false,
  connectionType: "none",
  portInfo: null,
  lastScannedData: "",
  lastCandidateInfo: null,
  errorMessage: null,
  connect: async () => false,
  disconnect: async () => {},
  clearLastScan: () => {},
});

export const ScannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionType, setConnectionType] = useState<ConnectionType>("none");
  const [portInfo, setPortInfo] = useState<string | null>(null);
  const [lastScannedData, setLastScannedData] = useState<string>("");
  const [lastCandidateInfo, setLastCandidateInfo] = useState<CandidateQrInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const keepReadingRef = useRef<boolean>(false);

  // Xử lý dòng dữ liệu quét được từ thiết bị
  const handleScannedLine = useCallback((raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    setLastScannedData(trimmed);
    const parsed = parseCccdQrData(trimmed);
    setLastCandidateInfo(parsed);
  }, []);

  // Mở cổng Serial và đọc luồng stream liên tục
  const openSerialPort = useCallback(async (port: any): Promise<boolean> => {
    try {
      if (readerRef.current) {
        keepReadingRef.current = false;
        await readerRef.current.cancel().catch(() => {});
        readerRef.current = null;
      }
      if (portRef.current && portRef.current !== port) {
        await portRef.current.close().catch(() => {});
        portRef.current = null;
      }

      if (!port.readable) {
        await port.open({ baudRate: 9600 });
      }

      if (port.readable?.locked) {
        console.warn("Serial port stream is currently locked by another reader.");
        return false;
      }

      portRef.current = port;
      setIsConnected(true);
      setConnectionType("com");

      // Lấy thông tin thiết bị USB / COM nếu có
      const info = port.getInfo ? port.getInfo() : null;
      let label = "Cổng COM";
      if (info?.usbVendorId) {
        label = `USB-COM (VID: ${info.usbVendorId.toString(16).padStart(4, "0")})`;
      }
      setPortInfo(label);
      setErrorMessage(null);
      keepReadingRef.current = true;

      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable).catch(() => {});
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      let buffer = "";
      let chunkTimer: NodeJS.Timeout | null = null;

      (async () => {
        try {
          while (port.readable && keepReadingRef.current) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              buffer += value;
              if (chunkTimer) clearTimeout(chunkTimer);

              if (buffer.includes("\n") || buffer.includes("\r")) {
                const lines = buffer.split(/[\r\n]+/);
                for (let i = 0; i < lines.length - 1; i++) {
                  handleScannedLine(lines[i]);
                }
                buffer = lines[lines.length - 1] || "";
              } else if (buffer.includes("|")) {
                const parts = buffer.split("|");
                if (parts.length >= 7 && parts[6].length >= 8) {
                  handleScannedLine(buffer);
                  buffer = "";
                } else {
                  chunkTimer = setTimeout(() => {
                    if (buffer.trim()) {
                      handleScannedLine(buffer);
                      buffer = "";
                    }
                  }, 250);
                }
              }
            }
          }
        } catch (err: any) {
          console.warn("Lỗi đọc dữ liệu từ máy quét:", err);
        } finally {
          if (readerRef.current) {
            try {
              readerRef.current.releaseLock();
            } catch {}
            readerRef.current = null;
          }
        }
      })();

      return true;
    } catch (err: any) {
      console.warn("Không thể mở cổng COM:", err);
      setIsConnected(false);
      setConnectionType("none");
      setPortInfo(null);
      setErrorMessage(err.message || "Không thể kết nối cổng COM");
      return false;
    }
  }, [handleScannedLine]);

  // Ngắt kết nối thiết bị
  const disconnect = useCallback(async () => {
    keepReadingRef.current = false;
    try {
      if (readerRef.current) {
        await readerRef.current.cancel().catch(() => {});
        readerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close().catch(() => {});
        portRef.current = null;
      }
    } catch (e) {
      console.warn("Lỗi ngắt kết nối:", e);
    } finally {
      setIsConnected(false);
      setConnectionType("none");
      setPortInfo(null);
    }
  }, []);

  // Yêu cầu kết nối thiết bị thực tế
  const connect = useCallback(async (preferredType: "com" | "usb" = "com"): Promise<boolean> => {
    setErrorMessage(null);
    if (typeof window === "undefined") return false;

    // 1. Thử Web Serial API (Cổng COM hoặc USB Virtual COM)
    if (preferredType === "com" || "serial" in navigator) {
      if ("serial" in navigator) {
        try {
          const port = await (navigator as any).serial.requestPort();
          const ok = await openSerialPort(port);
          if (ok) return true;
        } catch (err: any) {
          if (err.name !== "NotFoundError") {
            setErrorMessage(err.message || "Lỗi khi chọn cổng COM");
          }
        }
      }
    }

    // 2. Thử WebUSB API nếu chọn USB
    if ("usb" in navigator) {
      try {
        const device = await (navigator as any).usb.requestDevice({ filters: [] });
        if (device) {
          await device.open();
          setIsConnected(true);
          setConnectionType("usb");
          setPortInfo(device.productName || "Thiết bị USB Scanner");
          return true;
        }
      } catch (err: any) {
        if (err.name !== "NotFoundError") {
          setErrorMessage(err.message || "Lỗi khi chọn thiết bị USB");
        }
      }
    }

    return false;
  }, [openSerialPort]);

  // Lắng nghe sự kiện cắm/rút cáp vật lý thực tế từ hệ thống
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasSerial = "serial" in navigator;
    const hasUsb = "usb" in navigator;
    setIsSupported(hasSerial || hasUsb);

    // Kiểm tra cổng COM đã được cấp phép trước đó
    if (hasSerial) {
      (navigator as any).serial
        .getPorts()
        .then((ports: any[]) => {
          if (ports && ports.length > 0 && !portRef.current) {
            openSerialPort(ports[0]).catch(() => {});
          }
        })
        .catch(() => {});

      const onSerialConnect = (e: any) => {
        console.log("Thiết bị Serial vừa được cắm vào máy:", e.target || e);
        if (e.target) {
          openSerialPort(e.target).catch(() => {});
        }
      };

      const onSerialDisconnect = (e: any) => {
        console.log("Thiết bị Serial vừa bị rút ra khỏi máy:", e.target || e);
        disconnect();
      };

      (navigator as any).serial.addEventListener?.("connect", onSerialConnect);
      (navigator as any).serial.addEventListener?.("disconnect", onSerialDisconnect);

      return () => {
        (navigator as any).serial.removeEventListener?.("connect", onSerialConnect);
        (navigator as any).serial.removeEventListener?.("disconnect", onSerialDisconnect);
      };
    }
  }, [openSerialPort, disconnect]);

  const clearLastScan = () => {
    setLastScannedData("");
    setLastCandidateInfo(null);
  };

  return (
    <ScannerContext.Provider
      value={{
        isSupported,
        isConnected,
        connectionType,
        portInfo,
        lastScannedData,
        lastCandidateInfo,
        errorMessage,
        connect,
        disconnect,
        clearLastScan,
      }}
    >
      {children}
    </ScannerContext.Provider>
  );
};

export const useScanner = () => useContext(ScannerContext);
