import DialogService from "primevue/dialogservice";
import Tooltip from "primevue/tooltip";
import { useDialog } from "primevue/usedialog";

const italianLocale = {
  dayNames: ["Domenica", "Lunedi", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
  dayNamesMin: ["Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa"],
  dayNamesShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
  monthNamesShort: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
  monthNames: [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ],
};

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(DialogService);
  nuxtApp.vueApp.directive("tooltip", Tooltip);

  // Set Italian locale on the PrimeVue config already registered by @primevue/nuxt-module
  const primevue = nuxtApp.vueApp.config.globalProperties.$primevue;
  if (primevue?.config) {
    Object.assign(primevue.config.locale, italianLocale);
  }

  nuxtApp.provide("useDialog", useDialog);
});
