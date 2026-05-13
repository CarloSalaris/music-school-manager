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

  const fetchList = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetchApi.post<ListApiResponse>(
        `${service.endpointApi}/index`,
        {},
        {
          params: {
            page: currentPage.value,
            sort: currentSort.value,
            direction: currentDirection.value,
            limit: limit.value,
          },
        },
      );

      list.value = response.data;
      pagination.value = response.pagination;

      // TODO: dispatch response.lookups to LookupStore when implemented
    } catch (err: unknown) {
      console.log("fetchList error:", err);
      error.value =
        (err as { error?: string })?.error ?? "Errore nel caricamento dei dati";
    } finally {
      loading.value = false;
    }
  };

  const setPage = (page: number) => {
    currentPage.value = page;
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

  const deactivateEventListeners = () => {
    activeListeners.forEach(({ event, handler }) =>
      useStopListen(event, handler),
    );
    activeListeners.length = 0;
  };

  // TODO: add FiltersStore integration (filters sent in POST body)
  // TODO: add fetchDelete(id)
  // TODO: add fetchMultiActions(action, ids)
  // TODO: add exportFile(format)

  return {
    list,
    loading,
    error,
    pagination,
    options,
    fetchList,
    setPage,
    setSort,
    activateEventListener,
    deactivateEventListeners,
  };
};
