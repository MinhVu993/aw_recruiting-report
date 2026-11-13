"use client";

import React from "react";
import { HelpCircle, Sparkles } from "lucide-react";
import { useNextStep } from "nextstepjs";
import { useSession } from "@/context/SessionContext";

export const TourTriggerButton: React.FC = () => {
  const { startNextStep, isNextStepVisible } = useNextStep();
  const { currentLocale } = useSession();

  const labels = {
    vi: "Hướng Dẫn",
    en: "App Guide",
    cn: "系统指南",
  };

  const currentLabel = labels[currentLocale as keyof typeof labels] || labels.vi;

  return (
    <>
      <button
        id="tour-help-button"
        type="button"
        onClick={() => startNextStep("appOverviewTour")}
        title="Bật hướng dẫn sử dụng tương tác (App Tour)"
        aria-label={currentLabel}
        className={`group relative inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-zinc-900 ${
          isNextStepVisible
            ? "bg-rose-600 text-white shadow-xs"
            : "bg-white/90 dark:bg-zinc-800/90 text-slate-700 dark:text-zinc-200 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-zinc-700 shadow-2xs"
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 text-rose-500 group-hover:rotate-12 transition-transform duration-200 motion-reduce:group-hover:rotate-0" aria-hidden="true" />
        <span className="hidden sm:inline">{currentLabel}</span>
      </button>

      {/* Hidden button for programmatic trigger on first user visit */}
      <button
        id="btn-trigger-app-tour"
        type="button"
        aria-hidden="true"
        onClick={() => startNextStep("appOverviewTour")}
        className="sr-only"
      />
    </>
  );
};

