import { useState, useMemo } from "react";
import {
  Edit2, Trash2, Plug, Loader2, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table";
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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });
  const [statuses, setStatuses] = useState<Record<string, TestStatus>>({});

  const handleTest = async (id: string) => {
    setStatuses((s) => ({ ...s, [id]: "testing" }));
    try {
      await onTest(id);
      setStatuses((s) => ({ ...s, [id]: "ok" }));
    } catch {
      setStatuses((s) => ({ ...s, [id]: "error" }));
    }
  };

  const columns = useMemo<ColumnDef<Source>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Source Name",
      },
      {
        id: "source_type",
        accessorKey: "source_type",
        header: "Type",
        sortingFn: (a, b) => {
          const la = TYPE_LABELS[a.original.source_type] ?? a.original.source_type;
          const lb = TYPE_LABELS[b.original.source_type] ?? b.original.source_type;
          return la.localeCompare(lb);
        },
      },
      {
        id: "connection",
        header: "Connection",
        enableSorting: false,
      },
      {
        id: "status",
        header: "Status",
        enableSorting: false,
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
      },
    ],
    []
  );

  const table = useReactTable({
    data: sources,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const rows = table.getRowModel().rows;
  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;

  return (
    <div className="flex flex-col">
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {table.getHeaderGroups()[0].headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={cn(
                    "px-4 py-2.5 text-xs font-medium text-muted-foreground",
                    header.id === "actions" ? "text-right" : "text-left",
                    header.column.getCanSort() && "cursor-pointer select-none hover:text-foreground"
                  )}
                >
                  <div className={cn("flex items-center gap-1", header.id === "actions" && "justify-end")}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      header.column.getIsSorted() === "asc" ? (
                        <ArrowUp className="size-3" />
                      ) : header.column.getIsSorted() === "desc" ? (
                        <ArrowDown className="size-3" />
                      ) : (
                        <ArrowUpDown className="size-3 opacity-40" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const source = row.original;
              const status = statuses[source.id] ?? "idle";
              return (
                <tr
                  key={row.id}
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
                    <TestStatusCell status={status} />
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

        {pageCount > 1 && (
          <div className="flex items-center gap-1">
            <PaginationBtn onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeft className="size-3.5" />
            </PaginationBtn>
            <span className="px-2">{pageIndex + 1} / {pageCount}</span>
            <PaginationBtn onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRight className="size-3.5" />
            </PaginationBtn>
          </div>
        )}
      </div>
    </div>
  );
}

function TestStatusCell({ status }: { status: TestStatus }) {
  if (status === "testing")
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />Testing…
      </span>
    );
  if (status === "ok")
    return (
      <span className="flex items-center gap-1 text-xs text-green-500">
        <CheckCircle2 className="size-3" />Connected
      </span>
    );
  if (status === "error")
    return (
      <span className="flex items-center gap-1 text-xs text-destructive">
        <XCircle className="size-3" />Failed
      </span>
    );
  return <span className="text-xs text-muted-foreground">—</span>;
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
