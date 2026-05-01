import { useMemo, useState } from "react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  IdCard,
  Mail,
  Phone,
  BadgeCheck,
  Send,
  Award,
  Gift,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  fullName: "",
  idNumber: "",
  gender: "",
  nationality: "",
  city: "",
  birthDate: "",
  maritalStatus: "",
  phone: "",
  education: "",
  skills: "",
  hasPriorExperience: "",
  previousOrg: "",
  job: "",
  employer: "",
  preferredActivities: "",
  volunteerLocation: "",
  otherLocation: "",
  availability: "",
  referralSource: "",
};

const steps = [
  { id: 0, title: "البيانات الشخصية", icon: User, fields: ["fullName", "idNumber", "gender", "nationality", "city", "birthDate", "maritalStatus", "phone"] },
  { id: 1, title: "المؤهلات والمهارات", icon: GraduationCap, fields: ["education", "skills", "hasPriorExperience", "previousOrg"] },
  { id: 2, title: "العمل والاهتمامات", icon: Briefcase, fields: ["job", "employer", "preferredActivities"] },
  { id: 3, title: "تفضيلات التطوع", icon: Heart, fields: ["volunteerLocation", "otherLocation", "availability", "referralSource"] },
] as const;

export default function Volunteer() {
  const { toast } = useToast();
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
      // الحقول الاختيارية لا تُحسب كناقصة
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

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = volunteerSchema.safeParse(data);
    if (!result.success) {
      const errs: Partial<Record<keyof VolunteerForm, string>> = {};
      for (const issue of result.error.issues) {
        errs[issue.path[0] as keyof VolunteerForm] = issue.message;
      }
      setErrors(errs);
      // الانتقال لأول خطوة بها خطأ
      const firstErrorStep = steps.findIndex((s) =>
        s.fields.some((f) => errs[f as keyof VolunteerForm])
      );
      if (firstErrorStep >= 0) setStep(firstErrorStep);
      toast({
        title: "تحقق من البيانات",
        description: "يوجد بعض الحقول التي تحتاج إلى مراجعة",
        variant: "destructive",
      });
      return;
    }
    setSubmitted(true);
    toast({
      title: "تم استلام طلبك بنجاح",
      description: "سنتواصل معك قريباً عبر رقم الجوال المسجل",
    });
  };

  if (submitted) {
    return (
      <>
        <PageHero title="طلب التطوع" lead="انضم إلى أسرة المتطوعين معنا" />
        <section className="container py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-primary shadow-card">
              <CheckCircle2 className="h-12 w-12 text-primary-foreground" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-foreground">شكراً لك على روح العطاء</h2>
            <p className="mb-2 text-lg text-muted-foreground">
              تم استلام طلب التطوع الخاص بك بنجاح
            </p>
            <p className="mb-8 text-muted-foreground">
              سيقوم فريق المتطوعين بمراجعة بياناتك والتواصل معك خلال 3 أيام عمل
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { icon: HandHeart, label: "أهلاً بك متطوعاً" },
                { icon: Clock, label: "ردّ خلال 3 أيام" },
                { icon: Users, label: "+500 متطوع نشط" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-xl border bg-card p-4 shadow-soft">
                  <Icon className="mx-auto mb-2 h-6 w-6 text-accent" />
                  <p className="text-sm text-foreground">{label}</p>
                </div>
              ))}
            </div>
            <Button
              onClick={() => {
                setData(initial);
                setSubmitted(false);
                setStep(0);
              }}
              variant="outline"
              className="mt-8"
            >
              تقديم طلب جديد
            </Button>
          </div>
        </section>
      </>
    );
  }

  const StepIcon = steps[step].icon;

  return (
    <>
      <PageHero
        title="انضم لفريق المتطوعين"
        lead="كن جزءاً من رسالتنا في خدمة المجتمع — املأ النموذج وسنتواصل معك"
      />

      <section className="container py-12 lg:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[320px_1fr]">
          {/* اللوحة الجانبية: المؤشرات والخطوات */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border bg-card p-6 shadow-card">
              {/* شريط التقدم الدائري */}
              <div className="mb-6 flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="hsl(var(--accent))"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(progress / 100) * 264} 264`}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
                    {progress}%
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">اكتمال الطلب</h3>
                  <p className="text-xs text-muted-foreground">املأ جميع الحقول للإرسال</p>
                </div>
              </div>

              {/* قائمة الخطوات */}
              <ol className="space-y-2">
                {steps.map((s, idx) => {
                  const Icon = s.icon;
                  const isActive = idx === step;
                  const isDone = idx < step;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => setStep(idx)}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-xl border p-3 text-right transition-smooth",
                          isActive && "border-primary bg-primary/5 shadow-soft",
                          isDone && !isActive && "border-accent/40 bg-accent-soft/30",
                          !isActive && !isDone && "border-border hover:border-primary/40"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-smooth",
                            isActive && "bg-gradient-primary text-primary-foreground",
                            isDone && !isActive && "bg-accent text-accent-foreground",
                            !isActive && !isDone && "bg-muted text-muted-foreground"
                          )}
                        >
                          {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <p className={cn("text-xs", isActive ? "text-primary" : "text-muted-foreground")}>
                            خطوة {idx + 1} من {steps.length}
                          </p>
                          <p className="text-sm font-semibold text-foreground">{s.title}</p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ol>

              {/* اقتباس تحفيزي */}
              <div className="mt-6 rounded-xl bg-gradient-cta p-5 text-primary-foreground">
                <Sparkles className="mb-2 h-5 w-5 text-white/90" />
                <p className="text-sm leading-relaxed">
                  «العطاء لا يُقاس بالكمّ، بل بأثره في حياة الآخرين»
                </p>
              </div>
            </div>
          </aside>

          {/* النموذج */}
          <form onSubmit={onSubmit} className="rounded-2xl border bg-card p-6 shadow-card md:p-10">
            {/* رأس الخطوة */}
            <div className="mb-8 flex items-center gap-4 border-b pb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
                <StepIcon className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-accent font-medium">الخطوة {step + 1}</p>
                <h2 className="text-2xl font-bold text-foreground">{steps[step].title}</h2>
              </div>
            </div>

            {/* محتوى الخطوة */}
            {step === 0 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="الاسم الرباعي" error={errors.fullName} required>
                  <Input
                    value={data.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    placeholder="مثال: محمد عبدالله سالم العتيبي"
                  />
                </Field>
                <Field label="رقم الهوية" error={errors.idNumber} required>
                  <Input
                    inputMode="numeric"
                    maxLength={10}
                    value={data.idNumber}
                    onChange={(e) => update("idNumber", e.target.value.replace(/\D/g, ""))}
                    placeholder="10 أرقام"
                  />
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
                  <Input
                    value={data.nationality}
                    onChange={(e) => update("nationality", e.target.value)}
                    placeholder="مثال: سعودي"
                  />
                </Field>
                <Field label="مكان الإقامة" error={errors.city} required>
                  <Input
                    value={data.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="المدينة / الحي"
                  />
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
                  <Input
                    dir="ltr"
                    value={data.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="05xxxxxxxx"
                  />
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
                  <Input
                    value={data.previousOrg}
                    onChange={(e) => update("previousOrg", e.target.value)}
                    placeholder="اسم الجمعية أو الجهة"
                    disabled={data.hasPriorExperience !== "yes"}
                  />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="الوظيفة (اختياري)" error={errors.job}>
                  <Input
                    value={data.job}
                    onChange={(e) => update("job", e.target.value)}
                    placeholder="مثال: مهندس / طالب"
                  />
                </Field>
                <Field label="جهة العمل (اختياري)" error={errors.employer}>
                  <Input
                    value={data.employer}
                    onChange={(e) => update("employer", e.target.value)}
                    placeholder="اسم جهة العمل"
                  />
                </Field>
                <div className="md:col-span-2">
                  <Field label="الأنشطة التي ترغب بالمشاركة بها" error={errors.preferredActivities} required>
                    <Textarea
                      value={data.preferredActivities}
                      onChange={(e) => update("preferredActivities", e.target.value)}
                      placeholder="اذكر باختصار الأنشطة والمجالات التي تستهويك"
                      rows={4}
                    />
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
                  <Input
                    value={data.otherLocation}
                    onChange={(e) => update("otherLocation", e.target.value)}
                    placeholder="اذكر المكان"
                    disabled={data.volunteerLocation !== "other"}
                  />
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

            {/* أزرار التنقل */}
            <div className="mt-10 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={back}
                disabled={step === 0}
                className="gap-2"
              >
                <ChevronRight className="h-4 w-4" />
                السابق
              </Button>

              {step < steps.length - 1 ? (
                <Button type="button" onClick={next} className="gap-2 bg-gradient-primary hover:opacity-90">
                  التالي
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="gap-2 bg-gradient-cta text-primary-foreground hover:opacity-90 shadow-gold">
                  <HandHeart className="h-4 w-4" />
                  إرسال طلب التطوع
                </Button>
              )}
            </div>
          </form>
        </div>
      </section>

      <MembershipSection />
    </>
  );
}

// مكوّن مساعد لحقل النموذج
function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1 text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-accent">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ============================================================
// قسم طلب العضوية - تصميم مبتكر مختلف عن النموذج المرجعي
// ============================================================
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

const benefits = [
  { icon: Award, title: "شهادة عضوية معتمدة", desc: "وثيقة رسمية تُثبت انتسابك للجمعية" },
  { icon: Gift, title: "مزايا حصرية للأعضاء", desc: "خصومات وفعاليات وبرامج تدريبية" },
  { icon: TrendingUp, title: "حق التصويت في الجمعية العمومية", desc: "شارك في صنع القرار وتوجيه المسار" },
  { icon: Users, title: "شبكة علاقات واسعة", desc: "تواصل مع نخبة من المهتمين بالعمل التطوعي" },
];

function MembershipSection() {
  const { toast } = useToast();
  const [form, setForm] = useState<MembershipForm>({
    fullName: "",
    phone: "",
    gender: "",
    email: "",
    nationalId: "",
    education: "",
    jobTitle: "",
    employer: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof MembershipForm, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const update = (k: keyof MembershipForm, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const onSubmit = (e: React.FormEvent) => {
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
    setSubmitted(true);
    toast({ title: "تم استلام طلب العضوية", description: "سنتواصل معك خلال 3 أيام عمل" });
  };

  return (
    <section id="membership" className="relative py-16 md:py-24 overflow-hidden bg-muted/30">
      {/* خلفية زخرفية */}
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        {/* عنوان القسم */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <BadgeCheck className="h-4 w-4" />
            انضم إلى أسرة الجمعية
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
            طلب عضوية
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            كن جزءاً من رحلة العطاء، وساهم في صياغة مستقبل أفضل لمجتمعنا من خلال عضويتك الفاعلة في الجمعية.
          </p>
        </div>

        {submitted ? (
          <div className="max-w-xl mx-auto bg-card border border-border rounded-3xl p-10 text-center shadow-elegant">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mb-5 shadow-gold">
              <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">تم استلام طلبك بنجاح</h3>
            <p className="text-muted-foreground mb-6">
              شكراً لثقتك. سيقوم فريق العضوية بمراجعة طلبك والتواصل معك قريباً.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(false);
                setForm({ fullName: "", phone: "", gender: "", email: "", nationalId: "", education: "", jobTitle: "", employer: "" });
              }}
            >
              تقديم طلب جديد
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6 max-w-6xl mx-auto">
            {/* اللوحة اليمنى - مزايا العضوية */}
            <aside className="relative bg-gradient-primary rounded-3xl p-8 text-primary-foreground overflow-hidden shadow-elegant">
              <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-white/10" />
              <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-white/5" />
              <div className="relative">
                <Sparkles className="h-8 w-8 mb-4 opacity-90" />
                <h3 className="text-2xl font-bold mb-2">لماذا تنضم إلينا؟</h3>
                <p className="text-primary-foreground/80 text-sm mb-8 leading-relaxed">
                  العضوية ليست مجرد انتساب، بل التزام بقيم العطاء والتأثير الإيجابي.
                </p>
                <ul className="space-y-5">
                  {benefits.map((b, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                        <b.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold mb-0.5">{b.title}</p>
                        <p className="text-xs text-primary-foreground/75 leading-relaxed">{b.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* اللوحة اليسرى - النموذج */}
            <form
              onSubmit={onSubmit}
              className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-elegant"
              noValidate
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <IconField label="الاسم كاملاً" icon={User} error={errors.fullName} required>
                  <Input
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    placeholder="الاسم الرباعي"
                    className="pr-10"
                  />
                </IconField>

                <IconField label="رقم الجوال" icon={Phone} error={errors.phone} required>
                  <Input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                    className="pr-10 text-right"
                  />
                </IconField>

                <IconField label="الجنس" icon={Users} error={errors.gender} required>
                  <div className="flex gap-2 pr-10">
                    {[
                      { v: "male", l: "ذكر" },
                      { v: "female", l: "أنثى" },
                    ].map((o) => (
                      <button
                        type="button"
                        key={o.v}
                        onClick={() => update("gender", o.v)}
                        className={cn(
                          "flex-1 h-10 rounded-md border text-sm font-medium transition-all",
                          form.gender === o.v
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background border-input hover:border-primary/50",
                        )}
                      >
                        {o.l}
                      </button>
                    ))}
                  </div>
                </IconField>

                <IconField label="البريد الإلكتروني" icon={Mail} error={errors.email} required>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="example@email.com"
                    dir="ltr"
                    className="pr-10 text-right"
                  />
                </IconField>

                <IconField label="رقم الهوية الوطنية" icon={IdCard} error={errors.nationalId} required>
                  <Input
                    value={form.nationalId}
                    onChange={(e) => update("nationalId", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="1xxxxxxxxx"
                    dir="ltr"
                    className="pr-10 text-right"
                  />
                </IconField>

                <IconField label="المؤهل العلمي" icon={GraduationCap} error={errors.education} required>
                  <Select value={form.education} onValueChange={(v) => update("education", v)}>
                    <SelectTrigger className="pr-10">
                      <SelectValue placeholder="اختر المؤهل" />
                    </SelectTrigger>
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
                  <Input
                    value={form.jobTitle}
                    onChange={(e) => update("jobTitle", e.target.value)}
                    placeholder="اختياري"
                    className="pr-10"
                  />
                </IconField>

                <IconField label="جهة العمل" icon={Briefcase}>
                  <Input
                    value={form.employer}
                    onChange={(e) => update("employer", e.target.value)}
                    placeholder="اختياري"
                    className="pr-10"
                  />
                </IconField>
              </div>

              {/* تذييل النموذج */}
              <div className="mt-7 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
                  بياناتك محفوظة بسرية تامة وفق سياسة الخصوصية
                </p>
                <Button
                  type="submit"
                  className="gap-2 bg-gradient-cta text-primary-foreground hover:opacity-90 shadow-gold px-8"
                >
                  <Send className="h-4 w-4" />
                  إرسال الطلب
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

// حقل بأيقونة داخلية
function IconField({
  label,
  icon: Icon,
  error,
  required,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1 text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-accent">*</span>}
      </Label>
      <div className="relative">
        <Icon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        {children}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
