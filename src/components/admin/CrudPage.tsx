import { ReactNode, useEffect, useMemo, useState } from "react";
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
      load();
    }
    setDeleteId(null);
  }

  async function handleReorder(newIds: string[]) {
    const subsetIds = new Set(newIds);
    const reorderedSubset = newIds
      .map((id) => filtered.find((r) => r.id === id))
      .filter(Boolean) as T[];
    const newRows: T[] = [];
    let cursor = 0;
    for (const r of rows) {
      if (subsetIds.has(r.id)) newRows.push(reorderedSubset[cursor++]);
      else newRows.push(r);
    }
    setRows(newRows);
    try {
      await persistSortOrder(supabase, table, newIds);
      toast.success("تم تحديث الترتيب");
    } catch {
      toast.error("تعذر حفظ الترتيب");
      load();
    }
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

  return (
    <AdminLayout title={title}>
      <AdminPageHeader
        title={title}
        description={description}
        icon={icon}
        action={
          <Button onClick={() => setEditing(createDefaults())}>
            <Plus className="w-4 h-4 ml-1" />
            إضافة
          </Button>
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

      {reorderable && filtered.length > 1 && (
        <p className="text-xs text-muted-foreground mb-3 px-1">
          اسحب أيقونة <GripVertical className="inline w-3 h-3" /> لإعادة ترتيب العناصر. يُحفظ الترتيب تلقائياً.
        </p>
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
            {filtered.map((row) => (
              <SortableItem key={row.id} id={row.id} disabled={!reorderable || activeCategory === "__all__"}>
                {({ handleProps, setNodeRef, style }) => {
                  const allView = activeCategory === "__all__";
                  return (
                  <AdminListRow
                    ref={setNodeRef as any}
                    style={style}
                    id={row.id}
                    table={table}
                    showDragHandle={reorderable && !allView}
                    dragHandleProps={handleProps}
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
                    onTogglePublished={() => load()}
                    onEdit={() => setEditing(row)}
                    onDelete={() => setDeleteId(row.id)}
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
    </AdminLayout>
  );
}
