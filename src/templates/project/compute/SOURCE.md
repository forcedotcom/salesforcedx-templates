# Compute project template sources

The `node/` and `python/` folders are snapshots of the Heroku AppLink getting-started reference apps
(Apache-2.0, Copyright Salesforce, Inc.), pinned by commit:

| Language | Repository                                                     | Commit                                     |
| -------- | -------------------------------------------------------------- | ------------------------------------------ |
| node     | heroku-reference-apps/applink-getting-started-nodejs           | 173aa4a95d1ef412d46c1f27b808103545ac2d7f   |
| python   | heroku-reference-apps/applink-getting-started-python           | 8db54051187f74f341e200a2876a5c47dc1c98c1   |

Changes from upstream (matching the deprecated `sf compute generate` command):

- Removed repository-governance files: `CODEOWNERS`, `LICENSE.txt`, `SECURITY.md`, `CODE_OF_CONDUCT.md`,
  `CONTRIBUTING.md`; node: `app.json` (deploy-button manifest) and `test/routes/`; python: `app/routers/`
  and `tests/routers/` (example endpoints).
- Replaced with starter versions that have no example endpoints: `project.toml` (new), `api-spec.yaml`,
  `README.md`, node `src/routes/index.js` and `test/routes/healthcheck.test.js`, python `app/main.py`.
  These use the EJS variable `appname` for the app name.
- `bin/invoke.sh` / `bin/invoke.py`: default endpoints repointed from the example routes to routes that exist
  in the starter (`/api/accounts/` -> `/health`, `/accounts` -> `/healthcheck`, `/unitofwork` -> `/hello`).
- Added what the `compute-develop` skill's scaffold script (`generate.py`) adds on top of `sf compute generate`, so the
  skill can rely on this template alone: an app-level `.forceignore` (`node_modules/`, `.tap/`, `.git/`,
  `__pycache__/`, `target/`, `vendor/`); node `package.json` sets tap's `allow-incomplete-coverage` (tap
  defaults to requiring 100% coverage, so `npm test` exits 1 on the starter); python `.python-version` is 3.12
  (upstream pins 3.13). The External Client App files in `eca/` are written only when a
  contact email is given.
- `.gitignore` is stored as `gitignore` (npm drops `.gitignore` files when publishing); the generator
  writes it back as `.gitignore`.

To refresh a snapshot: fetch the new commit, reapply the changes above, and update the commit here.
