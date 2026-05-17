import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { Loader2, Save, Settings as SettingsIcon, Palette, Phone, Share2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SectionHeader } from "@/components/admin/SectionHeader";

type Settings = {
  id: string;
  site_name: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  social_twitter: string | null;
  social_instagram: string | null;
  social_linkedin: string | null;
  social_youtube: string | null;
  footer_text: string | null;
};

export default function AdminSettingsPage() {
  const [s, setS] = useState<Partial<Settings> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) toast.error(error.message);
      setS(data ?? {});
      setLoading(false);
    })();
  }, []);

  async function save() {
    if (!s) return;
    setSaving(true);
    try {
      if (s.id) {
        const { id, ...rest } = s;
        const { error } = await supabase.from("site_settings").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_settings").insert(s);
        if (error) throw error;
      }
      toast.success("تم حفظ الإعدادات");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function set<K extends keyof Settings>(k: K, v: Settings[K]) {
    setS((p) => ({ ...(p ?? {}), [k]: v }));
  }

  if (loading || !s) {
    return (
      <AdminLayout title="الإعدادات العامة">
        <div className="flex justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="الإعدادات العامة"
      description="هوية الموقع، الشعار، الألوان، ومعلومات التواصل"
      actions={
        <Button onClick={save} disabled={saving} size="sm">
          {saving ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Save className="w-4 h-4 ml-1" />}
          حفظ
        </Button>
      }
    >
      <div className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">هوية الموقع</CardTitle>
            <CardDescription>الشعار واسم الموقع يظهران في الترويسة والتذييل</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>اسم الموقع</Label>
              <Input value={s.site_name ?? ""} onChange={(e) => set("site_name", e.target.value)} />
            </div>
            <MediaUpload label="شعار الجمعية" folder="branding" value={s.logo_url} onChange={(url) => set("logo_url", url)} />
            <MediaUpload label="أيقونة المتصفح (Favicon)" folder="branding" value={s.favicon_url} onChange={(url) => set("favicon_url", url)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">ألوان الهوية</CardTitle>
            <CardDescription>اختر اللونين الأساسيين للموقع</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>اللون الأساسي</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={s.primary_color ?? "#1B5E35"}
                    onChange={(e) => set("primary_color", e.target.value)}
                    className="h-10 w-14 rounded border cursor-pointer"
                  />
                  <Input dir="ltr" value={s.primary_color ?? ""} onChange={(e) => set("primary_color", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>اللون الثانوي</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={s.secondary_color ?? "#C5973A"}
                    onChange={(e) => set("secondary_color", e.target.value)}
                    className="h-10 w-14 rounded border cursor-pointer"
                  />
                  <Input dir="ltr" value={s.secondary_color ?? ""} onChange={(e) => set("secondary_color", e.target.value)} />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              ملاحظة: ستظهر الألوان الجديدة على الموقع بعد ربطها بنظام الثيم في مرحلة لاحقة.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">معلومات التواصل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>البريد الإلكتروني</Label>
                <Input dir="ltr" value={s.contact_email ?? ""} onChange={(e) => set("contact_email", e.target.value)} />
              </div>
              <div>
                <Label>رقم الجوال</Label>
                <Input dir="ltr" value={s.contact_phone ?? ""} onChange={(e) => set("contact_phone", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>العنوان</Label>
              <Textarea rows={2} value={s.contact_address ?? ""} onChange={(e) => set("contact_address", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">روابط التواصل الاجتماعي</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>تويتر / X</Label>
                <Input dir="ltr" value={s.social_twitter ?? ""} onChange={(e) => set("social_twitter", e.target.value)} />
              </div>
              <div>
                <Label>إنستغرام</Label>
                <Input dir="ltr" value={s.social_instagram ?? ""} onChange={(e) => set("social_instagram", e.target.value)} />
              </div>
              <div>
                <Label>لينكدإن</Label>
                <Input dir="ltr" value={s.social_linkedin ?? ""} onChange={(e) => set("social_linkedin", e.target.value)} />
              </div>
              <div>
                <Label>يوتيوب</Label>
                <Input dir="ltr" value={s.social_youtube ?? ""} onChange={(e) => set("social_youtube", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>نص التذييل (Footer)</Label>
              <Textarea rows={2} value={s.footer_text ?? ""} onChange={(e) => set("footer_text", e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
