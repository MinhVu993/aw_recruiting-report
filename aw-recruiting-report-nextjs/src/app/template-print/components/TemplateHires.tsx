"use client";

import React, { useEffect, useState } from "react";

interface HiresItem {
  ex_en_date?: string;
  candidate_name?: string;
  duty_name?: string;
  tmp_departid?: string;
  reg?: string;
  reason?: string;
  change_en_date?: string;
  note?: string;
  [key: string]: any;
}

interface TemplateHiresProps {
  candidates?: any[];
  loc?: string;
  blank?: boolean;
}

export default function TemplateHires({ candidates, loc, blank = false }: TemplateHiresProps) {
  const [dataList, setDataList] = useState<HiresItem[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // Nếu là chế độ Mẫu Trống (blank = true): Không gọi API, hiển thị các dòng trắng điền tay
    if (blank) {
      setDataList([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      if (candidates && candidates.length > 0) {
        const formatted = candidates.map((item: any) => {
          const c = item.data || item;
          return {
            ex_en_date: c.ex_en_date || c.exEnDate || "",
            candidate_name: c.candidate_name || c.candidateName || "",
            duty_name: c.position || c.duty || c.tmp_dutyid || "",
            tmp_departid: c.tmp_departid || c.tmpDepartid || c.apply_dp || "",
            reg: c.reg || "",
            reason: c.reason || "",
            change_en_date: c.change_en_date || c.changeEnDate || "",
            note: c.note || "",
          };
        }).sort((a, b) => (a.tmp_departid || "").localeCompare(b.tmp_departid || "", "vi"));

        setDataList(formatted);
        setLoading(false);
        return;
      }

      try {
        const factory = loc || "all";
        const res = await fetch(`/api/candidates?loc=${factory}&limit=100`);
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          const formatted = json.data
            .map((c: any) => ({
              ex_en_date: c.exEnDate || c.ex_en_date || "",
              candidate_name: c.candidateName || c.candidate_name || "",
              duty_name: c.position || c.duty || "",
              tmp_departid: c.tmpDepartid || c.applyDp || "",
              reg: c.reg || "",
              reason: c.reason || "",
              change_en_date: c.changeEnDate || "",
              note: c.note || "",
            }))
            .sort((a: any, b: any) => (a.tmp_departid || "").localeCompare(b.tmp_departid || "", "vi"));

          setDataList(formatted);
        } else {
          setDataList([]);
        }
      } catch (e) {
        setDataList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [candidates, loc, blank]);

  if (loading) {
    return <div className="p-8 text-center text-sm font-sans">Đang tải danh sách Tuyển dụng...</div>;
  }

  return (
    <div
      className="template-hires-root text-black max-w-5xl mx-auto"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .template-hires-root, .template-hires-root * {
              font-family: "Times New Roman", Times, serif !important;
            }
            @media print {
              body, .template-hires-root, .template-hires-root * {
                font-family: "Times New Roman", Times, serif !important;
              }
            }
          `,
        }}
      />
      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-base font-bold uppercase tracking-wide" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
          BẢNG THEO DÕI CÔNG NHÂN VIÊN ĐẾN TUYỂN DỤNG
        </h2>
        <h3 className="text-sm font-bold text-zinc-700" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
          員工報到追蹤表
        </h3>
      </div>

      <table className="w-full border-collapse border border-black text-xs text-center">
        <thead>
          <tr>
            <td colSpan={10} className="border border-black p-2 text-left font-semibold">
              Ngày điền biểu / 填表日期: {today}
            </td>
          </tr>
          <tr className="bg-gray-100 font-bold border-b border-black">
            <th className="border border-black p-2 w-10">STT <br />序號</th>
            <th className="border border-black p-2 w-28">DỰ KIẾN Tuyển dụng <br />報到日期</th>
            <th className="border border-black p-2 w-48 text-left pl-3">Họ và tên <br />姓名</th>
            <th className="border border-black p-2 w-32">CHỨC VỤ <br />職務</th>
            <th className="border border-black p-2 w-36">BỘ PHẬN <br />部門</th>
            <th className="border border-black p-2 w-20">ĐÃ ĐẾN <br />已來任職</th>
            <th className="border border-black p-2 w-20">KHÔNG ĐẾN <br />未來任職</th>
            <th className="border border-black p-2 w-28">LÝ DO <br />理由</th>
            <th className="border border-black p-2 w-28">ĐỔI NGÀY <br />改任職日期</th>
            <th className="border border-black p-2 w-28">GHI CHÚ <br />備註</th>
          </tr>
        </thead>
        <tbody>
          {dataList.length === 0 ? (
            <tr>
              <td colSpan={10} className="border border-black p-4 text-center italic text-gray-500">
                Chưa có dữ liệu danh sách theo dõi tuyển dụng
              </td>
            </tr>
          ) : (
            dataList.map((item, idx) => {
              const isArrived = item.reg === "yes";
              const isNotArrived = !isArrived && item.reg !== "" && item.reg !== undefined;

              return (
                <tr key={idx} className="border-b border-black">
                  <td className="border border-black p-1.5 font-semibold">{idx + 1}</td>
                  <td className="border border-black p-1.5">{item.ex_en_date || "—"}</td>
                  <td className="border border-black p-1.5 font-bold uppercase text-left pl-3">{item.candidate_name}</td>
                  <td className="border border-black p-1.5">{item.duty_name}</td>
                  <td className="border border-black p-1.5">{item.tmp_departid}</td>
                  <td className="border border-black p-1.5 font-bold text-center text-sm">{isArrived ? "✓" : ""}</td>
                  <td className="border border-black p-1.5 font-bold text-center text-sm">{isNotArrived ? "✓" : ""}</td>
                  <td className="border border-black p-1.5 text-left pl-2">{item.reason || ""}</td>
                  <td className="border border-black p-1.5">{item.change_en_date || ""}</td>
                  <td className="border border-black p-1.5">{item.note || ""}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
