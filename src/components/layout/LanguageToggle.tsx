import { Globe, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/usePublicContent";

// زر تبديل اللغة العربية/الإنجليزية — قابل للتحكم من لوحة التحكم
export const LanguageToggle = ({ compact = false }: { compact?: boolean }) => {
  const { lang, setLang } = useLanguage();
  const { data: settings } = useSiteSettings();

  if ((settings as any)?.language_toggle_enabled === false) return null;

  const iconKey = (settings as any)?.language_toggle_icon || "languages";
  const Icon = iconKey === "globe" ? Globe : iconKey === "none" ? null : Languages;

  const customAr = (settings as any)?.language_toggle_label_ar as string | null | undefined;
  const customEn = (settings as any)?.language_toggle_label_en as string | null | undefined;
  const label = lang === "ar" ? (customAr || "EN") : (customEn || "عربي");

  return (
    <Button
      variant="ghost"
      size={compact ? "sm" : "default"}
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      className="gap-2 font-semibold text-primary-foreground hover:text-accent hover:bg-primary-foreground/10"
      aria-label="Toggle language"
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span>{label}</span>
    </Button>
  );
};
