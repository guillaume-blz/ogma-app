import { type MouseEvent } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

type ResizeDirection = "East" | "North" | "NorthEast" | "NorthWest" | "South" | "SouthEast" | "SouthWest" | "West";

const EDGE = 6;

const handles: { dir: ResizeDirection; style: React.CSSProperties }[] = [
  { dir: "North",     style: { top: 0, left: EDGE, right: EDGE, height: EDGE, cursor: "n-resize" } },
  { dir: "South",     style: { bottom: 0, left: EDGE, right: EDGE, height: EDGE, cursor: "s-resize" } },
  { dir: "East",      style: { top: EDGE, right: 0, bottom: EDGE, width: EDGE, cursor: "e-resize" } },
  { dir: "West",      style: { top: EDGE, left: 0, bottom: EDGE, width: EDGE, cursor: "w-resize" } },
  { dir: "NorthEast", style: { top: 0, right: 0, width: EDGE, height: EDGE, cursor: "ne-resize" } },
  { dir: "NorthWest", style: { top: 0, left: 0, width: EDGE, height: EDGE, cursor: "nw-resize" } },
  { dir: "SouthEast", style: { bottom: 0, right: 0, width: EDGE, height: EDGE, cursor: "se-resize" } },
  { dir: "SouthWest", style: { bottom: 0, left: 0, width: EDGE, height: EDGE, cursor: "sw-resize" } },
];

export function WindowResizeEdges() {
  const onMouseDown = async (e: MouseEvent, dir: ResizeDirection) => {
    e.preventDefault();
    await getCurrentWindow().startResizeDragging(dir);
  };

  return (
    <>
      {handles.map(({ dir, style }) => (
        <div
          key={dir}
          onMouseDown={(e) => onMouseDown(e, dir)}
          style={{ position: "fixed", zIndex: 9999, ...style }}
        />
      ))}
    </>
  );
}
