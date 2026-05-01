import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

// رأس الصفحة بالشعار والتنقل الرئيسي
export const Header = () => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { to: "/", label: t.nav.home },
    { to: "/about", label: t.nav.about },
    { to: "/programs", label: t.nav.programs },
    { to: "/governance", label: t.nav.governance },
    { to: "/media", label: t.nav.media },
    { to: "/e-services", label: t.nav.eservices },
    { to: "/surveys", label: t.nav.surveys },
    { to: "/contact", label: t.nav.contact },
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
          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-gold hidden sm:inline-flex"
            onClick={() => navigate("/donate")}
          >
            <Heart className="h-4 w-4" fill="currentColor" />
            {t.nav.donate}
          </Button>

          {/* قائمة الجوال */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden" aria-label={t.nav.menu}>
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px]">
              <div className="flex flex-col gap-1 mt-6">
                {links.slice(0, 5).map((l) => (
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

                {/* قسم الخدمات الإلكترونية في قائمة الجوال */}
                <div className="mt-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t.nav.eservices}
                </div>
                <NavLink
                  to="/e-services"
                  end
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "px-4 py-2.5 rounded-lg text-sm font-medium transition-smooth",
                      isActive ? "bg-primary/10 text-primary" : "hover:bg-muted",
                    )
                  }
                >
                  جميع الخدمات
                </NavLink>
                {eServiceLinks.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "px-4 py-2.5 mr-3 border-r-2 rounded-lg text-sm transition-smooth",
                        isActive
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border hover:bg-muted",
                      )
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}

                {links.slice(5).map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "px-4 py-3 rounded-lg font-semibold transition-smooth mt-1",
                        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                      )
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}

                <Button
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold mt-4"
                  onClick={() => {
                    setOpen(false);
                    navigate("/donate");
                  }}
                >
                  <Heart className="h-4 w-4" fill="currentColor" />
                  {t.nav.donate}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
