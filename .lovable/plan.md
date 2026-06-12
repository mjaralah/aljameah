## الملاحظات والتشخيص

### 1) كثرة الألوان في بطاقات التصنيفات (مركز مساعدة المدير `/admin/help`)
نعم — كخبير UI/UX، تعدد ألوان الخلفيات في البطاقات (وردي، أصفر، بنفسجي، أخضر، أزرق، خوخي…) **يُضعف الاحترافية** ويصرف الانتباه عن المحتوى. كبار اللاعبين (Intercom, Notion, Linear, Stripe, Atlassian) يستخدمون **بطاقات محايدة موحّدة** مع لمسة لون واحدة في الأيقونة فقط أو في الحد العلوي.

### 2) صفحة الدعم العامة في لوحة التحكم (`/admin/support-page`)
- تبويب «الإعدادات العامة» لا يُحاذي محتواه لليمين بشكل كامل (الحقول، التبديل، الزر).
- التبويبات الحالية ملوّنة (أزرق/بنفسجي/برتقالي) — نفس مشكلة تعدد الألوان.

---

## الخطة

### أ) توحيد بطاقات التصنيفات — نمط احترافي بهوية واحدة

**يطبَّق على:**
- `src/pages/admin/AdminHelpPage.tsx` (لوحة التحكم)
- `src/pages/Support.tsx` (الصفحة العامة) — لضمان الاتساق

**التغيير البصري:**

```text
قبل (الحالي):                    بعد (المقترح):
┌─────────┐ ┌─────────┐          ┌─────────┐ ┌─────────┐
│ وردي    │ │ أصفر    │          │ ⬜ محايد│ │ ⬜ محايد│
│ 🔴 من…  │ │ 🟡 برام…│          │ 🟢 من…  │ │ 🟢 برام…│
└─────────┘ └─────────┘          └─────────┘ └─────────┘
ضوضاء بصرية                       هدوء + تركيز على المحتوى
```

- خلفية البطاقة: `bg-card` موحّدة (أبيض/داكن حسب الثيم) + حد رفيع `border`.
- الأيقونة فقط بلون **العلامة التجارية الأساسي** (`text-primary`) داخل دائرة `bg-primary/10`.
- Hover: ارتفاع خفيف + حد `border-primary/40` + ظل ناعم.
- حالة «نشط/مختار»: حد سميك `border-primary` + خلفية `bg-primary/5` + شارة العدد بلون primary.
- شارة العدد: `bg-muted text-muted-foreground` (بدل خلفية بيضاء على ألوان متعددة).
- إزالة `CATEGORY_COLORS` المتعددة من `AdminHelpPage.tsx` كلياً.

النتيجة: شبكة هادئة، احترافية، تشبه مراكز مساعدة Intercom/Linear، والتركيز على العناوين والأرقام.

### ب) تحسين صفحة `/admin/support-page`

**1) RTL كامل وصحيح:**
- إضافة `dir="rtl"` وفئة `text-right` للحاوية الجذرية لـ `SettingsTab`.
- محاذاة كل `Label`, `Input`, `Textarea`, `Switch + Label`, وزر الحفظ إلى اليمين.
- استبدال `flex items-center gap-2` في صف التبديل بـ `flex flex-row-reverse justify-end` (التبديل قبل النص بمنطق العربية).
- توسعة عرض البطاقة من `max-w-2xl` إلى `max-w-3xl` مع padding أكبر `p-8`.

**2) شريط تبويبات احترافي بلون موحّد (مثل تبويبات «الجمعية العمومية»):**

استبدال الأسلوب الحالي (أزرق/بنفسجي/برتقالي) بنمط `AssemblyMembersEditor` الموحّد:

```tsx
<TabsList className="grid w-full grid-cols-4 h-auto p-1.5 bg-muted/70 
  border-2 border-border rounded-xl shadow-sm gap-1.5">
  <TabsTrigger className="gap-2 py-3 text-sm font-semibold rounded-lg 
    transition-all
    data-[state=active]:bg-primary 
    data-[state=active]:text-primary-foreground 
    data-[state=active]:font-bold 
    data-[state=active]:shadow-md 
    data-[state=active]:ring-2 
    data-[state=active]:ring-primary/30">
    <Icon /> العنوان <Badge>n</Badge>
  </TabsTrigger>
  ...
</TabsList>
```

- **لون واحد فقط** (الأساسي) للتبويب النشط — اتساق مع باقي اللوحة.
- شبكة `grid-cols-4` على الشاشات الكبيرة، `grid-cols-2` على الموبايل.
- حد سميك، ظل، وحلقة `ring` حول النشط = تمييز قوي بدون فوضى ألوان.
- شارات العدد بـ `variant="secondary"` محايدة.

---

## الملفات المتأثرة

| الملف | التعديل |
|---|---|
| `src/pages/admin/AdminSupportPage.tsx` | RTL في `SettingsTab` + استبدال نمط `TabsList`/`TabsTrigger` بنمط Assembly الموحّد |
| `src/pages/admin/AdminHelpPage.tsx` | حذف `CATEGORY_COLORS` متعدد الألوان + بطاقات بنمط محايد/primary |
| `src/pages/Support.tsx` | نفس تحديث بطاقات التصنيفات للاتساق مع لوحة التحكم |

— لا تغييرات في قاعدة البيانات. لا اعتماد على نماذج خارجية. لا تكاليف.
