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

      reorderTabs: (tabs) => set({ openTabs: tabs }),
    }),
    { name: "ogma-tabs" }
  )
);
