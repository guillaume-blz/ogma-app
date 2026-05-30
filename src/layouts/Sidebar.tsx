import type { ReactNode, MouseEvent, Ref } from "react";
import { Panel } from "react-resizable-panels";
import type { PanelImperativeHandle } from "react-resizable-panels";
import { PanelRightClose } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getKeys, formatDisplay } from "@/shortcuts";
import {useSidebarStore} from "@/stores/sidebarStore.ts";

interface SidebarProps {
  children?: ReactNode;
  panelRef?: Ref<PanelImperativeHandle>;
  onCollapse?: () => void;
  onExpand?: () => void;
}

const isMacOS = navigator.platform.toLowerCase().includes("mac");

export function Sidebar({ children, panelRef, onCollapse, onExpand }: SidebarProps) {
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
    <Panel
      ref={panelRef}
      defaultSize={240}
      minSize={200}
      maxSize={300}
      collapsible
      collapsedSize={0}
      onCollapse={onCollapse}
      onExpand={onExpand}
      style={{ transition: "flex-basis 250ms ease-out" }}
      className="flex flex-col bg-transparent h-full overflow-hidden"
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
    </Panel>
  );
}
