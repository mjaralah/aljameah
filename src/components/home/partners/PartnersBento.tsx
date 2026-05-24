import type { PartnerItem } from "./types";

// أنماط أحجام متدرجة تتكرر — يدعم أي عدد عناصر
const SIZES = [
  "w-full sm:w-64 h-40",
  "w-36 sm:w-40 md:w-48 h-28",
  "w-36 sm:w-40 md:w-48 h-28",
  "w-full sm:w-64 h-28",
  "w-36 sm:w-40 md:w-48 h-28",
  "w-36 sm:w-40 md:w-48 h-28",
];

export const PartnersBento = ({ items }: { items: PartnerItem[] }) => (
  <div className="flex flex-wrap justify-center items-stretch gap-3">
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
