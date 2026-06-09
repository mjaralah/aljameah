// محرر الكتل (Blocks) في لوحة التحكم — يدعم العربية والإنجليزية ويبدّل بين الأنواع
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowUp, ArrowDown, Languages } from "lucide-react";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { IconPicker } from "@/components/admin/IconPicker";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
  Type, LayoutGrid, BarChart3, Images, GalleryHorizontal,
  Video, ListTree, Megaphone, FileText, Youtube,
} from "lucide-react";

export const BLOCK_TYPES = [
  { value: "text_media", label: "نص + صورة + زر", icon: Type, desc: "عنوان ووصف وصورة جانبية مع زر دعوة." },
  { value: "cards_grid", label: "شبكة بطاقات", icon: LayoutGrid, desc: "مجموعة بطاقات (أيقونة + عنوان + وصف)." },
  { value: "stats", label: "إحصائيات وعدّادات", icon: BarChart3, desc: "أرقام بارزة مع أيقونات وتسميات." },
  { value: "gallery", label: "معرض صور", icon: Images, desc: "صور بعدة أنماط عرض احترافية + Lightbox." },
  { value: "video_gallery", label: "معرض فيديوهات (YouTube)", icon: Youtube, desc: "فيديوهات يوتيوب مع أنماط عرض متعددة." },
  { value: "carousel", label: "كاروسيل/سلايدر", icon: GalleryHorizontal, desc: "شرائح متحركة (صورة + عنوان + رابط)." },
  { value: "video", label: "فيديو منفرد", icon: Video, desc: "فيديو واحد YouTube أو Vimeo أو ملف." },
  { value: "accordion", label: "أسئلة شائعة (أكورديون)", icon: ListTree, desc: "أسئلة قابلة للطي وإجاباتها." },
  { value: "cta_banner", label: "شريط دعوة (CTA)", icon: Megaphone, desc: "بانر بعنوان كبير وزر دعوة." },
  { value: "rich_text", label: "نص حر (محرر غني)", icon: FileText, desc: "محتوى نصي حر بتنسيق كامل." },
] as const;

export type BlockTypeValue = typeof BLOCK_TYPES[number]["value"];

export function BlockTypePicker({ value, onChange }: { value: BlockTypeValue; onChange: (v: BlockTypeValue) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {BLOCK_TYPES.map((b) => {
        const Icon = b.icon;
        const active = value === b.value;
        return (
          <button
            type="button"
            key={b.value}
            onClick={() => onChange(b.value)}
            className={`text-right rounded-lg border p-3 transition-smooth ${
              active ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/40 hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
              <span className="font-semibold text-sm">{b.label}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
          </button>
        );
      })}
    </div>
  );
}

type Data = Record<string, any>;

function BilingualText({
  label, valueAr, valueEn, onAr, onEn, rows,
}: { label: string; valueAr: string; valueEn: string; onAr: (v: string) => void; onEn: (v: string) => void; rows?: number }) {
  return (
    <div>
      <Label className="flex items-center gap-1.5"><Languages className="h-3.5 w-3.5" />{label}</Label>
      <Tabs defaultValue="ar" className="mt-1">
        <TabsList className="h-8">
          <TabsTrigger value="ar" className="text-xs">عربي</TabsTrigger>
          <TabsTrigger value="en" className="text-xs">English</TabsTrigger>
        </TabsList>
        <TabsContent value="ar" className="mt-2">
          {rows ? (
            <Textarea rows={rows} value={valueAr} onChange={(e) => onAr(e.target.value)} />
          ) : (
            <Input value={valueAr} onChange={(e) => onAr(e.target.value)} />
          )}
        </TabsContent>
        <TabsContent value="en" className="mt-2">
          {rows ? (
            <Textarea rows={rows} dir="ltr" value={valueEn} onChange={(e) => onEn(e.target.value)} />
          ) : (
            <Input dir="ltr" value={valueEn} onChange={(e) => onEn(e.target.value)} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BilingualRich({
  label, valueAr, valueEn, onAr, onEn,
}: { label: string; valueAr: string; valueEn: string; onAr: (v: string) => void; onEn: (v: string) => void }) {
  return (
    <div>
      <Label className="flex items-center gap-1.5"><Languages className="h-3.5 w-3.5" />{label}</Label>
      <Tabs defaultValue="ar" className="mt-1">
        <TabsList className="h-8">
          <TabsTrigger value="ar" className="text-xs">عربي</TabsTrigger>
          <TabsTrigger value="en" className="text-xs">English</TabsTrigger>
        </TabsList>
        <TabsContent value="ar" className="mt-2">
          <RichTextEditor value={valueAr} onChange={onAr} minHeight={160} />
        </TabsContent>
        <TabsContent value="en" className="mt-2">
          <RichTextEditor value={valueEn} onChange={onEn} minHeight={160} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function BlockEditor({ data, onChange, folder = "page" }: {
  data: Data;
  onChange: (next: Data) => void;
  folder?: string;
}) {
  const d = data || {};
  const type: BlockTypeValue = (d.block_type as BlockTypeValue) || "rich_text";
  const set = (patch: Data) => onChange({ ...d, ...patch });
  const items: any[] = Array.isArray(d.items) ? d.items : [];
  const setItems = (next: any[]) => set({ items: next });
  const updateItem = (i: number, patch: any) => setItems(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir; if (j < 0 || j >= items.length) return;
    const next = [...items]; [next[i], next[j]] = [next[j], next[i]]; setItems(next);
  };

  const Common = (
    <div className="space-y-3">
      <BilingualText label="العنوان" valueAr={d.title_ar ?? ""} valueEn={d.title_en ?? ""}
        onAr={(v) => set({ title_ar: v })} onEn={(v) => set({ title_en: v })} />
      <BilingualText label="عنوان فرعي (اختياري)" valueAr={d.subtitle_ar ?? ""} valueEn={d.subtitle_en ?? ""}
        onAr={(v) => set({ subtitle_ar: v })} onEn={(v) => set({ subtitle_en: v })} />
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block">نوع القسم</Label>
        <BlockTypePicker value={type} onChange={(v) => set({ block_type: v })} />
      </div>

      {/* ===== text_media ===== */}
      {type === "text_media" && (
        <>
          {Common}
          <BilingualRich label="المحتوى" valueAr={d.content_ar ?? ""} valueEn={d.content_en ?? ""}
            onAr={(v) => set({ content_ar: v })} onEn={(v) => set({ content_en: v })} />
          <MediaUpload label="صورة القسم" folder={`${folder}/text_media`} value={d.image_url ?? ""}
            onChange={(url) => set({ image_url: url ?? "" })} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>اتجاه الصورة</Label>
              <Select value={d.direction ?? "image-right"} onValueChange={(v) => set({ direction: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="image-right">الصورة على اليمين</SelectItem>
                  <SelectItem value="image-left">الصورة على اليسار</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الخلفية</Label>
              <Select value={d.background ?? "default"} onValueChange={(v) => set({ background: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">افتراضي</SelectItem>
                  <SelectItem value="muted">رمادي فاتح</SelectItem>
                  <SelectItem value="primary">لون أساسي خفيف</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>رابط الزر</Label>
              <Input dir="ltr" placeholder="/page" value={d.cta_url ?? ""} onChange={(e) => set({ cta_url: e.target.value })} />
            </div>
          </div>
          <BilingualText label="نص الزر" valueAr={d.cta_label_ar ?? ""} valueEn={d.cta_label_en ?? ""}
            onAr={(v) => set({ cta_label_ar: v })} onEn={(v) => set({ cta_label_en: v })} />
        </>
      )}

      {/* ===== cards_grid ===== */}
      {type === "cards_grid" && (
        <>
          {Common}
          <div>
            <Label>عدد الأعمدة</Label>
            <Select value={String(d.columns ?? 3)} onValueChange={(v) => set({ columns: Number(v) })}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ItemsList items={items} onAddDefault={() => setItems([...items, { icon: "Sparkles", title_ar: "", title_en: "", description_ar: "", description_en: "", url: "" }])} onMove={move} onRemove={(i) => setItems(items.filter((_, j) => j !== i))} renderItem={(it, i) => (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <Label>الأيقونة</Label>
                  <IconPicker value={it.icon ?? ""} onChange={(name) => updateItem(i, { icon: name })} />
                </div>
                <div className="md:col-span-2">
                  <Label>الرابط (اختياري)</Label>
                  <Input dir="ltr" value={it.url ?? ""} onChange={(e) => updateItem(i, { url: e.target.value })} placeholder="/about" />
                </div>
              </div>
              <BilingualText label="العنوان" valueAr={it.title_ar ?? ""} valueEn={it.title_en ?? ""}
                onAr={(v) => updateItem(i, { title_ar: v })} onEn={(v) => updateItem(i, { title_en: v })} />
              <BilingualText label="الوصف" rows={2} valueAr={it.description_ar ?? ""} valueEn={it.description_en ?? ""}
                onAr={(v) => updateItem(i, { description_ar: v })} onEn={(v) => updateItem(i, { description_en: v })} />
            </>
          )} />
        </>
      )}

      {/* ===== stats ===== */}
      {type === "stats" && (
        <>
          {Common}
          <ItemsList items={items} onAddDefault={() => setItems([...items, { icon: "Sparkles", value: 0, suffix: "", label_ar: "", label_en: "" }])} onMove={move} onRemove={(i) => setItems(items.filter((_, j) => j !== i))} renderItem={(it, i) => (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <Label>الأيقونة</Label>
                  <IconPicker value={it.icon ?? ""} onChange={(name) => updateItem(i, { icon: name })} />
                </div>
                <div>
                  <Label>القيمة (رقم)</Label>
                  <Input type="number" value={it.value ?? 0} onChange={(e) => updateItem(i, { value: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>لاحقة (مثال: %, ر.س)</Label>
                  <Input value={it.suffix ?? ""} onChange={(e) => updateItem(i, { suffix: e.target.value })} />
                </div>
              </div>
              <BilingualText label="التسمية" valueAr={it.label_ar ?? ""} valueEn={it.label_en ?? ""}
                onAr={(v) => updateItem(i, { label_ar: v })} onEn={(v) => updateItem(i, { label_en: v })} />
            </>
          )} />
        </>
      )}

      {/* ===== gallery ===== */}
      {type === "gallery" && (
        <>
          {Common}
          <ItemsList items={items} onAddDefault={() => setItems([...items, { image_url: "", caption_ar: "", caption_en: "" }])} onMove={move} onRemove={(i) => setItems(items.filter((_, j) => j !== i))} renderItem={(it, i) => (
            <>
              <MediaUpload label="الصورة" folder={`${folder}/gallery`} value={it.image_url ?? ""}
                onChange={(url) => updateItem(i, { image_url: url ?? "" })} />
              <BilingualText label="تعليق (اختياري)" valueAr={it.caption_ar ?? ""} valueEn={it.caption_en ?? ""}
                onAr={(v) => updateItem(i, { caption_ar: v })} onEn={(v) => updateItem(i, { caption_en: v })} />
            </>
          )} />
        </>
      )}

      {/* ===== carousel ===== */}
      {type === "carousel" && (
        <>
          {Common}
          <ItemsList items={items} onAddDefault={() => setItems([...items, { image_url: "", title_ar: "", title_en: "", description_ar: "", description_en: "", url: "" }])} onMove={move} onRemove={(i) => setItems(items.filter((_, j) => j !== i))} renderItem={(it, i) => (
            <>
              <MediaUpload label="صورة الشريحة" folder={`${folder}/carousel`} value={it.image_url ?? ""}
                onChange={(url) => updateItem(i, { image_url: url ?? "" })} />
              <BilingualText label="عنوان" valueAr={it.title_ar ?? ""} valueEn={it.title_en ?? ""}
                onAr={(v) => updateItem(i, { title_ar: v })} onEn={(v) => updateItem(i, { title_en: v })} />
              <BilingualText label="وصف" rows={2} valueAr={it.description_ar ?? ""} valueEn={it.description_en ?? ""}
                onAr={(v) => updateItem(i, { description_ar: v })} onEn={(v) => updateItem(i, { description_en: v })} />
              <div>
                <Label>رابط (اختياري)</Label>
                <Input dir="ltr" value={it.url ?? ""} onChange={(e) => updateItem(i, { url: e.target.value })} />
              </div>
            </>
          )} />
        </>
      )}

      {/* ===== video ===== */}
      {type === "video" && (
        <>
          {Common}
          <div>
            <Label>رابط الفيديو (YouTube / Vimeo / ملف)</Label>
            <Input dir="ltr" value={d.video_url ?? ""} onChange={(e) => set({ video_url: e.target.value })}
              placeholder="https://youtube.com/watch?v=..." />
          </div>
          <MediaUpload label="صورة غلاف (اختياري)" folder={`${folder}/video`} value={d.image_url ?? ""}
            onChange={(url) => set({ image_url: url ?? "" })} />
        </>
      )}

      {/* ===== accordion ===== */}
      {type === "accordion" && (
        <>
          {Common}
          <ItemsList items={items} onAddDefault={() => setItems([...items, { question_ar: "", question_en: "", answer_ar: "", answer_en: "" }])} onMove={move} onRemove={(i) => setItems(items.filter((_, j) => j !== i))} renderItem={(it, i) => (
            <>
              <BilingualText label="السؤال" valueAr={it.question_ar ?? ""} valueEn={it.question_en ?? ""}
                onAr={(v) => updateItem(i, { question_ar: v })} onEn={(v) => updateItem(i, { question_en: v })} />
              <BilingualRich label="الجواب" valueAr={it.answer_ar ?? ""} valueEn={it.answer_en ?? ""}
                onAr={(v) => updateItem(i, { answer_ar: v })} onEn={(v) => updateItem(i, { answer_en: v })} />
            </>
          )} />
        </>
      )}

      {/* ===== cta_banner ===== */}
      {type === "cta_banner" && (
        <>
          {Common}
          <BilingualRich label="النص" valueAr={d.content_ar ?? ""} valueEn={d.content_en ?? ""}
            onAr={(v) => set({ content_ar: v })} onEn={(v) => set({ content_en: v })} />
          <MediaUpload label="صورة الخلفية (اختياري)" folder={`${folder}/cta`} value={d.image_url ?? ""}
            onChange={(url) => set({ image_url: url ?? "" })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <BilingualText label="نص الزر الأساسي" valueAr={d.cta_label_ar ?? ""} valueEn={d.cta_label_en ?? ""}
              onAr={(v) => set({ cta_label_ar: v })} onEn={(v) => set({ cta_label_en: v })} />
            <div>
              <Label>رابط الزر الأساسي</Label>
              <Input dir="ltr" value={d.cta_url ?? ""} onChange={(e) => set({ cta_url: e.target.value })} />
            </div>
            <BilingualText label="نص الزر الثانوي" valueAr={d.secondary_cta_label_ar ?? ""} valueEn={d.secondary_cta_label_en ?? ""}
              onAr={(v) => set({ secondary_cta_label_ar: v })} onEn={(v) => set({ secondary_cta_label_en: v })} />
            <div>
              <Label>رابط الزر الثانوي</Label>
              <Input dir="ltr" value={d.secondary_cta_url ?? ""} onChange={(e) => set({ secondary_cta_url: e.target.value })} />
            </div>
          </div>
        </>
      )}

      {/* ===== rich_text ===== */}
      {type === "rich_text" && (
        <>
          {Common}
          <BilingualRich label="المحتوى" valueAr={d.content_ar ?? ""} valueEn={d.content_en ?? ""}
            onAr={(v) => set({ content_ar: v })} onEn={(v) => set({ content_en: v })} />
        </>
      )}
    </div>
  );
}

function ItemsList({
  items, onAddDefault, onMove, onRemove, renderItem,
}: {
  items: any[];
  onAddDefault: () => void;
  onMove: (i: number, dir: -1 | 1) => void;
  onRemove: (i: number) => void;
  renderItem: (it: any, i: number) => React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-lg border p-3 space-y-2 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">عنصر #{i + 1}</span>
            <div className="flex items-center gap-1">
              <Button type="button" size="icon" variant="ghost" onClick={() => onMove(i, -1)}><ArrowUp className="w-4 h-4" /></Button>
              <Button type="button" size="icon" variant="ghost" onClick={() => onMove(i, 1)}><ArrowDown className="w-4 h-4" /></Button>
              <Button type="button" size="icon" variant="ghost" onClick={() => onRemove(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
          {renderItem(it, i)}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={onAddDefault}>
        <Plus className="w-4 h-4 ml-1" />
        إضافة عنصر
      </Button>
    </div>
  );
}
