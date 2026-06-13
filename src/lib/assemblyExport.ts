// أدوات تصدير/استيراد قائمة أعضاء الجمعية العمومية
import * as XLSX from "xlsx";

export type MembershipType = {
  key: string;
  label_ar: string;
  label_en: string;
  /** لون شارة العضوية (hex مثل #2563eb). إن لم يُحدَّد تُستخدم الأنماط الافتراضية. */
  color?: string;
};

export type AssemblyMember = {
  id: string;
  name_ar?: string;
  name_en?: string;
  membership_type?: string;
  join_date?: string; // YYYY-MM-DD
  phone?: string;
  email?: string;
  status?: string; // active | inactive
  /** هل وافق العضو على إظهار بيانات التواصل للزوار؟ */
  contact_public?: boolean;
};

export type AssemblyData = {
  type: "assembly_members";
  title_ar?: string;
  title_en?: string;
  subtitle_ar?: string;
  subtitle_en?: string;
  settings?: {
    show_phone_public?: boolean;
    show_email_public?: boolean;
    show_export_public?: boolean;
    page_size?: number;
  };
  membership_types?: MembershipType[];
  members?: AssemblyMember[];
};

export const DEFAULT_TYPES: MembershipType[] = [
  { key: "regular", label_ar: "عادي", label_en: "Regular", color: "#2563eb" },
  { key: "honorary", label_ar: "فخري", label_en: "Honorary", color: "#d97706" },
  { key: "supporter", label_ar: "داعم", label_en: "Supporter", color: "#16a34a" },
  { key: "affiliate", label_ar: "منتسب", label_en: "Affiliate", color: "#64748b" },
];

/** تطبيع توافقي: حوّل المفاتيح القديمة إلى الجديدة. */
export function normalizeMembershipKey(k?: string): string {
  if (!k) return "regular";
  if (k === "working") return "regular";
  return k;
}

export const TEMPLATE_HEADERS = [
  "name_ar",
  "name_en",
  "membership_type",
  "join_date",
  "phone",
  "email",
  "status",
  "contact_public",
];

export function downloadTemplate() {
  const rows = [
    {
      name_ar: "مثال: محمد عبدالله",
      name_en: "Example: Mohammed Abdullah",
      membership_type: "working",
      join_date: "2024-01-15",
      phone: "+9665XXXXXXXX",
      email: "example@email.com",
      status: "active",
      contact_public: false,
    },
  ];
  const ws = XLSX.utils.json_to_sheet(rows, { header: TEMPLATE_HEADERS });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Members");
  // ورقة دليل
  const guide = XLSX.utils.aoa_to_sheet([
    ["العمود", "الوصف", "ملاحظات"],
    ["name_ar", "الاسم بالعربية", "مطلوب"],
    ["name_en", "Name in English", "اختياري"],
    ["membership_type", "مفتاح نوع العضوية", "مثل: working / honorary / supporter / affiliate"],
    ["join_date", "تاريخ الالتحاق", "YYYY-MM-DD"],
    ["phone", "رقم التواصل", "اختياري"],
    ["email", "البريد الإلكتروني", "اختياري"],
    ["status", "الحالة", "active / inactive"],
    ["contact_public", "إظهار التواصل للزوار", "TRUE / FALSE — افتراضياً FALSE"],
  ]);
  XLSX.utils.book_append_sheet(wb, guide, "Guide");
  XLSX.writeFile(wb, "assembly_members_template.xlsx");
}

export async function parseImportFile(file: File): Promise<{
  rows: AssemblyMember[];
  errors: string[];
}> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheetName =
    wb.SheetNames.find((n) => n.toLowerCase() === "members") ?? wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<any>(ws, { defval: "" });
  const errors: string[] = [];
  const rows: AssemblyMember[] = [];
  json.forEach((r, i) => {
    const nameAr = String(r.name_ar ?? "").trim();
    const nameEn = String(r.name_en ?? "").trim();
    if (!nameAr && !nameEn) {
      errors.push(`الصف ${i + 2}: الاسم مفقود`);
      return;
    }
    let join = String(r.join_date ?? "").trim();
    // قبول تاريخ Excel أو نص
    if (join && /^\d+(\.\d+)?$/.test(join)) {
      const d = XLSX.SSF.parse_date_code(Number(join));
      if (d) join = `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
    }
    const cp = String(r.contact_public ?? "").trim().toLowerCase();
    rows.push({
      id: crypto.randomUUID(),
      name_ar: nameAr,
      name_en: nameEn,
      membership_type: String(r.membership_type ?? "").trim() || "working",
      join_date: join,
      phone: String(r.phone ?? "").trim(),
      email: String(r.email ?? "").trim(),
      status: String(r.status ?? "active").trim() || "active",
      contact_public: cp === "true" || cp === "1" || cp === "yes" || cp === "نعم",
    });
  });
  return { rows, errors };
}

export function exportToExcel(
  members: AssemblyMember[],
  types: MembershipType[],
  isAr: boolean,
  fileName = "assembly_members.xlsx",
) {
  const typeLabel = (k?: string) => {
    const t = types.find((x) => x.key === k);
    return t ? (isAr ? t.label_ar : t.label_en) : k ?? "";
  };
  const data = members.map((m, i) => ({
    [isAr ? "#" : "#"]: i + 1,
    [isAr ? "الاسم" : "Name"]: isAr
      ? m.name_ar || m.name_en
      : m.name_en || m.name_ar,
    [isAr ? "نوع العضوية" : "Membership"]: typeLabel(m.membership_type),
    [isAr ? "تاريخ الالتحاق" : "Join date"]: m.join_date ?? "",
    [isAr ? "الهاتف" : "Phone"]: m.phone ?? "",
    [isAr ? "البريد" : "Email"]: m.email ?? "",
    [isAr ? "الحالة" : "Status"]: m.status ?? "",
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Members");
  XLSX.writeFile(wb, fileName);
}

export function exportToCSV(
  members: AssemblyMember[],
  types: MembershipType[],
  isAr: boolean,
  fileName = "assembly_members.csv",
) {
  const typeLabel = (k?: string) => {
    const t = types.find((x) => x.key === k);
    return t ? (isAr ? t.label_ar : t.label_en) : k ?? "";
  };
  const header = isAr
    ? ["#", "الاسم", "نوع العضوية", "تاريخ الالتحاق", "الهاتف", "البريد", "الحالة"]
    : ["#", "Name", "Membership", "Join date", "Phone", "Email", "Status"];
  const escape = (s: string) =>
    /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  const lines = [header.map(escape).join(",")];
  members.forEach((m, i) => {
    lines.push(
      [
        String(i + 1),
        isAr ? m.name_ar || m.name_en || "" : m.name_en || m.name_ar || "",
        typeLabel(m.membership_type),
        m.join_date ?? "",
        m.phone ?? "",
        m.email ?? "",
        m.status ?? "",
      ]
        .map((v) => escape(String(v)))
        .join(","),
    );
  });
  const blob = new Blob(["\uFEFF" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/** تصدير PDF عبر فتح نافذة طباعة بـ HTML/CSS — يدعم العربي بشكل ممتاز */
export function exportToPDF(
  members: AssemblyMember[],
  types: MembershipType[],
  isAr: boolean,
  title: string,
) {
  const typeLabel = (k?: string) => {
    const t = types.find((x) => x.key === k);
    return t ? (isAr ? t.label_ar : t.label_en) : k ?? "";
  };
  const headers = isAr
    ? ["#", "الاسم", "نوع العضوية", "تاريخ الالتحاق", "الهاتف", "البريد"]
    : ["#", "Name", "Membership", "Join date", "Phone", "Email"];
  const rowsHtml = members
    .map(
      (m, i) => `<tr>
      <td>${i + 1}</td>
      <td>${escapeHtml(isAr ? m.name_ar || m.name_en || "" : m.name_en || m.name_ar || "")}</td>
      <td>${escapeHtml(typeLabel(m.membership_type))}</td>
      <td>${escapeHtml(m.join_date ?? "")}</td>
      <td>${escapeHtml(m.phone ?? "")}</td>
      <td>${escapeHtml(m.email ?? "")}</td>
    </tr>`,
    )
    .join("");
  const html = `<!doctype html><html dir="${isAr ? "rtl" : "ltr"}" lang="${isAr ? "ar" : "en"}">
<head><meta charset="utf-8"/><title>${escapeHtml(title)}</title>
<style>
  body{font-family: 'Tajawal','Segoe UI',Tahoma,Arial,sans-serif; padding:24px; color:#111}
  h1{font-size:20px;margin:0 0 12px}
  .meta{color:#666;font-size:12px;margin-bottom:16px}
  table{width:100%;border-collapse:collapse;font-size:12px}
  th,td{border:1px solid #ddd;padding:8px;text-align:${isAr ? "right" : "left"}}
  th{background:#f3f4f6}
  tr:nth-child(even) td{background:#fafafa}
  @media print{ @page{ size: A4; margin:14mm } }
</style></head><body>
<h1>${escapeHtml(title)}</h1>
<div class="meta">${isAr ? "إجمالي الأعضاء" : "Total members"}: ${members.length} — ${new Date().toLocaleDateString(isAr ? "ar" : "en")}</div>
<table><thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>
<tbody>${rowsHtml}</tbody></table>
<script>window.onload=()=>{setTimeout(()=>{window.print();},300)}</script>
</body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
