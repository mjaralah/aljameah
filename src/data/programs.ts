import type { Program } from "@/types";

// البرامج الستة الرئيسية
export const programs: Program[] = [
  { id: "p1", title: { ar: "كفالة التعليم", en: "Education Sponsorship" }, description: { ar: "دعم تعليم الأطفال والشباب من الأسر المتعففة.", en: "Supporting education for children and youth from underprivileged families." }, icon: "GraduationCap", category: "education", beneficiaries: 1240 },
  { id: "p2", title: { ar: "الرعاية الصحية", en: "Healthcare" }, description: { ar: "عيادات متنقلة وعلاجات مجانية للأسر المحتاجة.", en: "Mobile clinics and free treatments for families in need." }, icon: "Heart", category: "health", beneficiaries: 3500 },
  { id: "p3", title: { ar: "الإغاثة العاجلة", en: "Emergency Relief" }, description: { ar: "تدخل سريع في الكوارث والأزمات الإنسانية.", en: "Rapid response to disasters and humanitarian crises." }, icon: "LifeBuoy", category: "relief", beneficiaries: 8200 },
  { id: "p4", title: { ar: "التنمية الاجتماعية", en: "Social Development" }, description: { ar: "تمكين الأسر اقتصادياً واجتماعياً.", en: "Economic and social empowerment for families." }, icon: "Users", category: "social", beneficiaries: 980 },
  { id: "p5", title: { ar: "تأهيل الشباب", en: "Youth Empowerment" }, description: { ar: "برامج تدريب وتأهيل لسوق العمل.", en: "Training and qualification programs for the job market." }, icon: "Briefcase", category: "youth", beneficiaries: 640 },
  { id: "p6", title: { ar: "كفالة الأيتام", en: "Orphan Sponsorship" }, description: { ar: "كفالات شهرية وسنوية للأيتام والأرامل.", en: "Monthly and annual sponsorships for orphans and widows." }, icon: "HandHeart", category: "family", beneficiaries: 1820 },
];