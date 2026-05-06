import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/layout/PageHero";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Field {
  key: string; label: string; type: string; required?: boolean; placeholder?: string; options?: string[];
}

export default function CustomFormPage() {
  const { slug } = useParams();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("custom_forms").select("*").eq("slug", slug).eq("published", true).eq("archived", false).maybeSingle();
      if (error) toast.error(error.message);
      setForm(data);
      setLoading(false);
    })();
  }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    for (const f of (form.fields as Field[])) {
      if (f.required && !values[f.key]) {
        toast.error(`الحقل "${f.label}" مطلوب`);
        return;
      }
    }
    setSubmitting(true);
    const { error } = await supabase.from("custom_form_submissions").insert({ form_id: form.id, data: values });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    setDone(true);
  }

  if (loading) return <div className="container py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!form) return (
    <div className="container py-20 text-center">
      <h1 className="text-2xl font-bold mb-4">النموذج غير موجود</h1>
      <Button asChild><Link to="/e-services">العودة للخدمات</Link></Button>
    </div>
  );

  return (
    <>
      <PageHero
        eyebrow="خدمة إلكترونية"
        title={form.title}
        lead={form.description ?? ""}
        breadcrumb={[{ label: "الخدمات الإلكترونية", to: "/e-services" }, { label: form.title }]}
      />
      <section className="container py-10 md:py-14">
        <Card className="p-6 md:p-8 max-w-3xl mx-auto">
          {form.coming_soon ? (
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold mb-3">قريباً</h2>
              <p className="text-muted-foreground mb-6">هذه الخدمة ستكون متاحة قريباً. تابعونا للحصول على آخر التحديثات.</p>
              <Button asChild><Link to="/e-services"><ArrowRight className="h-4 w-4 me-2" /> العودة للخدمات</Link></Button>
            </div>
          ) : !form.fields || (form.fields as Field[]).length === 0 ? (
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold mb-3">النموذج قيد الإعداد</h2>
              <p className="text-muted-foreground mb-6">لم يتم إضافة حقول لهذا النموذج بعد.</p>
              <Button asChild><Link to="/e-services"><ArrowRight className="h-4 w-4 me-2" /> العودة للخدمات</Link></Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {(form.fields as Field[]).map((f) => (
                <div key={f.key}>
                  <Label className="mb-1.5 block">{f.label}{f.required && <span className="text-destructive ms-1">*</span>}</Label>
                  {f.type === "textarea" ? (
                    <Textarea rows={4} placeholder={f.placeholder} value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
                  ) : f.type === "select" ? (
                    <Select value={values[f.key] ?? ""} onValueChange={(v) => setValues({ ...values, [f.key]: v })}>
                      <SelectTrigger><SelectValue placeholder={f.placeholder ?? "اختر..."} /></SelectTrigger>
                      <SelectContent>
                        {(f.options ?? []).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : f.type === "checkbox" ? (
                    <label className="flex items-center gap-2"><Checkbox checked={!!values[f.key]} onCheckedChange={(v) => setValues({ ...values, [f.key]: !!v })} /><span className="text-sm">{f.placeholder || "نعم"}</span></label>
                  ) : (
                    <Input
                      type={f.type === "email" ? "email" : f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "phone" ? "tel" : "text"}
                      placeholder={f.placeholder}
                      value={values[f.key] ?? ""}
                      onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                    />
                  )}
                </div>
              ))}
              <Button type="submit" disabled={submitting} className="w-full md:w-auto">
                {submitting && <Loader2 className="h-4 w-4 animate-spin me-2" />} إرسال
              </Button>
            </form>
          )}
        </Card>
      </section>
    </>
  );
}
