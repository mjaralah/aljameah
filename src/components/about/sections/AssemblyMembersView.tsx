// عرض قسم أعضاء الجمعية العمومية للزوار — جدول + بحث + فلترة + تصفّح + تصدير
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Download, FileText, Search, Users, ChevronRight, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  AssemblyData,
  exportToCSV,
  exportToExcel,
  exportToPDF,
} from "@/lib/assemblyExport";

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

  const showPhone = !!settings.show_phone_public;
  const showEmail = !!settings.show_email_public;
  const showExport = !!settings.show_export_public;
  const title = isAr ? data.title_ar || data.title_en : data.title_en || data.title_ar;

  return (
    <div className="space-y-4">
      {/* شريط الإحصائيات */}
      <div className="flex flex-wrap items-center gap-2 p-4 bg-gradient-primary text-primary-foreground rounded-xl shadow-soft">
        <div className="flex items-center gap-2 me-3">
          <Users className="h-5 w-5" />
          <span className="font-bold">
            {isAr ? "إجمالي الأعضاء" : "Total"}: {members.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {stats.map(([k, n]) => (
            <Badge key={k} variant="secondary" className="bg-white/15 text-primary-foreground border-white/20">
              {typeLabel(k)}: {n}
            </Badge>
          ))}
        </div>
      </div>

      {/* أدوات */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
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
          <SelectTrigger className="w-40">
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
          <SelectTrigger className="w-40">
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportToExcel(filtered, types, isAr)}
            >
              <Download className="w-4 h-4 me-1" /> Excel
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportToCSV(filtered, types, isAr)}
            >
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

      {/* جدول للأجهزة الكبيرة */}
      <Card className="hidden md:block overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>{isAr ? "الاسم" : "Name"}</TableHead>
              <TableHead>{isAr ? "نوع العضوية" : "Membership"}</TableHead>
              <TableHead>{isAr ? "تاريخ الالتحاق" : "Join date"}</TableHead>
              {showPhone && <TableHead>{isAr ? "الهاتف" : "Phone"}</TableHead>}
              {showEmail && <TableHead>{isAr ? "البريد" : "Email"}</TableHead>}
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
                <TableRow key={m.id}>
                  <TableCell className="text-muted-foreground">
                    {(safePage - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    {isAr ? m.name_ar || m.name_en : m.name_en || m.name_ar}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{typeLabel(m.membership_type)}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {m.join_date || "—"}
                  </TableCell>
                  {showPhone && (
                    <TableCell className="text-sm" dir="ltr">
                      {m.phone ? (
                        <a href={`tel:${m.phone}`} className="text-primary hover:underline">
                          {m.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  )}
                  {showEmail && (
                    <TableCell className="text-sm" dir="ltr">
                      {m.email ? (
                        <a
                          href={`mailto:${m.email}`}
                          className="text-primary hover:underline"
                        >
                          {m.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* بطاقات للجوال */}
      <div className="md:hidden space-y-2">
        {pageRows.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            {isAr ? "لا نتائج" : "No results"}
          </Card>
        ) : (
          pageRows.map((m, i) => (
            <Card key={m.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-primary">
                  {(safePage - 1) * pageSize + i + 1}.{" "}
                  {isAr ? m.name_ar || m.name_en : m.name_en || m.name_ar}
                </div>
                <Badge variant="secondary">{typeLabel(m.membership_type)}</Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                {m.join_date && (
                  <div>
                    {isAr ? "الالتحاق" : "Joined"}: {m.join_date}
                  </div>
                )}
                {showPhone && m.phone && (
                  <div dir="ltr">
                    <a href={`tel:${m.phone}`} className="text-primary">
                      {m.phone}
                    </a>
                  </div>
                )}
                {showEmail && m.email && (
                  <div dir="ltr">
                    <a href={`mailto:${m.email}`} className="text-primary">
                      {m.email}
                    </a>
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
