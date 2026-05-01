
-- Form submissions: volunteer, membership, contact
CREATE TABLE public.volunteer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  gender TEXT,
  nationality TEXT,
  city TEXT,
  birth_date DATE,
  marital_status TEXT,
  phone TEXT NOT NULL,
  education TEXT,
  skills TEXT,
  has_prior_experience TEXT,
  previous_org TEXT,
  job TEXT,
  employer TEXT,
  preferred_activities TEXT,
  volunteer_location TEXT,
  other_location TEXT,
  availability TEXT,
  referral_source TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.membership_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  gender TEXT,
  email TEXT NOT NULL,
  national_id TEXT NOT NULL,
  education TEXT,
  job_title TEXT,
  employer TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  purpose TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Page feedback widget
CREATE TABLE public.page_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  helpful BOOLEAN NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Custom pages CMS (admin can add pages and edit content)
CREATE TABLE public.custom_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  meta_description TEXT,
  parent_slug TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  show_in_menu BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Governance documents (PDFs)
CREATE TABLE public.governance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triggers for updated_at
CREATE TRIGGER tg_vol_req_upd BEFORE UPDATE ON public.volunteer_requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER tg_mem_req_upd BEFORE UPDATE ON public.membership_requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER tg_contact_upd BEFORE UPDATE ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER tg_pages_upd BEFORE UPDATE ON public.custom_pages FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER tg_gov_upd BEFORE UPDATE ON public.governance_documents FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Enable RLS
ALTER TABLE public.volunteer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_documents ENABLE ROW LEVEL SECURITY;

-- Public can submit forms (anonymous insert)
CREATE POLICY "Anyone can submit volunteer request" ON public.volunteer_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff read volunteer requests" ON public.volunteer_requests
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update volunteer requests" ON public.volunteer_requests
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete volunteer requests" ON public.volunteer_requests
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Anyone can submit membership request" ON public.membership_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff read membership requests" ON public.membership_requests
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update membership requests" ON public.membership_requests
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete membership requests" ON public.membership_requests
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Anyone can submit contact message" ON public.contact_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff read contact messages" ON public.contact_messages
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update contact messages" ON public.contact_messages
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete contact messages" ON public.contact_messages
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Anyone can submit feedback" ON public.page_feedback
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff read feedback" ON public.page_feedback
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete feedback" ON public.page_feedback
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Public reads published pages" ON public.custom_pages
  FOR SELECT TO anon, authenticated USING (published = true OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage pages" ON public.custom_pages
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Public reads gov docs" ON public.governance_documents
  FOR SELECT TO anon, authenticated USING (published = true OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage gov docs" ON public.governance_documents
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Grants for authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteer_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.membership_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.page_feedback TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_pages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.governance_documents TO authenticated;

GRANT INSERT ON public.volunteer_requests TO anon;
GRANT INSERT ON public.membership_requests TO anon;
GRANT INSERT ON public.contact_messages TO anon;
GRANT INSERT ON public.page_feedback TO anon;
GRANT SELECT ON public.custom_pages TO anon;
GRANT SELECT ON public.governance_documents TO anon;

-- Indexes
CREATE INDEX idx_vol_status ON public.volunteer_requests(status, created_at DESC);
CREATE INDEX idx_mem_status ON public.membership_requests(status, created_at DESC);
CREATE INDEX idx_contact_status ON public.contact_messages(status, created_at DESC);
CREATE INDEX idx_feedback_path ON public.page_feedback(page_path, created_at DESC);
CREATE INDEX idx_pages_slug ON public.custom_pages(slug) WHERE published = true;
