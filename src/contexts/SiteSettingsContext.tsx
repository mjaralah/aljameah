// يطبّق إعدادات الموقع الديناميكية (الألوان، الاسم، الأيقونة) على واجهة المستخدم
// يُولّد كامل منظومة توكنات الهوية (تدرجات، ظلال، سايدبار، تينتات) من اللونين الأساسي والثانوي
import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/usePublicContent";

type HSL = { h: number; s: number; l: number };

function hexToHsl(hex: string): HSL | null {
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
  return { h: Math.round(hue), s: Math.round(sat * 100), l: Math.round(light * 100) };
}

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

function adjust(c: HSL, opts: { dl?: number; ds?: number; dh?: number } = {}): HSL {
  return {
    h: (c.h + (opts.dh ?? 0) + 360) % 360,
    s: clamp(c.s + (opts.ds ?? 0)),
    l: clamp(c.l + (opts.dl ?? 0)),
  };
}

const hslStr = (c: HSL) => `${c.h} ${c.s}% ${c.l}%`;
const hslCss = (c: HSL, alpha?: number) =>
  alpha != null ? `hsl(${c.h} ${c.s}% ${c.l}% / ${alpha})` : `hsl(${c.h} ${c.s}% ${c.l}%)`;

// يختار لون نص متباين فوق الخلفية الملونة
function fg(c: HSL): string {
  return c.l > 62 ? "0 0% 10%" : "0 0% 100%";
}

function applyPalette(primary: HSL, accent: HSL, isDark: boolean) {
  const root = document.documentElement;
  const set = (k: string, v: string) => root.style.setProperty(k, v);

  // — الأساسي ومشتقاته —
  const p = isDark ? adjust(primary, { dl: +18 }) : primary;
  const pGlow = adjust(p, { dl: +14, ds: -10 });
  const pDeep = adjust(p, { dl: -6 });
  const pSoft = adjust(p, { dl: isDark ? -55 : +60, ds: -30 });

  set("--primary", hslStr(p));
  set("--primary-foreground", fg(p));
  set("--primary-glow", hslStr(pGlow));
  set("--ring", hslStr(p));
  set("--secondary", hslStr(pSoft));
  set("--secondary-foreground", hslStr(adjust(p, { dl: -6 })));

  // — الثانوي ومشتقاته —
  const a = isDark ? adjust(accent, { dl: +5 }) : accent;
  const aSoft = adjust(a, { dl: isDark ? -50 : +44, ds: +14 });

  set("--accent", hslStr(a));
  set("--accent-foreground", fg(a));
  set("--accent-soft", hslStr(aSoft));

  // — التدرجات —
  set("--gradient-primary", `linear-gradient(135deg, ${hslCss(p)}, ${hslCss(adjust(p, { dl: +8 }))})`);
  set("--gradient-gold", `linear-gradient(135deg, ${hslCss(a)}, ${hslCss(adjust(a, { dl: +10 }))})`);
  set(
    "--gradient-hero",
    `linear-gradient(135deg, ${hslCss(pDeep, 0.85)}, ${hslCss(adjust(p, { dl: +4 }), 0.6)})`,
  );
  set(
    "--gradient-cta",
    `linear-gradient(120deg, ${hslCss(p)} 0%, ${hslCss(adjust(p, { dl: +8 }))} 60%, ${hslCss(a)} 100%)`,
  );

  // — الظلال —
  set("--shadow-soft", `0 4px 20px -8px ${hslCss(p, 0.15)}`);
  set("--shadow-card", `0 10px 30px -12px ${hslCss(p, 0.18)}`);
  set("--shadow-gold", `0 8px 24px -10px ${hslCss(a, 0.4)}`);

  // — الشريط الجانبي —
  set("--sidebar-primary", hslStr(p));
  set("--sidebar-primary-foreground", fg(p));
  set("--sidebar-accent", hslStr(a));
  set("--sidebar-accent-foreground", fg(a));
  set("--sidebar-ring", hslStr(p));
  set("--sidebar-border", hslStr(adjust(p, { dl: isDark ? -45 : +55, ds: -35 })));
}

export const SiteSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const { data } = useSiteSettings();

  useEffect(() => {
    const primaryHex = data?.primary_color || "#1B5E35";
    const accentHex = data?.secondary_color || "#C5973A";
    const primary = hexToHsl(primaryHex);
    const accent = hexToHsl(accentHex);
    if (!primary || !accent) return;

    const apply = () =>
      applyPalette(primary, accent, document.documentElement.classList.contains("dark"));
    apply();

    // إعادة التوليد عند تبديل الوضع الداكن
    const obs = new MutationObserver(apply);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    if (data?.site_name) document.title = data.site_name;
    if (data?.favicon_url) {
      let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = data.favicon_url;
    }

    // حفظ الألوان والاسم والأيقونة محلياً لتطبيقها فوراً عند التحديث (يمنع وميض الهوية القديمة)
    try {
      localStorage.setItem(
        "site_brand_cache_v1",
        JSON.stringify({
          primary: data?.primary_color || primaryHex,
          accent: data?.secondary_color || accentHex,
          site_name: data?.site_name || null,
          favicon_url: data?.favicon_url || null,
        }),
      );
    } catch {}

    return () => obs.disconnect();
  }, [data]);

  return <>{children}</>;
};

