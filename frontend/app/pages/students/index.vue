<template>
  <div class="max-w-6xl mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
        Allievi
      </h1>
      <Button
        label="Aggiungi allievo"
        severity="primary"
        icon="pi pi-plus"
        @click="onAdd"
      />
    </div>

    <!-- Outside the loading/error states so inputs keep focus while fetching -->
    <StudentsFilters @change="applyFilters" />

    <div v-if="error" class="text-red-600 py-4">{{ error }}</div>

    <div v-else>
      <p class="text-sm text-muted-color mb-3">
        {{ pagination.total }} allievi trovati
      </p>
      <DataTable
        :value="list"
        lazy
        paginator
        :rows="pagination.per_page"
        :first="(pagination.current_page - 1) * pagination.per_page"
        :total-records="pagination.total"
        :sort-field="currentSort"
        :sort-order="currentDirection === 'ASC' ? 1 : -1"
        row-hover
        selection-mode="single"
        :rows-per-page-options="[10, 25, 50]"
        :loading="loading"
        paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        current-page-report-template="Visualizzazione {first} a {last} di {totalRecords} allievi"
        @page="onPage"
        @sort="onSort"
        @row-select="onRowSelect"
      >
        <template #empty>
          <p class="text-muted-color py-4 text-center">
            Nessun allievo corrisponde ai filtri selezionati
          </p>
        </template>
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
import { markRaw } from "vue";
import studentsService from "~/services/studentsService";
import StudentsForm from "~/components/Students/StudentsForm.vue";

definePageMeta({
  layout: "default",
});

const {
  list,
  loading,
  error,
  pagination,
  currentSort,
  currentDirection,
  fetchList,
  setPage,
  setLimit,
  setSort,
  applyFilters,
  activateEventListener,
  deactivateEventListener,
} = useList(studentsService);

// DataTable is lazy: paging and sorting are delegated to the server via useList
function onPage(event) {
  if (event.rows !== pagination.value.per_page) {
    setLimit(event.rows);
  } else {
    setPage(event.page + 1);
  }
}

function onSort(event) {
  setSort(event.sortField, event.sortOrder === 1 ? "ASC" : "DESC");
}

const modal = useModal();
const modalConfig = {
  title: "$$ allievo",
  model: "students",
  component: markRaw(StudentsForm),
  event: "Students:refreshList",
  size: "lg",
};
function onAdd() {
  modal.open({
    ...modalConfig,
  });
}

function onEdit(id) {
  modal.open({
    ...modalConfig,
    id,
    showDelete: true,
  });
}

function onRowSelect(event) {
  onEdit(event.data.id);
}

onMounted(() => {
  activateEventListener();
  fetchList();
  // console.log(list);
});

onBeforeUnmount(() => {
  deactivateEventListener();
});
</script>
