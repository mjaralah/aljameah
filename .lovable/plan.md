الهدف: إزالة الأيقونة (Favicon) المخصصة الحالية وإعادتها إلى الحالة الافتراضية.

الحالة الحالية:
- يوجد ملف `public/favicon.ico` مخصص (57KB).
- في `index.html` لا يوجد `<link rel="icon">` ثابت في `<head>`؛ بدلاً من ذلك يتم حقن الأيقونة ديناميكياً عبر سكريبت inline يقرأ `favicon_url` من `localStorage` (`site_brand_cache_v1`).
- كذلك يتم تحديث الأيقونة ديناميكياً في `SiteSettingsContext.tsx` و `applyCachedBrand.ts` عند تغيير إعدادات الهوية.

الخطوات:
1. حذف ملف `public/favicon.ico`.
2. تعديل `index.html`: إزالة الجزء الخاص بـ `favicon_url` من السكريبت inline (الأسطر التي تبحث عن/تنشئ `link[rel='icon']` وتضبط `href`).
3. تعديل `src/contexts/SiteSettingsContext.tsx`: إزالة كود تطبيق `favicon_url` على عنصر `<link rel="icon">`.
4. تعديل `src/lib/applyCachedBrand.ts`: إزالة كود تطبيق `favicon_url` على عنصر `<link rel="icon">`.

النتيجة المتوقعة: بعد الحذف، سيعود المتصفح للبحث تلقائياً عن `/favicon.ico` (وهو غير موجود)، أو تظل الأيقونة فارغة/افتراضية حسب المتصفح. لن يُعرض أي أيقونة مخصصة.