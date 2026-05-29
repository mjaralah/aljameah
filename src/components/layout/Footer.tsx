import { Link } from "react-router-dom";
import { Facebook, Heart, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone, Youtube } from "lucide-react";
import { XLogo } from "@/components/icons/XLogo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLegalPages, useSiteSettings } from "@/hooks/usePublicContent";
import { useFooterSections, useFooterLinks } from "@/hooks/useFooter";

// تذييل الموقع — أعمدته وروابطه ديناميكية من قاعدة البيانات
export const Footer = () => {
  const { t, lang } = useLanguage();
  const isEn = lang === "en";
  const { data: settings } = useSiteSettings();
  const { data: legalPages } = useLegalPages();
  const { data: sections = [] } = useFooterSections();
  const { data: dynLinks = [] } = useFooterLinks();

  const visibility = (settings as any)?.pages_visibility as Record<string, boolean> | undefined;
  const sitemapHidden = visibility && visibility.sitemap === false;
  const bottomHidden = visibility && visibility.footer_bottom === false;

  // قسم تعريف الجمعية: استخدام نصوص الإعدادات أو fallback من الترجمات
  // قسم تعريف الجمعية: footer_brand_* ← يقع على hedaer/site_name ← ثم الترجمات
  const brandName =
    (isEn ? (settings as any)?.footer_brand_name_en : (settings as any)?.footer_brand_name_ar) ||
    (isEn ? (settings as any)?.header_brand_name_en || (settings as any)?.site_name : (settings as any)?.site_name || (settings as any)?.header_brand_name_en) ||
    t.brand.name;
  const brandTagline =
    (isEn ? (settings as any)?.footer_brand_tagline_en : (settings as any)?.footer_brand_tagline_ar) ||
    (isEn ? (settings as any)?.header_tagline_en || (settings as any)?.header_tagline_ar : (settings as any)?.header_tagline_ar || (settings as any)?.header_tagline_en) ||
    t.brand.tagline;
  const brandAbout =
    (isEn ? (settings as any)?.footer_brand_about_en : (settings as any)?.footer_brand_about_ar) || t.footer.aboutBody;

  const linksFor = (key: string) =>
    dynLinks
      .filter((l) => l.section_key === key)
      .map((l) => ({ to: l.url, label: (isEn && l.label_en) ? l.label_en : l.label_ar }));

  const defaultLegalLinks = [
    { to: "/privacy-policy", label: t.footer.privacy },
    { to: "/terms-of-use", label: t.footer.terms },
    { to: "/cookie-policy", label: t.footer.cookies },
    { to: "/accessibility-statement", label: t.footer.accessibility },
  ];

  const legalLinks = [
    ...((legalPages ?? []).map((p) => ({ to: `/${p.slug}`, label: p.title }))),
    ...linksFor("legal"),
    ...(sitemapHidden ? [] : [{ to: "/sitemap", label: t.footer.sitemap }]),
  ];

  function renderSection(sectionKey: string, dbTitle: { ar: string | null; en: string | null }) {
    const title = (isEn && dbTitle.en) ? dbTitle.en : (dbTitle.ar ?? "");

    if (sectionKey === "brand") {
      return (
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            {settings?.logo_url ? (
              <div className="h-14 w-14 rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                <img src={settings.logo_url} alt="" className="block h-full w-full object-contain" />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-xl bg-accent grid place-items-center shrink-0">
                <Heart className="h-5 w-5 text-accent-foreground" fill="currentColor" />
              </div>
            )}
            <div>
              <div className="font-bold">{brandName}</div>
              <div className="text-xs opacity-80">{brandTagline}</div>
            </div>
          </div>
          <p className="text-sm opacity-90 leading-relaxed whitespace-pre-line">{brandAbout}</p>
          <div className="mt-5">
            <div className="text-sm font-semibold mb-2">{t.footer.follow}</div>
            <div className="flex items-center gap-2">
              {(() => {
                const waDigits = (settings?.whatsapp_number ?? "").replace(/\D/g, "");
                const waHref = (settings?.whatsapp_enabled && waDigits)
                  ? `https://wa.me/${waDigits}${settings?.whatsapp_message ? `?text=${encodeURIComponent(settings.whatsapp_message)}` : ""}`
                  : null;
                const items = [
                  { Icon: XLogo, href: settings?.social_twitter },
                  { Icon: Instagram, href: settings?.social_instagram },
                  { Icon: Linkedin, href: settings?.social_linkedin },
                  { Icon: Youtube, href: settings?.social_youtube },
                  { Icon: MessageCircle, href: waHref },
                ] as { Icon: React.ComponentType<{ className?: string }>; href: string | null | undefined }[];
                const visible = items.filter((s) => !!s.href);
                if (visible.length === 0) {
                  return [XLogo, Facebook, Instagram, Youtube].map((Icon, i) => (
                    <a key={i} href="#" aria-label="social" className="h-9 w-9 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground grid place-items-center transition-smooth">
                      <Icon className="h-4 w-4" />
                    </a>
                  ));
                }
                return visible.map(({ Icon, href }, i) => (
                  <a key={i} href={href!} target="_blank" rel="noopener noreferrer" aria-label="social" className="h-9 w-9 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground grid place-items-center transition-smooth">
                    <Icon className="h-4 w-4" />
                  </a>
                ));
              })()}
            </div>
          </div>
        </div>
      );
    }

    if (sectionKey === "contact") {
      return (
        <div>
          <h3 className="font-bold mb-4 text-accent">{title || t.footer.contact}</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-accent shrink-0" /> {settings?.contact_address || t.footer.address}</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent shrink-0" /> <span dir="ltr">{settings?.contact_phone || "+966 11 000 0000"}</span></li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent shrink-0" /> {settings?.contact_email || "info@al-ataa.org"}</li>
          </ul>
        </div>
      );
    }

    const items = sectionKey === "legal" ? (legalLinks.length > 0 ? legalLinks : defaultLegalLinks) : linksFor(sectionKey);
    if (items.length === 0) return null;

    return (
      <div>
        <h3 className="font-bold mb-4 text-accent">{title}</h3>
        <ul className="space-y-2 text-sm">
          {items.map((l, i) => (
            <li key={`${l.to}-${i}`}>
              {l.to.startsWith("http") ? (
                <a href={l.to} target="_blank" rel="noopener noreferrer" className="opacity-90 hover:opacity-100 hover:text-accent transition-smooth">{l.label}</a>
              ) : (
                <Link to={l.to} className="opacity-90 hover:opacity-100 hover:text-accent transition-smooth">{l.label}</Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      <div className="container py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-6">
        {sections.filter((s) => s.published).map((s) => (
          <div key={s.id} className="contents">
            {renderSection(s.section_key, { ar: s.title_ar, en: s.title_en })}
          </div>
        ))}
      </div>

      {!bottomHidden && (
        <div className="border-t border-primary-foreground/15">
          <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-90">
            <div>© {new Date().getFullYear()} {brandName} — {t.footer.rights}</div>
            <div>{t.brand.registration}: <span className="font-semibold">{t.brand.regNumber}</span></div>
          </div>
        </div>
      )}

      {/* شريط حقوق المطوّر — يظهر في جميع صفحات الموقع */}
      <div className="bg-gradient-primary border-t border-primary-foreground/20">
        <div className="container py-3 flex items-center justify-center text-center">
          <p className="text-sm font-medium tracking-wide">
            <span className="text-primary-foreground/90">طور بإبداع: </span>
            <a
              href="#"
              className="text-accent font-bold hover:text-accent/80 transition-smooth hover:underline underline-offset-4"
            >
              Business Trip
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
