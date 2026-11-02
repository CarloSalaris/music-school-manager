import type { ServiceInterface, Row } from "~/types/serviceInterface";

interface Pagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

interface ListApiResponse {
  data: Row[];
  pagination: Pagination;
  // TODO: add lookups here when LookupStore is implemented
}

export const useList = (service: ServiceInterface) => {
  const { $fetchApi } = useNuxtApp();
  const filtersStore = useFiltersStore();
  const authStore = useAuthStore();

  // Register this model's filters (minus those hidden for the current role)
  const role = authStore.userRole;
  filtersStore.initFilters(
    service.modelName,
    service
      .filtersConfig({ role })
      .filter((config) => !config.excludedRoles?.includes(role)),
  );
  if (service.quickFilters) {
    filtersStore.setPresets(service.modelName, service.quickFilters);
  }

  const list = ref<Row[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<Pagination>({
    total: 0,
    per_page: service.perPage ?? 50,
    current_page: 1,
    last_page: 1,
  });

  // TODO: populate from API response lookups via LookupStore
  const options = ref<Record<string, unknown>>({});

  const currentPage = ref(1);
  const currentSort = ref(service.sortBy[0]);
  const currentDirection = ref<"ASC" | "DESC">(service.sortBy[1]);
  const limit = ref(service.perPage ?? 50);

  // Tracks active event subscriptions to prevent double-registration
  const activeListeners: Array<{
    event: string;
    handler: (e: unknown) => void;
  }> = [];

  const getEventName = () => `${service.modelName}:refreshList`;

  // Only the latest request may write the list: with debounced filters an
  // older, slower response could otherwise overwrite a newer one.
  let lastRequestId = 0;

  const fetchList = async () => {
    const requestId = ++lastRequestId;
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetchApi.post<ListApiResponse>(
        `${service.endpointApi}/index`,
        { filters: filtersStore.getAppliedFilters(service.modelName) },
        {
          params: {
            page: currentPage.value,
            sort: currentSort.value,
            direction: currentDirection.value,
            limit: limit.value,
          },
        },
      );
      if (requestId !== lastRequestId) return;

      list.value = response.data;
      pagination.value = response.pagination;

      // TODO: dispatch response.lookups to LookupStore when implemented
    } catch (err: unknown) {
      if (requestId !== lastRequestId) return;
      console.log("fetchList error:", err);
      error.value =
        (err as { error?: string })?.error ?? "Errore nel caricamento dei dati";
    } finally {
      if (requestId === lastRequestId) loading.value = false;
    }
  };

  const setPage = (page: number) => {
    currentPage.value = page;
    fetchList();
  };

  const setLimit = (value: number) => {
    limit.value = value;
    currentPage.value = 1;
    fetchList();
  };

  /** Re-fetches from the first page after a filter change. */
  const applyFilters = () => {
    currentPage.value = 1;
    fetchList();
  };

  const setSort = (field: string, direction?: "ASC" | "DESC") => {
    currentSort.value = field;
    currentDirection.value =
      direction ?? (currentDirection.value === "ASC" ? "DESC" : "ASC");
    currentPage.value = 1;
    fetchList();
  };

  const activateEventListener = () => {
    const eventName = getEventName();
    if (activeListeners.some((l) => l.event === eventName)) return;

    const handler = () => fetchList();
    useListen(eventName, handler);
    activeListeners.push({ event: eventName, handler });
  };

  const deactivateEventListener = () => {
    activeListeners.forEach(({ event, handler }) =>
      useStopListen(event, handler),
    );
    activeListeners.length = 0;
  };

  // TODO: add fetchDelete(id)
  // TODO: add fetchMultiActions(action, ids)
  // TODO: add exportFile(format)

  return {
    list,
    loading,
    error,
    pagination,
    options,
    currentSort,
    currentDirection,
    fetchList,
    setPage,
    setLimit,
    setSort,
    applyFilters,
    activateEventListener,
    deactivateEventListener,
  };
};
