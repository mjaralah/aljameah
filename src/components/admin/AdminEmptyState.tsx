// حالة فارغة موحّدة لكل قوائم لوحة التحكم.
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminEmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  children?: ReactNode;
  className?: string;
};

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon = Plus,
  children,
  className,
}: AdminEmptyStateProps) {
  return (
    <Card className={cn("border-dashed border-border/70 bg-muted/20", className)}>
      <div className="flex flex-col items-center justify-center text-center py-14 px-6">
        {Icon && (
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-primary/70" />
          </div>
        )}
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1.5 max-w-md leading-relaxed">{description}</p>
        )}
        {(actionLabel && onAction) && (
          <Button onClick={onAction} size="sm" className="mt-5">
            <ActionIcon className="w-4 h-4 ml-1" />
            {actionLabel}
          </Button>
        )}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </Card>
  );
}
