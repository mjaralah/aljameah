import type { PolicyDoc } from "@/types";

export const policies: PolicyDoc[] = [
  { id: "po1", title: { ar: "النظام الأساسي للجمعية", en: "Articles of Association" }, year: 2020, fileName: "bylaws-2020.pdf" },
  { id: "po2", title: { ar: "سياسة مكافحة غسل الأموال", en: "AML Policy" }, year: 2023, fileName: "aml-policy.pdf" },
  { id: "po3", title: { ar: "سياسة تضارب المصالح", en: "Conflict of Interest Policy" }, year: 2023, fileName: "coi-policy.pdf" },
  { id: "po4", title: { ar: "ميثاق السلوك المهني", en: "Code of Conduct" }, year: 2024, fileName: "code-of-conduct.pdf" },
  { id: "po5", title: { ar: "سياسة حماية المستفيدين", en: "Beneficiary Protection Policy" }, year: 2024, fileName: "protection.pdf" },
  { id: "po6", title: { ar: "سياسة الإفصاح", en: "Disclosure Policy" }, year: 2024, fileName: "disclosure.pdf" },
];

export const regulations = [
  { id: "rg1", year: 2023, title: { ar: "اللائحة الإدارية والمالية", en: "Admin & Financial Regulation" }, fileName: "admin-fin-regulation.pdf" },
  { id: "rg2", year: 2024, title: { ar: "لائحة الموارد البشرية", en: "HR Regulation" }, fileName: "hr-regulation.pdf" },
  { id: "rg3", year: 2024, title: { ar: "لائحة المشتريات والعقود", en: "Procurement Regulation" }, fileName: "procurement.pdf" },
  { id: "rg4", year: 2023, title: { ar: "لائحة المتطوعين", en: "Volunteers Regulation" }, fileName: "volunteers-reg.pdf" },
];

export const plans = [
  { id: "pl1", year: 2025, title: { ar: "الخطة الاستراتيجية 2025-2030", en: "Strategic Plan 2025-2030" }, fileName: "strategic-2025-2030.pdf" },
  { id: "pl2", year: 2025, title: { ar: "الخطة التشغيلية السنوية", en: "Annual Operational Plan" }, fileName: "operational-2025.pdf" },
  { id: "pl3", year: 2024, title: { ar: "خطة التحول الرقمي", en: "Digital Transformation Plan" }, fileName: "digital-plan.pdf" },
];

export const investmentDecisions = [
  { id: "in1", year: 2024, title: { ar: "قرار توظيف الفائض المالي", en: "Surplus Investment Decision" }, fileName: "investment-2024-01.pdf" },
  { id: "in2", year: 2024, title: { ar: "سياسة الاستثمار المعتمدة", en: "Approved Investment Policy" }, fileName: "investment-policy.pdf" },
  { id: "in3", year: 2023, title: { ar: "قرارات لجنة الاستثمار", en: "Investment Committee Decisions" }, fileName: "investment-committee-2023.pdf" },
];

export const aidReports = [
  { id: "ai1", year: 2024, title: { ar: "تقرير المساعدات العينية 2024", en: "In-kind Aid Report 2024" }, fileName: "in-kind-aid-2024.pdf" },
  { id: "ai2", year: 2024, title: { ar: "تقرير المساعدات النقدية 2024", en: "Cash Aid Report 2024" }, fileName: "cash-aid-2024.pdf" },
  { id: "ai3", year: 2023, title: { ar: "تقرير المساعدات الموحّد 2023", en: "Unified Aid Report 2023" }, fileName: "aid-2023.pdf" },
];

export const financialReports = [
  { id: "fr1", year: 2024, title: { ar: "القوائم المالية المدققة 2024", en: "Audited Financials 2024" }, fileName: "financials-2024.pdf" },
  { id: "fr2", year: 2023, title: { ar: "القوائم المالية المدققة 2023", en: "Audited Financials 2023" }, fileName: "financials-2023.pdf" },
  { id: "fr3", year: 2022, title: { ar: "القوائم المالية المدققة 2022", en: "Audited Financials 2022" }, fileName: "financials-2022.pdf" },
];

export const reports = [
  { id: "r1", year: 2024, title: { ar: "التقرير السنوي 2024", en: "Annual Report 2024" }, fileName: "annual-2024.pdf" },
  { id: "r2", year: 2023, title: { ar: "التقرير السنوي 2023", en: "Annual Report 2023" }, fileName: "annual-2023.pdf" },
  { id: "r3", year: 2022, title: { ar: "التقرير السنوي 2022", en: "Annual Report 2022" }, fileName: "annual-2022.pdf" },
];

export const eventsReports = [
  { id: "ev1", year: 2024, title: { ar: "تقرير فعاليات رمضان 2024", en: "Ramadan Events Report 2024" }, fileName: "ramadan-2024.pdf" },
  { id: "ev2", year: 2024, title: { ar: "تقرير اليوم الوطني", en: "National Day Report" }, fileName: "national-day-2024.pdf" },
  { id: "ev3", year: 2023, title: { ar: "تقرير الفعاليات السنوي 2023", en: "Annual Events Report 2023" }, fileName: "events-2023.pdf" },
];

// التوزيع المالي بالنسب المئوية
export const financials = {
  year: 2024,
  totalRevenue: 28_450_000, // ريال سعودي
  totalExpenses: 25_120_000,
  allocation: [
    { key: "programs", labelAr: "البرامج والمشاريع", labelEn: "Programs & projects", pct: 78 },
    { key: "operations", labelAr: "المصاريف التشغيلية", labelEn: "Operations", pct: 12 },
    { key: "fundraising", labelAr: "جمع التبرعات", labelEn: "Fundraising", pct: 6 },
    { key: "admin", labelAr: "الإدارة العامة", labelEn: "Administration", pct: 4 },
  ],
};
