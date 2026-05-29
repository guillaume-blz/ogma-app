import { create } from "zustand";

interface SidebarStore {
  open: boolean;
  toggle: () => void;
}

export const useSidebarStore = create<SidebarStore>()((set) => ({
  open: true,
  toggle: () => set((s) => ({ open: !s.open })),
}));
