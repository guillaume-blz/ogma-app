import { useEffect, useState, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type Table,
} from "@tanstack/react-table";
import { sourceKeys } from "../query-keys";
import type { QueryResult } from "../types";

export const PAGE_SIZES = [25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

interface UseTableQueryOptions {
  sourceId: string;
  table: string | null;
}

interface UseTableQueryResult {
  table: Table<unknown[]>;
  loading: boolean;
  error: string | null;
  rowCount: number | undefined;
  refresh: () => void;
}

export function useTableQuery({ sourceId, table }: UseTableQueryOptions): UseTableQueryResult {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
    setSorting([]);
  }, [table]);

  const orderBy = sorting[0]
    ? { column: sorting[0].id, direction: sorting[0].desc ? ("desc" as const) : ("asc" as const) }
    : undefined;

  const query = useQuery({
    queryKey: sourceKeys.tableData(
      sourceId,
      table ?? "",
      pagination.pageIndex + 1,
      pagination.pageSize,
      orderBy ?? null
    ),
    queryFn: () =>
      invoke<QueryResult>("source_query", {
        id: sourceId,
        query: {
          table: table!,
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
          order_by: orderBy ? [orderBy] : undefined,
        },
      }),
    enabled: !!table,
    placeholderData: keepPreviousData,
  });

  const result = query.data;

  const columns = useMemo<ColumnDef<unknown[]>[]>(() => {
    if (!result?.columns.length) return [];
    return result.columns.map((col, idx) => ({
      id: col,
      header: col,
      accessorFn: (row: unknown[]) => row[idx],
    }));
  }, [result?.columns]);

  const data = result?.rows ?? [];
  const rowCount = result?.total;
  const pageCount =
    rowCount != null ? Math.max(1, Math.ceil(rowCount / pagination.pageSize)) : -1;

  const tanTable = useReactTable<unknown[]>({
    data,
    columns,
    state: { pagination, sorting },
    pageCount,
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
  });

  return {
    table: tanTable,
    loading: query.isFetching,
    error: query.error ? String(query.error) : null,
    rowCount,
    refresh: query.refetch,
  };
}
