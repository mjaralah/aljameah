import type { BoardMember } from "@/types";

export const board: BoardMember[] = [
  { id: "b1", name: { ar: "د. عبدالله المنصور", en: "Dr. Abdullah Al-Mansour" }, role: { ar: "رئيس مجلس الإدارة", en: "Chairman" }, bio: { ar: "خبرة 20 عاماً في القطاع غير الربحي.", en: "20 years of nonprofit experience." } },
  { id: "b2", name: { ar: "أ. سارة العتيبي", en: "Ms. Sarah Al-Otaibi" }, role: { ar: "نائب الرئيس", en: "Vice Chair" }, bio: { ar: "متخصصة في التنمية المجتمعية.", en: "Community development specialist." } },
  { id: "b3", name: { ar: "م. خالد الزهراني", en: "Eng. Khalid Al-Zahrani" }, role: { ar: "أمين الصندوق", en: "Treasurer" }, bio: { ar: "محاسب قانوني معتمد.", en: "Certified public accountant." } },
  { id: "b4", name: { ar: "د. منى الشمري", en: "Dr. Mona Al-Shamri" }, role: { ar: "عضو مجلس", en: "Board Member" }, bio: { ar: "أكاديمية متخصصة في الصحة العامة.", en: "Public health academic." } },
];