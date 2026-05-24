import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, Menu, Search, Gift, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMenuPages, useSiteSettings } from "@/hooks/usePublicContent";
import { cn } from "@/lib/utils";

// رأس الصفحة بالشعار والتنقل الرئيسي
export const Header = () => {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: menuPages } = useMenuPages();
  const { data: settings } = useSiteSettings();

  // إعدادات زر التبرع (قابلة للتحكم من لوحة التحكم)
  const donateEnabled = settings?.donate_button_enabled !== false;
  const donateLabel =
    (lang === "en"
      ? settings?.donate_button_label_en || settings?.donate_button_label_ar
      : settings?.donate_button_label_ar || settings?.donate_button_label_en) || t.nav.donate;
  const donateUrl = settings?.donate_button_url || "/donate";
  const isExternal = /^https?:\/\//i.test(donateUrl);
  const donateBg = settings?.donate_button_bg_color || undefined;
  const donateFg = settings?.donate_button_text_color || undefined;
  const iconKey = settings?.donate_button_icon || "heart";
  const DonateIcon =
    iconKey === "gift" ? Gift : iconKey === "hand-heart" ? HandHeart : iconKey === "none" ? null : Heart;
  const handleDonate = () => {
    if (isExternal) window.open(donateUrl, "_blank", "noopener,noreferrer");
    else navigate(donateUrl);
  };
  const donateStyle = donateBg || donateFg ? { backgroundColor: donateBg, color: donateFg } : undefined;


  const links = [
    { to: "/", label: t.nav.home },
    { to: "/about", label: t.nav.about },
    { to: "/programs", label: t.nav.programs },
    { to: "/governance", label: t.nav.governance },
    { to: "/media", label: t.nav.media },
    { to: "/e-services", label: t.nav.eservices },
    { to: "/surveys", label: t.nav.surveys },
    { to: "/contact", label: t.nav.contact },
    ...(menuPages ?? []).map((p) => ({
      to: `/p/${p.slug}`,
      label: (lang === "en" ? p.title_en : null) || p.title,
    })),
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "px-3 py-2 rounded-md text-sm font-semibold transition-smooth whitespace-nowrap",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-foreground/80 hover:text-primary hover:bg-primary/5",
    );

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border shadow-soft">
      <div className="container flex items-center justify-between gap-4 h-16 lg:h-20">
        {/* الشعار */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="h-10 w-10 lg:h-11 lg:w-11 rounded-xl bg-gradient-primary grid place-items-center shadow-soft">
            <Heart className="h-5 w-5 text-primary-foreground" fill="currentColor" />
          </div>
          <div className="leading-tight">
            <div className="text-sm lg:text-base font-bold text-primary">{t.brand.name}</div>
            <div className="text-[10px] lg:text-xs text-muted-foreground">{t.brand.tagline}</div>
          </div>
        </Link>

        {/* التنقل لسطح المكتب */}
        <nav className="hidden xl:flex items-center gap-0.5" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t.nav.search}
            onClick={() => navigate("/search")}
            className="hidden sm:inline-flex"
          >
            <Search className="h-5 w-5" />
          </Button>
          {donateEnabled && (
            <Button
              className={cn(
                "font-bold shadow-gold hidden sm:inline-flex",
                !donateBg && "bg-accent hover:bg-accent/90 text-accent-foreground",
              )}
              style={donateStyle}
              onClick={handleDonate}
            >
              {DonateIcon && <DonateIcon className="h-4 w-4" fill="currentColor" />}
              {donateLabel}
            </Button>
          )}

          {/* قائمة الجوال */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden" aria-label={t.nav.menu}>
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px]">
              <div className="flex flex-col gap-1 mt-6">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === "/"}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "px-4 py-3 rounded-lg font-semibold transition-smooth",
                        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                      )
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}

                {donateEnabled && (
                  <Button
                    className={cn(
                      "font-bold mt-4",
                      !donateBg && "bg-accent hover:bg-accent/90 text-accent-foreground",
                    )}
                    style={donateStyle}
                    onClick={() => {
                      setOpen(false);
                      handleDonate();
                    }}
                  >
                    {DonateIcon && <DonateIcon className="h-4 w-4" fill="currentColor" />}
                    {donateLabel}
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
