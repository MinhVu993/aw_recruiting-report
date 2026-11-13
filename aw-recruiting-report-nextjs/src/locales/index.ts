import { vi, TranslationKey } from "./vi";
import { en } from "./en";
import { cn } from "./cn";

export type LocaleType = "vi" | "en" | "cn";

export const translations: Record<LocaleType, Record<TranslationKey, string>> = {
  vi,
  en,
  cn,
};

export { vi, en, cn };
export type { TranslationKey };
