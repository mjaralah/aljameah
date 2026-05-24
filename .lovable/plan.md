# زر التواصل عبر واتساب عائم (Floating WhatsApp Button)

## الفكرة الإبداعية
زر عائم دائري في الزاوية السفلية (يسار في RTL) بلون واتساب الأخضر المميز، مع:
- **نبضة لطيفة (pulse ring)** تجذب الانتباه دون إزعاج
- **تلميح منبثق (tooltip)** يظهر تلقائياً بعد 5 ثوانٍ من تحميل الصفحة لأول مرة، بنص ترحيبي قابل للتخصيص ("مرحباً 👋 كيف يمكننا مساعدتك؟")
- **زر إغلاق صغير** على التلميح حتى لا يكون مزعجاً
- **أيقونة WhatsApp** من lucide-react (`MessageCircle`) أو SVG رسمية
- يظهر بعد تمرير بسيط (scroll > 200px) لإبقاء الصفحة الأولى نظيفة
- متجاوب: حجم أصغر على الجوال
- يحترم وضع الـ Dark Mode

## أين يظهر
- في كل صفحات الموقع (يوضع في `Layout.tsx`) — وليس فقط الرئيسية، لأن المستخدم قد يحتاج التواصل من أي صفحة
- يختفي تلقائياً في صفحات لوحة التحكم (`/admin/*`)

## إعدادات لوحة التحكم
يضاف قسم جديد في `AdminSettingsPage.tsx` بعنوان **"زر واتساب العائم"** يحتوي:

| الحقل | النوع | الوصف |
|---|---|---|
| `whatsapp_enabled` | Switch | تفعيل/تعطيل الزر |
| `whatsapp_number` | Input | رقم الواتساب بصيغة دولية (مثل 966500000000) |
| `whatsapp_message` | Textarea | رسالة افتراضية تظهر في محادثة الواتساب |
| `whatsapp_tooltip` | Input | نص التلميح المنبثق |
| `whatsapp_show_tooltip` | Switch | إظهار/إخفاء التلميح التلقائي |
| `whatsapp_position` | Select | يسار / يمين |

## التغييرات التقنية

### 1. قاعدة البيانات (migration)
إضافة 6 أعمدة إلى جدول `site_settings`:
- `whatsapp_enabled boolean default false`
- `whatsapp_number text`
- `whatsapp_message text`
- `whatsapp_tooltip text`
- `whatsapp_show_tooltip boolean default true`
- `whatsapp_position text default 'left'`

### 2. ملفات جديدة
- `src/components/layout/WhatsAppFloat.tsx` — المكوّن العائم مع الأنيميشن

### 3. ملفات معدّلة
- `src/components/layout/Layout.tsx` — تركيب `<WhatsAppFloat />` مع إخفائه في مسارات `/admin`
- `src/pages/admin/AdminSettingsPage.tsx` — إضافة قسم إعدادات واتساب
- `src/hooks/usePublicContent.ts` — التأكد أن `useSiteSettings` يجلب الحقول الجديدة (تلقائي عبر `select *`)
- `src/index.css` — إضافة keyframes للنبضة (إن لم تكن موجودة)

### 4. الرابط
```
https://wa.me/{number}?text={encodeURIComponent(message)}
```
يفتح في تبويب جديد (`target="_blank"`, `rel="noopener noreferrer"`).

## ملاحظات
- لون الزر سيستخدم لون واتساب الرسمي `#25D366` كاستثناء بصري معروف عالمياً (مثل لون فيسبوك/تويتر) — وهذه ممارسة مقبولة لأن الزر يمثّل خدمة طرف ثالث، ولا يكسر هوية الموقع.
- لن يظهر الزر إذا كان `whatsapp_enabled = false` أو الرقم فارغ.
