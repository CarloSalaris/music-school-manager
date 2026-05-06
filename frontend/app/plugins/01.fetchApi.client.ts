/**
 * Plugin: fetchApi registration
 *
 * Provides $fetchApi globally via useNuxtApp().
 * The actual logic lives in utils/fetchApi.ts — this plugin
 * only registers it as a Nuxt-provided dependency.
 */
import { fetchApi } from "~/utils/fetchApi";

export default defineNuxtPlugin(() => {
  return {
    provide: {
      fetchApi,
    },
  };
});
