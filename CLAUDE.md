# Music School Manager — Project Guide

## Project overview
Internal management system for a small music school (~100-200 students, 10-15 teachers). Built as a portfolio showcase to demonstrate full-stack development patterns. Public GitHub repo evaluated by recruiters and senior developers.

## Stack

### Frontend (`frontend/`)
- **Nuxt 4** (SPA mode, `ssr: false`)
- **Vue 3 Composition API** with `<script setup>` — never Options API
- **Pinia** with `pinia-plugin-persistedstate` for state management
- **PrimeVue 4** with a custom Aura-based preset (`app/theme/preset.ts`) for UI components
- **Tailwind CSS v4** for styling (via `@tailwindcss/vite`)
- **tailwindcss-primeui** bridges PrimeVue design tokens into Tailwind utilities (`surface-*`, `text-muted-color`, `primary`)
- **TypeScript** strict in composables, services, types — pragmatic JS for plugins/utils where typing adds friction without value

### Backend (`backend/`)
- **Laravel 13** + PHP 8.5
- **MySQL 8**
- REST API with resource controllers, form requests, policies

## Language conventions
- **Italian** for all user-facing strings (labels, messages, errors, placeholders, page titles)
- **English** for code, comments, commit messages, README, ARCHITECTURE docs

## File naming conventions

### Components
Component file names must start with their parent folder name:
- ✅ `app/components/Students/StudentsForm.vue`
- ✅ `app/components/Students/StudentsListFilters.vue`
- ❌ `app/components/Students/Form.vue` (causes auto-import collisions)

This ensures unique auto-imported component names like `StudentsForm`, `StudentsListFilters`.

### Services
- `app/services/studentsService.ts` — concrete service implementing `ServiceInterface`
- `app/types/serviceInterface.ts` — the shared contract

### Stores
- `app/stores/auth.ts` exporting `useAuthStore` — file name lowercase, store name `useXxxStore` (Pinia id in PascalCase, e.g. `"UiStore"`)

### Shell, config & theme
- Structural/shell components use an `App` prefix: `AppTopbar`, `AppSidebar` (`app/components/`)
- `app/config/navigation.ts` — typed `NavItem[]` (`{ label, icon, to }`) consumed by the sidebar
- `app/theme/preset.ts` — the PrimeVue theme (single source of truth), wired in `nuxt.config.ts`

## Architectural patterns

### Service-driven composables
Every entity (Students, Teachers, Instruments...) defines a service that implements `ServiceInterface`. The service declares: API endpoint, model name, list columns, filters, fields. Composables `useList(service)` and `useForm(service)` consume that contract and provide pagination, sort, filter, dirty tracking, prefill from query params, file upload, and event-based refresh.

### Modal-driven CRUD
- `GlobalModal` is a generic modal that handles submit/delete/extra-button
- Inner form components (e.g. `StudentsForm`) only declare fields — no `<form>` tag, no submit/delete buttons, no router push
- `useModal()` opens a modal with a config (component to load, fields to prefill, submit options)
- `ModalStore` (Pinia) is the bridge between `GlobalModal` and the form component

### Dirty checking
Recursive comparison of declared fields only (those listed in `service.fields`). Treats `null` and `""` as equal. Logs differences when `debugDirty = true` for troubleshooting.

### Authorization (two levels, backend)
1. Route-level: which role can access which action (Policy on routes)
2. Entity-level: scoped queries auto-applied by user role (Policy on entity)

### Lookup store
Centralized Pinia store that caches dropdown/select options. Populated from API responses (every list/form response can include a `lookups` object).

### List filters
- Declared per entity in `service.filtersConfig` (`FilterConfig`): `quick: true` → always-visible bar, otherwise → collapsible "Filtri avanzati" panel.
- Rendered by the generic `List/ListFilters.vue` (`<ListFilters :model="service.modelName" @change="applyFilters" />`) — no per-entity filter components.
- `type` drives widget and default operator: `text` → `contains` (debounced), `select` → `equals` (static `options` until LookupStore exists), `dateRange` → `between` with `[from, to]` as `"YYYY-MM-DD"` strings, either end `null` (open range).
- `stores/filters.ts` (`useFiltersStore`) holds values per model; `useList` registers the config (`initFilters`) and sends `getAppliedFilters()` in the POST body as `{ filters: { field: { value, relative } } }`. `clearFilters` resets to defaults, not to empty.
- Virtual fields (e.g. `search` over nome + cognome) are allowed: the backend maps them to columns.
- Backend: controllers `use HandlesListQuery` and whitelist `filterable()` (field → `relative` + `columns`, or `apply` callback for derived fields such as a model scope) and `sortable()`. Unknown filters/operators → 422; unknown sort → default. Never pass request input to `orderBy` directly.

### Dates & derived fields
- Date-only values travel as local `"YYYY-MM-DD"` strings both ways: model casts `date:Y-m-d`, requests validate `date_format:Y-m-d`. Bind PrimeVue `DatePicker` through `parseIsoDate` / `toIsoDate` (`app/utils/dates.ts`) — never put a `Date` in a payload (JSON serializes it in UTC and shifts the day).
- Don't store values derivable from other columns (e.g. `is_minorenne` from `data_nascita`): expose them as an appended model accessor plus a query scope for filtering.

### Event bus for inter-component refresh
Convention: `Model:action` (e.g. `Students:refreshList`, `Students:refreshForm`). Used to trigger refresh in sibling components after CRUD operations.

### App shell
- `layouts/default.vue` holds the shell: `AppTopbar`, an overlay PrimeVue `Drawer` hosting `AppSidebar`, the page `<slot />`, and `<DynamicDialog />` (required for modal-driven CRUD — keep it).
- `stores/ui.ts` (`useUiStore`) holds `sidebarOpen` (not persisted).
- Close the sidebar as a reaction to route changes **in the layout**, not inside the nav-link click — mutating shell state during the click tears down the Drawer mid-navigation and breaks it.

### Theming & dark mode
- One source of truth: `app/theme/preset.ts` wraps Aura via `definePreset` with `PRIMARY` / `NEUTRAL` knobs (primitive palette names) — change the whole palette from two strings.
- Style custom markup with PrimeVue tokens (`surface-*`, `text-muted-color`, `bg-primary`, `ring-primary`) via `tailwindcss-primeui`, **not** hardcoded Tailwind grays, so it matches components in both schemes.
- Dark mode: `stores/theme.ts` (`useThemeStore`) toggles the `.dark-mode` class on `<html>` (persisted to localStorage, OS fallback) and is initialized by a client plugin. Tailwind's `dark:` variant is bound to `.dark-mode` via `@custom-variant` in `main.css` (not the OS media query). Pair `dark:` with surface levels one step apart to keep an elevation hierarchy.

### API calls
- `$fetchApi` (from `app/utils/fetchApi`) concatenates `apiBaseUrl + url`, so paths passed to it **start with a leading slash** (e.g. `$fetchApi.get("/students/stats")`); `service.endpointApi` follows the same rule.
- Responses are wrapped in `{ data: ... }`.

## Code style

### TypeScript usage
- **Strict TS** for: `app/types/`, `app/services/`, `app/composables/`, `app/stores/`
- **Pragmatic JS** for: plugins (`app/plugins/*.client.js`), simple utilities where typing adds friction without value
- Exception: `app/utils/fetchApi.ts` stays TypeScript — typed function signatures add real value for callers
- Avoid `any` in TS files — prefer `unknown`, proper unions, or specific types

### Styling
- Tailwind utility classes in templates
- PrimeVue components via auto-import (no manual import needed)
- Use PrimeVue design tokens (`surface-*`, `text-muted-color`, `primary`) for themed surfaces/text, not fixed Tailwind grays (`gray-*`, `bg-white`) — they adapt to light/dark automatically
- Avoid introducing new CSS frameworks without strong reason

### Vue patterns
- `<script setup>` only
- `defineProps` / `defineEmits`
- `storeToRefs(useXxxStore())` when destructuring stores for reactivity
- Composables for reusable logic, not mixins

## Things NOT to do
- Don't use Options API
- Don't import PrimeVue components manually (the Nuxt module auto-imports them)
- Don't put business logic in components — extract to composables or services
- Don't mix English and Italian in user-facing strings
- Don't write tests for trivial code — focus tests on composables and complex business logic
- Don't hardcode light-only colors (`bg-white`, `gray-*`) on themed surfaces — use PrimeVue tokens
- Don't pass paths without a leading slash to `$fetchApi`

## Local development
- Frontend dev server runs on **port 3000** only — the Laravel CORS config allows just `http://localhost:3000`. Start it with a plain `npm run dev` (never a positional port arg).
- Backend: `php artisan serve` on `:8000`; MySQL runs in a Docker container (start it first).
- Changes to `nuxt.config.ts`, `app/theme/preset.ts`, or Tailwind `@plugin`/`@custom-variant` require a dev server **restart** (HMR won't pick them up).

## Repository ethics
This is a portfolio project. The architectural patterns are the developer's own (co-developed with a senior in past work), but the implementation must be original. Do not copy code from any specific previous project — extract patterns, then rewrite from scratch.
