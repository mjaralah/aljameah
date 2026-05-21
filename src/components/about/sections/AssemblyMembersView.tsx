// عرض قسم أعضاء الجمعية العمومية للزوار — جدول احترافي + شارات لونية + تواصل اختياري لكل عضو
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download, FileText, Search, Users, ChevronRight, ChevronLeft, Copy, Check, UserX,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MembershipBadge } from "./MembershipBadge";
import {
  AssemblyData,
  exportToCSV,
  exportToExcel,
  exportToPDF,
} from "@/lib/assemblyExport";
import { toast } from "sonner";

export function AssemblyMembersView({ data }: { data: AssemblyData }) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const settings = data.settings ?? {};
  const types = data.membership_types ?? [];
  const members = data.members ?? [];
  const pageSize = Math.max(5, settings.page_size ?? 15);

  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "date_asc" | "date_desc">("name");
  const [page, setPage] = useState(1);

  const typeLabel = (k?: string) => {
    const t = types.find((x) => x.key === k);
    return t ? (isAr ? t.label_ar : t.label_en) : k ?? "—";
  };

  // قاطع عام + موافقة العضو
  const globalPhone = !!settings.show_phone_public;
  const globalEmail = !!settings.show_email_public;
  const showPhoneFor = (m: { contact_public?: boolean }) => globalPhone && !!m.contact_public;
  const showEmailFor = (m: { contact_public?: boolean }) => globalEmail && !!m.contact_public;
  // أعمدة التواصل تظهر فقط إذا كان القاطع العام مفعّلاً ووُجد عضو واحد على الأقل يسمح
  const anyPhone = globalPhone && members.some((m) => m.contact_public && m.phone);
  const anyEmail = globalEmail && members.some((m) => m.contact_public && m.email);
  const showExport = !!settings.show_export_public;

  // إحصائيات
  const stats = useMemo(() => {
    const map = new Map<string, number>();
    members.forEach((m) => {
      const k = m.membership_type ?? "—";
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    return Array.from(map.entries());
  }, [members]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = members.filter((m) => {
      if (filterType !== "all" && m.membership_type !== filterType) return false;
      if (!q) return true;
      return (
        (m.name_ar ?? "").toLowerCase().includes(q) ||
        (m.name_en ?? "").toLowerCase().includes(q)
      );
    });
    if (sortBy === "name") {
      arr = [...arr].sort((a, b) =>
        (isAr ? a.name_ar || a.name_en || "" : a.name_en || a.name_ar || "").localeCompare(
          isAr ? b.name_ar || b.name_en || "" : b.name_en || b.name_ar || "",
        ),
      );
    } else {
      arr = [...arr].sort((a, b) => {
        const da = a.join_date || "";
        const db = b.join_date || "";
        return sortBy === "date_asc" ? da.localeCompare(db) : db.localeCompare(da);
      });
    }
    return arr;
  }, [members, query, filterType, sortBy, isAr]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const title = isAr ? data.title_ar || data.title_en : data.title_en || data.title_ar;

  // حالة فارغة
  if (members.length === 0) {
    return (
      <Card className="p-10 text-center">
        <UserX className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">
          {isAr ? "لا توجد بيانات أعضاء بعد" : "No members yet"}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* بطاقات إحصائية مرئية */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <Card className="p-3 flex items-center gap-3 bg-gradient-primary text-primary-foreground border-0">
          <Users className="h-5 w-5 shrink-0" />
          <div>
            <div className="text-xs opacity-90">{isAr ? "إجمالي الأعضاء" : "Total"}</div>
            <div className="text-xl font-extrabold leading-tight">{members.length}</div>
          </div>
        </Card>
        {stats.map(([k, n]) => (
          <Card key={k} className="p-3">
            <div className="text-xs text-muted-foreground mb-1">{typeLabel(k)}</div>
            <div className="flex items-center justify-between">
              <MembershipBadge typeKey={k} label={typeLabel(k)} />
              <span className="text-lg font-bold tabular-nums">{n}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* أدوات */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            aria-label={isAr ? "بحث بالاسم" : "Search by name"}
            placeholder={isAr ? "بحث بالاسم…" : "Search by name…"}
            className="ps-8"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={filterType}
          onValueChange={(v) => {
            setFilterType(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40" aria-label={isAr ? "فلترة بالنوع" : "Filter by type"}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? "كل الأنواع" : "All types"}</SelectItem>
            {types.map((t) => (
              <SelectItem key={t.key} value={t.key}>
                {isAr ? t.label_ar : t.label_en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-40" aria-label={isAr ? "ترتيب" : "Sort"}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">{isAr ? "ترتيب: الاسم" : "Sort: Name"}</SelectItem>
            <SelectItem value="date_desc">
              {isAr ? "الأحدث التحاقاً" : "Newest joined"}
            </SelectItem>
            <SelectItem value="date_asc">
              {isAr ? "الأقدم التحاقاً" : "Oldest joined"}
            </SelectItem>
          </SelectContent>
        </Select>

        {showExport && (
          <>
            <div className="flex-1" />
            <Button size="sm" variant="outline" onClick={() => exportToExcel(filtered, types, isAr)}>
              <Download className="w-4 h-4 me-1" /> Excel
            </Button>
            <Button size="sm" variant="outline" onClick={() => exportToCSV(filtered, types, isAr)}>
              <Download className="w-4 h-4 me-1" /> CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportToPDF(filtered, types, isAr, title || "Members")}
            >
              <FileText className="w-4 h-4 me-1" /> PDF
            </Button>
          </>
        )}
      </div>

      {/* جدول للديسكتوب/التابلت */}
      <Card className="hidden sm:block overflow-hidden rounded-xl border shadow-sm">
        <div className="max-h-[640px] overflow-auto">
          <Table className="[&_tbody_tr:nth-child(even)]:bg-muted/30">
            <TableHeader className="sticky top-0 z-10 bg-muted/60 backdrop-blur-sm shadow-sm">
              <TableRow className="border-b-2 border-border hover:bg-muted/60">
                <TableHead className="w-14 text-center text-xs font-semibold uppercase tracking-wide text-foreground">#</TableHead>
                <TableHead className="text-start text-xs font-semibold uppercase tracking-wide text-foreground">{isAr ? "الاسم" : "Name"}</TableHead>
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-foreground">{isAr ? "نوع العضوية" : "Membership"}</TableHead>
                <TableHead className="hidden md:table-cell text-center text-xs font-semibold uppercase tracking-wide text-foreground">{isAr ? "تاريخ الالتحاق" : "Join date"}</TableHead>
                {anyPhone && <TableHead className="hidden lg:table-cell text-center text-xs font-semibold uppercase tracking-wide text-foreground">{isAr ? "الهاتف" : "Phone"}</TableHead>}
                {anyEmail && <TableHead className="hidden lg:table-cell text-center text-xs font-semibold uppercase tracking-wide text-foreground">{isAr ? "البريد" : "Email"}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {isAr ? "لا نتائج مطابقة" : "No matching results"}
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((m, i) => (
                  <TableRow key={m.id} className="border-b border-border/60">
                    <TableCell className="py-2.5 text-center">
                      <span className="inline-flex h-6 min-w-6 px-1.5 items-center justify-center rounded-full bg-muted text-foreground/70 text-xs tabular-nums">
                        {(safePage - 1) * pageSize + i + 1}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 font-medium text-start">
                      {isAr ? m.name_ar || m.name_en : m.name_en || m.name_ar}
                    </TableCell>
                    <TableCell className="py-2.5 text-center">
                      <div className="flex justify-center">
                        <MembershipBadge
                          typeKey={m.membership_type}
                          label={typeLabel(m.membership_type)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 text-center text-sm text-muted-foreground hidden md:table-cell tabular-nums">
                      {m.join_date || "—"}
                    </TableCell>
                    {anyPhone && (
                      <TableCell className="py-2.5 text-center text-sm hidden lg:table-cell" dir="ltr">
                        {showPhoneFor(m) && m.phone ? (
                          <ContactCell value={m.phone} href={`tel:${m.phone}`} />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    )}
                    {anyEmail && (
                      <TableCell className="py-2.5 text-center text-sm hidden lg:table-cell" dir="ltr">
                        {showEmailFor(m) && m.email ? (
                          <ContactCell value={m.email} href={`mailto:${m.email}`} />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* بطاقات للجوال */}
      <div className="sm:hidden space-y-2">
        {pageRows.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            {isAr ? "لا نتائج" : "No results"}
          </Card>
        ) : (
          pageRows.map((m, i) => (
            <Card key={m.id} className="p-4">
              <div className="flex justify-between items-start mb-2 gap-2">
                <div className="font-bold text-primary">
                  {(safePage - 1) * pageSize + i + 1}.{" "}
                  {isAr ? m.name_ar || m.name_en : m.name_en || m.name_ar}
                </div>
                <MembershipBadge
                  typeKey={m.membership_type}
                  label={typeLabel(m.membership_type)}
                />
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                {m.join_date && (
                  <div>
                    {isAr ? "الالتحاق" : "Joined"}: {m.join_date}
                  </div>
                )}
                {showPhoneFor(m) && m.phone && (
                  <div dir="ltr">
                    <a href={`tel:${m.phone}`} className="text-primary">{m.phone}</a>
                  </div>
                )}
                {showEmailFor(m) && m.email && (
                  <div dir="ltr">
                    <a href={`mailto:${m.email}`} className="text-primary">{m.email}</a>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* تصفّح */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={safePage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {isAr ? "السابق" : "Prev"}
          </Button>
          <div className="text-sm text-muted-foreground">
            {isAr ? "صفحة" : "Page"} {safePage} / {totalPages} — {filtered.length}{" "}
            {isAr ? "نتيجة" : "results"}
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={safePage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            {isAr ? "التالي" : "Next"}
            {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}

// خلية تواصل بزر نسخ
function ContactCell({ value, href }: { value: string; href: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("تم النسخ");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("تعذّر النسخ");
    }
  };
  return (
    <span className="group inline-flex items-center gap-1.5">
      <a href={href} className="text-primary hover:underline">{value}</a>
      <button
        type="button"
        onClick={copy}
        aria-label="نسخ"
        className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-muted"
      >
        {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
      </button>
    </span>
  );
}
