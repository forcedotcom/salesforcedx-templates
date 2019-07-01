force-language-services
=======================

Code base to host the Salesforce CLI commands.

[![Version](https://img.shields.io/npm/v/force-language-services.svg)](https://npmjs.org/package/force-language-services)
[![CircleCI](https://circleci.com/gh/forcedotcom/force-language-services/tree/master.svg?style=shield)](https://circleci.com/gh/forcedotcom/force-language-services/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/forcedotcom/force-language-services?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/force-language-services/branch/master)
[![Codecov](https://codecov.io/gh/forcedotcom/force-language-services/branch/master/graph/badge.svg)](https://codecov.io/gh/forcedotcom/force-language-services)
[![Greenkeeper](https://badges.greenkeeper.io/forcedotcom/force-language-services.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/forcedotcom/force-language-services/badge.svg)](https://snyk.io/test/github/forcedotcom/force-language-services)
[![Downloads/week](https://img.shields.io/npm/dw/force-language-services.svg)](https://npmjs.org/package/force-language-services)
[![License](https://img.shields.io/npm/l/force-language-services.svg)](https://github.com/forcedotcom/force-language-services/blob/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g force-language-services
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
force-language-services/0.0.0 darwin-x64 node-v10.15.2
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx force:apex:class:create -n <string> [-d <string>] [-t <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forceapexclasscreate--n-string--d-string--t-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx force:lightning:component [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcelightningcomponent---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx force:lightning:event [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcelightningevent---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx force:lightning:interface [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcelightninginterface---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx force:project:create [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forceprojectcreate---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx force:visualforce:component [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcevisualforcecomponent---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx force:visualforce:page [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcevisualforcepage---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx force:apex:class:create -n <string> [-d <string>] [-t <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

create an Apex class 

```
USAGE
  $ sfdx force:apex:class:create -n <string> [-d <string>] [-t <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         [default:
                                                                                    /Users/amanda.stern/Desktop/force-la
                                                                                    nguage-services] folder for saving
                                                                                    the created files

  -n, --classname=classname                                                         (required) name of the generated
                                                                                    Apex class

  -t, --template=DefaultApexClass|ApexException|ApexUnitTest|InboundEmailService    [default: DefaultApexClass] template
                                                                                    to use for file creation

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  If not supplied, the apiversion, template, and outputdir use default values.
  The outputdir can be an absolute path or relative to the current working directory.

EXAMPLES
  $ sfdx force:apex:class:create -n MyClass
  $ sfdx force:apex:class:create -n MyClass -d classes
```

_See code: [src/commands/force/apex/class/create.ts](https://github.com/forcedotcom/force-language-services/blob/v0.0.0/src/commands/force/apex/class/create.ts)_

## `sfdx force:lightning:component [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
USAGE
  $ sfdx force:lightning:component [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation
```

_See code: [src/commands/force/lightning/component.ts](https://github.com/forcedotcom/force-language-services/blob/v0.0.0/src/commands/force/lightning/component.ts)_

## `sfdx force:lightning:event [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
USAGE
  $ sfdx force:lightning:event [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation
```

_See code: [src/commands/force/lightning/event.ts](https://github.com/forcedotcom/force-language-services/blob/v0.0.0/src/commands/force/lightning/event.ts)_

## `sfdx force:lightning:interface [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
USAGE
  $ sfdx force:lightning:interface [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation
```

_See code: [src/commands/force/lightning/interface.ts](https://github.com/forcedotcom/force-language-services/blob/v0.0.0/src/commands/force/lightning/interface.ts)_

## `sfdx force:project:create [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
USAGE
  $ sfdx force:project:create [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation
```

_See code: [src/commands/force/project/create.ts](https://github.com/forcedotcom/force-language-services/blob/v0.0.0/src/commands/force/project/create.ts)_

## `sfdx force:visualforce:component [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
USAGE
  $ sfdx force:visualforce:component [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation
```

_See code: [src/commands/force/visualforce/component.ts](https://github.com/forcedotcom/force-language-services/blob/v0.0.0/src/commands/force/visualforce/component.ts)_

## `sfdx force:visualforce:page [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
USAGE
  $ sfdx force:visualforce:page [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation
```

_See code: [src/commands/force/visualforce/page.ts](https://github.com/forcedotcom/force-language-services/blob/v0.0.0/src/commands/force/visualforce/page.ts)_
<!-- commandsstop -->
<!-- debugging-your-plugin -->
# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command: 
1. Start the inspector
  
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
<br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
Congrats, you are debugging!
