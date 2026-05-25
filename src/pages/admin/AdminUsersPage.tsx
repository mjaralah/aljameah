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
import { Loader2, Trash2, Shield, UserPlus, UserCog, Users as UsersIcon, KeyRound, Eye, EyeOff, Copy, Sparkles, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminDialog } from "@/components/admin/AdminDialog";

type RoleRow = {
  id: string;
  user_id: string;
  role: "admin" | "editor";
  email: string | null;
  full_name: string | null;
};

function generatePassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%^&*";
  const all = upper + lower + digits + symbols;
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  let pwd = pick(upper) + pick(lower) + pick(digits) + pick(symbols);
  for (let i = 0; i < 8; i++) pwd += pick(all);
  return pwd.split("").sort(() => Math.random() - 0.5).join("");
}

export default function AdminUsersPage() {
  const [rows, setRows] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [creating, setCreating] = useState(false);
  const [removingPair, setRemovingPair] = useState<{ user_id: string; role: "admin" | "editor" } | null>(null);

  // Add role to existing user
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "editor">("editor");
  const [submitting, setSubmitting] = useState(false);

  // Create brand-new account
  const [cEmail, setCEmail] = useState("");
  const [cName, setCName] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [cRole, setCRole] = useState<"admin" | "editor">("editor");
  const [cShowPwd, setCShowPwd] = useState(false);
  const [cSubmitting, setCSubmitting] = useState(false);
  const [createdSummary, setCreatedSummary] = useState<{ email: string; password: string } | null>(null);

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
        toast.error("لم يُعثر على هذا البريد. اطلب من المستخدم التسجيل أولاً أو استخدم \"إنشاء حساب جديد\".");
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

  async function handleCreate() {
    if (!cEmail.trim() || !cName.trim() || !cPassword) {
      toast.error("الرجاء تعبئة جميع الحقول");
      return;
    }
    if (cPassword.length < 8) {
      toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    setCSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: {
          email: cEmail.trim().toLowerCase(),
          password: cPassword,
          full_name: cName.trim(),
          role: cRole,
        },
      });
      if (error) throw error;
      const res = data as { ok: boolean; error?: string; email?: string };
      if (!res?.ok) throw new Error(res?.error || "تعذّر إنشاء الحساب");
      toast.success("تم إنشاء الحساب بنجاح");
      setCreatedSummary({ email: cEmail.trim().toLowerCase(), password: cPassword });
      setCreating(false);
      setCEmail(""); setCName(""); setCPassword(""); setCRole("editor"); setCShowPwd(false);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCSubmitting(false);
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
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setAdding(true)}>
              <UserPlus className="w-4 h-4 ml-1" />
              إضافة صلاحية
            </Button>
            <Button onClick={() => setCreating(true)}>
              <KeyRound className="w-4 h-4 ml-1" />
              إنشاء حساب جديد
            </Button>
          </div>
        }
      />

      <Card className="mb-4 bg-accent-soft/50 border-accent/20">
        <CardContent className="p-5 text-sm leading-relaxed space-y-1.5">
          <p className="font-semibold text-foreground mb-2">كيف تعمل الأدوار؟</p>
          <p><strong className="text-foreground">المدير (Admin):</strong> صلاحيات كاملة، بما فيها الإعدادات والمستخدمون.</p>
          <p><strong className="text-foreground">المحرر (Editor):</strong> يستطيع تعديل المحتوى فقط.</p>
          <div className="text-muted-foreground mt-3 pt-3 border-t border-border/60 space-y-1">
            <p><strong className="text-foreground">إنشاء حساب جديد:</strong> أنشئ بريد + كلمة مرور + دور مباشرةً، وسلّم بيانات الدخول للمستخدم.</p>
            <p><strong className="text-foreground">إضافة صلاحية:</strong> أضف دورًا لمستخدم سبق أن سجّل حسابه عبر <code dir="ltr">/admin/login</code>.</p>
          </div>
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
            description="ابدأ بإنشاء حساب جديد أو أضف صلاحية لمستخدم موجود."
            actionLabel="إنشاء حساب جديد"
            onAction={() => setCreating(true)}
            actionIcon={KeyRound}
          />
        }
      />

      {/* إضافة صلاحية لمستخدم موجود */}
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

      {/* إنشاء حساب جديد */}
      <AdminDialog
        open={creating}
        onOpenChange={(o) => { setCreating(o); if (!o) { setCShowPwd(false); } }}
        title="إنشاء حساب جديد"
        description="أنشئ حساب مستخدم مع تعيين الدور مباشرة. سيتم تفعيل الحساب تلقائياً."
        onSave={handleCreate}
        saving={cSubmitting}
        saveLabel="إنشاء الحساب"
        size="md"
      >
        <div>
          <Label>الاسم الكامل</Label>
          <Input value={cName} onChange={(e) => setCName(e.target.value)} placeholder="مثال: أحمد العتيبي" />
        </div>
        <div>
          <Label>البريد الإلكتروني (اسم الدخول)</Label>
          <Input dir="ltr" value={cEmail} onChange={(e) => setCEmail(e.target.value)} placeholder="user@example.com" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label>كلمة المرور</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => { setCPassword(generatePassword()); setCShowPwd(true); }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              توليد قوية
            </Button>
          </div>
          <div className="relative">
            <Input
              dir="ltr"
              type={cShowPwd ? "text" : "password"}
              value={cPassword}
              onChange={(e) => setCPassword(e.target.value)}
              placeholder="8 أحرف على الأقل"
              className="pl-10"
            />
            <button
              type="button"
              onClick={() => setCShowPwd((v) => !v)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              aria-label={cShowPwd ? "إخفاء" : "إظهار"}
            >
              {cShowPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <Label>الدور</Label>
          <Select value={cRole} onValueChange={(v) => setCRole(v as "admin" | "editor")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">مدير (Admin)</SelectItem>
              <SelectItem value="editor">محرر (Editor)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AdminDialog>

      {/* ملخّص بعد الإنشاء */}
      <AdminDialog
        open={!!createdSummary}
        onOpenChange={(o) => !o && setCreatedSummary(null)}
        title="تم إنشاء الحساب"
        description="انسخ بيانات الدخول وسلّمها للمستخدم — لن تظهر كلمة المرور مرة أخرى."
        size="md"
        hideFooter
        footer={
          <Button onClick={() => setCreatedSummary(null)}>تم</Button>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5" />
            الحساب جاهز للاستخدام الآن
          </div>
          {createdSummary && (
            <>
              <SummaryRow label="البريد" value={createdSummary.email} />
              <SummaryRow label="كلمة المرور" value={createdSummary.password} mono />
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  const text = `البريد: ${createdSummary.email}\nكلمة المرور: ${createdSummary.password}`;
                  navigator.clipboard.writeText(text);
                  toast.success("تم نسخ بيانات الدخول");
                }}
              >
                <Copy className="w-4 h-4" />
                نسخ بيانات الدخول
              </Button>
            </>
          )}
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

function SummaryRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className={`text-sm ${mono ? "font-mono" : ""} text-foreground select-all`} dir="ltr">{value}</span>
    </div>
  );
}
