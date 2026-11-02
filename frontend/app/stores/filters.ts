/**
 * FiltersStore — filter state for every list, keyed by model name.
 *
 * Entity-agnostic: a list registers its filter definitions (from the
 * service's `filtersConfig`) via `initFilters`, filter components write
 * values with `setFilter`, and `useList` reads `getAppliedFilters` to build
 * the request body. Values survive in-app navigation, so returning to a list
 * restores the filters the user left there.
 */
import { defineStore } from "pinia";
import type {
  AppliedFilter,
  FilterConfig,
  FilterPreset,
  FilterRelative,
  FilterType,
  FilterValue,
} from "~/types/serviceInterface";

const DEFAULT_RELATIVE: Record<FilterType, FilterRelative> = {
  text: "contains",
  select: "equals",
  dateRange: "between",
};

const isFilled = (value: FilterValue): boolean =>
  Array.isArray(value)
    ? value.some((v) => v !== null && v !== "")
    : value !== null && value !== "";

const relativeOf = (config: FilterConfig): FilterRelative =>
  config.defaultRelative ?? DEFAULT_RELATIVE[config.type ?? "text"];

// Copy range defaults so the store never mutates the service config's array.
const cloneValue = (value: FilterValue): FilterValue =>
  Array.isArray(value) ? [value[0], value[1]] : value;

interface FiltersState {
  configs: Record<string, FilterConfig[]>;
  values: Record<string, Record<string, FilterValue>>;
  presets: Record<string, FilterPreset[]>;
}

export const useFiltersStore = defineStore("FiltersStore", {
  state: (): FiltersState => ({
    configs: {},
    values: {},
    presets: {},
  }),

  getters: {
    getConfigs:
      (state) =>
      (model: string): FilterConfig[] =>
        state.configs[model] ?? [],

    getFilterValue:
      (state) =>
      (model: string, field: string): FilterValue =>
        state.values[model]?.[field] ?? null,

    /** Filters that pass their `applyWhen` check, ready for the API body. */
    getAppliedFilters:
      (state) =>
      (model: string): Record<string, AppliedFilter> => {
        const applied: Record<string, AppliedFilter> = {};
        for (const config of state.configs[model] ?? []) {
          const value = state.values[model]?.[config.field] ?? null;
          const shouldApply = config.applyWhen ?? isFilled;
          if (shouldApply(value)) {
            applied[config.field] = { value, relative: relativeOf(config) };
          }
        }
        return applied;
      },

    getPresets:
      (state) =>
      (model: string): FilterPreset[] =>
        state.presets[model] ?? [],
  },

  actions: {
    /**
     * Registers a model's filters and seeds missing values with defaults.
     * Values already set (e.g. coming back to the list) are kept.
     */
    initFilters(model: string, configs: FilterConfig[]) {
      const current = this.values[model] ?? {};
      this.configs[model] = configs;
      this.values[model] = Object.fromEntries(
        configs.map((config) => [
          config.field,
          config.field in current
            ? (current[config.field] ?? null)
            : cloneValue(config.default ?? null),
        ]),
      );
    },

    setFilter(model: string, field: string, value: FilterValue) {
      this.values[model] = { ...this.values[model], [field]: value };
    },

    /** Resets every filter of the model to its configured default. */
    clearFilters(model: string) {
      this.values[model] = Object.fromEntries(
        (this.configs[model] ?? []).map((config) => [
          config.field,
          cloneValue(config.default ?? null),
        ]),
      );
    },

    setPresets(model: string, presets: FilterPreset[]) {
      this.presets[model] = presets;
    },
  },
});
