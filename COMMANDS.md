## Commands

A list of the available commands

#### `sfdx force:apex:class:create`

create an Apex class

```
USAGE
  $ sfdx force:apex:class:create -n <string> [-d <string>] [-t <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         folder for saving the created files

  -n, --classname=classname(required)                                               name of the generated Apex class

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

_See code: [src/commands/force/apex/class/create.ts](https://github.com/forcedotcom/salesforcedx-templates/blob/master/src/commands/force/apex/class/create.ts)_

#### `sfdx force:apex:trigger:create`

create an Apex trigger

```
USAGE
  $ sfdx force:apex:trigger:create -n <string> [-d <string>] [-e <string>] [-s <string>] [-t <string>] [--apiversion
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                           folder for saving the created files

  -e, --triggerevents=before insert|before update|before delete|after insert|after update|after delete|after undelete
                                                                                      [default: before insert] events that                                                                                            fire the trigger

  -n, --triggername=triggername                                                       (required) name of the generated Apex                                                                                          trigger

  -s, --sobject=sobject                                                               [default: SOBJECT] sObject to create a                                                                                          trigger on

  -t, --template=ApexTrigger                                                          [default: ApexTrigger] template to use                                                                                          for file creation

  --apiversion=apiversion                                                             override the api version used for api                                                                                         requests made by this command

  --json                                                                              format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)    [default: warn] logging level for this                                                                                          command invocation

DESCRIPTION
  If not supplied, the apiversion, template, and outputdir use default values.
  The outputdir can be an absolute path or relative to the current working directory.

EXAMPLES
  $ sfdx force:apex:trigger:create -n MyTrigger
  $ sfdx force:apex:trigger:create -n MyTrigger -s Account -e 'before insert, after upsert'
  $ sfdx force:apex:trigger:create -n MyTrigger -d triggers
```

_See code: [src/commands/force/apex/trigger/create.ts](https://github.com/forcedotcom/salesforcedx-templates/blob/master/src/commands/force/apex/trigger/create.ts)_

#### `sfdx force:lightning:app:create`

create a Lightning app

```
USAGE
  $ sfdx force:lightning:app:create -n <string> [-d <string>] [-t <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         folder for saving the created files

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

_See code: [src/commands/force/lightning/app/create.ts](https://github.com/forcedotcom/salesforcedx-templates/blob/master/src/commands/force/lightning/app/create.ts)_

#### `sfdx force:lightning:component:create`

create a bundle for an Aura component or a Lightning web component

```
USAGE
  $ sfdx force:lightning:component:create -n <string> [-d <string>] [-t <string>] [--type <string>] [--apiversion
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         folder for saving the created files

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

_See code: [src/commands/force/lightning/component/create.ts](https://github.com/forcedotcom/salesforcedx-templates/blob/master/src/commands/force/lightning/component/create.ts)_

#### `sfdx force:lightning:event:create`

create a Lightning event

```
USAGE
  $ sfdx force:lightning:event:create -n <string> [-d <string>] [-t <string>] [--apiversion <string>] [--json]
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         folder for saving the created files

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

_See code: [src/commands/force/lightning/event/create.ts](https://github.com/forcedotcom/salesforcedx-templates/blob/master/src/commands/force/lightning/event/create.ts)_

#### `sfdx force:lightning:interface:create`

create a Lightning interface

```
USAGE
  $ sfdx force:lightning:interface:create -n <string> [-d <string>] [-t <string>] [--apiversion <string>] [--json]
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         folder for saving the created files

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

_See code: [src/commands/force/lightning/interface/create.ts](https://github.com/forcedotcom/salesforcedx-templates/blob/master/src/commands/force/lightning/interface/create.ts)_

#### `sfdx force:lightning:test:create`

create a Lightning test

```
USAGE
  $ sfdx force:lightning:test:create -n <string> [-d <string>] [-t <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         folder for saving the created files
  -n, --testname=testname                                                           (required) name of the generated Lightning test
  -t, --template=DefaultLightningTest                                               [default: DefaultLightningTest] template to use for file creation
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for this command invocation

DESCRIPTION
  The outputdir can be an absolute path or relative to the current working directory.

EXAMPLES
  $ sfdx force:lightning:test:create -n MyLightningTest
  $ sfdx force:lightning:test:create -n MyLightningTest -d lightningTests
```

_See code: [src/commands/force/lightning/test/create.ts](https://github.com/forcedotcom/salesforcedx-templates/blob/master/src/commands/force/lightning/test/create.ts)_

#### `sfdx force:project:create`

create a Salesforce DX project

```
USAGE
  $ sfdx force:project:create -n <string> [-d <string>] [-p <string>] [-s <string>] [-t <string>] [-x] [--json]
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         folder for saving the created files

  -n, --projectname=projectname                                                     (required) name of the generated
                                                                                    project

  -p, --defaultpackagedir=defaultpackagedir                                         [default: force-app] default package
                                                                                    directory name

  -s, --namespace=namespace                                                         project associated namespace

  -t, --template=standard|empty|analytics                                           [default: standard] template to use
                                                                                    for file creation

  -x, --manifest                                                                    generate a manifest (package.xml)
                                                                                    for change-set based development

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  Default values are used if the template, namespace, defaultpackagedir, and outputdir aren’t supplied.
  The outputdir can be an absolute path or relative to the current working directory.

EXAMPLES
  $ sfdx force:project:create --projectname mywork
  $ sfdx force:project:create --projectname mywork --defaultpackagedir myapp
  $ sfdx force:project:create --projectname mywork --defaultpackagedir myapp --manifest
  $ sfdx force:project:create --projectname mywork --template empty
```

_See code: [src/commands/force/project/create.ts](https://github.com/forcedotcom/salesforcedx-templates/blob/master/src/commands/force/project/create.ts)_

#### `sfdx force:visualforce:component:create`

create a Visualforce component

```
USAGE
  $ sfdx force:visualforce:component:create -n <string> -l <string> [-d <string>] [-t <string>] [--apiversion <string>]
  [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         folder for saving the created files

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

_See code: [src/commands/force/visualforce/component/create.ts](https://github.com/forcedotcom/salesforcedx-templates/blob/master/src/commands/force/visualforce/component/create.ts)_

#### `sfdx force:visualforce:page:create`

create a Visualforce page

```
USAGE
  $ sfdx force:visualforce:page:create -n <string> -l <string> [-d <string>] [-t <string>] [--apiversion <string>]
  [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         folder for saving the created files

  -l, --label=label                                                                 (required) Visualforce page label

  -n, --pagename=pagename                                                           (required) name of the generated
                                                                                    Visualforce page

  -t, --template=DefaultVFPage                                                      [default: DefaultVFPage] template to
                                                                                    use for file creation

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  If not supplied, the apiversion, template, and outputdir use default values.
  If not supplied, the apiversion, template, and outputdir use default values.
  Name and label are required.

EXAMPLES
  $ sfdx force:visualforce:page:create -n mypage -l mylabel
  $ sfdx force:visualforce:page:create -n mypage -l mylabel -d pages
```

_See code: [src/commands/force/visualforce/page/create.ts](https://github.com/forcedotcom/salesforcedx-templates/blob/master/src/commands/force/visualforce/page/create.ts)_
