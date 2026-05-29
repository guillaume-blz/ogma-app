import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { flexRender, type Table } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

interface DataGridProps {
  table: Table<unknown[]>;
}

export function DataGrid({ table }: DataGridProps) {
  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border py-16 text-sm text-muted-foreground">
        No rows returned.
      </div>
    );
  }

  return (
    <div className="relative overflow-auto rounded-lg border border-border max-h-[calc(100vh-280px)]">
      <table className="min-w-full text-xs border-collapse">
        <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              <th className="w-10 border-b border-r border-border px-2 py-2 text-center font-mono text-muted-foreground/40 select-none">
                #
              </th>
              {headerGroup.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="group cursor-pointer select-none border-b border-r border-border px-3 py-2 text-left font-medium text-muted-foreground hover:bg-accent/40 hover:text-foreground whitespace-nowrap last:border-r-0"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                      <span className="shrink-0">
                        {sorted === "asc" ? (
                          <ChevronUp className="size-3 text-primary" />
                        ) : sorted === "desc" ? (
                          <ChevronDown className="size-3 text-primary" />
                        ) : (
                          <ChevronsUpDown className="size-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                        )}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id}
              className={cn(
                "border-b border-border/50 last:border-0 transition-colors hover:bg-accent/20",
                i % 2 === 0 ? "bg-background" : "bg-muted/10"
              )}
            >
              <td className="border-r border-border/40 px-2 py-1.5 text-center font-mono text-muted-foreground/30 select-none">
                {i + 1}
              </td>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="border-r border-border/30 px-3 py-1.5 last:border-r-0"
                >
                  <CellValue value={cell.getValue()} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CellValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return (
      <span className="italic text-muted-foreground/35 select-none">NULL</span>
    );
  }
  if (typeof value === "boolean") {
    return (
      <span className={cn("font-mono", value ? "text-green-500" : "text-muted-foreground")}>
        {String(value)}
      </span>
    );
  }
  if (typeof value === "number") {
    return (
      <span className="font-mono text-blue-500 dark:text-blue-400">{String(value)}</span>
    );
  }
  const str = String(value);
  return (
    <span
      className="font-mono block truncate max-w-[300px]"
      title={str.length > 50 ? str : undefined}
    >
      {str}
    </span>
  );
}
