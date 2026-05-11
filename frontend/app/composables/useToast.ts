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
