// جدول بيانات موحّد لصفحات الطلبات والمستخدمين.
// يحافظ على نفس لغة الألوان الخاصة بـ AdminListRow (إجراءات ملوّنة + ألوان دلالية).
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Trash2, Eye, Pencil, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
  width?: string;
};

export type DataTableAction<T> = {
  icon: LucideIcon;
  label: string;
  onClick: (row: T) => void;
  variant?: "view" | "edit" | "delete" | "neutral";
  show?: (row: T) => boolean;
};

const ACTION_STYLES: Record<NonNullable<DataTableAction<unknown>["variant"]>, string> = {
  view: "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10",
  edit: "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10",
  delete: "border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive",
  neutral: "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
};

export type AdminDataTableProps<T extends { id: string }> = {
  rows: T[];
  loading?: boolean;
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];
  onRowClick?: (row: T) => void;
  /** إذا لم تكن هناك بيانات وعرف هذا، يُعرض. وإلا لا شيء. */
  emptyState?: ReactNode;
  /** شارة حالة اختيارية تُعرض في عمود ثابت يميناً */
  statusColumn?: {
    key: string;
    label: string;
    getStatus: (row: T) => { label: string; tone: "success" | "warning" | "destructive" | "info" | "muted" };
  };
};

const TONE_CLASSES: Record<"success" | "warning" | "destructive" | "info" | "muted", string> = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-accent/15 text-accent border-accent/30",
  destructive: "bg-destructive/15 text-destructive border-destructive/30",
  info: "bg-primary/15 text-primary border-primary/30",
  muted: "bg-muted text-muted-foreground border-border",
};

export function AdminDataTable<T extends { id: string }>({
  rows, loading, columns, actions, onRowClick, emptyState, statusColumn,
}: AdminDataTableProps<T>) {
  if (loading) {
    return (
      <Card className="p-12 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </Card>
    );
  }
  if (rows.length === 0) {
    return <>{emptyState}</>;
  }
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-4 py-3 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wide",
                    c.className,
                  )}
                  style={c.width ? { width: c.width } : undefined}
                >
                  {c.label}
                </th>
              ))}
              {statusColumn && (
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wide w-32">
                  {statusColumn.label}
                </th>
              )}
              {actions && actions.length > 0 && (
                <th className="px-4 py-3 w-1" />
              )}
            </tr>
          </thead>
          <tbody>
            <TooltipProvider delayDuration={200}>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border/60 last:border-0 transition-colors",
                    onRowClick && "hover:bg-muted/30 cursor-pointer",
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-4 py-3 align-middle", c.className)}>
                      {c.render ? c.render(row) : String((row as any)[c.key] ?? "—")}
                    </td>
                  ))}
                  {statusColumn && (
                    <td className="px-4 py-3 align-middle">
                      {(() => {
                        const s = statusColumn.getStatus(row);
                        return (
                          <Badge
                            variant="outline"
                            className={cn(
                              "gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                              TONE_CLASSES[s.tone],
                            )}
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                s.tone === "success" && "bg-success",
                                s.tone === "warning" && "bg-accent",
                                s.tone === "destructive" && "bg-destructive",
                                s.tone === "info" && "bg-primary",
                                s.tone === "muted" && "bg-muted-foreground",
                              )}
                            />
                            {s.label}
                          </Badge>
                        );
                      })()}
                    </td>
                  )}
                  {actions && actions.length > 0 && (
                    <td className="px-4 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5 justify-end">
                        {actions.map((a, i) => {
                          if (a.show && !a.show(row)) return null;
                          const variant = a.variant ?? "neutral";
                          const Icon = a.icon;
                          return (
                            <Tooltip key={i}>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => a.onClick(row)}
                                  className={cn("h-9 w-9", ACTION_STYLES[variant])}
                                  aria-label={a.label}
                                >
                                  <Icon className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{a.label}</TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </TooltipProvider>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// أيقونات شائعة معاد تصديرها للراحة
export { Trash2, Eye, Pencil };
