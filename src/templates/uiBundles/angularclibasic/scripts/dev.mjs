/**
 * Dev-server wrapper.
 *
 * Resolves runtime values from the plugin once, then spawns `ng serve` with
 * the right CLI flags to propagate them through Angular's build pipeline.
 *
 * Phase 1 — `--define=__SF_API_VERSION__=<value>`:
 *   Angular CLI propagates `--define` to BOTH the application esbuild pass AND
 *   Vite's `optimizeDeps` prebundle. The esbuild plugin registered in
 *   `angular.json` plugins[] handles the application pass but does NOT reach
 *   Vite's prebundle (that's a separate esbuild invocation). Without --define,
 *   @salesforce/sdk-data and @salesforce/ui-bundle in the prebundle keep the
 *   literal `__SF_API_VERSION__` token and fall back to "65.0" at runtime.
 *   `--define` is one of the few options the :application builder forwards to
 *   `Vite optimizeDeps.esbuildOptions.define`.
 *
 * Phase 2 — `--port=<value>`:
 *   `getPort()` reads `SF_UIBUNDLE_PORT` (or DEFAULT_PORT = 5173). Angular CLI
 *   could pin this in `angular.json`, but we centralize on the plugin so future
 *   phases (Phase 4 proxy target, Phase 6 Code Builder basePath) read the same
 *   source of truth — the dev server, the proxy, and the injected `<base href>`
 *   must all agree on the port.
 *
 * `npm run build` does NOT need this wrapper — production builds bundle app +
 * deps in a single esbuild pass that the plugins[] entry covers, and there is
 * no dev server to configure.
 */
import { spawn } from 'node:child_process';
import { createApiVersionPlugin, getPort } from '@salesforce/angular-plugin-ui-bundle';

const { version } = await createApiVersionPlugin();
const port = getPort();

// Double JSON.stringify: once because esbuild's `define` requires the value to
// be valid JS source (so `"68.0"` not `68.0`), once because the shell strips
// one set of quotes when interpreting the CLI flag.
const defineArg = `__SF_API_VERSION__=${JSON.stringify(JSON.stringify(version))}`;

const child = spawn(
  'ng',
  ['serve', `--define=${defineArg}`, `--port=${port}`],
  {
    stdio: 'inherit',
    shell: true,
  },
);

child.on('exit', (code) => process.exit(code ?? 0));
