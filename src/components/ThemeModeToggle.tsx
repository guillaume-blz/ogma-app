import { Sun, Moon, Monitor } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import type { ThemeMode } from "@/themes";

const MODES: { value: ThemeMode; icon: React.ReactNode }[] = [
  { value: "light", icon: <Sun className="size-4" /> },
  { value: "system", icon: <Monitor className="size-4" /> },
  { value: "dark", icon: <Moon className="size-4" /> },
];

export function ThemeModeToggle() {
  const { mode, setMode } = useThemeStore();

  return (
    <div className="flex rounded-md border border-border overflow-hidden">
      {MODES.map(({ value, icon }) => (
        <button
          key={value}
          onClick={() => setMode(value)}
          className={`flex items-center justify-center px-3 py-1.5 transition-colors ${
            mode === value
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
