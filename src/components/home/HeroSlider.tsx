import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { Heart, Sparkles } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import { useNavigate } from "react-router-dom";

// شرائح البطل الرئيسية
export const HeroSlider = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const slides = [
    { img: hero1, title: t.hero.slide1Title, sub: t.hero.slide1Sub },
    { img: hero2, title: t.hero.slide2Title, sub: t.hero.slide2Sub },
    { img: hero3, title: t.hero.slide3Title, sub: t.hero.slide3Sub },
  ];

  return (
    <section className="relative" aria-label="hero">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        loop
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className="hero-swiper [&_.swiper-pagination-bullet]:bg-white/70 [&_.swiper-pagination-bullet-active]:bg-accent [&_.swiper-pagination-bullet]:!w-3 [&_.swiper-pagination-bullet]:!h-3"
      >
        {slides.map((s, i) => (
          <SwiperSlide key={i}>
            <div className="relative h-[78vh] min-h-[520px] max-h-[780px] w-full overflow-hidden">
              <img src={s.img} alt="" className="absolute inset-0 h-full w-full object-cover" width={1600} height={900} />
              <div className="absolute inset-0 bg-gradient-hero" />
              <div className="relative h-full container flex items-center">
                <div className="max-w-2xl text-primary-foreground animate-fade-in">
                  <span className="inline-flex items-center gap-2 rounded-full bg-accent/95 text-accent-foreground px-3 py-1 text-xs font-bold mb-5 shadow-gold">
                    <Sparkles className="h-3.5 w-3.5" /> {/* وسم الهوية */}
                    {t.brand.tagline}
                  </span>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 drop-shadow">
                    {s.title}
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl opacity-95 mb-7 max-w-xl">{s.sub}</p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      size="lg"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-gold"
                      onClick={() => navigate("/donate")}
                    >
                      <Heart className="h-5 w-5" fill="currentColor" />
                      {t.hero.donateCta}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-white/10 backdrop-blur border-white/40 text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"
                      onClick={() => navigate("/programs")}
                    >
                      {t.hero.cta}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};