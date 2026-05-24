import { CrudPage } from "@/components/admin/CrudPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { IconPicker } from "@/components/admin/IconPicker";

type Program = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  icon: string | null;
  cover_image_url: string | null;
  published: boolean;
  sort_order: number;
  featured: boolean;
  sponsor_button_enabled: boolean;
  sponsor_button_label: string | null;
  sponsor_button_label_en: string | null;
  sponsor_button_url: string | null;
  sponsor_button_icon: string | null;
};

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\u0600-\u06FF-]/g, "").slice(0, 80);

export default function AdminProgramsPage() {
  return (
    <CrudPage<Program>
      table="programs"
      reorderable
      orderBy={{ column: "sort_order", ascending: true }}
      title="إدارة البرامج"
      description="البرامج والمبادرات التي تقدمها الجمعية"
      searchField="title"
      columns={[
        {
          key: "cover_image_url",
          label: "الصورة",
          render: (r) =>
            r.cover_image_url ? (
              <img src={r.cover_image_url} alt="" className="h-10 w-14 object-cover rounded" />
            ) : (
              <div className="h-10 w-14 rounded bg-muted" />
            ),
        },
        { key: "title", label: "اسم البرنامج", className: "font-medium" },
        { key: "sort_order", label: "الترتيب" },
        {
          key: "featured",
          label: "مُبرز",
          render: (r) => (r.featured ? "★" : "—"),
        },
      ]}
      createDefaults={() => ({
        title: "",
        slug: "",
        description: "",
        long_description: "",
        icon: "",
        cover_image_url: null,
        published: true,
        sort_order: 0,
        featured: false,
        sponsor_button_enabled: true,
        sponsor_button_label: "",
        sponsor_button_label_en: "",
        sponsor_button_url: "",
        sponsor_button_icon: "Heart",
      })}
      validate={(v) => {
        if (!v.title?.trim()) return "اسم البرنامج مطلوب";
        if (!v.slug?.trim()) return "المعرّف (slug) مطلوب";
        return null;
      }}
      renderForm={(v, set) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>اسم البرنامج *</Label>
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
            <Label>وصف مختصر</Label>
            <Textarea rows={2} value={v.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div>
            <Label>الوصف الكامل</Label>
            <Textarea rows={6} value={v.long_description ?? ""} onChange={(e) => set("long_description", e.target.value)} />
          </div>
          <div>
            <Label>أيقونة (اختياري)</Label>
            <IconPicker value={v.icon ?? ""} onChange={(name) => set("icon", name)} />
          </div>
          <MediaUpload
            label="صورة الغلاف"
            folder="programs"
            value={v.cover_image_url}
            onChange={(url) => set("cover_image_url", url)}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>الترتيب</Label>
              <Input type="number" value={v.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!v.published} onChange={(e) => set("published", e.target.checked)} />
                منشور
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!v.featured} onChange={(e) => set("featured", e.target.checked)} />
                إبراز (مميز)
              </label>
            </div>
          </div>
        </>
      )}
    />
  );
}
