// الصفحة الرئيسية — تجمع كل الأقسام مع التحكم بإظهارها من لوحة التحكم
import { HeroSlider } from "@/components/home/HeroSlider";
import { StatsCounters } from "@/components/home/StatsCounters";
import { AboutPreview } from "@/components/home/AboutPreview";
import { ProgramsGrid } from "@/components/home/ProgramsGrid";
import { NewsPreview } from "@/components/home/NewsPreview";
import { PartnersCarousel } from "@/components/home/PartnersCarousel";
import { SatisfactionIndicators } from "@/components/home/SatisfactionIndicators";
import { VolunteerCta } from "@/components/home/VolunteerCta";
import { PageFeedback } from "@/components/layout/PageFeedback";
import { usePageContent, useCustomBlocks } from "@/hooks/usePublicContent";
import { SectionRenderer, type BlockSection } from "@/components/blocks/SectionRenderer";

// مفاتيح أقسام الصفحة الرئيسية النظامية الموجودة في DB (page_content)
const HOME_SECTIONS = [
  "hero", "stats", "about_preview", "programs",
  "satisfaction", "news", "partners", "volunteer_cta",
] as const;

const Index = () => {
  const { data, isLoading } = usePageContent("home");
  const { data: customBlocks } = useCustomBlocks("home");

  const present = new Set((data ?? []).map((s) => s.section_key));
  const has = (key: typeof HOME_SECTIONS[number]) => !isLoading && present.has(key);

  return (
    <>
      {has("hero") && <HeroSlider />}
      {has("stats") && <StatsCounters />}
      {has("about_preview") && <AboutPreview />}
      {has("programs") && <ProgramsGrid />}
      {has("satisfaction") && <SatisfactionIndicators />}
      {has("news") && <NewsPreview />}
      {has("partners") && <PartnersCarousel />}
      {has("volunteer_cta") && <VolunteerCta />}
      {(customBlocks ?? []).map((s) => (
        <SectionRenderer key={s.id} section={s as unknown as BlockSection} />
      ))}
      <PageFeedback pageKey="home" />
    </>
  );
};

export default Index;
