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
  Loader2, Save, Plus, Trash2, ArrowUp, ArrowDown, GripVertical,
  Newspaper, ClipboardList, FolderKanban, ExternalLink, LayoutTemplate, FolderOpen, Blocks,
} from "lucide-react";
import { SortableList, SortableItem, persistSortOrder } from "@/components/admin/SortableList";
import { AdminListRow } from "@/components/admin/AdminListRow";
import { ReorderControls } from "@/components/admin/ReorderControls";
import { moveToPosition, moveRelativeTo } from "@/lib/reorderHelpers";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { IconPicker } from "@/components/admin/IconPicker";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { BlockEditor } from "@/components/admin/blocks/BlockEditor";

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
  { key: "home", label: "الصفحة الرئيسية", description: "السلايدر، عدّاد الأرقام، نبذة، مؤشرات الرضا، دعوة التطوع" },
  { key: "about", label: "من نحن", description: "الرؤية، الرسالة، الأهداف، إلخ" },
  { key: "governance", label: "الحوكمة", description: "النصوص التعريفية والمؤشرات المالية" },
  { key: "contact", label: "تواصل معنا", description: "نصوص ومعلومات صفحة التواصل" },
  { key: "eservices", label: "الخدمات الإلكترونية", description: "نصوص وقائمة جميع الخدمات (المتاحة والقادمة)" },
  { key: "media", label: "المركز الإعلامي", description: "النصوص التعريفية + إدارة الأخبار" },
  { key: "surveys", label: "الاستبيانات", description: "النص التعريفي + إدارة الاستبيانات" },
  { key: "programs", label: "البرامج والخدمات", description: "النص التعريفي + إدارة البرامج" },
  { key: "eservices_volunteer", label: "نموذج التطوع", description: "نصوص ومزايا صفحة طلب التطوع" },
  { key: "eservices_membership", label: "نموذج طلب العضوية", description: "نصوص ومزايا صفحة طلب العضوية" },
];

const SECTION_LABELS: Record<string, string> = {
  hero: "شريط العرض الرئيسي",
  intro: "المقدمة",
  hours: "ساعات العمل",
  map: "الخريطة والعنوان",
  services_list: "قائمة الخدمات",
  sections: "الأقسام الإعلامية",
  stats: "عدّاد الأرقام",
  about_preview: "نبذة عن الجمعية",
  programs: "شبكة البرامج",
  satisfaction: "مؤشرات رضا المستفيدين",
  news: "آخر الأخبار",
  partners: "شركاء النجاح",
  volunteer_cta: "دعوة التطوع",
  financials: "المؤشرات المالية",
  benefits: "المزايا",
};

const BLOCK_LABEL: Record<string, string> = {
  text_media: "نص + صورة + زر",
  cards_grid: "شبكة بطاقات",
  stats: "إحصائيات وعدّادات",
  gallery: "معرض صور",
  carousel: "كاروسيل/سلايدر",
  video: "فيديو",
  accordion: "أسئلة شائعة",
  cta_banner: "شريط دعوة (CTA)",
  rich_text: "نص حر",
};

function sectionLabel(s: { section_key: string; data?: any }) {
  if (s.data?.block_type) return BLOCK_LABEL[s.data.block_type] ?? "قسم مخصّص";
  return SECTION_LABELS[s.section_key] ?? s.section_key;
}

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

  async function addBlockSection(pageKey: string) {
    const pageSections = sections.filter((x) => x.page_key === pageKey);
    const sort = pageSections.length
      ? Math.max(...pageSections.map((x) => x.sort_order)) + 10
      : 10;
    const { data, error } = await supabase
      .from("page_content")
      .insert({
        page_key: pageKey,
        section_key: `block_${Date.now()}`,
        title: null,
        content: null,
        data: { block_type: "text_media" },
        sort_order: sort,
        published: true,
      })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setSections((arr) => [...arr, data as Section]);
    toast.success("تم إضافة قسم جديد — حرّره ثم اضغط حفظ");
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
    if (s.section_key === "stats") {
      const items: any[] = Array.isArray(s.data?.items) ? s.data.items : [];
      const setItems = (next: any[]) => updateData(s.id, "items", next);
      return (
        <div className="space-y-3">
          {items.map((it, idx) => (
            <div key={idx} className="rounded-lg border p-3 space-y-2 bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">إحصائية #{idx + 1}</span>
                <Button type="button" size="icon" variant="ghost"
                  onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <Label>الأيقونة</Label>
                  <IconPicker value={it.icon ?? ""} onChange={(name) => {
                    const next = [...items]; next[idx] = { ...it, icon: name }; setItems(next);
                  }} />
                </div>
                <div>
                  <Label>التسمية</Label>
                  <Input value={it.label ?? ""} onChange={(e) => {
                    const next = [...items]; next[idx] = { ...it, label: e.target.value }; setItems(next);
                  }} />
                </div>
                <div>
                  <Label>القيمة (رقم)</Label>
                  <Input type="number" value={it.value ?? 0} onChange={(e) => {
                    const next = [...items]; next[idx] = { ...it, value: Number(e.target.value) }; setItems(next);
                  }} />
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm"
            onClick={() => setItems([...items, { icon: "Sparkles", label: "", value: 0 }])}>
            <Plus className="w-4 h-4 ml-1" /> إضافة إحصائية
          </Button>
        </div>
      );
    }
    if (s.section_key === "about_preview" || s.section_key === "satisfaction" || s.section_key === "volunteer_cta") {
      const d = s.data || {};
      return (
        <div className="space-y-3">
          {s.section_key === "about_preview" && (
            <MediaUpload
              label="صورة القسم"
              value={d.image_url ?? ""}
              folder="home/about"
              onChange={(url) => updateData(s.id, "image_url", url ?? "")}
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>نص الزر</Label>
              <Input value={d.cta_label ?? ""} onChange={(e) => updateData(s.id, "cta_label", e.target.value)} />
            </div>
            <div>
              <Label>رابط الزر</Label>
              <Input dir="ltr" value={d.cta_url ?? ""} onChange={(e) => updateData(s.id, "cta_url", e.target.value)} />
            </div>
          </div>
        </div>
      );
    }
    if (s.section_key === "financials") {
      const d = s.data || {};
      const allocation: any[] = Array.isArray(d.allocation) ? d.allocation : [];
      const setAlloc = (next: any[]) => updateData(s.id, "allocation", next);
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <Label>السنة</Label>
              <Input type="number" value={d.year ?? new Date().getFullYear()}
                onChange={(e) => updateData(s.id, "year", Number(e.target.value))} />
            </div>
            <div>
              <Label>إجمالي الإيرادات</Label>
              <Input type="number" value={d.total_revenue ?? 0}
                onChange={(e) => updateData(s.id, "total_revenue", Number(e.target.value))} />
            </div>
            <div>
              <Label>إجمالي المصروفات</Label>
              <Input type="number" value={d.total_expenses ?? 0}
                onChange={(e) => updateData(s.id, "total_expenses", Number(e.target.value))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>توزيع المصروفات</Label>
            {allocation.map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input className="flex-1" placeholder="مثال: البرامج التنموية" value={a.label ?? ""}
                  onChange={(e) => { const n = [...allocation]; n[i] = { ...a, label: e.target.value }; setAlloc(n); }} />
                <Input className="w-24" type="number" placeholder="%" value={a.percent ?? 0}
                  onChange={(e) => { const n = [...allocation]; n[i] = { ...a, percent: Number(e.target.value) }; setAlloc(n); }} />
                <Button type="button" size="icon" variant="ghost"
                  onClick={() => setAlloc(allocation.filter((_, j) => j !== i))}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm"
              onClick={() => setAlloc([...allocation, { label: "", percent: 0 }])}>
              <Plus className="w-4 h-4 ml-1" /> إضافة بند
            </Button>
          </div>
        </div>
      );
    }
    return null;
  }

  // روابط سريعة لإدارة الكيانات الكاملة لكل صفحة
  const QUICK_LINKS: Record<string, { to: string; label: string; icon: any; desc: string }[]> = {
    home: [
      { to: "/admin/hero", label: "شريط العرض الرئيسي", icon: ExternalLink, desc: "إدارة شرائح العرض المتحركة في أعلى الصفحة" },
      { to: "/admin/partners", label: "الشركاء", icon: ExternalLink, desc: "شعارات الشركاء الظاهرة في الصفحة" },
      { to: "/admin/programs", label: "البرامج", icon: FolderKanban, desc: "البرامج الظاهرة في الصفحة الرئيسية" },
      { to: "/admin/news", label: "الأخبار", icon: Newspaper, desc: "آخر الأخبار الظاهرة في الصفحة الرئيسية" },
    ],
    about: [
      { to: "/admin/about", label: "محرر صفحة من نحن", icon: ExternalLink, desc: "تحرير الرؤية والرسالة والأهداف" },
      { to: "/admin/board", label: "مجلس الإدارة", icon: ExternalLink, desc: "إضافة وتعديل الأعضاء" },
    ],
    governance: [
      { to: "/admin/governance", label: "ملفات الحوكمة", icon: ExternalLink, desc: "رفع وحذف وثائق السياسات والتقارير" },
    ],
    media: [{ to: "/admin/news", label: "إدارة الأخبار", icon: Newspaper, desc: "إضافة وتعديل وحذف وأرشفة الأخبار" }],
    surveys: [{ to: "/admin/surveys", label: "إدارة الاستبيانات", icon: ClipboardList, desc: "إضافة وتعديل الاستبيانات والأسئلة" }],
    programs: [{ to: "/admin/programs", label: "إدارة البرامج", icon: FolderKanban, desc: "إضافة وتعديل وحذف البرامج" }],
    eservices: [{ to: "/admin/forms", label: "إدارة بطاقات الخدمات والنماذج", icon: ClipboardList, desc: "تحرير عناوين/أوصاف بطاقات الخدمات وحقول النماذج وحالات (نشط/قريباً/مؤرشف)" }],
    eservices_volunteer: [{ to: "/admin/forms", label: "تحرير نموذج التطوع", icon: ClipboardList, desc: "إدارة حقول وعنوان نموذج التطوع من صفحة النماذج الموحّدة" }],
    eservices_membership: [{ to: "/admin/forms", label: "تحرير نموذج العضوية", icon: ClipboardList, desc: "إدارة حقول وعنوان نموذج العضوية من صفحة النماذج الموحّدة" }],
    contact: [{ to: "/admin/forms", label: "تحرير نموذج التواصل", icon: ClipboardList, desc: "إدارة حقول وعنوان نموذج التواصل من صفحة النماذج الموحّدة" }],
  };

  return (
    <AdminLayout title="محتوى الصفحات">
      <AdminPageHeader
        title="محتوى الصفحات"
        description="تحرير محتوى صفحات الموقع العامة من مكان واحد"
        icon={LayoutTemplate}
      />

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

                {(() => {
                  const pageSections = (grouped[page.key] ?? []).filter((s) => !(page.key === "eservices" && s.section_key === "services_list"));
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {pageSections.length > 1 && <>اسحب أيقونة <GripVertical className="inline w-3 h-3" /> لإعادة ترتيب الأقسام.</>}
                        </p>
                        <Button size="sm" onClick={() => addBlockSection(page.key)}>
                          <Plus className="w-4 h-4 ml-1" />
                          إضافة قسم جديد
                        </Button>
                      </div>

                      {pageSections.length > 0 && (() => {
                        const pageIds = pageSections.map((s) => s.id);
                        const doReorder = async (newIds: string[]) => {
                          const idIndex = new Map(newIds.map((id, i) => [id, i]));
                          const subset = new Set(newIds);
                          setSections((arr) => {
                            const map = new Map(arr.map((x) => [x.id, x]));
                            const reordered = newIds.map((id, i) => ({
                              ...(map.get(id) as Section),
                              sort_order: (i + 1) * 10,
                            }));
                            let cursor = 0;
                            return arr.map((s) =>
                              subset.has(s.id) ? reordered[cursor++] : s,
                            );
                          });
                          try { await persistSortOrder(supabase, "page_content", newIds); toast.success("تم تحديث الترتيب"); }
                          catch { toast.error("تعذر حفظ الترتيب"); load(); }
                        };
                        const apply = (n: string[] | null) => { if (n) doReorder(n); };
                        return (
                        <SortableList ids={pageIds} onReorder={doReorder}>
                          {pageSections.map((s, idx) => {
                            const isBlock = !!s.data?.block_type;
                            return (
                              <SortableItem key={s.id} id={s.id}>
                                {({ handleProps, setNodeRef, style }) => (
                                  <AdminListRow
                                    ref={setNodeRef as any}
                                    style={style}
                                    id={s.id}
                                    table="page_content"
                                    dragHandleProps={handleProps}
                                    reorderControls={pageSections.length > 1 ? (
                                      <ReorderControls
                                        position={idx + 1}
                                        total={pageSections.length}
                                        others={pageSections.filter((x) => x.id !== s.id).map((x) => ({ id: x.id, label: sectionLabel(x) }))}
                                        onMoveUp={() => apply(moveToPosition(pageIds, s.id, idx))}
                                        onMoveDown={() => apply(moveToPosition(pageIds, s.id, idx + 2))}
                                        onSetPosition={(pos) => apply(moveToPosition(pageIds, s.id, pos))}
                                        onMoveToStart={() => apply(moveToPosition(pageIds, s.id, 1))}
                                        onMoveToEnd={() => apply(moveToPosition(pageIds, s.id, pageSections.length))}
                                        onMoveRelative={(t, w) => apply(moveRelativeTo(pageIds, s.id, t, w))}
                                      />
                                    ) : undefined}
                                    title={
                                      <span className="inline-flex items-center gap-2">
                                        {isBlock && <Blocks className="w-3.5 h-3.5 text-primary" />}
                                        {sectionLabel(s)}
                                      </span>
                                    }
                                    subtitle={s.title ?? (isBlock ? (s.data?.title_ar || s.data?.title_en) : undefined)}
                                    published={s.published}
                                    onTogglePublished={(next) => update(s.id, { published: next })}
                                    onDelete={async () => {
                                      if (!confirm("حذف هذا القسم نهائياً؟")) return;
                                      const { error } = await supabase.from("page_content").delete().eq("id", s.id);
                                      if (error) toast.error(error.message);
                                      else { toast.success("تم الحذف"); load(); }
                                    }}
                                  >
                                    <CardContent className="space-y-3 border-t pt-4">
                                      {isBlock ? (
                                        <BlockEditor
                                          data={s.data || {}}
                                          onChange={(next) => update(s.id, { data: next })}
                                          folder={`page/${page.key}`}
                                        />
                                      ) : (
                                        <>
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
                                        </>
                                      )}
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
                                  </AdminListRow>
                                )}
                              </SortableItem>
                            );
                          })}
                        </SortableList>
                        );
                      })()}

                      {pageSections.length === 0 && !(QUICK_LINKS[page.key]?.length) && (
                        <AdminEmptyState icon={FolderOpen} title="لا توجد أقسام بعد — اضغط ‘إضافة قسم جديد’ لبدء البناء" />
                      )}
                    </>
                  );
                })()}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </AdminLayout>
  );
}
