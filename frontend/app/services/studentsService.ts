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

  filtersConfig: (_user) => [
    // Quick filters — always visible
    {
      // Virtual field: the backend matches every word against nome/cognome
      field: "search",
      label: "Cerca per nome o cognome",
      type: "text",
      quick: true,
    },
    {
      field: "attivo",
      label: "Stato",
      type: "select",
      options: [
        { label: "Attivi", value: "1" },
        { label: "Non attivi", value: "0" },
      ],
      quick: true,
      default: "1",
    },

    // Advanced filters — collapsible panel
    {
      field: "is_minorenne",
      label: "Minorenne",
      type: "select",
      options: [
        { label: "Sì", value: "1" },
        { label: "No", value: "0" },
      ],
    },
    {
      field: "data_nascita",
      label: "Data di nascita",
      type: "dateRange",
      default: [null, null],
    },
  ],

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
    { name: "attivo", default: true },
    { name: "note" },
  ],
};

export default studentsService;
