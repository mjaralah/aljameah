import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useLanguage } from "@/contexts/LanguageContext";
import { partners } from "@/data";

export const PartnersCarousel = () => {
  const { t, tx } = useLanguage();
  return (
    <section className="bg-muted/40 py-14" aria-label="partners">
      <div className="container text-center mb-8">
        <span className="text-accent font-bold text-sm uppercase tracking-wider">{t.partners.title}</span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-primary mt-2">{t.partners.subtitle}</h2>
      </div>
      <div className="container">
        <Swiper
          modules={[Autoplay]}
          loop
          autoplay={{ delay: 2200, disableOnInteraction: false }}
          slidesPerView={2}
          spaceBetween={24}
          breakpoints={{ 640: { slidesPerView: 3 }, 1024: { slidesPerView: 5 } }}
        >
          {[...partners, ...partners].map((p, i) => (
            <SwiperSlide key={`${p.id}-${i}`}>
              <div className="h-24 rounded-xl border border-border bg-card grid place-items-center text-primary font-bold px-4 text-center hover:border-accent/40 hover:shadow-soft transition-smooth">
                {tx(p.name)}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};