import { ReactNode, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Loader2, GripVertical, FolderOpen, type LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SortableList, SortableItem, persistSortOrder } from "@/components/admin/SortableList";
import { AdminListRow } from "@/components/admin/AdminListRow";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { AdminDialog } from "@/components/admin/AdminDialog";
import { ReorderControls } from "@/components/admin/ReorderControls";
import { BulkActionsBar } from "@/components/admin/BulkActionsBar";

export type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
};

export type CrudPageProps<T extends { id: string; published?: boolean }> = {
  table: "news" | "programs" | "board_members" | "partners" | "hero_slides" | "custom_pages" | "governance_documents" | "about_content" | "surveys" | "legal_pages";
  title: string;
  description?: string;
  icon?: LucideIcon;
  columns: Column<T>[];
  searchField?: keyof T;
  emptyState?: string;
  renderForm: (
    values: Partial<T>,
    setValue: <K extends keyof T>(key: K, value: T[K]) => void,
  ) => ReactNode;
  validate?: (values: Partial<T>) => string | null;
  createDefaults: () => Partial<T>;
  orderBy?: { column: string; ascending?: boolean };
  /** Enable drag-and-drop reordering (writes sort_order to DB). */
  reorderable?: boolean;
  /** Optional category filter — restricts reordering to one category at a time. */
  categoryFilter?: {
    field: keyof T;
    label?: string;
    options: { value: string; label: string }[];
    /** Show an "All" tab that disables filter and allows search across categories. */
    includeAll?: boolean;
    /** Label for the "All" tab. */
    allLabel?: string;
    /** Extra slot rendered next to the category tabs (e.g. "Manage categories" button). */
    extraAction?: ReactNode;
  };
  /** Extra actions shown in the dialog footer between Cancel and Save */
  extraDialogActions?: ReactNode | ((values: Partial<T>) => ReactNode);
  /** Extra action button(s) shown in the page header next to the primary "Add" button. */
  headerAction?: ReactNode;
  /** Skip wrapping in AdminLayout (when this page is rendered inside another AdminLayout). */
  noLayout?: boolean;
};



function isImageKey(k: string) {
  return /image_url$|logo_url$|photo_url$|avatar_url$|cover/.test(k);
}

export function CrudPage<T extends { id: string; published?: boolean }>({
  table,
  title,
  description,
  icon,
  columns,
  searchField,
  emptyState = "لا توجد عناصر بعد. ابدأ بإضافة عنصر جديد.",
  renderForm,
  validate,
  createDefaults,
  orderBy = { column: "sort_order", ascending: true },
  reorderable = false,
  categoryFilter,
  extraDialogActions,
  headerAction,
  noLayout = false,
}: CrudPageProps<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<T> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(
    categoryFilter?.includeAll ? "__all__" : (categoryFilter?.options[0]?.value ?? ""),
  );
  const [publishedFilter, setPublishedFilter] = useState<"all" | "published" | "draft">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const queryClient = useQueryClient();

  // إبطال كاش الموقع العام بعد أي تعديل، حتى تظهر التغييرات للزوار فوراً بدلاً من انتظار انتهاء صلاحية الكاش.
  function invalidatePublic() {
    queryClient.invalidateQueries({ queryKey: ["public"] });
  }


  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order(orderBy.column, { ascending: orderBy.ascending ?? true });
    if (error) toast.error(error.message);
    setRows((data ?? []) as unknown as T[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  const filtered = useMemo(() => {
    let r = rows;
    if (categoryFilter && activeCategory && activeCategory !== "__all__") {
      r = r.filter((row) => String(row[categoryFilter.field] ?? "") === activeCategory);
    }
    if (publishedFilter === "published") r = r.filter((row) => row.published);
    else if (publishedFilter === "draft") r = r.filter((row) => !row.published);
    if (searchField && search) {
      r = r.filter((row) =>
        String(row[searchField as keyof T] ?? "").toLowerCase().includes(search.toLowerCase()),
      );
    }
    return r;
  }, [rows, search, searchField, categoryFilter, activeCategory, publishedFilter]);

  const publishedCount = rows.filter((r) => r.published).length;
  const draftCount = rows.length - publishedCount;

  // امسح التحديد عند تغيير الفلاتر/البحث/التصنيف لمنع تنفيذ إجراءات على عناصر مخفية.
  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeCategory, publishedFilter, search]);

  const filteredIds = useMemo(() => filtered.map((r) => r.id), [filtered]);
  const visibleSelectedCount = filteredIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = filteredIds.length > 0 && visibleSelectedCount === filteredIds.length;

  function toggleSelect(id: string, next: boolean) {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      if (next) s.add(id); else s.delete(id);
      return s;
    });
  }
  function toggleSelectAll(next: boolean) {
    setSelectedIds(next ? new Set(filteredIds) : new Set());
  }
  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function bulkSetPublished(next: boolean) {
    const ids = Array.from(selectedIds).filter((id) => filteredIds.includes(id));
    if (ids.length === 0) return;
    setBulkBusy(true);
    const { error } = await supabase.from(table).update({ published: next } as never).in("id", ids);
    setBulkBusy(false);
    if (error) return toast.error(error.message);
    toast.success(next ? `تم نشر ${ids.length} عنصراً` : `تم إخفاء ${ids.length} عنصراً`);
    clearSelection();
    invalidatePublic();
    load();
  }

  async function bulkDelete() {
    const ids = Array.from(selectedIds).filter((id) => filteredIds.includes(id));
    if (ids.length === 0) return;
    setBulkBusy(true);
    const { error } = await supabase.from(table).delete().in("id", ids);
    setBulkBusy(false);
    setBulkDeleteOpen(false);
    if (error) return toast.error(error.message);
    toast.success(`تم حذف ${ids.length} عنصراً`);
    clearSelection();
    invalidatePublic();
    load();
  }


  async function handleSave() {
    if (!editing) return;
    if (validate) {
      const err = validate(editing);
      if (err) {
        toast.error(err);
        return;
      }
    }
    setSaving(true);
    try {
      if (editing.id) {
        const { id, ...rest } = editing as { id: string } & Record<string, unknown>;
        const { error } = await supabase.from(table).update(rest as never).eq("id", id);
        if (error) throw error;
        toast.success("تم الحفظ");
      } else {
        const { error } = await supabase.from(table).insert(editing as never);
        if (error) throw error;
        toast.success("تمت الإضافة");
      }
      setEditing(null);
      invalidatePublic();
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from(table).delete().eq("id", deleteId);
    if (error) toast.error(error.message);
    else {
      toast.success("تم الحذف");
      invalidatePublic();
      load();
    }
    setDeleteId(null);
  }

  async function handleReorder(newIds: string[]) {
    const subsetIds = new Set(newIds);
    const reorderedSubset = newIds
      .map((id) => filtered.find((r) => r.id === id))
      .filter(Boolean) as T[];
    // Assign new sort_order values (10-step gaps) so the in-memory order
    // matches what's persisted and React doesn't silently revert on next sort.
    const orderMap = new Map(newIds.map((id, i) => [id, (i + 1) * 10]));
    const newRows: T[] = [];
    let cursor = 0;
    for (const r of rows) {
      if (subsetIds.has(r.id)) {
        const next = reorderedSubset[cursor++];
        newRows.push({ ...next, sort_order: orderMap.get(next.id) } as T);
      } else {
        newRows.push(r);
      }
    }
    setRows(newRows);
    try {
      await persistSortOrder(supabase, table, newIds);
      invalidatePublic();
      toast.success("تم تحديث الترتيب");
    } catch {
      toast.error("تعذر حفظ الترتيب");
      load();
    }
  }

  function reorderByPosition(rowId: string, newPos1: number) {
    const ids = filtered.map((r) => r.id);
    const oldIdx = ids.indexOf(rowId);
    if (oldIdx === -1) return;
    const target = Math.max(0, Math.min(ids.length - 1, newPos1 - 1));
    if (target === oldIdx) return;
    const next = [...ids];
    const [moved] = next.splice(oldIdx, 1);
    next.splice(target, 0, moved);
    handleReorder(next);
  }

  function moveRelative(rowId: string, targetId: string, where: "before" | "after") {
    const ids = filtered.map((r) => r.id);
    const oldIdx = ids.indexOf(rowId);
    let targetIdx = ids.indexOf(targetId);
    if (oldIdx === -1 || targetIdx === -1 || rowId === targetId) return;
    const next = [...ids];
    next.splice(oldIdx, 1);
    targetIdx = next.indexOf(targetId);
    next.splice(where === "before" ? targetIdx : targetIdx + 1, 0, rowId);
    handleReorder(next);
  }

  function setValue<K extends keyof T>(key: K, value: T[K]) {
    setEditing((prev) => ({ ...(prev ?? {}), [key]: value }) as Partial<T>);
  }

  const thumbCol = columns.find((c) => isImageKey(String(c.key)));
  const restCols = columns.filter((c) => c !== thumbCol);
  const titleCol = restCols[0];
  const subtitleCols = restCols.slice(1);

  function renderCol(c: typeof columns[number], row: T): ReactNode {
    return c.render ? c.render(row) : (row[c.key as keyof T] as ReactNode) ?? "—";
  }

  const content = (
    <>

      <AdminPageHeader
        title={title}
        description={description}
        icon={icon}
        action={
          <div className="flex items-center gap-2">
            {headerAction}
            <Button onClick={() => setEditing(createDefaults())}>
              <Plus className="w-4 h-4 ml-1" />
              إضافة
            </Button>
          </div>
        }
        searchValue={searchField ? search : undefined}
        onSearchChange={searchField ? setSearch : undefined}
        extra={
          categoryFilter && (
            <div className="flex flex-wrap items-center gap-1.5">
              {categoryFilter.includeAll && (() => {
                const active = activeCategory === "__all__";
                return (
                  <button
                    type="button"
                    onClick={() => setActiveCategory("__all__")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-border text-muted-foreground"
                    }`}
                  >
                    {categoryFilter.allLabel ?? "الكل"}
                    <span className={`ms-2 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-[10px] ${active ? "bg-primary-foreground/20" : "bg-muted"}`}>
                      {rows.length}
                    </span>
                  </button>
                );
              })()}
              {categoryFilter.options.map((opt) => {
                const count = rows.filter(
                  (r) => String(r[categoryFilter.field] ?? "") === opt.value,
                ).length;
                const active = opt.value === activeCategory;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setActiveCategory(opt.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-border text-muted-foreground"
                    }`}
                  >
                    {opt.label}
                    <span className={`ms-2 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-[10px] ${active ? "bg-primary-foreground/20" : "bg-muted"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
              {categoryFilter.extraAction}
            </div>
          )
        }
      />

      <AdminListToolbar
        countLabel={!loading ? `${filtered.length} عنصراً` : undefined}
        chips={
          rows.length > 0
            ? [
                { value: "all", label: "الكل", count: rows.length },
                { value: "published", label: "منشور", count: publishedCount },
                { value: "draft", label: "مسودة", count: draftCount },
              ]
            : undefined
        }
        activeChip={publishedFilter}
        onChipChange={(v) => setPublishedFilter(v as typeof publishedFilter)}
      />

      {reorderable && filtered.length > 1 && activeCategory !== "__all__" && (
        <p className="text-xs text-muted-foreground mb-3 px-1">
          استخدم الأسهم <span className="inline-block">▲▼</span> أو حقل الرقم لتغيير الترتيب، أو اسحب أيقونة <GripVertical className="inline w-3 h-3" />. يُحفظ الترتيب تلقائياً.
        </p>
      )}

      {!loading && filtered.length > 0 && (
        <BulkActionsBar
          count={visibleSelectedCount}
          total={filtered.length}
          allSelected={allVisibleSelected}
          onToggleAll={toggleSelectAll}
          onClear={clearSelection}
          onPublish={() => bulkSetPublished(true)}
          onUnpublish={() => bulkSetPublished(false)}
          onDelete={() => setBulkDeleteOpen(true)}
          busy={bulkBusy}
        />
      )}


      {loading ? (
        <Card><CardContent className="p-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent></Card>
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          icon={FolderOpen}
          title={rows.length === 0 ? emptyState : "لا توجد عناصر تطابق الفلتر"}
          description={rows.length === 0 ? "اضغط على زر «إضافة» في الأعلى لإنشاء أول عنصر." : "جرّب تغيير الفلتر أو البحث."}
          actionLabel={rows.length === 0 ? "إضافة عنصر" : undefined}
          onAction={rows.length === 0 ? () => setEditing(createDefaults()) : undefined}
        />
      ) : (
        <SortableList ids={filtered.map((r) => r.id)} onReorder={handleReorder}>
          <div className="space-y-2">
            {filtered.map((row, idx) => (
              <SortableItem key={row.id} id={row.id} disabled={!reorderable || activeCategory === "__all__"}>
                {({ handleProps, setNodeRef, style }) => {
                  const allView = activeCategory === "__all__";
                  const canReorder = reorderable && !allView && filtered.length > 1;
                  return (
                  <AdminListRow
                    ref={setNodeRef as any}
                    style={style}
                    id={row.id}
                    table={table}
                    showDragHandle={reorderable && !allView}
                    dragHandleProps={handleProps}
                    reorderControls={canReorder ? (
                      <ReorderControls
                        position={idx + 1}
                        total={filtered.length}
                        others={filtered
                          .filter((r) => r.id !== row.id)
                          .map((r) => ({
                            id: r.id,
                            label: String(titleCol ? (r[titleCol.key as keyof T] ?? "") : r.id),
                          }))}
                        onMoveUp={() => reorderByPosition(row.id, idx)}
                        onMoveDown={() => reorderByPosition(row.id, idx + 2)}
                        onSetPosition={(pos) => reorderByPosition(row.id, pos)}
                        onMoveToStart={() => reorderByPosition(row.id, 1)}
                        onMoveToEnd={() => reorderByPosition(row.id, filtered.length)}
                        onMoveRelative={(targetId, where) => moveRelative(row.id, targetId, where)}
                      />
                    ) : undefined}
                    thumbnail={thumbCol ? renderCol(thumbCol, row) : undefined}
                    title={titleCol ? renderCol(titleCol, row) : "—"}
                    subtitle={
                      subtitleCols.length > 0 ? (
                        <span className="flex flex-wrap items-center gap-x-2">
                          {subtitleCols.map((c, i) => (
                            <span key={String(c.key)} className="inline-flex items-center gap-1">
                              {i > 0 && <span className="opacity-50">·</span>}
                              <span className="opacity-70">{c.label}:</span>
                              <span>{renderCol(c, row)}</span>
                            </span>
                          ))}
                        </span>
                      ) : undefined
                    }
                    published={!!row.published}
                    onTogglePublished={() => { invalidatePublic(); load(); }}
                    onEdit={() => setEditing(row)}
                    onDelete={() => setDeleteId(row.id)}
                    selectable
                    selected={selectedIds.has(row.id)}
                    onSelectChange={(next) => toggleSelect(row.id, next)}
                  />

                  );
                }}
              </SortableItem>
            ))}
          </div>
        </SortableList>
      )}

      <AdminDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing?.id ? "تعديل" : "إضافة جديد"}
        description="املأ الحقول التالية واحفظ."
        onSave={handleSave}
        saving={saving}
        size="lg"
        extraActions={
          typeof extraDialogActions === "function"
            ? (extraDialogActions as any)(editing ?? {})
            : extraDialogActions
        }
      >
        {editing && renderForm(editing, setValue)}
      </AdminDialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء. سيتم حذف العنصر نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={(o) => { if (!o && !bulkBusy) setBulkDeleteOpen(false); }}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف المجمّع</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  سيتم حذف <span className="font-bold text-destructive">{visibleSelectedCount}</span> عنصراً نهائياً. لا يمكن التراجع عن هذا الإجراء.
                </p>
                {(() => {
                  const selectedRows = filtered.filter((r) => selectedIds.has(r.id));
                  const preview = selectedRows.slice(0, 3);
                  const extra = selectedRows.length - preview.length;
                  return (
                    <ul className="text-xs text-muted-foreground list-disc pr-5 space-y-0.5">
                      {preview.map((r) => (
                        <li key={r.id} className="line-clamp-1">
                          {titleCol ? String(r[titleCol.key as keyof T] ?? r.id) : r.id}
                        </li>
                      ))}
                      {extra > 0 && <li>و{extra} {extra === 1 ? "عنصر آخر" : "عناصر أخرى"}</li>}
                    </ul>
                  );
                })()}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={bulkBusy}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); bulkDelete(); }}
              disabled={bulkBusy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkBusy ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : null}
              حذف الكل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Wrapper>

  );
}
