// صفحة بديلة للأقسام التي ستُبنى في المراحل اللاحقة
import { Link } from "react-router-dom";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/Breadcrumb";
import { PageFeedback } from "@/components/layout/PageFeedback";
import { useLanguage } from "@/contexts/LanguageContext";

export const StubPage = ({ titleKey, pageKey }: { titleKey: string; pageKey: string }) => {
  const { t } = useLanguage();
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