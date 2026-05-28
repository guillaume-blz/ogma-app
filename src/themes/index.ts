import dayTheme from "./day.json";
import nightTheme from "./night.json";

export type ThemeType = "light" | "dark";
export type ThemeMode = "light" | "dark" | "system";

export interface Theme {
  id: string;
  name: string;
  type: ThemeType;
  colors: Record<string, string>;
}

export const themes: Theme[] = [dayTheme as Theme, nightTheme as Theme];

export function getTheme(id: string): Theme | undefined {
  return themes.find((t) => t.id === id);
}

export function getThemesByType(type: ThemeType): Theme[] {
  return themes.filter((t) => t.type === type);
}
