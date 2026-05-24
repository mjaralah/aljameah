import type { PartnerItem } from "./types";

export const PartnersGrid = ({ items }: { items: PartnerItem[] }) => (
  <div className="flex flex-wrap justify-center gap-4">
    {items.map((p) => (
      <a
        key={p.id}
        href={p.url || "#"}
        target={p.url ? "_blank" : undefined}
        rel={p.url ? "noopener noreferrer" : undefined}
        className="group h-24 w-36 sm:w-40 md:w-48 rounded-xl border border-border bg-card grid place-items-center text-primary font-bold px-4 text-center hover:border-accent/40 hover:shadow-soft hover:-translate-y-1 transition-all duration-300"
      >
        {p.logo ? (
          <img
            src={p.logo}
            alt={p.name}
            className="max-h-14 max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
            loading="lazy"
          />
        ) : (
          <span>{p.name}</span>
        )}
      </a>
    ))}
  </div>
);
