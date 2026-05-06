## الهدف
نقل قائمة بطاقات الخدمات الإلكترونية (التطوع، طلب عضوية، طلب مساعدة، تبرع، شراكة، رعاية فعالية، استفسار، شكوى، شهادة شكر) من تبويب **الخدمات الإلكترونية** في "محتوى الصفحات" إلى صفحة **نماذج الخدمات** الموحّدة، مع الإبقاء على التبويب لتحرير **عنوان ووصف الصفحة فقط**.

## التغييرات

### 1. قاعدة البيانات (هجرة جديدة)
- بذر (seed) السجلات الست المتبقية في `custom_forms` كنماذج "قادمة قريباً":
  - `aid_request`, `donation`, `corporate_partnership`, `event_sponsorship`, `general_inquiry`, `complaint_feedback`, `volunteer_certificate`
- إضافة عمود جديد `coming_soon boolean default false` على `custom_forms` لتمييز "قادم قريباً" بدل ربطها بحالة النشر.
- جعلها مُعلَّمة بـ `is_system = '<key>'` لمنع حذفها من المدير (مع السماح بالتعديل/الأرشفة/الإخفاء).

### 2. صفحة نماذج الخدمات `AdminFormsPage.tsx`
- إضافة شارة "قادم قريباً" + مفتاح Switch لتفعيل/إيقاف الحالة.
- توسيع منطقة التحرير لتشمل: `audience` (للأفراد/جهات/استفسارات)، `duration`، `icon`، `featured`، `description`.
- تجميع التبويبات: **نشط / قادم قريباً / مؤرشف**.

### 3. تبويب الخدمات الإلكترونية في `AdminPageContentPage.tsx`
- إزالة قسم `services_list` (المحرّر اليدوي للبطاقات) من واجهة هذا التبويب فقط.
- الإبقاء فقط على قسم `intro` (عنوان + وصف الصفحة).
- إضافة شريط ملاحظة بزر "إدارة بطاقات الخدمات ←" يوجّه إلى `/admin/forms`.

### 4. صفحة الواجهة `EServicesIndex.tsx`
- إزالة الاعتماد على `servicesSection.data.items` و`SERVICES` الثابتة.
- جلب جميع البطاقات من `custom_forms` فقط (تشمل النظامية وغير النظامية):
  - الزر يفتح `/e-services/<system_route>` للنماذج النظامية المعروفة (volunteer/membership/contact)، أو `/e-services/form/:slug` للبقية.
  - النماذج المؤشّرة `coming_soon=true` تظهر بشارة "قريباً" بدون زر تنفيذ.
- الإبقاء على `intro` كمصدر لعنوان/وصف الصفحة فقط.

### 5. صفحة `CustomFormPage.tsx`
- عرض شاشة "الخدمة قادمة قريباً" بدل النموذج إذا كانت `coming_soon=true`.

## تفاصيل تقنية
- لن يتم حذف بيانات `page_content.services_list` الموجودة (للأمان والتراجع)، فقط لن تُعرض في الواجهتين.
- النماذج النظامية الجديدة (السبعة) بدون حقول افتراضياً (`fields: []`)؛ المدير يضيف الحقول لاحقاً عند تفعيل الخدمة.
- `is_system` يمنع زر الحذف ويُظهر شارة "نظامي" كما في النماذج الثلاثة الحالية.

## الملفات المتأثرة
- جديد: `supabase/migrations/<ts>_seed_eservices_forms.sql`
- تعديل: `src/pages/admin/AdminFormsPage.tsx`
- تعديل: `src/pages/admin/AdminPageContentPage.tsx`
- تعديل: `src/pages/eservices/EServicesIndex.tsx`
- تعديل: `src/pages/eservices/CustomFormPage.tsx`
- تعديل: `src/hooks/useSystemForm.ts` (توسيع نوع `key` ليشمل المفاتيح الجديدة عند الحاجة)
