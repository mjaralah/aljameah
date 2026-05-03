import { CrudPage } from "@/components/admin/CrudPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GOV_CATEGORIES: { value: string; label: string }[] = [
  { value: "policies", label: "السياسات" },
  { value: "regulations", label: "اللوائح" },
  { value: "plans", label: "الخطط" },
  { value: "investments", label: "قرارات الاستثمار" },
  { value: "aid", label: "المساعدات العينية والنقدية" },
  { value: "financialReports", label: "التقارير المالية" },
  { value: "annualReport", label: "التقرير السنوي" },
  { value: "events", label: "تقرير الفعاليات" },
];

type GovDoc = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  file_url: string;
  file_size: number | null;
  sort_order: number;
  published: boolean;
};

export default function AdminGovernancePage() {
  return (
    <CrudPage<GovDoc>
      table="governance_documents"
      title="ملفات الحوكمة"
      description="إدارة جميع وثائق الحوكمة (السياسات، اللوائح، الخطط، التقارير...) لعرضها في صفحة الحوكمة العامة"
      searchField="title"
      columns={[
        { key: "title", label: "العنوان", className: "font-medium" },
        {
          key: "category",
          label: "التصنيف",
          render: (r) => GOV_CATEGORIES.find((c) => c.value === r.category)?.label ?? r.category ?? "—",
        },
        {
          key: "file_url",
          label: "الملف",
          render: (r) =>
            r.file_url ? (
              <a href={r.file_url} target="_blank" rel="noreferrer" className="text-primary underline text-xs">عرض</a>
            ) : "—",
        },
      ]}
      createDefaults={() => ({
        title: "",
        description: "",
        category: "policies",
        file_url: "",
        sort_order: 0,
        published: true,
      })}
      validate={(v) => {
        if (!v.title?.trim()) return "العنوان مطلوب";
        if (!v.file_url?.trim()) return "ارفع ملف PDF";
        return null;
      }}
      renderForm={(v, set) => (
        <>
          <div>
            <Label>العنوان *</Label>
            <Input value={v.title ?? ""} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div>
            <Label>التصنيف *</Label>
            <Select value={v.category ?? "policies"} onValueChange={(val) => set("category", val)}>
              <SelectTrigger><SelectValue placeholder="اختر التصنيف" /></SelectTrigger>
              <SelectContent>
                {GOV_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">يحدد القسم الذي يظهر فيه الملف ضمن صفحة الحوكمة.</p>
          </div>
          <div>
            <Label>الوصف</Label>
            <Textarea rows={3} value={v.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </div>
          <MediaUpload
            label="ملف PDF *"
            folder="governance"
            value={v.file_url}
            accept="application/pdf"
            bucket="documents"
            onChange={(url) => set("file_url", url || "")}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>الترتيب</Label>
              <Input type="number" value={v.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} />
            </div>
            <label className="flex items-end gap-2 text-sm pb-2">
              <input type="checkbox" checked={!!v.published} onChange={(e) => set("published", e.target.checked)} />
              منشور
            </label>
          </div>
        </>
      )}
    />
  );
}
