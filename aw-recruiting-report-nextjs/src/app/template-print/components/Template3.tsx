"use client";

import React, { useEffect, useState } from "react";

interface CandidateData {
  id?: number;
  candidate_name?: string;
  emp_id?: string;
  emp_id_old?: string;
  tmp_departid?: string;
  act_en_date?: string;
  [key: string]: any;
}

interface ProcessedCandidate {
  name: string;
  cccd: string;
  times_in_company: number | string;
  join_date: string;
  emp_id: string;
  dept_name: string;
  resign_date: string;
  seniority?: string;
  er_type_resign: string;
  resign_reason_text: string;
}

interface Template3Props {
  candidates: CandidateData[];
}

export default function Template3({ candidates }: Template3Props) {
  const [processed, setProcessed] = useState<ProcessedCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          candidates.map(async (cand) => {
            const c = cand.data || cand;
            const cccd = c.emp_id || "";
            const oldId = c.emp_id_old || "";

            let resignInfo: any = null;
            try {
              const res = await fetch("/api/vg-recuitingReport/GetDataByCCCDResign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emp_id: cccd || oldId }),
              });
              const data = await res.json();
              if (Array.isArray(data) && data.length > 0) {
                resignInfo = data.reduce((latest: any, cur: any) => {
                  const d1 = new Date(latest.er_resigndate || 0).getTime();
                  const d2 = new Date(cur.er_resigndate || 0).getTime();
                  return d2 > d1 ? cur : latest;
                }, data[0]);
              }
            } catch (e) {}

            let times = 1;
            try {
              const resTimes = await fetch(`/api/vg-recuitingReport/checkCccd/${cccd || oldId}`);
              const jsonTimes = await resTimes.json();
              if (jsonTimes.count) times = jsonTimes.count;
            } catch (e) {}

            let displayType = "";
            if (resignInfo?.er_type_resign) {
              try {
                const parsed = typeof resignInfo.er_type_resign === "string" ? JSON.parse(resignInfo.er_type_resign) : resignInfo.er_type_resign;
                displayType = parsed.vi || parsed.en || parsed.cn || resignInfo.er_type_resign;
              } catch {
                displayType = resignInfo.er_type_resign;
              }
            }

            return {
              name: resignInfo?.er_name || c.candidate_name || "",
              cccd: resignInfo?.er_numberid || cccd || "",
              times_in_company: times,
              join_date: resignInfo?.er_indate || c.act_en_date || "",
              emp_id: resignInfo?.er_empid || c.old_empno || "",
              dept_name: resignInfo?.er_deptname || c.tmp_departid || "",
              resign_date: resignInfo?.er_resigndate || "",
              seniority: resignInfo?.er_seniority || "",
              er_type_resign: displayType,
              resign_reason_text: resignInfo?.er_reason || resignInfo?.er_note || "",
            };
          })
        );
        setProcessed(results);
      } catch (e) {
        setProcessed([]);
      } finally {
        setLoading(false);
      }
    };

    if (candidates.length > 0) {
      loadAll();
    } else {
      setLoading(false);
    }
  }, [candidates]);

  if (loading) {
    return <div className="p-8 text-center text-sm font-sans">Đang tải dữ liệu hồ sơ thôi việc...</div>;
  }

  if (processed.length === 0) {
    return (
      <div className="p-8 text-center text-sm font-sans text-amber-700 bg-amber-50 rounded-lg border border-amber-200">
        Không tìm thấy thông tin hồ sơ thôi việc cho ứng viên được chọn.
      </div>
    );
  }

  return (
    <div
      className="template3-root text-black"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .template3-root, .template3-root * {
              font-family: "Times New Roman", Times, serif !important;
            }
          `,
        }}
      />
      {processed.map((candidate, index) => (
        <div
          key={index}
          className={`print-page mb-8 print:mb-0 ${
            index < processed.length - 1 ? "print:break-after-page" : ""
          }`}
        >
          {/* Screen-only candidate index banner */}
          {processed.length > 1 && (
            <div className="no-print flex items-center justify-between pb-2 mb-3 border-b border-zinc-200 text-xs text-zinc-600 font-sans">
              <span>
                Ứng viên <strong>{index + 1} / {processed.length}</strong>:{" "}
                <strong className="text-black uppercase">{candidate.name}</strong>
              </span>
              <span className="font-mono text-[11px] bg-zinc-100 px-2 py-0.5 rounded">
                CCCD: {candidate.cccd || "—"} | Lần vào Cty: {candidate.times_in_company}
              </span>
            </div>
          )}

          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="border-b border-black">
                <td className="p-2 border-r border-black text-center align-middle w-[15%]">
                  <img src="/logo.png" alt="Logo" className="w-[75px] mx-auto block" />
                </td>
                <td colSpan={5} className="p-3 text-center align-middle font-bold text-base leading-snug">
                  員工離職回廠紀錄與工作承諾書 <br />
                  BẢN CAM KẾT VỀ VIỆC NHÂN VIÊN NGHỈ VIỆC QUAY TRỞ LẠI CÔNG TY LÀM VIỆC
                </td>
              </tr>
            </thead>
            <tbody>
              {/* Personal Info */}
              <tr className="bg-gray-100 font-bold border-b border-black">
                <th colSpan={6} className="p-1.5 text-left uppercase">
                  THÔNG TIN CÁ NHÂN 個人基本資料:
                </th>
              </tr>
              <tr className="border-b border-black text-center">
                <td className="p-1.5 bg-gray-50 border-r border-black font-semibold w-[16%]">Họ tên <br />姓名</td>
                <td className="p-1.5 border-r border-black font-bold uppercase w-[20%]">{candidate.name}</td>
                <td className="p-1.5 bg-gray-50 border-r border-black font-semibold w-[14%]">CCCD <br />身分證號</td>
                <td className="p-1.5 border-r border-black font-mono w-[20%]">{candidate.cccd}</td>
                <td className="p-1.5 bg-gray-50 border-r border-black font-semibold w-[16%]">Số lần vào Cty <br />進廠次數</td>
                <td className="p-1.5 font-bold w-[14%]">{candidate.times_in_company}</td>
              </tr>
              <tr className="border-b border-black text-center">
                <td className="p-1.5 bg-gray-50 border-r border-black font-semibold">Ngày vào cty <br />原入廠日</td>
                <td className="p-1.5 border-r border-black">{candidate.join_date}</td>
                <td className="p-1.5 bg-gray-50 border-r border-black font-semibold">Mã CNV cũ <br />原員工編號</td>
                <td className="p-1.5 border-r border-black font-mono">{candidate.emp_id}</td>
                <td className="p-1.5 bg-gray-50 border-r border-black font-semibold">Bộ phận cũ <br />原任職單位</td>
                <td className="p-1.5">{candidate.dept_name}</td>
              </tr>
              <tr className="border-b border-black text-center">
                <td className="p-1.5 bg-gray-50 border-r border-black font-semibold">Ngày thôi việc <br />原離廠日</td>
                <td className="p-1.5 border-r border-black">
                  <div>{candidate.resign_date}</div>
                  {candidate.seniority && (
                    <div className="text-[10px] text-zinc-600 font-medium">({candidate.seniority})</div>
                  )}
                </td>
                <td className="p-1.5 bg-gray-50 border-r border-black font-semibold">Loại thôi việc <br />離職類型</td>
                <td className="p-1.5 border-r border-black">{candidate.er_type_resign}</td>
                <td className="p-1.5 bg-gray-50 border-r border-black font-semibold">Lý do thôi việc <br />離職原因</td>
                <td className="p-1.5">{candidate.resign_reason_text}</td>
              </tr>

              {/* Awards and Discipline */}
              <tr className="bg-gray-100 font-bold border-b border-black">
                <td colSpan={6} className="p-1.5 text-left uppercase">
                  KHEN THƯỞNG VÀ XỬ PHẠT 獎勵與處分
                </td>
              </tr>
              <tr className="border-b border-black text-center">
                <td rowSpan={2} className="p-1.5 border-r border-black font-semibold bg-gray-50 align-middle">
                  Khen thưởng <br />獎勵
                </td>
                <td className="p-1 border-r border-black">Ghi công lớn (lần) <br />大功（次）</td>
                <td className="p-1 border-r border-black">Ghi công nhỏ (lần) <br />小功（次）</td>
                <td colSpan={2} className="p-1 border-r border-black">Khen thưởng (lần) <br />嘉獎（次）</td>
                <td className="p-1">Loại khác (lần) <br />其他（次）</td>
              </tr>
              <tr className="border-b border-black text-center h-7">
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td colSpan={2} className="border-r border-black"></td>
                <td></td>
              </tr>
              <tr className="border-b border-black text-center">
                <td rowSpan={2} className="p-1.5 border-r border-black font-semibold bg-gray-50 align-middle">
                  Xử phạt <br />處分
                </td>
                <td className="p-1 border-r border-black">Khiển trách miệng (lần) <br />口頭警告（次）</td>
                <td className="p-1 border-r border-black">Khiển trách văn bản (lần) <br />書面警告（次）</td>
                <td colSpan={2} className="p-1 border-r border-black">Hoãn nâng lương 6 tháng <br />延後六個月調薪（次）</td>
                <td className="p-1">Loại khác (lần) <br />其他（次）</td>
              </tr>
              <tr className="border-b border-black text-center h-7">
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td colSpan={2} className="border-r border-black"></td>
                <td></td>
              </tr>

              {/* Former Supervisor Confirmation */}
              <tr className="bg-gray-100 font-bold border-b border-black">
                <th colSpan={6} className="p-1.5 text-left uppercase">
                  XÁC NHẬN CỦA CHỦ QUẢN CŨ CÓ PHỎNG VẤN KHÔNG: 原單位主管是否進行面試
                </th>
              </tr>
              <tr className="border-b border-black">
                <td colSpan={5} className="p-2 border-r border-black">
                  <div className="space-y-1.5 text-xs">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" readOnly className="h-4 w-4" />
                      <span>Có nhận vào bộ phận cũ 是, 回原單位就職</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" readOnly className="h-4 w-4" />
                      <span>Chuyển bộ phận khác 否, 轉介其他單位</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" readOnly className="h-4 w-4" />
                      <span>Lý do khác 否, 請列出具體原因:</span>
                      <span className="flex-1 border-b border-black ml-2 inline-block"></span>
                    </label>
                  </div>
                </td>
                <td className="p-2 text-center align-top font-semibold">
                  Ký tên 簽名:
                  <div className="h-10"></div>
                </td>
              </tr>

              {/* Commitment */}
              <tr className="bg-gray-100 font-bold border-b border-black">
                <td colSpan={5} className="p-1.5 border-r border-black">
                  Nội dung tự kiểm điểm và cam kết 反思與承諾
                </td>
                <td className="p-1.5 text-center leading-tight text-[11px]">
                  Vâng, tôi đã hiểu 我已經明白了 <br />
                  (đánh dấu xác nhận)（確認後打勾）
                </td>
              </tr>
              <tr className="border-b border-black">
                <td colSpan={5} className="p-2 border-r border-black text-xs leading-relaxed">
                  1. Tôi hiểu hành vi của mình ảnh hưởng đến công việc và quyền lợi.
                  <br /><span className="text-zinc-600">我已經知道自己的行為會影響工作表現和待遇。</span>
                </td>
                <td className="p-2 text-center align-middle">
                  <input type="checkbox" defaultChecked readOnly className="h-4 w-4" />
                </td>
              </tr>
              <tr className="border-b border-black">
                <td colSpan={5} className="p-2 border-r border-black text-xs leading-relaxed">
                  2. Tôi hiểu thái độ làm việc ảnh hưởng đến đồng nghiệp và nhóm.
                  <br /><span className="text-zinc-600">我已經知道自己的工作態度會影響團隊和同事。</span>
                </td>
                <td className="p-2 text-center align-middle">
                  <input type="checkbox" defaultChecked readOnly className="h-4 w-4" />
                </td>
              </tr>
              <tr className="border-b border-black">
                <td colSpan={5} className="p-2 border-r border-black text-xs leading-relaxed">
                  3. Lần này công ty cho tôi cơ hội quay lại, tôi cam kết tuân thủ quy định công ty và hoàn thành công việc do chủ quản giao.
                  <br /><span className="text-zinc-600">這次公司給我機會回來工作，我承諾遵守公司規定並完成主管交代的工作。</span>
                </td>
                <td className="p-2 text-center align-middle">
                  <input type="checkbox" defaultChecked readOnly className="h-4 w-4" />
                </td>
              </tr>

              {/* Signatures */}
              <tr className="border-b border-black text-center font-semibold text-xs bg-gray-50">
                <td colSpan={2} className="p-2 border-r border-black">
                  CNV Cam Kết <br />員工簽名
                </td>
                <td colSpan={2} className="p-2 border-r border-black">
                  Chủ Quản Đơn Vị Cũ <br />原單位主管簽名
                </td>
                <td colSpan={2} className="p-2">
                  BP. Tài Nguyên Nhân Lực <br />人力資源部
                </td>
              </tr>
              <tr className="h-20 text-center align-bottom text-xs">
                <td colSpan={2} className="p-2 border-r border-black pb-2 italic text-zinc-500">(Ký và ghi rõ họ tên)</td>
                <td colSpan={2} className="p-2 border-r border-black pb-2 italic text-zinc-500">(Ký và ghi rõ họ tên)</td>
                <td colSpan={2} className="p-2 pb-2 italic text-zinc-500">(Ký và ghi rõ họ tên)</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
