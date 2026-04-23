// الصفحة الرئيسية — تجمع كل أقسام الواجهة
import { HeroSlider } from "@/components/home/HeroSlider";
import { StatsCounters } from "@/components/home/StatsCounters";
import { AboutPreview } from "@/components/home/AboutPreview";
import { ProgramsGrid } from "@/components/home/ProgramsGrid";
import { NewsPreview } from "@/components/home/NewsPreview";
import { PartnersCarousel } from "@/components/home/PartnersCarousel";
import { VolunteerCta } from "@/components/home/VolunteerCta";
import { PageFeedback } from "@/components/layout/PageFeedback";

const Index = () => (
  <>
    <HeroSlider />
    <StatsCounters />
    <AboutPreview />
    <ProgramsGrid />
    <NewsPreview />
    <PartnersCarousel />
    <VolunteerCta />
    <PageFeedback pageKey="home" />
  </>
);

export default Index;
