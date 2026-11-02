<template>
  <div class="flex flex-col gap-1">
    <label
      :for="inputId"
      class="text-sm font-medium text-surface-700 dark:text-surface-200"
    >
      {{ config.label }}
    </label>

    <IconField v-if="type === 'text'">
      <InputIcon class="pi pi-search" />
      <InputText
        :id="inputId"
        :model-value="modelValue ?? ''"
        class="w-full"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </IconField>

    <Select
      v-else-if="type === 'select'"
      :input-id="inputId"
      :model-value="modelValue"
      :options="config.options ?? []"
      option-label="label"
      option-value="value"
      placeholder="Tutti"
      show-clear
      class="w-full"
      @update:model-value="emit('update:modelValue', $event ?? null)"
    />

    <div v-else-if="type === 'dateRange'" class="flex gap-2">
      <DatePicker
        :input-id="inputId"
        :model-value="toDate(range[0])"
        :max-date="toDate(range[1]) ?? undefined"
        placeholder="Dal"
        date-format="dd/mm/yy"
        show-icon
        show-button-bar
        fluid
        @update:model-value="onRangeChange(0, $event)"
      />
      <DatePicker
        :model-value="toDate(range[1])"
        :min-date="toDate(range[0]) ?? undefined"
        :aria-label="`${config.label} (fino al)`"
        placeholder="Al"
        date-format="dd/mm/yy"
        show-icon
        show-button-bar
        fluid
        @update:model-value="onRangeChange(1, $event)"
      />
    </div>
  </div>
</template>

<script setup>
// Renders one filter input according to its FilterConfig type.
// Stateless: the value lives in FiltersStore, owned by the parent.
const props = defineProps({
  config: { type: Object, required: true },
  modelValue: { type: [String, Array], default: null },
});
const emit = defineEmits(["update:modelValue"]);

const type = computed(() => props.config.type ?? "text");
const inputId = computed(() => `filter-${props.config.field}`);
const range = computed(() =>
  Array.isArray(props.modelValue) ? props.modelValue : [null, null],
);

// Range ends are stored as local "YYYY-MM-DD" strings: serializing a Date
// to JSON would convert it to UTC and could shift the day by one.
function toDate(value) {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toIsoDate(date) {
  if (!(date instanceof Date)) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function onRangeChange(index, date) {
  const next = [...range.value];
  next[index] = toIsoDate(date);
  emit("update:modelValue", next);
}
</script>
