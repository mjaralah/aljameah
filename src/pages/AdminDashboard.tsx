import { CheckCircle2, ClipboardList, FileText, HandCoins, Inbox, Newspaper, Plus, ShieldAlert, UserPlus, Users, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { PageHero } from "@/components/layout/PageHero";

const Admin = () => {
  const { t, lang } = useLanguage();

  const kpis = [
    { key: "donations", label: t.pages.admin.kpi.donations, value: "284,500", suffix: "ر.س", delta: "+12%", Icon: HandCoins, tone: "primary" as const },
    { key: "volunteers", label: t.pages.admin.kpi.newVolunteers, value: "47", delta: "+8", Icon: UserPlus, tone: "accent" as const },
    { key: "tickets", label: t.pages.admin.kpi.openTickets, value: "13", delta: "-3", Icon: Inbox, tone: "primary" as const },
    { key: "surveys", label: t.pages.admin.kpi.activeSurveys, value: "2", delta: "0", Icon: ClipboardList, tone: "accent" as const },
  ];

  const donations = [
    { donor: lang === "ar" ? "أحمد محمد" : "Ahmed M.", amount: 5000, date: "2025-04-22", status: "completed" },
    { donor: lang === "ar" ? "متبرع مجهول" : "Anonymous", amount: 1200, date: "2025-04-22", status: "completed" },
    { donor: lang === "ar" ? "نورة العلي" : "Noura A.", amount: 800, date: "2025-04-21", status: "pending" },
    { donor: lang === "ar" ? "شركة الإنماء" : "Inma Co.", amount: 25000, date: "2025-04-21", status: "completed" },
    { donor: lang === "ar" ? "خالد الزهراني" : "Khalid Z.", amount: 350, date: "2025-04-20", status: "completed" },
  ];

  const approvals = [
    { type: lang === "ar" ? "خبر جديد" : "News article", title: lang === "ar" ? "تخريج الدفعة الرابعة" : "Fourth cohort graduation", who: lang === "ar" ? "محرر المركز الإعلامي" : "Media editor", Icon: Newspaper },
    { type: lang === "ar" ? "متطوع جديد" : "New volunteer", title: lang === "ar" ? "سعد العمري — الرياض" : "Saad Al-Omari — Riyadh", who: lang === "ar" ? "نموذج التسجيل" : "Registration form", Icon: UserPlus },
    { type: lang === "ar" ? "وثيقة سياسة" : "Policy document", title: lang === "ar" ? "تحديث ميثاق السلوك" : "Code of conduct update", who: lang === "ar" ? "المستشار القانوني" : "Legal advisor", Icon: ShieldAlert },
  ];

  return (
    <>
      <PageHero
        eyebrow={t.pages.admin.welcome}
        title={t.pages.admin.heading}
        lead={t.pages.admin.lead}
        breadcrumb={[{ label: "Admin" }]}
      />

      {/* KPIs */}
      <section className="container py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {kpis.map(({ key, label, value, suffix, delta, Icon, tone }) => {
            const positive = delta.startsWith("+");
            return (
              <Card key={key} className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-11 w-11 rounded-xl grid place-items-center ${tone === "primary" ? "bg-primary/10 text-primary" : "bg-accent/15 text-accent"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge className={`border-0 font-bold ${positive ? "bg-success/15 text-success" : delta.startsWith("-") ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                    {delta}
                  </Badge>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
                <p className="text-2xl font-extrabold text-primary tabular-nums">
                  {value} {suffix && <span className="text-sm font-semibold text-muted-foreground">{suffix}</span>}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Quick actions */}
      <section className="container pb-4">
        <h2 className="text-lg font-bold text-primary mb-3">{t.pages.admin.quickActions}</h2>
        <div className="flex flex-wrap gap-3">
          <ActionBtn Icon={Newspaper} label={t.pages.admin.addNews} />
          <ActionBtn Icon={FileText} label={t.pages.admin.addProgram} />
          <ActionBtn Icon={ClipboardList} label={t.pages.admin.addSurvey} />
          <ActionBtn Icon={Users} label={t.pages.admin.manageTeam} />
        </div>
      </section>

      {/* Tables */}
      <section className="container py-10 grid lg:grid-cols-3 gap-6">
        {/* Donations */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-primary">{t.pages.admin.latestDonations}</h2>
            <Button variant="ghost" size="sm" className="text-primary font-semibold">{t.pages.admin.view}</Button>
          </div>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-start text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="text-start font-semibold py-2 px-2">{t.pages.admin.donor}</th>
                  <th className="text-start font-semibold py-2 px-2">{t.pages.admin.amount}</th>
                  <th className="text-start font-semibold py-2 px-2 hidden sm:table-cell">{t.pages.admin.date}</th>
                  <th className="text-start font-semibold py-2 px-2">{t.pages.admin.status}</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="py-3 px-2 font-semibold text-foreground">{d.donor}</td>
                    <td className="py-3 px-2 font-bold text-primary tabular-nums">{d.amount.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">ر.س</span></td>
                    <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">{new Date(d.date).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}</td>
                    <td className="py-3 px-2">
                      <Badge className={`border-0 font-bold ${d.status === "completed" ? "bg-success/15 text-success" : "bg-accent/15 text-accent"}`}>
                        {d.status === "completed" ? (lang === "ar" ? "مكتمل" : "Completed") : (lang === "ar" ? "قيد التحقق" : "Pending")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Approvals */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-primary mb-5">{t.pages.admin.pendingApprovals}</h2>
          <div className="space-y-3">
            {approvals.map((a, i) => (
              <div key={i} className="p-4 rounded-xl border border-border hover:border-accent/40 transition-smooth">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                    <a.Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-accent">{a.type}</p>
                    <p className="font-semibold text-foreground text-sm mt-0.5 truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.who}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90 flex-1">
                    <CheckCircle2 className="h-4 w-4" />
                    {t.pages.admin.approve}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                    <XCircle className="h-4 w-4" />
                    {t.pages.admin.reject}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  );
};

const ActionBtn = ({ Icon, label }: { Icon: React.FC<{ className?: string }>; label: string }) => (
  <Button variant="outline" className="border-border h-auto py-3 px-4 hover:border-primary hover:text-primary group">
    <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
      <Icon className="h-4 w-4" />
    </span>
    <span className="font-semibold">{label}</span>
    <Plus className="h-4 w-4 opacity-50" />
  </Button>
);

export default Admin;
