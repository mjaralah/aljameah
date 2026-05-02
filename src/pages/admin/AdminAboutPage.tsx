// لوحة تحرير محتوى صفحة "من نحن" — كل قسم في بطاقة قابلة للتعديل
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Section = {
  id: string;
  section_key: string;
  title: string | null;
  content: string | null;
  data: unknown;
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
};

export default function AdminAboutPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("about_content")
      .select("*")
      .order("sort_order");
    if (error) toast.error(error.message);
    setSections((data ?? []) as Section[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function update(id: string, patch: Partial<Section>) {
    setSections((s) => s.map((x) => x.id === id ? { ...x, ...patch } : x));
  }

  async function save(s: Section) {
    setSavingId(s.id);
    let parsedData = s.data;
    if (typeof s.data === "string") {
      try { parsedData = s.data ? JSON.parse(s.data as string) : null; }
      catch { toast.error("خطأ في صيغة JSON للبيانات الإضافية"); setSavingId(null); return; }
    }
    const { error } = await supabase.from("about_content").update({
      title: s.title, content: s.content, data: parsedData, published: s.published,
    }).eq("id", s.id);
    setSavingId(null);
    if (error) toast.error(error.message); else { toast.success("تم الحفظ"); load(); }
  }

  return (
    <AdminLayout title="محتوى صفحة من نحن" description="عدّل نصوص الرؤية والرسالة والأهداف وغيرها">
      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          {sections.map((s) => {
            const dataStr = typeof s.data === "string" ? s.data : JSON.stringify(s.data ?? null, null, 2);
            return (
              <Card key={s.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {KEY_LABELS[s.section_key] ?? s.section_key}
                    <span className="text-xs text-muted-foreground font-normal mr-2">({s.section_key})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">العنوان</label>
                    <Input value={s.title ?? ""} onChange={(e) => update(s.id, { title: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">النص</label>
                    <Textarea rows={5} value={s.content ?? ""} onChange={(e) => update(s.id, { content: e.target.value })} />
                  </div>
                  {s.data !== null && (
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        بيانات إضافية (JSON) — قوائم/إحصائيات/قيم
                      </label>
                      <Textarea
                        rows={8}
                        className="font-mono text-xs"
                        value={dataStr}
                        onChange={(e) => update(s.id, { data: e.target.value as unknown })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        لا تعدّل بنية المفاتيح، فقط القيم النصية بداخلها.
                      </p>
                    </div>
                  )}
                  <div className="flex justify-end pt-2">
                    <Button onClick={() => save(s)} disabled={savingId === s.id} size="sm">
                      {savingId === s.id ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Save className="w-4 h-4 ml-1" />}
                      حفظ القسم
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
