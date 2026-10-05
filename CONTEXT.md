# Templates modernization

## Language

**Release hold**:
The gate keeping `@salesforce/templates` 67 unpublished through the compatibility work in WIs 14 (ESM), 18 (exports), and 20 (VS Code i18n); no 67 publish until WI 20.

**test-bundle canary**:
The esbuild artifact consumed by Salesforce VS Code extensions, used as the bundling canary in WI 15.

**Payload**:
The 192 template files shipped with `@salesforce/templates`, located relative to the module via `__dirname` (CJS) or `import.meta.dirname` (ESM).

**Deep import**:
An import of a package-internal path instead of a public export, such as plugin-templates' `lib/i18n/index.js` import (WIs 16–17).

**plugin-templates**:
The Salesforce CLI consumer of `@salesforce/templates` in `salesforcecli/plugin-templates`.
