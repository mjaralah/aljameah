import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useLanguage } from "@/contexts/LanguageContext";
import { partners as fallbackPartners } from "@/data";
import { usePartners, usePageContent } from "@/hooks/usePublicContent";
import { PartnersMarquee } from "./partners/PartnersMarquee";
import { PartnersGrid } from "./partners/PartnersGrid";
import { PartnersBento } from "./partners/PartnersBento";
import { PartnersCoverflow } from "./partners/PartnersCoverflow";
import type { PartnersDisplayStyle, PartnerItem } from "./partners/types";

const PartnerCard = ({ p }: { p: PartnerItem }) => (
  <a
    href={p.url || "#"}
    target={p.url ? "_blank" : undefined}
    rel={p.url ? "noopener noreferrer" : undefined}
    className="block h-24 w-full rounded-xl border border-border bg-card grid place-items-center text-primary font-bold px-4 text-center hover:border-accent/40 hover:shadow-soft transition-smooth"
  >
    {p.logo ? (
      <img src={p.logo} alt={p.name} className="max-h-14 max-w-full object-contain" loading="lazy" />
    ) : (
      <span>{p.name}</span>
    )}
  </a>
);

const DefaultSwiper = ({ items }: { items: PartnerItem[] }) => {
  // When there are few items, center them with flex instead of Swiper to avoid left alignment
  if (items.length < 5) {
    return (
      <div className="flex flex-wrap justify-center gap-6">
        {items.map((p) => (
          <div key={p.id} className="w-40 sm:w-44 md:w-48">
            <PartnerCard p={p} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <Swiper
      modules={[Autoplay]}
      loop
      autoplay={{ delay: 2200, disableOnInteraction: false }}
      slidesPerView={2}
      spaceBetween={24}
      breakpoints={{ 640: { slidesPerView: 3 }, 1024: { slidesPerView: 5 } }}
    >
      {items.map((p) => (
        <SwiperSlide key={p.id}>
          <PartnerCard p={p} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export const PartnersCarousel = () => {
  const { t, tx } = useLanguage();
  const { data: dbPartners } = usePartners();
  const { data: pageData } = usePageContent("home");
  const sec = pageData?.find((s) => s.section_key === "partners");
  const heading = sec?.title || t.partners.subtitle;
  const eyebrow = (sec?.data?.eyebrow as string | undefined) || t.partners.title;
  const style = ((sec?.data?.display_style as PartnersDisplayStyle) || "swiper");

  // Only show partners from the database (respects published flag)
  if (!dbPartners || dbPartners.length === 0) return null;

  const items: PartnerItem[] = dbPartners.map((p) => ({
    id: p.id,
    name: p.name,
    logo: p.logo_url,
    url: p.website_url,
  }));

  const renderBody = () => {
    switch (style) {
      case "marquee": return <PartnersMarquee items={items} />;
      case "grid": return <PartnersGrid items={items} />;
      case "bento": return <PartnersBento items={items} />;
      case "coverflow": return <PartnersCoverflow items={items} />;
      case "swiper":
      default: return <DefaultSwiper items={items} />;
    }
  };

  return (
    <section className="bg-muted/40 py-14" aria-label="partners">
      <div className="container text-center mb-8">
        <span className="text-accent font-bold text-sm uppercase tracking-wider">{eyebrow}</span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-primary mt-2">{heading}</h2>
      </div>
      <div className="container">{renderBody()}</div>
    </section>
  );
};
