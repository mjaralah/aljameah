import { useEffect, useMemo, useState } from "react";
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
import {
  Loader2, Trash2, Shield, UserPlus, UserCog, Users as UsersIcon, KeyRound,
  Eye, EyeOff, Copy, Sparkles, CheckCircle2, Search, Ban, CheckCircle,
  Pencil, ShieldCheck, ShieldAlert, Filter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminDialog } from "@/components/admin/AdminDialog";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { cn } from "@/lib/utils";

type Role = "admin" | "editor";

type UserRow = {
  id: string; // same as user_id for table key
  user_id: string;
  email: string | null;
  full_name: string | null;
  roles: Role[];
  created_at: string | null;
  last_sign_in_at: string | null;
  is_disabled: boolean;
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

function passwordStrength(pw: string): { score: 0|1|2|3|4; label: string; color: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { label: "—", color: "bg-muted" },
    { label: "ضعيفة جداً", color: "bg-destructive" },
    { label: "ضعيفة", color: "bg-accent" },
    { label: "متوسطة", color: "bg-primary/60" },
    { label: "قوية", color: "bg-success" },
  ];
  return { score: s as 0|1|2|3|4, ...map[s] };
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("ar-SA", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch { return "—"; }
}

function initials(name?: string | null, email?: string | null): string {
  const src = (name || email || "?").trim();
  const parts = src.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAdminAuth();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "admin" | "editor" | "disabled">("all");

  // dialogs
  const [adding, setAdding] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [resetting, setResetting] = useState<UserRow | null>(null);
  const [confirmDisable, setConfirmDisable] = useState<UserRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Add role to existing user
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>("editor");
  const [submitting, setSubmitting] = useState(false);

  // Create
  const [cEmail, setCEmail] = useState("");
  const [cName, setCName] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [cRole, setCRole] = useState<Role>("editor");
  const [cShowPwd, setCShowPwd] = useState(false);
  const [cSubmitting, setCSubmitting] = useState(false);
  const [cSendEmail, setCSendEmail] = useState(false);
  const [createdSummary, setCreatedSummary] = useState<{ email: string; password: string; name: string } | null>(null);

  // Edit
  const [eName, setEName] = useState("");
  const [eRole, setERole] = useState<Role>("editor");
  const [eSubmitting, setESubmitting] = useState(false);

  // Reset password
  const [rPassword, setRPassword] = useState("");
  const [rShowPwd, setRShowPwd] = useState(false);
  const [rSubmitting, setRSubmitting] = useState(false);
  const [resetSummary, setResetSummary] = useState<{ email: string; password: string } | null>(null);

  async function load() {
    setLoading(true);
    // Use the admin RPC that aggregates everything
    const { data, error } = await (supabase as any).rpc("list_admin_users");
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const mapped: UserRow[] = ((data ?? []) as any[]).map((r) => ({
      id: r.user_id,
      user_id: r.user_id,
      email: r.email,
      full_name: r.full_name,
      roles: (r.roles ?? []) as Role[],
      created_at: r.created_at,
      last_sign_in_at: r.last_sign_in_at,
      is_disabled: !!r.is_disabled,
    }));
    setRows(mapped);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter === "admin" && !r.roles.includes("admin")) return false;
      if (filter === "editor" && !r.roles.includes("editor")) return false;
      if (filter === "disabled" && !r.is_disabled) return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        if (!(r.email?.toLowerCase().includes(s) || r.full_name?.toLowerCase().includes(s))) return false;
      }
      return true;
    });
  }, [rows, filter, search]);

  const counts = useMemo(() => ({
    total: rows.length,
    admins: rows.filter((r) => r.roles.includes("admin")).length,
    editors: rows.filter((r) => r.roles.includes("editor")).length,
    disabled: rows.filter((r) => r.is_disabled).length,
  }), [rows]);

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
        toast.error("لم يُعثر على هذا البريد. أنشئ حساباً جديداً بدلاً من ذلك.");
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
      const res = data as { ok: boolean; error?: string };
      if (!res?.ok) throw new Error(res?.error || "تعذّر إنشاء الحساب");

      // Send email if requested
      if (cSendEmail) {
        try {
          await supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "new_account_credentials",
              recipientEmail: cEmail.trim().toLowerCase(),
              idempotencyKey: `account-creds-${userId}`,
              templateData: {
                full_name: cName.trim(),
                email: cEmail.trim().toLowerCase(),
                password: cPassword,
                admin_url: `${window.location.origin}/admin`,
              },
            },
          });
          toast.success("تم إرسال البريد الإلكتروني");
        } catch (emailErr) {
          toast.error("تم إنشاء الحساب لكن فشل إرسال البريد — تأكد من إعداد النطاق في الإعدادات");
        }
      }

      toast.success("تم إنشاء الحساب بنجاح");
      setCreatedSummary({ email: cEmail.trim().toLowerCase(), password: cPassword, name: cName.trim() });
      setCreating(false);
      setCEmail(""); setCName(""); setCPassword(""); setCRole("editor"); setCShowPwd(false); setCSendEmail(false);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCSubmitting(false);
    }
  }

  function openEdit(r: UserRow) {
    setEditing(r);
    setEName(r.full_name ?? "");
    setERole(r.roles.includes("admin") ? "admin" : "editor");
  }

  async function handleEdit() {
    if (!editing) return;
    if (!eName.trim()) { toast.error("الاسم مطلوب"); return; }
    setESubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-update-user", {
        body: {
          action: "update_profile",
          user_id: editing.user_id,
          full_name: eName.trim(),
          role: eRole,
        },
      });
      if (error) throw error;
      const res = data as { ok: boolean; error?: string };
      if (!res?.ok) throw new Error(res?.error || "تعذّر التحديث");
      toast.success("تم الحفظ");
      setEditing(null);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setESubmitting(false);
    }
  }

  function openReset(r: UserRow) {
    setResetting(r);
    setRPassword(generatePassword());
    setRShowPwd(true);
  }

  async function handleReset() {
    if (!resetting) return;
    if (rPassword.length < 8) { toast.error("8 أحرف على الأقل"); return; }
    setRSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-update-user", {
        body: { action: "reset_password", user_id: resetting.user_id, new_password: rPassword },
      });
      if (error) throw error;
      const res = data as { ok: boolean; error?: string };
      if (!res?.ok) throw new Error(res?.error || "تعذّر التحديث");
      toast.success("تم تغيير كلمة المرور");
      setResetSummary({ email: resetting.email ?? "", password: rPassword });
      setResetting(null);
      setRPassword(""); setRShowPwd(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setRSubmitting(false);
    }
  }

  async function handleToggleDisable(r: UserRow) {
    const action = r.is_disabled ? "enable" : "disable";
    try {
      const { data, error } = await supabase.functions.invoke("admin-update-user", {
        body: { action, user_id: r.user_id },
      });
      if (error) throw error;
      const res = data as { ok: boolean; error?: string };
      if (!res?.ok) throw new Error(res?.error || "تعذّر التحديث");
      toast.success(r.is_disabled ? "تم تفعيل الحساب" : "تم تعطيل الحساب");
      setConfirmDisable(null);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    if (deleteConfirmText !== confirmDelete.email) {
      toast.error("اكتب البريد الإلكتروني بالضبط للتأكيد");
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("admin-update-user", {
        body: { action: "delete", user_id: confirmDelete.user_id },
      });
      if (error) throw error;
      const res = data as { ok: boolean; error?: string };
      if (!res?.ok) throw new Error(res?.error || "تعذّر الحذف");
      toast.success("تم حذف الحساب");
      setConfirmDelete(null);
      setDeleteConfirmText("");
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const pwdStrength = passwordStrength(cPassword);

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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="إجمالي الحسابات" value={counts.total} icon={UsersIcon} tone="muted" />
        <StatCard label="مدراء" value={counts.admins} icon={ShieldCheck} tone="info" />
        <StatCard label="محررون" value={counts.editors} icon={Shield} tone="success" />
        <StatCard label="معطّلة" value={counts.disabled} icon={Ban} tone="destructive" />
      </div>

      {/* Toolbar */}
      <Card className="mb-4">
        <CardContent className="p-3 flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو البريد..."
              className="pr-9"
            />
          </div>
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            {(["all", "admin", "editor", "disabled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  filter === f
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f === "all" && "الكل"}
                {f === "admin" && "المدراء"}
                {f === "editor" && "المحررون"}
                {f === "disabled" && "المعطّلون"}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <AdminDataTable<UserRow>
        rows={filtered}
        loading={loading}
        columns={[
          {
            key: "user", label: "المستخدم",
            render: (r) => (
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                  r.is_disabled ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                )}>
                  {initials(r.full_name, r.email)}
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{r.full_name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground truncate" dir="ltr">{r.email ?? "—"}</div>
                </div>
              </div>
            ),
          },
          {
            key: "roles", label: "الأدوار", width: "180px",
            render: (r) => (
              <div className="flex flex-wrap gap-1">
                {r.roles.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                {r.roles.map((role) => (
                  <Badge
                    key={role}
                    variant={role === "admin" ? "default" : "secondary"}
                    className="gap-1"
                  >
                    <Shield className="w-3 h-3" />
                    {role === "admin" ? "مدير" : "محرر"}
                  </Badge>
                ))}
              </div>
            ),
          },
          {
            key: "last", label: "آخر دخول", width: "130px",
            render: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.last_sign_in_at)}</span>,
          },
          {
            key: "created", label: "تاريخ الإنشاء", width: "130px",
            render: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>,
          },
        ]}
        statusColumn={{
          key: "status", label: "الحالة",
          getStatus: (r) => r.is_disabled
            ? { label: "معطّل", tone: "destructive" }
            : { label: "نشط", tone: "success" },
        }}
        actions={[
          { icon: Pencil, label: "تعديل", variant: "edit", onClick: openEdit },
          { icon: KeyRound, label: "إعادة تعيين كلمة المرور", variant: "neutral", onClick: openReset },
          {
            icon: Ban, label: "تعطيل الحساب", variant: "neutral",
            onClick: (r) => setConfirmDisable(r),
            show: (r) => !r.is_disabled && r.user_id !== currentUser?.id,
          },
          {
            icon: CheckCircle, label: "تفعيل الحساب", variant: "neutral",
            onClick: (r) => handleToggleDisable(r),
            show: (r) => r.is_disabled,
          },
          {
            icon: Trash2, label: "حذف نهائي", variant: "delete",
            onClick: (r) => { setConfirmDelete(r); setDeleteConfirmText(""); },
            show: (r) => r.user_id !== currentUser?.id,
          },
        ]}
        emptyState={
          <AdminEmptyState
            icon={UsersIcon}
            title={search || filter !== "all" ? "لا توجد نتائج مطابقة" : "لا توجد حسابات بعد"}
            description={search || filter !== "all" ? "جرّب تعديل البحث أو الفلتر." : "ابدأ بإنشاء حساب جديد."}
            actionLabel="إنشاء حساب جديد"
            onAction={() => setCreating(true)}
            actionIcon={KeyRound}
          />
        }
      />

      {/* Add role */}
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
          <Select value={newRole} onValueChange={(v) => setNewRole(v as Role)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">مدير (Admin)</SelectItem>
              <SelectItem value="editor">محرر (Editor)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AdminDialog>

      {/* Create user */}
      <AdminDialog
        open={creating}
        onOpenChange={(o) => { setCreating(o); if (!o) setCShowPwd(false); }}
        title="إنشاء حساب جديد"
        description="سيتم تفعيل الحساب تلقائياً."
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
              type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1"
              onClick={() => { setCPassword(generatePassword()); setCShowPwd(true); }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              توليد قوية
            </Button>
          </div>
          <div className="relative">
            <Input
              dir="ltr" type={cShowPwd ? "text" : "password"}
              value={cPassword} onChange={(e) => setCPassword(e.target.value)}
              placeholder="8 أحرف على الأقل" className="pl-10"
            />
            <button
              type="button" onClick={() => setCShowPwd((v) => !v)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              aria-label={cShowPwd ? "إخفاء" : "إظهار"}
            >
              {cShowPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {cPassword && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden flex gap-0.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={cn(
                    "flex-1 transition-colors",
                    i <= pwdStrength.score ? pwdStrength.color : "bg-transparent"
                  )} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground w-16 text-left">{pwdStrength.label}</span>
            </div>
          )}
        </div>
        <div>
          <Label>الدور</Label>
          <Select value={cRole} onValueChange={(v) => setCRole(v as Role)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">مدير (Admin)</SelectItem>
              <SelectItem value="editor">محرر (Editor)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AdminDialog>

      {/* Edit user */}
      <AdminDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title="تعديل المستخدم"
        description={editing?.email ?? undefined}
        onSave={handleEdit}
        saving={eSubmitting}
        size="md"
      >
        <div>
          <Label>الاسم الكامل</Label>
          <Input value={eName} onChange={(e) => setEName(e.target.value)} />
        </div>
        <div>
          <Label>الدور</Label>
          <Select value={eRole} onValueChange={(v) => setERole(v as Role)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">مدير (Admin)</SelectItem>
              <SelectItem value="editor">محرر (Editor)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            سيتم استبدال كل أدوار المستخدم بالدور المُختار.
          </p>
        </div>
      </AdminDialog>

      {/* Reset password */}
      <AdminDialog
        open={!!resetting}
        onOpenChange={(o) => { if (!o) { setResetting(null); setRShowPwd(false); } }}
        title="إعادة تعيين كلمة المرور"
        description={resetting?.email ?? undefined}
        onSave={handleReset}
        saving={rSubmitting}
        saveLabel="حفظ كلمة المرور"
        size="md"
      >
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label>كلمة المرور الجديدة</Label>
            <Button
              type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1"
              onClick={() => { setRPassword(generatePassword()); setRShowPwd(true); }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              توليد جديدة
            </Button>
          </div>
          <div className="relative">
            <Input
              dir="ltr" type={rShowPwd ? "text" : "password"}
              value={rPassword} onChange={(e) => setRPassword(e.target.value)}
              className="pl-10"
            />
            <button
              type="button" onClick={() => setRShowPwd((v) => !v)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              {rShowPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            انسخ كلمة المرور وسلّمها للمستخدم — لن تظهر بعد الإغلاق.
          </p>
        </div>
      </AdminDialog>

      {/* Reset password summary */}
      <AdminDialog
        open={!!resetSummary}
        onOpenChange={(o) => !o && setResetSummary(null)}
        title="تم تغيير كلمة المرور"
        size="md"
        hideFooter
        footer={<Button onClick={() => setResetSummary(null)}>تم</Button>}
      >
        <div className="space-y-3">
          {resetSummary && (
            <>
              <SummaryRow label="البريد" value={resetSummary.email} />
              <SummaryRow label="كلمة المرور" value={resetSummary.password} mono />
              <Button variant="outline" className="w-full gap-2" onClick={() => {
                navigator.clipboard.writeText(`البريد: ${resetSummary.email}\nكلمة المرور: ${resetSummary.password}`);
                toast.success("تم النسخ");
              }}>
                <Copy className="w-4 h-4" />
                نسخ بيانات الدخول
              </Button>
            </>
          )}
        </div>
      </AdminDialog>

      {/* Create summary */}
      <AdminDialog
        open={!!createdSummary}
        onOpenChange={(o) => !o && setCreatedSummary(null)}
        title="تم إنشاء الحساب"
        description="انسخ بيانات الدخول وسلّمها للمستخدم — لن تظهر كلمة المرور مرة أخرى."
        size="md"
        hideFooter
        footer={<Button onClick={() => setCreatedSummary(null)}>تم</Button>}
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
              <Button variant="outline" className="w-full gap-2" onClick={() => {
                navigator.clipboard.writeText(`البريد: ${createdSummary.email}\nكلمة المرور: ${createdSummary.password}`);
                toast.success("تم نسخ بيانات الدخول");
              }}>
                <Copy className="w-4 h-4" />
                نسخ بيانات الدخول
              </Button>
            </>
          )}
        </div>
      </AdminDialog>

      {/* Disable confirm */}
      <AlertDialog open={!!confirmDisable} onOpenChange={(o) => !o && setConfirmDisable(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تعطيل الحساب؟</AlertDialogTitle>
            <AlertDialogDescription>
              لن يستطيع المستخدم تسجيل الدخول حتى يتم تفعيل حسابه مجدداً. لن يتم حذف أي بيانات.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDisable && handleToggleDisable(confirmDisable)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              تعطيل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirm with typed confirmation */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="w-5 h-5" />
              حذف الحساب نهائياً؟
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span>سيتم حذف الحساب وجميع أدواره. لا يمكن التراجع عن هذا الإجراء.</span>
              <span className="block">
                للتأكيد، اكتب البريد الإلكتروني: <strong dir="ltr" className="text-foreground">{confirmDelete?.email}</strong>
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            dir="ltr" value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="email@example.com"
            className="my-2"
          />
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteConfirmText !== confirmDelete?.email}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف نهائي
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

function StatCard({
  label, value, icon: Icon, tone,
}: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; tone: "muted" | "info" | "success" | "destructive" }) {
  const toneClasses: Record<typeof tone, string> = {
    muted: "bg-muted text-muted-foreground",
    info: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    destructive: "bg-destructive/15 text-destructive",
  };
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", toneClasses[tone])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground truncate">{label}</div>
          <div className="text-xl font-bold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
