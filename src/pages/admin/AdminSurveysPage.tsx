// إدارة الاستبيانات وأسئلتها
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, ChevronDown, ChevronUp, GripVertical, ClipboardList } from "lucide-react";
import { SortableList, SortableItem, persistSortOrder } from "@/components/admin/SortableList";
import { AdminListRow } from "@/components/admin/AdminListRow";
import { ReorderControls } from "@/components/admin/ReorderControls";
import { moveToPosition, moveRelativeTo } from "@/lib/reorderHelpers";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { Button as BtnIcon } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Survey = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
  ends_at: string | null;
  participants: number;
  show_public_results: boolean;
  published: boolean;
  sort_order: number;
};

type Question = {
  id: string;
  survey_id: string;
  question: string;
  type: string;
  options: { ar?: string; en?: string }[] | null;
  scale: { ar?: string; en?: string }[] | null;
  required: boolean;
  sort_order: number;
};

const QTYPES = [
  { value: "text", label: "نص" },
  { value: "rating", label: "تقييم 1-5" },
  { value: "single", label: "اختيار واحد" },
  { value: "single_choice", label: "اختيار واحد (مرادف)" },
  { value: "multiple", label: "اختيار متعدد" },
  { value: "dropdown", label: "قائمة منسدلة" },
  { value: "likert", label: "مقياس ليكرت" },
];

export default function AdminSurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [questions, setQuestions] = useState<Record<string, Question[]>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Survey> | null>(null);
  const [editQ, setEditQ] = useState<Partial<Question> | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: s }, { data: q }] = await Promise.all([
      supabase.from("surveys").select("*").order("sort_order"),
      supabase.from("survey_questions").select("*").order("sort_order"),
    ]);
    setSurveys((s ?? []) as Survey[]);
    const grouped: Record<string, Question[]> = {};
    ((q ?? []) as unknown as Question[]).forEach((qq) => {
      grouped[qq.survey_id] = grouped[qq.survey_id] ?? [];
      grouped[qq.survey_id].push(qq);
    });
    setQuestions(grouped);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function saveSurvey() {
    if (!editing?.title || !editing.slug) { toast.error("العنوان والمعرّف مطلوبان"); return; }
    const payload = {
      slug: editing.slug, title: editing.title, description: editing.description ?? null,
      status: editing.status ?? "active", ends_at: editing.ends_at ?? null,
      show_public_results: editing.show_public_results ?? true,
      published: editing.published ?? true, sort_order: editing.sort_order ?? 0,
    };
    const { error } = editing.id
      ? await supabase.from("surveys").update(payload).eq("id", editing.id)
      : await supabase.from("surveys").insert(payload);
    if (error) toast.error(error.message); else { toast.success("تم الحفظ"); setEditing(null); load(); }
  }

  async function deleteSurvey(id: string) {
    if (!confirm("هل تريد حذف الاستبيان وجميع أسئلته؟")) return;
    const { error } = await supabase.from("surveys").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("تم الحذف"); load(); }
  }

  async function saveQuestion() {
    if (!editQ?.question || !editQ.type || !editQ.survey_id) { toast.error("الحقول مطلوبة"); return; }
    const opts = Array.isArray(editQ.options) ? editQ.options.filter((o) => (o.ar ?? "").trim() || (o.en ?? "").trim()) : null;
    const scl = Array.isArray(editQ.scale) ? editQ.scale.filter((o) => (o.ar ?? "").trim() || (o.en ?? "").trim()) : null;
    const needsOptions = ["single", "single_choice", "multiple", "dropdown"].includes(editQ.type);
    if (needsOptions && (!opts || opts.length === 0)) { toast.error("أضف خياراً واحداً على الأقل"); return; }
    if (editQ.type === "likert" && (!scl || scl.length === 0)) { toast.error("أضف عنصراً واحداً على الأقل في المقياس"); return; }
    const payload = {
      survey_id: editQ.survey_id, question: editQ.question, type: editQ.type,
      options: opts && opts.length ? opts : null,
      scale: scl && scl.length ? scl : null,
      required: editQ.required ?? false, sort_order: editQ.sort_order ?? 0,
    };
    const { error } = editQ.id
      ? await supabase.from("survey_questions").update(payload).eq("id", editQ.id)
      : await supabase.from("survey_questions").insert(payload);
    if (error) toast.error(error.message); else { toast.success("تم الحفظ"); setEditQ(null); load(); }
  }

  async function deleteQuestion(id: string) {
    if (!confirm("حذف السؤال؟")) return;
    const { error } = await supabase.from("survey_questions").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("تم"); load(); }
  }

  return (
    <AdminLayout title="الاستبيانات">
      <AdminPageHeader
        title="الاستبيانات"
        description="إدارة الاستبيانات وأسئلتها"
        icon={ClipboardList}
        action={
          <Button onClick={() => setEditing({ status: "active", show_public_results: true, published: true, sort_order: 0 })}>
            <Plus className="w-4 h-4 ml-1" /> استبيان جديد
          </Button>
        }
      />

      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : surveys.length === 0 ? (
        <AdminEmptyState
          icon={ClipboardList}
          title="لا توجد استبيانات بعد"
          description="ابدأ بإنشاء استبيانك الأول لجمع آراء المستفيدين."
          actionLabel="استبيان جديد"
          onAction={() => setEditing({ status: "active", show_public_results: true, published: true, sort_order: 0 })}
        />
      ) : (
        <div className="space-y-4">
          {surveys.length > 1 && (
            <p className="text-xs text-muted-foreground">اسحب أيقونة <GripVertical className="inline w-3 h-3" /> لإعادة ترتيب الاستبيانات والأسئلة.</p>
          )}
          <SortableList
            ids={surveys.map((s) => s.id)}
            onReorder={reorderSurveys}
          >
            {surveys.map((s, sIdx) => {
              const open = openId === s.id;
              const qs = questions[s.id] ?? [];
              const surveyIds = surveys.map((x) => x.id);
              const applySurveyMove = (next: string[] | null) => { if (next) reorderSurveys(next); };
              return (
                <SortableItem key={s.id} id={s.id}>
                  {({ handleProps, setNodeRef, style }) => (
                    <AdminListRow
                      ref={setNodeRef as any}
                      style={style}
                      id={s.id}
                      table="surveys"
                      dragHandleProps={handleProps}
                      title={s.title}
                      subtitle={s.description ?? undefined}
                      badges={
                        <>
                          <Badge variant={s.status === "active" ? "default" : "secondary"}>
                            {s.status === "active" ? "نشط" : "مغلق"}
                          </Badge>
                          <Badge variant="outline">{qs.length} سؤال</Badge>
                        </>
                      }
                      published={s.published}
                      onTogglePublished={load}
                      onEdit={() => setEditing(s)}
                      onDelete={() => deleteSurvey(s.id)}
                      reorderControls={surveys.length > 1 ? (
                        <ReorderControls
                          position={sIdx + 1}
                          total={surveys.length}
                          others={surveys.filter((x) => x.id !== s.id).map((x) => ({ id: x.id, label: x.title }))}
                          onMoveUp={() => applySurveyMove(moveToPosition(surveyIds, s.id, sIdx))}
                          onMoveDown={() => applySurveyMove(moveToPosition(surveyIds, s.id, sIdx + 2))}
                          onSetPosition={(pos) => applySurveyMove(moveToPosition(surveyIds, s.id, pos))}
                          onMoveToStart={() => applySurveyMove(moveToPosition(surveyIds, s.id, 1))}
                          onMoveToEnd={() => applySurveyMove(moveToPosition(surveyIds, s.id, surveys.length))}
                          onMoveRelative={(t, w) => applySurveyMove(moveRelativeTo(surveyIds, s.id, t, w))}
                        />
                      ) : undefined}
                      extraActions={
                        <BtnIcon
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-9 w-9 border-border bg-muted/40"
                          onClick={() => setOpenId(open ? null : s.id)}
                          aria-label="عرض الأسئلة"
                        >
                          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </BtnIcon>
                      }
                    >
                      {open && (
                        <CardContent className="border-t pt-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-semibold">الأسئلة</h4>
                            <Button size="sm" variant="outline" onClick={() => setEditQ({ survey_id: s.id, type: "text", required: false, sort_order: qs.length })}>
                              <Plus className="w-3 h-3 ml-1" /> سؤال
                            </Button>
                          </div>
                          {qs.length === 0 ? (
                            <p className="text-xs text-muted-foreground">لا توجد أسئلة بعد.</p>
                          ) : (
                            <SortableList
                              ids={qs.map((q) => q.id)}
                              onReorder={async (newIds) => {
                                const reordered = newIds.map((id) => qs.find((q) => q.id === id)!);
                                setQuestions((prev) => ({ ...prev, [s.id]: reordered }));
                                try { await persistSortOrder(supabase, "survey_questions", newIds); toast.success("تم تحديث الترتيب"); }
                                catch { toast.error("تعذر حفظ الترتيب"); load(); }
                              }}
                            >
                              <ul className="space-y-2">
                                {qs.map((q, idx) => (
                                  <SortableItem key={q.id} id={q.id}>
                                    {({ handleProps, setNodeRef, style }) => (
                                      <li ref={setNodeRef as any} style={style} className="flex items-start gap-2 p-2 rounded-md bg-muted/40 text-sm">
                                        <button type="button" {...handleProps}
                                          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 touch-none"
                                          aria-label="سحب">
                                          <GripVertical className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="text-muted-foreground tabular-nums w-6">{idx + 1}.</span>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium">{q.question}</p>
                                          <p className="text-xs text-muted-foreground">{QTYPES.find((t) => t.value === q.type)?.label ?? q.type}{q.required ? " · مطلوب" : ""}</p>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditQ(q)}>
                                          <Pencil className="w-3 h-3" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteQuestion(q.id)}>
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </li>
                                    )}
                                  </SortableItem>
                                ))}
                              </ul>
                            </SortableList>
                          )}
                        </CardContent>
                      )}
                    </AdminListRow>
                  )}
                </SortableItem>
              );
            })}
          </SortableList>
        </div>
      )}

      {/* Survey dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent dir="rtl" className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "تعديل استبيان" : "استبيان جديد"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">العنوان</label>
                <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">المعرّف (slug)</label>
                <Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="employee_satisfaction" />
              </div>
              <div>
                <label className="text-sm font-medium">الوصف</label>
                <Textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">الحالة</label>
                  <Select value={editing.status ?? "active"} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="closed">مغلق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">تاريخ الانتهاء</label>
                  <Input type="date" value={editing.ends_at ?? ""} onChange={(e) => setEditing({ ...editing, ends_at: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">إظهار النتائج للعموم</label>
                <Switch checked={editing.show_public_results ?? true} onCheckedChange={(v) => setEditing({ ...editing, show_public_results: v })} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">منشور</label>
                <Switch checked={editing.published ?? true} onCheckedChange={(v) => setEditing({ ...editing, published: v })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>إلغاء</Button>
            <Button onClick={saveSurvey}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question dialog */}
      <Dialog open={!!editQ} onOpenChange={(o) => !o && setEditQ(null)}>
        <DialogContent dir="rtl" className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editQ?.id ? "تعديل سؤال" : "سؤال جديد"}</DialogTitle>
          </DialogHeader>
          {editQ && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">نص السؤال</label>
                <Textarea rows={2} value={editQ.question ?? ""} onChange={(e) => setEditQ({ ...editQ, question: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">النوع</label>
                <Select value={editQ.type ?? "text"} onValueChange={(v) => setEditQ({ ...editQ, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {QTYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {(editQ.type === "single" || editQ.type === "single_choice" || editQ.type === "multiple" || editQ.type === "dropdown") && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">الخيارات</label>
                    <Button type="button" size="sm" variant="outline"
                      onClick={() => {
                        const arr = Array.isArray(editQ.options) ? editQ.options : [];
                        setEditQ({ ...editQ, options: [...arr, { ar: "", en: "" }] });
                      }}>
                      <Plus className="w-3.5 h-3.5 ml-1" /> إضافة خيار
                    </Button>
                  </div>
                  {(Array.isArray(editQ.options) ? editQ.options : []).map((op, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="text-xs text-muted-foreground tabular-nums w-6">{i + 1}.</span>
                      <Input placeholder="بالعربية" value={op.ar ?? ""}
                        onChange={(e) => {
                          const arr = [...(editQ.options as { ar?: string; en?: string }[])];
                          arr[i] = { ...arr[i], ar: e.target.value };
                          setEditQ({ ...editQ, options: arr });
                        }} />
                      <Input placeholder="English (optional)" value={op.en ?? ""}
                        onChange={(e) => {
                          const arr = [...(editQ.options as { ar?: string; en?: string }[])];
                          arr[i] = { ...arr[i], en: e.target.value };
                          setEditQ({ ...editQ, options: arr });
                        }} />
                      <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive"
                        onClick={() => {
                          const arr = (editQ.options as { ar?: string; en?: string }[]).filter((_, j) => j !== i);
                          setEditQ({ ...editQ, options: arr });
                        }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {editQ.type === "likert" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">مقياس ليكرت (من الأقل إلى الأعلى)</label>
                    <Button type="button" size="sm" variant="outline"
                      onClick={() => {
                        const arr = Array.isArray(editQ.scale) ? editQ.scale : [];
                        setEditQ({ ...editQ, scale: [...arr, { ar: "", en: "" }] });
                      }}>
                      <Plus className="w-3.5 h-3.5 ml-1" /> إضافة عنصر
                    </Button>
                  </div>
                  {(Array.isArray(editQ.scale) ? editQ.scale : []).map((op, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="text-xs text-muted-foreground tabular-nums w-6">{i + 1}.</span>
                      <Input placeholder="مثال: راضٍ جداً" value={op.ar ?? ""}
                        onChange={(e) => {
                          const arr = [...(editQ.scale as { ar?: string; en?: string }[])];
                          arr[i] = { ...arr[i], ar: e.target.value };
                          setEditQ({ ...editQ, scale: arr });
                        }} />
                      <Input placeholder="Very satisfied (optional)" value={op.en ?? ""}
                        onChange={(e) => {
                          const arr = [...(editQ.scale as { ar?: string; en?: string }[])];
                          arr[i] = { ...arr[i], en: e.target.value };
                          setEditQ({ ...editQ, scale: arr });
                        }} />
                      <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive"
                        onClick={() => {
                          const arr = (editQ.scale as { ar?: string; en?: string }[]).filter((_, j) => j !== i);
                          setEditQ({ ...editQ, scale: arr });
                        }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">ترتيب</label>
                  <Input type="number" value={editQ.sort_order ?? 0} onChange={(e) => setEditQ({ ...editQ, sort_order: Number(e.target.value) })} />
                </div>
                <div className="flex items-center justify-between pt-6">
                  <label className="text-sm font-medium">مطلوب</label>
                  <Switch checked={editQ.required ?? false} onCheckedChange={(v) => setEditQ({ ...editQ, required: v })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditQ(null)}>إلغاء</Button>
            <Button onClick={saveQuestion}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
