import type { PolicyDoc } from "@/types";

export const policies: PolicyDoc[] = [
  { id: "po1", title: { ar: "النظام الأساسي للجمعية", en: "Articles of Association" }, year: 2020, fileName: "bylaws-2020.pdf" },
  { id: "po2", title: { ar: "سياسة مكافحة غسل الأموال", en: "AML Policy" }, year: 2023, fileName: "aml-policy.pdf" },
  { id: "po3", title: { ar: "سياسة تضارب المصالح", en: "Conflict of Interest Policy" }, year: 2023, fileName: "coi-policy.pdf" },
  { id: "po4", title: { ar: "ميثاق السلوك المهني", en: "Code of Conduct" }, year: 2024, fileName: "code-of-conduct.pdf" },
  { id: "po5", title: { ar: "سياسة حماية المستفيدين", en: "Beneficiary Protection Policy" }, year: 2024, fileName: "protection.pdf" },
  { id: "po6", title: { ar: "سياسة الإفصاح والشفافية", en: "Disclosure & Transparency Policy" }, year: 2024, fileName: "disclosure.pdf" },
];

export const reports = [
  { id: "r1", year: 2024, title: { ar: "التقرير السنوي 2024", en: "Annual Report 2024" }, fileName: "annual-2024.pdf" },
  { id: "r2", year: 2023, title: { ar: "التقرير السنوي 2023", en: "Annual Report 2023" }, fileName: "annual-2023.pdf" },
  { id: "r3", year: 2022, title: { ar: "التقرير السنوي 2022", en: "Annual Report 2022" }, fileName: "annual-2022.pdf" },
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
