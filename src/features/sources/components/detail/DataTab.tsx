import { useSearchParams } from "react-router-dom";
import { TableProperties } from "lucide-react";
import { useTableQuery } from "../../hooks/useTableQuery";
import { DataGrid } from "./DataGrid";
import { QueryToolbar } from "./QueryToolbar";

export function DataTab({ sourceId }: { sourceId: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const table = searchParams.get("table");

  const {
    loading,
    error,
    result,
    page,
    pageSize,
    orderBy,
    totalPages,
    setPage,
    setPageSize,
    toggleOrder,
    refresh,
  } = useTableQuery({ sourceId, table });

  if (!table) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <TableProperties className="size-8 opacity-30" />
        <p className="text-sm">Select a table in the <strong>Tables</strong> tab to view its data.</p>
      </div>
    );
  }

  const handlePageChange = (p: number) => {
    setPage(p);
    setSearchParams((prev) => {
      prev.set("tab", "data");
      if (table) prev.set("table", table);
      return prev;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <QueryToolbar
        table={table}
        total={result?.total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        loading={loading}
        onPageChange={handlePageChange}
        onPageSizeChange={setPageSize}
        onRefresh={refresh}
      />

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!error && loading && !result && (
        <div className="space-y-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 rounded bg-muted/40 animate-pulse" />
          ))}
        </div>
      )}

      {!error && result && (
        <DataGrid result={result} orderBy={orderBy} onToggleOrder={toggleOrder} />
      )}
    </div>
  );
}
