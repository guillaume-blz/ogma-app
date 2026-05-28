import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Tab {
  id: string;
  path: string;
}

interface TabStore {
  openTabs: Tab[];
  addTab: (tab: Tab) => void;
  closeTab: (id: string) => void;
  closeTabsWhere: (predicate: (tab: Tab) => boolean) => void;
  reorderTabs: (tabs: Tab[]) => void;
}

export const useTabStore = create<TabStore>()(
  persist(
    (set) => ({
      openTabs: [{ id: "home", path: "/" }],

      addTab: (tab) =>
        set((s) =>
          s.openTabs.some((t) => t.id === tab.id)
            ? s
            : { openTabs: [...s.openTabs, tab] }
        ),

      closeTab: (id) =>
        set((s) => ({ openTabs: s.openTabs.filter((t) => t.id !== id) })),

      closeTabsWhere: (predicate) =>
        set((s) => ({ openTabs: s.openTabs.filter((t) => !predicate(t)) })),

      reorderTabs: (tabs) => set({ openTabs: tabs }),
    }),
    { name: "ogma-tabs" }
  )
);
