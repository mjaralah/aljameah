// صفحة المعرض العامة — تبويبان: صور وفيديوهات
import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageContent } from "@/hooks/usePublicContent";
import { PageHero } from "@/components/layout/PageHero";
import { PageFeedback } from "@/components/layout/PageFeedback";
import { SectionRenderer, type BlockSection } from "@/components/blocks/SectionRenderer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Camera, Youtube } from "lucide-react";

export default function Gallery() {
  const { t, lang } = useLanguage();
  const { data: sections } = usePageContent("gallery");

  const all = (sections ?? []) as any[];
  const intro = all.find((s) => s.section_key === "intro");
  const photoBlocks = useMemo(
    () => all.filter((s) => s?.data?.block_type === "gallery"),
    [all],
  );
  const videoBlocks = useMemo(
    () => all.filter((s) => s?.data?.block_type === "video_gallery"),
    [all],
  );
  const otherBlocks = useMemo(
    () => all.filter((s) =>
      s.section_key !== "intro" &&
      s?.data?.block_type &&
      s.data.block_type !== "gallery" &&
      s.data.block_type !== "video_gallery"
    ),
    [all],
  );

  const hasPhotos = photoBlocks.length > 0;
  const hasVideos = videoBlocks.length > 0;
  const [tab, setTab] = useState<string>(hasPhotos ? "photos" : "videos");

  const heading = intro?.title || (lang === "ar" ? "المعرض" : "Gallery");
  const lead = intro?.content || (lang === "ar" ? "صور ومقاطع من فعالياتنا وأنشطتنا." : "Photos and videos from our events.");

  return (
    <>
      <PageHero
        eyebrow={t.nav.media}
        title={heading}
        lead={lead}
        breadcrumb={[{ label: t.nav.media, to: "/media" }, { label: heading }]}
      />

      <section className="container py-10 md:py-14">
        {(hasPhotos || hasVideos) ? (
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="mx-auto mb-8 h-12 p-1 bg-muted/50">
              {hasPhotos && (
                <TabsTrigger value="photos" className="gap-2 px-5 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Camera className="w-4 h-4" />
                  {lang === "ar" ? "الصور" : "Photos"}
                </TabsTrigger>
              )}
              {hasVideos && (
                <TabsTrigger value="videos" className="gap-2 px-5 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Youtube className="w-4 h-4" />
                  {lang === "ar" ? "الفيديوهات" : "Videos"}
                </TabsTrigger>
              )}
            </TabsList>

            {hasPhotos && (
              <TabsContent value="photos" className="space-y-10">
                {photoBlocks.map((s) => (
                  <SectionRenderer key={s.id} section={s as BlockSection} />
                ))}
              </TabsContent>
            )}
            {hasVideos && (
              <TabsContent value="videos" className="space-y-10">
                {videoBlocks.map((s) => (
                  <SectionRenderer key={s.id} section={s as BlockSection} />
                ))}
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            {lang === "ar" ? "لا يوجد محتوى في المعرض حالياً." : "No gallery content yet."}
          </p>
        )}

        {otherBlocks.map((s) => (
          <SectionRenderer key={s.id} section={s as BlockSection} />
        ))}
      </section>

      <PageFeedback pageKey="gallery" />
    </>
  );
}
