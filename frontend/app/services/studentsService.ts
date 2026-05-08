/**
 * studentsService — service definition for the Students entity.
 *
 * Implements ServiceInterface to define:
 * - API endpoint
 * - List columns (what appears in the data table)
 * - Filters (how the list can be filtered)
 * - Fields (form structure, defaults, dirty tracking)
 *
 * This file is consumed by:
 * - useList(studentsService) → paginated list with sort/filter
 * - useForm(studentsService) → CRUD form with dirty tracking
 * - useModal → dynamically imports this via modelName
 */
import type { ServiceInterface } from "~/types/serviceInterface";

const studentsService: ServiceInterface = {
  endpointApi: "/students",
  modelName: "Students",

  listConfig: {
    title: "Allievi",
    columns: [
      {
        label: "Cognome",
        field: "cognome",
        sort: { field: "cognome", defaultDirection: "ASC" },
      },
      {
        label: "Nome",
        field: "nome",
        sort: { field: "nome" },
      },
      {
        label: "Email",
        field: "email",
      },
      {
        label: "Telefono",
        field: "telefono",
      },
      {
        label: "Strumento",
        field: "instrument_name",
      },
      {
        label: "Stato",
        field: "attivo",
        formatter: "boolean",
        class: (row) => (row.attivo ? "text-green-600" : "text-red-500"),
        sort: { field: "attivo" },
      },
    ],
    actions: [
      {
        icon: "fas fa-trash",
        title: "Elimina",
        action: "delete",
        special: { action: "delete" },
      },
    ],
  },

  filtersConfig: (_user) => {
    const filters = [
      {
        field: "search",
        label: "Cerca",
        type: "text",
        quick: true,
      },
      {
        field: "attivo",
        label: "Stato",
        type: "select",
        lookup: "Students__attivo",
        quick: true,
        default: "1",
      },
      {
        field: "instrument_id",
        label: "Strumento",
        type: "select",
        lookup: "Instruments__list",
      },
    ];

    return filters;
  },

  sortBy: ["cognome", "ASC"],
  perPage: 50,

  fields: [
    { name: "id", ignore: true },
    { name: "nome" },
    { name: "cognome" },
    { name: "email" },
    { name: "telefono" },
    { name: "data_nascita" },
    { name: "codice_fiscale" },
    { name: "indirizzo" },
    { name: "citta" },
    { name: "cap" },
    { name: "is_minorenne", default: false },
    { name: "genitore_nome" },
    { name: "genitore_cognome" },
    { name: "genitore_telefono" },
    { name: "genitore_email" },
    { name: "instrument_id" },
    { name: "attivo", default: true },
    { name: "note" },
  ],
};

export default studentsService;
