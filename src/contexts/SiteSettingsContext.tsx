// يطبّق إعدادات الموقع الديناميكية (الألوان، الاسم، الأيقونة) على واجهة المستخدم
import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/usePublicContent";

// تحويل HEX إلى HSL space-separated (لاستخدامه مع متغيرات CSS)
function hexToHsl(hex: string): string | null {
  const m = hex.replace("#", "").match(/^([\da-f]{6}|[\da-f]{3})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hue = 0, sat = 0;
  const light = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hue = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hue = (b - r) / d + 2; break;
      case b: hue = (r - g) / d + 4; break;
    }
    hue *= 60;
  }
  return `${Math.round(hue)} ${Math.round(sat * 100)}% ${Math.round(light * 100)}%`;
}

export const SiteSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const { data } = useSiteSettings();

  useEffect(() => {
    if (!data) return;
    const root = document.documentElement;
    if (data.primary_color) {
      const hsl = hexToHsl(data.primary_color);
      if (hsl) root.style.setProperty("--primary", hsl);
    }
    if (data.secondary_color) {
      const hsl = hexToHsl(data.secondary_color);
      if (hsl) root.style.setProperty("--accent", hsl);
    }
    if (data.site_name) {
      document.title = data.site_name;
    }
    if (data.favicon_url) {
      let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = data.favicon_url;
    }
  }, [data]);

  return <>{children}</>;
};
