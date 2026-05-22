## المشكلة
عند تغيير ألوان الهوية من **الإعدادات العامة**، يتم تحديث متغيرين فقط في الجذر:
- `--primary` (اللون الأساسي)
- `--accent` (اللون الثانوي)

بينما الموقع يعتمد على عشرات المتغيرات المشتقة من هذين اللونين والتي تظل مثبتة على القيم الأصلية (أخضر/ذهبي) في `index.css`، مما يجعل أجزاء كثيرة لا تتغير:

| المتغير | يُستخدم في |
|---|---|
| `--gradient-primary` | البطاقات، الهيدر، الأيقونات، PageHero، SectionRenderer (CTA)، VolunteerCta |
| `--gradient-cta` / `--gradient-hero` / `--gradient-gold` | البطل الرئيسي، VolunteerCta، AboutPreview |
| `--primary-glow` | تدرّجات الهوفر والإشعاعات |
| `--ring` | حلقة تركيز الحقول |
| `--accent-soft` | خلفية أيقونات SectionHeader |
| `--shadow-soft` / `--shadow-card` / `--shadow-gold` | ظلال البطاقات والأزرار الذهبية |
| `--sidebar-primary` / `--sidebar-accent` / `--sidebar-ring` | الشريط الجانبي في لوحة التحكم |
| `--primary-foreground` / `--accent-foreground` | لون النص فوق الخلفيات الملونة |

نتيجة ذلك: الهيدر، أيقونات الصفحات، CTA "تطوع معنا"، أبطال الصفحات (PageHero)، الشريط العلوي (TopBar)، شارة التوثيق، والشريط الجانبي للوحة التحكم… تبقى بالألوان الأصلية حتى لو غيّر المدير اللونين.

## الحل
ترقية `SiteSettingsProvider` ليُولّد **كامل منظومة التوكنات** ديناميكياً من اللونين HEX المختارين، بدلاً من تحديث متغيرين فقط.

### الخطوات

**1) توسيع `src/contexts/SiteSettingsContext.tsx`**

إضافة مساعدات تحويل ألوان متقدمة:
- `hexToHslParts(hex)` يُعيد `{h, s, l}` بأرقام (موجودة جزئياً، تُحدَّث لإعادة الأرقام).
- `hslString({h,s,l})` → سلسلة `"H S% L%"`.
- `adjust({h,s,l}, {dl, ds, dh})` لاشتقاق درجات أفتح/أغمق/أكثر تشبعاً.
- `pickForeground({h,s,l})` يختار `0 0% 100%` أو `0 0% 10%` حسب سطوع اللون لضمان التباين.

عند ورود `primary_color` و `secondary_color` يحسب التوكنات التالية ويُطبّقها على `:root`:

```
--primary              = primary
--primary-foreground   = pickForeground(primary)
--primary-glow         = adjust(primary, {dl: +14, ds: -10})
--ring                 = primary
--secondary            = adjust(primary, {dl: +60, ds: -30})         /* تينت فاتح */
--secondary-foreground = adjust(primary, {dl: -6, ds: 0})

--accent               = accent
--accent-foreground    = pickForeground(accent)
--accent-soft          = adjust(accent, {dl: +44, ds: +14})

--gradient-primary = linear-gradient(135deg, hsl(P), hsl(adjust(P,{dl:+8})))
--gradient-gold    = linear-gradient(135deg, hsl(A), hsl(adjust(A,{dl:+10})))
--gradient-hero    = linear-gradient(135deg, hsl(adjust(P,{dl:-6})/0.85), hsl(adjust(P,{dl:+4})/0.6))
--gradient-cta     = linear-gradient(120deg, hsl(P) 0%, hsl(adjust(P,{dl:+8})) 60%, hsl(A) 100%)

--shadow-soft = 0 4px 20px -8px hsl(P / 0.15)
--shadow-card = 0 10px 30px -12px hsl(P / 0.18)
--shadow-gold = 0 8px 24px -10px hsl(A / 0.40)

--sidebar-primary               = primary
--sidebar-primary-foreground    = pickForeground(primary)
--sidebar-accent                = accent
--sidebar-accent-foreground     = pickForeground(accent)
--sidebar-ring                  = primary
--sidebar-border                = adjust(primary, {dl: +55, ds: -35})
```

كل القيم تُكتب عبر `root.style.setProperty(...)` بحيث تتجاوز ما في `index.css` (Specificity أعلى).

**2) دعم الوضع الداكن**

نفس الـ Provider يكتشف وجود الكلاس `.dark` ويعيد توليد نسخ معدّلة (سطوع أعلى للأساسي، خلفيات أغمق للسايدبار) عند التبديل، باستخدام `MutationObserver` على `documentElement.classList`.

**3) إزالة الفولباك الزائد**

عند عدم وجود إعدادات أو ألوان محفوظة، يستخدم Provider اللونين الافتراضيين `#1B5E35` و `#C5973A` (نفس القيم الحالية في `index.css`) ليبقى المظهر مطابقاً قبل التخصيص.

**4) لمسة تحقق**

بعد التطبيق، سيتم اختبار:
- تغيير اللون الأساسي إلى أزرق → التحقق من تحوّل: الهيدر، Hero، PageHero، CTA التطوع، بطاقات البرامج، أيقونات SectionHeader، شارة التوثيق في TopBar، والسايدبار في لوحة التحكم.
- تغيير اللون الثانوي → التحقق من الأزرار الذهبية وشارات Hero.

## ملاحظات تقنية
- لا تغييرات على قاعدة البيانات.
- لا تغييرات على `index.css` (تبقى الافتراضيات للزوار قبل تحميل الإعدادات).
- لا تغييرات على المكوّنات؛ كلها تستهلك التوكنات تلقائياً.
- العناصر التي تستخدم `bg-white/10`, `bg-black/70`, `text-white` فوق الأبطال المتدرجة هي زخرفية مقصودة (Glass overlays) وتبقى كما هي.

## الملفات المتأثرة
- `src/contexts/SiteSettingsContext.tsx` (الملف الوحيد المعدَّل)
