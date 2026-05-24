import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, GripVertical, ExternalLink, Copy, Loader2, Archive, ArchiveRestore, Lock, Eye, EyeOff, ClipboardList, FileInput } from "lucide-react";
import { SortableList, SortableItem, persistSortOrder } from "@/components/admin/SortableList";
import { AdminListRow } from "@/components/admin/AdminListRow";
import { ReorderControls } from "@/components/admin/ReorderControls";
import { moveToPosition, moveRelativeTo } from "@/lib/reorderHelpers";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { BulkActionsBar } from "@/components/admin/BulkActionsBar";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { IconPicker } from "@/components/admin/IconPicker";


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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

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

  // مسح التحديد عند تغيير التبويب لمنع تنفيذ إجراءات على عناصر مخفية.
  useEffect(() => { setSelectedIds(new Set()); }, [view]);

  const visibleIds = useMemo(() => visibleForms.map((f) => f.id), [visibleForms]);
  const visibleSelectedCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && visibleSelectedCount === visibleIds.length;

  function toggleSelect(id: string, next: boolean) {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      if (next) s.add(id); else s.delete(id);
      return s;
    });
  }
  function toggleSelectAll(next: boolean) {
    setSelectedIds(next ? new Set(visibleIds) : new Set());
  }
  function clearSelection() { setSelectedIds(new Set()); }

  async function bulkSetPublished(next: boolean) {
    const ids = Array.from(selectedIds).filter((id) => visibleIds.includes(id));
    if (ids.length === 0) return;
    setBulkBusy(true);
    const { error } = await supabase.from("custom_forms").update({ published: next }).in("id", ids);
    setBulkBusy(false);
    if (error) return toast.error(error.message);
    toast.success(next ? `تم نشر ${ids.length} نموذجاً` : `تم إخفاء ${ids.length} نموذجاً`);
    clearSelection();
    load();
  }

  async function bulkDelete() {
    const ids = Array.from(selectedIds).filter((id) => visibleIds.includes(id));
    if (ids.length === 0) return;
    // لا تحذف النماذج النظامية مجمّعةً
    const systemIds = forms.filter((f) => ids.includes(f.id) && f.is_system).map((f) => f.id);
    const deletable = ids.filter((id) => !systemIds.includes(id));
    if (deletable.length === 0) {
      setBulkDeleteOpen(false);
      return toast.error("جميع العناصر المحددة نظامية ولا يمكن حذفها.");
    }
    setBulkBusy(true);
    const { error } = await supabase.from("custom_forms").delete().in("id", deletable);
    setBulkBusy(false);
    setBulkDeleteOpen(false);
    if (error) return toast.error(error.message);
    toast.success(
      systemIds.length > 0
        ? `تم حذف ${deletable.length} (تم تجاهل ${systemIds.length} نظامي)`
        : `تم حذف ${deletable.length} نموذجاً`,
    );
    clearSelection();
    load();
  }


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

  async function reorder(newIds: string[]) {
    // Optimistic: reorder forms by newIds, keep others intact
    const subset = new Set(newIds);
    const reorderedActive = newIds.map((id) => forms.find((f) => f.id === id)!).filter(Boolean);
    const others = forms.filter((f) => !subset.has(f.id));
    setForms([...reorderedActive, ...others]);
    try {
      await persistSortOrder(supabase, "custom_forms", newIds);
      toast.success("تم تحديث الترتيب");
    } catch {
      toast.error("تعذر حفظ الترتيب");
      load();
    }
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
      coming_soon: !!editing.coming_soon,
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
      <AdminPageHeader
        title="نماذج الخدمات الإلكترونية"
        description="جميع النماذج: نماذج التطوع والعضوية والتواصل النظامية + النماذج المخصصة. يمكنك التعديل والإخفاء والأرشفة والحذف."
        icon={FileInput}
        action={
          <Button onClick={() => setEditing({ ...emptyForm(), sort_order: forms.length })}>
            <Plus className="h-4 w-4 ml-1" /> نموذج جديد
          </Button>
        }
      />

      <AdminListToolbar
        chips={[
          { value: "active", label: "النشطة", count: activeCount },
          { value: "archived", label: "الأرشيف", count: archivedCount },
        ]}
        activeChip={view}
        onChipChange={(v) => setView(v as any)}
      />

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <div className="grid gap-3">
          {visibleForms.length === 0 && (
            <AdminEmptyState
              icon={ClipboardList}
              title={view === "archived" ? "لا توجد نماذج مؤرشفة" : "لا توجد نماذج بعد"}
              description={view === "archived" ? "النماذج التي تنقلها للأرشيف ستظهر هنا." : "ابدأ بإضافة نموذج جديد لجمع طلبات المستفيدين."}
              actionLabel={view === "active" ? "نموذج جديد" : undefined}
              onAction={view === "active" ? () => setEditing({ ...emptyForm(), sort_order: forms.length }) : undefined}
            />
          )}
          {view === "active" && visibleForms.length > 1 && (
            <p className="text-xs text-muted-foreground">اسحب أيقونة <GripVertical className="inline w-3 h-3" /> لإعادة ترتيب النماذج.</p>
          )}
          <SortableList
            ids={visibleForms.map((f) => f.id)}
            onReorder={(newIds) => reorder(newIds)}
          >
            {visibleForms.map((f, idx) => {
              const sys = f.is_system ? SYSTEM_LABELS[f.is_system] : null;
              const publicUrl = sys?.url ?? `/e-services/form/${f.slug}`;
              const canReorder = view === "active" && visibleForms.length > 1;
              const applyMove = (next: string[] | null) => { if (next) reorder(next); };
              return (
                <SortableItem key={f.id} id={f.id} disabled={view === "archived"}>
                  {({ handleProps, setNodeRef, style }) => (
                    <AdminListRow
                      ref={setNodeRef as any}
                      style={style}
                      id={f.id}
                      table="custom_forms"
                      dragHandleProps={handleProps}
                      showDragHandle={view === "active"}
                      reorderControls={canReorder ? (
                        <ReorderControls
                          position={idx + 1}
                          total={visibleForms.length}
                          others={visibleForms.filter((x) => x.id !== f.id).map((x) => ({ id: x.id, label: x.title }))}
                          onMoveUp={() => applyMove(moveToPosition(visibleForms.map((x) => x.id), f.id, idx))}
                          onMoveDown={() => applyMove(moveToPosition(visibleForms.map((x) => x.id), f.id, idx + 2))}
                          onSetPosition={(pos) => applyMove(moveToPosition(visibleForms.map((x) => x.id), f.id, pos))}
                          onMoveToStart={() => applyMove(moveToPosition(visibleForms.map((x) => x.id), f.id, 1))}
                          onMoveToEnd={() => applyMove(moveToPosition(visibleForms.map((x) => x.id), f.id, visibleForms.length))}
                          onMoveRelative={(targetId, where) => applyMove(moveRelativeTo(visibleForms.map((x) => x.id), f.id, targetId, where))}
                        />
                      ) : undefined}
                      title={
                        <span className="flex items-center gap-2 flex-wrap">
                          {f.title}
                          <code className="text-xs text-muted-foreground font-normal">{publicUrl}</code>
                        </span>
                      }
                      subtitle={
                        <span>
                          {f.description ? `${f.description} · ` : ""}{f.fields.length} حقل
                        </span>
                      }
                      badges={
                        <>
                          {sys && <Badge variant="outline" className="border-accent text-accent"><Lock className="h-3 w-3 me-1" /> نظامي</Badge>}
                          {f.coming_soon && <Badge variant="outline" className="border-amber-500 text-amber-600">قريباً</Badge>}
                          {f.featured && <Badge variant="outline">مميز</Badge>}
                          {f.archived && <Badge variant="destructive">مؤرشف</Badge>}
                        </>
                      }
                      published={f.published}
                      onTogglePublished={load}
                      onEdit={() => setEditing(f)}
                      onDelete={f.is_system ? undefined : () => remove(f.id, f.is_system)}
                      extraActions={
                        <>
                          <Button size="icon" variant="outline" className="h-9 w-9 border-border bg-muted/40" asChild title="معاينة">
                            <Link to={publicUrl} target="_blank"><ExternalLink className="h-4 w-4" /></Link>
                          </Button>
                          {!f.is_system && (
                            <Button size="icon" variant="outline" className="h-9 w-9 border-border bg-muted/40" title="نسخ" onClick={() => setEditing({ ...emptyForm(), ...f, slug: f.slug + "-copy", title: f.title + " (نسخة)", id: undefined, is_system: null, archived: false })}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="icon" variant="outline" className="h-9 w-9 border-border bg-muted/40" title={f.archived ? "استعادة" : "أرشفة"} onClick={() => toggleArchive(f)}>
                            {f.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                          </Button>
                        </>
                      }
                    />
                  )}
                </SortableItem>
              );
            })}
          </SortableList>
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
                  <Label>أيقونة</Label>
                  <IconPicker value={value.icon ?? ""} onChange={(name) => update("icon", name)} />
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
