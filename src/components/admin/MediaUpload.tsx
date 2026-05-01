import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function MediaUpload({
  value,
  onChange,
  bucket = "site-media",
  folder = "general",
  label = "الصورة",
  accept = "image/*",
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  bucket?: "site-media" | "documents";
  folder?: string;
  label?: string;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("تم رفع الملف");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const isImage = !accept.includes("pdf");

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value ? (
        <div className="relative inline-block">
          {isImage ? (
            <img src={value} alt="" className="h-32 w-32 object-cover rounded-lg border" />
          ) : (
            <div className="h-20 px-4 flex items-center gap-2 rounded-lg border bg-muted/30 text-sm">
              <span className="truncate max-w-xs" dir="ltr">{value.split("/").pop()}</span>
            </div>
          )}
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute -top-2 -left-2 h-6 w-6 rounded-full"
            onClick={() => onChange(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 ml-2" />
          )}
          {uploading ? "جاري الرفع..." : "رفع ملف"}
        </Button>
      )}
      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFile}
      />
      {value && (
        <Input
          dir="ltr"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-xs font-mono"
          placeholder="رابط الصورة"
        />
      )}
    </div>
  );
}
