import PrimeVue from "primevue/config";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import OverlayPanel from "primevue/overlaypanel";
import Skeleton from "primevue/skeleton";
import Chip from "primevue/chip";
import Tooltip from "primevue/tooltip";
import DynamicDialog from "primevue/dynamicdialog";
import DialogService from "primevue/dialogservice";
import { useDialog } from "primevue/usedialog";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, {
    zIndex: {
      modal: 1100,
      overlay: 1060,
      menu: 1000,
      tooltip: 1100,
    },
    locale: {
      dayNames: [
        "Domenica",
        "Lunedi",
        "Martedì",
        "Mercoledì",
        "Giovedì",
        "Venerdì",
        "Sabato",
      ],
      dayNamesMin: ["Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa"],
      dayNamesShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
      monthNamesShort: [
        "Gen",
        "Feb",
        "Mar",
        "Apr",
        "Mag",
        "Giu",
        "Lug",
        "Ago",
        "Set",
        "Ott",
        "Nov",
        "Dic",
      ],
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
    },
  });

  nuxtApp.vueApp.use(DialogService);

  // Register components globally
  nuxtApp.vueApp.component("DataTable", DataTable);
  nuxtApp.vueApp.component("Column", Column);
  nuxtApp.vueApp.component("ColumnGroup", ColumnGroup);
  nuxtApp.vueApp.component("Row", Row);
  nuxtApp.vueApp.component("OverlayPanel", OverlayPanel);
  nuxtApp.vueApp.component("Skeleton", Skeleton);
  nuxtApp.vueApp.component("Chip", Chip);
  nuxtApp.vueApp.component("DynamicDialog", DynamicDialog);

  // Register directive
  nuxtApp.vueApp.directive("tooltip", Tooltip);

  // Provide useDialog globally
  nuxtApp.provide("useDialog", useDialog);
});
