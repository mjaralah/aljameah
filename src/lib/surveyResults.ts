import { demoSurveyResponses, surveys } from "@/data/surveys";
import type { Survey, SurveyQuestion, SurveyResponse } from "@/types";

const STORAGE_KEY = "alataa-survey-responses";

export const getStoredSurveyResponses = (): SurveyResponse[] => {
  if (typeof window === "undefined") return demoSurveyResponses;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demoSurveyResponses));
    return demoSurveyResponses;
  }
  try {
    const parsed = JSON.parse(stored) as SurveyResponse[];
    const missing = demoSurveyResponses.filter((demo) => !parsed.some((item) => item.id === demo.id));
    const merged = [...parsed, ...missing];
    if (missing.length) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demoSurveyResponses));
    return demoSurveyResponses;
  }
};

export const saveSurveyResponse = (response: SurveyResponse) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([response, ...getStoredSurveyResponses()]));
};

const likertQuestions = (survey: Survey) => survey.questions.filter((q) => q.type === "likert");
const score = (value: unknown) => typeof value === "number" ? value : Number(String(value).match(/[1-5]/)?.[0] ?? 0);

export const getSurveyResponses = (surveyId: string) => getStoredSurveyResponses().filter((r) => r.surveyId === surveyId);

export const getSurveyMetrics = (survey: Survey) => {
  const responses = getSurveyResponses(survey.id);
  const scores = responses.flatMap((r) => likertQuestions(survey).map((q) => score(r.answers[q.id])).filter(Boolean));
  const averageRating = scores.length ? scores.reduce((sum, n) => sum + n, 0) / scores.length : Number(survey.results?.avgRating ?? 0);
  return {
    participants: Math.max(survey.participants, responses.length),
    averageRating,
    satisfaction: Math.round((averageRating / 5) * 100),
  };
};

export const getOverallSurveyMetrics = () => {
  const publicSurveys = surveys.filter((s) => s.showPublicResults);
  const totals = publicSurveys.map(getSurveyMetrics);
  const participants = totals.reduce((sum, item) => sum + item.participants, 0);
  const averageRating = totals.length ? totals.reduce((sum, item) => sum + item.averageRating, 0) / totals.length : 0;
  return { participants, averageRating, satisfaction: Math.round((averageRating / 5) * 100) };
};

export const getLikertDistribution = (survey: Survey) => {
  const responses = getSurveyResponses(survey.id);
  return likertQuestions(survey).map((q, index) => ({
    question: `Q${index + 1}`,
    fullQuestion: q.question,
    five: responses.filter((r) => score(r.answers[q.id]) === 5).length,
    four: responses.filter((r) => score(r.answers[q.id]) === 4).length,
    three: responses.filter((r) => score(r.answers[q.id]) === 3).length,
    two: responses.filter((r) => score(r.answers[q.id]) === 2).length,
    one: responses.filter((r) => score(r.answers[q.id]) === 1).length,
  }));
};

export const getChoiceDistribution = (survey: Survey, question: SurveyQuestion) => {
  const responses = getSurveyResponses(survey.id);
  return (question.options ?? []).map((option) => ({
    name: option,
    value: responses.filter((r) => r.answers[question.id] === option.ar || r.answers[question.id] === option.en).length,
  }));
};

export const getQuestionAverageData = (survey: Survey) => {
  const responses = getSurveyResponses(survey.id);
  return likertQuestions(survey).map((q, index) => {
    const values = responses.map((r) => score(r.answers[q.id])).filter(Boolean);
    return { name: `Q${index + 1}`, average: values.length ? Number((values.reduce((sum, n) => sum + n, 0) / values.length).toFixed(2)) : 0 };
  });
};

export const getAnonymousTextResponses = (survey: Survey) =>
  ({
    employee_satisfaction: ["بيئة العمل محفزة ومهنية", "أقترح زيادة فرص التدريب", "التواصل الداخلي ممتاز", "أحتاج وضوحاً أكبر في بعض المهام", "التجربة التطوعية منظمة", "الدعم الإداري واضح", "أقدّر مرونة الفريق", "الإجراءات سهلة ومفهومة", "أرغب بمزيد من اللقاءات الدورية", "العمل له أثر ملموس"],
    beneficiary_satisfaction: ["الخدمة سريعة وميسرة", "تعامل الموظفين راقٍ", "أقترح تقليل مدة الانتظار", "استفدت كثيراً من البرنامج", "جودة الخدمة ممتازة", "التواصل كان واضحاً", "الموظفون متعاونون", "الإجراءات مناسبة", "أشكر الجمعية على الاهتمام", "الخدمة أحدثت فرقاً"],
  })[survey.id as "employee_satisfaction" | "beneficiary_satisfaction"] ?? [];