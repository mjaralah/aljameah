import { BadgeCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAboutContent } from "@/hooks/usePublicContent";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";

// شريط علوي ثابت يحوي شارة التوثيق ورقم السجل ومبدّل اللغة
export const TopBar = () => {
  const { t } = useLanguage();
  const { data: aboutData } = useAboutContent();
  const regSec = aboutData?.find((s) => s.section_key === "registration");
  const regRows = (regSec?.data?.rows as { label?: string; value?: string }[] | undefined) ?? [];
  const regRow =
    regRows.find((r) => /تسجيل|سجل|ترخيص|رخصة|license|registration/i.test(r.label ?? "")) ??
    regRows[0];
  const regNumber = regRow?.value || t.brand.regNumber;
  return (
    <div className="bg-primary text-primary-foreground text-xs sm:text-sm">
      <div className="container flex items-center justify-between gap-3 py-1.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/95 text-accent-foreground px-2.5 py-0.5 font-semibold shadow-gold">
            <BadgeCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.brand.verified}</span>
            <span className="sm:hidden">✓</span>
          </span>
          <span className="opacity-90 truncate">
            {t.brand.registration}: <span className="font-semibold">{regNumber}</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <LanguageToggle compact />
        </div>
      </div>
    </div>
  );
};
