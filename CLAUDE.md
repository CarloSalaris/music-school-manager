# Music School Manager — Project Guide

## Project overview
Internal management system for a small music school (~100-200 students, 10-15 teachers). Built as a portfolio showcase to demonstrate full-stack development patterns. Public GitHub repo evaluated by recruiters and senior developers.

## Stack

### Frontend (`frontend/`)
- **Nuxt 4** (SPA mode, `ssr: false`)
- **Vue 3 Composition API** with `<script setup>` — never Options API
- **Pinia** with `pinia-plugin-persistedstate` for state management
- **PrimeVue 4** with Aura theme for UI components
- **Tailwind CSS v4** for styling (via `@tailwindcss/vite`)
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
- `app/stores/auth.ts` exporting `useAuthStore` — file name lowercase, store name `useXxxStore`

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

### Event bus for inter-component refresh
Convention: `Model:action` (e.g. `Students:refreshList`, `Students:refreshForm`). Used to trigger refresh in sibling components after CRUD operations.

## Code style

### TypeScript usage
- **Strict TS** for: `app/types/`, `app/services/`, `app/composables/`, `app/stores/`
- **Pragmatic JS** for: plugins (`app/plugins/*.client.js`), simple utilities where typing adds friction without value
- Exception: `app/utils/fetchApi.ts` stays TypeScript — typed function signatures add real value for callers
- Avoid `any` in TS files — prefer `unknown`, proper unions, or specific types

### Styling
- Tailwind utility classes in templates
- PrimeVue components via auto-import (no manual import needed)
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

## Repository ethics
This is a portfolio project. The architectural patterns are the developer's own (co-developed with a senior in past work), but the implementation must be original. Do not copy code from any specific previous project — extract patterns, then rewrite from scratch.
