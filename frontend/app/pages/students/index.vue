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
      <DataTable
        :value="list"
        :paginator="true"
        :rows="10"
        :rows-per-page-options="[10, 25, 50]"
        :loading="loading"
        paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        current-page-report-template="Visualizzazione {first} a {last} di {totalRecords} allievi"
      >
        <Column field="nome" header="Nome" :sortable="true" />
        <Column field="cognome" header="Cognome" :sortable="true" />
        <Column field="email" header="Email" :sortable="true" />
        <Column field="telefono" header="Telefono" :sortable="true" />
        <Column field="attivo" header="Attivo" :sortable="true">
          <template #body="{ data }">
            <span v-if="data.attivo">
              <i class="pi pi-check text-green-500" />
            </span>
            <span v-else><i class="pi pi-times text-red-500" /></span>
          </template>
        </Column>
      </DataTable>
      <!-- <pre
        class="bg-gray-50 rounded border border-gray-200 p-4 overflow-auto text-xs"
        >{{ JSON.stringify(list, null, 2) }}</pre
      > -->
    </div>
  </div>
</template>

<script setup>
import studentsService from "~/services/studentsService";

definePageMeta({
  layout: "default",
});

const { list, loading, error, pagination, fetchList } =
  useList(studentsService);

onMounted(() => {
  fetchList();
  console.log(list);
});
</script>
