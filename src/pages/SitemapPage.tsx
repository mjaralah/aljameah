// خريطة الموقع — تُولَّد تلقائياً من الأقسام الرئيسية وروابط التذييل
import { Link } from "react-router-dom";
import { Breadcrumbs } from "@/components/layout/Breadcrumb";
import { PageFeedback } from "@/components/layout/PageFeedback";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLegalPages } from "@/hooks/usePublicContent";
import { Map } from "lucide-react";

export default function SitemapPage() {
  const { t } = useLanguage();
  const { data: legal } = useLegalPages();

  const main = [
    { to: "/", label: t.nav.home },
    { to: "/about", label: t.nav.about },
    { to: "/programs", label: t.nav.programs },
    { to: "/governance", label: t.nav.governance },
    { to: "/media", label: t.nav.media },
    { to: "/e-services", label: t.nav.eservices },
    { to: "/surveys", label: t.nav.surveys },
    { to: "/contact", label: t.nav.contact },
  ];

  const utility = [
    { to: "/donate", label: t.nav.donate },
    { to: "/search", label: t.nav.search },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: t.footer.sitemap }]} />
      <section className="container py-12 md:py-16 max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-primary text-primary-foreground grid place-items-center">
            <Map className="h-6 w-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary">{t.footer.sitemap}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-bold text-primary mb-4">الأقسام الرئيسية</h2>
            <ul className="space-y-2">
              {main.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-foreground/80 hover:text-primary transition-smooth">
                    • {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-bold text-primary mb-4">روابط مفيدة</h2>
            <ul className="space-y-2">
              {utility.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-foreground/80 hover:text-primary transition-smooth">
                    • {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-bold text-primary mb-4">الصفحات القانونية</h2>
            <ul className="space-y-2">
              {(legal ?? []).map((p) => (
                <li key={p.id}>
                  <Link to={`/${p.slug}`} className="text-foreground/80 hover:text-primary transition-smooth">
                    • {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <PageFeedback pageKey="sitemap" />
    </>
  );
}
