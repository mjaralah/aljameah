// مزود سياق اللغة العربي/الإنجليزي مع حفظ الاختيار
import { createContext, ReactNode, useContext, useEffect, useMemo } from "react";
import { ar, type Dict } from "@/i18n/ar";
import { en } from "@/i18n/en";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Lang, LocalizedText } from "@/types";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  dir: "rtl" | "ltr";
  /** Helper for localized objects ({ ar, en }) */
  tx: (text: LocalizedText) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useLocalStorage<Lang>("app:lang", "ar");
  const dir = lang === "ar" ? "rtl" : "ltr";
  const t = lang === "ar" ? ar : en;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      t,
      dir,
      tx: (text) => text[lang],
    }),
    [lang, setLang, t, dir],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};