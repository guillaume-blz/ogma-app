import { useEffect, useRef } from "react";
import { getShortcut, getKeys } from "@/shortcuts";
import type { ShortcutId } from "@/shortcuts";

function matchesKeys(event: KeyboardEvent, keys: string): boolean {
  const parts = keys.split("+");
  const key = parts[parts.length - 1].toLowerCase();
  const modifiers = parts.slice(0, -1).map((m) => m.toLowerCase());

  return (
    event.key.toLowerCase() === key &&
    event.metaKey === modifiers.includes("cmd") &&
    event.ctrlKey === modifiers.includes("ctrl") &&
    event.shiftKey === modifiers.includes("shift") &&
    event.altKey === modifiers.includes("alt")
  );
}

export function useShortcut(id: ShortcutId, handler: () => void) {
  const shortcut = getShortcut(id);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!shortcut) return;

    if (shortcut.scope === "app") {
      const keys = getKeys(id);
      if (!keys) return;

      const onKeyDown = (event: KeyboardEvent) => {
        if (matchesKeys(event, keys)) {
          event.preventDefault();
          handlerRef.current();
        }
      };

      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }

    if (shortcut.scope === "global") {
      // Listens for the custom event dispatched by useShortcutInit
      const onShortcut = () => handlerRef.current();
      window.addEventListener(`shortcut:${id}`, onShortcut);
      return () => window.removeEventListener(`shortcut:${id}`, onShortcut);
    }
  }, [id, shortcut]);
}
