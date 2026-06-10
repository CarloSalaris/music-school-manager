# Architecture

> 🚧 Work in progress — this document will be expanded as the project grows.

This file will document the key architectural decisions and patterns used in
Music School Manager: the reasoning behind each choice, the trade-offs
considered, and the alternatives that were rejected.

## Planned sections

- **Service-driven composables** — how `ServiceInterface` acts as a contract
  that `useList` and `useForm` consume
- **Modal-driven CRUD** — how the inner form component stays unaware of the modal
- **Recursive dirty tracking** — field-level change detection with `null`/`""` equality
- **Event bus** — `Model:action` convention for inter-component refresh
- **Stack decisions** — SPA mode, native fetch vs ofetch, pragmatic JS vs strict TS
  For the current feature overview and setup instructions, see [README.md](./README.md).
