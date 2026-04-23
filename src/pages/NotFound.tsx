// صفحة الخطأ 404 — رسالة ودودة وروابط مفيدة وبحث
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Compass, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [q, setQ] = useState("");

  useEffect(() => {
    console.warn("404:", location.pathname);
  }, [location.pathname]);

  const helpful = [
    { to: "/", label: t.nav.home },
    { to: "/about", label: t.nav.about },
    { to: "/programs", label: t.nav.programs },
    { to: "/contact", label: t.nav.contact },
  ];

  return (
    <section className="container py-16 md:py-24">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mx-auto h-24 w-24 rounded-3xl bg-gradient-primary text-primary-foreground grid place-items-center mb-6 shadow-card">
          <Compass className="h-12 w-12" />
        </div>
        <div className="text-7xl md:text-8xl font-extrabold text-primary leading-none mb-3">404</div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{t.notFound.title}</h1>
        <p className="text-muted-foreground mb-8">{t.notFound.body}</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/search?q=${encodeURIComponent(q)}`);
          }}
          className="flex gap-2 max-w-md mx-auto mb-8"
        >
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.notFound.searchPlaceholder}
            className="h-12"
          />
          <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-3">{t.notFound.helpful}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {helpful.map((h) => (
              <Button key={h.to} asChild variant="outline" size="sm">
                <Link to={h.to}>{h.label}</Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link to="/">
              <Home className="h-5 w-5" />
              {t.notFound.home}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
