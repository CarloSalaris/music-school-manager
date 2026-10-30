<template>
  <header
    class="flex items-center gap-3 px-4 h-14 border-b border-gray-200 bg-white"
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
    <span class="font-semibold text-lg">Music School Manager</span>

    <!-- Right-side actions (dark mode toggle lands here in Block 3) -->
    <div class="ml-auto flex items-center gap-2" />
  </header>
</template>

<script setup lang="ts">
const uiStore = useUiStore();
</script>
