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
import { CommandPalette } from "@/components/CommandPalette";

export function AppLayout() {
  useTheme();
  useShortcutInit();

  const toggle = useCommandPaletteStore((s) => s.toggle);
  useShortcut("command-palette", toggle);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <WindowResizeEdges />
      <ResizablePanelGroup orientation="horizontal" className="h-full overflow-hidden">
        <Sidebar>
          <SidebarNav />
        </Sidebar>
        <ResizableHandle withHandle />
        <MainContent />
      </ResizablePanelGroup>
      <CommandPalette />
    </div>
  );
}
