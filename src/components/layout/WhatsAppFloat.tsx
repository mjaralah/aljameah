import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { useSiteSettings } from "@/hooks/usePublicContent";
import { cn } from "@/lib/utils";

// أيقونة واتساب الرسمية (SVG)
const WhatsAppIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.892c0 2.096.549 4.142 1.595 5.945L0 24l6.335-1.652a12.062 12.062 0 0 0 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411" />
  </svg>
);

const STORAGE_KEY = "wa_tooltip_dismissed_v1";

export const WhatsAppFloat = () => {
  const { data: settings } = useSiteSettings();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [showTip, setShowTip] = useState(false);

  // إظهار الزر بعد تمرير الصفحة قليلاً
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 150);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // إظهار التلميح تلقائياً (مرة واحدة لكل جلسة)
  useEffect(() => {
    if (!settings?.whatsapp_show_tooltip) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setShowTip(true), 5000);
    return () => clearTimeout(t);
  }, [settings?.whatsapp_show_tooltip]);

  // إخفاء في صفحات لوحة التحكم
  if (location.pathname.startsWith("/admin")) return null;
  if (!settings?.whatsapp_enabled) return null;
  const rawNumber = (settings.whatsapp_number || "").replace(/[^\d]/g, "");
  if (!rawNumber) return null;

  const message = settings.whatsapp_message || "";
  const tooltip = settings.whatsapp_tooltip || "مرحباً 👋 كيف يمكننا مساعدتك؟";
  const isLeft = (settings.whatsapp_position || "left") === "left";
  const href = `https://wa.me/${rawNumber}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

  const dismissTip = () => {
    setShowTip(false);
    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
  };

  return (
    <div
      className={cn(
        "fixed bottom-5 sm:bottom-6 z-40 flex items-end gap-2 transition-all duration-300",
        isLeft ? "left-4 sm:left-6 flex-row" : "right-4 sm:right-6 flex-row-reverse",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
      )}
    >
      {/* التلميح */}
      {showTip && (
        <div
          className={cn(
            "relative mb-1 max-w-[240px] rounded-2xl bg-background text-foreground shadow-lg border border-border px-4 py-2.5 text-sm font-medium animate-fade-in",
            isLeft ? "rounded-bl-sm" : "rounded-br-sm",
          )}
        >
          {tooltip}
          <button
            type="button"
            onClick={dismissTip}
            aria-label="إغلاق"
            className="absolute -top-2 -end-2 h-5 w-5 rounded-full bg-muted hover:bg-muted-foreground/20 grid place-items-center text-muted-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* الزر - تصميم مفرغ */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل عبر واتساب"
        onClick={dismissTip}
        className="group relative grid place-items-center h-14 w-14 rounded-full shadow-md hover:shadow-xl border-[3px] hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
        style={{ backgroundColor: "#F0F7F2", borderColor: "#25D366" }}
      >
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-25"
          style={{ backgroundColor: "#25D366" }}
          aria-hidden="true"
        />
        <span
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundColor: "#25D366" }}
          aria-hidden="true"
        />
        <WhatsAppIcon className="h-7 w-7 relative z-10 transition-colors duration-300 group-hover:text-white" style={{ color: "#25D366" }} />
      </a>
    </div>
  );
};
