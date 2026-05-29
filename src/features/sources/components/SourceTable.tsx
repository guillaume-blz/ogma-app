import { useState } from "react";
import { Edit2, Trash2, Plug, Loader2, CheckCircle2, XCircle, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceTypeIcon } from "./SourceTypeIcon";
import type { DatabaseConfig, Source } from "../types";

const PAGE_SIZE = 10;

const TYPE_LABELS: Record<string, string> = {
  database: "Database",
  files: "Files",
  api: "API",
  saas: "SaaS",
};

type TestStatus = "idle" | "testing" | "ok" | "error";

function connectionLabel(source: Source): string {
  if (source.source_type === "database") {
    const cfg = source.config as DatabaseConfig;
    if (cfg.driver === "sqlite") return cfg.host || "—";
    const ssh = cfg.ssh_tunnel ? " (SSH)" : "";
    return `${cfg.host}:${cfg.port}${ssh}`;
  }
  return "—";
}

interface SourceTableProps {
  sources: Source[];
  onOpen?: (source: Source) => void;
  onEdit: (source: Source) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => Promise<void>;
}

export function SourceTable({ sources, onOpen, onEdit, onDelete, onTest }: SourceTableProps) {
  const [page, setPage] = useState(1);
  const [statuses, setStatuses] = useState<Record<string, TestStatus>>({});

  const totalPages = Math.max(1, Math.ceil(sources.length / PAGE_SIZE));
  const slice = sources.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTest = async (id: string) => {
    setStatuses((s) => ({ ...s, [id]: "testing" }));
    try {
      await onTest(id);
      setStatuses((s) => ({ ...s, [id]: "ok" }));
    } catch {
      setStatuses((s) => ({ ...s, [id]: "error" }));
    }
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Source Name</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Connection</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((source, i) => {
              const status = statuses[source.id] ?? "idle";
              return (
                <tr
                  key={source.id}
                  className={cn(
                    "border-b border-border last:border-0 transition-colors hover:bg-muted/30",
                    i % 2 === 0 ? "bg-background" : "bg-muted/10"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded border border-border bg-background">
                        <SourceTypeIcon type={source.source_type} className="size-3.5 text-muted-foreground" />
                      </div>
                      {onOpen ? (
                        <button
                          type="button"
                          onClick={() => onOpen(source)}
                          className="font-medium text-foreground hover:text-primary hover:underline transition-colors text-left"
                        >
                          {source.name}
                        </button>
                      ) : (
                        <span className="font-medium text-foreground">{source.name}</span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                      {TYPE_LABELS[source.source_type] ?? source.source_type}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {connectionLabel(source)}
                  </td>

                  <td className="px-4 py-3">
                    {status === "idle" && <span className="text-xs text-muted-foreground">—</span>}
                    {status === "testing" && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Loader2 className="size-3 animate-spin" />Testing…
                      </span>
                    )}
                    {status === "ok" && (
                      <span className="flex items-center gap-1 text-xs text-green-500">
                        <CheckCircle2 className="size-3" />Connected
                      </span>
                    )}
                    {status === "error" && (
                      <span className="flex items-center gap-1 text-xs text-destructive">
                        <XCircle className="size-3" />Failed
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {onOpen && (
                        <ActionBtn onClick={() => onOpen(source)} aria-label="Open detail">
                          <ExternalLink className="size-3.5" />
                        </ActionBtn>
                      )}
                      <ActionBtn
                        onClick={() => handleTest(source.id)}
                        disabled={status === "testing"}
                        aria-label="Test connection"
                      >
                        <Plug className="size-3.5" />
                      </ActionBtn>
                      <ActionBtn onClick={() => onEdit(source)} aria-label="Edit">
                        <Edit2 className="size-3.5" />
                      </ActionBtn>
                      <ActionBtn
                        onClick={() => onDelete(source.id)}
                        aria-label="Delete"
                        className="hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </ActionBtn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{sources.length} source{sources.length !== 1 ? "s" : ""}</span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <PaginationBtn onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
              <ChevronLeft className="size-3.5" />
            </PaginationBtn>
            <span className="px-2">{page} / {totalPages}</span>
            <PaginationBtn onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
              <ChevronRight className="size-3.5" />
            </PaginationBtn>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "flex size-7 items-center justify-center rounded text-muted-foreground",
        "hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40",
        className
      )}
    >
      {children}
    </button>
  );
}

function PaginationBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="flex size-6 items-center justify-center rounded border border-border hover:bg-muted disabled:opacity-40 transition-colors"
    >
      {children}
    </button>
  );
}
