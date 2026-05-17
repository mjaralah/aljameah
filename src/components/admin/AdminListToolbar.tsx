// شريط أدوات موحّد للقوائم: عدّاد + شرائح تصفية + إجراءات إضافية.
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ToolbarChip = {
  value: string;
  label: string;
  count?: number;
};

export type AdminListToolbarProps = {
  /** نص يصف العدّ مثل «12 عنصراً» */
  countLabel?: string;
  chips?: ToolbarChip[];
  activeChip?: string;
  onChipChange?: (value: string) => void;
  extra?: ReactNode;
  className?: string;
};

export function AdminListToolbar({
  countLabel, chips, activeChip, onChipChange, extra, className,
}: AdminListToolbarProps) {
  if (!countLabel && !chips?.length && !extra) return null;
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 flex-wrap px-1 mb-3",
        className,
      )}
    >
      <div className="flex items-center gap-2 flex-wrap">
        {countLabel && (
          <span className="text-sm text-muted-foreground font-medium">{countLabel}</span>
        )}
        {chips && chips.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {chips.map((c) => {
              const active = c.value === activeChip;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => onChipChange?.(c.value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-soft"
                      : "bg-background hover:bg-muted/60 border-border text-muted-foreground",
                  )}
                >
                  {c.label}
                  {typeof c.count === "number" && (
                    <span
                      className={cn(
                        "inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-[10px]",
                        active ? "bg-primary-foreground/20" : "bg-muted",
                      )}
                    >
                      {c.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {extra && <div className="flex items-center gap-2 flex-wrap">{extra}</div>}
    </div>
  );
}
