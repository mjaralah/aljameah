import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Trash2, MessageSquareHeart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminDataTable } from "@/components/admin/AdminDataTable";

type FeedbackRow = {
  id: string;
  page_path: string;
  helpful: boolean;
  comment: string | null;
  created_at: string;
};

export default function AdminFeedbackPage() {
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("page_feedback")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as FeedbackRow[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const total = rows.length;
  const helpful = rows.filter((r) => r.helpful).length;
  const ratio = total ? Math.round((helpful / total) * 100) : 0;

  async function remove(id: string) {
    const { error } = await supabase.from("page_feedback").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("تم الحذف"); load(); }
  }

  return (
    <AdminLayout title="تقييمات الصفحات">
      <AdminPageHeader
        title="تقييمات الصفحات"
        description="ملاحظات الزوار على صفحات الموقع"
        icon={MessageSquareHeart}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Card><CardContent className="p-5">
          <p className="text-sm text-muted-foreground">إجمالي التقييمات</p>
          <p className="text-3xl font-bold mt-1">{total}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-muted-foreground">مفيدة</p>
          <p className="text-3xl font-bold mt-1 text-success">{helpful}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-muted-foreground">نسبة الرضا</p>
          <p className="text-3xl font-bold mt-1">{ratio}%</p>
        </CardContent></Card>
      </div>

      <AdminDataTable<FeedbackRow>
        rows={rows}
        loading={loading}
        columns={[
          { key: "page_path", label: "الصفحة", render: (r) => <code className="text-xs font-mono">{r.page_path}</code> },
          { key: "comment", label: "التعليق", render: (r) => <span className="text-muted-foreground">{r.comment || "—"}</span> },
          {
            key: "created_at", label: "التاريخ", width: "140px",
            render: (r) => <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("ar-SA")}</span>,
          },
        ]}
        statusColumn={{
          key: "helpful", label: "التقييم",
          getStatus: (r) => r.helpful
            ? { label: "مفيدة", tone: "success" }
            : { label: "غير مفيدة", tone: "destructive" },
        }}
        actions={[
          { icon: Trash2, label: "حذف", onClick: (r) => remove(r.id), variant: "delete" },
        ]}
        emptyState={
          <AdminEmptyState
            icon={ThumbsUp}
            title="لا توجد تقييمات بعد"
            description="ستظهر تقييمات الزوار للصفحات هنا."
          />
        }
      />
    </AdminLayout>
  );
}
