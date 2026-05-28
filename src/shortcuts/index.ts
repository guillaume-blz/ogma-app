import shortcutsData from "./shortcuts.json";

export type ShortcutScope = "app" | "global";
export type ShortcutId = (typeof shortcutsData.shortcuts)[number]["id"];

export interface Shortcut {
  id: ShortcutId;
  mac: string;
  win: string;
  scope: ShortcutScope;
  labelKey: string;
}

export const shortcuts = shortcutsData.shortcuts as Shortcut[];

export function getShortcut(id: ShortcutId): Shortcut | undefined {
  return shortcuts.find((s) => s.id === id);
}

export function getShortcutsByScope(scope: ShortcutScope): Shortcut[] {
  return shortcuts.filter((s) => s.scope === scope);
}

const isMac = () =>
  typeof navigator !== "undefined" && /mac/i.test(navigator.userAgent);

export function getKeys(id: ShortcutId): string | undefined {
  const s = getShortcut(id);
  if (!s) return undefined;
  return isMac() ? s.mac : s.win;
}

export function formatDisplay(keys: string): string {
  if (isMac()) {
    return keys
      .replace("Meta+", "⌘")
      .replace("Shift+", "⇧")
      .replace("Alt+", "⌥")
      .replace("Ctrl+", "⌃");
  }
  return keys.replace("Meta+", "Win+");
}
