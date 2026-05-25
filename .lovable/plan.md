# إصلاح صفحة المستخدمون والأدوار + تحسينات UX

## 1) سبب عدم ظهور الاسم والبريد

تحققت من قاعدة البيانات: الحسابات الجديدة موجودة في `auth.users` لكن **لا يوجد صف مقابل في جدول `profiles`**. السبب أن الدالة `handle_new_user` موجودة لكن **التريغر غير مربوط بـ `auth.users`** (لا يوجد سوى `profiles_touch`). والـ Edge Function تستخدم `UPDATE` على profiles بدلاً من `UPSERT` فلا ينشئ شيئاً.

**الحل:**
- ربط تريغر `on_auth_user_created` بجدول `auth.users` ليُنشئ الـ profile تلقائياً عند أي إنشاء (تسجيل عادي أو من Admin API).
- تحديث `admin-create-user` لاستخدام `upsert` بدل `update` كحماية مضاعفة.
- تنفيذ Backfill لإنشاء profiles للحسابات الثلاثة الموجودة حالياً (admin@test.com, admin@gmail.com, admin9@gmail.com).

## 2) تعطيل/تفعيل الحسابات مؤقتاً (Archive)

سنستخدم خاصية **`ban_duration`** في Supabase Auth Admin API (تعديل `banned_until` لمنع الدخول دون حذف). 

- إضافة Edge Function جديدة `admin-update-user` تدعم: `disable` / `enable` / `delete` / `reset_password` بحماية كاملة (تحقق أن المنادي Admin، ومنع المدير من تعطيل نفسه).
- إظهار شارة الحالة في الجدول: **نشط / معطّل**، مع تاريخ آخر دخول.

## 3) تحسينات UX/UI إضافية

أ. **عرض موسّع لكل صف**
- عمود **"آخر دخول"** (`last_sign_in_at`) — مفيد لمعرفة الحسابات الراكدة.
- عمود **"تاريخ الإنشاء"**.
- عمود **"الحالة"** (نشط/معطّل) بشارة ملوّنة.
- صورة رمزية (Avatar بحرفين) بجانب الاسم.

ب. **إجراءات الصف (Actions) مُحدَّثة**
- ✏️ **تعديل** (تغيير الاسم/الدور).
- 🔑 **إعادة تعيين كلمة المرور** (يولّد كلمة جديدة ويعرضها).
- 🚫 **تعطيل / ✅ تفعيل** (Toggle).
- 🗑️ **حذف نهائي** (مع تأكيد قوي + كتابة البريد للتأكيد).
- إخفاء "تعطيل" و"حذف" على حساب المستخدم الحالي نفسه.

ج. **تجميع الأدوار في صف واحد**
حالياً المستخدم الذي يملك دورين يظهر مرتين. سندمج الصفوف حسب `user_id` ونعرض شارتين للأدوار في خلية واحدة (أوضح وأقل تكراراً).

د. **بحث وفلترة**
- شريط بحث (اسم/بريد).
- فلتر سريع: الكل / مدراء / محررون / معطّلون.

هـ. **عدّادات سريعة في الترويسة**
شارات صغيرة تعرض: عدد المدراء، عدد المحررين، عدد المعطّلين.

و. **تحسينات على نافذة "إنشاء حساب"**
- مؤشر قوة كلمة المرور (ضعيفة/متوسطة/قوية).
- خيار "إرسال بيانات الدخول بالبريد" (لاحقاً — سنترك زر "نسخ" الحالي الآن).
- التحقق المباشر من توفّر البريد قبل الإرسال.

## التفاصيل التقنية

```text
DB migration:
  - CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  - Backfill INSERT INTO profiles لكل auth.users المفقودين.

Edge Functions:
  - admin-create-user: استبدال update → upsert.
  - admin-update-user (جديد): {action: "disable"|"enable"|"delete"|"reset_password"|"update_profile", user_id, ...}
    يستخدم admin.auth.admin.updateUserById({ban_duration: "876000h" | "none"}).

Frontend (AdminUsersPage.tsx):
  - تغيير load() لاستعلام يجمع user_roles + profiles + معلومات auth (عبر edge function list أو RPC جديدة) لجلب last_sign_in_at و banned_until.
  - إنشاء RPC آمنة public.list_admin_users() (SECURITY DEFINER, للمدراء فقط) ترجع: user_id, email, full_name, roles[], last_sign_in_at, created_at, is_disabled.
  - إعادة بناء الجدول بصفوف موحّدة + أعمدة جديدة + إجراءات.
  - نوافذ: تعديل، إعادة تعيين كلمة المرور، تأكيد التعطيل، تأكيد الحذف.
```

## نطاق الاستبعاد
- لن أضيف إرسال البريد التلقائي (يحتاج تهيئة SMTP — أؤجله حتى يطلب المستخدم).
- لن أضيف سجل تدقيق (Audit log) إلا إذا طلب.
