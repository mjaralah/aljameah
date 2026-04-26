import type { Survey, SurveyResponse } from "@/types";

const satisfactionScale = {
  ar: ["5/5: راضي جداً", "4/5: جيدة جداً", "3/5: جيدة", "2/5: مقبولة", "1/5: غير راضي"],
  en: ["5/5: Very satisfied", "4/5: Very good", "3/5: Good", "2/5: Acceptable", "1/5: Not satisfied"],
};

const serviceScale = {
  ar: ["5/5: ممتازة", "4/5: جيدة جداً", "3/5: جيدة", "2/5: مقبولة", "1/5: سيئة"],
  en: ["5/5: Excellent", "4/5: Very good", "3/5: Good", "2/5: Acceptable", "1/5: Poor"],
};

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
  {
    id: "employee_satisfaction",
    title: { ar: "استبيان قياس رضا الموظفين والمتطوعين", en: "Employee & Volunteer Satisfaction Survey" },
    description: { ar: "قياس تجربة فريق العمل والمتطوعين لتحسين بيئة العطاء.", en: "Measuring staff and volunteer experience to improve the giving environment." },
    status: "active",
    endsAt: "2026-12-31",
    participants: 186,
    showPublicResults: true,
    questions: [
      { id: "employee_satisfaction_q1", type: "text", question: { ar: "الاسم الكريم", en: "Full Name" }, required: true },
      { id: "employee_satisfaction_q2", type: "text", question: { ar: "البريد الإلكتروني", en: "Email" }, required: true },
      { id: "employee_satisfaction_q3", type: "text", question: { ar: "رقم الجوال", en: "Mobile Number" }, required: true },
      { id: "employee_satisfaction_q4", type: "single_choice", question: { ar: "الجنس", en: "Gender" }, options: [{ ar: "ذكر", en: "Male" }, { ar: "أنثى", en: "Female" }], required: true },
      { id: "employee_satisfaction_q5", type: "dropdown", question: { ar: "العلاقة مع الجمعية", en: "Relationship with the Association" }, options: [{ ar: "موظف", en: "Employee" }, { ar: "متطوع", en: "Volunteer" }], required: true },
      { id: "employee_satisfaction_q6", type: "likert", question: { ar: "هل يتم أخذ مقترحاتي بعين الاعتبار؟", en: "Are my suggestions taken into consideration?" }, scale: satisfactionScale.ar.map((ar, i) => ({ ar, en: satisfactionScale.en[i] })), required: true },
      { id: "employee_satisfaction_q7", type: "likert", question: { ar: "هل يتم التعرف من قبل الجمعية في حال كانت لدي احتياجات تدريبية؟", en: "Does the association identify your training needs?" }, scale: satisfactionScale.ar.map((ar, i) => ({ ar, en: satisfactionScale.en[i] })), required: true },
      { id: "employee_satisfaction_q8", type: "likert", question: { ar: "تم شرح مهامي والأخطار المرتبطة - إن وجدت - بوضوح", en: "My tasks and associated risks (if any) are clearly explained" }, scale: satisfactionScale.ar.map((ar, i) => ({ ar, en: satisfactionScale.en[i] })), required: true },
    ],
  },
  {
    id: "beneficiary_satisfaction",
    title: { ar: "استبيان قياس رضا المستفيدين", en: "Beneficiary Satisfaction Survey" },
    description: { ar: "قياس جودة الخدمات وتجربة المستفيدين والزوار.", en: "Measuring service quality and beneficiary and visitor experience." },
    status: "active",
    endsAt: "2026-12-31",
    participants: 342,
    showPublicResults: true,
    questions: [
      { id: "beneficiary_satisfaction_q1", type: "text", question: { ar: "الاسم الكريم", en: "Full Name" }, required: true },
      { id: "beneficiary_satisfaction_q2", type: "text", question: { ar: "البريد الإلكتروني", en: "Email" }, required: true },
      { id: "beneficiary_satisfaction_q3", type: "text", question: { ar: "رقم الجوال", en: "Mobile Number" }, required: true },
      { id: "beneficiary_satisfaction_q4", type: "single_choice", question: { ar: "الجنس", en: "Gender" }, options: [{ ar: "ذكر", en: "Male" }, { ar: "أنثى", en: "Female" }], required: true },
      { id: "beneficiary_satisfaction_q5", type: "dropdown", question: { ar: "العلاقة مع الجمعية", en: "Relationship with the Association" }, options: [{ ar: "زائر", en: "Visitor" }, { ar: "مستفيد", en: "Beneficiary" }], required: true },
      { id: "beneficiary_satisfaction_q6", type: "likert", question: { ar: "ما مدى الاستفادة من الخدمات التي تقدمها الجمعية؟", en: "How much did you benefit from the services provided by the association?" }, scale: serviceScale.ar.map((ar, i) => ({ ar, en: serviceScale.en[i] })), required: true },
      { id: "beneficiary_satisfaction_q7", type: "likert", question: { ar: "ما مدى سرعة تواصل موظفي الجمعية معك؟", en: "How fast did the association staff communicate with you?" }, scale: serviceScale.ar.map((ar, i) => ({ ar, en: serviceScale.en[i] })), required: true },
      { id: "beneficiary_satisfaction_q8", type: "likert", question: { ar: "ما مدى تقييمك لجودة خدمات الجمعية؟", en: "How do you rate the quality of the association's services?" }, scale: serviceScale.ar.map((ar, i) => ({ ar, en: serviceScale.en[i] })), required: true },
    ],
  },
];

const comments = {
  employee_satisfaction: ["بيئة العمل محفزة ومهنية", "أقترح زيادة فرص التدريب", "التواصل الداخلي ممتاز", "أحتاج وضوحاً أكبر في بعض المهام", "التجربة التطوعية منظمة"],
  beneficiary_satisfaction: ["الخدمة سريعة وميسرة", "تعامل الموظفين راقٍ", "أقترح تقليل مدة الانتظار", "استفدت كثيراً من البرنامج", "جودة الخدمة ممتازة"],
};

const buildResponses = (survey: Survey, count: number): SurveyResponse[] =>
  Array.from({ length: count }, (_, i) => {
    const answers = Object.fromEntries(
      survey.questions.map((q, qi) => {
        if (q.type === "likert") return [q.id, [5, 5, 4, 4, 4, 3, 5, 4, 5, 3][(i + qi) % 10]];
        if (q.type === "single_choice") return [q.id, q.options?.[(i + qi) % (q.options.length || 1)].ar ?? "ذكر"];
        if (q.type === "dropdown") return [q.id, q.options?.[(i + qi) % (q.options.length || 1)].ar ?? ""];
        if (q.type === "text" && qi > 2) return [q.id, comments[survey.id as keyof typeof comments]?.[i % 5] ?? ""];
        return [q.id, qi === 1 ? `demo${i + 1}@example.org` : qi === 2 ? `05${String(50000000 + i).slice(0, 8)}` : `مشارك ${i + 1}`];
      }),
    );
    return { id: `${survey.id}_r${i + 1}`, surveyId: survey.id, submittedAt: new Date(2026, 0, 20 - (i % 20)).toISOString(), answers };
  });

export const demoSurveyResponses: SurveyResponse[] = surveys
  .filter((survey) => survey.id === "employee_satisfaction" || survey.id === "beneficiary_satisfaction")
  .flatMap((survey) => buildResponses(survey, survey.participants));