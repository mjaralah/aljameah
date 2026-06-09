import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Search, Newspaper, Camera, ChevronLeft, ChevronRight, Youtube, Play, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

type PhotoItem = { image_url: string; caption: string };
type VideoItem = { id: string; url: string; title: string; description: string };

const ytId = (url: string) => {
  if (!url) return "";
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : "";
};

const Media = () => {
  const { t, lang, dir } = useLanguage();
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const { data: dbNews } = useNews();
  const { data: pageSections } = usePageContent("media");
  const { data: gallerySections } = usePageContent("gallery");
  const intro = (pageSections ?? []).find((s) => s.section_key === "intro");
  const sectionsBlock = (pageSections ?? []).find((s) => s.section_key === "sections");
  const sectionItems: Array<{ title?: string; description?: string; image_url?: string; url?: string }> =
    Array.isArray((sectionsBlock?.data as any)?.items) ? (sectionsBlock!.data as any).items : [];

  // ===== استخراج عناصر المعرض =====
  const photoItems: PhotoItem[] = useMemo(() => {
    const out: PhotoItem[] = [];
    (gallerySections ?? []).forEach((s: any) => {
      if (s?.data?.block_type !== "gallery") return;
      const its = Array.isArray(s.data.items) ? s.data.items : [];
      its.forEach((it: any) => {
        if (!it?.image_url) return;
        out.push({
          image_url: it.image_url,
          caption: lang === "ar" ? (it.caption_ar || it.caption_en || "") : (it.caption_en || it.caption_ar || ""),
        });
      });
    });
    return out;
  }, [gallerySections, lang]);

  const videoItems: VideoItem[] = useMemo(() => {
    const out: VideoItem[] = [];
    (gallerySections ?? []).forEach((s: any) => {
      if (s?.data?.block_type !== "video_gallery") return;
      const its = Array.isArray(s.data.items) ? s.data.items : [];
      its.forEach((it: any) => {
        const id = ytId(it?.video_url ?? "");
        if (!id) return;
        out.push({
          id,
          url: it.video_url,
          title: lang === "ar" ? (it.title_ar || it.title_en || "") : (it.title_en || it.title_ar || ""),
          description: lang === "ar" ? (it.description_ar || it.description_en || "") : (it.description_en || it.description_ar || ""),
        });
      });
    });
    return out;
  }, [gallerySections, lang]);

  const hasPhotos = photoItems.length > 0;
  const hasVideos = videoItems.length > 0;
  const hasGallery = hasPhotos || hasVideos;

  // ===== التبديل بين الأخبار / المعرض =====
  const [view, setView] = useState<"news" | "gallery">("news");
  const [galleryTab, setGalleryTab] = useState<string>("photos");
  useEffect(() => {
    if (!hasPhotos && hasVideos) setGalleryTab("videos");
  }, [hasPhotos, hasVideos]);

  // قراءة hash من URL لاختيار العرض
  useEffect(() => {
    const apply = () => {
      const h = window.location.hash.replace("#", "");
      if (h === "gallery" && hasGallery) setView("gallery");
      else if (h === "news") setView("news");
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [hasGallery]);

  // ===== Lightbox للصور =====
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const openLightbox = (i: number) => setLightboxIdx(i);
  const closeLightbox = () => setLightboxIdx(null);
  const prevImg = () => setLightboxIdx((i) => (i === null ? null : (i - 1 + photoItems.length) % photoItems.length));
  const nextImg = () => setLightboxIdx((i) => (i === null ? null : (i + 1) % photoItems.length));

  // ===== مشغّل الفيديو =====
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);

  // ===== الأخبار =====
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

  const onPickView = (v: "news" | "gallery") => {
    setView(v);
    // تحديث الـ hash بدون قفزة
    history.replaceState(null, "", `#${v}`);
  };

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
              const Icon = isGallery ? Camera : Newspaper;
              const target: "news" | "gallery" = isGallery ? "gallery" : "news";
              const active = view === target;
              const disabled = isGallery && !hasGallery;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => !disabled && onPickView(target)}
                  aria-pressed={active}
                  aria-label={it.title}
                  disabled={disabled}
                  className={cn(
                    "group relative flex items-center gap-5 p-5 lg:p-6 rounded-2xl border-2 bg-card transition-all duration-300 text-start w-full",
                    !disabled && "hover:-translate-y-1",
                    active
                      ? "border-primary shadow-lg shadow-primary/5"
                      : "border-border shadow-sm hover:border-accent/40 hover:shadow-lg",
                    disabled && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-2xl bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" aria-hidden="true" />
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
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== قسم العرض (الأخبار أو المعرض) ===== */}
      <section className="container py-12 md:py-16">
        {view === "news" && (
          <>
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
          </>
        )}

        {view === "gallery" && hasGallery && (
          <>
            <Tabs value={galleryTab} onValueChange={setGalleryTab} className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="h-12 p-1 bg-muted/50">
                  {hasPhotos && (
                    <TabsTrigger value="photos" className="gap-2 px-5 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Camera className="w-4 h-4" />
                      {lang === "ar" ? "الصور" : "Photos"}
                      <span className="ms-1 text-xs opacity-70">({photoItems.length})</span>
                    </TabsTrigger>
                  )}
                  {hasVideos && (
                    <TabsTrigger value="videos" className="gap-2 px-5 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Youtube className="w-4 h-4" />
                      {lang === "ar" ? "الفيديوهات" : "Videos"}
                      <span className="ms-1 text-xs opacity-70">({videoItems.length})</span>
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              {hasPhotos && (
                <TabsContent value="photos">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {photoItems.map((p, idx) => (
                      <Card
                        key={idx}
                        onClick={() => openLightbox(idx)}
                        className="overflow-hidden group cursor-pointer hover:shadow-card transition-smooth border-border hover:-translate-y-1 flex flex-col"
                      >
                        <div className="aspect-[16/10] overflow-hidden bg-muted relative">
                          <img
                            src={p.image_url}
                            alt={p.caption || (lang === "ar" ? "صورة من المعرض" : "Gallery image")}
                            loading="lazy"
                            className="h-full w-full object-cover group-hover:scale-105 transition-smooth"
                          />
                        </div>
                        {p.caption && (
                          <div className="p-4">
                            <p className="text-sm text-foreground line-clamp-2">{p.caption}</p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              )}

              {hasVideos && (
                <TabsContent value="videos">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videoItems.map((v, idx) => (
                      <Card
                        key={idx}
                        onClick={() => setPlayingVideo(v)}
                        className="overflow-hidden group cursor-pointer hover:shadow-card transition-smooth border-border hover:-translate-y-1 flex flex-col"
                      >
                        <div className="aspect-[16/10] overflow-hidden bg-muted relative">
                          <img
                            src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                            alt={v.title || "YouTube video"}
                            loading="lazy"
                            className="h-full w-full object-cover group-hover:scale-105 transition-smooth"
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="w-6 h-6 ms-0.5" fill="currentColor" />
                            </span>
                          </div>
                          <Badge className="absolute top-3 start-3 bg-accent text-accent-foreground border-0 font-bold shadow-gold">
                            <Youtube className="w-3.5 h-3.5 me-1" />
                            {lang === "ar" ? "فيديو" : "Video"}
                          </Badge>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          {v.title && <h3 className="font-bold text-primary mb-2 line-clamp-2">{v.title}</h3>}
                          {v.description && <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{v.description}</p>}
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </>
        )}

        {view === "gallery" && !hasGallery && (
          <p className="text-center text-muted-foreground py-16">
            {lang === "ar" ? "لا يوجد محتوى في المعرض حالياً." : "No gallery content yet."}
          </p>
        )}
      </section>

      {/* ===== Lightbox للصور ===== */}
      <Dialog open={lightboxIdx !== null} onOpenChange={(o) => !o && closeLightbox()}>
        <DialogContent className="max-w-5xl p-0 bg-black/95 border-0">
          {lightboxIdx !== null && photoItems[lightboxIdx] && (
            <div className="relative">
              <button
                onClick={closeLightbox}
                aria-label="إغلاق"
                className="absolute top-3 end-3 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
              {photoItems.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    aria-label="السابق"
                    className="absolute top-1/2 -translate-y-1/2 start-3 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                  >
                    <ChevronRight className={cn("w-6 h-6", dir === "ltr" && "rotate-180")} />
                  </button>
                  <button
                    onClick={nextImg}
                    aria-label="التالي"
                    className="absolute top-1/2 -translate-y-1/2 end-3 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                  >
                    <ChevronLeft className={cn("w-6 h-6", dir === "ltr" && "rotate-180")} />
                  </button>
                </>
              )}
              <img
                src={photoItems[lightboxIdx].image_url}
                alt={photoItems[lightboxIdx].caption || ""}
                className="w-full max-h-[85vh] object-contain"
              />
              {photoItems[lightboxIdx].caption && (
                <p className="text-center text-white/90 text-sm py-3 px-4">{photoItems[lightboxIdx].caption}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== مشغّل فيديو ===== */}
      <Dialog open={!!playingVideo} onOpenChange={(o) => !o && setPlayingVideo(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black border-0 overflow-hidden">
          {playingVideo && (
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${playingVideo.id}?autoplay=1&rel=0`}
                title={playingVideo.title || "YouTube video"}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

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
