// عنوان قسم موحّد داخل صفحات الإعدادات والمحتوى الطويل.
import { ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SectionHeaderProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
};

export function SectionHeader({
  title, description, icon: Icon, action, className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3 mb-4", className)}>
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="shrink-0 w-9 h-9 rounded-lg bg-accent-soft flex items-center justify-center">
            <Icon className="w-4 h-4 text-accent" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
