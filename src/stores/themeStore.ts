import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode } from "@/themes";

interface ThemeStore {
  mode: ThemeMode;
  lightThemeId: string;
  darkThemeId: string;
  setMode: (mode: ThemeMode) => void;
  setLightThemeId: (id: string) => void;
  setDarkThemeId: (id: string) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: "system",
      lightThemeId: "day",
      darkThemeId: "night",
      setMode: (mode) => set({ mode }),
      setLightThemeId: (lightThemeId) => set({ lightThemeId }),
      setDarkThemeId: (darkThemeId) => set({ darkThemeId }),
    }),
    { name: "ogma-theme" }
  )
);
