# force-language-services

Code base to host the Salesforce CLI commands.

[![CircleCI](https://circleci.com/gh/forcedotcom/force-language-services/tree/master.svg?style=shield)](https://circleci.com/gh/forcedotcom/force-language-services/tree/master)
[![Codecov](https://codecov.io/gh/forcedotcom/force-language-services/branch/master/graph/badge.svg)](https://codecov.io/gh/forcedotcom/force-language-services)
[![Known Vulnerabilities](https://snyk.io/test/github/forcedotcom/force-language-services/badge.svg)](https://snyk.io/test/github/forcedotcom/force-language-services)
[![License](https://img.shields.io/npm/l/force-language-services.svg)](https://github.com/forcedotcom/force-language-services/blob/master/package.json)

<!-- toc -->
* [force-language-services](#force-language-services)
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
* [`sfdx force:apex:trigger:create -n <string> [-d <string>] [-e <string>] [-s <string>] [-t <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forceapextriggercreate--n-string--d-string--e-string--s-string--t-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx force:lightning:app:create -n <string> [-d <string>] [-t <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcelightningappcreate--n-string--d-string--t-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx force:lightning:component:create -n <string> [-d <string>] [-t <string>] [--type <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcelightningcomponentcreate--n-string--d-string--t-string---type-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx force:lightning:event:create -n <string> [-d <string>] [-t <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcelightningeventcreate--n-string--d-string--t-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx force:lightning:interface:create -n <string> [-d <string>] [-t <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcelightninginterfacecreate--n-string--d-string--t-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx force:visualforce:component:create -n <string> -l <string> [-d <string>] [-t <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forcevisualforcecomponentcreate--n-string--l-string--d-string--t-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

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

  -t, --template=ApexException|ApexUnitTest|DefaultApexClass|InboundEmailService    [default: DefaultApexClass] template
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

## `sfdx force:apex:trigger:create -n <string> [-d <string>] [-e <string>] [-s <string>] [-t <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

create an Apex trigger

```
USAGE
  $ sfdx force:apex:trigger:create -n <string> [-d <string>] [-e <string>] [-s <string>] [-t <string>] [--apiversion 
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir
      [default: /Users/amanda.stern/Desktop/force-language-services] folder for saving the created files

  -e, --triggerevents=before insert|before update|before delete|after insert|after update|after delete|after undelete
      [default: before insert] events that fire the trigger

  -n, --triggername=triggername
      (required) name of the generated Apex trigger

  -s, --sobject=sobject
      [default: SOBJECT] sObject to create a trigger on

  -t, --template=ApexTrigger
      [default: ApexTrigger] template to use for file creation

  --apiversion=apiversion
      override the api version used for api requests made by this command

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

DESCRIPTION
  If not supplied, the apiversion, template, and outputdir use default values.
  The outputdir can be an absolute path or relative to the current working directory.

EXAMPLES
  $ sfdx force:apex:trigger:create -n MyTrigger
  $ sfdx force:apex:trigger:create -n MyTrigger -s Account -e 'before insert, after upsert'
  $ sfdx force:apex:trigger:create -n MyTrigger -d triggers
```

_See code: [src/commands/force/apex/trigger/create.ts](https://github.com/forcedotcom/force-language-services/blob/v0.0.0/src/commands/force/apex/trigger/create.ts)_

## `sfdx force:lightning:app:create -n <string> [-d <string>] [-t <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

create a Lightning app

```
USAGE
  $ sfdx force:lightning:app:create -n <string> [-d <string>] [-t <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         [default:
                                                                                    /Users/amanda.stern/Desktop/force-la
                                                                                    nguage-services] folder for saving
                                                                                    the created files

  -n, --appname=appname                                                             (required) name of the generated
                                                                                    Lightning app

  -t, --template=DefaultLightningApp                                                [default: DefaultLightningApp]
                                                                                    template to use for file creation

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  If not supplied, the apiversion, template, and outputdir use default values.
  The outputdir can be an absolute path or relative to the current working directory.
  If you don’t specify an outputdir, we create a subfolder in your current working directory with the name of your 
  bundle. For example, if the current working directory is force-app and your Lightning bundle is called myBundle, we 
  create force-app/myBundle/ to store the files in the bundle.

EXAMPLES
  $ sfdx force:lightning:app:create -n myapp
  $ sfdx force:lightning:app:create -n myapp -d aura
```

_See code: [src/commands/force/lightning/app/create.ts](https://github.com/forcedotcom/force-language-services/blob/v0.0.0/src/commands/force/lightning/app/create.ts)_

## `sfdx force:lightning:component:create -n <string> [-d <string>] [-t <string>] [--type <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

create a bundle for an Aura component or a Lightning web component

```
USAGE
  $ sfdx force:lightning:component:create -n <string> [-d <string>] [-t <string>] [--type <string>] [--apiversion 
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         [default:
                                                                                    /Users/amanda.stern/Desktop/force-la
                                                                                    nguage-services] folder for saving
                                                                                    the created files

  -n, --componentname=componentname                                                 (required) name of the generated
                                                                                    Lightning component

  -t, --template=                                                                   [default: DefaultLightningCmp]
                                                                                    template to use for file creation

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

  --type=aura|lwc                                                                   [default: aura] type of the
                                                                                    Lightning component

DESCRIPTION
  If not supplied, the apiversion, template, and outputdir use default values.
  The outputdir can be an absolute path or relative to the current working directory.
  If you don’t specify an outputdir, we create a subfolder in your current working directory with the name of your 
  bundle. For example, if the current working directory is force-app and your Lightning bundle is called myBundle, we 
  create force-app/myBundle/ to store the files in the bundle.
  To create a Lightning web component, pass --type lwc to the command. If you don’t include a --type value, Salesforce 
  CLI creates an Aura component by default.

EXAMPLES
  $ sfdx force:lightning:component:create -n mycomponent
  $ sfdx force:lightning:component:create -n mycomponent --type lwc
  $ sfdx force:lightning:component:create -n mycomponent -d aura
  $ sfdx force:lightning:component:create -n mycomponent --type lwc -d lwc
```

_See code: [src/commands/force/lightning/component/create.ts](https://github.com/forcedotcom/force-language-services/blob/v0.0.0/src/commands/force/lightning/component/create.ts)_

## `sfdx force:lightning:event:create -n <string> [-d <string>] [-t <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

create a Lightning event

```
USAGE
  $ sfdx force:lightning:event:create -n <string> [-d <string>] [-t <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         [default:
                                                                                    /Users/amanda.stern/Desktop/force-la
                                                                                    nguage-services] folder for saving
                                                                                    the created files

  -n, --eventname=eventname                                                         (required) name of the generated
                                                                                    Lightning event

  -t, --template=DefaultLightningEvt                                                [default: DefaultLightningEvt]
                                                                                    template to use for file creation

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  If not supplied, the apiversion, template, and outputdir use default values.
  The outputdir can be an absolute path or relative to the current working directory.
  If you don’t specify an outputdir, we create a subfolder in your current working directory with the name of your 
  bundle. For example, if the current working directory is force-app and your Lightning bundle is called myBundle, we 
  create force-app/myBundle/ to store the files in the bundle.

EXAMPLES
  $ sfdx force:lightning:app:create -n myevent
  $ sfdx force:lightning:event:create -n myevent -d aura
```

_See code: [src/commands/force/lightning/event/create.ts](https://github.com/forcedotcom/force-language-services/blob/v0.0.0/src/commands/force/lightning/event/create.ts)_

## `sfdx force:lightning:interface:create -n <string> [-d <string>] [-t <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

create a Lightning interface

```
USAGE
  $ sfdx force:lightning:interface:create -n <string> [-d <string>] [-t <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         [default:
                                                                                    /Users/amanda.stern/Desktop/force-la
                                                                                    nguage-services] folder for saving
                                                                                    the created files

  -n, --interfacename=interfacename                                                 (required) name of the generated
                                                                                    Lightning interface

  -t, --template=DefaultLightningIntf                                               [default: DefaultLightningIntf]
                                                                                    template to use for file creation

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  If not supplied, the apiversion, template, and outputdir use default values.
  The outputdir can be an absolute path or relative to the current working directory.
  If you don’t specify an outputdir, we create a subfolder in your current working directory with the name of your 
  bundle. For example, if the current working directory is force-app and your Lightning bundle is called myBundle, we 
  create force-app/myBundle/ to store the files in the bundle.

EXAMPLES
  $ sfdx force:lightning:interface:create -n myinterface
  $ sfdx force:lightning:interface:create -n myinterface -d aura
```

_See code: [src/commands/force/lightning/interface/create.ts](https://github.com/forcedotcom/force-language-services/blob/v0.0.0/src/commands/force/lightning/interface/create.ts)_

## `sfdx force:visualforce:component:create -n <string> -l <string> [-d <string>] [-t <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

create a Visualforce component

```
USAGE
  $ sfdx force:visualforce:component:create -n <string> -l <string> [-d <string>] [-t <string>] [--apiversion <string>] 
  [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         [default:
                                                                                    /Users/amanda.stern/Desktop/force-la
                                                                                    nguage-services] folder for saving
                                                                                    the created files

  -l, --label=label                                                                 (required) Visualforce component
                                                                                    label

  -n, --componentname=componentname                                                 (required) name of the generated
                                                                                    Visualforce component

  -t, --template=DefaultVFComponent                                                 [default: DefaultVFComponent]
                                                                                    template to use for file creation

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  If not supplied, the apiversion, template, and outputdir use default values.
  The outputdir can be an absolute path or relative to the current working directory.
  Name and label are required.

EXAMPLES
  $ sfdx force:visualforce:component:create -n mycomponent -l mylabel
  $ sfdx force:visualforce:component:create -n mycomponent -l mylabel -d components
```

_See code: [src/commands/force/visualforce/component/create.ts](https://github.com/forcedotcom/force-language-services/blob/v0.0.0/src/commands/force/visualforce/component/create.ts)_
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
