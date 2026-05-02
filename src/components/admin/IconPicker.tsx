// منتقي أيقونات مرئي مبسّط — يعرض الأيقونات الشائعة مع بحث
import { useState } from "react";
import {
  Heart, ShieldCheck, Handshake, Lightbulb, Star, Award, Target, Users, Sparkles,
  HandHeart, BookOpen, Globe, Compass, Flag, Trophy, Smile, Sun, Leaf, Gem,
  CheckCircle2, ThumbsUp, Eye, Brain, Rocket, Zap, Crown, Gift,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

const ICONS: { name: string; Icon: LucideIcon }[] = [
  { name: "Heart", Icon: Heart },
  { name: "ShieldCheck", Icon: ShieldCheck },
  { name: "Handshake", Icon: Handshake },
  { name: "Lightbulb", Icon: Lightbulb },
  { name: "Star", Icon: Star },
  { name: "Award", Icon: Award },
  { name: "Target", Icon: Target },
  { name: "Users", Icon: Users },
  { name: "Sparkles", Icon: Sparkles },
  { name: "HandHeart", Icon: HandHeart },
  { name: "BookOpen", Icon: BookOpen },
  { name: "Globe", Icon: Globe },
  { name: "Compass", Icon: Compass },
  { name: "Flag", Icon: Flag },
  { name: "Trophy", Icon: Trophy },
  { name: "Smile", Icon: Smile },
  { name: "Sun", Icon: Sun },
  { name: "Leaf", Icon: Leaf },
  { name: "Gem", Icon: Gem },
  { name: "CheckCircle2", Icon: CheckCircle2 },
  { name: "ThumbsUp", Icon: ThumbsUp },
  { name: "Eye", Icon: Eye },
  { name: "Brain", Icon: Brain },
  { name: "Rocket", Icon: Rocket },
  { name: "Zap", Icon: Zap },
  { name: "Crown", Icon: Crown },
  { name: "Gift", Icon: Gift },
];

export function IconPicker({ value, onChange }: { value?: string; onChange: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const Selected = ICONS.find((i) => i.name === value)?.Icon;
  const filtered = q ? ICONS.filter((i) => i.name.toLowerCase().includes(q.toLowerCase())) : ICONS;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="w-full justify-start gap-2 h-10">
          {Selected ? <Selected className="w-4 h-4 text-primary" /> : <Sparkles className="w-4 h-4 text-muted-foreground" />}
          <span className="text-sm">{value || "اختر أيقونة"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <Input placeholder="بحث..." value={q} onChange={(e) => setQ(e.target.value)} className="mb-2 h-8" />
        <div className="grid grid-cols-6 gap-1 max-h-64 overflow-y-auto">
          {filtered.map(({ name, Icon }) => (
            <button
              key={name}
              type="button"
              title={name}
              onClick={() => { onChange(name); setOpen(false); }}
              className={`aspect-square flex items-center justify-center rounded-md border transition-colors hover:bg-accent ${
                value === name ? "border-primary bg-primary/10" : "border-border"
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
