"use client";

import React from "react";

interface CandidateData {
  candidate_name?: string;
  emp_id?: string;
  dateofbirth?: string;
  regTel?: string;
  commTel?: string;
  email?: string;
  regAddress?: string;
  commAddress?: string;
  edu?: string;
  key_in_date?: string;
  position?: string;
  hr_ac_qu?: string;
  dp_ac_qu?: string;
  [key: string]: any;
}

interface Template2CnProps {
  candidates: CandidateData[];
}

export default function Template2Cn({ candidates }: Template2CnProps) {
  return (
    <div className="template2cn-root text-black" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .template2cn-root, .template2cn-root * {
              font-family: "Times New Roman", Times, serif !important;
            }
          `,
        }}
      />
      {candidates.map((candidate, index) => {
        const c = candidate.data || candidate;
        const eduCode = c.edu || "";
        const isTieuhoc = eduCode === "001" || eduCode === "1";
        const isThcs = eduCode === "002" || eduCode === "003" || eduCode === "2" || eduCode === "3";
        const isThpt = eduCode === "004" || eduCode === "005" || eduCode === "4" || eduCode === "5";
        const isTrungcap = eduCode === "006" || eduCode === "6";
        const isCaodang = eduCode === "007" || eduCode === "7";
        const isDaihoc = eduCode === "008" || eduCode === "8";

        const isHrAccept = c.hr_ac_qu === "yes";
        const isHrReject = c.hr_ac_qu === "no" || (c.hr_ac_qu && c.hr_ac_qu !== "yes");
        const isDpAccept = c.dp_ac_qu === "yes";
        const isDpReject = c.dp_ac_qu === "no" || (c.dp_ac_qu && c.dp_ac_qu !== "yes");

        const posLower = (c.position || "").toLowerCase().trim();
        const positionDisplay =
          posLower === "worker"
            ? "Công nhân"
            : posLower === "staff"
            ? "Nhân viên"
            : posLower === "leader"
            ? "Tổ trưởng"
            : posLower === "engineer"
            ? "Kỹ sư"
            : c.position || "Công nhân";

        return (
          <div
            key={index}
            className={`print-page mb-8 print:mb-0 ${
              index < candidates.length - 1 ? "print:break-after-page" : ""
            }`}
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            {/* Screen-only candidate index banner */}
            {candidates.length > 1 && (
              <div className="no-print flex items-center justify-between pb-2 mb-3 border-b border-zinc-200 text-xs text-zinc-600">
                <span>
                  Ứng viên <strong>{index + 1} / {candidates.length}</strong>:{" "}
                  <strong className="text-black uppercase">{c.candidate_name || ""}</strong>
                </span>
                <span className="font-mono text-[11px] bg-zinc-100 px-2 py-0.5 rounded">
                  CCCD: {c.emp_id || "—"} | {positionDisplay}
                </span>
              </div>
            )}

            {/* Header Table */}
            <table className="w-full border-collapse border border-black text-center text-xs" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              <tbody>
                <tr>
                  <td rowSpan={2} className="border border-black p-1.5 align-middle w-[15%]">
                    <img src="/logo.png" alt="Logo" className="w-[70px] mx-auto block" />
                  </td>
                  <td rowSpan={3} className="border border-black p-1 text-center align-middle font-bold text-base w-[55%]">
                    BẢNG GHI NHẬN TUYỂN CHỌN CÔNG NHÂN
                    <br />
                    甄選紀錄表 (工人)
                  </td>
                  <td className="border border-black p-1 text-[11px] w-[16%]">
                    Ngày thiết lập (sửa đổi) <br />
                    制(修)訂日期
                  </td>
                  <td className="border border-black p-1 text-[11px] font-semibold w-[14%]">14.08.2025</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 text-[11px]">
                    Mã số tài liệu <br />
                    文件編號
                  </td>
                  <td className="border border-black p-1 text-[11px] font-semibold">ADHR02-SP001-09</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 align-middle text-[11px]">
                    Bộ phận soạn thảo <br />
                    編訂部門 <br />
                    <span className="whitespace-nowrap">Tài Nguyên Nhân Lực</span> <br />
                    人力資源部
                  </td>
                  <td className="border border-black p-1 align-middle text-[11px]">
                    Phiên bản 版本 <br />
                    <span className="font-semibold">8</span>
                  </td>
                  <td className="border border-black p-1 align-middle text-[11px]">
                    Trang 頁次 <br />
                    <span className="font-semibold">1/1</span>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Meta Table */}
            <table className="w-full text-xs mt-1.5 mb-1" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              <tbody>
                <tr>
                  <td className="w-1/3 text-left py-0.5">
                    Ngày điền biểu 填表日期: <strong>{c.key_in_date || ""}</strong>
                  </td>
                  <td className="w-1/3 text-left py-0.5">
                    Vị trí ứng tuyển 應徵工作: <strong>{positionDisplay}</strong>
                  </td>
                  <td className="w-1/3 text-left py-0.5">
                    Nhân viên ADHR phỏng vấn ADHR 面試人員:
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Main Form Table */}
            <table className="w-full border-collapse border border-black text-left text-[11px] leading-tight">
              <tbody>
                <tr className="bg-gray-100 font-bold border-b border-black text-center">
                  <td colSpan={12} className="py-1 px-2 text-xs uppercase">
                    THÔNG TIN CÁ NHÂN 個人資料
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td colSpan={3} className="py-1 px-2 border-r border-black">
                    Họ tên 姓名: <strong className="uppercase">{c.candidate_name || ""}</strong>
                  </td>
                  <td colSpan={3} className="py-1 px-2 border-r border-black">
                    Số CMND/CCCD 身份證字號: <strong>{c.emp_id || ""}</strong>
                  </td>
                  <td colSpan={3} className="py-1 px-2 border-r border-black">
                    Điện thoại di động手機: <strong>{c.regTel || c.commTel || ""}</strong>
                  </td>
                  <td colSpan={3} className="py-1 px-2">
                    Email: <strong>{c.email || ""}</strong>
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td colSpan={12} className="py-1 px-2">
                    <span className="font-semibold mr-2">Học vấn 學歷:</span>
                    <label className="inline-flex items-center space-x-1 mr-3">
                      <input type="checkbox" checked={isTieuhoc} readOnly className="h-3 w-3" />
                      <span>Tiểu học 小學</span>
                    </label>
                    <label className="inline-flex items-center space-x-1 mr-3">
                      <input type="checkbox" checked={isThcs} readOnly className="h-3 w-3" />
                      <span>THCS 初中畢業</span>
                    </label>
                    <label className="inline-flex items-center space-x-1 mr-3">
                      <input type="checkbox" checked={isThpt} readOnly className="h-3 w-3" />
                      <span>THPT 高中畢業</span>
                    </label>
                    <label className="inline-flex items-center space-x-1 mr-3">
                      <input type="checkbox" checked={isTrungcap} readOnly className="h-3 w-3" />
                      <span>Trung Cấp 中專</span>
                    </label>
                    <label className="inline-flex items-center space-x-1 mr-3">
                      <input type="checkbox" checked={isCaodang} readOnly className="h-3 w-3" />
                      <span>Cao đẳng 專科</span>
                    </label>
                    <label className="inline-flex items-center space-x-1">
                      <input type="checkbox" checked={isDaihoc} readOnly className="h-3 w-3" />
                      <span>Đại học 大學</span>
                    </label>
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td colSpan={12} className="py-1 px-2">
                    Địa chỉ thường trú 戶籍住址: <strong>{c.regAddress || ""}</strong>
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td colSpan={12} className="py-1 px-2">
                    Địa chỉ liên hệ 聯絡地址: <strong>{c.commAddress || c.regAddress || ""}</strong>
                  </td>
                </tr>
                <tr className="bg-gray-50 border-b border-black font-bold">
                  <td colSpan={12} className="py-0.5 px-2 text-center">
                    Kinh nghiệm công việc 工作經驗:
                  </td>
                </tr>
                <tr className="border-b border-black text-center font-semibold bg-gray-50 text-[10px]">
                  <td colSpan={2} className="py-0.5 px-1 border-r border-black">Tên công ty đã từng làm <br />公司名稱</td>
                  <td colSpan={2} className="py-0.5 px-1 border-r border-black">Thời gian làm việc<br />工作年資</td>
                  <td colSpan={2} className="py-0.5 px-1 border-r border-black">Chức vụ <br />職務</td>
                  <td colSpan={2} className="py-0.5 px-1 border-r border-black">Tên công ty đã từng làm<br />公司名稱</td>
                  <td colSpan={2} className="py-0.5 px-1 border-r border-black">Thời gian làm việc<br />工作年資</td>
                  <td colSpan={2} className="py-0.5 px-1">Chức vụ<br />職務</td>
                </tr>
                <tr className="border-b border-black h-6">
                  <td colSpan={2} className="border-r border-black px-1 py-0.5">{c.ex_company || ""}</td>
                  <td colSpan={2} className="border-r border-black px-1 py-0.5 text-center">{c.work_exp ? `${c.work_exp} năm` : ""}</td>
                  <td colSpan={2} className="border-r border-black px-1 py-0.5 text-center">{c.ex_position || ""}</td>
                  <td colSpan={2} className="border-r border-black px-1 py-0.5"></td>
                  <td colSpan={2} className="border-r border-black px-1 py-0.5"></td>
                  <td colSpan={2} className="px-1 py-0.5"></td>
                </tr>
                <tr className="border-b border-black h-6">
                  <td colSpan={2} className="border-r border-black px-1 py-0.5"></td>
                  <td colSpan={2} className="border-r border-black px-1 py-0.5"></td>
                  <td colSpan={2} className="border-r border-black px-1 py-0.5"></td>
                  <td colSpan={2} className="border-r border-black px-1 py-0.5"></td>
                  <td colSpan={2} className="border-r border-black px-1 py-0.5"></td>
                  <td colSpan={2} className="px-1 py-0.5"></td>
                </tr>
                <tr className="border-b border-black">
                  <td colSpan={8} className="py-1 px-2 border-r border-black align-top">
                    <p className="font-semibold mb-0.5">Kiến thức an toàn lao động 職場安全衛生知識:</p>
                    <div className="space-y-0.5 pl-1">
                      <div className="flex justify-between items-center">
                        <div>
                          1. Bạn nghĩ an toàn lao động có quan trọng trong công việc không?
                          <br /><span className="text-zinc-600">您認為職場安全衛生是否重要？</span>
                        </div>
                        <div className="space-x-2 pr-2">
                          <label><input type="checkbox" defaultChecked readOnly className="mr-0.5 h-3 w-3" /> Có 有</label>
                          <label><input type="checkbox" readOnly className="mr-0.5 h-3 w-3" /> Không 否</label>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-0.5 border-t border-dotted border-gray-300">
                        <div>
                          2. Bạn có sẵn sàng tham gia các khóa học về an toàn lao động do công ty tổ chức không?
                          <br /><span className="text-zinc-600">您願意參加公司組織的職場安全衛生課程嗎？</span>
                        </div>
                        <div className="space-x-2 pr-2">
                          <label><input type="checkbox" defaultChecked readOnly className="mr-0.5 h-3 w-3" /> Có 有</label>
                          <label><input type="checkbox" readOnly className="mr-0.5 h-3 w-3" /> Không 否</label>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td colSpan={4} className="py-1 px-2 align-top text-center">
                    <p className="font-semibold mb-1.5">Đánh giá 評價</p>
                    <div className="flex justify-center space-x-4">
                      <label><input type="checkbox" defaultChecked readOnly className="mr-0.5 h-3 w-3" /> Đạt 適任</label>
                      <label><input type="checkbox" readOnly className="mr-0.5 h-3 w-3" /> Không đạt 不適任</label>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-black font-semibold text-center bg-gray-50 text-[10px]">
                  <td colSpan={4} className="py-1 px-1 border-r border-black">
                    Xác nhận của ADHR <br /> 人力資源部確認
                  </td>
                  <td colSpan={4} className="py-1 px-1 border-r border-black">
                    Xác nhận của chủ quản bộ phận / cấp sở phỏng vấn <br /> 面試處/部級主管確認
                  </td>
                  <td colSpan={4} className="py-1 px-1">
                    Xác nhận của chủ quản đơn vị <br /> 面試單位主管確認
                  </td>
                </tr>
                <tr className="border-b border-black text-center text-[10px]">
                  <td colSpan={2} className="py-1 px-1 border-r border-black">
                    <input type="checkbox" checked={isHrAccept} readOnly className="mr-0.5 h-3 w-3" /> Tuyển dụng 錄用
                  </td>
                  <td colSpan={2} className="py-1 px-1 border-r border-black">
                    <input type="checkbox" checked={isHrReject} readOnly className="mr-0.5 h-3 w-3" /> Không tuyển dụng 不錄用
                  </td>
                  <td colSpan={2} className="py-1 px-1 border-r border-black">
                    <input type="checkbox" checked={isDpAccept} readOnly className="mr-0.5 h-3 w-3" /> Tuyển dụng 錄用
                  </td>
                  <td colSpan={2} className="py-1 px-1 border-r border-black">
                    <input type="checkbox" checked={isDpReject} readOnly className="mr-0.5 h-3 w-3" /> Không tuyển dụng 不錄用
                  </td>
                  <td colSpan={2} className="py-1 px-1 border-r border-black">
                    <input type="checkbox" checked={isDpAccept} readOnly className="mr-0.5 h-3 w-3" /> Tuyển dụng 錄用
                  </td>
                  <td colSpan={2} className="py-1 px-1">
                    <input type="checkbox" checked={isDpReject} readOnly className="mr-0.5 h-3 w-3" /> Không tuyển dụng 不錄用
                  </td>
                </tr>
                <tr className="border-b border-black h-12">
                  <td colSpan={4} className="py-1 px-2 border-r border-black align-top">Ký tên 簽名:</td>
                  <td colSpan={4} className="py-1 px-2 border-r border-black align-top">Ký tên 簽名:</td>
                  <td colSpan={4} className="py-1 px-2 align-top">Ký tên 簽名:</td>
                </tr>
                <tr>
                  <td colSpan={12} className="py-1 px-2 text-[10px] leading-tight text-zinc-700">
                    Trình tự trình ký: Chủ quản đơn vị phỏng vấn xác nhận ➜ Chủ quản bộ phận/cấp sở phỏng vấn xác nhận ➜ Bộ phận Tài Nguyên Nhân Lực xác nhận
                    <br />
                    簽認流程: 面試單位主管確認 ➜ 面試處/部級主管確認 ➜ 人力資源部確認
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
