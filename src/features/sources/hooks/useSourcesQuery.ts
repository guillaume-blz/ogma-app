import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { sourceKeys } from "../query-keys";
import type { Source } from "../types";

export function useSourcesQuery() {
  return useQuery({
    queryKey: sourceKeys.lists(),
    queryFn: () => invoke<Source[]>("source_list"),
  });
}
