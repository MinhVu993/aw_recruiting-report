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
  key_in_date?: string;
  recru_source?: string;
  [key: string]: any;
}

interface Template5Props {
  candidates: CandidateData[];
}

export default function Template5({ candidates }: Template5Props) {
  return (
    <div
      className="template5-root text-black"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .template5-root, .template5-root * {
              font-family: "Times New Roman", Times, serif !important;
            }
          `,
        }}
      />
      {candidates.map((candidate, index) => {
        const c = candidate.data || candidate;

        return (
          <div key={index} className="print-page mb-10 print:mb-0">
            {/* Screen-only candidate index banner */}
            {candidates.length > 1 && (
              <div className="no-print flex items-center justify-between pb-2 mb-3 border-b border-zinc-200 text-xs text-zinc-600">
                <span>
                  Ứng viên <strong>{index + 1} / {candidates.length}</strong>:{" "}
                  <strong className="text-black uppercase">{c.candidate_name || ""}</strong>
                </span>
                <span className="font-mono text-[11px] bg-zinc-100 px-2 py-0.5 rounded">
                  CCCD: {c.emp_id || "—"} | {c.position || "Cán bộ/Nhân viên"}
                </span>
              </div>
            )}

            {/* ===================== PAGE 1 / 2 ===================== */}
            <div className="page-sheet mb-8 print:mb-0 print:break-after-page">
              <table className="w-full border-collapse border border-black text-center text-xs">
                <tbody>
                  <tr>
                    <td rowSpan={2} className="border border-black p-2 align-middle w-[15%]">
                      <img src="/logo.png" alt="Logo" className="w-[75px] mx-auto block" />
                    </td>
                    <td rowSpan={3} className="border border-black p-2 text-center align-middle font-bold text-base w-[55%]">
                      ĐƠN XIN VIỆC
                      <br />
                      (NHÂN VIÊN, CÁN BỘ, KỸ SƯ)
                      <br />
                      應徵職位申請表(非工人)
                    </td>
                    <td className="border border-black p-1 text-xs w-[16%]">
                      Ngày thiết lập (sửa đổi) <br />
                      制(修)訂日期
                    </td>
                    <td className="border border-black p-1 text-xs font-semibold w-[14%]">14.08.2025</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 text-xs">
                      Mã số tài liệu <br />
                      文件編號
                    </td>
                    <td className="border border-black p-1 text-xs font-semibold">ADHR02-SP001-03</td>
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
                      <span className="font-semibold">7</span>
                    </td>
                    <td className="border border-black p-1 align-middle text-xs">
                      Trang 頁次 <br />
                      <span className="font-semibold">1/2</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Explanations */}
              <div className="p-2 border-l border-r border-b border-black text-xs">
                <p className="font-bold mb-1">Giải thích 說明:</p>
                <div className="grid grid-cols-2 gap-4 text-[11px] leading-relaxed">
                  <div>
                    1. Đơn này chỉ dành riêng cho người xin việc điền vào.
                    <br /><span className="text-zinc-600">此表格唯有申請人可填寫。</span>
                  </div>
                  <div>
                    2. Xin vui lòng điền đầy đủ thông tin vào bảng dưới đây.
                    <br /><span className="text-zinc-600">請用正楷字體清晰的填寫。</span>
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <table className="w-full border-collapse border border-black text-xs mt-3">
                <tbody>
                  <tr className="bg-gray-100 font-bold border-b border-black text-center">
                    <td colSpan={2} className="p-1.5 uppercase">TƯ LIỆU CÁ NHÂN 個人資料</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black w-1/2">
                      Họ &amp; Tên 姓名: <strong className="uppercase">{c.candidate_name || ""}</strong>
                    </td>
                    <td className="p-2 w-1/2">
                      Số CMND/CCCD 身份證號碼: <strong className="font-mono">{c.emp_id || ""}</strong>
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black">
                      Số ĐTDĐ 手機: <strong>{c.commTel || c.regTel || ""}</strong>
                    </td>
                    <td className="p-2">
                      Email: <strong>{c.email || ""}</strong>
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td colSpan={2} className="p-2">
                      Địa chỉ 戶籍住址: <strong>{c.regAddress || ""}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-2">
                      Địa chỉ liên lạc 聯絡地址: <strong>{c.commAddress || c.regAddress || ""}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Emergency Contact */}
              <table className="w-full border-collapse border border-black text-xs mt-3">
                <tbody>
                  <tr className="bg-gray-100 font-bold border-b border-black text-center">
                    <td colSpan={3} className="p-1.5 uppercase">Thông tin người thân liên lạc 緊急聯絡人</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black w-1/3">Họ tên 姓名:</td>
                    <td className="p-2 border-r border-black w-1/3">Quan hệ 關係:</td>
                    <td className="p-2 w-1/3">SĐT liên lạc 聯絡電話:</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="p-2">Địa chỉ liên lạc 聯絡地址:</td>
                  </tr>
                </tbody>
              </table>

              {/* Education Background */}
              <table className="w-full border-collapse border border-black text-xs mt-3">
                <thead>
                  <tr className="bg-gray-100 font-bold border-b border-black text-center">
                    <th colSpan={4} className="p-1.5 uppercase">
                      Trình Độ Văn Hóa 學歷背景
                      <span className="block text-[10px] font-normal italic">(Xin đính kèm theo bản photo những hồ sơ liên quan / 請附上相關學歷證書的影印本)</span>
                    </th>
                  </tr>
                  <tr className="border-b border-black text-center font-semibold bg-gray-50">
                    <th className="p-1.5 border-r border-black w-1/4">Học lực 最高學歷</th>
                    <th className="p-1.5 border-r border-black w-1/5">Từ 從</th>
                    <th className="p-1.5 border-r border-black w-1/5">Đến 至</th>
                    <th className="p-1.5">Tên trường 學校名稱</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6].map((row) => (
                    <tr key={row} className="border-b border-black h-7">
                      <td className="border-r border-black p-1"></td>
                      <td className="border-r border-black p-1"></td>
                      <td className="border-r border-black p-1"></td>
                      <td className="p-1"></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Language Ability */}
              <table className="w-full border-collapse border border-black text-xs mt-3 text-center">
                <thead>
                  <tr className="bg-gray-100 font-bold border-b border-black">
                    <th colSpan={13} className="p-1.5 uppercase">Trình độ ngôn ngữ 語言能力</th>
                  </tr>
                  <tr className="border-b border-black font-semibold">
                    <th rowSpan={2} className="border-r border-black p-1.5 w-[16%]">Ngôn ngữ 語言</th>
                    <th colSpan={3} className="border-r border-black p-1">Nghe 聽</th>
                    <th colSpan={3} className="border-r border-black p-1">Nói 說</th>
                    <th colSpan={3} className="border-r border-black p-1">Viết 寫</th>
                    <th colSpan={3} className="p-1">Đọc 讀</th>
                  </tr>
                  <tr className="border-b border-black text-[10px] bg-gray-50">
                    <th className="border-r border-black p-1">Thấp 低</th>
                    <th className="border-r border-black p-1">Trung 中</th>
                    <th className="border-r border-black p-1">Cao 高</th>
                    <th className="border-r border-black p-1">Thấp 低</th>
                    <th className="border-r border-black p-1">Trung 中</th>
                    <th className="border-r border-black p-1">Cao 高</th>
                    <th className="border-r border-black p-1">Thấp 低</th>
                    <th className="border-r border-black p-1">Trung 中</th>
                    <th className="border-r border-black p-1">Cao 高</th>
                    <th className="border-r border-black p-1">Thấp 低</th>
                    <th className="border-r border-black p-1">Trung 中</th>
                    <th className="p-1">Cao 高</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black h-6">
                    <td className="border-r border-black font-semibold">Tiếng Anh 英文</td>
                    {[...Array(12)].map((_, i) => (
                      <td key={i} className={`p-1 ${i < 11 ? "border-r border-black" : ""}`}></td>
                    ))}
                  </tr>
                  <tr className="border-b border-black h-6">
                    <td className="border-r border-black font-semibold">Tiếng Hoa 中文</td>
                    {[...Array(12)].map((_, i) => (
                      <td key={i} className={`p-1 ${i < 11 ? "border-r border-black" : ""}`}></td>
                    ))}
                  </tr>
                  <tr className="h-6">
                    <td className="border-r border-black font-semibold">Khác 其他</td>
                    {[...Array(12)].map((_, i) => (
                      <td key={i} className={`p-1 ${i < 11 ? "border-r border-black" : ""}`}></td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ===================== PAGE 2 / 2 ===================== */}
            <div className={`page-sheet ${index < candidates.length - 1 ? "print:break-after-page" : ""}`}>
              <table className="w-full border-collapse border border-black text-center text-xs">
                <thead>
                  <tr className="bg-gray-100 font-bold border-b border-black">
                    <th colSpan={5} className="p-1.5 uppercase">Kinh nghiệm công việc 工作經驗</th>
                  </tr>
                  <tr className="border-b border-black font-semibold bg-gray-50">
                    <th className="p-1.5 border-r border-black w-1/4">Tên công ty đã từng làm <br />公司名稱</th>
                    <th className="p-1.5 border-r border-black w-1/6">Thời gian làm việc <br />工作年資</th>
                    <th className="p-1.5 border-r border-black w-1/6">Chức vụ <br />職稱</th>
                    <th className="p-1.5 border-r border-black w-1/5">Nguyên nhân thôi việc <br />離職原因</th>
                    <th className="p-1.5">Những bổ sung khác <br />備註</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6, 7].map((row) => (
                    <tr key={row} className="border-b border-black h-8">
                      <td className="border-r border-black p-1"></td>
                      <td className="border-r border-black p-1"></td>
                      <td className="border-r border-black p-1"></td>
                      <td className="border-r border-black p-1"></td>
                      <td className="p-1"></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Other Info */}
              <table className="w-full border-collapse border border-black text-xs mt-3">
                <tbody>
                  <tr className="bg-gray-100 font-bold border-b border-black text-center">
                    <td colSpan={2} className="p-1.5 uppercase">Thông tin khác 其他資料</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black">
                      1. Bạn đã từng bị sa thải hay bị đình chức chưa? Nếu có, xin nói rõ.
                      <br /><span className="text-zinc-600">你是否曾經被解僱或停職？如有，請說明</span>
                    </td>
                    <td className="p-2 text-center w-32 whitespace-nowrap">
                      <label className="mr-3"><input type="checkbox" readOnly /> Có 有</label>
                      <label><input type="checkbox" defaultChecked readOnly /> Không 無</label>
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black">
                      2. Bạn đã từng bị tạm giam hay xử tội gì chưa? Nếu có, xin nói rõ.
                      <br /><span className="text-zinc-600">你是否曾經被拘留或被判刑？如有，請說明。</span>
                    </td>
                    <td className="p-2 text-center w-32 whitespace-nowrap">
                      <label className="mr-3"><input type="checkbox" readOnly /> Có 有</label>
                      <label><input type="checkbox" defaultChecked readOnly /> Không 無</label>
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black">
                      3. Hiện tại bạn có đang tham gia bất cứ vụ án hành chính hay dân sự, hình sự nào chưa?
                      <br /><span className="text-zinc-600">你現在是否有參與任何行政、民事或刑事案件？如有，請說明.</span>
                    </td>
                    <td className="p-2 text-center w-32 whitespace-nowrap">
                      <label className="mr-3"><input type="checkbox" readOnly /> Có 有</label>
                      <label><input type="checkbox" defaultChecked readOnly /> Không 無</label>
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black">
                      4. Bạn có người thân hay bạn bè đang làm việc tại công ty chúng tôi không?
                      <br /><span className="text-zinc-600">你是否有任何親戚或朋友現在或曾經任職於我們公司？如有，請說明</span>
                    </td>
                    <td className="p-2 text-center w-32 whitespace-nowrap">
                      <label className="mr-3"><input type="checkbox" readOnly /> Có 有</label>
                      <label><input type="checkbox" defaultChecked readOnly /> Không 無</label>
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td colSpan={2} className="p-2">
                      5. Thông qua thông tin nào bạn được biết công ty chúng tôi đang cần tuyển người?
                      <br /><span className="text-zinc-600">你是從什麼管道知道這職缺？</span>
                      <div className="grid grid-cols-3 gap-1.5 mt-1.5 text-xs">
                        <label><input type="checkbox" checked={c.recru_source === "2"} readOnly className="mr-1" /> Tờ rơi tuyển dụng 招募傳單</label>
                        <label><input type="checkbox" checked={c.recru_source === "1"} readOnly className="mr-1" /> Băng rôn tuyển dụng 招募佈條</label>
                        <label><input type="checkbox" readOnly className="mr-1" /> Website trường 學校網站</label>
                        <label><input type="checkbox" checked={c.recru_source === "6"} readOnly className="mr-1" /> Hội chợ việc làm 學校招聘會</label>
                        <label><input type="checkbox" checked={c.recru_source === "4"} readOnly className="mr-1" /> Bạn bè giới thiệu 親友介紹</label>
                        <label><input type="checkbox" checked={c.recru_source === "7"} readOnly className="mr-1" /> Website công ty 志寧公司網站</label>
                        <label><input type="checkbox" checked={c.recru_source === "9"} readOnly className="mr-1" /> Facebook / TikTok 社群媒體</label>
                        <label><input type="checkbox" checked={c.recru_source === "8"} readOnly className="mr-1" /> Website tìm việc 人力銀行網站</label>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-2">
                      6. Nếu như bạn được CB-CNV công ty giới thiệu, xin hãy nói rõ thông tin người giới thiệu:
                      <div className="grid grid-cols-4 gap-2 mt-1.5 text-xs">
                        <p>Họ tên 姓名: .................................</p>
                        <p>Số ĐT 電話: .................................</p>
                        <p>Số thẻ 工號: .................................</p>
                        <p>Bộ phận 部門: .................................</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Commitment Statement */}
              <table className="w-full border-collapse border border-black text-xs mt-3">
                <tbody>
                  <tr className="bg-gray-100 font-bold border-b border-black text-center">
                    <td className="p-1.5 uppercase">Bảng Cam Kết 聲明</td>
                  </tr>
                  <tr>
                    <td className="p-3 leading-relaxed">
                      Tôi xin đảm bảo những gì tôi điền vào đơn xin việc và những tài liệu thông tin mà tôi cung cấp hoàn toàn đúng với sự thật, tôi cũng biết rõ nếu có hiểu lầm sai sót nào sẽ dẫn tới đơn xin việc này sẽ không được chấp nhận.
                      <br />
                      <span className="text-zinc-600">我在此聲明，本人在 CAN SPORTS Co., Ltd.人員資料表裡所提供的資料與答案在我的認知裡都屬實，本人也理解如有任何錯誤與紕漏都可能導致申請被拒絕。</span>
                      <div className="flex justify-between items-center mt-6 pt-2">
                        <div className="font-semibold">Ký tên 簽名: ....................................................</div>
                        <div className="font-semibold">Ngày 日期: {c.key_in_date || new Date().toISOString().split("T")[0]}</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
