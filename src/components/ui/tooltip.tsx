import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "right" | "bottom";
  className?: string;
}

export function Tooltip({ content, children, side = "bottom", className }: TooltipProps) {
  return (
    <div className={cn("relative group inline-flex", className)}>
      {children}
      <div
        className={cn(
          "absolute z-50 hidden group-hover:flex items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md pointer-events-none",
          side === "right" && "left-full ml-2 top-1/2 -translate-y-1/2",
          side === "bottom" && "top-full mt-1.5 left-1/2 -translate-x-1/2"
        )}
      >
        {content}
      </div>
    </div>
  );
}
