import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Save, Info, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

type Template = {
  id: string;
  name: string;
  subject: string;
  greeting: string;
  body: string;
  footer: string;
  variables: string[];
  enabled: boolean;
};

const AVAILABLE_VARIABLES = [
  { key: "{{full_name}}", desc: "اسم المستخدم الكامل" },
  { key: "{{email}}", desc: "البريد الإلكتروني" },
  { key: "{{password}}", desc: "كلمة المرور المؤقتة" },
  { key: "{{admin_url}}", desc: "رابط لوحة التحكم" },
];

export default function AdminEmailTemplatesPage() {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .eq("name", "new_account_credentials")
      .maybeSingle();
    if (error) {
      toast.error(error.message);
    } else if (data) {
      setTemplate(data as Template);
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!template) return;
    setSaving(true);
    const { error } = await supabase
      .from("email_templates")
      .update({
        subject: template.subject,
        greeting: template.greeting,
        body: template.body,
        footer: template.footer,
        enabled: template.enabled,
      })
      .eq("id", template.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("تم حفظ القالب");
    }
    setSaving(false);
  }

  const previewText = (text: string) => {
    return text
      .replace(/\{\{full_name\}\}/g, "أحمد العتيبي")
      .replace(/\{\{email\}\}/g, "ahmed@example.com")
      .replace(/\{\{password\}\}/g, "Abcd1234!")
      .replace(/\{\{admin_url\}\}/g, `${window.location.origin}/admin`);
  };

  return (
    <AdminLayout title="قوالب البريد الإلكتروني">
      <AdminPageHeader
        title="قوالب البريد الإلكتروني"
        description="تخصيص رسائل البريد التي تُرسل تلقائياً للمستخدمين"
        icon={Mail}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : !template ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            لم يُعثر على القالب الافتراضي.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">رسالة بيانات الحساب الجديد</h3>
                  <p className="text-sm text-muted-foreground">
                    تُرسل هذه الرسالة عند إنشاء حساب جديد من لوحة التحكم (إذا فُعّل خيار الإرسال).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="enabled" className="text-sm">تفعيل القالب</Label>
                  <Switch
                    id="enabled"
                    checked={template.enabled}
                    onCheckedChange={(v) => setTemplate({ ...template, enabled: v })}
                  />
                </div>
              </div>

              <div>
                <Label>عنوان الرسالة</Label>
                <Input
                  value={template.subject}
                  onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
                  placeholder="بيانات الدخول إلى لوحة التحكم"
                />
              </div>

              <div>
                <Label>التحية (الافتتاحية)</Label>
                <Input
                  value={template.greeting}
                  onChange={(e) => setTemplate({ ...template, greeting: e.target.value })}
                  placeholder="مرحباً {{full_name}}،"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  يمكنك استخدام المتغيرات مثل <code className="bg-muted px-1 rounded">{"{{full_name}}"}</code>
                </p>
              </div>

              <div>
                <Label>نص الرسالة (المحتوى الرئيسي)</Label>
                <Textarea
                  value={template.body}
                  onChange={(e) => setTemplate({ ...template, body: e.target.value })}
                  rows={6}
                  placeholder="تم إنشاء حسابك..."
                />
              </div>

              <div>
                <Label>التذييل (الخاتمة)</Label>
                <Input
                  value={template.footer}
                  onChange={(e) => setTemplate({ ...template, footer: e.target.value })}
                  placeholder="مع تحيات فريق الدعم"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 ml-1 animate-spin" />}
                  <Save className="w-4 h-4 ml-1" />
                  حفظ القالب
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                المتغيرات المتاحة
              </h4>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_VARIABLES.map((v) => (
                  <Badge key={v.key} variant="secondary" className="gap-1">
                    <code>{v.key}</code>
                    <span className="text-muted-foreground text-[10px]">— {v.desc}</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h4 className="font-semibold mb-3">معاينة الرسالة</h4>
              <div className="border rounded-lg p-4 bg-white dark:bg-slate-900 space-y-3 text-sm">
                <div className="border-b pb-2 text-muted-foreground">
                  <span className="font-medium">الموضوع:</span>{" "}
                  {previewText(template.subject)}
                </div>
                <div>{previewText(template.greeting)}</div>
                <div className="whitespace-pre-wrap leading-relaxed">{previewText(template.body)}</div>
                <div className="pt-2 border-t text-muted-foreground">{previewText(template.footer)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
