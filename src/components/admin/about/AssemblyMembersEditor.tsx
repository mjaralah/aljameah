// محرّر قسم أعضاء الجمعية العمومية — إعدادات/أنواع/أعضاء/استيراد/تصدير
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Upload, Download, FileSpreadsheet, Pencil, Eye, EyeOff, Users, Tag, Settings } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  AssemblyData,
  AssemblyMember,
  DEFAULT_TYPES,
  MembershipType,
  downloadTemplate,
  exportToCSV,
  exportToExcel,
  exportToPDF,
  parseImportFile,
} from "@/lib/assemblyExport";

export function defaultAssemblyData(): AssemblyData {
  return {
    type: "assembly_members",
    title_ar: "أعضاء الجمعية العمومية",
    title_en: "General Assembly Members",
    subtitle_ar: "",
    subtitle_en: "",
    settings: {
      show_phone_public: false,
      show_email_public: false,
      show_export_public: true,
      page_size: 15,
    },
    membership_types: DEFAULT_TYPES,
    members: [],
  };
}

export default function AssemblyMembersEditor({
  data,
  onChange,
}: {
  data: AssemblyData;
  onChange: (d: AssemblyData) => void;
}) {
  const settings = data.settings ?? {
    show_phone_public: false,
    show_email_public: false,
    show_export_public: true,
    page_size: 15,
  };
  const types = data.membership_types ?? DEFAULT_TYPES;
  const members = data.members ?? [];
  const update = (patch: Partial<AssemblyData>) => onChange({ ...data, ...patch });
  const updateSettings = (p: Partial<NonNullable<AssemblyData["settings"]>>) =>
    update({ settings: { ...settings, ...p } });

  return (
    <Tabs defaultValue="members" className="w-full">
      <TabsList className="grid w-full grid-cols-3 h-auto p-1.5 bg-muted/70 border-2 border-border rounded-xl shadow-sm gap-1.5">
        <TabsTrigger
          value="members"
          className="gap-2 py-2.5 text-sm font-medium rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-bold data-[state=active]:shadow-md data-[state=active]:ring-2 data-[state=active]:ring-primary/30"
        >
          <Users className="w-4 h-4" />
          الأعضاء ({members.length})
        </TabsTrigger>
        <TabsTrigger
          value="types"
          className="gap-2 py-2.5 text-sm font-medium rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-bold data-[state=active]:shadow-md data-[state=active]:ring-2 data-[state=active]:ring-primary/30"
        >
          <Tag className="w-4 h-4" />
          أنواع العضوية
        </TabsTrigger>
        <TabsTrigger
          value="settings"
          className="gap-2 py-2.5 text-sm font-medium rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-bold data-[state=active]:shadow-md data-[state=active]:ring-2 data-[state=active]:ring-primary/30"
        >
          <Settings className="w-4 h-4" />
          الإعدادات
        </TabsTrigger>
      </TabsList>

      {/* الأعضاء */}
      <TabsContent value="members">
        <MembersTab
          members={members}
          types={types}
          onChange={(m) => update({ members: m })}
          onTypesChange={(t) => update({ membership_types: t })}
        />
      </TabsContent>

      {/* أنواع العضوية */}
      <TabsContent value="types">
        <TypesTab types={types} onChange={(t) => update({ membership_types: t })} />
      </TabsContent>

      {/* الإعدادات */}
      <TabsContent value="settings">
        <div className="space-y-3 p-3 rounded-md bg-muted/40">
          <SwitchRow
            label="إظهار رقم الهاتف للزوار (قاطع عام)"
            hint="إذا أُطفئ — يختفي الهاتف للجميع. إذا فُعّل — يظهر فقط للأعضاء الذين فعّلوا خيار «إظهار التواصل»."
            checked={!!settings.show_phone_public}
            onChange={(v) => updateSettings({ show_phone_public: v })}
          />
          <SwitchRow
            label="إظهار البريد الإلكتروني للزوار (قاطع عام)"
            hint="نفس المنطق — يحترم تفضيل كل عضو."
            checked={!!settings.show_email_public}
            onChange={(v) => updateSettings({ show_email_public: v })}
          />
          <SwitchRow
            label="إتاحة تصدير القائمة للزوار (Excel/CSV/PDF)"
            checked={!!settings.show_export_public}
            onChange={(v) => updateSettings({ show_export_public: v })}
          />
          <div>
            <Label className="text-xs mb-1 block">عدد العناصر في الصفحة</Label>
            <Input
              type="number"
              min={5}
              max={50}
              value={settings.page_size ?? 15}
              onChange={(e) =>
                updateSettings({ page_size: Math.max(5, Number(e.target.value) || 15) })
              }
              className="max-w-[160px]"
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function SwitchRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/* ===================== الأعضاء ===================== */
function MembersTab({
  members,
  types,
  onChange,
  onTypesChange,
}: {
  members: AssemblyMember[];
  types: MembershipType[];
  onChange: (m: AssemblyMember[]) => void;
  onTypesChange: (t: MembershipType[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [editing, setEditing] = useState<AssemblyMember | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (filterType !== "all" && m.membership_type !== filterType) return false;
      if (!q) return true;
      return (
        (m.name_ar ?? "").toLowerCase().includes(q) ||
        (m.name_en ?? "").toLowerCase().includes(q) ||
        (m.phone ?? "").includes(q) ||
        (m.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [members, query, filterType]);

  const typeLabel = (k?: string) => types.find((t) => t.key === k)?.label_ar ?? k ?? "—";

  async function handleImport(file: File) {
    const { rows, errors } = await parseImportFile(file);
    if (errors.length) toast.warning(`تجاوز ${errors.length} صفوف بسبب أخطاء`);
    if (!rows.length) {
      toast.error("لا توجد صفوف صالحة في الملف");
      return;
    }
    onChange([...members, ...rows]);
    toast.success(`تمت إضافة ${rows.length} عضو`);
  }

  function saveMember(m: AssemblyMember) {
    if (members.some((x) => x.id === m.id)) {
      onChange(members.map((x) => (x.id === m.id ? m : x)));
    } else {
      onChange([...members, m]);
    }
    setEditing(null);
  }

  function removeMember(id: string) {
    if (!confirm("حذف هذا العضو؟")) return;
    onChange(members.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-3">
      {/* شريط أدوات */}
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          placeholder="بحث بالاسم/الهاتف/البريد…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            {types.map((t) => (
              <SelectItem key={t.key} value={t.key}>
                {t.label_ar}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button
          size="sm"
          onClick={() =>
            setEditing({
              id: crypto.randomUUID(),
              name_ar: "",
              name_en: "",
              membership_type: types[0]?.key ?? "regular",
              join_date: new Date().toISOString().slice(0, 10),
              phone: "",
              email: "",
              status: "active",
            })
          }
        >
          <Plus className="w-4 h-4 ml-1" /> إضافة عضو
        </Button>
        <Button size="sm" variant="outline" onClick={() => downloadTemplate()}>
          <FileSpreadsheet className="w-4 h-4 ml-1" /> قالب Excel
        </Button>
        <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
          <Upload className="w-4 h-4 ml-1" /> استيراد
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImport(f);
            e.target.value = "";
          }}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => exportToExcel(filtered, types, true)}
        >
          <Download className="w-4 h-4 ml-1" /> Excel
        </Button>
        <Button size="sm" variant="outline" onClick={() => exportToCSV(filtered, types, true)}>
          <Download className="w-4 h-4 ml-1" /> CSV
        </Button>
      </div>

      {/* الجدول */}
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>الالتحاق</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead>البريد</TableHead>
              <TableHead className="w-28 text-center" title="إظهار بيانات التواصل للزوار">إظهار التواصل</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                  لا يوجد أعضاء
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m, i) => (
                <TableRow key={m.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="font-medium">
                    {m.name_ar || m.name_en}
                  </TableCell>
                  <TableCell>{typeLabel(m.membership_type)}</TableCell>
                  <TableCell className="text-xs">{m.join_date || "—"}</TableCell>
                  <TableCell className="text-xs" dir="ltr">{m.phone || "—"}</TableCell>
                  <TableCell className="text-xs" dir="ltr">{m.email || "—"}</TableCell>
                  <TableCell className="text-center">
                    <button
                      type="button"
                      onClick={() =>
                        onChange(
                          members.map((x) =>
                            x.id === m.id ? { ...x, contact_public: !x.contact_public } : x,
                          ),
                        )
                      }
                      className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted transition"
                      title={m.contact_public ? "ظاهر للزوار — اضغط للإخفاء" : "مخفي — اضغط للإظهار"}
                    >
                      {m.contact_public ? (
                        <Eye className="w-4 h-4 text-primary" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => setEditing(m)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeMember(m.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>


      {/* تحرير عضو */}
      {editing && (
        <MemberForm
          member={editing}
          types={types}
          onCancel={() => setEditing(null)}
          onSave={saveMember}
          onTypesChange={onTypesChange}
        />
      )}
    </div>
  );
}

const NEW_TYPE_SENTINEL = "__add_new__";
const SUGGESTED_COLORS = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

function MemberForm({
  member,
  types,
  onSave,
  onCancel,
  onTypesChange,
}: {
  member: AssemblyMember;
  types: MembershipType[];
  onSave: (m: AssemblyMember) => void;
  onCancel: () => void;
  onTypesChange: (t: MembershipType[]) => void;
}) {
  const [m, setM] = useState<AssemblyMember>(member);
  const set = (p: Partial<AssemblyMember>) => setM({ ...m, ...p });

  const [creatingType, setCreatingType] = useState(false);
  const [newTypeAr, setNewTypeAr] = useState("");
  const [newTypeEn, setNewTypeEn] = useState("");
  const [newTypeColor, setNewTypeColor] = useState(SUGGESTED_COLORS[0]);

  function addNewType() {
    const ar = newTypeAr.trim();
    if (!ar) {
      toast.error("اسم النوع بالعربية مطلوب");
      return;
    }
    if (types.some((t) => t.label_ar === ar)) {
      toast.error("هذا النوع موجود مسبقاً");
      return;
    }
    const slug =
      ar
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 24) || "type";
    const key = `${slug}_${Date.now().toString(36).slice(-4)}`;
    const newType: MembershipType = {
      key,
      label_ar: ar,
      label_en: newTypeEn.trim() || ar,
      color: newTypeColor,
    };
    onTypesChange([...types, newType]);
    set({ membership_type: key });
    setCreatingType(false);
    setNewTypeAr("");
    setNewTypeEn("");
    setNewTypeColor(SUGGESTED_COLORS[0]);
    toast.success("تمت إضافة النوع الجديد");
  }

  return (
    <div className="border rounded-md p-3 bg-muted/30 space-y-3">
      <div className="text-sm font-medium">
        {member.name_ar || member.name_en ? "تعديل عضو" : "عضو جديد"}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Field label="الاسم (AR)">
          <Input value={m.name_ar ?? ""} onChange={(e) => set({ name_ar: e.target.value })} />
        </Field>
        <Field label="Name (EN)">
          <Input
            value={m.name_en ?? ""}
            onChange={(e) => set({ name_en: e.target.value })}
            dir="ltr"
          />
        </Field>
        <Field label="نوع العضوية">
          <div className="space-y-2">
            <Select
              value={m.membership_type ?? "regular"}
              onValueChange={(v) => {
                if (v === NEW_TYPE_SENTINEL) {
                  setCreatingType(true);
                  return;
                }
                set({ membership_type: v });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t.key} value={t.key}>
                    {t.label_ar}
                  </SelectItem>
                ))}
                <SelectItem value={NEW_TYPE_SENTINEL} className="text-primary font-semibold">
                  + إضافة نوع جديد…
                </SelectItem>
              </SelectContent>
            </Select>

            {creatingType && (
              <div className="border border-primary/30 rounded-md p-2 bg-background space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Field label="الاسم (AR) *">
                    <Input
                      value={newTypeAr}
                      onChange={(e) => setNewTypeAr(e.target.value)}
                      placeholder="مثال: مؤسس"
                      autoFocus
                    />
                  </Field>
                  <Field label="Label (EN)">
                    <Input
                      value={newTypeEn}
                      onChange={(e) => setNewTypeEn(e.target.value)}
                      placeholder="Founder"
                      dir="ltr"
                    />
                  </Field>
                </div>
                <Field label="لون الشارة">
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="color"
                      value={newTypeColor}
                      onChange={(e) => setNewTypeColor(e.target.value)}
                      className="h-8 w-10 rounded border border-border cursor-pointer bg-transparent"
                      aria-label="اختيار لون الشارة"
                    />
                    {SUGGESTED_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewTypeColor(c)}
                        className="h-7 w-7 rounded-full border-2 transition"
                        style={{
                          backgroundColor: c,
                          borderColor: newTypeColor === c ? "hsl(var(--foreground))" : "transparent",
                        }}
                        aria-label={`لون ${c}`}
                      />
                    ))}
                  </div>
                </Field>
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setCreatingType(false);
                      setNewTypeAr("");
                      setNewTypeEn("");
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button size="sm" onClick={addNewType}>
                    إضافة النوع
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Field>
        <Field label="تاريخ الالتحاق">
          <Input
            type="date"
            value={m.join_date ?? ""}
            onChange={(e) => set({ join_date: e.target.value })}
          />
        </Field>
        <Field label="الهاتف (اختياري)">
          <Input
            value={m.phone ?? ""}
            onChange={(e) => set({ phone: e.target.value })}
            dir="ltr"
          />
        </Field>
        <Field label="البريد (اختياري)">
          <Input
            type="email"
            value={m.email ?? ""}
            onChange={(e) => set({ email: e.target.value })}
            dir="ltr"
          />
        </Field>
        <Field label="الحالة">
          <Select value={m.status ?? "active"} onValueChange={(v) => set({ status: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">نشِط</SelectItem>
              <SelectItem value="inactive">غير نشِط</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <Checkbox
          checked={!!m.contact_public}
          onCheckedChange={(v) => set({ contact_public: !!v })}
        />
        <span>
          العضو موافق على إظهار رقم التواصل والبريد للزوار
          <span className="text-xs text-muted-foreground block">
            عند الإلغاء — تبقى البيانات محفوظة لكن مخفية في الموقع العام
          </span>
        </span>
      </label>
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button
          size="sm"
          onClick={() => {
            if (!m.name_ar && !m.name_en) {
              toast.error("الاسم مطلوب");
              return;
            }
            onSave(m);
          }}
        >
          حفظ العضو
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium mb-1 block">{label}</label>
      {children}
    </div>
  );
}

/* ===================== أنواع العضوية ===================== */
function TypesTab({
  types,
  onChange,
}: {
  types: MembershipType[];
  onChange: (t: MembershipType[]) => void;
}) {
  const update = (i: number, p: Partial<MembershipType>) => {
    const next = [...types];
    next[i] = { ...next[i], ...p };
    onChange(next);
  };
  const add = () =>
    onChange([
      ...types,
      { key: `type_${Date.now()}`, label_ar: "نوع جديد", label_en: "New type", color: "#2563eb" },
    ]);
  const remove = (i: number) => {
    if (!confirm("حذف هذا النوع؟")) return;
    onChange(types.filter((_, j) => j !== i));
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button size="sm" onClick={add}>
          <Plus className="w-4 h-4 ml-1" /> إضافة نوع
        </Button>
      </div>
      {types.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-3">لا توجد أنواع</p>
      )}
      {types.map((t, i) => (
        <div
          key={i}
          className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto_auto] gap-2 items-end border rounded-md p-2 bg-muted/30"
        >
          <Field label="المفتاح (key)">
            <Input
              value={t.key}
              onChange={(e) => update(i, { key: e.target.value.replace(/\s+/g, "_") })}
              dir="ltr"
            />
          </Field>
          <Field label="الاسم (AR)">
            <Input value={t.label_ar} onChange={(e) => update(i, { label_ar: e.target.value })} />
          </Field>
          <Field label="Label (EN)">
            <Input
              value={t.label_en}
              onChange={(e) => update(i, { label_en: e.target.value })}
              dir="ltr"
            />
          </Field>
          <Field label="اللون">
            <input
              type="color"
              value={t.color ?? "#64748b"}
              onChange={(e) => update(i, { color: e.target.value })}
              className="h-9 w-12 rounded border border-border cursor-pointer bg-transparent"
              aria-label="لون الشارة"
            />
          </Field>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive"
            onClick={() => remove(i)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
