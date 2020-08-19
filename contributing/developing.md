# Developing

1. Clone the repository, and `cd` into it.

```sh
git clone git@github.com:forcedotcom/salesforcedx-templates.git
```

2. Ensure you have [Yarn](https://yarnpkg.com/) installed and run the following to build:

```
yarn install
yarn build
```

## Developing Plugin

To test plugin locally, use `bin/run` in place of `sfdx`. For example:

```sh
./bin/run force:apex:class:create --classname 'TestClass' --template 'DefaultApexClass' --outputdir ./testsoutput/myApex/
```

To test plugin locally with SFDX, add `"@salesforce/templates": "file://path/to/packages/templates"` to the plugin's `package.json`.

Link your plugin to the sfdx cli:

```sh
sfdx plugins:link .
```

Verify plugin is linked:

```sh
sfdx plugins
```

### Debugging your plugin

We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command:

If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch:

```sh-session
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```

Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:

```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program.
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
   <br><img src="../.images/vscodeScreenshot.png" width="480" height="278"><br>
   Congrats, you are debugging!

## Developing Library

Adding a new template:

1. Define a new template type in `TemplateType`, and add available template options extending `TemplateOptions` in library [types](../packages/templates/src/utils/types.ts).
2. Create a generator extending [`SfdxGenerator`](../packages/templates/src/generators/sfdxGenerator.ts) in [generators](../packages/templates/src/generators) folder. Take a look at [`ApexClassGenerator`](../packages/templates/src/generators/apexClassGenerator.ts) for example.

- generator class file should default export a generator class extending SfdxGenerator
- generator class file should have a name same as the template type's name, except with the first letter lowercased

## Testing

Run the following to test library and plugin:

```sh
yarn test
```

If you are using VS Code for development, the following launch configurations are available: "Run All Tests", "Run Current Test", "Run Current Test Without Compile". Have `"debug.javascript.usePreview": true` in your user setting enabled so you can utilize [`vscode-js-debug`](https://github.com/microsoft/vscode-js-debug) debugger. This setting is enabled by default in VS Code version 1.47.
