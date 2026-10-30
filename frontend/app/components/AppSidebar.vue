<template>
  <div class="flex flex-col h-full">
    <!-- Logo / brand -->
    <div
      class="flex items-center gap-2 px-2 pb-4 mb-2 border-b border-surface-200 dark:border-surface-700"
    >
      <i class="pi pi-building text-xl" />
      <span class="font-semibold text-lg">Music School</span>
    </div>

    <!-- Navigation -->
    <Menu :model="items" class="w-full border-0">
      <template #item="{ item }">
        <NuxtLink
          :to="item.to"
          class="flex items-center gap-2 px-3 py-2 rounded"
          @click="onNavigate"
        >
          <span :class="item.icon" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </template>
    </Menu>
  </div>
</template>

<script setup lang="ts">
import { navigation } from "~/config/navigation";

const uiStore = useUiStore();

// Map nav config to PrimeVue MenuItem shape (keeps `to` for NuxtLink).
const items = navigation.map((n) => ({
  label: n.label,
  icon: n.icon,
  to: n.to,
}));

// Close the overlay sidebar after navigating.
function onNavigate() {
  uiStore.closeSidebar();
}
</script>
