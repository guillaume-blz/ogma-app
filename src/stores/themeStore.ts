import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode } from "@/themes";

interface ThemeStore {
  mode: ThemeMode;
  lightThemeId: string;
  darkThemeId: string;
  uiFont: string;
  codeFont: string;
  setMode: (mode: ThemeMode) => void;
  setLightThemeId: (id: string) => void;
  setDarkThemeId: (id: string) => void;
  setUiFont: (font: string) => void;
  setCodeFont: (font: string) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: "system",
      lightThemeId: "day",
      darkThemeId: "night",
      uiFont: "",
      codeFont: "",
      setMode: (mode) => set({ mode }),
      setLightThemeId: (lightThemeId) => set({ lightThemeId }),
      setDarkThemeId: (darkThemeId) => set({ darkThemeId }),
      setUiFont: (uiFont) => set({ uiFont }),
      setCodeFont: (codeFont) => set({ codeFont }),
    }),
    { name: "ogma-theme" }
  )
);
