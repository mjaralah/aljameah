import { useState, useMemo } from "react";
import {
  Download,
  FileText,
  ShieldCheck,
  Wallet,
  FileBarChart,
  ScrollText,
  BookMarked,
  Target,
  TrendingUp,
  HandCoins,
  CalendarDays,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  policies,
  regulations,
  plans,
  investmentDecisions,
  aidReports,
  financialReports,
  reports as annualReports,
  eventsReports,
  financials,
} from "@/data/governance";
import { PageHero } from "@/components/layout/PageHero";
import { PageFeedback } from "@/components/layout/PageFeedback";
import { cn } from "@/lib/utils";

type DocItem = { id: string; year: number; title: { ar: string; en: string }; fileName: string };

type Section = {
  key: string;
  labelKey: keyof ReturnType<typeof useLanguage>["t"]["pages"]["governance"];
  icon: React.FC<{ className?: string }>;
  docs: DocItem[];
};

const Governance = () => {
  const { t, tx, lang } = useLanguage();
  const [activeKey, setActiveKey] = useState<string>("overview");

  const sections: Section[] = useMemo(
    () => [
      { key: "policies", labelKey: "policies", icon: ShieldCheck, docs: policies },
      { key: "regulations", labelKey: "regulations", icon: ScrollText, docs: regulations },
      { key: "plans", labelKey: "plans", icon: Target, docs: plans },
      { key: "investments", labelKey: "investments", icon: TrendingUp, docs: investmentDecisions },
      { key: "aid", labelKey: "aid", icon: HandCoins, docs: aidReports },
      { key: "financialReports", labelKey: "financialReports", icon: Wallet, docs: financialReports },
      { key: "annualReport", labelKey: "annualReport", icon: FileBarChart, docs: annualReports },
      { key: "events", labelKey: "events", icon: CalendarDays, docs: eventsReports },
    ],
    []
  );

  const active = sections.find((s) => s.key === activeKey);
  const Chevron = lang === "ar" ? ChevronLeft : ChevronRight;

  return (
    <>
      <PageHero
        eyebrow={t.brand.verified}
        title={t.pages.governance.heading}
        lead={t.pages.governance.lead}
        breadcrumb={[{ label: t.nav.governance }]}
      />

      <section className="container py-10 md:py-14">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6 lg:gap-8 items-start">
          {/* الشريط الجانبي للأقسام */}
          <aside className="lg:sticky lg:top-24">
            <Card className="p-3 bg-card border-border/60 shadow-soft">
              <div className="flex items-center gap-2 px-3 py-2 mb-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <h2 className="text-sm font-bold text-primary tracking-wide">
                  {t.pages.governance.sectionsTitle}
                </h2>
              </div>
              <nav className="flex flex-col gap-1">
                <SidebarItem
                  active={activeKey === "overview"}
                  onClick={() => setActiveKey("overview")}
                  icon={LayoutGrid}
                  label={t.pages.governance.overview}
                  Chevron={Chevron}
                />
                {sections.map((s) => (
                  <SidebarItem
                    key={s.key}
                    active={activeKey === s.key}
                    onClick={() => setActiveKey(s.key)}
                    icon={s.icon}
                    label={t.pages.governance[s.labelKey] as string}
                    count={s.docs.length}
                    Chevron={Chevron}
                  />
                ))}
              </nav>
            </Card>
          </aside>

          {/* منطقة العرض */}
          <div className="min-w-0">
            {activeKey === "overview" ? (
              <OverviewPanel
                sections={sections}
                onPick={setActiveKey}
                t={t}
                lang={lang}
              />
            ) : active ? (
              <DocsPanel
                key={active.key}
                title={t.pages.governance[active.labelKey] as string}
                icon={active.icon}
                docs={active.docs}
                tx={tx}
                downloadLabel={t.pages.governance.download}
                docsCountLabel={t.pages.governance.docsCount}
              />
            ) : null}
          </div>
        </div>
      </section>

      <PageFeedback pageKey="governance" />
    </>
  );
};

/* ====================== الشريط الجانبي ====================== */
const SidebarItem = ({
  active,
  onClick,
  icon: Icon,
  label,
  count,
  Chevron,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.FC<{ className?: string }>;
  label: string;
  count?: number;
  Chevron: React.FC<{ className?: string }>;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-smooth text-start",
      active
        ? "bg-gradient-primary text-primary-foreground shadow-soft"
        : "text-foreground hover:bg-secondary"
    )}
  >
    <span
      className={cn(
        "h-8 w-8 rounded-lg grid place-items-center shrink-0 transition-smooth",
        active ? "bg-primary-foreground/15 text-primary-foreground" : "bg-accent/10 text-accent group-hover:bg-accent/20"
      )}
    >
      <Icon className="h-4 w-4" />
    </span>
    <span className="flex-1 truncate">{label}</span>
    {typeof count === "number" && (
      <span
        className={cn(
          "text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md",
          active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {count}
      </span>
    )}
    <Chevron
      className={cn(
        "h-4 w-4 transition-smooth shrink-0",
        active ? "opacity-100 text-primary-foreground" : "opacity-0 group-hover:opacity-60"
      )}
    />
  </button>
);

/* ====================== لوحة النظرة العامة ====================== */
const OverviewPanel = ({
  sections,
  onPick,
  t,
  lang,
}: {
  sections: Section[];
  onPick: (k: string) => void;
  t: ReturnType<typeof useLanguage>["t"];
  lang: "ar" | "en";
}) => (
  <div className="space-y-8 animate-in fade-in-50 duration-500">
    {/* بطاقات إحصائية مالية */}
    <Card className="p-6 md:p-8 bg-gradient-primary text-primary-foreground border-0 overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_85%_15%,white_1px,transparent_1px)] [background-size:20px_20px]" aria-hidden />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="h-5 w-5 text-accent" />
          <h2 className="text-xl md:text-2xl font-extrabold">{t.pages.governance.financials}</h2>
          <Badge className="ms-auto bg-accent text-accent-foreground font-bold">{financials.year}</Badge>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl bg-primary-foreground/10 backdrop-blur-sm p-4 border border-primary-foreground/15">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">
              {t.pages.governance.revenue}
            </span>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-extrabold tabular-nums">
                {financials.totalRevenue.toLocaleString()}
              </span>
              <span className="text-sm opacity-80">{t.pages.governance.currency}</span>
            </div>
          </div>
          <div className="rounded-xl bg-accent/20 backdrop-blur-sm p-4 border border-accent/40">
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">
              {t.pages.governance.expenses}
            </span>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-extrabold tabular-nums">
                {financials.totalExpenses.toLocaleString()}
              </span>
              <span className="text-sm opacity-90">{t.pages.governance.currency}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold mb-3 opacity-95">{t.pages.governance.allocation}</h3>
          <div className="space-y-3">
            {financials.allocation.map((a) => (
              <div key={a.key}>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="font-semibold">{lang === "ar" ? a.labelAr : a.labelEn}</span>
                  <span className="font-bold tabular-nums">{a.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-primary-foreground/15 overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-700"
                    style={{ width: `${a.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>

    {/* شبكة الأقسام */}
    <div>
      <div className="flex items-center gap-2 mb-4">
        <BookMarked className="h-5 w-5 text-accent" />
        <h2 className="text-xl md:text-2xl font-extrabold text-primary">
          {t.pages.governance.browse}
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map((s, idx) => {
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => onPick(s.key)}
              className="group text-start"
            >
              <Card className="p-5 h-full hover:shadow-soft hover:border-accent/50 hover:-translate-y-0.5 transition-smooth relative overflow-hidden">
                <span className="absolute top-3 end-3 text-[10px] font-bold text-muted-foreground/60 tabular-nums">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 text-accent grid place-items-center mb-3 group-hover:scale-110 transition-smooth">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-smooth">
                  {t.pages.governance[s.labelKey] as string}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {s.docs.length} {t.pages.governance.docsCount}
                </p>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

/* ====================== لوحة الوثائق ====================== */
const DocsPanel = ({
  title,
  icon: Icon,
  docs,
  tx,
  downloadLabel,
  docsCountLabel,
}: {
  title: string;
  icon: React.FC<{ className?: string }>;
  docs: DocItem[];
  tx: ReturnType<typeof useLanguage>["tx"];
  downloadLabel: string;
  docsCountLabel: string;
}) => (
  <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
    <Card className="p-6 md:p-8 mb-5 bg-secondary/50 border-border/60">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-cta text-accent-foreground grid place-items-center shadow-gold shrink-0">
          <Icon className="h-7 w-7" />
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary truncate">{title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {docs.length} {docsCountLabel}
          </p>
        </div>
      </div>
    </Card>

    <div className="grid sm:grid-cols-2 gap-3">
      {docs.map((d) => (
        <DocCard
          key={d.id}
          title={tx(d.title)}
          year={d.year}
          fileName={d.fileName}
          downloadLabel={downloadLabel}
        />
      ))}
    </div>
  </div>
);

const DocCard = ({
  title,
  year,
  fileName,
  downloadLabel,
}: {
  title: string;
  year: number;
  fileName: string;
  downloadLabel: string;
}) => (
  <Card className="p-4 group hover:shadow-soft hover:border-accent/50 transition-smooth flex items-start gap-3">
    <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
      <FileText className="h-5 w-5" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-2">{title}</h3>
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <Badge className="bg-accent text-accent-foreground border-0 font-bold text-[10px]">
          {year}
        </Badge>
        <span className="text-[11px] text-muted-foreground truncate">{fileName}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="mt-3 -ms-2 h-8 text-primary hover:text-primary-foreground hover:bg-primary"
      >
        <Download className="h-3.5 w-3.5" />
        <span className="text-xs font-semibold">{downloadLabel}</span>
      </Button>
    </div>
  </Card>
);

export default Governance;
