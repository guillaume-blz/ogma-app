import { TitleBar } from "./TitleBar";
import { Sidebar } from "./Sidebar";
import { MainContent } from "./MainContent";
import { WindowResizeEdges } from "./WindowResizeEdges";
import { SidebarNav } from "./SidebarNav";
import {
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useTheme } from "@/hooks/useTheme";

export function AppLayout() {
  useTheme();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <WindowResizeEdges />
      <TitleBar />
      <ResizablePanelGroup orientation="horizontal" className="flex-1 overflow-hidden">
        <Sidebar>
          <SidebarNav />
        </Sidebar>
        <ResizableHandle withHandle />
        <MainContent />
      </ResizablePanelGroup>
    </div>
  );
}
