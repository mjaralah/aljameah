// لوحة تحرير محتوى صفحة "من نحن" — حقول هيكلية لكل قسم بدون JSON
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Plus, Trash2, Users, ExternalLink, EyeOff, Eye, GripVertical, LayoutList, Image as ImageIcon, IdCard, List, LayoutGrid } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { IconPicker } from "@/components/admin/IconPicker";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { SortableList, SortableItem, persistSortOrder } from "@/components/admin/SortableList";
import { ReorderControls } from "@/components/admin/ReorderControls";
import { moveToPosition, moveRelativeTo } from "@/lib/reorderHelpers";
import CustomSectionsManager from "@/components/admin/about/CustomSectionsManager";
import AssemblyMembersEditor, { defaultAssemblyData } from "@/components/admin/about/AssemblyMembersEditor";
import type { AssemblyData } from "@/lib/assemblyExport";

type AnyData = Record<string, unknown> | null;

type Section = {
  id: string;
  section_key: string;
  title: string | null;
  content: string | null;
  data: AnyData;
  sort_order: number;
  published: boolean;
};

const KEY_LABELS: Record<string, string> = {
  founding: "النشأة والتأسيس",
  vision: "الرؤية",
  mission: "الرسالة والقيم",
  strategic: "الأهداف الاستراتيجية",
  operational: "الأهداف التشغيلية",
  ceo: "المدير التنفيذي",
  assembly: "الجمعية العمومية",
  board: "أعضاء مجلس الإدارة",
  structure: "الهيكل التنظيمي",
  registration: "شهادة التسجيل",
};

// مكوّن صف قابل للحذف لإطار موحّد
const RowFrame = ({ children, onRemove, index }: { children: React.ReactNode; onRemove: () => void; index: number }) => (
  <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2 relative">
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground font-medium">عنصر #{index + 1}</span>
      <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={onRemove}>
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
    {children}
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs font-medium mb-1 block">{label}</label>
    {children}
  </div>
);

const ModeToggle = ({ value, onChange }: { value: "content" | "image"; onChange: (v: "content" | "image") => void }) => (
  <div className="inline-flex items-center gap-1.5 p-1.5 rounded-xl bg-muted/70 border-2 border-border shadow-sm">
    {([
      { v: "content", label: "محتوى منظم", icon: LayoutList },
      { v: "image", label: "صورة مضمّنة", icon: ImageIcon },
    ] as const).map((opt) => {
      const Icon = opt.icon;
      const active = value === opt.v;
      return (
        <button
          key={opt.v}
          type="button"
          onClick={() => onChange(opt.v)}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all ${
            active
              ? "bg-primary text-primary-foreground shadow-md font-bold ring-2 ring-primary/30"
              : "text-muted-foreground hover:text-foreground hover:bg-background/60 font-medium"
          }`}
        >
          <Icon className="w-4 h-4" />
          {opt.label}
        </button>
      );
    })}
  </div>
);

export default function AdminAboutPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("about_content").select("*").order("sort_order");
    if (error) toast.error(error.message);
    // استبعاد الأقسام المخصّصة — تُدار في CustomSectionsManager
    setSections(((data ?? []) as Section[]).filter((s) => !s.section_key.startsWith("custom:")));
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function update(id: string, patch: Partial<Section>) {
    setSections((s) => s.map((x) => x.id === id ? { ...x, ...patch } : x));
  }
  function updateData(id: string, key: string, value: unknown) {
    setSections((s) => s.map((x) => {
      if (x.id !== id) return x;
      const base = (x.data && typeof x.data === "object" ? x.data : {}) as Record<string, unknown>;
      return { ...x, data: { ...base, [key]: value } };
    }));
  }

  async function save(s: Section) {
    setSavingId(s.id);
    const { error } = await supabase.from("about_content").update({
      title: s.title, content: s.content,
      data: s.data as never,
      published: s.published,
    }).eq("id", s.id);
    setSavingId(null);
    if (error) toast.error(error.message);
    else { toast.success("تم الحفظ"); load(); }
  }

  async function togglePublished(s: Section) {
    const { error } = await supabase.from("about_content")
      .update({ published: !s.published }).eq("id", s.id);
    if (error) toast.error(error.message);
    else { toast.success(!s.published ? "تم الإظهار" : "تم الإخفاء"); load(); }
  }

  async function remove(s: Section) {
    if (!confirm(`حذف القسم "${KEY_LABELS[s.section_key] ?? s.section_key}" نهائياً؟`)) return;
    const { error } = await supabase.from("about_content").delete().eq("id", s.id);
    if (error) toast.error(error.message);
    else { toast.success("تم الحذف"); load(); }
  }

  // عناصر التحرير الهيكلية حسب نوع القسم
  function renderStructured(s: Section) {
    const data = (s.data && typeof s.data === "object" ? s.data : {}) as Record<string, unknown>;

    switch (s.section_key) {
      case "founding": {
        const stats = (Array.isArray(data.stats) ? data.stats : []) as { label?: string; value?: string }[];
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">الإحصائيات</label>
              <Button type="button" size="sm" variant="outline"
                onClick={() => updateData(s.id, "stats", [...stats, { label: "", value: "" }])}>
                <Plus className="w-3.5 h-3.5 ml-1" /> إضافة إحصائية
              </Button>
            </div>
            {stats.map((it, i) => (
              <RowFrame key={i} index={i}
                onRemove={() => updateData(s.id, "stats", stats.filter((_, j) => j !== i))}>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="التسمية">
                    <Input value={it.label ?? ""}
                      onChange={(e) => updateData(s.id, "stats", stats.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                  </Field>
                  <Field label="القيمة">
                    <Input value={it.value ?? ""}
                      onChange={(e) => updateData(s.id, "stats", stats.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} />
                  </Field>
                </div>
              </RowFrame>
            ))}
          </div>
        );
      }
      case "mission": {
        const values = (Array.isArray(data.values) ? data.values : []) as { title?: string; desc?: string; icon?: string }[];
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">القيم</label>
              <Button type="button" size="sm" variant="outline"
                onClick={() => updateData(s.id, "values", [...values, { title: "", desc: "", icon: "Heart" }])}>
                <Plus className="w-3.5 h-3.5 ml-1" /> إضافة قيمة
              </Button>
            </div>
            {values.map((it, i) => (
              <RowFrame key={i} index={i}
                onRemove={() => updateData(s.id, "values", values.filter((_, j) => j !== i))}>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="العنوان">
                    <Input value={it.title ?? ""}
                      onChange={(e) => updateData(s.id, "values", values.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
                  </Field>
                  <Field label="الأيقونة (اختياري)">
                    <IconPicker
                      value={it.icon}
                      onChange={(name) => updateData(s.id, "values", values.map((x, j) => j === i ? { ...x, icon: name } : x))}
                    />
                  </Field>
                </div>
                <Field label="الوصف">
                  <Textarea rows={2} value={it.desc ?? ""}
                    onChange={(e) => updateData(s.id, "values", values.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} />
                </Field>
              </RowFrame>
            ))}
          </div>
        );
      }
      case "strategic": {
        const goals = (Array.isArray(data.goals) ? data.goals : []) as { title?: string; desc?: string }[];
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">الأهداف</label>
              <Button type="button" size="sm" variant="outline"
                onClick={() => updateData(s.id, "goals", [...goals, { title: "", desc: "" }])}>
                <Plus className="w-3.5 h-3.5 ml-1" /> إضافة هدف
              </Button>
            </div>
            {goals.map((it, i) => (
              <RowFrame key={i} index={i}
                onRemove={() => updateData(s.id, "goals", goals.filter((_, j) => j !== i))}>
                <Field label="العنوان">
                  <Input value={it.title ?? ""}
                    onChange={(e) => updateData(s.id, "goals", goals.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
                </Field>
                <Field label="الوصف">
                  <Textarea rows={2} value={it.desc ?? ""}
                    onChange={(e) => updateData(s.id, "goals", goals.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} />
                </Field>
              </RowFrame>
            ))}
          </div>
        );
      }
      case "operational": {
        const items = (Array.isArray(data.items) ? data.items : []) as string[];
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">قائمة الأهداف التشغيلية</label>
              <Button type="button" size="sm" variant="outline"
                onClick={() => updateData(s.id, "items", [...items, ""])}>
                <Plus className="w-3.5 h-3.5 ml-1" /> إضافة بند
              </Button>
            </div>
            {items.map((it, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-xs text-muted-foreground tabular-nums pt-2 w-6">{i + 1}.</span>
                <Textarea rows={2} className="flex-1" value={it}
                  onChange={(e) => updateData(s.id, "items", items.map((x, j) => j === i ? e.target.value : x))} />
                <Button type="button" size="icon" variant="ghost" className="h-9 w-9 text-destructive"
                  onClick={() => updateData(s.id, "items", items.filter((_, j) => j !== i))}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        );
      }
      case "ceo": {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="الاسم">
              <Input value={(data.name as string) ?? ""}
                onChange={(e) => updateData(s.id, "name", e.target.value)} />
            </Field>
            <Field label="المسمى الوظيفي">
              <Input value={(data.title as string) ?? ""}
                onChange={(e) => updateData(s.id, "title", e.target.value)} />
            </Field>
            <div className="md:col-span-2">
              <MediaUpload
                label="الصورة الشخصية (اختياري)"
                folder="about/ceo"
                value={(data.photo_url as string) ?? null}
                onChange={(url) => updateData(s.id, "photo_url", url)}
              />
            </div>
          </div>
        );
      }
      case "assembly": {
        const rawView = data.view_mode as string;
        const view: "cards" | "members" | "both" =
          rawView === "members" ? "members" : rawView === "both" ? "both" : "cards";
        const cards = (Array.isArray(data.cards) ? data.cards : []) as { title?: string; body?: string }[];
        const membersData: AssemblyData = (data.assembly && typeof data.assembly === "object")
          ? (data.assembly as AssemblyData)
          : defaultAssemblyData();

        const CardsEditor = (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">البطاقات التعريفية</label>
              <Button type="button" size="sm" variant="outline"
                onClick={() => updateData(s.id, "cards", [...cards, { title: "", body: "" }])}>
                <Plus className="w-3.5 h-3.5 ml-1" /> إضافة بطاقة
              </Button>
            </div>
            {cards.map((it, i) => (
              <RowFrame key={i} index={i}
                onRemove={() => updateData(s.id, "cards", cards.filter((_, j) => j !== i))}>
                <Field label="العنوان">
                  <Input value={it.title ?? ""}
                    onChange={(e) => updateData(s.id, "cards", cards.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
                </Field>
                <Field label="النص">
                  <Textarea rows={3} value={it.body ?? ""}
                    onChange={(e) => updateData(s.id, "cards", cards.map((x, j) => j === i ? { ...x, body: e.target.value } : x))} />
                </Field>
              </RowFrame>
            ))}
          </div>
        );

        const MembersEditor = (
          <AssemblyMembersEditor
            data={membersData}
            onChange={(d) => updateData(s.id, "assembly", d as unknown as AnyData)}
          />
        );

        return (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-xl bg-muted/70 border-2 border-border shadow-sm">
              {([
                { v: "cards", label: "بطاقات تعريفية", icon: IdCard },
                { v: "members", label: "قائمة الأعضاء", icon: List },
                { v: "both", label: "البطاقات + القائمة", icon: LayoutGrid },
              ] as const).map((opt) => {
                const Icon = opt.icon;
                const active = view === opt.v;
                return (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => updateData(s.id, "view_mode", opt.v)}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all ${
                      active
                        ? "bg-primary text-primary-foreground shadow-md font-bold ring-2 ring-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/60 font-medium"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {view === "cards" && CardsEditor}
            {view === "members" && MembersEditor}
            {view === "both" && (
              <div className="space-y-6">
                <div className="rounded-lg border bg-card p-4">
                  <div className="text-xs font-semibold text-muted-foreground mb-3">القسم الأول — البطاقات التعريفية</div>
                  {CardsEditor}
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="text-xs font-semibold text-muted-foreground mb-3">القسم الثاني — قائمة الأعضاء</div>
                  {MembersEditor}
                </div>
              </div>
            )}
          </div>
        );
      }
      case "structure": {
        const mode = (data.display_mode as string) === "image" ? "image" : "content";
        const nodes = (Array.isArray(data.nodes) ? data.nodes : []) as { title?: string; subtitle?: string }[];
        const departments = (Array.isArray(data.departments) ? data.departments : []) as { title?: string; desc?: string }[];
        return (
          <div className="space-y-4">
            <ModeToggle value={mode} onChange={(v) => updateData(s.id, "display_mode", v)} />
            {mode === "image" ? (
              <MediaUpload
                label="صورة الهيكل التنظيمي (PNG / JPG / WEBP)"
                folder="about/structure"
                accept="image/png,image/jpeg,image/webp"
                value={(data.image_url as string) ?? null}
                onChange={(url) => updateData(s.id, "image_url", url ?? "")}
              />
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">العُقد الهرمية (من الأعلى للأسفل)</label>
                    <Button type="button" size="sm" variant="outline"
                      onClick={() => updateData(s.id, "nodes", [...nodes, { title: "", subtitle: "" }])}>
                      <Plus className="w-3.5 h-3.5 ml-1" /> إضافة عقدة
                    </Button>
                  </div>
                  {nodes.map((it, i) => (
                    <RowFrame key={i} index={i}
                      onRemove={() => updateData(s.id, "nodes", nodes.filter((_, j) => j !== i))}>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="العنوان">
                          <Input value={it.title ?? ""}
                            onChange={(e) => updateData(s.id, "nodes", nodes.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
                        </Field>
                        <Field label="الوصف الفرعي">
                          <Input value={it.subtitle ?? ""}
                            onChange={(e) => updateData(s.id, "nodes", nodes.map((x, j) => j === i ? { ...x, subtitle: e.target.value } : x))} />
                        </Field>
                      </div>
                    </RowFrame>
                  ))}
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">الإدارات</label>
                    <Button type="button" size="sm" variant="outline"
                      onClick={() => updateData(s.id, "departments", [...departments, { title: "", desc: "" }])}>
                      <Plus className="w-3.5 h-3.5 ml-1" /> إضافة إدارة
                    </Button>
                  </div>
                  {departments.map((it, i) => (
                    <RowFrame key={i} index={i}
                      onRemove={() => updateData(s.id, "departments", departments.filter((_, j) => j !== i))}>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="اسم الإدارة">
                          <Input value={it.title ?? ""}
                            onChange={(e) => updateData(s.id, "departments", departments.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
                        </Field>
                        <Field label="الوصف">
                          <Input value={it.desc ?? ""}
                            onChange={(e) => updateData(s.id, "departments", departments.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} />
                        </Field>
                      </div>
                    </RowFrame>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      }
      case "registration": {
        const mode = (data.display_mode as string) === "image" ? "image" : "content";
        const rows = (Array.isArray(data.rows) ? data.rows : []) as { label?: string; value?: string }[];
        return (
          <div className="space-y-3">
            <ModeToggle value={mode} onChange={(v) => updateData(s.id, "display_mode", v)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="نص الشارة">
                <Input value={(data.badge_label as string) ?? ""}
                  onChange={(e) => updateData(s.id, "badge_label", e.target.value)} />
              </Field>
              <Field label="العنوان الرئيسي">
                <Input value={(data.heading as string) ?? ""}
                  onChange={(e) => updateData(s.id, "heading", e.target.value)} />
              </Field>
            </div>
            <MediaUpload
              label="ملف الشهادة (PDF) — اختياري"
              folder="about/registration"
              value={(data.pdf_url as string) ?? null}
              onChange={(url) => updateData(s.id, "pdf_url", url ?? "")}
            />
            {mode === "image" ? (
              <MediaUpload
                label="صورة الشهادة (PNG / JPG / WEBP)"
                folder="about/registration"
                accept="image/png,image/jpeg,image/webp"
                value={(data.image_url as string) ?? null}
                onChange={(url) => updateData(s.id, "image_url", url ?? "")}
              />
            ) : (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">بيانات الشهادة</label>
                  <Button type="button" size="sm" variant="outline"
                    onClick={() => updateData(s.id, "rows", [...rows, { label: "", value: "" }])}>
                    <Plus className="w-3.5 h-3.5 ml-1" /> إضافة صف
                  </Button>
                </div>
                {rows.map((it, i) => (
                  <RowFrame key={i} index={i}
                    onRemove={() => updateData(s.id, "rows", rows.filter((_, j) => j !== i))}>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="التسمية">
                        <Input value={it.label ?? ""}
                          onChange={(e) => updateData(s.id, "rows", rows.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                      </Field>
                      <Field label="القيمة">
                        <Input value={it.value ?? ""}
                          onChange={(e) => updateData(s.id, "rows", rows.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} />
                      </Field>
                    </div>
                  </RowFrame>
                ))}
              </div>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  }

  async function handleReorder(newIds: string[]) {
    // optimistic reorder
    setSections((prev) => {
      const map = new Map(prev.map((x) => [x.id, x]));
      return newIds.map((id, i) => ({ ...(map.get(id) as Section), sort_order: (i + 1) * 10 }));
    });
    await persistSortOrder(supabase, "about_content", newIds);
  }

  return (
    <AdminLayout title="محتوى صفحة من نحن" description="عدّل نصوص الرؤية والرسالة والأهداف وغيرها">
      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="space-y-6" dir="rtl">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">إدارة أعضاء مجلس الإدارة</p>
                  <p className="text-xs text-muted-foreground">إضافة وتعديل وحذف الأعضاء الظاهرين في تبويب "أعضاء مجلس الإدارة"</p>
                </div>
              </div>
              <Button asChild size="sm">
                <Link to="/admin/board">
                  فتح
                  <ExternalLink className="h-4 w-4 mr-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <CustomSectionsManager />

          <p className="text-xs text-muted-foreground">اسحب البطاقات من المقبض لإعادة ترتيب الأقسام في صفحة "من نحن".</p>
          <SortableList ids={sections.map((s) => s.id)} onReorder={handleReorder}>
            {sections.map((s, idx) => {
              const sectionIds = sections.map((x) => x.id);
              const apply = (n: string[] | null) => { if (n) handleReorder(n); };
              return (
              <SortableItem key={s.id} id={s.id}>
                {({ handleProps, setNodeRef, style }) => (
                  <div ref={setNodeRef} style={style}>
                    <Card className={!s.published ? "opacity-70 border-dashed" : undefined}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between gap-2 flex-wrap">
                          <span className="flex items-center gap-2">
                            <button
                              type="button"
                              {...handleProps}
                              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 -m-1"
                              title="اسحب لإعادة الترتيب"
                              aria-label="مقبض السحب"
                            >
                              <GripVertical className="w-4 h-4" />
                            </button>
                            <span>
                              {KEY_LABELS[s.section_key] ?? s.section_key}
                              <span className="text-xs text-muted-foreground font-normal mr-2">({s.section_key})</span>
                              {!s.published && <span className="text-[10px] mr-2 px-2 py-0.5 rounded bg-muted">مخفي</span>}
                            </span>
                          </span>
                          <div className="flex items-center gap-1">
                            {sections.length > 1 && (
                              <ReorderControls
                                position={idx + 1}
                                total={sections.length}
                                others={sections.filter((x) => x.id !== s.id).map((x) => ({ id: x.id, label: KEY_LABELS[x.section_key] ?? x.section_key }))}
                                onMoveUp={() => apply(moveToPosition(sectionIds, s.id, idx))}
                                onMoveDown={() => apply(moveToPosition(sectionIds, s.id, idx + 2))}
                                onSetPosition={(pos) => apply(moveToPosition(sectionIds, s.id, pos))}
                                onMoveToStart={() => apply(moveToPosition(sectionIds, s.id, 1))}
                                onMoveToEnd={() => apply(moveToPosition(sectionIds, s.id, sections.length))}
                                onMoveRelative={(t, w) => apply(moveRelativeTo(sectionIds, s.id, t, w))}
                              />
                            )}
                            <Button type="button" size="sm" variant="ghost" onClick={() => togglePublished(s)} title={s.published ? "إخفاء" : "إظهار"}>
                              {s.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button type="button" size="sm" variant="ghost" className="text-destructive" onClick={() => remove(s)} title="حذف">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Field label="العنوان">
                          <Input value={s.title ?? ""} onChange={(e) => update(s.id, { title: e.target.value })} />
                        </Field>
                        <Field label="النص">
                          <Textarea rows={5} value={s.content ?? ""} onChange={(e) => update(s.id, { content: e.target.value })} />
                        </Field>
                        {s.data !== null && renderStructured(s)}
                        <div className="flex justify-between items-center pt-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={s.published}
                              onChange={(e) => update(s.id, { published: e.target.checked })} />
                            منشور
                          </label>
                          <Button onClick={() => save(s)} disabled={savingId === s.id} size="sm">
                            {savingId === s.id ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Save className="w-4 h-4 ml-1" />}
                            حفظ القسم
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </SortableItem>
              );
            })}
          </SortableList>
        </div>
      )}
    </AdminLayout>
  );
}
