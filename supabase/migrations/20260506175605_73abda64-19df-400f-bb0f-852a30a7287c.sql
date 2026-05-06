
-- Add archive and system flags to custom_forms
ALTER TABLE public.custom_forms
  ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_system TEXT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS custom_forms_is_system_uniq ON public.custom_forms(is_system) WHERE is_system IS NOT NULL;

-- Seed system rows for the 3 built-in forms (volunteer / membership / contact)
INSERT INTO public.custom_forms (slug, title, description, icon, audience, duration, fields, success_message, published, featured, sort_order, is_system)
VALUES
('volunteer-system', 'انضم لفريق المتطوعين', 'كن جزءاً من رسالتنا في خدمة المجتمع — املأ النموذج وسنتواصل معك', 'HandHeart', 'individuals', '٣ دقائق',
  '[
    {"key":"fullName","label":"الاسم الرباعي","type":"text","required":true},
    {"key":"idNumber","label":"رقم الهوية","type":"text","required":true},
    {"key":"gender","label":"الجنس","type":"select","required":true,"options":["ذكر","أنثى"]},
    {"key":"nationality","label":"الجنسية","type":"text","required":true},
    {"key":"city","label":"مكان الإقامة","type":"text","required":true},
    {"key":"birthDate","label":"تاريخ الميلاد","type":"date","required":true},
    {"key":"maritalStatus","label":"الحالة الاجتماعية","type":"select","required":true,"options":["أعزب","متزوج","أخرى"]},
    {"key":"phone","label":"رقم الجوال","type":"phone","required":true},
    {"key":"education","label":"المؤهل العلمي","type":"select","required":true},
    {"key":"skills","label":"المهارات والقدرات","type":"select","required":true},
    {"key":"hasPriorExperience","label":"خبرة سابقة في التطوع","type":"select","required":true},
    {"key":"previousOrg","label":"الجهة السابقة (إن وجدت)","type":"text"},
    {"key":"job","label":"المسمى الوظيفي","type":"text"},
    {"key":"employer","label":"جهة العمل","type":"text"},
    {"key":"preferredActivities","label":"الأنشطة المفضلة","type":"textarea","required":true},
    {"key":"volunteerLocation","label":"مكان التطوع","type":"select","required":true},
    {"key":"otherLocation","label":"مكان آخر","type":"text"},
    {"key":"availability","label":"وقت التطوع","type":"select","required":true},
    {"key":"referralSource","label":"كيف عرفت عنا؟","type":"select","required":true}
  ]'::jsonb,
  'تم استلام طلب التطوع بنجاح، سنتواصل معك خلال 3 أيام عمل', true, true, 0, 'volunteer'),

('membership-system', 'طلب عضوية الجمعية', 'انضم رسمياً إلى أسرة الجمعية، واحصل على مزايا حصرية وحق المشاركة في صنع القرار', 'BadgeCheck', 'individuals', '٥ دقائق',
  '[
    {"key":"fullName","label":"الاسم كاملاً","type":"text","required":true},
    {"key":"phone","label":"رقم الجوال","type":"phone","required":true},
    {"key":"gender","label":"الجنس","type":"select","required":true,"options":["ذكر","أنثى"]},
    {"key":"email","label":"البريد الإلكتروني","type":"email","required":true},
    {"key":"nationalId","label":"رقم الهوية الوطنية","type":"text","required":true},
    {"key":"education","label":"المؤهل العلمي","type":"select","required":true},
    {"key":"jobTitle","label":"المسمى الوظيفي","type":"text"},
    {"key":"employer","label":"جهة العمل","type":"text"}
  ]'::jsonb,
  'تم استلام طلب العضوية، سنتواصل معك خلال 3 أيام عمل', true, true, 1, 'membership'),

('contact-system', 'تواصل معنا', 'أرسل لنا رسالتك أو استفسارك وسنرد خلال 48 ساعة', 'MessageSquare', 'inquiries', 'دقيقتان',
  '[
    {"key":"fullName","label":"الاسم الكريم","type":"text","required":true},
    {"key":"phone","label":"رقم الجوال","type":"phone","required":true},
    {"key":"email","label":"البريد الإلكتروني","type":"email","required":true},
    {"key":"purpose","label":"الغرض من التواصل","type":"select","required":true,"options":["استفسار عام","شراكة وتعاون","شكوى أو ملاحظة","استفسار عن التبرعات","تواصل إعلامي","أخرى"]},
    {"key":"message","label":"الرسالة","type":"textarea","required":true}
  ]'::jsonb,
  'تم استلام رسالتك بنجاح، سنرد عليك خلال 48 ساعة', true, false, 2, 'contact')
ON CONFLICT DO NOTHING;
