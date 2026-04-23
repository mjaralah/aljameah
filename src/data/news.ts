import type { NewsArticle } from "@/types";
import news1 from "@/assets/news-1.jpg";
import news2 from "@/assets/news-2.jpg";
import news3 from "@/assets/news-3.jpg";

// أخبار وهمية للعرض في النموذج الأولي
export const news: NewsArticle[] = [
  {
    id: "n1",
    title: { ar: "افتتاح مركز مجتمعي جديد في الرياض", en: "New community center opens in Riyadh" },
    excerpt: {
      ar: "تم افتتاح أحدث مراكزنا المجتمعية لخدمة الأسر في حي الياسمين بحضور رسمي.",
      en: "Our newest community center opened in Al-Yasmin district with official attendance.",
    },
    body: { ar: "تفاصيل الخبر…", en: "Article body…" },
    date: "2025-03-12",
    image: news1,
    category: { ar: "افتتاحات", en: "Openings" },
  },
  {
    id: "n2",
    title: { ar: "حملة شتاء دافئ تصل لـ 5,000 أسرة", en: "Warm Winter Campaign reaches 5,000 families" },
    excerpt: {
      ar: "وزّع متطوعو الجمعية أكثر من خمسة آلاف سلة شتوية في عدة مناطق.",
      en: "Volunteers distributed over 5,000 winter kits across several regions.",
    },
    body: { ar: "تفاصيل الخبر…", en: "Article body…" },
    date: "2025-02-04",
    image: news2,
    category: { ar: "حملات", en: "Campaigns" },
  },
  {
    id: "n3",
    title: { ar: "شراكة استراتيجية مع وزارة التعليم", en: "Strategic partnership with the Ministry of Education" },
    excerpt: {
      ar: "اتفاقية لدعم 200 طالب وطالبة من الأسر المحتاجة بمنح دراسية.",
      en: "An agreement to support 200 students from underprivileged families.",
    },
    body: { ar: "تفاصيل الخبر…", en: "Article body…" },
    date: "2025-01-20",
    image: news3,
    category: { ar: "شراكات", en: "Partnerships" },
  },
  {
    id: "n4",
    title: { ar: "إطلاق التقرير السنوي 2024", en: "Launching the 2024 Annual Report" },
    excerpt: {
      ar: "تقرير شامل يستعرض أبرز إنجازات الجمعية وأرقامها التشغيلية.",
      en: "A comprehensive report highlighting key achievements and operational figures.",
    },
    body: { ar: "تفاصيل الخبر…", en: "Article body…" },
    date: "2025-01-05",
    image: news1,
    category: { ar: "تقارير", en: "Reports" },
  },
  {
    id: "n5",
    title: { ar: "تخريج الدفعة الثالثة من برنامج تأهيل الشباب", en: "Third cohort graduates from Youth Empowerment" },
    excerpt: {
      ar: "تخرّج 120 شاباً وشابة بعد إتمام مسارات تدريبية متخصصة.",
      en: "120 graduates completed specialized training tracks.",
    },
    body: { ar: "تفاصيل الخبر…", en: "Article body…" },
    date: "2024-12-18",
    image: news2,
    category: { ar: "تأهيل", en: "Training" },
  },
];