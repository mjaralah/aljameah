import { useMemo, useState } from "react";
import * as Icons from "lucide-react";
import { ArrowLeft, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { programs as fallbackPrograms } from "@/data";
import { usePrograms, usePageContent } from "@/hooks/usePublicContent";
import { PageHero } from "@/components/layout/PageHero";
import { PageFeedback } from "@/components/layout/PageFeedback";
import { cn } from "@/lib/utils";
import type { Program } from "@/types";

const categories: Program["category"][] = ["education", "health", "relief", "social", "youth", "family"];

type ViewItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category?: Program["category"];
  beneficiaries: number;
  featured?: boolean;
  sponsorEnabled?: boolean;
  sponsorLabel?: string;
  sponsorUrl?: string;
  sponsorIcon?: string;
};

const Programs = () => {
  const { t, tx, dir, lang } = useLanguage();
  const [active, setActive] = useState<Program["category"] | "all">("all");
  const { data: dbPrograms } = usePrograms();
  const { data: pageSections } = usePageContent("programs");
  const intro = (pageSections ?? []).find((s) => s.section_key === "intro");

  const useDb = !!(dbPrograms && dbPrograms.length > 0);

  const items: ViewItem[] = useMemo(() => {
    if (useDb) {
      return dbPrograms!.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description ?? "",
        icon: p.icon || "Heart",
        beneficiaries: 0,
        featured: !!p.featured,
        sponsorEnabled: p.sponsor_button_enabled !== false,
        sponsorLabel: (lang === "en" ? p.sponsor_button_label_en : p.sponsor_button_label) || undefined,
        sponsorUrl: p.sponsor_button_url || undefined,
        sponsorIcon: p.sponsor_button_icon || "Heart",
      }));
    }
    return fallbackPrograms.map((p) => ({
      id: p.id,
      title: tx(p.title),
      description: tx(p.description),
      icon: p.icon,
      category: p.category,
      beneficiaries: p.beneficiaries,
    }));
  }, [useDb, dbPrograms, tx, lang]);

  const filtered = useMemo(() => {
    const base = active === "all" || useDb ? items : items.filter((p) => p.category === active);
    return [...base].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  }, [active, items, useDb]);
  const total = useMemo(() => items.reduce((s, p) => s + p.beneficiaries, 0), [items]);

  return (
    <>
      {intro && (
        <PageHero
          eyebrow={t.nav.programs}
          title={intro.title || t.pages.programsPage.heading}
          lead={intro.content || t.pages.programsPage.lead}
          breadcrumb={[{ label: intro.title || t.nav.programs }]}
        />
      )}

      <section className="container py-12 md:py-16">
        {/* شريط التصفية — يظهر فقط مع البيانات الثابتة (التي تحتوي على تصنيفات) */}
        {!useDb && (
          <div className="flex flex-wrap items-center gap-2 mb-8" role="tablist" aria-label="programs filter">
            <FilterChip active={active === "all"} onClick={() => setActive("all")}>
              {t.pages.programsPage.filterAll}
              <span className="text-xs opacity-70">({items.length})</span>
            </FilterChip>
            {categories.map((c) => {
              const count = items.filter((p) => p.category === c).length;
              return (
                <FilterChip key={c} active={active === c} onClick={() => setActive(c)}>
                  {t.pages.programsPage.categories[c]}
                  <span className="text-xs opacity-70">({count})</span>
                </FilterChip>
              );
            })}
            {total > 0 && (
              <div className="ms-auto text-sm text-muted-foreground hidden md:block">
                <span className="font-bold text-primary">{total.toLocaleString()}+</span> {t.stats.beneficiaries}
              </div>
            )}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">{t.pages.programsPage.empty}</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {filtered.map((p) => {
              const Icon =
                (Icons[p.icon as keyof typeof Icons] as React.FC<{ className?: string }>) || Icons.Heart;
              return (
                <Card
                  key={p.id}
                  className="p-6 group hover:shadow-card transition-smooth border-border hover:border-accent/40 hover:-translate-y-1 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-primary text-primary-foreground grid place-items-center shadow-soft group-hover:scale-110 transition-smooth">
                      <Icon className="h-7 w-7" />
                    </div>
                    {p.featured ? (
                      <Badge className="bg-accent text-accent-foreground border-0 font-bold shadow-gold">
                        ★ مميز
                      </Badge>
                    ) : p.category ? (
                      <Badge variant="secondary" className="bg-accent-soft text-accent border-0 font-bold">
                        {t.pages.programsPage.categories[p.category]}
                      </Badge>
                    ) : null}
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                    {p.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    {p.beneficiaries > 0 ? (
                      <span className="text-xs font-semibold text-accent">
                        {p.beneficiaries.toLocaleString()}+ {t.stats.beneficiaries}
                      </span>
                    ) : <span />}
                    {p.sponsorEnabled !== false && (() => {
                      const SponsorIcon =
                        (Icons[(p.sponsorIcon || "Heart") as keyof typeof Icons] as React.FC<{ className?: string; fill?: string }>) || Heart;
                      const label = p.sponsorLabel || t.pages.programsPage.sponsor;
                      const href = p.sponsorUrl || "#";
                      const external = /^https?:\/\//i.test(href);
                      return (
                        <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
                            <SponsorIcon className="h-3.5 w-3.5" fill="currentColor" />
                            {label}
                            <ArrowLeft className={dir === "rtl" ? "h-3.5 w-3.5" : "h-3.5 w-3.5 rotate-180"} />
                          </a>
                        </Button>
                      );
                    })()}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <PageFeedback pageKey="programs" />
    </>
  );
};

const FilterChip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    role="tab"
    aria-selected={active}
    className={cn(
      "px-4 py-2 rounded-full text-sm font-semibold border transition-smooth inline-flex items-center gap-1.5 min-h-[40px]",
      active
        ? "bg-primary text-primary-foreground border-primary shadow-soft"
        : "bg-card text-foreground border-border hover:border-primary/50 hover:text-primary",
    )}
  >
    {children}
  </button>
);

export default Programs;
