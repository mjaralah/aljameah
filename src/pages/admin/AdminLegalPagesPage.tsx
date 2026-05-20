// لوحة تحرير الصفحات القانونية (الخصوصية، الشروط، إلخ)
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type LegalPage = {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  published: boolean;
};

export default function AdminLegalPagesPage() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("legal_pages").select("*").order("slug");
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

  return (
    <AdminLayout title="الصفحات القانونية" description="سياسة الخصوصية، شروط الاستخدام، ملفات الارتباط، إمكانية الوصول">
      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          {pages.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {p.title} <span className="text-xs text-muted-foreground font-normal">/{p.slug}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
    </AdminLayout>
  );
}
