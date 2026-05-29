import type { OrderBy } from "./types";

export const sourceKeys = {
  all: ["sources"] as const,
  lists: () => [...sourceKeys.all, "list"] as const,
  schema: (id: string) => [...sourceKeys.all, "schema", id] as const,
  tableData: (
    sourceId: string,
    table: string,
    page: number,
    pageSize: number,
    orderBy: OrderBy | null,
  ) => [...sourceKeys.all, "table-data", sourceId, table, page, pageSize, orderBy] as const,
};
