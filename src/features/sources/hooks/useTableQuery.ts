import { useEffect, useState, useCallback } from "react";
import { useSourceStore } from "../store";
import type { QueryResult, OrderBy } from "../types";

export const PAGE_SIZES = [25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

interface UseTableQueryOptions {
  sourceId: string;
  table: string | null;
}

export function useTableQuery({ sourceId, table }: UseTableQueryOptions) {
  const querySource = useSourceStore((s) => s.querySource);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(50);
  const [orderBy, setOrderBy] = useState<OrderBy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QueryResult | null>(null);

  // Reset pagination and sort when the table changes
  useEffect(() => {
    setPage(1);
    setOrderBy(null);
    setResult(null);
    setError(null);
  }, [table]);

  useEffect(() => {
    if (!table) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    querySource(sourceId, {
      table,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order_by: orderBy ? [orderBy] : undefined,
    })
      .then((res) => { if (!cancelled) setResult(res); })
      .catch((e) => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [sourceId, table, page, pageSize, orderBy, querySource]);

  const toggleOrder = useCallback((column: string) => {
    setOrderBy((prev) => {
      if (!prev || prev.column !== column) return { column, direction: "asc" };
      if (prev.direction === "asc") return { column, direction: "desc" };
      return null;
    });
    setPage(1);
  }, []);

  const setPageSizeSafe = useCallback((size: PageSize) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const refresh = useCallback(() => {
    // Force re-run by bumping a counter via a no-op page set
    setPage((p) => p);
  }, []);

  const totalPages =
    result?.total != null ? Math.max(1, Math.ceil(result.total / pageSize)) : null;

  return {
    loading,
    error,
    result,
    page,
    pageSize,
    orderBy,
    totalPages,
    setPage,
    setPageSize: setPageSizeSafe,
    toggleOrder,
    refresh,
  };
}
