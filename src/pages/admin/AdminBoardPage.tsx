import { CrudPage } from "@/components/admin/CrudPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaUpload } from "@/components/admin/MediaUpload";

type Member = {
  id: string;
  full_name: string;
  position: string;
  bio: string | null;
  photo_url: string | null;
  published: boolean;
  sort_order: number;
};

export default function AdminBoardPage() {
  return (
    <CrudPage<Member>
      table="board_members"
      title="مجلس الإدارة"
      description="إدارة أعضاء مجلس الإدارة"
      searchField="full_name"
      columns={[
        {
          key: "photo_url",
          label: "الصورة",
          render: (r) =>
            r.photo_url ? (
              <img src={r.photo_url} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-muted" />
            ),
        },
        { key: "full_name", label: "الاسم الكامل", className: "font-medium" },
        { key: "position", label: "المنصب" },
        { key: "sort_order", label: "الترتيب" },
      ]}
      createDefaults={() => ({
        full_name: "",
        position: "",
        bio: "",
        photo_url: null,
        published: true,
        sort_order: 0,
      })}
      validate={(v) => {
        if (!v.full_name?.trim()) return "الاسم مطلوب";
        if (!v.position?.trim()) return "المنصب مطلوب";
        return null;
      }}
      renderForm={(v, set) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>الاسم الكامل *</Label>
              <Input value={v.full_name ?? ""} onChange={(e) => set("full_name", e.target.value)} />
            </div>
            <div>
              <Label>المنصب *</Label>
              <Input value={v.position ?? ""} onChange={(e) => set("position", e.target.value)} placeholder="مثال: رئيس المجلس" />
            </div>
          </div>
          <div>
            <Label>نبذة</Label>
            <Textarea rows={3} value={v.bio ?? ""} onChange={(e) => set("bio", e.target.value)} />
          </div>
          <MediaUpload label="الصورة الشخصية" folder="board" value={v.photo_url} onChange={(url) => set("photo_url", url)} />
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
