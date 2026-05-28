import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { Source, SourceType, SourceConfig, AbstractQuery, QueryResult, Schema } from "./types";

interface SourceStore {
  sources: Source[];
  loading: boolean;
  error: string | null;

  fetchSources: () => Promise<void>;
  createSource: (name: string, type: SourceType, config: SourceConfig) => Promise<Source>;
  updateSource: (id: string, name: string, config: SourceConfig) => Promise<Source>;
  deleteSource: (id: string) => Promise<void>;
  testSource: (id: string) => Promise<void>;
  fetchSchema: (id: string) => Promise<Schema>;
  querySource: (id: string, query: AbstractQuery) => Promise<QueryResult>;
}

export const useSourceStore = create<SourceStore>()((set) => ({
  sources: [],
  loading: false,
  error: null,

  fetchSources: async () => {
    set({ loading: true, error: null });
    try {
      const sources = await invoke<Source[]>("source_list");
      set({ sources });
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },

  createSource: async (name, type, config) => {
    const source = await invoke<Source>("source_create", { name, sourceType: type, config });
    set((s) => ({ sources: [source, ...s.sources] }));
    return source;
  },

  updateSource: async (id, name, config) => {
    const source = await invoke<Source>("source_update", { id, name, config });
    set((s) => ({ sources: s.sources.map((x) => (x.id === id ? source : x)) }));
    return source;
  },

  deleteSource: async (id) => {
    await invoke("source_delete", { id });
    set((s) => ({ sources: s.sources.filter((x) => x.id !== id) }));
  },

  testSource: async (id) => {
    await invoke("source_test", { id });
  },

  fetchSchema: async (id) => {
    return invoke<Schema>("source_schema", { id });
  },

  querySource: async (id, query) => {
    return invoke<QueryResult>("source_query", { id, query });
  },
}));
