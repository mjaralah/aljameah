import { useState } from "react";
import { z } from "zod";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Users,
  IdCard,
  Mail,
  Phone,
  BadgeCheck,
  Send,
  Award,
  Gift,
  TrendingUp,
  HandHeart,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IconField } from "@/components/eservices/FormFields";
import { usePageContent } from "@/hooks/usePublicContent";
import * as LucideIcons from "lucide-react";

const membershipSchema = z.object({
  fullName: z.string().trim().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل").max(100),
  phone: z.string().trim().regex(/^(05|\+9665)\d{8}$/, "رقم جوال سعودي غير صالح"),
  gender: z.string().min(1, "اختر الجنس"),
  email: z.string().trim().email("بريد إلكتروني غير صالح").max(120),
  nationalId: z.string().trim().regex(/^\d{10}$/, "رقم الهوية يجب أن يكون 10 أرقام"),
  education: z.string().min(1, "اختر المؤهل العلمي"),
  jobTitle: z.string().trim().max(80).optional().or(z.literal("")),
  employer: z.string().trim().max(120).optional().or(z.literal("")),
});

type MembershipForm = z.infer<typeof membershipSchema>;

const defaultBenefits = [
  { icon: Award, title: "شهادة عضوية معتمدة", desc: "وثيقة رسمية تُثبت انتسابك للجمعية" },
  { icon: Gift, title: "مزايا حصرية للأعضاء", desc: "خصومات وفعاليات وبرامج تدريبية" },
  { icon: TrendingUp, title: "حق التصويت في الجمعية العمومية", desc: "شارك في صنع القرار وتوجيه المسار" },
  { icon: Users, title: "شبكة علاقات واسعة", desc: "تواصل مع نخبة من المهتمين بالعمل التطوعي" },
];

function resolveIcon(name?: string): any {
  if (!name) return BadgeCheck;
  return (LucideIcons as any)[name] || BadgeCheck;
}

export default function MembershipService() {
  const { toast } = useToast();
  const { data: pageSections } = usePageContent("eservices_membership");
  const intro = (pageSections ?? []).find((s) => s.section_key === "intro");
  const benefitsSection = (pageSections ?? []).find((s) => s.section_key === "benefits");
  const benefits = (Array.isArray(benefitsSection?.data?.items) && benefitsSection!.data.items.length > 0)
    ? benefitsSection!.data.items.map((it: any) => ({
        icon: resolveIcon(it.icon),
        title: it.title || "",
        desc: it.description || "",
      }))
    : defaultBenefits;
  const [form, setForm] = useState<MembershipForm>({
    fullName: "", phone: "", gender: "", email: "", nationalId: "",
    education: "", jobTitle: "", employer: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof MembershipForm, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const update = (k: keyof MembershipForm, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = membershipSchema.safeParse(form);
    if (!res.success) {
      const fieldErrors: Partial<Record<keyof MembershipForm, string>> = {};
      res.error.issues.forEach((i) => {
        const k = i.path[0] as keyof MembershipForm;
        if (!fieldErrors[k]) fieldErrors[k] = i.message;
      });
      setErrors(fieldErrors);
      toast({ title: "تحقق من البيانات", description: "يرجى تصحيح الحقول المظللة", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("membership_requests").insert({
      full_name: form.fullName,
      phone: form.phone,
      gender: form.gender,
      email: form.email,
      national_id: form.nationalId,
      education: form.education,
      job_title: form.jobTitle || null,
      employer: form.employer || null,
    });
    if (error) {
      toast({ title: "تعذّر إرسال الطلب", description: error.message, variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "تم استلام طلب العضوية", description: "سنتواصل معك خلال 3 أيام عمل" });
  };

  return (
    <>
      <PageHero
        eyebrow="الخدمات الإلكترونية"
        title={intro?.title || "طلب عضوية الجمعية"}
        lead={intro?.content || "انضم رسمياً إلى أسرة الجمعية، واحصل على مزايا حصرية وحق المشاركة في صنع القرار."}
        breadcrumb={[
          { label: "الخدمات الإلكترونية", to: "/e-services" },
          { label: intro?.title || "طلب عضوية" },
        ]}
      />

      <section className="relative py-16 md:py-20 overflow-hidden">
        {/* خلفية بنمط شبكي مميز لخدمة العضوية - مختلفة عن نمط النقاط في التطوع */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05] [background-image:linear-gradient(hsl(var(--accent))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--accent))_1px,transparent_1px)] [background-size:32px_32px]"
          aria-hidden
        />
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          {submitted ? (
            <div className="max-w-xl mx-auto bg-card border border-border rounded-3xl p-10 text-center shadow-card">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center mb-5 shadow-gold">
                <CheckCircle2 className="h-10 w-10 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">تم استلام طلبك بنجاح</h3>
              <p className="text-muted-foreground mb-6">شكراً لثقتك. سيقوم فريق العضوية بمراجعة طلبك والتواصل معك قريباً.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="outline" onClick={() => {
                  setSubmitted(false);
                  setForm({ fullName: "", phone: "", gender: "", email: "", nationalId: "", education: "", jobTitle: "", employer: "" });
                }}>
                  تقديم طلب جديد
                </Button>
                <Button asChild className="bg-gradient-cta text-primary-foreground shadow-gold">
                  <Link to="/e-services">العودة للخدمات الإلكترونية</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6 max-w-6xl mx-auto">
              {/* اللوحة الجانبية - مزايا العضوية بهوية ذهبية مميزة */}
              <aside className="relative bg-gradient-to-br from-accent via-accent to-accent/80 rounded-3xl p-8 text-accent-foreground overflow-hidden shadow-gold">
                <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-white/15" />
                <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-white/10" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold mb-5">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    عضوية معتمدة
                  </div>
                  <h3 className="text-2xl font-bold mb-2">لماذا تنضم إلينا؟</h3>
                  <p className="text-accent-foreground/80 text-sm mb-8 leading-relaxed">
                    العضوية ليست مجرد انتساب، بل التزام بقيم العطاء والتأثير الإيجابي.
                  </p>
                  <ul className="space-y-5">
                    {benefits.map((b, i) => (
                      <li key={i} className="flex gap-3">
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-accent-foreground/15 backdrop-blur-sm flex items-center justify-center">
                          <b.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold mb-0.5">{b.title}</p>
                          <p className="text-xs text-accent-foreground/75 leading-relaxed">{b.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>

              <form onSubmit={onSubmit} className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-card" noValidate>
                <div className="mb-6 flex items-center gap-4 pb-5 border-b">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-accent font-semibold">نموذج طلب العضوية</p>
                    <h2 className="text-xl font-bold text-foreground">أدخل بياناتك الأساسية</h2>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <IconField label="الاسم كاملاً" icon={User} error={errors.fullName} required>
                    <Input value={form.fullName} onChange={(e) => update("fullName", e.target.value)}
                      placeholder="الاسم الرباعي" className="pr-10" />
                  </IconField>

                  <IconField label="رقم الجوال" icon={Phone} error={errors.phone} required>
                    <Input value={form.phone} onChange={(e) => update("phone", e.target.value)}
                      placeholder="05xxxxxxxx" dir="ltr" className="pr-10 text-right" />
                  </IconField>

                  <IconField label="الجنس" icon={Users} error={errors.gender} required>
                    <div className="flex gap-2 pr-10">
                      {[{ v: "male", l: "ذكر" }, { v: "female", l: "أنثى" }].map((o) => (
                        <button type="button" key={o.v} onClick={() => update("gender", o.v)}
                          className={cn(
                            "flex-1 h-10 rounded-md border text-sm font-medium transition-all",
                            form.gender === o.v
                              ? "bg-accent text-accent-foreground border-accent shadow-sm"
                              : "bg-background border-input hover:border-accent/50",
                          )}>
                          {o.l}
                        </button>
                      ))}
                    </div>
                  </IconField>

                  <IconField label="البريد الإلكتروني" icon={Mail} error={errors.email} required>
                    <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                      placeholder="example@email.com" dir="ltr" className="pr-10 text-right" />
                  </IconField>

                  <IconField label="رقم الهوية الوطنية" icon={IdCard} error={errors.nationalId} required>
                    <Input value={form.nationalId}
                      onChange={(e) => update("nationalId", e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="1xxxxxxxxx" dir="ltr" className="pr-10 text-right" />
                  </IconField>

                  <IconField label="المؤهل العلمي" icon={GraduationCap} error={errors.education} required>
                    <Select value={form.education} onValueChange={(v) => update("education", v)}>
                      <SelectTrigger className="pr-10"><SelectValue placeholder="اختر المؤهل" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="below">دون الثانوية</SelectItem>
                        <SelectItem value="secondary">ثانوي</SelectItem>
                        <SelectItem value="diploma">دبلوم</SelectItem>
                        <SelectItem value="bachelor">بكالوريوس</SelectItem>
                        <SelectItem value="master">ماجستير</SelectItem>
                        <SelectItem value="phd">دكتوراه</SelectItem>
                      </SelectContent>
                    </Select>
                  </IconField>

                  <IconField label="المسمى الوظيفي" icon={Briefcase}>
                    <Input value={form.jobTitle} onChange={(e) => update("jobTitle", e.target.value)}
                      placeholder="اختياري" className="pr-10" />
                  </IconField>

                  <IconField label="جهة العمل" icon={Briefcase}>
                    <Input value={form.employer} onChange={(e) => update("employer", e.target.value)}
                      placeholder="اختياري" className="pr-10" />
                  </IconField>
                </div>

                <div className="mt-7 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-accent shrink-0" />
                    بياناتك محفوظة بسرية تامة وفق سياسة الخصوصية
                  </p>
                  <Button type="submit" className="gap-2 bg-gradient-cta text-primary-foreground hover:opacity-90 shadow-gold px-8">
                    <Send className="h-4 w-4" />
                    إرسال الطلب
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* رابط للخدمة الأخرى */}
          {!submitted && (
            <div className="mx-auto mt-10 max-w-6xl">
              <Link to="/e-services/volunteer"
                className="group flex items-center justify-between gap-4 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5 transition-smooth hover:border-primary hover:bg-primary/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <HandHeart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">خدمة أخرى</p>
                    <p className="font-semibold text-foreground">هل تفضّل التطوع بدلاً من العضوية؟</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 rotate-180 text-primary transition-transform group-hover:-translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
