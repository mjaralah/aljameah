import { CrudPage } from "@/components/admin/CrudPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaUpload } from "@/components/admin/MediaUpload";

type Slide = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  published: boolean;
  sort_order: number;
};

export default function AdminHeroPage() {
  return (
    <CrudPage<Slide>
      table="hero_slides"
      title="شريط البطل (Hero Slider)"
      description="الشرائح المتحركة في أعلى الصفحة الرئيسية"
      columns={[
        {
          key: "image_url",
          label: "الصورة",
          render: (r) =>
            r.image_url ? (
              <img src={r.image_url} alt="" className="h-12 w-20 object-cover rounded" />
            ) : (
              <div className="h-12 w-20 rounded bg-muted" />
            ),
        },
        { key: "title", label: "العنوان", className: "font-medium" },
        { key: "sort_order", label: "الترتيب" },
      ]}
      createDefaults={() => ({
        title: "",
        subtitle: "",
        image_url: null,
        cta_label: "",
        cta_url: "",
        published: true,
        sort_order: 0,
      })}
      validate={(v) => (!v.title?.trim() ? "العنوان مطلوب" : null)}
      renderForm={(v, set) => (
        <>
          <div>
            <Label>العنوان *</Label>
            <Input value={v.title ?? ""} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div>
            <Label>العنوان الفرعي</Label>
            <Textarea rows={2} value={v.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} />
          </div>
          <MediaUpload label="صورة الخلفية" folder="hero" value={v.image_url} onChange={(url) => set("image_url", url)} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>نص الزر</Label>
              <Input value={v.cta_label ?? ""} onChange={(e) => set("cta_label", e.target.value)} placeholder="اعرف أكثر" />
            </div>
            <div>
              <Label>رابط الزر</Label>
              <Input dir="ltr" value={v.cta_url ?? ""} onChange={(e) => set("cta_url", e.target.value)} placeholder="/about" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>الترتيب</Label>
              <Input type="number" value={v.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!v.published} onChange={(e) => set("published", e.target.checked)} />
                منشور
              </label>
            </div>
          </div>
        </>
      )}
    />
  );
}
