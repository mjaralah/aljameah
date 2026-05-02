// لوحة موحدة لتحرير محتوى الصفحات العامة
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Loader2, Save, Plus, Trash2, ArrowUp, ArrowDown,
  Newspaper, ClipboardList, FolderKanban, ExternalLink,
} from "lucide-react";
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
  { key: "eservices", label: "الخدمات الإلكترونية", description: "نصوص وقائمة جميع الخدمات (المتاحة والقادمة)" },
  { key: "media", label: "المركز الإعلامي", description: "النصوص التعريفية + إدارة الأخبار" },
  { key: "surveys", label: "الاستبيانات", description: "النص التعريفي + إدارة الاستبيانات" },
  { key: "programs", label: "البرامج والخدمات", description: "النص التعريفي + إدارة البرامج" },
];

const SECTION_LABELS: Record<string, string> = {
  intro: "المقدمة",
  hours: "ساعات العمل",
  map: "الخريطة والعنوان",
  services_list: "قائمة الخدمات",
  sections: "الأقسام الإعلامية",
};

const AUDIENCES = [
  { value: "individuals", label: "للأفراد" },
  { value: "entities", label: "للجهات" },
  { value: "inquiries", label: "استفسارات" },
];

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

  function renderItemsEditor(s: Section) {
    const isServices = s.section_key === "services_list";
    const items: any[] = Array.isArray(s.data?.items) ? s.data.items : [];
    const setItems = (next: any[]) => updateData(s.id, "items", next);
    const move = (idx: number, dir: -1 | 1) => {
      const j = idx + dir;
      if (j < 0 || j >= items.length) return;
      const next = [...items];
      [next[idx], next[j]] = [next[j], next[idx]];
      setItems(next);
    };
    return (
      <div className="space-y-3">
        {items.map((it, idx) => (
          <div key={idx} className="rounded-lg border p-3 space-y-2 bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">عنصر #{idx + 1}</span>
              <div className="flex items-center gap-1">
                <Button type="button" size="icon" variant="ghost" onClick={() => move(idx, -1)}>
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button type="button" size="icon" variant="ghost" onClick={() => move(idx, 1)}>
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button type="button" size="icon" variant="ghost"
                  onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>العنوان</Label>
                <Input
                  value={it.title ?? ""}
                  onChange={(e) => {
                    const next = [...items]; next[idx] = { ...it, title: e.target.value }; setItems(next);
                  }}
                />
              </div>
              {isServices && (
                <div>
                  <Label>الرابط (اتركه فارغاً لإخفاء زر "ابدأ")</Label>
                  <Input dir="ltr" value={it.url ?? ""} placeholder="/eservices/..."
                    onChange={(e) => { const next = [...items]; next[idx] = { ...it, url: e.target.value }; setItems(next); }}
                  />
                </div>
              )}
            </div>
            <div>
              <Label>الوصف</Label>
              <Textarea rows={2} value={it.description ?? ""}
                onChange={(e) => { const next = [...items]; next[idx] = { ...it, description: e.target.value }; setItems(next); }}
              />
            </div>
            {isServices && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div>
                  <Label>الأيقونة</Label>
                  <IconPicker
                    value={it.icon ?? ""}
                    onChange={(name) => { const next = [...items]; next[idx] = { ...it, icon: name }; setItems(next); }}
                  />
                </div>
                <div>
                  <Label>الحالة</Label>
                  <Select value={it.status ?? "available"}
                    onValueChange={(v) => { const next = [...items]; next[idx] = { ...it, status: v }; setItems(next); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">متاحة</SelectItem>
                      <SelectItem value="soon">قريباً</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>الفئة</Label>
                  <Select value={it.audience ?? "individuals"}
                    onValueChange={(v) => { const next = [...items]; next[idx] = { ...it, audience: v }; setItems(next); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AUDIENCES.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>المدة المتوقعة</Label>
                  <Input value={it.duration ?? ""} placeholder="٣ دقائق"
                    onChange={(e) => { const next = [...items]; next[idx] = { ...it, duration: e.target.value }; setItems(next); }}
                  />
                </div>
                <div className="md:col-span-4 flex items-center gap-2 pt-1">
                  <Switch checked={!!it.featured}
                    onCheckedChange={(v) => { const next = [...items]; next[idx] = { ...it, featured: v }; setItems(next); }} />
                  <Label className="m-0">إبراز هذه الخدمة (الأكثر طلباً)</Label>
                </div>
              </div>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm"
          onClick={() => setItems([...items, isServices
            ? { title: "", description: "", url: "", icon: "Sparkles", status: "soon", audience: "individuals", duration: "" }
            : { title: "", description: "" }])}>
          <Plus className="w-4 h-4 ml-1" />
          إضافة عنصر
        </Button>
      </div>
    );
  }

  function renderStructured(s: Section) {
    if (s.section_key === "map") {
      const d = s.data || {};
      return (
        <div className="space-y-3">
          <div>
            <Label>العنوان النصي</Label>
            <Input value={d.address ?? ""} onChange={(e) => updateData(s.id, "address", e.target.value)}
              placeholder="الرياض، المملكة العربية السعودية" />
          </div>
          <div>
            <Label>رابط تضمين خرائط Google (iframe src)</Label>
            <Input dir="ltr" value={d.embed_url ?? ""}
              onChange={(e) => updateData(s.id, "embed_url", e.target.value)}
              placeholder="https://www.google.com/maps/embed?..." />
            <p className="text-xs text-muted-foreground mt-1">
              من خرائط Google: شارك ← تضمين خريطة ← انسخ قيمة src فقط
            </p>
          </div>
        </div>
      );
    }
    if (s.section_key === "services_list" || s.section_key === "sections") {
      return renderItemsEditor(s);
    }
    return null;
  }

  // روابط سريعة لإدارة الكيانات الكاملة (الأخبار، الاستبيانات، البرامج) لكل صفحة
  const QUICK_LINKS: Record<string, { to: string; label: string; icon: any; desc: string }[]> = {
    media: [{ to: "/admin/news", label: "إدارة الأخبار", icon: Newspaper, desc: "إضافة وتعديل وحذف وأرشفة الأخبار" }],
    surveys: [{ to: "/admin/surveys", label: "إدارة الاستبيانات", icon: ClipboardList, desc: "إضافة وتعديل الاستبيانات والأسئلة" }],
    programs: [{ to: "/admin/programs", label: "إدارة البرامج", icon: FolderKanban, desc: "إضافة وتعديل وحذف البرامج" }],
  };

  return (
    <AdminLayout
      title="محتوى الصفحات"
      description="تحرير محتوى صفحات الموقع العامة"
    >
      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div dir="rtl">
          <Tabs value={activePage} onValueChange={setActivePage}>
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
              {PAGES.map((p) => (
                <TabsTrigger
                  key={p.key}
                  value={p.key}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold"
                >
                  {p.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {PAGES.map((page) => (
              <TabsContent key={page.key} value={page.key} className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">{page.description}</p>

                {(QUICK_LINKS[page.key] ?? []).map((ql) => {
                  const Icon = ql.icon;
                  return (
                    <Card key={ql.to} className="border-primary/30 bg-primary/5">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold">{ql.label}</p>
                            <p className="text-xs text-muted-foreground">{ql.desc}</p>
                          </div>
                        </div>
                        <Button asChild size="sm">
                          <Link to={ql.to}>
                            فتح
                            <ExternalLink className="h-4 w-4 mr-1" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}

                {(grouped[page.key] ?? []).map((s) => (
                  <Card key={s.id}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>{SECTION_LABELS[s.section_key] ?? s.section_key}</span>
                        <label className="flex items-center gap-2 text-xs font-normal">
                          <input type="checkbox" checked={s.published}
                            onChange={(e) => update(s.id, { published: e.target.checked })} />
                          منشور
                        </label>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>العنوان</Label>
                        <Input value={s.title ?? ""}
                          onChange={(e) => update(s.id, { title: e.target.value })} />
                      </div>
                      {s.section_key !== "map" &&
                        s.section_key !== "services_list" &&
                        s.section_key !== "sections" && (
                          <div>
                            <Label>النص</Label>
                            <Textarea rows={4} value={s.content ?? ""}
                              onChange={(e) => update(s.id, { content: e.target.value })} />
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

                {(grouped[page.key] ?? []).length === 0 &&
                  !(QUICK_LINKS[page.key]?.length) && (
                    <p className="text-sm text-muted-foreground">لا توجد أقسام.</p>
                  )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </AdminLayout>
  );
}
