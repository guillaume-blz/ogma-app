import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DatabaseConfigForm } from "../forms/DatabaseConfigForm";
import { useSourceStore } from "../../store";
import type { DatabaseConfig, Source } from "../../types";

export function SettingsTab({ source }: { source: Source }) {
  const { updateSource } = useSourceStore();
  const [name, setName] = useState(source.name);
  const [config, setConfig] = useState<Partial<DatabaseConfig>>(
    source.config as Partial<DatabaseConfig>
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError(null);
    try {
      await updateSource(source.id, name, config as DatabaseConfig);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md space-y-5">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={cn(
            "h-8 w-full rounded-md border border-input bg-background px-3 text-sm",
            "placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          )}
        />
      </div>

      <DatabaseConfigForm value={config} onChange={setConfig} />

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-green-500">
            <CheckCircle2 className="size-3" /> Saved
          </span>
        )}
      </div>
    </div>
  );
}
