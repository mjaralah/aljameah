import { ReactNode, useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { Label } from "@/components/ui/label";
import { Search, Loader2, Trash2, Eye, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STATUSES = [
  { value: "new", label: "جديد", variant: "default" as const },
  { value: "in_review", label: "قيد المراجعة", variant: "secondary" as const },
  { value: "approved", label: "مقبول", variant: "default" as const },
  { value: "rejected", label: "مرفوض", variant: "destructive" as const },
  { value: "archived", label: "مؤرشف", variant: "outline" as const },
];

const statusLabel = (s: string) => STATUSES.find((x) => x.value === s)?.label ?? s;
const statusVariant = (s: string) =>
  STATUSES.find((x) => x.value === s)?.variant ?? ("secondary" as const);

export type RequestField<T> = {
  key: keyof T;
  label: string;
  format?: (v: unknown) => string;
};

type RequestRow = {
  id: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  [key: string]: unknown;
};

export function RequestsPage<T extends RequestRow>({
  table,
  title,
  description,
  searchFields,
  columns,
  detailFields,
  csvHeaders,
}: {
  table: "volunteer_requests" | "membership_requests" | "contact_messages";
  title: string;
  description: string;
  searchFields: (keyof T)[];
  columns: { key: keyof T; label: string; render?: (r: T) => ReactNode }[];
  detailFields: RequestField<T>[];
  csvHeaders: { key: keyof T; label: string }[];
}) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<T | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as unknown as T[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return searchFields.some((f) =>
        String(r[f] ?? "").toLowerCase().includes(q),
      );
    });
  }, [rows, search, statusFilter, searchFields]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const s of STATUSES) c[s.value] = 0;
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from(table).update({ status } as never).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("تم تحديث الحالة");
      load();
      if (selected?.id === id) setSelected({ ...selected, status } as T);
    }
  }

  async function saveNotes() {
    if (!selected) return;
    setSavingNotes(true);
    const { error } = await supabase
      .from(table)
      .update({ admin_notes: selected.admin_notes } as never)
      .eq("id", selected.id);
    setSavingNotes(false);
    if (error) toast.error(error.message);
    else {
      toast.success("تم حفظ الملاحظات");
      load();
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
    setSelected(null);
  }

  function exportCSV() {
    const header = csvHeaders.map((h) => h.label).join(",");
    const lines = filtered.map((r) =>
      csvHeaders
        .map((h) => {
          const v = r[h.key];
          const s = String(v ?? "").replace(/"/g, '""');
          return `"${s}"`;
        })
        .join(","),
    );
    const csv = "\uFEFF" + [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${table}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <AdminLayout
      title={title}
      description={description}
      actions={
        <Button size="sm" variant="outline" onClick={exportCSV}>
          <Download className="w-4 h-4 ml-1" />
          تصدير CSV
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Status tabs */}
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="الكل"
            count={counts.all}
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          />
          {STATUSES.map((s) => (
            <FilterChip
              key={s.value}
              label={s.label}
              count={counts[s.value] ?? 0}
              active={statusFilter === s.value}
              onClick={() => setStatusFilter(s.value)}
            />
          ))}
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                لا توجد طلبات بعد.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b">
                    <tr>
                      {columns.map((c) => (
                        <th key={String(c.key)} className="px-4 py-3 text-right font-medium text-muted-foreground">
                          {c.label}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">التاريخ</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground w-32">الحالة</th>
                      <th className="px-4 py-3 w-20" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b last:border-0 hover:bg-muted/20 cursor-pointer"
                        onClick={() => setSelected(r)}
                      >
                        {columns.map((c) => (
                          <td key={String(c.key)} className="px-4 py-3">
                            {c.render ? c.render(r) : String(r[c.key] ?? "—")}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {new Date(r.created_at).toLocaleDateString("ar-SA")}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant(r.status)}>{statusLabel(r.status)}</Badge>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setSelected(r)}>
                            <Eye className="w-4 h-4" />
                          </Button>
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

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent dir="rtl" side="left" className="w-full sm:max-w-xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>تفاصيل الطلب</SheetTitle>
                <SheetDescription>
                  مُقدَّم في {new Date(selected.created_at).toLocaleString("ar-SA")}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5 mt-6">
                <div className="flex items-center gap-2">
                  <Label className="min-w-20">الحالة:</Label>
                  <Select value={selected.status} onValueChange={(v) => updateStatus(selected.id, v)}>
                    <SelectTrigger className="max-w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg border divide-y">
                  {detailFields.map((f) => {
                    const raw = selected[f.key];
                    const val = f.format ? f.format(raw) : (raw ? String(raw) : "—");
                    return (
                      <div key={String(f.key)} className="px-4 py-2.5 grid grid-cols-3 gap-2 text-sm">
                        <span className="text-muted-foreground">{f.label}</span>
                        <span className="col-span-2 font-medium break-words">{val}</span>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <Label>ملاحظات الإدارة</Label>
                  <Textarea
                    rows={4}
                    value={selected.admin_notes ?? ""}
                    onChange={(e) => setSelected({ ...selected, admin_notes: e.target.value } as T)}
                    placeholder="ملاحظات داخلية للفريق..."
                    className="mt-1"
                  />
                  <Button onClick={saveNotes} size="sm" className="mt-2" disabled={savingNotes}>
                    {savingNotes && <Loader2 className="w-4 h-4 ml-1 animate-spin" />}
                    حفظ الملاحظات
                  </Button>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteId(selected.id)}>
                    <Trash2 className="w-4 h-4 ml-1" />
                    حذف الطلب
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف الطلب نهائياً.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

function FilterChip({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
        active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-border"
      }`}
    >
      {label}
      <span className={`mr-1.5 text-xs ${active ? "opacity-90" : "text-muted-foreground"}`}>({count})</span>
    </button>
  );
}
