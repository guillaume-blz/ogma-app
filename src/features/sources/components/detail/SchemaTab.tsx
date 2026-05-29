import { Loader2 } from "lucide-react";
import { useSourceSchema } from "../../hooks/useSourceSchema";

export function SchemaTab({ sourceId }: { sourceId: string }) {
  const { data: schema, isLoading, error } = useSourceSchema(sourceId);

  if (isLoading) return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
      <Loader2 className="size-4 animate-spin" /> Loading schema…
    </div>
  );
  if (error) return <p className="text-sm text-destructive py-4">{String(error)}</p>;
  if (!schema || schema.tables.length === 0) return (
    <p className="text-sm text-muted-foreground py-4">No schema found.</p>
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {schema.tables.map((table) => (
        <div key={table.name} className="rounded-lg border border-border overflow-hidden">
          <div className="border-b border-border bg-muted/40 px-3 py-2 flex items-center gap-2">
            <span className="font-mono text-sm font-semibold">{table.name}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {table.columns.length} col{table.columns.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="divide-y divide-border/50">
            {table.columns.map((col) => (
              <div key={col.name} className="flex items-center gap-2 px-3 py-1.5">
                <span className="font-mono text-xs flex-1 truncate">{col.name}</span>
                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {col.data_type}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
