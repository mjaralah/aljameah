// عرض الأقسام المخصّصة لصفحة "من نحن" — 7 أنواع
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { icons as LucideIcons, Sparkles, ArrowLeft, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { AssemblyMembersView } from "@/components/about/sections/AssemblyMembersView";
import type { AssemblyData } from "@/lib/assemblyExport";

type ItemAny = Record<string, any>;
type CustomData = {
  type: "timeline" | "impact" | "testimonials" | "accreditations" | "faq" | "gallery" | "cta" | "assembly_members";
  title_ar?: string;
  title_en?: string;
  subtitle_ar?: string;
  subtitle_en?: string;
  items?: ItemAny[];
  cta_label_ar?: string;
  cta_label_en?: string;
  cta_url?: string;
};

export function CustomAboutSection({ id, data }: { id: string; data: CustomData }) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const pick = (a?: string, b?: string) => (isAr ? a || b || "" : b || a || "");

  const title = pick(data.title_ar, data.title_en);
  const subtitle = pick(data.subtitle_ar, data.subtitle_en);

  return (
    <article id={id} className="scroll-mt-24">
      {(title || subtitle) && (
        <header className="mb-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-11 w-11 rounded-xl bg-gradient-primary text-primary-foreground grid place-items-center shadow-soft">
              <Sparkles className="h-5 w-5" />
            </div>
            {title && <h2 className="text-2xl md:text-3xl font-extrabold text-primary">{title}</h2>}
          </div>
          {subtitle && <p className="text-muted-foreground leading-relaxed">{subtitle}</p>}
        </header>
      )}

      {data.type === "timeline" && <TimelineView items={data.items ?? []} pick={pick} />}
      {data.type === "impact" && <ImpactView items={data.items ?? []} pick={pick} />}
      {data.type === "testimonials" && <TestimonialsView items={data.items ?? []} pick={pick} />}
      {data.type === "accreditations" && <AccreditationsView items={data.items ?? []} pick={pick} />}
      {data.type === "faq" && <FaqView items={data.items ?? []} pick={pick} />}
      {data.type === "gallery" && <GalleryView items={data.items ?? []} pick={pick} />}
      {data.type === "cta" && (
        <CtaView
          label={pick(data.cta_label_ar, data.cta_label_en)}
          url={data.cta_url ?? "#"}
          title={title}
          subtitle={subtitle}
        />
      )}
      {data.type === "assembly_members" && (
        <AssemblyMembersView data={data as unknown as AssemblyData} />
      )}
    </article>
  );
}

type Pick = (a?: string, b?: string) => string;

function TimelineView({ items, pick }: { items: ItemAny[]; pick: Pick }) {
  if (!items.length) return null;
  return (
    <ol className="relative border-s-2 border-accent/40 pr-6 space-y-6">
      {items.map((it, i) => (
        <li key={i} className="relative">
          <span className="absolute -right-[34px] top-1 h-6 w-6 rounded-full bg-gradient-gold text-accent-foreground grid place-items-center text-[10px] font-bold shadow-gold">
            {i + 1}
          </span>
          <div className="bg-card border border-border rounded-xl p-5 hover:shadow-soft transition-smooth">
            {it.year && (
              <div className="text-accent font-bold text-sm mb-1">{it.year}</div>
            )}
            <h4 className="font-bold text-primary mb-1">{pick(it.title_ar, it.title_en)}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{pick(it.desc_ar, it.desc_en)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function ImpactView({ items, pick }: { items: ItemAny[]; pick: Pick }) {
  if (!items.length) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((it, i) => {
        const Icon = (LucideIcons as any)[it.icon] ?? Sparkles;
        return (
          <div key={i} className="bg-card border border-border rounded-xl p-5 text-center hover:shadow-card hover:-translate-y-1 transition-smooth">
            <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-primary text-primary-foreground grid place-items-center mb-3">
              <Icon className="h-6 w-6" />
            </div>
            <div className="text-3xl font-extrabold text-accent mb-1">{it.value}</div>
            <div className="text-sm text-muted-foreground">{pick(it.label_ar, it.label_en)}</div>
          </div>
        );
      })}
    </div>
  );
}

function TestimonialsView({ items, pick }: { items: ItemAny[]; pick: Pick }) {
  if (!items.length) return null;
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map((it, i) => (
        <Card key={i} className="p-6 hover:shadow-card transition-smooth">
          <Quote className="h-7 w-7 text-accent/60 mb-3" />
          <p className="text-foreground/90 leading-relaxed mb-4">"{pick(it.quote_ar, it.quote_en)}"</p>
          <div className="flex items-center gap-3 pt-3 border-t">
            {it.photo_url && (
              <img src={it.photo_url} alt={pick(it.name_ar, it.name_en)} className="h-12 w-12 rounded-full object-cover" loading="lazy" />
            )}
            <div>
              <div className="font-bold text-primary">{pick(it.name_ar, it.name_en)}</div>
              <div className="text-xs text-muted-foreground">{pick(it.role_ar, it.role_en)}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function AccreditationsView({ items, pick }: { items: ItemAny[]; pick: Pick }) {
  if (!items.length) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((it, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-5 text-center hover:shadow-soft transition-smooth">
          {it.logo_url ? (
            <img src={it.logo_url} alt={pick(it.name_ar, it.name_en)} className="h-16 mx-auto mb-3 object-contain" loading="lazy" />
          ) : (
            <div className="h-16 mx-auto mb-3 grid place-items-center text-muted-foreground">
              <Sparkles className="h-6 w-6" />
            </div>
          )}
          <div className="font-bold text-primary text-sm">{pick(it.name_ar, it.name_en)}</div>
          {it.year && <div className="text-xs text-muted-foreground mt-1">{it.year}</div>}
        </div>
      ))}
    </div>
  );
}

function FaqView({ items, pick }: { items: ItemAny[]; pick: Pick }) {
  if (!items.length) return null;
  return (
    <Accordion type="single" collapsible className="bg-card border border-border rounded-xl px-4">
      {items.map((it, i) => (
        <AccordionItem key={i} value={`q-${i}`}>
          <AccordionTrigger className="text-start font-bold text-primary">
            {pick(it.q_ar, it.q_en)}
          </AccordionTrigger>
          <AccordionContent className="text-foreground/90 leading-relaxed">
            {pick(it.a_ar, it.a_en)}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function GalleryView({ items, pick }: { items: ItemAny[]; pick: Pick }) {
  const [active, setActive] = useState<string | null>(null);
  if (!items.length) return null;
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((it, i) =>
          it.image_url ? (
            <button
              key={i}
              type="button"
              onClick={() => setActive(it.image_url)}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
            >
              <img
                src={it.image_url}
                alt={pick(it.caption_ar, it.caption_en) || `image-${i}`}
                className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              {(it.caption_ar || it.caption_en) && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-2 text-start opacity-0 group-hover:opacity-100 transition-opacity">
                  {pick(it.caption_ar, it.caption_en)}
                </div>
              )}
            </button>
          ) : null,
        )}
      </div>
      {active && (
        <div
          className="fixed inset-0 z-50 bg-black/80 grid place-items-center p-4"
          onClick={() => setActive(null)}
        >
          <img src={active} alt="" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}
    </>
  );
}

function CtaView({ label, url, title, subtitle }: { label: string; url: string; title: string; subtitle: string }) {
  const isExternal = /^https?:\/\//.test(url);
  return (
    <div className="bg-gradient-primary text-primary-foreground rounded-2xl p-8 md:p-10 text-center shadow-card">
      {title && <h3 className="text-2xl md:text-3xl font-extrabold mb-2">{title}</h3>}
      {subtitle && <p className="opacity-90 mb-5 max-w-2xl mx-auto">{subtitle}</p>}
      {label && (
        <Button asChild size="lg" variant="secondary" className="font-bold">
          {isExternal ? (
            <a href={url} target="_blank" rel="noopener noreferrer">
              {label}
              <ArrowLeft className="h-4 w-4 mr-1" />
            </a>
          ) : (
            <Link to={url || "#"}>
              {label}
              <ArrowLeft className="h-4 w-4 mr-1" />
            </Link>
          )}
        </Button>
      )}
    </div>
  );
}
