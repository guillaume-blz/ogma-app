import type { ReactNode, MouseEvent } from "react";
import { ResizablePanel } from "@/components/ui/resizable";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface SidebarProps {
  children?: ReactNode;
}

const isMacOS = navigator.platform.toLowerCase().includes("mac");

export function Sidebar({ children }: SidebarProps) {
  const appWindow = getCurrentWindow();

  const onDragStart = (e: MouseEvent) => {
    if (
      e.target === e.currentTarget ||
      (e.target as HTMLElement).dataset.tauriDragRegion !== undefined
    ) {
      appWindow.startDragging();
    }
  };

  return (
    <ResizablePanel
      defaultSize={20}
      minSize={240}
      maxSize={340}
      className="flex flex-col bg-sidebar h-full overflow-hidden"
    >
      <div
        data-tauri-drag-region
        onMouseDown={onDragStart}
        className={`flex h-9 shrink-0 items-center select-none ${isMacOS ? "pl-[78px]" : "px-3"}`}
      >
        <span
          data-tauri-drag-region
          className="text-xs font-semibold tracking-wide text-titlebar-foreground"
        >
          Ogma
        </span>
      </div>
      {children}
    </ResizablePanel>
  );
}
