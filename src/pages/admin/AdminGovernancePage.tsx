import { useEffect, useState } from "react";
import { CrudPage } from "@/components/admin/CrudPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminDialog } from "@/components/admin/AdminDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2, FolderCog, Eye, EyeOff, ArrowUp, ArrowDown, ArrowUpToLine, ArrowDownToLine } from "lucide-react";

type GovDoc = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  file_url: string;
  file_size: number | null;
  sort_order: number;
  published: boolean;
};

type GovCategory = {
  id: string;
  slug: string;
  label_ar: string;
  label_en: string;
  icon: string | null;
  sort_order: number;
  published: boolean;
};

function CategoryManager({ onChanged }: { onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<GovCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Partial<GovCategory> | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("governance_categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    setRows((data ?? []) as GovCategory[]);
    setLoading(false);
  }

  useEffect(() => { if (open) load(); }, [open]);

  async function save() {
    if (!editing) return;
    if (!editing.slug?.trim()) return toast.error("المعرّف (slug) مطلوب");
    if (!editing.label_ar?.trim()) return toast.error("الاسم بالعربي مطلوب");
    if (!editing.label_en?.trim()) return toast.error("الاسم بالإنجليزي مطلوب");
    setSaving(true);
    try {
      if (editing.id) {
        const { id, ...rest } = editing as GovCategory;
        const { error } = await supabase.from("governance_categories").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("governance_categories").insert({
          slug: editing.slug!,
          label_ar: editing.label_ar!,
          label_en: editing.label_en!,
          icon: editing.icon ?? null,
          sort_order: editing.sort_order ?? 0,
          published: editing.published ?? true,
        });
        if (error) throw error;
      }
      toast.success("تم الحفظ");
      setEditing(null);
      await load();
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: GovCategory) {
    if (!confirm(`حذف القسم "${row.label_ar}"؟ لن تُحذف الملفات لكنها لن تظهر تحت أي قسم.`)) return;
    const { error } = await supabase.from("governance_categories").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    await load();
    onChanged();
  }

  async function togglePublished(row: GovCategory) {
    const next = !row.published;
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, published: next } : r)));
    const { error } = await supabase.from("governance_categories").update({ published: next }).eq("id", row.id);
    if (error) {
      toast.error(error.message);
      await load();
      return;
    }
    toast.success(next ? "تم إظهار القسم" : "تم إخفاء القسم");
    onChanged();
  }

  async function persistOrder(newRows: GovCategory[]) {
    setRows(newRows);
    const updates = newRows.map((r, idx) =>
      supabase.from("governance_categories").update({ sort_order: (idx + 1) * 10 }).eq("id", r.id),
    );
    const results = await Promise.all(updates);
    const err = results.find((r) => r.error)?.error;
    if (err) {
      toast.error(err.message);
      await load();
      return;
    }
    onChanged();
  }

  async function move(index: number, direction: "up" | "down" | "top" | "bottom") {
    const next = [...rows];
    const [item] = next.splice(index, 1);
    let target = index;
    if (direction === "up") target = Math.max(0, index - 1);
    else if (direction === "down") target = Math.min(next.length, index + 1);
    else if (direction === "top") target = 0;
    else if (direction === "bottom") target = next.length;
    next.splice(target, 0, item);
    await persistOrder(next);
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <FolderCog className="w-4 h-4 ml-1" />
        إدارة الأقسام
      </Button>

      <AdminDialog
        open={open}
        onOpenChange={setOpen}
        title="إدارة أقسام الحوكمة"
        description="أضف أو عدّل أو احذف الأقسام التي تظهر في صفحة ملفات الحوكمة."
        size="xl"
        hideFooter
      >
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => setEditing({ slug: "", label_ar: "", label_en: "", icon: "", sort_order: (rows.at(-1)?.sort_order ?? 0) + 10, published: true })}
            >
              <Plus className="w-4 h-4 ml-1" />
              قسم جديد
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">لا توجد أقسام بعد.</p>
          ) : (
            <div className="space-y-1.5">
              {rows.map((r, idx) => (
                <div key={r.id} className={`flex items-center justify-between gap-1 p-2 border rounded-md bg-card ${!r.published ? "opacity-60" : ""}`}>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{r.label_ar} <span className="text-xs text-muted-foreground">/ {r.label_en}</span></div>
                    <div className="text-xs text-muted-foreground">المعرّف: {r.slug} {!r.published && "· مخفي"}</div>
                  </div>
                  <div className="flex items-center gap-0.5 border-l pl-1 ml-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" disabled={idx === 0} onClick={() => move(idx, "top")} title="نقل إلى الأعلى">
                      <ArrowUpToLine className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" disabled={idx === 0} onClick={() => move(idx, "up")} title="تحريك للأعلى">
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" disabled={idx === rows.length - 1} onClick={() => move(idx, "down")} title="تحريك للأسفل">
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" disabled={idx === rows.length - 1} onClick={() => move(idx, "bottom")} title="نقل إلى الأسفل">
                      <ArrowDownToLine className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => togglePublished(r)} title={r.published ? "إخفاء" : "إظهار"}>
                    {r.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(r)} title="تعديل"><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => remove(r)} title="حذف"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminDialog>

      <AdminDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing?.id ? "تعديل قسم" : "قسم جديد"}
        description="املأ بيانات القسم."
        onSave={save}
        saving={saving}
      >
        {editing && (
          <div className="space-y-3">
            <div>
              <Label>المعرّف (slug) *</Label>
              <Input
                value={editing.slug ?? ""}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value.trim() })}
                placeholder="مثال: research"
                disabled={!!editing.id}
              />
              <p className="text-xs text-muted-foreground mt-1">يستخدم داخلياً لربط الملفات بالقسم. لا يمكن تغييره بعد الإنشاء.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>الاسم بالعربي *</Label>
                <Input value={editing.label_ar ?? ""} onChange={(e) => setEditing({ ...editing, label_ar: e.target.value })} />
              </div>
              <div>
                <Label>الاسم بالإنجليزي *</Label>
                <Input value={editing.label_en ?? ""} onChange={(e) => setEditing({ ...editing, label_en: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>اسم الأيقونة (Lucide)</Label>
                <Input value={editing.icon ?? ""} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} placeholder="ShieldCheck" />
              </div>
              <div>
                <Label>الترتيب</Label>
                <Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.published ?? true} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
              منشور
            </label>
          </div>
        )}
      </AdminDialog>
    </>
  );
}

export default function AdminGovernancePage() {
  const [categories, setCategories] = useState<GovCategory[]>([]);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    supabase
      .from("governance_categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setCategories((data ?? []) as GovCategory[]));
  }, [version]);

  const options = categories.map((c) => ({ value: c.slug, label: c.label_ar }));

  return (
    <CrudPage<GovDoc>
      key={version}
      table="governance_documents"
      title="ملفات الحوكمة"
      description="إدارة جميع وثائق الحوكمة لعرضها في صفحة الحوكمة العامة"
      searchField="title"
      reorderable
      categoryFilter={{
        field: "category",
        options,
        includeAll: false,
        extraAction: <CategoryManager onChanged={() => setVersion((v) => v + 1)} />,
      }}
      columns={[
        { key: "title", label: "العنوان", className: "font-medium" },
        {
          key: "category",
          label: "التصنيف",
          render: (r) => categories.find((c) => c.slug === r.category)?.label_ar ?? r.category ?? "—",
        },
        {
          key: "file_url",
          label: "الملف",
          render: (r) =>
            r.file_url ? (
              <a href={r.file_url} target="_blank" rel="noreferrer" className="text-primary underline text-xs">عرض</a>
            ) : "—",
        },
      ]}
      createDefaults={() => ({
        title: "",
        description: "",
        category: options[0]?.value ?? "",
        file_url: "",
        sort_order: 0,
        published: true,
      })}
      validate={(v) => {
        if (!v.title?.trim()) return "العنوان مطلوب";
        if (!v.file_url?.trim()) return "ارفع ملف PDF";
        if (!v.category?.trim()) return "اختر القسم";
        return null;
      }}
      renderForm={(v, set) => (
        <>
          <div>
            <Label>العنوان *</Label>
            <Input value={v.title ?? ""} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div>
            <Label>التصنيف *</Label>
            <Select value={v.category ?? ""} onValueChange={(val) => set("category", val)}>
              <SelectTrigger><SelectValue placeholder="اختر التصنيف" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>{c.label_ar}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">يحدد القسم الذي يظهر فيه الملف ضمن صفحة الحوكمة.</p>
          </div>
          <div>
            <Label>الوصف</Label>
            <Textarea rows={3} value={v.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </div>
          <MediaUpload
            label="ملف PDF *"
            folder="governance"
            value={v.file_url}
            accept="application/pdf"
            bucket="documents"
            onChange={(url) => set("file_url", url || "")}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>الترتيب</Label>
              <Input type="number" value={v.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} />
            </div>
            <label className="flex items-end gap-2 text-sm pb-2">
              <input type="checkbox" checked={!!v.published} onChange={(e) => set("published", e.target.checked)} />
              منشور
            </label>
          </div>
        </>
      )}
    />
  );
}
