# استبدال حقول الأيقونة النصية بمنتقي الأيقونات

## الهدف
توحيد تجربة اختيار الأيقونات في لوحة التحكم باستخدام `IconPicker` المرئي بدل كتابة اسم الأيقونة يدويًا.

## الحالة الحالية
- `IconPicker` موجود ويُستخدم في: `AdminAboutPage` (القيم/المبادئ) و`AdminPageContentPage` (الميزات/البطاقات).
- لا يزال هناك حقول إدخال نصية للأيقونة في:
  - `AdminProgramsPage.tsx` (السطر 95) — حقل أيقونة البرنامج.
  - `AdminFormsPage.tsx` (السطر 353) — حقل أيقونة النموذج.
- مكتبة `IconPicker` الحالية تحتوي 27 أيقونة فقط، وتنقصها أيقونات شائعة الاستخدام مثل `GraduationCap`, `FileText`, `Stethoscope`, `Home`, `Briefcase`, `Activity`, `Building`, `Megaphone`, `Calendar`, `Mail`, `Phone`, `MapPin`, `Music`, `Camera`, `Utensils`, `Baby`, `Accessibility`, `HelpingHand`, `Scale`, `Newspaper`, `BookMarked`, `ClipboardList`.

## التغييرات المقترحة

### 1) توسيع `IconPicker`
- إضافة ~22 أيقونة جديدة للمكتبة لتغطية المجالات الخيرية (تعليم، صحة، إغاثة، أيتام، شباب، تنمية).
- لا تغيير في واجهة المكوّن (نفس `value` / `onChange`).

### 2) `AdminProgramsPage.tsx`
- استيراد `IconPicker`.
- استبدال `<Input value={v.icon}>` بـ `<IconPicker value={v.icon} onChange={(n) => set("icon", n)} />`.

### 3) `AdminFormsPage.tsx`
- استيراد `IconPicker`.
- استبدال `<Input value={value.icon}>` بـ `<IconPicker value={value.icon} onChange={(n) => update("icon", n)} />`.

## خارج النطاق
- صفحات تعرض الأيقونات للعموم لا تحتاج تعديل (تستخدم نفس أسماء Lucide).
- لا تغييرات في قاعدة البيانات (الحقل لا يزال نصيًا).

## التكلفة
تعديل بسيط في 3 ملفات، بدون تبعيات جديدة.
