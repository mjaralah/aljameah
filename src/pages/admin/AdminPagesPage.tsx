// إدارة الصفحات المخصّصة — مع اختيار قالب وبذر أقسام تلقائية ورابط لتحرير الأقسام
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminListRow } from "@/components/admin/AdminListRow";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminDialog } from "@/components/admin/AdminDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Plus, Loader2, FolderOpen, Blocks, ExternalLink, FileText } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PAGE_TEMPLATES, getTemplate } from "@/lib/pageTemplates";

type PageRow = {
  id: string;
  slug: string;
  title: string;
  title_en: string | null;
  content: string | null;
  content_en: string | null;
  meta_description: string | null;
  parent_slug: string | null;
  template: string;
  cover_image_url: string | null;
  hero_subtitle: string | null;
  hero_cta_label: string | null;
  hero_cta_url: string | null;
  sort_order: number;
  show_in_menu: boolean;
  published: boolean;
};

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\u0600-\u06FF-]/g, "").slice(0, 80);

const empty = (): Partial<PageRow> => ({
  slug: "", title: "", title_en: "", content: "", content_en: "",
  meta_description: "", parent_slug: "", template: "blank",
  cover_image_url: "", hero_subtitle: "", hero_cta_label: "", hero_cta_url: "",
  sort_order: 0, show_in_menu: false, published: false,
});

export default function AdminPagesPage() {
  const [rows, setRows] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PageRow> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("custom_pages")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    setRows((data ?? []) as PageRow[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function seedTemplateSections(pageId: string, templateKey: string) {
    const tpl = getTemplate(templateKey);
    if (!tpl.sections.length) return;
    const rows = tpl.sections.map((s) => ({
      page_key: `custom:${pageId}`,
      section_key: s.section_key,
      title: s.title,
      content: s.content,
      data: s.data,
      sort_order: s.sort_order,
      published: s.published ?? true,
    }));
    const { error } = await supabase.from("page_content").insert(rows);
    if (error) toast.error("تعذّر إنشاء الأقسام المبدئية: " + error.message);
  }

  async function handleSave() {
    if (!editing) return;
    if (!editing.title?.trim()) return toast.error("العنوان مطلوب");
    if (!editing.slug?.trim()) return toast.error("المعرّف (slug) مطلوب");
    setSaving(true);
    try {
      if (editing.id) {
        const { id, ...rest } = editing as PageRow;
        const { error } = await supabase.from("custom_pages").update(rest as never).eq("id", id);
        if (error) throw error;
        toast.success("تم الحفظ");
      } else {
        const { data, error } = await supabase
          .from("custom_pages")
          .insert(editing as never)
          .select()
          .single();
        if (error) throw error;
        if (data?.id && editing.template) await seedTemplateSections(data.id, editing.template);
        toast.success("تم إنشاء الصفحة وأقسامها المبدئية");
      }
      setEditing(null);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    // حذف أقسام الصفحة أيضاً
    await supabase.from("page_content").delete().eq("page_key", `custom:${deleteId}`);
    const { error } = await supabase.from("custom_pages").delete().eq("id", deleteId);
    if (error) toast.error(error.message);
    else { toast.success("تم الحذف"); load(); }
    setDeleteId(null);
  }

  const v = editing ?? {};
  const set = <K extends keyof PageRow>(k: K, val: PageRow[K]) =>
    setEditing((p) => ({ ...(p ?? {}), [k]: val }) as Partial<PageRow>);

  return (
    <AdminLayout title="إدارة الصفحات">
      <AdminPageHeader
        title="إدارة الصفحات"
        description="أنشئ صفحات رئيسية وفرعية باستخدام قوالب جاهزة، وحرّر محتواها بأقسام مرنة."
        icon={FileText}
        action={
          <Button onClick={() => setEditing(empty())}>
            <Plus className="w-4 h-4 ml-1" />
            إضافة صفحة
          </Button>
        }
      />

      {loading ? (
        <Card><CardContent className="p-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent></Card>
      ) : rows.length === 0 ? (
        <AdminEmptyState
          icon={FolderOpen}
          title="لا توجد صفحات بعد"
          description="ابدأ بإنشاء صفحة جديدة باستخدام قالب جاهز."
          actionLabel="إضافة صفحة"
          onAction={() => setEditing(empty())}
        />
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <AdminListRow
              key={row.id}
              id={row.id}
              table="custom_pages"
              title={row.title}
              subtitle={
                <span className="flex flex-wrap items-center gap-x-2 text-xs">
                  <span className="opacity-70">/p/{row.slug}</span>
                  <span className="opacity-50">·</span>
                  <span className="opacity-70">القالب: {getTemplate(row.template).label}</span>
                  {row.show_in_menu && <><span className="opacity-50">·</span><span className="text-primary">في القائمة</span></>}
                </span>
              }
              published={!!row.published}
              onTogglePublished={() => load()}
              onEdit={() => setEditing(row)}
              onDelete={() => setDeleteId(row.id)}
              extraActions={
                <>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/admin/page-builder/${row.id}`)}>
                    <Blocks className="w-4 h-4 ml-1" />
                    تحرير الأقسام
                  </Button>
                  {row.published && (
                    <Button size="sm" variant="ghost" asChild>
                      <a href={`/p/${row.slug}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </>
              }
            />
          ))}
        </div>
      )}

      <AdminDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing?.id ? "تعديل صفحة" : "إنشاء صفحة جديدة"}
        description="اختر قالباً جاهزاً وعبّئ المعلومات الأساسية. يمكنك تحرير الأقسام لاحقاً."
        onSave={handleSave}
        saving={saving}
        size="lg"
      >
        {editing && (
          <div className="space-y-4">
            {!editing.id && (
              <div>
                <Label>القالب</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                  {PAGE_TEMPLATES.map((t) => {
                    const active = (v.template ?? "blank") === t.key;
                    return (
                      <button key={t.key} type="button" onClick={() => set("template", t.key)}
                        className={`text-right rounded-lg border p-3 transition-smooth ${active ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/40"}`}>
                        <div className="font-semibold text-sm mb-1">{t.label}</div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Tabs defaultValue="basic">
              <TabsList>
                <TabsTrigger value="basic">معلومات أساسية</TabsTrigger>
                <TabsTrigger value="hero">رأس الصفحة</TabsTrigger>
                <TabsTrigger value="content">محتوى حر (اختياري)</TabsTrigger>
                <TabsTrigger value="settings">الإعدادات</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-3 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>العنوان (عربي) *</Label>
                    <Input value={v.title ?? ""} onChange={(e) => {
                      set("title", e.target.value);
                      if (!editing.id) set("slug", slugify(e.target.value));
                    }} />
                  </div>
                  <div>
                    <Label>Title (English)</Label>
                    <Input dir="ltr" value={v.title_en ?? ""} onChange={(e) => set("title_en", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>المعرّف (slug) *</Label>
                    <Input dir="ltr" value={v.slug ?? ""} onChange={(e) => set("slug", e.target.value)} />
                  </div>
                  <div>
                    <Label>الصفحة الأم (slug — اختياري)</Label>
                    <Input dir="ltr" value={v.parent_slug ?? ""} onChange={(e) => set("parent_slug", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>وصف الصفحة (SEO)</Label>
                  <Textarea rows={2} value={v.meta_description ?? ""} onChange={(e) => set("meta_description", e.target.value)} />
                </div>
              </TabsContent>

              <TabsContent value="hero" className="space-y-3 mt-4">
                <MediaUpload label="صورة الغلاف" folder="pages/cover" value={v.cover_image_url ?? ""}
                  onChange={(url) => set("cover_image_url", url ?? "")} />
                <div>
                  <Label>نص فرعي للبطل</Label>
                  <Input value={v.hero_subtitle ?? ""} onChange={(e) => set("hero_subtitle", e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>نص زر البطل</Label>
                    <Input value={v.hero_cta_label ?? ""} onChange={(e) => set("hero_cta_label", e.target.value)} />
                  </div>
                  <div>
                    <Label>رابط زر البطل</Label>
                    <Input dir="ltr" value={v.hero_cta_url ?? ""} onChange={(e) => set("hero_cta_url", e.target.value)} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-3 mt-4">
                <p className="text-xs text-muted-foreground">يُستخدم فقط إن لم تستخدم نظام الأقسام. الأقسام المضافة لاحقاً تظهر بأولوية.</p>
                <Tabs defaultValue="ar">
                  <TabsList className="h-8">
                    <TabsTrigger value="ar" className="text-xs">عربي</TabsTrigger>
                    <TabsTrigger value="en" className="text-xs">English</TabsTrigger>
                  </TabsList>
                  <TabsContent value="ar" className="mt-2">
                    <RichTextEditor value={v.content ?? ""} onChange={(html) => set("content", html)} minHeight={240} />
                  </TabsContent>
                  <TabsContent value="en" className="mt-2">
                    <RichTextEditor value={v.content_en ?? ""} onChange={(html) => set("content_en", html)} minHeight={240} />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="settings" className="space-y-3 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>الترتيب</Label>
                    <Input type="number" value={v.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} />
                  </div>
                  <div className="flex items-center gap-2 pt-7">
                    <Switch checked={!!v.show_in_menu} onCheckedChange={(c) => set("show_in_menu", c)} />
                    <Label className="m-0">إظهار في القائمة العلوية</Label>
                  </div>
                  <div className="flex items-center gap-2 pt-7">
                    <Switch checked={!!v.published} onCheckedChange={(c) => set("published", c)} />
                    <Label className="m-0">نشر الصفحة</Label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </AdminDialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف الصفحة وجميع أقسامها نهائياً.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
