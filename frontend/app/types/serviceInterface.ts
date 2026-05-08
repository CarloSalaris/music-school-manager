/**
 * ServiceInterface — the contract that every entity service must implement.
 *
 * This is the backbone of the application architecture. The composables
 * `useList` and `useForm` consume this contract to provide:
 * - Paginated lists with sort, filter, column rendering
 * - CRUD forms with defaults, dirty tracking, prefill from query params
 * - Event-based refresh between components
 *
 * Each entity (Students, Teachers, Instruments...) creates a concrete service
 * that satisfies this interface. The composables don't know which entity
 * they're working with — they only know the contract.
 *
 * ## Key decisions vs. original codebase:
 * - `Function` → typed callbacks with explicit signatures
 * - `any` → `unknown` or specific types where possible
 * - Row type is `Record<string, unknown>` because the shape depends on the entity
 * - FieldDefault uses a union of realistic types instead of `any`
 */

// ---------------------------------------------------------------------------
// Row — generic record type for list items returned by the API
// ---------------------------------------------------------------------------

/** A single row from the API list response. Shape depends on the entity. */
export type Row = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Fields — define form structure, defaults, and submit behavior
// ---------------------------------------------------------------------------

/** Realistic types for field defaults. */
export type FieldDefault = string | number | boolean | null | unknown[];

export interface FieldConfig {
  /** Field name — must match the API payload key */
  name: string;

  /** Default value for new records. If omitted, defaults to "" */
  default?: FieldDefault;

  /** Nested fields (e.g. for address sub-object) */
  fields?: FieldConfig[];

  /**
   * If true, this field is excluded from dirty tracking.
   * Useful for computed/display-only fields.
   */
  ignore?: boolean;

  /**
   * If true, allows this field to be pre-filled from query params.
   * URL: /students/add?prefill_department_id=3
   */
  allowPrefill?: boolean;
}

// ---------------------------------------------------------------------------
// List columns — define how each column renders in the data table
// ---------------------------------------------------------------------------

export interface ColumnSortConfig {
  field: string;
  defaultDirection?: "ASC" | "DESC";
}

export interface ColumnFilterConfig {
  field: string;
  type: string;
}

export interface ListColumn {
  /** Display label in the table header */
  label: string;

  /** Optional HTML label (overrides label) */
  labelHtml?: string;

  /**
   * How to extract the cell value from a row.
   * - string: direct field name (e.g. "cognome")
   * - function: computed value (e.g. row => `${row.nome} ${row.cognome}`)
   */
  field: string | ((row: Row) => unknown);

  /**
   * Named formatter to apply to the value before display.
   * Examples: "date", "currency", "boolean"
   * The ListIndex component maps these to formatting functions.
   */
  formatter?: string;

  /** CSS class for the cell — static string or dynamic based on row */
  class?: string | ((row: Row) => string);

  /** CSS class for the <th> header */
  thClass?: string;

  /** Sort configuration for this column */
  sort?: ColumnSortConfig;

  /** Filter configuration for this column */
  filter?: ColumnFilterConfig;

  /** Whether clicking this cell should NOT trigger row click */
  disableRowClick?: boolean;

  /** Whether the cell value can be copied to clipboard */
  copiable?: ((row: Row) => boolean);

  /** If set, clicking the cell applies this value as a quick filter */
  directFilter?: ((row: Row) => { field: string; value: unknown });

  /** Dynamic sub-components to render inside the cell */
  dynamic?: ((row: Row) => unknown)[];

  /** Custom URL to wrap the cell value in a link */
  customUrl?: ((row: Row) => string);

  /** Conditionally hide the entire column */
  hide?: ((row: Row) => boolean);
}

// ---------------------------------------------------------------------------
// List actions — row-level action buttons (edit, delete, custom...)
// ---------------------------------------------------------------------------

export interface ListActionSpecial {
  action: string;
  options?: Record<string, unknown>;
}

export interface ListAction {
  /** FontAwesome icon class (e.g. "fas fa-edit") */
  icon: string;

  /** Tooltip/title text */
  title: string;

  /** Action identifier emitted on click */
  action: string;

  /** Built-in special behavior (e.g. { action: "delete" }) */
  special?: ListActionSpecial;

  /** Conditionally hide this action for specific rows */
  hide?: ((row: Row) => boolean);
}

// ---------------------------------------------------------------------------
// Multi actions — bulk operations on selected rows
// ---------------------------------------------------------------------------

export interface MultiAction {
  label: string;
  action: string;
  hide?: (() => boolean);
}

// ---------------------------------------------------------------------------
// Filters — define available filters for the list
// ---------------------------------------------------------------------------

export interface FilterConfig {
  /** Field name sent to the API */
  field: string;

  /** Display label */
  label?: string;

  /** Default filter value. Defaults to "" */
  default?: FieldDefault;

  /**
   * Default comparison operator.
   * Examples: "contains", "equals", "gte", "lte"
   * Defaults to "contains"
   */
  defaultRelative?: string;

  /**
   * Filter input type.
   * Examples: "text", "select", "date", "dateRange", "boolean"
   */
  type?: string;

  /** Lookup key for select-type filters (e.g. "Departments__list") */
  lookup?: string;

  /** Roles that should NOT see this filter */
  excludedRoles?: string[];

  /** If true, this filter is always visible (not in "advanced" panel) */
  quick?: boolean;

  /**
   * Custom function to decide if the filter value should be applied.
   * Defaults to: (value) => value !== null && value !== ""
   */
  applyWhen?: ((value: unknown) => boolean);
}

/**
 * Filters can depend on the current user's role.
 * Example: admin sees all filters, agent sees only their own.
 */
export type FiltersConfigFn = (user: { role: string }) => FilterConfig[];

// ---------------------------------------------------------------------------
// ServiceInterface — the main contract
// ---------------------------------------------------------------------------

export interface ServiceInterface {
  /** API endpoint base path (e.g. "/students") */
  endpointApi: string;

  /**
   * Model name used for:
   * - Event bus naming convention: "Students:refreshList"
   * - Dynamic service import in useModal: `services/${modelName}Service.ts`
   */
  modelName: string;

  /** Whether to show saved filter presets */
  showPresets?: boolean;

  /** List/table configuration */
  listConfig: {
    /** Page title displayed above the table */
    title: string;

    /** Column definitions */
    columns: ListColumn[];

    /** Row-level configuration */
    row?: {
      /** Dynamic CSS classes for the entire row */
      getClasses?: ((row: Row) => string);
    };

    /** Row-level action buttons */
    actions?: ListAction[];

    /** Whether a row can be selected (for multi-actions) */
    selectable?: ((row: Row) => boolean);
  };

  /** Quick filter presets (e.g. "Active only", "This month") */
  quickFilters?: { label: string; filters: Record<string, unknown> }[];

  /** Filter definitions — function receives current user */
  filtersConfig: FiltersConfigFn;

  /** Bulk operations available when rows are selected */
  multiActions?: MultiAction[];

  /** Default sort: [field, direction] */
  sortBy: [string, "ASC" | "DESC"];

  /** Items per page. Defaults to 50 in useList */
  perPage?: number;

  /** Field definitions — used by useForm for init, dirty tracking, submit */
  fields: FieldConfig[];
}
