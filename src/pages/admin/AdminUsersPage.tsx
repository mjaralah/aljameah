import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Loader2, Trash2, Shield, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type RoleRow = {
  user_id: string;
  role: "admin" | "editor";
  email: string | null;
  full_name: string | null;
};

export default function AdminUsersPage() {
  const [rows, setRows] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removingPair, setRemovingPair] = useState<{ user_id: string; role: "admin" | "editor" } | null>(null);

  // Add form
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "editor">("editor");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const { data: roles, error } = await supabase
      .from("user_roles")
      .select("user_id, role");
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const userIds = [...new Set((roles ?? []).map((r) => r.user_id))];
    let profiles: { id: string; email: string | null; full_name: string | null }[] = [];
    if (userIds.length) {
      const { data: ps } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);
      profiles = ps ?? [];
    }
    const merged = (roles ?? []).map((r) => {
      const p = profiles.find((x) => x.id === r.user_id);
      return {
        user_id: r.user_id,
        role: r.role as "admin" | "editor",
        email: p?.email ?? null,
        full_name: p?.full_name ?? null,
      };
    });
    setRows(merged);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    if (!newEmail.trim()) return;
    setSubmitting(true);
    try {
      // Look up user by email in profiles (created on signup)
      const { data: prof, error: pe } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", newEmail.trim().toLowerCase())
        .maybeSingle();
      if (pe) throw pe;
      if (!prof) {
        toast.error("لم يُعثر على هذا البريد. اطلب من المستخدم التسجيل أولاً عبر صفحة تسجيل الدخول.");
        return;
      }
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: prof.id, role: newRole });
      if (error) throw error;
      toast.success("تمت إضافة الصلاحية");
      setNewEmail("");
      setAdding(false);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove() {
    if (!removingPair) return;
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", removingPair.user_id)
      .eq("role", removingPair.role);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("تمت إزالة الصلاحية");
      load();
    }
    setRemovingPair(null);
  }

  return (
    <AdminLayout
      title="المستخدمون والأدوار"
      description="إدارة المدراء والمحررين"
      actions={
        <Button size="sm" onClick={() => setAdding(true)}>
          <UserPlus className="w-4 h-4 ml-1" />
          إضافة صلاحية
        </Button>
      }
    >
      <div className="space-y-4 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">كيف تعمل الأدوار؟</CardTitle>
            <CardDescription className="leading-relaxed">
              <strong className="text-foreground">المدير (Admin):</strong> صلاحيات كاملة، بما فيها الإعدادات والمستخدمون.<br />
              <strong className="text-foreground">المحرر (Editor):</strong> يستطيع تعديل المحتوى فقط.<br />
              لإضافة شخص جديد: اطلب منه التسجيل عبر صفحة <code dir="ltr">/admin/login</code>، ثم أضف صلاحياته من هنا.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : rows.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                لا توجد صلاحيات بعد.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b">
                    <tr>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">الاسم</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">البريد</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">الدور</th>
                      <th className="px-4 py-3 w-20" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={`${r.user_id}-${r.role}`} className="border-b last:border-0">
                        <td className="px-4 py-3 font-medium">{r.full_name ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground" dir="ltr">{r.email ?? "—"}</td>
                        <td className="px-4 py-3">
                          <Badge variant={r.role === "admin" ? "default" : "secondary"}>
                            <Shield className="w-3 h-3 ml-1" />
                            {r.role === "admin" ? "مدير" : "محرر"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setRemovingPair({ user_id: r.user_id, role: r.role })}
                          >
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

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة صلاحية</DialogTitle>
            <DialogDescription>
              يجب أن يكون المستخدم قد سجّل حسابه مسبقاً.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>البريد الإلكتروني</Label>
              <Input dir="ltr" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="user@example.com" />
            </div>
            <div>
              <Label>الدور</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as "admin" | "editor")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">مدير (Admin)</SelectItem>
                  <SelectItem value="editor">محرر (Editor)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAdding(false)}>إلغاء</Button>
            <Button onClick={handleAdd} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 ml-1 animate-spin" />}
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!removingPair} onOpenChange={(o) => !o && setRemovingPair(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>إزالة الصلاحية؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيفقد المستخدم وصوله إلى لوحة التحكم بهذا الدور.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              إزالة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
