import { useId } from "react";
import { useThemeStore } from "@/stores/themeStore";

const UI_FONT_OPTIONS = ["Inter", "Geist", "Roboto", "DM Sans", "Lato"];
const CODE_FONT_OPTIONS = ["JetBrains Mono", "Fira Code", "Source Code Pro", "IBM Plex Mono"];

interface FontSelectProps {
  type: "ui" | "code";
}

export function FontSelect({ type }: FontSelectProps) {
  const { uiFont, codeFont, setUiFont, setCodeFont } = useThemeStore();
  const listId = useId();

  const value = type === "ui" ? uiFont : codeFont;
  const setValue = type === "ui" ? setUiFont : setCodeFont;
  const options = type === "ui" ? UI_FONT_OPTIONS : CODE_FONT_OPTIONS;
  const fallback = type === "ui" ? "system-ui, sans-serif" : "monospace";
  const previewFamily = value ? `"${value}", ${fallback}` : fallback;

  return (
    <>
      <input
        list={listId}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="System Default"
        className="h-9 w-48 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
        style={{ fontFamily: previewFamily }}
      />
      <datalist id={listId}>
        {options.map((font) => (
          <option key={font} value={font} />
        ))}
      </datalist>
    </>
  );
}
