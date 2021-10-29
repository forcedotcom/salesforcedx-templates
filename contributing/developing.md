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

## Developing Plugin

To test plugin locally, use `bin/run` in place of `sfdx`. For example:

```sh
./bin/run force:apex:class:create --classname 'TestClass' --template 'DefaultApexClass' --outputdir ./testsoutput/myApex/
```

To test plugin locally with Salesforce CLI, add `"@salesforce/templates": "file://path/to/packages/templates"` to the plugin's `package.json`.

Link your plugin to Salesforce CLI:

```sh
sfdx plugins:link .
```

Verify plugin is linked:

```sh
sfdx plugins
```

### Debugging Your Plugin

We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command:

1. If you linked your plugin to the Salesforce CLI, call your command with the `dev-suspend` switch:

```sh-session
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```

Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:

```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code.
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration is selected.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program.
6. Hit the green play button at the top middle of VS Code (this play button is to the right of the play button that you clicked in step #5).
   <br><img src="../.images/vscodeScreenshot.png" width="480" height="278"><br>
   Congrats, you are debugging!

## Developing Library

Adding a new template:

1. Define a new template type in `TemplateType`, and add available template options extending `TemplateOptions` in library [types](../packages/templates/src/utils/types.ts).
2. Create a generator extending [`SfdxGenerator`](../packages/templates/src/generators/sfdxGenerator.ts) in [generators](../packages/templates/src/generators) folder. Take a look at [`ApexClassGenerator`](../packages/templates/src/generators/apexClassGenerator.ts) for an example.

- Generator class file should default export a generator class extending `SfdxGenerator`
- Generator class file should have a name same as the template type's name, except with the first letter lowercased

## Testing

Run the following to test library and plugin:

```sh
yarn test
```

If you are using VS Code for development, the following launch configurations are available: "Run All Tests", "Run Current Test", "Run Current Test Without Compile". Have `"debug.javascript.usePreview": true` in your user setting enabled so you can utilize [`vscode-js-debug`](https://github.com/microsoft/vscode-js-debug) debugger. This setting is enabled by default in VS Code version 1.47.
