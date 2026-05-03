
-- Seed governance documents from static data (only if table empty)
INSERT INTO public.governance_documents (title, description, category, file_url, sort_order, published)
SELECT * FROM (VALUES
  ('النظام الأساسي للجمعية', 'الوثيقة التأسيسية للجمعية', 'policies', 'https://placehold.co/bylaws-2020.pdf', 1, true),
  ('سياسة مكافحة غسل الأموال', null, 'policies', 'https://placehold.co/aml-policy.pdf', 2, true),
  ('سياسة تضارب المصالح', null, 'policies', 'https://placehold.co/coi-policy.pdf', 3, true),
  ('ميثاق السلوك المهني', null, 'policies', 'https://placehold.co/code-of-conduct.pdf', 4, true),
  ('سياسة حماية المستفيدين', null, 'policies', 'https://placehold.co/protection.pdf', 5, true),
  ('سياسة الإفصاح', null, 'policies', 'https://placehold.co/disclosure.pdf', 6, true),
  ('اللائحة الإدارية والمالية', null, 'regulations', 'https://placehold.co/admin-fin-regulation.pdf', 1, true),
  ('لائحة الموارد البشرية', null, 'regulations', 'https://placehold.co/hr-regulation.pdf', 2, true),
  ('لائحة المشتريات والعقود', null, 'regulations', 'https://placehold.co/procurement.pdf', 3, true),
  ('لائحة المتطوعين', null, 'regulations', 'https://placehold.co/volunteers-reg.pdf', 4, true),
  ('الخطة الاستراتيجية 2025-2030', null, 'plans', 'https://placehold.co/strategic-2025-2030.pdf', 1, true),
  ('الخطة التشغيلية السنوية', null, 'plans', 'https://placehold.co/operational-2025.pdf', 2, true),
  ('خطة التحول الرقمي', null, 'plans', 'https://placehold.co/digital-plan.pdf', 3, true),
  ('قرار توظيف الفائض المالي', null, 'investments', 'https://placehold.co/investment-2024-01.pdf', 1, true),
  ('سياسة الاستثمار المعتمدة', null, 'investments', 'https://placehold.co/investment-policy.pdf', 2, true),
  ('قرارات لجنة الاستثمار', null, 'investments', 'https://placehold.co/investment-committee-2023.pdf', 3, true),
  ('تقرير المساعدات العينية 2024', null, 'aid', 'https://placehold.co/in-kind-aid-2024.pdf', 1, true),
  ('تقرير المساعدات النقدية 2024', null, 'aid', 'https://placehold.co/cash-aid-2024.pdf', 2, true),
  ('تقرير المساعدات الموحّد 2023', null, 'aid', 'https://placehold.co/aid-2023.pdf', 3, true),
  ('القوائم المالية المدققة 2024', null, 'financialReports', 'https://placehold.co/financials-2024.pdf', 1, true),
  ('القوائم المالية المدققة 2023', null, 'financialReports', 'https://placehold.co/financials-2023.pdf', 2, true),
  ('القوائم المالية المدققة 2022', null, 'financialReports', 'https://placehold.co/financials-2022.pdf', 3, true),
  ('التقرير السنوي 2024', null, 'annualReport', 'https://placehold.co/annual-2024.pdf', 1, true),
  ('التقرير السنوي 2023', null, 'annualReport', 'https://placehold.co/annual-2023.pdf', 2, true),
  ('التقرير السنوي 2022', null, 'annualReport', 'https://placehold.co/annual-2022.pdf', 3, true),
  ('تقرير فعاليات رمضان 2024', null, 'events', 'https://placehold.co/ramadan-2024.pdf', 1, true),
  ('تقرير اليوم الوطني', null, 'events', 'https://placehold.co/national-day-2024.pdf', 2, true),
  ('تقرير الفعاليات السنوي 2023', null, 'events', 'https://placehold.co/events-2023.pdf', 3, true)
) AS v(title, description, category, file_url, sort_order, published)
WHERE NOT EXISTS (SELECT 1 FROM public.governance_documents);

-- Seed board members from static fallback (only if empty)
INSERT INTO public.board_members (full_name, position, bio, sort_order, published)
SELECT * FROM (VALUES
  ('د. عبدالله المنصور', 'رئيس مجلس الإدارة', 'خبرة 20 عاماً في القطاع غير الربحي.', 1, true),
  ('أ. سارة العتيبي', 'نائب الرئيس', 'متخصصة في التنمية المجتمعية.', 2, true),
  ('م. خالد الزهراني', 'أمين الصندوق', 'محاسب قانوني معتمد.', 3, true),
  ('د. منى الشمري', 'عضو مجلس', 'أكاديمية متخصصة في الصحة العامة.', 4, true)
) AS v(full_name, position, bio, sort_order, published)
WHERE NOT EXISTS (SELECT 1 FROM public.board_members);
