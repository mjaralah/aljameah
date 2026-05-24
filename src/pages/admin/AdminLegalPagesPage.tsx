// لوحة تحرير الصفحات القانونية (الخصوصية، الشروط، إلخ)
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Loader2, Save, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type LegalPage = {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  published: boolean;
  sort_order: number;
};

export default function AdminLegalPagesPage() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("legal_pages")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("slug", { ascending: true });
    if (error) toast.error(error.message);
    setPages((data ?? []) as LegalPage[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function update(id: string, patch: Partial<LegalPage>) {
    setPages((p) => p.map((x) => x.id === id ? { ...x, ...patch } : x));
  }

  async function save(p: LegalPage) {
    setSavingId(p.id);
    const { error } = await supabase.from("legal_pages").update({
      title: p.title, content: p.content, published: p.published,
    }).eq("id", p.id);
    setSavingId(null);
    if (error) toast.error(error.message); else toast.success("تم الحفظ");
  }

  async function togglePublished(p: LegalPage, value: boolean) {
    update(p.id, { published: value });
    const { error } = await supabase.from("legal_pages").update({ published: value }).eq("id", p.id);
    if (error) {
      toast.error(error.message);
      update(p.id, { published: !value });
    } else {
      toast.success(value ? "تم النشر" : "تم الإخفاء");
    }
  }

  async function remove(id: string) {
    const { error } = await supabase.from("legal_pages").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("تم الحذف"); setPages((p) => p.filter((x) => x.id !== id)); }
    setDeleteId(null);
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= pages.length) return;
    const next = [...pages];
    [next[index], next[target]] = [next[target], next[index]];
    const reordered = next.map((p, i) => ({ ...p, sort_order: i }));
    setPages(reordered);
    const updates = await Promise.all(
      reordered.map((p) => supabase.from("legal_pages").update({ sort_order: p.sort_order }).eq("id", p.id))
    );
    if (updates.some((u) => u.error)) toast.error("تعذر حفظ الترتيب");
  }

  return (
    <AdminLayout title="الصفحات القانونية" description="سياسة الخصوصية، شروط الاستخدام، ملفات الارتباط، إمكانية الوصول">
      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          {pages.map((p, idx) => (
            <Card key={p.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <CardTitle className="text-base flex-1">
                  {p.title} <span className="text-xs text-muted-foreground font-normal">/{p.slug}</span>
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" disabled={idx === 0} onClick={() => move(idx, -1)} title="تحريك للأعلى">
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" disabled={idx === pages.length - 1} onClick={() => move(idx, 1)} title="تحريك للأسفل">
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)} title="حذف" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                  <Label htmlFor={`pub-${p.id}`} className="m-0 cursor-pointer flex items-center gap-2">
                    {p.published ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                    {p.published ? "منشورة (مرئية للزوار)" : "مخفية"}
                  </Label>
                  <Switch id={`pub-${p.id}`} checked={p.published} onCheckedChange={(v) => togglePublished(p, v)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">العنوان</label>
                  <Input value={p.title} onChange={(e) => update(p.id, { title: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">المحتوى</label>
                  <RichTextEditor
                    value={p.content ?? ""}
                    onChange={(html) => update(p.id, { content: html })}
                    minHeight={280}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => save(p)} disabled={savingId === p.id} size="sm">
                    {savingId === p.id ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Save className="w-4 h-4 ml-1" />}
                    حفظ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الصفحة؟</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف الصفحة نهائياً ولن يمكن استرجاعها.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && remove(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
