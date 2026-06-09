# Base React App

Base React App is a template application that demonstrates how to build a React UI Bundle on the Salesforce platform with Vite, TypeScript, Tailwind, shadcn/ui, and the Salesforce UI Bundle SDK. It provides a minimal shell (home, 404), routing, and GraphQL codegen support so feature apps can extend it via the patches pipeline.

This UI Bundle lives inside an SFDX project. The project root is the directory that contains `force-app/` and `sfdx-project.json`. Run the commands in the sections below from the paths indicated.

## Table of contents

- [Run (development)](#run-development)
- [Build](#build)
- [Deploy](#deploy)
- [Test](#test)

## Run (development)

From the UI Bundle directory (`force-app/main/default/uiBundles/base-react-app`):

```bash
npm install
npm run dev
```

This starts the Vite dev server (e.g. http://localhost:5173). Use `npm run dev:design` to run in design mode.

## Build

From the UI Bundle directory:

```bash
npm install
npm run build
```

The production build is written to `dist/` inside the UI Bundle folder. Deploy using the steps in [Deploy](#deploy).

## Deploy

From the **SFDX project root** (the directory that contains `force-app/`):

1. Build the UI Bundle:

   ```bash
   cd force-app/main/default/uiBundles/base-react-app && npm install && npm run build && cd -
   ```

2. Deploy the UI Bundle only:

   ```bash
   sf project deploy start --source-dir force-app/main/default/ui-bundles --target-org <alias>
   ```

   Or deploy all metadata:

   ```bash
   sf project deploy start --source-dir force-app --target-org <alias>
   ```

   Replace `<alias>` with your target org alias.

## Test

From the UI Bundle directory:

```bash
npm install
npm run test
```

This runs the unit test suite (Vitest). For end-to-end tests from the **base-react-app package root**:

```bash
npm run test:e2e
```

This installs dependencies, builds with E2E asset rewrites, and runs Playwright. Ensure Chromium is installed (`npx playwright install chromium` if needed).
