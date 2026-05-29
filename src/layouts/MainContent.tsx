import { Outlet } from "react-router-dom";
import { ResizablePanel } from "@/components/ui/resizable";
import { TitleBar } from "./TitleBar";

export function MainContent() {
  return (
    <ResizablePanel defaultSize={80} className="flex flex-col h-full overflow-hidden">
      <TitleBar />
      <div className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </div>
    </ResizablePanel>
  );
}
