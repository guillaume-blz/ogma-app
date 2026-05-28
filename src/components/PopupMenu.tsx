import type { ReactNode } from "react";
import { ContextMenu } from "@base-ui/react/context-menu";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShortcutBadge } from "@/components/ShortcutBadge";
import type { ShortcutId } from "@/shortcuts";

export interface PopupMenuItemConfig {
  icon?: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  shortcutId?: ShortcutId;
}

interface PopupMenuProps {
  children: ReactNode;
  items: PopupMenuItemConfig[];
}

export function PopupMenu({ children, items }: PopupMenuProps) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger className="contents">
        {children}
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner className="z-50 outline-none">
          <ContextMenu.Popup className="min-w-[200px] rounded-lg border border-border bg-popover py-1 shadow-lg outline-none">
            {items.map((item, i) => (
              <ContextMenu.Item
                key={i}
                onClick={item.onClick}
                disabled={item.disabled}
                className={cn(
                  "mx-1 flex cursor-default items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm outline-none",
                  "text-popover-foreground transition-colors select-none",
                  "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-40"
                )}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  {item.icon && <item.icon className="h-4 w-4" />}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.shortcutId && (
                  <ShortcutBadge id={item.shortcutId} />
                )}
              </ContextMenu.Item>
            ))}
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
