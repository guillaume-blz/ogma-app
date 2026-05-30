import { type MouseEvent } from "react";
import { X, Minus, Square, PanelRightOpen } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useTranslation } from "react-i18next";
import { TabBar } from "@/components/TabBar";
import { useSidebarStore } from "@/stores/sidebarStore";
import { getKeys, formatDisplay } from "@/shortcuts";

const isMacOS = navigator.platform.toLowerCase().includes("mac");

export function TitleBar() {
  const appWindow = getCurrentWindow();
  const { t } = useTranslation();
  const sidebarOpen = useSidebarStore((s) => s.open);
  const toggleSidebar = useSidebarStore((s) => s.toggle);

  const onDragStart = (e: MouseEvent) => {
    if (
      e.target === e.currentTarget ||
      (e.target as HTMLElement).dataset.tauriDragRegion !== undefined
    ) {
      appWindow.startDragging();
    }
  };

  return (
    <header
      data-tauri-drag-region
      onMouseDown={onDragStart}
      className="flex h-9 shrink-0 items-end bg-titlebar border-b border-border select-none"
    >
      {!sidebarOpen && (
        <div className={`flex h-full shrink-0 items-center ${isMacOS ? "pl-[78px] pr-1" : "pl-1"}`}>
          <Tooltip content={<>Toggle sidebar <Kbd>{formatDisplay(getKeys("toggle-sidebar") ?? "")}</Kbd></>} side="bottom">
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center rounded p-1.5 text-titlebar-foreground/50 hover:text-titlebar-foreground hover:bg-sidebar-accent transition-colors"
              aria-label="Toggle sidebar"
            >
              <PanelRightOpen className="h-4 w-4 rotate-180" />
            </button>
          </Tooltip>
        </div>
      )}
      <TabBar className="flex-1 shrink h-full bg-transparent border-none" dragRegion />
      {!isMacOS && (
        <div className="flex h-full shrink-0">
          <button
            onClick={() => appWindow.minimize()}
            className="flex h-full w-11 items-center justify-center text-titlebar-foreground hover:bg-border/60 transition-colors"
            aria-label={t("window.minimize")}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => appWindow.toggleMaximize()}
            className="flex h-full w-11 items-center justify-center text-titlebar-foreground hover:bg-border/60 transition-colors"
            aria-label={t("window.maximize")}
          >
            <Square className="h-3 w-3" />
          </button>
          <button
            onClick={() => appWindow.close()}
            className="flex h-full w-11 items-center justify-center text-titlebar-foreground hover:bg-destructive hover:text-white transition-colors"
            aria-label={t("window.close")}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </header>
  );
}
