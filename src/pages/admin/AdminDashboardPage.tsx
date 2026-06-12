import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Newspaper,
  FolderKanban,
  Users,
  Handshake,
  Image as ImageIcon,
  HandHeart,
  IdCard,
  MessageSquare,
  ThumbsUp,
  ArrowLeft,
  FileText,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";


type StatCard = {
  label: string;
  value: number;
  badge?: number; // pending count
  icon: typeof Newspaper;
  to: string;
  color: string;
};

type RecentItem = {
  id: string;
  table: string;
  label: string;
  name: string;
  date: string;
  to: string;
};

export default function AdminDashboardPage() {
  const [contentStats, setContentStats] = useState<StatCard[]>([]);
  const [requestStats, setRequestStats] = useState<StatCard[]>([]);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const contentTables = [
        { table: "news", label: "الأخبار", icon: Newspaper, to: "/admin/news", color: "from-blue-500/10 to-blue-500/5 text-blue-600" },
        { table: "programs", label: "البرامج", icon: FolderKanban, to: "/admin/programs", color: "from-emerald-500/10 to-emerald-500/5 text-emerald-600" },
        { table: "custom_pages", label: "الصفحات", icon: FileText, to: "/admin/pages", color: "from-cyan-500/10 to-cyan-500/5 text-cyan-600" },
        { table: "board_members", label: "أعضاء المجلس", icon: Users, to: "/admin/board", color: "from-violet-500/10 to-violet-500/5 text-violet-600" },
        { table: "partners", label: "الشركاء", icon: Handshake, to: "/admin/partners", color: "from-amber-500/10 to-amber-500/5 text-amber-600" },
        { table: "hero_slides", label: "شرائح العرض الرئيسي", icon: ImageIcon, to: "/admin/hero", color: "from-rose-500/10 to-rose-500/5 text-rose-600" },
      ] as const;

      const requestTables = [
        { table: "volunteer_requests", label: "طلبات التطوع", icon: HandHeart, to: "/admin/volunteer-requests", color: "from-emerald-500/10 to-emerald-500/5 text-emerald-600" },
        { table: "membership_requests", label: "طلبات العضوية", icon: IdCard, to: "/admin/membership-requests", color: "from-primary/10 to-primary/5 text-primary" },
        { table: "contact_messages", label: "رسائل التواصل", icon: MessageSquare, to: "/admin/contact-messages", color: "from-indigo-500/10 to-indigo-500/5 text-indigo-600" },
        { table: "page_feedback", label: "تقييمات الصفحات", icon: ThumbsUp, to: "/admin/feedback", color: "from-amber-500/10 to-amber-500/5 text-amber-600" },
      ] as const;

      const contentCounts = await Promise.all(
        contentTables.map((t) => supabase.from(t.table).select("*", { count: "exact", head: true })),
      );
      setContentStats(
        contentTables.map((t, i) => ({
          label: t.label,
          value: contentCounts[i].count ?? 0,
          icon: t.icon,
          to: t.to,
          color: t.color,
        })),
      );

      const reqCounts = await Promise.all(
        requestTables.map(async (t) => {
          const total = await supabase.from(t.table).select("*", { count: "exact", head: true });
          if (t.table === "page_feedback") {
            return { total: total.count ?? 0, pending: 0 };
          }
          const pending = await supabase
            .from(t.table)
            .select("*", { count: "exact", head: true })
            .eq("status", "new");
          return { total: total.count ?? 0, pending: pending.count ?? 0 };
        }),
      );
      setRequestStats(
        requestTables.map((t, i) => ({
          label: t.label,
          value: reqCounts[i].total,
          badge: reqCounts[i].pending,
          icon: t.icon,
          to: t.to,
          color: t.color,
        })),
      );

      // Recent submissions across request tables
      const recents = await Promise.all([
        supabase.from("volunteer_requests").select("id, full_name, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("membership_requests").select("id, full_name, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("contact_messages").select("id, full_name, created_at").order("created_at", { ascending: false }).limit(5),
      ]);
      const merged: RecentItem[] = [
        ...(recents[0].data ?? []).map((r) => ({ id: r.id, table: "volunteer", label: "تطوع", name: r.full_name, date: r.created_at, to: "/admin/volunteer-requests" })),
        ...(recents[1].data ?? []).map((r) => ({ id: r.id, table: "membership", label: "عضوية", name: r.full_name, date: r.created_at, to: "/admin/membership-requests" })),
        ...(recents[2].data ?? []).map((r) => ({ id: r.id, table: "contact", label: "تواصل", name: r.full_name, date: r.created_at, to: "/admin/contact-messages" })),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 8);
      setRecent(merged);
      setLoading(false);
    })();
  }, []);

  return (
    <AdminLayout title="مرحباً بك" description="نظرة عامة على محتوى الموقع والطلبات">
      <div className="space-y-8">
        {/* Help Center CTA — prominent for first-time / non-technical admins */}
        <section>
          <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/40 transition-all">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                <div className="shrink-0 h-14 w-14 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-lg">
                  <HelpCircle className="h-7 w-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg md:text-xl font-bold text-primary mb-1">
                    هل تحتاج مساعدة في إدارة الموقع؟
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    مركز المساعدة للمدير يحتوي على دليل تفاعلي وإجابات لأهم الأسئلة. مثالي إذا كنت تدخل لوحة التحكم لأول مرة.
                  </p>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shrink-0"
                >
                  <Link to="/admin/help" className="gap-2">
                    <Lightbulb className="h-4 w-4" />
                    اذهب إلى مركز المساعدة
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">الطلبات الواردة</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {requestStats.map((s) => (
              <Link key={s.to} to={s.to} className="group">
                <Card className="hover:shadow-card transition-all border-border/60 overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} mb-3`}>
                        <s.icon className="w-5 h-5" />
                      </div>
                      {s.badge ? (
                        <Badge variant="destructive" className="text-[10px]">{s.badge} جديد</Badge>
                      ) : null}
                    </div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                      <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:translate-x-[-4px] transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">المحتوى</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {contentStats.map((s) => (
              <Link key={s.to} to={s.to} className="group">
                <Card className="hover:shadow-card transition-all border-border/60 overflow-hidden">
                  <CardContent className="p-5">
                    <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} mb-3`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">آخر الطلبات</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-sm text-muted-foreground">جاري التحميل...</div>
            ) : recent.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">لا توجد طلبات حالياً.</div>
            ) : (
              <ul className="divide-y">
                {recent.map((r) => (
                  <li key={r.id}>
                    <Link to={r.to} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                      <Badge variant="outline" className="text-[10px]">{r.label}</Badge>
                      <span className="font-medium flex-1 truncate">{r.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.date).toLocaleDateString("ar-SA")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">دليل سريع</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2 leading-relaxed">
            <p>• <strong className="text-foreground">المحتوى:</strong> أضف أو حرّر الأخبار والبرامج والصفحات وأعضاء المجلس والشركاء وشرائح البطل.</p>
            <p>• <strong className="text-foreground">الطلبات:</strong> راجع طلبات التطوع والعضوية ورسائل التواصل، حدّث حالة كل طلب وأضف ملاحظات داخلية.</p>
            <p>• <strong className="text-foreground">الإعدادات العامة:</strong> ارفع شعار الجمعية، عدّل ألوان الهوية، وحدّث معلومات التواصل.</p>
            <p>• كل تعديل يُحفظ مباشرة وتظهر نتائجه على الموقع فوراً.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
