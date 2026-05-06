/**
 * Toast notification helpers.
 *
 * Thin wrappers around vue3-toastify (or whichever toast library is installed).
 * Centralizing here so every part of the app uses the same defaults.
 *
 * TODO: Install vue3-toastify and wire up in plugin.
 * For now, falls back to console so the app doesn't break during scaffolding.
 */

interface ToastOptions {
  autoClose?: number | false;
}

const DEFAULT_DURATION = 1500;

export function toastSuccess(message: string, options?: ToastOptions): void {
  // TODO: Replace with vue3-toastify toast.success()
  console.info(`[SUCCESS] ${message}`, options);
}

export function toastError(message: string, options?: ToastOptions): void {
  // TODO: Replace with vue3-toastify toast.error()
  console.error(`[ERROR] ${message}`, options);
}

export function toastWarning(message: string, options?: ToastOptions): void {
  // TODO: Replace with vue3-toastify toast.warning()
  console.warn(`[WARNING] ${message}`, options);
}
