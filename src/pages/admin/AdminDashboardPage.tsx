import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, FolderKanban, Users, Handshake, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Stat = { label: string; value: number; icon: typeof Newspaper; to: string; color: string };

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stat[]>([
    { label: "الأخبار", value: 0, icon: Newspaper, to: "/admin/news", color: "from-blue-500/10 to-blue-500/5 text-blue-600" },
    { label: "البرامج", value: 0, icon: FolderKanban, to: "/admin/programs", color: "from-emerald-500/10 to-emerald-500/5 text-emerald-600" },
    { label: "أعضاء المجلس", value: 0, icon: Users, to: "/admin/board", color: "from-violet-500/10 to-violet-500/5 text-violet-600" },
    { label: "الشركاء", value: 0, icon: Handshake, to: "/admin/partners", color: "from-amber-500/10 to-amber-500/5 text-amber-600" },
    { label: "شرائح البطل", value: 0, icon: ImageIcon, to: "/admin/hero", color: "from-rose-500/10 to-rose-500/5 text-rose-600" },
  ]);

  useEffect(() => {
    (async () => {
      const tables = ["news", "programs", "board_members", "partners", "hero_slides"] as const;
      const counts = await Promise.all(
        tables.map((t) => supabase.from(t).select("*", { count: "exact", head: true })),
      );
      setStats((prev) =>
        prev.map((s, i) => ({ ...s, value: counts[i].count ?? 0 })),
      );
    })();
  }, []);

  return (
    <AdminLayout title="مرحباً بك" description="نظرة عامة على محتوى الموقع">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {stats.map((s) => (
            <Link key={s.to} to={s.to} className="group">
              <Card className="hover:shadow-card transition-all border-border/60 overflow-hidden">
                <CardContent className="p-5">
                  <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} mb-3`}>
                    <s.icon className="w-5 h-5" />
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">دليل سريع</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2 leading-relaxed">
            <p>• <strong className="text-foreground">المحتوى:</strong> أضف أو حرّر الأخبار والبرامج وأعضاء المجلس والشركاء وشرائح البطل من القائمة الجانبية.</p>
            <p>• <strong className="text-foreground">الإعدادات العامة:</strong> ارفع شعار الجمعية، عدّل ألوان الهوية، وحدّث معلومات التواصل.</p>
            <p>• <strong className="text-foreground">المستخدمون:</strong> ادعُ محرّرين جدد وامنحهم الصلاحيات المناسبة.</p>
            <p>• كل تعديل يُحفظ مباشرة وتظهر نتائجه على الموقع فوراً.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
