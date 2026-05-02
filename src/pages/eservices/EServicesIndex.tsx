import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  HandHeart,
  HelpCircle,
  HeartHandshake,
  HandCoins,
  MessageSquareWarning,
  Award,
  FileSignature,
  Search,
  Sparkles,
  Clock,
  ShieldCheck,
  LayoutGrid,
  User,
  Building2,
  type LucideIcon,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { PageFeedback } from "@/components/layout/PageFeedback";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageContent } from "@/hooks/usePublicContent";
import { cn } from "@/lib/utils";

type Audience = "all" | "individuals" | "entities" | "inquiries";
type Status = "available" | "soon";

interface ServiceItem {
  to?: string;
  title: { ar: string; en: string };
  desc: { ar: string; en: string };
  icon: LucideIcon;
  audience: Exclude<Audience, "all">;
  status: Status;
  duration: { ar: string; en: string };
  featured?: boolean;
}

const SERVICES: ServiceItem[] = [
  {
    to: "/e-services/volunteer",
    title: { ar: "التطوع", en: "Volunteer" },
    desc: {
      ar: "انضم لفريق المتطوعين وكن جزءاً من رسالة العطاء عبر برامجنا الميدانية والإلكترونية.",
      en: "Join our volunteer team and be part of our mission through field and online programs.",
    },
    icon: HandHeart,
    audience: "individuals",
    status: "available",
    duration: { ar: "٣ دقائق", en: "3 min" },
    featured: true,
  },
  {
    to: "/e-services/membership",
    title: { ar: "طلب عضوية", en: "Membership Request" },
    desc: {
      ar: "احصل على عضوية رسمية ومزايا حصرية مع حق التصويت في الجمعية العمومية.",
      en: "Get an official membership with exclusive benefits and voting rights in the general assembly.",
    },
    icon: BadgeCheck,
    audience: "individuals",
    status: "available",
    duration: { ar: "٥ دقائق", en: "5 min" },
    featured: true,
  },
  {
    title: { ar: "طلب مساعدة", en: "Aid Request" },
    desc: {
      ar: "تقديم طلب مساعدة مالية أو عينية للأسر المستحقة وفق معايير الجمعية.",
      en: "Submit a financial or in-kind aid request for eligible families.",
    },
    icon: HeartHandshake,
    audience: "individuals",
    status: "soon",
    duration: { ar: "٧ دقائق", en: "7 min" },
  },
  {
    title: { ar: "تبرّع إلكتروني", en: "Online Donation" },
    desc: {
      ar: "تبرّع لبرامجنا المعتمدة بكل سهولة وأمان عبر قنوات دفع موثوقة.",
      en: "Donate to our accredited programs easily and securely through trusted payment channels.",
    },
    icon: HandCoins,
    audience: "individuals",
    status: "soon",
    duration: { ar: "دقيقتان", en: "2 min" },
  },
  {
    title: { ar: "شراكة مؤسسية", en: "Corporate Partnership" },
    desc: {
      ar: "ابدأ شراكة مستدامة مع الجمعية وكن داعماً لمبادراتنا الإنسانية.",
      en: "Start a sustainable partnership with us and support our humanitarian initiatives.",
    },
    icon: Building2,
    audience: "entities",
    status: "soon",
    duration: { ar: "١٠ دقائق", en: "10 min" },
  },
  {
    title: { ar: "طلب رعاية فعالية", en: "Event Sponsorship" },
    desc: {
      ar: "تقديم طلب رعاية لفعالياتنا ومبادراتنا المجتمعية الموسمية.",
      en: "Apply to sponsor our seasonal events and community initiatives.",
    },
    icon: FileSignature,
    audience: "entities",
    status: "soon",
    duration: { ar: "٨ دقائق", en: "8 min" },
  },
  {
    title: { ar: "استفسار عام", en: "General Inquiry" },
    desc: {
      ar: "أرسل استفسارك حول خدماتنا أو برامجنا وسنرد عليك في أسرع وقت.",
      en: "Send us your inquiry about our services or programs and we will reply promptly.",
    },
    icon: HelpCircle,
    audience: "inquiries",
    status: "available",
    duration: { ar: "دقيقة", en: "1 min" },
  },
  {
    title: { ar: "شكوى أو ملاحظة", en: "Complaint or Feedback" },
    desc: {
      ar: "ساعدنا في التحسين عبر إرسال شكواك أو ملاحظاتك بسرّية تامة.",
      en: "Help us improve by sending your complaints or feedback in full confidentiality.",
    },
    icon: MessageSquareWarning,
    audience: "inquiries",
    status: "available",
    duration: { ar: "دقيقتان", en: "2 min" },
  },
  {
    title: { ar: "شهادة شكر للمتطوع", en: "Volunteer Certificate" },
    desc: {
      ar: "اطلب إصدار شهادة شكر معتمدة لساعاتك التطوعية مع الجمعية.",
      en: "Request an accredited certificate for your volunteer hours with us.",
    },
    icon: Award,
    audience: "individuals",
    status: "soon",
    duration: { ar: "دقيقة", en: "1 min" },
  },
];

const TAB_DEFS: { key: Audience; ar: string; en: string; icon: LucideIcon }[] = [
  { key: "all", ar: "كل الخدمات", en: "All Services", icon: LayoutGrid },
  { key: "individuals", ar: "للأفراد", en: "Individuals", icon: User },
  { key: "entities", ar: "للجهات", en: "Entities", icon: Building2 },
  { key: "inquiries", ar: "استفسارات", en: "Inquiries", icon: HelpCircle },
];

function resolveIcon(name?: string): LucideIcon {
  if (!name) return Sparkles;
  const Comp = (LucideIcons as any)[name];
  return (Comp as LucideIcon) || Sparkles;
}

export default function EServicesIndex() {
  const { lang, tx } = useLanguage();
  const isAr = lang === "ar";
  const [tab, setTab] = useState<Audience>("all");
  const [query, setQuery] = useState("");
  const { data: pageSections } = usePageContent("eservices");
  const intro = (pageSections ?? []).find((s) => s.section_key === "intro");
  const servicesSection = (pageSections ?? []).find((s) => s.section_key === "services_list");

  const services: ServiceItem[] = useMemo(() => {
    const items: any[] = Array.isArray(servicesSection?.data?.items) ? servicesSection!.data.items : [];
    if (items.length === 0) return SERVICES;
    return items.map((it) => ({
      to: it.url || undefined,
      title: { ar: it.title ?? "", en: it.title ?? "" },
      desc: { ar: it.description ?? "", en: it.description ?? "" },
      icon: resolveIcon(it.icon),
      audience: (["individuals", "entities", "inquiries"].includes(it.audience) ? it.audience : "individuals") as Exclude<Audience, "all">,
      status: (it.status === "soon" ? "soon" : "available") as Status,
      duration: { ar: it.duration ?? "", en: it.duration ?? "" },
      featured: !!it.featured,
    }));
  }, [servicesSection]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((s) => {
      const inTab = tab === "all" || s.audience === tab;
      if (!inTab) return false;
      if (!q) return true;
      const hay = `${s.title.ar} ${s.title.en} ${s.desc.ar} ${s.desc.en}`.toLowerCase();
      return hay.includes(q);
    });
  }, [tab, query, services]);

  const featured = services.filter((s) => s.featured);
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const counts = useMemo(() => {
    const c: Record<Audience, number> = { all: services.length, individuals: 0, entities: 0, inquiries: 0 };
    services.forEach((s) => (c[s.audience] += 1));
    return c;
  }, [services]);

  return (
    <>
      <PageHero
        eyebrow={isAr ? "بوّابة الخدمات" : "Services Portal"}
        title={intro?.title || (isAr ? "الخدمات الإلكترونية" : "E-Services")}
        lead={
          intro?.content ||
          (isAr
            ? "منصة موحّدة لتقديم طلباتك إلى الجمعية بكل سهولة ويسر — اختر الخدمة المناسبة وابدأ التقديم الآن."
            : "A unified platform to submit your requests easily — choose a service and start now.")
        }
        breadcrumb={[{ label: intro?.title || (isAr ? "الخدمات الإلكترونية" : "E-Services") }]}
      />

      <section className="container py-10 md:py-14">
        {/* شريط البحث + المزايا العامة */}
        <Card className="p-5 md:p-6 mb-8 bg-card border-border/60 shadow-soft">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* البحث */}
            <div className="relative flex-1">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isAr ? "ابحث عن خدمة..." : "Search for a service..."}
                className="ps-10 h-11 bg-background border-border/70"
                aria-label={isAr ? "ابحث عن خدمة" : "Search for a service"}
              />
            </div>
            {/* مزايا سريعة */}
            <div className="hidden md:flex items-center gap-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-accent" />
                {isAr ? "تجربة سلسة" : "Smooth UX"}
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-accent" />
                {isAr ? "بياناتك بسرّية" : "Confidential"}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-accent" />
                {isAr ? "متاحة دائماً" : "24/7"}
              </span>
            </div>
          </div>
        </Card>

        {/* البطاقات المميزة */}
        {!query && tab === "all" && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-accent" />
              <h2 className="text-xl md:text-2xl font-extrabold text-primary">
                {isAr ? "الخدمات الأكثر طلباً" : "Most Requested"}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {featured.map((s, idx) => (
                <FeaturedCard key={idx} item={s} isAr={isAr} tx={tx} Arrow={Arrow} primary={idx === 0} />
              ))}
            </div>
          </div>
        )}

        {/* التبويبات */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-1">
            {TAB_DEFS.map((t) => {
              const TIcon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-lg transition-smooth",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <TIcon className="h-4 w-4" />
                  <span>{isAr ? t.ar : t.en}</span>
                  <span
                    className={cn(
                      "text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {counts[t.key]}
                  </span>
                  {active && (
                    <span className="absolute -bottom-[1px] start-2 end-2 h-[3px] rounded-full bg-gradient-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* شبكة الخدمات */}
        {filtered.length === 0 ? (
          <EmptyState isAr={isAr} onClear={() => { setQuery(""); setTab("all"); }} />
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 animate-in fade-in-50 duration-300">
            {filtered.map((s, idx) => (
              <ServiceCard key={idx} item={s} isAr={isAr} tx={tx} Arrow={Arrow} />
            ))}
          </div>
        )}
      </section>

      <PageFeedback pageKey="eservices" />
    </>
  );
}

/* ========== البطاقة المميزة ========== */
const FeaturedCard = ({
  item,
  isAr,
  tx,
  Arrow,
  primary,
}: {
  item: ServiceItem;
  isAr: boolean;
  tx: ReturnType<typeof useLanguage>["tx"];
  Arrow: LucideIcon;
  primary: boolean;
}) => {
  const Icon = item.icon;
  const Wrapper: any = item.to ? Link : "div";
  return (
    <Wrapper
      to={item.to}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-6 md:p-7 border transition-smooth block",
        primary
          ? "bg-gradient-primary text-primary-foreground border-primary/20 hover:shadow-elegant"
          : "bg-card border-border/60 hover:border-accent/50 hover:shadow-soft"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-10 pointer-events-none",
          primary
            ? "[background-image:radial-gradient(circle_at_85%_15%,white_1px,transparent_1px)] [background-size:20px_20px]"
            : "[background-image:radial-gradient(hsl(var(--accent))_1px,transparent_1px)] [background-size:22px_22px]"
        )}
        aria-hidden
      />
      <div className="relative flex items-start gap-4">
        <div
          className={cn(
            "h-14 w-14 rounded-2xl grid place-items-center shrink-0 shadow-soft",
            primary
              ? "bg-primary-foreground/15 text-primary-foreground border border-primary-foreground/20"
              : "bg-gradient-cta text-accent-foreground shadow-gold"
          )}
        >
          <Icon className="h-7 w-7" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge
              className={cn(
                "border-0 font-bold text-[10px]",
                primary ? "bg-primary-foreground/20 text-primary-foreground" : "bg-accent text-accent-foreground"
              )}
            >
              {isAr ? "الأكثر طلباً" : "Top"}
            </Badge>
            <span className={cn("text-[11px] flex items-center gap-1", primary ? "opacity-80" : "text-muted-foreground")}>
              <Clock className="h-3 w-3" />
              {tx(item.duration)}
            </span>
          </div>
          <h3 className={cn("text-xl md:text-2xl font-extrabold mb-2", primary ? "text-primary-foreground" : "text-primary")}>
            {tx(item.title)}
          </h3>
          <p className={cn("text-sm leading-relaxed mb-4", primary ? "text-primary-foreground/90" : "text-muted-foreground")}>
            {tx(item.desc)}
          </p>
          <div
            className={cn(
              "inline-flex items-center gap-2 text-sm font-bold transition-smooth",
              primary ? "text-primary-foreground" : "text-primary group-hover:text-accent-foreground"
            )}
          >
            <span>{isAr ? "ابدأ الآن" : "Start Now"}</span>
            <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

/* ========== بطاقة خدمة ========== */
const ServiceCard = ({
  item,
  isAr,
  tx,
  Arrow,
}: {
  item: ServiceItem;
  isAr: boolean;
  tx: ReturnType<typeof useLanguage>["tx"];
  Arrow: LucideIcon;
}) => {
  const Icon = item.icon;
  const disabled = item.status === "soon" || !item.to;
  const Wrapper: any = !disabled ? Link : "div";

  return (
    <Wrapper
      to={item.to}
      className={cn(
        "group relative",
        disabled ? "cursor-default" : "cursor-pointer"
      )}
      aria-disabled={disabled}
    >
      <Card
        className={cn(
          "p-5 h-full flex flex-col transition-smooth relative overflow-hidden",
          !disabled && "hover:shadow-soft hover:border-accent/50 hover:-translate-y-0.5",
          disabled && "opacity-90"
        )}
      >
        {/* Status pill */}
        <div className="flex items-start justify-between mb-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 text-accent grid place-items-center shrink-0 group-hover:scale-110 transition-smooth">
            <Icon className="h-5 w-5" />
          </div>
          {item.status === "available" ? (
            <Badge className="bg-primary/10 text-primary border-0 font-bold text-[10px] flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              {isAr ? "متاحة" : "Available"}
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 font-bold text-[10px]">
              {isAr ? "قريباً" : "Soon"}
            </Badge>
          )}
        </div>

        <h3 className="font-bold text-foreground mb-1.5 group-hover:text-primary transition-smooth">
          {tx(item.title)}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2 flex-1">
          {tx(item.desc)}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-border/60">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {tx(item.duration)}
          </span>
          {!disabled ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 -me-2 text-primary hover:text-primary-foreground hover:bg-primary"
            >
              <span className="text-xs font-bold">{isAr ? "ابدأ" : "Start"}</span>
              <Arrow className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <span className="text-[11px] font-semibold text-muted-foreground">
              {isAr ? "غير مفعّلة" : "Disabled"}
            </span>
          )}
        </div>
      </Card>
    </Wrapper>
  );
};

/* ========== لا توجد نتائج ========== */
const EmptyState = ({ isAr, onClear }: { isAr: boolean; onClear: () => void }) => (
  <Card className="p-10 text-center border-dashed">
    <div className="mx-auto h-14 w-14 rounded-2xl bg-muted text-muted-foreground grid place-items-center mb-4">
      <Search className="h-6 w-6" />
    </div>
    <h3 className="font-bold text-foreground mb-1">
      {isAr ? "لا توجد خدمات مطابقة" : "No matching services"}
    </h3>
    <p className="text-sm text-muted-foreground mb-4">
      {isAr ? "جرّب كلمة بحث مختلفة أو غيّر التصنيف." : "Try a different keyword or change the category."}
    </p>
    <Button variant="outline" size="sm" onClick={onClear}>
      {isAr ? "إعادة الضبط" : "Reset"}
    </Button>
  </Card>
);
