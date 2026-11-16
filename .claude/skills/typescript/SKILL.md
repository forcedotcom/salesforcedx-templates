---
name: typescript
description: TypeScript coding standards; use when writing, reviewing, refactoring, or naming .ts files.
---

# TypeScript

- Explicit named exports; avoid new barrel files and `export *`.
- Await promises; avoid `void` for async calls.
- Prefer `undefined` over null or empty strings unless the external contract requires them.
- Prefer map/filter; avoid mutation and `any`.
- Derive types from the source of truth, e.g. `ReturnType`; avoid hand-written duplicates.
- Prefer string unions over new enums; avoid namespaces.
- Use types for exhaustive cases and internal invariants.
- Name `.ts` files in camelCase.
- Preserve comments when refactoring; fix or remove obsolete ones.
- Exported functions: single-line JSDoc when the name is unclear; omit params/return already expressed by TypeScript.
- Consider `Object.groupBy` / `Map.groupBy` instead of manual grouping.
- Drop empty-collection guards when find/some/every/map/filter/reduce already gives the same result.
- Return expressions directly unless a named local improves clarity.
