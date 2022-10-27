# Developing

## Get Started

1. Clone the repository, and `cd` into it.

```sh
git clone git@github.com:forcedotcom/salesforcedx-templates.git
```

2. Ensure you have [Yarn](https://yarnpkg.com/) installed and run the following to build:

```
yarn install
yarn build
```

## Branches

- We work off of `main` and we release (aka. _production_) branch is `main`.
- Our work happens in _topic_ branches (feature and/or bug-fix).
  - feature as well as bug-fix branches are based on `main`
    - _Topic_ branches can live in forks (external contributors) or within this repository (committers).
      \*\* When creating _topic_ branches in this repository please prefix with `<developer-name>/`.
  - branches _should_ be kept up-to-date using `rebase`
  - see below for further merge instructions

### Merging between branches

- We try to limit merge commits as much as possible.

  - They are usually only ok when done by our release automation.

- _Topic_ branches are:

  1. based on `main` and will be
  1. squash-merged into `main`.

- Hot-fix branches are an exception.
  - Instead we aim for faster cycles and a generally stable `develop` branch.

### Making Pull Requests

Take a look at [CONTRIBUTING](../CONTRIBUTING.md) doc for making and merging pull requests.

## Developing the Library

Adding a new template:

1. Define a new template type in `TemplateType`, and add available template options extending `TemplateOptions` in library [types](../packages/templates/src/utils/types.ts).
2. Create a generator extending [`SfdxGenerator`](../packages/templates/src/generators/sfdxGenerator.ts) in [generators](../packages/templates/src/generators) folder. Take a look at [`ApexClassGenerator`](../packages/templates/src/generators/apexClassGenerator.ts) for an example.

- Generator class file should default export a generator class extending `SfdxGenerator`
- Generator class file should have a name same as the template type's name, except with the first letter lowercased

Consider adding a corresponding command for your new template to be invoked with the CLI in the plugin for templates [here](https://github.com/salesforcecli/plugin-templates).

## Testing

Run the following to test the library:

```sh
yarn test
```

If you are using VS Code for development, the following launch configurations are available: "Run All Tests", "Run Current Test", "Run Current Test Without Compile". Have `"debug.javascript.usePreview": true` in your user setting enabled so you can utilize [`vscode-js-debug`](https://github.com/microsoft/vscode-js-debug) debugger. This setting is enabled by default in VS Code version 1.47.
