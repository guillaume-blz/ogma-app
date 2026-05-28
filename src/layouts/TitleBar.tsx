import { type MouseEvent } from "react";
import { X, Minus, Square } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useTranslation } from "react-i18next";

export function TitleBar() {
  const appWindow = getCurrentWindow();
  const { t } = useTranslation();

  const onDragStart = (e: MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.tauriDragRegion !== undefined) {
      appWindow.startDragging();
    }
  };

  return (
    <header
      data-tauri-drag-region
      onMouseDown={onDragStart}
      className="flex h-9 shrink-0 items-center justify-between bg-titlebar border-b border-border select-none"
    >
      <div
        data-tauri-drag-region
        className="flex items-center gap-2 px-3 h-full"
      >
        <span className="text-xs font-semibold tracking-wide text-titlebar-foreground">
          Ogma
        </span>
      </div>

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
    </header>
  );
}
