// إدارة الاستبيانات وأسئلتها
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
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
    (q ?? []).forEach((qq: Question) => {
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
    let opts = editQ.options;
    let scl = editQ.scale;
    if (typeof opts === "string") {
      try { opts = JSON.parse(opts as string); } catch { toast.error("صيغة الخيارات غير صحيحة"); return; }
    }
    if (typeof scl === "string") {
      try { scl = JSON.parse(scl as string); } catch { toast.error("صيغة المقياس غير صحيحة"); return; }
    }
    const payload = {
      survey_id: editQ.survey_id, question: editQ.question, type: editQ.type,
      options: opts ?? null, scale: scl ?? null,
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
    <AdminLayout
      title="الاستبيانات"
      description="إدارة الاستبيانات وأسئلتها"
      actions={
        <Button size="sm" onClick={() => setEditing({ status: "active", show_public_results: true, published: true, sort_order: 0 })}>
          <Plus className="w-4 h-4 ml-1" /> استبيان جديد
        </Button>
      }
    >
      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {surveys.map((s) => {
            const open = openId === s.id;
            const qs = questions[s.id] ?? [];
            return (
              <Card key={s.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                      {s.title}
                      <Badge variant={s.status === "active" ? "default" : "secondary"}>
                        {s.status === "active" ? "نشط" : "مغلق"}
                      </Badge>
                      <Badge variant="outline">{qs.length} سؤال</Badge>
                    </CardTitle>
                    {s.description && <p className="text-xs text-muted-foreground mt-1">{s.description}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setOpenId(open ? null : s.id)}>
                      {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(s)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteSurvey(s.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
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
                      <ul className="space-y-2">
                        {qs.map((q) => (
                          <li key={q.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/40 text-sm">
                            <span className="text-muted-foreground tabular-nums w-6">{q.sort_order + 1}.</span>
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
                        ))}
                      </ul>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
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
                <div>
                  <label className="text-sm font-medium">الخيارات (JSON)</label>
                  <Textarea
                    rows={4}
                    className="font-mono text-xs"
                    value={typeof editQ.options === "string" ? editQ.options : JSON.stringify(editQ.options ?? [], null, 2)}
                    onChange={(e) => setEditQ({ ...editQ, options: e.target.value as unknown as Question["options"] })}
                    placeholder='[{"ar":"ذكر","en":"Male"},{"ar":"أنثى","en":"Female"}]'
                  />
                </div>
              )}
              {editQ.type === "likert" && (
                <div>
                  <label className="text-sm font-medium">المقياس (JSON)</label>
                  <Textarea
                    rows={4}
                    className="font-mono text-xs"
                    value={typeof editQ.scale === "string" ? editQ.scale : JSON.stringify(editQ.scale ?? [], null, 2)}
                    onChange={(e) => setEditQ({ ...editQ, scale: e.target.value as unknown as Question["scale"] })}
                    placeholder='[{"ar":"5/5: راضي جداً","en":"Very satisfied"}]'
                  />
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
