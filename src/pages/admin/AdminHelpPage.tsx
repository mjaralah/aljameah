import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import * as LucideIcons from "lucide-react";
import {
  LucideIcon,
  Search,
  Send,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  LifeBuoy,
  Sparkles,
  PlayCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { expandQuery, normalizeFields } from "@/lib/arabicNormalize";
import { HELP_CATEGORIES } from "@/data/seedHelpArticles";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useSupportContent } from "@/hooks/useSupportContent";
import { cn } from "@/lib/utils";

type Article = {
  id: string;
  category: string;
  title: string;
  keywords: string[];
  content: string;
  media_url: string | null;
  action_label: string | null;
  action_url: string | null;
  sort_order: number;
  is_published: boolean;
};

function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = (LucideIcons as any)[name] as LucideIcon | undefined;
  if (!Cmp) return <LucideIcons.HelpCircle className={className} />;
  return <Cmp className={className} />;
}

// Unified neutral card styling — single brand accent on icon only.

function getYoutubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}
function getVimeoEmbed(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? `https://player.vimeo.com/video/${m[1]}` : null;
}

export default function AdminHelpPage() {
  const navigate = useNavigate();
  const { user } = useAdminAuth();
  const { quickLinks } = useSupportContent();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "مركز مساعدة المدير | لوحة التحكم";
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("help_articles")
        .select("*")
        .eq("is_published", true)
        .order("category")
        .order("sort_order");
      setArticles((data as Article[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const indexed = useMemo(
    () => articles.map((a) => normalizeFields(a, ["title", "content", "keywords"])),
    [articles],
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

  const filtered: Article[] = useMemo(() => {
    let list: Article[] = articles;
    if (activeCategory) list = list.filter((a) => a.category === activeCategory);
    if (query.trim()) {
      const ids = fuse.search(expandQuery(query)).map((r) => r.item.id);
      list = list.filter((a) => ids.includes(a.id));
    }
    return list;
  }, [articles, fuse, query, activeCategory]);

  const categoriesWithCounts = useMemo(
    () =>
      HELP_CATEGORIES.map((c) => ({
        ...c,
        count: articles.filter((a) => a.category === c.key).length,
      })).filter((c) => c.count > 0),
    [articles],
  );

  const scrollToFaq = () =>
    setTimeout(() => faqRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);

  const selectCategory = (key: string | null) => {
    setActiveCategory(key);
    setQuery("");
    scrollToFaq();
  };

  const onContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      full_name: String(fd.get("name") || user?.email || "مدير الموقع"),
      email: String(fd.get("email") || user?.email || ""),
      phone: String(fd.get("phone") || "—"),
      purpose: "دعم تقني - إدارة",
      message: String(fd.get("message") || ""),
    };
    if (!payload.email || !payload.message) {
      toast.error("يرجى إدخال البريد والرسالة");
      return;
    }
    const { error } = await supabase.from("contact_messages").insert([payload]);
    if (error) return toast.error("تعذر الإرسال");
    toast.success("تم إرسال طلب الدعم بنجاح");
    (e.currentTarget as HTMLFormElement).reset();
  };

  return (
    <AdminLayout
      title="مركز المساعدة للمدير"
      description="دليلك التفاعلي لإدارة الموقع كمحترف"
    >
      <div className="space-y-8" dir="rtl">
        {/* Hero search */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground p-8 md:p-12">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative max-w-3xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-1.5 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              مركز مساعدة المدير
            </div>
            <h1 className="text-2xl md:text-4xl font-bold">
              كيف يمكننا مساعدتك في إدارة الموقع؟
            </h1>
            <p className="text-sm md:text-base opacity-90">
              ابحث في {articles.length} موضوعاً لإدارة الموقع كمحترف، أو تواصل مع الدعم التقني
            </p>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value) setActiveCategory(null);
                }}
                placeholder="ابحث: شعار، خبر، نموذج، حوكمة..."
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

        {/* Categories grid */}
        {categoriesWithCounts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold">تصفّح حسب الموضوع</h2>
              {activeCategory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => selectCategory(null)}
                  className="gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  عرض كل الأقسام
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {categoriesWithCounts.map((c) => {
                const isActive = activeCategory === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => selectCategory(isActive ? null : c.key)}
                    className={cn(
                      "group rounded-2xl border p-4 text-right transition-all bg-card",
                      "hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40",
                      isActive
                        ? "border-2 border-primary bg-primary/5 shadow-sm"
                        : "border-border",
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-xl grid place-items-center transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 text-primary group-hover:bg-primary/15",
                        )}
                      >
                        <Icon name={c.icon} className="h-5 w-5" />
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px]",
                          isActive && "bg-primary/15 text-primary",
                        )}
                      >
                        {c.count}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-sm leading-tight">{c.label}</h3>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* FAQ / Articles */}
        <section ref={faqRef}>
          <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
            <div>
              <Badge variant="secondary" className="mb-2">
                {activeCategory ? "القسم النشط" : "كل المواضيع"}
              </Badge>
              <h2 className="text-lg md:text-xl font-bold">
                {activeCategory
                  ? HELP_CATEGORIES.find((c) => c.key === activeCategory)?.label
                  : "أكثر المواضيع شيوعاً"}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">{filtered.length} موضوع</p>
          </div>

          {loading ? (
            <Card className="p-10 text-center text-muted-foreground">جاري التحميل...</Card>
          ) : filtered.length === 0 ? (
            <Card className="p-10 text-center space-y-3">
              <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="font-semibold">لم نجد إجابة مطابقة</p>
              <p className="text-sm text-muted-foreground">
                أرسل سؤالك للدعم التقني أسفل الصفحة وسنرد عليك قريباً
              </p>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {filtered.map((a) => {
                const cat = HELP_CATEGORIES.find((c) => c.key === a.category);
                const ytEmbed = a.media_url ? getYoutubeEmbed(a.media_url) : null;
                const vmEmbed = a.media_url ? getVimeoEmbed(a.media_url) : null;
                const embed = ytEmbed || vmEmbed;
                return (
                  <AccordionItem
                    key={a.id}
                    value={a.id}
                    className="bg-card border rounded-xl px-5 data-[state=open]:border-primary/40 data-[state=open]:shadow-sm"
                  >
                    <AccordionTrigger className="text-right hover:no-underline py-4 [&[data-state=open]>svg]:rotate-180">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {cat && (
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {cat.label}
                          </Badge>
                        )}
                        <span className="font-semibold text-sm md:text-base truncate">
                          {a.title}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 space-y-4">
                      <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm">
                        {a.content}
                      </div>

                      {/* Media: youtube/vimeo iframe or image */}
                      {embed && (
                        <div className="rounded-lg overflow-hidden border bg-muted aspect-video">
                          <iframe
                            src={embed}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={a.title}
                          />
                        </div>
                      )}
                      {a.media_url && !embed && (
                        <img
                          src={a.media_url}
                          alt={a.title}
                          loading="lazy"
                          className="w-full rounded-lg border"
                        />
                      )}

                      {/* Action button */}
                      {a.action_url && (
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => navigate(a.action_url!)}
                        >
                          <ExternalLink className="h-4 w-4" />
                          {a.action_label || "اذهب الآن"}
                        </Button>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </section>

      </div>
    </AdminLayout>
  );
}
