"use client";

import React, { useMemo, useEffect } from "react";
import { NextStepProvider, NextStep, Tour } from "nextstepjs";
import { APP_TOUR_STEPS } from "@/config/tour-steps";
import { TourCustomCard } from "./TourCustomCard";
import { useSession } from "@/context/SessionContext";

export function AppTourProvider({ children }: { children: React.ReactNode }) {
  const { currentLocale } = useSession();
  const locale = (currentLocale === "cn" || currentLocale === "en" ? currentLocale : "vi") as "vi" | "en" | "cn";

  // Build reactive steps matching current locale
  const tours: Tour[] = useMemo(() => {
    return [
      {
        tour: "appOverviewTour",
        steps: APP_TOUR_STEPS.map((s) => ({
          icon: s.icon,
          title: s.title[locale] || s.title.vi,
          content: s.content[locale] || s.content.vi,
          selector: s.selector,
          side: s.side || "bottom-left",
          cardOffset: 12,
          pointerPadding: 12,
          pointerRadius: 10,
          showControls: true,
          showSkip: true,
          nextRoute: s.nextRoute,
          prevRoute: s.prevRoute,
          // Custom properties accessed by TourCustomCard
          titleLocalized: s.title,
          contentLocalized: s.content,
        } as any)),
      },
    ];
  }, [locale]);

  // Check and trigger tour automatically on first visit
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasSeenTour = localStorage.getItem("vg_has_seen_app_tour");
    if (!hasSeenTour) {
      // Delay slightly for initial DOM render
      const timer = setTimeout(() => {
        const btn = document.getElementById("btn-trigger-app-tour");
        if (btn) {
          btn.click();
          localStorage.setItem("vg_has_seen_app_tour", "true");
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <NextStepProvider>
      <NextStep
        steps={tours}
        cardComponent={TourCustomCard}
        shadowRgb="15, 23, 42"
        shadowOpacity="0.65"
      >
        {children}
      </NextStep>
    </NextStepProvider>
  );
}

