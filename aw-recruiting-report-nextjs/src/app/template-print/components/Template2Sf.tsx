"use client";

import React from "react";

interface CandidateData {
  candidate_name?: string;
  hr_iv_date?: string;
  apply_dp?: string;
  tmp_departid?: string;
  dp_iv_date?: string;
  edu?: string;
  work_exp?: string;
  work_exp_pt?: string;
  recru_source?: string;
  school?: string;
  ex_company?: string;
  ex_position?: string;
  [key: string]: any;
}

interface Template2SfProps {
  candidates: CandidateData[];
}

export default function Template2Sf({ candidates }: Template2SfProps) {
  return (
    <div
      className="template2sf-root text-black"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .template2sf-root, .template2sf-root * {
              font-family: "Times New Roman", Times, serif !important;
            }
          `,
        }}
      />
      {candidates.map((candidate, index) => {
        const c = candidate.data || candidate;
        const eduCode = c.edu || "";
        const isEdu1 = eduCode === "1" || eduCode === "001";
        const isEdu2 = eduCode === "2" || eduCode === "004";
        const isEdu3 = eduCode === "3" || eduCode === "006";
        const isEdu4 = eduCode === "4" || eduCode === "007";
        const isEdu5 = eduCode === "5" || eduCode === "008";
        const isEdu6 = eduCode === "6" || eduCode === "009";

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
                  CCCD: {c.emp_id || "—"} | {c.duty_name || c.position || "Cán bộ/Nhân viên"}
                </span>
              </div>
            )}

            {/* ===================== PAGE 1 / 3 ===================== */}
            <div className="page-sheet mb-8 print:mb-0 print:break-after-page">
              <table className="w-full border-collapse border border-black text-center text-xs">
                <tbody>
                  <tr>
                    <td rowSpan={2} className="border border-black p-2 align-middle w-[15%]">
                      <img src="/logo.png" alt="Logo" className="w-[75px] mx-auto block" />
                    </td>
                    <td rowSpan={3} className="border border-black p-2 text-center align-middle font-bold text-sm w-[55%]">
                      BẢNG GHI NHẬN TUYỂN CHỌN (NHÂN VIÊN/CÁN BỘ/KỸ SƯ)
                      <br />
                      甄選紀錄表（非工人）
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
                      <span className="font-semibold">1/3</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <table className="w-full border-collapse border border-black text-left text-xs mt-2">
                <tbody>
                  <tr className="bg-gray-100 font-bold border-b border-black text-center">
                    <td colSpan={12} className="p-2 text-sm uppercase">
                      THÔNG TIN CÁ NHÂN 個人資料
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td colSpan={4} className="p-2 border-r border-black">
                      Họ tên người ứng tuyển:
                      <br />應徵者姓名 : <strong className="uppercase">{c.candidate_name || ""}</strong>
                    </td>
                    <td colSpan={4} className="p-2 border-r border-black">
                      Thời gian và ngày tháng sơ tuyển:
                      <br />初試日期和時間：{c.hr_iv_date || ""}
                    </td>
                    <td colSpan={4} className="p-2">
                      Đơn vị xét tuyển：
                      <br />面試單位: {c.apply_dp || ""}
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td colSpan={4} className="p-2 border-r border-black">
                      Bộ phận/ chức vụ xin ứng tuyển:
                      <br />希望應徵部門/職務: {c.tmp_departid || c.position || ""}
                    </td>
                    <td colSpan={4} className="p-2 border-r border-black">
                      Thời gian ngày tháng phỏng vấn lại：
                      <br />複試日期和時間：{c.dp_iv_date || ""}
                    </td>
                    <td colSpan={4} className="p-2">
                      Phỏng vấn ứng viên:
                      <br />單位面試人員 :
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td colSpan={6} className="p-2 border-r border-black align-top">
                      <p className="font-semibold mb-1">Học lực 教育程度:</p>
                      <div className="grid grid-cols-2 gap-1 pl-1">
                        <label><input type="checkbox" checked={isEdu1} readOnly className="mr-1" /> Dưới 12 (高中以下)</label>
                        <label><input type="checkbox" checked={isEdu2} readOnly className="mr-1" /> 12/12 (高中)</label>
                        <label><input type="checkbox" checked={isEdu3} readOnly className="mr-1" /> Trung cấp (中專)</label>
                        <label><input type="checkbox" checked={isEdu4} readOnly className="mr-1" /> Cao đẳng (大專)</label>
                        <label><input type="checkbox" checked={isEdu5} readOnly className="mr-1" /> Đại học (大學)</label>
                        <label><input type="checkbox" checked={isEdu6} readOnly className="mr-1" /> Thạc sĩ trở lên (研究所以上)</label>
                      </div>
                    </td>
                    <td colSpan={6} className="p-2 align-top">
                      <p className="font-semibold mb-1">
                        Kinh nghiệm công việc 工作經驗: &nbsp;&nbsp; <u>{c.work_exp || "0"}</u> năm 年
                      </p>
                      <p className="text-zinc-600 mb-1">
                        Kinh nghiệm việc bán thời gian 兼職工作經驗 &nbsp;&nbsp; <u>{c.work_exp_pt || "0"}</u> năm 年
                      </p>
                      <p className="text-[11px] mb-1">Tất cả kinh nghiệm làm việc以下皆為全職工作經驗:</p>
                      <div className="grid grid-cols-2 gap-1 pl-1 text-[11px]">
                        <label><input type="checkbox" readOnly className="mr-1" /> Không (無經驗)</label>
                        <label><input type="checkbox" readOnly className="mr-1" /> Dưới 1 năm (一年以下)</label>
                        <label><input type="checkbox" readOnly className="mr-1" /> 1 - 2 năm (一年至二年以下)</label>
                        <label><input type="checkbox" readOnly className="mr-1" /> 2 - 3 năm (二年至三年以下)</label>
                        <label><input type="checkbox" readOnly className="mr-1" /> Trên 3 năm (三年以上)</label>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td colSpan={12} className="p-2">
                      <p className="font-semibold mb-1">
                        Thông qua kênh tuyển dụng nào biết được thông tin công ty đang tuyển dụng透過什麼樣的招募管道知道志寧公司的招募資訊:
                      </p>
                      <div className="grid grid-cols-3 gap-1.5 pl-1 text-xs">
                        <label><input type="checkbox" readOnly className="mr-1" /> Website tìm việc 人力銀行網站</label>
                        <label><input type="checkbox" checked={c.recru_source === "7"} readOnly className="mr-1" /> Website công ty 志寧公司網站</label>
                        <label><input type="checkbox" checked={c.recru_source === "4"} readOnly className="mr-1" /> Bạn bè giới thiệu 親友介紹</label>
                        <label><input type="checkbox" checked={c.recru_source === "1"} readOnly className="mr-1" /> Băng rôn tuyển dụng 招募布條</label>
                        <label><input type="checkbox" checked={c.recru_source === "2"} readOnly className="mr-1" /> Tờ rơi tuyển dụng 招募傳單</label>
                        <label><input type="checkbox" checked={c.recru_source === "9"} readOnly className="mr-1" /> Facebook 社群媒體: 臉書</label>
                        <label><input type="checkbox" readOnly className="mr-1" /> TikTok 社群媒體：抖音</label>
                        <label><input type="checkbox" checked={c.recru_source === "3"} readOnly className="mr-1" /> Phát thanh xã 村辦公室廣播</label>
                        <label><input type="checkbox" checked={c.recru_source === "8"} readOnly className="mr-1" /> Website trường 學校網站</label>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td colSpan={3} className="p-2 border-r border-black">
                      Tên trường:
                      <br />學校名稱: <strong>{c.school || ""}</strong>
                    </td>
                    <td colSpan={2} className="p-2 border-r border-black">
                      Khoa
                      <br />科系:
                    </td>
                    <td colSpan={3} className="p-2 border-r border-black">
                      Công ty hiện tại/trước đây:
                      <br />現任/前任服務公司: <strong>{c.ex_company || ""}</strong>
                    </td>
                    <td colSpan={2} className="p-2 border-r border-black">
                      Bộ phận/chức vụ:
                      <br />工作部門/職務: <strong>{c.ex_position || ""}</strong>
                    </td>
                    <td colSpan={2} className="p-2">
                      Thâm niên
                      <br />年資: <strong>{c.work_exp || ""}</strong> năm 年
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td colSpan={2} className="p-2 border-r border-black align-middle font-semibold">
                      Khả năng ngôn ngữ 語言能力:
                      <br /><span className="text-[10px] text-zinc-600 font-normal">(Thi viết kết quả HR điền 紙筆測驗結果HR填寫)</span>
                    </td>
                    <td colSpan={5} className="p-2 border-r border-black">
                      <div className="flex gap-4 mb-2">
                        <label><input type="checkbox" readOnly className="mr-1" /> Nghe-Nói-Đọc-Viết 聽-說-讀-寫</label>
                        <label><input type="checkbox" readOnly className="mr-1" /> Nghe-Nói 聽-說</label>
                      </div>
                      <p>Tiếng Hoa / 中文測驗分數: ....................</p>
                      <p className="mt-1">Tiếng Anh / 英文測驗分數: ....................</p>
                    </td>
                    <td colSpan={5} className="p-2">
                      <p className="mb-2">Mức lương mong muốn / 應徵者預期薪資: ................................. VNĐ</p>
                      <p>BP HR kiến nghị lương / 人資部建議薪資: ................................. VNĐ</p>
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td colSpan={2} className="p-2 border-r border-black font-semibold">
                      Kỹ năng nói 口語能力
                    </td>
                    <td colSpan={5} className="p-2 border-r border-black">
                      <p className="font-semibold mb-1">Tiếng Hoa 中文:</p>
                      <div className="flex justify-between text-xs pr-2">
                        <label><input type="checkbox" readOnly className="mr-1" /> Lưu loát 精通</label>
                        <label><input type="checkbox" readOnly className="mr-1" /> Khá 尚可</label>
                        <label><input type="checkbox" readOnly className="mr-1" /> Trung bình 略懂</label>
                        <label><input type="checkbox" readOnly className="mr-1" /> Kém 差</label>
                      </div>
                    </td>
                    <td colSpan={5} className="p-2">
                      <p className="font-semibold mb-1">Tiếng Anh 英文:</p>
                      <div className="flex justify-between text-xs pr-2">
                        <label><input type="checkbox" readOnly className="mr-1" /> Lưu loát 精通</label>
                        <label><input type="checkbox" readOnly className="mr-1" /> Khá 尚可</label>
                        <label><input type="checkbox" readOnly className="mr-1" /> Trung bình 略懂</label>
                        <label><input type="checkbox" readOnly className="mr-1" /> Kém 差</label>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={6} className="p-2 border-r border-black h-20 align-top">
                      <p className="font-semibold mb-1">Đánh giá phỏng vấn của ADHR / ADHR面試評語:</p>
                    </td>
                    <td colSpan={6} className="p-2 align-top">
                      <p className="font-semibold mb-2">Kết quả phỏng vấn ADHR / ADHR面試結果:</p>
                      <div className="flex justify-around pt-3">
                        <label><input type="checkbox" readOnly className="mr-1" /> A. Xuất sắc 優</label>
                        <label><input type="checkbox" readOnly className="mr-1" /> B. Giỏi 良</label>
                        <label><input type="checkbox" readOnly className="mr-1" /> C. Tốt 好</label>
                        <label><input type="checkbox" readOnly className="mr-1" /> D. Chấp nhận 可</label>
                        <label><input type="checkbox" readOnly className="mr-1" /> E. Kém 差</label>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ===================== PAGE 2 / 3 ===================== */}
            <div className="page-sheet mb-8 print:mb-0 print:break-after-page">
              <table className="w-full border-collapse border border-black text-center text-xs">
                <tbody>
                  <tr>
                    <td rowSpan={2} className="border border-black p-2 align-middle w-[15%]">
                      <img src="/logo.png" alt="Logo" className="w-[75px] mx-auto block" />
                    </td>
                    <td rowSpan={3} className="border border-black p-2 text-center align-middle font-bold text-sm w-[55%]">
                      BẢNG GHI NHẬN TUYỂN CHỌN (NHÂN VIÊN/CÁN BỘ/KỸ SƯ)
                      <br />
                      甄選紀錄表（非工人）
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
                    <td className="border border-black p-1 text-xs font-semibold">ADHR02-SP001-04</td>
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
                      <span className="font-semibold">2/3</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <table className="w-full border-collapse border border-black text-xs mt-2">
                <thead>
                  <tr className="bg-gray-100 font-bold border-b border-black text-center">
                    <th className="p-2 border-r border-black w-[10%]">Phân loại <br />分類</th>
                    <th className="p-2 border-r border-black w-[25%]">Câu hỏi tham khảo <br />參考問題</th>
                    <th className="p-2 border-r border-black w-[35%]">Hạng mục đánh giá <br />評量項目</th>
                    <th className="p-2 border-r border-black w-[15%]">Đánh giá (A~E) <br />評價 (A~E)</th>
                    <th className="p-2 w-[15%]">Nhận xét <br />評語</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Category 1 */}
                  <tr className="border-b border-black">
                    <td rowSpan={3} className="p-2 border-r border-black text-center font-semibold bg-gray-50">
                      Ấn tượng chung <br />一般印象
                    </td>
                    <td rowSpan={3} className="p-2 border-r border-black align-top leading-relaxed">
                      1. Tự giới thiệu bản thân 2~3 phút.
                      <br />2. Nguyên nhân thôi việc công ty cũ.
                      <br />3. Vì sao ứng tuyển công ty chúng tôi?
                      <br />4. Bộ phận/vị trí quan tâm.
                      <br />5. Ưu khuyết điểm bản thân.
                    </td>
                    <td className="p-2 border-r border-black">1. Biểu hiện cuộc nói chuyện, hình ảnh lịch sự, ăn nói lưu loát</td>
                    <td className="p-2 border-r border-black text-center"></td>
                    <td className="p-2"></td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black">2. Động lực làm việc hợp lý</td>
                    <td className="p-2 border-r border-black text-center"></td>
                    <td className="p-2"></td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black">3. Trả lời câu hỏi khách quan, tích cực</td>
                    <td className="p-2 border-r border-black text-center"></td>
                    <td className="p-2"></td>
                  </tr>

                  {/* Category 2 */}
                  <tr className="border-b border-black">
                    <td rowSpan={5} className="p-2 border-r border-black text-center font-semibold bg-gray-50">
                      Kinh nghiệm / Tiềm năng <br />經驗/潛力
                    </td>
                    <td rowSpan={5} className="p-2 border-r border-black align-top leading-relaxed">
                      1. Hoạt động ngoại khóa / thực tập.
                      <br />2. Điều thành tựu nhất trong công việc.
                      <br />3. Khó khăn gặp phải &amp; cách giải quyết.
                      <br />4. Làm việc độc lập hay theo nhóm?
                      <br />5. Kinh nghiệm lãnh đạo đội nhóm.
                    </td>
                    <td className="p-2 border-r border-black">1. Có tinh thần làm việc nhóm</td>
                    <td className="p-2 border-r border-black text-center"></td>
                    <td className="p-2"></td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black">2. Khả năng chuyển đổi vai trò độc lập/nhóm</td>
                    <td className="p-2 border-r border-black text-center"></td>
                    <td className="p-2"></td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black">3. Quan hệ đồng nghiệp &amp; đối tác</td>
                    <td className="p-2 border-r border-black text-center"></td>
                    <td className="p-2"></td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black">4. Năng lực lãnh đạo / dẫn dắt</td>
                    <td className="p-2 border-r border-black text-center"></td>
                    <td className="p-2"></td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black">5. Kỹ năng giải quyết vấn đề</td>
                    <td className="p-2 border-r border-black text-center"></td>
                    <td className="p-2"></td>
                  </tr>

                  {/* Category 3 */}
                  <tr className="border-b border-black">
                    <td rowSpan={5} className="p-2 border-r border-black text-center font-semibold bg-gray-50">
                      Thái độ làm việc <br />工作態度
                    </td>
                    <td rowSpan={5} className="p-2 border-r border-black align-top leading-relaxed">
                      1. Khi cấp trên hiểu lầm bạn xử lý ra sao?
                      <br />2. Phản ứng trước lời phê bình công việc?
                      <br />3. Môi trường nào bạn không thể chấp nhận?
                      <br />4. Được giao việc lạ/mới sẽ làm gì?
                      <br />5. Cách giao tiếp hiệu quả nhất?
                    </td>
                    <td className="p-2 border-r border-black">1. Sẵn sàng nhận thử thách, tích cực làm việc</td>
                    <td className="p-2 border-r border-black text-center"></td>
                    <td className="p-2"></td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black">2. Tính ổn định và độ bền làm việc</td>
                    <td className="p-2 border-r border-black text-center"></td>
                    <td className="p-2"></td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black">3. Kỹ năng giao tiếp &amp; lắng nghe</td>
                    <td className="p-2 border-r border-black text-center"></td>
                    <td className="p-2"></td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black">4. Tinh thần trách nhiệm cao</td>
                    <td className="p-2 border-r border-black text-center"></td>
                    <td className="p-2"></td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-black">5. Sự dẻo dai và thích ứng trong công việc</td>
                    <td className="p-2 border-r border-black text-center"></td>
                    <td className="p-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ===================== PAGE 3 / 3 ===================== */}
            <div className={`page-sheet ${index < candidates.length - 1 ? "print:break-after-page" : ""}`}>
              <table className="w-full border-collapse border border-black text-center text-xs">
                <tbody>
                  <tr>
                    <td rowSpan={2} className="border border-black p-2 align-middle w-[15%]">
                      <img src="/logo.png" alt="Logo" className="w-[75px] mx-auto block" />
                    </td>
                    <td rowSpan={3} className="border border-black p-2 text-center align-middle font-bold text-sm w-[55%]">
                      BẢNG GHI NHẬN TUYỂN CHỌN (NHÂN VIÊN/CÁN BỘ/KỸ SƯ)
                      <br />
                      甄選紀錄表（非工人）
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
                    <td className="border border-black p-1 text-xs font-semibold">ADHR02-SP001-04</td>
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
                      <span className="font-semibold">3/3</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <table className="w-full border-collapse border border-black text-xs mt-2">
                <tbody>
                  {/* Workplace Safety Knowledge */}
                  <tr className="border-b border-black">
                    <td rowSpan={3} className="p-2 border-r border-black font-semibold text-center w-[12%] bg-gray-50">
                      Kiến thức ATLĐ <br />職場安全衛生
                    </td>
                    <td rowSpan={3} className="p-2 border-r border-black align-top text-xs leading-relaxed w-[35%]">
                      1. Công việc gián tiếp có cần quan tâm an toàn lao động không?
                      <br />2. Cán bộ giám sát có cần tuân thủ ATLĐ không? Vì sao?
                      <br />3. Xử lý như thế nào khi phát hiện tai nạn lao động?
                    </td>
                    <td className="p-2 border-r border-black w-[30%]">1. Có nhận thức cơ bản về an toàn lao động</td>
                    <td className="p-2 border-r border-black text-center w-[11%]">
                      <label className="mr-2"><input type="checkbox" defaultChecked readOnly /> Có</label>
                      <label><input type="checkbox" readOnly /> Không</label>
                    </td>
                    <td rowSpan={3} className="p-2 text-center align-top w-[12%]">
                      <p className="font-semibold mb-2">Đánh giá</p>
                      <label className="block mb-2"><input type="checkbox" defaultChecked readOnly /> Đạt 適任</label>
                      <label className="block"><input type="checkbox" readOnly /> K.Đạt 不適</label>
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black">2. Có kiến thức và tuân thủ quy tắc an toàn</td>
                    <td className="p-2 border-r border-black text-center">
                      <label className="mr-2"><input type="checkbox" defaultChecked readOnly /> Có</label>
                      <label><input type="checkbox" readOnly /> Không</label>
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black">3. Hiểu nguyên tắc &amp; quy trình xử lý ATLĐ</td>
                    <td className="p-2 border-r border-black text-center">
                      <label className="mr-2"><input type="checkbox" defaultChecked readOnly /> Có</label>
                      <label><input type="checkbox" readOnly /> Không</label>
                    </td>
                  </tr>

                  {/* Interview Result & Comments */}
                  <tr className="bg-gray-100 font-bold border-b border-black">
                    <td colSpan={8} className="p-2 text-center border-r border-black">
                      Xét tuyển đánh giá 面談評語:
                    </td>
                    <td colSpan={4} className="p-2 text-center">
                      Kết quả xét tuyển 面試結果
                    </td>
                  </tr>
                  <tr className="border-b border-black h-24">
                    <td colSpan={4} className="p-2 border-r border-black align-top">
                      Bộ phận Tài Nguyên Nhân Lực 人力資源部:
                      <p className="mt-12 text-[11px]">Người phỏng vấn HR ký: ....................................</p>
                    </td>
                    <td colSpan={4} className="p-2 border-r border-black align-top">
                      Đơn vị xét tuyển 面試單位:
                      <p className="mt-12 text-[11px]">Người phỏng vấn ĐV ký: ....................................</p>
                    </td>
                    <td colSpan={4} className="p-2 align-top text-xs space-y-1.5">
                      <label className="block"><input type="checkbox" defaultChecked readOnly /> Tuyển dụng 錄用 (Ngày: ......../......../20....)</label>
                      <label className="block"><input type="checkbox" readOnly /> Không tuyển dụng 不錄用</label>
                      <label className="block"><input type="checkbox" readOnly /> Lưu trữ hồ sơ 留作儲備</label>
                      <label className="block"><input type="checkbox" readOnly /> Chuyển bộ phận khác 轉介</label>
                    </td>
                  </tr>

                  {/* Salary section */}
                  <tr className="bg-gray-100 font-bold border-b border-black text-center">
                    <td colSpan={12} className="p-1.5">
                      Phạm vi tiền lương 核薪範圍:
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td colSpan={4} className="p-2 border-r border-black">
                      Lương thử việc 試用期底薪: ...................................... VNĐ
                    </td>
                    <td colSpan={4} className="p-2 border-r border-black">
                      Cấp bậc đề xuất 職級: ..........................................
                    </td>
                    <td colSpan={4} className="p-2 align-top">
                      Ứng viên ký xác nhận lương:
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td colSpan={4} className="p-2 border-r border-black">
                      Lương sau thử việc 試用後底薪: .................................. VNĐ
                    </td>
                    <td colSpan={4} className="p-2 border-r border-black">
                      Phụ cấp chức vụ / chuyên môn: .................................
                    </td>
                    <td colSpan={4} className="p-2">
                      Tổng lương dự kiến: ........................................... VNĐ
                    </td>
                  </tr>

                  {/* Signatures */}
                  <tr className="bg-gray-100 font-bold border-b border-black text-center">
                    <td colSpan={12} className="p-1.5">Ký duyệt 簽核單位:</td>
                  </tr>
                  <tr className="border-b border-black text-center font-semibold text-xs h-28">
                    <td colSpan={2} className="p-1 border-r border-black align-top">
                      VP. TGĐ <br />總經理室
                    </td>
                    <td colSpan={2} className="p-1 border-r border-black align-top">
                      Khu Quản Lý <br />管理處
                    </td>
                    <td colSpan={2} className="p-1 border-r border-black align-top">
                      BP. Tài Nguyên Nhân Lực <br />人力資源部
                    </td>
                    <td colSpan={2} className="p-1 border-r border-black align-top">
                      Chủ Quản Cấp Sở <br />處級主管
                    </td>
                    <td colSpan={2} className="p-1 border-r border-black align-top">
                      Chủ Quản Bộ Phận <br />部級主管
                    </td>
                    <td colSpan={2} className="p-1 align-top">
                      Chủ Quản Đơn Vị <br />單位主管
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={12} className="p-2 text-[11px] leading-relaxed text-zinc-600">
                      Lưu trình trình ký: Chủ quản đơn vị ➜ Chủ quản bộ phận ➜ Chủ quản cấp sở ➜ BP Tài Nguyên Nhân Lực (Trưởng ngành trở xuống). Nếu từ Trưởng ngành cao cấp trở lên: trình tiếp qua Khu quản lý ➜ VP. TGĐ phê duyệt.
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
