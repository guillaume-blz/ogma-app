import { cn } from "@/lib/utils";
import { getKeys, formatDisplay } from "@/shortcuts";
import type { ShortcutId } from "@/shortcuts";
import { Kbd } from "@/components/ui/kbd";

interface ShortcutBadgeProps {
  id: ShortcutId;
  className?: string;
}

export function ShortcutBadge({ id, className }: ShortcutBadgeProps) {
  const keys = getKeys(id);
  if (!keys) return null;

  return (
    <Kbd className={cn("px-1.5 py-0.5 text-xs", className)}>
      {formatDisplay(keys)}
    </Kbd>
  );
}
