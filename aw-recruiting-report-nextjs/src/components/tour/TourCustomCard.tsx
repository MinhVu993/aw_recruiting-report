"use client";

import React from "react";
import { CardComponentProps } from "nextstepjs";
import { Sparkles, ArrowRight, ArrowLeft, X, Check } from "lucide-react";
import { useSession } from "@/context/SessionContext";

export const TourCustomCard: React.FC<CardComponentProps> = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  arrow,
}) => {
  const { currentLocale } = useSession();
  const locale = (currentLocale === "cn" || currentLocale === "en" ? currentLocale : "vi") as "vi" | "en" | "cn";

  // Resolve localized text if available
  const title =
    typeof (step as any).titleLocalized === "object"
      ? (step as any).titleLocalized[locale] || step.title
      : step.title;

  const content =
    typeof (step as any).contentLocalized === "object"
      ? (step as any).contentLocalized[locale] || step.content
      : step.content;

  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  const labels = {
    vi: {
      skip: "Bỏ qua",
      prev: "Quay lại",
      next: "Tiếp tục",
      finish: "Hoàn tất",
      stepOf: `Bước ${currentStep + 1} / ${totalSteps}`,
      closeTourAria: "Đóng hướng dẫn",
      prevStepAria: "Quay lại bước trước",
      nextStepAria: "Chuyển sang bước kế tiếp",
      finishTourAria: "Hoàn tất hướng dẫn",
    },
    en: {
      skip: "Skip",
      prev: "Back",
      next: "Next",
      finish: "Got it",
      stepOf: `Step ${currentStep + 1} of ${totalSteps}`,
      closeTourAria: "Close guide",
      prevStepAria: "Go to previous step",
      nextStepAria: "Go to next step",
      finishTourAria: "Finish guide",
    },
    cn: {
      skip: "跳过",
      prev: "上一步",
      next: "下一步",
      finish: "完成",
      stepOf: `第 ${currentStep + 1} 步 / 共 ${totalSteps} 步`,
      closeTourAria: "关闭指南",
      prevStepAria: "返回上一步",
      nextStepAria: "下一步",
      finishTourAria: "完成指南",
    },
  }[locale];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="relative w-[340px] sm:w-[380px] rounded-2xl bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-2xl p-5 border border-zinc-200 dark:border-[#2C2C35] shadow-[0_20px_50px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-slate-800 dark:text-slate-100 z-[999999] transition-all duration-200 select-none animate-in fade-in zoom-in-95 motion-reduce:animate-none touch-manipulation [&_[data-name=nextstep-arrow]]:text-white dark:[&_[data-name=nextstep-arrow]]:text-[#18181C] [&_[data-name=nextstep-arrow]]:drop-shadow-[0_-2px_4px_rgba(0,0,0,0.06)]"
    >
      {/* Header bar with icon and skip button */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/20 text-lg"
          >
            {step.icon || <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />}
          </div>
          <div>
            <span className="text-[10px] font-black tracking-wider uppercase text-rose-600 dark:text-rose-400 font-mono">
              {labels.stepOf}
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
              {title}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={skipTour}
          aria-label={labels.closeTourAria}
          className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#25252D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Content description */}
      <div className="text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-300 font-normal mb-5 pr-1">
        {content}
      </div>

      {/* Progress Dots Indicator */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#26262E]">
        <div
          role="progressbar"
          aria-valuenow={currentStep + 1}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={labels.stepOf}
          className="flex items-center gap-1.5"
        >
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-200 motion-reduce:transition-none ${
                idx === currentStep
                  ? "w-5 bg-gradient-to-r from-rose-500 to-orange-500"
                  : "w-1.5 bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Action Navigation Buttons */}
        <div className="flex items-center gap-2">
          {!isFirst && (
            <button
              type="button"
              onClick={prevStep}
              aria-label={labels.prevStepAria}
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#25252D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{labels.prev}</span>
            </button>
          )}

          <button
            type="button"
            onClick={nextStep}
            aria-label={isLast ? labels.finishTourAria : labels.nextStepAria}
            className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-bold bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white shadow-md shadow-rose-600/25 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#18181C] transition-all cursor-pointer motion-reduce:transform-none"
          >
            <span>{isLast ? labels.finish : labels.next}</span>
            {isLast ? (
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Arrow from NextStep */}
      {arrow}
    </div>
  );
};

