import GlobalModal from "~/components/GlobalModal.vue";
import type { Component } from "vue";

interface ModalConfig {
  id?: number;
  title: string;
  model: string;
  event: string;
  component: string | Component;
  fields?: Record<string, unknown>;
  prefill?: Record<string, unknown>;
  submitOptions?: Record<string, unknown>;
  confirmText?: string;
  showDelete?: boolean | ((form: Record<string, unknown>) => boolean);
  showFooter?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  onClose?: (data: ModalCloseData) => void;
}

interface ModalCloseData {
  action: string;
  form: Record<string, unknown>;
}

export const useModal = () => {
  const modalStore = useModalStore();
  const dialog = useDialog();

  async function open(config: ModalConfig) {
    const modalConfig = {
      component: config.component,
      id: config.id ?? null,
      title: config.title.replace("$$", config.id ? "Modifica" : "Aggiungi"),
      model: config.model,
      event: config.event,
      fields: config.fields ?? {},
      prefill: config.prefill ?? {},
      submitOptions: config.submitOptions ?? {},
      confirmText: config.confirmText ?? "Conferma",
      showDelete: config.showDelete ?? false,
      showFooter: config.showFooter ?? true,
      size: config.size ?? "md",
      onClose: config.onClose,
    };

    // Dynamically import the correct service
    const importedService = (
      await import(`~/services/${modalConfig.model}Service.ts`)
    ).default;

    // Create a useForm instance and load the record
    const formInstance = useForm(importedService);
    await formInstance.fetchForm(modalConfig.id ?? undefined);

    // For new records, apply prefill/fields defaults
    if (!formInstance.form.value.id) {
      formInstance.form.value = formInstance.getInitForm({
        ...modalConfig.fields,
        ...modalConfig.prefill,
      });
    }

    // Push data into the store for GlobalModal and the inner form to read
    // Assigning directly (no $patch) to avoid signaled error on form
    modalStore.form = toRaw(formInstance.form.value); // toRaw to avoid Vue reactivity
    modalStore.loading = formInstance.loading.value;
    modalStore.error = formInstance.error.value;

    // Open the dialog
    dialog.open(GlobalModal, {
      props: {
        header: modalConfig.title,
        modal: true,
        style: { width: sizeToWidth(modalConfig.size) },
      },
      data: {
        modalConfig,
        submitForm: formInstance.submitForm,
        fetchDelete: formInstance.fetchDelete,
      },
      onClose: (options) => {
        const closeData: ModalCloseData = {
          action: options?.data?.action ?? "",
          form: modalStore.form ?? {},
        };
        modalConfig.onClose?.(closeData);
        if (modalConfig.event) {
          sendEvent(modalConfig.event, closeData.form);
        }
        modalStore.$reset();
      },
    });
  }

  function close() {
    sendEvent("GlobalModal:close");
  }

  return { open, close };
};

function sizeToWidth(size: string): string {
  const map: Record<string, string> = {
    sm: "25rem",
    md: "40rem",
    lg: "55rem",
    xl: "70rem",
  };
  return map[size] ?? "40rem"; //Default to md
}
