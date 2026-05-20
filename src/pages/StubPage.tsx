// صفحة بديلة — تعرض المحتوى من قاعدة البيانات للصفحات القانونية إن وُجد
import { Link, useLocation } from "react-router-dom";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/Breadcrumb";
import { PageFeedback } from "@/components/layout/PageFeedback";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLegalPage } from "@/hooks/usePublicContent";
import { SafeHtml } from "@/components/SafeHtml";

const LEGAL_SLUGS = ["privacy-policy", "terms-of-use", "cookie-policy", "accessibility-statement"];

export const StubPage = ({ titleKey, pageKey }: { titleKey: string; pageKey: string }) => {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\//, "");
  const isLegal = LEGAL_SLUGS.includes(slug);
  const { data: legal } = useLegalPage(isLegal ? slug : "");

  if (isLegal && legal) {
    return (
      <>
        <Breadcrumbs items={[{ label: legal.title }]} />
        <section className="container py-12 md:py-16 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-6">{legal.title}</h1>
          {/<[a-z][\s\S]*>/i.test(legal.content ?? "")
            ? <SafeHtml html={legal.content ?? ""} className="prose-sm md:prose-base text-foreground/90" />
            : <div className="prose prose-sm md:prose-base max-w-none whitespace-pre-wrap leading-loose text-foreground/90">{legal.content}</div>}
        </section>
        <PageFeedback pageKey={pageKey} />
      </>
    );
  }

  return (
    <>
      <Breadcrumbs items={[{ label: titleKey }]} />
      <section className="container py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center bg-card border border-border rounded-3xl p-10 shadow-soft">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-primary text-primary-foreground grid place-items-center mb-6">
            <Construction className="h-10 w-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-3">{titleKey}</h1>
          <p className="text-muted-foreground mb-7 leading-relaxed">{t.stub.coming}</p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link to="/">{t.stub.backHome}</Link>
          </Button>
        </div>
      </section>
      <PageFeedback pageKey={pageKey} />
    </>
  );
};

export default StubPage;
