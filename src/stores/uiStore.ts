import { create } from "zustand";

interface UiState {
  isOfflineMode: boolean;
  setOfflineMode: (offline: boolean) => void;
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isOfflineMode: typeof navigator !== "undefined" ? !navigator.onLine : false,
  setOfflineMode: (offline) => set({ isOfflineMode: offline }),
  isMenuOpen: false,
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
}));

// Setup listener for offline events
if (typeof window !== "undefined") {
  window.addEventListener("online", () => useUiStore.getState().setOfflineMode(false));
  window.addEventListener("offline", () => useUiStore.getState().setOfflineMode(true));
}
