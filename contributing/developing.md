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

## Develop Plugin

Link your plugin to the sfdx cli

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

### Testing Plugin Locally

Add `"@salesforce/templates": "file:/path-to-packages-templates"` to the plugin's `package.json`.

## Develop Library

## Testing

Run the following to test:
`yarn test`

## Adding a new template
