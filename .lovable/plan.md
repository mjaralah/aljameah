# قسم "أعضاء الجمعية العمومية" في صفحة من نحن

## نظرة عامة
إضافة نوع قسم جديد `assembly_members` ضمن الأقسام المخصّصة لصفحة "من نحن"، يعرض حتى 40+ عضو في جدول مع بحث وفلترة وفرز وتصفّح.

## القرارات (بناءً على إجابات المستخدم)
1. **أنواع العضوية**: تُدار ديناميكياً من اللوحة. القائمة الافتراضية: عامل، فخري، داعم، منتسب.
2. **رقم التواصل/البريد**: مخفي افتراضياً، مع تحكّم الأدمن في إظهار/إخفاء كل من الهاتف والبريد للعموم.
3. **التصدير (PDF / Excel)**: متاح للزوار والإدارة، مع تحكّم الأدمن بإظهار/إخفاء الميزة للزوار.
4. **الاستيراد المجمّع**: رفع ملف Excel/CSV من قالب جاهز (Bulk Import).

## قاعدة البيانات
لا حاجة لجداول جديدة. الاستفادة من `about_content` (jsonb في `data`).

شكل الـ data للقسم:
```json
{
  "type": "assembly_members",
  "title_ar": "أعضاء الجمعية العمومية",
  "title_en": "General Assembly Members",
  "subtitle_ar": "...",
  "subtitle_en": "...",
  "settings": {
    "show_phone_public": false,
    "show_email_public": false,
    "show_export_public": true,
    "page_size": 15
  },
  "membership_types": [
    { "key": "working",   "label_ar": "عامل",  "label_en": "Working" },
    { "key": "honorary",  "label_ar": "فخري",  "label_en": "Honorary" },
    { "key": "supporter", "label_ar": "داعم",  "label_en": "Supporter" },
    { "key": "affiliate", "label_ar": "منتسب", "label_en": "Affiliate" }
  ],
  "members": [
    {
      "id": "uuid",
      "name_ar": "...",
      "name_en": "...",
      "membership_type": "working",
      "join_date": "2022-05-01",
      "phone": "+9665...",
      "email": "...",
      "status": "active"
    }
  ]
}
```

## واجهة الإدارة (CustomSectionsManager)
- إضافة نوع `assembly_members` في قائمة الأنواع.
- محرّر مخصّص يحوي:
  - **تبويب "الإعدادات"**: العنوان/الوصف (AR/EN)، مفاتيح تحكّم (إظهار الهاتف/البريد للعموم، إظهار التصدير للزوار)، عدد العناصر في الصفحة.
  - **تبويب "أنواع العضوية"**: CRUD لقائمة الأنواع.
  - **تبويب "الأعضاء"**:
    - جدول داخلي مع بحث وفلترة وفرز وحذف/تعديل.
    - زر "إضافة عضو" (Dialog).
    - زر "استيراد Excel" + رابط "تنزيل القالب" (يولّد ملف .xlsx جاهز بالأعمدة).
    - زر "تصدير CSV/Excel".

## واجهة العامة (CustomAboutSection)
- يضاف `AssemblyMembersView` للأنواع المعروضة.
- شريط ملخّص: عدد الأعضاء الكلي + توزيع حسب النوع.
- صف أدوات: بحث (debounced)، فلترة بالنوع، فرز (الاسم/التاريخ)، أزرار تصدير (إن كانت مفعّلة).
- جدول responsive يتحول إلى بطاقات مكدّسة على الجوال.
- الهاتف/البريد يظهران فقط إذا فعّل الأدمن خياره (للعموم).
- Pagination حسب page_size.

## التصدير
- **CSV**: توليد client-side من البيانات الحالية بعد الفلترة.
- **Excel (.xlsx)**: عبر مكتبة `xlsx` (SheetJS) — تضاف.
- **PDF**: عبر `jspdf` + `jspdf-autotable` — تضاف (مع دعم RTL أساسي).

## الاستيراد
- قراءة ملف Excel/CSV عبر `xlsx`.
- التحقق من الأعمدة: `name_ar, name_en, membership_type, join_date, phone, email, status`.
- معاينة الصفوف + عرض الأخطاء قبل الإضافة.
- دمج مع القائمة الحالية (لا استبدال).

## الملفات

### جديدة
- `src/components/admin/about/AssemblyMembersEditor.tsx` — المحرّر الكامل (إعدادات/أنواع/أعضاء/استيراد/تصدير).
- `src/components/about/sections/AssemblyMembersView.tsx` — العرض العام.
- `src/lib/assemblyExport.ts` — دوال تصدير CSV/Excel/PDF + قالب الاستيراد.

### معدّلة
- `src/components/admin/about/CustomSectionsManager.tsx` — إضافة النوع الجديد لقائمة الأنواع وربط المحرّر.
- `src/components/about/CustomAboutSection.tsx` — إضافة فرع `assembly_members` وعرض `AssemblyMembersView`.
- `package.json` — إضافة `xlsx`, `jspdf`, `jspdf-autotable`.

## ملاحظات أمنية/UX
- جميع البيانات تُخزّن في jsonb داخل صف واحد في `about_content` → مناسب لـ ≤ ~200 عضو دون مشاكل أداء.
- الهاتف/البريد مخفيان افتراضياً لحماية الخصوصية.
- الفرز/البحث/الفلترة كلها client-side (مناسب للحجم).
- لا تغيير على RLS أو المصادقة.
