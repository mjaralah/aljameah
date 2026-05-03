import { Link } from "react-router-dom";
import { ArrowLeft, BarChart3, Star, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { getOverallSurveyMetrics } from "@/lib/surveyResults";
import { usePageContent } from "@/hooks/usePublicContent";

export const SatisfactionIndicators = () => {
  const { lang, dir } = useLanguage();
  const metrics = getOverallSurveyMetrics();
  const { data } = usePageContent("home");
  const sec = data?.find((s) => s.section_key === "satisfaction");
  const title = sec?.title || (lang === "ar" ? "مؤشرات رضا المستفيدين" : "Beneficiary Satisfaction Indicators");
  const eyebrow = lang === "ar" ? "صوت المستفيدين" : "Beneficiary voice";
  const ctaLabel = sec?.data?.cta_label || (lang === "ar" ? "عرض نتائج الاستبيانات" : "View survey results");
  const ctaUrl = sec?.data?.cta_url || "/surveys";

  return (
    <section className="py-16 md:py-20 bg-muted/35">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
          <div>
            <p className="text-sm font-bold text-accent mb-2">{eyebrow}</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary">{title}</h2>
          </div>
          <Button asChild className="bg-primary text-primary-foreground min-h-11">
            <Link to={ctaUrl}>
              {ctaLabel}
              <ArrowLeft className={dir === "rtl" ? "h-4 w-4" : "h-4 w-4 rotate-180"} />
            </Link>
          </Button>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 md:gap-5">
          <Indicator Icon={Star} label={lang === "ar" ? "متوسط الرضا" : "Overall satisfaction"} value={`${metrics.averageRating.toFixed(1)} / 5`} suffix="⭐" />
          <Indicator Icon={BarChart3} label={lang === "ar" ? "نسبة الرضا" : "Satisfaction %"} value={`${metrics.satisfaction}%`} />
          <Indicator Icon={Users} label={lang === "ar" ? "إجمالي المشاركين" : "Total participants"} value={metrics.participants.toLocaleString()} />
        </div>
      </div>
    </section>
  );
};

const Indicator = ({ Icon, label, value, suffix }: { Icon: React.FC<{ className?: string }>; label: string; value: string; suffix?: string }) => (
  <Card className="p-6 shadow-soft border-border bg-card/95">
    <div className="h-12 w-12 rounded-2xl bg-accent/15 text-accent grid place-items-center mb-5"><Icon className="h-6 w-6" /></div>
    <p className="text-sm font-bold text-muted-foreground mb-2">{label}</p>
    <p className="text-3xl font-extrabold text-primary tabular-nums">{value} {suffix}</p>
  </Card>
);