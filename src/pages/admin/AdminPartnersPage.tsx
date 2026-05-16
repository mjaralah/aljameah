import { CrudPage } from "@/components/admin/CrudPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaUpload } from "@/components/admin/MediaUpload";

type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  published: boolean;
  sort_order: number;
};

export default function AdminPartnersPage() {
  return (
    <CrudPage<Partner>
      table="partners"
      reorderable
      orderBy={{ column: "sort_order", ascending: true }}
      title="الشركاء"
      description="شعارات الشركاء والداعمين"
      searchField="name"
      columns={[
        {
          key: "logo_url",
          label: "الشعار",
          render: (r) =>
            r.logo_url ? (
              <img src={r.logo_url} alt="" className="h-10 w-20 object-contain bg-white rounded p-1 border" />
            ) : (
              <div className="h-10 w-20 rounded bg-muted" />
            ),
        },
        { key: "name", label: "الاسم", className: "font-medium" },
        { key: "website_url", label: "الرابط" },
      ]}
      createDefaults={() => ({
        name: "",
        logo_url: null,
        website_url: "",
        published: true,
        sort_order: 0,
      })}
      validate={(v) => (!v.name?.trim() ? "الاسم مطلوب" : null)}
      renderForm={(v, set) => (
        <>
          <div>
            <Label>اسم الشريك *</Label>
            <Input value={v.name ?? ""} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <Label>رابط الموقع</Label>
            <Input dir="ltr" value={v.website_url ?? ""} onChange={(e) => set("website_url", e.target.value)} placeholder="https://..." />
          </div>
          <MediaUpload label="الشعار" folder="partners" value={v.logo_url} onChange={(url) => set("logo_url", url)} />
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
