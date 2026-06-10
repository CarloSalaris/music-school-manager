<template>
  <div class="p-2">
    <form @submit.prevent="onConfirm">
      <!-- Inner form component, loaded dynamically -->
      <component :is="resolvedComponent" />

      <!-- Footer with actions -->
      <div
        v-if="modalConfig.showFooter"
        class="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-gray-200"
      >
        <!-- Delete button (left) -->
        <div>
          <Button
            v-if="showDelete"
            type="button"
            label="Elimina"
            icon="pi pi-trash"
            severity="danger"
            outlined
            :disabled="loading"
            @click="onDelete"
          />
        </div>

        <!-- Submit button (right) -->
        <div class="flex gap-2">
          <Button
            type="submit"
            :label="modalConfig.confirmText"
            :loading="loading"
          />
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { inject } from "vue";

const dialogRef = inject<{ value: any }>("dialogRef");
const modalStore = useModalStore();

const modalConfig = computed(() => dialogRef?.value.data.modalConfig);
const submitForm = dialogRef?.value.data.submitForm;
const fetchDelete = dialogRef?.value.data.fetchDelete;

const loading = computed(() => modalStore.loading);
const form = computed(() => modalStore.form ?? {});

// Resolve the inner component by name (e.g. "StudentsForm")
const resolvedComponent = computed(() => {
  const c = modalConfig.value.component;
  return typeof c === "string" ? resolveComponent(c) : c;
});

// showDelete can be a boolean or a function of the form
const showDelete = computed(() => {
  const sd = modalConfig.value.showDelete;
  if (typeof sd === "function") return sd(form.value);
  return sd;
});

// Listen for programmatic close
onMounted(() => {
  useListen("GlobalModal:close", () => dialogRef?.value.close());
});

onBeforeUnmount(() => {
  useStopListen("GlobalModal:close");
});

async function onConfirm() {
  const submitOptions = {
    filterFields: true,
    notifyError: false,
    ...modalConfig.value.submitOptions,
  };

  const result = await submitForm(submitOptions, form.value);
  if (result) {
    modalStore.$patch({ form: toRaw(result) });
    dialogRef?.value.close({ action: "submit" });
  }
}

async function onDelete() {
  const result = await fetchDelete(form.value.id);
  if (result) {
    dialogRef?.value.close({ action: "delete" });
  }
}
</script>
