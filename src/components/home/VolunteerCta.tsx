import { HandHeart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageContent } from "@/hooks/usePublicContent";

export const VolunteerCta = () => {
  const { t } = useLanguage();
  const { data } = usePageContent("home");
  const sec = data?.find((s) => s.section_key === "volunteer_cta");
  const title = sec?.title || t.volunteerCta.title;
  const body = sec?.content || t.volunteerCta.body;
  const ctaLabel = sec?.data?.cta_label || t.volunteerCta.cta;
  const ctaUrl = sec?.data?.cta_url || "/e-services/volunteer";

  return (
    <section className="container py-12" aria-label="volunteer-cta">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-cta text-primary-foreground p-8 md:p-14 shadow-card">
        <div className="absolute -top-10 -end-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <div className="absolute -bottom-12 -start-12 h-56 w-56 rounded-full bg-accent/30 blur-3xl" aria-hidden />
        <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 text-xs font-bold mb-4">
              <HandHeart className="h-4 w-4" />
              {t.nav.volunteer}
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold mb-3 leading-tight">{title}</h2>
            <p className="text-base md:text-lg opacity-95 max-w-xl">{body}</p>
          </div>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-gold">
            <Link to={ctaUrl}>
              <HandHeart className="h-5 w-5" fill="currentColor" />
              {ctaLabel}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};