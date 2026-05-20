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

// مفاتيح أقسام الصفحة الرئيسية الموجودة في DB (page_content)
const HOME_SECTIONS = [
  "hero",
  "stats",
  "about_preview",
  "programs",
  "satisfaction",
  "news",
  "partners",
  "volunteer_cta",
] as const;

const Index = () => {
  const { data, isLoading } = usePageContent("home");

  // أثناء التحميل لا نُظهر شيئاً لتجنّب وميض الأقسام المخفية.
  // RLS يُرجع المنشور فقط للعموم؛ فإذا غاب القسم من النتائج يعني أنه مُخفى.
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
      <PageFeedback pageKey="home" />
    </>
  );
};

export default Index;
