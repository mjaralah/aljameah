import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useLanguage } from "@/contexts/LanguageContext";
import { partners as fallbackPartners } from "@/data";
import { usePartners } from "@/hooks/usePublicContent";

export const PartnersCarousel = () => {
  const { t, tx } = useLanguage();
  const { data: dbPartners } = usePartners();

  const items = dbPartners && dbPartners.length > 0
    ? dbPartners.map((p) => ({ id: p.id, name: p.name, logo: p.logo_url, url: p.website_url }))
    : fallbackPartners.map((p) => ({ id: p.id, name: tx(p.name), logo: undefined, url: undefined }));

  return (
    <section className="bg-muted/40 py-14" aria-label="partners">
      <div className="container text-center mb-8">
        <span className="text-accent font-bold text-sm uppercase tracking-wider">{t.partners.title}</span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-primary mt-2">{t.partners.subtitle}</h2>
      </div>
      <div className="container">
        <Swiper
          modules={[Autoplay]}
          loop={items.length > 2}
          autoplay={{ delay: 2200, disableOnInteraction: false }}
          slidesPerView={2}
          spaceBetween={24}
          breakpoints={{ 640: { slidesPerView: 3 }, 1024: { slidesPerView: 5 } }}
        >
          {[...items, ...items].map((p, i) => (
            <SwiperSlide key={`${p.id}-${i}`}>
              <a
                href={p.url || "#"}
                target={p.url ? "_blank" : undefined}
                rel={p.url ? "noopener noreferrer" : undefined}
                className="block h-24 rounded-xl border border-border bg-card grid place-items-center text-primary font-bold px-4 text-center hover:border-accent/40 hover:shadow-soft transition-smooth"
              >
                {p.logo ? (
                  <img src={p.logo} alt={p.name} className="max-h-14 max-w-full object-contain" loading="lazy" />
                ) : (
                  <span>{p.name}</span>
                )}
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};
