"use client";

import { create } from "zustand";

/**
 * Global UI state only — never server data (that belongs to TanStack Query).
 * Phase 1 grows this with the app shell (sidebar, command palette, capture drawer).
 */
type UiState = {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: false,
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
