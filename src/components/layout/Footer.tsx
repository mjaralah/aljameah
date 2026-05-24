import { Link } from "react-router-dom";
import { Facebook, Heart, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone, Youtube } from "lucide-react";
import { XLogo } from "@/components/icons/XLogo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLegalPages, useSiteSettings } from "@/hooks/usePublicContent";

// تذييل الموقع الكامل
export const Footer = () => {
  const { t } = useLanguage();
  const { data: settings } = useSiteSettings();
  const { data: legalPages } = useLegalPages();

  const quick = [
    { to: "/about", label: t.nav.about },
    { to: "/programs", label: t.nav.programs },
    { to: "/governance", label: t.nav.governance },
    { to: "/media", label: t.nav.media },
    { to: "/surveys", label: t.nav.surveys },
  ];
  const eservices = [
    { to: "/e-services", label: t.nav.eservices },
    { to: "/e-services/volunteer", label: t.nav.eservicesVolunteer },
    { to: "/e-services/membership", label: t.nav.eservicesMembership },
  ];
  const visibility = (settings as any)?.pages_visibility as Record<string, boolean> | undefined;
  const isHidden = (key: string) => visibility && visibility[key] === false;
  const sitemapHidden = isHidden("sitemap");
  const brandHidden = isHidden("footer_brand");
  const socialHidden = isHidden("footer_social");
  const quickHidden = isHidden("footer_quick");
  const eservicesHidden = isHidden("footer_eservices");
  const legalSectionHidden = isHidden("footer_legal");
  const contactHidden = isHidden("footer_contact");
  const bottomHidden = isHidden("footer_bottom");
  const legal = [
    ...((legalPages ?? []).map((p) => ({ to: `/${p.slug}`, label: p.title }))),
    ...(sitemapHidden ? [] : [{ to: "/sitemap", label: t.footer.sitemap }]),
  ];

  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      <div className="container py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        {!brandHidden && (
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-11 w-11 rounded-xl bg-accent grid place-items-center">
              <Heart className="h-5 w-5 text-accent-foreground" fill="currentColor" />
            </div>
            <div>
              <div className="font-bold">{t.brand.name}</div>
              <div className="text-xs opacity-80">{t.brand.tagline}</div>
            </div>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">{t.footer.aboutBody}</p>
          {!socialHidden && (
          <div className="mt-5">
            <div className="text-sm font-semibold mb-2">{t.footer.follow}</div>
            <div className="flex items-center gap-2">
              {(() => {
                const waDigits = (settings?.whatsapp_number ?? "").replace(/\D/g, "");
                const waHref = waDigits
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
                    <a
                      key={i}
                      href="#"
                      aria-label="social"
                      className="h-9 w-9 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground grid place-items-center transition-smooth"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ));
                }
                return visible.map(({ Icon, href }, i) => (
                  <a
                    key={i}
                    href={href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="social"
                    className="h-9 w-9 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground grid place-items-center transition-smooth"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ));
              })()}
            </div>
          </div>
          )}
        </div>
        )}

        {!quickHidden && (
        <div>
          <h3 className="font-bold mb-4 text-accent">{t.footer.quickLinks}</h3>
          <ul className="space-y-2 text-sm">
            {quick.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="opacity-90 hover:opacity-100 hover:text-accent transition-smooth">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        )}

        {!eservicesHidden && (
        <div>
          <h3 className="font-bold mb-4 text-accent">{t.nav.eservices}</h3>
          <ul className="space-y-2 text-sm">
            {eservices.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="opacity-90 hover:opacity-100 hover:text-accent transition-smooth">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        )}

        {!legalSectionHidden && (
          <div>
            <h3 className="font-bold mb-4 text-accent">{t.footer.legal}</h3>
            <ul className="space-y-2 text-sm">
              {legal.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="opacity-90 hover:opacity-100 hover:text-accent transition-smooth">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!contactHidden && (
        <div>
          <h3 className="font-bold mb-4 text-accent">{t.footer.contact}</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-accent shrink-0" /> {settings?.contact_address || t.footer.address}</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent shrink-0" /> <span dir="ltr">{settings?.contact_phone || "+966 11 000 0000"}</span></li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent shrink-0" /> {settings?.contact_email || "info@al-ataa.org"}</li>
          </ul>
        </div>
        )}
      </div>

      {!bottomHidden && (
      <div className="border-t border-primary-foreground/15">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-90">
          <div>
            © {new Date().getFullYear()} {t.brand.name} — {t.footer.rights}
          </div>
          <div>
            {t.brand.registration}: <span className="font-semibold">{t.brand.regNumber}</span>
          </div>
        </div>
      </div>
      )}
    </footer>
  );
};