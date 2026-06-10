import tailwindcss from "@tailwindcss/vite";
import Aura from "@primeuix/themes/aura";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-05-06",
  devtools: { enabled: true },

  app: {
    head: {
      title: "Music School Manager",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Music school internal management system",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
      ],
    },
  },

  // SPA mode — deliberate choice: management app behind auth, no SEO needed,
  // avoids hydration bugs
  ssr: false,

  // Tailwind CSS v4 via Vite plugin
  css: ["primeicons/primeicons.css", "./app/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },

  // Modules
  modules: [
    "@pinia/nuxt",
    "@primevue/nuxt-module",
    "@nuxt/eslint",
    "@vueuse/nuxt",
  ],

  // PrimeVue configuration
  primevue: {
    autoImport: true,
    composables: {
      exclude: ["useConfirm"], // Uses custom in useAlert.ts
    },
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
  // Pinia storesDirs not needed: Nuxt 4 auto-imports from app/stores/ by default.
  // Setting it with the wrong path actually breaks auto-import.
  /* pinia: {
  storesDirs: ["./stores/**"],
}, */

  // Runtime config — API base URL
  runtimeConfig: {
    public: {
      apiBaseUrl: "http://localhost:8000/api",
    },
  },
});
