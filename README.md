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
force-language-services/0.0.0 darwin-x64 node-v12.4.0
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
<<<<<<< HEAD
* [`sfdx hello:org [-n <string>] [-f] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-helloorg--n-string--f--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
=======
* [`sfdx force:apex:class:create -n <string> [-d <string>] [-t <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forceapexclasscreate--n-string--d-string--t-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx force:apex:trigger:create -n <string> [-d <string>] [-e <string>] [-s <string>] [-t <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-forceapextriggercreate--n-string--d-string--e-string--s-string--t-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
>>>>>>> 8f7f213... apex trigger started and apex class edits made

## `sfdx hello:org [-n <string>] [-f] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

print a greeting and your org IDs

```
USAGE
  $ sfdx hello:org [-n <string>] [-f] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --force                                                                       example boolean flag
  -n, --name=name                                                                   name to print

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -v, --targetdevhubusername=targetdevhubusername                                   username or alias for the dev hub
                                                                                    org; overrides default dev hub org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            JSON output

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx hello:org --targetusername myOrg@example.com --targetdevhubusername devhub@org.com
     Hello world! This is org: MyOrg and I will be around until Tue Mar 20 2018!
     My hub org id is: 00Dxx000000001234
  
  $ sfdx hello:org --name myname --targetusername myOrg@example.com
     Hello myname! This is org: MyOrg and I will be around until Tue Mar 20 2018!
```

<<<<<<< HEAD
_See code: [src/commands/hello/org.ts](https://github.com/forcedotcom/force-language-services/blob/v0.0.0/src/commands/hello/org.ts)_
=======
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

  -t, --template=template
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
>>>>>>> 8f7f213... apex trigger started and apex class edits made
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
