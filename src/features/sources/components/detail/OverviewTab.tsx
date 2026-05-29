import { useState } from "react";
import { Loader2, CheckCircle2, XCircle, Plug } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSourceStore } from "../../store";
import type { DatabaseConfig, Source } from "../../types";

type TestStatus = "idle" | "testing" | "ok" | "error";

function extractMessage(e: unknown): string {
  if (typeof e === "string") return e;
  if (e instanceof Error) return e.message;
  return "Unknown error";
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-2.5 border-b border-border last:border-0">
      <span className="w-36 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

export function OverviewTab({ source }: { source: Source }) {
  const { testSource } = useSourceStore();
  const [status, setStatus] = useState<TestStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTest = async () => {
    setStatus("testing");
    setErrorMsg(null);
    try {
      await testSource(source.id);
      setStatus("ok");
    } catch (e) {
      setStatus("error");
      setErrorMsg(extractMessage(e));
    }
  };

  const cfg = source.source_type === "database"
    ? (source.config as DatabaseConfig)
    : null;

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="max-w-xl space-y-6">
      <div className="rounded-lg border border-border px-4">
        <Row label="Name"       value={source.name} />
        <Row label="Type"       value={source.source_type} />
        {cfg && (
          <>
            <Row label="Driver" value={cfg.driver} />
            {cfg.driver !== "sqlite" && (
              <>
                <Row label="Host"     value={`${cfg.host}:${cfg.port}`} />
                <Row label="Database" value={cfg.database || "—"} />
                <Row label="Username" value={cfg.username || "—"} />
              </>
            )}
            {cfg.driver === "sqlite" && (
              <Row label="File" value={cfg.host || "—"} />
            )}
            <Row
              label="SSH Tunnel"
              value={cfg.ssh_tunnel
                ? `${cfg.ssh_tunnel.host}:${cfg.ssh_tunnel.port}`
                : "None"}
            />
          </>
        )}
        <Row label="Created" value={fmt(source.created_at)} />
        <Row label="Updated" value={fmt(source.updated_at)} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleTest}
          disabled={status === "testing"}
          className={cn(
            "flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm",
            "text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          )}
        >
          {status === "testing"
            ? <Loader2 className="size-3.5 animate-spin" />
            : <Plug className="size-3.5" />}
          Test connection
        </button>
        {status === "ok" && (
          <span className="flex items-center gap-1 text-xs text-green-500">
            <CheckCircle2 className="size-3" /> Connected
          </span>
        )}
        {status === "error" && (
          <span className="flex items-center gap-1.5 text-xs text-destructive">
            <XCircle className="size-3 shrink-0" />
            {errorMsg ?? "Connection failed"}
          </span>
        )}
      </div>
    </div>
  );
}
