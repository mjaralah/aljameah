
## الهدف
تمكين مدير الموقع من اختيار طريقة عرض شعارات الشركاء في الصفحة الرئيسية من بين عدة أنماط جاهزة، بدلاً من نمط واحد ثابت (Swiper الحالي).

## أنماط العرض المتاحة
1. **كاروسيل تلقائي (Swiper)** — النمط الحالي الافتراضي.
2. **شريط لانهائي (Marquee)** — حركة انسيابية مستمرة بدون توقف، تظهر كل الشعارات في صف متحرك.
3. **شبكة ثابتة (Grid)** — عرض كل الشعارات في شبكة منظمة (5 أعمدة) بدون حركة، مع تأثير hover (تكبير/تلوين).
4. **شبكة Bento متدرجة** — أحجام مختلفة للشعارات في شبكة غير متناظرة عصرية.
5. **كاروسيل ثلاثي الأبعاد (Coverflow)** — منظور 3D مع تكبير الشعار الأوسط.

## آلية الاختيار
- بدون أي تغيير في قاعدة البيانات (حقل `page_content.data` من نوع `jsonb` ويسع المفتاح الجديد).
- يُحفظ النمط المختار داخل `data.display_style` للقسم الذي `section_key = "partners"` في صفحة `home`.
- يضيف مدير الموقع/يعدّل الاختيار من **لوحة التحكم ← محتوى الصفحات ← الصفحة الرئيسية ← شركاء النجاح**.

## التغييرات المطلوبة

### 1) `src/pages/admin/AdminPageContentPage.tsx`
- عند عرض القسم الذي `section_key === "partners"`: إضافة قائمة منسدلة (Select) بعنوان «طريقة عرض الشركاء» تحفظ القيمة في `data.display_style` بالقيم: `swiper` | `marquee` | `grid` | `bento` | `coverflow`.

### 2) `src/components/home/PartnersCarousel.tsx`
- قراءة `sec?.data?.display_style` (افتراضياً `swiper`).
- تفريع `switch` يعرض المكوّن المناسب لكل نمط، مع الإبقاء على نفس البيانات (`items`) والعنوان.

### 3) ملفات فرعية جديدة في `src/components/home/partners/`
- `PartnersMarquee.tsx` — حركة CSS لانهائية (تكرار العناصر + `animate-marquee`).
- `PartnersGrid.tsx` — شبكة CSS responsive مع hover.
- `PartnersBento.tsx` — شبكة Bento بأحجام مختلفة.
- `PartnersCoverflow.tsx` — Swiper مع modules `EffectCoverflow`.

### 4) `tailwind.config.ts`
- إضافة `keyframes.marquee` و `animation.marquee` (حركة `translateX` من 0 إلى -50% بشكل لانهائي خطي).

## ملاحظات تقنية (للمراجعة)
- جميع الأنماط تستخدم نفس مصدر البيانات `usePartners()` ولا تتأثر بأي منطق نشر/إخفاء قائم.
- استخدام رموز التصميم الدلالية (`bg-card`, `border-border`, `text-primary`, `text-accent`) في كل المكونات.
- لا حاجة إلى ترحيل (migration) في قاعدة البيانات.
- لن تتأثر صفحات أخرى أو وحدات إدارة أخرى (الأخبار، المعاينة، إلخ).
