import cloneDeep from "lodash-es/cloneDeep";
import type { ServiceInterface } from "~/types/serviceInterface";

export const useForm = (service: ServiceInterface) => {
  const { $fetchApi } = useNuxtApp();

  const form = ref<Record<string, unknown>>({});
  const original = ref<Record<string, unknown>>({});
  const loading = ref(false);
  const error = ref<unknown>(null);

  // Builds empty form from service.fields
  function getInitForm(
    baseFields: Record<string, unknown> = {},
  ): Record<string, unknown> {
    const initialForm: Record<string, unknown> = {};

    for (const field of service.fields) {
      if (field.name in baseFields) {
        initialForm[field.name] = baseFields[field.name];
      } else if (field.default !== undefined) {
        initialForm[field.name] = field.default;
      } else {
        initialForm[field.name] = ""; // or NULL?
      }
    }
    return initialForm;
  }

  // Initialize empty form
  form.value = getInitForm();
  original.value = cloneDeep(form.value);

  // loads record from API or resets to empty form
  async function fetchForm(id?: number) {
    loading.value = true;
    error.value = null;

    // No id -> reset to empty form
    if (!id) {
      form.value = getInitForm();
      original.value = cloneDeep(form.value);
      loading.value = false;
      return;
    }

    try {
      const response = await $fetchApi.get<{ data: Record<string, unknown> }>(
        `${service.endpointApi}/view/${id}`,
      );

      form.value = { ...form.value, ...response.data }; // spread so if API returns partial data, default values are kept
      original.value = cloneDeep(form.value);

      // TODO: dispatch response.lookups to LookupStore when implemented
    } catch (err: unknown) {
      // console.log("fetchForm error:", err);
      error.value =
        (err as { error?: string })?.error ?? "Errore nel caricamento dei dati";
    } finally {
      loading.value = false;
    }
  }

  async function submitForm(
    submitOptions: Record<string, unknown> = {},
    subForm: Record<string, unknown> = form.value,
  ) {
    if (loading.value) return false;

    loading.value = true;
    error.value = null;

    const opts = {
      filterFields: false,
      action: subForm.id ? "edit" : "add",
      endpoint: service.endpointApi,
      notifySuccess: true,
      notifyError: true,
      successMessage: "Salvato",
      ...submitOptions,

      // TODO: add redirect options when implementing page-based forms
      // redirectAfterAdd: true,
      // redirectAfterEdit: null,
      // TODO: add updateForm option for controlling post-submit behavior
      // updateForm: true,
    };

    try {
      // Filter to only declared fields if requested
      let payload: Record<string, unknown> = {};
      if (opts.filterFields) {
        payload = {};
        for (const field of service.fields) {
          if (field.name in subForm) {
            payload[field.name] = subForm[field.name];
          }
        }
      } else {
        payload = subForm;
      }

      const idSuffix = subForm.id ? `/${subForm.id}` : "";
      const url = `${service.endpointApi}/${opts.action}${idSuffix}`;

      const response = await $fetchApi.post<{ data: Record<string, unknown> }>(
        url,
        payload,
      );

      if (opts.notifySuccess) {
        toastSuccess(opts.successMessage as string);
      }

      // Update form with response data and reset dirty tracking
      form.value = { ...form.value, ...response.data };
      original.value = cloneDeep(form.value);

      return response.data;
    } catch (err: unknown) {
      // console.log("submitForm error:", err);
      error.value = err;
      if (opts.notifyError) {
        toastError(
          (err as { error?: string })?.error ?? "Errore nel salvataggio",
        );
      }
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchDelete(
    id: number,
    deleteOptions: { askConfirm?: boolean } = {},
  ) {
    const opts = {
      askConfirm: true,
      ...deleteOptions,
    };

    if (opts.askConfirm) {
      const res = await useDangerConfirm("Confermi l'eliminazione?");
      if (!res) return false;
    }

    loading.value = true;
    error.value = null;

    try {
      await $fetchApi.delete(`${service.endpointApi}/delete`, { id });
      toastSuccess("Elemento eliminato");
      return true;
    } catch (err: unknown) {
      // console.log("fetchDelete error:", err);
      error.value = err;
      toastError("Errore durante l'eliminazione");
      return false;
    } finally {
      loading.value = false;
    }
  }

  // DIRTY TRACKING
  // Compares original with current form to detect changes, chacking only declared fields (service.fields)

  const debugDirty = false; // Set to true to log dirty fields details

  function isDirty(attribute?: string): boolean {
    if (attribute) {
      const origValue = original.value[attribute];
      const formValue = form.value[attribute];
      const dirty = !_isEqual(origValue, formValue);

      if (dirty && debugDirty) {
        console.log(
          `Field "${attribute}" changed from "${origValue}" to "${formValue}"`,
        );
      }

      return dirty;
    }

    // Check all allowed fields
    const allowed = _getAllowedFields();
    for (const key of Object.keys(allowed)) {
      if (!_isEqual(original.value[key], form.value[key])) {
        if (debugDirty) {
          console.log(`Dirty field: ${key}`, {
            original: original.value[key],
            form: form.value[key],
          });
        }

        return true;
      }
    }

    return false;
  }

  function _isEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;

    // null, undefined and "" treated as equal
    if (
      (a === null || a === undefined || a === "") &&
      (b === null || b === undefined || b === "")
    )
      return true;

    // Date comparison
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }

    // Object comparison
    if (typeof a === "object" && typeof b === "object") {
      return _isEqual(a, b);
    }

    return false;
  }

  function _getAllowedFields(): Record<string, unknown> {
    const allowedFields = service.fields.reduce(
      (acc, f) => {
        if (!f.ignore) acc[f.name] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );
    return allowedFields;
  }

  const formIsDirty = computed(() => isDirty());

  function resetDirty() {
    original.value = cloneDeep(form.value);
  }

  async function onFormLeave(): Promise<boolean> {
    if (isDirty()) {
      const res = await useConfirm(
        "Ci sono modifiche non salvate. Vuoi uscire senza salvare?",
      );
      if (!res) return false;
    }
    form.value = {};
    return true;
  }

  return {
    form,
    original,
    loading,
    error,
    getInitForm,
    fetchForm,
    submitForm,
    fetchDelete,
    isDirty,
    formIsDirty,
    resetDirty,
    onFormLeave,
  };
};
