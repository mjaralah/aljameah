## التغييرات المطلوبة

### 1) إعادة تنسيق الشريط السفلي — توسيط وعمودين

في `src/components/layout/Footer.tsx` نستبدل الشريط الحالي (المُوزَّع يميناً/يساراً) بشريط واحد أنيق متمركز يتكوّن من سطرين:

- **السطر العلوي** (أبرز): «طُوِّر بواسطة: **Business Trip**» — حجم خط أكبر (`text-sm`) ووزن أعرض (`font-semibold`)، مع إبقاء «Business Trip» بلون `text-accent` ورابط بخط أسفل عند التحويم.
- **السطر السفلي** (أهدأ): «© 2026 جميع الحقوق محفوظة لـ{اسم الجمعية}» — أصغر (`text-xs`) وأخف (`text-primary-foreground/70`)، مع رقم التسجيل بعد فاصل `·` (يبقى مشروطاً بـ `footer_bottom`).

البنية:
```text
border-t border-primary-foreground/15
  container py-5 flex flex-col items-center justify-center gap-1.5 text-center
    [سطر 1] طُوِّر بواسطة: Business Trip   ← text-sm font-semibold
    [سطر 2] © 2026 جميع الحقوق ... · رقم التسجيل: ...   ← text-xs opacity-70
```

ندعم RTL/EN تلقائياً عبر `t`/`isEn` كما هو.

### 2) حل جذري لوميض الهوية القديمة عند التحديث

**سبب المشكلة الجذري:** ملف `src/main.tsx` يُحمَّل كـ ES Module مؤجَّل (defer)، أي أن المتصفح يرسم الصفحة باستخدام قيم `:root` الافتراضية في `index.css` قبل أن يصل JS وينفّذ `applyCachedBrand()` — وهذا يسبب وميض الهوية القديمة لأجزاء من الثانية.

**الحل:** نقل تطبيق الكاش إلى **سكربت inline متزامن داخل `<head>`** في `index.html`، يعمل قبل أول رسم (paint) للمتصفح. خصائص CSS المضبوطة عبر `style.setProperty` على `documentElement` تتفوّق على قيم `:root` في الـ stylesheet، فيختفي الوميض كلياً.

الخطوات:
1. **`index.html`**: إضافة `<script>` متزامن في `<head>` (قبل وسم `<link rel="stylesheet">` إن أمكن، أو على الأقل قبل `<script type="module" src="/src/main.tsx">`) يحتوي نسخة مُبسَّطة من `applyCachedBrand` تقرأ `localStorage["site_brand_cache_v1"]` وتطبّق المتغيرات: `--primary`, `--primary-foreground`, `--primary-glow`, `--accent`, `--accent-foreground`, `--ring`, `--gradient-primary`, `--gradient-hero`, `--gradient-cta`, `--shadow-card`, ومتغيرات الشريط الجانبي.
2. **`src/main.tsx`**: حذف استدعاء `applyCachedBrand()` (لم يعد مطلوباً، يُنفَّذ في HTML).
3. **`src/lib/applyCachedBrand.ts`**: يبقى كما هو (للاستخدام الاحتياطي عبر `SiteSettingsContext` بعد التحميل لا يُغيَّر).
4. تحديث `title` و `favicon` أيضاً داخل السكربت inline لإزالة وميض اسم/أيقونة الموقع القديم.

السكربت inline سيُكتب بـ JavaScript عادي (لا TypeScript) ضمن `<script>...</script>` مباشرة في `index.html` ليعمل فوراً دون انتظار البندل.

### الملفات المتأثرة
- `src/components/layout/Footer.tsx` — إعادة تنسيق الشريط السفلي.
- `index.html` — إضافة سكربت inline لتطبيق الهوية المخزّنة فوراً.
- `src/main.tsx` — إزالة الاستدعاء المكرر.
