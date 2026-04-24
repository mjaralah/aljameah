import { useMemo, useState } from "react";
import { ArrowLeft, Calendar, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { news } from "@/data";
import { PageHero } from "@/components/layout/PageHero";
import { PageFeedback } from "@/components/layout/PageFeedback";
import { cn } from "@/lib/utils";

const Media = () => {
  const { t, tx, lang, dir } = useLanguage();
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");

  const cats = useMemo(() => {
    const map = new Map<string, string>();
    news.forEach((n) => map.set(tx(n.category), tx(n.category)));
    return Array.from(map.keys());
  }, [tx]);

  const filtered = news.filter((n) => {
    const okCat = filter === "all" || tx(n.category) === filter;
    const okQ = !q || tx(n.title).toLowerCase().includes(q.toLowerCase()) || tx(n.excerpt).toLowerCase().includes(q.toLowerCase());
    return okCat && okQ;
  });

  return (
    <>
      <PageHero
        eyebrow={t.nav.media}
        title={t.pages.media.heading}
        lead={t.pages.media.lead}
        breadcrumb={[{ label: t.nav.media }]}
      />

      <section className="container py-12 md:py-16">
        {/* أدوات التحكم */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative md:w-80">
            <Search className="h-4 w-4 absolute top-1/2 -translate-y-1/2 start-3 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.notFound.searchPlaceholder}
              className="ps-10 h-11"
              aria-label={t.nav.search}
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>{t.pages.media.filterAll}</FilterChip>
            {cats.map((c) => (
              <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)}>{c}</FilterChip>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">{t.pages.media.empty}</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((n) => (
              <Card key={n.id} className="overflow-hidden group hover:shadow-card transition-smooth border-border hover:-translate-y-1 flex flex-col">
                <div className="aspect-[16/10] overflow-hidden bg-muted relative">
                  <img
                    src={n.image}
                    alt={tx(n.title)}
                    loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-105 transition-smooth"
                  />
                  <Badge className="absolute top-3 start-3 bg-accent text-accent-foreground border-0 font-bold shadow-gold">
                    {tx(n.category)}
                  </Badge>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(n.date).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </div>
                  <h3 className="font-bold text-primary mb-2 line-clamp-2">{tx(n.title)}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">{tx(n.excerpt)}</p>
                  <button className="text-sm font-semibold text-accent hover:underline inline-flex items-center gap-1 self-start">
                    {t.pages.media.readArticle}
                    <ArrowLeft className={dir === "rtl" ? "h-3.5 w-3.5" : "h-3.5 w-3.5 rotate-180"} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <PageFeedback pageKey="media" />
    </>
  );
};

const FilterChip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "px-4 py-2 rounded-full text-sm font-semibold border transition-smooth min-h-[40px]",
      active
        ? "bg-primary text-primary-foreground border-primary shadow-soft"
        : "bg-card text-foreground border-border hover:border-primary/50 hover:text-primary",
    )}
  >
    {children}
  </button>
);

export default Media;
