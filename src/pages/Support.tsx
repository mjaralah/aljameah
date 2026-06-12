import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import * as LucideIcons from "lucide-react";
import { LucideIcon, Search, ChevronDown, Send, ArrowLeft, ExternalLink, FileText, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSupportContent, SupportFaq } from "@/hooks/useSupportContent";
import { expandQuery, normalizeArabic, normalizeFields } from "@/lib/arabicNormalize";
import { cn } from "@/lib/utils";

const ColorMap: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  green: "bg-green-500/10 text-green-600 dark:text-green-400",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  red: "bg-red-500/10 text-red-600 dark:text-red-400",
};

function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = (LucideIcons as any)[name] as LucideIcon | undefined;
  if (!Cmp) return <LucideIcons.HelpCircle className={className} />;
  return <Cmp className={className} />;
}

export default function Support() {
  const { settings, categories, faqs, quickLinks, loading } = useSupportContent();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  // Build search index with normalized fields
  const indexed = useMemo(
    () => faqs.map((f) => normalizeFields(f, ["question", "answer", "keywords"])),
    [faqs],
  );
  const fuse = useMemo(
    () =>
      new Fuse(indexed, {
        keys: [
          { name: "__search", weight: 0.7 },
          { name: "keywords", weight: 0.3 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [indexed],
  );

  const filtered: SupportFaq[] = useMemo(() => {
    let list: SupportFaq[] = faqs;
    if (activeCategory) list = list.filter((f) => f.category_id === activeCategory);
    if (query.trim()) {
      const expanded = expandQuery(query);
      const matches = fuse.search(expanded).map((r) => r.item.id);
      list = list.filter((f) => matches.includes(f.id));
    }
    return list;
  }, [faqs, fuse, query, activeCategory]);

  const scrollToFaq = () => {
    setTimeout(() => faqRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const selectCategory = (id: string | null) => {
    setActiveCategory(id);
    setQuery("");
    scrollToFaq();
  };

  const onContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      full_name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      purpose: String(fd.get("subject") || "استفسار من صفحة الدعم"),
      message: String(fd.get("message") || ""),
    };
    if (!payload.full_name || !payload.email || !payload.phone || !payload.message) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    const { error } = await supabase.from("contact_messages").insert([payload]);
    if (error) {
      toast.error("تعذر إرسال الرسالة، حاول لاحقاً");
      return;
    }
    toast.success("تم إرسال رسالتك بنجاح، سنرد عليك قريباً");
    (e.currentTarget as HTMLFormElement).reset();
  };

  const title = settings?.page_title ?? "الدعم والمساعدة";
  const subtitle = settings?.page_subtitle ?? "كيف يمكننا مساعدتك اليوم؟";

  useEffect(() => {
    document.title = `${title} | مركز الدعم`;
  }, [title]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">


      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground py-16 md:py-24">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="container relative mx-auto px-4 max-w-4xl text-center space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold">{title}</h1>
          <p className="text-base md:text-lg opacity-90">{subtitle}</p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value) setActiveCategory(null);
              }}
              placeholder={settings?.search_placeholder ?? "ابحث عن سؤالك..."}
              className="h-14 pr-12 text-base rounded-full bg-background text-foreground shadow-xl border-0"
            />
          </div>
          {query && (
            <p className="text-sm opacity-90">
              {filtered.length > 0
                ? `${filtered.length} نتيجة مطابقة`
                : "لم نجد نتائج — جرّب كلمات أخرى أو تصفّح الأقسام"}
            </p>
          )}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">تصفّح حسب الموضوع</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((c) => {
              const isActive = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => selectCategory(isActive ? null : c.id)}
                  className={cn(
                    "group rounded-2xl border bg-card p-5 text-right transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40",
                    isActive ? "border-2 border-primary bg-primary/5 shadow-sm" : "border-border",
                  )}
                >
                  <div
                    className={cn(
                      "h-12 w-12 rounded-xl grid place-items-center mb-3 transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary group-hover:bg-primary/15",
                    )}
                  >
                    <Icon name={c.icon} className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-sm mb-1">{c.label}</h3>
                  {c.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                  )}
                </button>
              );
            })}
          </div>
          {activeCategory && (
            <div className="mt-4 text-center">
              <Button variant="ghost" size="sm" onClick={() => selectCategory(null)} className="gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                عرض كل الأقسام
              </Button>
            </div>
          )}
        </section>
      )}

      {/* FAQ */}
      <section ref={faqRef} className="bg-muted/30 py-8 md:py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              {activeCategory
                ? categories.find((c) => c.id === activeCategory)?.label
                : "الأسئلة الشائعة"}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">إجابات سريعة لأكثر الأسئلة شيوعاً</p>
          </div>

          {loading ? (
            <Card className="p-8 text-center text-muted-foreground">جاري تحميل الأسئلة...</Card>
          ) : filtered.length === 0 ? (
            <Card className="p-8 text-center space-y-3">
              <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="font-semibold">لم نجد إجابة مطابقة</p>
              <p className="text-sm text-muted-foreground">
                أرسل لنا سؤالك أدناه وسنرد عليك في أسرع وقت
              </p>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {filtered.map((f) => (
                <AccordionItem
                  key={f.id}
                  value={f.id}
                  className="bg-card border rounded-xl px-5 data-[state=open]:border-primary/40 data-[state=open]:shadow-sm"
                >
                  <AccordionTrigger className="text-right hover:no-underline py-4 [&[data-state=open]>svg]:rotate-180">
                    <span className="font-semibold text-sm md:text-base">{f.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-wrap pb-4">
                    {f.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </section>

      {/* Contact + Quick Links */}
      <section className="container mx-auto px-4 py-12 md:py-16 grid md:grid-cols-2 gap-8 max-w-6xl">
        {/* Contact form */}
        {settings?.contact_form_enabled !== false && (
          <Card className="p-6 md:p-8 space-y-5">
            <div>
              <Badge variant="secondary" className="mb-3">تواصل</Badge>
              <h3 className="text-xl font-bold">
                {settings?.contact_form_title ?? "لم تجد إجابة؟ تواصل معنا"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                سيتم الرد عليك خلال يوم عمل واحد
              </p>
            </div>
            <form onSubmit={onContactSubmit} className="space-y-3">
              <Input name="name" placeholder="الاسم الكامل" required />
              <Input name="email" type="email" placeholder="البريد الإلكتروني" required />
              <Input name="phone" type="tel" placeholder="رقم الجوال" required />
              <Input name="subject" placeholder="الموضوع (اختياري)" />
              <Textarea name="message" placeholder="اكتب رسالتك هنا..." rows={5} required />
              <Button type="submit" className="w-full gap-2">
                <Send className="h-4 w-4" />
                إرسال الرسالة
              </Button>
            </form>
          </Card>
        )}

        {/* Quick links */}
        {quickLinks.length > 0 && (
          <Card className="p-6 md:p-8 space-y-5">
            <div>
              <Badge variant="secondary" className="mb-3">مصادر</Badge>
              <h3 className="text-xl font-bold">
                {settings?.quick_links_title ?? "روابط سريعة"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                أدلة وفيديوهات وملفات قد تساعدك
              </p>
            </div>
            <div className="space-y-2">
              {quickLinks.map((q) => {
                const isExternal = /^https?:\/\//.test(q.url);
                const inner = (
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-primary/5 hover:border-primary/40 transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                      <Icon name={q.icon} className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <p className="font-semibold text-sm truncate">{q.label}</p>
                      {q.description && (
                        <p className="text-xs text-muted-foreground truncate">{q.description}</p>
                      )}
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                );
                return isExternal ? (
                  <a key={q.id} href={q.url} target="_blank" rel="noopener noreferrer" className="block">
                    {inner}
                  </a>
                ) : (
                  <Link key={q.id} to={q.url} className="block">
                    {inner}
                  </Link>
                );
              })}
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
