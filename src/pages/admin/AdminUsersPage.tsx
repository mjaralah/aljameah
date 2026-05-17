import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, Shield, UserPlus, UserCog, Users as UsersIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminDialog } from "@/components/admin/AdminDialog";

type RoleRow = {
  id: string; // composite for table key
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

  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "editor">("editor");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const { data: roles, error } = await supabase
      .from("user_roles")
      .select("user_id, role");
    if (error) { toast.error(error.message); setLoading(false); return; }
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
        id: `${r.user_id}-${r.role}`,
        user_id: r.user_id,
        role: r.role as "admin" | "editor",
        email: p?.email ?? null,
        full_name: p?.full_name ?? null,
      };
    });
    setRows(merged);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!newEmail.trim()) return;
    setSubmitting(true);
    try {
      const { data: prof, error: pe } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", newEmail.trim().toLowerCase())
        .maybeSingle();
      if (pe) throw pe;
      if (!prof) {
        toast.error("لم يُعثر على هذا البريد. اطلب من المستخدم التسجيل أولاً.");
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
    if (error) toast.error(error.message);
    else { toast.success("تمت إزالة الصلاحية"); load(); }
    setRemovingPair(null);
  }

  return (
    <AdminLayout title="المستخدمون والأدوار">
      <AdminPageHeader
        title="المستخدمون والأدوار"
        description="إدارة المدراء والمحررين والصلاحيات"
        icon={UserCog}
        action={
          <Button onClick={() => setAdding(true)}>
            <UserPlus className="w-4 h-4 ml-1" />
            إضافة صلاحية
          </Button>
        }
      />

      <Card className="mb-4 bg-accent-soft/50 border-accent/20">
        <CardContent className="p-5 text-sm leading-relaxed">
          <p className="font-semibold text-foreground mb-2">كيف تعمل الأدوار؟</p>
          <p><strong className="text-foreground">المدير (Admin):</strong> صلاحيات كاملة، بما فيها الإعدادات والمستخدمون.</p>
          <p><strong className="text-foreground">المحرر (Editor):</strong> يستطيع تعديل المحتوى فقط.</p>
          <p className="text-muted-foreground mt-2">لإضافة شخص جديد: اطلب منه التسجيل عبر صفحة <code dir="ltr">/admin/login</code>، ثم أضف صلاحياته من هنا.</p>
        </CardContent>
      </Card>

      <AdminDataTable<RoleRow>
        rows={rows}
        loading={loading}
        columns={[
          { key: "full_name", label: "الاسم", render: (r) => <span className="font-medium">{r.full_name ?? "—"}</span> },
          { key: "email", label: "البريد", render: (r) => <span className="text-muted-foreground" dir="ltr">{r.email ?? "—"}</span> },
          {
            key: "role", label: "الدور", width: "140px",
            render: (r) => (
              <Badge variant={r.role === "admin" ? "default" : "secondary"} className="gap-1">
                <Shield className="w-3 h-3" />
                {r.role === "admin" ? "مدير" : "محرر"}
              </Badge>
            ),
          },
        ]}
        actions={[
          {
            icon: Trash2, label: "إزالة الصلاحية", variant: "delete",
            onClick: (r) => setRemovingPair({ user_id: r.user_id, role: r.role }),
          },
        ]}
        emptyState={
          <AdminEmptyState
            icon={UsersIcon}
            title="لا توجد صلاحيات بعد"
            description="ابدأ بإضافة صلاحيات للمدراء والمحررين."
            actionLabel="إضافة صلاحية"
            onAction={() => setAdding(true)}
            actionIcon={UserPlus}
          />
        }
      />

      <AdminDialog
        open={adding}
        onOpenChange={setAdding}
        title="إضافة صلاحية"
        description="يجب أن يكون المستخدم قد سجّل حسابه مسبقاً."
        onSave={handleAdd}
        saving={submitting}
        saveLabel="إضافة"
        size="md"
      >
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
      </AdminDialog>

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
