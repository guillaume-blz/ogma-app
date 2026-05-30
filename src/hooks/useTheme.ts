import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useThemeStore } from "@/stores/themeStore";
import { getTheme } from "@/themes";

const GOOGLE_FONTS_URLS: Record<string, string> = {
  "Inter": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
  "Roboto": "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
  "DM Sans": "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap",
  "Lato": "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap",
  "JetBrains Mono": "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap",
  "Fira Code": "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap",
  "Source Code Pro": "https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500&display=swap",
  "IBM Plex Mono": "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap",
};

// Geist is already bundled via @fontsource-variable/geist
const BUNDLED_FONTS: Record<string, string> = {
  "Geist": '"Geist Variable"',
};

function loadGoogleFont(fontName: string) {
  if (!fontName || !GOOGLE_FONTS_URLS[fontName]) return;
  const id = `gfont-${fontName.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = GOOGLE_FONTS_URLS[fontName];
  document.head.appendChild(link);
}

function getFontFamily(fontName: string, fallback: string): string {
  if (!fontName) return fallback;
  const bundled = BUNDLED_FONTS[fontName];
  return bundled ? `${bundled}, ${fallback}` : `"${fontName}", ${fallback}`;
}

function applyTheme(themeId: string, isDark: boolean) {
  const theme = getTheme(themeId);
  if (!theme) return;
  const root = document.documentElement;
  for (const [property, value] of Object.entries(theme.colors)) {
    root.style.setProperty(property, value);
  }
  root.classList.toggle("dark", isDark);
  root.classList.toggle("light", !isDark);
  invoke("set_window_theme", { theme: isDark ? "dark" : "light" }).catch(() => {});
}

export function useTheme() {
  const { mode, lightThemeId, darkThemeId, uiFont, codeFont } = useThemeStore();

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

  useEffect(() => {
    loadGoogleFont(uiFont);
    loadGoogleFont(codeFont);
    const root = document.documentElement;
    root.style.setProperty("--font-ui", getFontFamily(uiFont, "system-ui, sans-serif"));
    root.style.setProperty("--font-code", getFontFamily(codeFont, "monospace"));
  }, [uiFont, codeFont]);
}
