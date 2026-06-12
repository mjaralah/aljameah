// Arabic text normalization + synonyms expansion for fuzzy search.

const DIACRITICS = /[\u064B-\u0652\u0670\u0640]/g;
const TATWEEL = /\u0640/g;

export function normalizeArabic(input: string): string {
  if (!input) return "";
  return input
    .toLowerCase()
    .replace(DIACRITICS, "")
    .replace(TATWEEL, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

// Common Arabic synonyms — when user types one, we expand to all variants.
export const SYNONYM_GROUPS: string[][] = [
  ["شعار", "لوغو", "logo", "هوية", "براند", "علامه"],
  ["ايقونه", "favicon", "ايقونة الموقع", "فافيكون"],
  ["الوان", "لون", "ثيم", "هويه بصريه", "تصميم"],
  ["خط", "خطوط", "فونت", "تيبوغرافي"],
  ["اعدادات", "ضبط", "تخصيص", "settings", "اعداد"],
  ["مستخدم", "مستخدمين", "محرر", "مدير", "صلاحيات", "دور", "ادوار"],
  ["خبر", "اخبار", "مقال", "تدوينه", "اعلان"],
  ["برنامج", "برامج", "خدمه", "مبادره", "مشروع"],
  ["نموذج", "نماذج", "فورم", "استماره", "طلب"],
  ["استبيان", "استطلاع", "تصويت", "اراء"],
  ["تطوع", "متطوع", "متطوعين"],
  ["عضويه", "عضو", "اعضاء", "اشتراك", "انضمام"],
  ["تواصل", "اتصال", "ايميل", "بريد", "هاتف", "جوال", "رسائل"],
  ["حوكمه", "لوائح", "سياسات", "نظام", "تقارير", "وثائق", "ملفات"],
  ["شريك", "شركاء", "داعمين", "رعاه"],
  ["هيرو", "سلايدر", "بانر", "شريط عرض", "كاروسيل"],
  ["تذييل", "فوتر", "footer", "اسفل الصفحه"],
  ["هيدر", "header", "ترويسه", "اعلى الصفحه", "قائمه"],
  ["seo", "تحسين البحث", "كلمات مفتاحيه", "ميتا"],
  ["نشر", "اظهار", "اخفاء", "تفعيل", "تعطيل"],
  ["حذف", "ازاله", "مسح"],
  ["تعديل", "تحرير", "تغيير", "update"],
  ["اضافه", "انشاء", "جديد", "create"],
  ["رفع", "تحميل", "upload", "صوره", "ملف"],
  ["ترتيب", "سحب", "نقل", "اعاده ترتيب"],
];

// Expand a query into normalized tokens + synonyms.
export function expandQuery(query: string): string {
  const norm = normalizeArabic(query);
  if (!norm) return "";
  const tokens = new Set([norm]);
  for (const word of norm.split(" ")) {
    for (const group of SYNONYM_GROUPS) {
      if (group.some((g) => normalizeArabic(g) === word)) {
        group.forEach((g) => tokens.add(normalizeArabic(g)));
      }
    }
  }
  return Array.from(tokens).join(" ");
}

export function normalizeFields<T extends Record<string, any>>(
  item: T,
  keys: (keyof T)[],
): T & { __search: string } {
  const parts: string[] = [];
  for (const k of keys) {
    const v = item[k];
    if (Array.isArray(v)) parts.push(v.map(String).join(" "));
    else if (v != null) parts.push(String(v));
  }
  return { ...item, __search: normalizeArabic(parts.join(" ")) };
}
