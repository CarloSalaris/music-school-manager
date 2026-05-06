import tailwindcss from "@tailwindcss/vite";
import Aura from "@primeuix/themes/aura";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-05-06",
  devtools: { enabled: true },

  // SPA mode — deliberate choice: management app behind auth, no SEO needed,
  // avoids hydration bugs
  ssr: false,

  // Tailwind CSS v4 via Vite plugin
  css: ["./app/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },

  // Modules
  modules: ["@pinia/nuxt", "@primevue/nuxt-module", "@nuxt/eslint"],

  // PrimeVue configuration
  primevue: {
    autoImport: true,
    options: {
      ripple: true,
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: ".dark-mode",
          cssLayer: {
            name: "primevue",
            order: "theme, base, primevue",
          },
        },
      },
    },
  },

  // Pinia persisted state
  pinia: {
    storesDirs: ["./app/stores/**"],
  },

  // Runtime config — API base URL
  runtimeConfig: {
    public: {
      apiBaseUrl: "http://localhost:8000/api",
    },
  },
});
