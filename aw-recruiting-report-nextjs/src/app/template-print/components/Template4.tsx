"use client";

import React from "react";

interface CandidateData {
  candidate_name?: string;
  position?: string;
  department?: string;
  tmp_departid?: string;
  probation?: string;
  ex_en_date?: string;
  [key: string]: any;
}

interface Template4Props {
  candidates: CandidateData[];
}

export default function Template4({ candidates }: Template4Props) {
  const today = new Date();
  const dayStr = String(today.getDate()).padStart(2, "0");
  const monthStr = String(today.getMonth() + 1).padStart(2, "0");
  const yearStr = String(today.getFullYear());

  const parseExDate = (dateString?: string) => {
    if (!dateString || dateString === "no") {
      return { day: ".......", month: ".......", year: "20......." };
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) {
      return { day: ".......", month: ".......", year: "20......." };
    }
    return {
      day: String(d.getDate()).padStart(2, "0"),
      month: String(d.getMonth() + 1).padStart(2, "0"),
      year: String(d.getFullYear()),
    };
  };

  return (
    <div
      className="template4-root text-black"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .template4-root, .template4-root * {
              font-family: "Times New Roman", Times, serif !important;
            }
          `,
        }}
      />
      {candidates.map((candidate, index) => {
        const c = candidate.data || candidate;
        const exDate = parseExDate(c.ex_en_date);
        const prob = String(c.probation || "");

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
                  <strong className="text-black uppercase">{c.candidate_name || ""}</strong>
                </span>
                <span className="font-mono text-[11px] bg-zinc-100 px-2 py-0.5 rounded">
                  Bộ phận: {c.tmp_departid || c.department || "—"} | {c.position || "—"}
                </span>
              </div>
            )}

            <table className="w-full border-collapse border border-black text-center text-xs">
              <tbody>
                <tr>
                  <td rowSpan={2} className="border border-black p-2 align-middle w-[15%]">
                    <img src="/logo.png" alt="Logo" className="w-[75px] mx-auto block" />
                  </td>
                  <td rowSpan={3} className="border border-black p-2 text-center align-middle font-bold text-base w-[55%]">
                    THƯ MỜI Tuyển dụng
                    <br />
                    錄用通知書
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
                  <td className="border border-black p-1 text-xs font-semibold">ADHR02-SP001-05</td>
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
                    <span className="font-semibold">5</span>
                  </td>
                  <td className="border border-black p-1 align-middle text-xs">
                    Trang 頁次 <br />
                    <span className="font-semibold">1/1</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <table className="w-full border-collapse border border-black text-left text-xs mt-2.5 leading-relaxed">
              <tbody>
                <tr>
                  <td colSpan={12} className="px-5 pt-2 pb-0 font-bold text-sm">
                    Kính gửi: Anh/Chị {c.candidate_name || ""}
                  </td>
                </tr>
                <tr>
                  <td colSpan={12} className="px-5 pt-0 pb-1 font-bold text-xs">
                    親愛的先生小姐您好:
                  </td>
                </tr>
                <tr>
                  <td colSpan={12} className="px-5 py-0.5 text-justify indent-5 leading-relaxed text-xs">
                    Trước tiên, xin chân thành cám ơn Anh/Chị đã đến dự cuộc phỏng vấn của Công ty chúng tôi, sau khi thông qua sự đánh giá của Chủ quản Công ty chúng tôi, nay chúng tôi thông báo Anh/Chị chính thức gia nhập Công ty TNHH Can Sports Việt Nam.
                  </td>
                </tr>
                <tr>
                  <td colSpan={12} className="px-5 py-0.5 text-justify indent-5 leading-relaxed text-xs">
                    首先,我們公司誠摯的感謝您抽空到Can Sports Vietnam面試, 也恭喜您通過我們公司主管們的面試, 故以此錄用通知書知會與期盼您加入我們公司.
                  </td>
                </tr>
                <tr>
                  <td colSpan={12} className="px-5 py-1 text-xs">
                    Thời gian thử việc 試用期時間 :
                    <label className="ml-4">
                      <input type="checkbox" checked={prob === "6"} readOnly className="mr-1" /> 06 ngày日
                    </label>
                    <label className="ml-4">
                      <input type="checkbox" checked={prob === "30"} readOnly className="mr-1" /> 30 ngày日
                    </label>
                    <label className="ml-4">
                      <input type="checkbox" checked={prob === "60"} readOnly className="mr-1" /> 60 ngày日
                    </label>
                  </td>
                </tr>
                <tr>
                  <td colSpan={12} className="px-5 py-1 text-xs">
                    Thời gian Tuyển dụng 正式報到日期為: 07 h 15 Ngày 日 {exDate.day} Tháng 月 {exDate.month} Năm 年 {exDate.year}
                  </td>
                </tr>
                <tr>
                  <td colSpan={12} className="px-5 py-1 text-justify text-[11px] leading-relaxed">
                    ❖ Những điều cần lưu ý: Khi đến Tuyển dụng phải bổ sung đầy đủ những hồ sơ còn thiếu cho Tổ tuyển dụng. Vui lòng mặc trang phục lịch sự, không mang dép lê, tập trung tại cổng bảo vệ công ty đúng giờ hẹn đã ghi trên. Không được tự ý vào Bp. duyệt khi chưa có hướng dẫn của nhân viên Tổ tuyển dụng. Không trả lại hồ sơ đã nhận. Nếu Anh/Chị chưa sắp xếp được thời gian đến Tuyển dụng, xin điện thoại thông báo trước 02 ngày gặp Tổ tuyển dụng Bộ phận Nhân sự. ĐT : 0276.3721.111 (134,139) &amp; Hotline: 0384.334.322
                  </td>
                </tr>
                <tr>
                  <td colSpan={12} className="px-5 py-1 text-justify text-[11px] leading-relaxed">
                    注意事項: 報到當天請務必備齊所有報到所需要的文件資料,以便招募組查核使用,請著較適合上班的衣服,請勿穿著拖鞋.並於報到時間之前在公司警衛室前集合完畢.如果您未能於約定時間報到,請務必於報到前兩天知會HR招募組
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="px-5 pt-2 pb-3 align-top italic text-[10px]">
                    Các hồ sơ cần bổ sung:
                    <br />報到所需文件:
                    <div className="mt-1 space-y-1 not-italic text-xs">
                      <div className="flex justify-between items-center pr-6">
                        <span>1.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Hồ sơ OK所有文件都已備齊,無須補充</span>
                        <div className="w-3.5 h-3.5 border border-black inline-block"></div>
                      </div>
                      <div className="flex justify-between items-center pr-6">
                        <span>2.____ CCCD身分證</span>
                        <div className="w-3.5 h-3.5 border border-black inline-block"></div>
                      </div>
                      <div className="flex justify-between items-center pr-6">
                        <span>3.____ Giấy xác nhận HK個人履歷</span>
                        <div className="w-3.5 h-3.5 border border-black inline-block"></div>
                      </div>
                      <div className="flex justify-between items-center pr-6">
                        <span>4.____ Giấy KSK體檢報告</span>
                        <div className="w-3.5 h-3.5 border border-black inline-block"></div>
                      </div>
                      <div className="flex justify-between items-center pr-6">
                        <span>5.____ Văn bằng學歷證書</span>
                        <div className="w-3.5 h-3.5 border border-black inline-block"></div>
                      </div>
                    </div>
                  </td>
                  <td colSpan={6} className="px-5 pt-3 pb-3 text-center align-top">
                    <strong>
                      CANSPORTS, NGÀY 日 {dayStr} THÁNG 月 {monthStr} NĂM 年 {yearStr}
                      <br />
                      BỘ PHẬN TÀI NGUYÊN NHÂN LỰC
                      <br />
                      人力資源部
                    </strong>
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
