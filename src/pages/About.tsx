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
import { CustomAboutSection } from "@/components/about/CustomAboutSection";
import { AssemblyMembersView } from "@/components/about/sections/AssemblyMembersView";
import { defaultAssemblyData } from "@/components/admin/about/AssemblyMembersEditor";

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
  const _rawAssemblyView = getData<{ view_mode?: string }>("assembly", {}).view_mode;
  const assemblyViewMode: "cards" | "members" | "both" =
    _rawAssemblyView === "members" ? "members" : _rawAssemblyView === "both" ? "both" : "cards";
  const assemblyMembersData = getData<{ assembly?: any }>("assembly", {}).assembly;
  const dbFoundingStats = getData<{ stats: { value: string; label: string }[] }>("founding", { stats: [] }).stats;
  const ceoData = getData<{ name: string; title: string; photo_url: string | null }>("ceo", { name: "أ. فيصل عبدالعزيز", title: "المدير التنفيذي", photo_url: null });
  const structureData = getData<{
    display_mode?: string;
    image_url?: string;
    nodes: { title: string; subtitle: string }[];
    departments: {
      title: string; title_en?: string; desc: string; desc_en?: string;
      sections?: {
        title?: string; title_en?: string; desc?: string; desc_en?: string;
        units?: { title?: string; title_en?: string; desc?: string; desc_en?: string }[];
      }[];
    }[];
  }>("structure", {
    nodes: [
      { title: "الجمعية العمومية", subtitle: "السلطة العليا" },
      { title: "مجلس الإدارة", subtitle: "الإشراف والحوكمة" },
      { title: "المدير التنفيذي", subtitle: "القيادة التنفيذية" },
    ],
    departments: [
      { title: "إدارة البرامج", desc: "تنفيذ المبادرات والمشاريع" },
      { title: "الإدارة المالية", desc: "المحاسبة والتدقيق" },
      { title: "الموارد البشرية", desc: "التوظيف والتطوير" },
      { title: "العلاقات والإعلام", desc: "الشراكات والتواصل" },
    ],
  });
  const registrationData = getData<{ display_mode?: string; image_url?: string; badge_label: string; heading: string; rows: { label: string; value: string }[]; pdf_url: string }>("registration", {
    badge_label: "جهة مرخّصة وموثّقة",
    heading: "شهادة تسجيل سارية المفعول",
    rows: [
      { label: "رقم التسجيل", value: "1234/2020" },
      { label: "جهة الإصدار", value: "المركز الوطني لتنمية القطاع غير الربحي" },
      { label: "تاريخ التأسيس", value: "1442/05/15هـ" },
      { label: "حالة الترخيص", value: "ساري" },
      { label: "نوع النشاط", value: "جمعية خيرية متعددة الأغراض" },
      { label: "المقر الرئيسي", value: "الرياض، المملكة العربية السعودية" },
    ],
    pdf_url: "",
  });

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

  // ترتيب الأقسام من قاعدة البيانات (sort_order)
  const orderMap: Record<string, number> = {};
  (dbAbout ?? []).forEach((s) => { orderMap[s.section_key] = s.sort_order; });
  const orderOf = (key: string, fallback: number) => orderMap[key] ?? fallback;
  const orderedNav = [...sections]
    .map((s, i) => ({ ...s, _order: orderOf(s.id, (i + 1) * 10) }))
    .sort((a, b) => a._order - b._order);


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
                  {orderedNav.map((s) => {
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
          <div className="flex flex-col gap-10 md:gap-14 min-w-0">
            {/* النشأة والتأسيس */}
            <SectionBlock id="founding" icon={Sparkles} title={getTitle("founding", "النشأة والتأسيس")} order={orderOf("founding", 10)}>
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
            <SectionBlock id="vision" icon={Eye} title={getTitle("vision", "الرؤية")} accent="gold" order={orderOf("vision", 20)}>
              <div className="bg-gradient-to-br from-accent-soft to-card border-r-4 border-accent rounded-2xl p-6 md:p-8">
                <p className="text-lg md:text-xl font-semibold leading-loose text-primary">
                  "{get("vision", "أن نكون جمعيةً رائدةً في العمل الخيري المؤسسي، نُلهم العطاء ونصنع أثراً مستداماً في حياة الإنسان والمجتمع.")}"
                </p>
              </div>
            </SectionBlock>

            {/* الرسالة */}
            <SectionBlock id="mission" icon={Target} title={getTitle("mission", "الرسالة")} order={orderOf("mission", 30)}>
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
            <SectionBlock id="strategic" icon={Crosshair} title={getTitle("strategic", "الأهداف الاستراتيجية")} order={orderOf("strategic", 40)}>
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
            <SectionBlock id="operational" icon={ListChecks} title={getTitle("operational", "الأهداف التشغيلية")} order={orderOf("operational", 50)}>
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
            <SectionBlock id="assembly" icon={Users} title={getTitle("assembly", "الجمعية العمومية")} order={orderOf("assembly", 80)}>
              <p>{get("assembly", "الجمعية العمومية هي السلطة العليا في الجمعية، وتتألف من جميع الأعضاء المؤسسين والعاملين الذين أوفوا بالتزاماتهم وفق النظام الأساسي.")}</p>
              {assemblyViewMode !== "members" && (
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  {(dbAssemblyCards.length > 0 ? dbAssemblyCards : [
                    { title: "الاختصاصات", body: "إقرار الخطط والسياسات، اعتماد التقارير المالية والإدارية، انتخاب مجلس الإدارة." },
                    { title: "الاجتماعات", body: "اجتماع عادي سنوي، واجتماعات غير عادية عند الحاجة وفق نظام الجمعيات." },
                    { title: "الأعضاء", body: "عضويةٌ مفتوحة وفق الشروط النظامية، مع حقوق متساوية في التصويت." },
                  ]).map((c) => (
                    <InfoCard key={c.title} title={c.title} body={c.body} />
                  ))}
                </div>
              )}
              {assemblyViewMode !== "cards" && (
                <div className="mt-8">
                  {assemblyViewMode === "both" && (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px flex-1 bg-border" />
                      <h3 className="text-sm font-semibold text-muted-foreground tracking-wide">
                        أعضاء الجمعية العمومية
                      </h3>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  )}
                  <AssemblyMembersView data={{ ...defaultAssemblyData(), ...(assemblyMembersData || {}) }} />
                </div>
              )}
            </SectionBlock>

            {/* أعضاء مجلس الإدارة */}
            <SectionBlock id="board" icon={UserSquare2} title={getTitle("board", "أعضاء مجلس الإدارة")} order={orderOf("board", 85)}>
              <p>
                {get(
                  "board",
                  dbBoardSettings?.intro_text ||
                    "نخبةٌ من الكفاءات المتطوّعة لخدمة رسالة الجمعية، يُمثّلون تنوعاً في الخبرات والتخصصات.",
                )}
              </p>

              <div className="grid lg:grid-cols-4 gap-5 mt-6">
                {/* البطاقات */}
                <div className="lg:col-span-3 lg:order-last grid sm:grid-cols-2 gap-4">
                  {boardItems.map((m) => (
                    <div
                      key={m.id}
                      className="flex flex-col bg-card border border-border rounded-xl p-5 hover:shadow-card transition-smooth"
                    >
                      <div className="flex items-start gap-4">
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
                      {m.term && (
                        <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-xs text-primary/80">
                          <Clock className="h-3.5 w-3.5 text-accent" />
                          <span>مدة الدورة: <span className="font-semibold">{m.term}</span></span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* لوحة جانبية يمنى */}
                <aside className="lg:col-span-1 order-first lg:order-first self-start">
                  <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
                    {dbBoardSettings?.term_duration_label && (
                      <div className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 text-center">
                        <Clock className="h-6 w-6 text-accent mx-auto mb-2" />
                        <div className="text-2xl font-extrabold text-primary leading-none">
                          {dbBoardSettings.term_duration_label}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">مدة دورة مجلس الإدارة</div>
                      </div>
                    )}

                    {((dbBoardSettings?.show_hijri && dbBoardSettings?.term_end_hijri) ||
                      (dbBoardSettings?.show_gregorian && dbBoardSettings?.term_end_gregorian)) && (
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <CalendarCheck className="h-5 w-5 text-accent" />
                          <h4 className="font-bold text-primary text-sm">تاريخ انتهاء العضويات لدورة المجلس</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          {dbBoardSettings?.show_hijri && dbBoardSettings?.term_end_hijri && (
                            <div className="flex items-center justify-between gap-3 p-2 rounded-md bg-muted/40">
                              <span className="text-xs text-muted-foreground">هجري</span>
                              <span className="font-semibold text-primary" dir="ltr">{dbBoardSettings.term_end_hijri}</span>
                            </div>
                          )}
                          {dbBoardSettings?.show_gregorian && dbBoardSettings?.term_end_gregorian && (
                            <div className="flex items-center justify-between gap-3 p-2 rounded-md bg-muted/40">
                              <span className="text-xs text-muted-foreground">ميلادي</span>
                              <span className="font-semibold text-primary" dir="ltr">{dbBoardSettings.term_end_gregorian}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {dbBoardSettings?.formation_decree_url && (
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <ScrollText className="h-5 w-5 text-accent" />
                          <h4 className="font-bold text-primary text-sm">ملف إفصاح المصالح</h4>
                        </div>
                        <Button asChild variant="outline" className="w-full">
                          <a
                            href={dbBoardSettings.formation_decree_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                          >
                            <FileDown className="h-4 w-4 ml-2" />
                            {dbBoardSettings.formation_decree_name || "تحميل الملف المرفق"}
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            </SectionBlock>

            {/* المدير التنفيذي */}
            <SectionBlock id="ceo" icon={UserCog} title={getTitle("ceo", "المدير التنفيذي")} order={orderOf("ceo", 60)}>
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
            <SectionBlock id="structure" icon={Network} title={getTitle("structure", "الهيكل التنظيمي")} order={orderOf("structure", 70)}>
              {structureData.display_mode === "image" && structureData.image_url ? (
                <div className="mt-2 rounded-2xl border border-border bg-card p-3 sm:p-4">
                  <img
                    src={structureData.image_url}
                    alt={getTitle("structure", "الهيكل التنظيمي")}
                    loading="lazy"
                    className="w-full h-auto max-h-[640px] object-contain mx-auto rounded-lg"
                  />
                </div>
              ) : (
                <>
                  <p>{get("structure", "هيكلٌ مرنٌ يضمن وضوح المسؤوليات وفعالية اتخاذ القرار:")}</p>
                  <div className="mt-6 space-y-3">
                    {structureData.nodes.map((n, i) => (
                      <div key={i}>
                        <OrgNode level={i} title={n.title} subtitle={n.subtitle} />
                        {i < structureData.nodes.length - 1 && <OrgConnector />}
                      </div>
                    ))}
                    {structureData.departments.length > 0 && (
                      <>
                        <OrgConnector />
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {structureData.departments.map((d) => (
                            <div
                              key={d.title}
                              className="bg-card border border-border rounded-xl p-4 text-center hover:border-accent transition-smooth"
                            >
                              <h5 className="font-bold text-primary text-sm mb-1">{d.title}</h5>
                              <p className="text-xs text-muted-foreground">{d.desc}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </SectionBlock>

            {/* شهادة التسجيل */}
            <SectionBlock id="registration" icon={BadgeCheck} title={getTitle("registration", "شهادة التسجيل")} order={orderOf("registration", 90)}>
              <div className="relative overflow-hidden bg-gradient-to-br from-card to-accent-soft border-2 border-accent/40 rounded-2xl p-6 md:p-8">
                <div className="absolute top-4 left-4 opacity-10">
                  <Award className="h-32 w-32 text-accent" />
                </div>
                <div className="relative">
                  <Badge className="bg-success text-success-foreground mb-4">
                    <BadgeCheck className="h-3.5 w-3.5 ml-1" />
                    {registrationData.badge_label}
                  </Badge>
                  <h3 className="text-xl font-bold text-primary mb-4">
                    {registrationData.heading}
                  </h3>
                  {registrationData.display_mode === "image" && registrationData.image_url ? (
                    <div className="rounded-xl border border-border bg-background/60 p-3 sm:p-4">
                      <img
                        src={registrationData.image_url}
                        alt={registrationData.heading || "شهادة التسجيل"}
                        loading="lazy"
                        className="w-full h-auto max-h-[720px] object-contain mx-auto rounded-lg"
                      />
                    </div>
                  ) : (
                    <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                      {registrationData.rows.map((r) => (
                        <InfoRow
                          key={r.label}
                          label={r.label}
                          value={r.value}
                          valueClass={r.value === "ساري" ? "text-success" : ""}
                        />
                      ))}
                    </dl>
                  )}
                  {registrationData.pdf_url && (
                    <Button asChild className="mt-6 bg-primary hover:bg-primary/90">
                      <a href={registrationData.pdf_url} target="_blank" rel="noopener noreferrer">
                        <FileDown className="h-4 w-4 ml-2" />
                        تحميل نسخة الشهادة (PDF)
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </SectionBlock>

            {/* الأقسام المخصّصة المُضافة من اللوحة */}
            {(dbAbout ?? [])
              .filter((s) => s.section_key.startsWith("custom:"))
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((s) => (
                <div key={s.id} style={{ order: s.sort_order }}>
                  <CustomAboutSection id={s.section_key} data={s.data as any} />
                </div>
              ))}

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
  order,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  accent?: "primary" | "gold";
  order?: number;
}) => (
  <article id={id} className="scroll-mt-24" style={order !== undefined ? { order } : undefined}>
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
