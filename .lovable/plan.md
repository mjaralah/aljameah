# إصلاحات التحكم بالنشر والإخفاء على مستوى الموقع

## المشاكل

1. **زر النشر/الإخفاء في أقسام الصفحة الرئيسية لا يعمل فعلياً**
   التبديل يحفظ القيمة في `page_content`، لكن مكونات `StatsCounters` و`AboutPreview` و`SatisfactionIndicators` و`VolunteerCta` ترجع للبيانات الافتراضية عند عدم وجود صف منشور — فلا يختفي القسم. كما أن `HeroSlider`, `ProgramsGrid`, `NewsPreview`, `PartnersCarousel` تُعرض دائماً ولا يوجد لها مفتاح في `page_content`.

2. **قسم "شركاء النجاح" غير موجود ضمن أقسام الصفحة الرئيسية للتعديل/الإخفاء**
   (الرابط السريع لإدارة شعارات الشركاء موجود، لكن لا يوجد قسم قابل للإخفاء كاملاً ولا تحرير لعنوان القسم).

3. **قسم "هل كانت هذه الصفحة مفيدة؟" لا يوجد له خيار لإظهار/إخفاء لكل صفحة.**

4. **الصفحات العامة الرئيسية (البرامج، الخدمات الإلكترونية، المركز الإعلامي، الاستبيانات...) لا يوجد لها زر نشر/إخفاء عام في لوحة التحكم.**

## الحل

### 1. توحيد أقسام الصفحة الرئيسية ضمن `page_content`

إضافة صفوف جديدة في `page_content` للأقسام التي لا تملك مفتاحاً حالياً، كي يصبح زر النشر/الإخفاء في تبويب "الصفحة الرئيسية" يتحكم بكامل ظهور القسم:

| section_key | يتحكم بـ |
|---|---|
| `hero` | شريط البطل (HeroSlider) |
| `stats` (موجود) | عدّاد الأرقام |
| `about_preview` (موجود) | نبذة عن الجمعية |
| `programs` | شبكة البرامج |
| `satisfaction` (موجود) | مؤشرات الرضا |
| `news` | آخر الأخبار |
| `partners` | **شركاء النجاح** (جديد + عنوان قابل للتحرير) |
| `volunteer_cta` (موجود) | دعوة التطوع |

### 2. ربط المكوّنات بالنشر

تعديل `src/pages/Index.tsx` ليصبح ذكياً:
- يقرأ `usePageContent("home")` مرة واحدة.
- يعرض كل مكوّن فقط إذا كان قسمه `published = true` (أو غير موجود = افتراضي نشط للأقسام القديمة).

كذلك تمرير `title/content` من القسم إلى المكوّنات المعنية (PartnersCarousel, NewsPreview, ProgramsGrid) كي يصبح العنوان قابل للتحرير من نفس واجهة "محتوى الصفحات".

### 3. التحكم بأداة "هل كانت هذه الصفحة مفيدة؟"

- إضافة جدول إعدادات بسيط `page_feedback_settings` أو إضافة عمود `show_feedback` في جدول `site_settings` كقاموس JSON `feedback_enabled: { home: true, about: true, ... }`.
- اختيار أبسط: **JSON واحد** في `site_settings.feedback_visibility` (jsonb) — لا حاجة لجدول جديد.
- تعديل `PageFeedback` ليقرأ هذا الإعداد عبر `useSiteSettings` ويُخفي نفسه إذا كان الإعداد `false`.
- إضافة قسم جديد في `AdminSettingsPage` بعنوان "أداة تقييم الصفحات" مع مفاتيح تبديل لكل صفحة (home, about, governance, programs, media, surveys, eservices, contact, eservices_volunteer, eservices_membership).

### 4. التحكم بنشر/إخفاء الصفحات الرئيسية كاملةً

- إضافة عمود `published` (boolean default true) إلى جدول جديد `site_pages` يحتوي صفاً واحداً لكل صفحة رئيسية (programs, media, surveys, eservices, about, governance, contact, board).
- الحل الأبسط: استخدام نفس JSON `site_settings.pages_visibility` (jsonb) — مفتاح لكل صفحة قيمته true/false.
- إضافة قسم "نشر الصفحات الرئيسية" في `AdminSettingsPage` بقائمة مفاتيح تبديل.
- إنشاء مكوّن `PublicRouteGuard` يلتف حول مسارات الصفحات في `App.tsx`؛ إذا كانت الصفحة مخفية يعرض رسالة "هذه الصفحة غير متاحة حالياً" (مع استثناء طاقم الإدارة الذين يرونها دائماً عبر `useAdminAuth`).

## ملخص التغييرات

**قاعدة البيانات (Migration):**
- إدراج صفوف `page_content` جديدة للصفحة الرئيسية: `hero`, `programs`, `news`, `partners`.
- إضافة عمودين `feedback_visibility jsonb` و `pages_visibility jsonb` إلى `site_settings`.

**الواجهة الأمامية:**
- `src/pages/Index.tsx`: عرض شرطي لكل قسم بناءً على `published`.
- `src/components/home/PartnersCarousel.tsx` و `NewsPreview.tsx` و `ProgramsGrid.tsx`: قبول عنوان مخصّص من القسم.
- `src/components/layout/PageFeedback.tsx`: قراءة الإعداد وإخفاء نفسه عند الحاجة.
- `src/pages/admin/AdminSettingsPage.tsx`: إضافة قسمين جديدين (تقييم الصفحات + نشر الصفحات).
- `src/App.tsx`: لف الصفحات العامة في `PublicRouteGuard` جديد.
- `src/pages/admin/AdminPageContentPage.tsx`: عرض الأقسام الجديدة تلقائياً (لا تعديل لازم — السكربت يعتمد على `grouped[page.key]`).

## ملاحظات

- لا تأثير على رصيد الاستهلاك — فقط استعلامات قائمة + عمودي JSON.
- المحرر النصي والأيقونات لا تتغير.
- الأقسام التي لا تملك صفاً في `page_content` ستبقى ظاهرة افتراضياً لتجنب الكسر.
