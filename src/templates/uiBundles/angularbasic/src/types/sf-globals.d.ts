/**
 * Build-time constants injected via esbuild `define`. Substituted by
 * @salesforce/angular-plugin-ui-bundle during build (see esbuild/api-version.mjs
 * and angular.json plugins[]).
 *
 * Without substitution, `@salesforce/sdk-data` and `@salesforce/ui-bundle`
 * fall back to "65.0" — the published packages contain the literal token.
 */
declare const __SF_API_VERSION__: string;
