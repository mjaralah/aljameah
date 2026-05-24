import { CrudPage } from "@/components/admin/CrudPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";


type News = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  category: string | null;
  published: boolean;
  sort_order: number;
};

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\u0600-\u06FF-]/g, "").slice(0, 80);

export default function AdminNewsPage() {
  return (
    <CrudPage<News>
      table="news"
      title="إدارة الأخبار"
      description="أضف أو حرّر أو احذف الأخبار المنشورة على الموقع"
      searchField="title"
      orderBy={{ column: "sort_order", ascending: true }}
      reorderable
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
        { key: "title", label: "العنوان", className: "font-medium" },
        { key: "category", label: "الفئة" },
      ]}
      createDefaults={() => ({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        cover_image_url: null,
        category: "",
        published: false,
        sort_order: 0,
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
            <Label>الفئة</Label>
            <Input value={v.category ?? ""} onChange={(e) => set("category", e.target.value)} placeholder="مثال: فعاليات" />
          </div>
          <div>
            <Label>المقتطف</Label>
            <Textarea rows={2} value={v.excerpt ?? ""} onChange={(e) => set("excerpt", e.target.value)} />
          </div>
          <div>
            <Label>المحتوى الكامل</Label>
            <RichTextEditor
              value={v.content ?? ""}
              onChange={(html) => set("content", html)}
              placeholder="اكتب نص الخبر هنا — يمكنك تنسيقه بالعناوين والقوائم والروابط..."
              minHeight={260}
            />
          </div>
          <MediaUpload
            label="صورة الغلاف"
            folder="news"
            value={v.cover_image_url}
            onChange={(url) => set("cover_image_url", url)}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>الترتيب</Label>
              <Input type="number" value={v.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!v.published}
                  onChange={(e) => set("published", e.target.checked)}
                />
                منشور
              </label>
            </div>
          </div>
        </>
      )}
      extraDialogActions={
        (values: Partial<News>) => {
          const slug = values.slug?.trim();
          if (!slug) return null;
          return (
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.open(`/media/${slug}?preview=1`, "_blank")}
            >
              <Eye className="w-4 h-4 ml-1" />
              معاينة
            </Button>
          );
        }
      }
    />
  );
}

