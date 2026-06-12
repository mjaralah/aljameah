import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Edit, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { HELP_CATEGORIES } from "@/data/seedHelpArticles";
import { MediaUpload } from "@/components/admin/MediaUpload";

type Article = {
  id: string;
  category: string;
  title: string;
  keywords: string[];
  content: string;
  media_url: string | null;
  action_label: string | null;
  action_url: string | null;
  sort_order: number;
  is_published: boolean;
};

const empty = (): Partial<Article> => ({
  category: "dashboard",
  title: "",
  keywords: [],
  content: "",
  media_url: null,
  action_label: "",
  action_url: "",
  sort_order: 0,
  is_published: true,
});

export default function AdminHelpCenterPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Article> | null>(null);
  const [filterCat, setFilterCat] = useState<string>("all");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("help_articles")
      .select("*")
      .order("category")
      .order("sort_order");
    if (error) toast.error("تعذّر تحميل المواضيع");
    else setArticles((data as Article[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.title?.trim() || !editing.content?.trim()) {
      toast.error("العنوان والمحتوى مطلوبان");
      return;
    }
    setSaving(true);
    const payload = {
      category: editing.category!,
      title: editing.title!.trim(),
      keywords: editing.keywords ?? [],
      content: editing.content!.trim(),
      media_url: editing.media_url || null,
      action_label: editing.action_label || null,
      action_url: editing.action_url || null,
      sort_order: editing.sort_order ?? 0,
      is_published: editing.is_published ?? true,
    };
    const res = editing.id
      ? await supabase.from("help_articles").update(payload).eq("id", editing.id)
      : await supabase.from("help_articles").insert(payload);
    setSaving(false);
    if (res.error) toast.error("فشل الحفظ: " + res.error.message);
    else {
      toast.success("تم الحفظ");
      setEditing(null);
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذا الموضوع؟")) return;
    const { error } = await supabase.from("help_articles").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("تم الحذف");
      load();
    }
  };

  const togglePublish = async (a: Article) => {
    const { error } = await supabase
      .from("help_articles")
      .update({ is_published: !a.is_published })
      .eq("id", a.id);
    if (error) toast.error(error.message);
    else load();
  };

  const filtered = filterCat === "all" ? articles : articles.filter((a) => a.category === filterCat);

  return (
    <AdminLayout
      title="مركز المساعدة (محتوى المساعد الذكي)"
      description="إدارة المواضيع التي يعرضها المساعد العائم للمستخدمين"
      actions={
        <Button onClick={() => setEditing(empty())} className="gap-2">
          <Plus className="h-4 w-4" /> موضوع جديد
        </Button>
      }
    >
      <div className="flex items-center gap-3 mb-4">
        <Label className="text-sm">تصفية:</Label>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الفئات</SelectItem>
            {HELP_CATEGORIES.map((c) => (
              <SelectItem key={c.key} value={c.key}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} موضوع</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => (
            <Card key={a.id} className="p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant="outline">
                    {HELP_CATEGORIES.find((c) => c.key === a.category)?.label ?? a.category}
                  </Badge>
                  {!a.is_published && <Badge variant="secondary">مخفي</Badge>}
                  <h3 className="font-semibold">{a.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{a.content}</p>
                {a.keywords.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-2">
                    {a.keywords.map((k) => (
                      <span key={k} className="text-[10px] bg-muted px-2 py-0.5 rounded">
                        {k}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={a.is_published} onCheckedChange={() => togglePublish(a)} />
                <Button size="icon" variant="ghost" onClick={() => setEditing(a)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => remove(a.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <Card className="p-12 text-center text-muted-foreground">لا توجد مواضيع.</Card>
          )}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "تعديل موضوع" : "موضوع جديد"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label>الفئة</Label>
                <Select
                  value={editing.category}
                  onValueChange={(v) => setEditing({ ...editing, category: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {HELP_CATEGORIES.map((c) => (
                      <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>العنوان</Label>
                <Input
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div>
                <Label>كلمات مفتاحية (مفصولة بفواصل)</Label>
                <Input
                  value={(editing.keywords ?? []).join(", ")}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      keywords: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="خبر, إضافة, نشر"
                />
              </div>
              <div>
                <Label>المحتوى (يدعم الأسطر الجديدة)</Label>
                <Textarea
                  rows={8}
                  value={editing.content ?? ""}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                />
              </div>
              <div>
                <Label>صورة أو فيديو توضيحي (اختياري)</Label>
                <MediaUpload
                  value={editing.media_url ?? ""}
                  onChange={(url) => setEditing({ ...editing, media_url: url || null })}
                  bucket="site-media"
                  folder="help"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>نص زر الإجراء (اختياري)</Label>
                  <Input
                    value={editing.action_label ?? ""}
                    onChange={(e) => setEditing({ ...editing, action_label: e.target.value })}
                    placeholder="اذهب لإضافة خبر"
                  />
                </div>
                <div>
                  <Label>رابط زر الإجراء</Label>
                  <Input
                    value={editing.action_url ?? ""}
                    onChange={(e) => setEditing({ ...editing, action_url: e.target.value })}
                    placeholder="/admin/media-center"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>ترتيب</Label>
                  <Input
                    type="number"
                    value={editing.sort_order ?? 0}
                    onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Switch
                    checked={editing.is_published ?? true}
                    onCheckedChange={(v) => setEditing({ ...editing, is_published: v })}
                  />
                  <Label>منشور</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>إلغاء</Button>
            <Button onClick={save} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
