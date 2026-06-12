import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  Trash2,
  Edit,
  Save,
  ArrowUp,
  ArrowDown,
  Settings as SettingsIcon,
  LayoutGrid,
  HelpCircle,
  Link2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  useSupportContent,
  SupportCategory,
  SupportFaq,
  SupportQuickLink,
} from "@/hooks/useSupportContent";
import { cn } from "@/lib/utils";

const ICONS = [
  "HelpCircle", "IdCard", "HandHeart", "ClipboardList", "FolderKanban",
  "ScrollText", "MessageSquare", "FileText", "Phone", "Mail", "Newspaper",
  "Youtube", "ExternalLink", "BookOpen", "Settings", "Info",
];
const COLORS = ["primary", "blue", "green", "purple", "orange", "amber", "rose", "red"];

const TAB_TRIGGER =
  "gap-2 py-3 text-sm font-semibold rounded-lg transition-all " +
  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground " +
  "data-[state=active]:font-bold data-[state=active]:shadow-md " +
  "data-[state=active]:ring-2 data-[state=active]:ring-primary/30";

export default function AdminSupportPage() {
  const { settings, categories, faqs, quickLinks, loading, reload } = useSupportContent({
    publishedOnly: false,
  });

  return (
    <AdminLayout title="صفحة الدعم والمساعدة" description="إدارة محتوى صفحة /support العامة">
      <div dir="rtl" className="space-y-4 text-right">
        <Tabs defaultValue="settings" className="space-y-5">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1.5 bg-muted/70 border-2 border-border rounded-xl shadow-sm gap-1.5">
            <TabsTrigger value="settings" className={TAB_TRIGGER}>
              <SettingsIcon className="h-4 w-4" />
              الإعدادات العامة
            </TabsTrigger>
            <TabsTrigger value="categories" className={TAB_TRIGGER}>
              <LayoutGrid className="h-4 w-4" />
              التصنيفات
              <Badge variant="secondary" className="ms-1">
                {categories.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="faqs" className={TAB_TRIGGER}>
              <HelpCircle className="h-4 w-4" />
              الأسئلة الشائعة
              <Badge variant="secondary" className="ms-1">
                {faqs.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="links" className={TAB_TRIGGER}>
              <Link2 className="h-4 w-4" />
              الروابط السريعة
              <Badge variant="secondary" className="ms-1">
                {quickLinks.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <SettingsTab settings={settings} onSaved={reload} loading={loading} />
          </TabsContent>
          <TabsContent value="categories">
            <CategoriesTab items={categories} onChanged={reload} />
          </TabsContent>
          <TabsContent value="faqs">
            <FaqsTab items={faqs} categories={categories} onChanged={reload} />
          </TabsContent>
          <TabsContent value="links">
            <LinksTab items={quickLinks} onChanged={reload} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}


/* ---------- Settings ---------- */
function SettingsTab({
  settings,
  onSaved,
  loading,
}: {
  settings: any;
  onSaved: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<any>(settings ?? {});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);
  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("support_settings")
      .update({
        page_title: form.page_title,
        page_subtitle: form.page_subtitle,
        search_placeholder: form.search_placeholder,
        contact_form_enabled: !!form.contact_form_enabled,
        contact_form_title: form.contact_form_title,
        quick_links_title: form.quick_links_title,
      })
      .eq("id", true);
    setSaving(false);
    if (error) return toast.error("فشل الحفظ");
    toast.success("تم الحفظ");
    onSaved();
  };

  if (loading) return <Loader2 className="animate-spin mx-auto mt-10" />;

  return (
    <Card className="p-6 space-y-4 max-w-2xl">
      <Field label="عنوان الصفحة">
        <Input
          value={form.page_title ?? ""}
          onChange={(e) => setForm({ ...form, page_title: e.target.value })}
        />
      </Field>
      <Field label="العنوان الفرعي">
        <Textarea
          rows={2}
          value={form.page_subtitle ?? ""}
          onChange={(e) => setForm({ ...form, page_subtitle: e.target.value })}
        />
      </Field>
      <Field label="نص حقل البحث">
        <Input
          value={form.search_placeholder ?? ""}
          onChange={(e) => setForm({ ...form, search_placeholder: e.target.value })}
        />
      </Field>
      <Field label="عنوان نموذج التواصل">
        <Input
          value={form.contact_form_title ?? ""}
          onChange={(e) => setForm({ ...form, contact_form_title: e.target.value })}
        />
      </Field>
      <Field label="عنوان قسم الروابط السريعة">
        <Input
          value={form.quick_links_title ?? ""}
          onChange={(e) => setForm({ ...form, quick_links_title: e.target.value })}
        />
      </Field>
      <div className="flex items-center gap-2">
        <Switch
          checked={!!form.contact_form_enabled}
          onCheckedChange={(v) => setForm({ ...form, contact_form_enabled: v })}
        />
        <Label>تفعيل نموذج التواصل في الصفحة</Label>
      </div>
      <Button onClick={save} disabled={saving} className="gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        حفظ التغييرات
      </Button>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold">{label}</Label>
      {children}
    </div>
  );
}

/* ---------- Categories ---------- */
function CategoriesTab({
  items,
  onChanged,
}: {
  items: SupportCategory[];
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState<Partial<SupportCategory> | null>(null);
  const save = async () => {
    if (!editing?.label) return toast.error("أدخل اسم التصنيف");
    const payload = {
      label: editing.label,
      description: editing.description ?? null,
      icon: editing.icon ?? "HelpCircle",
      color: editing.color ?? "primary",
      link: editing.link ?? null,
      sort_order: editing.sort_order ?? items.length,
      is_published: editing.is_published ?? true,
    };
    const res = editing.id
      ? await supabase.from("support_categories").update(payload).eq("id", editing.id)
      : await supabase.from("support_categories").insert([payload]);
    if (res.error) return toast.error("فشل الحفظ");
    toast.success("تم الحفظ");
    setEditing(null);
    onChanged();
  };
  const remove = async (id: string) => {
    if (!confirm("حذف التصنيف؟")) return;
    const { error } = await supabase.from("support_categories").delete().eq("id", id);
    if (error) return toast.error("فشل الحذف");
    toast.success("تم الحذف");
    onChanged();
  };
  const togglePublish = async (it: SupportCategory) => {
    await supabase
      .from("support_categories")
      .update({ is_published: !it.is_published })
      .eq("id", it.id);
    onChanged();
  };
  const move = async (it: SupportCategory, dir: -1 | 1) => {
    await supabase
      .from("support_categories")
      .update({ sort_order: (it.sort_order ?? 0) + dir })
      .eq("id", it.id);
    onChanged();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing({})} className="gap-2">
          <Plus className="h-4 w-4" /> تصنيف جديد
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((c) => (
          <Card key={c.id} className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold truncate">{c.label}</p>
                <p className="text-xs text-muted-foreground truncate">{c.description}</p>
              </div>
              <Badge variant={c.is_published ? "default" : "secondary"}>
                {c.is_published ? "منشور" : "مخفي"}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
              <span>أيقونة: {c.icon}</span> · <span>لون: {c.color}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2 border-t">
              <Button size="sm" variant="ghost" onClick={() => setEditing(c)}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => togglePublish(c)}>
                <Switch checked={c.is_published} className="pointer-events-none scale-75" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => move(c, -1)}>
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => move(c, 1)}>
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => remove(c.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "تعديل تصنيف" : "تصنيف جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="الاسم">
              <Input
                value={editing?.label ?? ""}
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
              />
            </Field>
            <Field label="الوصف">
              <Textarea
                rows={2}
                value={editing?.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="الأيقونة">
                <Select
                  value={editing?.icon ?? "HelpCircle"}
                  onValueChange={(v) => setEditing({ ...editing, icon: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ICONS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="اللون">
                <Select
                  value={editing?.color ?? "primary"}
                  onValueChange={(v) => setEditing({ ...editing, color: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLORS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="رابط (اختياري)">
              <Input
                placeholder="/about"
                value={editing?.link ?? ""}
                onChange={(e) => setEditing({ ...editing, link: e.target.value })}
              />
            </Field>
            <div className="flex items-center gap-2">
              <Switch
                checked={editing?.is_published ?? true}
                onCheckedChange={(v) => setEditing({ ...editing, is_published: v })}
              />
              <Label>منشور</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- FAQs ---------- */
function FaqsTab({
  items,
  categories,
  onChanged,
}: {
  items: SupportFaq[];
  categories: SupportCategory[];
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState<Partial<SupportFaq> | null>(null);
  const [filterCat, setFilterCat] = useState("all");
  const filtered = useMemo(
    () => (filterCat === "all" ? items : items.filter((f) => f.category_id === filterCat)),
    [items, filterCat],
  );
  const save = async () => {
    if (!editing?.question || !editing?.answer) return toast.error("أدخل السؤال والإجابة");
    const kws =
      typeof (editing as any).keywords === "string"
        ? (editing as any).keywords.split(",").map((s: string) => s.trim()).filter(Boolean)
        : (editing.keywords ?? []);
    const payload = {
      category_id: editing.category_id ?? null,
      question: editing.question,
      answer: editing.answer,
      keywords: kws,
      sort_order: editing.sort_order ?? items.length,
      is_published: editing.is_published ?? true,
    };
    const res = editing.id
      ? await supabase.from("support_faqs").update(payload).eq("id", editing.id)
      : await supabase.from("support_faqs").insert([payload]);
    if (res.error) return toast.error("فشل الحفظ");
    toast.success("تم الحفظ");
    setEditing(null);
    onChanged();
  };
  const remove = async (id: string) => {
    if (!confirm("حذف السؤال؟")) return;
    await supabase.from("support_faqs").delete().eq("id", id);
    onChanged();
  };
  const togglePublish = async (it: SupportFaq) => {
    await supabase.from("support_faqs").update({ is_published: !it.is_published }).eq("id", it.id);
    onChanged();
  };
  const move = async (it: SupportFaq, dir: -1 | 1) => {
    await supabase
      .from("support_faqs")
      .update({ sort_order: (it.sort_order ?? 0) + dir })
      .eq("id", it.id);
    onChanged();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل التصنيفات</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setEditing({})} className="gap-2">
          <Plus className="h-4 w-4" /> سؤال جديد
        </Button>
      </div>
      <div className="space-y-2">
        {filtered.map((f) => {
          const cat = categories.find((c) => c.id === f.category_id);
          return (
            <Card key={f.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {cat && <Badge variant="secondary" className="text-xs">{cat.label}</Badge>}
                    <Badge variant={f.is_published ? "default" : "outline"} className="text-xs">
                      {f.is_published ? "منشور" : "مخفي"}
                    </Badge>
                  </div>
                  <p className="font-semibold">{f.question}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{f.answer}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => move(f, -1)}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => move(f, 1)}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => togglePublish(f)}>
                    <Switch checked={f.is_published} className="pointer-events-none scale-75" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(f)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => remove(f.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent dir="rtl" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "تعديل سؤال" : "سؤال جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="التصنيف">
              <Select
                value={editing?.category_id ?? "none"}
                onValueChange={(v) =>
                  setEditing({ ...editing, category_id: v === "none" ? null : v })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="السؤال">
              <Input
                value={editing?.question ?? ""}
                onChange={(e) => setEditing({ ...editing, question: e.target.value })}
              />
            </Field>
            <Field label="الإجابة">
              <Textarea
                rows={6}
                value={editing?.answer ?? ""}
                onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
              />
            </Field>
            <Field label="كلمات مفتاحية (مفصولة بفواصل)">
              <Input
                value={
                  Array.isArray(editing?.keywords)
                    ? (editing!.keywords as string[]).join(", ")
                    : ((editing as any)?.keywords ?? "")
                }
                onChange={(e) =>
                  setEditing({ ...editing, keywords: e.target.value as any })
                }
              />
            </Field>
            <div className="flex items-center gap-2">
              <Switch
                checked={editing?.is_published ?? true}
                onCheckedChange={(v) => setEditing({ ...editing, is_published: v })}
              />
              <Label>منشور</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- Quick Links ---------- */
function LinksTab({
  items,
  onChanged,
}: {
  items: SupportQuickLink[];
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState<Partial<SupportQuickLink> | null>(null);
  const save = async () => {
    if (!editing?.label || !editing?.url) return toast.error("أدخل العنوان والرابط");
    const payload = {
      label: editing.label,
      description: editing.description ?? null,
      url: editing.url,
      icon: editing.icon ?? "ExternalLink",
      link_type: editing.link_type ?? "link",
      sort_order: editing.sort_order ?? items.length,
      is_published: editing.is_published ?? true,
    };
    const res = editing.id
      ? await supabase.from("support_quick_links").update(payload).eq("id", editing.id)
      : await supabase.from("support_quick_links").insert([payload]);
    if (res.error) return toast.error("فشل الحفظ");
    toast.success("تم الحفظ");
    setEditing(null);
    onChanged();
  };
  const remove = async (id: string) => {
    if (!confirm("حذف الرابط؟")) return;
    await supabase.from("support_quick_links").delete().eq("id", id);
    onChanged();
  };
  const togglePublish = async (it: SupportQuickLink) => {
    await supabase
      .from("support_quick_links")
      .update({ is_published: !it.is_published })
      .eq("id", it.id);
    onChanged();
  };
  const move = async (it: SupportQuickLink, dir: -1 | 1) => {
    await supabase
      .from("support_quick_links")
      .update({ sort_order: (it.sort_order ?? 0) + dir })
      .eq("id", it.id);
    onChanged();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing({})} className="gap-2">
          <Plus className="h-4 w-4" /> رابط جديد
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((l) => (
          <Card key={l.id} className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold truncate">{l.label}</p>
                <p className="text-xs text-muted-foreground truncate">{l.url}</p>
              </div>
              <Badge variant={l.is_published ? "default" : "secondary"}>
                {l.is_published ? "منشور" : "مخفي"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {l.icon} · {l.link_type}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2 border-t">
              <Button size="sm" variant="ghost" onClick={() => setEditing(l)}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => togglePublish(l)}>
                <Switch checked={l.is_published} className="pointer-events-none scale-75" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => move(l, -1)}>
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => move(l, 1)}>
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => remove(l.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "تعديل رابط" : "رابط جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="العنوان">
              <Input
                value={editing?.label ?? ""}
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
              />
            </Field>
            <Field label="الوصف">
              <Input
                value={editing?.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </Field>
            <Field label="الرابط (URL أو /مسار داخلي)">
              <Input
                value={editing?.url ?? ""}
                onChange={(e) => setEditing({ ...editing, url: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="الأيقونة">
                <Select
                  value={editing?.icon ?? "ExternalLink"}
                  onValueChange={(v) => setEditing({ ...editing, icon: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ICONS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="النوع">
                <Select
                  value={editing?.link_type ?? "link"}
                  onValueChange={(v) => setEditing({ ...editing, link_type: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="link">رابط</SelectItem>
                    <SelectItem value="pdf">ملف PDF</SelectItem>
                    <SelectItem value="video">فيديو</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={editing?.is_published ?? true}
                onCheckedChange={(v) => setEditing({ ...editing, is_published: v })}
              />
              <Label>منشور</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
