import { Link } from "react-router-dom";
import { Facebook, Heart, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/usePublicContent";

// تذييل الموقع الكامل
export const Footer = () => {
  const { t } = useLanguage();
  const { data: settings } = useSiteSettings();

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
  const legal = [
    { to: "/privacy-policy", label: t.footer.privacy },
    { to: "/terms-of-use", label: t.footer.terms },
    { to: "/cookie-policy", label: t.footer.cookies },
    { to: "/accessibility-statement", label: t.footer.accessibility },
    { to: "/sitemap", label: t.footer.sitemap },
  ];

  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      <div className="container py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
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
          <div className="mt-5">
            <div className="text-sm font-semibold mb-2">{t.footer.follow}</div>
            <div className="flex items-center gap-2">
              {[
                { Icon: Twitter, href: settings?.social_twitter },
                { Icon: Instagram, href: settings?.social_instagram },
                { Icon: Linkedin, href: settings?.social_linkedin },
                { Icon: Youtube, href: settings?.social_youtube },
                { Icon: Facebook, href: undefined as string | null | undefined },
              ]
                .filter((s, _, arr) => arr.some((a) => a.href) ? !!s.href : true)
                .map(({ Icon, href }, i) => (
                  <a
                    key={i}
                    href={href || "#"}
                    target={href ? "_blank" : undefined}
                    rel={href ? "noopener noreferrer" : undefined}
                    aria-label="social"
                    className="h-9 w-9 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground grid place-items-center transition-smooth"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
            </div>
          </div>
        </div>

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

        <div>
          <h3 className="font-bold mb-4 text-accent">{t.footer.contact}</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-accent shrink-0" /> {settings?.contact_address || t.footer.address}</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent shrink-0" /> <span dir="ltr">{settings?.contact_phone || "+966 11 000 0000"}</span></li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent shrink-0" /> {settings?.contact_email || "info@al-ataa.org"}</li>
          </ul>
        </div>
      </div>

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
    </footer>
  );
};