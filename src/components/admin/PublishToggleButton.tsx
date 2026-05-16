// زر موحّد لنشر/إخفاء عنصر في أي جدول من جداول لوحة التحكم.
// يتعامل مباشرة مع Supabase ويعرض Tooltip توضيحياً.
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

type AdminTable =
  | "news" | "programs" | "partners" | "hero_slides" | "board_members"
  | "custom_forms" | "surveys" | "custom_pages" | "legal_pages"
  | "governance_documents" | "about_content" | "page_content";

export function PublishToggleButton({
  table, id, published, onToggled, size = "icon",
}: {
  table: AdminTable;
  id: string;
  published: boolean;
  onToggled?: (next: boolean) => void;
  size?: "icon" | "sm";
}) {
  const [busy, setBusy] = useState(false);
  async function toggle() {
    setBusy(true);
    const next = !published;
    const { error } = await supabase.from(table).update({ published: next }).eq("id", id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(next ? "تم النشر" : "تم الإخفاء");
    onToggled?.(next);
  }
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size={size === "icon" ? "icon" : "sm"}
            variant="ghost"
            className={size === "icon" ? "h-8 w-8" : ""}
            onClick={(e) => { e.stopPropagation(); toggle(); }}
            disabled={busy}
            aria-label={published ? "إخفاء" : "نشر"}
          >
            {published
              ? <Eye className="w-4 h-4 text-emerald-600" />
              : <EyeOff className="w-4 h-4 text-muted-foreground" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{published ? "إخفاء" : "نشر"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
