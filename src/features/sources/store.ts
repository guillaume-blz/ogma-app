import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { queryClient } from "@/lib/query-client";
import { sourceKeys } from "./query-keys";
import type { Source, SourceType, SourceConfig } from "./types";

interface SourceStore {
  createSource: (name: string, type: SourceType, config: SourceConfig) => Promise<Source>;
  updateSource: (id: string, name: string, config: SourceConfig) => Promise<Source>;
  deleteSource: (id: string) => Promise<void>;
  testSource: (id: string) => Promise<void>;
}

export const useSourceStore = create<SourceStore>()(() => ({
  createSource: async (name, type, config) => {
    const source = await invoke<Source>("source_create", { name, sourceType: type, config });
    await queryClient.invalidateQueries({ queryKey: sourceKeys.lists() });
    return source;
  },

  updateSource: async (id, name, config) => {
    const source = await invoke<Source>("source_update", { id, name, config });
    await queryClient.invalidateQueries({ queryKey: sourceKeys.lists() });
    return source;
  },

  deleteSource: async (id) => {
    await invoke("source_delete", { id });
    await queryClient.invalidateQueries({ queryKey: sourceKeys.lists() });
  },

  testSource: async (id) => {
    await invoke("source_test", { id });
  },
}));
