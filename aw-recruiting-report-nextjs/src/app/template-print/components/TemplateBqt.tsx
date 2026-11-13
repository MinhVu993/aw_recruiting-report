"use client";

import React, { useEffect, useState } from "react";

interface BqtItem {
  empno?: string;
  name?: string;
  dept_name?: string;
  duty?: string;
  note?: string;
  [key: string]: any;
}

interface TemplateBqtProps {
  candidates?: any[];
  loc?: string;
  blank?: boolean;
}

const TRANSLATED_DUTIES: Record<string, string> = {
  worker: "Công nhân",
  staff: "Nhân viên",
  leader: "Tổ trưởng",
  engineer: "Kỹ sư",
  manager: "Chủ quản",
  assistant: "Trợ lý",
  clerk: "Nhân viên văn phòng",
  operator: "Công nhân vận hành",
  technician: "Kỹ thuật viên",
};

function formatDuty(duty?: string): string {
  if (!duty) return "Công nhân";
  const trimmed = String(duty).trim();
  const lower = trimmed.toLowerCase();
  return TRANSLATED_DUTIES[lower] || trimmed;
}

function cleanText(val: any): string {
  if (val === null || val === undefined) return "";
  return String(val).normalize("NFC").trim();
}

function cleanEmpno(val: any): string {
  if (!val) return "";
  return String(val).replace(/^'+/, "").trim();
}

export default function TemplateBqt({ candidates, loc, blank = false }: TemplateBqtProps) {
  const [dataList, setDataList] = useState<BqtItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptLookup, setDeptLookup] = useState<Record<string, string>>({});
  const today = new Date().toISOString().split("T")[0];

  // Fetch department lookup table for fallback mapping
  useEffect(() => {
    let isMounted = true;
    fetch("/api/depts")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data?.data) return;
        const map: Record<string, string> = {};
        data.data.forEach((d: any) => {
          if (d.unit && d.deptName) map[d.unit.trim()] = d.deptName.trim();
          if (d.deptCode && d.deptName) map[d.deptCode.trim()] = d.deptName.trim();
        });
        setDeptLookup(map);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // Nếu là chế độ Mẫu Trống (blank = true): Không gọi API, render các hàng trắng điền tay
    if (blank) {
      setDataList([]);
      setLoading(false);
      return;
    }

    const processCandidates = (rawList: any[]) => {
      return rawList.map((item: any) => {
        const c = item.data || item;
        const rawDept =
          c.dept_name || c.deptName || c.name || c.tmp_departid || c.apply_dp || c.dept || "";
        const resolvedDept =
          deptLookup[rawDept] ||
          deptLookup[c.tmp_departid] ||
          deptLookup[c.apply_dp] ||
          rawDept;

        const rawDuty = c.duty_name || c.duty || c.position || c.tmp_dutyid || "";
        const resolvedDuty = formatDuty(rawDuty);

        return {
          empno: cleanEmpno(c.newEmpno || c.old_empno || c.empno || ""),
          name: cleanText(c.candidate_name || c.candidateName || ""),
          dept_name: cleanText(resolvedDept),
          duty: cleanText(resolvedDuty),
          note: cleanText(c.note || ""),
        };
      });
    };

    // If candidates were explicitly passed from props
    if (candidates && candidates.length > 0) {
      setDataList(processCandidates(candidates));
      setLoading(false);
      return;
    }

    // Otherwise fetch candidates needing BQT
    const fetchBqtCandidates = async () => {
      try {
        const factory = loc || "dmc";
        const res = await fetch(`/api/candidates?bqt=true&loc=${factory}&limit=100`);
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setDataList(processCandidates(json.data));
        } else {
          setDataList([]);
        }
      } catch (e) {
        setDataList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBqtCandidates();
  }, [candidates, loc, deptLookup, blank]);

  if (loading) {
    return (
      <div
        className="p-8 text-center text-sm"
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
      >
        Đang tải danh sách BQT...
      </div>
    );
  }

  return (
    <div
      className="template-bqt-root text-black mx-auto"
      style={{
        fontFamily: '"Times New Roman", Times, serif',
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        lineHeight: "1.2",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm 8mm 10mm;
          }
          body, .template-bqt-root, .template-bqt-root * {
            font-family: "Times New Roman", Times, serif !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: #fff !important;
          }
          .no-print {
            display: none !important;
          }
          .bqt-page-container {
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }
        .template-bqt-root, .template-bqt-root * {
          font-family: "Times New Roman", Times, serif !important;
        }
        .bqt-table {
          width: 100%;
          border-collapse: collapse !important;
          font-family: "Times New Roman", Times, serif !important;
        }
        .bqt-table td, .bqt-table th {
          border: 1px solid #000 !important;
          font-family: "Times New Roman", Times, serif !important;
        }
        .bqt-chinese {
          font-family: "Times New Roman", SimSun, "宋体", Times, serif !important;
        }
      `,
        }}
      />

      {/* 1. Header Table (Matching legacy HR02-SP001-11) */}
      <table className="bqt-table" style={{ marginBottom: 0, fontSize: "11px" }}>
        <tbody>
          <tr>
            <td
              rowSpan={2}
              style={{
                width: "15%",
                textAlign: "center",
                verticalAlign: "middle",
                padding: "4px",
              }}
            >
              <img
                src="/logo.png"
                alt="Can Sports Logo"
                style={{ width: "70px", margin: "0 auto", display: "block" }}
              />
            </td>
            <td
              rowSpan={3}
              style={{
                width: "55%",
                textAlign: "center",
                verticalAlign: "middle",
                padding: "8px 6px",
                fontWeight: "bold",
                fontSize: "14.5px",
                lineHeight: "1.3",
              }}
            >
              DANH SÁCH BÙ QUẸT THẺ CÔNG NHÂN MỚI
              <br />
              <span className="bqt-chinese" style={{ fontSize: "13.5px" }}>
                新進員工補刷卡名單
              </span>
            </td>
            <td
              style={{
                width: "16%",
                textAlign: "center",
                verticalAlign: "middle",
                padding: "3px 4px",
                fontSize: "11px",
              }}
            >
              Ngày thiết lập (sửa đổi) <br />
              <span className="bqt-chinese">(修)訂日期</span>
            </td>
            <td
              style={{
                width: "14%",
                textAlign: "center",
                verticalAlign: "middle",
                padding: "3px 4px",
                fontWeight: "bold",
                fontSize: "11px",
              }}
            >
              14.08.2025
            </td>
          </tr>
          <tr>
            <td
              style={{
                textAlign: "center",
                verticalAlign: "middle",
                padding: "3px 4px",
                fontSize: "11px",
              }}
            >
              Mã số tài liệu <br />
              <span className="bqt-chinese">文件編號</span>
            </td>
            <td
              style={{
                textAlign: "center",
                verticalAlign: "middle",
                padding: "3px 4px",
                fontWeight: "bold",
                fontSize: "11px",
              }}
            >
              HR02-SP001-11
            </td>
          </tr>
          <tr>
            <td
              style={{
                textAlign: "center",
                verticalAlign: "middle",
                padding: "3px 2px",
                fontSize: "11px",
                lineHeight: "1.2",
              }}
            >
              Bộ phận soạn thảo <br />
              <span className="bqt-chinese">編訂部門</span> <br />
              <span style={{ whiteSpace: "nowrap" }}>Tài Nguyên Nhân Lực</span> <br />
              <span className="bqt-chinese">人力資源部</span>
            </td>
            <td
              style={{
                textAlign: "center",
                verticalAlign: "middle",
                padding: "3px 4px",
                fontSize: "11px",
              }}
            >
              Phiên bản <span className="bqt-chinese">版本</span> <br />
              <span style={{ fontWeight: "bold" }}>4</span>
            </td>
            <td
              style={{
                textAlign: "center",
                verticalAlign: "middle",
                padding: "3px 4px",
                fontSize: "11px",
              }}
            >
              Trang <span className="bqt-chinese">頁次</span> <br />
              <span style={{ fontWeight: "bold" }}>1</span>
            </td>
          </tr>
          <tr>
            <td
              colSpan={4}
              style={{
                textAlign: "left",
                padding: "4px 8px",
                fontSize: "11px",
                fontWeight: "normal",
              }}
            >
              Ngày điền biểu / <span className="bqt-chinese">填表日期</span>: {today}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 2. Main Data Table (Seamless top border, compact row height) */}
      <table
        className="bqt-table"
        style={{
          borderTop: "none",
          marginTop: 0,
          fontSize: "11px",
        }}
      >
        <thead>
          <tr style={{ background: "transparent" }}>
            <th
              style={{
                width: "5%",
                textAlign: "center",
                verticalAlign: "middle",
                padding: "4px 2px",
                fontWeight: "bold",
                borderTop: "none",
              }}
            >
              STT <br />
              <span className="bqt-chinese" style={{ fontWeight: "normal" }}>
                序號
              </span>
            </th>
            <th
              style={{
                width: "12%",
                textAlign: "center",
                verticalAlign: "middle",
                padding: "4px 2px",
                fontWeight: "bold",
                borderTop: "none",
              }}
            >
              Số thẻ <br />
              <span className="bqt-chinese" style={{ fontWeight: "normal" }}>
                工號
              </span>
            </th>
            <th
              style={{
                width: "27%",
                textAlign: "center",
                verticalAlign: "middle",
                padding: "4px 4px",
                fontWeight: "bold",
                borderTop: "none",
              }}
            >
              Họ và tên <br />
              <span className="bqt-chinese" style={{ fontWeight: "normal" }}>
                姓名
              </span>
            </th>
            <th
              style={{
                width: "28%",
                textAlign: "center",
                verticalAlign: "middle",
                padding: "4px 4px",
                fontWeight: "bold",
                borderTop: "none",
              }}
            >
              BỘ PHẬN <br />
              <span className="bqt-chinese" style={{ fontWeight: "normal" }}>
                部門
              </span>
            </th>
            <th
              style={{
                width: "14%",
                textAlign: "center",
                verticalAlign: "middle",
                padding: "4px 2px",
                fontWeight: "bold",
                borderTop: "none",
              }}
            >
              CHỨC VỤ <br />
              <span className="bqt-chinese" style={{ fontWeight: "normal" }}>
                職務
              </span>
            </th>
            <th
              style={{
                width: "14%",
                textAlign: "center",
                verticalAlign: "middle",
                padding: "4px 2px",
                fontWeight: "bold",
                borderTop: "none",
              }}
            >
              GHI CHÚ <br />
              <span className="bqt-chinese" style={{ fontWeight: "normal" }}>
                備註
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {blank ? (
            /* Chế độ Mẫu Trống: Hiển thị 15 dòng kẻ trắng sẵn sàng in điền tay */
            Array.from({ length: 15 }).map((_, idx) => (
              <tr key={`blank-${idx}`} style={{ lineHeight: "1.2", height: "28px" }}>
                <td style={{ textAlign: "center", verticalAlign: "middle", padding: "3px 2px", fontWeight: "normal" }}>
                  {idx + 1}
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle", padding: "3px 2px" }}></td>
                <td style={{ textAlign: "left", verticalAlign: "middle", padding: "3px 6px" }}></td>
                <td style={{ textAlign: "left", verticalAlign: "middle", padding: "3px 6px" }}></td>
                <td style={{ textAlign: "center", verticalAlign: "middle", padding: "3px 2px" }}></td>
                <td style={{ textAlign: "center", verticalAlign: "middle", padding: "3px 2px" }}></td>
              </tr>
            ))
          ) : dataList.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                style={{
                  padding: "12px",
                  textAlign: "center",
                  fontStyle: "italic",
                  color: "#666",
                }}
              >
                Chưa có dữ liệu cấp thẻ bù quẹt
              </td>
            </tr>
          ) : (
            dataList.map((item, idx) => (
              <tr key={idx} style={{ lineHeight: "1.2" }}>
                <td
                  style={{
                    textAlign: "center",
                    verticalAlign: "middle",
                    padding: "3px 2px",
                    fontWeight: "normal",
                  }}
                >
                  {idx + 1}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    verticalAlign: "middle",
                    padding: "3px 2px",
                    fontWeight: "bold",
                  }}
                >
                  {item.empno || "—"}
                </td>
                <td
                  style={{
                    textAlign: "left",
                    verticalAlign: "middle",
                    padding: "3px 6px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {item.name}
                </td>
                <td
                  style={{
                    textAlign: "left",
                    verticalAlign: "middle",
                    padding: "3px 6px",
                  }}
                >
                  {item.dept_name}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    verticalAlign: "middle",
                    padding: "3px 2px",
                  }}
                >
                  {item.duty}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    verticalAlign: "middle",
                    padding: "3px 2px",
                  }}
                >
                  {item.note}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 3. Signature Table (Matching legacy bqt.vue) */}
      <table
        style={{
          width: "100%",
          marginTop: "10px",
          borderCollapse: "collapse",
          border: "none",
          breakInside: "avoid",
          pageBreakInside: "avoid",
          fontFamily: '"Times New Roman", Times, serif',
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                width: "50%",
                textAlign: "center",
                verticalAlign: "middle",
                fontWeight: "bold",
                fontSize: "12.5px",
                border: "none",
                padding: "4px 20px",
                lineHeight: "1.4",
              }}
            >
              Chủ quản BP Tài Nguyên Nhân Lực <br />
              <span className="bqt-chinese" style={{ fontWeight: "normal" }}>
                人力資源部
              </span>
            </td>
            <td
              style={{
                width: "50%",
                textAlign: "center",
                verticalAlign: "middle",
                fontWeight: "bold",
                fontSize: "12.5px",
                border: "none",
                padding: "4px 20px",
                lineHeight: "1.4",
              }}
            >
              Người lập biểu <br />
              <span className="bqt-chinese" style={{ fontWeight: "normal" }}>
                填表人
              </span>
            </td>
          </tr>
          <tr>
            <td style={{ height: "45px", border: "none" }}></td>
            <td style={{ height: "45px", border: "none" }}></td>
          </tr>
          <tr>
            <td
              colSpan={2}
              style={{
                textAlign: "left",
                fontSize: "11px",
                border: "none",
                paddingTop: "4px",
                whiteSpace: "nowrap",
                lineHeight: "1.4",
              }}
            >
              Chú ý: Người lập biểu ➜ Chủ quản BP Tài Nguyên Nhân Lực <br />
              <span className="bqt-chinese">表單流程：填表人 ➜ 人力資源部</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
