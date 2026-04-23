import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

// زر تبديل اللغة العربية/الإنجليزية
export const LanguageToggle = ({ compact = false }: { compact?: boolean }) => {
  const { lang, setLang } = useLanguage();
  return (
    <Button
      variant="ghost"
      size={compact ? "sm" : "default"}
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      className="gap-2 font-semibold text-primary-foreground hover:text-accent hover:bg-primary-foreground/10"
      aria-label="Toggle language"
    >
      <Languages className="h-4 w-4" />
      <span>{lang === "ar" ? "EN" : "عربي"}</span>
    </Button>
  );
};