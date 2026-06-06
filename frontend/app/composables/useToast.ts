export const toastSuccess = (
  text: string,
  options?: Record<string, unknown>,
) => {
  useNuxtApp().$toast.success(text, {
    autoClose: 2000,
    theme: "colored",
    ...options,
  });
};

export const toastError = (text: string, options?: Record<string, unknown>) => {
  useNuxtApp().$toast.error(text, {
    autoClose: 10000,
    theme: "colored",
    ...options,
  });
};

export const toastWarning = (
  text: string,
  options?: Record<string, unknown>,
) => {
  useNuxtApp().$toast.warning(text, {
    theme: "colored",
    dangerouslyHTMLString: true,
    ...options,
  });
};

export const toastInfo = (text: string, options?: Record<string, unknown>) => {
  useNuxtApp().$toast.info(text, {
    autoClose: 2000,
    theme: "colored",
    ...options,
  });
};
