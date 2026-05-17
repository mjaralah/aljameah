# إكمال توحيد لوحة التحكم — الجولة الثانية

## الهدف
توحيد بقية عناصر لوحة التحكم (خارج بطاقات القوائم التي وُحّدت سابقاً) ليصبح كل قسم متّسقاً بصرياً وسلوكياً، مع الحفاظ على هوية الموقع.

---

## 1) رأس صفحة موحّد — `AdminPageHeader`
مكوّن جديد: `src/components/admin/AdminPageHeader.tsx`

Props:
```
{ title, description?, icon?, actionLabel?, onAction?, searchValue?, onSearchChange?, extra? }
```

يرسم:
- شريط علوي أنيق: أيقونة دائرية بلون `primary/10` + عنوان (H1) + وصف رمادي صغير
- يسار: زر «+ إضافة» بلون `primary` بنفس الحجم والأيقونة (`Plus`) في كل مكان
- صف ثانٍ اختياري: حقل بحث (`Search` icon) + فلاتر (`extra`)

يُطبَّق على: News, Programs, Partners, Board, Hero, Surveys, Forms, Pages, Legal Pages, Governance, About, PageContent, Users, Settings، وصفحات الطلبات.

## 2) حالة فارغة موحّدة — `AdminEmptyState`
مكوّن جديد: `src/components/admin/AdminEmptyState.tsx`

Props: `{ icon, title, description?, actionLabel?, onAction? }`

تصميم: أيقونة كبيرة بلون باهت + عنوان + وصف + زر إجراء اختياري. حشوة عمودية مريحة (`py-16`).

يُستبدل به كل عرض «لا يوجد بيانات» الحالي في `CrudPage`, `AdminFormsPage`, `AdminSurveysPage`, صفحات الطلبات.

## 3) نوافذ تحرير موحّدة — `AdminDialog`
غلاف رفيع فوق `Dialog` الحالي:
- عرض موحّد (`max-w-2xl` افتراضياً، `max-w-4xl` للنماذج الطويلة)
- رأس بعنوان + وصف اختياري
- تذييل ثابت بزرّين: «إلغاء» (outline) + «حفظ» (primary) بنفس الترتيب والحجم
- حشوة موحّدة `p-6`

يُطبَّق على كل نوافذ التحرير في صفحات الإدارة.

## 4) شريط أدوات القائمة — `AdminListToolbar`
يقع بين الـ Header والقائمة، يحوي (عند الحاجة):
- عدّاد العناصر («12 خبراً»)
- مفاتيح تصفية: «الكل / منشور / مسودة»
- زر فرز
- زر تصدير (مستقبلاً)

يُدمج اختيارياً عبر prop في `CrudPage`.

## 5) صفحات الطلبات — جدول موحّد `AdminDataTable`
طبيعتها بيانية (أعمدة كثيرة)، فالبطاقات غير مناسبة. ننشئ مكوّناً موحّداً:

`src/components/admin/AdminDataTable.tsx` — جدول `Table` (shadcn) بـ:
- رأس ملوّن خفيف `bg-muted/50`
- صفوف بتباعد مريح وحدود رفيقة
- عمود إجراءات ثابت يميناً بنفس الأزرار الملوّنة (عرض/تحديث حالة/حذف)
- شارة حالة موحّدة (جديد/قيد المعالجة/مكتمل/مرفوض) بألوان من design tokens

يُطبَّق على:
- `RequestsPage` (الأساس)
- `AdminContactMessagesPage`
- `AdminVolunteerRequestsPage`
- `AdminMembershipRequestsPage`
- `AdminFeedbackPage`

## 6) صفحتا الإعدادات والمستخدمين
- `AdminUsersPage`: يستخدم `AdminPageHeader` + `AdminDataTable` (أعمدة: المستخدم/البريد/الدور/تاريخ التسجيل/إجراءات).
- `AdminSettingsPage`: `AdminPageHeader` + تقسيم المحتوى لأقسام داخل `Card` بعناوين موحّدة (`SectionHeader`). الحقول تبقى كما هي.

---

## التفاصيل التقنية

### مكوّنات جديدة
```
src/components/admin/
  ├─ AdminPageHeader.tsx
  ├─ AdminEmptyState.tsx
  ├─ AdminDialog.tsx
  ├─ AdminListToolbar.tsx
  ├─ AdminDataTable.tsx
  └─ SectionHeader.tsx
```

### ألوان وهوية
كل المكونات تستخدم design tokens فقط: `primary`, `success`, `destructive`, `muted`, `border`, `card`. لا ألوان مباشرة. الخط والحواف والظلال متطابقة مع `AdminListRow` الحالي للحفاظ على وحدة الهوية.

### ما لن يتغيّر
- لا تعديلات على قاعدة البيانات ولا RLS
- لا تغيير على منطق الحفظ أو الاستعلامات
- نماذج التحرير (الحقول نفسها) تبقى كما هي — فقط الغلاف يتوحّد
- وظيفة السحب والإفلات في القوائم تبقى كما هي

---

## أثر التنفيذ على تجربة المستخدم

- **تعلّم مرة واحدة**: المدير يحفظ مكان الأزرار والإجراءات ويستخدمها بثقة في كل الصفحات.
- **سرعة في الاستخدام**: الذاكرة العضلية تعمل (زر الإضافة في نفس المكان، نفس اللون، نفس الأيقونة).
- **مظهر احترافي**: لوحة التحكم تبدو منتجاً واحداً متماسكاً.
- **صيانة وتطوير أسهل**: أي تحسين مستقبلي على المكوّن الموحّد ينعكس فوراً على كل الصفحات.

## الترتيب المقترح للتنفيذ
1. إنشاء المكونات الستة الجديدة
2. تطبيقها على صفحات `CrudPage` (Header + EmptyState + Toolbar)
3. تطبيقها على الصفحات المخصّصة (Forms, Surveys, PageContent)
4. توحيد صفحات الطلبات عبر `AdminDataTable`
5. توحيد صفحتي Users و Settings
