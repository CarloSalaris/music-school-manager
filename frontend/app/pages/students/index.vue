<template>
  <div class="max-w-6xl mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Allievi</h1>
      <Button label="Aggiungi allievo" severity="primary" disabled />
    </div>

    <div v-if="loading" class="text-gray-500 py-4">Caricamento in corso...</div>

    <div v-else-if="error" class="text-red-600 py-4">{{ error }}</div>

    <div v-else>
      <p class="text-sm text-gray-500 mb-3">
        {{ pagination.total }} allievi trovati
      </p>
      <pre
        class="bg-gray-50 rounded border border-gray-200 p-4 overflow-auto text-xs"
        >{{ JSON.stringify(list, null, 2) }}</pre
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import studentsService from "~/services/studentsService";

definePageMeta({
  layout: "default",
});

const { list, loading, error, pagination, fetchList } =
  useList(studentsService);

onMounted(() => {
  fetchList();
});
</script>
