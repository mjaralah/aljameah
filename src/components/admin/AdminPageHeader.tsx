// رأس صفحة موحّد لكل صفحات لوحة التحكم.
// يحافظ على هوية الموقع (الأخضر/الذهبي) ويوحّد مكان زر «+ إضافة» وحقل البحث.
import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Search, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminPageHeaderProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** زر الإجراء الأساسي (مثلاً «+ إضافة») */
  action?: ReactNode;
  /** بحث اختياري — عند تمرير onSearchChange يظهر حقل البحث */
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  /** عناصر إضافية تظهر بجانب البحث (فلاتر/تصدير) */
  extra?: ReactNode;
  className?: string;
};

export function AdminPageHeader({
  title,
  description,
  icon: Icon,
  action,
  searchValue,
  onSearchChange,
  searchPlaceholder = "بحث...",
  extra,
  className,
}: AdminPageHeaderProps) {
  const hasToolbar = onSearchChange !== undefined || extra !== undefined;
  return (
    <div className={cn("mb-6", className)}>
      <div className="rounded-2xl border border-border/60 bg-card shadow-soft p-5 md:p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {Icon && (
              <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
                <Icon className="w-6 h-6 text-primary-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">{title}</h1>
              {description && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>

        {hasToolbar && (
          <div className="mt-5 flex items-center gap-3 flex-wrap">
            {onSearchChange && (
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue ?? ""}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pr-9 bg-background"
                />
              </div>
            )}
            {extra && <div className="flex items-center gap-2 flex-wrap">{extra}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
