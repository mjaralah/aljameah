import { useMemo, useState } from "react";
import { z } from "zod";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Heart,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  HandHeart,
  Clock,
  Users,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Field } from "@/components/eservices/FormFields";
import { usePageContent } from "@/hooks/usePublicContent";

// مخطط التحقق من البيانات
const volunteerSchema = z.object({
  fullName: z.string().trim().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل").max(100),
  idNumber: z.string().trim().regex(/^\d{10}$/, "رقم الهوية يجب أن يكون 10 أرقام"),
  gender: z.string().min(1, "اختر الجنس"),
  nationality: z.string().trim().min(2, "أدخل الجنسية").max(50),
  city: z.string().trim().min(2, "أدخل مكان الإقامة").max(80),
  birthDate: z.string().min(1, "أدخل تاريخ الميلاد"),
  maritalStatus: z.string().min(1, "اختر الحالة الاجتماعية"),
  phone: z.string().trim().regex(/^(05|\+9665)\d{8}$/, "رقم جوال سعودي غير صالح"),
  education: z.string().min(1, "اختر المؤهل"),
  skills: z.string().min(1, "اختر مهاراتك"),
  hasPriorExperience: z.string().min(1, "حدد خبرتك السابقة"),
  previousOrg: z.string().trim().max(120).optional().or(z.literal("")),
  job: z.string().trim().max(80).optional().or(z.literal("")),
  employer: z.string().trim().max(120).optional().or(z.literal("")),
  preferredActivities: z.string().trim().min(5, "اذكر الأنشطة المفضلة").max(300),
  volunteerLocation: z.string().min(1, "اختر مكان التطوع"),
  otherLocation: z.string().trim().max(120).optional().or(z.literal("")),
  availability: z.string().min(1, "اختر وقت التطوع"),
  referralSource: z.string().min(1, "اختر كيف عرفت عنا"),
});

type VolunteerForm = z.infer<typeof volunteerSchema>;

const initial: VolunteerForm = {
  fullName: "", idNumber: "", gender: "", nationality: "", city: "",
  birthDate: "", maritalStatus: "", phone: "", education: "", skills: "",
  hasPriorExperience: "", previousOrg: "", job: "", employer: "",
  preferredActivities: "", volunteerLocation: "", otherLocation: "",
  availability: "", referralSource: "",
};

const steps = [
  { id: 0, title: "البيانات الشخصية", icon: User, fields: ["fullName", "idNumber", "gender", "nationality", "city", "birthDate", "maritalStatus", "phone"] },
  { id: 1, title: "المؤهلات والمهارات", icon: GraduationCap, fields: ["education", "skills", "hasPriorExperience", "previousOrg"] },
  { id: 2, title: "العمل والاهتمامات", icon: Briefcase, fields: ["job", "employer", "preferredActivities"] },
  { id: 3, title: "تفضيلات التطوع", icon: Heart, fields: ["volunteerLocation", "otherLocation", "availability", "referralSource"] },
] as const;

export default function VolunteerService() {
  const { toast } = useToast();
  const { data: pageSections } = usePageContent("eservices_volunteer");
  const intro = (pageSections ?? []).find((s) => s.section_key === "intro");
  const [data, setData] = useState<VolunteerForm>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof VolunteerForm, string>>>({});
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof VolunteerForm>(key: K, val: VolunteerForm[K]) => {
    setData((d) => ({ ...d, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const progress = useMemo(() => {
    const filled = (Object.keys(data) as (keyof VolunteerForm)[]).filter((k) => {
      if (["previousOrg", "otherLocation", "job", "employer"].includes(k)) return true;
      return String(data[k]).trim().length > 0;
    }).length;
    return Math.round((filled / Object.keys(data).length) * 100);
  }, [data]);

  const validateStep = (idx: number) => {
    const stepFields = steps[idx].fields as readonly (keyof VolunteerForm)[];
    const partial = volunteerSchema.safeParse(data);
    if (partial.success) return true;
    const stepErrors: Partial<Record<keyof VolunteerForm, string>> = {};
    let ok = true;
    for (const issue of partial.error.issues) {
      const f = issue.path[0] as keyof VolunteerForm;
      if (stepFields.includes(f)) {
        stepErrors[f] = issue.message;
        ok = false;
      }
    }
    setErrors(stepErrors);
    return ok;
  };

  const next = () => { if (validateStep(step)) setStep((s) => Math.min(s + 1, steps.length - 1)); };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = volunteerSchema.safeParse(data);
    if (!result.success) {
      const errs: Partial<Record<keyof VolunteerForm, string>> = {};
      for (const issue of result.error.issues) errs[issue.path[0] as keyof VolunteerForm] = issue.message;
      setErrors(errs);
      const firstErrorStep = steps.findIndex((s) => s.fields.some((f) => errs[f as keyof VolunteerForm]));
      if (firstErrorStep >= 0) setStep(firstErrorStep);
      toast({ title: "تحقق من البيانات", description: "يوجد بعض الحقول التي تحتاج إلى مراجعة", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("volunteer_requests").insert({
      full_name: data.fullName,
      id_number: data.idNumber,
      gender: data.gender,
      nationality: data.nationality,
      city: data.city,
      birth_date: data.birthDate || null,
      marital_status: data.maritalStatus,
      phone: data.phone,
      education: data.education,
      skills: data.skills,
      has_prior_experience: data.hasPriorExperience,
      previous_org: data.previousOrg || null,
      job: data.job || null,
      employer: data.employer || null,
      preferred_activities: data.preferredActivities,
      volunteer_location: data.volunteerLocation,
      other_location: data.otherLocation || null,
      availability: data.availability,
      referral_source: data.referralSource,
    });
    if (error) {
      toast({ title: "تعذّر إرسال الطلب", description: error.message, variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "تم استلام طلبك بنجاح", description: "سنتواصل معك قريباً عبر رقم الجوال المسجل" });
  };

  if (submitted) {
    return (
      <>
        <PageHero eyebrow="الخدمات الإلكترونية" title={intro?.title || "طلب التطوع"} lead={intro?.content || "انضم إلى أسرة المتطوعين معنا"} />
        <section className="container py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-primary shadow-card">
              <CheckCircle2 className="h-12 w-12 text-primary-foreground" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-foreground">شكراً لك على روح العطاء</h2>
            <p className="mb-2 text-lg text-muted-foreground">تم استلام طلب التطوع الخاص بك بنجاح</p>
            <p className="mb-8 text-muted-foreground">سيقوم فريق المتطوعين بمراجعة بياناتك والتواصل معك خلال 3 أيام عمل</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { icon: HandHeart, label: "أهلاً بك متطوعاً" },
                { icon: Clock, label: "ردّ خلال 3 أيام" },
                { icon: Users, label: "+500 متطوع نشط" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-xl border bg-card p-4 shadow-soft">
                  <Icon className="mx-auto mb-2 h-6 w-6 text-primary" />
                  <p className="text-sm text-foreground">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button onClick={() => { setData(initial); setSubmitted(false); setStep(0); }} variant="outline">
                تقديم طلب جديد
              </Button>
              <Button asChild className="bg-gradient-primary">
                <Link to="/e-services">العودة للخدمات الإلكترونية</Link>
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  }

  const StepIcon = steps[step].icon;

  return (
    <>
      <PageHero
        eyebrow="الخدمات الإلكترونية"
        title={intro?.title || "انضم لفريق المتطوعين"}
        lead={intro?.content || "كن جزءاً من رسالتنا في خدمة المجتمع — املأ النموذج وسنتواصل معك"}
        breadcrumb={[
          { label: "الخدمات الإلكترونية", to: "/e-services" },
          { label: intro?.title || "التطوع" },
        ]}
      />

      {/* خلفية بنمط نقاط مميزة لخدمة التطوع */}
      <section className="relative container py-12 lg:py-16">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04] [background-image:radial-gradient(hsl(var(--primary))_1.5px,transparent_1.5px)] [background-size:22px_22px]"
          aria-hidden
        />
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="mb-6 flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                      strokeLinecap="round" strokeDasharray={`${(progress / 100) * 264} 264`} className="transition-all duration-500" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">{progress}%</div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">اكتمال الطلب</h3>
                  <p className="text-xs text-muted-foreground">املأ جميع الحقول للإرسال</p>
                </div>
              </div>

              <ol className="space-y-2">
                {steps.map((s, idx) => {
                  const Icon = s.icon;
                  const isActive = idx === step;
                  const isDone = idx < step;
                  return (
                    <li key={s.id}>
                      <button type="button" onClick={() => setStep(idx)}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-xl border p-3 text-right transition-smooth",
                          isActive && "border-primary bg-primary/5 shadow-soft",
                          isDone && !isActive && "border-primary/40 bg-primary/5",
                          !isActive && !isDone && "border-border hover:border-primary/40"
                        )}>
                        <div className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-smooth",
                          isActive && "bg-gradient-primary text-primary-foreground",
                          isDone && !isActive && "bg-primary/10 text-primary",
                          !isActive && !isDone && "bg-muted text-muted-foreground"
                        )}>
                          {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <p className={cn("text-xs", isActive ? "text-primary" : "text-muted-foreground")}>خطوة {idx + 1} من {steps.length}</p>
                          <p className="text-sm font-semibold text-foreground">{s.title}</p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-6 rounded-xl bg-gradient-primary p-5 text-primary-foreground">
                <Sparkles className="mb-2 h-5 w-5 text-white/90" />
                <p className="text-sm leading-relaxed">«العطاء لا يُقاس بالكمّ، بل بأثره في حياة الآخرين»</p>
              </div>
            </div>
          </aside>

          <form onSubmit={onSubmit} className="rounded-2xl border bg-card p-6 shadow-card md:p-10">
            <div className="mb-8 flex items-center gap-4 border-b pb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
                <StepIcon className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-primary font-medium">الخطوة {step + 1}</p>
                <h2 className="text-2xl font-bold text-foreground">{steps[step].title}</h2>
              </div>
            </div>

            {step === 0 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="الاسم الرباعي" error={errors.fullName} required>
                  <Input value={data.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="مثال: محمد عبدالله سالم العتيبي" />
                </Field>
                <Field label="رقم الهوية" error={errors.idNumber} required>
                  <Input inputMode="numeric" maxLength={10} value={data.idNumber}
                    onChange={(e) => update("idNumber", e.target.value.replace(/\D/g, ""))} placeholder="10 أرقام" />
                </Field>
                <Field label="الجنس" error={errors.gender} required>
                  <Select value={data.gender} onValueChange={(v) => update("gender", v)}>
                    <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ذكر</SelectItem>
                      <SelectItem value="female">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="الجنسية" error={errors.nationality} required>
                  <Input value={data.nationality} onChange={(e) => update("nationality", e.target.value)} placeholder="مثال: سعودي" />
                </Field>
                <Field label="مكان الإقامة" error={errors.city} required>
                  <Input value={data.city} onChange={(e) => update("city", e.target.value)} placeholder="المدينة / الحي" />
                </Field>
                <Field label="تاريخ الميلاد" error={errors.birthDate} required>
                  <Input type="date" value={data.birthDate} onChange={(e) => update("birthDate", e.target.value)} />
                </Field>
                <Field label="الحالة الاجتماعية" error={errors.maritalStatus} required>
                  <Select value={data.maritalStatus} onValueChange={(v) => update("maritalStatus", v)}>
                    <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">أعزب</SelectItem>
                      <SelectItem value="married">متزوج</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="رقم الجوال" error={errors.phone} required>
                  <Input dir="ltr" value={data.phone} onChange={(e) => update("phone", e.target.value)} placeholder="05xxxxxxxx" />
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="المؤهل العلمي" error={errors.education} required>
                  <Select value={data.education} onValueChange={(v) => update("education", v)}>
                    <SelectTrigger><SelectValue placeholder="اختر المؤهل" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">ابتدائي</SelectItem>
                      <SelectItem value="middle">متوسط</SelectItem>
                      <SelectItem value="high">ثانوي</SelectItem>
                      <SelectItem value="diploma">دبلوم</SelectItem>
                      <SelectItem value="bachelor">بكالوريوس</SelectItem>
                      <SelectItem value="master">ماجستير</SelectItem>
                      <SelectItem value="phd">دكتوراه</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="المهارات والقدرات" error={errors.skills} required>
                  <Select value={data.skills} onValueChange={(v) => update("skills", v)}>
                    <SelectTrigger><SelectValue placeholder="اختر مجال مهارتك" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="content">صناعة المحتوى</SelectItem>
                      <SelectItem value="design">التصميم الجرافيكي</SelectItem>
                      <SelectItem value="media">التصوير والإعلام</SelectItem>
                      <SelectItem value="teaching">التدريب والتعليم</SelectItem>
                      <SelectItem value="medical">المجال الطبي</SelectItem>
                      <SelectItem value="logistics">التنظيم اللوجستي</SelectItem>
                      <SelectItem value="tech">التقنية والبرمجة</SelectItem>
                      <SelectItem value="languages">اللغات والترجمة</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="هل لديك مشاركات تطوعية سابقة؟" error={errors.hasPriorExperience} required>
                  <Select value={data.hasPriorExperience} onValueChange={(v) => update("hasPriorExperience", v)}>
                    <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">نعم</SelectItem>
                      <SelectItem value="no">لا</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="آخر جهة تطوعت بها (اختياري)" error={errors.previousOrg}>
                  <Input value={data.previousOrg} onChange={(e) => update("previousOrg", e.target.value)}
                    placeholder="اسم الجمعية أو الجهة" disabled={data.hasPriorExperience !== "yes"} />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="الوظيفة (اختياري)" error={errors.job}>
                  <Input value={data.job} onChange={(e) => update("job", e.target.value)} placeholder="مثال: مهندس / طالب" />
                </Field>
                <Field label="جهة العمل (اختياري)" error={errors.employer}>
                  <Input value={data.employer} onChange={(e) => update("employer", e.target.value)} placeholder="اسم جهة العمل" />
                </Field>
                <div className="md:col-span-2">
                  <Field label="الأنشطة التي ترغب بالمشاركة بها" error={errors.preferredActivities} required>
                    <Textarea value={data.preferredActivities} onChange={(e) => update("preferredActivities", e.target.value)}
                      placeholder="اذكر باختصار الأنشطة والمجالات التي تستهويك" rows={4} />
                  </Field>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="مكان التطوع" error={errors.volunteerLocation} required>
                  <Select value={data.volunteerLocation} onValueChange={(v) => update("volunteerLocation", v)}>
                    <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hq">مقر الجمعية</SelectItem>
                      <SelectItem value="field">ميداني</SelectItem>
                      <SelectItem value="remote">عن بُعد</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="مكان آخر (اختياري)" error={errors.otherLocation}>
                  <Input value={data.otherLocation} onChange={(e) => update("otherLocation", e.target.value)}
                    placeholder="اذكر المكان" disabled={data.volunteerLocation !== "other"} />
                </Field>
                <Field label="أوقات التطوع" error={errors.availability} required>
                  <Select value={data.availability} onValueChange={(v) => update("availability", v)}>
                    <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">الفترة الصباحية</SelectItem>
                      <SelectItem value="evening">الفترة المسائية</SelectItem>
                      <SelectItem value="weekend">نهاية الأسبوع</SelectItem>
                      <SelectItem value="flexible">مرن حسب الحاجة</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="كيف عرفت عنا؟" error={errors.referralSource} required>
                  <Select value={data.referralSource} onValueChange={(v) => update("referralSource", v)}>
                    <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social">وسائل التواصل الاجتماعي</SelectItem>
                      <SelectItem value="friend">صديق / قريب</SelectItem>
                      <SelectItem value="website">الموقع الإلكتروني</SelectItem>
                      <SelectItem value="event">فعالية / معرض</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            )}

            <div className="mt-10 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="outline" onClick={back} disabled={step === 0} className="gap-2">
                <ChevronRight className="h-4 w-4" />
                السابق
              </Button>

              {step < steps.length - 1 ? (
                <Button type="button" onClick={next} className="gap-2 bg-gradient-primary hover:opacity-90">
                  التالي
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="gap-2 bg-gradient-primary hover:opacity-90">
                  <HandHeart className="h-4 w-4" />
                  إرسال طلب التطوع
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* رابط الانتقال إلى خدمة العضوية */}
        <div className="mx-auto mt-10 max-w-6xl">
          <Link to="/e-services/membership"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-dashed border-accent/40 bg-accent-soft/30 p-5 transition-smooth hover:border-accent hover:bg-accent-soft/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">خدمة أخرى</p>
                <p className="font-semibold text-foreground">هل تبحث عن طلب عضوية بدلاً من التطوع؟</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 rotate-180 text-accent transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>
      </section>
    </>
  );
}
