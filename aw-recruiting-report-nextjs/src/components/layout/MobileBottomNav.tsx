"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserMinus,
  GraduationCap,
  Building2,
  Printer,
  FileBarChart2,
  MoreHorizontal,
  X,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSession } from "@/context/SessionContext";

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user, isAdmin, isUserOnly, currentLocale, setLocale } = useSession();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  // If user only has role "user", they only access Resign
  if (isUserOnly) {
    return (
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121214]/95 backdrop-blur-xl border-t border-[#d8dce2] dark:border-[#26262C] px-4 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] print:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
        aria-label="Điều hướng di động"
      >
        <div className="flex items-center justify-center">
          <Link
            href="/resign"
            className="flex flex-col items-center justify-center py-1 px-6 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold active:scale-95 transition-transform"
          >
            <UserMinus className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-tight">{t("resign", "Thôi Việc")}</span>
          </Link>
        </div>
      </nav>
    );
  }

  const primaryNavItems = [
    {
      id: "dashboard",
      href: "/",
      label: t("dashboard", "Dashboard"),
      icon: LayoutDashboard,
    },
    {
      id: "candidates",
      href: "/candidates",
      label: t("candidates", "Ứng Viên"),
      icon: Users,
    },
    {
      id: "demand",
      href: "/demand",
      label: t("demand", "Nhu Cầu"),
      icon: Briefcase,
    },
    {
      id: "resign",
      href: "/resign",
      label: t("resign", "Thôi Việc"),
      icon: UserMinus,
    },
  ];

  const secondaryNavItems = [
    {
      id: "recruiting-report",
      href: "/recruiting-report",
      label: t("recruitingReport", "Báo Cáo Tuyển Dụng"),
      icon: FileBarChart2,
    },
    ...(isAdmin
      ? [
          {
            id: "intern",
            href: "/intern",
            label: t("intern", "Thực Tập Sinh"),
            icon: GraduationCap,
          },
          {
            id: "deptcontrol",
            href: "/deptcontrol",
            label: t("deptcontrol", "Bộ Phận"),
            icon: Building2,
          },
        ]
      : []),
    {
      id: "print",
      href: "/print",
      label: t("printTemplates", "Mẫu In"),
      icon: Printer,
    },
  ];

  const isMoreActive = secondaryNavItems.some((item) => isActive(item.href));

  return (
    <>
      {/* Slide-up "More" Drawer for Secondary Tabs & Quick Controls on Mobile */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="relative bg-white dark:bg-[#18181C] border-t border-[#d8dce2] dark:border-[#26262C] rounded-t-2xl p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                {t("menu", "Menu Chức Năng & Tiện Ích")}
              </span>
              <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                aria-label="Đóng menu"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white active:scale-90"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* User Profile Mini Card */}
            {user && (
              <div className="mt-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-[#202025] border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user.name || user.empno}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                      {user.empno ? `${user.empno} • ` : ""}{user.dept} ({user.role})
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions: Language & Theme */}
            <div className="mt-3.5 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("settings", "Cài Đặt Nhanh")}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(["vi", "en", "cn"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setLocale(lang);
                    }}
                    className={`h-9 rounded-xl text-xs font-bold uppercase flex items-center justify-center transition-all active:scale-95 ${
                      currentLocale === lang
                        ? "bg-rose-600 text-white shadow-xs font-black"
                        : "bg-zinc-100 dark:bg-[#202025] text-slate-700 dark:text-slate-300 border border-zinc-200/80 dark:border-zinc-700/60"
                    }`}
                  >
                    {lang === "vi" ? "Tiếng Việt" : lang === "en" ? "English" : "中文"}
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary Navigation Items */}
            <div className="mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("features", "Chức Năng Khác")}
              </span>
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                {secondaryNavItems.map((item) => {
                  const active = isActive(item.href);
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setShowMoreMenu(false)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all active:scale-95 ${
                        active
                          ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-bold"
                          : "bg-zinc-50 dark:bg-[#202025] border-zinc-200/80 dark:border-zinc-700/60 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <IconComponent className="w-6 h-6 mb-1.5" />
                      <span className="text-[11px] text-center font-semibold leading-tight line-clamp-1">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar on Mobile */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121214]/95 backdrop-blur-xl border-t border-[#d8dce2] dark:border-[#26262C] px-2 py-1 pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))] print:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)] select-none"
        aria-label="Thanh điều hướng di động"
      >
        <div className="grid grid-cols-5 items-center justify-around">
          {primaryNavItems.map((item) => {
            const active = isActive(item.href);
            const IconComponent = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-90 ${
                  active
                    ? "text-rose-600 dark:text-rose-400 font-extrabold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <div className="relative">
                  <IconComponent className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-2"}`} />
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rose-600 dark:bg-rose-400" />
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-1 leading-none">{item.label}</span>
              </Link>
            );
          })}

          {/* More Button */}
          <button
            type="button"
            onClick={() => setShowMoreMenu(true)}
            aria-label={t("more", "Thêm chức năng")}
            aria-expanded={showMoreMenu}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-90 ${
              isMoreActive || showMoreMenu
                ? "text-rose-600 dark:text-rose-400 font-extrabold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <MoreHorizontal className="w-5 h-5 stroke-2" />
            <span className="text-[10px] tracking-tight mt-1 leading-none">
              {t("more", "Thêm")}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
