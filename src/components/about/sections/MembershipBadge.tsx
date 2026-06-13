// شارة موحّدة لنوع العضوية — تدعم لوناً مخصصاً (hex) أو خريطة افتراضية حسب المفتاح
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

// خريطة الأنماط الافتراضية — تستخدم توكنز التصميم فقط (HSL من index.css)
const STYLES: Record<string, string> = {
  regular:   "bg-primary/10 text-primary border-primary/30",
  working:   "bg-primary/10 text-primary border-primary/30", // توافق رجعي
  honorary:  "bg-accent/15 text-accent-foreground border-accent/40",
  supporter: "bg-secondary/60 text-secondary-foreground border-secondary",
  affiliate: "bg-muted text-muted-foreground border-border",
};

function hexToRgba(hex: string, alpha: number): string {
  const m = hex.trim().replace("#", "");
  if (!/^([0-9a-f]{6}|[0-9a-f]{3})$/i.test(m)) return hex;
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function MembershipBadge({
  typeKey,
  label,
  color,
  className,
}: {
  typeKey?: string;
  label: string;
  color?: string;
  className?: string;
}) {
  let style: CSSProperties | undefined;
  let mappedClass = "";

  if (color && /^#?[0-9a-f]{3,8}$/i.test(color.trim())) {
    const hex = color.startsWith("#") ? color : `#${color}`;
    style = {
      backgroundColor: hexToRgba(hex, 0.12),
      color: hex,
      borderColor: hexToRgba(hex, 0.4),
    };
  } else {
    mappedClass = STYLES[typeKey ?? ""] ?? "bg-muted text-muted-foreground border-border";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        mappedClass,
        className,
      )}
      style={style}
    >
      {label}
    </span>
  );
}
