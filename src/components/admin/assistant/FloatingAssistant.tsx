import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import {
  Bot,
  HelpCircle,
  Search,
  Send,
  Sparkles,
  X,
  RotateCcw,
  ArrowLeft,
  ExternalLink,
  Newspaper,
  FolderKanban,
  LayoutTemplate,
  ClipboardList,
  FileText,
  Users,
  Handshake,
  PanelBottom,
  ScrollText,
  Inbox,
  Settings,
  Info,
  LayoutDashboard,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

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

type ChatMessage =
  | { id: string; role: "assistant"; kind: "text"; text: string }
  | { id: string; role: "assistant"; kind: "categories" }
  | { id: string; role: "assistant"; kind: "article"; article: Article }
  | { id: string; role: "assistant"; kind: "results"; results: Article[]; query: string }
  | { id: string; role: "user"; kind: "text"; text: string };

const CATEGORIES: { key: string; label: string; icon: any }[] = [
  { key: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { key: "page_content", label: "محتوى الصفحات", icon: LayoutTemplate },
  { key: "media", label: "الأخبار", icon: Newspaper },
  { key: "programs", label: "البرامج", icon: FolderKanban },
  { key: "about", label: "من نحن والأعضاء", icon: Info },
  { key: "surveys", label: "الاستبيانات", icon: ClipboardList },
  { key: "forms", label: "النماذج", icon: ClipboardList },
  { key: "pages", label: "الصفحات المخصصة", icon: FileText },
  { key: "board", label: "مجلس الإدارة", icon: Users },
  { key: "partners", label: "الشركاء والهيرو", icon: Handshake },
  { key: "footer", label: "التذييل", icon: PanelBottom },
  { key: "governance", label: "الحوكمة", icon: ScrollText },
  { key: "requests", label: "الطلبات والرسائل", icon: Inbox },
  { key: "settings", label: "الإعدادات", icon: Settings },
];

const ROUTE_HINTS: Record<string, string> = {
  "/admin": "dashboard",
  "/admin/page-content": "page_content",
  "/admin/media-center": "media",
  "/admin/news": "media",
  "/admin/programs": "programs",
  "/admin/about": "about",
  "/admin/surveys": "surveys",
  "/admin/forms": "forms",
  "/admin/pages": "pages",
  "/admin/legal-pages": "pages",
  "/admin/board": "board",
  "/admin/partners": "partners",
  "/admin/hero": "partners",
  "/admin/footer": "footer",
  "/admin/governance": "governance",
  "/admin/volunteer-requests": "requests",
  "/admin/membership-requests": "requests",
  "/admin/contact-messages": "requests",
  "/admin/feedback": "requests",
  "/admin/settings": "settings",
  "/admin/users": "settings",
  "/admin/email-templates": "settings",
};

const uid = () => Math.random().toString(36).slice(2, 11);

export function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Load articles
  useEffect(() => {
    if (!open || articles.length > 0) return;
    (async () => {
      const { data } = await supabase
        .from("help_articles")
        .select("*")
        .eq("is_published", true)
        .order("category")
        .order("sort_order");
      if (data) setArticles(data as Article[]);
    })();
  }, [open, articles.length]);

  // Welcome message
  useEffect(() => {
    if (!open || messages.length > 0) return;
    const hint = Object.entries(ROUTE_HINTS).find(([p]) =>
      p === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(p),
    );
    const currentCat = hint?.[1];
    const currentLabel = CATEGORIES.find((c) => c.key === currentCat)?.label ?? "لوحة التحكم";
    setMessages([
      {
        id: uid(),
        role: "assistant",
        kind: "text",
        text: `أهلاً بك 👋 أنا مساعدك الذكي. أنت الآن في: ${currentLabel}.\nاكتب سؤالك أو اختر القسم الذي تريد المساعدة فيه:`,
      },
      { id: uid(), role: "assistant", kind: "categories" },
    ]);
  }, [open, location.pathname, messages.length]);

  // Fuse instance
  const fuse = useMemo(
    () =>
      new Fuse(articles, {
        keys: [
          { name: "title", weight: 0.5 },
          { name: "keywords", weight: 0.3 },
          { name: "content", weight: 0.2 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [articles],
  );

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendUserMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { id: uid(), role: "user", kind: "text", text: trimmed }]);
    setInput("");

    setTimeout(() => {
      const results = fuse.search(trimmed).slice(0, 5).map((r) => r.item);
      if (results.length === 0) {
        setMessages((m) => [
          ...m,
          {
            id: uid(),
            role: "assistant",
            kind: "text",
            text: "لم أجد إجابة مطابقة. جرّب كلمات أخرى أو اختر القسم من القائمة:",
          },
          { id: uid(), role: "assistant", kind: "categories" },
        ]);
      } else if (results.length === 1) {
        setMessages((m) => [...m, { id: uid(), role: "assistant", kind: "article", article: results[0] }]);
      } else {
        setMessages((m) => [...m, { id: uid(), role: "assistant", kind: "results", results, query: trimmed }]);
      }
    }, 120);
  };

  const pickCategory = (catKey: string) => {
    const catLabel = CATEGORIES.find((c) => c.key === catKey)?.label ?? catKey;
    setMessages((m) => [
      ...m,
      { id: uid(), role: "user", kind: "text", text: `أريد المساعدة في: ${catLabel}` },
    ]);
    const items = articles.filter((a) => a.category === catKey);
    if (items.length === 0) {
      setMessages((m) => [
        ...m,
        { id: uid(), role: "assistant", kind: "text", text: "لا توجد مواضيع منشورة بعد في هذا القسم." },
      ]);
      return;
    }
    setMessages((m) => [
      ...m,
      { id: uid(), role: "assistant", kind: "results", results: items, query: catLabel },
    ]);
  };

  const openArticle = (article: Article) => {
    setMessages((m) => [...m, { id: uid(), role: "assistant", kind: "article", article }]);
  };

  const reset = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="فتح المساعد الذكي"
        className="fixed bottom-6 left-6 z-50 group h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all grid place-items-center"
      >
        <Bot className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold grid place-items-center shadow">
          ؟
        </span>
        <span className="sr-only">المساعد الذكي</span>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          dir="rtl"
          className="w-full sm:max-w-md p-0 flex flex-col gap-0"
        >
          <SheetHeader className="p-4 border-b bg-gradient-to-l from-primary to-primary/80 text-primary-foreground space-y-1">
            <SheetTitle className="text-primary-foreground flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-white/15 grid place-items-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="text-right flex-1">
                <p className="font-bold">المساعد الذكي</p>
                <p className="text-xs font-normal opacity-90">دليلك التفاعلي لإدارة الموقع</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-white/15"
                onClick={reset}
                title="بدء محادثة جديدة"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef as any}>
            <div className="space-y-3">
              {messages.map((msg) => (
                <MessageRow
                  key={msg.id}
                  msg={msg}
                  onCategory={pickCategory}
                  onArticle={openArticle}
                  onNavigate={(url) => {
                    setOpen(false);
                    navigate(url);
                  }}
                />
              ))}
            </div>
          </ScrollArea>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendUserMessage(input);
            }}
            className="border-t p-3 bg-background flex gap-2"
          >
            <Input
              placeholder="اكتب سؤالك هنا..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <Button type="submit" size="icon" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

function MessageRow({
  msg,
  onCategory,
  onArticle,
  onNavigate,
}: {
  msg: ChatMessage;
  onCategory: (key: string) => void;
  onArticle: (a: Article) => void;
  onNavigate: (url: string) => void;
}) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2 text-sm">
          {msg.text}
        </div>
      </div>
    );
  }

  const wrap = (children: React.ReactNode) => (
    <div className="flex gap-2 items-start">
      <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 text-primary grid place-items-center mt-1">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">{children}</div>
    </div>
  );

  if (msg.kind === "text") {
    return wrap(
      <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2 text-sm whitespace-pre-wrap leading-relaxed">
        {msg.text}
      </div>,
    );
  }

  if (msg.kind === "categories") {
    return wrap(
      <div className="grid grid-cols-2 gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => onCategory(c.key)}
            className="flex items-center gap-2 rounded-lg border bg-card hover:bg-primary/5 hover:border-primary/40 transition-colors px-3 py-2 text-xs text-right"
          >
            <c.icon className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">{c.label}</span>
          </button>
        ))}
      </div>,
    );
  }

  if (msg.kind === "results") {
    return wrap(
      <>
        <div className="text-xs text-muted-foreground">
          نتائج لـ <span className="font-semibold text-foreground">{msg.query}</span> ({msg.results.length})
        </div>
        <div className="space-y-2">
          {msg.results.map((a) => (
            <button
              key={a.id}
              onClick={() => onArticle(a)}
              className="w-full text-right rounded-lg border bg-card hover:bg-primary/5 hover:border-primary/40 transition-colors p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold truncate">{a.title}</p>
                <ArrowLeft className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{a.content}</p>
            </button>
          ))}
        </div>
      </>,
    );
  }

  if (msg.kind === "article") {
    const a = msg.article;
    return wrap(
      <Card className="p-4 space-y-3 bg-muted/40 border-primary/20">
        <div className="flex items-start gap-2">
          <Badge className="bg-primary/10 text-primary border-0">
            {CATEGORIES.find((c) => c.key === a.category)?.label ?? a.category}
          </Badge>
        </div>
        <h3 className="text-sm font-bold text-primary">{a.title}</h3>
        {a.media_url && (
          <img src={a.media_url} alt={a.title} className="w-full rounded-lg border" loading="lazy" />
        )}
        <div className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">{a.content}</div>
        {a.action_label && a.action_url && (
          <Button
            size="sm"
            className="w-full gap-2"
            onClick={() => onNavigate(a.action_url!)}
          >
            <ExternalLink className="h-4 w-4" />
            {a.action_label}
          </Button>
        )}
      </Card>,
    );
  }

  return null;
}
