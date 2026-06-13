import { useEffect, useState } from "react";
import { CrudPage } from "@/components/admin/CrudPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, Users, Settings as SettingsIcon, Plus, X } from "lucide-react";

const DEFAULT_POSITIONS = [
  "رئيس مجلس الإدارة",
  "نائب رئيس مجلس الإدارة",
  "عضو مجلس الإدارة",
];

const ADD_NEW = "__add_new__";

type Member = {
  id: string;
  full_name: string;
  position: string;
  bio: string | null;
  photo_url: string | null;
  published: boolean;
  sort_order: number;
  term_duration: string | null;
};

type Settings = {
  id?: string;
  intro_text: string | null;
  term_duration_label: string | null;
  term_end_hijri: string | null;
  term_end_gregorian: string | null;
  show_hijri: boolean;
  show_gregorian: boolean;
  formation_decree_url: string | null;
  formation_decree_name: string | null;
  positions?: string[] | null;
};

// قائمة المناصب المشتركة (تُجلب مرة واحدة من board_settings.positions)
function usePositions() {
  const [positions, setPositions] = useState<string[]>(DEFAULT_POSITIONS);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("board_settings")
        .select("id, positions")
        .maybeSingle();
      if (data) {
        setSettingsId(data.id);
        const list = Array.isArray((data as any).positions) ? ((data as any).positions as string[]) : [];
        setPositions(list.length ? list : DEFAULT_POSITIONS);
      }
    })();
  }, []);

  async function addPosition(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (positions.includes(trimmed)) return;
    const next = [...positions, trimmed];
    setPositions(next);
    try {
      if (settingsId) {
        await supabase.from("board_settings").update({ positions: next } as any).eq("id", settingsId);
      } else {
        const { data } = await supabase
          .from("board_settings")
          .insert({ positions: next } as any)
          .select("id")
          .single();
        if (data) setSettingsId(data.id);
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return { positions, addPosition };
}

function PositionField({
  value,
  onChange,
  positions,
  onAdd,
}: {
  value: string;
  onChange: (v: string) => void;
  positions: string[];
  onAdd: (name: string) => Promise<void> | void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  // أدرج القيمة الحالية إن كانت غير موجودة (توافق رجعي)
  const options = value && !positions.includes(value) ? [value, ...positions] : positions;

  return (
    <div className="space-y-2">
      <Select
        value={value || undefined}
        onValueChange={(v) => {
          if (v === ADD_NEW) {
            setAdding(true);
            setDraft("");
          } else {
            onChange(v);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="اختر المنصب" />
        </SelectTrigger>
        <SelectContent>
          {options.map((p) => (
            <SelectItem key={p} value={p}>{p}</SelectItem>
          ))}
          <SelectItem value={ADD_NEW}>
            <span className="flex items-center gap-1 text-primary">
              <Plus className="h-3.5 w-3.5" /> إضافة منصب جديد…
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      {adding && (
        <div className="flex items-center gap-2 border border-dashed border-border rounded-lg p-2">
          <Input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="اسم المنصب الجديد"
          />
          <Button
            type="button"
            size="sm"
            onClick={async () => {
              const t = draft.trim();
              if (!t) return;
              await onAdd(t);
              onChange(t);
              setAdding(false);
              setDraft("");
            }}
          >
            إضافة
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => { setAdding(false); setDraft(""); }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function MembersTab() {
  const { positions, addPosition } = usePositions();

  return (
    <CrudPage<Member>
      noLayout
      table="board_members"
      reorderable
      orderBy={{ column: "sort_order", ascending: true }}
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
        { key: "term_duration", label: "مدة الدورة" },
        { key: "sort_order", label: "الترتيب" },
      ]}
      createDefaults={() => ({
        full_name: "",
        position: "",
        bio: "",
        photo_url: null,
        published: true,
        sort_order: 0,
        term_duration: "",
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
              <PositionField
                value={v.position ?? ""}
                onChange={(val) => set("position", val)}
                positions={positions}
                onAdd={addPosition}
              />
            </div>
          </div>
          <div>
            <Label>نبذة</Label>
            <Textarea rows={3} value={v.bio ?? ""} onChange={(e) => set("bio", e.target.value)} />
          </div>
          <div>
            <Label>مدة الدورة</Label>
            <Input
              value={v.term_duration ?? ""}
              onChange={(e) => set("term_duration", e.target.value)}
              placeholder="مثال: 4 سنوات"
            />
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

function PositionsManager({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((p) => (
          <span key={p} className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-full text-sm">
            {p}
            <button
              type="button"
              onClick={() => onChange(value.filter((x) => x !== p))}
              className="text-muted-foreground hover:text-destructive"
              aria-label="حذف"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        {value.length === 0 && (
          <p className="text-xs text-muted-foreground">لا توجد مناصب — أضف أول منصب.</p>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="إضافة منصب جديد"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const t = draft.trim();
            if (!t || value.includes(t)) { setDraft(""); return; }
            onChange([...value, t]);
            setDraft("");
          }}
        >
          <Plus className="h-4 w-4 ml-1" /> إضافة
        </Button>
      </div>
    </div>
  );
}

function SettingsTab() {
  const [s, setS] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("board_settings").select("*").maybeSingle();
      if (error) toast.error(error.message);
      setS(
        (data as any) ?? {
          intro_text: "",
          term_duration_label: "",
          term_end_hijri: "",
          term_end_gregorian: null,
          show_hijri: true,
          show_gregorian: true,
          formation_decree_url: null,
          formation_decree_name: null,
          positions: DEFAULT_POSITIONS,
        }
      );
      setLoading(false);
    })();
  }, []);

  async function save() {
    if (!s) return;
    setSaving(true);
    try {
      const payload = {
        intro_text: s.intro_text,
        term_duration_label: s.term_duration_label,
        term_end_hijri: s.term_end_hijri,
        term_end_gregorian: s.term_end_gregorian || null,
        show_hijri: s.show_hijri,
        show_gregorian: s.show_gregorian,
        formation_decree_url: s.formation_decree_url,
        formation_decree_name: s.formation_decree_name,
        positions: s.positions ?? DEFAULT_POSITIONS,
      };
      if (s.id) {
        const { error } = await supabase.from("board_settings").update(payload as any).eq("id", s.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("board_settings").insert(payload as any).select().single();
        if (error) throw error;
        if (data) setS({ ...(data as any) } as Settings);
      }
      toast.success("تم حفظ الإعدادات");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !s) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Label>النص التعريفي للقسم</Label>
        <Textarea
          rows={3}
          value={s.intro_text ?? ""}
          onChange={(e) => setS({ ...s, intro_text: e.target.value })}
          placeholder="نخبةٌ من الكفاءات المتطوّعة..."
        />
      </div>

      <div>
        <Label>مدة دورة مجلس الإدارة (عام)</Label>
        <Input
          value={s.term_duration_label ?? ""}
          onChange={(e) => setS({ ...s, term_duration_label: e.target.value })}
          placeholder="مثال: 4 سنوات"
        />
        <p className="text-xs text-muted-foreground mt-1">يظهر في اللوحة الجانبية بصفحة "من نحن".</p>
      </div>

      <div className="border border-border rounded-xl p-4 space-y-3">
        <h3 className="font-bold text-primary">قائمة المناصب</h3>
        <p className="text-xs text-muted-foreground">
          تظهر هذه القائمة في نموذج إضافة/تعديل العضو. يمكن إضافة منصب جديد من هنا أو مباشرة عند تحرير العضو.
        </p>
        <PositionsManager
          value={s.positions && s.positions.length ? s.positions : DEFAULT_POSITIONS}
          onChange={(next) => setS({ ...s, positions: next })}
        />
      </div>

      <div className="border border-border rounded-xl p-4 space-y-4">
        <h3 className="font-bold text-primary">تاريخ انتهاء العضويات لدورة المجلس</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>هجري</Label>
              <div className="flex items-center gap-2 text-xs">
                <span>إظهار</span>
                <Switch
                  checked={s.show_hijri}
                  onCheckedChange={(v) => setS({ ...s, show_hijri: v })}
                />
              </div>
            </div>
            <Input
              dir="ltr"
              value={s.term_end_hijri ?? ""}
              onChange={(e) => setS({ ...s, term_end_hijri: e.target.value })}
              placeholder="1429-06-11"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>ميلادي</Label>
              <div className="flex items-center gap-2 text-xs">
                <span>إظهار</span>
                <Switch
                  checked={s.show_gregorian}
                  onCheckedChange={(v) => setS({ ...s, show_gregorian: v })}
                />
              </div>
            </div>
            <Input
              type="date"
              dir="ltr"
              value={s.term_end_gregorian ?? ""}
              onChange={(e) => setS({ ...s, term_end_gregorian: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="border border-border rounded-xl p-4 space-y-3">
        <h3 className="font-bold text-primary">ملف إفصاح المصالح (PDF)</h3>
        <MediaUpload
          label="ملف القرار"
          bucket="documents"
          folder="board-decrees"
          accept="application/pdf"
          value={s.formation_decree_url}
          onChange={(url) => setS({ ...s, formation_decree_url: url })}
        />
        <div>
          <Label>الاسم الظاهر للزر</Label>
          <Input
            value={s.formation_decree_name ?? ""}
            onChange={(e) => setS({ ...s, formation_decree_name: e.target.value })}
            placeholder="تحميل الملف المرفق"
          />
        </div>
      </div>

      <Button onClick={save} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <Save className="h-4 w-4 ml-2" />}
        حفظ الإعدادات
      </Button>
    </div>
  );
}

export default function AdminBoardPage() {
  return (
    <AdminLayout title="مجلس الإدارة">
      <Tabs defaultValue="members" className="w-full" dir="rtl">
        <TabsList className="h-auto p-1.5 bg-muted/60 border border-border rounded-xl gap-1 w-full sm:w-auto">
          <TabsTrigger
            value="members"
            className="gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            <Users className="h-4 w-4" />
            الأعضاء
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            <SettingsIcon className="h-4 w-4" />
            إعدادات المجلس
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <MembersTab />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
