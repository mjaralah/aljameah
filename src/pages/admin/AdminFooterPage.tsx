// لوحة تحكم تذييل الموقع: تعريف الجمعية + ترتيب الأعمدة + روابط الأعمدة
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SectionHeader } from "@/components/admin/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SortableList, SortableItem } from "@/components/admin/SortableList";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, GripVertical, Plus, Pencil, Trash2, PanelBottom, Info } from "lucide-react";
import {
  useAdminFooterSections,
  useAdminFooterLinks,
  useFooterMutations,
  type DBFooterLink,
} from "@/hooks/useFooter";

const SECTION_LABELS: Record<string, string> = {
  brand: "تعريف الجمعية",
  quick: "روابط سريعة",
  eservices: "الخدمات الإلكترونية",
  legal: "المعلومات القانونية",
  contact: "تواصل معنا",
};

type Brand = {
  id?: string;
  footer_brand_name_ar?: string | null;
  footer_brand_name_en?: string | null;
  footer_brand_tagline_ar?: string | null;
  footer_brand_tagline_en?: string | null;
  footer_brand_about_ar?: string | null;
  footer_brand_about_en?: string | null;
};

export default function AdminFooterPage() {
  // ===== brand (site_settings) =====
  const [brand, setBrand] = useState<Brand | null>(null);
  const [brandLoading, setBrandLoading] = useState(true);
  const [brandSaving, setBrandSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("id, footer_brand_name_ar, footer_brand_name_en, footer_brand_tagline_ar, footer_brand_tagline_en, footer_brand_about_ar, footer_brand_about_en" as any)
        .limit(1)
        .maybeSingle();
      if (error) toast.error(error.message);
      setBrand((data ?? {}) as Brand);
      setBrandLoading(false);
    })();
  }, []);

  async function saveBrand() {
    if (!brand) return;
    setBrandSaving(true);
    try {
      const { id, ...rest } = brand;
      if (id) {
        const { error } = await supabase.from("site_settings").update(rest as any).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_settings").insert(rest as any);
        if (error) throw error;
      }
      toast.success("تم الحفظ");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBrandSaving(false);
    }
  }

  // ===== sections =====
  const { data: sections = [] } = useAdminFooterSections();
  const m = useFooterMutations();

  return (
    <AdminLayout title="تذييل الموقع">
      <AdminPageHeader
        title="تذييل الموقع"
        description="تحرير قسم تعريف الجمعية، إدارة روابط الأعمدة، وإعادة ترتيب الأعمدة في التذييل."
        icon={PanelBottom}
      />

      <div className="space-y-5 max-w-4xl">
        {/* ===== Brand ===== */}
        <Card>
          <CardContent className="p-5 md:p-6">
            <SectionHeader icon={Info} title="قسم تعريف الجمعية" description="اتركها فارغة لاستخدام النصوص الافتراضية للموقع." />
            {brandLoading || !brand ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>اسم الجمعية (عربي)</Label>
                    <Input value={brand.footer_brand_name_ar ?? ""} onChange={(e) => setBrand({ ...brand, footer_brand_name_ar: e.target.value })} />
                  </div>
                  <div>
                    <Label>اسم الجمعية (إنجليزي)</Label>
                    <Input dir="ltr" value={brand.footer_brand_name_en ?? ""} onChange={(e) => setBrand({ ...brand, footer_brand_name_en: e.target.value })} />
                  </div>
                  <div>
                    <Label>الشعار/الوصف القصير (عربي)</Label>
                    <Input value={brand.footer_brand_tagline_ar ?? ""} onChange={(e) => setBrand({ ...brand, footer_brand_tagline_ar: e.target.value })} />
                  </div>
                  <div>
                    <Label>الشعار/الوصف القصير (إنجليزي)</Label>
                    <Input dir="ltr" value={brand.footer_brand_tagline_en ?? ""} onChange={(e) => setBrand({ ...brand, footer_brand_tagline_en: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>الفقرة التعريفية (عربي)</Label>
                  <Textarea rows={3} value={brand.footer_brand_about_ar ?? ""} onChange={(e) => setBrand({ ...brand, footer_brand_about_ar: e.target.value })} />
                </div>
                <div>
                  <Label>الفقرة التعريفية (إنجليزي)</Label>
                  <Textarea rows={3} dir="ltr" value={brand.footer_brand_about_en ?? ""} onChange={(e) => setBrand({ ...brand, footer_brand_about_en: e.target.value })} />
                </div>
                <Button onClick={saveBrand} disabled={brandSaving}>
                  {brandSaving ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Save className="w-4 h-4 ml-1" />}
                  حفظ تعريف الجمعية
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ===== Sections order + visibility + titles ===== */}
        <Card>
          <CardContent className="p-5 md:p-6">
            <SectionHeader icon={GripVertical} title="ترتيب أعمدة التذييل" description="اسحب لإعادة الترتيب، وعدّل عنوان كل عمود أو أخفِه." />
            <SortableList
              ids={sections.map((s) => s.id)}
              onReorder={(ids) => m.reorderSections.mutate(ids)}
            >
              <div className="space-y-2">
                {sections.map((s) => (
                  <SortableItem key={s.id} id={s.id}>
                    {({ handleProps, setNodeRef, style }) => (
                      <div ref={setNodeRef} style={style} className="flex items-center gap-2 rounded-lg border bg-card p-3">
                        <button {...handleProps} className="p-1 cursor-grab text-muted-foreground hover:text-foreground" aria-label="سحب">
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <div className="font-semibold min-w-32 text-sm">{SECTION_LABELS[s.section_key] ?? s.section_key}</div>
                        {s.section_key !== "brand" && s.section_key !== "contact" && (
                          <>
                            <Input
                              className="h-9"
                              placeholder="العنوان (عربي)"
                              defaultValue={s.title_ar ?? ""}
                              onBlur={(e) => {
                                if (e.target.value !== (s.title_ar ?? "")) {
                                  m.updateSection.mutate({ id: s.id, patch: { title_ar: e.target.value } });
                                }
                              }}
                            />
                            <Input
                              className="h-9"
                              dir="ltr"
                              placeholder="Title (EN)"
                              defaultValue={s.title_en ?? ""}
                              onBlur={(e) => {
                                if (e.target.value !== (s.title_en ?? "")) {
                                  m.updateSection.mutate({ id: s.id, patch: { title_en: e.target.value } });
                                }
                              }}
                            />
                          </>
                        )}
                        <div className="ms-auto flex items-center gap-2">
                          <Label className="text-xs m-0">ظاهر</Label>
                          <Switch
                            checked={s.published}
                            onCheckedChange={(v) => m.updateSection.mutate({ id: s.id, patch: { published: v } })}
                          />
                        </div>
                      </div>
                    )}
                  </SortableItem>
                ))}
              </div>
            </SortableList>
          </CardContent>
        </Card>

        {/* ===== Links manager ===== */}
        <Card>
          <CardContent className="p-5 md:p-6">
            <SectionHeader title="روابط الأعمدة" description="إضافة، تعديل، حذف، إخفاء، وإعادة ترتيب روابط كل عمود." />
            <Tabs defaultValue="quick">
              <TabsList>
                <TabsTrigger value="quick">روابط سريعة</TabsTrigger>
                <TabsTrigger value="eservices">الخدمات الإلكترونية</TabsTrigger>
                <TabsTrigger value="legal">المعلومات القانونية</TabsTrigger>
              </TabsList>
              <TabsContent value="quick" className="mt-4">
                <LinksManager sectionKey="quick" />
              </TabsContent>
              <TabsContent value="eservices" className="mt-4">
                <LinksManager sectionKey="eservices" />
              </TabsContent>
              <TabsContent value="legal" className="mt-4">
                <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground mb-3">
                  ملاحظة: تظهر صفحات السياسات المُدارة في "الصفحات القانونية" تلقائياً في هذا العمود. تستخدم هذه الروابط لإضافة عناصر إضافية فقط.
                </div>
                <LinksManager sectionKey="legal" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  );
}

function LinksManager({ sectionKey }: { sectionKey: string }) {
  const { data: links = [], isLoading } = useAdminFooterLinks(sectionKey);
  const m = useFooterMutations();
  const [editing, setEditing] = useState<DBFooterLink | null>(null);
  const [open, setOpen] = useState(false);

  function openNew() {
    setEditing({ id: "", section_key: sectionKey, label_ar: "", label_en: "", url: "", sort_order: (links.length + 1) * 10, published: true });
    setOpen(true);
  }

  async function save() {
    if (!editing) return;
    if (!editing.label_ar.trim() || !editing.url.trim()) {
      toast.error("النص العربي والرابط مطلوبان");
      return;
    }
    try {
      if (editing.id) {
        const { id, ...patch } = editing;
        await m.updateLink.mutateAsync({ id, patch });
      } else {
        const { id, ...row } = editing;
        await m.createLink.mutateAsync(row);
      }
      toast.success("تم الحفظ");
      setOpen(false);
      setEditing(null);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 ml-1" />إضافة رابط</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin" /></div>
      ) : links.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-6">لا توجد روابط بعد.</div>
      ) : (
        <SortableList ids={links.map((l) => l.id)} onReorder={(ids) => m.reorderLinks.mutate(ids)}>
          <div className="space-y-2">
            {links.map((l) => (
              <SortableItem key={l.id} id={l.id}>
                {({ handleProps, setNodeRef, style }) => (
                  <div ref={setNodeRef} style={style} className="flex items-center gap-2 rounded-lg border bg-card p-3">
                    <button {...handleProps} className="p-1 cursor-grab text-muted-foreground hover:text-foreground" aria-label="سحب">
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{l.label_ar}</div>
                      <div className="text-xs text-muted-foreground truncate" dir="ltr">{l.url}</div>
                    </div>
                    <Switch
                      checked={l.published}
                      onCheckedChange={(v) => m.updateLink.mutate({ id: l.id, patch: { published: v } })}
                    />
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(l); setOpen(true); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => {
                      if (confirm("حذف هذا الرابط؟")) m.deleteLink.mutate(l.id);
                    }}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </SortableItem>
            ))}
          </div>
        </SortableList>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "تعديل الرابط" : "إضافة رابط"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>النص بالعربية</Label>
                <Input value={editing.label_ar} onChange={(e) => setEditing({ ...editing, label_ar: e.target.value })} />
              </div>
              <div>
                <Label>النص بالإنجليزية</Label>
                <Input dir="ltr" value={editing.label_en ?? ""} onChange={(e) => setEditing({ ...editing, label_en: e.target.value })} />
              </div>
              <div>
                <Label>الرابط (مسار داخلي مثل /about أو رابط كامل)</Label>
                <Input dir="ltr" value={editing.url} onChange={(e) => setEditing({ ...editing, url: e.target.value })} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="m-0">منشور</Label>
                <Switch checked={editing.published} onCheckedChange={(v) => setEditing({ ...editing, published: v })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button onClick={save}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
