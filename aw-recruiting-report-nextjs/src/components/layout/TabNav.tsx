"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { useSession } from "@/context/SessionContext";
import { TranslationKey } from "@/locales";

interface TabItem {
  id: string;
  key: TranslationKey;
  fallback: string;
  href: string;
}

const tabs: TabItem[] = [
  { id: "candidates", key: "candidates", fallback: "Ứng Viên", href: "/candidates" },
  { id: "demand", key: "demand", fallback: "Nhu Cầu", href: "/demand" },
  { id: "recruiting-report", key: "recruitingReport", fallback: "Báo Cáo Tuyển Dụng", href: "/recruiting-report" },
  { id: "intern", key: "intern", fallback: "Thực Tập Sinh", href: "/intern" },
  { id: "deptcontrol", key: "deptcontrol", fallback: "Bộ Phận", href: "/deptcontrol" },
  { id: "print", key: "printTemplates", fallback: "Mẫu In", href: "/print" },
];

export const TabNav: React.FC = () => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isAdmin } = useSession();

  // Role-based visible tabs:
  // - 'admin': Thấy toàn bộ kể cả Thực Tập Sinh (Intern) và Quản Lý Bộ Phận (Dept Control)
  // - Other roles: Thấy Ứng Viên, Nhu Cầu, Báo Cáo Tuyển Dụng, Mẫu In (Ẩn Intern và Dept Control)
  const visibleTabs = tabs.filter((tab) => {
    if (isAdmin) {
      return true;
    }
    // Non-admin roles
    return tab.id !== "intern" && tab.id !== "deptcontrol";
  });

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <nav id="tour-main-nav" className="flex items-center space-x-1 overflow-x-auto py-1 px-1 no-scrollbar" aria-label="Điều hướng chính">
      {visibleTabs.map((tab) => {
        const active = isActive(tab.href);
        const tabTitle = t(tab.key, tab.fallback);

        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex items-center justify-center px-3.5 py-1.5 rounded-lg text-sm font-medium transition-[color,background-color,transform] duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 ${
              active
                ? "text-rose-600 dark:text-[#fb7185] font-bold"
                : "text-zinc-600 dark:text-[#8E929B] hover:text-zinc-900 dark:hover:text-[#F1F2F4] hover:bg-zinc-100 dark:hover:bg-[#18181C]"
            }`}
          >
            {active && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 rounded-lg bg-rose-500/10 dark:bg-[#341117] border border-rose-500/30 dark:border-[#f43f5e]/40 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                transition={{ type: "spring", duration: 0.32, bounce: 0.15 }}
              />
            )}
            <span className="z-10 whitespace-nowrap">{tabTitle}</span>
          </Link>
        );
      })}
    </nav>
  );
};
