<template>
  <div class="min-h-screen bg-gray-50">
    <AppTopbar />

    <!-- Overlay sidebar: fully collapses, driven by the ui store -->
    <Drawer v-model:visible="sidebarOpen" position="left">
      <AppSidebar />
    </Drawer>

    <main class="p-6">
      <slot />
    </main>

    <!-- Required for modal-driven CRUD -->
    <DynamicDialog />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";

const uiStore = useUiStore();
// Writable ref: Drawer's v-model:visible reads/writes sidebarOpen directly.
const { sidebarOpen } = storeToRefs(uiStore);
</script>
