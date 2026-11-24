---
name: verification
description: Verify code changes before finishing; use after code edits or when reporting test results.
---

# Verification

Claude hooks compile after Edit/Write; Stop runs compile, lint, test when `.claude/.edit-marker` exists. Failed verification retains the marker; success clears it. Recursive stops skip verification.

- Without Claude hooks, run `yarn compile`, `yarn lint`, `yarn test` from repo root.
- Install dependencies in each checkout with `yarn install`; keep `node_modules` in that checkout.
- Fresh checkout: `yarn build` populates npm-backed templates needed by tests.
- Single test: `yarn vitest run test/path/to/file.test.ts`.
- Report commands actually run and failures still unresolved.
- Call a failure pre-existing only after reproducing it on the base commit.
