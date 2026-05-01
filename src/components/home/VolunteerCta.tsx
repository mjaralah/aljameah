import { HandHeart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export const VolunteerCta = () => {
  const { t } = useLanguage();
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
            <h2 className="text-2xl md:text-4xl font-extrabold mb-3 leading-tight">{t.volunteerCta.title}</h2>
            <p className="text-base md:text-lg opacity-95 max-w-xl">{t.volunteerCta.body}</p>
          </div>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-gold">
            <Link to="/e-services/volunteer">
              <HandHeart className="h-5 w-5" fill="currentColor" />
              {t.volunteerCta.cta}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};