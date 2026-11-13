"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { parseCccdQrData, CandidateQrInfo } from "@/lib/cccd-normalizer";

interface UseWebSerialScannerOptions {
  baudRate?: number;
  onScan?: (data: string, candidateInfo?: CandidateQrInfo | null) => void;
  autoParseQr?: boolean;
}

export function useWebSerialScanner(options: UseWebSerialScannerOptions = {}) {
  const { baudRate = 9600, onScan, autoParseQr = true } = options;

  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastScannedData, setLastScannedData] = useState<string>("");
  const [lastCandidateInfo, setLastCandidateInfo] = useState<CandidateQrInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const keepReadingRef = useRef<boolean>(false);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const openPort = useCallback(async (port: any) => {
    try {
      // Đóng kết nối cũ nếu đang giữ
      if (readerRef.current) {
        keepReadingRef.current = false;
        await readerRef.current.cancel().catch(() => {});
        readerRef.current = null;
      }
      if (portRef.current && portRef.current !== port) {
        await portRef.current.close().catch(() => {});
        portRef.current = null;
      }

      // Mở cổng nếu chưa mở
      if (!port.readable) {
        await port.open({ baudRate });
      }

      // Kiểm tra nếu stream đang bị khóa (locked by another reader/stream)
      if (port.readable?.locked) {
        console.warn("Serial port stream is currently locked. Waiting or skipping lock.");
        return;
      }

      portRef.current = port;
      setIsConnected(true);
      keepReadingRef.current = true;

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable).catch((err: any) => {
        // Ignored expected stream close or abort errors
      });
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      let buffer = "";
      let chunkTimer: NodeJS.Timeout | null = null;

      const processLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        setLastScannedData(trimmed);
        let parsedInfo: CandidateQrInfo | null = null;
        if (autoParseQr) {
          parsedInfo = parseCccdQrData(trimmed);
          setLastCandidateInfo(parsedInfo);
        }
        if (onScanRef.current) {
          onScanRef.current(trimmed, parsedInfo);
        }
      };

      try {
        while (port.readable && keepReadingRef.current) {
          try {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              buffer += value;

              // Xóa timer trước đó
              if (chunkTimer) clearTimeout(chunkTimer);

              if (buffer.includes("\n") || buffer.includes("\r")) {
                const lines = buffer.split(/[\r\n]+/);
                for (let i = 0; i < lines.length - 1; i++) {
                  processLine(lines[i]);
                }
                buffer = lines[lines.length - 1] || "";
              } else if (buffer.includes("|")) {
                // Nếu máy quét không gửi ký tự xuống dòng nhưng đã đủ 7 phần tử (QR CCCD)
                const parts = buffer.split("|");
                if (parts.length >= 7 && parts[6].length >= 8) {
                  processLine(buffer);
                  buffer = "";
                } else {
                  // Đặt timeout 250ms: nếu máy quét truyền hết mà không có Enter hay đủ 8 ký tự ngày cấp
                  chunkTimer = setTimeout(() => {
                    if (buffer.trim()) {
                      processLine(buffer);
                      buffer = "";
                    }
                  }, 250);
                }
              } else {
                // Quét mã 1D hoặc không có dấu |
                chunkTimer = setTimeout(() => {
                  if (buffer.trim()) {
                    processLine(buffer);
                    buffer = "";
                  }
                }, 250);
              }
            }
          } catch (readError: any) {
            if (readError?.name !== "NetworkError") {
              console.warn("Lỗi đọc dữ liệu từ máy quét:", readError?.message || readError);
            }
            break;
          }
        }
      } finally {
        if (readerRef.current) {
          try {
            readerRef.current.releaseLock();
          } catch {}
          readerRef.current = null;
        }
      }
    } catch (err: any) {
      console.warn("Cổng COM không sẵn sàng hoặc đang bận:", err?.message || err);
      setIsConnected(false);
      portRef.current = null;
    }
  }, [baudRate, autoParseQr]);

  useEffect(() => {
    let isMounted = true;

    if (typeof window !== "undefined" && "serial" in navigator) {
      setIsSupported(true);
      // Tự động kết nối lại nếu người dùng đã từng cấp quyền cổng COM trước đó
      (navigator as any).serial
        .getPorts()
        .then((ports: any[]) => {
          if (isMounted && ports && ports.length > 0 && !portRef.current && !ports[0].readable?.locked) {
            openPort(ports[0]).catch(() => {});
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
      keepReadingRef.current = false;
      if (readerRef.current) {
        readerRef.current.cancel().catch(() => {});
      }
    };
  }, [openPort]);

  const connect = useCallback(async () => {
    if (!isSupported) {
      setErrorMessage("Trình duyệt không hỗ trợ Web Serial API (vui lòng sử dụng Chrome / Edge).");
      return;
    }

    try {
      setErrorMessage(null);
      const port = await (navigator as any).serial.requestPort();
      await openPort(port);
    } catch (err: any) {
      if (err.name !== "NotFoundError") {
        console.warn("Lỗi kết nối cổng Serial:", err?.message || err);
        setErrorMessage(err.message || "Không thể kết nối với thiết bị đọc mã.");
      }
    }
  }, [isSupported, openPort]);

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
      setIsConnected(false);
    } catch (err: any) {
      console.warn("Lỗi khi ngắt kết nối cổng Serial:", err?.message || err);
    }
  }, []);

  return {
    isSupported,
    isConnected,
    lastScannedData,
    lastCandidateInfo,
    errorMessage,
    connect,
    disconnect,
  };
}
