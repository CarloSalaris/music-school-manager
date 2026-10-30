<template>
  <div v-if="form" class="flex flex-col gap-4">
    <!-- Dati anagrafici -->
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-surface-700 dark:text-surface-200">Nome *</label>
        <InputText v-model="form.nome" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-surface-700 dark:text-surface-200">Cognome *</label>
        <InputText v-model="form.cognome" />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-surface-700 dark:text-surface-200">Email</label>
        <InputText v-model="form.email" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-surface-700 dark:text-surface-200">Telefono</label>
        <InputText v-model="form.telefono" />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-surface-700 dark:text-surface-200">Data di nascita</label>
        <DatePicker
          v-model="form.data_nascita"
          date-format="dd/mm/yy"
          show-icon
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-surface-700 dark:text-surface-200">Codice fiscale</label>
        <InputText v-model="form.codice_fiscale" />
      </div>
    </div>

    <!-- Stato attivo -->
    <div class="flex items-center gap-2">
      <Checkbox v-model="form.attivo" :binary="true" input-id="attivo" />
      <label for="attivo" class="text-sm text-surface-700 dark:text-surface-200">Allievo attivo</label>
    </div>

    <!-- Note -->
    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium text-surface-700 dark:text-surface-200">Note</label>
      <Textarea v-model="form.note" rows="3" />
    </div>
  </div>
</template>

<script setup>
const modalStore = useModalStore();

// The form reads from the ModalStore — it doesn't know it's inside a modal.
// useModal() has already loaded the data here before opening GlobalModal.
const form = computed(() => modalStore.form ?? {});
</script>
