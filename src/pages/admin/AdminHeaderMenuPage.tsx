// إدارة عناصر القائمة الرئيسية في رأس الموقع
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReorderControls } from "@/components/admin/ReorderControls";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Item = {
  id: string;
  key: string | null;
  kind: "system" | "custom";
  label_ar: string | null;
  label_en: string | null;
  url: string;
  is_external: boolean;
  is_visible: boolean;
  sort_order: number;
};

export default function AdminHeaderMenuPage() {
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin", "header_menu_items"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("header_menu_items")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Item[];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "header_menu_items"] });

  async function updateItem(id: string, patch: Partial<Item>) {
    const { error } = await (supabase as any)
      .from("header_menu_items")
      .update(patch)
      .eq("id", id);
    if (error) toast.error(error.message);
    else refresh();
  }

  async function deleteItem(id: string) {
    const { error } = await (supabase as any).from("header_menu_items").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("تم الحذف");
      refresh();
    }
  }

  async function reorder(newOrder: Item[]) {
    // Assign sort_order in steps of 10
    const updates = newOrder.map((it, idx) => ({ id: it.id, sort_order: (idx + 1) * 10 }));
    for (const u of updates) {
      await (supabase as any).from("header_menu_items").update({ sort_order: u.sort_order }).eq("id", u.id);
    }
    refresh();
  }

  function move(from: number, to: number) {
    const next = items.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    reorder(next);
  }

  return (
    <AdminLayout
      title="قائمة رأس الموقع"
      description="تحكّم بإظهار وإخفاء وترتيب الروابط في رأس الموقع، وإضافة روابط مخصّصة."
      actions={<AddCustomDialog onCreated={refresh} nextOrder={(items.length + 1) * 10} />}
    >
      <Card className="p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">جاري التحميل…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد عناصر.</p>
        ) : (
          <div className="space-y-2">
            {items.map((it, idx) => (
              <div
                key={it.id}
                className="flex flex-wrap items-center gap-3 p-3 border rounded-lg bg-card"
              >
                <ReorderControls
                  position={idx + 1}
                  total={items.length}
                  onMoveUp={() => move(idx, idx - 1)}
                  onMoveDown={() => move(idx, idx + 1)}
                  onSetPosition={(pos) => move(idx, pos - 1)}
                  onMoveToStart={() => move(idx, 0)}
                  onMoveToEnd={() => move(idx, items.length - 1)}
                />

                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {it.label_ar || it.label_en || it.key || it.url}
                    </span>
                    <Badge variant={it.kind === "system" ? "secondary" : "outline"}>
                      {it.kind === "system" ? "نظامي" : "مخصّص"}
                    </Badge>
                    {it.is_external && <Badge variant="outline">رابط خارجي</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground" dir="ltr">{it.url}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor={`vis-${it.id}`} className="text-xs">
                    {it.is_visible ? "ظاهر" : "مخفي"}
                  </Label>
                  <Switch
                    id={`vis-${it.id}`}
                    checked={it.is_visible}
                    onCheckedChange={(v) => updateItem(it.id, { is_visible: v })}
                  />
                </div>

                <EditDialog item={it} onSaved={refresh} />

                {it.kind === "custom" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>حذف الرابط</AlertDialogTitle>
                        <AlertDialogDescription>
                          سيُحذف الرابط نهائياً من القائمة. هل أنت متأكد؟
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteItem(it.id)}>حذف</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-4">
          ملاحظة: العناصر النظامية مرتبطة بصفحات أساسية في الموقع، ولا يمكن حذفها — فقط إخفاؤها أو إعادة ترتيبها أو تعديل تسميتها.
        </p>
      </Card>
    </AdminLayout>
  );
}

function EditDialog({ item, onSaved }: { item: Item; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [labelAr, setLabelAr] = useState(item.label_ar ?? "");
  const [labelEn, setLabelEn] = useState(item.label_en ?? "");
  const [url, setUrl] = useState(item.url);
  const [isExternal, setIsExternal] = useState(item.is_external);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLabelAr(item.label_ar ?? "");
      setLabelEn(item.label_en ?? "");
      setUrl(item.url);
      setIsExternal(item.is_external);
    }
  }, [open, item]);

  async function save() {
    setSaving(true);
    const patch: Partial<Item> = {
      label_ar: labelAr.trim() || null,
      label_en: labelEn.trim() || null,
    };
    if (item.kind === "custom") {
      patch.url = url.trim();
      patch.is_external = isExternal;
    }
    const { error } = await (supabase as any)
      .from("header_menu_items")
      .update(patch)
      .eq("id", item.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("تم الحفظ");
      onSaved();
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعديل عنصر القائمة</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>العنوان (عربي)</Label>
            <Input value={labelAr} onChange={(e) => setLabelAr(e.target.value)} placeholder="اتركه فارغاً لاستخدام الافتراضي" />
          </div>
          <div>
            <Label>العنوان (إنجليزي)</Label>
            <Input value={labelEn} onChange={(e) => setLabelEn(e.target.value)} placeholder="Leave empty to use default" dir="ltr" />
          </div>
          {item.kind === "custom" && (
            <>
              <div>
                <Label>الرابط</Label>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} dir="ltr" />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="ext" checked={isExternal} onCheckedChange={(v) => setIsExternal(!!v)} />
                <Label htmlFor="ext">رابط خارجي (يُفتح في نافذة جديدة)</Label>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
          <Button onClick={save} disabled={saving}>حفظ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddCustomDialog({ onCreated, nextOrder }: { onCreated: () => void; nextOrder: number }) {
  const [open, setOpen] = useState(false);
  const [labelAr, setLabelAr] = useState("");
  const [labelEn, setLabelEn] = useState("");
  const [url, setUrl] = useState("");
  const [isExternal, setIsExternal] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!labelAr.trim() && !labelEn.trim()) {
      toast.error("أدخل عنواناً للرابط");
      return;
    }
    if (!url.trim()) {
      toast.error("أدخل الرابط");
      return;
    }
    setSaving(true);
    const { error } = await (supabase as any).from("header_menu_items").insert({
      kind: "custom",
      label_ar: labelAr.trim() || null,
      label_en: labelEn.trim() || null,
      url: url.trim(),
      is_external: isExternal,
      is_visible: true,
      sort_order: nextOrder,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("تمت الإضافة");
      setLabelAr(""); setLabelEn(""); setUrl(""); setIsExternal(false);
      onCreated();
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> إضافة رابط
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة رابط مخصّص</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>العنوان (عربي)</Label>
            <Input value={labelAr} onChange={(e) => setLabelAr(e.target.value)} />
          </div>
          <div>
            <Label>العنوان (إنجليزي)</Label>
            <Input value={labelEn} onChange={(e) => setLabelEn(e.target.value)} dir="ltr" />
          </div>
          <div>
            <Label>الرابط</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/path أو https://…" dir="ltr" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="ext-new" checked={isExternal} onCheckedChange={(v) => setIsExternal(!!v)} />
            <Label htmlFor="ext-new">رابط خارجي (يُفتح في نافذة جديدة)</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
          <Button onClick={save} disabled={saving}>إضافة</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
