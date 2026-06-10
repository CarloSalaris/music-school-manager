import { defineStore } from "pinia";

export const useModalStore = defineStore("ModalStore", {
  state: () => ({
    loading: false,
    error: null as unknown,
    form: null as Record<string, unknown> | null,
    formOptions: null as Record<string, unknown> | null,
    extra: null as unknown,
  }),
  actions: {
    $reset() {
      this.loading = false;
      this.error = null;
      this.form = null;
      this.formOptions = null;
      this.extra = null;
    },
  },
});
