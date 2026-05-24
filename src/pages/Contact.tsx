import { useState } from "react";
import { z } from "zod";
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
  Phone,
  Mail,
  MapPin,
  Clock,
  CreditCard,
  CheckCircle2,
  Send,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  User,
  AtSign,
  Smartphone,
  Headphones,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  MessageCircle,
  HelpCircle,
  Building2,
  Handshake,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IconField } from "@/components/eservices/FormFields";
import { usePageContent, useSiteSettings } from "@/hooks/usePublicContent";
import { useSystemForm } from "@/hooks/useSystemForm";

const contactSchema = z.object({
  fullName: z.string().trim().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل").max(100),
  phone: z.string().trim().regex(/^(05|\+9665)\d{8}$/, "رقم جوال سعودي غير صالح"),
  email: z.string().trim().email("بريد إلكتروني غير صالح").max(120),
  purpose: z.string().min(1, "اختر الغرض من التواصل"),
  message: z.string().trim().min(10, "الرسالة يجب أن تكون 10 أحرف على الأقل").max(1000, "الرسالة طويلة جداً"),
});

type ContactForm = z.infer<typeof contactSchema>;

const purposes = [
  { v: "inquiry", l: "استفسار عام", icon: HelpCircle },
  { v: "partnership", l: "شراكة وتعاون", icon: Handshake },
  { v: "complaint", l: "شكوى أو ملاحظة", icon: Megaphone },
  { v: "donation", l: "استفسار عن التبرعات", icon: CreditCard },
  { v: "media", l: "تواصل إعلامي", icon: MessageSquare },
  { v: "other", l: "أخرى", icon: Building2 },
];

const channels = [
  {
    icon: Phone,
    label: "اتصل بنا",
    primary: "055593****",
    secondary: "056869****",
    href: "tel:+966555936241",
    accent: "primary" as const,
  },
  {
    icon: Mail,
    label: "البريد الإلكتروني",
    primary: "info@eata.org.sa",
    secondary: "للمراسلة الرسمية",
    href: "mailto:info@eata.org.sa",
    accent: "accent" as const,
  },
  {
    icon: Clock,
    label: "أوقات العمل",
    primary: "الأحد — الخميس",
    secondary: "8:00 ص — 4:00 م",
    accent: "primary" as const,
  },
  {
    icon: MapPin,
    label: "عنواننا",
    primary: "حي العوالي الغربي",
    secondary: "الرياض، المملكة العربية السعودية",
    accent: "accent" as const,
  },
];

const socials = [
  { icon: Twitter, label: "تويتر", href: "#", color: "hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]" },
  { icon: Instagram, label: "انستغرام", href: "#", color: "hover:bg-[#E4405F]/10 hover:text-[#E4405F]" },
  { icon: Facebook, label: "فيسبوك", href: "#", color: "hover:bg-[#1877F2]/10 hover:text-[#1877F2]" },
  { icon: Youtube, label: "يوتيوب", href: "#", color: "hover:bg-[#FF0000]/10 hover:text-[#FF0000]" },
  { icon: MessageCircle, label: "واتساب", href: "#", color: "hover:bg-[#25D366]/10 hover:text-[#25D366]" },
];

export default function Contact() {
  const { toast } = useToast();
  const { data: pageSections } = usePageContent("contact");
  const { data: systemForm } = useSystemForm("contact");
  const sectionMap = (pageSections ?? []).reduce<Record<string, any>>(
    (acc, s) => ({ ...acc, [s.section_key]: s }),
    {},
  );
  const intro = sectionMap.intro;
  const hours = sectionMap.hours;
  const mapSec = sectionMap.map;
  const formUnavailable = systemForm && (systemForm.archived || !systemForm.published);

  const [form, setForm] = useState<ContactForm>({
    fullName: "",
    phone: "",
    email: "",
    purpose: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const update = <K extends keyof ContactForm>(k: K, v: ContactForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = contactSchema.safeParse(form);
    if (!res.success) {
      const fieldErrors: Partial<Record<keyof ContactForm, string>> = {};
      res.error.issues.forEach((i) => {
        const k = i.path[0] as keyof ContactForm;
        if (!fieldErrors[k]) fieldErrors[k] = i.message;
      });
      setErrors(fieldErrors);
      toast({ title: "تحقق من البيانات", description: "يرجى تصحيح الحقول المظللة", variant: "destructive" });
      return;
    }

    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      full_name: form.fullName,
      phone: form.phone,
      email: form.email,
      purpose: form.purpose,
      message: form.message,
    });
    setSending(false);

    if (error) {
      toast({ title: "تعذّر إرسال الرسالة", description: error.message, variant: "destructive" });
      return;
    }

    setSubmitted(true);
    toast({ title: "تم استلام رسالتك بنجاح", description: "سنتواصل معك خلال 48 ساعة" });
  };

  const remaining = 1000 - form.message.length;

  return (
    <>
      <PageHero
        eyebrow="نحن هنا لخدمتك"
        title={intro?.title || "تواصل معنا"}
        lead={intro?.content || "نُرحب بأسئلتكم وملاحظاتكم ومقترحاتكم — اختر الطريقة الأنسب للتواصل وسنردّ عليك بأسرع وقت."}
        breadcrumb={[{ label: intro?.title || "تواصل معنا" }]}
      />

      {/* قسم قنوات التواصل السريعة - شريط أفقي */}
      <section className="container -mt-10 relative z-10 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {channels.map((c) => {
            const isPrimary = c.accent === "primary";
            const Wrapper = (c.href ? "a" : "div") as "a" | "div";
            return (
              <Wrapper
                key={c.label}
                {...(c.href ? { href: c.href } : {})}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-card transition-smooth",
                  c.href && "hover:-translate-y-1 hover:shadow-elegant cursor-pointer",
                )}
              >
                <div
                  className={cn(
                    "mb-3 flex h-11 w-11 items-center justify-center rounded-xl transition-smooth",
                    isPrimary
                      ? "bg-primary/10 text-primary group-hover:bg-gradient-primary group-hover:text-primary-foreground"
                      : "bg-accent/15 text-accent group-hover:bg-gradient-gold group-hover:text-accent-foreground",
                  )}
                >
                  <c.icon className="h-5 w-5" />
                </div>
                <p className="text-xs text-muted-foreground mb-0.5">{c.label}</p>
                <p className="text-sm font-bold text-foreground" dir={c.label === "اتصل بنا" || c.label === "البريد الإلكتروني" ? "ltr" : undefined}>
                  {c.primary}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{c.secondary}</p>
              </Wrapper>
            );
          })}
        </div>
      </section>

      {/* قسم النموذج + الشريط الجانبي */}
      <section className="container pb-16 md:pb-20">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6 max-w-6xl mx-auto">
          {/* الشريط الجانبي: معلومات + سوشيال + IBAN */}
          <aside className="space-y-5">
            {/* بطاقة الترحيب */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-7 text-primary-foreground shadow-elegant">
              <div className="absolute -top-16 -left-16 w-44 h-44 rounded-full bg-white/10" />
              <div className="absolute -bottom-12 -right-12 w-36 h-36 rounded-full bg-accent/20" />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-bold mb-4">
                  <Headphones className="h-3.5 w-3.5" />
                  دعم على مدار الساعة
                </div>
                <h2 className="text-2xl font-bold mb-2">سعداء بسماع صوتكم</h2>
                <p className="text-sm text-primary-foreground/85 leading-relaxed">
                  فريقنا جاهز للإجابة على استفساراتكم وتقديم العون. ملاحظاتكم تُساهم في تطوير خدماتنا.
                </p>
              </div>
            </div>

            {/* بطاقة IBAN */}
            <div className="rounded-3xl border bg-card p-6 shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">للتبرع المباشر</p>
                  <p className="font-bold text-foreground">رقم الآيبان</p>
                </div>
              </div>
              <div className="rounded-xl bg-muted/60 p-3 font-mono text-sm text-foreground tracking-wider" dir="ltr">
                SA86 8000 0384 6080 1010 8898
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("SA8680000384608010108898");
                  toast({ title: "تم النسخ", description: "تم نسخ رقم الآيبان" });
                }}
                className="mt-3 text-xs font-semibold text-primary hover:text-primary/80 transition-smooth"
              >
                نسخ الرقم →
              </button>
            </div>

            {/* وسائل التواصل الاجتماعي */}
            <div className="rounded-3xl border bg-card p-6 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">تابعنا</p>
                  <p className="font-bold text-foreground">على منصات التواصل</p>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-xl border bg-background text-muted-foreground transition-smooth",
                      s.color,
                    )}
                  >
                    <s.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </aside>

          {/* النموذج */}
          {submitted ? (
            <div className="rounded-3xl border bg-card p-10 text-center shadow-card flex flex-col items-center justify-center min-h-[500px]">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mb-5 shadow-card">
                <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">شكراً لتواصلك معنا</h3>
              <p className="text-muted-foreground mb-2 max-w-md">
                وصلت رسالتك بنجاح إلى فريق خدمة المتعاملين.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                سنردّ على بريدك الإلكتروني خلال <span className="font-semibold text-primary">48 ساعة</span>.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setForm({ fullName: "", phone: "", email: "", purpose: "", message: "" });
                }}
              >
                إرسال رسالة جديدة
              </Button>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="relative overflow-hidden rounded-3xl border bg-card p-6 md:p-8 shadow-card"
              noValidate
            >
              {/* خلفية زخرفية مميزة - دوائر متداخلة */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_30%_20%,hsl(var(--primary))_2px,transparent_2px),radial-gradient(circle_at_70%_80%,hsl(var(--accent))_2px,transparent_2px)] [background-size:40px_40px,50px_50px]"
                aria-hidden
              />

              <div className="relative">
                <div className="mb-6 flex items-center gap-4 pb-5 border-b">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-primary font-semibold">نموذج التواصل</p>
                    <h2 className="text-xl font-bold text-foreground">أرسل لنا رسالة</h2>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <IconField label="الاسم الكريم" icon={User} error={errors.fullName} required>
                    <Input
                      value={form.fullName}
                      onChange={(e) => update("fullName", e.target.value)}
                      placeholder="مثال: صلاح محمد"
                      maxLength={100}
                      className="pr-10"
                    />
                  </IconField>

                  <IconField label="رقم الجوال" icon={Smartphone} error={errors.phone} required>
                    <Input
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                      className="pr-10 text-right"
                    />
                  </IconField>

                  <div className="sm:col-span-2">
                    <IconField label="البريد الإلكتروني" icon={AtSign} error={errors.email} required>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="example@email.com"
                        dir="ltr"
                        className="pr-10 text-right"
                        maxLength={120}
                      />
                    </IconField>
                  </div>

                  {/* الغرض - شرائح اختيار بدلاً من Select تقليدي */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="flex items-center gap-1 text-sm font-semibold text-foreground">
                      الغرض من التواصل
                      <span className="text-accent">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {purposes.map((p) => {
                        const active = form.purpose === p.v;
                        return (
                          <button
                            key={p.v}
                            type="button"
                            onClick={() => update("purpose", p.v)}
                            className={cn(
                              "flex items-center gap-2 rounded-xl border p-3 text-right text-sm font-medium transition-smooth",
                              active
                                ? "border-primary bg-primary/5 text-primary shadow-soft"
                                : "border-border bg-background text-foreground/80 hover:border-primary/40 hover:bg-primary/5",
                            )}
                          >
                            <p.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                            <span className="truncate">{p.l}</span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.purpose && <p className="text-xs text-destructive">{errors.purpose}</p>}
                  </div>

                  {/* الرسالة */}
                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1 text-sm font-semibold text-foreground">
                        الرسالة
                        <span className="text-accent">*</span>
                      </label>
                      <span
                        className={cn(
                          "text-xs",
                          remaining < 50 ? "text-destructive" : "text-muted-foreground",
                        )}
                      >
                        {form.message.length} / 1000
                      </span>
                    </div>
                    <Textarea
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      placeholder="اكتب ما تشاء…"
                      rows={6}
                      maxLength={1000}
                    />
                    {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                  </div>
                </div>

                <div className="mt-7 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                    رسالتك آمنة ولن نشارك بياناتك مع أي طرف ثالث
                  </p>
                  <Button
                    type="submit"
                    disabled={sending}
                    className="gap-2 bg-gradient-primary hover:opacity-90 px-8"
                  >
                    <Send className="h-4 w-4" />
                    {sending ? "جاري الإرسال..." : "إرسال الرسالة"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* قسم الخريطة */}
      <section className="container pb-20">
        <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden border shadow-card">
          <div className="bg-card p-5 flex items-center gap-3 border-b">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{mapSec?.title || "موقع الجمعية على الخريطة"}</p>
              <p className="font-bold text-foreground">{mapSec?.data?.address || "حي العوالي الغربي"}</p>
            </div>
          </div>
          <div className="aspect-[16/8] w-full bg-muted">
            <iframe
              title="موقع الجمعية"
              src={mapSec?.data?.embed_url || "https://www.openstreetmap.org/export/embed.html?bbox=46.5,24.6,46.9,24.85&layer=mapnik"}
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  );
}
