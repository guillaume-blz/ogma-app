import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { PanelImperativeHandle } from "react-resizable-panels";
import { Sidebar } from "./Sidebar";
import { MainContent } from "./MainContent";
import { WindowResizeEdges } from "./WindowResizeEdges";
import { SidebarNav } from "./SidebarNav";
import {
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useTheme } from "@/hooks/useTheme";
import { useShortcutInit } from "@/hooks/useShortcutInit";
import { useShortcut } from "@/hooks/useShortcut";
import { useCommandPaletteStore } from "@/stores/commandPaletteStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useTabStore } from "@/stores/tabStore";
import { CommandPalette } from "@/components/CommandPalette";

export function AppLayout() {
  useTheme();
  useShortcutInit();

  const navigate = useNavigate();
  const addTab = useTabStore((s) => s.addTab);

  const toggle = useCommandPaletteStore((s) => s.toggle);
  useShortcut("command-palette", toggle);

  const sidebarPanelRef = useRef<PanelImperativeHandle>(null);
  const sidebarOpen = useSidebarStore((s) => s.open);
  const setOpen = useSidebarStore((s) => s.setOpen);
  const toggleSidebar = useSidebarStore((s) => s.toggle);
  useShortcut("toggle-sidebar", toggleSidebar);

  useEffect(() => {
    const panel = sidebarPanelRef.current;
    if (!panel) return;
    if (sidebarOpen && panel.isCollapsed()) panel.expand();
    else if (!sidebarOpen && !panel.isCollapsed()) panel.collapse();
  }, [sidebarOpen]);

  useShortcut("open-settings", () => {
    addTab({ id: "settings", path: "/settings" });
    navigate("/settings");
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <WindowResizeEdges />
      <ResizablePanelGroup orientation="horizontal" className="h-full overflow-hidden">
        {sidebarOpen && (
          <>
            <Sidebar
              panelRef={sidebarPanelRef}
              onCollapse={() => setOpen(false)}
              onExpand={() => setOpen(true)}
            >
              <SidebarNav />
            </Sidebar>
          </>
        )}
        <ResizableHandle withHandle className="bg-transparent" />
        <MainContent />
      </ResizablePanelGroup>
      <CommandPalette />
    </div>
  );
}
