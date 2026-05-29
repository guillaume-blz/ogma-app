import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronRight, Loader2, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSourceStore } from "../../store";
import type { Schema, TableSchema } from "../../types";

export function TablesTab({ sourceId }: { sourceId: string }) {
  const { fetchSchema } = useSourceStore();
  const [schema, setSchema] = useState<Schema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [, setSearchParams] = useSearchParams();

  useEffect(() => {
    setLoading(true);
    fetchSchema(sourceId)
      .then(setSchema)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [sourceId, fetchSchema]);

  const toggle = (name: string) =>
    setExpanded((s) => {
      const next = new Set(s);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  if (loading) return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
      <Loader2 className="size-4 animate-spin" /> Loading tables…
    </div>
  );
  if (error) return <p className="text-sm text-destructive py-4">{error}</p>;
  if (!schema || schema.tables.length === 0) return (
    <p className="text-sm text-muted-foreground py-4">No tables found.</p>
  );

  const openData = (tableName: string) => {
    setSearchParams({ tab: "data", table: tableName });
  };

  return (
    <div className="max-w-2xl space-y-1">
      <p className="mb-3 text-xs text-muted-foreground">
        {schema.tables.length} table{schema.tables.length !== 1 ? "s" : ""}
      </p>
      {schema.tables.map((table) => (
        <TableRow
          key={table.name}
          table={table}
          open={expanded.has(table.name)}
          onToggle={() => toggle(table.name)}
          onOpenData={() => openData(table.name)}
        />
      ))}
    </div>
  );
}

function TableRow({
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
          <ChevronRight className={cn("size-3.5 text-muted-foreground transition-transform shrink-0", open && "rotate-90")} />
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
            <div key={col.name} className="flex items-center gap-3 px-8 py-2 border-b border-border/50 last:border-0 hover:bg-muted/20">
              <span className="font-mono text-xs flex-1">{col.name}</span>
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{col.data_type}</span>
              {col.nullable && <span className="text-[10px] text-muted-foreground/60">nullable</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
