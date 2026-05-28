import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DatabaseConfigForm } from "./forms/DatabaseConfigForm";
import { useSourceStore } from "../store";
import type { Source, SourceType, DatabaseConfig } from "../types";

interface SourceDrawerProps {
  open: boolean;
  onClose: () => void;
  source?: Source; // defined = edit mode
}

const INITIAL_DB_CONFIG: Partial<DatabaseConfig> = {
  driver: "postgres",
  host: "localhost",
  port: 5432,
  database: "",
  username: "",
  password: "",
};

export function SourceDrawer({ open, onClose, source }: SourceDrawerProps) {
  const { createSource, updateSource, testSource } = useSourceStore();
  const isEdit = !!source;

  const [name, setName] = useState(source?.name ?? "");
  const [sourceType] = useState<SourceType>(source?.source_type ?? "database");
  const [config, setConfig] = useState<Partial<DatabaseConfig>>(
    (source?.config as Partial<DatabaseConfig>) ?? INITIAL_DB_CONFIG
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await updateSource(source.id, name, config as DatabaseConfig);
      } else {
        await createSource(name, sourceType, config as DatabaseConfig);
      }
      onClose();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!source) throw new Error("Save first before testing");
    await testSource(source.id);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        <Dialog.Popup
          className={cn(
            "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col",
            "border-l border-border bg-background shadow-xl outline-none",
            "data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full",
            "transition-transform duration-200"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Dialog.Title className="text-sm font-semibold text-foreground">
              {isEdit ? "Edit source" : "New source"}
            </Dialog.Title>
            <Dialog.Close className="flex size-6 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground transition-colors">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <input
                className={cn(
                  "h-8 w-full rounded-md border border-input bg-background px-3 text-sm",
                  "placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                )}
                placeholder="My database"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Config form */}
            <DatabaseConfigForm
              value={config}
              onChange={setConfig}
              onTest={isEdit ? handleTest : undefined}
            />

            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
            <Dialog.Close
              className={cn(
                "rounded-md border border-border px-4 py-1.5 text-sm",
                "text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              )}
            >
              Cancel
            </Dialog.Close>
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground",
                "hover:opacity-90 transition-opacity disabled:opacity-50"
              )}
            >
              {saving ? "Saving…" : isEdit ? "Save" : "Create"}
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
