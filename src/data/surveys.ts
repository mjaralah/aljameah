import type { Survey } from "@/types";

export const surveys: Survey[] = [
  {
    id: "s1",
    title: { ar: "رضا المستفيدين عن البرامج", en: "Beneficiary satisfaction" },
    description: { ar: "ساعدنا على تحسين خدماتنا.", en: "Help us improve our services." },
    status: "active",
    endsAt: "2025-12-31",
    participants: 248,
    questions: [
      { id: "q1", type: "rating", question: { ar: "قيّم تجربتك العامة", en: "Rate your overall experience" }, required: true },
      { id: "q2", type: "single", question: { ar: "أي البرامج استفدت منها؟", en: "Which program benefited you?" }, options: [
        { ar: "التعليم", en: "Education" }, { ar: "الصحة", en: "Health" }, { ar: "الإغاثة", en: "Relief" }
      ] },
      { id: "q3", type: "text", question: { ar: "اقتراحاتك", en: "Your suggestions" } },
    ],
  },
  {
    id: "s2",
    title: { ar: "رأي المتطوعين 2024", en: "Volunteers feedback 2024" },
    description: { ar: "نتائج مغلقة — متاحة للعرض.", en: "Closed survey — results available." },
    status: "closed",
    endsAt: "2024-12-01",
    participants: 412,
    questions: [],
    results: { avgRating: 4.6 },
  },
];