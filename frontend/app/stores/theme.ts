import { defineStore } from "pinia";

const STORAGE_KEY = "theme";

// Manages the light/dark theme. Persists an explicit choice to localStorage
// and falls back to the OS preference until the user picks one.
export const useThemeStore = defineStore("ThemeStore", {
  state: () => ({
    isDark: false,
  }),
  actions: {
    // Read the saved preference; if none, fall back to the OS setting.
    init() {
      const saved = localStorage.getItem(STORAGE_KEY);
      this.isDark =
        saved === "dark" || saved === "light"
          ? saved === "dark"
          : window.matchMedia("(prefers-color-scheme: dark)").matches;
      this.applyTheme();
    },
    toggle() {
      this.isDark = !this.isDark;
      localStorage.setItem(STORAGE_KEY, this.isDark ? "dark" : "light");
      this.applyTheme();
    },
    // Toggle PrimeVue's dark selector class on <html> (not <body>).
    applyTheme() {
      document.documentElement.classList.toggle("dark-mode", this.isDark);
    },
  },
});
