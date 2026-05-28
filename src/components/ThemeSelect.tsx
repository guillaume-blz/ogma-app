import { useThemeStore } from "@/stores/themeStore";
import { getThemesByType } from "@/themes";
import type { ThemeType } from "@/themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ThemeSelectProps {
  type: ThemeType;
}

export function ThemeSelect({ type }: ThemeSelectProps) {
  const { lightThemeId, darkThemeId, setLightThemeId, setDarkThemeId } = useThemeStore();
  const themes = getThemesByType(type);
  const value = type === "light" ? lightThemeId : darkThemeId;
  const onChange = (id: string | null) => {
    if (id) (type === "light" ? setLightThemeId : setDarkThemeId)(id);
  };

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {themes.map((theme) => (
          <SelectItem key={theme.id} value={theme.id}>
            {theme.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
