// حارس عرض الصفحات العامة — يخفي الصفحة إذا قام المدير بإيقاف نشرها
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/usePublicContent";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export function PublicRouteGuard({
  pageKey,
  children,
}: {
  pageKey: string;
  children: ReactNode;
}) {
  const { data: settings, isLoading } = useSiteSettings();
  const { role } = useAdminAuth();

  // الطاقم يرى دائماً كل الصفحات
  if (role === "admin" || role === "editor") return <>{children}</>;
  if (isLoading) return <>{children}</>;

  const visibility = (settings as any)?.pages_visibility as Record<string, boolean> | undefined;
  // افتراضياً منشورة، إلا إذا تم تعطيلها صراحةً (false)
  const isHidden = visibility && visibility[pageKey] === false;

  if (!isHidden) return <>{children}</>;

  return (
    <section className="container py-20 md:py-28">
      <div className="max-w-xl mx-auto text-center bg-card border border-border rounded-3xl p-10 shadow-soft">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-muted text-muted-foreground grid place-items-center mb-5">
          <EyeOff className="h-8 w-8" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-primary mb-3">
          هذه الصفحة غير متاحة حالياً
        </h1>
        <p className="text-muted-foreground mb-7 leading-relaxed">
          تم إيقاف نشر هذه الصفحة مؤقتاً من قِبل إدارة الموقع. يرجى المحاولة لاحقاً.
        </p>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
          <Link to="/">العودة للصفحة الرئيسية</Link>
        </Button>
      </div>
    </section>
  );
}
