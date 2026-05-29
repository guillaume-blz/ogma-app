import { useState } from "react";
import { Plug, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { DatabaseConfig, DatabaseDriver } from "../../types";
import { SshTunnelForm } from "./SshTunnelForm";

const DEFAULT_PORTS: Record<DatabaseDriver, number> = {
  postgres: 5432,
  mysql: 3306,
  sqlite: 0,
};

interface DatabaseConfigFormProps {
  value: Partial<DatabaseConfig>;
  onChange: (config: Partial<DatabaseConfig>) => void;
  onTest?: () => Promise<void>;
}

export function DatabaseConfigForm({ value, onChange, onTest }: DatabaseConfigFormProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "error" | null>(null);

  const set = (patch: Partial<DatabaseConfig>) => onChange({ ...value, ...patch });

  const handleDriverChange = (driver: DatabaseDriver) =>
    set({ driver, port: DEFAULT_PORTS[driver] });

  const handleTest = async () => {
    if (!onTest) return;
    setTesting(true);
    setTestResult(null);
    try {
      await onTest();
      setTestResult("ok");
    } catch {
      setTestResult("error");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Field label="Driver">
        <Select
          value={value.driver ?? "postgres"}
          onValueChange={(v) => v && handleDriverChange(v as DatabaseDriver)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="postgres">PostgreSQL</SelectItem>
            <SelectItem value="mysql">MySQL</SelectItem>
            <SelectItem value="sqlite">SQLite</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      {value.driver !== "sqlite" && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field label="Host">
                <Input
                  placeholder="localhost"
                  value={value.host ?? ""}
                  onChange={(e) => set({ host: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Port">
              <Input
                type="number"
                placeholder="5432"
                value={value.port ?? ""}
                onChange={(e) => set({ port: Number(e.target.value) })}
              />
            </Field>
          </div>

          <Field label="Database">
            <Input
              placeholder="my_database"
              value={value.database ?? ""}
              onChange={(e) => set({ database: e.target.value })}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Username">
              <Input
                placeholder="postgres"
                value={value.username ?? ""}
                onChange={(e) => set({ username: e.target.value })}
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                placeholder="••••••••"
                value={value.password ?? ""}
                onChange={(e) => set({ password: e.target.value })}
              />
            </Field>
          </div>
        </>
      )}

      {value.driver === "sqlite" && (
        <Field label="File path">
          <Input
            placeholder="/path/to/database.sqlite"
            value={value.host ?? ""}
            onChange={(e) => set({ host: e.target.value })}
          />
        </Field>
      )}

      {onTest && (
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className={cn(
              "flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm",
              "text-muted-foreground transition-colors hover:text-foreground hover:bg-muted",
              "disabled:opacity-50"
            )}
          >
            {testing ? <Loader2 className="size-3.5 animate-spin" /> : <Plug className="size-3.5" />}
            Test connection
          </button>
          {testResult === "ok" && (
            <span className="text-xs text-green-500">Connected</span>
          )}
          {testResult === "error" && (
            <span className="text-xs text-destructive">Connection failed</span>
          )}
        </div>
      )}

      <SshTunnelForm
        value={value.ssh_tunnel}
        onChange={(ssh) => set({ ssh_tunnel: ssh })}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-8 w-full rounded-md border border-input bg-background px-3 text-sm",
        "placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring",
        props.className
      )}
    />
  );
}
