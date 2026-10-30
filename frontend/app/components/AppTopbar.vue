<template>
  <header
    class="flex items-center gap-3 px-4 h-14 border-b border-surface-200 bg-surface-0 dark:border-surface-700 dark:bg-surface-900"
  >
    <!-- Hamburger: toggles the overlay sidebar -->
    <Button
      icon="pi pi-bars"
      text
      rounded
      aria-label="Apri menu"
      @click="uiStore.toggleSidebar()"
    />

    <!-- App title -->
    <span class="font-semibold text-lg text-surface-900 dark:text-surface-0">
      Music School Manager
    </span>

    <!-- Right-side actions -->
    <div class="ml-auto flex items-center gap-2">
      <Button
        :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
        text
        rounded
        :aria-label="isDark ? 'Attiva tema chiaro' : 'Attiva tema scuro'"
        @click="themeStore.toggle()"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";

const uiStore = useUiStore();
const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);
</script>
