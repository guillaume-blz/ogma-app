import { useSearchParams } from "react-router-dom";
import { TableProperties } from "lucide-react";
import { useTableQuery, type PageSize } from "../../hooks/useTableQuery";
import { DataGrid } from "./DataGrid";
import { QueryToolbar } from "./QueryToolbar";

export function DataTab({ sourceId }: { sourceId: string }) {
  const [searchParams] = useSearchParams();
  const dbTable = searchParams.get("table");

  const { table, loading, error, rowCount, refresh } = useTableQuery({
    sourceId,
    table: dbTable,
  });

  if (!dbTable) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <TableProperties className="size-8 opacity-30" />
        <p className="text-sm">Select a table in the <strong>Tables</strong> tab to view its data.</p>
      </div>
    );
  }

  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();

  return (
    <div className="flex flex-col gap-3">
      <QueryToolbar
        table={dbTable}
        total={rowCount}
        page={pageIndex + 1}
        pageSize={pageSize as PageSize}
        totalPages={pageCount === -1 ? null : pageCount}
        loading={loading}
        onPageChange={(p) => table.setPageIndex(p - 1)}
        onPageSizeChange={(size) => table.setPageSize(size)}
        onRefresh={refresh}
      />

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!error && loading && table.getRowModel().rows.length === 0 && (
        <div className="space-y-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 rounded bg-muted/40 animate-pulse" />
          ))}
        </div>
      )}

      {!error && table.getRowModel().rows.length > 0 && (
        <DataGrid table={table} />
      )}
    </div>
  );
}
