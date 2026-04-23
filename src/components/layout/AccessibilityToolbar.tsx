import { useState } from "react";
import { Accessibility, BookOpen, Contrast, Eye, Minus, Plus, RotateCcw, Type, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useA11y } from "@/contexts/A11yContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

// شريط الوصول العائم — يفتح كلوحة جانبية
export const AccessibilityToolbar = () => {
  const [open, setOpen] = useState(false);
  const { settings, update, reset } = useA11y();
  const { t, dir } = useLanguage();

  const setScale = (delta: number) => {
    const next = Math.max(0.85, Math.min(1.4, +(settings.textScale + delta).toFixed(2)));
    update({ textScale: next });
  };

  return (
    <>
      {/* زر عائم */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t.a11y.open}
        className={cn(
          "fixed z-50 bottom-5 h-14 w-14 rounded-full bg-gradient-primary text-primary-foreground shadow-card",
          "grid place-items-center hover:scale-105 transition-smooth",
          dir === "rtl" ? "left-5" : "right-5",
        )}
      >
        <Accessibility className="h-7 w-7" />
      </button>

      {/* اللوحة */}
      {open && (
        <div
          role="dialog"
          aria-label={t.a11y.title}
          className={cn(
            "fixed z-50 bottom-24 w-[300px] rounded-2xl border border-border bg-card shadow-card p-4 animate-fade-in",
            dir === "rtl" ? "left-5" : "right-5",
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-primary flex items-center gap-2">
              <Accessibility className="h-5 w-5" /> {t.a11y.title}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="close">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* حجم النص */}
            <div>
              <div className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5" /> {t.a11y.textSize}
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={() => setScale(-0.1)} aria-label={t.a11y.smaller}>
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex-1 text-center text-sm font-semibold">
                  {Math.round(settings.textScale * 100)}%
                </div>
                <Button size="icon" variant="outline" onClick={() => setScale(0.1)} aria-label={t.a11y.larger}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ToggleRow icon={<Contrast className="h-4 w-4" />} label={t.a11y.contrast} checked={settings.highContrast} onChange={(v) => update({ highContrast: v })} />
            <ToggleRow icon={<BookOpen className="h-4 w-4" />} label={t.a11y.dyslexia} checked={settings.dyslexia} onChange={(v) => update({ dyslexia: v })} />
            <ToggleRow icon={<Eye className="h-4 w-4" />} label={t.a11y.readingGuide} checked={settings.readingGuide} onChange={(v) => update({ readingGuide: v })} />

            <Button variant="outline" className="w-full gap-2" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> {t.a11y.reset}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

const ToggleRow = ({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <label className="flex items-center justify-between gap-3 cursor-pointer">
    <span className="flex items-center gap-2 text-sm font-medium">
      {icon} {label}
    </span>
    <Switch checked={checked} onCheckedChange={onChange} />
  </label>
);