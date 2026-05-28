import { cn } from "@/lib/utils";
import { getKeys, formatDisplay } from "@/shortcuts";
import type { ShortcutId } from "@/shortcuts";

interface ShortcutBadgeProps {
  id: ShortcutId;
  className?: string;
}

export function ShortcutBadge({ id, className }: ShortcutBadgeProps) {
  const keys = getKeys(id);
  if (!keys) return null;

  return (
    <kbd
      className={cn(
        "inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground",
        className
      )}
    >
      {formatDisplay(keys)}
    </kbd>
  );
}
