// شارة موحّدة لنوع العضوية مع ألوان دلالية ثابتة لكل نوع
import { cn } from "@/lib/utils";

// خريطة الأنماط — تستخدم توكنز التصميم فقط (HSL من index.css)
const STYLES: Record<string, string> = {
  working:   "bg-primary/10 text-primary border-primary/30",
  honorary:  "bg-accent/15 text-accent-foreground border-accent/40",
  supporter: "bg-secondary/60 text-secondary-foreground border-secondary",
  affiliate: "bg-muted text-muted-foreground border-border",
};

export function MembershipBadge({
  typeKey,
  label,
  className,
}: {
  typeKey?: string;
  label: string;
  className?: string;
}) {
  const style = STYLES[typeKey ?? ""] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        style,
        className,
      )}
    >
      {label}
    </span>
  );
}
