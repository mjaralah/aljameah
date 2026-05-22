// الصفحة الرئيسية — تجمع كل الأقسام مع التحكم بإظهارها وترتيبها من لوحة التحكم
import type { ComponentType } from "react";
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

// مفاتيح أقسام الصفحة الرئيسية النظامية وربطها بالمكونات
const SECTION_COMPONENTS: Record<string, ComponentType> = {
  hero: HeroSlider,
  stats: StatsCounters,
  about_preview: AboutPreview,
  programs: ProgramsGrid,
  satisfaction: SatisfactionIndicators,
  news: NewsPreview,
  partners: PartnersCarousel,
  volunteer_cta: VolunteerCta,
};

const Index = () => {
  const { data, isLoading } = usePageContent("home");
  const { data: customBlocks } = useCustomBlocks("home");

  // الترتيب يعتمد على sort_order القادم من قاعدة البيانات (مرتب مسبقاً في الـ hook)
  const orderedSections = (data ?? []).filter((s) => SECTION_COMPONENTS[s.section_key]);

  return (
    <>
      {!isLoading &&
        orderedSections.map((s) => {
          const Component = SECTION_COMPONENTS[s.section_key];
          return <Component key={s.id} />;
        })}
      {(customBlocks ?? []).map((s) => (
        <SectionRenderer key={s.id} section={s as unknown as BlockSection} />
      ))}
      <PageFeedback pageKey="home" />
    </>
  );
};

export default Index;
