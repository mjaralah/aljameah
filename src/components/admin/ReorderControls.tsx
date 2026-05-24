// Alternative reorder controls (besides drag-and-drop) for admin list rows.
// Provides: move up/down arrows, direct position number input, and a "move to" menu.
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronUp, ChevronDown, MoveVertical } from "lucide-react";

export type ReorderControlsProps = {
  position: number;     // 1-based current index within the visible list
  total: number;        // total visible items
  /** Names of other items (id + label) to enable "before/after specific item" actions */
  others?: { id: string; label: string }[];
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSetPosition: (pos: number) => void;
  onMoveToStart: () => void;
  onMoveToEnd: () => void;
  onMoveRelative?: (targetId: string, where: "before" | "after") => void;
  disabled?: boolean;
};

export function ReorderControls({
  position, total, others = [],
  onMoveUp, onMoveDown, onSetPosition,
  onMoveToStart, onMoveToEnd, onMoveRelative,
  disabled,
}: ReorderControlsProps) {
  const [val, setVal] = useState(String(position));
  useEffect(() => { setVal(String(position)); }, [position]);

  function commit() {
    const n = Math.max(1, Math.min(total, Number(val) || position));
    if (n !== position) onSetPosition(n);
    else setVal(String(position));
  }

  const isFirst = position <= 1;
  const isLast = position >= total;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1 shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button" size="icon" variant="outline"
              className="h-8 w-8" disabled={disabled || isFirst}
              onClick={onMoveUp} aria-label="تحريك لأعلى"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>تحريك لأعلى</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button" size="icon" variant="outline"
              className="h-8 w-8" disabled={disabled || isLast}
              onClick={onMoveDown} aria-label="تحريك لأسفل"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>تحريك لأسفل</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Input
              type="number" min={1} max={total} value={val} disabled={disabled}
              onChange={(e) => setVal(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLInputElement).blur(); } }}
              className="h-8 w-14 text-center px-1 text-xs"
              aria-label={`الموقع الحالي ${position} من ${total}`}
            />
          </TooltipTrigger>
          <TooltipContent>الموقع (من 1 إلى {total})</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button" size="icon" variant="outline"
                  className="h-8 w-8" disabled={disabled}
                  aria-label="نقل إلى…"
                >
                  <MoveVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>نقل إلى…</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="max-h-80 overflow-auto">
            <DropdownMenuItem disabled={isFirst} onClick={onMoveToStart}>
              نقل إلى البداية
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isLast} onClick={onMoveToEnd}>
              نقل إلى النهاية
            </DropdownMenuItem>
            {onMoveRelative && others.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs">قبل عنصر…</DropdownMenuLabel>
                {others.map((o) => (
                  <DropdownMenuItem key={`b-${o.id}`} onClick={() => onMoveRelative(o.id, "before")}>
                    <span className="truncate max-w-[14rem]">{o.label}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs">بعد عنصر…</DropdownMenuLabel>
                {others.map((o) => (
                  <DropdownMenuItem key={`a-${o.id}`} onClick={() => onMoveRelative(o.id, "after")}>
                    <span className="truncate max-w-[14rem]">{o.label}</span>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}
