# salesforcedx-templates

[![Known Vulnerabilities](https://snyk.io/test/github/forcedotcom/salesforcedx-templates/badge.svg)](https://snyk.io/test/github/forcedotcom/salesforcedx-templates)
[![License](https://img.shields.io/npm/l/salesforcedx-templates.svg)](https://github.com/forcedotcom/salesforcedx-templates/blob/master/package.json)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Introduction

This repository provides:

- [@salesforce/templates](https://www.npmjs.com/package/@salesforce/templates) to support the library and [Salesforce VS Code extensions](https://github.com/forcedotcom/salesforcedx-vscode/).

### Consumer build requirements (e.g. salesforcedx-vscode)

Repos that **bundle** `@salesforce/templates` (e.g. with esbuild) and use a templates manifest must:

1. **Copy built-in templates into the bundle output** before the bundle step that runs `generateTemplatesManifest`. The published package includes templates at `lib/templates`. You can copy from that path, or use the exported path:
   - `getBuiltinTemplatesPath` (returns the resolved path to `lib/templates` when not on the web platform; `undefined` on web).
2. **Wireit / task order**: Ensure the script that populates `dist/templates` (or your equivalent) runs **before** the `vscode:bundle` (or similar) task. Otherwise the bundle step will fail with `ENOENT: no such file or directory, scandir '.../dist/templates'`.

Template paths inside the package are kept short (via placeholders in `lib/templates`) so they stay within Windows path limits used by `pack:verify`.

## Getting Started

If you're interested in contributing, take a look at the [CONTRIBUTING](CONTRIBUTING.md) guide.

If you're interested in building the library locally, take a look at the development [doc](contributing/developing.md).

You can find more information about commands that the related [plugin](https://github.com/salesforcecli/plugin-templates) provides in the [commands](COMMANDS.md) doc.

## Bump DEFAULT_API_VERSION

`DEFAULT_API_VERSION` is maintained in `src/utils/constants.ts`. Please bump the value every time there is a major release.
