// إدارة الأقسام المخصّصة لصفحة "من نحن" — 7 أنواع، عربي/إنجليزي
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  Eye,
  EyeOff,
  GripVertical,
  Pencil,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { IconPicker } from "@/components/admin/IconPicker";
import {
  SortableList,
  SortableItem,
  persistSortOrder,
} from "@/components/admin/SortableList";
import AssemblyMembersEditor, {
  defaultAssemblyData,
} from "@/components/admin/about/AssemblyMembersEditor";
import type { AssemblyData } from "@/lib/assemblyExport";

export type CustomSectionType =
  | "timeline"
  | "impact"
  | "testimonials"
  | "accreditations"
  | "faq"
  | "gallery"
  | "cta"
  | "assembly_members";

const TYPE_META: Record<CustomSectionType, { label: string; desc: string }> = {
  timeline: { label: "الخط الزمني", desc: "محطّات ورحلة الجمعية بالسنوات" },
  impact: { label: "أرقام الأثر", desc: "أرقام بارزة مع تسميات وأيقونات" },
  testimonials: { label: "شهادات المستفيدين", desc: "آراء واقتباسات مع صور" },
  accreditations: { label: "الاعتمادات والجوائز", desc: "شعارات + اسم + سنة" },
  faq: { label: "الأسئلة الشائعة", desc: "سؤال وجواب قابل للطي" },
  gallery: { label: "معرض الصور", desc: "شبكة صور مع تعليقات" },
  cta: { label: "دعوة لإجراء (CTA)", desc: "عنوان + نص + زر" },
  assembly_members: {
    label: "أعضاء الجمعية العمومية",
    desc: "قائمة الأعضاء مع بحث وفلترة وتصدير واستيراد جماعي (Excel)",
  },
};

type CustomData = {
  type: CustomSectionType;
  title_ar?: string;
  title_en?: string;
  subtitle_ar?: string;
  subtitle_en?: string;
  items?: any[];
  // CTA-specific (no items)
  cta_label_ar?: string;
  cta_label_en?: string;
  cta_url?: string;
};

type Row = {
  id: string;
  section_key: string;
  title: string | null;
  data: CustomData;
  sort_order: number;
  published: boolean;
};

const CUSTOM_PREFIX = "custom:";

function emptyData(type: CustomSectionType): CustomData {
  if (type === "assembly_members") {
    return defaultAssemblyData() as unknown as CustomData;
  }
  return {
    type,
    title_ar: "",
    title_en: "",
    subtitle_ar: "",
    subtitle_en: "",
    items:
      type === "cta"
        ? undefined
        : type === "faq"
        ? [{ q_ar: "", q_en: "", a_ar: "", a_en: "" }]
        : type === "timeline"
        ? [{ year: "", title_ar: "", title_en: "", desc_ar: "", desc_en: "" }]
        : type === "impact"
        ? [{ value: "", label_ar: "", label_en: "", icon: "Sparkles" }]
        : type === "testimonials"
        ? [{ name_ar: "", name_en: "", role_ar: "", role_en: "", quote_ar: "", quote_en: "", photo_url: "" }]
        : type === "accreditations"
        ? [{ name_ar: "", name_en: "", year: "", logo_url: "" }]
        : type === "gallery"
        ? []
        : [],
  };
}

export default function CustomSectionsManager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState<CustomSectionType>("timeline");
  const [editing, setEditing] = useState<Row | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("about_content")
      .select("*")
      .like("section_key", `${CUSTOM_PREFIX}%`)
      .order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    setRows(((data ?? []) as any[]).map((d) => ({ ...d, data: (d.data ?? {}) as CustomData })));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addNew() {
    const sk = `${CUSTOM_PREFIX}${crypto.randomUUID()}`;
    const maxOrder = rows.reduce((m, r) => Math.max(m, r.sort_order), 100);
    const data = emptyData(newType);
    const { data: inserted, error } = await supabase
      .from("about_content")
      .insert({
        section_key: sk,
        title: TYPE_META[newType].label,
        data: data as never,
        sort_order: maxOrder + 10,
        published: true,
      })
      .select()
      .single();
    if (error) {
      toast.error(error.message);
      return;
    }
    setAdding(false);
    toast.success("تمت إضافة القسم — افتح للتحرير");
    await load();
    if (inserted) setEditing({ ...(inserted as any), data });
  }

  async function save(row: Row) {
    setSavingId(row.id);
    const { error } = await supabase
      .from("about_content")
      .update({
        title: row.data.title_ar || row.title || TYPE_META[row.data.type].label,
        data: row.data as never,
        published: row.published,
      })
      .eq("id", row.id);
    setSavingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("تم الحفظ");
    setEditing(null);
    load();
  }

  async function togglePub(row: Row) {
    const { error } = await supabase
      .from("about_content")
      .update({ published: !row.published })
      .eq("id", row.id);
    if (error) toast.error(error.message);
    else load();
  }

  async function remove(row: Row) {
    if (!confirm("حذف هذا القسم نهائياً؟")) return;
    const { error } = await supabase.from("about_content").delete().eq("id", row.id);
    if (error) toast.error(error.message);
    else {
      toast.success("تم الحذف");
      load();
    }
  }

  async function handleReorder(newIds: string[]) {
    setRows((prev) => {
      const map = new Map(prev.map((x) => [x.id, x]));
      return newIds.map((id, i) => ({ ...(map.get(id) as Row), sort_order: (i + 1) * 10 + 1000 }));
    });
    await persistSortOrder(supabase, "about_content", newIds);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          أقسام مخصّصة (Timeline، Testimonials، FAQ…)
        </CardTitle>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="w-4 h-4 ml-1" /> إضافة قسم جديد
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="py-6 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            لا توجد أقسام مخصّصة بعد. اضغط "إضافة قسم جديد" لإنشاء أول قسم.
          </p>
        ) : (
          <SortableList ids={rows.map((r) => r.id)} onReorder={handleReorder}>
            {rows.map((r, idx) => {
              const ids = rows.map((x) => x.id);
              const apply = (n: string[] | null) => { if (n) handleReorder(n); };
              return (
              <SortableItem key={r.id} id={r.id}>
                {({ handleProps, setNodeRef, style }) => (
                  <div
                    ref={setNodeRef}
                    style={style}
                    className={`flex items-center gap-2 rounded-md border p-3 bg-card ${
                      !r.published ? "opacity-60 border-dashed" : ""
                    }`}
                  >
                    <button
                      type="button"
                      {...handleProps}
                      className="cursor-grab active:cursor-grabbing text-muted-foreground p-1"
                      aria-label="سحب"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {r.data.title_ar || r.title || TYPE_META[r.data.type]?.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {TYPE_META[r.data.type]?.label ?? r.data.type}
                      </div>
                    </div>
                    {rows.length > 1 && (
                      <ReorderControls
                        position={idx + 1}
                        total={rows.length}
                        others={rows.filter((x) => x.id !== r.id).map((x) => ({ id: x.id, label: x.data.title_ar || x.title || TYPE_META[x.data.type]?.label || x.id }))}
                        onMoveUp={() => apply(moveToPosition(ids, r.id, idx))}
                        onMoveDown={() => apply(moveToPosition(ids, r.id, idx + 2))}
                        onSetPosition={(pos) => apply(moveToPosition(ids, r.id, pos))}
                        onMoveToStart={() => apply(moveToPosition(ids, r.id, 1))}
                        onMoveToEnd={() => apply(moveToPosition(ids, r.id, rows.length))}
                        onMoveRelative={(t, w) => apply(moveRelativeTo(ids, r.id, t, w))}
                      />
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setEditing(r)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => togglePub(r)}>
                      {r.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(r)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </SortableItem>
              );
            })}
          </SortableList>
        )}
      </CardContent>

      {/* Dialog: اختيار نوع القسم الجديد */}
      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>اختر نوع القسم الجديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>نوع القسم</Label>
            <Select value={newType} onValueChange={(v) => setNewType(v as CustomSectionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TYPE_META) as CustomSectionType[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {TYPE_META[k].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{TYPE_META[newType].desc}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdding(false)}>
              إلغاء
            </Button>
            <Button onClick={addNew}>إنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: تحرير القسم */}
      {editing && (
        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent dir="rtl" className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                تحرير: {TYPE_META[editing.data.type].label}
              </DialogTitle>
            </DialogHeader>
            <SectionEditor
              row={editing}
              onChange={(data) => setEditing({ ...editing, data })}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>
                إلغاء
              </Button>
              <Button onClick={() => save(editing)} disabled={savingId === editing.id}>
                {savingId === editing.id ? (
                  <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 ml-1" />
                )}
                حفظ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

/* ============================== المحررات ============================== */

function SectionEditor({ row, onChange }: { row: Row; onChange: (d: CustomData) => void }) {
  const d = row.data;
  const update = (patch: Partial<CustomData>) => onChange({ ...d, ...patch });
  const updateItem = (i: number, patch: any) => {
    const items = [...(d.items ?? [])];
    items[i] = { ...items[i], ...patch };
    update({ items });
  };
  const addItem = (item: any) => update({ items: [...(d.items ?? []), item] });
  const removeItem = (i: number) =>
    update({ items: (d.items ?? []).filter((_, j) => j !== i) });

  return (
    <div className="space-y-4">
      {/* الرأس المشترك */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-md bg-muted/40">
        <FieldL label="العنوان الرئيسي (عربي)">
          <Input value={d.title_ar ?? ""} onChange={(e) => update({ title_ar: e.target.value })} />
        </FieldL>
        <FieldL label="Main title (English)">
          <Input value={d.title_en ?? ""} onChange={(e) => update({ title_en: e.target.value })} dir="ltr" />
        </FieldL>
        <FieldL label="الوصف الفرعي (عربي)">
          <Textarea rows={2} value={d.subtitle_ar ?? ""} onChange={(e) => update({ subtitle_ar: e.target.value })} />
        </FieldL>
        <FieldL label="Subtitle (English)">
          <Textarea rows={2} value={d.subtitle_en ?? ""} onChange={(e) => update({ subtitle_en: e.target.value })} dir="ltr" />
        </FieldL>
      </div>

      {/* المحتوى حسب النوع */}
      {d.type === "timeline" && (
        <ItemsList
          title="المحطّات"
          items={d.items ?? []}
          onAdd={() => addItem({ year: "", title_ar: "", title_en: "", desc_ar: "", desc_en: "" })}
          onRemove={removeItem}
          render={(it, i) => (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <FieldL label="السنة">
                <Input value={it.year ?? ""} onChange={(e) => updateItem(i, { year: e.target.value })} />
              </FieldL>
              <FieldL label="العنوان (AR)">
                <Input value={it.title_ar ?? ""} onChange={(e) => updateItem(i, { title_ar: e.target.value })} />
              </FieldL>
              <FieldL label="Title (EN)">
                <Input value={it.title_en ?? ""} onChange={(e) => updateItem(i, { title_en: e.target.value })} dir="ltr" />
              </FieldL>
              <div className="md:col-span-3 grid md:grid-cols-2 gap-2">
                <FieldL label="الوصف (AR)">
                  <Textarea rows={2} value={it.desc_ar ?? ""} onChange={(e) => updateItem(i, { desc_ar: e.target.value })} />
                </FieldL>
                <FieldL label="Description (EN)">
                  <Textarea rows={2} value={it.desc_en ?? ""} onChange={(e) => updateItem(i, { desc_en: e.target.value })} dir="ltr" />
                </FieldL>
              </div>
            </div>
          )}
        />
      )}

      {d.type === "impact" && (
        <ItemsList
          title="الأرقام"
          items={d.items ?? []}
          onAdd={() => addItem({ value: "", label_ar: "", label_en: "", icon: "Sparkles" })}
          onRemove={removeItem}
          render={(it, i) => (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <FieldL label="الرقم/القيمة">
                <Input value={it.value ?? ""} onChange={(e) => updateItem(i, { value: e.target.value })} />
              </FieldL>
              <FieldL label="التسمية (AR)">
                <Input value={it.label_ar ?? ""} onChange={(e) => updateItem(i, { label_ar: e.target.value })} />
              </FieldL>
              <FieldL label="Label (EN)">
                <Input value={it.label_en ?? ""} onChange={(e) => updateItem(i, { label_en: e.target.value })} dir="ltr" />
              </FieldL>
              <FieldL label="الأيقونة">
                <IconPicker value={it.icon} onChange={(v) => updateItem(i, { icon: v })} />
              </FieldL>
            </div>
          )}
        />
      )}

      {d.type === "testimonials" && (
        <ItemsList
          title="الشهادات"
          items={d.items ?? []}
          onAdd={() => addItem({ name_ar: "", name_en: "", role_ar: "", role_en: "", quote_ar: "", quote_en: "", photo_url: "" })}
          onRemove={removeItem}
          render={(it, i) => (
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <FieldL label="الاسم (AR)">
                  <Input value={it.name_ar ?? ""} onChange={(e) => updateItem(i, { name_ar: e.target.value })} />
                </FieldL>
                <FieldL label="Name (EN)">
                  <Input value={it.name_en ?? ""} onChange={(e) => updateItem(i, { name_en: e.target.value })} dir="ltr" />
                </FieldL>
                <FieldL label="الصفة (AR)">
                  <Input value={it.role_ar ?? ""} onChange={(e) => updateItem(i, { role_ar: e.target.value })} />
                </FieldL>
                <FieldL label="Role (EN)">
                  <Input value={it.role_en ?? ""} onChange={(e) => updateItem(i, { role_en: e.target.value })} dir="ltr" />
                </FieldL>
                <FieldL label="الاقتباس (AR)">
                  <Textarea rows={3} value={it.quote_ar ?? ""} onChange={(e) => updateItem(i, { quote_ar: e.target.value })} />
                </FieldL>
                <FieldL label="Quote (EN)">
                  <Textarea rows={3} value={it.quote_en ?? ""} onChange={(e) => updateItem(i, { quote_en: e.target.value })} dir="ltr" />
                </FieldL>
              </div>
              <MediaUpload
                label="الصورة الشخصية"
                folder="about/testimonials"
                value={it.photo_url ?? null}
                onChange={(url) => updateItem(i, { photo_url: url ?? "" })}
              />
            </div>
          )}
        />
      )}

      {d.type === "accreditations" && (
        <ItemsList
          title="الاعتمادات/الجوائز"
          items={d.items ?? []}
          onAdd={() => addItem({ name_ar: "", name_en: "", year: "", logo_url: "" })}
          onRemove={removeItem}
          render={(it, i) => (
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <FieldL label="الاسم (AR)">
                  <Input value={it.name_ar ?? ""} onChange={(e) => updateItem(i, { name_ar: e.target.value })} />
                </FieldL>
                <FieldL label="Name (EN)">
                  <Input value={it.name_en ?? ""} onChange={(e) => updateItem(i, { name_en: e.target.value })} dir="ltr" />
                </FieldL>
                <FieldL label="السنة">
                  <Input value={it.year ?? ""} onChange={(e) => updateItem(i, { year: e.target.value })} />
                </FieldL>
              </div>
              <MediaUpload
                label="الشعار"
                folder="about/accreditations"
                value={it.logo_url ?? null}
                onChange={(url) => updateItem(i, { logo_url: url ?? "" })}
              />
            </div>
          )}
        />
      )}

      {d.type === "faq" && (
        <ItemsList
          title="الأسئلة"
          items={d.items ?? []}
          onAdd={() => addItem({ q_ar: "", q_en: "", a_ar: "", a_en: "" })}
          onRemove={removeItem}
          render={(it, i) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <FieldL label="السؤال (AR)">
                <Input value={it.q_ar ?? ""} onChange={(e) => updateItem(i, { q_ar: e.target.value })} />
              </FieldL>
              <FieldL label="Question (EN)">
                <Input value={it.q_en ?? ""} onChange={(e) => updateItem(i, { q_en: e.target.value })} dir="ltr" />
              </FieldL>
              <FieldL label="الجواب (AR)">
                <Textarea rows={3} value={it.a_ar ?? ""} onChange={(e) => updateItem(i, { a_ar: e.target.value })} />
              </FieldL>
              <FieldL label="Answer (EN)">
                <Textarea rows={3} value={it.a_en ?? ""} onChange={(e) => updateItem(i, { a_en: e.target.value })} dir="ltr" />
              </FieldL>
            </div>
          )}
        />
      )}

      {d.type === "gallery" && (
        <ItemsList
          title="الصور"
          items={d.items ?? []}
          onAdd={() => addItem({ image_url: "", caption_ar: "", caption_en: "" })}
          onRemove={removeItem}
          render={(it, i) => (
            <div className="space-y-2">
              <MediaUpload
                label="الصورة"
                folder="about/gallery"
                value={it.image_url ?? null}
                onChange={(url) => updateItem(i, { image_url: url ?? "" })}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <FieldL label="تعليق (AR) — اختياري">
                  <Input value={it.caption_ar ?? ""} onChange={(e) => updateItem(i, { caption_ar: e.target.value })} />
                </FieldL>
                <FieldL label="Caption (EN) — optional">
                  <Input value={it.caption_en ?? ""} onChange={(e) => updateItem(i, { caption_en: e.target.value })} dir="ltr" />
                </FieldL>
              </div>
            </div>
          )}
        />
      )}

      {d.type === "assembly_members" && (
        <AssemblyMembersEditor
          data={d as unknown as AssemblyData}
          onChange={(nd) => onChange(nd as unknown as CustomData)}
        />
      )}

      {d.type === "cta" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-md bg-muted/40">
          <FieldL label="نص الزر (AR)">
            <Input value={d.cta_label_ar ?? ""} onChange={(e) => update({ cta_label_ar: e.target.value })} />
          </FieldL>
          <FieldL label="Button label (EN)">
            <Input value={d.cta_label_en ?? ""} onChange={(e) => update({ cta_label_en: e.target.value })} dir="ltr" />
          </FieldL>
          <div className="md:col-span-2">
            <FieldL label="رابط الزر (URL)">
              <Input value={d.cta_url ?? ""} onChange={(e) => update({ cta_url: e.target.value })} dir="ltr" placeholder="/contact or https://…" />
            </FieldL>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldL({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium mb-1 block">{label}</label>
      {children}
    </div>
  );
}

function ItemsList({
  title,
  items,
  onAdd,
  onRemove,
  render,
}: {
  title: string;
  items: any[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  render: (it: any, i: number) => React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{title}</label>
        <Button type="button" size="sm" variant="outline" onClick={onAdd}>
          <Plus className="w-3.5 h-3.5 ml-1" /> إضافة
        </Button>
      </div>
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-3">لا توجد عناصر بعد</p>
      )}
      {items.map((it, i) => (
        <div key={i} className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">عنصر #{i + 1}</span>
            <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onRemove(i)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
          {render(it, i)}
        </div>
      ))}
    </div>
  );
}
