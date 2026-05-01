import { Link } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { ArrowLeft, BadgeCheck, HandHeart, Sparkles, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    to: "/e-services/volunteer",
    title: "التطوع",
    desc: "انضم لفريق المتطوعين وكن جزءاً من رسالة العطاء عبر برامجنا الميدانية والإلكترونية.",
    icon: HandHeart,
    badge: "الأكثر طلباً",
    accent: "primary" as const,
    pattern: "dots" as const,
    stats: [
      { v: "+500", l: "متطوع نشط" },
      { v: "4", l: "خطوات بسيطة" },
    ],
  },
  {
    to: "/e-services/membership",
    title: "طلب عضوية",
    desc: "احصل على عضوية رسمية ومزايا حصرية مع حق التصويت في الجمعية العمومية.",
    icon: BadgeCheck,
    badge: "عضوية معتمدة",
    accent: "accent" as const,
    pattern: "grid" as const,
    stats: [
      { v: "4", l: "مزايا حصرية" },
      { v: "3 أيام", l: "زمن المراجعة" },
    ],
  },
];

export default function EServicesIndex() {
  return (
    <>
      <PageHero
        eyebrow="بوّابة الخدمات"
        title="الخدمات الإلكترونية"
        lead="منصة موحّدة لتقديم طلباتك إلى الجمعية بكل سهولة ويسر — اختر الخدمة المناسبة وابدأ التقديم الآن."
        breadcrumb={[{ label: "الخدمات الإلكترونية" }]}
      />

      <section className="container py-14 md:py-20">
        {/* مزايا عامة */}
        <div className="mx-auto mb-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: Sparkles, label: "تجربة سلسة وسريعة" },
            { icon: ShieldCheck, label: "حماية بياناتك بسرية تامة" },
            { icon: Clock, label: "متاحة على مدار الساعة" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-soft">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* بطاقات الخدمات */}
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {services.map((s) => {
            const isPrimary = s.accent === "primary";
            return (
              <Link
                key={s.to}
                to={s.to}
                className="group relative overflow-hidden rounded-3xl border bg-card p-8 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant"
              >
                {/* نمط خلفية مميز لكل خدمة */}
                <div
                  className={
                    s.pattern === "dots"
                      ? "pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(hsl(var(--primary))_1.5px,transparent_1.5px)] [background-size:22px_22px]"
                      : "pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(hsl(var(--accent))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--accent))_1px,transparent_1px)] [background-size:28px_28px]"
                  }
                  aria-hidden
                />
                <div
                  className={`pointer-events-none absolute -top-20 -left-20 h-56 w-56 rounded-full blur-3xl transition-opacity ${
                    isPrimary ? "bg-primary/15" : "bg-accent/20"
                  } opacity-60 group-hover:opacity-100`}
                  aria-hidden
                />

                <div className="relative">
                  <div className="mb-6 flex items-start justify-between">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-soft ${
                        isPrimary
                          ? "bg-gradient-primary text-primary-foreground"
                          : "bg-gradient-to-br from-accent to-accent/70 text-accent-foreground shadow-gold"
                      }`}
                    >
                      <s.icon className="h-8 w-8" />
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                        isPrimary
                          ? "bg-primary/10 text-primary"
                          : "bg-accent/15 text-accent"
                      }`}
                    >
                      {s.badge}
                    </span>
                  </div>

                  <h2 className="mb-3 text-2xl font-bold text-foreground">{s.title}</h2>
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>

                  <div className="mb-6 grid grid-cols-2 gap-3">
                    {s.stats.map((st) => (
                      <div key={st.l} className="rounded-xl border bg-background/60 p-3 backdrop-blur">
                        <div
                          className={`text-lg font-extrabold ${isPrimary ? "text-primary" : "text-accent"}`}
                        >
                          {st.v}
                        </div>
                        <div className="text-xs text-muted-foreground">{st.l}</div>
                      </div>
                    ))}
                  </div>

                  <Button
                    asChild
                    className={
                      isPrimary
                        ? "w-full gap-2 bg-gradient-primary hover:opacity-90"
                        : "w-full gap-2 bg-gradient-cta text-primary-foreground shadow-gold hover:opacity-90"
                    }
                  >
                    <span>
                      ابدأ الآن
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    </span>
                  </Button>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
