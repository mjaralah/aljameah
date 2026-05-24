// صف بطاقة موحّد لقوائم لوحة التحكم. يطابق الموك-أب المعتمد:
// مقبض سحب يمين، عنوان + سطر فرعي، شارة منشور/مسودة، ثم أزرار: حذف (destructive)، تعديل (primary)، نشر/إخفاء (success/muted).
// يحافظ على هوية الموقع عبر tokens (primary/accent/destructive/success).
import { ReactNode, useState, forwardRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GripVertical, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type AdminListRowProps = {
  id: string;
  table?:
    | "news" | "programs" | "partners" | "hero_slides" | "board_members"
    | "custom_forms" | "surveys" | "custom_pages" | "legal_pages"
    | "governance_documents" | "about_content" | "page_content";
  title: ReactNode;
  subtitle?: ReactNode;
  thumbnail?: ReactNode;
  badges?: ReactNode;
  published: boolean;
  onTogglePublished?: (next: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  extraActions?: ReactNode;
  dragHandleProps?: Record<string, unknown>;
  showDragHandle?: boolean;
  /** Optional alternative reorder controls (arrows / position input / move-to menu). */
  reorderControls?: ReactNode;
  /** Show a selection checkbox on the right. */
  selectable?: boolean;
  selected?: boolean;
  onSelectChange?: (next: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
};

export const AdminListRow = forwardRef<HTMLDivElement, AdminListRowProps>(function AdminListRow(
  {
    id, table, title, subtitle, thumbnail, badges,
    published, onTogglePublished, onEdit, onDelete, extraActions,
    dragHandleProps, showDragHandle = true, reorderControls,
    selectable, selected, onSelectChange,
    className, style, children,
  },
  ref,
) {
  const [busy, setBusy] = useState(false);

  async function togglePublish() {
    if (!table) {
      onTogglePublished?.(!published);
      return;
    }
    setBusy(true);
    const next = !published;
    const { error } = await supabase.from(table).update({ published: next }).eq("id", id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(next ? "تم النشر" : "تم الإخفاء");
    onTogglePublished?.(next);
  }

  return (
    <Card
      ref={ref}
      style={style}
      className={cn(
        "transition-smooth border-border/70",
        !published && "opacity-[0.55]",
        className,
      )}
    >
      <div className="flex items-center gap-3 p-3 md:p-4">
        {showDragHandle && (
          <button
            type="button"
            {...(dragHandleProps ?? {})}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 touch-none"
            aria-label="سحب لإعادة الترتيب"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}

        {thumbnail && <div className="shrink-0">{thumbnail}</div>}

        <div className="flex-1 min-w-0 text-right">
          <div className="font-semibold text-foreground line-clamp-1">{title}</div>
          {subtitle && (
            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{subtitle}</div>
          )}
          {badges && <div className="mt-1.5 flex flex-wrap gap-1.5">{badges}</div>}
        </div>

        <Badge
          variant={published ? "default" : "secondary"}
          className={cn(
            "gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            published
              ? "bg-success/15 text-success hover:bg-success/20 border-success/30"
              : "bg-muted text-muted-foreground border-border",
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              published ? "bg-success" : "bg-muted-foreground",
            )}
          />
          {published ? "منشور" : "مسودة"}
        </Badge>

        <TooltipProvider delayDuration={200}>
          <div className="flex items-center gap-1.5">
            {reorderControls}
            {extraActions}


            {onDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={onDelete}
                    className="h-9 w-9 border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>حذف</TooltipContent>
              </Tooltip>
            )}

            {onEdit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={onEdit}
                    className="h-9 w-9 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
                    aria-label="تعديل"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>تعديل</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={togglePublish}
                  disabled={busy}
                  className={cn(
                    "h-9 w-9",
                    published
                      ? "border-success/30 bg-success/5 text-success hover:bg-success/10 hover:text-success"
                      : "border-border bg-muted/50 text-muted-foreground hover:bg-muted",
                  )}
                  aria-label={published ? "إخفاء" : "نشر"}
                >
                  {published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>نشر / إخفاء</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
      {children}
    </Card>
  );
});
