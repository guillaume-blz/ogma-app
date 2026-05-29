import * as React from "react";
import { cn } from "@/lib/utils";

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex h-5 items-center rounded border border-border bg-muted px-1 font-mono text-[0.65rem] font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export { Kbd };
