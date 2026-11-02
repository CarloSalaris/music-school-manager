<template>
  <div
    class="mb-4 rounded-border border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 p-4"
  >
    <!-- Quick filters: always visible -->
    <div class="flex flex-wrap items-end gap-3">
      <ListFiltersField
        v-for="config in quickFilters"
        :key="config.field"
        :model="model"
        :config="config"
        :model-value="filtersStore.getFilterValue(model, config.field)"
        :class="config.type === 'text' ? 'min-w-64 flex-1' : 'w-48'"
        @update:model-value="onChange(config, $event)"
      />

      <div class="flex gap-2 ml-auto">
        <Button
          v-if="advancedFilters.length"
          label="Filtri avanzati"
          icon="pi pi-sliders-h"
          severity="secondary"
          :badge="activeAdvancedCount ? String(activeAdvancedCount) : undefined"
          :outlined="!advancedOpen"
          :aria-expanded="advancedOpen"
          :aria-controls="panelId"
          @click="advancedOpen = !advancedOpen"
        />
        <Button
          label="Reimposta"
          icon="pi pi-filter-slash"
          severity="secondary"
          text
          @click="onReset"
        />
      </div>
    </div>

    <!-- Advanced filters: collapsible panel -->
    <div
      v-show="advancedOpen"
      :id="panelId"
      class="grid gap-3 mt-4 pt-4 border-t border-surface-200 dark:border-surface-700 sm:grid-cols-2 lg:grid-cols-3"
    >
      <ListFiltersField
        v-for="config in advancedFilters"
        :key="config.field"
        :model="model"
        :config="config"
        :model-value="filtersStore.getFilterValue(model, config.field)"
        @update:model-value="onChange(config, $event)"
      />
    </div>
  </div>
</template>

<script setup>
import debounce from "lodash-es/debounce";

const SEARCH_DEBOUNCE_MS = 400;

// Generic filter bar for any list. Filter definitions are registered in
// FiltersStore by useList(service); this component only edits values and
// tells the page when to re-fetch. Usage:
//   <ListFilters :model="service.modelName" @change="applyFilters" />
const props = defineProps({
  model: { type: String, required: true },
});
const emit = defineEmits(["change"]);

const filtersStore = useFiltersStore();
const model = props.model;
const panelId = `${model}-advanced-filters`;

const configs = computed(() => filtersStore.getConfigs(model));
const quickFilters = computed(() => configs.value.filter((c) => c.quick));
const advancedFilters = computed(() => configs.value.filter((c) => !c.quick));

const activeAdvancedCount = computed(() => {
  const applied = filtersStore.getAppliedFilters(model);
  return advancedFilters.value.filter((c) => c.field in applied).length;
});

// Start expanded when advanced filters are already active (e.g. coming back)
const advancedOpen = ref(activeAdvancedCount.value > 0);

const emitChange = () => emit("change");
const emitChangeDebounced = debounce(emitChange, SEARCH_DEBOUNCE_MS);

function onChange(config, value) {
  filtersStore.setFilter(model, config.field, value);
  if ((config.type ?? "text") === "text") {
    emitChangeDebounced();
  } else {
    // Discrete choices apply immediately and supersede a pending search
    emitChangeDebounced.cancel();
    emitChange();
  }
}

function onReset() {
  emitChangeDebounced.cancel();
  filtersStore.clearFilters(model);
  emitChange();
}

onBeforeUnmount(() => emitChangeDebounced.cancel());
</script>
