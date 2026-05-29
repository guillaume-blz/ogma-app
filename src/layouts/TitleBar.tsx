import { type MouseEvent } from "react";
import { X, Minus, Square, Search } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useTranslation } from "react-i18next";
import { useCommandPaletteStore } from "@/stores/commandPaletteStore";
import { Kbd } from "@/components/ui/kbd";

const isMacOS = navigator.platform.toLowerCase().includes("mac");
const shortcutLabel = isMacOS ? "⌘K" : "Ctrl K";

export function TitleBar() {
  const appWindow = getCurrentWindow();
  const { t } = useTranslation();
  const openPalette = useCommandPaletteStore((s) => s.toggle);

  const onDragStart = (e: MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.tauriDragRegion !== undefined) {
      appWindow.startDragging();
    }
  };

  return (
    <header
      data-tauri-drag-region
      onMouseDown={onDragStart}
      className="relative flex h-9 shrink-0 items-center justify-between bg-titlebar border-b border-border select-none"
    >
      <div
        data-tauri-drag-region
        className={`flex items-center gap-2 h-full ${isMacOS ? "pl-[78px]" : "px-3"}`}
      >
        <span className="text-xs font-semibold tracking-wide text-titlebar-foreground">
          Ogma
        </span>
      </div>

      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={openPalette}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 h-6 w-52 rounded-md border border-border/60 bg-background/20 px-2 text-xs text-titlebar-foreground/50 hover:bg-background/40 hover:text-titlebar-foreground/70 transition-colors"
        aria-label="Open search"
      >
        <Search className="size-3 shrink-0" />
        <span className="flex-1 text-left">Search…</span>
        <Kbd className="opacity-60">{shortcutLabel}</Kbd>
      </button>

      {!isMacOS && (
        <div className="flex h-full">
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
