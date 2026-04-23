import { Link } from "react-router-dom";
import { ChevronLeft, Home } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// مكوّن مسار التنقل (Breadcrumb)
export interface Crumb {
  label: string;
  to?: string;
}

export const Breadcrumbs = ({ items }: { items: Crumb[] }) => {
  const { t, dir } = useLanguage();
  const Chevron = ChevronLeft;

  return (
    <nav aria-label="breadcrumb" className="container py-4">
      <ol className="flex items-center flex-wrap gap-1 text-sm text-muted-foreground">
        <li>
          <Link to="/" className="inline-flex items-center gap-1 hover:text-primary">
            <Home className="h-3.5 w-3.5" /> {t.common.home}
          </Link>
        </li>
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1">
            <Chevron className={dir === "rtl" ? "h-3.5 w-3.5" : "h-3.5 w-3.5 rotate-180"} />
            {c.to && i < items.length - 1 ? (
              <Link to={c.to} className="hover:text-primary">
                {c.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};