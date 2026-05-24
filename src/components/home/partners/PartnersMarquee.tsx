import type { PartnerItem } from "./types";

const Logo = ({ p }: { p: PartnerItem }) => (
  <a
    href={p.url || "#"}
    target={p.url ? "_blank" : undefined}
    rel={p.url ? "noopener noreferrer" : undefined}
    className="flex-shrink-0 w-48 h-24 mx-3 rounded-xl border border-border bg-card grid place-items-center text-primary font-bold px-4 text-center hover:border-accent/40 hover:shadow-soft transition-smooth"
  >
    {p.logo ? (
      <img src={p.logo} alt={p.name} className="max-h-14 max-w-full object-contain" loading="lazy" />
    ) : (
      <span>{p.name}</span>
    )}
  </a>
);

export const PartnersMarquee = ({ items }: { items: PartnerItem[] }) => {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden relative w-full" dir="ltr">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {doubled.map((p, i) => (
          <Logo key={`${p.id}-${i}`} p={p} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-muted/40 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-muted/40 to-transparent" />
    </div>
  );
};
