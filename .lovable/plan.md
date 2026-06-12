## الخطة

إضافة زر تبديل الوضع الليلي بتصميم Eclipse Morph في الـ TopBar.

### الملفات الجديدة

1. **`src/contexts/ThemeContext.tsx`** — Context يدير الوضع:
   - state: `theme: "light" | "dark"`
   - يحفظ في `localStorage` بمفتاح `site_theme`
   - يحترم `prefers-color-scheme` كقيمة أولية
   - يطبق/يزيل class `dark` على `<html>`

2. **`src/components/layout/ThemeToggle.tsx`** — الزر بتصميم Eclipse Morph:
   - أيقونة دائرية بأشعة شمس + قمر منزلق (ظل دائري ينزلق ليكسف الشمس)
   - الأشعة تتقلص وتختفي عند التحول للوضع الليلي
   - الظل ينزلق من الزاوية ليغطي الشمس جزئياً مكوناً هلالاً
   - يستخدم `aria-label="تبديل الوضع الليلي / النهاري"` و `aria-pressed`
   - tooltip "المظهر" يظهر عند hover
   - الحركة تشتغل عند **النقر** (state-based) وليس فقط hover

### الملفات المعدّلة

3. **`src/components/layout/TopBar.tsx`** — إضافة `<ThemeToggle />` بجانب `LanguageToggle`.

4. **`src/main.tsx`** — لف التطبيق بـ `<ThemeProvider>`.

5. **`src/index.css`** — مراجعة أن `.dark` معرّف ويحتوي على متغيرات HSL مناسبة (موجود مسبقاً حسب فحص الكود).

### ما لن يتغير
- باقي مكونات TopBar وHeader.
- نظام الألوان الأساسي — فقط نضمن أن `.dark` يعمل على كل المكونات التي تستخدم semantic tokens.
- لوحة التحكم (الزر يظهر فقط في TopBar للموقع العام).

### السلوك
- النقر يبدل الوضع فوراً مع animation 500ms للانكساف.
- الاختيار يُحفظ ويستمر بين الجلسات.
- لا flash عند تحميل الصفحة (يُطبق الوضع قبل render عبر inline script في `index.html` أو effect مبكر).
