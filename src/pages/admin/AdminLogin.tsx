import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";


export default function AdminLogin() {
  const { signIn, isStaff, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


  if (!authLoading && isStaff) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) {
      setError(error.message === "Invalid login credentials"
        ? "بيانات الدخول غير صحيحة"
        : error.message);
      return;
    }
    toast.success("تم تسجيل الدخول بنجاح");
    navigate(from, { replace: true });
  }

  async function handleSeed() {
    setSeeding(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("seed-admin");
      if (error) throw error;
      if (data?.alreadySeeded) {
        toast.info("الحساب التجريبي موجود مسبقاً", {
          description: "admin@test.com / Admin@12345",
        });
      } else if (data?.seeded) {
        toast.success("تم إنشاء الحساب التجريبي", {
          description: "admin@test.com / Admin@12345",
        });
      }
      setEmail("admin@test.com");
      setPassword("Admin@12345");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-card mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground mt-1">تسجيل دخول مدير الموقع</p>
        </div>

        <Card className="border-border/60 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">تسجيل الدخول</CardTitle>
            <CardDescription>أدخل بياناتك للوصول إلى لوحة التحكم</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  dir="ltr"
                  className="text-left"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  dir="ltr"
                  className="text-left"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                دخول
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">أو</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleSeed}
              disabled={seeding}
            >
              {seeding ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 ml-2" />
              )}
              إنشاء/تعبئة الحساب التجريبي
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
              للاختبار: <span className="font-mono" dir="ltr">admin@test.com</span> /{" "}
              <span className="font-mono" dir="ltr">Admin@12345</span>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          هذه صفحة مخصصة لمديري الموقع فقط.
        </p>
      </div>
    </div>
  );
}
