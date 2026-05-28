import type { ReactNode } from "react";
import { TitleBar } from "./TitleBar";
import { Sidebar } from "./Sidebar";
import { MainContent } from "./MainContent";
import {
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";

interface AppLayoutProps {
  sidebar?: ReactNode;
  children: ReactNode;
}

export function AppLayout({ sidebar, children }: AppLayoutProps) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <TitleBar />
      <ResizablePanelGroup orientation="horizontal" className="flex-1 overflow-hidden">
        <Sidebar>{sidebar}</Sidebar>
        <ResizableHandle withHandle />
        <MainContent>{children}</MainContent>
      </ResizablePanelGroup>
    </div>
  );
}
