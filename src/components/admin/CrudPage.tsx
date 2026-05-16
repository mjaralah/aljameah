import { ReactNode, useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Pencil, Trash2, Search, Loader2, Eye, EyeOff, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  };
};

type SortableRowProps<T extends { id: string; published?: boolean }> = {
  row: T;
  columns: Column<T>[];
  reorderable: boolean;
  onEdit: (r: T) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (r: T) => void;
};

function SortableRow<T extends { id: string; published?: boolean }>({
  row, columns, reorderable, onEdit, onDelete, onTogglePublish,
}: SortableRowProps<T>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
    disabled: !reorderable,
  });
  const isHidden = row.published === false;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : isHidden ? 0.55 : 1,
    background: isDragging ? "hsl(var(--muted))" : undefined,
  };
  return (
    <tr ref={setNodeRef} style={style} className="border-b last:border-0 hover:bg-muted/20">
      {reorderable && (
        <td className="px-2 py-3 w-10">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 touch-none"
            aria-label="سحب لإعادة الترتيب"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        </td>
      )}
      {columns.map((c) => (
        <td key={String(c.key)} className={`px-4 py-3 ${c.className ?? ""}`}>
          {c.render ? c.render(row) : String(row[c.key as keyof T] ?? "—")}
        </td>
      ))}
      <td className="px-4 py-3">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant={row.published ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => onTogglePublish(row)}
              >
                {row.published ? (
                  <><Eye className="w-3 h-3 ml-1" />منشور</>
                ) : (
                  <><EyeOff className="w-3 h-3 ml-1" />مسودة</>
                )}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>{row.published ? "اضغط للإخفاء" : "اضغط للنشر"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(row)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(row.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export function CrudPage<T extends { id: string; published?: boolean }>({
  table,
  title,
  description,
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
    categoryFilter?.options[0]?.value ?? "",
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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
    if (categoryFilter && activeCategory) {
      r = r.filter((row) => String(row[categoryFilter.field] ?? "") === activeCategory);
    }
    if (searchField && search) {
      r = r.filter((row) =>
        String(row[searchField as keyof T] ?? "").toLowerCase().includes(search.toLowerCase()),
      );
    }
    return r;
  }, [rows, search, searchField, categoryFilter, activeCategory]);

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

  async function togglePublish(row: T) {
    const { error } = await supabase
      .from(table)
      .update({ published: !row.published } as never)
      .eq("id", row.id);
    if (error) toast.error(error.message);
    else load();
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filtered.findIndex((r) => r.id === active.id);
    const newIndex = filtered.findIndex((r) => r.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedSubset = arrayMove(filtered, oldIndex, newIndex);

    // Merge back into full rows preserving non-visible rows positions
    const subsetIds = new Set(filtered.map((r) => r.id));
    const newRows: T[] = [];
    let subsetCursor = 0;
    for (const r of rows) {
      if (subsetIds.has(r.id)) {
        newRows.push(reorderedSubset[subsetCursor++]);
      } else {
        newRows.push(r);
      }
    }

    // Optimistic update
    setRows(newRows);

    // Persist sort_order for the affected subset (10-step gaps)
    const updates = reorderedSubset.map((r, i) => ({ id: r.id, sort_order: (i + 1) * 10 }));
    try {
      await Promise.all(
        updates.map((u) =>
          supabase.from(table).update({ sort_order: u.sort_order } as never).eq("id", u.id),
        ),
      );
      toast.success("تم تحديث الترتيب");
    } catch (e) {
      toast.error("تعذر حفظ الترتيب");
      load();
    }
  }

  function setValue<K extends keyof T>(key: K, value: T[K]) {
    setEditing((prev) => ({ ...(prev ?? {}), [key]: value }) as Partial<T>);
  }

  return (
    <AdminLayout
      title={title}
      description={description}
      actions={
        <Button onClick={() => setEditing(createDefaults())} size="sm">
          <Plus className="w-4 h-4 ml-1" />
          إضافة
        </Button>
      }
    >
      <div className="space-y-4">
        {categoryFilter && (
          <div className="flex flex-wrap gap-2">
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
          </div>
        )}

        {searchField && (
          <div className="relative max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9"
            />
          </div>
        )}

        {reorderable && filtered.length > 1 && (
          <p className="text-xs text-muted-foreground">
            اسحب أيقونة <GripVertical className="inline w-3 h-3" /> لإعادة ترتيب العناصر. يُحفظ الترتيب تلقائياً.
          </p>
        )}

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                {emptyState}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 border-b">
                      <tr>
                        {reorderable && <th className="w-10" />}
                        {columns.map((c) => (
                          <th
                            key={String(c.key)}
                            className={`px-4 py-3 text-right font-medium text-muted-foreground ${c.className ?? ""}`}
                          >
                            {c.label}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground w-32">
                          الحالة
                        </th>
                        <th className="px-4 py-3 w-32" />
                      </tr>
                    </thead>
                    <SortableContext
                      items={filtered.map((r) => r.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <tbody>
                        {filtered.map((row) => (
                          <SortableRow<T>
                            key={row.id}
                            row={row}
                            columns={columns}
                            reorderable={reorderable}
                            onEdit={(r) => setEditing(r)}
                            onDelete={(id) => setDeleteId(id)}
                            onTogglePublish={togglePublish}
                          />
                        ))}
                      </tbody>
                    </SortableContext>
                  </table>
                </DndContext>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? "تعديل" : "إضافة جديد"}
            </DialogTitle>
            <DialogDescription>
              املأ الحقول التالية واحفظ.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              {renderForm(editing, setValue)}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 ml-1 animate-spin" />}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
