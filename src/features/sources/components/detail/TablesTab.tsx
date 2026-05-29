import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronRight, Loader2, Table2, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type ExpandedState,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { useSourceSchema } from "../../hooks/useSourceSchema";
import type { TableSchema } from "../../types";

export function TablesTab({ sourceId }: { sourceId: string }) {
  const { data: schema, isLoading, error } = useSourceSchema(sourceId);
  const [, setSearchParams] = useSearchParams();
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<TableSchema>[]>(
    () => [
      { id: "name", accessorKey: "name", header: "Table" },
      { id: "columnCount", accessorFn: (row) => row.columns.length, header: "Columns" },
    ],
    []
  );

  const table = useReactTable({
    data: schema?.tables ?? [],
    columns,
    state: { expanded, sorting, globalFilter },
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
  });

  const openData = (tableName: string) => {
    setSearchParams({ tab: "data", table: tableName });
  };

  if (isLoading)
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
        <Loader2 className="size-4 animate-spin" /> Loading tables…
      </div>
    );
  if (error) return <p className="text-sm text-destructive py-4">{String(error)}</p>;
  if (!schema || schema.tables.length === 0)
    return <p className="text-sm text-muted-foreground py-4">No tables found.</p>;

  const rows = table.getRowModel().rows;
  const total = schema.tables.length;

  return (
    <div className="max-w-2xl space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter tables…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <SortButton
          label="Name"
          sorted={table.getColumn("name")?.getIsSorted() ?? false}
          onClick={() => table.getColumn("name")?.toggleSorting()}
        />
        <SortButton
          label="Cols"
          sorted={table.getColumn("columnCount")?.getIsSorted() ?? false}
          onClick={() => table.getColumn("columnCount")?.toggleSorting()}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {rows.length === total
          ? `${total} table${total !== 1 ? "s" : ""}`
          : `${rows.length} / ${total} table${total !== 1 ? "s" : ""}`}
      </p>

      <div className="space-y-1">
        {rows.map((row) => (
          <TableCard
            key={row.id}
            table={row.original}
            open={row.getIsExpanded()}
            onToggle={row.getToggleExpandedHandler()}
            onOpenData={() => openData(row.original.name)}
          />
        ))}
      </div>
    </div>
  );
}

function SortButton({
  label,
  sorted,
  onClick,
}: {
  label: string;
  sorted: false | "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs transition-colors hover:bg-muted",
        sorted && "border-primary/40 text-primary"
      )}
    >
      {label}
      {sorted === "asc" ? (
        <ArrowUp className="size-3" />
      ) : sorted === "desc" ? (
        <ArrowDown className="size-3" />
      ) : (
        <ArrowUpDown className="size-3 text-muted-foreground/50" />
      )}
    </button>
  );
}

function TableCard({
  table,
  open,
  onToggle,
  onOpenData,
}: {
  table: TableSchema;
  open: boolean;
  onToggle: () => void;
  onOpenData: () => void;
}) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex w-full items-center hover:bg-muted/40 transition-colors">
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-2 px-4 py-2.5 text-left"
        >
          <ChevronRight
            className={cn(
              "size-3.5 text-muted-foreground transition-transform shrink-0",
              open && "rotate-90"
            )}
          />
          <span className="font-mono text-sm font-medium">{table.name}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {table.columns.length} col{table.columns.length !== 1 ? "s" : ""}
          </span>
        </button>
        <button
          type="button"
          onClick={onOpenData}
          className="flex items-center justify-center px-3 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`View data for ${table.name}`}
          title="View data"
        >
          <Table2 className="size-3.5" />
        </button>
      </div>
      {open && (
        <div className="border-t border-border">
          {table.columns.map((col) => (
            <div
              key={col.name}
              className="flex items-center gap-3 px-8 py-2 border-b border-border/50 last:border-0 hover:bg-muted/20"
            >
              <span className="font-mono text-xs flex-1">{col.name}</span>
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {col.data_type}
              </span>
              {col.nullable && (
                <span className="text-[10px] text-muted-foreground/60">nullable</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
