import { ReactNode, useEffect, useState } from "react";
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
import { Plus, Pencil, Trash2, Search, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
};

export type CrudPageProps<T extends { id: string; published?: boolean }> = {
  table: "news" | "programs" | "board_members" | "partners" | "hero_slides" | "custom_pages" | "governance_documents";
  title: string;
  description?: string;
  columns: Column<T>[];
  searchField?: keyof T;
  emptyState?: string;
  /** Render the form fields for add/edit. Receives current values & setter. */
  renderForm: (
    values: Partial<T>,
    setValue: <K extends keyof T>(key: K, value: T[K]) => void,
  ) => ReactNode;
  /** Validate before save. Return error string or null. */
  validate?: (values: Partial<T>) => string | null;
  /** Create initial row defaults. */
  createDefaults: () => Partial<T>;
  orderBy?: { column: string; ascending?: boolean };
};

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
}: CrudPageProps<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<T> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const filtered = searchField && search
    ? rows.filter((r) =>
        String(r[searchField as keyof T] ?? "")
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : rows;

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
    if (error) {
      toast.error(error.message);
    } else {
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
    if (error) {
      toast.error(error.message);
    } else {
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
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b">
                    <tr>
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
                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row.id} className="border-b last:border-0 hover:bg-muted/20">
                        {columns.map((c) => (
                          <td key={String(c.key)} className={`px-4 py-3 ${c.className ?? ""}`}>
                            {c.render ? c.render(row) : String(row[c.key as keyof T] ?? "—")}
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          <Badge variant={row.published ? "default" : "secondary"} className="cursor-pointer" onClick={() => togglePublish(row)}>
                            {row.published ? (
                              <><Eye className="w-3 h-3 ml-1" />منشور</>
                            ) : (
                              <><EyeOff className="w-3 h-3 ml-1" />مخفي</>
                            )}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => setEditing(row)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(row.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
