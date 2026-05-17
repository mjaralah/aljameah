import { ReactNode, useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Eye, Download, Inbox, type LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminDataTable, type DataTableColumn } from "@/components/admin/AdminDataTable";

const STATUSES = [
  { value: "new", label: "جديد", tone: "info" as const },
  { value: "in_review", label: "قيد المراجعة", tone: "warning" as const },
  { value: "approved", label: "مقبول", tone: "success" as const },
  { value: "rejected", label: "مرفوض", tone: "destructive" as const },
  { value: "archived", label: "مؤرشف", tone: "muted" as const },
];

const statusInfo = (s: string) =>
  STATUSES.find((x) => x.value === s) ?? { label: s, tone: "muted" as const };

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
  table, title, description, icon, searchFields, columns, detailFields, csvHeaders,
}: {
  table: "volunteer_requests" | "membership_requests" | "contact_messages";
  title: string;
  description: string;
  icon?: LucideIcon;
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

  const dataCols: DataTableColumn<T>[] = [
    ...columns.map((c) => ({
      key: String(c.key),
      label: c.label,
      render: c.render ? (r: T) => c.render!(r) : undefined,
    })),
    {
      key: "created_at",
      label: "التاريخ",
      width: "140px",
      render: (r: T) => (
        <span className="text-muted-foreground text-xs">
          {new Date(r.created_at).toLocaleDateString("ar-SA")}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout title={title}>
      <AdminPageHeader
        title={title}
        description={description}
        icon={icon ?? Inbox}
        action={
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 ml-1" />
            تصدير CSV
          </Button>
        }
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="بحث في الطلبات..."
      />

      <AdminListToolbar
        countLabel={!loading ? `${filtered.length} طلباً` : undefined}
        chips={[
          { value: "all", label: "الكل", count: counts.all ?? 0 },
          ...STATUSES.map((s) => ({ value: s.value, label: s.label, count: counts[s.value] ?? 0 })),
        ]}
        activeChip={statusFilter}
        onChipChange={setStatusFilter}
      />

      <AdminDataTable<T>
        rows={filtered}
        loading={loading}
        columns={dataCols}
        statusColumn={{
          key: "status",
          label: "الحالة",
          getStatus: (r) => statusInfo(r.status),
        }}
        actions={[
          { icon: Eye, label: "عرض التفاصيل", onClick: (r) => setSelected(r), variant: "view" },
          { icon: Trash2, label: "حذف", onClick: (r) => setDeleteId(r.id), variant: "delete" },
        ]}
        onRowClick={(r) => setSelected(r)}
        emptyState={
          <AdminEmptyState
            icon={Inbox}
            title={rows.length === 0 ? "لا توجد طلبات بعد" : "لا توجد طلبات تطابق الفلتر"}
            description={rows.length === 0 ? "ستظهر الطلبات الواردة هنا فور وصولها." : "جرّب تغيير الحالة أو البحث."}
          />
        }
      />

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
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/30 bg-destructive/5 hover:bg-destructive/10" onClick={() => setDeleteId(selected.id)}>
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
