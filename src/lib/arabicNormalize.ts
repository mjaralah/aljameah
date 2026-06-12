// Arabic text normalization + light stemming + synonyms expansion for fuzzy search.

const DIACRITICS = /[\u064B-\u0652\u0670\u0640]/g;
const TATWEEL = /\u0640/g;

// Basic letter normalization (no stemming).
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

// Light Arabic stemmer: strips common prefixes (ال, وال, فال, بال, كال, لل, و, ف, ب, ل, ك)
// and common suffixes (ات, ون, ين, ها, هم, كم, نا, يه, ية, يا, ه, ي).
// Operates on a single already-normalized token.
export function stemArabicWord(word: string): string {
  if (!word) return word;
  let w = word;

  // Prefixes (longest first)
  const prefixes4 = ["وال", "فال", "بال", "كال"];
  const prefixes3 = ["ال", "لل"];
  const prefixes1 = ["و", "ف", "ب", "ل", "ك"];

  for (const p of prefixes4) {
    if (w.length > p.length + 2 && w.startsWith(p)) {
      w = w.slice(p.length);
      break;
    }
  }
  for (const p of prefixes3) {
    if (w.length > p.length + 2 && w.startsWith(p)) {
      w = w.slice(p.length);
      break;
    }
  }
  // Single-letter prefix only if remaining root still >= 3 chars
  for (const p of prefixes1) {
    if (w.length > 4 && w.startsWith(p)) {
      w = w.slice(1);
      break;
    }
  }

  // Suffixes (longest first)
  const suffixes2 = ["ات", "ون", "ين", "ها", "هم", "كم", "نا", "يه", "يه", "يا", "ية"];
  for (const s of suffixes2) {
    if (w.length > s.length + 2 && w.endsWith(s)) {
      w = w.slice(0, -s.length);
      break;
    }
  }
  // Trailing single ه / ي only if root still >= 3
  if (w.length > 3 && (w.endsWith("ه") || w.endsWith("ي"))) {
    w = w.slice(0, -1);
  }

  return w;
}

export function stemArabic(text: string): string {
  return normalizeArabic(text)
    .split(" ")
    .map(stemArabicWord)
    .filter(Boolean)
    .join(" ");
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

// Pre-stem synonym groups for quick lookup
const STEMMED_SYNONYMS: string[][] = SYNONYM_GROUPS.map((g) =>
  g.map((w) => stemArabicWord(normalizeArabic(w))),
);

// Expand a query into normalized + stemmed tokens + synonyms.
export function expandQuery(query: string): string {
  const norm = normalizeArabic(query);
  if (!norm) return "";
  const tokens = new Set<string>();
  tokens.add(norm);

  for (const word of norm.split(" ")) {
    if (!word) continue;
    tokens.add(word);
    const stem = stemArabicWord(word);
    if (stem) tokens.add(stem);

    // Synonym expansion against stem
    for (let i = 0; i < STEMMED_SYNONYMS.length; i++) {
      if (STEMMED_SYNONYMS[i].includes(stem) || STEMMED_SYNONYMS[i].includes(word)) {
        SYNONYM_GROUPS[i].forEach((g) => {
          const ng = normalizeArabic(g);
          tokens.add(ng);
          tokens.add(stemArabicWord(ng));
        });
      }
    }
  }
  return Array.from(tokens).filter(Boolean).join(" ");
}

export function normalizeFields<T extends Record<string, any>>(
  item: T,
  keys: (keyof T)[],
): T & { __search: string; __stems: string } {
  const parts: string[] = [];
  for (const k of keys) {
    const v = item[k];
    if (Array.isArray(v)) parts.push(v.map(String).join(" "));
    else if (v != null) parts.push(String(v));
  }
  const joined = parts.join(" ");
  const normalized = normalizeArabic(joined);
  const stems = stemArabic(joined);
  return { ...item, __search: `${normalized} ${stems}`, __stems: stems };
}
