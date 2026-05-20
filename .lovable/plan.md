# خطة: بانٍ مرن للأقسام والصفحات (Block Builder + Page Templates)

## الهدف
السماح للمشرف بإنشاء **أقسام جديدة** داخل أي صفحة (بما فيها الرئيسية) و**صفحات جديدة** كاملة من لوحة التحكم، باستخدام مزيج من **مكتبة أقسام جاهزة** + **بانٍ مرن لكتل المحتوى**، مع دعم **العربية والإنجليزية** لكل قسم.

---

## 1) أنواع الأقسام المدعومة (Block Types)
كل قسم في `page_content` سيحمل `data.block_type` يحدد كيف يُرسم في الواجهة:

| النوع | الاسم | الحقول |
|---|---|---|
| `text_media` | نص + صورة + زر | عنوان، نص HTML، صورة، اتجاه (يسار/يمين)، زر (نص + رابط) |
| `cards_grid` | بطاقات/شبكة | عنوان قسم، أعمدة (2/3/4)، عناصر [أيقونة، عنوان، وصف، رابط] |
| `stats` | إحصائيات وعدادات | عناصر [أيقونة، تسمية، قيمة، لاحقة] |
| `gallery` | معرض صور | عناصر [صورة، تعليق] |
| `carousel` | كاروسيل/سلايدر | عناصر [صورة، عنوان، نص، رابط] |
| `video` | فيديو | عنوان، رابط YouTube/Vimeo، صورة غلاف |
| `accordion` | أكورديون أسئلة | عناصر [سؤال، جواب HTML] |
| `cta_banner` | شريط دعوة | عنوان، نص، زر أساسي، زر ثانوي، صورة خلفية |
| `rich_text` | نص حر | محتوى HTML من المحرر الغني |

> النوع `text_media` يغطّي أيضاً "صورة + زر" البسيط. الأقسام الحالية (hero/programs/news…) تبقى كأقسام مثبتة "system" لا تُحذف.

## 2) دعم اللغتين
لكل حقل نصّي نسخة عربية + إنجليزية داخل `data`:
```
{ block_type, title_ar, title_en, content_ar, content_en, items: [{title_ar,title_en,...}], ... }
```
على الواجهة العامة `LanguageContext` يختار النسخة المناسبة (fallback للعربية).

## 3) لوحة التحكم — تعديلات على صفحة "محتوى الصفحات"
- زر **"➕ إضافة قسم جديد"** في كل صفحة، يفتح حوار:
  1. اختيار نوع البلوك (أيقونات بصرية للاختيار).
  2. تعبئة الحقول (محرّر مخصّص لكل نوع).
  3. لغة عربي/إنجليزي عبر تبويبات داخل الحوار.
- عناصر التحكم في كل قسم: حفظ، نشر/إخفاء، حذف، نسخ، سحب لإعادة الترتيب (موجود جزئياً، سيُكمل).
- معاينة فورية مصغّرة لكل بلوك.

## 4) صفحات رئيسية جديدة (Custom Pages مع Builder)
توسيع `custom_pages`:
- إضافة `template` (blank | landing | program | event | partnership | thanks).
- إضافة `cover_image_url`, `hero_subtitle`, `hero_cta_label`, `hero_cta_url`.
- الصفحة تُعرض على المسار `/p/:slug` (أو `/:parent/:slug`).
- محتواها يُبنى من نفس بانِي الأقسام: عند إنشاء صفحة بقالب، تُولَّد أقسام مبدئية تلقائياً في `page_content` بمفتاح `page_key = "custom:<page_id>"`.

**القوالب الجاهزة:**
- **Blank** — صفحة فارغة + بطل بسيط.
- **Landing Campaign** — بطل + إحصائيات + بطاقات مزايا + CTA + معرض + شركاء.
- **Program** — بطل + نظرة عامة + أهداف (شبكة) + إنجازات (إحصائيات) + معرض + CTA تسجيل.
- **Event** — بطل بتاريخ + وصف + جدول (أكورديون) + موقع + تسجيل.
- **Partnership** — بطل + قيمنا (شبكة) + شركاؤنا + نموذج/CTA.
- **Thanks/Confirmation** — رسالة + روابط رجوع.

## 5) عرضها في الواجهة العامة
- مكوّن جديد `<SectionRenderer section={...} />` يبدّل بين مكوّنات `TextMediaBlock`, `CardsGridBlock`, `StatsBlock`, `GalleryBlock`, `CarouselBlock`, `VideoBlock`, `AccordionBlock`, `CTABannerBlock`, `RichTextBlock`.
- `Index.tsx` ينضم له `{customSections.map(s => <SectionRenderer key={s.id} section={s} />)}` بعد الأقسام النظامية أو بترتيبها حسب `sort_order`.
- صفحة جديدة `src/pages/CustomPage.tsx` تتعامل مع `/p/:slug`.

## 6) الـ UX/UI (أفضل الممارسات)
- **اختيار النوع بصرياً** (شبكة أيقونات + معاينة صغيرة) بدل قائمة منسدلة.
- **حقول مع وصف وأمثلة** placeholder عملية بالعربية.
- **تبويب اللغتين** داخل كل قسم لتفادي الحقول المكدّسة.
- **معاينة جانبية** (Live preview) للقسم بعد كل تعديل.
- **سحب وإفلات** لإعادة الترتيب + ↑↓ للوحة المفاتيح (accessibility).
- **حالة فارغة** واضحة مع زر إضافة أول قسم.
- **تأكيد الحذف** عبر AlertDialog.
- **مفاتيح نشر/إخفاء** ظاهرة دائماً.
- **رسائل toast** للحفظ والأخطاء.

---

## التفاصيل التقنية

### تغييرات قاعدة البيانات (Migration واحدة)
```sql
-- توسيع custom_pages
ALTER TABLE custom_pages
  ADD COLUMN template text DEFAULT 'blank',
  ADD COLUMN cover_image_url text,
  ADD COLUMN hero_subtitle text,
  ADD COLUMN hero_cta_label text,
  ADD COLUMN hero_cta_url text,
  ADD COLUMN title_en text,
  ADD COLUMN content_en text;

-- page_content يدعم بالفعل data jsonb، فقط تأكد من قبول page_key بصيغة "custom:<uuid>"
-- لا حاجة لتعديل بنية page_content؛ block_type يُخزَّن داخل data.
CREATE INDEX IF NOT EXISTS idx_page_content_page_key ON page_content(page_key, sort_order);
```
RLS موجودة بالفعل وكافية (Staff manage / Public reads published).

### ملفات جديدة
- `src/components/blocks/SectionRenderer.tsx`
- `src/components/blocks/TextMediaBlock.tsx`
- `src/components/blocks/CardsGridBlock.tsx`
- `src/components/blocks/StatsBlock.tsx`
- `src/components/blocks/GalleryBlock.tsx`
- `src/components/blocks/CarouselBlock.tsx`
- `src/components/blocks/VideoBlock.tsx`
- `src/components/blocks/AccordionBlock.tsx`
- `src/components/blocks/CTABannerBlock.tsx`
- `src/components/blocks/RichTextBlock.tsx`
- `src/components/admin/blocks/BlockTypePicker.tsx`
- `src/components/admin/blocks/BlockEditor.tsx` (يبدّل بين محررات الأنواع)
- `src/components/admin/blocks/BilingualTabs.tsx`
- `src/lib/pageTemplates.ts` (تعريف القوالب المبدئية للصفحات)
- `src/pages/CustomPage.tsx`

### ملفات معدَّلة
- `src/pages/admin/AdminPageContentPage.tsx` — زر "إضافة قسم"، استخدام `BlockEditor`.
- `src/pages/admin/AdminPagesPage.tsx` — اختيار قالب عند الإنشاء + استدعاء بذرة الأقسام + زر "تحرير الأقسام".
- `src/pages/Index.tsx` — إضافة الأقسام المخصّصة بعد النظامية.
- `src/hooks/usePublicContent.ts` — `useCustomPage(slug)` يجلب الصفحة + أقسامها.
- `src/App.tsx` — مسار `/p/:slug`.
- `src/components/layout/Header.tsx` — إدراج الصفحات المخصّصة `show_in_menu=true` في القائمة.

### نطاق ما لن يتغيّر
- الأقسام النظامية الموجودة (hero/stats/programs/news/partners/satisfaction/about_preview/volunteer_cta) تبقى كما هي ويتعايش معها البانِي.
- مفاتيح/جداول/تكامل لوحة التحكم الحالية لا تُكسر.

---

## مراحل التنفيذ
1. **DB migration** — توسيع `custom_pages` + index.
2. **مكوّنات الـ Blocks العامة + SectionRenderer.**
3. **محرّر البلوكات في لوحة التحكم** (BlockTypePicker + BlockEditor + BilingualTabs).
4. **دمج "إضافة قسم" داخل AdminPageContentPage** لكل صفحة.
5. **عرض الأقسام المخصّصة** في `Index.tsx` وبقية الصفحات.
6. **قوالب الصفحات + بذرها** عند إنشاء `custom_pages`.
7. **مسار `/p/:slug` + CustomPage** + إدراجها في القائمة العلوية.
8. **اختبار يدوي**: إنشاء قسم من كل نوع، إنشاء صفحة من كل قالب، تبديل اللغة، نشر/إخفاء.
