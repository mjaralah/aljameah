// المركز الإعلامي — صفحة موحّدة لإدارة محتوى /media و /gallery
import { useEffect, useMemo, useState } from "react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminListRow } from "@/components/admin/AdminListRow";
import { ReorderControls } from "@/components/admin/ReorderControls";
import { SortableList, SortableItem, persistSortOrder } from "@/components/admin/SortableList";
import { moveToPosition, moveRelativeTo } from "@/lib/reorderHelpers";
import { BlockEditor } from "@/components/admin/blocks/BlockEditor";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2, Save, Plus, Newspaper,
  Images, Video, GripVertical, FolderOpen, Blocks, Clapperboard,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminNewsPage from "./AdminNewsPage";

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

const BLOCK_LABEL: Record<string, string> = {
  text_media: "نص + صورة + زر",
  cards_grid: "شبكة بطاقات",
  stats: "إحصائيات وعدّادات",
  gallery: "معرض صور",
  video_gallery: "معرض فيديوهات (YouTube)",
  carousel: "كاروسيل/سلايدر",
  video: "فيديو",
  accordion: "أسئلة شائعة",
  cta_banner: "شريط دعوة (CTA)",
  rich_text: "نص حر",
};

function sectionLabel(s: { section_key: string; data?: any }) {
  if (s.data?.block_type) return BLOCK_LABEL[s.data.block_type] ?? "قسم مخصّص";
  return s.section_key;
}

export default function AdminMediaCenterPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<"news" | "gallery">("news");
  const [galleryTab, setGalleryTab] = useState<"photos" | "videos">("photos");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .in("page_key", ["media", "gallery"])
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

  async function addSection(pageKey: string, blockType: string) {
    const peers = sections.filter((x) => x.page_key === pageKey);
    const sort = peers.length ? Math.max(...peers.map((x) => x.sort_order)) + 10 : 10;
    const { data, error } = await supabase
      .from("page_content")
      .insert({
        page_key: pageKey,
        section_key: `block_${Date.now()}`,
        title: null,
        content: null,
        data: { block_type: blockType },
        sort_order: sort,
        published: true,
      })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setSections((arr) => [...arr, data as Section]);
    toast.success("تم إضافة قسم جديد — حرّره ثم اضغط حفظ");
  }

  const mediaSections = useMemo(
    () => sections.filter((s) => s.page_key === "media"),
    [sections],
  );
  const photoSections = useMemo(
    () => sections.filter((s) => s.page_key === "gallery" && s.data?.block_type !== "video_gallery"),
    [sections],
  );
  const videoSections = useMemo(
    () => sections.filter((s) => s.page_key === "gallery" && s.data?.block_type === "video_gallery"),
    [sections],
  );

  function renderSectionsList(
    list: Section[],
    folder: string,
    emptyText: string,
  ) {
    if (list.length === 0) {
      return <AdminEmptyState icon={FolderOpen} title={emptyText} />;
    }
    const ids = list.map((s) => s.id);
    const doReorder = async (newIds: string[]) => {
      const subset = new Set(newIds);
      setSections((arr) => {
        const map = new Map(arr.map((x) => [x.id, x]));
        const reordered = newIds.map((id, i) => ({
          ...(map.get(id) as Section),
          sort_order: (i + 1) * 10,
        }));
        let cursor = 0;
        return arr.map((s) => (subset.has(s.id) ? reordered[cursor++] : s));
      });
      try {
        await persistSortOrder(supabase, "page_content", newIds);
        toast.success("تم تحديث الترتيب");
      } catch {
        toast.error("تعذر حفظ الترتيب");
        load();
      }
    };
    const apply = (n: string[] | null) => { if (n) doReorder(n); };

    return (
      <SortableList ids={ids} onReorder={doReorder}>
        {list.map((s, idx) => {
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
                  reorderControls={list.length > 1 ? (
                    <ReorderControls
                      position={idx + 1}
                      total={list.length}
                      others={list.filter((x) => x.id !== s.id).map((x) => ({ id: x.id, label: sectionLabel(x) }))}
                      onMoveUp={() => apply(moveToPosition(ids, s.id, idx))}
                      onMoveDown={() => apply(moveToPosition(ids, s.id, idx + 2))}
                      onSetPosition={(pos) => apply(moveToPosition(ids, s.id, pos))}
                      onMoveToStart={() => apply(moveToPosition(ids, s.id, 1))}
                      onMoveToEnd={() => apply(moveToPosition(ids, s.id, list.length))}
                      onMoveRelative={(t, w) => apply(moveRelativeTo(ids, s.id, t, w))}
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
                        folder={folder}
                      />
                    ) : (
                      <>
                        <div>
                          <Label>العنوان</Label>
                          <Input
                            value={s.title ?? ""}
                            onChange={(e) => update(s.id, { title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>النص</Label>
                          <Textarea
                            rows={4}
                            value={s.content ?? ""}
                            onChange={(e) => update(s.id, { content: e.target.value })}
                          />
                        </div>
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
  }

  return (
    <AdminLayout title="المركز الإعلامي">
      <AdminPageHeader
        title="المركز الإعلامي"
        description="إدارة الأخبار ومعرض الصور والفيديوهات من مكان واحد"
        icon={Newspaper}
      />

      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div dir="rtl">
          <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as any)}>
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
              <TabsTrigger
                value="news"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold"
              >
                <Newspaper className="w-4 h-4 ml-1" />
                الأخبار
              </TabsTrigger>
              <TabsTrigger
                value="gallery"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold"
              >
                <Images className="w-4 h-4 ml-1" />
                المعرض
              </TabsTrigger>
            </TabsList>

            {/* الأخبار */}
            <TabsContent value="news" className="space-y-6 mt-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Newspaper className="w-4 h-4 text-primary" />
                  <h2 className="font-bold text-lg">إدارة الأخبار</h2>
                </div>
                <AdminNewsPage noLayout />
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Blocks className="w-4 h-4 text-primary" />
                  <h2 className="font-bold text-lg">النصوص التعريفية لصفحة المركز الإعلامي</h2>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground">
                    {mediaSections.length > 1 && (
                      <>اسحب أيقونة <GripVertical className="inline w-3 h-3" /> لإعادة ترتيب الأقسام.</>
                    )}
                  </p>
                  <Button size="sm" onClick={() => addSection("media", "text_media")}>
                    <Plus className="w-4 h-4 ml-1" />
                    إضافة قسم جديد
                  </Button>
                </div>

                {renderSectionsList(
                  mediaSections,
                  "page/media",
                  "لا توجد أقسام بعد — اضغط ‘إضافة قسم جديد’ لبدء البناء",
                )}
              </div>
            </TabsContent>


            {/* المعرض */}
            <TabsContent value="gallery" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                إدارة معرض الصور ومقاطع الفيديو مع اختيار نمط العرض من داخل كل قسم.
              </p>

              <Tabs value={galleryTab} onValueChange={(v) => setGalleryTab(v as any)}>
                <TabsList className="bg-muted p-1">
                  <TabsTrigger
                    value="photos"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold"
                  >
                    <Images className="w-4 h-4 ml-1" />
                    الصور
                  </TabsTrigger>
                  <TabsTrigger
                    value="videos"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold"
                  >
                    <Clapperboard className="w-4 h-4 ml-1" />
                    الفيديوهات
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="photos" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {photoSections.length > 1 && (
                        <>اسحب أيقونة <GripVertical className="inline w-3 h-3" /> لإعادة ترتيب أقسام الصور.</>
                      )}
                    </p>
                    <Button size="sm" onClick={() => addSection("gallery", "gallery")}>
                      <Plus className="w-4 h-4 ml-1" />
                      إضافة قسم صور
                    </Button>
                  </div>
                  {renderSectionsList(
                    photoSections,
                    "page/gallery",
                    "لا توجد أقسام صور بعد — اضغط ‘إضافة قسم صور’",
                  )}
                </TabsContent>

                <TabsContent value="videos" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {videoSections.length > 1 && (
                        <>اسحب أيقونة <GripVertical className="inline w-3 h-3" /> لإعادة ترتيب أقسام الفيديو.</>
                      )}
                    </p>
                    <Button size="sm" onClick={() => addSection("gallery", "video_gallery")}>
                      <Plus className="w-4 h-4 ml-1" />
                      إضافة قسم فيديوهات
                    </Button>
                  </div>
                  {renderSectionsList(
                    videoSections,
                    "page/gallery",
                    "لا توجد أقسام فيديو بعد — اضغط ‘إضافة قسم فيديوهات’",
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </AdminLayout>
  );
}
