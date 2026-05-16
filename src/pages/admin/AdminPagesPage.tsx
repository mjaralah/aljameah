import { CrudPage } from "@/components/admin/CrudPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CustomPage = {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  meta_description: string | null;
  parent_slug: string | null;
  sort_order: number;
  show_in_menu: boolean;
  published: boolean;
};

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\u0600-\u06FF-]/g, "").slice(0, 80);

export default function AdminPagesPage() {
  return (
    <CrudPage<CustomPage>
      table="custom_pages"
      title="إدارة الصفحات"
      description="أنشئ صفحات رئيسية وفرعية وحرّر محتواها"
      searchField="title"
      orderBy={{ column: "sort_order", ascending: true }}
      reorderable
      columns={[
        { key: "title", label: "العنوان", className: "font-medium" },
        { key: "slug", label: "المعرّف" },
        { key: "parent_slug", label: "الصفحة الأم" },
        {
          key: "show_in_menu",
          label: "في القائمة",
          render: (r) => (r.show_in_menu ? "نعم" : "لا"),
        },
      ]}
      createDefaults={() => ({
        slug: "",
        title: "",
        content: "",
        meta_description: "",
        parent_slug: "",
        sort_order: 0,
        show_in_menu: false,
        published: false,
      })}
      validate={(v) => {
        if (!v.title?.trim()) return "العنوان مطلوب";
        if (!v.slug?.trim()) return "المعرّف (slug) مطلوب";
        return null;
      }}
      renderForm={(v, set) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>العنوان *</Label>
              <Input
                value={v.title ?? ""}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!v.id) set("slug", slugify(e.target.value));
                }}
              />
            </div>
            <div>
              <Label>المعرّف (slug) *</Label>
              <Input dir="ltr" value={v.slug ?? ""} onChange={(e) => set("slug", e.target.value)} />
            </div>
          </div>
          <div>
            <Label>الصفحة الأم (slug — اختياري)</Label>
            <Input dir="ltr" value={v.parent_slug ?? ""} onChange={(e) => set("parent_slug", e.target.value)} placeholder="مثال: about" />
          </div>
          <div>
            <Label>وصف الصفحة (SEO)</Label>
            <Textarea rows={2} value={v.meta_description ?? ""} onChange={(e) => set("meta_description", e.target.value)} />
          </div>
          <div>
            <Label>المحتوى (يدعم Markdown أو HTML)</Label>
            <Textarea rows={10} value={v.content ?? ""} onChange={(e) => set("content", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>الترتيب</Label>
              <Input type="number" value={v.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} />
            </div>
            <label className="flex items-end gap-2 text-sm pb-2">
              <input type="checkbox" checked={!!v.show_in_menu} onChange={(e) => set("show_in_menu", e.target.checked)} />
              في القائمة
            </label>
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
