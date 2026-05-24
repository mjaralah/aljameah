import { useEffect, useRef, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { Loader2, Save, Settings as SettingsIcon, Palette, Phone, Share2, Image as ImageIcon, ThumbsUp, EyeOff, MessageCircle, Heart, Check, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SectionHeader } from "@/components/admin/SectionHeader";

type VisibilityMap = Record<string, boolean>;

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
  social_facebook: string | null;
  social_linkedin: string | null;
  social_youtube: string | null;
  footer_text: string | null;
  feedback_visibility: VisibilityMap | null;
  pages_visibility: VisibilityMap | null;
  whatsapp_enabled: boolean | null;
  whatsapp_number: string | null;
  whatsapp_message: string | null;
  whatsapp_tooltip: string | null;
  whatsapp_show_tooltip: boolean | null;
  whatsapp_position: string | null;
  donate_button_enabled: boolean | null;
  donate_button_label_ar: string | null;
  donate_button_label_en: string | null;
  donate_button_url: string | null;
  donate_button_bg_color: string | null;
  donate_button_text_color: string | null;
  donate_button_icon: string | null;
};

type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

const FEEDBACK_PAGES: { key: string; label: string }[] = [
  { key: "home", label: "الصفحة الرئيسية" },
  { key: "about", label: "من نحن" },
  { key: "programs", label: "البرامج والخدمات" },
  { key: "governance", label: "الحوكمة" },
  { key: "media", label: "المركز الإعلامي" },
  { key: "surveys", label: "الاستبيانات" },
  { key: "eservices", label: "الخدمات الإلكترونية" },
  { key: "contact", label: "تواصل معنا" },
];

const PUBLIC_PAGES: { key: string; label: string }[] = [
  { key: "home", label: "الصفحة الرئيسية" },
  { key: "about", label: "من نحن" },
  { key: "programs", label: "البرامج والخدمات" },
  { key: "governance", label: "الحوكمة" },
  { key: "media", label: "المركز الإعلامي" },
  { key: "surveys", label: "الاستبيانات" },
  { key: "eservices", label: "الخدمات الإلكترونية" },
  { key: "contact", label: "تواصل معنا" },
  { key: "sitemap", label: "خريطة الموقع" },
  { key: "footer_brand", label: "قسم تعريف الجمعية (التذييل)" },
  { key: "footer_social", label: "أيقونات التواصل الاجتماعي (التذييل)" },
  { key: "footer_quick", label: "قسم روابط سريعة (التذييل)" },
  { key: "footer_eservices", label: "قسم الخدمات الإلكترونية (التذييل)" },
  { key: "footer_legal", label: "قسم المعلومات القانونية (التذييل)" },
  { key: "footer_contact", label: "قسم معلومات التواصل (التذييل)" },
  { key: "footer_bottom", label: "شريط الحقوق السفلي (التذييل)" },
];

function SaveStatusIndicator({ status, onRetry }: { status: SaveStatus; onRetry: () => void }) {
  if (status === "idle") return null;
  if (status === "dirty") {
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        تغييرات غير محفوظة
      </span>
    );
  }
  if (status === "saving") {
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        جارٍ الحفظ...
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
        <Check className="h-3.5 w-3.5" />
        تم الحفظ
      </span>
    );
  }
  return (
    <span className="text-xs text-destructive flex items-center gap-2">
      <AlertCircle className="h-3.5 w-3.5" />
      فشل الحفظ
      <button type="button" onClick={onRetry} className="underline hover:no-underline">
        إعادة المحاولة
      </button>
    </span>
  );
}

export default function AdminSettingsPage() {
  const [s, setS] = useState<Partial<Settings> | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const skipNextAutoSaveRef = useRef(true);
  const savingRef = useRef(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) toast.error(error.message);
      setS((data ?? {}) as Partial<Settings>);
      setLoading(false);
    })();
  }, []);

  function toggleVis(field: "feedback_visibility" | "pages_visibility", key: string, value: boolean) {
    setS((p) => ({
      ...(p ?? {}),
      [field]: { ...((p?.[field] as VisibilityMap) ?? {}), [key]: value },
    }));
  }
  function isOn(field: "feedback_visibility" | "pages_visibility", key: string) {
    const map = (s?.[field] as VisibilityMap | null | undefined) ?? {};
    return map[key] !== false;
  }

  async function save(current?: Partial<Settings> | null) {
    const data = current ?? s;
    if (!data || savingRef.current) return;
    savingRef.current = true;
    setStatus("saving");
    try {
      if (data.id) {
        const { id, ...rest } = data;
        const { error } = await supabase.from("site_settings").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { data: inserted, error } = await supabase.from("site_settings").insert(data).select().single();
        if (error) throw error;
        if (inserted) {
          skipNextAutoSaveRef.current = true;
          setS(inserted as Partial<Settings>);
        }
      }
      setStatus("saved");
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => {
        setStatus((prev) => (prev === "saved" ? "idle" : prev));
      }, 2500);
    } catch (e) {
      setStatus("error");
      toast.error((e as Error).message);
    } finally {
      savingRef.current = false;
    }
  }

  // الحفظ التلقائي (debounce)
  useEffect(() => {
    if (loading || !s) return;
    if (skipNextAutoSaveRef.current) {
      skipNextAutoSaveRef.current = false;
      return;
    }
    setStatus("dirty");
    const timer = setTimeout(() => {
      save(s);
    }, 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, loading]);

  // تحذير قبل إغلاق الصفحة عند وجود تغييرات لم تحفظ
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (status === "dirty" || status === "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [status]);

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
    <AdminLayout title="الإعدادات العامة">
      <AdminPageHeader
        title="الإعدادات العامة"
        description="هوية الموقع، الشعار، الألوان، ومعلومات التواصل — يتم الحفظ تلقائياً عند التعديل"
        icon={SettingsIcon}
        action={
          <div className="flex items-center gap-3">
            <SaveStatusIndicator status={status} onRetry={() => save()} />
            <Button onClick={() => save()} disabled={status === "saving"} variant="outline" size="sm">
              {status === "saving" ? (
                <Loader2 className="w-4 h-4 ml-1 animate-spin" />
              ) : (
                <Save className="w-4 h-4 ml-1" />
              )}
              حفظ الآن
            </Button>
          </div>
        }
      />

      <div className="space-y-5 max-w-3xl">
        <Card>
          <CardContent className="p-5 md:p-6">
            <SectionHeader
              icon={ImageIcon}
              title="هوية الموقع"
              description="الشعار واسم الموقع يظهران في الترويسة والتذييل"
            />
            <div className="space-y-4">
              <div>
                <Label>اسم الموقع</Label>
                <Input value={s.site_name ?? ""} onChange={(e) => set("site_name", e.target.value)} />
              </div>
              <MediaUpload label="شعار الجمعية" folder="branding" value={s.logo_url} onChange={(url) => set("logo_url", url)} />
              <MediaUpload label="أيقونة المتصفح (Favicon)" folder="branding" value={s.favicon_url} onChange={(url) => set("favicon_url", url)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 md:p-6">
            <SectionHeader
              icon={Palette}
              title="ألوان الهوية"
              description="اختر اللونين الأساسيين للموقع"
            />
            <div className="space-y-4">
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 md:p-6">
            <SectionHeader icon={Phone} title="معلومات التواصل" />
            <div className="space-y-4">
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 md:p-6">
            <SectionHeader icon={Share2} title="روابط التواصل الاجتماعي" />
            <div className="space-y-4">
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
                  <Label>فيسبوك</Label>
                  <Input dir="ltr" value={s.social_facebook ?? ""} onChange={(e) => set("social_facebook", e.target.value)} />
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 md:p-6">
            <SectionHeader
              icon={ThumbsUp}
              title='أداة "هل كانت هذه الصفحة مفيدة؟"'
              description="تحكم بإظهار أو إخفاء أداة تقييم الصفحة لكل صفحة من صفحات الموقع."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEEDBACK_PAGES.map((p) => (
                <div key={p.key} className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                  <Label htmlFor={`fb-${p.key}`} className="m-0 cursor-pointer">{p.label}</Label>
                  <Switch
                    id={`fb-${p.key}`}
                    checked={isOn("feedback_visibility", p.key)}
                    onCheckedChange={(v) => toggleVis("feedback_visibility", p.key, v)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 md:p-6">
            <SectionHeader
              icon={EyeOff}
              title="نشر / إخفاء الصفحات الرئيسية"
              description="إيقاف نشر صفحة كاملة سيُظهر للزوار رسالة 'غير متاحة حالياً'. الطاقم يستمر برؤية الصفحات."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PUBLIC_PAGES.map((p) => (
                <div key={p.key} className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                  <Label htmlFor={`pg-${p.key}`} className="m-0 cursor-pointer">{p.label}</Label>
                  <Switch
                    id={`pg-${p.key}`}
                    checked={isOn("pages_visibility", p.key)}
                    onCheckedChange={(v) => toggleVis("pages_visibility", p.key, v)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardContent className="p-5 md:p-6">
            <SectionHeader
              icon={Heart}
              title='زر "تبرع الآن" في الهيدر'
              description="تحكم بإظهار الزر ونصه ورابطه وألوانه وأيقونته."
            />
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                <Label htmlFor="donate-enabled" className="m-0 cursor-pointer">إظهار الزر في الهيدر</Label>
                <Switch
                  id="donate-enabled"
                  checked={s.donate_button_enabled !== false}
                  onCheckedChange={(v) => set("donate_button_enabled", v)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>النص بالعربية</Label>
                  <Input
                    value={s.donate_button_label_ar ?? ""}
                    placeholder="تبرع الآن"
                    onChange={(e) => set("donate_button_label_ar", e.target.value)}
                  />
                </div>
                <div>
                  <Label>النص بالإنجليزية</Label>
                  <Input
                    dir="ltr"
                    value={s.donate_button_label_en ?? ""}
                    placeholder="Donate Now"
                    onChange={(e) => set("donate_button_label_en", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>الرابط (داخلي مثل /donate أو رابط خارجي كامل)</Label>
                <Input
                  dir="ltr"
                  value={s.donate_button_url ?? ""}
                  placeholder="/donate"
                  onChange={(e) => set("donate_button_url", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>لون الخلفية</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      className="w-14 p-1 h-10"
                      value={s.donate_button_bg_color ?? "#C5973A"}
                      onChange={(e) => set("donate_button_bg_color", e.target.value)}
                    />
                    <Input
                      dir="ltr"
                      value={s.donate_button_bg_color ?? ""}
                      placeholder="افتراضي (لون التمييز)"
                      onChange={(e) => set("donate_button_bg_color", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>لون النص</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      className="w-14 p-1 h-10"
                      value={s.donate_button_text_color ?? "#ffffff"}
                      onChange={(e) => set("donate_button_text_color", e.target.value)}
                    />
                    <Input
                      dir="ltr"
                      value={s.donate_button_text_color ?? ""}
                      placeholder="افتراضي"
                      onChange={(e) => set("donate_button_text_color", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>الأيقونة</Label>
                  <Select
                    value={s.donate_button_icon ?? "heart"}
                    onValueChange={(v) => set("donate_button_icon", v)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heart">قلب</SelectItem>
                      <SelectItem value="gift">هدية</SelectItem>
                      <SelectItem value="hand-heart">يد بقلب</SelectItem>
                      <SelectItem value="none">بدون أيقونة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 md:p-6">
            <SectionHeader
              icon={MessageCircle}
              title="زر واتساب العائم"
              description="زر تواصل سريع يظهر في زاوية الصفحة لكل الزوار."
            />
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                <Label htmlFor="wa-en" className="m-0 cursor-pointer">تفعيل الزر</Label>
                <Switch
                  id="wa-en"
                  checked={!!s.whatsapp_enabled}
                  onCheckedChange={(v) => set("whatsapp_enabled", v)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>رقم الواتساب (بصيغة دولية بدون +)</Label>
                  <Input
                    dir="ltr"
                    placeholder="966500000000"
                    value={s.whatsapp_number ?? ""}
                    onChange={(e) => set("whatsapp_number", e.target.value)}
                  />
                </div>
                <div>
                  <Label>موضع الزر</Label>
                  <Select
                    value={s.whatsapp_position ?? "left"}
                    onValueChange={(v) => set("whatsapp_position", v)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">يسار الصفحة</SelectItem>
                      <SelectItem value="right">يمين الصفحة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>الرسالة الافتراضية</Label>
                <Textarea
                  rows={2}
                  placeholder="مرحباً، أرغب في الاستفسار عن..."
                  value={s.whatsapp_message ?? ""}
                  onChange={(e) => set("whatsapp_message", e.target.value)}
                />
              </div>
              <div>
                <Label>نص التلميح المنبثق</Label>
                <Input
                  placeholder="مرحباً 👋 كيف يمكننا مساعدتك؟"
                  value={s.whatsapp_tooltip ?? ""}
                  onChange={(e) => set("whatsapp_tooltip", e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                <Label htmlFor="wa-tip" className="m-0 cursor-pointer">إظهار التلميح تلقائياً بعد فتح الصفحة</Label>
                <Switch
                  id="wa-tip"
                  checked={s.whatsapp_show_tooltip !== false}
                  onCheckedChange={(v) => set("whatsapp_show_tooltip", v)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* مؤشر حالة الحفظ العائم — يبقى مرئياً أثناء التمرير */}
      {status !== "idle" && (
        <div
          dir="rtl"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 rounded-full border border-border/60 bg-card/95 backdrop-blur px-4 py-2 shadow-lg">
            {status === "dirty" && (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-sm text-foreground">تغييرات غير محفوظة</span>
                <Button onClick={() => save()} size="sm" className="h-7 px-3 text-xs">
                  <Save className="w-3.5 h-3.5 ml-1" /> حفظ الآن
                </Button>
              </>
            )}
            {status === "saving" && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">جارٍ الحفظ...</span>
              </>
            )}
            {status === "saved" && (
              <>
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm text-emerald-700 dark:text-emerald-300">تم حفظ التغييرات</span>
              </>
            )}
            {status === "error" && (
              <>
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">فشل الحفظ</span>
                <Button onClick={() => save()} size="sm" variant="destructive" className="h-7 px-3 text-xs">
                  إعادة المحاولة
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
