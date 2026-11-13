"use client";

import React from "react";

interface CandidateData {
  candidate_name?: string;
  position?: string;
  department?: string;
  apply_dp?: string;
  tmp_departid?: string;
  [key: string]: any;
}

interface Template1Props {
  candidates: CandidateData[];
}

export default function Template1({ candidates }: Template1Props) {
  const today = new Date();
  const dayStr = String(today.getDate()).padStart(2, "0");
  const monthStr = String(today.getMonth() + 1).padStart(2, "0");
  const yearStr = String(today.getFullYear());

  return (
    <div
      className="template1-root text-black"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .template1-root, .template1-root * {
              font-family: "Times New Roman", Times, serif !important;
            }
          `,
        }}
      />
      {candidates.map((candidate, index) => {
        const candidateName = candidate.candidate_name || "";
        const dept = candidate.department || candidate.tmp_departid || candidate.apply_dp || "";
        const pos = candidate.position || "";

        return (
          <div
            key={index}
            className={`print-page mb-8 print:mb-0 ${
              index < candidates.length - 1 ? "print:break-after-page" : ""
            }`}
          >
            {/* Screen-only candidate index banner */}
            {candidates.length > 1 && (
              <div className="no-print flex items-center justify-between pb-2 mb-3 border-b border-zinc-200 text-xs text-zinc-600 font-sans">
                <span>
                  Ứng viên <strong>{index + 1} / {candidates.length}</strong>:{" "}
                  <strong className="text-black uppercase">{candidateName}</strong>
                </span>
                <span className="font-mono text-[11px] bg-zinc-100 px-2 py-0.5 rounded">
                  Bộ phận: {dept || "—"} {pos ? `(${pos})` : ""}
                </span>
              </div>
            )}

            <table className="w-full border-collapse border border-black mb-3 text-center text-sm">
              <tbody>
                <tr>
                  <td rowSpan={2} className="border border-black p-2 align-middle w-[15%]">
                    <img src="/logo.png" alt="Logo" className="w-[75px] mx-auto block" />
                  </td>
                  <td rowSpan={3} className="border border-black p-2 text-center align-middle font-bold text-base w-[55%]">
                    GIẤY HẸN PHỎNG VẤN
                    <br />
                    面試通知單
                  </td>
                  <td className="border border-black p-1 text-xs w-[16%]">
                    Ngày thiết lập (sửa đổi) <br />
                    制(修)訂日期
                  </td>
                  <td className="border border-black p-1 text-xs font-semibold w-[14%]">24.01.2026</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 text-xs">
                    Mã số tài liệu <br />
                    文件編號
                  </td>
                  <td className="border border-black p-1 text-xs font-semibold">ADHR02-SP001-13</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 align-middle text-xs">
                    Bộ phận soạn thảo <br />
                    編訂部門 <br />
                    <span className="whitespace-nowrap">Tài Nguyên Nhân Lực</span> <br />
                    人力資源部
                  </td>
                  <td className="border border-black p-1 align-middle text-xs">
                    Phiên bản 版本 <br />
                    <span className="font-semibold">4</span>
                  </td>
                  <td className="border border-black p-1 align-middle text-xs">
                    Trang 頁次 <br />
                    <span className="font-semibold">1/1</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <table className="w-full border-collapse border border-black text-left text-sm leading-relaxed mt-2.5">
              <tbody>
                <tr>
                  <td colSpan={6} className="px-2 pt-2 text-left">
                    Mời anh (chị): <strong className="uppercase">{candidateName}</strong>
                  </td>
                  <td colSpan={6} className="px-2 pt-2 text-left">
                    Vị trí ứng tuyển: {dept} {pos ? `(${pos})` : ""}
                  </td>
                </tr>
                <tr className="text-xs text-zinc-600">
                  <td colSpan={6} className="px-2 pb-1 text-left">請先生（小姐）：</td>
                  <td colSpan={6} className="px-2 pb-1 text-left">申請職位：</td>
                </tr>
                <tr>
                  <td colSpan={12} className="px-2 pt-1 text-left">
                    <span className="inline-block w-16">Vào lúc:</span> ...............
                    <span className="inline-block w-10 text-center">giờ</span> ...............
                    <span className="inline-block w-12 text-center">ngày</span> ...............
                    <span className="inline-block w-14 text-center">tháng</span> ...............
                    <span className="inline-block w-12 text-center">năm</span> ...............
                  </td>
                </tr>
                <tr className="text-xs text-zinc-600">
                  <td colSpan={12} className="px-2 pb-1 text-left">
                    <span className="inline-block w-16">時間：</span> ...............
                    <span className="inline-block w-10 text-center">點</span> ...............
                    <span className="inline-block w-12 text-center">日</span> ...............
                    <span className="inline-block w-14 text-center">月</span> ...............
                    <span className="inline-block w-12 text-center">年</span> ...............
                  </td>
                </tr>
                <tr>
                  <td colSpan={12} className="px-2 pt-1 text-left">
                    Đến tại trụ sở chính công ty : <strong>Thuận Hòa – Truông Mít – Dương Minh Châu – Tây Ninh</strong>
                  </td>
                </tr>
                <tr className="text-xs text-zinc-600">
                  <td colSpan={12} className="px-2 pb-1 text-left">
                    至公司地址：<strong>Thuan Hoa, Truong Mit, Duong Minh Chau, Tay Ninh</strong>
                  </td>
                </tr>
                <tr>
                  <td colSpan={12} className="px-2 pt-1 text-left">
                    Điện thoại: <strong>02763.721.111 (134, 139)</strong> &amp; Hotline: <strong>0384.334.322</strong>
                  </td>
                </tr>
                <tr className="text-xs text-zinc-600">
                  <td colSpan={12} className="px-2 pb-1 text-left">
                    電話：<strong>02763.721.111 (134, 139)</strong> &amp; 熱線：<strong>0384.334.322</strong>
                  </td>
                </tr>
                <tr>
                  <td colSpan={12} className="px-2 pt-2 text-left">
                    <div className="flex items-start">
                      <span className="whitespace-nowrap mr-3">Lý do 理由:</span>
                      <div className="flex flex-col gap-1">
                        <label className="inline-flex items-center space-x-1.5">
                          <input type="checkbox" readOnly className="h-3.5 w-3.5" />
                          <span>Phỏng vấn 面試</span>
                        </label>
                        <label className="inline-flex items-center space-x-1.5">
                          <input type="checkbox" readOnly className="h-3.5 w-3.5" />
                          <span>Hoàn tất hồ sơ 繳交面試相關檔案</span>
                        </label>
                        <label className="inline-flex items-center space-x-1.5">
                          <input type="checkbox" readOnly className="h-3.5 w-3.5" />
                          <span>Khác 其他:</span>
                          <span className="inline-block w-64 border-b border-dotted border-black ml-1"></span>
                        </label>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colSpan={12} className="px-2 pt-4 pb-4 text-right">
                    <div className="inline-block text-center mr-12">
                      <strong>
                        CANSPORTS, NGÀY 日 {dayStr} THÁNG 月 {monthStr} NĂM 年 {yearStr}
                        <br />
                        BỘ PHẬN TÀI NGUYÊN NHÂN LỰC
                        <br />
                        人力資源部
                      </strong>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colSpan={12} className="px-2 pb-2 text-left italic text-xs">
                    *Lưu ý : Giấy hẹn có giá trị đến hết ngày: Ngày ....... tháng ....... năm .......
                    <br />
                    注意：此通知有效日只至：..........年............月...........日
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
