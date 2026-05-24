// محرر أقسام صفحة مخصّصة — يستخدم نفس بانِي البلوكات
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminListRow } from "@/components/admin/AdminListRow";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Loader2, Plus, Save, Blocks, ExternalLink, ArrowRight, FolderOpen, GripVertical } from "lucide-react";
import { SortableList, SortableItem, persistSortOrder } from "@/components/admin/SortableList";
import { ReorderControls } from "@/components/admin/ReorderControls";
import { BlockEditor } from "@/components/admin/blocks/BlockEditor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export default function AdminPageBuilderPage() {
  const { pageId = "" } = useParams();
  const pageKey = `custom:${pageId}`;
  const [page, setPage] = useState<{ title: string; slug: string } | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: p }, { data: s, error }] = await Promise.all([
      supabase.from("custom_pages").select("title,slug").eq("id", pageId).maybeSingle(),
      supabase.from("page_content").select("*").eq("page_key", pageKey).order("sort_order"),
    ]);
    setPage((p ?? null) as any);
    if (error) toast.error(error.message);
    setSections((s ?? []) as Section[]);
    setLoading(false);
  }
  useEffect(() => { if (pageId) load(); }, [pageId]);

  function update(id: string, patch: Partial<Section>) {
    setSections((arr) => arr.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function save(s: Section) {
    setSavingId(s.id);
    const { error } = await supabase.from("page_content").update({
      title: s.title, content: s.content, data: s.data,
      sort_order: s.sort_order, published: s.published,
    }).eq("id", s.id);
    setSavingId(null);
    if (error) toast.error(error.message); else toast.success("تم الحفظ");
  }

  async function addSection() {
    const sort = sections.length ? Math.max(...sections.map((x) => x.sort_order)) + 10 : 10;
    const { data, error } = await supabase.from("page_content").insert({
      page_key: pageKey, section_key: `block_${Date.now()}`,
      title: null, content: null, data: { block_type: "text_media" },
      sort_order: sort, published: true,
    }).select().single();
    if (error) return toast.error(error.message);
    setSections((a) => [...a, data as Section]);
    toast.success("تم إضافة قسم");
  }

  return (
    <AdminLayout title="بانِي الصفحة">
      <AdminPageHeader
        title={page ? `بانِي الصفحة: ${page.title}` : "بانِي الصفحة"}
        description="أضف وحرّر أقسام الصفحة المخصّصة"
        icon={Blocks}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/pages"><ArrowRight className="w-4 h-4 ml-1" />رجوع</Link>
            </Button>
            {page?.slug && (
              <Button variant="outline" asChild>
                <a href={`/p/${page.slug}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4 ml-1" />معاينة
                </a>
              </Button>
            )}
            <Button onClick={addSection}><Plus className="w-4 h-4 ml-1" />إضافة قسم</Button>
          </div>
        }
      />

      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : sections.length === 0 ? (
        <AdminEmptyState
          icon={FolderOpen}
          title="لا توجد أقسام بعد"
          description="اضغط ‘إضافة قسم’ لبدء البناء."
          actionLabel="إضافة قسم"
          onAction={addSection}
        />
      ) : (
        <>
          {sections.length > 1 && (
            <p className="text-xs text-muted-foreground mb-2">
              استخدم الأسهم <span className="inline-block">▲▼</span> أو حقل الرقم لتغيير الترتيب، أو اسحب <GripVertical className="inline w-3 h-3" />.
            </p>
          )}
          {(() => {
            async function applyOrder(newIds: string[]) {
              const orderMap = new Map(newIds.map((id, i) => [id, (i + 1) * 10]));
              const byId = new Map(sections.map((s) => [s.id, s]));
              const next = newIds
                .map((id) => byId.get(id))
                .filter(Boolean)
                .map((s) => ({ ...(s as Section), sort_order: orderMap.get((s as Section).id)! }));
              setSections(next as Section[]);
              try {
                await persistSortOrder(supabase, "page_content", newIds);
                toast.success("تم تحديث الترتيب");
              } catch {
                toast.error("تعذر حفظ الترتيب");
                load();
              }
            }
            function reorderByPosition(id: string, newPos1: number) {
              const ids = sections.map((s) => s.id);
              const oldIdx = ids.indexOf(id);
              if (oldIdx === -1) return;
              const target = Math.max(0, Math.min(ids.length - 1, newPos1 - 1));
              if (target === oldIdx) return;
              const arr = [...ids];
              const [m] = arr.splice(oldIdx, 1);
              arr.splice(target, 0, m);
              applyOrder(arr);
            }
            function moveRelative(id: string, targetId: string, where: "before" | "after") {
              const ids = sections.map((s) => s.id);
              const oldIdx = ids.indexOf(id);
              let tIdx = ids.indexOf(targetId);
              if (oldIdx === -1 || tIdx === -1 || id === targetId) return;
              const arr = [...ids];
              arr.splice(oldIdx, 1);
              tIdx = arr.indexOf(targetId);
              arr.splice(where === "before" ? tIdx : tIdx + 1, 0, id);
              applyOrder(arr);
            }
            return (
              <SortableList ids={sections.map((s) => s.id)} onReorder={applyOrder}>
                {sections.map((s, idx) => (
                  <SortableItem key={s.id} id={s.id}>
                    {({ handleProps, setNodeRef, style }) => (
                      <AdminListRow
                        ref={setNodeRef as any}
                        style={style}
                        id={s.id}
                        table="page_content"
                        dragHandleProps={handleProps}
                        reorderControls={sections.length > 1 ? (
                          <ReorderControls
                            position={idx + 1}
                            total={sections.length}
                            others={sections
                              .filter((o) => o.id !== s.id)
                              .map((o) => ({ id: o.id, label: String(o.data?.title_ar || o.data?.title_en || o.data?.block_type || "قسم") }))}
                            onMoveUp={() => reorderByPosition(s.id, idx)}
                            onMoveDown={() => reorderByPosition(s.id, idx + 2)}
                            onSetPosition={(pos) => reorderByPosition(s.id, pos)}
                            onMoveToStart={() => reorderByPosition(s.id, 1)}
                            onMoveToEnd={() => reorderByPosition(s.id, sections.length)}
                            onMoveRelative={(targetId, where) => moveRelative(s.id, targetId, where)}
                          />
                        ) : undefined}
                        title={s.data?.block_type ?? "قسم"}
                        subtitle={s.data?.title_ar || s.data?.title_en || undefined}
                        published={s.published}
                        onTogglePublished={(next) => update(s.id, { published: next })}
                        onDelete={async () => {
                          if (!confirm("حذف هذا القسم نهائياً؟")) return;
                          const { error } = await supabase.from("page_content").delete().eq("id", s.id);
                          if (error) toast.error(error.message); else { toast.success("تم الحذف"); load(); }
                        }}
                      >
                        <CardContent className="border-t pt-4 space-y-3">
                          <BlockEditor
                            data={s.data || {}}
                            onChange={(next) => update(s.id, { data: next })}
                            folder={`custom/${pageId}`}
                          />
                          <div className="flex justify-end">
                            <Button size="sm" onClick={() => save(s)} disabled={savingId === s.id}>
                              {savingId === s.id ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Save className="w-4 h-4 ml-1" />}
                              حفظ
                            </Button>
                          </div>
                        </CardContent>
                      </AdminListRow>
                    )}
                  </SortableItem>
                ))}
              </SortableList>
            );
          })()}
        </>
      )}
    </AdminLayout>
  );
}
