"use client";

import React from "react";
import Link from "next/link";
import { TabNav } from "./TabNav";
import { useSession } from "@/context/SessionContext";
import { useTranslation } from "@/hooks/useTranslation";
import { TourTriggerButton } from "@/components/tour/TourTriggerButton";

export const Header: React.FC = () => {
  const { user, currentLocale, setLocale } = useSession();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 pt-[env(safe-area-inset-top,0px)] min-h-[calc(52px+env(safe-area-inset-top,0px))] w-full border-b border-[#d8dce2] dark:border-[#222228] bg-[#f1f3f6] dark:bg-[#121214]/95 backdrop-blur-xl transition-colors duration-200 print:hidden">
      <div className="flex h-full w-full items-center justify-between px-3 sm:px-5 lg:px-6">
        {/* Left: Brand Logo */}
        <div className="flex items-center space-x-3.5" id="tour-brand-logo">
          <Link
            href="/candidates"
            className="flex items-center space-x-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 rounded-lg"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Logo"
              width={36}
              height={32}
              className="h-8 w-auto max-w-[36px] object-contain group-hover:scale-105 transition-transform drop-shadow-xs"
            />
            <div>
              <div className="flex items-center space-x-1.5 leading-none">
                <span className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-[#F1F2F4] uppercase">
                  {t("appName", "RECRUITMENT TOOL")}
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Header Menu Tabs */}
        <div className="hidden md:flex">
          <TabNav />
        </div>

        {/* Right: Hardware Scanner Indicator & User Profile with refined spacing */}
        <div className="flex items-center">
          {/* Tour Interactive Guide Button */}
          <div className="mr-3 sm:mr-4">
            <TourTriggerButton />
          </div>

          {/* Language Switcher: VI / 中文 / EN */}
          <div className="flex items-center text-xs font-semibold select-none" id="tour-lang-switcher">
            <button
              onClick={() => setLocale("vi")}
              className={`transition-colors duration-150 cursor-pointer ${
                currentLocale === "vi"
                  ? "text-[#EA580C] font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              VI
            </button>
            <span className="text-slate-300 mx-2.5 sm:mx-3 select-none">/</span>
            <button
              onClick={() => setLocale("cn")}
              className={`transition-colors duration-150 cursor-pointer ${
                currentLocale === "cn"
                  ? "text-[#EA580C] font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              中文
            </button>
            <span className="text-slate-300 mx-2.5 sm:mx-3 select-none">/</span>
            <button
              onClick={() => setLocale("en")}
              className={`transition-colors duration-150 cursor-pointer ${
                currentLocale === "en"
                  ? "text-[#EA580C] font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              EN
            </button>
          </div>

          {/* Vertical Divider */}
          <div className="h-6 w-[1px] bg-slate-300 mx-4 sm:mx-5" />

          {/* User Profile */}
          <div className="flex flex-col justify-center text-left leading-tight">
            <div className="text-[13px] font-bold text-slate-800 tracking-tight truncate max-w-[220px]">
              {user.name || "黃明羽 (Vu.Huynh)"}
            </div>
            <div className="text-[11px] text-slate-500 font-normal tracking-tight mt-0.5 truncate max-w-[220px]">
              {user.empno && user.dept
                ? `${user.empno} | ${user.dept}`
                : user.empno
                ? user.empno
                : user.dept
                ? user.dept
                : "038146 | TIT00302"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
