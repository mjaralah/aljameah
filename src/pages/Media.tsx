import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Search, Newspaper, Camera, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNews, usePageContent } from "@/hooks/usePublicContent";
import { PageHero } from "@/components/layout/PageHero";
import { PageFeedback } from "@/components/layout/PageFeedback";
import { cn } from "@/lib/utils";
import news1 from "@/assets/news-1.jpg";

type Item = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
};

const Media = () => {
  const { t, lang, dir } = useLanguage();
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const { data: dbNews } = useNews();
  const { data: pageSections } = usePageContent("media");
  const intro = (pageSections ?? []).find((s) => s.section_key === "intro");
  const sectionsBlock = (pageSections ?? []).find((s) => s.section_key === "sections");
  const sectionItems: Array<{ title?: string; description?: string; image_url?: string; url?: string }> =
    Array.isArray((sectionsBlock?.data as any)?.items) ? (sectionsBlock!.data as any).items : [];

  // عرض الأخبار المنشورة فقط من لوحة التحكم بدون الرجوع للبيانات التجريبية عند الإخفاء الكامل.
  const items: Item[] = useMemo(() => {
    return (dbNews ?? []).map((n) => ({
      id: n.id,
      slug: n.slug || n.id,
      title: n.title,
      excerpt: n.excerpt ?? "",
      image: n.cover_image_url || news1,
      date: n.published_at || n.created_at,
      category: n.category ?? "",
    }));
  }, [dbNews]);

  const cats = useMemo(() => {
    const set = new Set<string>();
    items.forEach((n) => n.category && set.add(n.category));
    return Array.from(set);
  }, [items]);

  const filtered = items.filter((n) => {
    const okCat = filter === "all" || n.category === filter;
    const okQ = !q || n.title.toLowerCase().includes(q.toLowerCase()) || n.excerpt.toLowerCase().includes(q.toLowerCase());
    return okCat && okQ;
  });

  return (
    <>
      {intro && (
        <PageHero
          eyebrow={t.nav.media}
          title={intro.title || t.pages.media.heading}
          lead={intro.content || t.pages.media.lead}
          breadcrumb={[{ label: intro.title || t.nav.media }]}
        />
      )}

      {sectionsBlock && sectionItems.length > 0 && (
        <section className="container pt-10 md:pt-14" aria-labelledby="media-sections-heading">
          <div className="flex flex-col items-center gap-2 mb-8">
            <h2 id="media-sections-heading" className="text-2xl lg:text-3xl font-bold text-primary">
              {sectionsBlock.title || (lang === "ar" ? "الأقسام" : "Sections")}
            </h2>
            <span className="w-12 h-1 rounded-full bg-accent" aria-hidden="true" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 max-w-4xl mx-auto">
            {sectionItems.map((it, i) => {
              const isGallery = i === 1 || /معرض|gallery/i.test(it.title || "");
              const Icon = isGallery ? ImageIcon : Newspaper;
              const href = it.url || (isGallery ? "#gallery" : "#news");
              const active = !isGallery; // إبراز الأخبار كقسم نشط في صفحة المركز الإعلامي
              return (
                <Link
                  key={i}
                  to={href}
                  aria-label={it.title}
                  className={cn(
                    "group relative flex items-center gap-5 p-5 lg:p-6 rounded-2xl border-2 bg-card transition-all duration-300 hover:-translate-y-1 text-start",
                    active
                      ? "border-primary shadow-lg shadow-primary/5"
                      : "border-border shadow-sm hover:border-accent/40 hover:shadow-lg",
                  )}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-2xl bg-gradient-to-l from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" aria-hidden="true" />
                  )}

                  <div
                    className={cn(
                      "relative flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 rounded-xl shrink-0 transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent",
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="w-7 h-7 lg:w-8 lg:h-8" strokeWidth={1.6} />
                  </div>

                  <div className="relative min-w-0 flex-1">
                    {it.title && (
                      <span
                        className={cn(
                          "block text-lg lg:text-xl font-bold truncate transition-colors",
                          active ? "text-primary" : "text-foreground group-hover:text-accent",
                        )}
                      >
                        {it.title}
                      </span>
                    )}
                    {it.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{it.description}</p>
                    )}
                  </div>

                  <span
                    className={cn(
                      "ms-auto shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-all",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "border border-accent text-accent opacity-0 group-hover:opacity-100",
                    )}
                    aria-hidden="true"
                  >
                    <ChevronLeft className={cn("w-4 h-4", dir === "ltr" && "rotate-180")} />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}



      <section className="container py-12 md:py-16">

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
                    alt={n.title}
                    loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-105 transition-smooth"
                  />
                  {n.category && (
                    <Badge className="absolute top-3 start-3 bg-accent text-accent-foreground border-0 font-bold shadow-gold">
                      {n.category}
                    </Badge>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(n.date).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </div>
                  <h3 className="font-bold text-primary mb-2 line-clamp-2">{n.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">{n.excerpt}</p>
                  <Link
                    to={`/media/${n.slug}`}
                    className="text-sm font-semibold text-accent hover:underline inline-flex items-center gap-1 self-start"
                  >
                    {t.pages.media.readArticle}
                    <ArrowLeft className={dir === "rtl" ? "h-3.5 w-3.5" : "h-3.5 w-3.5 rotate-180"} />
                  </Link>
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
