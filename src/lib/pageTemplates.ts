// قوالب الصفحات المخصّصة: لكل قالب قائمة أقسام مبدئية تُبذر عند الإنشاء
export type SeedSection = {
  section_key: string;
  title: string | null;
  content: string | null;
  data: Record<string, any>;
  sort_order: number;
  published?: boolean;
};

export type PageTemplate = {
  key: string;
  label: string;
  description: string;
  sections: SeedSection[];
};

const k = (prefix: string, i: number) => `${prefix}_${i}`;

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    key: "blank",
    label: "صفحة فارغة",
    description: "ابدأ من الصفر — صفحة بدون أقسام مبدئية.",
    sections: [],
  },
  {
    key: "landing",
    label: "صفحة هبوط/حملة",
    description: "بطل + إحصائيات + مزايا + دعوة + معرض.",
    sections: [
      {
        section_key: k("text_media", 0), title: null, content: null, sort_order: 10,
        data: {
          block_type: "text_media",
          title_ar: "عن الحملة", title_en: "About the campaign",
          content_ar: "<p>اشرح هنا الفكرة الرئيسية للحملة بإيجاز.</p>",
          content_en: "<p>Describe the campaign concisely here.</p>",
          direction: "image-right",
          cta_label_ar: "تبرع الآن", cta_label_en: "Donate now", cta_url: "/donate",
        },
      },
      {
        section_key: k("stats", 1), title: null, content: null, sort_order: 20,
        data: {
          block_type: "stats",
          title_ar: "أرقام الحملة", title_en: "Campaign in numbers",
          items: [
            { icon: "Users", value: 1200, label_ar: "مستفيد", label_en: "Beneficiaries" },
            { icon: "HandHeart", value: 350, label_ar: "متطوع", label_en: "Volunteers" },
            { icon: "DollarSign", value: 500000, suffix: " ر.س", label_ar: "تبرعات", label_en: "Donations" },
            { icon: "Calendar", value: 12, label_ar: "أسبوع", label_en: "Weeks" },
          ],
        },
      },
      {
        section_key: k("cards_grid", 2), title: null, content: null, sort_order: 30,
        data: {
          block_type: "cards_grid",
          title_ar: "لماذا تشاركنا؟", title_en: "Why join us?",
          columns: 3,
          items: [
            { icon: "Sparkles", title_ar: "أثر مباشر", title_en: "Direct impact", description_ar: "كل مساهمة تصنع فرقاً حقيقياً.", description_en: "Every contribution makes a real difference." },
            { icon: "ShieldCheck", title_ar: "شفافية كاملة", title_en: "Full transparency", description_ar: "تقارير دورية عن صرف التبرعات.", description_en: "Regular reports on how donations are spent." },
            { icon: "Heart", title_ar: "مجتمع واحد", title_en: "One community", description_ar: "انضم إلى آلاف الفاعلين.", description_en: "Join thousands of doers." },
          ],
        },
      },
      {
        section_key: k("cta_banner", 3), title: null, content: null, sort_order: 40,
        data: {
          block_type: "cta_banner",
          title_ar: "كن جزءاً من التغيير", title_en: "Be part of the change",
          content_ar: "<p>انضم إلينا اليوم وابدأ رحلة العطاء.</p>",
          content_en: "<p>Join us today and start your giving journey.</p>",
          cta_label_ar: "تبرع", cta_label_en: "Donate", cta_url: "/donate",
          secondary_cta_label_ar: "تطوع معنا", secondary_cta_label_en: "Volunteer", secondary_cta_url: "/e-services/volunteer",
        },
      },
    ],
  },
  {
    key: "program",
    label: "صفحة برنامج",
    description: "نظرة عامة + أهداف + إنجازات + معرض + تسجيل.",
    sections: [
      { section_key: k("text_media", 0), title: null, content: null, sort_order: 10, data: { block_type: "text_media", title_ar: "نظرة عامة", title_en: "Overview", content_ar: "<p>وصف عام للبرنامج.</p>", content_en: "<p>General program description.</p>", direction: "image-right" } },
      { section_key: k("cards_grid", 1), title: null, content: null, sort_order: 20, data: { block_type: "cards_grid", title_ar: "أهداف البرنامج", title_en: "Program goals", columns: 3, items: [{ icon: "Target", title_ar: "هدف 1", title_en: "Goal 1", description_ar: "...", description_en: "..." }, { icon: "Target", title_ar: "هدف 2", title_en: "Goal 2", description_ar: "...", description_en: "..." }, { icon: "Target", title_ar: "هدف 3", title_en: "Goal 3", description_ar: "...", description_en: "..." }] } },
      { section_key: k("stats", 2), title: null, content: null, sort_order: 30, data: { block_type: "stats", title_ar: "إنجازاتنا", title_en: "Our achievements", items: [{ icon: "Users", value: 500, label_ar: "مستفيد", label_en: "Beneficiaries" }, { icon: "Trophy", value: 20, label_ar: "ورشة", label_en: "Workshops" }, { icon: "Award", value: 15, label_ar: "شراكة", label_en: "Partnerships" }, { icon: "Star", value: 95, suffix: "%", label_ar: "رضا", label_en: "Satisfaction" }] } },
      { section_key: k("gallery", 3), title: null, content: null, sort_order: 40, data: { block_type: "gallery", title_ar: "من فعالياتنا", title_en: "From our events", items: [] } },
      { section_key: k("cta_banner", 4), title: null, content: null, sort_order: 50, data: { block_type: "cta_banner", title_ar: "سجّل في البرنامج", title_en: "Register for the program", cta_label_ar: "سجّل الآن", cta_label_en: "Register now", cta_url: "/e-services" } },
    ],
  },
  {
    key: "event",
    label: "صفحة فعالية",
    description: "وصف + جدول أعمال + موقع + تسجيل.",
    sections: [
      { section_key: k("text_media", 0), title: null, content: null, sort_order: 10, data: { block_type: "text_media", title_ar: "عن الفعالية", title_en: "About the event", content_ar: "<p>التاريخ والمكان ووصف موجز.</p>", content_en: "<p>Date, place and brief description.</p>" } },
      { section_key: k("accordion", 1), title: null, content: null, sort_order: 20, data: { block_type: "accordion", title_ar: "جدول الأعمال", title_en: "Agenda", items: [{ question_ar: "الجلسة الافتتاحية", question_en: "Opening session", answer_ar: "9:00 — 10:00", answer_en: "9:00 — 10:00" }, { question_ar: "ورشة عمل", question_en: "Workshop", answer_ar: "10:30 — 12:00", answer_en: "10:30 — 12:00" }] } },
      { section_key: k("cta_banner", 2), title: null, content: null, sort_order: 30, data: { block_type: "cta_banner", title_ar: "سجّل حضورك", title_en: "Register to attend", cta_label_ar: "تسجيل", cta_label_en: "Register", cta_url: "/e-services" } },
    ],
  },
  {
    key: "partnership",
    label: "صفحة شراكة",
    description: "قيمنا + الشركاء + نموذج التواصل.",
    sections: [
      { section_key: k("text_media", 0), title: null, content: null, sort_order: 10, data: { block_type: "text_media", title_ar: "شراكاتنا", title_en: "Our partnerships", content_ar: "<p>كيف نبني علاقات شراكة طويلة الأمد.</p>", content_en: "<p>How we build long-term partnerships.</p>" } },
      { section_key: k("cards_grid", 1), title: null, content: null, sort_order: 20, data: { block_type: "cards_grid", title_ar: "قيمنا في الشراكة", title_en: "Our partnership values", columns: 3, items: [{ icon: "Handshake", title_ar: "ثقة", title_en: "Trust", description_ar: "...", description_en: "..." }, { icon: "TrendingUp", title_ar: "نمو مشترك", title_en: "Shared growth", description_ar: "...", description_en: "..." }, { icon: "Globe", title_ar: "أثر واسع", title_en: "Broad impact", description_ar: "...", description_en: "..." }] } },
      { section_key: k("cta_banner", 2), title: null, content: null, sort_order: 30, data: { block_type: "cta_banner", title_ar: "كن شريكاً", title_en: "Become a partner", cta_label_ar: "تواصل معنا", cta_label_en: "Contact us", cta_url: "/contact" } },
    ],
  },
  {
    key: "thanks",
    label: "صفحة شكر/تأكيد",
    description: "رسالة شكر + روابط رجوع.",
    sections: [
      { section_key: k("rich_text", 0), title: null, content: null, sort_order: 10, data: { block_type: "rich_text", title_ar: "شكراً لك!", title_en: "Thank you!", content_ar: "<p>تم استلام طلبك بنجاح، سنتواصل معك قريباً.</p>", content_en: "<p>We've received your request and will contact you soon.</p>" } },
      { section_key: k("cta_banner", 1), title: null, content: null, sort_order: 20, data: { block_type: "cta_banner", title_ar: "تصفّح المزيد", title_en: "Explore more", cta_label_ar: "العودة للرئيسية", cta_label_en: "Back to home", cta_url: "/" } },
    ],
  },
];

export function getTemplate(key: string): PageTemplate {
  return PAGE_TEMPLATES.find((t) => t.key === key) ?? PAGE_TEMPLATES[0];
}
