import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ThumbsUp, ThumbsDown, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  useEffect(() => {
    load();
  }, []);

  const total = rows.length;
  const helpful = rows.filter((r) => r.helpful).length;
  const ratio = total ? Math.round((helpful / total) * 100) : 0;

  async function remove(id: string) {
    const { error } = await supabase.from("page_feedback").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("تم الحذف");
      load();
    }
  }

  return (
    <AdminLayout title="تقييمات الصفحات" description="ملاحظات الزوار على صفحات الموقع">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardContent className="p-5">
            <p className="text-sm text-muted-foreground">إجمالي التقييمات</p>
            <p className="text-3xl font-bold mt-1">{total}</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <p className="text-sm text-muted-foreground">مفيدة</p>
            <p className="text-3xl font-bold mt-1 text-emerald-600">{helpful}</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <p className="text-sm text-muted-foreground">نسبة الرضا</p>
            <p className="text-3xl font-bold mt-1">{ratio}%</p>
          </CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : rows.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">لا توجد تقييمات بعد.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b">
                    <tr>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">الصفحة</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">التقييم</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">التعليق</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">التاريخ</th>
                      <th className="px-4 py-3 w-16" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="px-4 py-3 font-mono text-xs">{r.page_path}</td>
                        <td className="px-4 py-3">
                          {r.helpful ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15"><ThumbsUp className="w-3 h-3 ml-1" />مفيدة</Badge>
                          ) : (
                            <Badge variant="destructive"><ThumbsDown className="w-3 h-3 ml-1" />غير مفيدة</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-md">{r.comment || "—"}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString("ar-SA")}
                        </td>
                        <td className="px-4 py-3">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(r.id)}>
                            <Trash2 className="w-4 h-4" />
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
    </AdminLayout>
  );
}
