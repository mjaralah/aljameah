import * as Icons from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { programs as fallbackPrograms } from "@/data";
import { usePrograms, usePageContent } from "@/hooks/usePublicContent";

// شبكة البرامج — أيقونات ديناميكية من lucide
export const ProgramsGrid = () => {
  const { t, tx } = useLanguage();
  const { data: dbPrograms } = usePrograms();
  const { data: pageData } = usePageContent("home");
  const sec = pageData?.find((s) => s.section_key === "programs");
  const heading = sec?.title || t.programs.subtitle;
  const eyebrow = (sec?.data?.eyebrow as string | undefined) || t.programs.title;

  const items = dbPrograms && dbPrograms.length > 0
    ? dbPrograms.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description ?? "",
        icon: p.icon || "Heart",
        beneficiaries: 0,
      }))
    : fallbackPrograms.map((p) => ({
        id: p.id,
        title: tx(p.title),
        description: tx(p.description),
        icon: p.icon,
        beneficiaries: p.beneficiaries,
      }));

  return (
    <section className="bg-secondary/40 py-16 md:py-24" aria-label="programs">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-accent font-bold text-sm uppercase tracking-wider">{eyebrow}</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary mt-2 mb-3">{heading}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {items.map((p) => {
            const Icon = (Icons[p.icon as keyof typeof Icons] as React.FC<{ className?: string }>) || Icons.Heart;
            return (
              <Card key={p.id} className="p-6 group hover:shadow-card transition-smooth border-border hover:border-accent/40 hover:-translate-y-1">
                <div className="h-14 w-14 rounded-2xl bg-gradient-primary text-primary-foreground grid place-items-center mb-4 group-hover:scale-110 transition-smooth shadow-soft">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{p.description}</p>
                {p.beneficiaries > 0 && (
                  <p className="text-xs text-accent font-semibold">
                    {p.beneficiaries.toLocaleString()}+ {t.stats.beneficiaries}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
        <div className="text-center mt-10">
          <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <Link to="/programs">{t.programs.viewAll}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
