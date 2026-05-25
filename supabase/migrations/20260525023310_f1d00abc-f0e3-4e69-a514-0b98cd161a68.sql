CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL DEFAULT 'بيانات الدخول إلى لوحة التحكم',
  greeting TEXT NOT NULL DEFAULT 'مرحباً {{full_name}}،',
  body TEXT NOT NULL DEFAULT 'تم إنشاء حسابك في لوحة تحكم الموقع. يمكنك تسجيل الدخول باستخدام البيانات التالية:',
  footer TEXT NOT NULL DEFAULT 'مع تحيات فريق الدعم',
  variables TEXT[] NOT NULL DEFAULT ARRAY['full_name', 'email', 'password', 'admin_url'],
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email templates"
  ON public.email_templates
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can view email templates"
  ON public.email_templates
  FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

-- Insert default template for credential emails
INSERT INTO public.email_templates (name, subject, greeting, body, footer)
VALUES (
  'new_account_credentials',
  'بيانات الدخول إلى لوحة التحكم',
  'مرحباً {{full_name}}،',
  'تم إنشاء حسابك في لوحة تحكم الموقع. يمكنك تسجيل الدخول باستخدام البيانات التالية:\n\nالبريد الإلكتروني: {{email}}\nكلمة المرور: {{password}}\n\nرابط لوحة التحكم: {{admin_url}}\n\nننصحك بتغيير كلمة المرور فور أول دخول.',
  'مع تحيات فريق الدعم'
)
ON CONFLICT (name) DO NOTHING;