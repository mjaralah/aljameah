// مزود سياق إعدادات الوصول
import { createContext, ReactNode, useContext, useEffect, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export interface A11ySettings {
  textScale: number; // 0.9 | 1 | 1.15 | 1.3
  highContrast: boolean;
  dyslexia: boolean;
  readingGuide: boolean;
}

const DEFAULTS: A11ySettings = {
  textScale: 1,
  highContrast: false,
  dyslexia: false,
  readingGuide: false,
};

interface A11yContextValue {
  settings: A11ySettings;
  update: (patch: Partial<A11ySettings>) => void;
  reset: () => void;
}

const A11yContext = createContext<A11yContextValue | null>(null);

export const A11yProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useLocalStorage<A11ySettings>("app:a11y", DEFAULTS);

  // تطبيق إعدادات النص والتباين على عنصر <html>
  useEffect(() => {
    const html = document.documentElement;
    html.style.fontSize = `${settings.textScale * 100}%`;
    html.classList.toggle("a11y-high-contrast", settings.highContrast);
    html.classList.toggle("a11y-dyslexia", settings.dyslexia);
  }, [settings]);

  // خط مساعدة القراءة — شريط أفقي يتبع المؤشر
  useEffect(() => {
    if (!settings.readingGuide) return;
    const bar = document.createElement("div");
    bar.className = "reading-guide-bar";
    document.body.appendChild(bar);
    const onMove = (e: MouseEvent) => {
      bar.style.top = `${e.clientY}px`;
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      bar.remove();
    };
  }, [settings.readingGuide]);

  const value = useMemo<A11yContextValue>(
    () => ({
      settings,
      update: (patch) => setSettings({ ...settings, ...patch }),
      reset: () => setSettings(DEFAULTS),
    }),
    [settings, setSettings],
  );

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
};

export const useA11y = () => {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error("useA11y must be used within A11yProvider");
  return ctx;
};