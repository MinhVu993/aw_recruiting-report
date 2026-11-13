export type TourLocale = "vi" | "en" | "cn";

export interface TourStepDefinition {
  title: Record<TourLocale, string>;
  content: Record<TourLocale, string>;
  selector: string;
  side?: "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  icon?: string;
  nextRoute?: string;
  prevRoute?: string;
}

export const APP_TOUR_STEPS: TourStepDefinition[] = [
  // 1. Header & Navigation Tour
  {
    icon: "🚀",
    title: {
      vi: "Chào mừng đến với Recruiting Command Center",
      en: "Welcome to Recruiting Command Center",
      cn: "欢迎使用招聘指挥中心",
    },
    content: {
      vi: "Hệ thống quản lý, phân tích dữ liệu tuyển dụng & nhân sự thế hệ mới. Hãy cùng dạo một vòng để khám phá các tính năng chính!",
      en: "Next-generation recruitment and human resources analytics platform. Let's take a quick tour across the system!",
      cn: "新一代招聘与人力资源分析管理系统。让我们快速了解核心功能！",
    },
    selector: "#tour-brand-logo",
    side: "bottom-left",
  },
  {
    icon: "🗺️",
    title: {
      vi: "Thanh Điều Hướng Chính",
      en: "Main Navigation Bar",
      cn: "主导航栏",
    },
    content: {
      vi: "Dễ dàng chuyển đổi giữa các phân hệ: Dashboard Phân Tích, Ứng Viên, Nhu Cầu Định Biên, Báo Cáo Tuyển Dụng, Thôi Việc, Thực Tập Sinh và Mẫu In.",
      en: "Quickly switch between modules: Analytics Dashboard, Candidates, Manpower Demand, Recruitment Reports, Resignations, Interns, and Print Templates.",
      cn: "快速在各模块间切换：分析看板、应聘人员、定编需求、招聘报表、离职人员、实习生及打印模板。",
    },
    selector: "#tour-main-nav",
    side: "bottom",
  },
  {
    icon: "📡",
    title: {
      vi: "Trạng Thái Máy Quét CCCD",
      en: "Hardware Scanner Status",
      cn: "身份证扫描仪状态",
    },
    content: {
      vi: "Hiển thị trạng thái kết nối máy quét mã vạch/CCCD qua cổng WebSerial. Hỗ trợ quét nhanh thẻ căn cước tự động điền hồ sơ ứng viên.",
      en: "Shows the connection state of the WebSerial barcode/ID scanner. Supports fast auto-filling when creating candidates.",
      cn: "显示WebSerial扫码器/身份证扫描仪的连接状态，支持快速扫码自动填入应聘者资料。",
    },
    selector: "#tour-scanner-status",
    side: "bottom-right",
  },
  {
    icon: "🌐",
    title: {
      vi: "Chuyển Đổi Đa Ngôn Ngữ",
      en: "Multi-Language Switcher",
      cn: "多语言切换",
    },
    content: {
      vi: "Hỗ trợ 3 ngôn ngữ tức thì: Tiếng Việt (VI), Tiếng Trung (中文) và Tiếng Anh (EN) trên toàn bộ giao diện và báo cáo.",
      en: "Instantly switch between Vietnamese, Chinese, and English across the entire interface and reports.",
      cn: "全系统支持越南语 (VI)、中文 (中文) 和英语 (EN) 三语实时切换。",
    },
    selector: "#tour-lang-switcher",
    side: "bottom-right",
  },

  // 2. Dashboard Perspective & Slicers
  {
    icon: "🎛️",
    title: {
      vi: "Bộ Lọc Tương Tác Slicers",
      en: "Interactive Slicers Bar",
      cn: "交互式切片筛选器",
    },
    content: {
      vi: "Lọc linh hoạt theo Xưởng (DMC, TB, TC), mốc thời gian (Hôm nay, Tuần, Tháng, Năm, Khoảng ngày tùy chọn) với dữ liệu thời gian thực.",
      en: "Filter dynamically by Factory (DMC, TB, TC) and Time Ranges (Today, Week, Month, Custom Range) with live real-time sync.",
      cn: "可按工厂（DMC、TB、TC）以及时间跨度（今天、本周、本月、自定义）实时过滤报表。",
    },
    selector: "#tour-slicers-bar",
    side: "bottom",
  },
  {
    icon: "📊",
    title: {
      vi: "Thẻ Điểm KPI & Scorecards",
      en: "KPI Executive Scorecards",
      cn: "KPI核心指标计分卡",
    },
    content: {
      vi: "Theo dõi tức thời 4 chỉ số sinh mệnh: Nhu Cầu Định Biên, Đã Tuyển, Thiếu Hụt, và Tỷ Lệ Đáp Ứng Kế Hoạch.",
      en: "Track four vital pillars in real-time: Total Demand, Recruited Count, Shortage, and Fulfillment Rate.",
      cn: "即时追踪四项核心指标：定编需求、已录用、缺口数以及目标达成率。",
    },
    selector: "#tour-kpi-scorecards",
    side: "bottom",
  },
  {
    icon: "📑",
    title: {
      vi: "Góc Nhìn Báo Cáo Chuyên Sâu",
      en: "In-Depth Analytical Perspectives",
      cn: "深度多维分析视角",
    },
    content: {
      vi: "Chuyển đổi góc nhìn giữa: Tiến Độ Tuyển Dụng (Phễu & Thời gian bù đắp), Hồ Sơ Ứng Viên (Tháp tuổi, Giới tính, Học vấn, Nguồn tuyển), và Phân Tích Thôi Việc.",
      en: "Switch perspectives between: Recruitment Performance (Funnel & Time-to-Fill), Demographics (Age Pyramid, Gender, Source), and Resignation Deep Dive.",
      cn: "在不同视角间自由切换：招聘效能（漏斗模型与交付周期）、应聘画像（年龄金字塔、性别、渠道）及离职全景分析。",
    },
    selector: "#tour-perspective-nav",
    side: "top",
    nextRoute: "/candidates",
  },

  // 3. Candidates Module
  {
    icon: "👥",
    title: {
      vi: "Quản Lý Hồ Sơ Ứng Viên",
      en: "Candidate Pipeline & Management",
      cn: "应聘人员全流程管理",
    },
    content: {
      vi: "Tra cứu, lọc nâng cao theo phong cách Excel, kiểm tra CCCD trùng lặp, cấp mã thẻ nhân viên và xuất Excel một chạm.",
      en: "Excel-style column filtering, duplicate ID detection, employee badge issuance, and one-click Excel exporting.",
      cn: "具备类Excel高级筛选、身份证查重、快速发放厂牌卡号以及一键导出Excel功能。",
    },
    selector: "#tour-candidate-controls",
    side: "bottom",
    prevRoute: "/",
    nextRoute: "/demand",
  },

  // 4. Demand Module
  {
    icon: "🎯",
    title: {
      vi: "Định Biên & Nhu Cầu Tuyển Dụng",
      en: "Manpower Demand Planning",
      cn: "定编与用工需求管理",
    },
    content: {
      vi: "Theo dõi chỉ tiêu tuyển dụng theo từng mã đơn, phòng ban, bộ phận, chức vụ và đối soát trạng thái bổ sung nhân sự.",
      en: "Track recruitment targets by requisition ID, departments, positions, and live fulfillment progress.",
      cn: "按需求单号、部门、车间、岗位细化管控招聘缺口，实时监控人员到岗补齐进度。",
    },
    selector: "#tour-demand-header",
    side: "bottom",
    prevRoute: "/candidates",
    nextRoute: "/resign",
  },

  // 5. Resign Module
  {
    icon: "📉",
    title: {
      vi: "Phân Tích & Biến Động Thôi Việc",
      en: "Resignation & Turnover Analytics",
      cn: "离职数据与流动性分析",
    },
    content: {
      vi: "Hệ thống tự động đồng bộ lý do thôi việc, thâm niên, tuổi tác và ghi chú vắng mặt từ HRM; hỗ trợ ma trận lý do và xuất dữ liệu báo cáo ban giám đốc.",
      en: "Auto-synced with HRM separation data including reasons, seniority, age, and notes; offers turnover matrices and executive reporting.",
      cn: "自动同步HRM系统离职原因、工龄、年龄及考勤备注；提供离职多维分析矩阵及高管汇报报表。",
    },
    selector: "#tour-resign-controls",
    side: "bottom",
    prevRoute: "/demand",
  },

  // 6. Finish Tour
  {
    icon: "🎉",
    title: {
      vi: "Sẵn Sàng Sử Dụng!",
      en: "You're All Set!",
      cn: "准备就绪，尽享高效！",
    },
    content: {
      vi: "Bạn có thể kích hoạt lại hướng dẫn này bất kỳ lúc nào bằng cách nhấn vào nút 'Hướng Dẫn' trên thanh menu trên cùng. Chúc bạn làm việc hiệu quả!",
      en: "You can relaunch this interactive guide anytime by clicking the 'Guide' button in the top header. Happy recruiting!",
      cn: "您可以随时点击顶部导航栏中的“系统指南”按钮再次启动此向导。祝您工作愉快！",
    },
    selector: "#tour-help-button",
    side: "bottom-right",
    prevRoute: "/resign",
  },
];

