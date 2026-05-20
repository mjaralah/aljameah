// عرض الكتل المخصّصة (Block Renderer) في الواجهة العامة — يدعم العربية والإنجليزية
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SafeHtml } from "@/components/SafeHtml";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import * as LucideIcons from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Link } from "react-router-dom";

export type BlockData = {
  block_type?: string;
  // bilingual fields
  title_ar?: string; title_en?: string;
  subtitle_ar?: string; subtitle_en?: string;
  content_ar?: string; content_en?: string;
  cta_label_ar?: string; cta_label_en?: string;
  cta_url?: string;
  secondary_cta_label_ar?: string; secondary_cta_label_en?: string;
  secondary_cta_url?: string;
  // media + layout
  image_url?: string;
  direction?: "image-right" | "image-left";
  columns?: 2 | 3 | 4;
  background?: "default" | "muted" | "primary";
  // generic items
  items?: any[];
  // video
  video_url?: string;
  // generic
  [key: string]: any;
};

export type BlockSection = {
  id: string;
  section_key: string;
  title: string | null;
  content: string | null;
  data: BlockData | null;
};

function Icon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null;
  const Cmp = (LucideIcons as any)[name];
  if (!Cmp) return null;
  return <Cmp className={className} />;
}

function bgClass(bg?: string) {
  if (bg === "muted") return "bg-muted/40";
  if (bg === "primary") return "bg-primary/5";
  return "";
}

function youtubeEmbed(url: string): string | null {
  // Accepts youtu.be/<id>, youtube.com/watch?v=<id>, /embed/<id>
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed${u.pathname}`;
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (u.pathname.startsWith("/embed/")) return url;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch { /* ignore */ }
  return null;
}

export function SectionRenderer({ section }: { section: BlockSection }) {
  const { lang } = useLanguage();
  const d = section.data ?? {};
  const pick = (a?: string, e?: string) => (lang === "en" ? (e || a || "") : (a || e || ""));
  const title = pick(d.title_ar, d.title_en) || section.title || "";
  const subtitle = pick(d.subtitle_ar, d.subtitle_en);
  const content = pick(d.content_ar, d.content_en) || section.content || "";
  const ctaLabel = pick(d.cta_label_ar, d.cta_label_en);
  const secCtaLabel = pick(d.secondary_cta_label_ar, d.secondary_cta_label_en);

  const SectionWrap = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <section className={`py-12 lg:py-16 ${bgClass(d.background)} ${className}`}>
      <div className="container">{children}</div>
    </section>
  );

  const SectionHeading = () =>
    title || subtitle ? (
      <div className="text-center mb-8 lg:mb-10">
        {title && <h2 className="text-2xl lg:text-3xl font-bold text-primary mb-2">{title}</h2>}
        {subtitle && <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
      </div>
    ) : null;

  const type = d.block_type || "rich_text";

  // ------------------ text_media ------------------
  if (type === "text_media") {
    const reverse = d.direction === "image-left";
    return (
      <SectionWrap>
        <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
          {d.image_url ? (
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <AspectRatio ratio={4 / 3}>
                <img src={d.image_url} alt={title} className="w-full h-full object-cover" loading="lazy" />
              </AspectRatio>
            </div>
          ) : <div />}
          <div>
            {title && <h2 className="text-2xl lg:text-3xl font-bold text-primary mb-4">{title}</h2>}
            {content && <SafeHtml html={content} className="text-base lg:text-lg" />}
            {ctaLabel && d.cta_url && (
              <Button asChild className="mt-6"><Link to={d.cta_url}>{ctaLabel}</Link></Button>
            )}
          </div>
        </div>
      </SectionWrap>
    );
  }

  // ------------------ cards_grid ------------------
  if (type === "cards_grid") {
    const cols = d.columns ?? 3;
    const gridCols = cols === 2 ? "md:grid-cols-2" : cols === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3";
    const items = Array.isArray(d.items) ? d.items : [];
    return (
      <SectionWrap>
        <SectionHeading />
        <div className={`grid grid-cols-1 ${gridCols} gap-5`}>
          {items.map((it: any, i: number) => {
            const t = pick(it.title_ar, it.title_en);
            const desc = pick(it.description_ar, it.description_en);
            const inner = (
              <Card className="h-full hover:shadow-md transition-smooth">
                <CardContent className="p-6 text-center space-y-3">
                  {it.icon && (
                    <div className="h-12 w-12 mx-auto rounded-xl bg-primary/10 text-primary grid place-items-center">
                      <Icon name={it.icon} className="h-6 w-6" />
                    </div>
                  )}
                  {t && <h3 className="font-bold text-lg text-foreground">{t}</h3>}
                  {desc && <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>}
                </CardContent>
              </Card>
            );
            return it.url ? (
              <Link key={i} to={it.url}>{inner}</Link>
            ) : <div key={i}>{inner}</div>;
          })}
        </div>
      </SectionWrap>
    );
  }

  // ------------------ stats ------------------
  if (type === "stats") {
    const items = Array.isArray(d.items) ? d.items : [];
    return (
      <SectionWrap className={d.background ? "" : "bg-primary/5"}>
        <SectionHeading />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((it: any, i: number) => {
            const label = pick(it.label_ar, it.label_en) || it.label || "";
            return (
              <div key={i} className="text-center space-y-2">
                {it.icon && (
                  <div className="h-12 w-12 mx-auto rounded-full bg-primary text-primary-foreground grid place-items-center">
                    <Icon name={it.icon} className="h-6 w-6" />
                  </div>
                )}
                <div className="text-3xl lg:text-4xl font-bold text-primary">
                  {it.value ?? 0}{it.suffix ?? ""}
                </div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            );
          })}
        </div>
      </SectionWrap>
    );
  }

  // ------------------ gallery ------------------
  if (type === "gallery") {
    const items = Array.isArray(d.items) ? d.items : [];
    return (
      <SectionWrap>
        <SectionHeading />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((it: any, i: number) => (
            <div key={i} className="rounded-lg overflow-hidden group relative">
              <AspectRatio ratio={1}>
                <img
                  src={it.image_url}
                  alt={pick(it.caption_ar, it.caption_en)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </AspectRatio>
              {(it.caption_ar || it.caption_en) && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent text-white p-2 text-xs">
                  {pick(it.caption_ar, it.caption_en)}
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionWrap>
    );
  }

  // ------------------ carousel ------------------
  if (type === "carousel") {
    const items = Array.isArray(d.items) ? d.items : [];
    return (
      <SectionWrap>
        <SectionHeading />
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          loop={items.length > 1}
          className="rounded-2xl overflow-hidden"
        >
          {items.map((it: any, i: number) => {
            const t = pick(it.title_ar, it.title_en);
            const desc = pick(it.description_ar, it.description_en);
            return (
              <SwiperSlide key={i}>
                <div className="relative">
                  {it.image_url && (
                    <AspectRatio ratio={16 / 7}>
                      <img src={it.image_url} alt={t} className="w-full h-full object-cover" />
                    </AspectRatio>
                  )}
                  {(t || desc) && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6 lg:p-10 text-white">
                      <div>
                        {t && <h3 className="text-xl lg:text-3xl font-bold mb-2">{t}</h3>}
                        {desc && <p className="text-sm lg:text-base max-w-2xl">{desc}</p>}
                        {it.url && <Button asChild className="mt-3"><Link to={it.url}>{lang === "en" ? "Learn more" : "اعرف المزيد"}</Link></Button>}
                      </div>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </SectionWrap>
    );
  }

  // ------------------ video ------------------
  if (type === "video") {
    const embed = d.video_url ? youtubeEmbed(d.video_url) : null;
    return (
      <SectionWrap>
        <SectionHeading />
        <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-lg">
          {embed ? (
            <AspectRatio ratio={16 / 9}>
              <iframe
                src={embed}
                title={title || "video"}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </AspectRatio>
          ) : d.video_url ? (
            <AspectRatio ratio={16 / 9}>
              <video src={d.video_url} controls poster={d.image_url} className="w-full h-full" />
            </AspectRatio>
          ) : null}
        </div>
      </SectionWrap>
    );
  }

  // ------------------ accordion ------------------
  if (type === "accordion") {
    const items = Array.isArray(d.items) ? d.items : [];
    return (
      <SectionWrap>
        <SectionHeading />
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible>
            {items.map((it: any, i: number) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-right font-semibold">
                  {pick(it.question_ar, it.question_en)}
                </AccordionTrigger>
                <AccordionContent>
                  <SafeHtml html={pick(it.answer_ar, it.answer_en)} className="text-base" />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </SectionWrap>
    );
  }

  // ------------------ cta_banner ------------------
  if (type === "cta_banner") {
    return (
      <section
        className="relative py-16 lg:py-20 bg-gradient-primary text-primary-foreground overflow-hidden"
        style={d.image_url ? { backgroundImage: `linear-gradient(hsla(var(--primary)/0.85),hsla(var(--primary)/0.85)),url(${d.image_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        <div className="container text-center max-w-3xl">
          {title && <h2 className="text-3xl lg:text-4xl font-bold mb-4">{title}</h2>}
          {content && <div className="text-base lg:text-lg opacity-90 mb-6"><SafeHtml html={content} className="prose-invert" /></div>}
          <div className="flex flex-wrap gap-3 justify-center">
            {ctaLabel && d.cta_url && (
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to={d.cta_url}>{ctaLabel}</Link>
              </Button>
            )}
            {secCtaLabel && d.secondary_cta_url && (
              <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link to={d.secondary_cta_url}>{secCtaLabel}</Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ------------------ rich_text (default) ------------------
  return (
    <SectionWrap>
      {title && <h2 className="text-2xl lg:text-3xl font-bold text-primary mb-4 text-center">{title}</h2>}
      {content && (
        <div className="max-w-3xl mx-auto">
          <SafeHtml html={content} />
        </div>
      )}
    </SectionWrap>
  );
}

export default SectionRenderer;
