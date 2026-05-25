import { ArrowLeft, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageContent, useAboutContent } from "@/hooks/usePublicContent";
import aboutImg from "@/assets/about-preview.jpg";

export const AboutPreview = () => {
  const { t, dir } = useLanguage();
  const { data } = usePageContent("home");
  const { data: aboutData } = useAboutContent();
  const regSec = aboutData?.find((s) => s.section_key === "registration");
  const regRows = (regSec?.data?.rows as { label?: string; value?: string }[] | undefined) ?? [];
  const regRow =
    regRows.find((r) => /تسجيل|سجل|ترخيص|رخصة|license|registration/i.test(r.label ?? "")) ??
    regRows[0];
  const regNumber = regRow?.value || t.brand.regNumber;
  const sec = data?.find((s) => s.section_key === "about_preview");
  const title = sec?.title || t.brand.name;
  const body = sec?.content || t.about.body;
  const ctaLabel = sec?.data?.cta_label || t.about.learnMore;
  const ctaUrl = sec?.data?.cta_url || "/about";
  const imageUrl = sec?.data?.image_url || aboutImg;
  return (
    <section className="container py-16 md:py-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center" aria-label="about-preview">
      <div className="relative order-2 lg:order-1">
        <div className="absolute -inset-3 rounded-3xl bg-gradient-gold opacity-20 blur-xl" aria-hidden />
        <img
          src={imageUrl}
          alt={t.about.title}
          loading="lazy"
          width={1200}
          height={900}
          className="relative rounded-3xl shadow-card object-cover w-full aspect-[4/3]"
        />
        <div className="absolute -bottom-5 -end-5 bg-card rounded-2xl shadow-card p-4 max-w-[210px] border border-border">
          <div className="flex items-center gap-2 text-primary mb-1">
            <BadgeCheck className="h-5 w-5 text-accent" />
            <span className="font-bold text-sm">{t.brand.verified}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t.brand.registration}: {regNumber}
          </p>
        </div>
      </div>

      <div className="order-1 lg:order-2">
        <span className="text-accent font-bold text-sm uppercase tracking-wider">{t.about.title}</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-primary mt-2 mb-5">{title}</h2>
        <p className="text-lg text-muted-foreground leading-loose mb-6">{body}</p>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
          <Link to={ctaUrl}>
            {ctaLabel}
            <ArrowLeft className={dir === "rtl" ? "h-5 w-5" : "h-5 w-5 rotate-180"} />
          </Link>
        </Button>
      </div>
    </section>
  );
};