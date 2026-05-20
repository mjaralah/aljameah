import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { news as fallbackNews } from "@/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/layout/PageHero";
import { PageFeedback } from "@/components/layout/PageFeedback";
import type { DBNews } from "@/hooks/usePublicContent";

const NewsDetail = () => {
  const { slug = "" } = useParams();
  const { t, tx, lang, dir } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ["public", "news", "detail", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("published", true)
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .maybeSingle();
      if (error) throw error;
      return data as DBNews | null;
    },
  });

  const fallback = fallbackNews.find((n) => n.id === slug);
  const article = data
    ? {
        title: data.title,
        excerpt: data.excerpt ?? "",
        content: data.content ?? "",
        image: data.cover_image_url ?? "",
        date: data.published_at || data.created_at,
        category: data.category ?? "",
      }
    : fallback
      ? {
          title: tx(fallback.title),
          excerpt: tx(fallback.excerpt),
          content: tx(fallback.body),
          image: fallback.image,
          date: fallback.date,
          category: tx(fallback.category),
        }
      : null;

  const BackIcon = dir === "rtl" ? ArrowRight : ArrowLeft;

  if (isLoading) {
    return (
      <section className="container py-24 text-center text-muted-foreground">
        {t.common?.loading ?? "..."}
      </section>
    );
  }

  if (!article) {
    return (
      <section className="container py-24 text-center">
        <h1 className="text-2xl font-bold text-primary mb-3">
          {lang === "ar" ? "الخبر غير موجود" : "Article not found"}
        </h1>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/media">
            <BackIcon className="h-4 w-4" />
            {lang === "ar" ? "العودة إلى المركز الإعلامي" : "Back to media center"}
          </Link>
        </Button>
      </section>
    );
  }

  return (
    <>
      <PageHero
        eyebrow={article.category || t.nav.media}
        title={article.title}
        breadcrumb={[
          { label: t.nav.media, href: "/media" },
          { label: article.title },
        ]}
      />

      <article className="container py-12 md:py-16 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6 text-primary font-semibold">
          <Link to="/media">
            <BackIcon className="h-4 w-4" />
            {lang === "ar" ? "العودة إلى الأخبار" : "Back to news"}
          </Link>
        </Button>

        {article.image && (
          <div className="rounded-2xl overflow-hidden border border-border bg-muted mb-8 aspect-[16/9]">
            <img
              src={article.image}
              alt={article.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {new Date(article.date).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {article.category && (
            <Badge className="bg-accent text-accent-foreground border-0 font-bold">
              {article.category}
            </Badge>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            {article.excerpt}
          </p>
        )}

        {article.content && (
          <div className="prose prose-lg max-w-none text-foreground leading-loose whitespace-pre-line">
            {article.content}
          </div>
        )}
      </article>

      <PageFeedback pageKey={`media/${slug}`} />
    </>
  );
};

export default NewsDetail;
