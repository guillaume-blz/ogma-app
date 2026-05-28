import { useEffect } from "react";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { getShortcutsByScope } from "@/shortcuts";

const isMac = () => /mac/i.test(navigator.userAgent);

export function useShortcutInit() {
  useEffect(() => {
    const globalShortcuts = getShortcutsByScope("global");
    const registeredKeys: string[] = [];

    const init = async () => {
      for (const shortcut of globalShortcuts) {
        const keys = isMac() ? shortcut.mac : shortcut.win;
        try {
          await register(keys, () => {
            window.dispatchEvent(new CustomEvent(`shortcut:${shortcut.id}`));
          });
          registeredKeys.push(keys);
        } catch (e) {
          console.warn(`Failed to register global shortcut "${shortcut.id}":`, e);
        }
      }
    };

    const promise = init();

    return () => {
      promise.then(() => {
        registeredKeys.forEach((keys) => unregister(keys).catch(() => {}));
      });
    };
  }, []);
}
