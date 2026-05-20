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
import { usePageContent } from "@/hooks/usePublicContent";

const Index = () => {
  const { data, isLoading } = usePageContent("home");

  // الأقسام المنشورة فقط (RLS يُرجع المنشور فقط للعموم).
  // إذا لم تتوفر بيانات بعد أو لم تكن هناك صفوف في DB، نعرض كل شيء افتراضياً.
  const present = new Set((data ?? []).map((s) => s.section_key));
  const has = (key: string) => isLoading || !data || data.length === 0 || present.has(key);

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
      <PageFeedback pageKey="home" />
    </>
  );
};

export default Index;
