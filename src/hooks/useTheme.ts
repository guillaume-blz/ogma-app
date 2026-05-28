import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";
import { getTheme } from "@/themes";

function applyTheme(themeId: string, isDark: boolean) {
  const theme = getTheme(themeId);
  if (!theme) return;
  const root = document.documentElement;
  for (const [property, value] of Object.entries(theme.colors)) {
    root.style.setProperty(property, value);
  }
  root.classList.toggle("dark", isDark);
  root.classList.toggle("light", !isDark);
}

export function useTheme() {
  const { mode, lightThemeId, darkThemeId } = useThemeStore();

  useEffect(() => {
    function apply() {
      if (mode === "light") {
        applyTheme(lightThemeId, false);
      } else if (mode === "dark") {
        applyTheme(darkThemeId, true);
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        applyTheme(prefersDark ? darkThemeId : lightThemeId, prefersDark);
      }
    }

    apply();

    if (mode === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [mode, lightThemeId, darkThemeId]);
}
