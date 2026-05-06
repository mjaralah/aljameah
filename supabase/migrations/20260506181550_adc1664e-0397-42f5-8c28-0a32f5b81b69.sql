ALTER TABLE public.custom_forms ADD COLUMN IF NOT EXISTS coming_soon boolean NOT NULL DEFAULT false;

INSERT INTO public.custom_forms (slug, title, description, is_system, audience, icon, duration, fields, published, archived, coming_soon, sort_order, success_message)
VALUES
  ('aid_request','طلب مساعدة','تقديم طلب مساعدة مالية أو عينية للأسر المستحقة وفق معايير الجمعية.','aid_request','individuals','HeartHandshake','٧ دقائق','[]'::jsonb,true,false,true,10,'تم استلام طلبك بنجاح'),
  ('donation','تبرّع إلكتروني','تبرّع لبرامجنا المعتمدة بكل سهولة وأمان عبر قنوات دفع موثوقة.','donation','individuals','HandCoins','دقيقتان','[]'::jsonb,true,false,true,11,'شكراً لتبرعك'),
  ('corporate_partnership','شراكة مؤسسية','ابدأ شراكة مستدامة مع الجمعية وكن داعماً لمبادراتنا الإنسانية.','corporate_partnership','entities','Building2','١٠ دقائق','[]'::jsonb,true,false,true,12,'تم استلام طلب الشراكة'),
  ('event_sponsorship','طلب رعاية فعالية','تقديم طلب رعاية لفعالياتنا ومبادراتنا المجتمعية الموسمية.','event_sponsorship','entities','FileSignature','٨ دقائق','[]'::jsonb,true,false,true,13,'تم استلام طلب الرعاية'),
  ('general_inquiry','استفسار عام','أرسل استفسارك حول خدماتنا أو برامجنا وسنرد عليك في أسرع وقت.','general_inquiry','inquiries','HelpCircle','دقيقة','[]'::jsonb,true,false,true,14,'تم استلام استفسارك'),
  ('complaint_feedback','شكوى أو ملاحظة','ساعدنا في التحسين عبر إرسال شكواك أو ملاحظاتك بسرّية تامة.','complaint_feedback','inquiries','MessageSquareWarning','دقيقتان','[]'::jsonb,true,false,true,15,'تم استلام ملاحظتك'),
  ('volunteer_certificate','شهادة شكر للمتطوع','اطلب إصدار شهادة شكر معتمدة لساعاتك التطوعية مع الجمعية.','volunteer_certificate','individuals','Award','دقيقة','[]'::jsonb,true,false,true,16,'تم استلام طلبك')
ON CONFLICT (slug) DO NOTHING;