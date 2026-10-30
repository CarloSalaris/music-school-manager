// Initialize the theme on client startup so the .dark-mode class is applied
// to <html> before the layout renders (no flash of the wrong theme).
export default defineNuxtPlugin(() => {
  useThemeStore().init();
});
