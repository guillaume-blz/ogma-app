import type { ReactNode } from "react";
import { ResizablePanel } from "@/components/ui/resizable";

interface MainContentProps {
  children?: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <ResizablePanel defaultSize={80} className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </ResizablePanel>
  );
}
