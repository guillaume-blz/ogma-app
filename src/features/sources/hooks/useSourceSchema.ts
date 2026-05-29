import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { sourceKeys } from "../query-keys";
import type { Schema } from "../types";

export function useSourceSchema(sourceId: string) {
  return useQuery({
    queryKey: sourceKeys.schema(sourceId),
    queryFn: () => invoke<Schema>("source_schema", { id: sourceId }),
    staleTime: 5 * 60 * 1000,
  });
}
