# Base Web App

Base Web App is a minimal UI Bundle template for the Salesforce platform. It provides a static HTML entry point and UI Bundle metadata so you can deploy a simple UI Bundle or use it as a starting point for a custom build. It does not include a framework; it is HTML and configuration only.

## Layout

This directory is the **UI Bundle payload**. It contains:

| Path                          | Description                                                                                                                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ui-bundle.json`              | Web app config: `outputDir` (where the app content lives), routing, fallback.                                                                                                |
| `_uibundle.uibundle-meta.xml` | Salesforce UI Bundle metadata (label, description, version).                                                                                                                 |
| `src/`                        | **App content directory.** Matches `outputDir` in `ui-bundle.json`. Entry point is `src/index.html`; add other static assets (HTML, CSS, JS, images) under `src/` as needed. |

The nested `src/` is intentional: this folder holds the actual UI Bundle content (e.g. `index.html`). The platform uses `outputDir` from `ui-bundle.json` to know which subfolder contains the app.
