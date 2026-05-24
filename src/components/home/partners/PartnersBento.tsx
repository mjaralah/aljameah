import type { PartnerItem } from "./types";

// أنماط أحجام متدرجة تتكرر — يدعم أي عدد عناصر
const SIZES = [
  "md:col-span-2 md:row-span-2 h-40 md:h-full",
  "h-28",
  "h-28",
  "md:col-span-2 h-28",
  "h-28",
  "h-28",
];

export const PartnersBento = ({ items }: { items: PartnerItem[] }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[7rem] gap-3">
    {items.map((p, i) => (
      <a
        key={p.id}
        href={p.url || "#"}
        target={p.url ? "_blank" : undefined}
        rel={p.url ? "noopener noreferrer" : undefined}
        className={`${SIZES[i % SIZES.length]} rounded-2xl border border-border bg-card grid place-items-center text-primary font-bold px-4 text-center hover:border-accent/40 hover:shadow-soft hover:scale-[1.02] transition-all duration-300`}
      >
        {p.logo ? (
          <img src={p.logo} alt={p.name} className="max-h-20 max-w-full object-contain" loading="lazy" />
        ) : (
          <span className="text-sm md:text-base">{p.name}</span>
        )}
      </a>
    ))}
  </div>
);
