import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, Copy, Loader2, Archive, ArchiveRestore, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FieldType = "text" | "textarea" | "email" | "phone" | "number" | "date" | "select" | "checkbox";
interface Field {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[]; // for select
}
interface CustomForm {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  audience: string;
  duration: string | null;
  fields: Field[];
  success_message: string | null;
  published: boolean;
  featured: boolean;
  sort_order: number;
  archived?: boolean;
  is_system?: string | null;
  coming_soon?: boolean;
}

const SYSTEM_LABELS: Record<string, { label: string; url: string }> = {
  volunteer: { label: "نموذج التطوع (نظامي)", url: "/e-services/volunteer" },
  membership: { label: "نموذج العضوية (نظامي)", url: "/e-services/membership" },
  contact: { label: "نموذج التواصل (نظامي)", url: "/contact" },
};

const TEMPLATES: Record<string, Field[]> = {
  blank: [],
  contact: [
    { key: "full_name", label: "الاسم الكامل", type: "text", required: true },
    { key: "email", label: "البريد الإلكتروني", type: "email", required: true },
    { key: "phone", label: "رقم الجوال", type: "phone", required: true },
    { key: "message", label: "الرسالة", type: "textarea", required: true },
  ],
  volunteer: [
    { key: "full_name", label: "الاسم الكامل", type: "text", required: true },
    { key: "id_number", label: "رقم الهوية", type: "text", required: true },
    { key: "phone", label: "رقم الجوال", type: "phone", required: true },
    { key: "email", label: "البريد الإلكتروني", type: "email", required: true },
    { key: "city", label: "المدينة", type: "text" },
    { key: "skills", label: "المهارات", type: "textarea" },
  ],
  membership: [
    { key: "full_name", label: "الاسم الكامل", type: "text", required: true },
    { key: "national_id", label: "الهوية الوطنية", type: "text", required: true },
    { key: "email", label: "البريد الإلكتروني", type: "email", required: true },
    { key: "phone", label: "رقم الجوال", type: "phone", required: true },
    { key: "job_title", label: "المسمى الوظيفي", type: "text" },
    { key: "employer", label: "جهة العمل", type: "text" },
  ],
};

function emptyForm(): Omit<CustomForm, "id"> {
  return {
    slug: "",
    title: "",
    description: "",
    icon: "FileText",
    audience: "individuals",
    duration: "5 دقائق",
    fields: [],
    success_message: "تم استلام طلبك بنجاح، سنتواصل معك قريباً.",
    published: true,
    featured: false,
    sort_order: 0,
  };
}

export default function AdminFormsPage() {
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CustomForm | (Omit<CustomForm, "id"> & { id?: string }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"active" | "archived">("active");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("custom_forms").select("*").order("sort_order");
    if (error) toast.error(error.message);
    else setForms((data ?? []) as any);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const visibleForms = useMemo(
    () => forms.filter((f) => (view === "archived" ? f.archived : !f.archived)),
    [forms, view],
  );

  async function remove(id: string, isSystem?: string | null) {
    if (isSystem) {
      toast.error("لا يمكن حذف النموذج النظامي. يمكنك إخفاؤه أو أرشفته.");
      return;
    }
    if (!confirm("حذف النموذج؟ سيتم حذف جميع طلباته أيضاً.")) return;
    const { error } = await supabase.from("custom_forms").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    load();
  }

  async function toggleArchive(f: CustomForm) {
    const { error } = await supabase.from("custom_forms").update({ archived: !f.archived }).eq("id", f.id);
    if (error) return toast.error(error.message);
    toast.success(f.archived ? "تم استعادة النموذج" : "تم نقل النموذج للأرشيف");
    load();
  }

  async function togglePublished(f: CustomForm) {
    const { error } = await supabase.from("custom_forms").update({ published: !f.published }).eq("id", f.id);
    if (error) return toast.error(error.message);
    toast.success(f.published ? "تم إخفاء النموذج" : "تم نشر النموذج");
    load();
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = visibleForms.findIndex((f) => f.id === id);
    const j = idx + dir;
    if (j < 0 || j >= visibleForms.length) return;
    const a = visibleForms[idx], b = visibleForms[j];
    await supabase.from("custom_forms").update({ sort_order: b.sort_order }).eq("id", a.id);
    await supabase.from("custom_forms").update({ sort_order: a.sort_order }).eq("id", b.id);
    load();
  }

  async function save() {
    if (!editing) return;
    if (!editing.title.trim() || !editing.slug.trim()) {
      toast.error("العنوان والمعرّف (slug) مطلوبان");
      return;
    }
    setSaving(true);
    const payload = {
      slug: editing.slug.trim(),
      title: editing.title.trim(),
      description: editing.description,
      icon: editing.icon,
      audience: editing.audience,
      duration: editing.duration,
      fields: editing.fields as any,
      success_message: editing.success_message,
      published: editing.published,
      featured: editing.featured,
      sort_order: editing.sort_order ?? forms.length,
    };
    const { error } = editing.id
      ? await supabase.from("custom_forms").update(payload).eq("id", editing.id)
      : await supabase.from("custom_forms").insert([payload]);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("تم الحفظ");
    setEditing(null);
    load();
  }

  const activeCount = forms.filter((f) => !f.archived).length;
  const archivedCount = forms.filter((f) => f.archived).length;

  return (
    <AdminLayout title="نماذج الخدمات الإلكترونية">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p className="text-muted-foreground text-sm">جميع النماذج: نماذج التطوع والعضوية والتواصل النظامية + النماذج المخصصة. يمكنك التعديل والإخفاء والأرشفة والحذف.</p>
        <Button onClick={() => setEditing({ ...emptyForm(), sort_order: forms.length })}>
          <Plus className="h-4 w-4 me-2" /> نموذج جديد
        </Button>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as any)} className="mb-4">
        <TabsList>
          <TabsTrigger value="active">النشطة ({activeCount})</TabsTrigger>
          <TabsTrigger value="archived">الأرشيف ({archivedCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <div className="grid gap-3">
          {visibleForms.length === 0 && <Card><CardContent className="p-8 text-center text-muted-foreground">{view === "archived" ? "لا توجد نماذج مؤرشفة." : "لا توجد نماذج بعد. ابدأ بإضافة نموذج جديد."}</CardContent></Card>}
          {visibleForms.map((f, i) => {
            const sys = f.is_system ? SYSTEM_LABELS[f.is_system] : null;
            const publicUrl = sys?.url ?? `/e-services/form/${f.slug}`;
            return (
            <Card key={f.id} className={f.archived ? "opacity-70" : ""}>
              <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold">{f.title}</h3>
                    {sys && <Badge variant="outline" className="border-accent text-accent"><Lock className="h-3 w-3 me-1" /> نظامي</Badge>}
                    <Badge variant={f.published ? "default" : "secondary"}>{f.published ? "منشور" : "مخفي"}</Badge>
                    {f.featured && <Badge variant="outline">مميز</Badge>}
                    {f.archived && <Badge variant="destructive">مؤرشف</Badge>}
                    <code className="text-xs text-muted-foreground">{publicUrl}</code>
                  </div>
                  {f.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{f.description}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{f.fields.length} حقل / سؤال</p>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {!f.archived && (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => move(f.id, -1)} disabled={i === 0}><ArrowUp className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => move(f.id, 1)} disabled={i === visibleForms.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                    </>
                  )}
                  <Button size="icon" variant="ghost" asChild title="معاينة"><Link to={publicUrl} target="_blank"><ExternalLink className="h-4 w-4" /></Link></Button>
                  <Button size="icon" variant="ghost" title={f.published ? "إخفاء" : "نشر"} onClick={() => togglePublished(f)}>
                    {f.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  {!f.is_system && (
                    <Button size="icon" variant="ghost" title="نسخ" onClick={() => setEditing({ ...emptyForm(), ...f, slug: f.slug + "-copy", title: f.title + " (نسخة)", id: undefined, is_system: null, archived: false })}><Copy className="h-4 w-4" /></Button>
                  )}
                  <Button variant="outline" onClick={() => setEditing(f)}>تعديل</Button>
                  <Button size="icon" variant="ghost" title={f.archived ? "استعادة" : "أرشفة"} onClick={() => toggleArchive(f)}>
                    {f.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                  </Button>
                  {!f.is_system && (
                    <Button size="icon" variant="ghost" title="حذف" onClick={() => remove(f.id, f.is_system)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );})}
        </div>
      )}

      {editing && (
        <FormEditor
          value={editing as any}
          onChange={(v) => setEditing(v)}
          onCancel={() => setEditing(null)}
          onSave={save}
          saving={saving}
        />
      )}
    </AdminLayout>
  );
}

function FormEditor({ value, onChange, onCancel, onSave, saving }: {
  value: any; onChange: (v: any) => void; onCancel: () => void; onSave: () => void; saving: boolean;
}) {
  function update<K extends string>(k: K, v: any) { onChange({ ...value, [k]: v }); }
  function updateField(idx: number, patch: Partial<Field>) {
    const next = [...value.fields]; next[idx] = { ...next[idx], ...patch }; update("fields", next);
  }
  function addField() {
    update("fields", [...value.fields, { key: `field_${value.fields.length + 1}`, label: "حقل جديد", type: "text" }]);
  }
  function removeField(idx: number) { update("fields", value.fields.filter((_: any, i: number) => i !== idx)); }
  function applyTemplate(t: keyof typeof TEMPLATES) {
    if (value.fields.length && !confirm("سيتم استبدال الحقول الحالية بالقالب. متابعة؟")) return;
    update("fields", [...TEMPLATES[t]]);
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto p-4" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <Card className="max-w-4xl mx-auto my-8">
        <CardHeader>
          <CardTitle>{value.id ? "تعديل النموذج" : "نموذج جديد"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic">
            <TabsList>
              <TabsTrigger value="basic">المعلومات الأساسية</TabsTrigger>
              <TabsTrigger value="fields">الحقول ({value.fields.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>عنوان النموذج *</Label>
                  <Input value={value.title} onChange={(e) => update("title", e.target.value)} />
                </div>
                <div>
                  <Label>المعرّف (slug) *</Label>
                  <Input dir="ltr" value={value.slug} onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="my-form" />
                </div>
                <div className="md:col-span-2">
                  <Label>الوصف</Label>
                  <Textarea rows={2} value={value.description ?? ""} onChange={(e) => update("description", e.target.value)} />
                </div>
                <div>
                  <Label>أيقونة (Lucide)</Label>
                  <Input dir="ltr" value={value.icon ?? ""} onChange={(e) => update("icon", e.target.value)} placeholder="FileText" />
                </div>
                <div>
                  <Label>الفئة المستهدفة</Label>
                  <Select value={value.audience} onValueChange={(v) => update("audience", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individuals">للأفراد</SelectItem>
                      <SelectItem value="entities">للجهات</SelectItem>
                      <SelectItem value="inquiries">استفسارات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>المدة المتوقعة</Label>
                  <Input value={value.duration ?? ""} onChange={(e) => update("duration", e.target.value)} placeholder="٥ دقائق" />
                </div>
                <div className="md:col-span-2">
                  <Label>رسالة النجاح بعد الإرسال</Label>
                  <Textarea rows={2} value={value.success_message ?? ""} onChange={(e) => update("success_message", e.target.value)} />
                </div>
                <div className="flex items-center gap-2"><Switch checked={value.published} onCheckedChange={(v) => update("published", v)} /><Label>منشور</Label></div>
                <div className="flex items-center gap-2"><Switch checked={value.featured} onCheckedChange={(v) => update("featured", v)} /><Label>مميز (الأكثر طلباً)</Label></div>
                <div className="flex items-center gap-2"><Switch checked={!!value.coming_soon} onCheckedChange={(v) => update("coming_soon", v)} /><Label>قادم قريباً (يُعرض كبطاقة دون نموذج)</Label></div>
              </div>
            </TabsContent>

            <TabsContent value="fields" className="space-y-3 pt-4">
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground self-center">قوالب جاهزة:</span>
                <Button size="sm" variant="outline" onClick={() => applyTemplate("contact")}>تواصل</Button>
                <Button size="sm" variant="outline" onClick={() => applyTemplate("volunteer")}>تطوع</Button>
                <Button size="sm" variant="outline" onClick={() => applyTemplate("membership")}>عضوية</Button>
                <Button size="sm" variant="outline" onClick={() => applyTemplate("blank")}>تفريغ</Button>
              </div>
              {value.fields.map((f: Field, i: number) => (
                <Card key={i}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground">حقل #{i + 1}</span>
                      <Button size="icon" variant="ghost" onClick={() => removeField(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-2">
                      <Input placeholder="التسمية" value={f.label} onChange={(e) => updateField(i, { label: e.target.value })} />
                      <Input dir="ltr" placeholder="key" value={f.key} onChange={(e) => updateField(i, { key: e.target.value.replace(/[^a-z0-9_]/gi, "_") })} />
                      <Select value={f.type} onValueChange={(v) => updateField(i, { type: v as FieldType })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">نص قصير</SelectItem>
                          <SelectItem value="textarea">نص طويل</SelectItem>
                          <SelectItem value="email">بريد إلكتروني</SelectItem>
                          <SelectItem value="phone">جوال</SelectItem>
                          <SelectItem value="number">رقم</SelectItem>
                          <SelectItem value="date">تاريخ</SelectItem>
                          <SelectItem value="select">قائمة منسدلة</SelectItem>
                          <SelectItem value="checkbox">مربع اختيار</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="placeholder" value={f.placeholder ?? ""} onChange={(e) => updateField(i, { placeholder: e.target.value })} />
                      {f.type === "select" && (
                        <Input className="md:col-span-2" placeholder="الخيارات (مفصولة بفاصلة)" value={(f.options ?? []).join(",")} onChange={(e) => updateField(i, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
                      )}
                      <label className="flex items-center gap-2 text-sm"><Switch checked={!!f.required} onCheckedChange={(v) => updateField(i, { required: v })} /> مطلوب</label>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addField}><Plus className="h-4 w-4 me-2" /> إضافة حقل</Button>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-6 border-t mt-6">
            <Button variant="ghost" onClick={onCancel}>إلغاء</Button>
            <Button onClick={onSave} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin me-2" />} حفظ</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
