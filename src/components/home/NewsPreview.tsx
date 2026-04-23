import { ArrowLeft, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { news } from "@/data";

export const NewsPreview = () => {
  const { t, tx, lang, dir } = useLanguage();
  return (
    <section className="container py-16 md:py-24" aria-label="news">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
        <div>
          <span className="text-accent font-bold text-sm uppercase tracking-wider">{t.news.title}</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary mt-2">{t.news.subtitle}</h2>
        </div>
        <Button asChild variant="ghost" className="text-primary font-semibold">
          <Link to="/media">
            {t.news.viewAll}
            <ArrowLeft className={dir === "rtl" ? "h-4 w-4" : "h-4 w-4 rotate-180"} />
          </Link>
        </Button>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {news.slice(0, 3).map((n) => (
          <Card key={n.id} className="overflow-hidden group hover:shadow-card transition-smooth border-border hover:-translate-y-1">
            <div className="aspect-[16/10] overflow-hidden bg-muted">
              <img
                src={n.image}
                alt={tx(n.title)}
                loading="lazy"
                width={1024}
                height={640}
                className="h-full w-full object-cover group-hover:scale-105 transition-smooth"
              />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(n.date).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="text-accent font-semibold">{tx(n.category)}</span>
              </div>
              <h3 className="font-bold text-primary mb-2 line-clamp-2">{tx(n.title)}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{tx(n.excerpt)}</p>
              <Link to="/media" className="text-sm font-semibold text-accent hover:underline inline-flex items-center gap-1">
                {t.news.readMore}
                <ArrowLeft className={dir === "rtl" ? "h-3.5 w-3.5" : "h-3.5 w-3.5 rotate-180"} />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};