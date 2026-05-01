import { Download, FileText, ShieldCheck, Wallet, FileBarChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { policies, reports, financials } from "@/data/governance";
import { PageHero } from "@/components/layout/PageHero";
import { PageFeedback } from "@/components/layout/PageFeedback";

const Governance = () => {
  const { t, tx, lang } = useLanguage();

  return (
    <>
      <PageHero
        eyebrow={t.brand.verified}
        title={t.pages.governance.heading}
        lead={t.pages.governance.lead}
        breadcrumb={[{ label: t.nav.governance }]}
      />

      {/* الإفصاح المالي */}
      <section className="container py-12 md:py-16">
        <SectionHeader icon={Wallet} title={t.pages.governance.financials} />
        <div className="grid md:grid-cols-3 gap-5 mb-6">
          <KpiCard
            label={t.pages.governance.revenue}
            value={financials.totalRevenue}
            currency={t.pages.governance.currency}
            tone="primary"
          />
          <KpiCard
            label={t.pages.governance.expenses}
            value={financials.totalExpenses}
            currency={t.pages.governance.currency}
            tone="accent"
          />
          <Card className="p-6 flex flex-col justify-center bg-gradient-primary text-primary-foreground">
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">
              {t.pages.governance.year}
            </span>
            <span className="text-4xl font-extrabold mt-1">{financials.year}</span>
            <span className="text-xs opacity-80 mt-1">{t.brand.verified}</span>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="font-bold text-primary mb-5">{t.pages.governance.allocation}</h3>
          <div className="space-y-4">
            {financials.allocation.map((a) => (
              <div key={a.key}>
                <div className="flex items-center justify-between mb-1.5 text-sm">
                  <span className="font-semibold text-foreground">
                    {lang === "ar" ? a.labelAr : a.labelEn}
                  </span>
                  <span className="font-bold text-primary tabular-nums">{a.pct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-gradient-cta rounded-full transition-all duration-700"
                    style={{ width: `${a.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
      {/* السياسات والتقارير */}
      <section className="container py-12 md:py-16 grid lg:grid-cols-2 gap-10">
        <div>
          <SectionHeader icon={ShieldCheck} title={t.pages.governance.policies} />
          <div className="space-y-3">
            {policies.map((p) => (
              <DocRow key={p.id} title={tx(p.title)} year={p.year} fileName={p.fileName} downloadLabel={t.pages.governance.download} />
            ))}
          </div>
        </div>
        <div>
          <SectionHeader icon={FileBarChart} title={t.pages.governance.reports} />
          <div className="space-y-3">
            {reports.map((r) => (
              <DocRow key={r.id} title={tx(r.title)} year={r.year} fileName={r.fileName} downloadLabel={t.pages.governance.download} />
            ))}
          </div>
        </div>
      </section>

      <PageFeedback pageKey="governance" />
    </>
  );
};

const SectionHeader = ({ icon: Icon, title }: { icon: React.FC<{ className?: string }>; title: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="h-10 w-10 rounded-xl bg-accent/15 text-accent grid place-items-center">
      <Icon className="h-5 w-5" />
    </div>
    <h2 className="text-2xl md:text-3xl font-extrabold text-primary">{title}</h2>
  </div>
);

const KpiCard = ({
  label,
  value,
  currency,
  tone,
}: {
  label: string;
  value: number;
  currency: string;
  tone: "primary" | "accent";
}) => (
  <Card className="p-6">
    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
    <div className="mt-2 flex items-baseline gap-2">
      <span className={tone === "primary" ? "text-3xl font-extrabold text-primary tabular-nums" : "text-3xl font-extrabold text-accent tabular-nums"}>
        {value.toLocaleString()}
      </span>
      <span className="text-sm font-semibold text-muted-foreground">{currency}</span>
    </div>
  </Card>
);

const DocRow = ({ title, year, fileName, downloadLabel }: { title: string; year: number; fileName: string; downloadLabel: string }) => (
  <Card className="p-4 flex items-center gap-4 hover:shadow-soft hover:border-accent/40 transition-smooth">
    <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
      <FileText className="h-5 w-5" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-foreground truncate">{title}</h3>
      <p className="text-xs text-muted-foreground mt-0.5">
        <Badge variant="secondary" className="bg-secondary text-secondary-foreground font-bold">
          {year}
        </Badge>
        <span className="mx-2">·</span>
        {fileName}
      </p>
    </div>
    <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground shrink-0">
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">{downloadLabel}</span>
    </Button>
  </Card>
);

export default Governance;
