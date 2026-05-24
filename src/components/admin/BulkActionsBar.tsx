// شريط الإجراءات المجمّعة — يظهر فوق القائمة عند تحديد عنصر أو أكثر.
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Trash2, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type BulkActionsBarProps = {
  count: number;
  total: number;
  allSelected: boolean;
  onToggleAll: (next: boolean) => void;
  onClear: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
  busy?: boolean;
};

export function BulkActionsBar({
  count, total, allSelected, onToggleAll, onClear,
  onPublish, onUnpublish, onDelete, busy,
}: BulkActionsBarProps) {
  return (
    <div
      className={cn(
        "sticky top-2 z-30 mb-3 rounded-xl border shadow-soft backdrop-blur",
        count > 0
          ? "border-primary/40 bg-primary/[0.06]"
          : "border-border bg-card/80",
      )}
    >
      <div className="flex items-center gap-3 flex-wrap p-2.5 md:p-3">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer select-none px-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border accent-primary"
            checked={allSelected && total > 0}
            ref={(el) => {
              if (el) el.indeterminate = count > 0 && !allSelected;
            }}
            onChange={(e) => onToggleAll(e.target.checked)}
          />
          {count > 0 ? (
            <span>تم تحديد <span className="font-bold text-primary">{count}</span> من {total}</span>
          ) : (
            <span className="text-muted-foreground">تحديد الكل ({total})</span>
          )}
        </label>

        {count > 0 && (
          <>
            <span className="h-5 w-px bg-border" />
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onPublish}
                disabled={busy}
                className="border-success/30 bg-success/5 text-success hover:bg-success/10 hover:text-success"
              >
                {busy ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Eye className="w-4 h-4 ml-1" />}
                نشر
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onUnpublish}
                disabled={busy}
              >
                <EyeOff className="w-4 h-4 ml-1" />
                إلغاء النشر
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onDelete}
                disabled={busy}
                className="border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 ml-1" />
                حذف
              </Button>
            </div>
            <div className="ms-auto">
              <Button type="button" size="sm" variant="ghost" onClick={onClear} disabled={busy}>
                <X className="w-4 h-4 ml-1" />
                إلغاء التحديد
              </Button>
            </div>
          </>
        )}
        {count === 0 && (
          <span className="text-xs text-muted-foreground">
            ✓ حدّد عدة عناصر لتنفيذ إجراء واحد عليها (نشر / إخفاء / حذف).
          </span>
        )}
      </div>
    </div>
  );
}
