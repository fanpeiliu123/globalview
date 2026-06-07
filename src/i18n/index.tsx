import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dict, disciplineEn, tierEn, type Locale } from "./dict";

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Pick the localized form of a {zh,en} pair (used for data labels). */
  pick: (zh: string, en: string) => string;
  discipline: (value: string) => string;
  tier: (value: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

const STORAGE_KEY = "gv-locale";

function readInitialLocale(): Locale {
  if (typeof window === "undefined") return "zh";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "zh" || stored === "en") return stored;
  return "zh";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en" : "zh-CN";
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => setLocaleState(next), []);
  const toggleLocale = useCallback(
    () => setLocaleState((current) => (current === "zh" ? "en" : "zh")),
    [],
  );

  const value = useMemo<I18nValue>(() => {
    const t = (key: string, vars?: Record<string, string | number>) => {
      const table = dict[locale];
      let text = table[key] ?? dict.zh[key] ?? key;
      if (vars) {
        for (const [name, replacement] of Object.entries(vars)) {
          text = text.replace(new RegExp(`\\{${name}\\}`, "g"), String(replacement));
        }
      }
      return text;
    };
    return {
      locale,
      setLocale,
      toggleLocale,
      t,
      pick: (zh, en) => (locale === "en" ? en : zh),
      discipline: (v) => (locale === "en" ? disciplineEn[v] ?? v : v),
      tier: (v) => (locale === "en" ? tierEn[v] ?? v : v),
    };
  }, [locale, setLocale, toggleLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export type { Locale };
