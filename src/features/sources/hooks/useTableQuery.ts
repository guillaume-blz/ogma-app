import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { sourceKeys } from "../query-keys";
import type { QueryResult, OrderBy } from "../types";

export const PAGE_SIZES = [25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

interface UseTableQueryOptions {
  sourceId: string;
  table: string | null;
}

export function useTableQuery({ sourceId, table }: UseTableQueryOptions) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(50);
  const [orderBy, setOrderBy] = useState<OrderBy | null>(null);

  useEffect(() => {
    setPage(1);
    setOrderBy(null);
  }, [table]);

  const query = useQuery({
    queryKey: sourceKeys.tableData(sourceId, table ?? "", page, pageSize, orderBy),
    queryFn: () =>
      invoke<QueryResult>("source_query", {
        id: sourceId,
        query: {
          table: table!,
          limit: pageSize,
          offset: (page - 1) * pageSize,
          order_by: orderBy ? [orderBy] : undefined,
        },
      }),
    enabled: !!table,
  });

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

  const totalPages =
    query.data?.total != null
      ? Math.max(1, Math.ceil(query.data.total / pageSize))
      : null;

  return {
    loading: query.isFetching,
    error: query.error ? String(query.error) : null,
    result: query.data ?? null,
    page,
    pageSize,
    orderBy,
    totalPages,
    setPage,
    setPageSize: setPageSizeSafe,
    toggleOrder,
    refresh: query.refetch,
  };
}
