import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import type { PartnerItem } from "./types";

export const PartnersCoverflow = ({ items }: { items: PartnerItem[] }) => (
  <Swiper
    modules={[Autoplay, EffectCoverflow]}
    effect="coverflow"
    grabCursor
    centeredSlides
    loop={items.length > 3}
    autoplay={{ delay: 2500, disableOnInteraction: false }}
    slidesPerView="auto"
    coverflowEffect={{ rotate: 30, stretch: 0, depth: 120, modifier: 1, slideShadows: false }}
    className="!py-6"
  >
    {items.map((p) => (
      <SwiperSlide key={p.id} className="!w-56">
        <a
          href={p.url || "#"}
          target={p.url ? "_blank" : undefined}
          rel={p.url ? "noopener noreferrer" : undefined}
          className="block h-32 rounded-2xl border border-border bg-card grid place-items-center text-primary font-bold px-4 text-center shadow-soft hover:border-accent/40 transition-smooth"
        >
          {p.logo ? (
            <img src={p.logo} alt={p.name} className="max-h-20 max-w-full object-contain" loading="lazy" />
          ) : (
            <span>{p.name}</span>
          )}
        </a>
      </SwiperSlide>
    ))}
  </Swiper>
);
