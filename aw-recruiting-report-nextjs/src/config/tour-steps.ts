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
      vi: "Dễ dàng chuyển đổi giữa các phân hệ: Ứng Viên, Nhu Cầu Định Biên, Báo Cáo Tuyển Dụng, Thực Tập Sinh, Quản Lý Bộ Phận và Mẫu In.",
      en: "Quickly switch between modules: Candidates, Manpower Demand, Recruitment Reports, Interns, Department Management, and Print Templates.",
      cn: "快速在各模块间切换：应聘人员、定编需求、招聘报表、实习生、部门管理及打印模板。",
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

  // 2. Candidates Module
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
    nextRoute: "/demand",
  },

  // 3. Demand Module
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
  },

  // 4. Finish Tour
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
    prevRoute: "/demand",
  },
];

