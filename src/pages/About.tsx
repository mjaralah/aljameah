// صفحة "من نحن" — تتضمن النشأة، الرؤية، الرسالة، الأهداف، الحوكمة، والهيكل التنظيمي
import { useEffect, useState } from "react";
import {
  Sparkles,
  Eye,
  Target,
  Crosshair,
  ListChecks,
  Users,
  UserCog,
  UserSquare2,
  Network,
  BadgeCheck,
  ShieldCheck,
  Heart,
  Handshake,
  Lightbulb,
  ArrowLeft,
  Award,
  Clock,
  CalendarCheck,
  FileDown,
  ScrollText,
} from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { PageFeedback } from "@/components/layout/PageFeedback";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { board as fallbackBoard } from "@/data/board";
import { useBoardMembers, useBoardSettings, useAboutContent, type DBAboutSection } from "@/hooks/usePublicContent";
import { useLanguage } from "@/contexts/LanguageContext";
import ceoPortrait from "@/assets/ceo-portrait.jpg";

type Section = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const sections: Section[] = [
  { id: "founding", label: "النشأة والتأسيس", icon: Sparkles },
  { id: "vision", label: "الرؤية", icon: Eye },
  { id: "mission", label: "الرسالة", icon: Target },
  { id: "strategic", label: "الأهداف الاستراتيجية", icon: Crosshair },
  { id: "operational", label: "الأهداف التشغيلية", icon: ListChecks },
  { id: "assembly", label: "الجمعية العمومية", icon: Users },
  { id: "board", label: "أعضاء مجلس الإدارة", icon: UserSquare2 },
  { id: "ceo", label: "المدير التنفيذي", icon: UserCog },
  { id: "structure", label: "الهيكل التنظيمي", icon: Network },
  { id: "registration", label: "شهادة التسجيل", icon: BadgeCheck },
];

const strategicGoals = [
  { t: "تعزيز الأثر المجتمعي", d: "توسيع نطاق برامجنا لتصل إلى شرائح أوسع من المستفيدين بجودة عالية." },
  { t: "الاستدامة المالية", d: "تنويع مصادر الدخل وبناء أوقاف تضمن استمرارية العطاء." },
  { t: "التحوّل الرقمي", d: "رقمنة الخدمات والإجراءات لتعزيز الكفاءة والشفافية." },
  { t: "تمكين الكوادر البشرية", d: "تطوير قدرات الموظفين والمتطوعين عبر برامج تدريب نوعية." },
  { t: "الشراكات الاستراتيجية", d: "بناء تحالفات مع القطاعين الحكومي والخاص لمضاعفة الأثر." },
  { t: "الحوكمة", d: "تطبيق أعلى معايير الحوكمة وفق رؤية المملكة 2030." },
];

const operationalGoals = [
  "خدمة 50,000 مستفيد سنوياً عبر برامج الجمعية المختلفة",
  "إطلاق 6 برامج تنموية نوعية خلال العام",
  "تدريب 500 متطوع على معايير العمل الخيري المؤسسي",
  "نشر التقارير المالية والتشغيلية ربع سنوياً",
  "تحقيق رضا المستفيدين بنسبة لا تقل عن 90%",
  "أتمتة 80% من الإجراءات الإدارية والمالية",
];

const values = [
  { icon: Heart, t: "الإحسان", d: "نعمل بإخلاص لخدمة الإنسان." },
  { icon: ShieldCheck, t: "الأمانة", d: "نحفظ ما يُؤتمن إلينا بمسؤولية." },
  { icon: Handshake, t: "التعاون", d: "نُؤمن بأن الأثر الكبير ثمرة عمل جماعي." },
  { icon: Lightbulb, t: "الإبداع", d: "نبتكر حلولاً مستدامة لتحديات المجتمع." },
];

const About = () => {
  const { t } = useLanguage();
  const [active, setActive] = useState<string>("founding");
  const { data: dbBoard } = useBoardMembers();
  const { data: dbBoardSettings } = useBoardSettings();
  const { data: dbAbout } = useAboutContent();

  // Map about_content rows by section_key for easy access
  const aboutMap = (dbAbout ?? []).reduce<Record<string, DBAboutSection>>((acc, s) => {
    acc[s.section_key] = s;
    return acc;
  }, {});
  const get = (key: string, fallback: string) => aboutMap[key]?.content ?? fallback;
  const getTitle = (key: string, fallback: string) => aboutMap[key]?.title ?? fallback;
  const getData = <T,>(key: string, fallback: T): T => {
    const d = aboutMap[key]?.data;
    return (d ?? fallback) as T;
  };

  const dbStrategicGoals = getData<{ title: string; desc: string }[]>("strategic", []).length
    ? getData<{ goals: { title: string; desc: string }[] }>("strategic", { goals: [] }).goals
    : strategicGoals.map((g) => ({ title: g.t, desc: g.d }));
  const dbOperationalGoals = getData<{ items: string[] }>("operational", { items: operationalGoals }).items;
  const dbValues = getData<{ values: { icon: string; title: string; desc: string }[] }>("mission", { values: [] }).values;
  const valuesIconMap: Record<string, React.ComponentType<{ className?: string }>> = { Heart, ShieldCheck, Handshake, Lightbulb };
  const dbAssemblyCards = getData<{ cards: { title: string; body: string }[] }>("assembly", { cards: [] }).cards;
  const dbFoundingStats = getData<{ stats: { value: string; label: string }[] }>("founding", { stats: [] }).stats;
  const ceoData = getData<{ name: string; title: string; photo_url: string | null }>("ceo", { name: "أ. فيصل عبدالعزيز", title: "المدير التنفيذي", photo_url: null });

  // مزج بيانات قاعدة البيانات مع الاحتياطية
  const boardItems = (dbBoard && dbBoard.length > 0)
    ? dbBoard.map((m) => ({
        id: m.id,
        name: m.full_name,
        role: m.position,
        bio: m.bio ?? "",
        photo: m.photo_url,
        term: m.term_duration ?? "",
      }))
    : fallbackBoard.map((m) => ({
        id: m.id,
        name: m.name.ar,
        role: m.role.ar,
        bio: m.bio.ar,
        photo: undefined as string | undefined,
        term: "",
      }));
  // مراقبة أقسام الصفحة لإبراز العنصر النشط في القائمة الجانبية
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleNav = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <PageHero
        eyebrow="تعرّف علينا"
        title={t.about.title}
        lead="جمعيةٌ خيرية مرخّصة، تنطلق من قيم العطاء والأمانة لتُسهم في بناء مجتمعٍ متكافل، وتعمل وفق أعلى معايير الحوكمة."
        breadcrumb={[{ label: t.about.title }]}
      />

      <section className="container py-10 md:py-14">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* قائمة جانبية ثابتة */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card className="overflow-hidden border-border/60 shadow-soft">
              <div className="bg-gradient-primary text-primary-foreground px-5 py-4">
                <h2 className="text-base font-bold">محتويات الصفحة</h2>
                <p className="text-xs opacity-90 mt-0.5">انتقل إلى أيّ قسم بنقرة</p>
              </div>
              <nav className="p-2">
                <ul className="space-y-1">
                  {sections.map((s) => {
                    const Icon = s.icon;
                    const isActive = active === s.id;
                    return (
                      <li key={s.id}>
                        <button
                          onClick={() => handleNav(s.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth text-right ${
                            isActive
                              ? "bg-primary text-primary-foreground shadow-soft"
                              : "text-foreground hover:bg-secondary"
                          }`}
                          aria-current={isActive ? "true" : undefined}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? "" : "text-accent"}`} />
                          <span className="flex-1">{s.label}</span>
                          {isActive && <ArrowLeft className="h-3.5 w-3.5" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </Card>
          </aside>

          {/* المحتوى */}
          <div className="space-y-10 md:space-y-14 min-w-0">
            {/* النشأة والتأسيس */}
            <SectionBlock id="founding" icon={Sparkles} title={getTitle("founding", "النشأة والتأسيس")}>
              {(get("founding", "").split("\n\n").filter(Boolean).length
                ? get("founding", "").split("\n\n").filter(Boolean)
                : [
                    "تأسست جمعية العطاء الخيرية عام 2020م بقرار من المركز الوطني لتنمية القطاع الغير ربحي، تحت السجل رقم 1234/2020.",
                    "بدأت رحلتنا بفريقٍ صغير من المؤمنين بقيمة العطاء، ونمت لتصبح اليوم منصةً وطنيةً تخدم آلاف الأسر سنوياً.",
                  ]
              ).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              <div className="grid sm:grid-cols-3 gap-4 mt-6">
                {(dbFoundingStats.length > 0 ? dbFoundingStats : [
                  { value: "2020", label: "سنة التأسيس" },
                  { value: "+5", label: "سنوات من العطاء" },
                  { value: "+50K", label: "مستفيد ومستفيدة" },
                ]).map((s) => (
                  <Stat key={s.label} value={s.value} label={s.label} />
                ))}
              </div>
            </SectionBlock>

            {/* الرؤية */}
            <SectionBlock id="vision" icon={Eye} title={getTitle("vision", "الرؤية")} accent="gold">
              <div className="bg-gradient-to-br from-accent-soft to-card border-r-4 border-accent rounded-2xl p-6 md:p-8">
                <p className="text-lg md:text-xl font-semibold leading-loose text-primary">
                  "{get("vision", "أن نكون جمعيةً رائدةً في العمل الخيري المؤسسي، نُلهم العطاء ونصنع أثراً مستداماً في حياة الإنسان والمجتمع.")}"
                </p>
              </div>
            </SectionBlock>

            {/* الرسالة */}
            <SectionBlock id="mission" icon={Target} title={getTitle("mission", "الرسالة")}>
              <div className="bg-gradient-to-br from-secondary to-card border-r-4 border-primary rounded-2xl p-6 md:p-8">
                <p className="text-base md:text-lg leading-loose">
                  {get("mission", "تقديم برامج وخدمات نوعية للفئات المحتاجة في مجالات التعليم والصحة والإغاثة والتنمية، عبر فريقٍ مؤهَّل وشراكاتٍ فاعلة، وبأعلى معايير الجودة والحوكمة.")}
                </p>
              </div>

              <h3 className="text-lg font-bold text-primary mt-8 mb-4">قيمنا الجوهرية</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(dbValues.length > 0
                  ? dbValues.map((v) => ({ icon: valuesIconMap[v.icon] ?? Heart, t: v.title, d: v.desc }))
                  : values
                ).map((v) => {
                  const Icon = v.icon;
                  return (
                    <div
                      key={v.t}
                      className="group bg-card border border-border rounded-xl p-5 text-center hover:shadow-card hover:-translate-y-1 transition-smooth"
                    >
                      <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-primary text-primary-foreground grid place-items-center mb-3 group-hover:scale-110 transition-smooth">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h4 className="font-bold text-primary mb-1">{v.t}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{v.d}</p>
                    </div>
                  );
                })}
              </div>
            </SectionBlock>

            {/* الأهداف الاستراتيجية */}
            <SectionBlock id="strategic" icon={Crosshair} title={getTitle("strategic", "الأهداف الاستراتيجية")}>
              <p>{get("strategic", "أهدافٌ بعيدة المدى تُشكّل بوصلة عمل الجمعية للسنوات القادمة:")}</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                {dbStrategicGoals.map((g, i) => (
                  <div
                    key={g.title + i}
                    className="relative bg-card border border-border rounded-xl p-5 hover:border-accent hover:shadow-soft transition-smooth"
                  >
                    <span className="absolute -top-3 -right-3 h-9 w-9 rounded-full bg-gradient-gold text-accent-foreground grid place-items-center font-bold text-sm shadow-gold">
                      {i + 1}
                    </span>
                    <h4 className="font-bold text-primary mb-1.5 mt-1">{g.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{g.desc}</p>
                  </div>
                ))}
              </div>
            </SectionBlock>

            {/* الأهداف التشغيلية */}
            <SectionBlock id="operational" icon={ListChecks} title={getTitle("operational", "الأهداف التشغيلية")}>
              <p>{get("operational", "مؤشرات أداء سنوية قابلة للقياس، نَعمل عليها بشكلٍ مباشر:")}</p>
              <ul className="grid sm:grid-cols-2 gap-3 mt-4">
                {dbOperationalGoals.map((g, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 bg-secondary/40 border border-border rounded-lg p-4"
                  >
                    <span className="mt-0.5 h-6 w-6 shrink-0 rounded-md bg-primary text-primary-foreground grid place-items-center text-xs font-bold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm leading-relaxed">{g}</span>
                  </li>
                ))}
              </ul>
            </SectionBlock>

            {/* الجمعية العمومية */}
            <SectionBlock id="assembly" icon={Users} title={getTitle("assembly", "الجمعية العمومية")}>
              <p>{get("assembly", "الجمعية العمومية هي السلطة العليا في الجمعية، وتتألف من جميع الأعضاء المؤسسين والعاملين الذين أوفوا بالتزاماتهم وفق النظام الأساسي.")}</p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                {(dbAssemblyCards.length > 0 ? dbAssemblyCards : [
                  { title: "الاختصاصات", body: "إقرار الخطط والسياسات، اعتماد التقارير المالية والإدارية، انتخاب مجلس الإدارة." },
                  { title: "الاجتماعات", body: "اجتماع عادي سنوي، واجتماعات غير عادية عند الحاجة وفق نظام الجمعيات." },
                  { title: "الأعضاء", body: "عضويةٌ مفتوحة وفق الشروط النظامية، مع حقوق متساوية في التصويت." },
                ]).map((c) => (
                  <InfoCard key={c.title} title={c.title} body={c.body} />
                ))}
              </div>
            </SectionBlock>

            {/* أعضاء مجلس الإدارة */}
            <SectionBlock id="board" icon={UserSquare2} title="أعضاء مجلس الإدارة">
              <p>
                نخبةٌ من الكفاءات المتطوّعة لخدمة رسالة الجمعية، يُمثّلون تنوعاً في
                الخبرات والتخصصات.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-6">
                {boardItems.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-start gap-4 bg-card border border-border rounded-xl p-5 hover:shadow-card transition-smooth"
                  >
                    <div className="h-14 w-14 shrink-0 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center font-bold text-lg overflow-hidden">
                      {m.photo ? (
                        <img src={m.photo} alt={m.name} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        m.name.split(" ").slice(-1)[0][0]
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-primary">{m.name}</h4>
                      <Badge variant="secondary" className="mt-1 mb-2 text-xs">
                        {m.role}
                      </Badge>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {m.bio}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionBlock>

            {/* المدير التنفيذي */}
            <SectionBlock id="ceo" icon={UserCog} title={getTitle("ceo", "المدير التنفيذي")}>
              <div className="bg-gradient-to-br from-secondary to-card border border-border rounded-2xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="h-24 w-24 md:h-28 md:w-28 shrink-0 rounded-2xl overflow-hidden ring-2 ring-accent/40 shadow-card">
                    <img
                      src={ceoData.photo_url || ceoPortrait}
                      alt={`صورة المدير التنفيذي ${ceoData.name}`}
                      width={256}
                      height={256}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-primary">{ceoData.name}</h3>
                    <Badge className="bg-accent text-accent-foreground hover:bg-accent/90 mt-2 mb-3">
                      {ceoData.title}
                    </Badge>
                    <p className="leading-loose text-sm md:text-base">
                      {get("ceo", "يقود المدير التنفيذي العمل اليومي للجمعية وفق توجيهات مجلس الإدارة، ويُشرف على تنفيذ الخطط الاستراتيجية والتشغيلية، ويُمثّل الجمعية في الشراكات والمحافل الوطنية.")}
                    </p>
                  </div>
                </div>
              </div>
            </SectionBlock>

            {/* الهيكل التنظيمي */}
            <SectionBlock id="structure" icon={Network} title="الهيكل التنظيمي">
              <p>هيكلٌ مرنٌ يضمن وضوح المسؤوليات وفعالية اتخاذ القرار:</p>
              <div className="mt-6 space-y-3">
                <OrgNode level={0} title="الجمعية العمومية" subtitle="السلطة العليا" />
                <OrgConnector />
                <OrgNode level={1} title="مجلس الإدارة" subtitle="الإشراف والحوكمة" />
                <OrgConnector />
                <OrgNode level={2} title="المدير التنفيذي" subtitle="القيادة التنفيذية" />
                <OrgConnector />
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { t: "إدارة البرامج", d: "تنفيذ المبادرات والمشاريع" },
                    { t: "الإدارة المالية", d: "المحاسبة والتدقيق" },
                    { t: "الموارد البشرية", d: "التوظيف والتطوير" },
                    { t: "العلاقات والإعلام", d: "الشراكات والتواصل" },
                  ].map((d) => (
                    <div
                      key={d.t}
                      className="bg-card border border-border rounded-xl p-4 text-center hover:border-accent transition-smooth"
                    >
                      <h5 className="font-bold text-primary text-sm mb-1">{d.t}</h5>
                      <p className="text-xs text-muted-foreground">{d.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </SectionBlock>

            {/* شهادة التسجيل */}
            <SectionBlock id="registration" icon={BadgeCheck} title="شهادة التسجيل">
              <div className="relative overflow-hidden bg-gradient-to-br from-card to-accent-soft border-2 border-accent/40 rounded-2xl p-6 md:p-8">
                <div className="absolute top-4 left-4 opacity-10">
                  <Award className="h-32 w-32 text-accent" />
                </div>
                <div className="relative">
                  <Badge className="bg-success text-success-foreground mb-4">
                    <BadgeCheck className="h-3.5 w-3.5 ml-1" />
                    جهة مرخّصة وموثّقة
                  </Badge>
                  <h3 className="text-xl font-bold text-primary mb-4">
                    شهادة تسجيل سارية المفعول
                  </h3>
                  <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                    <InfoRow label="رقم التسجيل" value="1234/2020" />
                    <InfoRow label="جهة الإصدار" value="المركز الوطني لتنمية القطاع غير الربحي" />
                    <InfoRow label="تاريخ التأسيس" value="1442/05/15هـ" />
                    <InfoRow label="حالة الترخيص" value="ساري" valueClass="text-success" />
                    <InfoRow label="نوع النشاط" value="جمعية خيرية متعددة الأغراض" />
                    <InfoRow label="المقر الرئيسي" value="الرياض، المملكة العربية السعودية" />
                  </dl>
                  <Button className="mt-6 bg-primary hover:bg-primary/90">
                    تحميل نسخة الشهادة (PDF)
                  </Button>
                </div>
              </div>
            </SectionBlock>
          </div>
        </div>
      </section>

      <PageFeedback pageKey="about" />
    </>
  );
};

// مكوّنات مساعدة داخلية
const SectionBlock = ({
  id,
  icon: Icon,
  title,
  children,
  accent = "primary",
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  accent?: "primary" | "gold";
}) => (
  <article id={id} className="scroll-mt-24">
    <header className="flex items-center gap-3 mb-5">
      <div
        className={`h-11 w-11 rounded-xl grid place-items-center shadow-soft ${
          accent === "gold"
            ? "bg-gradient-gold text-accent-foreground"
            : "bg-gradient-primary text-primary-foreground"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-2xl md:text-3xl font-extrabold text-primary">{title}</h2>
    </header>
    <div className="space-y-4 text-foreground/90 leading-loose text-[15px] md:text-base">
      {children}
    </div>
  </article>
);

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="bg-card border border-border rounded-xl p-5 text-center hover:shadow-soft transition-smooth">
    <div className="text-3xl font-extrabold text-accent mb-1">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

const InfoCard = ({ title, body }: { title: string; body: string }) => (
  <div className="bg-card border border-border rounded-xl p-5 hover:border-accent hover:shadow-soft transition-smooth">
    <h4 className="font-bold text-primary mb-2">{title}</h4>
    <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
  </div>
);

const InfoRow = ({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) => (
  <div className="flex justify-between items-center bg-card/70 border border-border rounded-lg px-4 py-2.5">
    <dt className="text-muted-foreground text-xs">{label}</dt>
    <dd className={`font-semibold ${valueClass}`}>{value}</dd>
  </div>
);

const OrgNode = ({
  level,
  title,
  subtitle,
}: {
  level: number;
  title: string;
  subtitle: string;
}) => {
  const styles = [
    "bg-gradient-primary text-primary-foreground",
    "bg-gradient-gold text-accent-foreground",
    "bg-card border-2 border-primary text-primary",
  ];
  return (
    <div
      className={`mx-auto max-w-md text-center rounded-xl px-5 py-4 shadow-soft ${styles[level] ?? styles[2]}`}
    >
      <div className="font-bold">{title}</div>
      <div className="text-xs opacity-90 mt-0.5">{subtitle}</div>
    </div>
  );
};

const OrgConnector = () => (
  <div className="mx-auto h-6 w-0.5 bg-border" aria-hidden />
);

export default About;
