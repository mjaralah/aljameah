// نافذة تحرير موحّدة لكل صفحات لوحة التحكم.
import { ReactNode } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSave?: () => void;
  onCancel?: () => void;
  saving?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  /** sm | md | lg | xl */
  size?: "sm" | "md" | "lg" | "xl";
  /** إخفاء التذييل (لاستخدام أزرار مخصّصة داخل المحتوى) */
  hideFooter?: boolean;
  footer?: ReactNode;
};

const SIZE_CLASS: Record<NonNullable<AdminDialogProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function AdminDialog({
  open, onOpenChange,
  title, description, children,
  onSave, onCancel, saving = false,
  saveLabel = "حفظ", cancelLabel = "إلغاء",
  size = "lg", hideFooter, footer,
}: AdminDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className={cn(SIZE_CLASS[size], "max-h-[90vh] overflow-y-auto")}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4 py-2">{children}</div>
        {!hideFooter && (
          <DialogFooter className="gap-2 sm:gap-2">
            {footer ?? (
              <>
                <Button variant="outline" onClick={() => (onCancel ? onCancel() : onOpenChange(false))}>
                  {cancelLabel}
                </Button>
                {onSave && (
                  <Button onClick={onSave} disabled={saving}>
                    {saving && <Loader2 className="w-4 h-4 ml-1 animate-spin" />}
                    {saveLabel}
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
