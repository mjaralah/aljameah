// عرض صفحة مخصّصة بالـ slug — يجلب بيانات الصفحة + أقسامها (Blocks)
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { PageHero } from "@/components/layout/PageHero";
import { SectionRenderer, type BlockSection } from "@/components/blocks/SectionRenderer";
import { PageFeedback } from "@/components/layout/PageFeedback";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function CustomPage() {
  const { slug = "" } = useParams();
  const { lang } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ["public", "custom_page", slug],
    queryFn: async () => {
      const { data: page, error } = await supabase
        .from("custom_pages")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      if (!page) return { page: null, sections: [] as BlockSection[] };
      const { data: sections, error: e2 } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_key", `custom:${page.id}`)
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (e2) throw e2;
      return { page, sections: (sections ?? []) as unknown as BlockSection[] };
    },
  });

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
    );
  }

  if (!data?.page) {
    return (
      <section className="container py-24 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">الصفحة غير موجودة</h1>
        <Button asChild><Link to="/">العودة للرئيسية</Link></Button>
      </section>
    );
  }

  const p: any = data.page;
  const title = (lang === "en" ? p.title_en : null) || p.title;
  const ctaLabel = p.hero_cta_label;
  const ctaUrl = p.hero_cta_url;

  return (
    <>
      <PageHero
        title={title}
        lead={p.hero_subtitle ?? undefined}
        actions={ctaLabel && ctaUrl ? (
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to={ctaUrl}>{ctaLabel}</Link>
          </Button>
        ) : undefined}
      />
      {p.cover_image_url && (
        <div className="container -mt-10 mb-8 relative z-10">
          <img src={p.cover_image_url} alt="" className="w-full max-h-[420px] object-cover rounded-2xl shadow-xl" />
        </div>
      )}
      {data.sections.map((s) => (
        <SectionRenderer key={s.id} section={s} />
      ))}
      {/* إذا لم توجد أقسام، نعرض المحتوى الحر للصفحة إن وُجد */}
      {data.sections.length === 0 && (p.content || p.content_en) && (
        <section className="container py-10">
          <div className="prose prose-lg max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{ __html: (lang === "en" ? p.content_en : null) || p.content || "" }} />
        </section>
      )}
      <PageFeedback pageKey={`custom:${p.slug}`} />
    </>
  );
}
