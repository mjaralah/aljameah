import { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "./Breadcrumb";

interface Props {
  eyebrow?: string;
  title: string;
  lead?: string;
  breadcrumb?: Crumb[];
  actions?: ReactNode;
}

// رأس صفحة موحّد بهوية مؤسسية
export const PageHero = ({ eyebrow, title, lead, breadcrumb, actions }: Props) => (
  <>
    {breadcrumb && <Breadcrumbs items={breadcrumb} />}
    <section className="relative overflow-hidden bg-gradient-primary text-primary-foreground">
      <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:24px_24px]" aria-hidden />
      <div className="container relative py-14 md:py-20">
        {eyebrow && (
          <span className="inline-block text-xs font-bold tracking-widest uppercase bg-accent/95 text-accent-foreground px-3 py-1 rounded-full mb-4 shadow-gold">
            {eyebrow}
          </span>
        )}
        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 max-w-3xl">{title}</h1>
        {lead && <p className="text-base md:text-lg opacity-95 max-w-2xl leading-relaxed">{lead}</p>}
        {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </section>
  </>
);
