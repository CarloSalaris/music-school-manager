<template>
  <div class="max-w-5xl mx-auto">
    <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-6">
      Dashboard
    </h1>

    <div v-if="loading" class="text-muted-color py-4">
      Caricamento in corso...
    </div>

    <div v-else-if="error" class="text-red-600 py-4">{{ error }}</div>

    <div v-else-if="stats" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- One card per category; the whole card links to its list. -->
      <NuxtLink to="/students" class="block">
        <Card
          class="cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-emerald-300"
        >
          <template #title>Allievi</template>
          <template #content>
            <div class="flex items-end gap-8">
              <div>
                <div class="text-4xl font-bold">{{ stats.active }}</div>
                <div class="text-sm text-muted-color">Iscritti attivi</div>
              </div>

              <!-- TODO: make this clickable to the students list filtered by
                   inactive, to follow up with them (questions, offers...). -->
              <div v-if="inactive > 0">
                <div class="text-4xl font-bold text-yellow-600">
                  {{ inactive }}
                </div>
                <div class="text-sm text-yellow-600">Non attivi</div>
              </div>
            </div>
          </template>
        </Card>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });

interface StudentsStats {
  total: number;
  active: number;
}

// Inline fetch for now. Extract to a useDashboardStats() composable once the
// dashboard grows beyond a single endpoint.
const { $fetchApi } = useNuxtApp();

const stats = ref<StudentsStats | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Inactive = enrolled but not active, derived from the two counts.
const inactive = computed(() =>
  stats.value ? stats.value.total - stats.value.active : 0,
);

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await $fetchApi.get<{ data: StudentsStats }>("/students/stats");
    stats.value = res.data;
  } catch {
    error.value = "Impossibile caricare le statistiche.";
  } finally {
    loading.value = false;
  }
});
</script>
