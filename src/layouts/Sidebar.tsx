import type { ReactNode } from "react";
import { ResizablePanel } from "@/components/ui/resizable";

interface SidebarProps {
  children?: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <ResizablePanel
      defaultSize={20}
      minSize={12}
      maxSize={260}
      className="flex flex-col bg-sidebar border-r border-sidebar-border h-full overflow-hidden"
    >
      {children}
    </ResizablePanel>
  );
}
