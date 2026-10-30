import { defineStore } from "pinia";

// Holds transient UI shell state (not persisted across reloads).
export const useUiStore = defineStore("UiStore", {
  state: () => ({
    sidebarOpen: false,
  }),
  actions: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },
    openSidebar() {
      this.sidebarOpen = true;
    },
    closeSidebar() {
      this.sidebarOpen = false;
    },
  },
});
