import { Label } from "@/components/ui/label";
import type { ReactNode } from "react";

// حقل بسيط مع تسمية ورسالة خطأ
export function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1 text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-accent">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// حقل بأيقونة داخلية
export function IconField({
  label,
  icon: Icon,
  error,
  required,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1 text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-accent">*</span>}
      </Label>
      <div className="relative">
        <Icon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        {children}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
