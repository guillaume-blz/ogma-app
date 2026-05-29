import type { ReactNode, MouseEvent } from "react";
import { PanelRightClose } from "lucide-react";
import { ResizablePanel } from "@/components/ui/resizable";
import { Tooltip } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useSidebarStore } from "@/stores/sidebarStore";
import { getKeys, formatDisplay } from "@/shortcuts";

interface SidebarProps {
  children?: ReactNode;
}

const isMacOS = navigator.platform.toLowerCase().includes("mac");

export function Sidebar({ children }: SidebarProps) {
  const appWindow = getCurrentWindow();
  const toggle = useSidebarStore((s) => s.toggle);

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
        className={`flex h-9 shrink-0 items-center select-none ${isMacOS ? "pl-[78px]" : "px-2"}`}
      >
        <Tooltip content={<>Toggle sidebar <Kbd>{formatDisplay(getKeys("toggle-sidebar") ?? "")}</Kbd></>} side="right">
          <button
            onClick={toggle}
            className="flex items-center justify-center rounded p-1.5 text-titlebar-foreground/50 hover:text-titlebar-foreground hover:bg-sidebar-accent transition-colors"
            aria-label="Close sidebar"
          >
            <PanelRightClose className="h-4 w-4 rotate-180" />
          </button>
        </Tooltip>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </ResizablePanel>
  );
}
