// لوحة موحدة لتحرير محتوى الصفحات العامة (تواصل، الخدمات الإلكترونية، المركز الإعلامي)
import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { IconPicker } from "@/components/admin/IconPicker";

type Section = {
  id: string;
  page_key: string;
  section_key: string;
  title: string | null;
  content: string | null;
  data: any;
  sort_order: number;
  published: boolean;
};

const PAGES: { key: string; label: string; description: string }[] = [
  { key: "contact", label: "تواصل معنا", description: "نصوص ومعلومات صفحة التواصل" },
  { key: "eservices", label: "الخدمات الإلكترونية", description: "نصوص وقائمة الخدمات المعروضة" },
  { key: "media", label: "المركز الإعلامي", description: "النصوص التعريفية للأقسام الإعلامية" },
  { key: "surveys", label: "الاستبيانات", description: "النص التعريفي لصفحة الاستبيانات" },
];

// تسميات ودية لمفاتيح الأقسام
const SECTION_LABELS: Record<string, string> = {
  intro: "المقدمة",
  hours: "ساعات العمل",
  map: "الخريطة والعنوان",
  services_list: "قائمة الخدمات",
  sections: "الأقسام الإعلامية",
};

export default function AdminPageContentPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(PAGES[0].key);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .order("page_key")
      .order("sort_order");
    if (error) toast.error(error.message);
    setSections((data ?? []) as Section[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function update(id: string, patch: Partial<Section>) {
    setSections((arr) => arr.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  function updateData(id: string, key: string, value: any) {
    setSections((arr) =>
      arr.map((s) => (s.id === id ? { ...s, data: { ...(s.data || {}), [key]: value } } : s))
    );
  }

  async function save(s: Section) {
    setSavingId(s.id);
    const { error } = await supabase
      .from("page_content")
      .update({
        title: s.title,
        content: s.content,
        data: s.data,
        sort_order: s.sort_order,
        published: s.published,
      })
      .eq("id", s.id);
    setSavingId(null);
    if (error) toast.error(error.message);
    else toast.success("تم الحفظ");
  }

  const grouped = useMemo(() => {
    const map: Record<string, Section[]> = {};
    for (const s of sections) (map[s.page_key] ??= []).push(s);
    return map;
  }, [sections]);

  function renderStructured(s: Section) {
    // Map section: embed_url + address
    if (s.section_key === "map") {
      const d = s.data || {};
      return (
        <div className="space-y-3">
          <div>
            <Label>العنوان النصي</Label>
            <Input
              value={d.address ?? ""}
              onChange={(e) => updateData(s.id, "address", e.target.value)}
              placeholder="الرياض، المملكة العربية السعودية"
            />
          </div>
          <div>
            <Label>رابط تضمين خرائط Google (iframe src)</Label>
            <Input
              dir="ltr"
              value={d.embed_url ?? ""}
              onChange={(e) => updateData(s.id, "embed_url", e.target.value)}
              placeholder="https://www.google.com/maps/embed?..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              من خرائط Google: شارك ← تضمين خريطة ← انسخ قيمة src فقط
            </p>
          </div>
        </div>
      );
    }

    // Services list / Media sections — items array
    if (s.section_key === "services_list" || s.section_key === "sections") {
      const items: any[] = Array.isArray(s.data?.items) ? s.data.items : [];
      const setItems = (next: any[]) => updateData(s.id, "items", next);
      return (
        <div className="space-y-3">
          {items.map((it, idx) => (
            <div key={idx} className="rounded-lg border p-3 space-y-2 bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">عنصر #{idx + 1}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setItems(items.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <Label>العنوان</Label>
                  <Input
                    value={it.title ?? ""}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx] = { ...it, title: e.target.value };
                      setItems(next);
                    }}
                  />
                </div>
                {s.section_key === "services_list" && (
                  <div>
                    <Label>الرابط</Label>
                    <Input
                      dir="ltr"
                      value={it.url ?? ""}
                      onChange={(e) => {
                        const next = [...items];
                        next[idx] = { ...it, url: e.target.value };
                        setItems(next);
                      }}
                      placeholder="/eservices/..."
                    />
                  </div>
                )}
              </div>
              <div>
                <Label>الوصف</Label>
                <Textarea
                  rows={2}
                  value={it.description ?? ""}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...it, description: e.target.value };
                    setItems(next);
                  }}
                />
              </div>
              {s.section_key === "services_list" && (
                <div>
                  <Label>الأيقونة</Label>
                  <IconPicker
                    value={it.icon ?? ""}
                    onChange={(name) => {
                      const next = [...items];
                      next[idx] = { ...it, icon: name };
                      setItems(next);
                    }}
                  />
                </div>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setItems([
                ...items,
                s.section_key === "services_list"
                  ? { title: "", description: "", url: "", icon: "Sparkles" }
                  : { title: "", description: "" },
              ])
            }
          >
            <Plus className="w-4 h-4 ml-1" />
            إضافة عنصر
          </Button>
        </div>
      );
    }

    return null;
  }

  return (
    <AdminLayout
      title="محتوى الصفحات"
      description="تحرير محتوى صفحات: تواصل معنا، الخدمات الإلكترونية، المركز الإعلامي"
    >
      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <Tabs value={activePage} onValueChange={setActivePage}>
          <TabsList>
            {PAGES.map((p) => (
              <TabsTrigger key={p.key} value={p.key}>
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {PAGES.map((page) => (
            <TabsContent key={page.key} value={page.key} className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">{page.description}</p>
              {(grouped[page.key] ?? []).map((s) => (
                <Card key={s.id}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>
                        {SECTION_LABELS[s.section_key] ?? s.section_key}
                      </span>
                      <label className="flex items-center gap-2 text-xs font-normal">
                        <input
                          type="checkbox"
                          checked={s.published}
                          onChange={(e) => update(s.id, { published: e.target.checked })}
                        />
                        منشور
                      </label>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>العنوان</Label>
                      <Input
                        value={s.title ?? ""}
                        onChange={(e) => update(s.id, { title: e.target.value })}
                      />
                    </div>
                    {s.section_key !== "map" &&
                      s.section_key !== "services_list" &&
                      s.section_key !== "sections" && (
                        <div>
                          <Label>النص</Label>
                          <Textarea
                            rows={4}
                            value={s.content ?? ""}
                            onChange={(e) => update(s.id, { content: e.target.value })}
                          />
                        </div>
                      )}
                    {renderStructured(s)}
                    <div className="flex justify-end">
                      <Button onClick={() => save(s)} disabled={savingId === s.id} size="sm">
                        {savingId === s.id ? (
                          <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 ml-1" />
                        )}
                        حفظ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(grouped[page.key] ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">لا توجد أقسام.</p>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </AdminLayout>
  );
}
