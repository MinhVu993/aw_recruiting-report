"use client";

import { useSession } from "@/context/SessionContext";
import { translations, LocaleType, TranslationKey } from "@/locales";

export function useTranslation() {
  const { currentLocale, setLocale } = useSession();
  const safeLocale: LocaleType =
    currentLocale === "en" || currentLocale === "cn" ? currentLocale : "vi";

  const t = (key: TranslationKey | string, fallback?: string): string => {
    const currentDict = translations[safeLocale] as Record<string, string>;
    if (currentDict && key in currentDict) {
      return currentDict[key];
    }

    // Fallback: Tìm case-insensitive trong dictionary
    const lowerKey = String(key).toLowerCase().trim();
    for (const [k, v] of Object.entries(currentDict)) {
      if (k.toLowerCase() === lowerKey) {
        return v;
      }
    }

    // Fallback sang tiếng Việt nếu không có
    const viDict = translations.vi as Record<string, string>;
    if (viDict && key in viDict) {
      return viDict[key];
    }

    // Fallback sang tiếng Anh
    const enDict = translations.en as Record<string, string>;
    if (enDict && key in enDict) {
      return enDict[key];
    }

    return fallback !== undefined ? fallback : String(key);
  };

  return {
    t,
    locale: safeLocale,
    setLocale,
    isVi: safeLocale === "vi",
    isEn: safeLocale === "en",
    isCn: safeLocale === "cn",
  };
}
